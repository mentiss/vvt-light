-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/05112026_fabula_porte_bonheur.sql
-- Fabula Ultima : Nombre porte-bonheur de l'Entropiste
-- Spec : documentations/spec_fabula.md (§3.3)
--
--   • characters.porte_bonheur : le nombre (7 en début de séance, puis la valeur
--     du dé remplacé) ;
--   • characters.porte_bonheur_utilise : 1 s'il a déjà servi dans la scène.
--
-- systems: fabula
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE characters ADD COLUMN porte_bonheur INTEGER DEFAULT 7;
ALTER TABLE characters ADD COLUMN porte_bonheur_utilise INTEGER DEFAULT 0;
