-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/03112026_woddavampire_equipment_items.sql
-- Vampire : l'Âge des Ténèbres : inventaire unique (armes, protections, objets)
-- Spec : documentations/spec_woddavampire.md (§II.13 C-1)
--
--   • character_equipment.kind accepte « item » (objet sans jet) ;
--   • character_equipment.quantity : nombre d'exemplaires (1 par défaut).
-- SQLite ne modifie pas une contrainte CHECK : la table est recréée, données
-- recopiées (ids compris).
--
-- Le slug n'existait pas en prod quand cette migration a été écrite : elle y est
-- ignorée (aucune base existante) et sert aux bases de dev.
--
-- systems: woddavampire
-- ═════════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = OFF;

CREATE TABLE character_equipment_new (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    kind         TEXT    NOT NULL DEFAULT 'weapon' CHECK(kind IN ('weapon', 'armor', 'shield', 'item')),
    item_key     TEXT    DEFAULT NULL,
    name         TEXT    DEFAULT '',
    difficulty   INTEGER DEFAULT NULL,
    damage       TEXT    DEFAULT '',
    range_m      INTEGER DEFAULT NULL,
    rating       INTEGER DEFAULT NULL,
    penalty      INTEGER DEFAULT NULL,
    quantity     INTEGER NOT NULL DEFAULT 1,
    equipped     INTEGER NOT NULL DEFAULT 1,
    notes        TEXT    DEFAULT '',
    ordre        INTEGER NOT NULL DEFAULT 0
);

INSERT INTO character_equipment_new (id, character_id, kind, item_key, name, difficulty, damage, range_m, rating, penalty, equipped, notes, ordre)
SELECT id, character_id, kind, item_key, name, difficulty, damage, range_m, rating, penalty, equipped, notes, ordre FROM character_equipment;

DROP TABLE character_equipment;
ALTER TABLE character_equipment_new RENAME TO character_equipment;
CREATE INDEX IF NOT EXISTS idx_vda_equipment_char ON character_equipment(character_id);

PRAGMA foreign_keys = ON;
