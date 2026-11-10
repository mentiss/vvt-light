-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/maledictum-schema.sql
-- Schéma Imperium Maledictum (setup Inquisition) — Mentiss VTT
-- Spec : documentations/spec_maledictum.md §9.
-- Petites listes lues et réécrites en bloc (caractéristiques, Avances, talents,
-- pouvoirs, Influence, contacts, états, Blessures critiques…) en colonnes JSON ;
-- l'inventaire en sous-table (ids stables, syncSubTable). Patron de la table
-- (fiche de groupe), Supériorité et Subtilité : table patrons, une ligne par table.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Table principale ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (
    -- Colonnes plateforme (base.sql — verbatim)
    id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
    access_code          TEXT     NOT NULL UNIQUE,
    access_url           TEXT     NOT NULL UNIQUE,
    player_name          TEXT     NOT NULL,
    avatar               TEXT,
    nom                  TEXT     NOT NULL DEFAULT '',
    prenom               TEXT,
    sexe                 TEXT,
    age                  INTEGER,
    taille               INTEGER,
    poids                INTEGER,
    login_attempts       INTEGER  DEFAULT 0,
    last_attempt_at      DATETIME,
    last_accessed        DATETIME,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Parcours (clés des catalogues du front)
    origin_key           TEXT     DEFAULT NULL,
    faction_key          TEXT     DEFAULT NULL,
    duty_key             TEXT     DEFAULT NULL,
    role_key             TEXT     DEFAULT NULL,
    theme_key            TEXT     DEFAULT NULL,          -- thème choisi par le joueur (NULL : celui du rôle de faction)

    -- Caractéristiques : valeur de départ (tirage + origine + faction) et Avances (+1 chacune)
    chars_base           TEXT     DEFAULT '{}',          -- { ws: 34, bs: 31, … }
    chars_adv            TEXT     DEFAULT '{}',          -- { ws: 2, … }

    -- Compétences, spécialisations, talents, pouvoirs
    skills               TEXT     DEFAULT '{}',          -- Avances par compétence { awareness: 2 }
    specs                TEXT     DEFAULT '[]',          -- [{ skill, key, label, adv }]
    talents              TEXT     DEFAULT '[]',          -- [{ key, count, choice }]
    powers               TEXT     DEFAULT '[]',          -- clés de pouvoirs psychiques

    -- Santé, Destin, Corruption, Warp
    wounds               INTEGER  DEFAULT 0,             -- Blessures subies
    criticals            TEXT     DEFAULT '[]',          -- Blessures critiques [{ id, location, key, label, effect, treated }]
    injuries             TEXT     DEFAULT '[]',          -- séquelles (texte)
    conditions           TEXT     DEFAULT '{}',          -- états { stunned: 'minor' | 'major' }
    fate                 INTEGER  DEFAULT 3,             -- Destin disponible (se recharge à chaque séance)
    fate_max             INTEGER  DEFAULT 3,             -- Destin maximum (3, +1 Prédestiné, −1 par Destin brûlé)
    corruption           INTEGER  DEFAULT 0,
    mutations            TEXT     DEFAULT '[]',
    malignancies         TEXT     DEFAULT '[]',
    warp_charge          INTEGER  DEFAULT 0,

    -- Relations
    influence            TEXT     DEFAULT '{}',          -- Influence par faction { inquisition: 1 } (−5 à +5)
    contacts             TEXT     DEFAULT '[]',          -- [{ id, name, faction, value, notes }]

    -- Progression, ressources
    xp_total             INTEGER  DEFAULT 0,
    xp_spent             INTEGER  DEFAULT 0,
    solars               INTEGER  DEFAULT 0,

    -- Détails
    goals                TEXT     DEFAULT '{}',          -- { short, long }
    details              TEXT     DEFAULT '{}',          -- { appearance, handedness, connections, divination, questions… }
    bonuses              TEXT     DEFAULT '{}',          -- ajustements du mode Édition { maxWounds, initiative, encumbrance, speed }
    notes                TEXT     DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- Compte MJ obligatoire
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Meneur de jeu');

-- ═══════════════════════════════════════════════════════════════════════════
-- Tables transversales (base.sql — verbatim, non modifiées)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    access_code TEXT NOT NULL UNIQUE,
    access_url  TEXT NOT NULL UNIQUE,
    date        DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_id         ON game_sessions(id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    token        TEXT    NOT NULL UNIQUE,
    expires_at   DATETIME NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token        ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS dice_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id    INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    session_id      INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
    notation        TEXT,
    roll_result     TEXT,
    label           TEXT,
    raw_result      TEXT,
    roll_type       TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dice_history_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_created_at   ON dice_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dice_history_session_id   ON dice_history(session_id);

CREATE TABLE IF NOT EXISTS character_journal (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    session_id   INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
    type         TEXT NOT NULL DEFAULT 'note',
    title        TEXT,
    body         TEXT,
    metadata     TEXT,
    is_read      BOOLEAN DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated_at   ON character_journal(updated_at DESC);

CREATE TABLE IF NOT EXISTS session_characters (
    session_id   INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    joined_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_session_characters_character_id ON session_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_session_characters_session_id   ON session_characters(session_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Tables spécifiques Imperium Maledictum
-- ═══════════════════════════════════════════════════════════════════════════

-- Inventaire : une seule liste (armes en tête). item_key relie au catalogue (NULL :
-- objet libre) ; data : caractéristiques copiées du catalogue (dégâts, portée,
-- chargeur, traits, localisations et valeur d'armure, Encombrement…), modifiables.
CREATE TABLE IF NOT EXISTS character_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    item_key     TEXT    DEFAULT NULL,
    kind         TEXT    NOT NULL DEFAULT 'gear' CHECK(kind IN ('weapon', 'armour', 'gear', 'augmetic', 'ammo')),
    name         TEXT    NOT NULL DEFAULT '',
    data         TEXT    DEFAULT '{}',
    quantity     INTEGER NOT NULL DEFAULT 1,
    equipped     INTEGER NOT NULL DEFAULT 0,
    notes        TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_im_items_char ON character_items(character_id);

-- Patron de la table (fiche de groupe) : une ligne par table de jeu, créée à la
-- première écriture. data : partie connue des joueurs (identité, Ordo, Philosophie,
-- Attitude, Faveurs, Influence positive, notes) ; secret : partie du MJ (Handicaps,
-- Influence réelle, notes MJ), filtrée à l'affichage côté joueur. Supériorité du
-- groupe (visible de tous) et Subtilité (MJ) vivent ici.
CREATE TABLE IF NOT EXISTS patrons (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id         INTEGER NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
    data               TEXT    DEFAULT '{}',
    secret             TEXT    DEFAULT '{}',
    superiority        INTEGER NOT NULL DEFAULT 0,
    superiority_enabled INTEGER NOT NULL DEFAULT 1,
    subtlety           INTEGER NOT NULL DEFAULT 10,
    subtlety_enabled   INTEGER NOT NULL DEFAULT 1,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
