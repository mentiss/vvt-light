-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/zoneblanche-schema.sql
-- Schéma Zone Blanche — Mentiss VTT
-- Moteur 2D20 Modiphius — enquête paranormale télévisée
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Table principale ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (

    -- Colonnes plateforme (issues de base.sql — verbatim, ne pas modifier)
                                          id                    INTEGER  PRIMARY KEY AUTOINCREMENT,
                                          access_code           TEXT     NOT NULL UNIQUE,
                                          access_url            TEXT     NOT NULL UNIQUE,
                                          player_name           TEXT     NOT NULL,
                                          avatar                TEXT,
                                          nom                   TEXT     NOT NULL DEFAULT '',
                                          prenom                TEXT,
                                          sexe                  TEXT,
                                          age                   INTEGER,
                                          taille                INTEGER,
                                          poids                 INTEGER,
                                          login_attempts        INTEGER  DEFAULT 0,
                                          last_attempt_at       DATETIME,
                                          last_accessed         DATETIME,
                                          created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- ── Identité du personnage ──────────────────────────────────────────────
                                          description            TEXT     DEFAULT '',   -- texte libre narratif
                                          archetype               TEXT     DEFAULT '',   -- clé parmi les 8 archétypes fixes (catalogue config.jsx)

    -- ── Principes (matrice 4×4) — rang + maxime (texte libre, 1:1) ──────────
                                          logique_rang            INTEGER  DEFAULT 3,
                                          logique_maxime           TEXT     DEFAULT '',
                                          instinct_rang            INTEGER  DEFAULT 3,
                                          instinct_maxime           TEXT     DEFAULT '',
                                          technique_rang            INTEGER  DEFAULT 3,
                                          technique_maxime           TEXT     DEFAULT '',
                                          presence_rang              INTEGER  DEFAULT 3,
                                          presence_maxime             TEXT     DEFAULT '',

    -- ── Compétences (matrice 4×4) ───────────────────────────────────────────
                                          investigation_rang           INTEGER  DEFAULT 3,
                                          operation_rang                 INTEGER  DEFAULT 3,
                                          deplacement_rang                INTEGER  DEFAULT 3,
                                          esoterisme_rang                  INTEGER  DEFAULT 3,

    -- ── Prime Time (Fortune) ────────────────────────────────────────────────
    -- Valeur de départ 3, pas de plafond dur en BDD (borne appliquée côté UI uniquement)
                                          prime_time                        INTEGER  DEFAULT 3
);

CREATE INDEX IF NOT EXISTS idx_zb_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_zb_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_zb_characters_updated_at  ON characters(updated_at DESC);

-- ── Vérités ──────────────────────────────────────────────────────────────────
-- Texte libre (le catalogue archétype sert de picklist UI, pas de contrainte BDD).
-- Table dédiée : plusieurs vérités possibles par personnage.

CREATE TABLE IF NOT EXISTS character_verites (
                                                 id             INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id   INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 nom            TEXT     NOT NULL DEFAULT '',
                                                 texte          TEXT     DEFAULT '',
                                                 created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zb_verites_character_id ON character_verites(character_id);

-- ── Focus ────────────────────────────────────────────────────────────────────
-- Texte libre (le catalogue compétence sert de picklist UI, pas de contrainte BDD).
-- competence_key rattache le focus à sa carte Compétence pour l'affichage.

CREATE TABLE IF NOT EXISTS character_focus (
                                               id                INTEGER  PRIMARY KEY AUTOINCREMENT,
                                               character_id      INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               competence_key    TEXT     NOT NULL,   -- investigation | operation | deplacement | esoterisme
                                               texte             TEXT     NOT NULL DEFAULT '',
                                               created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zb_focus_character_id ON character_focus(character_id);

-- ── Talents ──────────────────────────────────────────────────────────────────
-- Références pures vers le catalogue (archétype + numéro) — 2 à la création.
-- Pas de "sur mesure" prévu par la spec pour les talents.

CREATE TABLE IF NOT EXISTS character_talents (
                                                 id             INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 character_id   INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 talent_key     TEXT     NOT NULL,
                                                 created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 UNIQUE(character_id, talent_key)
);

CREATE INDEX IF NOT EXISTS idx_zb_talents_character_id ON character_talents(character_id);

-- ── Ressources de session — Audimat / Stress ────────────────────────────────
-- Audimat : pool joueurs, plafond 6 (appliqué côté route), démarre à 0.
-- Stress : pool MJ, visible des deux côtés, seul le MJ modifie, démarre à 6.

CREATE TABLE IF NOT EXISTS session_resources (
                                                 id             INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                 session_id     INTEGER  NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                 audimat        INTEGER  DEFAULT 0,
                                                 stress         INTEGER  DEFAULT 6,
                                                 updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zb_resources_session_id ON session_resources(session_id);

-- ── Matériel — Budget de session ────────────────────────────────────────────
-- Singleton par session (pattern session_group_reserve / Noctis). Défaut = budget standard (18).

CREATE TABLE IF NOT EXISTS session_equipment_budget (
                                                        session_id     INTEGER  PRIMARY KEY REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                        budget         INTEGER  NOT NULL DEFAULT 18,
                                                        updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Matériel — Pool d'équipe (session) ──────────────────────────────────────
-- Une ligne par entrée. item_key renseigné = catalogue, NULL = item libre (label/cost saisis).
-- label et cost sont copiés au moment de l'ajout (le catalogue reste la source de vérité,
-- cette copie évite une dépendance à un item catalogue qui changerait plus tard).

CREATE TABLE IF NOT EXISTS session_equipment_pool (
                                                      id                       INTEGER  PRIMARY KEY AUTOINCREMENT,
                                                      session_id               INTEGER  NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                      item_key                 TEXT     DEFAULT NULL,
                                                      label                    TEXT     NOT NULL DEFAULT '',
                                                      cost                     INTEGER  NOT NULL DEFAULT 0,
                                                      quantity                 INTEGER  NOT NULL DEFAULT 1,
                                                      added_by_character_id    INTEGER  REFERENCES characters(id) ON DELETE SET NULL,
                                                      created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zb_equipment_pool_session_id ON session_equipment_pool(session_id);

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

CREATE INDEX IF NOT EXISTS idx_zb_game_sessions_id         ON game_sessions(id);
CREATE INDEX IF NOT EXISTS idx_zb_game_sessions_updated_at ON game_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id            INTEGER  PRIMARY KEY AUTOINCREMENT,
                                              character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                              token         TEXT     NOT NULL UNIQUE,
                                              expires_at    DATETIME NOT NULL,
                                              created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_zb_refresh_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_zb_refresh_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_zb_refresh_tokens_token        ON refresh_tokens(token);

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

CREATE INDEX IF NOT EXISTS idx_zb_dice_history_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_zb_dice_history_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_zb_dice_history_created_at   ON dice_history(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_zb_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_zb_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_zb_journal_updated_at   ON character_journal(updated_at DESC);

CREATE TABLE IF NOT EXISTS session_characters (
                                                  session_id    INTEGER  NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                  character_id  INTEGER  NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                  joined_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (session_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_zb_session_characters_character_id ON session_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_zb_session_characters_session_id   ON session_characters(session_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- Compte GM obligatoire
-- ═════════════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'MJ');