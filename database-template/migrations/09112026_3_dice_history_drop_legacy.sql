-- database-template/migrations/09112026_3_dice_history_drop_legacy.sql
-- Historique des jets, passe générique (spec_diceengine_v2.md, H-3) : suppression
-- des colonnes héritées de Vikings et de roll_definition. Tout ce que le rendu d'un
-- slug lit vit dans roll_result. Doit passer après 09112026_2_vikings_dice_history.sql,
-- qui reprend les anciens jets Vikings. Aucune de ces colonnes n'est indexée.
--
-- systems: all

ALTER TABLE dice_history DROP COLUMN roll_definition;
ALTER TABLE dice_history DROP COLUMN roll_target;
ALTER TABLE dice_history DROP COLUMN pool;
ALTER TABLE dice_history DROP COLUMN threshold;
ALTER TABLE dice_history DROP COLUMN results;
ALTER TABLE dice_history DROP COLUMN successes;
ALTER TABLE dice_history DROP COLUMN saga_spent;
ALTER TABLE dice_history DROP COLUMN saga_recovered;
