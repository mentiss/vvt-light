-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/vikings-schema.sql
-- Schéma Pure Vikings (Pure Saga) — Mentiss VTT
-- 3d10, explosion par caractéristique, seuil par compétence, SAGA
-- Specs : documentations/spec_vikings.md, documentations/spec_vikings_lot2_serveur.md
--
-- Utilisé uniquement à la création d'une base neuve. Les bases existantes sont
-- mises au même niveau par la migration 17102026_vikings_refonte_schema.sql.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Table principale ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (

    -- Colonnes plateforme (issues de base.sql)
    -- Écart assumé : CHECK sur sexe (D-17, jeu « hard history »), NULL accepté pour le compte MJ
                                          id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
                                          access_code          TEXT     NOT NULL UNIQUE,
                                          access_url           TEXT     NOT NULL UNIQUE,
                                          player_name          TEXT     NOT NULL,
                                          avatar               TEXT,
                                          nom                  TEXT     NOT NULL DEFAULT '',  -- nom du parent (« fils/fille de » ajouté à l'affichage)
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

    -- Identité Vikings
                                          surnom               TEXT,
                                          activite             TEXT,

    -- Caractéristiques (1 à 5)
                                          force                INTEGER  DEFAULT 2,
                                          agilite              INTEGER  DEFAULT 2,
                                          perception           INTEGER  DEFAULT 2,
                                          intelligence         INTEGER  DEFAULT 2,
                                          charisme             INTEGER  DEFAULT 2,
                                          chance               INTEGER  DEFAULT 2,

    -- Combat (valeurs dérivées des traits et de l'équipement, recalculées par le
    -- client ; *_mod = ajustement bonus/malus saisi en mode édition, lot 3b)
                                          armure               INTEGER  DEFAULT 0,
                                          actions_disponibles  INTEGER  DEFAULT 1,
                                          seuil_combat         INTEGER  DEFAULT 1,
                                          armure_mod           INTEGER  NOT NULL DEFAULT 0,
                                          actions_mod          INTEGER  NOT NULL DEFAULT 0,
                                          seuil_mod            INTEGER  NOT NULL DEFAULT 0,

    -- SAGA (actuelle plafonnée à 5 côté client ; totale = légende cumulée, D-10)
                                          saga_actuelle        INTEGER  DEFAULT 1,
                                          saga_totale          INTEGER  DEFAULT 1,

    -- État (blessures 0-5, fatigue 0-10)
                                          tokens_blessure      INTEGER  DEFAULT 0,
                                          tokens_fatigue       INTEGER  DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- ── Sous-tables Vikings ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_skills (
                                                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                character_id    INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                skill_name      TEXT     NOT NULL,
                                                specialization  TEXT,
                                                level           INTEGER  DEFAULT 0,
                                                current_points  INTEGER  DEFAULT 0,   -- points de succès auto restants
                                                UNIQUE (character_id, skill_name, specialization)
);

CREATE INDEX IF NOT EXISTS idx_skills_character ON character_skills(character_id);

CREATE TABLE IF NOT EXISTS character_traits (
                                                id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                trait_name    TEXT     NOT NULL,
                                                UNIQUE (character_id, trait_name)
);

CREATE INDEX IF NOT EXISTS idx_traits_character ON character_traits(character_id);

CREATE TABLE IF NOT EXISTS character_runes (
                                               id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                               character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               rune_name     TEXT     NOT NULL,
                                               level         INTEGER  DEFAULT 1,
                                               UNIQUE (character_id, rune_name)
);

CREATE INDEX IF NOT EXISTS idx_runes_character ON character_runes(character_id);

CREATE TABLE IF NOT EXISTS character_items (
                                               id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                               character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               name          TEXT     NOT NULL,
                                               category      TEXT     NOT NULL,          -- weapon, armor, item
                                               quantity      INTEGER  DEFAULT 1,
                                               location      TEXT     DEFAULT 'bag',    -- equipped, bag, stash
                                               notes         TEXT,
                                               weapon_type   TEXT,                       -- "1 main", "2 mains", "Distance"
                                               damage        INTEGER,
                                               range         TEXT,
                                               armor_value   INTEGER  DEFAULT 0,
                                               requirements  TEXT,                       -- JSON : {"force": 2, "agilite": 1}
                                               custom_item   BOOLEAN  DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_items_character ON character_items(character_id);

-- Utilisée par la route partagée npc (stats opaques pour la route générique)
CREATE TABLE IF NOT EXISTS npc_templates (
                                             id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                             name          TEXT     NOT NULL,
                                             description   TEXT,
                                             combat_stats  TEXT     NOT NULL DEFAULT '{}',
                                             system_data   TEXT     DEFAULT '{}',
                                             created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_npc_templates_name ON npc_templates(name);

-- ═════════════════════════════════════════════════════════════════════════════
-- Tables transversales (base.sql — verbatim)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_sessions (
                                             id           INTEGER  PRIMARY KEY AUTOINCREMENT,
                                             name         TEXT     NOT NULL,
                                             access_code  TEXT     NOT NULL UNIQUE,
                                             access_url   TEXT     NOT NULL UNIQUE,
                                             date         DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             notes        TEXT,
                                             created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_id         ON game_sessions(id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                              character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                              token         TEXT     NOT NULL UNIQUE,
                                              expires_at    DATETIME NOT NULL,
                                              created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token        ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS dice_history (
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

CREATE INDEX IF NOT EXISTS idx_dice_history_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_created_at   ON dice_history(created_at DESC);

CREATE TABLE IF NOT EXISTS character_journal (
                                                 id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 session_id    INTEGER  REFERENCES game_sessions(id) ON DELETE SET NULL,
                                                 type          TEXT     NOT NULL DEFAULT 'note',
                                                 title         TEXT,
                                                 body          TEXT,
                                                 metadata      TEXT,
                                                 is_read       BOOLEAN  DEFAULT 0,
                                                 created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated_at   ON character_journal(updated_at DESC);

CREATE TABLE IF NOT EXISTS session_characters (
                                                  session_id    INTEGER  NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                  character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                  joined_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (session_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_session_characters_character_id ON session_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_session_characters_session_id   ON session_characters(session_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- Compte GM obligatoire
-- ═════════════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, prenom, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'MJ', '');
