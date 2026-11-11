// src/server/routes/audio.js
// ─────────────────────────────────────────────────────────────────────────────
// Brique audio synchronisée (documentations/spec_audio.md §10.8, §11) : route
// partagée, montée pour chaque système sur /api/:slug/audio.
//
// - Données dans la base du module (database/audio.db, db/modules/audio.js), jamais dans
//   la base du slug. Tout contenu appartient à une table : slug + session_id.
// - Bibliothèque de la table (collections → playlists → vidéos), catalogue public
//   en lecture seule (niveaux 'slug' et 'platform'), copie indépendante (T-1).
//   Seule la table propriétaire modifie un contenu (S-4).
// - Quatre pistes fixes par table (music, ambience1, ambience2, effect). L'état de
//   lecture vit en mémoire (sharedState.audioStates), seule source de vérité :
//   chaque commande du MJ le modifie puis le diffuse à la room de la table.
//
// Les clés étrangères ne sont pas activées sur les connexions : les suppressions
// effacent explicitement les lignes filles, en transaction.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { authenticate, requireGM } = require('../middlewares/auth');
const { sharedState } = require('../socket/index');
const { getDbForSystem } = require('../db');
const { getModuleConfig } = require('../db/moduleConfig');
const { getConfigForSystem } = require('../systems/Loader');
const { parseLink, resolveLink, LinkError } = require('../utils/audioSources');

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const OEMBED_URL = 'https://www.youtube.com/oembed?format=json&url=';
const OEMBED_BATCH = 8;          // requêtes oEmbed simultanées à l'import d'une playlist
const END_MARGIN_MS = 1000;      // marge avant de passer au morceau suivant
const VISIBILITIES = ['private', 'slug', 'platform'];

// Pistes fixes et modes permis (S-5, S-7)
const SLOTS = {
    music:     { modes: ['playlist', 'loop', 'shuffle'], mode: 'playlist' },
    ambience1: { modes: ['loop', 'playlist'],            mode: 'loop' },
    ambience2: { modes: ['loop', 'playlist'],            mode: 'loop' },
    effect:    { modes: ['once'],                        mode: 'once' },
};

// Tolérance de recalage des clients, en secondes (P2-3), réglable dans le .env
const syncTolerance = () => {
    const value = Number(process.env.AUDIO_SYNC_TOLERANCE);
    return Number.isFinite(value) && value > 0 ? value : 1;
};

// Minuteurs de fin de morceau, par piste (hors de l'état diffusé)
const endTimers = new Map();

const audioDb = () => getDbForSystem(getModuleConfig('audio'));
const isText = (value) => typeof value === 'string' && value.trim().length > 0;

// ─── Bibliothèque : lecture ─────────────────────────────────────────────────

/** Collections données → [{ id, name, visibility, owner, playlists: [{ id, name, tracks }] }] */
function nestCollections(db, collections) {
    if (collections.length === 0) return [];
    const ids = JSON.stringify(collections.map(c => c.id));
    const playlists = db.prepare(`
        SELECT id, collection_id, name, default_slot FROM audio_playlists
        WHERE collection_id IN (SELECT value FROM json_each(?)) ORDER BY position, id
    `).all(ids);
    const tracks = db.prepare(`
        SELECT t.id, t.playlist_id, t.source, t.media_id, t.title, t.gain, t.unavailable, t.duration
        FROM audio_tracks t JOIN audio_playlists p ON p.id = t.playlist_id
        WHERE p.collection_id IN (SELECT value FROM json_each(?)) ORDER BY t.position, t.id
    `).all(ids);

    const tracksByPlaylist = new Map();
    for (const t of tracks) {
        if (!tracksByPlaylist.has(t.playlist_id)) tracksByPlaylist.set(t.playlist_id, []);
        tracksByPlaylist.get(t.playlist_id).push({ id: t.id, source: t.source, mediaId: t.media_id, title: t.title, gain: t.gain, unavailable: !!t.unavailable, duration: t.duration });
    }
    const playlistsByCollection = new Map();
    for (const p of playlists) {
        if (!playlistsByCollection.has(p.collection_id)) playlistsByCollection.set(p.collection_id, []);
        playlistsByCollection.get(p.collection_id).push({ id: p.id, name: p.name, defaultSlot: p.default_slot, tracks: tracksByPlaylist.get(p.id) ?? [] });
    }

    return collections.map(c => ({
        id: c.id,
        name: c.name,
        visibility: c.visibility,
        owner: { slug: c.slug, sessionId: c.session_id },
        playlists: playlistsByCollection.get(c.id) ?? [],
    }));
}

/** Bibliothèque de la table */
function loadLibrary(ctx) {
    const collections = ctx.db.prepare(`
        SELECT * FROM audio_collections WHERE slug = ? AND session_id = ? ORDER BY position, id
    `).all(ctx.slug, ctx.sessionId);
    return nestCollections(ctx.db, collections);
}

/** Nom d'une table d'un slug, pour le catalogue (null si introuvable) */
function sessionName(slug, sessionId, names) {
    const key = `${slug}_${sessionId}`;
    if (!names.has(key)) {
        try {
            const row = getDbForSystem(getConfigForSystem(slug)).prepare('SELECT name FROM game_sessions WHERE id = ?').get(sessionId);
            names.set(key, row?.name ?? null);
        } catch {
            names.set(key, null);
        }
    }
    return names.get(key);
}

/** Catalogue public : niveau 'slug' des autres tables du slug, niveau 'platform' de toutes les tables (§11.2) */
function loadCatalog(ctx) {
    const collections = ctx.db.prepare(`
        SELECT * FROM audio_collections
        WHERE NOT (slug = ? AND session_id = ?)
          AND ((visibility = 'slug' AND slug = ?) OR visibility = 'platform')
        ORDER BY slug, name, id
    `).all(ctx.slug, ctx.sessionId, ctx.slug);

    const names = new Map();
    return nestCollections(ctx.db, collections).map(c => ({
        ...c,
        owner: { ...c.owner, sessionName: sessionName(c.owner.slug, c.owner.sessionId, names) },
    }));
}

// ─── Bibliothèque : propriété et lecture permise ────────────────────────────

const OWN_COLLECTION = 'SELECT * FROM audio_collections WHERE id = ? AND slug = ? AND session_id = ?';
const OWN_PLAYLIST = `
    SELECT p.* FROM audio_playlists p JOIN audio_collections c ON c.id = p.collection_id
    WHERE p.id = ? AND c.slug = ? AND c.session_id = ?`;
const OWN_TRACK = `
    SELECT t.* FROM audio_tracks t
    JOIN audio_playlists p ON p.id = t.playlist_id JOIN audio_collections c ON c.id = p.collection_id
    WHERE t.id = ? AND c.slug = ? AND c.session_id = ?`;

// Lisible : à la table, ou public pour elle
const READABLE = `((c.slug = ? AND c.session_id = ?) OR (c.visibility = 'slug' AND c.slug = ?) OR c.visibility = 'platform')`;

const own = (ctx, sql, id) => ctx.db.prepare(sql).get(id, ctx.slug, ctx.sessionId);
const readable = (ctx, sql, id) => ctx.db.prepare(sql).get(id, ctx.slug, ctx.sessionId, ctx.slug);

const READABLE_COLLECTION = `SELECT c.* FROM audio_collections c WHERE c.id = ? AND ${READABLE}`;
const READABLE_PLAYLIST = `
    SELECT p.* FROM audio_playlists p JOIN audio_collections c ON c.id = p.collection_id
    WHERE p.id = ? AND ${READABLE}`;
const READABLE_TRACK = `
    SELECT t.* FROM audio_tracks t
    JOIN audio_playlists p ON p.id = t.playlist_id JOIN audio_collections c ON c.id = p.collection_id
    WHERE t.id = ? AND ${READABLE}`;

// ─── Bibliothèque : écriture ────────────────────────────────────────────────

/** Position suivant la dernière ligne d'un parent (fin de liste). */
function nextPosition(db, table, where, params) {
    return db.prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM ${table} WHERE ${where}`).get(...params).pos;
}

/** Réécrit l'ordre d'une liste d'ids (glisser-déposer), limité aux lignes visées par `where`. */
function reorder(db, table, ids, where, params) {
    if (!Array.isArray(ids)) return false;
    const stmt = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ? AND ${where}`);
    db.transaction(() => ids.forEach((id, index) => stmt.run(index, id, ...params)))();
    return true;
}

function copyTracks(db, fromPlaylistId, toPlaylistId) {
    const start = nextPosition(db, 'audio_tracks', 'playlist_id = ?', [toPlaylistId]);
    db.prepare(`
        INSERT INTO audio_tracks (playlist_id, source, media_id, title, gain, duration, position)
        SELECT ?, source, media_id, title, gain, duration, ? + ROW_NUMBER() OVER (ORDER BY position, id) - 1
        FROM audio_tracks WHERE playlist_id = ?
    `).run(toPlaylistId, start, fromPlaylistId);
}

function copyPlaylist(db, playlist, toCollectionId) {
    const { lastInsertRowid } = db.prepare('INSERT INTO audio_playlists (collection_id, name, default_slot, position) VALUES (?, ?, ?, ?)')
        .run(toCollectionId, playlist.name, playlist.default_slot, nextPosition(db, 'audio_playlists', 'collection_id = ?', [toCollectionId]));
    copyTracks(db, playlist.id, lastInsertRowid);
}

function deleteCollections(db, where, params) {
    const ids = `SELECT id FROM audio_collections WHERE ${where}`;
    db.prepare(`DELETE FROM audio_tracks WHERE playlist_id IN (SELECT id FROM audio_playlists WHERE collection_id IN (${ids}))`).run(...params);
    db.prepare(`DELETE FROM audio_playlists WHERE collection_id IN (${ids})`).run(...params);
    return db.prepare(`DELETE FROM audio_collections WHERE ${where}`).run(...params).changes;
}

/**
 * Ménage des tables disparues (P2-1) : contenu audio des tables du slug qui
 * n'existent plus dans sa base. Les copies faites ailleurs sont indépendantes.
 */
function purgeDeletedTables(ctx, slugDb) {
    const existing = JSON.stringify(slugDb.prepare('SELECT id FROM game_sessions').all().map(r => r.id));
    const where = 'slug = ? AND session_id NOT IN (SELECT value FROM json_each(?))';
    ctx.db.transaction(() => {
        deleteCollections(ctx.db, where, [ctx.slug, existing]);
        ctx.db.prepare(`DELETE FROM audio_session_settings WHERE ${where}`).run(ctx.slug, existing);
        ctx.db.prepare(`DELETE FROM audio_buttons WHERE ${where}`).run(ctx.slug, existing);
    })();
}

/** Titre d'une vidéo par oEmbed (sans clé d'API) ; l'identifiant si YouTube ne répond pas. */
async function fetchTitle(videoId) {
    try {
        const url = `${OEMBED_URL}${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return videoId;
        const data = await res.json();
        return data?.title?.trim() || videoId;
    } catch {
        return videoId;
    }
}

async function fetchTitles(videoIds) {
    const titles = [];
    for (let i = 0; i < videoIds.length; i += OEMBED_BATCH) {
        titles.push(...await Promise.all(videoIds.slice(i, i + OEMBED_BATCH).map(fetchTitle)));
    }
    return titles;
}

/** Titre d'une playlist YouTube par oEmbed ; null si YouTube ne répond pas. */
async function fetchPlaylistTitle(listId) {
    try {
        const url = `${OEMBED_URL}${encodeURIComponent(`https://www.youtube.com/playlist?list=${listId}`)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.title?.trim() || null;
    } catch {
        return null;
    }
}

/** Nom par défaut quand le MJ n'en donne pas : « Collection 3 », « Playlist 2 »… */
function defaultName(db, prefix, table, where, params) {
    const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`).get(...params);
    return `${prefix} ${n + 1}`;
}

function createCollection(ctx, name) {
    const owner = ['slug = ? AND session_id = ?', [ctx.slug, ctx.sessionId]];
    return ctx.db.prepare('INSERT INTO audio_collections (slug, session_id, name, position) VALUES (?, ?, ?, ?)')
        .run(ctx.slug, ctx.sessionId, isText(name) ? name.trim() : defaultName(ctx.db, 'Collection', 'audio_collections', ...owner),
            nextPosition(ctx.db, 'audio_collections', ...owner)).lastInsertRowid;
}

/**
 * Titres à ajouter : vidéos YouTube (titres repris par oEmbed, Q-21) et liens d'autres
 * plateformes résolus (§14.3). Un lien refusé fait tout refuser : { error } en français.
 */
async function resolveItems(videoIds, links) {
    const items = [];
    try {
        // Tous les liens lus avant le premier appel réseau (YouTube compris) : un lien refusé ne fait rien résoudre
        links.forEach(parseLink);
        if (videoIds.length) {
            const titles = await fetchTitles(videoIds);
            videoIds.forEach((videoId, i) => items.push({ source: 'youtube', mediaId: videoId, title: titles[i], duration: null }));
        }
        for (const link of links) items.push(await resolveLink(link));
    } catch (error) {
        if (error instanceof LinkError) return { error: error.message };
        throw error;
    }
    return { items };
}

/** Liens reçus : absents = aucun ; sinon une liste de textes non vides, ou null (refus du lot entier). */
const linkList = (links) => {
    if (links === undefined || links === null) return [];
    return Array.isArray(links) && links.every(isText) ? links : null;
};
const INVALID_LINKS = 'Liens invalides : une liste d\'adresses est attendue';

/** Ajoute des titres résolus en fin de playlist. */
function addTracks(ctx, playlistId, items) {
    const insert = ctx.db.prepare('INSERT INTO audio_tracks (playlist_id, source, media_id, title, duration, position) VALUES (?, ?, ?, ?, ?, ?)');
    ctx.db.transaction(() => {
        let position = nextPosition(ctx.db, 'audio_tracks', 'playlist_id = ?', [playlistId]);
        for (const item of items) insert.run(playlistId, item.source, item.mediaId, item.title, item.duration, position++);
    })();
}

// ─── Réglages de la table ───────────────────────────────────────────────────

function getSettings(ctx) {
    const row = ctx.db.prepare('SELECT enabled, hide_title FROM audio_session_settings WHERE slug = ? AND session_id = ?').get(ctx.slug, ctx.sessionId);
    return { enabled: !!row?.enabled, hideTitle: !!row?.hide_title };
}

function saveSettings(ctx, { enabled, hideTitle }) {
    const current = getSettings(ctx);
    ctx.db.prepare(`
        INSERT INTO audio_session_settings (slug, session_id, enabled, hide_title) VALUES (?, ?, ?, ?)
        ON CONFLICT (slug, session_id) DO UPDATE SET enabled = excluded.enabled, hide_title = excluded.hide_title
    `).run(ctx.slug, ctx.sessionId, (enabled ?? current.enabled) ? 1 : 0, (hideTitle ?? current.hideTitle) ? 1 : 0);
}

// ─── État de lecture ────────────────────────────────────────────────────────

const stateKey = (slug, sessionId) => `${slug}_${sessionId}`;
const timerKey = (ctx, slot) => `${ctx.key}:${slot}`;

const emptySlot = (slot, mode = SLOTS[slot].mode) => ({
    status: 'stopped', trackId: null, source: null, mediaId: null, title: null, gain: 100,
    playlistId: null, mode, position: 0, refTime: 0, duration: null,
    start: 0,   // point d'entrée du morceau en cours (timecode d'un bouton, §14.2) : la boucle repart de là
});

function getState(ctx) {
    if (!sharedState.audioStates.has(ctx.key)) {
        // lastButtonId : dernière scène lancée (lot 2, §12.6), un identifiant, jamais un nom
        sharedState.audioStates.set(ctx.key, { slots: Object.fromEntries(Object.keys(SLOTS).map(s => [s, emptySlot(s)])), lastButtonId: null });
    }
    return sharedState.audioStates.get(ctx.key);
}

/** Position courante (secondes) d'une piste, à l'instant présent. */
function currentPosition(slot) {
    return slot.status === 'playing' ? slot.position + (Date.now() - slot.refTime) / 1000 : slot.position;
}

function clearEndTimer(ctx, slot) {
    const key = timerKey(ctx, slot);
    if (endTimers.has(key)) {
        clearTimeout(endTimers.get(key));
        endTimers.delete(key);
    }
}

function broadcastState(ctx) {
    ctx.io?.to(`${ctx.slug}_session_${ctx.sessionId}`).emit('audio-state', {
        system: ctx.slug,
        sessionId: ctx.sessionId,
        state: getState(ctx),
        hideTitle: getSettings(ctx).hideTitle,
        serverTime: Date.now(),
    });
}

/** Arme la fin de morceau d'une piste si elle joue et que sa durée est connue (§11.3). */
function scheduleEnd(ctx, slot) {
    clearEndTimer(ctx, slot);
    const state = getState(ctx).slots[slot];
    if (state.status !== 'playing' || !state.duration) return;

    const remainingMs = Math.max(0, (state.duration - currentPosition(state)) * 1000) + END_MARGIN_MS;
    const trackId = state.trackId;
    const key = timerKey(ctx, slot);
    endTimers.set(key, setTimeout(() => {
        endTimers.delete(key);
        // Le MJ a pu changer de morceau entre-temps
        if (getState(ctx).slots[slot].trackId !== trackId) return;
        // Hors requête : une erreur non rattrapée ferait tomber le serveur
        try {
            advance({ ...ctx, db: audioDb() }, slot, { auto: true });
            broadcastState(ctx);
        } catch (error) {
            console.error('Error moving to next audio track:', error);
        }
    }, remainingMs));
}

/**
 * Lance une vidéo de la bibliothèque de la table sur une piste, depuis `position`
 * (retenue comme point d'entrée, §14.2). Renvoie false si elle n'y est pas.
 */
function playTrack(ctx, slot, trackId, position = 0) {
    const track = own(ctx, OWN_TRACK, trackId);
    if (!track) return false;
    const current = getState(ctx).slots[slot];
    // Départ au-delà de la durée connue (bouton créé quand elle ne l'était pas) : depuis le début
    const asked = Math.max(0, Number(position) || 0);
    const start = track.duration && asked >= track.duration ? 0 : asked;
    Object.assign(current, {
        status: 'playing',
        trackId: track.id,
        source: track.source,
        mediaId: track.media_id,
        title: track.title,
        gain: track.gain,
        playlistId: track.playlist_id,
        position: start,
        refTime: Date.now(),
        duration: null,
        start,
    });
    clearEndTimer(ctx, slot);
    return true;
}

function stopSlot(ctx, slot) {
    clearEndTimer(ctx, slot);
    const current = getState(ctx).slots[slot];
    Object.assign(current, emptySlot(slot, current.mode));
}

const playlistIds = (ctx, playlistId) =>
    ctx.db.prepare('SELECT id FROM audio_tracks WHERE playlist_id = ? ORDER BY position, id').all(playlistId).map(r => r.id);

/** Un morceau au hasard de la liste, autre que `exclude` quand c'est possible. */
function pickRandom(ids, exclude) {
    const pool = ids.length > 1 ? ids.filter(id => id !== exclude) : ids;
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Morceau suivant d'une piste, selon son mode (§11.3) : fin de morceau (auto) ou
 * commande « suivant » / « précédent » (step = 1 / -1). La playlist est relue en
 * base, donc à jour des modifications faites pendant la lecture.
 */
function advance(ctx, slot, { auto = false, step = 1 } = {}) {
    const current = getState(ctx).slots[slot];
    if (!current.trackId) return;

    if (auto && current.mode === 'once') return stopSlot(ctx, slot);
    if (auto && current.mode === 'loop') {
        // La boucle repart du timecode de lancement (V-6), 0 sans timecode
        Object.assign(current, { status: 'playing', position: current.start ?? 0, refTime: Date.now() });
        return scheduleEnd(ctx, slot);
    }

    const ids = playlistIds(ctx, current.playlistId);
    let target;
    if (current.mode === 'shuffle') {
        target = ids.length ? pickRandom(ids, current.trackId) : undefined;
    } else {
        const index = ids.indexOf(current.trackId);
        // Avant le premier : le morceau en cours repart du début. Après le dernier : arrêt (Q-6)
        target = index === -1 ? undefined : ids[index + step] ?? (step < 0 ? current.trackId : undefined);
    }

    if (target === undefined || !playTrack(ctx, slot, target)) stopSlot(ctx, slot);
}

/** Commandes d'une piste : chacune modifie l'état et renvoie un message d'erreur, ou null. */
const SLOT_COMMANDS = {
    play(ctx, slot, { trackId, position }) {
        return playTrack(ctx, slot, trackId, position) ? null : 'Track not found in this table library';
    },
    playPlaylist(ctx, slot, { playlistId }) {
        if (!own(ctx, OWN_PLAYLIST, playlistId)) return 'Playlist not found in this table library';
        const ids = playlistIds(ctx, playlistId);
        if (ids.length === 0) return 'Playlist is empty';
        const mode = getState(ctx).slots[slot].mode;
        playTrack(ctx, slot, mode === 'shuffle' ? pickRandom(ids) : ids[0]);
        return null;
    },
    pause(ctx, slot) {
        const current = getState(ctx).slots[slot];
        if (current.status !== 'playing') return null;
        Object.assign(current, { status: 'paused', position: currentPosition(current), refTime: Date.now() });
        clearEndTimer(ctx, slot);
        return null;
    },
    resume(ctx, slot) {
        const current = getState(ctx).slots[slot];
        if (current.status !== 'paused') return null;
        Object.assign(current, { status: 'playing', refTime: Date.now() });
        scheduleEnd(ctx, slot);
        return null;
    },
    seek(ctx, slot, { position }) {
        const current = getState(ctx).slots[slot];
        if (!current.trackId) return null;
        const value = Number(position);
        if (!Number.isFinite(value)) return 'Invalid position';
        Object.assign(current, { position: Math.min(Math.max(0, value), current.duration ?? Infinity), refTime: Date.now() });
        scheduleEnd(ctx, slot);
        return null;
    },
    next(ctx, slot) {
        advance(ctx, slot, { step: 1 });
        return null;
    },
    previous(ctx, slot) {
        advance(ctx, slot, { step: -1 });
        return null;
    },
    stop(ctx, slot) {
        stopSlot(ctx, slot);
        return null;
    },
    mode(ctx, slot, { mode }) {
        if (!SLOTS[slot].modes.includes(mode)) return `Mode not allowed on ${slot}`;
        getState(ctx).slots[slot].mode = mode;
        return null;
    },
    // Remontées du lecteur du MJ : durée connue, la vidéo est lisible (§11.3)
    duration(ctx, slot, { trackId, duration }) {
        const current = getState(ctx).slots[slot];
        const value = Number(duration);
        if (current.trackId !== trackId || !Number.isFinite(value) || value <= 0) return null;
        current.duration = value;
        // Départ découvert au-delà de la fin : la boucle repartira du début, pas hors du morceau
        if (current.start >= value) current.start = 0;
        // Lisible, et sa durée s'affiche désormais dans la bibliothèque
        ctx.db.prepare('UPDATE audio_tracks SET unavailable = 0, duration = ? WHERE id = ?').run(value, trackId);
        scheduleEnd(ctx, slot);
        return null;
    },
    // Vidéo illisible chez le MJ : signalée, puis morceau suivant (Q-23)
    error(ctx, slot, { trackId }) {
        const current = getState(ctx).slots[slot];
        if (current.trackId !== trackId) return null;
        ctx.db.prepare('UPDATE audio_tracks SET unavailable = 1 WHERE id = ?').run(trackId);
        // Une vidéo en boucle ou un effet ne se relancent pas : arrêt
        if (current.mode === 'loop' || current.mode === 'once') stopSlot(ctx, slot);
        else advance(ctx, slot, { step: 1 });
        return null;
    },
};

function stopAll(ctx) {
    for (const slot of Object.keys(SLOTS)) stopSlot(ctx, slot);
}

// ─── Boutons préréglés (lot 2, spec_audio.md §12.6) ─────────────────────────

const MAX_BUTTONS = 5;
const LABEL_MAX = 40;
const OWN_BUTTON = 'SELECT * FROM audio_buttons WHERE id = ? AND slug = ? AND session_id = ?';
// Commandes qui changent le contenu : la dernière scène lancée n'est plus en cours
const CLEARS_LAST_BUTTON = new Set(['play', 'playPlaylist', 'next', 'previous', 'stop', 'stopAll']);

const parseActions = (row) => {
    try { return JSON.parse(row.actions); } catch { return null; }
};

/** Une entrée (piste d'une scène, ou bouton ciblé) dont le contenu est encore à la table ? */
function entryAvailable(ctx, entry) {
    if (entry.playlistId && (entry.mode === 'shuffle' || entry.shuffle || !entry.trackId)) {
        return !!own(ctx, OWN_PLAYLIST, entry.playlistId) && playlistIds(ctx, entry.playlistId).length > 0;
    }
    return !!own(ctx, OWN_TRACK, entry.trackId);
}

/** Bouton en erreur : contenu supprimé de la bibliothèque de la table. */
function buttonBroken(ctx, row) {
    const actions = parseActions(row);
    if (!actions) return true;
    if (row.mode === 'scene') return Object.values(actions.slots ?? {}).some(entry => entry && !entryAvailable(ctx, entry));
    return !entryAvailable(ctx, actions);
}

/** Boutons de la table, dans l'ordre (réponse de toutes les routes de boutons). */
function loadButtons(ctx) {
    return ctx.db.prepare('SELECT * FROM audio_buttons WHERE slug = ? AND session_id = ? ORDER BY position, id')
        .all(ctx.slug, ctx.sessionId)
        .map(row => ({ id: row.id, label: row.label, mode: row.mode, actions: parseActions(row), broken: buttonBroken(ctx, row) }));
}

/** Ce qui joue (en lecture ou en pause), pour une scène ; null si rien. */
function captureScene(ctx) {
    const slots = {};
    let any = false;
    for (const [slot, state] of Object.entries(getState(ctx).slots)) {
        slots[slot] = state.trackId ? { trackId: state.trackId, playlistId: state.playlistId, mode: state.mode } : null;
        any = any || !!state.trackId;
    }
    return any ? { slots } : null;
}

/**
 * Timecode d'un bouton sur un titre (§14.2), en secondes entières : undefined si absent
 * (depuis le début), NaN si illisible ; au-delà de la durée connue du titre, ramené à 0.
 */
function parseStart(track, value) {
    if (value === undefined || value === null || value === '') return undefined;
    // Un nombre seulement : true ou [83] ne passent pas par Number()
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return NaN;
    // Arrondi avant la comparaison : 299,8 s sur un titre de 300 s ne tombe pas pile à la fin
    const seconds = Math.round(value);
    return track.duration && seconds >= track.duration ? 0 : seconds;
}

/** Actions d'un bouton ciblé, vérifiées (§12.6) ; { error } si refusé. */
function targetActions(ctx, { slot, trackId, playlistId, shuffle, start }) {
    if (!SLOTS[slot]) return { error: `Unknown slot: ${slot}` };
    if (trackId) {
        const track = own(ctx, OWN_TRACK, trackId);
        if (!track) return { error: 'Track not found in this table library' };
        const seconds = parseStart(track, start);
        if (Number.isNaN(seconds)) return { error: 'Invalid start' };
        return seconds ? { slot, trackId: Number(trackId), start: seconds } : { slot, trackId: Number(trackId) };
    }
    if (start !== undefined && start !== null && start !== '') return { error: 'A playlist button has no start' };
    if (!own(ctx, OWN_PLAYLIST, playlistId)) return { error: 'Playlist not found in this table library' };
    if (slot === 'effect') return { error: 'A playlist cannot target the effect slot' };
    if (shuffle && slot !== 'music') return { error: 'Shuffle is only available on the music slot' };
    return { slot, playlistId: Number(playlistId), shuffle: !!shuffle };
}

/**
 * Lance une piste d'après une entrée : mode rétabli, depuis son timecode (`start`, 0 sinon) ;
 * au hasard en mode shuffle, toujours depuis le début.
 */
function runEntry(ctx, slot, entry) {
    const mode = entry.shuffle ? 'shuffle' : entry.mode ?? (entry.playlistId && !entry.trackId ? 'playlist' : null);
    if (mode && SLOTS[slot].modes.includes(mode)) getState(ctx).slots[slot].mode = mode;
    const fromPlaylist = entry.playlistId && (mode === 'shuffle' || !entry.trackId);
    const ok = fromPlaylist
        ? !SLOT_COMMANDS.playPlaylist(ctx, slot, { playlistId: entry.playlistId })
        : playTrack(ctx, slot, entry.trackId, entry.start ?? 0);
    if (!ok) stopSlot(ctx, slot);
}

/** Exécute un bouton : scène (toutes les pistes) ou ciblé (sa piste seulement). */
function runButton(ctx, row) {
    const actions = parseActions(row);
    if (row.mode === 'scene') {
        for (const slot of Object.keys(SLOTS)) {
            const entry = actions.slots?.[slot];
            if (entry) runEntry(ctx, slot, entry);
            else stopSlot(ctx, slot);
        }
    } else {
        runEntry(ctx, actions.slot, actions);
    }
    getState(ctx).lastButtonId = row.id;
}

/** Le contenu visé par une entrée existe-t-il encore à la table (sans regarder si une playlist est vide) ? */
function entryExists(ctx, entry) {
    if (!entry) return false;
    const usesPlaylist = entry.playlistId && (entry.mode === 'shuffle' || entry.shuffle || !entry.trackId);
    return usesPlaylist ? !!own(ctx, OWN_PLAYLIST, entry.playlistId) : !!own(ctx, OWN_TRACK, entry.trackId);
}

/**
 * Ménage après une suppression de titre, de playlist ou de collection (§12.7) :
 * bouton ciblé dont le contenu a disparu → supprimé ; scène → la piste disparue est
 * retirée (elle sera arrêtée au lancement), la scène supprimée s'il ne lui reste rien.
 * Signale le changement aux clients du MJ s'il y en a un.
 */
function pruneButtons(ctx) {
    const rows = ctx.db.prepare('SELECT * FROM audio_buttons WHERE slug = ? AND session_id = ?').all(ctx.slug, ctx.sessionId);
    const remove = ctx.db.prepare('DELETE FROM audio_buttons WHERE id = ?');
    const update = ctx.db.prepare('UPDATE audio_buttons SET actions = ? WHERE id = ?');
    let changed = false;

    ctx.db.transaction(() => {
        for (const row of rows) {
            const actions = parseActions(row);
            if (!actions) continue;
            if (row.mode === 'target') {
                if (!entryExists(ctx, actions)) { remove.run(row.id); changed = true; }
                continue;
            }
            const slots = { ...actions.slots };
            let dropped = false;
            for (const [slot, entry] of Object.entries(slots)) {
                if (entry && !entryExists(ctx, entry)) { slots[slot] = null; dropped = true; }
            }
            if (!dropped) continue;
            if (Object.values(slots).some(Boolean)) update.run(JSON.stringify({ ...actions, slots }), row.id);
            else remove.run(row.id);
            changed = true;
        }
    })();

    if (!changed) return;
    const state = getState(ctx);
    if (state.lastButtonId && !ctx.db.prepare(OWN_BUTTON).get(state.lastButtonId, ctx.slug, ctx.sessionId)) state.lastButtonId = null;
    notifyButtons(ctx);
}

/** Les boutons ont changé : les clients du MJ relisent la liste (les noms ne partent pas dans la room). */
function notifyButtons(ctx) {
    ctx.io?.to(`${ctx.slug}_session_${ctx.sessionId}`).emit('audio-buttons-changed', { system: ctx.slug, sessionId: ctx.sessionId });
}

// ─── Table de la requête ────────────────────────────────────────────────────

// Toutes les routes passent par /sessions/:sid : la table fixe le propriétaire
router.param('sid', (req, res, next, sid) => {
    try {
        const sessionId = Number(sid);
        if (!Number.isInteger(sessionId) || !req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const slug = req.system.slug;
        req.audio = { db: audioDb(), slug, sessionId, key: stateKey(slug, sessionId), io: req.app.get('io') };
        next();
    } catch (error) {
        console.error('Error resolving audio session:', error);
        res.status(500).json({ error: 'Failed to open audio session' });
    }
});

const gm = [authenticate, requireGM];

/** Enveloppe commune des routes de bibliothèque : erreurs, et bibliothèque à jour en réponse. */
const libraryRoute = (label, handler) => async (req, res) => {
    try {
        const result = await handler(req.audio, req.body ?? {}, req.params);
        if (result?.status) return res.status(result.status).json({ error: result.error });
        res.status(result?.created ? 201 : 200).json(loadLibrary(req.audio));
    } catch (error) {
        console.error(`Error (${label}):`, error);
        res.status(500).json({ error: `Failed to ${label}` });
    }
};

const notFound = (what) => ({ status: 404, error: `${what} not found` });
const invalid = (error) => ({ status: 400, error });

// ─── Routes : lecture de la table ───────────────────────────────────────────

// Activation, réglages et état de lecture, pour qui arrive en cours de route (MJ et joueurs)
router.get('/sessions/:sid', authenticate, (req, res) => {
    try {
        const ctx = req.audio;
        res.json({ ...getSettings(ctx), tolerance: syncTolerance(), state: getState(ctx), serverTime: Date.now() });
    } catch (error) {
        console.error('Error loading audio session:', error);
        res.status(500).json({ error: 'Failed to load audio session' });
    }
});

// Activer / désactiver la musique de la table (T-2) ; désactiver arrête tout (P-4)
router.put('/sessions/:sid/enabled', ...gm, (req, res) => {
    try {
        const ctx = req.audio;
        const enabled = !!req.body.enabled;
        saveSettings(ctx, { enabled });
        if (!enabled) {
            stopAll(ctx);
            broadcastState(ctx);
        }
        ctx.io?.to(`${ctx.slug}_session_${ctx.sessionId}`).emit('audio-enabled', { system: ctx.slug, sessionId: ctx.sessionId, enabled });
        res.json({ ...getSettings(ctx), tolerance: syncTolerance(), state: getState(ctx), serverTime: Date.now() });
    } catch (error) {
        console.error('Error toggling session audio:', error);
        res.status(500).json({ error: 'Failed to toggle session audio' });
    }
});

// Commandes de lecture du MJ (§11.4)
router.post('/sessions/:sid/command', ...gm, (req, res) => {
    try {
        const ctx = req.audio;
        const { slot, action, ...payload } = req.body;
        if (!getSettings(ctx).enabled) return res.status(409).json({ error: 'Audio is disabled for this session' });

        if (action === 'stopAll') {
            stopAll(ctx);
        } else if (action === 'settings') {
            saveSettings(ctx, { hideTitle: !!payload.hideTitle });
        } else if (SLOT_COMMANDS[action]) {
            if (!SLOTS[slot]) return res.status(400).json({ error: `Unknown slot: ${slot}` });
            const error = SLOT_COMMANDS[action](ctx, slot, payload);
            if (error) return res.status(400).json({ error });
        } else {
            return res.status(400).json({ error: `Unknown action: ${action}` });
        }
        // Le contenu a changé : la dernière scène lancée n'est plus « en cours » (§12.6)
        if (CLEARS_LAST_BUTTON.has(action)) getState(ctx).lastButtonId = null;

        // La durée ne change rien pour les clients : pas de diffusion
        if (action !== 'duration') broadcastState(ctx);
        res.json({ ...getSettings(ctx), state: getState(ctx), serverTime: Date.now() });
    } catch (error) {
        console.error('Error running audio command:', error);
        res.status(500).json({ error: 'Failed to run audio command' });
    }
});

// ─── Routes : bibliothèque et catalogue (MJ) ────────────────────────────────

// Ma bibliothèque ; ménage des tables disparues du slug au passage (P2-1)
router.get('/sessions/:sid/library', ...gm, (req, res) => {
    try {
        purgeDeletedTables(req.audio, req.db);
        res.json(loadLibrary(req.audio));
    } catch (error) {
        console.error('Error loading audio library:', error);
        res.status(500).json({ error: 'Failed to load audio library' });
    }
});

router.get('/sessions/:sid/catalog', ...gm, (req, res) => {
    try {
        res.json(loadCatalog(req.audio));
    } catch (error) {
        console.error('Error loading audio catalog:', error);
        res.status(500).json({ error: 'Failed to load audio catalog' });
    }
});

// Collections — /order déclarée avant /:id
router.put('/sessions/:sid/collections/order', ...gm, libraryRoute('reorder collections', (ctx, { ids }) => {
    if (!reorder(ctx.db, 'audio_collections', ids, 'slug = ? AND session_id = ?', [ctx.slug, ctx.sessionId])) return invalid('ids must be an array');
}));

// Nom facultatif : « Collection n » par défaut
router.post('/sessions/:sid/collections', ...gm, libraryRoute('create collection', (ctx, { name }) => {
    createCollection(ctx, name);
    return { created: true };
}));

router.put('/sessions/:sid/collections/:id/order', ...gm, libraryRoute('reorder playlists', (ctx, { playlistIds }, { id }) => {
    if (!own(ctx, OWN_COLLECTION, id)) return notFound('Collection');
    if (!reorder(ctx.db, 'audio_playlists', playlistIds, 'collection_id = ?', [id])) return invalid('playlistIds must be an array');
}));

// Renommer, changer le niveau de partage (S-2, S-3)
router.put('/sessions/:sid/collections/:id', ...gm, libraryRoute('update collection', (ctx, { name, visibility }, { id }) => {
    if (!own(ctx, OWN_COLLECTION, id)) return notFound('Collection');
    if (name !== undefined && !isText(name)) return invalid('Name cannot be empty');
    if (visibility !== undefined && !VISIBILITIES.includes(visibility)) return invalid('Invalid visibility');
    ctx.db.prepare(`
        UPDATE audio_collections SET name = COALESCE(?, name), visibility = COALESCE(?, visibility), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(name?.trim() ?? null, visibility ?? null, id);
}));

router.delete('/sessions/:sid/collections/:id', ...gm, libraryRoute('delete collection', (ctx, _body, { id }) => {
    if (!own(ctx, OWN_COLLECTION, id)) return notFound('Collection');
    ctx.db.transaction(() => deleteCollections(ctx.db, 'id = ?', [id]))();
    pruneButtons(ctx);
}));

// Copie d'une collection (publique ou à moi) dans ma table, en privé (T-1)
router.post('/sessions/:sid/collections/:id/copy', ...gm, libraryRoute('copy collection', (ctx, _body, { id }) => {
    const source = readable(ctx, READABLE_COLLECTION, id);
    if (!source) return notFound('Collection');
    ctx.db.transaction(() => {
        const { lastInsertRowid } = ctx.db.prepare('INSERT INTO audio_collections (slug, session_id, name, position) VALUES (?, ?, ?, ?)')
            .run(ctx.slug, ctx.sessionId, source.name, nextPosition(ctx.db, 'audio_collections', 'slug = ? AND session_id = ?', [ctx.slug, ctx.sessionId]));
        const playlists = ctx.db.prepare('SELECT * FROM audio_playlists WHERE collection_id = ? ORDER BY position, id').all(source.id);
        for (const playlist of playlists) copyPlaylist(ctx.db, playlist, lastInsertRowid);
    })();
    return { created: true };
}));

// Playlists
// Création en un appel, pour coller un lien sans étape préalable : collection facultative
// (la première de la table, créée au besoin), nom facultatif (titre de la playlist YouTube
// importée, sinon « Playlist n »), vidéos facultatives (listId : playlist YouTube importée),
// liens d'autres plateformes facultatifs (links, §14.3), résolus avant toute écriture
router.post('/sessions/:sid/playlists', ...gm, libraryRoute('create playlist', async (ctx, { collectionId, name, listId, videoIds, links }) => {
    const ids = Array.isArray(videoIds) ? videoIds.filter(v => YOUTUBE_ID.test(v)) : [];
    const urls = linkList(links);
    if (!urls) return invalid(INVALID_LINKS);
    const resolved = await resolveItems(ids, urls);
    if (resolved.error) return invalid(resolved.error);

    let collection = collectionId;
    if (collection !== undefined && collection !== null) {
        if (!own(ctx, OWN_COLLECTION, collection)) return notFound('Collection');
    } else {
        collection = ctx.db.prepare('SELECT id FROM audio_collections WHERE slug = ? AND session_id = ? ORDER BY position, id LIMIT 1')
            .get(ctx.slug, ctx.sessionId)?.id ?? createCollection(ctx);
    }

    const listTitle = !isText(name) && typeof listId === 'string' ? await fetchPlaylistTitle(listId) : null;
    const playlistName = isText(name) ? name.trim() : listTitle ?? defaultName(ctx.db, 'Playlist', 'audio_playlists', 'collection_id = ?', [collection]);
    const { lastInsertRowid } = ctx.db.prepare('INSERT INTO audio_playlists (collection_id, name, position) VALUES (?, ?, ?)')
        .run(collection, playlistName, nextPosition(ctx.db, 'audio_playlists', 'collection_id = ?', [collection]));

    if (resolved.items.length) addTracks(ctx, lastInsertRowid, resolved.items);
    return { created: true };
}));

router.put('/sessions/:sid/playlists/:id/order', ...gm, libraryRoute('reorder tracks', (ctx, { trackIds }, { id }) => {
    if (!own(ctx, OWN_PLAYLIST, id)) return notFound('Playlist');
    if (!reorder(ctx.db, 'audio_tracks', trackIds, 'playlist_id = ?', [id])) return invalid('trackIds must be an array');
}));

// Renommer, choisir sa piste par défaut (§11.15), ou déplacer vers une autre de mes collections, en fin de liste
router.put('/sessions/:sid/playlists/:id', ...gm, libraryRoute('update playlist', (ctx, { name, collectionId, defaultSlot }, { id }) => {
    const playlist = own(ctx, OWN_PLAYLIST, id);
    if (!playlist) return notFound('Playlist');
    if (name !== undefined && !isText(name)) return invalid('Name cannot be empty');
    if (defaultSlot !== undefined && !SLOTS[defaultSlot]) return invalid(`Unknown slot: ${defaultSlot}`);

    let target = playlist.collection_id;
    let position = null;
    if (collectionId !== undefined && Number(collectionId) !== playlist.collection_id) {
        if (!own(ctx, OWN_COLLECTION, collectionId)) return notFound('Collection');
        target = Number(collectionId);
        position = nextPosition(ctx.db, 'audio_playlists', 'collection_id = ?', [target]);
    }
    ctx.db.prepare(`
        UPDATE audio_playlists SET name = COALESCE(?, name), default_slot = COALESCE(?, default_slot), collection_id = ?, position = COALESCE(?, position)
        WHERE id = ?
    `).run(name?.trim() ?? null, defaultSlot ?? null, target, position, playlist.id);
}));

router.delete('/sessions/:sid/playlists/:id', ...gm, libraryRoute('delete playlist', (ctx, _body, { id }) => {
    if (!own(ctx, OWN_PLAYLIST, id)) return notFound('Playlist');
    ctx.db.transaction(() => {
        ctx.db.prepare('DELETE FROM audio_tracks WHERE playlist_id = ?').run(id);
        ctx.db.prepare('DELETE FROM audio_playlists WHERE id = ?').run(id);
    })();
    pruneButtons(ctx);
}));

// Copie d'une playlist (publique ou à moi) dans une de mes collections (S-3)
router.post('/sessions/:sid/playlists/:id/copy', ...gm, libraryRoute('copy playlist', (ctx, { collectionId }, { id }) => {
    const source = readable(ctx, READABLE_PLAYLIST, id);
    if (!source) return notFound('Playlist');
    if (!own(ctx, OWN_COLLECTION, collectionId)) return notFound('Collection');
    ctx.db.transaction(() => copyPlaylist(ctx.db, source, Number(collectionId)))();
    return { created: true };
}));

// Ajout d'un ou plusieurs titres : vidéos YouTube (lien simple ou playlist importée, Q-21, Q-22)
// ou liens d'autres plateformes (links, §14.3)
router.post('/sessions/:sid/playlists/:id/tracks', ...gm, libraryRoute('add tracks', async (ctx, { videoIds, links }, { id }) => {
    const ids = Array.isArray(videoIds) ? videoIds.filter(v => YOUTUBE_ID.test(v)) : [];
    const urls = linkList(links);
    if (!urls) return invalid(INVALID_LINKS);
    if (ids.length === 0 && urls.length === 0) return invalid('Aucun lien valide');
    if (!own(ctx, OWN_PLAYLIST, id)) return notFound('Playlist');
    const resolved = await resolveItems(ids, urls);
    if (resolved.error) return invalid(resolved.error);
    addTracks(ctx, id, resolved.items);
    return { created: true };
}));

// Vidéos : renommer, régler le gain (S-15), ou déplacer vers une autre de mes playlists
// Durées relevées par le lecteur caché du panneau MJ, pour l'affichage (§11.14) — déclarée avant /:id
router.put('/sessions/:sid/tracks/durations', ...gm, libraryRoute('save durations', (ctx, { durations }) => {
    if (!Array.isArray(durations)) return invalid('durations must be an array');
    const update = ctx.db.prepare(`
        UPDATE audio_tracks SET duration = ?
        WHERE id = ? AND playlist_id IN (
            SELECT p.id FROM audio_playlists p JOIN audio_collections c ON c.id = p.collection_id
            WHERE c.slug = ? AND c.session_id = ?)
    `);
    ctx.db.transaction(() => {
        for (const { id, duration } of durations) {
            const value = Number(duration);
            if (Number.isFinite(value) && value > 0) update.run(value, id, ctx.slug, ctx.sessionId);
        }
    })();
}));

router.put('/sessions/:sid/tracks/:id', ...gm, libraryRoute('update track', (ctx, { title, gain, playlistId }, { id }) => {
    const track = own(ctx, OWN_TRACK, id);
    if (!track) return notFound('Track');
    if (title !== undefined && !isText(title)) return invalid('Title cannot be empty');
    const gainValue = gain === undefined ? null : Math.round(Number(gain));
    if (gainValue !== null && !(gainValue >= 0 && gainValue <= 100)) return invalid('Gain must be between 0 and 100');

    let target = track.playlist_id;
    let position = null;
    if (playlistId !== undefined && Number(playlistId) !== track.playlist_id) {
        if (!own(ctx, OWN_PLAYLIST, playlistId)) return notFound('Playlist');
        target = Number(playlistId);
        position = nextPosition(ctx.db, 'audio_tracks', 'playlist_id = ?', [target]);
    }
    ctx.db.prepare(`
        UPDATE audio_tracks SET title = COALESCE(?, title), gain = COALESCE(?, gain), playlist_id = ?, position = COALESCE(?, position)
        WHERE id = ?
    `).run(title?.trim() ?? null, gainValue, target, position, track.id);
}));

// Copie d'une vidéo (publique ou à moi) dans une de mes playlists
router.post('/sessions/:sid/tracks/:id/copy', ...gm, libraryRoute('copy track', (ctx, { playlistId }, { id }) => {
    const source = readable(ctx, READABLE_TRACK, id);
    if (!source) return notFound('Track');
    if (!own(ctx, OWN_PLAYLIST, playlistId)) return notFound('Playlist');
    ctx.db.prepare('INSERT INTO audio_tracks (playlist_id, source, media_id, title, gain, duration, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(playlistId, source.source, source.media_id, source.title, source.gain, source.duration, nextPosition(ctx.db, 'audio_tracks', 'playlist_id = ?', [playlistId]));
    return { created: true };
}));

router.delete('/sessions/:sid/tracks/:id', ...gm, libraryRoute('delete track', (ctx, _body, { id }) => {
    if (!own(ctx, OWN_TRACK, id)) return notFound('Track');
    ctx.db.prepare('DELETE FROM audio_tracks WHERE id = ?').run(id);
    pruneButtons(ctx);
}));

// ─── Routes : boutons préréglés (MJ, lot 2, §12.6) ──────────────────────────

/** Enveloppe des routes de boutons : erreurs, signal aux clients du MJ, liste à jour en réponse. */
const buttonsRoute = (label, handler, { write = true } = {}) => async (req, res) => {
    try {
        const result = await handler(req.audio, req.body ?? {}, req.params);
        if (result?.status) return res.status(result.status).json({ error: result.error });
        if (write) notifyButtons(req.audio);
        res.status(result?.created ? 201 : 200).json(loadButtons(req.audio));
    } catch (error) {
        console.error(`Error (${label}):`, error);
        res.status(500).json({ error: `Failed to ${label}` });
    }
};

const buttonLabel = (label) => (isText(label) ? label.trim().slice(0, LABEL_MAX) : null);

router.get('/sessions/:sid/buttons', ...gm, buttonsRoute('load buttons', () => null, { write: false }));

// Créer : scène (ce qui joue, lu dans l'état du serveur) ou ciblé ; 5 au plus
router.post('/sessions/:sid/buttons', ...gm, buttonsRoute('create button', (ctx, { label, mode, ...target }) => {
    const name = buttonLabel(label);
    if (!name) return invalid('Label required');
    const count = ctx.db.prepare('SELECT COUNT(*) AS n FROM audio_buttons WHERE slug = ? AND session_id = ?').get(ctx.slug, ctx.sessionId).n;
    if (count >= MAX_BUTTONS) return { status: 409, error: `${MAX_BUTTONS} buttons at most` };

    let actions;
    if (mode === 'scene') {
        actions = captureScene(ctx);
        if (!actions) return invalid('Nothing is playing');
    } else if (mode === 'target') {
        actions = targetActions(ctx, target);
        if (actions.error) return invalid(actions.error);
    } else {
        return invalid(`Unknown mode: ${mode}`);
    }

    ctx.db.prepare('INSERT INTO audio_buttons (slug, session_id, label, position, mode, actions) VALUES (?, ?, ?, ?, ?, ?)')
        .run(ctx.slug, ctx.sessionId, name, nextPosition(ctx.db, 'audio_buttons', 'slug = ? AND session_id = ?', [ctx.slug, ctx.sessionId]), mode, JSON.stringify(actions));
    return { created: true };
}));

// Avant /buttons/:id
router.put('/sessions/:sid/buttons/order', ...gm, buttonsRoute('reorder buttons', (ctx, { ids }) => {
    if (!reorder(ctx.db, 'audio_buttons', ids, 'slug = ? AND session_id = ?', [ctx.slug, ctx.sessionId])) return invalid('ids must be an array');
}));

/**
 * Timecodes modifiés d'un bouton (§14.2) : `start` pour un bouton ciblé sur un titre,
 * `starts` ({ piste: secondes | null }) pour une scène ; null ou vide = depuis le début.
 * Renvoie les actions à jour, ou { error }.
 */
function withStarts(ctx, row, { start, starts }) {
    const actions = parseActions(row);
    if (!actions) return { error: 'Invalid button' };
    const setStart = (entry, value) => {
        if (!entry?.trackId || entry.mode === 'shuffle' || entry.shuffle) return 'Only a track can have a start';
        const track = own(ctx, OWN_TRACK, entry.trackId);
        if (!track) return 'Track not found in this table library';
        const seconds = parseStart(track, value);
        if (Number.isNaN(seconds)) return 'Invalid start';
        if (seconds) entry.start = seconds;
        else delete entry.start;
        return null;
    };

    if (row.mode === 'target') {
        if (start === undefined) return { actions };
        const error = setStart(actions, start);
        return error ? { error } : { actions };
    }
    if (starts === undefined) return { actions };
    if (!starts || typeof starts !== 'object' || Array.isArray(starts)) return { error: 'starts must be an object' };
    for (const [slot, value] of Object.entries(starts)) {
        if (!SLOTS[slot]) return { error: `Unknown slot: ${slot}` };
        const error = setStart(actions.slots?.[slot], value);
        if (error) return { error };
    }
    return { actions };
}

// Renommer ; capture : remplacer une scène par ce qui joue ; start / starts : timecodes (§14.2)
router.put('/sessions/:sid/buttons/:id', ...gm, buttonsRoute('update button', (ctx, { label, capture, start, starts }, { id }) => {
    const row = own(ctx, OWN_BUTTON, id);
    if (!row) return notFound('Button');
    if (start !== undefined || starts !== undefined) {
        const timed = withStarts(ctx, row, { start, starts });
        if (timed.error) return invalid(timed.error);
        ctx.db.prepare('UPDATE audio_buttons SET actions = ? WHERE id = ?').run(JSON.stringify(timed.actions), id);
    }
    if (label !== undefined) {
        const name = buttonLabel(label);
        if (!name) return invalid('Label required');
        ctx.db.prepare('UPDATE audio_buttons SET label = ? WHERE id = ?').run(name, id);
    }
    if (capture) {
        if (row.mode !== 'scene') return invalid('Only a scene can be replaced by what is playing');
        const actions = captureScene(ctx);
        if (!actions) return invalid('Nothing is playing');
        ctx.db.prepare('UPDATE audio_buttons SET actions = ? WHERE id = ?').run(JSON.stringify(actions), id);
    }
}));

router.delete('/sessions/:sid/buttons/:id', ...gm, buttonsRoute('delete button', (ctx, _body, { id }) => {
    if (!own(ctx, OWN_BUTTON, id)) return notFound('Button');
    ctx.db.prepare('DELETE FROM audio_buttons WHERE id = ?').run(id);
    if (getState(ctx).lastButtonId === Number(id)) getState(ctx).lastButtonId = null;
}));

// Lancer un bouton : une seule diffusion à la fin
router.post('/sessions/:sid/buttons/:id/run', ...gm, (req, res) => {
    try {
        const ctx = req.audio;
        if (!getSettings(ctx).enabled) return res.status(409).json({ error: 'Audio is disabled for this session' });
        const row = own(ctx, OWN_BUTTON, req.params.id);
        if (!row) return res.status(404).json({ error: 'Button not found' });
        if (buttonBroken(ctx, row)) return res.status(422).json({ error: 'Button content was deleted' });

        runButton(ctx, row);
        broadcastState(ctx);
        res.json({ ...getSettings(ctx), state: getState(ctx), serverTime: Date.now() });
    } catch (error) {
        console.error('Error running audio button:', error);
        res.status(500).json({ error: 'Failed to run audio button' });
    }
});

module.exports = router;
