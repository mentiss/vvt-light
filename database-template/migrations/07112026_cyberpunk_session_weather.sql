-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/07112026_cyberpunk_session_weather.sql
-- Cyberpunk : météo de la table, choisie par le MJ
-- Spec : documentations/spec_cyberpunk.md (§3.1, Q-10)
--
--   Une ligne par table qui a choisi sa météo ; absente = 'auto'
--   (pluie la nuit, smog le jour).
--
-- systems: cyberpunk
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS session_weather (
    session_id INTEGER PRIMARY KEY REFERENCES game_sessions(id) ON DELETE CASCADE,
    weather    TEXT    NOT NULL DEFAULT 'auto' CHECK(weather IN ('auto', 'rain', 'smog', 'clear')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
