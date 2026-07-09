-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/fabula-schema.sql
-- Schéma Fabula Ultima — Mentiss VTT
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

    -- Traits narratifs
                                          identite             TEXT     DEFAULT '',
                                          origine              TEXT     DEFAULT '',
                                          theme                TEXT     DEFAULT '',
                                          niveau_global        INTEGER  DEFAULT 5,

    -- Attributs (taille de dé : 6/8/10/12)
                                          dex_de               INTEGER  DEFAULT 8,
                                          int_de               INTEGER  DEFAULT 8,
                                          pui_de               INTEGER  DEFAULT 8,
                                          vol_de               INTEGER  DEFAULT 8,

    -- Statistiques dérivées (persistées, recalculées au save)
                                          pv_max               INTEGER  DEFAULT 0,
                                          pv_actuel            INTEGER  DEFAULT 0,
                                          pm_max               INTEGER  DEFAULT 0,
                                          pm_actuel            INTEGER  DEFAULT 0,
                                          pi_max               INTEGER  DEFAULT 6,
                                          pi_actuel            INTEGER  DEFAULT 6,
                                          seuil_crise          INTEGER  DEFAULT 0,
                                          initiative           INTEGER  DEFAULT 0,
                                          defense              INTEGER  DEFAULT 0,
                                          defense_magique      INTEGER  DEFAULT 0,

    -- Économie narrative
                                          zenit                INTEGER  DEFAULT 0,
                                          points_fabula        INTEGER  DEFAULT 3,

                                          groupe_nom           TEXT     DEFAULT '',
                                          alterations_etat     TEXT     DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- Compte GM obligatoire
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Meneur de Jeu');

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
-- Tables spécifiques Fabula Ultima
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS character_classes (
                                                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 class_key    TEXT    NOT NULL,
                                                 niveau       INTEGER NOT NULL DEFAULT 0,
                                                 UNIQUE(character_id, class_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_classes_char ON character_classes(character_id);

CREATE TABLE IF NOT EXISTS character_skills (
                                                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                class_key    TEXT    NOT NULL,
                                                skill_key    TEXT    NOT NULL,
                                                rang         INTEGER NOT NULL DEFAULT 0,
    -- Sorts choisis quand la compétence donne accès à une spellList (ex. "Magie
    -- élémentaire"). JSON array de spell_key (catalogue) ou, pour le Chimériste
    -- (pas de catalogue fixe), d'objets libres {nom, description}.
                                                spells_choisis TEXT  DEFAULT '[]',
                                                UNIQUE(character_id, class_key, skill_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_skills_char ON character_skills(character_id);

CREATE TABLE IF NOT EXISTS character_arcana (
                                                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                arcanum_key  TEXT    NOT NULL,
                                                etat         TEXT    NOT NULL DEFAULT 'lie' CHECK(etat IN ('lie', 'fusionne')),
                                                UNIQUE(character_id, arcanum_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_arcana_char ON character_arcana(character_id);

CREATE TABLE IF NOT EXISTS character_bonds (
                                               id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                               character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               cible_nom    TEXT    NOT NULL DEFAULT '',
                                               cible_type   TEXT    DEFAULT 'pnj' CHECK(cible_type IN ('pj','pnj','lieu','organisation')),
                                               sentiments   TEXT    DEFAULT '[]',
                                               notes        TEXT    DEFAULT '',
                                               created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fabula_bonds_char ON character_bonds(character_id);

CREATE TABLE IF NOT EXISTS character_equipment (
                                                   id               INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   character_id     INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                   type_emplacement TEXT    NOT NULL CHECK(type_emplacement IN ('arme','armure','bouclier','accessoire')),
                                                   equipment_key    TEXT    DEFAULT NULL,
                                                   nom_libre        TEXT    DEFAULT '',
                                                   notes_libres     TEXT    DEFAULT '',
                                                   prix             INTEGER DEFAULT 0,   -- coût en zénits, saisi manuellement en V1
    -- Bonus manuels (V1 saisie libre — pas de catalogue structuré pour calculer
    -- automatiquement ces modificateurs). Le Lot 4 pourra les préremplir depuis
    -- equipment.js quand equipment_key est renseigné, mais ces colonnes restent
    -- éditables dans tous les cas.
                                                   mod_defense           INTEGER DEFAULT 0,
                                                   mod_defense_magique   INTEGER DEFAULT 0,
                                                   mod_initiative        INTEGER DEFAULT 0,
                                                   equipe           BOOLEAN DEFAULT 1,
                                                   ordre            INTEGER DEFAULT 0,
                                                   created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fabula_equipment_char ON character_equipment(character_id);