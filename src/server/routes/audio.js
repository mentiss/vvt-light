// src/server/routes/audio.js
// ─────────────────────────────────────────────────────────────────────────────
// Brique audio synchronisée (documentations/spec_audio.md §9) : route partagée,
// montée pour chaque système sur /api/:slug/audio.
//
// - Bibliothèque du MJ (collections → playlists → vidéos YouTube), par slug.
// - Activation par session (game_sessions.audio_enabled).
// - État de lecture en mémoire (sharedState.audioStates), seule source de vérité :
//   chaque commande du MJ le modifie puis le diffuse à la room de la session
//   (audio-state). Les clients ne font que l'appliquer à leur lecteur YouTube.
//
// Les clés étrangères ne sont pas activées sur les connexions : les suppressions
// effacent explicitement les lignes filles, en transaction.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { authenticate, requireGM } = require('../middlewares/auth');
const { sharedState } = require('../socket/index');
const { getDbForSystem } = require('../db');
const { getConfigForSystem } = require('../systems/Loader');

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const OEMBED_URL = 'https://www.youtube.com/oembed?format=json&url=';
const OEMBED_BATCH = 8;          // requêtes oEmbed simultanées à l'import d'une playlist
const END_MARGIN_MS = 1000;      // marge avant de passer au morceau suivant

// Minuteurs de fin de morceau, par clé d'état (hors de l'état diffusé)
const endTimers = new Map();

// ─── Bibliothèque ───────────────────────────────────────────────────────────

/** Bibliothèque complète, triée : [{ id, name, playlists: [{ id, name, tracks: [...] }] }] */
function loadLibrary(db) {
    const collections = db.prepare('SELECT id, name FROM audio_collections ORDER BY position, id').all();
    const playlists = db.prepare('SELECT id, collection_id, name FROM audio_playlists ORDER BY position, id').all();
    const tracks = db.prepare('SELECT id, playlist_id, youtube_id, title, unavailable FROM audio_tracks ORDER BY position, id').all();

    const tracksByPlaylist = new Map();
    for (const t of tracks) {
        if (!tracksByPlaylist.has(t.playlist_id)) tracksByPlaylist.set(t.playlist_id, []);
        tracksByPlaylist.get(t.playlist_id).push({ id: t.id, youtubeId: t.youtube_id, title: t.title, unavailable: !!t.unavailable });
    }

    const playlistsByCollection = new Map();
    for (const p of playlists) {
        if (!playlistsByCollection.has(p.collection_id)) playlistsByCollection.set(p.collection_id, []);
        playlistsByCollection.get(p.collection_id).push({ id: p.id, name: p.name, tracks: tracksByPlaylist.get(p.id) ?? [] });
    }

    return collections.map(c => ({ id: c.id, name: c.name, playlists: playlistsByCollection.get(c.id) ?? [] }));
}

/** Position suivant la dernière ligne d'un parent (fin de liste). */
function nextPosition(db, table, parentColumn, parentId) {
    const where = parentColumn ? `WHERE ${parentColumn} = ?` : '';
    const row = db.prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM ${table} ${where}`).get(...(parentColumn ? [parentId] : []));
    return row.pos;
}

/** Réécrit l'ordre d'une liste d'ids (glisser-déposer), limité aux lignes du parent. */
function reorder(db, table, ids, parentColumn, parentId) {
    if (!Array.isArray(ids)) return false;
    const where = parentColumn ? ` AND ${parentColumn} = ?` : '';
    const stmt = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?${where}`);
    db.transaction(() => {
        ids.forEach((id, index) => stmt.run(index, id, ...(parentColumn ? [parentId] : [])));
    })();
    return true;
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

const isText = (value) => typeof value === 'string' && value.trim().length > 0;

// ─── État de lecture ────────────────────────────────────────────────────────

const stateKey = (slug, sessionId) => `${slug}_${sessionId}`;

const STOPPED = { status: 'stopped', trackId: null, youtubeId: null, title: null, playlistId: null, playlistName: null, position: 0, refTime: 0, duration: null };

function getState(slug, sessionId) {
    const key = stateKey(slug, sessionId);
    if (!sharedState.audioStates.has(key)) sharedState.audioStates.set(key, { ...STOPPED, hideTitle: false });
    return sharedState.audioStates.get(key);
}

/** Position courante (secondes) d'un état, à l'instant présent. */
function currentPosition(state) {
    return state.status === 'playing' ? state.position + (Date.now() - state.refTime) / 1000 : state.position;
}

function clearEndTimer(key) {
    if (endTimers.has(key)) {
        clearTimeout(endTimers.get(key));
        endTimers.delete(key);
    }
}

/** Arme le passage au morceau suivant si la vidéo joue et que sa durée est connue (Q-6). */
function scheduleEnd(io, slug, sessionId) {
    const key = stateKey(slug, sessionId);
    clearEndTimer(key);
    const state = getState(slug, sessionId);
    if (state.status !== 'playing' || !state.duration) return;

    const remainingMs = Math.max(0, (state.duration - currentPosition(state)) * 1000) + END_MARGIN_MS;
    const trackId = state.trackId;
    endTimers.set(key, setTimeout(() => {
        endTimers.delete(key);
        // Le MJ a pu changer de morceau entre-temps
        if (getState(slug, sessionId).trackId !== trackId) return;
        // Hors requête : une erreur non rattrapée ferait tomber le serveur
        try {
            const db = getDbForSystem(getConfigForSystem(slug));
            playAdjacent(io, db, slug, sessionId, 1);
        } catch (error) {
            console.error('Error moving to next audio track:', error);
        }
    }, remainingMs));
}

function broadcastState(io, slug, sessionId) {
    io?.to(`${slug}_session_${sessionId}`).emit('audio-state', {
        system: slug,
        sessionId: Number(sessionId),
        state: getState(slug, sessionId),
        serverTime: Date.now(),
    });
}

/** Lance une vidéo de la bibliothèque à la position donnée. Renvoie false si elle n'existe plus. */
function playTrack(db, slug, sessionId, trackId, position = 0) {
    const track = db.prepare(`
        SELECT t.id, t.youtube_id, t.title, p.id AS playlist_id, p.name AS playlist_name
        FROM audio_tracks t JOIN audio_playlists p ON p.id = t.playlist_id
        WHERE t.id = ?
    `).get(trackId);
    if (!track) return false;

    Object.assign(getState(slug, sessionId), {
        status: 'playing',
        trackId: track.id,
        youtubeId: track.youtube_id,
        title: track.title,
        playlistId: track.playlist_id,
        playlistName: track.playlist_name,
        position: Math.max(0, Number(position) || 0),
        refTime: Date.now(),
        duration: null,
    });
    return true;
}

function stop(slug, sessionId) {
    clearEndTimer(stateKey(slug, sessionId));
    Object.assign(getState(slug, sessionId), STOPPED);
}

/**
 * Morceau voisin dans la playlist du morceau en cours (Q-25) : step = 1 (suivant) ou -1 (précédent).
 * Après le dernier : arrêt (Q-6). Avant le premier : le morceau en cours repart du début.
 * La playlist est relue en base, donc à jour des modifications faites pendant la lecture.
 */
function playAdjacent(io, db, slug, sessionId, step) {
    const state = getState(slug, sessionId);
    if (!state.trackId) return;

    const ids = db.prepare('SELECT id FROM audio_tracks WHERE playlist_id = ? ORDER BY position, id').all(state.playlistId).map(r => r.id);
    const index = ids.indexOf(state.trackId);
    const target = index === -1 ? undefined : ids[index + step] ?? (step < 0 ? state.trackId : undefined);

    if (target === undefined || !playTrack(db, slug, sessionId, target)) stop(slug, sessionId);
    else clearEndTimer(stateKey(slug, sessionId));
    broadcastState(io, slug, sessionId);
}

/** Commandes de lecture : chacune modifie l'état et renvoie un message d'erreur, ou null. */
const COMMANDS = {
    play(ctx, { trackId, position }) {
        if (!playTrack(ctx.db, ctx.slug, ctx.sessionId, trackId, position)) return 'Track not found';
        clearEndTimer(ctx.key);
        return null;
    },
    pause(ctx) {
        const state = getState(ctx.slug, ctx.sessionId);
        if (state.status !== 'playing') return null;
        Object.assign(state, { status: 'paused', position: currentPosition(state), refTime: Date.now() });
        clearEndTimer(ctx.key);
        return null;
    },
    resume(ctx) {
        const state = getState(ctx.slug, ctx.sessionId);
        if (state.status !== 'paused') return null;
        Object.assign(state, { status: 'playing', refTime: Date.now() });
        scheduleEnd(ctx.io, ctx.slug, ctx.sessionId);
        return null;
    },
    seek(ctx, { position }) {
        const state = getState(ctx.slug, ctx.sessionId);
        if (!state.trackId) return null;
        const value = Number(position);
        if (!Number.isFinite(value)) return 'Invalid position';
        const max = state.duration ?? Infinity;
        Object.assign(state, { position: Math.min(Math.max(0, value), max), refTime: Date.now() });
        scheduleEnd(ctx.io, ctx.slug, ctx.sessionId);
        return null;
    },
    stop(ctx) {
        stop(ctx.slug, ctx.sessionId);
        return null;
    },
    settings(ctx, { hideTitle }) {
        getState(ctx.slug, ctx.sessionId).hideTitle = !!hideTitle;
        return null;
    },
    // Remontée du lecteur du MJ : durée connue, la vidéo est lisible (§9.3)
    duration(ctx, { trackId, duration }) {
        const state = getState(ctx.slug, ctx.sessionId);
        const value = Number(duration);
        if (state.trackId !== trackId || !Number.isFinite(value) || value <= 0) return null;
        state.duration = value;
        ctx.db.prepare('UPDATE audio_tracks SET unavailable = 0 WHERE id = ?').run(trackId);
        scheduleEnd(ctx.io, ctx.slug, ctx.sessionId);
        return null;
    },
};

// ─── Routes : bibliothèque (MJ) ─────────────────────────────────────────────

router.get('/library', authenticate, requireGM, (req, res) => {
    try {
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error loading audio library:', error);
        res.status(500).json({ error: 'Failed to load audio library' });
    }
});

// Collections — /order déclarée avant /:id
router.put('/collections/order', authenticate, requireGM, (req, res) => {
    try {
        if (!reorder(req.db, 'audio_collections', req.body.ids)) return res.status(400).json({ error: 'ids must be an array' });
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error reordering audio collections:', error);
        res.status(500).json({ error: 'Failed to reorder collections' });
    }
});

router.post('/collections', authenticate, requireGM, (req, res) => {
    try {
        const { name } = req.body;
        if (!isText(name)) return res.status(400).json({ error: 'Name is required' });
        req.db.prepare('INSERT INTO audio_collections (name, position) VALUES (?, ?)')
            .run(name.trim(), nextPosition(req.db, 'audio_collections'));
        res.status(201).json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error creating audio collection:', error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

router.put('/collections/:id/order', authenticate, requireGM, (req, res) => {
    try {
        if (!reorder(req.db, 'audio_playlists', req.body.playlistIds, 'collection_id', req.params.id)) {
            return res.status(400).json({ error: 'playlistIds must be an array' });
        }
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error reordering audio playlists:', error);
        res.status(500).json({ error: 'Failed to reorder playlists' });
    }
});

router.put('/collections/:id', authenticate, requireGM, (req, res) => {
    try {
        const { name } = req.body;
        if (!isText(name)) return res.status(400).json({ error: 'Name is required' });
        const result = req.db.prepare('UPDATE audio_collections SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Collection not found' });
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error renaming audio collection:', error);
        res.status(500).json({ error: 'Failed to rename collection' });
    }
});

router.delete('/collections/:id', authenticate, requireGM, (req, res) => {
    try {
        const db = req.db;
        const id = req.params.id;
        const changes = db.transaction(() => {
            db.prepare('DELETE FROM audio_tracks WHERE playlist_id IN (SELECT id FROM audio_playlists WHERE collection_id = ?)').run(id);
            db.prepare('DELETE FROM audio_playlists WHERE collection_id = ?').run(id);
            return db.prepare('DELETE FROM audio_collections WHERE id = ?').run(id).changes;
        })();
        if (changes === 0) return res.status(404).json({ error: 'Collection not found' });
        res.json(loadLibrary(db));
    } catch (error) {
        console.error('Error deleting audio collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// Playlists
router.post('/playlists', authenticate, requireGM, (req, res) => {
    try {
        const { collectionId, name } = req.body;
        if (!isText(name)) return res.status(400).json({ error: 'Name is required' });
        if (!req.db.prepare('SELECT id FROM audio_collections WHERE id = ?').get(collectionId)) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        req.db.prepare('INSERT INTO audio_playlists (collection_id, name, position) VALUES (?, ?, ?)')
            .run(collectionId, name.trim(), nextPosition(req.db, 'audio_playlists', 'collection_id', collectionId));
        res.status(201).json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error creating audio playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

router.put('/playlists/:id/order', authenticate, requireGM, (req, res) => {
    try {
        if (!reorder(req.db, 'audio_tracks', req.body.trackIds, 'playlist_id', req.params.id)) {
            return res.status(400).json({ error: 'trackIds must be an array' });
        }
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error reordering audio tracks:', error);
        res.status(500).json({ error: 'Failed to reorder tracks' });
    }
});

// Renommer, ou déplacer vers une autre collection, en fin de liste (Q-20)
router.put('/playlists/:id', authenticate, requireGM, (req, res) => {
    try {
        const db = req.db;
        const { name, collectionId } = req.body;
        const playlist = db.prepare('SELECT id, collection_id FROM audio_playlists WHERE id = ?').get(req.params.id);
        if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
        if (name !== undefined && !isText(name)) return res.status(400).json({ error: 'Name cannot be empty' });

        let targetCollection = playlist.collection_id;
        let position = null;
        if (collectionId !== undefined && Number(collectionId) !== playlist.collection_id) {
            if (!db.prepare('SELECT id FROM audio_collections WHERE id = ?').get(collectionId)) {
                return res.status(404).json({ error: 'Collection not found' });
            }
            targetCollection = Number(collectionId);
            position = nextPosition(db, 'audio_playlists', 'collection_id', targetCollection);
        }

        db.prepare(`
            UPDATE audio_playlists
            SET name = COALESCE(?, name), collection_id = ?, position = COALESCE(?, position)
            WHERE id = ?
        `).run(name?.trim() ?? null, targetCollection, position, playlist.id);
        res.json(loadLibrary(db));
    } catch (error) {
        console.error('Error updating audio playlist:', error);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

router.delete('/playlists/:id', authenticate, requireGM, (req, res) => {
    try {
        const db = req.db;
        const changes = db.transaction(() => {
            db.prepare('DELETE FROM audio_tracks WHERE playlist_id = ?').run(req.params.id);
            return db.prepare('DELETE FROM audio_playlists WHERE id = ?').run(req.params.id).changes;
        })();
        if (changes === 0) return res.status(404).json({ error: 'Playlist not found' });
        res.json(loadLibrary(db));
    } catch (error) {
        console.error('Error deleting audio playlist:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// Ajout d'une ou plusieurs vidéos (lien simple ou playlist YouTube importée, Q-21, Q-22)
router.post('/playlists/:id/tracks', authenticate, requireGM, async (req, res) => {
    try {
        const db = req.db;
        const playlistId = Number(req.params.id);
        const videoIds = Array.isArray(req.body.videoIds) ? req.body.videoIds.filter(id => YOUTUBE_ID.test(id)) : [];
        if (videoIds.length === 0) return res.status(400).json({ error: 'No valid YouTube video id' });
        if (!db.prepare('SELECT id FROM audio_playlists WHERE id = ?').get(playlistId)) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        const titles = await fetchTitles(videoIds);

        const insert = db.prepare('INSERT INTO audio_tracks (playlist_id, youtube_id, title, position) VALUES (?, ?, ?, ?)');
        db.transaction(() => {
            let position = nextPosition(db, 'audio_tracks', 'playlist_id', playlistId);
            videoIds.forEach((videoId, i) => insert.run(playlistId, videoId, titles[i], position++));
        })();
        res.status(201).json(loadLibrary(db));
    } catch (error) {
        console.error('Error adding audio tracks:', error);
        res.status(500).json({ error: 'Failed to add tracks' });
    }
});

// Vidéos : renommer, ou déplacer vers une autre playlist, en fin de liste
router.put('/tracks/:id', authenticate, requireGM, (req, res) => {
    try {
        const db = req.db;
        const { title, playlistId } = req.body;
        const track = db.prepare('SELECT id, playlist_id FROM audio_tracks WHERE id = ?').get(req.params.id);
        if (!track) return res.status(404).json({ error: 'Track not found' });
        if (title !== undefined && !isText(title)) return res.status(400).json({ error: 'Title cannot be empty' });

        let targetPlaylist = track.playlist_id;
        let position = null;
        if (playlistId !== undefined && Number(playlistId) !== track.playlist_id) {
            if (!db.prepare('SELECT id FROM audio_playlists WHERE id = ?').get(playlistId)) {
                return res.status(404).json({ error: 'Playlist not found' });
            }
            targetPlaylist = Number(playlistId);
            position = nextPosition(db, 'audio_tracks', 'playlist_id', targetPlaylist);
        }

        db.prepare(`
            UPDATE audio_tracks
            SET title = COALESCE(?, title), playlist_id = ?, position = COALESCE(?, position)
            WHERE id = ?
        `).run(title?.trim() ?? null, targetPlaylist, position, track.id);
        res.json(loadLibrary(db));
    } catch (error) {
        console.error('Error updating audio track:', error);
        res.status(500).json({ error: 'Failed to update track' });
    }
});

// Copie indépendante vers une autre playlist (Q-4, Q-19)
router.post('/tracks/:id/copy', authenticate, requireGM, (req, res) => {
    try {
        const db = req.db;
        const { playlistId } = req.body;
        const track = db.prepare('SELECT youtube_id, title FROM audio_tracks WHERE id = ?').get(req.params.id);
        if (!track) return res.status(404).json({ error: 'Track not found' });
        if (!db.prepare('SELECT id FROM audio_playlists WHERE id = ?').get(playlistId)) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        db.prepare('INSERT INTO audio_tracks (playlist_id, youtube_id, title, position) VALUES (?, ?, ?, ?)')
            .run(playlistId, track.youtube_id, track.title, nextPosition(db, 'audio_tracks', 'playlist_id', playlistId));
        res.status(201).json(loadLibrary(db));
    } catch (error) {
        console.error('Error copying audio track:', error);
        res.status(500).json({ error: 'Failed to copy track' });
    }
});

router.delete('/tracks/:id', authenticate, requireGM, (req, res) => {
    try {
        const result = req.db.prepare('DELETE FROM audio_tracks WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Track not found' });
        res.json(loadLibrary(req.db));
    } catch (error) {
        console.error('Error deleting audio track:', error);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});

// ─── Routes : session ───────────────────────────────────────────────────────

// Activation et état de lecture, pour qui arrive en cours de route (MJ et joueurs)
router.get('/sessions/:sessionId', authenticate, (req, res) => {
    try {
        const session = req.db.prepare('SELECT audio_enabled FROM game_sessions WHERE id = ?').get(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json({
            enabled: !!session.audio_enabled,
            state: getState(req.system.slug, req.params.sessionId),
            serverTime: Date.now(),
        });
    } catch (error) {
        console.error('Error loading audio session:', error);
        res.status(500).json({ error: 'Failed to load audio session' });
    }
});

// Activer / désactiver la musique de la session (Q-30) ; désactiver arrête la lecture (P-4)
router.put('/sessions/:sessionId/enabled', authenticate, requireGM, (req, res) => {
    try {
        const slug = req.system.slug;
        const sessionId = Number(req.params.sessionId);
        const enabled = !!req.body.enabled;
        const result = req.db.prepare('UPDATE game_sessions SET audio_enabled = ? WHERE id = ?').run(enabled ? 1 : 0, sessionId);
        if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });

        const io = req.app.get('io');
        if (!enabled) {
            stop(slug, sessionId);
            broadcastState(io, slug, sessionId);
        }
        io?.to(`${slug}_session_${sessionId}`).emit('audio-enabled', { system: slug, sessionId, enabled });
        res.json({ enabled, state: getState(slug, sessionId), serverTime: Date.now() });
    } catch (error) {
        console.error('Error toggling session audio:', error);
        res.status(500).json({ error: 'Failed to toggle session audio' });
    }
});

// Commandes de lecture du MJ (§9.4) : play, pause, resume, seek, next, previous, stop,
// settings, et les remontées de son lecteur : duration, error
router.post('/sessions/:sessionId/command', authenticate, requireGM, (req, res) => {
    try {
        const slug = req.system.slug;
        const sessionId = Number(req.params.sessionId);
        const { action, ...payload } = req.body;

        const session = req.db.prepare('SELECT audio_enabled FROM game_sessions WHERE id = ?').get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (!session.audio_enabled) return res.status(409).json({ error: 'Audio is disabled for this session' });

        const io = req.app.get('io');
        const ctx = { db: req.db, io, slug, sessionId, key: stateKey(slug, sessionId) };

        if (action === 'next' || action === 'previous') {
            playAdjacent(io, req.db, slug, sessionId, action === 'next' ? 1 : -1);
        } else if (action === 'error') {
            // Vidéo illisible chez le MJ : signalée, puis morceau suivant (Q-23)
            if (getState(slug, sessionId).trackId === payload.trackId) {
                req.db.prepare('UPDATE audio_tracks SET unavailable = 1 WHERE id = ?').run(payload.trackId);
                playAdjacent(io, req.db, slug, sessionId, 1);
            }
        } else if (COMMANDS[action]) {
            const error = COMMANDS[action](ctx, payload);
            if (error) return res.status(400).json({ error });
            // La durée ne change rien pour les clients : pas de diffusion
            if (action !== 'duration') broadcastState(io, slug, sessionId);
        } else {
            return res.status(400).json({ error: `Unknown action: ${action}` });
        }

        res.json({ state: getState(slug, sessionId), serverTime: Date.now() });
    } catch (error) {
        console.error('Error running audio command:', error);
        res.status(500).json({ error: 'Failed to run audio command' });
    }
});

module.exports = router;
