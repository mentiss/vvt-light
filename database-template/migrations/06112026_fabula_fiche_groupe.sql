-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/06112026_fabula_fiche_groupe.sql
-- Fabula Ultima : fiche de groupe (une par table)
-- Spec : documentations/spec_fabula.md (§7)
--
--   • groupes (notes), groupe_objets (objets ajoutés par la table),
--     groupe_cadrans (cadrans, cachés ou non), groupe_journal (personnages,
--     créatures, lieux).
--
-- systems: fabula
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS groupes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
    notes       TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS groupe_objets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    pi          INTEGER NOT NULL DEFAULT 1,
    effet       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_objets ON groupe_objets(groupe_id);

CREATE TABLE IF NOT EXISTS groupe_cadrans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    sections    INTEGER NOT NULL DEFAULT 6,
    remplies    INTEGER NOT NULL DEFAULT 0,
    cache       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_cadrans ON groupe_cadrans(groupe_id);

CREATE TABLE IF NOT EXISTS groupe_journal (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    type        TEXT    NOT NULL DEFAULT 'personnage' CHECK(type IN ('personnage', 'creature', 'lieu')),
    notes       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_journal ON groupe_journal(groupe_id);
