-- database-template/migrations/09112026_1_dice_history_label_raw.sql
-- Historique des jets, passe générique (spec_diceengine_v2.md, « Passe générique ») :
-- deux colonnes de la plateforme.
--   label      : libellé lisible de l'entrée, donné par le slug (H-4)
--   raw_result : résultat brut de la bibliothèque de dés, écrit par le moteur (DE-10)
-- Les entrées existantes reprennent le libellé déjà saisi dans roll_result quand
-- c'est un texte (DE-11) ; les autres restent sans libellé (affichage : roll_type).
--
-- systems: all

ALTER TABLE dice_history ADD COLUMN label TEXT;
ALTER TABLE dice_history ADD COLUMN raw_result TEXT;

UPDATE dice_history
SET label = json_extract(roll_result, '$.label')
WHERE json_valid(roll_result)
  AND json_type(roll_result, '$.label') = 'text';

-- Entrées sans dé : la notation ne porte plus de texte de remplissage (H-2).
-- Fabula (porte-bonheur, objet utilisé) et Vileborn (Rêverie, Pulsion).
UPDATE dice_history
SET notation = NULL
WHERE notation IN ('porte-bonheur', 'objet', '—');
