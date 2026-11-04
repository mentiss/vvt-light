-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/vileborn-schema.sql
-- Schéma Vileborn — Mentiss VTT
-- Spec : documentations/spec_vileborn.md, partie II (§II.2).
-- Conçu pour tous les lots : les colonnes de jeu (états, blessures, coches,
-- liens) existent dès le lot 1 (création) mais ne servent qu'à partir du lot 2.
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

    -- Identité (nom complet dans `nom`)
    motto                TEXT     DEFAULT '',

    -- Approches : taille du dé (6, 8 ou 10)
    die_force            INTEGER  DEFAULT 6,
    die_will             INTEGER  DEFAULT 6,
    die_influence        INTEGER  DEFAULT 6,
    die_reason           INTEGER  DEFAULT 6,
    die_precision        INTEGER  DEFAULT 6,
    die_subterfuge       INTEGER  DEFAULT 6,

    -- États (0/1)
    state_anger          INTEGER  DEFAULT 0,         -- colère
    state_exhaustion     INTEGER  DEFAULT 0,         -- épuisement
    state_shame          INTEGER  DEFAULT 0,         -- honte
    state_fear           INTEGER  DEFAULT 0,         -- peur
    state_insecurity     INTEGER  DEFAULT 0,         -- insécurité

    -- Blessures : 3 cases avec leur description, puis hors jeu
    wound_1              INTEGER  DEFAULT 0,
    wound_2              INTEGER  DEFAULT 0,
    wound_3              INTEGER  DEFAULT 0,
    wound_1_note         TEXT     DEFAULT '',
    wound_2_note         TEXT     DEFAULT '',
    wound_3_note         TEXT     DEFAULT '',
    out_of_play          INTEGER  DEFAULT 0,

    -- Origine (clé du catalogue, NULL si saisie libre ; texte copié, modifiable)
    origin_key           TEXT     DEFAULT NULL,
    origin_name          TEXT     DEFAULT '',
    origin_effect        TEXT     DEFAULT '',

    -- Mobiles
    aspiration           TEXT     DEFAULT '',
    aspiration_checked   INTEGER  DEFAULT 0,
    duty                 TEXT     DEFAULT 'Achever votre formation',
    duty_checked         INTEGER  DEFAULT 0,

    -- Sombre héritage
    heritage_key         TEXT     DEFAULT NULL,
    heritage_name        TEXT     DEFAULT '',
    heritage_examples    TEXT     DEFAULT '',
    heritage_ticks       INTEGER  DEFAULT 0,         -- coches (0 à 3)
    urge                 TEXT     DEFAULT ''         -- pulsion
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- Compte MJ obligatoire (l'Obscurité)
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Obscurité');

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
    roll_definition TEXT,
    roll_result     TEXT,
    roll_type       TEXT,
    roll_target     TEXT,
    pool            INTEGER,
    threshold       INTEGER,
    results         TEXT,
    successes       INTEGER,
    saga_spent      INTEGER DEFAULT 0,
    saga_recovered  INTEGER DEFAULT 0,
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
-- Tables spécifiques Vileborn
-- ═══════════════════════════════════════════════════════════════════════════

-- Mots de Personnalité et de Formation (les cercles du U, 5 par côté sur la fiche)
CREATE TABLE IF NOT EXISTS character_words (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    kind         TEXT    NOT NULL CHECK(kind IN ('personality', 'training')),
    position     INTEGER NOT NULL DEFAULT 0,
    label        TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vil_words_char ON character_words(character_id);

-- Dons (gift_key relie le don au catalogue de son héritage, NULL si saisie libre)
CREATE TABLE IF NOT EXISTS character_gifts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    gift_key     TEXT    DEFAULT NULL,
    name         TEXT    NOT NULL DEFAULT '',
    effect       TEXT    DEFAULT '',
    drawback     TEXT    DEFAULT '',                 -- « Cependant, … »
    checked      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_vil_gifts_char ON character_gifts(character_id);

-- Ressources
CREATE TABLE IF NOT EXISTS character_resources (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    name         TEXT    NOT NULL DEFAULT '',
    effect       TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vil_resources_char ON character_resources(character_id);

-- Liens d'affinité ou de rivalité (le niveau sert de modificateur au jet)
CREATE TABLE IF NOT EXISTS character_bonds (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    name         TEXT    NOT NULL DEFAULT '',
    description  TEXT    DEFAULT '',
    level        INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN -1 AND 1)
);
CREATE INDEX IF NOT EXISTS idx_vil_bonds_char ON character_bonds(character_id);
