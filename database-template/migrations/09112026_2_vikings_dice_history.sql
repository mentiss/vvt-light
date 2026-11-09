-- database-template/migrations/09112026_2_vikings_dice_history.sql
-- Anciens jets Vikings (avant le 2026-03-05) sans roll_result : leurs données ne
-- vivent que dans les colonnes héritées, supprimées par la migration suivante.
-- On reconstruit roll_result dans la forme que lit VikingsHistoryEntry (DE-5).
-- Les seuils d'explosion n'ont jamais été enregistrés : liste vide, rien d'inventé.
-- notation et raw_result restent vides (la notation exacte ne se reconstruit pas).
-- Libellé : ce qui avait été saisi (roll_target : « Jet MJ », nom de la compétence…).
--
-- systems: vikings

UPDATE dice_history
SET roll_result = json_object(
        'allDice',   CASE WHEN json_valid(results) THEN json(results) ELSE json_array() END,
        'successes', successes,
        'detail',    json_object(
            'pool',                pool,
            'threshold',           threshold,
            'rollTarget',          roll_target,
            'explosionThresholds', json_array()
        ),
        'meta',      json_object(
            'resourceSpent',  COALESCE(saga_spent, 0),
            'resourceGained', COALESCE(saga_recovered, 0)
        )
    ),
    label = roll_target
WHERE roll_result IS NULL;
