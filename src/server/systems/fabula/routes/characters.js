// src/server/systems/fabula/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes personnages spécifiques au slug Fabula Ultima.
// Montées automatiquement sur /api/fabula/characters par loader.js.
//
// Création : PUBLIQUE (pas d'auth) — requis pour le wizard.
// Liste + lecture par url/code : PUBLIQUE — requis pour la sélection au login.
// Écriture (PUT) : auth requise (propriétaire ou GM).
// Suppression : GM uniquement.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode }                          = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter }       = require('../CharacterController');

// ── Helper : broadcast socket sur toutes les sessions du personnage ──────────

function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare(
        'SELECT session_id FROM session_characters WHERE character_id = ?'
    ).all(characterId);
    for (const { session_id } of sessions) {
        io.to(`fabula_session_${session_id}`)
            .emit('character-full-update', { characterId, character });
    }
}

// ── GET / — Liste résumée (publique — sélection au login) ───────────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, nom, prenom, avatar,
                   niveau_global, groupe_nom, updated_at
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:           c.id,
            accessCode:   c.access_code,
            accessUrl:    c.access_url,
            playerName:   c.player_name,
            nom:          c.nom,
            prenom:       c.prenom,
            avatar:       c.avatar,
            niveauGlobal: c.niveau_global,
            groupeNom:    c.groupe_nom,
            updatedAt:    c.updated_at,
        })));
    } catch (err) {
        console.error('[fabula] GET /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-url/:url — Chargement par access_url (public) ───────────────────

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
        console.error('[fabula] GET /by-url:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Chargement par access_code (public, login) ─────────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_code = ?'
        ).get(req.params.code);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[fabula] GET /by-code:', err);
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
        console.error('[fabula] GET /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage (Owner ou GM) ────────────────

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
        console.error('[fabula] GET /:id/sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Création (publique, sans auth) ──────────────────────────────────

router.post('/', (req, res) => {
    try {
        const db = req.db;
        const { playerName, nom } = req.body;

        if (!playerName?.trim()) return res.status(400).json({ error: 'playerName est requis' });
        if (!nom?.trim())        return res.status(400).json({ error: 'nom est requis' });

        const { code, url } = ensureUniqueCode('character', req);

        // Insertion minimale — on obtient l'id, saveFullCharacter fait le reste
        // (colonnes plates + sous-tables du wizard : classes, skills, arcana, bonds, equipment)
        const result = db.prepare(`
            INSERT INTO characters (access_code, access_url, player_name, nom)
            VALUES (?, ?, ?, ?)
        `).run(code, url, playerName.trim(), nom.trim());

        const newId = result.lastInsertRowid;

        const character = saveFullCharacter(db, newId, req.body);

        res.status(201).json(character);
    } catch (err) {
        console.error('[fabula] POST /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Sauvegarde complète (Owner ou GM) ─────────────────────────────

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
        console.error('[fabula] PUT /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Suppression (GM uniquement) ────────────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        req.db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        console.error('[fabula] DELETE /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;