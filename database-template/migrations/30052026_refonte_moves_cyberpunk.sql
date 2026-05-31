-- ============================================================
-- MIGRATION : Refonte complète des moves cyberpunk
-- Date      : 30/05/2026
-- Usage     : npm run migrate 30052026_refonte_moves.sql
-- ============================================================
-- Stratégie chirurgicale :
--   - UPDATE  : moves conservés/reformulés (IDs préservés)
--   - DELETE  : moves virés uniquement
--   - INSERT  : nouveaux moves uniquement
--   - character_moves : suppression uniquement des associations
--                       aux moves virés
-- ============================================================

-- ── 1. Suppression des character_moves orphelins ─────────────
-- Seuls les moves vraiment virés sont listés ici.
-- Les moves reformulés gardent leur ID et leurs associations.

DELETE FROM character_moves WHERE move_id IN (
    -- FIXER — système Magouilles/équipe/jobs
                                              14, -- Magouilles
                                              15, -- Baron des rues
                                              16, -- Face-à-face
                                              17, -- Ingénieur technico-commercial
                                              18, -- Injoignable
                                              19, -- Jongler avec plusieurs balles
                                              20, -- Le bruit qui court
                                              21, -- Mielleux
                                              22, -- Renforts
                                              23, -- Réputation (Fixer)
    -- NETRUNNER
                                              29, -- Ceinture noire
                                              34, -- Tueur d'ICE
    -- SOLO
                                              39, -- Agent furtif
                                              40, -- Assassin (move Solo)
                                              41, -- Branché
                                              42, -- Guerre psychologique
                                              43, -- Maître des artifices (ancien, remplacé)
                                              45, -- Extraction
    -- ASSASSIN
                                              115, -- Contrat
                                              117, -- Armé jusqu'aux dents
                                              118, -- Dépourvu de sentiments
                                              119, -- Dur à cuire
                                              121, -- Secrets corporatifs
                                              122, -- Vétéran de la 4ème Corpo War
                                              124, -- Regard de dur (remplacé par Contrôler le terrain)
    -- EDGERUNNER
                                              94,  -- Glissant comme une anguille
                                              95,  -- Membre des Forces Spéciales
                                              97,  -- Présence rassurante
                                              99,  -- Savoirs corporatifs
                                              101, -- Trop augmenté pour reculer
                                              102, -- Réputation de terrain
    -- ROCKERBOY
                                              75,  -- Adeptes
                                              79,  -- Opportuniste (remplacé)
                                              80,  -- Sociable
                                              81,  -- Un million de points lumineux
    -- MEDIA
                                              84,  -- Rassembler les preuves
                                              85,  -- 24h/24 7j/7
                                              86,  -- Carte de presse (remplacé)
                                              88,  -- Fouille-merde (ancien)
    -- TECHIE
                                              111, -- Obsessionnel (remplacé passif)
    -- INVESTIGATOR (tous nouveaux, pas d'anciens IDs)
    -- NOMAD
                                              47,  -- Seconde peau (ancien)
                                              48,  -- Clan
                                              49,  -- Belle bagnole (ancien)
                                              50,  -- Casse-cou
                                              51,  -- De glace (ancien)
                                              52,  -- L'outil adapté à la tâche
                                              53,  -- Opérateur de drones (Nomad)
                                              54,  -- Un œil dans le ciel (ancien)
                                              55,  -- Réseau nomad (ancien)
                                              56   -- Terre brûlée
    );

-- ── 2. Suppression des moves virés ───────────────────────────

DELETE FROM moves WHERE id IN (
    -- FIXER
                               14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    -- NETRUNNER
                               29, 34,
    -- SOLO
                               39, 40, 41, 42, 43, 45,
    -- ASSASSIN
                               115, 117, 118, 119, 121, 122, 124,
    -- EDGERUNNER
                               94, 95, 97, 99, 101, 102,
    -- ROCKERBOY
                               75, 79, 80, 81,
    -- MEDIA
                               84, 85, 86, 88,
    -- TECHIE
                               111,
    -- NOMAD
                               47, 48, 49, 50, 51, 52, 53, 54, 55, 56
    );

-- ── 3. UPDATE des moves de base ──────────────────────────────

UPDATE moves SET
    description = 'Quand tu agis dans une situation dangereuse, urgente ou stressante. 15+ : tu fais ce que tu voulais. 10-14 : complication ou coût. 9- : le MC agit librement.'
WHERE id = 1;

UPDATE moves SET
    description = 'Quand tu t''engages dans un affrontement physique violent. 15+ : tu obtiens ce que tu veux. 10-14 : les deux parties s''infligent mutuellement des conséquences. 9- : le MC agit.'
WHERE id = 2;

UPDATE moves SET
    description = 'Quand tu manipules, persuades, mens ou séduis pour obtenir quelque chose d''un PNJ. 15+ : il fait ce que tu veux. 10-14 : il le fait mais avec une condition ou un coût. 9- : le MC agit.'
WHERE id = 3;

UPDATE moves SET
    description = 'Quand tu cherches une information ou actives ton réseau dans la rue. 15+ : tu obtiens ce que tu cherches. 10-14 : l''info est obtenue mais crée une obligation ou une dette. 9- : le MC agit.'
WHERE id = 4;

UPDATE moves SET
    description = 'Quand tu observes et analyses une situation pour en extraire des informations exploitables. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit pendant ton évaluation. Dépense une retenue pour poser une question au MC, qui répond honnêtement.'
WHERE id = 5;

UPDATE moves SET
    description = 'Quand tu intimides, menaces ou fais valoir ton autorité face à un PNJ. 15+ : il cède complètement. 10-14 : il cède mais avec une condition ou une contrepartie. 9- : le MC agit.'
WHERE id = 6;

UPDATE moves SET
    description = 'Quand tu négocies un contrat avec un fixeur ou un commanditaire. 15+ : contrat aux conditions souhaitées. 10-14 : contrat obtenu mais avec une contrainte (délai serré, info incomplète, clause défavorable). 9- : le MC agit.'
WHERE id = 7;

UPDATE moves SET
    description = 'Quand tu cherches une information par des moyens analytiques ou mentaux. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : tu trouves quelque chose mais le MC décide ce que tu déclenches en cherchant.'
WHERE id = 8;

UPDATE moves SET
    description = 'Quand tu apportes ton soutien actif à un autre joueur ou lui mets des bâtons dans les roues. Utilise ton score de Lien avec cette personne. Sur un succès en aide : +1 au jet. Sur un succès en interférence : -2 au jet. Dans les deux cas tu t''exposes aux mêmes conséquences que la cible.'
WHERE id = 9;

UPDATE moves SET
    description = 'Quand tu stabilises ou soignes un personnage blessé en conditions de terrain. 15+ : ça fonctionne proprement. 10-14 : ça fonctionne mais au prix d''un coût (temps perdu, matériel épuisé, bruit fait). 9- : le MC agit.'
WHERE id = 10;

UPDATE moves SET
    description = 'Quand tu introduis rétroactivement un élément que tu avais préparé avant la scène en cours — matériel planqué, contact établi, information obtenue, lieu reconnu, accord passé. Dépense [matos], [info] ou Cred selon ce qui est disponible. Un ajout simple et plausible est validé sans jet. Un ajout ambitieux nécessite un jet avec la stat appropriée. 10-14 : l''ajout est valide mais avec une contrainte. 9- : le MC agit.'
WHERE id = 11;

UPDATE moves SET
    description = 'Déclenché quand ton personnage fait face à une conséquence potentiellement fatale. 15+ : tu survives, peut-être abîmé. 10-14 : tu survives au prix d''un coût narratif important. 9- : le MC décide de ton sort.'
WHERE id = 12;

UPDATE moves SET
    description = 'Quand tu accèdes à des soins sérieux ou à l''installation de cyberware. Le coût se paie en Cred — la qualité dépend de ce que tu peux te permettre. 10-14 : l''intervention se fait mais avec une complication.'
WHERE id = 13;

-- ── 4. UPDATE FIXER ──────────────────────────────────────────
-- id 24 : Chromé — texte inchangé, on skip

-- ── 5. UPDATE NETRUNNER ──────────────────────────────────────

UPDATE moves SET
    description = 'Quand tu tentes d''accéder à un système sécurisé. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : l''ICE s''active. Dépense tes retenues pour agir dans le système — le MC juge le coût selon la nature et la sécurité de l''action.'
WHERE id = 25; -- Pénétrer un système

UPDATE moves SET
    description = 'Quand tu fouilles un système pour récupérer des informations. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : tu trouves quelque chose mais le MC décide ce que tu déclenches en cherchant.'
WHERE id = 26; -- Extraire des données

UPDATE moves SET
                 name = 'Contre-mesures',
                 stat = 'esprit',
                 description = 'Quand tu résistes à une ICE qui s''exécute contre toi. 15+ : aucune conséquence. 10-14 : tu t''en sors mais au prix d''un coût (instabilité de connexion, exposition partielle). 9- : le MC décide des conséquences.'
WHERE id = 27; -- Contre-mesures (stat cran → esprit)

UPDATE moves SET
    description = 'Ton interface a un niveau de furtivité élevé. Ta connexion est difficile à tracer — il faut des moyens importants pour remonter jusqu''à toi.'
WHERE id = 28; -- Anonyme

UPDATE moves SET
    description = 'Quand tu effectues une recherche approfondie dans le Net sur un sujet précis. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'
WHERE id = 30; -- Optimisation de recherche

UPDATE moves SET
    description = 'Quand tu pénètres un système avec succès, tu obtiens toujours 1 retenue supplémentaire.'
WHERE id = 31; -- Programmation à la volée

UPDATE moves SET
    description = 'Quand tu opères dans le Net avec un avatar reconnaissable. Lance 2d10+Synth pour Baratiner et Montrer les dents dans l''espace numérique. Les seuils et effets sont identiques aux moves de base correspondants.'
WHERE id = 32; -- Renom

UPDATE moves SET
    description = 'Quand tu aides un membre de l''équipe depuis le Net. Lance 2d10+Esprit au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'
WHERE id = 33; -- Support technique

UPDATE moves SET
    description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort. Si tu utilises un Cyberdeck externe, ce move te permet de prendre ton premier cyberware sans coût de slot supplémentaire.'
WHERE id = 35; -- Chromé Netrunner

-- ── 6. UPDATE SOLO ───────────────────────────────────────────

UPDATE moves SET
    description = 'Quand tu t''introduis dans un lieu sécurisé sans te faire repérer. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour agir discrètement dans le lieu — le MC juge le coût selon la difficulté et le niveau de sécurité.'
WHERE id = 36; -- Entrée subreptice

UPDATE moves SET
    description = 'Tu peux dépenser des retenues d''Entrée subreptice pour obtenir du [matos] — équipement récupéré sur place, accès sécurisé, matériel trouvé durant l''infiltration. Le MC juge la valeur de l''échange selon la situation.'
WHERE id = 37; -- Haute voltige

UPDATE moves SET
    description = 'Tu peux dépenser des retenues d''Entrée subreptice pour obtenir des [info] — ce que tu as observé, entendu ou intercepté durant l''infiltration. Le MC juge la valeur de l''échange selon la situation.'
WHERE id = 38; -- Imposteur

UPDATE moves SET
    description = 'Quand tu reconnais un lieu ou une installation avant une opération. 15+ : 3 [info] sur les failles de sécurité, les routines et les points d''entrée. 10-14 : 1 [info]. 9- : le MC agit.'
WHERE id = 46; -- Repérage

-- ── 7. UPDATE ASSASSIN ───────────────────────────────────────

UPDATE moves SET
    description = 'Tu démarres avec une arme sur mesure. Définis sa base et deux options avec le MC. Donne-lui un nom — elle a une histoire.'
WHERE id = 114; -- Arme personnalisée

UPDATE moves SET
    description = 'Tu maintiens une identité de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation. Des identités supplémentaires peuvent être acquises en fiction contre Cred.'
WHERE id = 116; -- Fantôme

UPDATE moves SET
    description = 'Quand tu observes une cible avant d''agir. 15+ : +1 continu contre elle pour cette scène. 10-14 : +1 forward si tu agis immédiatement. 9- : le MC agit.'
WHERE id = 120; -- Œil exercé

UPDATE moves SET
    description = 'Quand tu étudies une cible ou un lieu. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'
WHERE id = 125; -- Préparation silencieuse

UPDATE moves SET
                 description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.',
                 name = 'Chromé'
WHERE id = 123; -- Plus machine qu'homme → Chromé

-- ── 8. UPDATE EDGERUNNER ─────────────────────────────────────

UPDATE moves SET
                 name = 'Voici le plan',
                 description = 'Quand tu effectues une mise en place tactique et assignes des tâches à ton équipe. 15+ : chaque membre qui suit sa tâche gagne +1 continu pour cette action. 10-14 : un seul membre de ton choix bénéficie du bonus. 9- : le MC agit.'
WHERE id = 92; -- Voici le plan

UPDATE moves SET
                 name = 'Gestion directe',
                 description = 'Quand tu emploies la manière forte en commandant en première ligne. Lance 2d10+Esprit au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'
WHERE id = 93; -- Gestion directe

UPDATE moves SET
    description = 'Quand tu rates un jet d''Évaluer, tu obtiens toujours 1 retenue. Tu sais toujours tirer quelque chose d''une situation même quand elle tourne mal.'
WHERE id = 96; -- Opérations tactiques

UPDATE moves SET
    description = 'Quand tu organises l''approvisionnement de ton équipe pendant une phase de préparation. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'
WHERE id = 98; -- Recruteur → Gestion des ressources
UPDATE moves SET name = 'Gestion des ressources', stat = 'pro' WHERE id = 98;

UPDATE moves SET
                 name = 'Solution de repli',
                 description = 'Quand tu dois abandonner une position ou une mission compromise. 15+ : tu t''échappes et choisis ce que tu abandonnes. 10-14 : tu t''échappes mais dois abandonner 2 éléments parmi — matériel, contact exposé, information compromise, avantage tactique. 9- : le MC agit.'
WHERE id = 100; -- Solution de repli

UPDATE moves SET
    description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.'
WHERE id = 103; -- Chromé Edgerunner

-- ── 9. UPDATE TECHIE ─────────────────────────────────────────

UPDATE moves SET
    description = 'Tu peux identifier et modifier toute technologie avec laquelle tu es familier. Le MC définit les conditions selon la complexité et la disponibilité du matériel.'
WHERE id = 104; -- Bidouilleur

UPDATE moves SET
                 name = 'Bric-à-brac',
                 stat = 'esprit',
                 description = 'Quand tu fouilles dans ton matériel ou ton atelier pour récupérer des pièces et des composants utiles. 15+ : 3 [matos] dans ta sphère d''expertise. 10-14 : 1 [matos]. 9- : le MC agit.'
WHERE id = 105; -- Bric-à-brac

UPDATE moves SET
    description = 'Tu as une sphère d''expertise technique. Choisis dans la liste avec le MC — elle devient un tag narratif sur ton personnage et définit le domaine dans lequel tu peux identifier, modifier et créer.'
WHERE id = 106; -- Expert

UPDATE moves SET
    description = 'Quand tu évalues une situation par ton analyse technique. Lance 2d10+Esprit au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'
WHERE id = 107; -- Analytique

UPDATE moves SET
    description = 'Quand tu neutralises un système électronique ou de sécurité. 15+ : neutralisé sans trace, personne ne sait que tu es passé par là. Gagne [info] sur la nature du système. 10-14 : neutralisé mais au prix d''une complication ou d''une trace. 9- : le MC agit.'
WHERE id = 108; -- Court-circuitage

UPDATE moves SET
    description = 'Tu as une seconde sphère d''expertise. Choisis dans la liste avec le MC — elle devient un tag narratif supplémentaire sur ton personnage.'
WHERE id = 109; -- Intérêts diversifiés

UPDATE moves SET
    description = 'Quand tu aides un coéquipier dans le domaine de ta sphère d''expertise. Lance 2d10+Cran au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'
WHERE id = 110; -- Je suis sur le coup

UPDATE moves SET
    description = 'Quand tu passes inaperçu dans un environnement ou une situation où tu n''as pas ta place. 15+ : plus personne ne s''inquiète de ta présence jusqu''à ce que tu attires l''attention toi-même. 10-14 : ça ira si tu restes discret et t''esquives rapidement. 9- : le MC agit.'
WHERE id = 112; -- Se fondre dans la masse

UPDATE moves SET
                 name = 'Chromé',
                 description = 'Accès privilégié aux ripperdocs de ton réseau. Tu peux t''installer du cyberware toi-même durant un temps mort si les pièces sont disponibles.'
WHERE id = 113; -- Chromé Techie

-- ── 10. UPDATE ROCKERBOY ─────────────────────────────────────

UPDATE moves SET
    description = 'Quand tu crées une connexion émotionnelle et prônes ta vision — sur un individu ou une foule. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour influencer ta cible — le MC juge le coût selon la taille du groupe et sa réceptivité à ta vision.'
WHERE id = 73; -- Visionnaire

UPDATE moves SET
    description = 'Quand tu aides ou interfères avec quelqu''un. Lance 2d10+Pro au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'
WHERE id = 79; -- Opportuniste

UPDATE moves SET
    description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.'
WHERE id = 82; -- Chromé Rockerboy

-- ── 11. UPDATE MEDIA ─────────────────────────────────────────

UPDATE moves SET
                 name = 'En direct live',
                 stat = 'pro',
                 description = 'Quand tu lances une diffusion en direct et joues avec la réaction de ton audience. 15+ : choisis 2 effets parmi ceux disponibles. 10-14 : le MC choisit 1 effet à ta place. 9- : le live se retourne contre toi. Les effets possibles sont définis par le MC selon le contexte de la diffusion.'
WHERE id = 83; -- En direct live

UPDATE moves SET
                 name = 'Pitbull',
                 stat = 'pro',
                 description = 'Quand tu ne lâches pas prise sur une situation, une personne ou un sujet malgré les obstacles. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour forcer une ouverture dans la situation — le MC juge ce que chaque retenue permet selon le contexte.'
WHERE id = 89; -- Pitbull

UPDATE moves SET
                 name = 'Sources sûres',
                 stat = 'pro',
                 description = 'Quand tu fais appel à tes informateurs professionnels pour obtenir une information. Lance 2d10+Pro au lieu d''Esprit. Les seuils et effets sont identiques au move de base Effectuer une recherche.'
WHERE id = 90; -- Sources sûres

UPDATE moves SET
    description = 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.'
WHERE id = 91; -- Chromé Media

-- ── 12. INSERT — nouveaux moves ──────────────────────────────
-- Tous les moves qui n'existaient pas dans l'ancien système

-- ASSASSIN (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Assassin', 'Double vie', NULL,
                                                                 'Tu maintiens une seconde identité de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Assassin', 'Réseau de contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Assassin', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Assassin', 'Contrôler le terrain', 'pro',
                                                                 'Quand tu entres dans un espace et prends la mesure de ce qui t''entoure. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit pendant que tu évalues. Dépense tes retenues pour agir sur la situation — le MC juge le coût selon la nature et la difficulté de l''action.'),

                                                                ('official', 'Assassin', 'Agir sans pression', 'pro',
                                                                 'Quand tu as créé les conditions favorables avant d''agir — cible isolée, timing maîtrisé, terrain préparé. Lance 2d10+Pro au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),

                                                                ('official', 'Assassin', 'Furtivité', 'cran',
                                                                 'Quand tu te déplaces, te positionnes ou te dissimules sans être détecté. 15+ : tu es exactement où tu veux être, personne ne sait que tu es là. 10-14 : tu y arrives mais le MC introduit une contrainte ou une complication. 9- : le MC agit.'),

                                                                ('official', 'Assassin', 'Mise en place', 'pro',
                                                                 'Quand tu prépares le terrain — matériel planqué, accès sécurisé, voie de repli. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.');

-- EDGERUNNER (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Edgerunner', 'Analyse de terrain', 'esprit',
                                                                 'Quand tu évalues une situation sur le terrain. Lance 2d10+Esprit au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'),

                                                                ('official', 'Edgerunner', 'Coordination active', 'esprit',
                                                                 'Quand tu diriges activement un coéquipier en temps réel pendant une action. 15+ : il bénéficie de +1 continu sur ses jets pour cette scène tant qu''il suit tes instructions. 10-14 : +1 forward sur son prochain jet uniquement. 9- : le MC agit.'),

                                                                ('official', 'Edgerunner', 'Stratégie opérationnelle', 'esprit',
                                                                 'Quand tu analyses une situation avant d''agir pour anticiper ce qui peut mal tourner. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense une retenue pour éviter une complication, un piège ou une situation impossible que tu avais anticipée. Le MC juge ce qu''une retenue permet selon la situation.'),

                                                                ('official', 'Edgerunner', 'Spécialisation opérationnelle', NULL,
                                                                 'Tu as un background tactique spécifique. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage.'),

                                                                ('official', 'Edgerunner', 'Spécialisation étendue', NULL,
                                                                 'Tu as un second background tactique. Choisis dans la liste avec le MC — il devient un tag narratif supplémentaire sur ton personnage.'),

                                                                ('official', 'Edgerunner', 'Réseau de contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Edgerunner', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- FIXER (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Fixer', 'Mobiliser mon équipe', 'pro',
                                                                 'Quand tu actives tes associés pour une mission ou une tâche précise. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour faire agir ton équipe — le MC juge le coût selon la nature et la difficulté de l''action.'),

                                                                ('official', 'Fixer', 'Mon équipe', NULL,
                                                                 'Tu as un groupe d''associés qui travaillent pour toi. Définis-les avec le MC — ils deviennent un tag narratif sur ton personnage. Ils ont leurs propres intérêts et peuvent formuler des demandes.'),

                                                                ('official', 'Fixer', 'Deuxième équipe', NULL,
                                                                 'Tu as un second groupe d''associés. Définis-les avec le MC — ils deviennent un tag narratif supplémentaire sur ton personnage.'),

                                                                ('official', 'Fixer', 'Réseau de contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Fixer', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Fixer', 'Toucher sa marge', 'pro',
                                                                 'Quand tu rentres dans tes frais entre deux missions. Actionnable uniquement en phase de préparation. 15+ : +2 Cred. 10-14 : +1 Cred. 9- : -1 Cred, un deal a mal tourné.'),

                                                                ('official', 'Fixer', 'Réputation', 'pro',
                                                                 'Quand tu rencontres quelqu''un d''important dans le milieu pour la première fois. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour exploiter ta réputation dans cette relation — le MC juge le coût selon la situation.'),

                                                                ('official', 'Fixer', 'Négocier en pro', 'pro',
                                                                 'Quand tu baratines dans un contexte professionnel ou commercial. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),

                                                                ('official', 'Fixer', 'Réseau d''info', 'pro',
                                                                 'Quand tu actives ton réseau pour obtenir une information. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),

                                                                ('official', 'Fixer', 'Source fiable', 'pro',
                                                                 'Quand tu cherches à te procurer du matériel via tes connexions. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'),

                                                                ('official', 'Fixer', 'Oreille dans le milieu', 'style',
                                                                 'Quand tu effectues une recherche en faisant parler tes relations. Lance 2d10+Style au lieu d''Esprit. Les seuils et effets sont identiques au move de base Effectuer une recherche.'),

                                                                ('official', 'Fixer', 'Chromé', NULL,
                                                                 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.');

-- INVESTIGATOR (playbook entièrement nouveau)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Investigator', 'Reconstitution de scène', 'esprit',
                                                                 'Quand tu arrives sur les lieux d''un événement passé et que tu lis les indices physiques. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),

                                                                ('official', 'Investigator', 'Sens de l''observation', 'esprit',
                                                                 'Quand tu observes activement une personne, un groupe ou un lieu pour en extraire des informations. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),

                                                                ('official', 'Investigator', 'Constituer un dossier', 'esprit',
                                                                 'Quand tu consacres du temps à compiler ce que tu sais sur une cible — personne, organisation ou lieu. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour exploiter ce que tu sais sur ta cible — le MC juge le coût selon la situation.'),

                                                                ('official', 'Investigator', 'Filature', 'pro',
                                                                 'Quand tu suis quelqu''un discrètement sans te faire repérer. 15+ : tu sais exactement où il va et avec qui, sans être détecté. 10-14 : tu obtiens ce que tu cherches mais le MC introduit une contrainte. 9- : le MC agit.'),

                                                                ('official', 'Investigator', 'Employer la manière forte avec Pro', 'pro',
                                                                 'Quand tu fais usage de la force avec méthode et expérience. Lance 2d10+Pro au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'),

                                                                ('official', 'Investigator', 'Baratiner avec Esprit', 'esprit',
                                                                 'Quand tu fais parler une source ou un témoin par ta connaissance du dossier. Lance 2d10+Esprit au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),

                                                                ('official', 'Investigator', 'Agir sous pression avec Pro', 'pro',
                                                                 'Quand tu agis sous pression en t''appuyant sur ton expérience de terrain. Lance 2d10+Pro au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),

                                                                ('official', 'Investigator', 'I need backup', 'pro',
                                                                 'Quand tu mobilises ton réseau pour une intervention concrète. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour déclencher une intervention — le MC juge le coût selon la nature et l''ampleur de ce que tu demandes.'),

                                                                ('official', 'Investigator', 'Déduction', 'esprit',
                                                                 'Quand tu identifies une faiblesse exploitable sur une cible, un système ou un dispositif après observation. 15+ : +1 continu pour l''équipe sur toute action directe qui exploite cette faiblesse pour cette scène. 10-14 : +1 forward pour le prochain jet qui l''exploite. 9- : le MC agit.'),

                                                                ('official', 'Investigator', 'Informateurs', NULL,
                                                                 'Tu entretiens un informateur dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Investigator', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second informateur dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Investigator', 'Chromé', NULL,
                                                                 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.');

-- MEDIA (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Media', 'Fouille-merde', 'esprit',
                                                                 'Quand tu creuses en coulisse sur une cible ou une organisation. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),

                                                                ('official', 'Media', 'Publication', 'esprit',
                                                                 'Quand tu publies une révélation en dépensant des [info] sur une cible ou une situation. 15+ : la publication fait l''effet escompté — la cible est exposée, sa réputation ou sa position est fragilisée. 10-14 : la publication sort mais le MC introduit une complication. 9- : ça se retourne contre toi.'),

                                                                ('official', 'Media', 'Battre le pavé avec Esprit', 'esprit',
                                                                 'Quand tu actives ton réseau par ta connaissance du milieu journalistique. Lance 2d10+Esprit au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),

                                                                ('official', 'Media', 'Identité de couverture', NULL,
                                                                 'Tu maintiens une identité professionnelle de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation. Elle ouvre certaines portes et en ferme d''autres.'),

                                                                ('official', 'Media', 'Carte de presse', NULL,
                                                                 'Tu es une figure publique reconnue dans le milieu médiatique. Ce statut devient un tag narratif sur ton personnage — il ouvre des portes officielles et corporatives, mais en ferme d''autres dans le milieu underground.'),

                                                                ('official', 'Media', 'Contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Media', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- NETRUNNER (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Netrunner', 'Protection', NULL,
                                                                 'Quand une ICE Noire s''active contre toi, le MC t''en informe. Tu peux choisir de déclencher ta déconnexion d''urgence sans dépenser de retenue. Sans ce move, te déconnecter face à une ICE Noire coûte des retenues et tu peux ne pas t''en apercevoir immédiatement.'),

                                                                ('official', 'Netrunner', 'Daemon', NULL,
                                                                 'Tu disposes d''un programme daemon dans ta cyberconsole. Définis-le avec le MC — il devient un tag narratif sur ta cyberconsole. Un daemon réduit ou annule le coût en retenues d''une action spécifique dans le Net, selon sa nature.'),

                                                                ('official', 'Netrunner', 'Daemon avancé', NULL,
                                                                 'Tu disposes d''un second daemon dans ta cyberconsole. Définis-le avec le MC — il devient un tag narratif supplémentaire sur ta cyberconsole.');

-- NOMAD (playbook entièrement refondu)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Nomad', 'Rig', NULL,
                                                                 'Tu démarres avec un véhicule rigué connecté à ton interface neurale. Définis son profil avec le MC — puissance, aspect, défaut. C''est ton outil, ta maison, ton identité.'),

                                                                ('official', 'Nomad', 'Seconde peau', NULL,
                                                                 'Quand tu es au volant de ton rig, tu peux t''appuyer sur les caractéristiques de ton véhicule pour absorber une conséquence ou créer une ouverture supplémentaire lors d''un jet d''Agir sous pression. Le MC juge ce que le rig permet selon ses tags.'),

                                                                ('official', 'Nomad', 'As du volant', 'pro',
                                                                 'Quand tu conduis ton rig au beau milieu d''une situation sous haute tension. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour agir avec ton véhicule — le MC juge le coût selon la difficulté de la manœuvre.'),

                                                                ('official', 'Nomad', 'Belle bagnole', 'pro',
                                                                 'Quand tu bats le pavé dans ton rig. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),

                                                                ('official', 'Nomad', 'De glace', 'cran',
                                                                 'Quand tu baratines quelqu''un par ta froideur et ta détermination. Lance 2d10+Cran au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),

                                                                ('official', 'Nomad', 'Un œil dans le ciel', 'pro',
                                                                 'Quand tu aides ou interfères en utilisant un drone comme appui. Lance 2d10+Pro au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),

                                                                ('official', 'Nomad', 'Réseau nomad', 'cran',
                                                                 'Quand tu actives le réseau de ton clan pour obtenir des informations sur les routes, les checkpoints ou les mouvements. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),

                                                                ('official', 'Nomad', 'Survie hors les murs', 'cran',
                                                                 'Quand tu cherches des ressources dans les Badlands ou en dehors des zones urbaines. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'),

                                                                ('official', 'Nomad', 'Mécano de fortune', 'pro',
                                                                 'Quand tu répares ou bricoles un véhicule ou un équipement mécanique en conditions de terrain, sans atelier. 15+ : ça fonctionne proprement. 10-14 : ça fonctionne mais au prix d''un coût (temps, pièces sacrifiées, réparation temporaire). 9- : le MC agit.'),

                                                                ('official', 'Nomad', 'Contacts', NULL,
                                                                 'Tu entretiens un contact sur les routes. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Nomad', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact sur les routes. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Nomad', 'Chromé', NULL,
                                                                 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.');

-- ROCKERBOY (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Rockerboy', 'Beau parleur', NULL,
                                                                 'Quand tu réussis un Baratiner, tu obtiens automatiquement une [info] supplémentaire sur ton interlocuteur.'),

                                                                ('official', 'Rockerboy', 'Célèbre', NULL,
                                                                 'Ton nom et ton image sont connus. Ce statut devient un tag narratif sur ton personnage — il ouvre des portes, attire les regards, mais fait aussi de toi une cible.'),

                                                                ('official', 'Rockerboy', 'Fanbase', NULL,
                                                                 'Tu as un groupe de fans et de suiveurs dévoués. Définis-les avec le MC — ils deviennent un tag narratif sur ton personnage. Ils peuvent t''aider, te planquer, te soutenir — mais ils ont leurs propres attentes.'),

                                                                ('official', 'Rockerboy', 'Fanbase extrême', NULL,
                                                                 'Tu as un second groupe de fans, plus obsessionnels et prêts à tout. Définis-les avec le MC — ils deviennent un tag narratif supplémentaire sur ton personnage. Leur dévotion est sans limite, ce qui peut être aussi dangereux qu''utile.'),

                                                                ('official', 'Rockerboy', 'Agir sous pression avec Style', 'style',
                                                                 'Quand tu agis sous pression en jouant sur ta présence et ton image. Lance 2d10+Style au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),

                                                                ('official', 'Rockerboy', 'Baratiner avec Pro', 'pro',
                                                                 'Quand tu négocies ou manipules dans un contexte professionnel en t''appuyant sur ta réputation. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),

                                                                ('official', 'Rockerboy', 'Sous les projecteurs', 'style',
                                                                 'Quand tu attires délibérément tous les regards sur toi — performance, discours, provocation. 15+ : tous les regards sont sur toi, l''équipe peut agir librement sans être remarquée pour toute cette scène. 10-14 : tu attires l''attention mais le MC introduit une complication. 9- : ça se retourne contre toi ou contre l''équipe.'),

                                                                ('official', 'Rockerboy', 'Contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Rockerboy', 'Réseau étendu', NULL,
                                                                 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- SOLO (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Solo', 'Mère Gigogne', NULL,
                                                                 'Quand tu réussis Entrée subreptice, tu peux dépenser des retenues supplémentaires pour faire passer des membres de ton équipe avec toi. Le MC juge le coût selon les conditions et le nombre de personnes.'),

                                                                ('official', 'Solo', 'Premier sang', 'cran',
                                                                 'Quand tu crées délibérément les conditions d''une attaque surprise. 15+ : tu agis depuis une position de force absolue — le MC ne peut pas te faire subir de conséquence immédiate sur cette première action. 10-14 : tu as l''avantage mais le MC introduit une contrainte. 9- : ta tentative est détectée.'),

                                                                ('official', 'Solo', 'Maître des artifices', 'pro',
                                                                 'Quand tu te déguises et maintiens une identité de couverture pour accéder à un lieu ou une situation. 15+ : ta couverture est totalement convaincante, tu peux agir librement tant qu''elle est intacte. 10-14 : ça tient mais le MC introduit une contrainte ou une limite. 9- : ta couverture est compromise.'),

                                                                ('official', 'Solo', 'Instinct de survie', 'cran',
                                                                 'Quand tu lis une situation par tes réflexes et ton instinct de terrain. Lance 2d10+Cran au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'),

                                                                ('official', 'Solo', 'Combattant aguerri', 'cran',
                                                                 'Quand tu te bats avec technique et sang froid plutôt qu''avec la puissance brute. Lance 2d10+Cran au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'),

                                                                ('official', 'Solo', 'Couvrir ses arrières', 'cran',
                                                                 'Quand tu soutiens un coéquipier par ton instinct de terrain et tes réflexes. Lance 2d10+Cran au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),

                                                                ('official', 'Solo', 'Contacts', NULL,
                                                                 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),

                                                                ('official', 'Solo', 'Chromé', NULL,
                                                                 'Choisis un cyberware supplémentaire dans ta liste d''archétype à la création, ou acquiers-en un nouveau durant un temps mort.');

-- TECHIE (nouveaux)
INSERT INTO moves (type, playbook, name, stat, description) VALUES
                                                                ('official', 'Techie', 'Obsessionnel', NULL,
                                                                 'Quand tu effectues une recherche sur un sujet technologique, tu obtiens toujours 1 [info] supplémentaire sur un succès plein ou partiel.'),

                                                                ('official', 'Techie', 'Opérateur de drones', NULL,
                                                                 'Tu disposes d''un drone que tu as construit. Définis son profil avec le MC — mode de locomotion, gabarit, capacités. C''est un équipement à part entière, pas un simple accessoire.'),

                                                                ('official', 'Techie', 'Flotte de drones', NULL,
                                                                 'Tu disposes d''un second drone. Définis son profil avec le MC — mode de locomotion, gabarit, capacités.');

-- ── 13. Vérification post-migration ──────────────────────────
SELECT
    COALESCE(playbook, 'BASE') as playbook,
    COUNT(*) as total
FROM moves
WHERE type = 'official'
GROUP BY playbook
ORDER BY playbook;