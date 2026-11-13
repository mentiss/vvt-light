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
    category     TEXT,
    pinned       INTEGER  DEFAULT 0,
    body_text    TEXT,
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

-- ── PNJ du livre (versés une fois, 10112026_npcs_woddavampire.sql) ──
INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Alligator', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":4,"dexterity":2,"stamina":4,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":2},{"key":"athletics","rating":2},{"key":"brawl","rating":2},{"key":"stealth","rating":3}],"disciplines":[],"willpower":3,"blood":5,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":7,"type":"lethal","text":"qui engage une saisie"},{"name":"Coup de queue","dice":6,"type":"bashing","text":""}],"traits":[{"name":"Note","text":"Alligators et crocodiles : 1 dé d''armure, contre C ou L"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Alligator' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Araignée', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":0,"dexterity":3,"stamina":1,"perception":1,"intelligence":1,"wits":3},"abilities":[],"disciplines":[],"willpower":3,"blood":0,"health":[{"label":"Morte","penalty":null}],"attacks":[{"name":"Pas de dégâts, morsure parfois venimeuse","dice":null,"type":null,"text":""}],"traits":[{"name":"Note","text":"Per + Vigilance difficulté 7 pour la remarquer"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Araignée' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Chameau', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":6,"dexterity":3,"stamina":3,"perception":3,"intelligence":3,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":4}],"disciplines":[],"willpower":3,"blood":6,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2}],"attacks":[{"name":"Ruade","dice":6,"type":null,"text":""},{"name":"Morsure","dice":4,"type":null,"text":"(type non précisé)"}],"traits":[{"name":"Note","text":"Pas de niveau Neutralisé"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Chameau' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Chat domestique', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":1,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3,"specialty":"escalade"},{"key":"brawl","rating":2},{"key":"intimidation","rating":2},{"key":"stealth","rating":4},{"key":"empathy","rating":2,"trained":true},{"key":"subterfuge","rating":2,"trained":true}],"disciplines":[],"willpower":3,"blood":1,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":1,"type":"bashing","text":""},{"name":"Griffe","dice":1,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Chat domestique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Chauve-souris', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":1,"dexterity":3,"stamina":2,"perception":3,"intelligence":1,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"stealth","rating":2}],"disciplines":[],"willpower":2,"blood":0,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−3","penalty":-3}],"attacks":[{"name":"Morsure","dice":1,"type":"lethal","text":""}],"traits":[{"name":"Sang","text":"¼ (1 point = 4 chauves-souris)"},{"name":"Note","text":"Vol à 40 km/h ; la chauve-souris du Protéisme est plus grande"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Chauve-souris' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Chien moyen (lévrier)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":3,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":2},{"key":"survival","rating":3,"specialty":"pistage"},{"key":"empathy","rating":2,"trained":true},{"key":"intimidation","rating":1,"trained":true},{"key":"stealth","rating":2,"trained":true}],"disciplines":[],"willpower":3,"blood":2,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":3,"type":"bashing","text":""},{"name":"Griffe","dice":2,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Chien moyen (lévrier)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Petit chien (limier, chien courant)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":2,"dexterity":3,"stamina":2,"perception":3,"intelligence":1,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":1},{"key":"empathy","rating":2,"trained":true},{"key":"performance","rating":1,"trained":true},{"key":"stealth","rating":3,"trained":true}],"disciplines":[],"willpower":3,"blood":1,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":2,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Petit chien (limier, chien courant)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Grand cheval (étalon, de trait)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":6,"dexterity":2,"stamina":5,"perception":3,"intelligence":2,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":1},{"key":"brawl","rating":3,"trained":true},{"key":"empathy","rating":2,"trained":true},{"key":"intimidation","rating":2,"trained":true}],"disciplines":[],"willpower":4,"blood":4,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Piétinement ou ruade","dice":7,"type":"bashing","text":""},{"name":"Morsure","dice":3,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Grand cheval (étalon, de trait)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Petit cheval (poney, poulain)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":4,"dexterity":2,"stamina":3,"perception":3,"intelligence":2,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":1},{"key":"brawl","rating":2,"trained":true},{"key":"empathy","rating":2,"trained":true}],"disciplines":[],"willpower":2,"blood":3,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Piétinement ou ruade","dice":6,"type":null,"text":""},{"name":"Morsure","dice":3,"type":null,"text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Petit cheval (poney, poulain)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Petit cochon', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":2,"dexterity":2,"stamina":4,"perception":3,"intelligence":2,"wits":2},"abilities":[{"key":"alertness","rating":2},{"key":"athletics","rating":2},{"key":"brawl","rating":2}],"disciplines":[],"willpower":3,"blood":3,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":2,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Petit cochon' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Sanglier', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":4,"dexterity":2,"stamina":5,"perception":3,"intelligence":2,"wits":2},"abilities":[{"key":"alertness","rating":2},{"key":"athletics","rating":2},{"key":"brawl","rating":2},{"key":"intimidation","rating":2,"trained":true}],"disciplines":[],"willpower":3,"blood":4,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":4,"type":"bashing","text":""},{"name":"Défense","dice":5,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Sanglier' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Grand primate', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":4,"dexterity":4,"stamina":3,"perception":3,"intelligence":3,"wits":4},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3,"specialty":"escalade"},{"key":"brawl","rating":2},{"key":"empathy","rating":2,"trained":true}],"disciplines":[],"willpower":5,"blood":6,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":5,"type":"bashing","text":""},{"name":"Griffe","dice":4,"type":"bashing","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Grand primate' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Lynx', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":3,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3,"specialty":"escalade"},{"key":"brawl","rating":3}],"disciplines":[],"willpower":3,"blood":4,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":4,"type":"lethal","text":""},{"name":"Griffe","dice":3,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Lynx' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Léopard (jaguar, panthère…)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":4,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":3},{"key":"intimidation","rating":4,"trained":true},{"key":"stealth","rating":3,"trained":true}],"disciplines":[],"willpower":4,"blood":5,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":5,"type":"lethal","text":""},{"name":"Griffe","dice":4,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Léopard (jaguar, panthère…)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Tigre (lion…)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":5,"dexterity":4,"stamina":4,"perception":4,"intelligence":3,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":3},{"key":"intimidation","rating":4,"trained":true},{"key":"stealth","rating":3,"trained":true}],"disciplines":[],"willpower":5,"blood":5,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":6,"type":"lethal","text":""},{"name":"Griffe","dice":5,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Tigre (lion…)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Loup', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":3,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":2},{"key":"athletics","rating":1},{"key":"brawl","rating":3},{"key":"stealth","rating":2}],"disciplines":[],"willpower":3,"blood":2,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−3","penalty":-3},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":4,"type":"lethal","text":""},{"name":"Griffe","dice":4,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Loup' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Ours', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":5,"dexterity":2,"stamina":5,"perception":3,"intelligence":3,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"brawl","rating":3},{"key":"intimidation","rating":2},{"key":"stealth","rating":1}],"disciplines":[],"willpower":4,"blood":5,"health":[{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−3","penalty":-3},{"label":"−3","penalty":-3},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Griffe","dice":7,"type":"lethal","text":""},{"name":"Morsure","dice":6,"type":"lethal","text":""}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Ours' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Petit oiseau (pinson, perroquet…)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":1,"dexterity":3,"stamina":2,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"performance","rating":3,"specialty":"imitation","trained":true}],"disciplines":[],"willpower":1,"blood":0,"health":[{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Harcèlement : −1 dé à toutes les réserves de la cible pendant le harcèlement","dice":null,"type":null,"text":""}],"traits":[{"name":"Sang","text":"¼ (1 point = 4 petits oiseaux)"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Petit oiseau (pinson, perroquet…)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Grand oiseau (faucon, corbeau…)', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":2,"dexterity":3,"stamina":3,"perception":3,"intelligence":2,"wits":3},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":2},{"key":"brawl","rating":1},{"key":"intimidation","rating":2},{"key":"brawl","rating":3,"trained":true},{"key":"empathy","rating":4,"trained":true},{"key":"intimidation","rating":4,"trained":true}],"disciplines":[],"willpower":3,"blood":0,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Griffe","dice":2,"type":"lethal","text":""},{"name":"Morsure","dice":1,"type":"lethal","text":"(seulement en désespoir de cause)"}],"traits":[{"name":"Sang","text":"½ (1 point = 2 grands oiseaux)"},{"name":"Note","text":"Vol à 40-80 km/h en général"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Grand oiseau (faucon, corbeau…)' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Rat', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":1,"dexterity":2,"stamina":3,"perception":2,"intelligence":1,"wits":1},"abilities":[{"key":"alertness","rating":2},{"key":"athletics","rating":3},{"key":"brawl","rating":1},{"key":"stealth","rating":3}],"disciplines":[],"willpower":4,"blood":0,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":1,"type":"bashing","text":""}],"traits":[{"name":"Sang","text":"¼"},{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Rat' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Serpent constricteur', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":2,"dexterity":3,"stamina":3,"perception":3,"intelligence":1,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":3}],"disciplines":[],"willpower":4,"blood":2,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Constriction","dice":4,"type":"bashing","text":"par tour"}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Serpent constricteur' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Serpent venimeux', 'Animal', NULL, '["Animal"]', 'Livre de base', 396, '{"nature":"animal","attributes":{"strength":1,"dexterity":3,"stamina":3,"perception":3,"intelligence":1,"wits":2},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":3}],"disciplines":[],"willpower":4,"blood":1,"health":[{"label":"OK","penalty":0},{"label":"−1","penalty":-1},{"label":"−2","penalty":-2},{"label":"−5","penalty":-5},{"label":"Neutralisé","penalty":null}],"attacks":[{"name":"Morsure","dice":2,"type":"lethal","text":"(poison)"}],"traits":[{"name":"Règles des animaux","text":"Seulement des Attributs physiques et mentaux, et quelques Capacités. Attributs dans l''ordre Force, Dextérité, Vigueur, Perception, Intelligence, Astuce. Un animal bien dressé conserve et récupère sa Volonté. Les Capacités entre crochets sont celles d''un spécimen dressé. Le sang indique ce qu''un vampire peut prendre et la réserve maximale d''un animal goule. Les attaques listées ne donnent pas d''actions en plus : un animal qui a plusieurs attaques peut répartir son action (action multiple). **Animal goule** : comme une goule (réserve propre à l''espèce), se soigne, a 1 point de Puissance ; avec dressage, peut apprendre Puissance, Célérité et Force d''âme, jamais d''autre Discipline."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Serpent venimeux' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : petits insectes', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":1,"healthPoints":5,"initiative":2,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : petits insectes' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : gros insectes', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":2,"healthPoints":7,"initiative":3,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : gros insectes' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : insectes volants', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":2,"healthPoints":5,"initiative":4,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : insectes volants' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : oiseaux, chauves-souris', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":4,"healthPoints":9,"initiative":5,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : oiseaux, chauves-souris' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : rats', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":3,"healthPoints":7,"initiative":3,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : rats' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : gros rats', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":4,"healthPoints":9,"initiative":3,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : gros rats' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : chats sauvages', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":4,"healthPoints":6,"initiative":6,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : chats sauvages' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nuée : chiens sauvages, loups', 'Nuée', NULL, '["Nuée"]', 'Livre de base', 399, '{"nature":"swarm","damage":6,"healthPoints":15,"initiative":4,"traits":[{"name":"Règles des nuées","text":"Un jet de dégâts par tour passé dans la nuée (difficulté 6), à l''initiative indiquée ; esquive difficulté 8 ; absorption normale ; dégâts létaux sauf petits insectes. Déplacement réduit de moitié, sauf esquive réussie. 3 niveaux ou plus avant absorption : renversé et submergé (1 à 2 m par tour, dégâts à difficulté 4). Armes normales : 1 niveau par tour au maximum ; la nuée n''absorbe pas ; dégâts de zone (feu) normaux ; 2 niveaux de plus pour l''éradiquer."}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nuée : chiens sauvages, loups' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Le Bouc émissaire', 'Démon', 'Diablotin farceur (peut-être un ancien esprit naturel) qui vole des objets et les déplace ; se nourrit de la frustration de ceux qui les cherchent. Accroche : un innocent accusé d''une peste du bétail pendant que le vrai responsable (un esprit-rat) est ignoré', '["Esprit","Démon"]', 'Livre de base', 401, '{"nature":"spirit","willpower":2,"rage":2,"gnosis":2,"essence":6,"charms":[{"name":"Récolte d''Essence","cost":"","text":"Le démon pousse les humains à une tâche précise ; chaque fois qu''un humain lance des dés ou dépense de la Volonté pour l''accomplir, le démon gagne autant d''Essence que la Volonté restante de l''humain après l''action"},{"name":"Téléportation","cost":"1 Essence","text":"Si son Essence est sous le tiers de sa réserve permanente : se téléporte en sécurité, en action réflexe"},{"name":"Immunité au feu","cost":"","text":"Toute tentative, surnaturelle ou ordinaire, de le brûler échoue automatiquement"}],"traits":[{"name":"Volonté","text":"Volonté, actions de Dextérité et d''Astuce ; réserve de défense"},{"name":"Rage","text":"Actions de Force et de Vigueur ; réserve d''attaque"},{"name":"Gnose","text":"Jets mentaux et la plupart des jets sociaux ; sert de Perception"},{"name":"Essence","text":"En général la somme des trois autres ; alimente les Charmes et sert de santé. À 0, l''esprit se dissipe et ne peut revenir au même endroit avant cent ans (sauf magie noire ou tourment prolongé)"}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Le Bouc émissaire' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'L''Homme du carrefour', 'Démon', 'Démon des carrefours : exauce un vœu pour cinq ans, puis prend l''âme et la vie. Raisonnable pour un démon mais implacable ; on pourrait lui rappeler son humanité passée (ancien magicien) pour sortir d''un contrat, à un prix', '["Esprit","Démon"]', 'Livre de base', 401, '{"nature":"spirit","willpower":6,"rage":4,"gnosis":10,"essence":20,"charms":[{"name":"Moisson d''âme","cost":"","text":"À l''échéance d''un contrat avec un mortel : le démon gagne autant d''Essence que la Volonté, les Attributs mentaux et les points d''expérience du mortel, qui meurt aussitôt. Tant que le démon garde l''âme, toute tentative de le ramener, de parler à son esprit ou de l''invoquer échoue"},{"name":"Vœu","cost":"20 Essence (10 s''il a un contrat avec le mortel)","text":"Réalise un vœu précis, s''il peut se traduire par un Historique ou un Atout d''au plus 5 points ajouté immédiatement au personnage"},{"name":"Téléportation","cost":"1 Essence","text":"Si son Essence est sous le tiers de sa réserve permanente : se téléporte en sécurité, en action réflexe"},{"name":"Invocation de chiens de l''enfer","cost":"5 Essence","text":"Un chien de l''enfer par point de Rage, sur un profil de chien ; Force et Vigueur montées à la Rage du démon si elles sont plus basses ; morsures et griffes aggravées"},{"name":"Immunité au feu","cost":"","text":"Toute tentative, surnaturelle ou ordinaire, de le brûler échoue automatiquement"}],"traits":[{"name":"Volonté","text":"Volonté, actions de Dextérité et d''Astuce ; réserve de défense"},{"name":"Rage","text":"Actions de Force et de Vigueur ; réserve d''attaque"},{"name":"Gnose","text":"Jets mentaux et la plupart des jets sociaux ; sert de Perception"},{"name":"Essence","text":"En général la somme des trois autres ; alimente les Charmes et sert de santé. À 0, l''esprit se dissipe et ne peut revenir au même endroit avant cent ans (sauf magie noire ou tourment prolongé)"}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'L''Homme du carrefour' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'L''Horreur', 'Démon', 'Bête de six mètres faite de rage, de lave et de plaisir à la souffrance ; tire son Essence des cris et de l''agonie', '["Esprit","Démon"]', 'Livre de base', 401, '{"nature":"spirit","willpower":6,"rage":15,"gnosis":5,"essence":26,"charms":[{"name":"Immunité au feu","cost":"","text":"Toute tentative, surnaturelle ou ordinaire, de le brûler échoue automatiquement"},{"name":"Récolte d''Essence","cost":"","text":"Le démon pousse les humains à une tâche précise ; chaque fois qu''un humain lance des dés ou dépense de la Volonté pour l''accomplir, le démon gagne autant d''Essence que la Volonté restante de l''humain après l''action"},{"name":"Vœu","cost":"20 Essence (10 s''il a un contrat avec le mortel)","text":"Réalise un vœu précis, s''il peut se traduire par un Historique ou un Atout d''au plus 5 points ajouté immédiatement au personnage"},{"name":"Réponse","cost":"10 Essence","text":"Sent quand des humains cherchent à appeler un démon (l''intention suffit, même si l''invocation échoue) ; se téléporte sur le lieu de l''invocation sans être lié ni contrôlé par l''invocateur, qui peut ne pas s''en rendre compte"}],"traits":[{"name":"Volonté","text":"Volonté, actions de Dextérité et d''Astuce ; réserve de défense"},{"name":"Rage","text":"Actions de Force et de Vigueur ; réserve d''attaque"},{"name":"Gnose","text":"Jets mentaux et la plupart des jets sociaux ; sert de Perception"},{"name":"Essence","text":"En général la somme des trois autres ; alimente les Charmes et sert de santé. À 0, l''esprit se dissipe et ne peut revenir au même endroit avant cent ans (sauf magie noire ou tourment prolongé)"}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'L''Horreur' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Le Farceur masqué', 'Fantôme', 'Protecteur d''un village reculé, qui y protège les anciens cultes en échange d''un peu de culte. Les valeurs après la barre s''appliquent quand il est pleinement manifesté.', '["Fantôme"]', 'Livre de base', 403, '{"nature":"ghost","attributes":{"strength":0,"dexterity":3,"stamina":4,"charisma":3,"manipulation":4,"appearance":1,"perception":2,"intelligence":3,"wits":4},"abilities":[{"key":"alertness","rating":3},{"key":"athletics","rating":3},{"key":"brawl","rating":4},{"key":"empathy","rating":3},{"key":"linguistics","rating":2},{"key":"intimidation","rating":3},{"key":"investigation","rating":2},{"key":"leadership","rating":2},{"key":"medicine","rating":1},{"key":"melee","rating":2},{"key":"occult","rating":3},{"key":"subterfuge","rating":3},{"key":"stealth","rating":2},{"key":"survival","rating":2}],"disciplines":[{"key":"chimerstry","rating":4},{"key":"dementation","rating":4},{"key":"obtenebration","rating":3},{"key":"thaumaturgy","rating":3}],"willpower":8,"blood":10,"health":null,"attacks":[],"traits":[{"name":"Manifestation","text":"Force 3 quand il est pleinement manifesté (0 sinon)."},{"name":"Disciplines","text":"Chimérie 4, Démence 4, Obténébration 3, Thaumaturgie 3 (Creatio Ignis 3, Potestas Motus 3)"},{"name":"Route","text":"Humanité 4"},{"name":"Nature","text":"En général incorporels et invisibles ; les vivants ne les voient que s''ils font l''effort d''être visibles (ou par certaines Disciplines). Les plus anciens peuvent posséder un humain ou se manifester physiquement. Difficile pour eux d''affecter directement un vampire"},{"name":"Passions","text":"Liens émotionnels qui les retiennent : comptent comme des points de sang pour activer leurs capacités surnaturelles"},{"name":"Manifestation","text":"1 point de Passion = se manifester pour agir sur le monde physique pendant un tour. Leurs pouvoirs (représentés par des Disciplines) agissent à travers le Linceul sans manifestation préalable"},{"name":"Vision de la mort","text":"Voient la main de la mort sur toute chose (fissures d''un bâtiment neuf, condamné déjà pendu, pestiféré déjà cadavre) ; la précision dépend des succès du jet"},{"name":"Vision de la vie","text":"Perçoivent les âmes comme avec Augure"},{"name":"Trait","text":"Valeur"},{"name":"---|---"},{"name":"Attributs","text":"Force 0/3, Dextérité 3, Vigueur 4, Charisme 3, Manipulation 4, Apparence 1, Perception 2, Intelligence 3, Astuce 4"},{"name":"Capacités","text":"Vigilance 3, Athlétisme 3, Bagarre 4, Empathie 3, Linguistique 2, Intimidation 3, Investigation 2, Commandement 2, Médecine 1, Mêlée 2, Occultisme 3, Subterfuge 3, Furtivité 2, Survie 2"},{"name":"Disciplines équivalentes","text":"Chimérie 4, Démence 4, Obténébration 3, Thaumaturgie 3 (Creatio Ignis 3, Potestas Motus 3)"},{"name":"Route, Volonté, Passion","text":"Humanité 4 · Volonté 8 · réserve de Passion 10"}]}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Le Farceur masqué' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');
-- ── fin des PNJ du livre ──

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
