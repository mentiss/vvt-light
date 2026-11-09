-- database-template/migrations/09112026_drop_old_npc.sql
-- Ancien système de PNJ de la plateforme supprimé (spec_pnj.md §5, lot 0) :
-- tables des modèles et des sets. Elles n'existent que dans les bases où les
-- anciennes migrations ont été jouées (vikings, dune, tecumah) : IF EXISTS rend
-- la migration sans effet ailleurs. Données jetées (non utilisées).
--
-- systems: all

DROP TABLE IF EXISTS npc_set_entries;
DROP TABLE IF EXISTS npc_sets;
DROP TABLE IF EXISTS npc_templates;
