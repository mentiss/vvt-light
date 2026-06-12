// src/server/systems/achtung/routes/session-resources.js
// Ressources partagées de session : Momentum, Threat, Complications.
// Montée automatiquement par le loader sur /api/achtung/session-resources.
//
// Visibilité :
//   - Momentum + Threat  : GM + Joueurs
//   - Complications      : GM uniquement
//
// Clamp serveur :
//   - momentum     : 0–6
//   - threat       : ≥ 0 (pas de maximum)
//   - complications: ≥ 0 (pas de maximum)

const express = require('express');
const router  = express.Router();
const { authenticate } = require('../../../middlewares/auth');

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLAMP = {
    momentum:      { min: 0, max: 6 },
    threat:        { min: 0, max: Infinity },
    complications: { min: 0, max: Infinity },
};

const ALLOWED_FIELDS = Object.keys(CLAMP);

function ensureResources(db, sessionId) {
    db.prepare('INSERT OR IGNORE INTO session_resources (session_id) VALUES (?)').run(sessionId);
    return db.prepare('SELECT * FROM session_resources WHERE session_id = ?').get(sessionId);
}

function formatResources(row, isGM) {
    const base = {
        sessionId: row.session_id,
        momentum:  row.momentum,
        threat:    row.threat,
        updatedAt: row.updated_at,
    };
    if (isGM) base.complications = row.complications;
    return base;
}

// ── GET /:id — Lecture ────────────────────────────────────────────────────────

router.get('/:id', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.id);

        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }

        const row = ensureResources(req.db, sessionId);
        res.json(formatResources(row, req.user.isGM));
    } catch (err) {
        console.error('[achtung] GET /session-resources/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Mise à jour d'un champ ────────────────────────────────────────
// Body : { field: 'momentum'|'threat'|'complications', delta: number }

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
        if (field === 'complications' && !req.user.isGM) {
            return res.status(403).json({ error: 'Complications : accès GM uniquement' });
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

        // Broadcast Socket.io
        const io   = req.app.get('io');
        const room = `achtung_session_${sessionId}`;

        if (io) {
            const playerPayload = formatResources(updated, false);
            const gmPayload     = formatResources(updated, true);
            io.to(room).emit('session-resources-update',    playerPayload);
            io.to(room).emit('session-resources-gm-update', gmPayload);
        }

        res.json(formatResources(updated, req.user.isGM));
    } catch (err) {
        console.error('[achtung] PUT /session-resources/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;