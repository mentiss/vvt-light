-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/woddavampire-schema.sql
-- Schéma Vampire : l'Âge des Ténèbres (V20 Dark Ages) — Mentiss VTT
-- Spec : documentations/spec_woddavampire.md, partie II (§II.4).
-- Conçu pour tous les lots : les colonnes marquées (L2) / (L4) existent dès le
-- lot 1 mais ne servent qu'aux lots suivants.
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

    -- Identité
    chronicle            TEXT     DEFAULT '',
    concept              TEXT     DEFAULT '',
    nature_key           TEXT     DEFAULT NULL,
    demeanor_key         TEXT     DEFAULT NULL,
    sire                 TEXT     DEFAULT '',

    -- Clan
    clan_key             TEXT     DEFAULT NULL,
    caste_key            TEXT     DEFAULT NULL,      -- caste ou branche
    origin_clan_key      TEXT     DEFAULT NULL,      -- Enfants d'Osiris, Kiasyd
    weakness_detail      TEXT     DEFAULT '',        -- champ personnalisé de la faiblesse

    -- Sang
    generation           INTEGER  DEFAULT 12,
    blood_current        INTEGER  DEFAULT 0,

    -- Route
    road_key             TEXT     DEFAULT NULL,
    road_path_key        TEXT     DEFAULT NULL,      -- Voie (facultative)
    road_rating          INTEGER  DEFAULT 0,

    -- Vertus (libellés déduits de la Route)
    virtue_moral         INTEGER  DEFAULT 1,         -- Conscience ou Conviction
    virtue_control       INTEGER  DEFAULT 1,         -- Maîtrise ou Instinct
    virtue_courage       INTEGER  DEFAULT 1,

    -- Volonté
    willpower_permanent  INTEGER  DEFAULT 1,
    willpower_current    INTEGER  DEFAULT 1,

    -- Attributs
    strength             INTEGER  DEFAULT 1,
    dexterity            INTEGER  DEFAULT 1,
    stamina              INTEGER  DEFAULT 1,
    charisma             INTEGER  DEFAULT 1,
    manipulation         INTEGER  DEFAULT 1,
    appearance           INTEGER  DEFAULT 1,
    perception           INTEGER  DEFAULT 1,
    intelligence         INTEGER  DEFAULT 1,
    wits                 INTEGER  DEFAULT 1,

    -- Santé (L2) : trois compteurs, le rangement est automatique
    damage_bashing       INTEGER  DEFAULT 0,
    damage_lethal        INTEGER  DEFAULT 0,
    damage_aggravated    INTEGER  DEFAULT 0,

    -- États (L2)
    states               TEXT     DEFAULT '[]',      -- JSON
    weakness_counter     INTEGER  DEFAULT 0,

    -- Histoire
    history_life         TEXT     DEFAULT '',        -- « De mon vivant, j'étais… »
    history_sire         TEXT     DEFAULT '',        -- « Mon sire m'a choisi parce que… »
    history_nights       TEXT     DEFAULT '',        -- « Désormais, je passe mes nuits… »
    languages            TEXT     DEFAULT '',
    description          TEXT     DEFAULT '',
    notes                TEXT     DEFAULT '',

    -- Expérience (L2)
    xp_total             INTEGER  DEFAULT 0,
    xp_spent             INTEGER  DEFAULT 0,

    -- Mortels et Étreinte (L4)
    is_mortal            INTEGER  DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- Compte GM obligatoire
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Conteur');

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
-- Tables spécifiques Vampire : l'Âge des Ténèbres
-- Clés (ability_key, discipline_key…) en anglais (VO), libellés côté client.
-- ═══════════════════════════════════════════════════════════════════════════

-- Capacités : une ligne par Capacité acquise (spécialités et domaines d'expertise)
CREATE TABLE IF NOT EXISTS character_abilities (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    ability_key  TEXT    NOT NULL,
    rating       INTEGER NOT NULL DEFAULT 0,
    specialties  TEXT    DEFAULT '[]',               -- JSON array de libellés
    domains      TEXT    DEFAULT '[]',               -- JSON array (Érudition, Commerce, Artisanat, Représentation)
    UNIQUE(character_id, ability_key)
);
CREATE INDEX IF NOT EXISTS idx_vda_abilities_char ON character_abilities(character_id);

-- Historiques
CREATE TABLE IF NOT EXISTS character_backgrounds (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id   INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    background_key TEXT    NOT NULL,
    rating         INTEGER NOT NULL DEFAULT 0,
    details        TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vda_backgrounds_char ON character_backgrounds(character_id);

-- Disciplines (powers : pouvoirs choisis au-delà de 5, kraina acquises — JSON)
CREATE TABLE IF NOT EXISTS character_disciplines (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id   INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    discipline_key TEXT    NOT NULL,
    rating         INTEGER NOT NULL DEFAULT 0,
    powers         TEXT    DEFAULT '[]',
    UNIQUE(character_id, discipline_key)
);
CREATE INDEX IF NOT EXISTS idx_vda_disciplines_char ON character_disciplines(character_id);

-- Magie du sang : voies (Thaumaturgie, Nécromancie) et kraina (Koldunisme, Ogham)
CREATE TABLE IF NOT EXISTS character_blood_paths (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id   INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    discipline_key TEXT    NOT NULL,
    path_key       TEXT    NOT NULL,
    rating         INTEGER NOT NULL DEFAULT 0,
    is_primary     INTEGER NOT NULL DEFAULT 0        -- voie ou kraina principale
);
CREATE INDEX IF NOT EXISTS idx_vda_blood_paths_char ON character_blood_paths(character_id);

-- Rituels (custom_name : rituel créé avec le Conteur, hors catalogue)
CREATE TABLE IF NOT EXISTS character_rituals (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id   INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    discipline_key TEXT    NOT NULL,
    ritual_key     TEXT    DEFAULT NULL,
    level          INTEGER NOT NULL DEFAULT 1,
    custom_name    TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vda_rituals_char ON character_rituals(character_id);

-- Atouts et Handicaps (validation par le Conteur autour de la table : pas de statut)
CREATE TABLE IF NOT EXISTS character_merits_flaws (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    entry_key    TEXT    NOT NULL,
    kind         TEXT    NOT NULL DEFAULT 'merit' CHECK(kind IN ('merit', 'flaw')),
    cost         INTEGER NOT NULL DEFAULT 1,
    details      TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vda_merits_flaws_char ON character_merits_flaws(character_id);

-- Dérangements (L2)
CREATE TABLE IF NOT EXISTS character_derangements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id    INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    derangement_key TEXT    NOT NULL,
    incurable       INTEGER NOT NULL DEFAULT 0,
    details         TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vda_derangements_char ON character_derangements(character_id);

-- Liens de sang (L2)
CREATE TABLE IF NOT EXISTS character_blood_bonds (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    regnant      TEXT    NOT NULL DEFAULT '',
    level        INTEGER NOT NULL DEFAULT 1 CHECK(level BETWEEN 1 AND 3),
    last_drink   TEXT    DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_vda_blood_bonds_char ON character_blood_bonds(character_id);

-- Inventaire (L2) : armes, armure, bouclier et objets (une seule liste, armes en tête)
CREATE TABLE IF NOT EXISTS character_equipment (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    kind         TEXT    NOT NULL DEFAULT 'weapon' CHECK(kind IN ('weapon', 'armor', 'shield', 'item')),
    item_key     TEXT    DEFAULT NULL,               -- référence catalogue (traçabilité)
    name         TEXT    DEFAULT '',
    difficulty   INTEGER DEFAULT NULL,               -- arme : difficulté pour toucher
    damage       TEXT    DEFAULT '',                 -- arme : ex. « For + 2 L »
    range_m      INTEGER DEFAULT NULL,
    rating       INTEGER DEFAULT NULL,               -- armure : valeur
    penalty      INTEGER DEFAULT NULL,               -- armure : pénalité
    quantity     INTEGER NOT NULL DEFAULT 1,         -- objet : nombre d'exemplaires
    equipped     INTEGER NOT NULL DEFAULT 1,
    notes        TEXT    DEFAULT '',
    ordre        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_vda_equipment_char ON character_equipment(character_id);

-- Coterie (L4, §20, §II.17.3) : fiche du groupe, une par table de jeu
CREATE TABLE IF NOT EXISTS coteries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL DEFAULT '',
    description TEXT    DEFAULT '',
    emblem      TEXT    DEFAULT NULL,                -- image (outil d'avatar de la plateforme)
    anchor_key  TEXT    NOT NULL,                    -- Historique ancre, fixé à la création
    notes       TEXT    DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Historiques communs : détail libre et ajustement d'histoire du Conteur
CREATE TABLE IF NOT EXISTS coterie_backgrounds (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    coterie_id     INTEGER NOT NULL REFERENCES coteries(id) ON DELETE CASCADE,
    background_key TEXT    NOT NULL,
    story_points   INTEGER NOT NULL DEFAULT 0,
    details        TEXT    DEFAULT '',
    UNIQUE (coterie_id, background_key)
);

-- Mises des membres (total d'un Historique commun = mises + story_points)
CREATE TABLE IF NOT EXISTS coterie_contributions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    coterie_id     INTEGER NOT NULL REFERENCES coteries(id) ON DELETE CASCADE,
    character_id   INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    background_key TEXT    NOT NULL,
    points         INTEGER NOT NULL DEFAULT 1,
    UNIQUE (coterie_id, character_id, background_key)
);
CREATE INDEX IF NOT EXISTS idx_vda_coterie_contrib ON coterie_contributions(coterie_id);

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
