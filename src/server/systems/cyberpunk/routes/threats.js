// src/server/systems/cyberpunk/routes/threats.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes Threats (Menaces).
// Montée automatiquement sur /api/cyberpunk/threats par loader.js.
//
// Une Threat peut être liée à zéro, une ou plusieurs Clocks (many-to-many).
// session_id NULL = scope campagne (persistant).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');

// ── GET / — Toutes les threats (optionnel : filtrer par session) ──────────────

router.get('/', authenticate, (req, res) => {
    try {
        const { sessionId } = req.query;

        let rows;
        if (sessionId) {
            rows = req.db.prepare(`
                SELECT t.*,
                    GROUP_CONCAT(ct.clock_id) AS clock_ids
                FROM threats t
                LEFT JOIN clock_threats ct ON ct.threat_id = t.id
                WHERE t.session_id = ? OR t.session_id IS NULL
                GROUP BY t.id
                ORDER BY t.session_id NULLS LAST, t.created_at DESC
            `).all(sessionId);
        } else {
            rows = req.db.prepare(`
                SELECT t.*,
                    GROUP_CONCAT(ct.clock_id) AS clock_ids
                FROM threats t
                LEFT JOIN clock_threats ct ON ct.threat_id = t.id
                GROUP BY t.id
                ORDER BY t.session_id NULLS LAST, t.created_at DESC
            `).all();
        }

        res.json(rows.map(_formatThreat));
    } catch (err) {
        console.error('[cyberpunk] GET /threats:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Une threat avec ses clocks liées ───────────────────────────────

router.get('/:id', authenticate, (req, res) => {
    try {
        const row = req.db.prepare(`
            SELECT t.*,
                GROUP_CONCAT(ct.clock_id) AS clock_ids
            FROM threats t
            LEFT JOIN clock_threats ct ON ct.threat_id = t.id
            WHERE t.id = ?
            GROUP BY t.id
        `).get(req.params.id);

        if (!row) return res.status(404).json({ error: 'Threat introuvable' });
        res.json(_formatThreat(row));
    } catch (err) {
        console.error('[cyberpunk] GET /threats/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Créer une threat (GM uniquement) ─────────────────────────────────

router.post('/', authenticate, requireGM, (req, res) => {
    try {
        const { sessionId, name, type, impulse, moves, notes, clockIds } = req.body;

        if (!name) return res.status(400).json({ error: 'name est requis' });

        const movesJson = JSON.stringify(Array.isArray(moves) ? moves : []);

        const result = req.db.prepare(`
            INSERT INTO threats (session_id, name, type, impulse, moves_json, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            sessionId ?? null,
            name,
            type ?? '',
            impulse ?? '',
            movesJson,
            notes ?? ''
        );

        const threatId = result.lastInsertRowid;

        // Liens clocks
        if (Array.isArray(clockIds) && clockIds.length > 0) {
            _setThreatClocks(req.db, threatId, clockIds);
        }

        res.status(201).json(_loadThreat(req.db, threatId));
    } catch (err) {
        console.error('[cyberpunk] POST /threats:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Modifier une threat (GM uniquement) ────────────────────────────

router.put('/:id', authenticate, requireGM, (req, res) => {
    try {
        const { name, type, impulse, moves, notes, clockIds, sessionId } = req.body;
        const id = req.params.id;

        const movesJson = Array.isArray(moves) ? JSON.stringify(moves) : null;

        req.db.prepare(`
            UPDATE threats SET
                name        = COALESCE(?, name),
                type        = COALESCE(?, type),
                impulse     = COALESCE(?, impulse),
                moves_json  = COALESCE(?, moves_json),
                notes       = COALESCE(?, notes),
                session_id  = COALESCE(?, session_id),
                updated_at  = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(name ?? null, type ?? null, impulse ?? null, movesJson, notes ?? null, sessionId ?? null, id);

        // Remplacement des liens clocks si fournis
        if (Array.isArray(clockIds)) {
            _setThreatClocks(req.db, id, clockIds);
        }

        res.json(_loadThreat(req.db, id));
    } catch (err) {
        console.error('[cyberpunk] PUT /threats/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Supprimer une threat (GM uniquement) ────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        req.db.prepare('DELETE FROM threats WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[cyberpunk] DELETE /threats/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function _formatThreat(row) {
    let moves = [];
    try { moves = JSON.parse(row.moves_json || '[]'); } catch (_) {}

    return {
        id:        row.id,
        sessionId: row.session_id ?? null,
        name:      row.name,
        type:      row.type      ?? '',
        impulse:   row.impulse   ?? '',
        moves,
        notes:     row.notes     ?? '',
        clockIds:  row.clock_ids
            ? row.clock_ids.split(',').map(Number)
            : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function _loadThreat(db, id) {
    const row = db.prepare(`
        SELECT t.*, GROUP_CONCAT(ct.clock_id) AS clock_ids
        FROM threats t
        LEFT JOIN clock_threats ct ON ct.threat_id = t.id
        WHERE t.id = ?
        GROUP BY t.id
    `).get(id);
    return row ? _formatThreat(row) : null;
}

function _setThreatClocks(db, threatId, clockIds) {
    db.prepare('DELETE FROM clock_threats WHERE threat_id = ?').run(threatId);
    const stmt = db.prepare('INSERT OR IGNORE INTO clock_threats (clock_id, threat_id) VALUES (?, ?)');
    for (const cid of clockIds) {
        stmt.run(cid, threatId);
    }
}

module.exports = router;