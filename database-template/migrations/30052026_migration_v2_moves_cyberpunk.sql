-- ============================================================
-- MIGRATION CORRECTIF : Refonte moves cyberpunk
-- Date      : 30/05/2026
-- Usage     : npm run migrate 30052026_correctif_moves.sql
-- ============================================================
-- Ce script corrige les erreurs du script précédent :
--   - Solution de repli (100) → viré au lieu d'updaté
--   - Mère Gigogne (44) → updaté au lieu d'inséré
--   - Solo Chromé (47) → updaté
--   - Investigator anciens moves (48-58) → virés
--   - Nomad anciens moves (59-71) → virés sauf 59/60 updatés
--   - Rockerboy (72,74,75,78) → virés, (76,77,79) → updatés
--   - Opportuniste (79) → UPDATE pas DELETE
-- ============================================================

-- ── 1. Suppression des character_moves orphelins ─────────────

DELETE FROM character_moves WHERE move_id IN (
    -- EDGERUNNER
                                              100, -- Solution de repli → viré
    -- INVESTIGATOR (tous les anciens)
                                              48,  -- Mais c'est bien sûr !
                                              49,  -- Toujours à l'écoute
                                              50,  -- Agrandissement, stop
                                              51,  -- Chasseur de gros gibier
                                              52,  -- Le sens de l'observation
                                              53,  -- Remonter la trace
                                              54,  -- Sale rat
                                              55,  -- Sous tous les angles
                                              56,  -- Théâtre d'opération humain
                                              57,  -- Tireur embusqué
                                              58,  -- Chromé Investigator (réinséré)
    -- NOMAD (anciens virés)
                                              61,  -- Clan
                                              63,  -- Casse-cou
                                              65,  -- L'outil adapté à la tâche
                                              66,  -- Opérateur de drones (Nomad)
                                              68,  -- Un putain d'as du volant (renommé As du volant → INSERT)
                                              69,  -- Réseau nomad (ancien passif → INSERT)
                                              70,  -- Terre brûlée
                                              71,  -- Chromé Nomad (réinséré)
    -- ROCKERBOY (virés)
                                              72,  -- Déterminé
                                              74,  -- Adeptes (id 74, pas 75 — attention au décalage CSV)
                                              75,  -- Agitateur
                                              78   -- Cercle intérieur
    );

-- ── 2. Suppression des moves virés ───────────────────────────

DELETE FROM moves WHERE id IN (
    -- EDGERUNNER
                               100, -- Solution de repli
    -- INVESTIGATOR (tous les anciens)
                               48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    -- NOMAD (anciens virés)
                               61, 63, 65, 66, 68, 69, 70, 71,
    -- ROCKERBOY (virés)
                               72, 74, 75, 78
    );

-- ── 3. UPDATE Mère Gigogne (id 44) ───────────────────────────
-- Était en INSERT dans le script précédent, doit être UPDATE
-- Supprimer le doublon inséré par le script précédent d'abord
DELETE FROM moves
WHERE type = 'official'
  AND playbook = 'Solo'
  AND name = 'Mère Gigogne'
  AND id != 44;

UPDATE moves SET
    description = 'Quand tu réussis Entrée subreptice, tu peux dépenser des retenues supplémentaires pour faire passer des membres de ton équipe avec toi. Le MC juge le coût selon les conditions et le nombre de personnes.'
WHERE id = 44;

-- ── 4. UPDATE Solo Chromé (id 47) ────────────────────────────
UPDATE moves SET
    description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.'
WHERE id = 47;

-- ── 5. UPDATE Nomad Rig (id 59) et Seconde peau (id 60) ──────
UPDATE moves SET
    description = 'Tu démarres avec un véhicule rigué connecté à ton interface neurale. Définis son profil avec le MC — puissance, aspect, défaut. C''est ton outil, ta maison, ton identité.'
WHERE id = 59;

UPDATE moves SET
    description = 'Quand tu es au volant de ton rig, tu peux t''appuyer sur les caractéristiques de ton véhicule pour absorber une conséquence ou créer une ouverture supplémentaire lors d''un jet d''Agir sous pression. Le MC juge ce que le rig permet selon ses tags.'
WHERE id = 60;

UPDATE moves SET
                 name  = 'Belle bagnole',
                 stat  = 'pro',
                 description = 'Quand tu bats le pavé dans ton rig. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'
WHERE id = 62;

UPDATE moves SET
                 name  = 'De glace',
                 description = 'Quand tu baratines quelqu''un par ta froideur et ta détermination. Lance 2d10+Cran au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'
WHERE id = 64;

UPDATE moves SET
                 name  = 'Un œil dans le ciel',
                 description = 'Quand tu aides ou interfères en utilisant un drone comme appui. Lance 2d10+Pro au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'
WHERE id = 67;

-- ── 6. UPDATE Rockerboy conservés ────────────────────────────

-- id 76 : Beau parleur
UPDATE moves SET
    description = 'Quand tu réussis un Baratiner, tu obtiens automatiquement une [info] supplémentaire sur ton interlocuteur.'
WHERE id = 76;

-- id 77 : Célèbre
UPDATE moves SET
    description = 'Ton nom et ton image sont connus. Ce statut devient un tag narratif sur ton personnage — il ouvre des portes, attire les regards, mais fait aussi de toi une cible.'
WHERE id = 77;

-- id 79 : Opportuniste
UPDATE moves SET
    description = 'Quand tu aides ou interfères avec quelqu''un. Lance 2d10+Pro au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'
WHERE id = 79;

-- ── 7. Suppression des doublons insérés par le script précédent
-- Le script précédent a inséré des moves Nomad et Rockerboy
-- qui doublonnent avec les UPDATEs ci-dessus.
-- On supprime les INSERT en double par nom/playbook
-- en gardant toujours l'ID le plus bas (l'original updaté).

DELETE FROM moves
WHERE type = 'official'
  AND playbook = 'Nomad'
  AND name IN ('Rig', 'Seconde peau', 'Belle bagnole', 'De glace', 'Un œil dans le ciel')
  AND id NOT IN (59, 60, 62, 64, 67);

DELETE FROM moves
WHERE type = 'official'
  AND playbook = 'Rockerboy'
  AND name IN ('Beau parleur', 'Célèbre', 'Opportuniste')
  AND id NOT IN (76, 77, 79);

-- Supprimer aussi le doublon Chromé Solo inséré par erreur
DELETE FROM moves
WHERE type = 'official'
  AND playbook = 'Solo'
  AND name = 'Chromé'
  AND id != 47;

-- Supprimer le doublon Solution de repli Edgerunner si inséré
DELETE FROM moves
WHERE type = 'official'
  AND playbook = 'Edgerunner'
  AND name = 'Solution de repli';

-- ── Fin du script correctif ───────────────────────────────────
-- Pour vérifier après migration, lancer manuellement :
-- SELECT COALESCE(playbook, 'BASE') as playbook, COUNT(*) as total
-- FROM moves WHERE type = 'official'
-- GROUP BY playbook ORDER BY playbook;