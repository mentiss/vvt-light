-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/17102026_vikings_refonte_schema.sql
-- Pure Vikings — Refonte lot 2 : alignement sur vikings-schema.sql / base.sql
-- Spec : documentations/spec_vikings_lot2_serveur.md (§3)
--
--   • characters  : reconstruite — nom_parent → nom (contenu inchangé),
--                   access_code UNIQUE, SAGA par défaut 1,
--                   saga_totale remontée à saga_actuelle si inférieure (R-4)
--   • dice_history : reconstruite — character_id / roll_type nullables
--                   (jets MJ enfin enregistrés) ; toutes les lignes conservées
--   • index des tables partagées renommés comme base.sql, index manquants créés
--   • compétences : 3 noms alignés sur le vault (R-1)
--
-- À exécuter UNIQUEMENT sur Vikings, après sauvegarde de la base :
--   npm run migrate -- 17102026_vikings_refonte_schema.sql --system=vikings
-- Le runner désactive les clés étrangères et exécute tout dans une transaction :
-- en cas d'erreur (ex. access_code en double), rien n'est modifié.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── 1. characters ────────────────────────────────────────────────────────────

CREATE TABLE characters_new (
    id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
    access_code          TEXT     NOT NULL UNIQUE,
    access_url           TEXT     NOT NULL UNIQUE,
    player_name          TEXT     NOT NULL,
    avatar               TEXT,
    nom                  TEXT     NOT NULL DEFAULT '',
    prenom               TEXT,
    sexe                 TEXT     CHECK (sexe IN ('homme', 'femme')),
    age                  INTEGER,
    taille               INTEGER,
    poids                INTEGER,
    login_attempts       INTEGER  DEFAULT 0,
    last_attempt_at      DATETIME,
    last_accessed        DATETIME,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    surnom               TEXT,
    activite             TEXT,
    force                INTEGER  DEFAULT 2,
    agilite              INTEGER  DEFAULT 2,
    perception           INTEGER  DEFAULT 2,
    intelligence         INTEGER  DEFAULT 2,
    charisme             INTEGER  DEFAULT 2,
    chance               INTEGER  DEFAULT 2,
    armure               INTEGER  DEFAULT 0,
    actions_disponibles  INTEGER  DEFAULT 1,
    seuil_combat         INTEGER  DEFAULT 1,
    saga_actuelle        INTEGER  DEFAULT 1,
    saga_totale          INTEGER  DEFAULT 1,
    tokens_blessure      INTEGER  DEFAULT 0,
    tokens_fatigue       INTEGER  DEFAULT 0
);

INSERT INTO characters_new (
    id, access_code, access_url, player_name, avatar, nom, prenom, sexe, age, taille, poids,
    login_attempts, last_attempt_at, last_accessed, created_at, updated_at,
    surnom, activite,
    force, agilite, perception, intelligence, charisme, chance,
    armure, actions_disponibles, seuil_combat,
    saga_actuelle, saga_totale,
    tokens_blessure, tokens_fatigue
)
SELECT
    id, access_code, access_url, player_name, avatar, COALESCE(nom_parent, ''), prenom, sexe, age, taille, poids,
    login_attempts, last_attempt_at, last_accessed, created_at, updated_at,
    surnom, activite,
    force, agilite, perception, intelligence, charisme, chance,
    armure, actions_disponibles, seuil_combat,
    saga_actuelle, MAX(COALESCE(saga_totale, 0), COALESCE(saga_actuelle, 0)),
    tokens_blessure, tokens_fatigue
FROM characters;

DROP TABLE characters;
ALTER TABLE characters_new RENAME TO characters;

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- ── 2. dice_history ──────────────────────────────────────────────────────────

CREATE TABLE dice_history_new (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    character_id     INTEGER  REFERENCES characters(id) ON DELETE CASCADE,
    session_id       INTEGER  REFERENCES game_sessions(id) ON DELETE SET NULL,
    notation         TEXT,
    roll_definition  TEXT,
    roll_result      TEXT,
    roll_type        TEXT,
    roll_target      TEXT,
    pool             INTEGER,
    threshold        INTEGER,
    results          TEXT,
    successes        INTEGER,
    saga_spent       INTEGER  DEFAULT 0,
    saga_recovered   INTEGER  DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dice_history_new (
    id, character_id, session_id, notation, roll_definition, roll_result,
    roll_type, roll_target, pool, threshold, results, successes,
    saga_spent, saga_recovered, created_at
)
SELECT
    id, character_id, session_id, notation, roll_definition, roll_result,
    roll_type, roll_target, pool, threshold, results, successes,
    saga_spent, saga_recovered, created_at
FROM dice_history;

DROP TABLE dice_history;
ALTER TABLE dice_history_new RENAME TO dice_history;

CREATE INDEX IF NOT EXISTS idx_dice_history_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_created_at   ON dice_history(created_at DESC);

-- ── 3. Index des tables partagées (noms de base.sql) ─────────────────────────

DROP INDEX IF EXISTS idx_sessions_access_code;
DROP INDEX IF EXISTS idx_sessions_access_url;
CREATE INDEX IF NOT EXISTS idx_game_sessions_id         ON game_sessions(id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at DESC);

DROP INDEX IF EXISTS idx_refresh_tokens_character;
DROP INDEX IF EXISTS idx_refresh_tokens_expires;
DROP INDEX IF EXISTS idx_refresh_tokens_token;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token        ON refresh_tokens(token);

DROP INDEX IF EXISTS idx_journal_character;
DROP INDEX IF EXISTS idx_journal_session;
DROP INDEX IF EXISTS idx_journal_type;
CREATE INDEX IF NOT EXISTS idx_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated_at   ON character_journal(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_characters_character_id ON session_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_session_characters_session_id   ON session_characters(session_id);

CREATE INDEX IF NOT EXISTS idx_items_character ON character_items(character_id);

-- ── 4. Noms de compétences alignés sur le vault (R-1) ────────────────────────

UPDATE character_skills SET skill_name = 'Combat CàC (armé)'     WHERE skill_name = 'Combat CàC armé';
UPDATE character_skills SET skill_name = 'Combat CàC (non armé)' WHERE skill_name = 'Combat CàC non armé';
UPDATE character_skills SET skill_name = 'Combat distance'       WHERE skill_name = 'Combat à distance';

-- ── 5. Compte GM (déjà présent sur les bases existantes : sans effet) ────────

INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, prenom, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'MJ', '');
