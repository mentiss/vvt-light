-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/03112026_woddavampire_coterie.sql
-- Vampire : l'Âge des Ténèbres : coterie, fiche du groupe (une par table de jeu)
-- Spec : documentations/spec_woddavampire.md (§20, §II.17.3)
--
--   • coteries : nom, description, emblème, Historique ancre, notes ;
--   • coterie_backgrounds : détail et ajustement d'histoire par Historique commun ;
--   • coterie_contributions : mises des membres.
--
-- Le slug n'existait pas en prod quand cette migration a été écrite : elle sert
-- aux bases de dev.
--
-- systems: woddavampire
-- ═════════════════════════════════════════════════════════════════════════════

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
