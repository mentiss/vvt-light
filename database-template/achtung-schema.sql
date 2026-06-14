-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/achtung-schema.sql
-- Schéma Achtung! Cthulhu — Mentiss VTT
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Table principale ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (

    -- Colonnes plateforme (issues de base.sql — à ne pas modifier)
                                          id                  INTEGER  PRIMARY KEY AUTOINCREMENT,
                                          access_code         TEXT     NOT NULL UNIQUE,
                                          access_url          TEXT     NOT NULL UNIQUE,
                                          player_name         TEXT     NOT NULL,
                                          avatar              TEXT,
                                          nom                 TEXT     NOT NULL DEFAULT '',
                                          prenom              TEXT,
                                          sexe                TEXT,
                                          age                 INTEGER,
                                          taille              INTEGER,
                                          login_attempts      INTEGER  DEFAULT 0,
                                          last_attempt_at     DATETIME,
                                          last_accessed       DATETIME,
                                          created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- ── Identité du personnage ────────────────────────────────────────────────
                                          nationality         TEXT     DEFAULT '',
                                          rank                TEXT     DEFAULT '',   -- grade militaire ou civil
                                          archetype           TEXT     DEFAULT '',   -- parmi les 8 archétypes fixes
                                          background          TEXT     DEFAULT '',   -- parmi les 20 backgrounds fixes
                                          characteristic      TEXT     DEFAULT '',   -- parmi les 20 caractéristiques fixes
                                          biography           TEXT     DEFAULT '',

    -- ── Personal Truths & Scars (5 cases texte fixes) ────────────────────────
                                          truth_1             TEXT     DEFAULT '',
                                          truth_2             TEXT     DEFAULT '',
                                          truth_3             TEXT     DEFAULT '',
                                          truth_4             TEXT     DEFAULT '',
                                          truth_5             TEXT     DEFAULT '',

    -- ── Attributs (6 fixes) ───────────────────────────────────────────────────
                                          attr_agility        INTEGER  DEFAULT 0,
                                          attr_brawn          INTEGER  DEFAULT 0,
                                          attr_coordination   INTEGER  DEFAULT 0,
                                          attr_insight        INTEGER  DEFAULT 0,
                                          attr_reason         INTEGER  DEFAULT 0,
                                          attr_will           INTEGER  DEFAULT 0,

    -- ── Compétences (12 fixes) — rang 0–5 + focus texte libre ────────────────
                                          skill_academia_rank         INTEGER  DEFAULT 0,
                                          skill_academia_focus        TEXT     DEFAULT '',
                                          skill_athletics_rank        INTEGER  DEFAULT 0,
                                          skill_athletics_focus       TEXT     DEFAULT '',
                                          skill_engineering_rank      INTEGER  DEFAULT 0,
                                          skill_engineering_focus     TEXT     DEFAULT '',
                                          skill_fighting_rank         INTEGER  DEFAULT 0,
                                          skill_fighting_focus        TEXT     DEFAULT '',
                                          skill_medicine_rank         INTEGER  DEFAULT 0,
                                          skill_medicine_focus        TEXT     DEFAULT '',
                                          skill_observation_rank      INTEGER  DEFAULT 0,
                                          skill_observation_focus     TEXT     DEFAULT '',
                                          skill_persuasion_rank       INTEGER  DEFAULT 0,
                                          skill_persuasion_focus      TEXT     DEFAULT '',
                                          skill_resilience_rank       INTEGER  DEFAULT 0,
                                          skill_resilience_focus      TEXT     DEFAULT '',
                                          skill_stealth_rank          INTEGER  DEFAULT 0,
                                          skill_stealth_focus         TEXT     DEFAULT '',
                                          skill_survival_rank         INTEGER  DEFAULT 0,
                                          skill_survival_focus        TEXT     DEFAULT '',
                                          skill_tactics_rank          INTEGER  DEFAULT 0,
                                          skill_tactics_focus         TEXT     DEFAULT '',
                                          skill_vehicles_rank         INTEGER  DEFAULT 0,
                                          skill_vehicles_focus        TEXT     DEFAULT '',

    -- ── Santé & Défenses ─────────────────────────────────────────────────────
                                          stress              INTEGER  DEFAULT 0,    -- cases cochées (max 12, fixe)
                                          injuries            INTEGER  DEFAULT 0,    -- compteur 0–3 (3 = mort)
                                          armour              INTEGER  DEFAULT 0,
                                          courage             INTEGER  DEFAULT 0,

    -- ── Fortune ──────────────────────────────────────────────────────────────
                                          fortune             INTEGER  DEFAULT 3,    -- pas de maximum fixe

    -- ── Munitions ────────────────────────────────────────────────────────────
                                          ammo                INTEGER  DEFAULT 0,    -- pool global, géré manuellement

    -- ── Langues ──────────────────────────────────────────────────────────────
                                          languages           TEXT     DEFAULT '[]', -- JSON array de strings

    -- ── Magie (optionnel) ────────────────────────────────────────────────────
                                          is_spellcaster      INTEGER  DEFAULT 0,
                                          power               INTEGER  DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ac_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_ac_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_ac_characters_updated_at  ON characters(updated_at DESC);

INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'Game Master', 'GM');

-- ── Talents ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_talents (
                                                 id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id    INTEGER  NOT NULL,
                                                 name            TEXT     NOT NULL DEFAULT '',
                                                 keywords        TEXT     DEFAULT '',
                                                 effect          TEXT     DEFAULT '',
                                                 sort_order      INTEGER  DEFAULT 0,
                                                 FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_talents_character_id ON character_talents(character_id);

-- ── Armes ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_weapons (
                                                 id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id    INTEGER  NOT NULL,
                                                 name            TEXT     NOT NULL DEFAULT '',
                                                 focus           TEXT     DEFAULT '',
                                                 range           TEXT     DEFAULT '',   -- Close / Short / Medium / Long
                                                 damage          INTEGER  DEFAULT 0,    -- nombre de dés de Challenge
                                                 salvo           TEXT     DEFAULT '',
                                                 size            TEXT     DEFAULT '',   -- Minor / Major
                                                 qualities       TEXT     DEFAULT '',
                                                 sort_order      INTEGER  DEFAULT 0,
                                                 FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_weapons_character_id ON character_weapons(character_id);

-- ── Equipment of Note ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_items (
                                               id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                               character_id    INTEGER  NOT NULL,
                                               name            TEXT     NOT NULL DEFAULT '',
                                               description     TEXT     DEFAULT '',
                                               effect          TEXT     DEFAULT '',
                                               sort_order      INTEGER  DEFAULT 0,
                                               FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_items_character_id ON character_items(character_id);

-- ── Sorts ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_spells (
                                                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                character_id    INTEGER  NOT NULL,
                                                name            TEXT     NOT NULL DEFAULT '',
                                                spell_key       TEXT     DEFAULT NULL,
                                                tradition       TEXT     DEFAULT NULL,
                                                skill_used      TEXT     DEFAULT '',
                                                difficulty      INTEGER  DEFAULT 1,
                                                cost            TEXT     DEFAULT '',
                                                duration        TEXT     DEFAULT '',
                                                effect          TEXT     DEFAULT '',
                                                momentum_spends TEXT     DEFAULT '',
                                                sort_order      INTEGER  DEFAULT 0,
                                                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_spells_character_id ON character_spells(character_id);

-- ── Sessions ──────────────────────────────────────────────────────────────────

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


CREATE INDEX IF NOT EXISTS idx_ac_sessions_access_code ON game_sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_ac_sessions_access_url  ON game_sessions(access_url);
CREATE INDEX IF NOT EXISTS idx_ac_sessions_updated_at  ON game_sessions(updated_at DESC);

-- ── Ressources de session ─────────────────────────────────────────────────────
-- momentum (0–6) et threat : visibles par tous.
-- complications (≥0) : GM uniquement.

CREATE TABLE IF NOT EXISTS session_resources (
                                                 id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 session_id      INTEGER  NOT NULL UNIQUE,
                                                 momentum        INTEGER  DEFAULT 0,
                                                 threat          INTEGER  DEFAULT 0,
                                                 complications   INTEGER  DEFAULT 0,
                                                 updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_resources_session_id ON session_resources(session_id);

-- ── Session / Personnages ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_characters (
                                                  session_id      INTEGER  NOT NULL,
                                                  character_id    INTEGER  NOT NULL,
                                                  joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (session_id, character_id),
                                                  FOREIGN KEY (session_id)   REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                  FOREIGN KEY (character_id) REFERENCES characters(id)    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ac_sc_session_id   ON session_characters(session_id);
CREATE INDEX IF NOT EXISTS idx_ac_sc_character_id ON session_characters(character_id);

-- ── Refresh tokens ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                              character_id    INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                              token           TEXT     NOT NULL UNIQUE,
                                              expires_at      DATETIME NOT NULL,
                                              created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ac_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_ac_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_ac_tokens_token        ON refresh_tokens(token);

-- ── Historique des dés ────────────────────────────────────────────────────────

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
    roll_definition TEXT,
    roll_result     TEXT,
    roll_type       TEXT,
    roll_target     TEXT,
    pool            INTEGER,
    threshold       INTEGER,
    results         TEXT,
    successes       INTEGER,
    saga_spent      INTEGER  default 0,
    saga_recovered  INTEGER  default 0,
    created_at      DATETIME default CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ac_dice_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_ac_dice_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ac_dice_created_at   ON dice_history(created_at DESC);

-- ── Journal de personnage ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_journal (
                                                 id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id    INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 session_id      INTEGER  REFERENCES game_sessions(id) ON DELETE SET NULL,
                                                 type            TEXT     NOT NULL DEFAULT 'note',
                                                 title           TEXT,
                                                 body            TEXT,
                                                 metadata        TEXT,
                                                 is_read         BOOLEAN  DEFAULT 0,
                                                 created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ac_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_ac_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_ac_journal_updated_at   ON character_journal(updated_at DESC);