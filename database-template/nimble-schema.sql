-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/nimble-schema.sql
-- Schéma Nimble — Mentiss VTT
-- Spec : documentations/spec_nimble.md §4.2.
-- Petites tables de clés (sauvegardes, points de compétence, ressources, usages,
-- choix, états, ajustements, langues) en colonnes JSON ; l'inventaire en
-- sous-table (ids stables, syncSubTable).
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

    -- Origines (clés des catalogues du front)
    class_key            TEXT     DEFAULT NULL,
    subclass_key         TEXT     DEFAULT NULL,
    ancestry_key         TEXT     DEFAULT NULL,
    background_key       TEXT     DEFAULT NULL,
    motivation           TEXT     DEFAULT '',
    level                INTEGER  DEFAULT 1,

    -- Caractéristiques (de -1 à +5 en jeu normal)
    stat_str             INTEGER  DEFAULT 0,
    stat_dex             INTEGER  DEFAULT 0,
    stat_int             INTEGER  DEFAULT 0,
    stat_wil             INTEGER  DEFAULT 0,
    saves                TEXT     DEFAULT '{}',          -- { str: 1, int: -1 } : 1 ▲, -1 ▼
    skill_points         TEXT     DEFAULT '{}',          -- points placés au-delà de la caractéristique

    -- Santé
    hp_current           INTEGER  DEFAULT 0,
    hp_max               INTEGER  DEFAULT 0,             -- tiré aux montées de niveau
    temp_hp              INTEGER  DEFAULT 0,
    wounds               INTEGER  DEFAULT 0,
    dying                INTEGER  DEFAULT 0,             -- 0/1
    hit_dice_spent       INTEGER  DEFAULT 0,

    -- Jeu
    resources            TEXT     DEFAULT '{}',          -- ressources de classe { mana: dépensé }
    uses                 TEXT     DEFAULT '{}',          -- usages consommés { 'class:hunters_mark': 1 }
    choices              TEXT     DEFAULT '[]',          -- [{ pool, key, level }]
    conditions           TEXT     DEFAULT '[]',          -- états actifs
    bonuses              TEXT     DEFAULT '{}',          -- ajustements du mode Édition
    in_combat            INTEGER  DEFAULT 0,
    actions              INTEGER  DEFAULT 3,
    turn_attacks         INTEGER  DEFAULT 0,

    -- Bourse, langues, notes
    gold                 INTEGER  DEFAULT 0,
    silver               INTEGER  DEFAULT 0,
    languages            TEXT     DEFAULT '[]',
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
-- Tables spécifiques Nimble
-- ═══════════════════════════════════════════════════════════════════════════

-- Inventaire : une seule liste (armes, armures, boucliers, objets, objets magiques).
-- item_key relie au catalogue (NULL : objet libre) ; data : caractéristiques copiées
-- (dégâts, propriétés, Défense…), modifiables ; proficient NULL = maîtrise calculée.
CREATE TABLE IF NOT EXISTS character_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    item_key     TEXT    DEFAULT NULL,
    kind         TEXT    NOT NULL DEFAULT 'gear' CHECK(kind IN ('weapon', 'armor', 'shield', 'gear', 'magic')),
    name         TEXT    NOT NULL DEFAULT '',
    data         TEXT    DEFAULT '{}',
    quantity     INTEGER NOT NULL DEFAULT 1,
    slots        REAL    NOT NULL DEFAULT 1,
    equipped     INTEGER NOT NULL DEFAULT 0,
    proficient   INTEGER DEFAULT NULL,
    notes        TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_nb_items_char ON character_items(character_id);
