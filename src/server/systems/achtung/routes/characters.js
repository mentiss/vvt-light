// src/server/systems/achtung/routes/characters.js

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode }                           = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter }       = require('../CharacterController');

// ── Helpers ───────────────────────────────────────────────────────────────────

function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare(
        'SELECT session_id FROM session_characters WHERE character_id = ?'
    ).all(characterId);
    for (const { session_id } of sessions) {
        io.to(`achtung_session_${session_id}`)
            .emit('character-full-update', { characterId, character });
    }
}

// ── GET / — Liste résumée (GM uniquement) ────────────────────────────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, nom, prenom, avatar,
                   nationality, "rank", archetype, background, characteristic,
                   stress, injuries, fortune, updated_at
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:             c.id,
            accessCode:     c.access_code,
            accessUrl:      c.access_url,
            playerName:     c.player_name,
            nom:            c.nom,
            prenom:         c.prenom,
            avatar:         c.avatar,
            nationality:    c.nationality,
            rank:           c.rank,
            archetype:      c.archetype,
            background:     c.background,
            characteristic: c.characteristic,
            stress:         c.stress,
            injuries:       c.injuries,
            fortune:        c.fortune,
            updatedAt:      c.updated_at,
        })));
    } catch (err) {
        console.error('[achtung] GET /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-url/:url — Par access_url (public) ───────────────────────────────

router.get('/by-url/:url', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_url = ?'
        ).get(req.params.url);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        req.db.prepare(
            'UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(row.id);

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[achtung] GET /by-url:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Par access_code (public) ────────────────────────────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_code = ?'
        ).get(req.params.code);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[achtung] GET /by-code:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Fiche complète (Owner ou GM) ──────────────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const character = loadFullCharacter(req.db, req.params.id);
        if (!character) return res.status(404).json({ error: 'Personnage introuvable' });
        res.json(character);
    } catch (err) {
        console.error('[achtung] GET /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage ───────────────────────────────

router.get('/:id/sessions', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT gs.id, gs.name, gs.access_code, gs.access_url, gs.updated_at
            FROM game_sessions gs
                     INNER JOIN session_characters sc ON sc.session_id = gs.id
            WHERE sc.character_id = ?
            ORDER BY gs.updated_at DESC
        `).all(req.params.id);

        res.json(rows.map(s => ({
            id:         s.id,
            name:       s.name,
            accessCode: s.access_code,
            accessUrl:  s.access_url,
            updatedAt:  s.updated_at,
        })));
    } catch (err) {
        console.error('[achtung] GET /:id/sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Création publique ───────────────────────────────────────────────

router.post('/', (req, res) => {
    try {
        const { playerName, nom } = req.body;

        if (!playerName?.trim()) return res.status(400).json({ error: 'playerName requis' });
        if (!nom?.trim())        return res.status(400).json({ error: 'nom requis' });

        const { code, url } = ensureUniqueCode('character', req);

        // INSERT de base — toutes les colonnes scalaires d'un coup via saveFullCharacter
        // On insère d'abord la ligne minimale pour obtenir l'id, puis on délègue.
        const result = req.db.prepare(`
            INSERT INTO characters (access_code, access_url, player_name, nom)
            VALUES (?, ?, ?, ?)
        `).run(code, url, playerName.trim(), nom.trim());

        const charId = result.lastInsertRowid;

        // Persiste toutes les données du wizard en une seule passe
        saveFullCharacter(req.db, charId, {
            ...req.body,
            playerName: playerName.trim(),
            nom:        nom.trim(),
        });

        res.status(201).json(loadFullCharacter(req.db, charId));
    } catch (err) {
        console.error('[achtung] POST /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Mise à jour complète (Owner ou GM) ────────────────────────────

router.put('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const updated = saveFullCharacter(req.db, id, req.body);
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[achtung] PUT /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id — Mise à jour partielle ───────────────────────────────────────
// Utilisé pour les champs mis à jour hors editMode (stress, injuries, fortune, ammo…).
// Délègue à saveFullCharacter qui ne touche que les champs présents dans le payload.

router.patch('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const updated = saveFullCharacter(req.db, id, req.body);
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[achtung] PATCH /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:id/avatar — Upload avatar (Owner ou GM) ───────────────────────────

router.post('/:id/avatar', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        const { avatar } = req.body;

        if (!avatar) return res.status(400).json({ error: 'avatar requis' });

        const updated = saveFullCharacter(req.db, id, { avatar });
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[achtung] POST /:id/avatar:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Suppression (GM uniquement) ────────────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === -1) return res.status(403).json({ error: 'Le compte GM ne peut pas être supprimé' });

        const result = req.db.prepare('DELETE FROM characters WHERE id = ? AND id != -1').run(id);
        if (result.changes === 0) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json({ success: true });
    } catch (err) {
        console.error('[achtung] DELETE /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;