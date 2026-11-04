// src/server/routes/board.js
// ─────────────────────────────────────────────────────────────────────────────
// Tableau partagé (documentations/spec_tableau.md §10) : route partagée, montée
// pour chaque système sur /api/:slug/board.
//
// - Données dans la base du module (database/board.db, db/modules/board.js),
//   jamais dans la base du slug. Tout contenu appartient à une table : slug + session_id.
// - Diapositives d'une table, objets posés (image, icône, jeton, trait, rectangle),
//   images déposées (BLOB, servies à part), brouillard par diapositive.
// - Droits vérifiés à chaque écriture (§10.2) : le MJ fait tout, un joueur dessine
//   ou déplace selon les réglages de la diapositive ; un objet verrouillé ne bouge
//   ni ne s'efface plus, pour personne.
// - Chaque écriture marque la table comme utilisée (purge à 3 mois, §10.6) puis
//   diffuse à la room de la table. Le ping et le déplacement en direct passent par
//   le relais socket (socket/platform/board.js), sans écriture.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const express = require('express');
const router = express.Router();
const { authenticate, requireGM } = require('../middlewares/auth');
const { getDbForSystem } = require('../db');
const { getModuleConfig } = require('../db/moduleConfig');

const KINDS = ['image', 'icon', 'token', 'stroke', 'rect'];
const PLAYER_DRAW_KINDS = ['stroke', 'rect'];      // ce qu'un joueur dessine et efface (P-4)
const PLAYER_MOVE_KINDS = ['token', 'icon'];       // ce qu'un joueur déplace (Q-10, Q-42)
const GRID_UNITS = ['m', 'ft'];
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;           // garde-fou technique, pas un quota (Q-28)
const MAX_STROKE_COORDS = 8000;                    // 4 000 points après simplification
const MAX_FOG_OPS = 500;
const PURGE_DAYS = 90;                             // Q-26
const WARN_DAYS = 14;                              // prolongation à l'ouverture (P-5)
const SIZE_ALERT_BYTES = 1024 * 1024 * 1024;       // alerte dans les journaux (Q-28)
const ICON_ID = /^[a-z0-9-]+\/[a-z0-9-]+$/;
const DATA_URL = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/;

const boardDb = () => getDbForSystem(getModuleConfig('board'));
let sizeAlerted = false;

const isNum = (value) => typeof value === 'number' && Number.isFinite(value);
const isText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const parseJson = (text, fallback) => { try { return JSON.parse(text); } catch { return fallback; } };
/** Date SQLite (UTC, « AAAA-MM-JJ HH:MM:SS ») → ISO */
const isoDate = (value) => (value ? `${value.replace(' ', 'T')}Z` : null);

// ─── Lecture ────────────────────────────────────────────────────────────────

const toSlide = (row) => ({
    id: row.id,
    name: row.name,
    position: row.position,
    playersDraw: !!row.players_draw,
    playersMove: !!row.players_move,
    fogEnabled: !!row.fog_enabled,
    fogShown: !!row.fog_shown,
    fog: parseJson(row.fog, []),
    gridEnabled: !!row.grid_enabled,
    gridSize: row.grid_size,
    gridValue: row.grid_value,
    gridUnit: row.grid_unit,
    updatedAt: isoDate(row.updated_at),
});

const toItem = (row) => ({
    id: row.id,
    slideId: row.slide_id,
    kind: row.kind,
    x: row.x, y: row.y, w: row.w, h: row.h, z: row.z,
    locked: !!row.locked,
    data: parseJson(row.data, {}),
    author: row.author,
});

const getSessionRow = (ctx) => ctx.db.prepare(`
    SELECT *, datetime(last_used_at, '+${PURGE_DAYS} days') AS purge_at
    FROM board_sessions WHERE slug = ? AND session_id = ?
`).get(ctx.slug, ctx.sessionId);

/** Réglages de la table ; valeurs par défaut tant que rien n'a été écrit */
function sessionJson(ctx) {
    const row = getSessionRow(ctx);
    return {
        enabled: !!row?.enabled,
        shownSlideId: row?.shown_slide_id ?? null,
        keep: !!row?.keep,
        grid: { value: row?.grid_value ?? null, unit: row?.grid_unit ?? null },
        purgeAt: row && !row.keep ? isoDate(row.purge_at) : null,
    };
}

const listSlides = (ctx) => ctx.db.prepare(`
    SELECT * FROM board_slides WHERE slug = ? AND session_id = ? ORDER BY position, id
`).all(ctx.slug, ctx.sessionId).map(toSlide);

const ownSlide = (ctx, id) => ctx.db.prepare(`
    SELECT * FROM board_slides WHERE id = ? AND slug = ? AND session_id = ?
`).get(Number(id), ctx.slug, ctx.sessionId);

const ownItem = (ctx, id) => ctx.db.prepare(`
    SELECT i.*, s.players_draw, s.players_move FROM board_items i
    JOIN board_slides s ON s.id = i.slide_id
    WHERE i.id = ? AND s.slug = ? AND s.session_id = ?
`).get(Number(id), ctx.slug, ctx.sessionId);

const getItem = (ctx, id) => toItem(ctx.db.prepare('SELECT * FROM board_items WHERE id = ?').get(id));

/** Poids des images de la table, en octets (affiché au MJ) */
const tableSize = (ctx) => ctx.db.prepare(`
    SELECT COALESCE(SUM(i.size), 0) AS size FROM board_images i
    JOIN board_slides s ON s.id = i.slide_id WHERE s.slug = ? AND s.session_id = ?
`).get(ctx.slug, ctx.sessionId).size;

// ─── Écriture : utilitaires ─────────────────────────────────────────────────

/** Crée la ligne de la table si besoin (jamais de remplacement : INSERT OR IGNORE) */
const ensureSession = (ctx) => ctx.db.prepare(`
    INSERT OR IGNORE INTO board_sessions (slug, session_id) VALUES (?, ?)
`).run(ctx.slug, ctx.sessionId);

/** Table utilisée maintenant (§10.6) */
function touch(ctx, slideId = null) {
    ensureSession(ctx);
    ctx.db.prepare('UPDATE board_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE slug = ? AND session_id = ?')
        .run(ctx.slug, ctx.sessionId);
    if (slideId) ctx.db.prepare('UPDATE board_slides SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(slideId);
}

const nextZ = (ctx, slideId) => ctx.db.prepare('SELECT COALESCE(MAX(z), 0) + 1 AS z FROM board_items WHERE slide_id = ?')
    .get(slideId).z;

/** Images de la diapositive que plus aucun objet n'utilise */
const dropUnusedImages = (ctx, slideId) => ctx.db.prepare(`
    DELETE FROM board_images WHERE slide_id = ? AND id NOT IN (
        SELECT json_extract(data, '$.imageId') FROM board_items
        WHERE slide_id = ? AND json_extract(data, '$.imageId') IS NOT NULL
    )
`).run(slideId, slideId);

// ─── Diffusion à la room de la table ────────────────────────────────────────

const emit = (ctx, event, payload) => {
    ctx.io?.to(`${ctx.slug}_session_${ctx.sessionId}`).emit(event, { system: ctx.slug, sessionId: ctx.sessionId, ...payload });
};
const emitSession = (ctx) => emit(ctx, 'board-session', sessionJson(ctx));
const emitSlides = (ctx) => emit(ctx, 'board-slides', { slides: listSlides(ctx) });
const emitItems = (ctx, slideId, upsert = [], remove = []) => emit(ctx, 'board-items', { slideId, upsert, remove });

// ─── Droits (§10.2) ─────────────────────────────────────────────────────────

/** Le joueur peut-il poser un objet de ce type sur cette diapositive ? */
const canCreate = (user, slide, kind) => user.isGM || (!!slide.players_draw && PLAYER_DRAW_KINDS.includes(kind));

/** Le joueur peut-il effacer cet objet ? (verrou vérifié à part) */
const canDelete = (user, item) => user.isGM || (!!item.players_draw && PLAYER_DRAW_KINDS.includes(item.kind));

/** Le joueur peut-il déplacer ou redimensionner cet objet ? (verrou vérifié à part) */
const canMove = (user, item) => user.isGM || (!!item.players_move && PLAYER_MOVE_KINDS.includes(item.kind));

// ─── Validation des objets ──────────────────────────────────────────────────

/** Données propres au type, nettoyées ; null si invalides */
function cleanData(kind, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    switch (kind) {
        case 'image':
            // Une image déposée passe par POST …/images ; ici, un lien externe seulement
            return typeof data.url === 'string' && /^https?:\/\//.test(data.url) && data.url.length <= 2000 ? { url: data.url } : null;
        case 'icon':
            return typeof data.icon === 'string' && ICON_ID.test(data.icon) && isText(data.color, 20)
                ? { icon: data.icon, color: data.color } : null;
        case 'token':
            if (Number.isInteger(data.characterId)) return { characterId: data.characterId };
            return isText(data.label, 40) && isText(data.color, 20) ? { label: data.label.trim(), color: data.color } : null;
        case 'stroke': {
            const { points } = data;
            if (!Array.isArray(points) || points.length < 4 || points.length % 2 !== 0 || points.length > MAX_STROKE_COORDS) return null;
            if (!points.every(isNum) || !isText(data.color, 20) || !isNum(data.width) || data.width <= 0 || data.width > 100) return null;
            return { points, color: data.color, width: data.width };
        }
        case 'rect':
            return isText(data.color, 20) ? { color: data.color, filled: data.filled !== false } : null;
        default:
            return null;
    }
}

/** Boîte englobante d'un trait */
function strokeBox(points) {
    const xs = points.filter((_, i) => i % 2 === 0);
    const ys = points.filter((_, i) => i % 2 === 1);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Champs de géométrie fournis et valides ; null si l'un d'eux est invalide */
function cleanGeometry(body) {
    const out = {};
    for (const key of ['x', 'y', 'w', 'h']) {
        if (body[key] === undefined) continue;
        if (!isNum(body[key]) || ((key === 'w' || key === 'h') && body[key] < 0)) return null;
        out[key] = body[key];
    }
    if (body.z !== undefined) {
        if (!Number.isInteger(body.z)) return null;
        out.z = body.z;
    }
    return out;
}

// ─── Purge et ménage (§10.6) ────────────────────────────────────────────────

/**
 * Purge des tables inutilisées depuis 3 mois (sauf « à conserver » et la table
 * ouverte), puis prolongation de la table ouverte si elle arrive à échéance.
 * @returns {string|null} date de suppression qui était prévue, si la table a été prolongée
 */
function purgeAndProlong(ctx) {
    let prolongedFrom = null;
    ctx.db.transaction(() => {
        const expired = ctx.db.prepare(`
            SELECT slug, session_id FROM board_sessions
            WHERE keep = 0 AND last_used_at < datetime('now', '-${PURGE_DAYS} days')
              AND NOT (slug = ? AND session_id = ?)
        `).all(ctx.slug, ctx.sessionId);
        for (const t of expired) {
            ctx.db.prepare('UPDATE board_sessions SET shown_slide_id = NULL WHERE slug = ? AND session_id = ?').run(t.slug, t.session_id);
            ctx.db.prepare('DELETE FROM board_slides WHERE slug = ? AND session_id = ?').run(t.slug, t.session_id);
            ctx.db.prepare('DELETE FROM board_sessions WHERE slug = ? AND session_id = ?').run(t.slug, t.session_id);
        }

        const row = getSessionRow(ctx);
        const due = row && !row.keep && ctx.db.prepare(`SELECT julianday(?) - julianday('now') < ? AS due`)
            .get(row.purge_at, WARN_DAYS).due;
        if (due) {
            prolongedFrom = isoDate(row.purge_at);
            touch(ctx);
        }
    })();
    return prolongedFrom;
}

/** Contenu des tables du slug qui n'existent plus dans sa base (comme l'audio, P-9) */
function purgeDeletedTables(ctx, slugDb) {
    const existing = JSON.stringify(slugDb.prepare('SELECT id FROM game_sessions').all().map(r => r.id));
    const where = 'slug = ? AND session_id NOT IN (SELECT value FROM json_each(?))';
    ctx.db.transaction(() => {
        ctx.db.prepare(`UPDATE board_sessions SET shown_slide_id = NULL WHERE ${where}`).run(ctx.slug, existing);
        ctx.db.prepare(`DELETE FROM board_slides WHERE ${where}`).run(ctx.slug, existing);
        ctx.db.prepare(`DELETE FROM board_sessions WHERE ${where}`).run(ctx.slug, existing);
    })();
}

/** Une ligne dans les journaux si board.db dépasse 1 Go, une fois par démarrage */
function alertSize() {
    if (sizeAlerted) return;
    try {
        const { size } = fs.statSync(getModuleConfig('board').dbPath);
        if (size > SIZE_ALERT_BYTES) {
            sizeAlerted = true;
            console.warn(`⚠️  [board] board.db pèse ${Math.round(size / 1024 / 1024)} Mo`);
        }
    } catch { /* base pas encore créée */ }
}

// ─── Table de la requête ────────────────────────────────────────────────────

// Toutes les routes passent par /sessions/:sid : la table fixe le propriétaire
router.param('sid', (req, res, next, sid) => {
    try {
        const sessionId = Number(sid);
        if (!Number.isInteger(sessionId) || !req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session not found' });
        }
        req.board = { db: boardDb(), slug: req.system.slug, sessionId, io: req.app.get('io') };
        next();
    } catch (error) {
        console.error('Error resolving board session:', error);
        res.status(500).json({ error: 'Failed to open board session' });
    }
});

const gm = [authenticate, requireGM];

/** Enveloppe commune : erreurs, et { status, error } renvoyé par le handler */
const handle = (label, handler) => async (req, res) => {
    try {
        const result = await handler(req.board, req.body ?? {}, req);
        if (result?.status) return res.status(result.status).json(result.error ? { error: result.error } : result.body);
        res.json(result ?? { ok: true });
    } catch (error) {
        console.error(`Error (board ${label}):`, error);
        res.status(500).json({ error: `Failed to ${label}` });
    }
};

const notFound = (what) => ({ status: 404, error: `${what} not found` });
const invalid = (error) => ({ status: 400, error });
const forbidden = () => ({ status: 403, error: 'Unauthorized' });
const lockedError = () => ({ status: 409, error: 'Item locked' });

// ─── Table ──────────────────────────────────────────────────────────────────

// Réglages de la table et diapositives ; pour le MJ, purge, ménage et prolongation
router.get('/sessions/:sid', authenticate, handle('load board', (ctx, body, req) => {
    let prolongedFrom = null;
    if (req.user.isGM) {
        purgeDeletedTables(ctx, req.db);
        prolongedFrom = purgeAndProlong(ctx);
        alertSize();
    }
    return {
        ...sessionJson(ctx),
        slides: listSlides(ctx),
        ...(req.user.isGM ? { size: tableSize(ctx), prolongedFrom } : {}),
    };
}));

router.put('/sessions/:sid', ...gm, handle('update board', (ctx, body) => {
    const sets = [];
    const values = [];
    if (body.enabled !== undefined) { sets.push('enabled = ?'); values.push(body.enabled ? 1 : 0); }
    if (body.keep !== undefined) { sets.push('keep = ?'); values.push(body.keep ? 1 : 0); }
    if (body.gridValue !== undefined) {
        if (body.gridValue !== null && (!isNum(body.gridValue) || body.gridValue <= 0)) return invalid('Invalid grid value');
        sets.push('grid_value = ?'); values.push(body.gridValue);
    }
    if (body.gridUnit !== undefined) {
        if (body.gridUnit !== null && !GRID_UNITS.includes(body.gridUnit)) return invalid('Invalid grid unit');
        sets.push('grid_unit = ?'); values.push(body.gridUnit);
    }
    if (sets.length === 0) return invalid('Nothing to update');
    touch(ctx);
    ctx.db.prepare(`UPDATE board_sessions SET ${sets.join(', ')} WHERE slug = ? AND session_id = ?`)
        .run(...values, ctx.slug, ctx.sessionId);
    emitSession(ctx);
    return sessionJson(ctx);
}));

// Diapositive montrée aux joueurs (null : aucune)
router.put('/sessions/:sid/shown', ...gm, handle('show slide', (ctx, body) => {
    const slideId = body.slideId ?? null;
    if (slideId !== null && !ownSlide(ctx, slideId)) return notFound('Slide');
    touch(ctx);
    ctx.db.prepare('UPDATE board_sessions SET shown_slide_id = ? WHERE slug = ? AND session_id = ?')
        .run(slideId, ctx.slug, ctx.sessionId);
    emitSession(ctx);
    return sessionJson(ctx);
}));

// PJ de la table, pour leurs jetons (avatar, sinon initiales)
router.get('/sessions/:sid/characters', authenticate, handle('load characters', (ctx, body, req) => (
    req.db.prepare(`
        SELECT c.id, c.prenom, c.nom, c.avatar FROM session_characters sc
        JOIN characters c ON c.id = sc.character_id
        WHERE sc.session_id = ? AND c.id != -1 ORDER BY c.prenom, c.nom
    `).all(ctx.sessionId)
)));

// ─── Diapositives ───────────────────────────────────────────────────────────

router.post('/sessions/:sid/slides', ...gm, handle('create slide', (ctx, body) => {
    if (body.name !== undefined && !isText(body.name, 100)) return invalid('Invalid name');
    touch(ctx);
    const { count, position } = ctx.db.prepare(`
        SELECT COUNT(*) AS count, COALESCE(MAX(position), -1) + 1 AS position
        FROM board_slides WHERE slug = ? AND session_id = ?
    `).get(ctx.slug, ctx.sessionId);
    const name = body.name?.trim() || `Diapositive ${count + 1}`;
    const { lastInsertRowid } = ctx.db.prepare(`
        INSERT INTO board_slides (slug, session_id, name, position) VALUES (?, ?, ?, ?)
    `).run(ctx.slug, ctx.sessionId, name, position);
    emitSlides(ctx);
    return { status: 201, body: toSlide(ownSlide(ctx, lastInsertRowid)) };
}));

router.put('/sessions/:sid/slides/order', ...gm, handle('order slides', (ctx, body) => {
    if (!Array.isArray(body.ids) || !body.ids.every(Number.isInteger)) return invalid('Invalid ids');
    const update = ctx.db.prepare('UPDATE board_slides SET position = ? WHERE id = ? AND slug = ? AND session_id = ?');
    ctx.db.transaction(() => body.ids.forEach((id, index) => update.run(index, id, ctx.slug, ctx.sessionId)))();
    touch(ctx);
    emitSlides(ctx);
    return listSlides(ctx);
}));

// Colonnes réglables d'une diapositive : clé du corps → [colonne, validation, conversion]
const SLIDE_FIELDS = {
    name:        ['name',         v => isText(v, 100),                          v => v.trim()],
    playersDraw: ['players_draw', v => typeof v === 'boolean',                  v => (v ? 1 : 0)],
    playersMove: ['players_move', v => typeof v === 'boolean',                  v => (v ? 1 : 0)],
    fogEnabled:  ['fog_enabled',  v => typeof v === 'boolean',                  v => (v ? 1 : 0)],
    fogShown:    ['fog_shown',    v => typeof v === 'boolean',                  v => (v ? 1 : 0)],
    gridEnabled: ['grid_enabled', v => typeof v === 'boolean',                  v => (v ? 1 : 0)],
    gridSize:    ['grid_size',    v => isNum(v) && v >= 5 && v <= 1000,          v => v],
    gridValue:   ['grid_value',   v => v === null || (isNum(v) && v > 0),        v => v],
    gridUnit:    ['grid_unit',    v => v === null || GRID_UNITS.includes(v),     v => v],
};

router.put('/sessions/:sid/slides/:id', ...gm, handle('update slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const sets = [];
    const values = [];
    for (const [key, [column, valid, convert]] of Object.entries(SLIDE_FIELDS)) {
        if (body[key] === undefined) continue;
        if (!valid(body[key])) return invalid(`Invalid ${key}`);
        sets.push(`${column} = ?`);
        values.push(convert(body[key]));
    }
    if (sets.length === 0) return invalid('Nothing to update');
    ctx.db.prepare(`UPDATE board_slides SET ${sets.join(', ')} WHERE id = ?`).run(...values, slide.id);
    touch(ctx, slide.id);
    emitSlides(ctx);
    return toSlide(ownSlide(ctx, slide.id));
}));

// Copie complète, images comprises (Q-24, Q-32)
router.post('/sessions/:sid/slides/:id/duplicate', ...gm, handle('duplicate slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    let copyId;
    ctx.db.transaction(() => {
        const { position } = ctx.db.prepare(`
            SELECT COALESCE(MAX(position), -1) + 1 AS position FROM board_slides WHERE slug = ? AND session_id = ?
        `).get(ctx.slug, ctx.sessionId);
        copyId = ctx.db.prepare(`
            INSERT INTO board_slides (slug, session_id, name, position, players_draw, players_move,
                                      fog_enabled, fog_shown, fog, grid_enabled, grid_size, grid_value, grid_unit)
            SELECT slug, session_id, substr(name || ' (copie)', 1, 100), ?, players_draw, players_move,
                   fog_enabled, fog_shown, fog, grid_enabled, grid_size, grid_value, grid_unit
            FROM board_slides WHERE id = ?
        `).run(position, slide.id).lastInsertRowid;

        const imageIds = new Map();
        const copyImage = ctx.db.prepare(`
            INSERT INTO board_images (slide_id, mime, width, height, size, data)
            SELECT ?, mime, width, height, size, data FROM board_images WHERE id = ?
        `);
        for (const { id } of ctx.db.prepare('SELECT id FROM board_images WHERE slide_id = ?').all(slide.id)) {
            imageIds.set(id, Number(copyImage.run(copyId, id).lastInsertRowid));
        }

        const insertItem = ctx.db.prepare(`
            INSERT INTO board_items (slide_id, kind, x, y, w, h, z, locked, data, author)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const item of ctx.db.prepare('SELECT * FROM board_items WHERE slide_id = ?').all(slide.id)) {
            const data = parseJson(item.data, {});
            if (data.imageId !== undefined) data.imageId = imageIds.get(data.imageId) ?? data.imageId;
            insertItem.run(copyId, item.kind, item.x, item.y, item.w, item.h, item.z, item.locked, JSON.stringify(data), item.author);
        }
    })();
    touch(ctx);
    emitSlides(ctx);
    return { status: 201, body: toSlide(ownSlide(ctx, copyId)) };
}));

router.delete('/sessions/:sid/slides/:id', ...gm, handle('delete slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    ctx.db.prepare('DELETE FROM board_slides WHERE id = ?').run(slide.id);   // objets et images par cascade
    touch(ctx);
    emitSlides(ctx);
    emitSession(ctx);   // la diapositive montrée a pu disparaître
    return { ok: true };
}));

router.get('/sessions/:sid/slides/:id', authenticate, handle('load slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const items = ctx.db.prepare('SELECT * FROM board_items WHERE slide_id = ? ORDER BY z, id').all(slide.id).map(toItem);
    return { slide: toSlide(slide), items };
}));

// ─── Objets ─────────────────────────────────────────────────────────────────

router.post('/sessions/:sid/slides/:id/items', authenticate, handle('create item', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    if (!KINDS.includes(body.kind)) return invalid('Invalid kind');
    if (!canCreate(req.user, slide, body.kind)) return forbidden();
    const data = cleanData(body.kind, body.data);
    if (!data) return invalid('Invalid data');
    const geometry = body.kind === 'stroke' ? strokeBox(data.points) : cleanGeometry(body);
    if (!geometry) return invalid('Invalid geometry');

    const { lastInsertRowid } = ctx.db.prepare(`
        INSERT INTO board_items (slide_id, kind, x, y, w, h, z, data, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(slide.id, body.kind, geometry.x ?? 0, geometry.y ?? 0, geometry.w ?? 0, geometry.h ?? 0,
        nextZ(ctx, slide.id), JSON.stringify(data), req.user.characterId);
    touch(ctx, slide.id);
    const item = getItem(ctx, lastInsertRowid);
    emitItems(ctx, slide.id, [item]);
    return { status: 201, body: item };
}));

router.patch('/sessions/:sid/items/:id', authenticate, handle('update item', (ctx, body, req) => {
    const item = ownItem(ctx, req.params.id);
    if (!item) return notFound('Item');
    const sets = [];
    const values = [];

    // Verrou : le MJ seul, et c'est la seule modification permise sur un objet verrouillé
    if (body.locked !== undefined) {
        if (!req.user.isGM) return forbidden();
        sets.push('locked = ?');
        values.push(body.locked ? 1 : 0);
    }
    const unlocking = body.locked === false;

    const geometry = cleanGeometry(body);
    if (!geometry) return invalid('Invalid geometry');
    if (Object.keys(geometry).length > 0) {
        if (item.locked && !unlocking) return lockedError();
        if (!canMove(req.user, item)) return forbidden();
        for (const [key, value] of Object.entries(geometry)) { sets.push(`${key} = ?`); values.push(value); }
    }

    if (body.data !== undefined) {
        if (item.locked && !unlocking) return lockedError();
        if (!req.user.isGM) return forbidden();
        const data = cleanData(item.kind, { ...parseJson(item.data, {}), ...body.data });
        if (!data) return invalid('Invalid data');
        sets.push('data = ?');
        values.push(JSON.stringify(data));
    }

    if (sets.length === 0) return invalid('Nothing to update');
    sets.push('updated_at = CURRENT_TIMESTAMP');
    ctx.db.prepare(`UPDATE board_items SET ${sets.join(', ')} WHERE id = ?`).run(...values, item.id);
    touch(ctx, item.slide_id);
    const updated = getItem(ctx, item.id);
    emitItems(ctx, item.slide_id, [updated]);
    return updated;
}));

router.delete('/sessions/:sid/items/:id', authenticate, handle('delete item', (ctx, body, req) => {
    const item = ownItem(ctx, req.params.id);
    if (!item) return notFound('Item');
    if (item.locked) return lockedError();
    if (!canDelete(req.user, item)) return forbidden();
    ctx.db.transaction(() => {
        ctx.db.prepare('DELETE FROM board_items WHERE id = ?').run(item.id);
        dropUnusedImages(ctx, item.slide_id);
    })();
    touch(ctx, item.slide_id);
    emitItems(ctx, item.slide_id, [], [item.id]);
    return { ok: true };
}));

// Tout effacer, sauf ce qui est verrouillé
router.delete('/sessions/:sid/slides/:id/items', ...gm, handle('clear slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    let removed = [];
    ctx.db.transaction(() => {
        removed = ctx.db.prepare('SELECT id FROM board_items WHERE slide_id = ? AND locked = 0').all(slide.id).map(r => r.id);
        ctx.db.prepare('DELETE FROM board_items WHERE slide_id = ? AND locked = 0').run(slide.id);
        dropUnusedImages(ctx, slide.id);
    })();
    touch(ctx, slide.id);
    emitItems(ctx, slide.id, [], removed);
    return { removed };
}));

// Jetons des PJ de la table qui manquent sur la diapositive, alignés en haut à gauche (Q-36)
router.post('/sessions/:sid/slides/:id/pc-tokens', ...gm, handle('place pc tokens', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const placed = new Set(ctx.db.prepare(`
        SELECT json_extract(data, '$.characterId') AS id FROM board_items WHERE slide_id = ? AND kind = 'token'
    `).all(slide.id).map(r => r.id).filter(id => id !== null));
    const missing = req.db.prepare(`
        SELECT character_id AS id FROM session_characters WHERE session_id = ? AND character_id != -1 ORDER BY character_id
    `).all(ctx.sessionId).map(r => r.id).filter(id => !placed.has(id));

    const size = slide.grid_enabled ? slide.grid_size : 60;
    const insert = ctx.db.prepare(`
        INSERT INTO board_items (slide_id, kind, x, y, w, h, z, data, author) VALUES (?, 'token', ?, ?, ?, ?, ?, ?, -1)
    `);
    const ids = [];
    ctx.db.transaction(() => {
        let z = nextZ(ctx, slide.id);
        missing.forEach((characterId, index) => {
            ids.push(insert.run(slide.id, size * (1 + index * 1.25), size, size, size, z++, JSON.stringify({ characterId })).lastInsertRowid);
        });
    })();
    if (ids.length === 0) return { items: [] };
    touch(ctx, slide.id);
    const items = ids.map(id => getItem(ctx, id));
    emitItems(ctx, slide.id, items);
    return { status: 201, body: { items } };
}));

// ─── Brouillard ─────────────────────────────────────────────────────────────

// Dévoiler / recouvrir une zone, ou tout (reset) ; liste vide = tout recouvert
router.put('/sessions/:sid/slides/:id/fog', ...gm, handle('update fog', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    let fog;
    if (body.reset === 'cover') fog = [];
    else if (body.reset === 'reveal') fog = [{ op: 'reveal', x: -1e6, y: -1e6, w: 2e6, h: 2e6 }];
    else {
        const { op, x, y, w, h } = body;
        if (!['reveal', 'cover'].includes(op) || ![x, y, w, h].every(isNum) || w <= 0 || h <= 0) return invalid('Invalid fog operation');
        fog = [...parseJson(slide.fog, []), { op, x, y, w, h }].slice(-MAX_FOG_OPS);
    }
    ctx.db.prepare('UPDATE board_slides SET fog = ? WHERE id = ?').run(JSON.stringify(fog), slide.id);
    touch(ctx, slide.id);
    emit(ctx, 'board-fog', { slideId: slide.id, fog, fogEnabled: !!slide.fog_enabled, fogShown: !!slide.fog_shown });
    return { fog };
}));

// ─── Images ─────────────────────────────────────────────────────────────────

// Image déjà réduite par le navigateur ; background : en fond, verrouillée (Q-41)
router.post('/sessions/:sid/slides/:id/images', ...gm, handle('upload image', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const match = typeof body.dataUrl === 'string' ? DATA_URL.exec(body.dataUrl) : null;
    if (!match || !IMAGE_MIMES.includes(match[1])) return invalid('Invalid image');
    const { width, height } = body;
    if (![width, height].every(v => Number.isInteger(v) && v > 0 && v <= 20000)) return invalid('Invalid image size');
    const data = Buffer.from(match[2], 'base64');
    if (data.length > MAX_IMAGE_BYTES) return { status: 413, error: 'Image too large' };
    const geometry = cleanGeometry(body);
    if (!geometry) return invalid('Invalid geometry');

    let itemId;
    ctx.db.transaction(() => {
        const imageId = Number(ctx.db.prepare(`
            INSERT INTO board_images (slide_id, mime, width, height, size, data) VALUES (?, ?, ?, ?, ?, ?)
        `).run(slide.id, match[1], width, height, data.length, data).lastInsertRowid);
        const z = body.background
            ? ctx.db.prepare('SELECT COALESCE(MIN(z), 1) - 1 AS z FROM board_items WHERE slide_id = ?').get(slide.id).z
            : nextZ(ctx, slide.id);
        itemId = ctx.db.prepare(`
            INSERT INTO board_items (slide_id, kind, x, y, w, h, z, locked, data, author) VALUES (?, 'image', ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(slide.id, geometry.x ?? 0, geometry.y ?? 0, geometry.w ?? width, geometry.h ?? height, z,
            body.background ? 1 : 0, JSON.stringify({ imageId }), req.user.characterId).lastInsertRowid;
    })();
    touch(ctx, slide.id);
    const item = getItem(ctx, itemId);
    emitItems(ctx, slide.id, [item]);
    return { status: 201, body: item };
}));

// L'image en binaire ; elle ne change jamais, le navigateur la garde
router.get('/sessions/:sid/images/:id', authenticate, (req, res) => {
    try {
        const ctx = req.board;
        const image = ctx.db.prepare(`
            SELECT i.mime, i.data FROM board_images i JOIN board_slides s ON s.id = i.slide_id
            WHERE i.id = ? AND s.slug = ? AND s.session_id = ?
        `).get(Number(req.params.id), ctx.slug, ctx.sessionId);
        if (!image) return res.status(404).json({ error: 'Image not found' });
        res.set('Content-Type', image.mime);
        res.set('Cache-Control', 'private, max-age=31536000, immutable');
        res.send(image.data);
    } catch (error) {
        console.error('Error (board load image):', error);
        res.status(500).json({ error: 'Failed to load image' });
    }
});

module.exports = router;
