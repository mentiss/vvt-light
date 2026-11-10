-- database-template/migrations/10112026_npcs.sql
-- PNJ de la plateforme (spec_pnj.md §6.2) : bibliothèque du MJ et PNJ présents
-- à une table. Tables communes à tous les slugs (base.sql), même s'ils
-- n'utilisent pas la fonction.
--
-- systems: all

-- ── PNJ (documentations/spec_pnj.md §6.2) ─────────────────────────────────────
-- npcs : bibliothèque du MJ (PNJ, monstres, animaux) ; system_data propre au slug.
-- session_npcs : PNJ présents à une table, copie de la fiche (sheet) + état du slug.
create table if not exists npcs
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

create index if not exists idx_npcs_nom
    on npcs (nom);

create table if not exists session_npcs
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

create index if not exists idx_session_npcs_session_id
    on session_npcs (session_id);
