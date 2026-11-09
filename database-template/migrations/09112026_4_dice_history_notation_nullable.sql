-- database-template/migrations/09112026_4_dice_history_notation_nullable.sql
-- Cyberpunk : notation déclarée NOT NULL, alors qu'une entrée d'historique sans dé
-- n'en a pas (spec_diceengine_v2.md, H-2). SQLite ne sait pas retirer la contrainte :
-- la table est reconstruite (création, copie, échange), clés ON DELETE SET NULL
-- gardées (écart B-FK documenté) et index recréés. Après la migration 3.
--
-- systems: cyberpunk

CREATE TABLE dice_history_new (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
    character_id INTEGER REFERENCES characters(id)    ON DELETE SET NULL,
    roll_type    TEXT    DEFAULT NULL,
    notation     TEXT,
    roll_result  TEXT    DEFAULT NULL,
    label        TEXT,
    raw_result   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dice_history_new (id, session_id, character_id, roll_type, notation, roll_result, label, raw_result, created_at)
SELECT id, session_id, character_id, roll_type, notation, roll_result, label, raw_result, created_at
FROM dice_history;

DROP TABLE dice_history;
ALTER TABLE dice_history_new RENAME TO dice_history;

CREATE INDEX IF NOT EXISTS idx_dice_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_created_at   ON dice_history(created_at DESC);
