// src/server/systems/zoneblanche/routes/session-resources.js
// Ressources partagées de session : Audimat, Stress.
// Montée automatiquement sur /api/zoneblanche/session-resources par loader.js.
//
// Visibilité : Audimat + Stress visibles des deux côtés (joueurs + GM).
// Modification : Audimat par joueurs et GM.
//               Stress : hausse par tous (achat de d20 côté joueur = Stress
//               offert au MJ) · baisse réservée au MJ.
//
// Clamp serveur :
//   - audimat : 0–6
//   - stress  : ≥ 0 (pas de maximum)

const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../../middlewares/auth');

const CLAMP = {
    audimat: { min: 0, max: 6 },
    stress:  { min: 0, max: Infinity },
};

const ALLOWED_FIELDS = Object.keys(CLAMP);

function ensureResources(db, sessionId) {
    db.prepare('INSERT OR IGNORE INTO session_resources (session_id) VALUES (?)').run(sessionId);
    return db.prepare('SELECT * FROM session_resources WHERE session_id = ?').get(sessionId);
}

function formatResources(row) {
    return {
        sessionId: row.session_id,
        audimat:   row.audimat,
        stress:    row.stress,
        updatedAt: row.updated_at,
    };
}

// ── GET /:id — Lecture ────────────────────────────────────────────────────────

router.get('/:id', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }
        res.json(formatResources(ensureResources(req.db, sessionId)));
    } catch (err) {
        console.error('[zoneblanche] GET /session-resources/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Mise à jour d'un champ ────────────────────────────────────────
// Body : { field: 'audimat'|'stress', delta: number }

router.put('/:id', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.id);
        const { field, delta } = req.body;

        if (!ALLOWED_FIELDS.includes(field)) {
            return res.status(400).json({ error: `Champ invalide. Valeurs acceptées : ${ALLOWED_FIELDS.join(', ')}` });
        }
        if (typeof delta !== 'number' || !Number.isInteger(delta)) {
            return res.status(400).json({ error: 'delta doit être un entier' });
        }
        // Stress — asymétrie volontaire :
        //   · Le MJ ajuste librement sa réserve (hausse comme baisse).
        //   · Un joueur ne peut QUE l'augmenter : acheter un d20 « en Stress »
        //     revient à en offrir au MJ. Il ne peut jamais en retirer.
        if (field === 'stress' && !req.user.isGM && delta < 0) {
            return res.status(403).json({
                error: 'Stress : seul le MJ peut le réduire. Un joueur ne peut qu\'en générer.',
            });
        }
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }

        const row    = ensureResources(req.db, sessionId);
        const clamp  = CLAMP[field];
        const newVal = Math.min(Math.max(row[field] + delta, clamp.min), clamp.max);

        req.db.prepare(`
            UPDATE session_resources
            SET ${field} = ?, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = ?
        `).run(newVal, sessionId);

        const updated = req.db.prepare('SELECT * FROM session_resources WHERE session_id = ?').get(sessionId);
        const payload = formatResources(updated);

        const io = req.app.get('io');
        if (io) io.to(`zoneblanche_session_${sessionId}`).emit('session-resources-update', payload);

        res.json(payload);
    } catch (err) {
        console.error('[zoneblanche] PUT /session-resources/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;