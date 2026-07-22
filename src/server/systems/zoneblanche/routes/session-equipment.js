// src/server/systems/zoneblanche/routes/session-equipment.js
// Pool matériel partagé de session : budget + entrées (catalogue ou item libre).
// Montée automatiquement sur /api/zoneblanche/session-equipment par loader.js.
//
// Règles :
//   · Budget : MJ uniquement.
//   · Entrées : tous les joueurs librement, pas de validation collective.
//   · Un même item_key n'occupe qu'UNE ligne : les ajouts successifs
//     incrémentent la quantité, pour garder la liste lisible.
//   · Les items libres (item_key NULL) ne sont jamais regroupés : deux objets
//     de scénario peuvent porter le même nom sans être le même objet.
//   · Les tarifs dégressifs ne sont pas une mécanique : un lot est une entrée
//     de catalogue à part entière, avec son propre prix. Rien à calculer.

const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../../middlewares/auth');

function ensureBudget(db, sessionId) {
    db.prepare('INSERT OR IGNORE INTO session_equipment_budget (session_id) VALUES (?)').run(sessionId);
    return db.prepare('SELECT * FROM session_equipment_budget WHERE session_id = ?').get(sessionId);
}

function getState(db, sessionId) {
    const budgetRow = ensureBudget(db, sessionId);
    const rows = db.prepare(
        'SELECT * FROM session_equipment_pool WHERE session_id = ? ORDER BY created_at'
    ).all(sessionId);

    const items = rows.map(i => ({
        id:                 i.id,
        itemKey:            i.item_key,
        label:              i.label,
        cost:               i.cost,
        quantity:           i.quantity,
        lineTotal:          i.cost * i.quantity,
        addedByCharacterId: i.added_by_character_id,
        createdAt:          i.created_at,
    }));

    return {
        sessionId,
        budget: budgetRow.budget,
        total:  items.reduce((sum, i) => sum + i.lineTotal, 0),
        items,
    };
}

function broadcast(io, sessionId, state) {
    if (!io) return;
    io.to(`zoneblanche_session_${sessionId}`).emit('zoneblanche:equipment-update', state);
}

// ── GET /:sessionId — État complet ────────────────────────────────────────────

router.get('/:sessionId', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }
        res.json(getState(req.db, sessionId));
    } catch (err) {
        console.error('[zoneblanche] GET /session-equipment/:sessionId:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:sessionId/budget — Mise à jour du budget (MJ uniquement) ───────────

router.put('/:sessionId/budget', authenticate, (req, res) => {
    try {
        if (!req.user.isGM) return res.status(403).json({ error: 'Budget : accès MJ uniquement' });

        const sessionId = Number(req.params.sessionId);
        const { budget } = req.body;
        if (typeof budget !== 'number' || !Number.isInteger(budget) || budget < 0) {
            return res.status(400).json({ error: 'budget doit être un entier positif' });
        }

        ensureBudget(req.db, sessionId);
        req.db.prepare(`
            UPDATE session_equipment_budget
            SET budget = ?, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = ?
        `).run(budget, sessionId);

        const state = getState(req.db, sessionId);
        broadcast(req.app.get('io'), sessionId, state);
        res.json(state);
    } catch (err) {
        console.error('[zoneblanche] PUT /session-equipment/:sessionId/budget:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:sessionId/items — Ajout (regroupé par item_key) ──────────────────
// Body : { itemKey?, label, cost, quantity?, characterId }

router.post('/:sessionId/items', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        const { itemKey = null, label, cost, quantity, characterId = null } = req.body;

        if (!label?.trim()) return res.status(400).json({ error: 'label requis' });
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }

        const qte = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
        const c   = Number.isInteger(cost) && cost >= 0 ? cost : 0;

        // Regroupement : uniquement pour les items du catalogue.
        const existante = itemKey
            ? req.db.prepare(
                'SELECT * FROM session_equipment_pool WHERE session_id = ? AND item_key = ?'
            ).get(sessionId, itemKey)
            : null;

        if (existante) {
            req.db.prepare(
                'UPDATE session_equipment_pool SET quantity = quantity + ? WHERE id = ?'
            ).run(qte, existante.id);
        } else {
            req.db.prepare(`
                INSERT INTO session_equipment_pool
                    (session_id, item_key, label, cost, quantity, added_by_character_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(sessionId, itemKey, label.trim(), c, qte, characterId);
        }

        const state = getState(req.db, sessionId);
        broadcast(req.app.get('io'), sessionId, state);
        res.status(201).json(state);
    } catch (err) {
        console.error('[zoneblanche] POST /session-equipment/:sessionId/items:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:sessionId/items/:itemId — Ajustement de quantité ────────────────
// Body : { delta } — la ligne est supprimée si la quantité tombe à 0.

router.patch('/:sessionId/items/:itemId', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        const itemId    = Number(req.params.itemId);
        const { delta } = req.body;

        if (!Number.isInteger(delta)) {
            return res.status(400).json({ error: 'delta doit être un entier' });
        }

        const ligne = req.db.prepare(
            'SELECT * FROM session_equipment_pool WHERE id = ? AND session_id = ?'
        ).get(itemId, sessionId);

        if (!ligne) return res.status(404).json({ error: 'Entrée introuvable' });

        const nouvelleQte = ligne.quantity + delta;
        if (nouvelleQte <= 0) {
            req.db.prepare('DELETE FROM session_equipment_pool WHERE id = ?').run(itemId);
        } else {
            req.db.prepare('UPDATE session_equipment_pool SET quantity = ? WHERE id = ?').run(nouvelleQte, itemId);
        }

        const state = getState(req.db, sessionId);
        broadcast(req.app.get('io'), sessionId, state);
        res.json(state);
    } catch (err) {
        console.error('[zoneblanche] PATCH /session-equipment/:sessionId/items/:itemId:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:sessionId/items/:itemId — Retrait complet d'une ligne ──────────

router.delete('/:sessionId/items/:itemId', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        const itemId    = Number(req.params.itemId);

        req.db.prepare('DELETE FROM session_equipment_pool WHERE id = ? AND session_id = ?').run(itemId, sessionId);

        const state = getState(req.db, sessionId);
        broadcast(req.app.get('io'), sessionId, state);
        res.json(state);
    } catch (err) {
        console.error('[zoneblanche] DELETE /session-equipment/:sessionId/items/:itemId:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:sessionId/clear — Vider le pool (confirmation côté client) ───────

router.post('/:sessionId/clear', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        req.db.prepare('DELETE FROM session_equipment_pool WHERE session_id = ?').run(sessionId);

        const state = getState(req.db, sessionId);
        broadcast(req.app.get('io'), sessionId, state);
        res.json(state);
    } catch (err) {
        console.error('[zoneblanche] POST /session-equipment/:sessionId/clear:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;