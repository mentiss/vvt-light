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
    roll_result     TEXT,
    label           TEXT,
    raw_result      TEXT,
    roll_type       TEXT,
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
    category     TEXT,
    pinned       INTEGER  DEFAULT 0,
    body_text    TEXT,
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


-- ── PNJ (documentations/spec_pnj.md §6.2) ─────────────────────────────────────
-- npcs : bibliothèque du MJ (PNJ, monstres, animaux) ; system_data propre au slug.
-- session_npcs : PNJ présents à une table, copie de la fiche (sheet) + état du slug.
create table npcs
(
    id          INTEGER
        primary key autoincrement,
    prenom      TEXT,
    nom         TEXT                 not null,
    role        TEXT,
    description TEXT,
    gm_notes    TEXT,
    tags        TEXT     default '[]' not null,
    avatar      TEXT,
    icon        TEXT,
    source      TEXT,
    page        INTEGER,
    system_data TEXT     default '{}' not null,
    created_at  DATETIME default CURRENT_TIMESTAMP,
    updated_at  DATETIME default CURRENT_TIMESTAMP
);

create index idx_npcs_nom
    on npcs (nom);

create table session_npcs
(
    id         INTEGER
        primary key autoincrement,
    session_id INTEGER              not null
        references game_sessions
            on delete cascade,
    npc_id     INTEGER
        references npcs
            on delete set null,
    name       TEXT                 not null,
    sheet      TEXT     default '{}' not null,
    state      TEXT     default '{}' not null,
    notes      TEXT,
    sort_order INTEGER  default 0    not null,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create index idx_session_npcs_session_id
    on session_npcs (session_id);

-- ── Journal partagé de la table (documentations/plateforme/spec_journal.md, partie III §10.2) ──
-- table_journal : entrées écrites par la table (joueurs et MJ), une table = un journal.
-- table_journal_reads : dernière ouverture d'une entrée par chacun (nouveautés).
-- Auteur et dernier modificateur : personnage (-1 = MJ) et nom figé, sans clé : l'auteur peut partir.
create table if not exists table_journal
(
    id          INTEGER
        primary key autoincrement,
    session_id  INTEGER not null
        references game_sessions
            on delete cascade,
    title       TEXT,
    body        TEXT,
    body_text   TEXT,
    ydoc        BLOB,
    pinned      INTEGER  default 0,
    author_id   INTEGER,
    author_name TEXT,
    editor_id   INTEGER,
    editor_name TEXT,
    created_at  DATETIME default CURRENT_TIMESTAMP,
    updated_at  DATETIME default CURRENT_TIMESTAMP
);

create index if not exists idx_table_journal_session_id
    on table_journal (session_id);

create table if not exists table_journal_reads
(
    entry_id     INTEGER not null
        references table_journal
            on delete cascade,
    character_id INTEGER not null,
    seen_at      DATETIME default CURRENT_TIMESTAMP,
    primary key (entry_id, character_id)
);
