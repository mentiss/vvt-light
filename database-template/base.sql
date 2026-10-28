-- STRICT MINIMUM TABLE CHARACTER
create table characters
(
    id                        INTEGER
        primary key autoincrement,
    access_code               TEXT                not null
        unique,
    access_url                TEXT                not null
        unique,
    player_name               TEXT                not null,
    avatar                    TEXT,
    nom                       TEXT     default '' not null,
    prenom                    TEXT,
    sexe                      TEXT,
    age                       integer,
    taille                    integer,
    poids                     INTEGER,
    login_attempts            INTEGER  default 0,
    last_attempt_at           DATETIME,
    last_accessed             DATETIME,
    created_at                DATETIME default CURRENT_TIMESTAMP,
    updated_at                DATETIME default CURRENT_TIMESTAMP
);

create index idx_characters_access_code
    on characters (access_code);

create index idx_characters_access_url
    on characters (access_url);

create index idx_characters_updated_at
    on characters (updated_at desc);



create table game_sessions
(
    id          INTEGER
        primary key autoincrement,
    name        TEXT not null,
    access_code TEXT not null
        unique,
    access_url  TEXT not null
        unique,
    date        DATETIME default CURRENT_TIMESTAMP,
    notes       TEXT,
    created_at  DATETIME default CURRENT_TIMESTAMP,
    audio_enabled INTEGER  not null default 0,
    updated_at  DATETIME default CURRENT_TIMESTAMP
);

create index idx_game_sessions_id
    on game_sessions (id);

create index idx_game_sessions_updated_at
    on game_sessions (updated_at desc);

create table refresh_tokens
(
    id           INTEGER
        primary key autoincrement,
    character_id INTEGER  not null
        references characters
            on delete cascade,
    token        TEXT     not null
        unique,
    expires_at   DATETIME not null,
    created_at   DATETIME default CURRENT_TIMESTAMP
);

create index idx_refresh_tokens_character_id
    on refresh_tokens (character_id);

create index idx_refresh_tokens_expires_at
    on refresh_tokens (expires_at);

create index idx_refresh_tokens_token
    on refresh_tokens (token);

create table dice_history
(
    id              INTEGER
        primary key autoincrement,
    character_id    INTEGER
        references characters
            on delete cascade,
    session_id      INTEGER
        references game_sessions
            on delete set null,
    notation        TEXT,
    roll_definition TEXT,
    roll_result     TEXT,
    roll_type       TEXT,
    roll_target     TEXT,
    pool            INTEGER,
    threshold       INTEGER,
    results         TEXT,
    successes       INTEGER,
    saga_spent      INTEGER  default 0,
    saga_recovered  INTEGER  default 0,
    created_at      DATETIME default CURRENT_TIMESTAMP
);

create index idx_dice_history_character_id
    on dice_history (character_id);

create index idx_dice_history_created_at
    on dice_history (created_at desc);

create index idx_dice_history_session_id
    on dice_history (session_id);

create table character_journal
(
    id           INTEGER
        primary key autoincrement,
    character_id INTEGER                 not null
        references characters
            on delete cascade,
    session_id   INTEGER
                                         references game_sessions
                                             on delete set null,
    type         TEXT     default 'note' not null,
    title        TEXT,
    body         TEXT,
    metadata     TEXT,
    is_read      BOOLEAN  default 0,
    created_at   DATETIME default CURRENT_TIMESTAMP,
    updated_at   DATETIME default CURRENT_TIMESTAMP
);

create index idx_journal_character_id
    on character_journal (character_id);

create index idx_journal_session_id
    on character_journal (session_id);

create index idx_journal_updated_at
    on character_journal (updated_at desc);

create table session_characters
(
    session_id   INTEGER not null
        references game_sessions
            on delete cascade,
    character_id INTEGER not null
        references characters
            on delete cascade,
    joined_at    DATETIME default CURRENT_TIMESTAMP,
    primary key (session_id, character_id)
);

create index idx_session_characters_character_id
    on session_characters (character_id);

create index idx_session_characters_session_id
    on session_characters (session_id);

-- Brique audio (documentations/spec_audio.md §9.2) : bibliothèque du MJ,
-- collections → playlists → vidéos YouTube
create table audio_collections
(
    id         INTEGER
        primary key autoincrement,
    name       TEXT    not null,
    position   INTEGER not null default 0,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create table audio_playlists
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

create index idx_audio_playlists_collection
    on audio_playlists (collection_id, position);

create table audio_tracks
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

create index idx_audio_tracks_playlist
    on audio_tracks (playlist_id, position);
