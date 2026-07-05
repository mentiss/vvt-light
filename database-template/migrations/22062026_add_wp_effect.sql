-- Ajout de la colonne `effect` : effets innés (toujours actifs, ex. Panzerfaust
-- = Piercing 1 + Vicious), distincts du `salvo` (optionnel, choisi par tir,
-- coûte 1 munition). Même lexique de clés que salvo (cf SALVO_EFFECTS).
-- Aucune conversion de données existante nécessaire : concept inexistant avant.

ALTER TABLE character_weapons ADD COLUMN effect TEXT DEFAULT '[]';