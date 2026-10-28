-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/27102026_add_audio.sql
-- Brique audio synchronisée (façon Watch2Gether), commune à tous les slugs
-- Spec : documentations/spec_audio.md (§9.2)
--
--   • audio_collections / audio_playlists / audio_tracks : bibliothèque du MJ,
--     par slug, indépendante des sessions (Q-1)
--   • game_sessions.audio_enabled : musique activée par le MJ pour la session,
--     mémorisée d'une partie à l'autre (Q-30) — 0 pour les sessions existantes
--
-- systems: all
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE game_sessions ADD COLUMN audio_enabled INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS audio_collections
(
    id         INTEGER
        primary key autoincrement,
    name       TEXT    not null,
    position   INTEGER not null default 0,
    created_at DATETIME default CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_playlists
(
    id            INTEGER
        primary key autoincrement,
    collection_id INTEGER not null
        references audio_collections
            on delete cascade,
    name          TEXT    not null,
    position      INTEGER not null default 0,
    created_at    DATETIME default CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audio_playlists_collection
    ON audio_playlists (collection_id, position);

CREATE TABLE IF NOT EXISTS audio_tracks
(
    id          INTEGER
        primary key autoincrement,
    playlist_id INTEGER not null
        references audio_playlists
            on delete cascade,
    youtube_id  TEXT    not null,
    title       TEXT    not null,
    position    INTEGER not null default 0,
    unavailable INTEGER not null default 0,
    created_at  DATETIME default CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audio_tracks_playlist
    ON audio_tracks (playlist_id, position);
