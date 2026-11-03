// src/server/systems/woddavampire/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes personnages du slug Vampire : l'Âge des Ténèbres.
// Montées automatiquement sur /api/woddavampire/characters par Loader.js.
//
// Création : PUBLIQUE (pas d'auth) — requis pour l'assistant de création.
// Liste + lecture par url/code : PUBLIQUE — requis pour la sélection au login.
// Écriture (PUT complet, PATCH partiel) : auth requise (propriétaire ou MJ).
// Suppression : MJ uniquement.
// Routes spécifiques (/by-url, /by-code, /:id/sessions) avant les génériques.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode }                          = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter, broadcastCharacterUpdate } = require('../CharacterController');

const SLUG = 'woddavampire';

// ── GET / — Liste résumée (publique — sélection au login) ───────────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, nom, prenom, avatar,
                   clan_key, generation, updated_at
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:         c.id,
            accessCode: c.access_code,
            accessUrl:  c.access_url,
            playerName: c.player_name,
            nom:        c.nom,
            prenom:     c.prenom,
            avatar:     c.avatar,
            clanKey:    c.clan_key,
            generation: c.generation,
            updatedAt:  c.updated_at,
        })));
    } catch (err) {
        console.error(`[${SLUG}] GET /characters:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-url/:url — Chargement par access_url (public) ───────────────────

router.get('/by-url/:url', (req, res) => {
    try {
        const row = req.db.prepare('SELECT id FROM characters WHERE access_url = ?').get(req.params.url);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        req.db.prepare('UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(row.id);

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error(`[${SLUG}] GET /by-url:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Chargement par access_code (public, login) ─────────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare('SELECT id FROM characters WHERE access_code = ?').get(req.params.code);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error(`[${SLUG}] GET /by-code:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage (propriétaire ou MJ) ─────────

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
        console.error(`[${SLUG}] GET /:id/sessions:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Fiche complète (propriétaire ou MJ) ──────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const character = loadFullCharacter(req.db, req.params.id);
        if (!character) return res.status(404).json({ error: 'Personnage introuvable' });
        res.json(character);
    } catch (err) {
        console.error(`[${SLUG}] GET /:id:`, err);
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

        // Insertion minimale pour obtenir l'id ; saveFullCharacter écrit le reste
        // (colonnes à plat et sous-tables de l'assistant).
        const result = db.prepare(`
            INSERT INTO characters (access_code, access_url, player_name, nom)
            VALUES (?, ?, ?, ?)
        `).run(code, url, playerName.trim(), nom.trim());

        const character = saveFullCharacter(db, result.lastInsertRowid, req.body);

        res.status(201).json(character);
    } catch (err) {
        console.error(`[${SLUG}] POST /characters:`, err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id et PATCH /:id — Sauvegarde (propriétaire ou MJ) ────────────────
// Même sauvegarde : seuls les champs et tableaux fournis sont écrits.

function saveHandler(method) {
    return (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
                return res.status(404).json({ error: 'Personnage introuvable' });
            }

            const updated = saveFullCharacter(req.db, id, req.body);

            broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);

            res.json(updated);
        } catch (err) {
            console.error(`[${SLUG}] ${method} /:id:`, err);
            res.status(500).json({ error: err.message });
        }
    };
}

router.put('/:id',   authenticate, requireOwnerOrGM, saveHandler('PUT'));
router.patch('/:id', authenticate, requireOwnerOrGM, saveHandler('PATCH'));

// ── DELETE /:id — Suppression (MJ uniquement) ────────────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === -1) return res.status(400).json({ error: 'Le compte du Conteur ne peut pas être supprimé' });
        req.db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        console.error(`[${SLUG}] DELETE /:id:`, err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
