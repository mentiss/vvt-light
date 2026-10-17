-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/17102026_vikings_combat_mods.sql
-- Pure Vikings — Refonte lot 3b : ajustements des valeurs de combat
-- Spec : documentations/spec_vikings_lot3_client.md (§6.1, §9, L3-6, L3-7)
--
--   • characters : armure_mod, actions_mod, seuil_mod (bonus/malus saisi en
--                  mode édition, ajouté au calcul automatique) — 0 pour les
--                  personnages existants (L3-7)
--
-- À exécuter UNIQUEMENT sur Vikings, après la migration 17102026_vikings_refonte_schema.sql
-- et après sauvegarde de la base :
--   npm run migrate -- 17102026_vikings_combat_mods.sql --system=vikings
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE characters ADD COLUMN armure_mod  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN actions_mod INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN seuil_mod   INTEGER NOT NULL DEFAULT 0;
