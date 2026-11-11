-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/10112026_audio_track_source.sql
-- Base du module audio : titres venus d'autres plateformes que YouTube
-- Spec : documentations/spec_audio.md (§14.3)
--
--   • audio_tracks.youtube_id renommée media_id : identifiant YouTube, adresse
--     Vimeo ou SoundCloud
--   • audio_tracks.source : youtube | vimeo | soundcloud ;
--     les titres existants restent youtube
--
-- systems: audio
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE audio_tracks RENAME COLUMN youtube_id TO media_id;
ALTER TABLE audio_tracks ADD COLUMN source TEXT not null default 'youtube';
