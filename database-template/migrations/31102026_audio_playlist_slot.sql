-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/31102026_audio_playlist_slot.sql
-- Base du module audio : piste par défaut d'une playlist
-- Spec : documentations/spec_audio.md (§11.15)
--
--   • audio_playlists.default_slot : piste où jouent ses titres (music,
--     ambience1, ambience2, effect) ; 'music' pour les playlists existantes
--
-- La base audio n'existait pas en prod quand cette migration a été écrite : elle
-- y est ignorée (aucune base existante) et sert aux bases de dev.
--
-- systems: audio
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE audio_playlists ADD COLUMN default_slot TEXT NOT NULL DEFAULT 'music';
