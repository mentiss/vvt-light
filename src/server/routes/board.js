// src/server/routes/board.js
// ─────────────────────────────────────────────────────────────────────────────
// Tableau partagé (documentations/spec_tableau.md §10) : route partagée, montée
// pour chaque système sur /api/:slug/board.
//
// - Données dans la base du module (database/board.db, db/modules/board.js),
//   jamais dans la base du slug. Tout contenu appartient à une table : slug + session_id.
// - Diapositives d'une table, objets posés (image, icône, jeton, trait, rectangle ;
//   lot B, §13 : ellipse, ligne, halo, texte ; rotation, duplication, ordre d'affichage),
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

const KINDS = ['image', 'icon', 'token', 'stroke', 'rect', 'ellipse', 'line', 'halo', 'text'];
// ce qu'un joueur dessine et efface (P-4, §13.1, PB-6)
const PLAYER_DRAW_KINDS = ['stroke', 'rect', 'ellipse', 'line', 'halo', 'text'];
const PLAYER_MOVE_KINDS = ['token', 'icon'];       // ce qu'un joueur déplace (Q-10, Q-42)
const ROTATABLE_KINDS = ['image', 'icon', 'text', 'rect', 'ellipse'];   // Q-52
const POINT_KINDS = ['stroke', 'line'];            // tracés en coordonnées absolues : boîte calculée
const FILTER_PRESETS = ['normal', 'night', 'dark', 'sepia', 'faded'];  // Q-49
const MAX_TEXT_LENGTH = 500;
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
    rotation: row.rotation ?? 0,
    hidden: !!row.hidden,
    groupId: row.group_id ?? null,
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

const isWidth = (value) => isNum(value) && value > 0 && value <= 100;
const inRange = (value, min, max) => isNum(value) && value >= min && value <= max;

/** Filtre d'image (Q-49) : préréglage et trois réglages, 1 = neutre ; null si invalide */
function cleanFilter(filter) {
    if (!filter || typeof filter !== 'object' || !FILTER_PRESETS.includes(filter.preset)) return null;
    const { brightness, contrast, saturation } = filter;
    if (![brightness, contrast, saturation].every(v => inRange(v, 0, 2))) return null;
    return { preset: filter.preset, brightness, contrast, saturation };
}

/** Rectangle et ellipse : couleur, plein ou contour, épaisseur du contour */
function cleanShape(data) {
    if (!isText(data.color, 20) || (data.width !== undefined && !isWidth(data.width))) return null;
    return { color: data.color, filled: data.filled !== false, ...(data.width !== undefined ? { width: data.width } : {}) };
}

/** Données propres au type, nettoyées ; null si invalides */
function cleanData(kind, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    switch (kind) {
        case 'image': {
            // Une image déposée passe par POST …/images (imageId) ; la création ici n'accepte
            // qu'un lien externe (vérifié par la route). Le filtre est facultatif, null le retire.
            let source = null;
            if (Number.isInteger(data.imageId)) source = { imageId: data.imageId };
            else if (typeof data.url === 'string' && /^https?:\/\//.test(data.url) && data.url.length <= 2000) source = { url: data.url };
            if (!source) return null;
            if (data.filter === undefined || data.filter === null) return source;
            const filter = cleanFilter(data.filter);
            return filter ? { ...source, filter } : null;
        }
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
        case 'ellipse':
            return cleanShape(data);
        case 'line': {
            const { points } = data;
            if (!Array.isArray(points) || points.length !== 4 || !points.every(isNum)) return null;
            if (!isText(data.color, 20) || !isWidth(data.width)) return null;
            return { points, color: data.color, width: data.width, arrow: !!data.arrow };
        }
        case 'halo':
            return isText(data.color, 20) ? { color: data.color } : null;
        case 'text':
            if (!isText(data.text, MAX_TEXT_LENGTH) || !isText(data.color, 20) || !inRange(data.size, 1, 2000)) return null;
            return { text: data.text, color: data.color, size: data.size, background: !!data.background };
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
            INSERT INTO board_items (slide_id, kind, x, y, w, h, z, rotation, hidden, group_id, locked, data, author)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        // Le groupe n'est qu'une étiquette, toujours lue avec la diapositive : elle se recopie telle quelle
        for (const item of ctx.db.prepare('SELECT * FROM board_items WHERE slide_id = ?').all(slide.id)) {
            const data = parseJson(item.data, {});
            if (data.imageId !== undefined) data.imageId = imageIds.get(data.imageId) ?? data.imageId;
            insertItem.run(copyId, item.kind, item.x, item.y, item.w, item.h, item.z, item.rotation, item.hidden, item.group_id,
                item.locked, JSON.stringify(data), item.author);
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
    // Une image déposée ne se pose que par son envoi (…/images) : pas d'imageId venu du client
    if (body.kind === 'image' && body.data?.imageId !== undefined) return invalid('Invalid data');
    const data = cleanData(body.kind, body.data);
    if (!data) return invalid('Invalid data');
    const geometry = POINT_KINDS.includes(body.kind) ? strokeBox(data.points) : cleanGeometry(body);
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

/**
 * Modification d'un objet vérifiée (§10.2, §13, §14) : colonnes à écrire, ou erreur.
 * `carried` : morceau emmené par un joueur avec son groupe (PC-4) ; seule la position
 * est alors permise, sans les droits de déplacement de l'objet lui-même.
 * @returns {{ sets: string[], values: any[] } | { status: number, error: string }}
 */
function planPatch(user, item, body, { carried = false } = {}) {
    const sets = [];
    const values = [];

    // Verrou : le MJ seul, et c'est la seule modification permise sur un objet verrouillé
    if (body.locked !== undefined) {
        if (!user.isGM) return forbidden();
        sets.push('locked = ?');
        values.push(body.locked ? 1 : 0);
    }
    const unlocking = body.locked === false;
    const blocked = item.locked && !unlocking;

    const geometry = cleanGeometry(body);
    if (!geometry) return invalid('Invalid geometry');
    if (carried && Object.keys(body).some(key => key !== 'x' && key !== 'y' && key !== 'id')) return forbidden();
    let data = null;
    if (Object.keys(geometry).length > 0) {
        if (blocked) return lockedError();
        if (!carried && !canMove(user, item)) return forbidden();
        for (const [key, value] of Object.entries(geometry)) { sets.push(`${key} = ?`); values.push(value); }
        // Trait, ligne : points en coordonnées absolues, décalés avec la boîte
        if (POINT_KINDS.includes(item.kind) && (geometry.x !== undefined || geometry.y !== undefined)) {
            const dx = (geometry.x ?? item.x) - item.x, dy = (geometry.y ?? item.y) - item.y;
            data = parseJson(item.data, {});
            data.points = data.points.map((v, i) => Math.round((v + (i % 2 === 0 ? dx : dy)) * 10) / 10);
        }
    }

    // Rotation (§13.2, PB-1) : géométrie, mêmes droits que le déplacement
    if (body.rotation !== undefined) {
        if (!isNum(body.rotation) || !ROTATABLE_KINDS.includes(item.kind)) return invalid('Invalid rotation');
        if (blocked) return lockedError();
        if (!canMove(user, item)) return forbidden();
        sets.push('rotation = ?');
        values.push(((body.rotation % 360) + 360) % 360);
    }

    // Caché aux joueurs (§14.3) : le MJ seul
    if (body.hidden !== undefined) {
        if (!user.isGM) return forbidden();
        if (blocked) return lockedError();
        sets.push('hidden = ?');
        values.push(body.hidden ? 1 : 0);
    }

    // Premier plan / arrière-plan (PB-5) : vérifié ici, calculé par l'appelant
    if (body.order !== undefined) {
        if (!['front', 'back'].includes(body.order)) return invalid('Invalid order');
        if (blocked) return lockedError();
        if (!canMove(user, item)) return forbidden();
    }

    if (body.data !== undefined) {
        if (blocked) return lockedError();
        if (!user.isGM) return forbidden();
        data = cleanData(item.kind, { ...(data ?? parseJson(item.data, {})), ...body.data });
        if (!data) return invalid('Invalid data');
    }
    if (data) { sets.push('data = ?'); values.push(JSON.stringify(data)); }
    return { sets, values };
}

/**
 * Premier plan / arrière-plan de plusieurs objets, leur ordre entre eux gardé (dans une transaction).
 * L'arrière-plan reste au-dessus des fonds verrouillés (PB-5).
 * @returns {Map<number, number>} id → nouveau z, et les ids des autres objets décalés
 */
function reorder(ctx, slideId, items, order) {
    const sorted = [...items].sort((a, b) => a.z - b.z || a.id - b.id);
    const ids = sorted.map(i => i.id);
    const z = new Map();
    let shifted = [];
    const marks = ids.map(() => '?').join(', ');
    if (order === 'front') {
        let next = nextZ(ctx, slideId);
        for (const id of ids) z.set(id, next++);
    } else {
        const { target } = ctx.db.prepare(`
            SELECT MIN(z) AS target FROM board_items
            WHERE slide_id = ? AND id NOT IN (${marks}) AND NOT (kind = 'image' AND locked = 1)
        `).get(slideId, ...ids);
        if (target === null) return { z, shifted };
        shifted = ctx.db.prepare(`SELECT id FROM board_items WHERE slide_id = ? AND id NOT IN (${marks}) AND z >= ?`)
            .all(slideId, ...ids, target).map(r => r.id);
        ctx.db.prepare(`UPDATE board_items SET z = z + ? WHERE slide_id = ? AND id NOT IN (${marks}) AND z >= ?`)
            .run(ids.length, slideId, ...ids, target);
        ids.forEach((id, index) => z.set(id, target + index));
    }
    return { z, shifted };
}

/** Écrit les colonnes prévues (et le z), puis la date de modification */
function writeItem(ctx, id, plan, z) {
    const sets = [...plan.sets, ...(z !== undefined ? ['z = ?'] : []), 'updated_at = CURRENT_TIMESTAMP'];
    const values = [...plan.values, ...(z !== undefined ? [z] : [])];
    ctx.db.prepare(`UPDATE board_items SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
}

/** Groupes réduits à un seul objet : ce n'est plus un groupe (§14.2). Renvoie les ids dégroupés */
function dropLoneGroups(ctx, slideId) {
    const lone = ctx.db.prepare(`
        SELECT id FROM board_items WHERE slide_id = ? AND group_id IN (
            SELECT group_id FROM board_items WHERE slide_id = ? AND group_id IS NOT NULL GROUP BY group_id HAVING COUNT(*) < 2
        )
    `).all(slideId, slideId).map(r => r.id);
    if (lone.length > 0) {
        ctx.db.prepare(`UPDATE board_items SET group_id = NULL WHERE id IN (${lone.map(() => '?').join(', ')})`).run(...lone);
    }
    return lone;
}

/** Objets de la diapositive désignés par `ids` (entiers, tous trouvés), ou null */
function slideItems(ctx, slide, ids, max = 500) {
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > max || !ids.every(Number.isInteger)) return null;
    const marks = ids.map(() => '?').join(', ');
    const rows = ctx.db.prepare(`
        SELECT i.*, s.players_draw, s.players_move FROM board_items i JOIN board_slides s ON s.id = i.slide_id
        WHERE i.slide_id = ? AND i.id IN (${marks})
    `).all(slide.id, ...ids);
    return rows.length === new Set(ids).size ? rows : null;
}

router.patch('/sessions/:sid/items/:id', authenticate, handle('update item', (ctx, body, req) => {
    const item = ownItem(ctx, req.params.id);
    if (!item) return notFound('Item');
    const plan = planPatch(req.user, item, body);
    if (plan.error) return plan;
    if (plan.sets.length === 0 && body.order === undefined) return invalid('Nothing to update');
    let shifted = [];
    ctx.db.transaction(() => {
        let z;
        if (body.order) {
            const result = reorder(ctx, item.slide_id, [item], body.order);
            shifted = result.shifted;
            z = result.z.get(item.id);
        }
        writeItem(ctx, item.id, plan, z);
    })();
    if (shifted.length > 0) emitItems(ctx, item.slide_id, shifted.map(id => getItem(ctx, id)));
    touch(ctx, item.slide_id);
    const updated = getItem(ctx, item.id);
    emitItems(ctx, item.slide_id, [updated]);
    return updated;
}));

// Plusieurs objets en une écriture (§14.5) : tout ou rien, une seule diffusion.
// { items: [{ id, x?, y?, hidden?, locked?, data? }], order? }
router.patch('/sessions/:sid/slides/:id/items', authenticate, handle('update items', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    if (!Array.isArray(body.items) || body.items.some(p => !p || typeof p !== 'object')) return invalid('Invalid items');
    const rows = slideItems(ctx, slide, body.items.map(p => p.id));
    if (!rows) return invalid('Invalid items');
    const byId = new Map(rows.map(r => [r.id, r]));

    // Joueur (PC-4) : les morceaux d'un groupe dont il déplace un morceau permis sont emmenés
    const movedGroups = new Set(body.items
        .filter(p => (p.x !== undefined || p.y !== undefined) && canMove(req.user, byId.get(p.id)) && byId.get(p.id).group_id !== null)
        .map(p => byId.get(p.id).group_id));

    const plans = [];
    for (const patch of body.items) {
        const item = byId.get(patch.id);
        const carried = !req.user.isGM && item.group_id !== null && movedGroups.has(item.group_id) && !canMove(req.user, item);
        const plan = planPatch(req.user, item, { ...patch, ...(body.order ? { order: body.order } : {}) }, { carried });
        if (plan.error) return plan;
        plans.push([item, plan]);
    }
    if (body.order !== undefined && !['front', 'back'].includes(body.order)) return invalid('Invalid order');

    let shifted = [];
    ctx.db.transaction(() => {
        const zs = body.order ? reorder(ctx, slide.id, rows, body.order) : { z: new Map(), shifted: [] };
        shifted = zs.shifted;
        for (const [item, plan] of plans) {
            if (plan.sets.length > 0 || zs.z.has(item.id)) writeItem(ctx, item.id, plan, zs.z.get(item.id));
        }
    })();
    touch(ctx, slide.id);
    const updated = rows.map(r => getItem(ctx, r.id));
    emitItems(ctx, slide.id, [...shifted.map(id => getItem(ctx, id)), ...updated]);
    return { items: updated };
}));

// Grouper (§14.2, MJ) : les objets et les groupes dont ils font déjà partie n'en font plus qu'un
router.post('/sessions/:sid/slides/:id/group', ...gm, handle('group items', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const rows = slideItems(ctx, slide, body.ids);
    if (!rows || rows.length < 2) return invalid('Invalid ids');
    const groupId = Math.min(...rows.map(r => r.id));
    const groups = [...new Set(rows.map(r => r.group_id).filter(g => g !== null))];
    let ids = rows.map(r => r.id);
    ctx.db.transaction(() => {
        if (groups.length > 0) {
            const marks = groups.map(() => '?').join(', ');
            ids = [...new Set([...ids, ...ctx.db.prepare(`SELECT id FROM board_items WHERE slide_id = ? AND group_id IN (${marks})`)
                .all(slide.id, ...groups).map(r => r.id)])];
        }
        const marks = ids.map(() => '?').join(', ');
        ctx.db.prepare(`UPDATE board_items SET group_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${marks})`).run(groupId, ...ids);
    })();
    touch(ctx, slide.id);
    const items = ids.map(id => getItem(ctx, id));
    emitItems(ctx, slide.id, items);
    return { items };
}));

// Dégrouper (§14.2, MJ) : tous les groupes touchés par la sélection
router.post('/sessions/:sid/slides/:id/ungroup', ...gm, handle('ungroup items', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const rows = slideItems(ctx, slide, body.ids);
    if (!rows) return invalid('Invalid ids');
    const groups = [...new Set(rows.map(r => r.group_id).filter(g => g !== null))];
    if (groups.length === 0) return { items: [] };
    const marks = groups.map(() => '?').join(', ');
    const ids = ctx.db.prepare(`SELECT id FROM board_items WHERE slide_id = ? AND group_id IN (${marks})`).all(slide.id, ...groups).map(r => r.id);
    ctx.db.prepare(`UPDATE board_items SET group_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE slide_id = ? AND group_id IN (${marks})`)
        .run(slide.id, ...groups);
    touch(ctx, slide.id);
    const items = ids.map(id => getItem(ctx, id));
    emitItems(ctx, slide.id, items);
    return { items };
}));

// Dupliquer une sélection (§13.2, §14.5, MJ) : copies décalées d'une case, au-dessus de tout,
// dans leur ordre ; un groupe copié devient un nouveau groupe ; jetons des PJ ignorés (PB-4)
router.post('/sessions/:sid/slides/:id/items/duplicate', ...gm, handle('duplicate items', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const rows = slideItems(ctx, slide, body.ids);
    if (!rows) return invalid('Invalid ids');
    const sources = rows
        .filter(r => !(r.kind === 'token' && parseJson(r.data, {}).characterId !== undefined))
        .sort((a, b) => a.z - b.z || a.id - b.id);
    if (sources.length === 0) return { status: 409, error: 'PC token' };
    const offset = slide.grid_enabled ? slide.grid_size : 20;
    const insert = ctx.db.prepare(`
        INSERT INTO board_items (slide_id, kind, x, y, w, h, z, rotation, hidden, data, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, -1)
    `);
    const copies = [];
    ctx.db.transaction(() => {
        let z = nextZ(ctx, slide.id);
        const groupOf = new Map();   // groupe d'origine → ids des copies
        for (const row of sources) {
            const data = parseJson(row.data, {});
            if (POINT_KINDS.includes(row.kind)) data.points = data.points.map(v => v + offset);
            const id = Number(insert.run(slide.id, row.kind, row.x + offset, row.y + offset, row.w, row.h, z++,
                row.rotation, row.hidden, JSON.stringify(data)).lastInsertRowid);
            copies.push(id);
            if (row.group_id !== null) groupOf.set(row.group_id, [...(groupOf.get(row.group_id) ?? []), id]);
        }
        const setGroup = ctx.db.prepare('UPDATE board_items SET group_id = ? WHERE id = ?');
        for (const ids of groupOf.values()) {
            if (ids.length < 2) continue;
            const groupId = Math.min(...ids);
            for (const id of ids) setGroup.run(groupId, id);
        }
    })();
    touch(ctx, slide.id);
    const items = copies.map(id => getItem(ctx, id));
    emitItems(ctx, slide.id, items);
    return { status: 201, body: { items } };
}));

// Supprimer une sélection (§14.5) : mêmes droits que l'effacement d'un objet ; le verrouillé
// et ce qui n'est pas permis sont ignorés
router.post('/sessions/:sid/slides/:id/items/remove', authenticate, handle('remove items', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    const rows = slideItems(ctx, slide, body.ids);
    if (!rows) return invalid('Invalid ids');
    const removed = rows.filter(r => !r.locked && canDelete(req.user, r)).map(r => r.id);
    let lone = [];
    if (removed.length > 0) {
        ctx.db.transaction(() => {
            const marks = removed.map(() => '?').join(', ');
            ctx.db.prepare(`DELETE FROM board_items WHERE id IN (${marks})`).run(...removed);
            dropUnusedImages(ctx, slide.id);
            lone = dropLoneGroups(ctx, slide.id);
        })();
        touch(ctx, slide.id);
    }
    emitItems(ctx, slide.id, lone.map(id => getItem(ctx, id)), removed);
    return { removed };
}));

router.delete('/sessions/:sid/items/:id', authenticate, handle('delete item', (ctx, body, req) => {
    const item = ownItem(ctx, req.params.id);
    if (!item) return notFound('Item');
    if (item.locked) return lockedError();
    if (!canDelete(req.user, item)) return forbidden();
    let lone = [];
    ctx.db.transaction(() => {
        ctx.db.prepare('DELETE FROM board_items WHERE id = ?').run(item.id);
        dropUnusedImages(ctx, item.slide_id);
        lone = dropLoneGroups(ctx, item.slide_id);
    })();
    touch(ctx, item.slide_id);
    emitItems(ctx, item.slide_id, lone.map(id => getItem(ctx, id)), [item.id]);
    return { ok: true };
}));

// Dupliquer (§13.2, PB-3, PB-4) : copie décalée d'une case, au-dessus de tout ; une image
// déposée est partagée (même imageId), jamais recopiée ; un jeton de PJ ne se duplique pas
router.post('/sessions/:sid/items/:id/duplicate', ...gm, handle('duplicate item', (ctx, body, req) => {
    const item = ownItem(ctx, req.params.id);
    if (!item) return notFound('Item');
    const data = parseJson(item.data, {});
    if (item.kind === 'token' && data.characterId !== undefined) return { status: 409, error: 'PC token' };
    const slide = ownSlide(ctx, item.slide_id);
    const offset = slide.grid_enabled ? slide.grid_size : 20;
    if (POINT_KINDS.includes(item.kind)) data.points = data.points.map(v => v + offset);
    const { lastInsertRowid } = ctx.db.prepare(`
        INSERT INTO board_items (slide_id, kind, x, y, w, h, z, rotation, data, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, -1)
    `).run(item.slide_id, item.kind, item.x + offset, item.y + offset, item.w, item.h, nextZ(ctx, item.slide_id),
        item.rotation, JSON.stringify(data));
    touch(ctx, item.slide_id);
    const copy = getItem(ctx, lastInsertRowid);
    emitItems(ctx, item.slide_id, [copy]);
    return { status: 201, body: copy };
}));

// Tout effacer, sauf ce qui est verrouillé
router.delete('/sessions/:sid/slides/:id/items', ...gm, handle('clear slide', (ctx, body, req) => {
    const slide = ownSlide(ctx, req.params.id);
    if (!slide) return notFound('Slide');
    let removed = [];
    let lone = [];
    ctx.db.transaction(() => {
        removed = ctx.db.prepare('SELECT id FROM board_items WHERE slide_id = ? AND locked = 0').all(slide.id).map(r => r.id);
        ctx.db.prepare('DELETE FROM board_items WHERE slide_id = ? AND locked = 0').run(slide.id);
        dropUnusedImages(ctx, slide.id);
        lone = dropLoneGroups(ctx, slide.id);
    })();
    touch(ctx, slide.id);
    emitItems(ctx, slide.id, lone.map(id => getItem(ctx, id)), removed);
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
    // Point de départ facultatif (« Ajouter ici », PC-7), sinon en haut à gauche
    const origin = isNum(body.x) && isNum(body.y) ? { x: body.x, y: body.y } : { x: size, y: size };
    const insert = ctx.db.prepare(`
        INSERT INTO board_items (slide_id, kind, x, y, w, h, z, data, author) VALUES (?, 'token', ?, ?, ?, ?, ?, ?, -1)
    `);
    const ids = [];
    ctx.db.transaction(() => {
        let z = nextZ(ctx, slide.id);
        missing.forEach((characterId, index) => {
            ids.push(insert.run(slide.id, origin.x + size * index * 1.25, origin.y, size, size, z++, JSON.stringify({ characterId })).lastInsertRowid);
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
