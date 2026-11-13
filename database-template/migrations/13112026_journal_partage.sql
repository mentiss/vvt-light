-- database-template/migrations/13112026_journal_partage.sql
-- Journal partagé de la table (documentations/plateforme/spec_journal.md, partie III §10.2) :
-- table_journal (entrées écrites par la table, joueurs et MJ) et table_journal_reads
-- (dernière ouverture d'une entrée par chacun : nouveautés). Auteur et dernier modificateur :
-- personnage (-1 = MJ) et nom figé, sans clé étrangère (l'auteur peut quitter la table).
--
-- systems: all

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
