// src/server/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Route /characters commune à tous les slugs (documentations/spec_characters_route.md).
// Montée par server.js sur /api/:slug/characters, APRÈS le routes/characters.js
// facultatif du slug : ses routes propres s'ajoutent, une route de même méthode
// et même chemin prend le pas sur celle-ci.
//
// Le slug fournit :
//   - CharacterController.js : loadFullCharacter(db, id) → fiche ou null,
//     saveFullCharacter(db, id, data) → fiche rechargée (COALESCE, sous-tables) ;
//   - config.js, facultatif : characters: { listColumns, requiredOnCreate }.
//
// Création, liste et chargement par code / URL : publics (connexion, assistant).
// Lecture et écriture d'une fiche : propriétaire ou MJ. Suppression : MJ.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../middlewares/auth');
const { ensureUniqueCode, broadcastCharacterUpdate } = require('../utils/characters');
const { getCharacterController } = require('../systems/Loader');

const BASE_LIST_COLUMNS = ['id', 'access_code', 'access_url', 'player_name', 'prenom', 'nom', 'avatar', 'updated_at'];
const ACCESS_CODE = /^[A-Z0-9]{6}$/;
const NOT_FOUND = 'Personnage introuvable';

const toCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);

// Colonnes de la table characters, par connexion (la base d'un slug ne change pas en cours de route)
const _columnsCache = new WeakMap();
function characterColumns(db) {
    if (!_columnsCache.has(db)) {
        _columnsCache.set(db, new Set(db.pragma('table_info(characters)').map(c => c.name)));
    }
    return _columnsCache.get(db);
}

const controllerOf = (req) => getCharacterController(req.system.slug);
const exists = (db, id) => !!db.prepare('SELECT id FROM characters WHERE id = ?').get(id);

/** Encadre un handler : erreur journalisée avec le slug, 500 avec le message. */
const handle = (label, fn) => (req, res) => {
    try {
        fn(req, res);
    } catch (err) {
        console.error(`[${req.system.slug}] ${label}:`, err);
        res.status(500).json({ error: err.message });
    }
};

// ── GET / — Liste résumée (publique : sélection à la connexion) ──────────────

router.get('/', handle('GET /characters', (req, res) => {
    const columns = characterColumns(req.db);
    const extra = req.system.characters?.listColumns ?? [];
    const selected = [...new Set([...BASE_LIST_COLUMNS, ...extra])].filter(c => columns.has(c));
    const order = columns.has('updated_at') ? 'ORDER BY updated_at DESC' : '';

    const rows = req.db.prepare(
        `SELECT ${selected.map(c => `"${c}"`).join(', ')} FROM characters WHERE id != -1 ${order}`
    ).all();

    res.json(rows.map(row => Object.fromEntries(
        Object.entries(row).map(([key, value]) => [toCamel(key), value])
    )));
}));

// ── GET /by-url/:url — Ouverture de la fiche par son lien (publique) ─────────

router.get('/by-url/:url', handle('GET /by-url', (req, res) => {
    const row = req.db.prepare('SELECT id FROM characters WHERE access_url = ?').get(req.params.url);
    if (!row) return res.status(404).json({ error: NOT_FOUND });

    req.db.prepare('UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(row.id);
    res.json(controllerOf(req).loadFullCharacter(req.db, row.id));
}));

// ── GET /by-code/:code — Connexion par code (publique, insensible à la casse) ─

router.get('/by-code/:code', handle('GET /by-code', (req, res) => {
    const row = req.db.prepare('SELECT id FROM characters WHERE access_code = ?')
        .get(String(req.params.code).toUpperCase());
    if (!row) return res.status(404).json({ error: NOT_FOUND });

    res.json(controllerOf(req).loadFullCharacter(req.db, row.id));
}));

// ── GET /:id/sessions — Tables du personnage (avant GET /:id) ────────────────

router.get('/:id/sessions', authenticate, requireOwnerOrGM, handle('GET /:id/sessions', (req, res) => {
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
}));

// ── GET /:id — Fiche complète ────────────────────────────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, handle('GET /:id', (req, res) => {
    const character = controllerOf(req).loadFullCharacter(req.db, Number(req.params.id));
    if (!character) return res.status(404).json({ error: NOT_FOUND });
    res.json(character);
}));

// ── POST / — Création (publique : assistant de création) ─────────────────────
// Champs requis : config.characters.requiredOnCreate (défaut : playerName).
// accessCode facultatif (code choisi) : 6 lettres / chiffres, 409 s'il est pris.

router.post('/', handle('POST /characters', (req, res) => {
    const db = req.db;
    const body = req.body ?? {};
    const required = req.system.characters?.requiredOnCreate ?? ['playerName'];

    const requiredValues = {};
    for (const field of required) {
        const value = typeof body[field] === 'string' ? body[field].trim() : '';
        if (!value) return res.status(400).json({ error: `${field} est requis` });
        requiredValues[field] = value;
    }

    const { code: generatedCode, url } = ensureUniqueCode('character', req);
    let code = generatedCode;
    if (body.accessCode) {
        code = String(body.accessCode).trim().toUpperCase();
        if (!ACCESS_CODE.test(code)) {
            return res.status(400).json({ error: 'Le code d\'accès doit faire 6 caractères (lettres et chiffres)' });
        }
        if (db.prepare('SELECT id FROM characters WHERE access_code = ?').get(code)) {
            return res.status(409).json({ error: 'Ce code d\'accès est déjà utilisé' });
        }
    }

    const columns = ['access_code', 'access_url', ...Object.keys(requiredValues).map(toSnake)];
    const id = Number(db.prepare(
        `INSERT INTO characters (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
    ).run(code, url, ...Object.values(requiredValues)).lastInsertRowid);

    // Le reste du corps : colonnes à plat (COALESCE, défauts du schéma sinon) et sous-tables.
    // saveFullCharacter a sa propre transaction : en cas d'échec, la ligne créée est retirée.
    try {
        const character = controllerOf(req).saveFullCharacter(db, id,
            { ...body, ...requiredValues, accessCode: undefined, accessUrl: undefined });
        res.status(201).json(character);
    } catch (err) {
        db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        throw err;
    }
}));

// ── PUT /:id et PATCH /:id — Sauvegarde (seuls les champs fournis sont écrits) ─

const save = (method) => handle(`${method} /:id`, (req, res) => {
    const id = Number(req.params.id);
    if (!exists(req.db, id)) return res.status(404).json({ error: NOT_FOUND });

    const updated = controllerOf(req).saveFullCharacter(req.db, id, req.body ?? {});
    broadcastCharacterUpdate(req.app.get('io'), req.db, req.system.slug, id, updated);
    res.json(updated);
});

router.put('/:id',   authenticate, requireOwnerOrGM, save('PUT'));
router.patch('/:id', authenticate, requireOwnerOrGM, save('PATCH'));

// ── DELETE /:id — Suppression (MJ ; le compte MJ, id -1, ne l'est jamais) ────

router.delete('/:id', authenticate, requireGM, handle('DELETE /:id', (req, res) => {
    const id = Number(req.params.id);
    if (id === -1) return res.status(403).json({ error: 'Le compte MJ ne peut pas être supprimé' });
    if (!exists(req.db, id)) return res.status(404).json({ error: NOT_FOUND });

    req.db.prepare('DELETE FROM characters WHERE id = ?').run(id);
    res.json({ success: true });
}));

module.exports = router;
