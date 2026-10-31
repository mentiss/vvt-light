-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/audio-schema.sql
-- Base du module audio (database/audio.db), hors des bases des slugs
-- Spec : documentations/spec_audio.md (§10.8, §11.1)
--
-- Tout contenu appartient à une table de jeu : slug + session_id (identifiant
-- de game_sessions dans la base du slug, sans clé étrangère possible entre
-- bases). Les clés étrangères ne sont pas activées sur les connexions : les
-- suppressions effacent les lignes filles explicitement.
-- ═════════════════════════════════════════════════════════════════════════════

-- Collections : niveau de partage 'private' | 'slug' | 'platform'
create table audio_collections
(
    id         INTEGER
        primary key autoincrement,
    slug       TEXT    not null,
    session_id INTEGER not null,
    name       TEXT    not null,
    visibility TEXT    not null default 'private',
    position   INTEGER not null default 0,
    created_at DATETIME default CURRENT_TIMESTAMP,
    updated_at DATETIME default CURRENT_TIMESTAMP
);

create index idx_audio_collections_owner
    on audio_collections (slug, session_id);

create index idx_audio_collections_visibility
    on audio_collections (visibility);

create table audio_playlists
(
    id            INTEGER
        primary key autoincrement,
    collection_id INTEGER not null
        references audio_collections
            on delete cascade,
    name          TEXT    not null,
    default_slot  TEXT    not null default 'music',   -- piste où jouent ses titres : music | ambience1 | ambience2 | effect
    position      INTEGER not null default 0,
    created_at    DATETIME default CURRENT_TIMESTAMP
);

create index idx_audio_playlists_collection
    on audio_playlists (collection_id, position);

-- Vidéos YouTube : gain de 0 à 100 pour égaliser les niveaux d'origine (S-15) ;
-- durée en secondes, connue à la première lecture ou à l'affichage (null : inconnue)
create table audio_tracks
(
    id          INTEGER
        primary key autoincrement,
    playlist_id INTEGER not null
        references audio_playlists
            on delete cascade,
    youtube_id  TEXT    not null,
    title       TEXT    not null,
    gain        INTEGER not null default 100,
    position    INTEGER not null default 0,
    unavailable INTEGER not null default 0,
    duration    REAL,
    created_at  DATETIME default CURRENT_TIMESTAMP
);

create index idx_audio_tracks_playlist
    on audio_tracks (playlist_id, position);

-- Réglages par table : musique activée (T-2), titre masqué aux joueurs (P2-2)
create table audio_session_settings
(
    slug       TEXT    not null,
    session_id INTEGER not null,
    enabled    INTEGER not null default 0,
    hide_title INTEGER not null default 0,
    primary key (slug, session_id)
);

-- Boutons du MJ (lot 2) : mode 'scene' | 'target', actions en JSON (§11.6)
create table audio_buttons
(
    id         INTEGER
        primary key autoincrement,
    slug       TEXT    not null,
    session_id INTEGER not null,
    label      TEXT    not null,
    position   INTEGER not null default 0,
    mode       TEXT    not null,
    actions    TEXT    not null,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create index idx_audio_buttons_owner
    on audio_buttons (slug, session_id, position);
