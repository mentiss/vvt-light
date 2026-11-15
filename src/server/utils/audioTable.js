// src/server/utils/audioTable.js
// ─────────────────────────────────────────────────────────────────────────────
// Ce que la route de la musique et ses boutons partagent (documentations/spec_audio.md
// §11.3, §15) : les pistes fixes d'une table et leurs modes, et la lecture d'un
// contenu de la bibliothèque de la table (S-4 : seule la table propriétaire s'en sert).
// ─────────────────────────────────────────────────────────────────────────────

// Pistes fixes et modes permis (S-5, S-7)
const SLOTS = {
    music:     { modes: ['playlist', 'loop', 'shuffle'], mode: 'playlist' },
    ambience1: { modes: ['loop', 'playlist'],            mode: 'loop' },
    ambience2: { modes: ['loop', 'playlist'],            mode: 'loop' },
    effect:    { modes: ['once'],                        mode: 'once' },
};

const OWN_PLAYLIST = `
    SELECT p.* FROM audio_playlists p JOIN audio_collections c ON c.id = p.collection_id
    WHERE p.id = ? AND c.slug = ? AND c.session_id = ?`;
const OWN_TRACK = `
    SELECT t.* FROM audio_tracks t
    JOIN audio_playlists p ON p.id = t.playlist_id JOIN audio_collections c ON c.id = p.collection_id
    WHERE t.id = ? AND c.slug = ? AND c.session_id = ?`;

/** Ligne de la bibliothèque de la table (requête OWN_*), ou undefined. */
const own = (ctx, sql, id) => ctx.db.prepare(sql).get(id, ctx.slug, ctx.sessionId);

/** Titres d'une playlist, dans l'ordre. */
const playlistIds = (ctx, playlistId) =>
    ctx.db.prepare('SELECT id FROM audio_tracks WHERE playlist_id = ? ORDER BY position, id').all(playlistId).map(r => r.id);

module.exports = { SLOTS, OWN_PLAYLIST, OWN_TRACK, own, playlistIds };
