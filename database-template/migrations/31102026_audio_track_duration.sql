-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/31102026_audio_track_duration.sql
-- Base du module audio : durée des vidéos, affichée dans la bibliothèque
-- Spec : documentations/spec_audio.md (§11.14)
--
--   • audio_tracks.duration : secondes, connue à la première lecture ou à
--     l'affichage de la playlist (null : inconnue)
--
-- La base audio n'existait pas en prod quand cette migration a été écrite : elle
-- y est ignorée (aucune base existante) et sert aux bases de dev.
--
-- systems: audio
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE audio_tracks ADD COLUMN duration REAL;
