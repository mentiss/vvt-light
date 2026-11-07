-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/06112026_cyberpunk_move_console.sql
-- Cyberpunk : console de manœuvres personnalisable
-- Spec : documentations/spec_cyberpunk.md (§4, Q-12)
--
--   Liste ordonnée (JSON) des identifiants de manœuvre posés à côté des stats.
--   NULL = réglage de base (les manœuvres de base, comme avant la refonte).
--
-- systems: cyberpunk
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE characters ADD COLUMN move_console TEXT DEFAULT NULL;
