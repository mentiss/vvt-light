-- database-template/migrations/13112026_journal_refonte.sql
-- Refonte du journal (documentations/plateforme/spec_journal.md, partie III §10).
--
-- Journal privé (character_journal) :
--   • category  : catégorie fixe d'une note (notes, personnages, lieux, indices, quetes),
--                 null pour un message ou un objet du MJ ; une note sans catégorie se lit « notes »
--   • pinned    : note épinglée (en tête de liste)
--   • body_text : texte brut du corps (aperçu, recherche, liste légère), écrit par le
--                 serveur ; rempli à la première lecture pour les entrées existantes
--
-- systems: all

ALTER TABLE character_journal ADD COLUMN category TEXT;
ALTER TABLE character_journal ADD COLUMN pinned INTEGER DEFAULT 0;
ALTER TABLE character_journal ADD COLUMN body_text TEXT;
