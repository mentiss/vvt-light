-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/board-schema.sql
-- Base du module tableau (database/board.db), hors des bases des slugs
-- Spec : documentations/spec_tableau.md (§10.1)
--
-- Tout contenu appartient à une table de jeu : slug + session_id (identifiant
-- de game_sessions dans la base du slug, sans clé étrangère possible entre
-- bases). Clés étrangères actives sur les connexions : supprimer une
-- diapositive supprime ses objets et ses images (on delete cascade).
-- ═════════════════════════════════════════════════════════════════════════════

-- Diapositives d'une table, avec leurs réglages
create table board_slides
(
    id           INTEGER
        primary key autoincrement,
    slug         TEXT    not null,
    session_id   INTEGER not null,
    name         TEXT    not null,
    position     INTEGER not null default 0,
    players_draw INTEGER not null default 0,     -- les joueurs dessinent
    players_move INTEGER not null default 0,     -- les joueurs déplacent jetons et icônes
    fog_enabled  INTEGER not null default 0,     -- diapositive avec brouillard
    fog_shown    INTEGER not null default 1,     -- interrupteur du MJ, sans toucher à l'état
    fog          TEXT    not null default '[]',  -- JSON : [{ op: 'reveal'|'cover', x, y, w, h }], dans l'ordre
    grid_enabled INTEGER not null default 0,
    grid_size    REAL    not null default 50,    -- côté d'une case, en unités du tableau
    grid_value   REAL,                           -- null : valeur de la table
    grid_unit    TEXT,                           -- 'm' | 'ft' ; null : unité de la table
    created_at   DATETIME default CURRENT_TIMESTAMP,
    updated_at   DATETIME default CURRENT_TIMESTAMP
);

create index idx_board_slides_session
    on board_slides (slug, session_id, position);

-- Tableau d'une table : activation, diapositive montrée, grille, purge
create table board_sessions
(
    slug           TEXT    not null,
    session_id     INTEGER not null,
    enabled        INTEGER not null default 0,
    shown_slide_id INTEGER
        references board_slides
            on delete set null,
    keep           INTEGER not null default 0,   -- « à conserver » : jamais purgé
    grid_value     REAL,                         -- null : défaut du slug
    grid_unit      TEXT,                         -- 'm' | 'ft' ; null : défaut du slug
    last_used_at   DATETIME default CURRENT_TIMESTAMP,  -- base de la purge à 3 mois
    primary key (slug, session_id)
);

-- Images déposées : appartiennent à une diapositive, servies à part
create table board_images
(
    id         INTEGER
        primary key autoincrement,
    slide_id   INTEGER not null
        references board_slides
            on delete cascade,
    mime       TEXT    not null,                 -- image/jpeg | image/png | image/webp | image/gif
    width      INTEGER not null,
    height     INTEGER not null,
    size       INTEGER not null,                 -- octets
    data       BLOB    not null,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create index idx_board_images_slide
    on board_images (slide_id);

-- Objets posés sur une diapositive : 'image' | 'icon' | 'token' | 'stroke' | 'rect'
create table board_items
(
    id         INTEGER
        primary key autoincrement,
    slide_id   INTEGER not null
        references board_slides
            on delete cascade,
    kind       TEXT    not null,
    x          REAL    not null default 0,
    y          REAL    not null default 0,
    w          REAL    not null default 0,
    h          REAL    not null default 0,
    z          INTEGER not null default 0,       -- ordre d'affichage
    locked     INTEGER not null default 0,       -- verrou du MJ
    data       TEXT    not null default '{}',    -- JSON propre au type (spec §10.1)
    author     INTEGER,                          -- characterId de l'auteur (-1 : MJ)
    created_at DATETIME default CURRENT_TIMESTAMP,
    updated_at DATETIME default CURRENT_TIMESTAMP
);

create index idx_board_items_slide
    on board_items (slide_id, z);
