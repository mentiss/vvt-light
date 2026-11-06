-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/05112026_fabula_arcana_renvoi.sql
-- Fabula Ultima : cycle des Arcana Lié → Fusionné → Renvoi → Lié
-- Spec : documentations/spec_fabula.md (§3.2)
--
--   • character_arcana.etat accepte « renvoi » (effet de renvoi à utiliser).
-- SQLite ne modifie pas une contrainte CHECK : la table est recréée, données
-- recopiées (ids compris).
--
-- systems: fabula
-- ═════════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = OFF;

CREATE TABLE character_arcana_new (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    arcanum_key  TEXT    NOT NULL,
    etat         TEXT    NOT NULL DEFAULT 'lie' CHECK(etat IN ('lie', 'fusionne', 'renvoi')),
    UNIQUE(character_id, arcanum_key)
);

INSERT INTO character_arcana_new (id, character_id, arcanum_key, etat)
SELECT id, character_id, arcanum_key, etat FROM character_arcana;

DROP TABLE character_arcana;
ALTER TABLE character_arcana_new RENAME TO character_arcana;
CREATE INDEX IF NOT EXISTS idx_fabula_arcana_char ON character_arcana(character_id);

PRAGMA foreign_keys = ON;
