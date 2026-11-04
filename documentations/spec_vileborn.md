# Vileborn
## Spécification fonctionnelle – Cadrage (phase 1)

> Version 0.2 – cadrage du 2026-11-04, réponses du MJ reportées (colonnes « Réponse MJ ») ; synthèse des décisions au §5.
> Source unique : le **kit d'initiation** (aventure *Lex Umbræ*), les **fiches prétirées** et l'**aide de jeu « Obscurité »** (`X:\jdr\Vileborn\`). Le livre de base n'est pas disponible : rien de ce qui suit n'invente de règle absente du kit ; les manques sont posés en questions.

### Documents liés

| Fichier | Contenu |
|---|---|
| `spec_vileborn.md` | Ce document : règles retenues, fiche, questions de cadrage |
| `vileborn/transcription_kit_p04-47.md` | Transcription (agent) : contexte, test, états, blessures, mobiles, dé d'obscurité |
| `vileborn/transcription_kit_p48-85.md` | Transcription (agent) : sombre héritage, dons, pulsion, défis (Igritte, Revenante), Rêverie, formation, liens, aperçu du livre complet |
| `vileborn/transcription_fiches_pretires_aide.md` | Transcription (agent) : fiche vierge bloc par bloc, **7 prétirés** complets, aide de jeu « Obscurité » |
| `vileborn/planche_vileborn.html` | Planche graphique (phase 2) : tokens, polices, fiche, assistant, jet, menus, boutons, barre de session, catalogue, aide de jeu, marque |

Les trois transcriptions sont **à relire** : elles alimenteront les catalogues (prétirés, héritages, origines, dons). Écarts déjà relevés dans les PDF : devise de Lucien recopiée de Sélène sur sa page d'intro ; « Celene », « Masquegrife », « Seulfille » sur l'aide de jeu ; cases décalées sur la fiche de Séverin.

---

## 1. Règles retenues (d'après le kit)

### 1.1 Le test

1. Le Paria décrit son action et choisit une **approche** : Force, Volonté, Influence, Raison, Précision, Subterfuge. Chaque approche vaut un **dé** : d6, d8 ou d10.
2. **Réserve** : 1 dé de l'approche, **+1 dé** si un mot de **Personnalité** s'applique, **+1 dé** si un mot de **Formation** s'applique (tous de la taille de l'approche). Le joueur décide si un mot s'applique.
3. On **garde le meilleur dé**, on applique les bonus/malus ±1 de la fiche, et on compare à la **difficulté** : Facile 4 · Normale 5 · Difficile 6 · Très difficile 7 (Impossible : pas de test). Vulnérabilité −1, résistance +1 : la difficulté peut sortir de 4–7.
4. **Au-dessus** : réussite (le Paria raconte). **En dessous** : complication (l'Obscurité raconte). **Égalité** : « vous racontez ensemble » (l'exemple du kit donne réussite + complication).
5. Réussite : accomplir l'objectif, obtenir une information, ou retirer un état / une blessure (annoncé avant le jet). Complication : un état, une blessure, ou un rebondissement de scène.

### 1.2 Le dé d'obscurité (d12)

- **Explorer son sombre héritage** : on coche une case de l'héritage (3 cases), puis on fait un test auquel s'ajoute un **d12 qui compte dans la réserve**. Le d12 provoque en plus une complication s'il atteint **9+** (1 coche), **6+** (2 coches) ou **3+** (3 coches). Jusqu'à deux complications.
- **Face à un nuisible** : l'Obscurité lance le d12 en même temps que le test ; le résultat se lit sur la fiche du nuisible (le d12 ne compte pas dans la réserve).
- **Improvisé** : complication sur 9+ (ténèbres faibles), 6+ (moyennes), 3+ (puissantes).

### 1.3 États, blessures, hors jeu

| État | Effet |
|---|---|
| Colère | −1 aux tests de Raison, Précision et Subterfuge |
| Épuisement | −1 aux tests de Force, Volonté et Influence |
| Honte | Personnalité inutilisable |
| Peur | Formation inutilisable |
| Insécurité | Mobiles inutilisables |

- Subir un état déjà coché coche une **blessure** à la place.
- **Blessures** : 3 cases (avec une ligne de description) puis **Hors jeu** (« ni agir ni effectuer de tests »). On revient en jeu en fin de scène ou par la réussite d'un allié, en gardant états et blessures.

### 1.4 Mobiles, dons, pulsion, Rêverie

- **Aspiration** (libre) : cocher pour guérir une blessure. **Devoir** (au départ : *Achever votre formation*) : cocher pour guérir un état. Une utilisation chacun dans le kit.
- **Dons** (2 par Paria, 1 case chacun) : cocher active l'effet, sans test ; la contrepartie (« *Cependant,* … ») dure tant que le don est coché, ou se joue par un d6 (1 = état ou blessure).
- **Pulsion** : y céder efface toutes les coches de l'héritage et des dons.
- **Rêverie** (sacrement) : le kit dit qu'elle efface les coches de l'héritage et des dons et soigne toutes les blessures. **À la table** (MJ, 2026-11-04) : elle **soigne tout** (blessures, états, hors jeu) et **conserve** les coches du sombre héritage et des dons. Un booléen du slug, `REVERIE_CLEARS_TICKS` (`config/rules/character.js`, `false` par défaut), rétablit l'effacement du kit ; la table tranchera.
- **Origine** et **ressources** : un effet écrit chacune (ex. « cocher colère pour une réussite d'Influence », « +1 avec les militaires »).

### 1.5 Défis (côté MJ)

Une situation qui demande **plusieurs réussites** : une difficulté par approche, des vulnérabilités et résistances, une piste de cases de réussite (certaines marquent un **événement de défi**), une liste de complications, une table de dé d'obscurité. Jeu au tour de rôle. Le kit en fournit deux complets : **Igritte** (5 réussites) et la **Revenante** (6 réussites).

### 1.6 Ce que le kit ne donne pas

Aucune règle de **création** chiffrée, de **progression** ou d'**XP**, aucune mécanique de **liens** (seulement « noter une affinité ou une rivalité »), aucune règle de réinitialisation des mobiles. Le livre complet annonce 7 sombres héritages : **les 7 prétirés en couvrent 7** (Chantesang, Masquegriffe, Danselombre, Marchespectre, Tramesort, Porteruine, Cherchenature), avec 2 dons et une pulsion chacun, et 7 origines.

---

## 2. La fiche (modèle : page 1 des fiches prétirées)

La fiche numérique reprend la **fiche remplie** (page 1 des prétirés), sur un seul écran en paysage ; la page de présentation des prétirés n'est pas reprise (ses choix se font en jeu).

| Zone | Contenu |
|---|---|
| En-tête | Nom et devise (le header de page porte le titre du jeu, la devise et le nom vont dans la fiche) |
| Arc du haut | 6 approches en cartouches (dé : d6 / d8 / d10), **cliquables pour lancer** |
| Centre | Portrait (avatar) dans un **U de 10 cercles** : 5 Personnalité à gauche, 5 Formation à droite |
| Colonne gauche | 5 états avec leur effet, 3 blessures + Hors jeu |
| Colonne droite | Origine (nom + effet), Mobiles (aspiration, devoir, cases), Ressources (4 lignes) |
| Bandeau bas | Don · Sombre héritage (nom, 3 cases, rappel du d12, exemples) et Pulsion · Don |

Sur mobile, les zones s'empilent (approches, U, colonnes, bandeau).

---

## 3. Questions de cadrage

### 3.1 Identité et sources

| # | Question | Proposition (reco) | Réponse MJ                                                                                                            |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------|
| 1 | Nom du slug et libellé : le jeu s'écrit « Vileborn » (sans e). | Slug `vileborn`, libellé « Vileborn ». | Oui : `vileborn`.                                                                                                     |
| 2 | Le livre de base (campagne Game On Tabletop) est-il prévu à la table, ou on s'en tient au kit ? | Construire sur le kit, avec des structures ouvertes (listes de mots, de dons, d'héritages) pour accueillir le livre sans refaire le schéma. |                                                                                                                       |
| 3 | `notes.txt` (Sélène 5, aspiration « Accepter l'ombre afin de trouver la lumière », Croyant, Cruauté, Ténacité, Prêcher) : est-ce un personnage réel à créer, ou des notes de préparation ? | Si c'est un joueur, je le crée comme personnage de dev pour tester la fiche. | Hors périmètre : notes personnelles de joueur.                                                                        |
| 4 | Code d'accès d'un personnage de dev (le code MJ de dev reste `GMCODE`). | À me donner une fois l'assistant en place, ou je le crée moi-même et te le donne. | Cela ne bouge pas ça, c'est un prérquis de la base... Je devrais même pas à avoir à répondre à cette question en fait |

### 3.2 Création

Le kit ne donne aucune règle de création. Décision du MJ : une **vraie création de personnage**, minimale, dont les règles sont déduites des 7 prétirés. **On ne choisit pas un prétiré** : les prétirés ne servent qu'à fournir les catalogues (héritages, dons, origines, ressources) et des suggestions de mots.

#### Règles de création (déduites des prétirés)

| Élément | Ce que montrent les 7 prétirés | Règle de création |
|---|---|---|
| Approches | Deux répartitions seulement : {d10, d8, d8, d6, d6, d6} (5 prétirés) et {d8, d8, d8, d8, d6, d6} (2 prétirés). | Choisir une des **deux répartitions** (Q6), puis placer les dés sur les approches. |
| Personnalité | 2 adjectifs | **2 mots**, libres (suggestions : mots des prétirés et de leurs pages de présentation) |
| Formation | 2 verbes ou noms | **2 mots**, libres (mêmes suggestions) |
| Origine | 7 origines avec un effet : Noble, Hors-la-loi, Croyants, Orpheline, Classe moyenne, Nomade, Humble | Choisir une origine (nom + effet), ou saisie libre |
| Sombre héritage | 7 héritages, chacun avec exemples, **pulsion et 2 dons** | Choisir un héritage : exemples, pulsion et 2 dons viennent avec |
| Ressource | 1 par prétiré | 1 ressource, choisie parmi les 7 ou saisie librement (nom + effet) |
| Mobiles | Aspiration vide, devoir « Achever votre formation » | Aspiration facultative, devoir prérempli |
| Identité | Nom, devise | Nom, devise (facultative), avatar |

| # | Question | Proposition (reco) | Réponse MJ                                                                                                   |
|---|---|---|--------------------------------------------------------------------------------------------------------------|
| 5 | Forme de l'assistant. | Onglets : Guide · Héritage · Origine · Approches · Personnalité et Formation · Ressource et mobiles · Identité. Colonne d'aide avec le texte de chaque héritage, origine et don (« Incarnez X si… » compris). Raccourci « Partir d'un prétiré » sur le Guide. | Non pas comme si c'était un choix de pré-tiré, c'est une création de personnage donc pas d'incarnez X si...  |
| 6 | Répartition des approches : les **deux répartitions observées** seulement, ou la règle générale « 4 crans » (qui autorise aussi deux d10 et quatre d6, jamais vu sur un prétiré) ? | Les deux répartitions observées : c'est ce que le kit montre, sans extrapoler. | oui                                                                                                          |
| 7 | Un même prétiré peut-il être pris par deux joueurs ? | Oui, rien ne l'interdit côté app ; la table tranche. | Pas de pré-tiré, on ne choisit pas un pré-tiré, on créé un perso                                             |
| 8 | Les mots proposés par la page de présentation (« Ajoutez Diplomate, Rusé et Hédoniste… ») : on les propose dans l'assistant ? | Non (ta remarque) : la fiche démarre avec les 2 + 2 mots du prétiré, les autres s'ajoutent en jeu dans les cercles vides. L'aide de jeu peut rappeler les suggestions. | La création s'arrêtent à 2 formations et 2 personnalités                                                     |
| 9 | Les cercles sont 5 + 5 sur la fiche, mais le kit en fait remplir 2 + 3 puis +1 en scène 5 (soit 6). | Garder **5 + 5** comme la fiche papier ; l'édition permet d'en ajouter au-delà si tu le décides. | À la table, seuls 2 mots de chaque ont été ajoutés pour l'instant (4 + 4 remplis) : 5 + 5 cercles suffisent. |

### 3.3 Le jet

| # | Question | Proposition (reco) | Réponse MJ                                                                                                                             |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------|
| 10 | Fenêtre de jet. | Clic sur une approche → fenêtre : **difficulté** en tête (pills 4 · 5 · 6 · 7, Normale par défaut, ±1 vulnérabilité / résistance), puis « Personnalité s'applique » et « Formation s'applique » (interrupteurs, un mot à choisir facultatif), puis modificateur ±1. Résultat : dés lancés, dé gardé, verdict **Réussite / Égalité / Complication**. | oui après je pense qu'avoir simplment un modificateur ça peut le faire                                                                 |
| 11 | Les **états** s'appliquent-ils automatiquement ? | Oui : colère / épuisement retirent 1 aux approches concernées, honte grise Personnalité, peur grise Formation. C'est écrit sur la fiche, autant que l'app le fasse. | Oui.                                                                                                                                   |
| 12 | **Explorer son sombre héritage** : le d12 est lancé par l'Obscurité dans le kit. | Un interrupteur « Explorer mon sombre héritage » dans la fenêtre : coche la case suivante, ajoute le d12 (couleur distincte) **dans le même jet**, et affiche la complication du d12 selon le seuil (9+ / 6+ / 3+). Plus simple qu'un aller-retour avec le MJ. | Oui.                                                                                                                                   |
| 13 | **Dé d'obscurité face à un nuisible** (le d12 ne compte pas dans la réserve). | Côté MJ : un bouton « Dé d'obscurité » (intensité faible / moyenne / puissante, ou seuil lu sur la fiche du défi), visible de tous dans l'historique. | c'est au choix du MJ ça, lancé de dés de son côté toujours possible en caché ou public                                                 |
| 14 | Bonus / malus des **dons, ressources, origine** (« +1 avec les militaires », « −1 en Précision tant que coché »). | Dons cochés et ressources listés dans la fenêtre comme **puces de modificateur** à activer (préremplies pour les prétirés : approche + valeur), sans application forcée : c'est la situation qui décide. | un simple modificateur qu'on peut remplir non ?  Enfin si on parle bien d'une modale de jet                                            |
| 15 | Effets « réussite automatique » (origine : cocher colère pour une réussite d'Influence ; dons Pouvoir du sang, Balance du destin) et relances (origines Classe moyenne, Nomade). | **À la table** : on coche l'état ou le don, la réussite se raconte. Pas de bouton dédié. | Une réussite automatique n'empêche pas les jets de dés car ils peuvent aussi raconter une autre histoire, genre sur le sombre héritage |
| 16 | Égalité : où cela apparaît-il ? Seulement dans le **résultat d'un jet** (historique et notification), quand le dé gardé égale la difficulté. | Le résultat affiche le dé gardé contre la difficulté et un verdict d'un mot : **Réussite**, **Égalité** ou **Complication**. Pas de consigne (« racontez ensemble ») : c'est une règle de jeu, elle va dans l'aide de jeu. | Verdict d'un mot : cohérent avec le système.                                                                                           |

### 3.4 Fiche et ressources

| # | Question | Proposition (reco) | Réponse MJ                                                                                                                                                                                                                                                                           |
|---|---|---|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 17 | Cocher un **état déjà coché** → blessure : automatiser ? | Non : on coche à la main, la règle est rappelée dans l'aide de jeu. | Bah si c'est automatique de prendre une blessure si on a déjà l'état, faut prendre la blessure je pense                                                                                                                                                                              |
| 18 | **Rêverie** et **Pulsion** : boutons d'action ? | Oui, deux boutons (avec confirmation) : « Consommer la Rêverie » (soin complet ; coches du sombre héritage conservées, voir §1.4) et « Céder à la pulsion » (efface héritage + dons). Une ligne dans l'historique pour que la table le voie. | oui                                                                                                                                                                                                                                                                                  |
| 19 | Dons à **jet de d6** (« sur 1, vous subissez la peur ») : un bouton qui lance le d6 en cochant le don ? | Non : le d6 se lance en jet libre, c'est rare. | Si on peut automatiser ce truc facile, franchement ça coute quoi ?                                                                                                                                                                                                                   |
| 20 | **Liens** (affinité / rivalité) : où ? | Petite liste sur la fiche (type affinité / rivalité, Paria visé, une ligne de ressenti). Aucune mécanique tant que le livre ne la donne pas. Hors fiche papier : à placer sous le bandeau ou dans le journal ? Reco : sous le bandeau. | La mécanique c'est de pouvoir ajouter des modificateurs sur des jets quand tu fais un truc avec cette personne, donc oui un système basique de niveua du lien (négatif, 0 ou positif) et le nom de la personne/etc. Bref ça ressemble au système de relation de cyberpunk comme slug |
| 21 | **Progression** : rien dans le kit. | Pas d'XP. L'**édition** sert aux évolutions décidées à la table (dé d'une approche, nouveau mot, nouveau don, réinitialiser un mobile). | oui pas d'xp                                                                                                                                                                                                                                                                         |
| 22 | **Portrait** : la fiche est construite autour de l'illustration. | `AvatarUploader` standard. Les illustrations des prétirés peuvent servir d'avatar par défaut : je les extrais des PDF (usage privé) ou tu les déposes toi-même ? Reco : je les extrais, détourées si possible. | Chaque joueur fera comme il veut pour les illustrations, mais oui l'avatar au milieu de la fiche, c'est le concept                                                                                                                                                                   |
| 23 | Onglets. | Fiche · Journal · Historique · Aide de jeu. | Oui                                                                                                                                                                                                                                                                                  |

### 3.5 Interface MJ

| # | Question | Proposition (reco) | Réponse MJ                                                   |
|---|---|---|--------------------------------------------------------------|
| 24 | Vue des Parias de la table. | Une carte par Paria : approches, états, blessures, coches d'héritage et de dons, mobiles ; clic pour ouvrir sa fiche complète (sections partagées). Le MJ peut cocher états et blessures (complications). | oui comme dh'ab, comme sur n'importe quel slug               |
| 25 | **Défis** (fiches d'Igritte, de la Revenante, et les tiens) : suivi dans l'app ? | Oui, en **lot 3** : catalogue de défis (Igritte et Revenante transcrits), défis actifs avec difficultés par approche, vulnérabilités / résistances, cases de réussite et d'événement, complications, table du d12. Le MJ coche les réussites. | **Non** : pas de suivi des défis dans l'app.                 |
| 26 | Les joueurs voient-ils le défi en cours ? | Oui, en lecture : nom, piste de réussites et vulnérabilités découvertes ; difficultés, complications et table du d12 restent au MJ. | Non                                                          |
| 27 | Combat : le kit n'a ni initiative ni dégâts (un combat est un défi au tour de rôle). | Pas de module de combat générique (bloc `combat` désactivé). | Il n'y a pas d'initiative et non pas de module combat ni pnj |
| 28 | Aide de jeu (`ReferenceGuide`). | Joueurs : résumé des règles (test, états, blessures, héritage, Rêverie). MJ : en plus l'aide « Obscurité » (idées de complications par Paria), les fiches de défi et les nuisibles. | oui ok                                                       |

### 3.6 Identité visuelle

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|------------|
| 29 | Direction graphique. | Celle de la fiche : papier blanc cassé réglé, aquarelles vert-de-gris, rouge sang (valeurs, noms, runes), arcs noirs fins, cercles à double bordure, frise runique rouge, monogramme V en filigrane. **Nuit** : encre noir bleuté, papier inversé en ardoise, rouge plus clair. Proposition détaillée dans la planche (phase 2). | ok         |
| 30 | Polices. | Titre et nom : une capitale display Art nouveau à fort contraste (candidates en planche) ; corps : Garamond (EB Garamond) ; libellés : petite capitale sans empattement fine. | ok         |

---

## 4. Découpage en lots

| Lot | Contenu |
|---|---|
| 1 – Création | Catalogues (héritages et dons, origines, ressources, suggestions de mots), assistant de création, schéma complet |
| 2 – Fiche | Fiche joueur (modèle : page 1 des prétirés), fenêtre de jet, d12 d'héritage, états automatiques, d6 des dons, Rêverie / Pulsion, liens, journal, historique |
| 3 – MJ | Interface MJ : tables, vue des Parias, dé d'obscurité (caché ou public), musique. Ni défis, ni PNJ, ni combat |
| 4 – Extra | Aide de jeu (règles, Obscurité ; défis et nuisibles du kit en référence MJ) |
| 5 – Bonus | Évolutions si le livre de base arrive à la table |

Le schéma SQLite fixé en phase 2 couvre dès le lot 1 les structures des lots 2 et 3 (mots, dons, ressources, liens).

---

## 5. Décisions de cadrage (synthèse)

| Sujet | Décision |
|---|---|
| Slug | `vileborn`, libellé « Vileborn », visible à l'accueil |
| Sources | Kit d'initiation et fiches prétirées ; structures ouvertes pour le livre de base (Q2, reco par défaut) |
| Personnage de dev | Créé par Claude via l'assistant, au lot 1 (prérequis de toute vérification à l'écran) ; MJ : `GMCODE` |
| Création | Vraie création, aucun choix de prétiré, pas de « Incarnez X si… » ; 2 répartitions de dés ; 2 mots de Personnalité et 2 de Formation ; origine, héritage (pulsion + 2 dons), 1 ressource, mobiles, identité |
| Fenêtre de jet | Difficulté (4 · 5 · 6 · 7), interrupteurs Personnalité / Formation, **un seul modificateur** libre (vulnérabilité, résistance, don, ressource, origine : tout passe par lui), lien éventuel |
| États | Effets appliqués automatiquement au jet ; subir un état déjà coché coche une blessure (automatique) |
| Sombre héritage | Interrupteur « Explorer mon sombre héritage » : coche la case suivante (s'il en reste), d12 dans le même jet, complication du d12 selon le seuil ; toujours possible, même à 3 coches (seuil 3+) |
| Dé d'obscurité | Lancé par le MJ, à son choix, en caché ou en public |
| Réussites automatiques | Ne remplacent pas le jet ; à la table, pas de bouton |
| Verdict | Un mot : Réussite, Égalité ou Complication ; la règle de l'égalité va dans l'aide de jeu |
| Dons à d6 | Automatisés : cocher le don lance le d6 et applique la contrepartie (état ou blessure) sur un 1 |
| Rêverie, Pulsion | Deux boutons avec confirmation, une ligne dans l'historique. Rêverie : soin de tout (blessures, états, hors jeu), coches de l'héritage et des dons conservées ; booléen `REVERIE_CLEARS_TICKS` pour la version du kit |
| Liens | Comme les relations de Cyberpunk : nom, description, niveau négatif / neutre / positif ; le niveau sert de modificateur au jet quand on agit avec cette personne |
| Progression | Pas d'XP ; l'édition sert aux évolutions décidées à la table |
| Portrait | Avatar au centre de la fiche, dans le U ; chaque joueur choisit son image |
| Onglets | Fiche · Journal · Historique · Aide de jeu |
| MJ | Vue des Parias comme sur les autres slugs ; ni défis, ni PNJ, ni combat, ni initiative |
| Aide de jeu | Joueurs : règles ; MJ : en plus l'aide « Obscurité » et les défis / nuisibles du kit en lecture |
| Identité visuelle | Celle de la fiche papier, planche validée le 2026-11-04 ; police des titres **Marcellus SC** |
---
---

# Partie II — Spécification technique (phase 2)

> Rédigée le 2026-11-04 d'après les décisions du §5 et le code de la plateforme (Vampire et Fabula). **À valider avec la planche** `vileborn/planche_vileborn.html`.
> Préfixe des composants et des classes du slug : `Vil` / `vil-`.

## II.1 Choix ouverts

| # | Question | Options | Proposition (reco) | Réponse MJ |
|---|---|---|---|---|
| 31 | **Couleur du d12** : l'animation de la plateforme lance tous les dés d'un jet dans **une seule couleur** (la couleur d'un groupe n'est pas lue par `DiceAnimationOverlay`). | A. Même couleur que la réserve, le d12 se distingue dans le résultat (rouge, étiquette « Obscurité »). B. Faire évoluer la plateforme (lire la couleur des groupes) : chantier général, hors slug. | **A** pour ce slug ; B en ticket plateforme si l'absence de couleur gêne à l'usage. | A pour l'instant ; B noté au backlog (vérifier et ajouter à la plateforme). |
| 32 | **Lignes d'événement** (Rêverie, Pulsion) dans l'historique : aucun slug ne le fait. | A. Les poster par la route des jets (`POST /dice/roll`, type `vileborn_event`, notation « — »), rendues par `VilHistoryEntry` : aucun changement serveur. B. Pas de ligne : la fiche mise à jour suffit. | **A** ✦ (déjà validé Q18), sans toucher à la plateforme. | A (planche validée). |
| 33 | **Explorer avec 3 coches** : le kit s'arrête à la 3ᵉ coche. | A. Interrupteur désactivé quand les 3 cases sont cochées (il faut céder à la pulsion ou consommer la Rêverie). B. Autorisé, seuil 3+. | **A** : on ne coche pas une 4ᵉ case qui n'existe pas. | **B** : on peut toujours explorer ; les coches ne font que changer le seuil (9+, 6+, 3+). À 3 coches, le seuil reste 3+ et rien ne se coche de plus. |
| 34 | **Cliquer un état déjà coché** : décocher (guérir) ou le subir à nouveau (blessure, Q17) ? | A. Petit choix au clic : « Guérir » / « Subir à nouveau (blessure) ». B. Clic = subir ; guérir passe par le mode Édition. | **A** : les deux gestes sont courants en jeu. | Oui. |

## II.2 Schéma SQLite (`database-template/vileborn-schema.sql`)

Tables partagées recopiées de `base.sql` sans modification ; compte MJ `(-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Obscurité')`.

**`characters`** : colonnes plateforme verbatim (dont `avatar`, `login_attempts`, `last_attempt_at`, `last_accessed`), puis :

| Colonnes | Type | Rôle |
|---|---|---|
| `motto` | TEXT `''` | Devise |
| `die_force`, `die_will`, `die_influence`, `die_reason`, `die_precision`, `die_subterfuge` | INTEGER `6` | Taille du dé de l'approche (6, 8, 10) |
| `state_anger`, `state_exhaustion`, `state_shame`, `state_fear`, `state_insecurity` | INTEGER `0` | États (0/1) |
| `wound_1`, `wound_2`, `wound_3` | INTEGER `0` | Blessures cochées |
| `wound_1_note`, `wound_2_note`, `wound_3_note` | TEXT `''` | Description de chaque blessure |
| `out_of_play` | INTEGER `0` | Hors jeu |
| `origin_key`, `origin_name`, `origin_effect` | TEXT | Origine (clé du catalogue ou NULL si libre ; texte copié, modifiable en édition) |
| `aspiration`, `aspiration_checked` | TEXT, INTEGER | Mobile |
| `duty`, `duty_checked` | TEXT `'Achever votre formation'`, INTEGER | Mobile |
| `heritage_key`, `heritage_name`, `heritage_examples` | TEXT | Sombre héritage |
| `heritage_ticks` | INTEGER `0` | Coches de l'héritage (0 à 3) |
| `urge` | TEXT `''` | Pulsion |

**Sous-tables** (synchronisées par `_syncSubTable`, `ON DELETE CASCADE`) :

| Table | Colonnes | Remarque |
|---|---|---|
| `character_words` | `kind` (`personality` / `training`), `position` (0-4), `label` | Les cercles du U |
| `character_gifts` | `position`, `gift_key` (NULL si libre), `name`, `effect`, `drawback`, `checked` | La clé relie le don au catalogue (automatisation du d6) |
| `character_resources` | `position`, `name`, `effect` | 4 lignes au plus à l'écran |
| `character_bonds` | `position`, `name`, `description`, `level` (−1, 0, +1) | Liens (modèle Cyberpunk) |

## II.3 Serveur

- `src/server/systems/vileborn/config.js` : `{ slug, label: 'Vileborn', dbPath, schemaPath, generateAccessUrl }`, sans `hidden`.
- `routes/characters.js` + `CharacterController.js` sur le modèle Vampire : `FLAT_COLUMNS` en COALESCE, `saveFullCharacter` en transaction avec `_syncSubTable` pour les 4 sous-tables, `broadcastCharacterUpdate` exporté. `GET /` public ; `authenticate, requireOwnerOrGM` en lecture / écriture ; `requireGM` en suppression.
- **Aucune autre route, aucun handler socket** : la fiche passe par HTTP, l'historique par la route des jets existante.
- `tests/server/systems/vileborn/fixture.js` : création minimale (`playerName`, `nom`, dés, héritage, 2 + 2 mots, 2 dons) et `edit: { field: 'motto' }`.

## II.4 Jets (`config.jsx`, `config/rules/test.js`, `hooks/useVilRoll.js`)

**Contexte d'un test** (`systemData`, construit par `buildTestContext(character, choices)` dans `config/rules/test.js`) : `{ type: 'test', approach, die, personality, training, explore, darkThreshold, modifier, bond, difficulty }`. Les états y sont appliqués : colère / épuisement ajoutent −1 au modificateur selon l'approche, honte et peur forcent `personality` / `training` à faux.

| Hook | Logique |
|---|---|
| `buildNotation` | `n = 1 + personality + training` → `` `${n}d${die}` `` ; avec `explore` → `[`${n}d${die}`, '1d12']`. Dé gardien d'une réserve vide : impossible (n ≥ 1). Type `dark` (MJ) : `'1d12'`. Type `gift` : `'1d6'`. |
| `beforeRoll` | Borne la difficulté (4 à 7 en standard, le modificateur peut la dépasser ; aucune borne bloquante). |
| `afterRoll` | `resolveTest(values, dark, ctx)` → `{ type, kept, total, difficulty, verdict: 'success' \| 'tie' \| 'complication', dice, dark, darkComplication }`. Le d12 compte dans la réserve ; le modificateur s'ajoute au dé gardé. Type `dark` : `{ value, threshold, complication }`. Type `gift` : `{ value, triggered, effect }`. |
| `buildAnimationSequence` | Un seul groupe, une seule vague (modèle Fabula) : `diceType: '2d8+1d12'`, valeurs dans l'ordre. |
| `renderHistoryEntry` | `<VilHistoryEntry roll={entry} />`, `renderAllRollTypes: true` ; jet libre traité en premier (`parseFreeRoll`). |

**Types de jet** : `vileborn_test`, `vileborn_dark` (dé d'obscurité du MJ, caché ou public : `persistHistory: !hidden`), `vileborn_gift` (d6 d'un don), `vileborn_event` (Rêverie, Pulsion, Q32).

**Combat** : `combat = { renderHealthDisplay: () => null, actions: [], attack: null }` (forme de Vampire et Fabula).

**Fenêtre de jet** (`VilRollModal`) : titre = approche et dé ; difficulté en tête (pills Facile 4 · Normale 5 · Difficile 6 · Très difficile 7) ; interrupteurs Personnalité et Formation (grisés par honte / peur, avec la raison) ; interrupteur « Explorer mon sombre héritage » (seuil affiché ; toujours disponible, Q33) ; lien (pills des liens, le niveau s'ajoute) ; un modificateur libre (−3 à +3). Le jet coche la case d'héritage suivante **avant** de lancer (aucune au-delà de 3), puis enregistre la fiche.

**Règles pures** (`config/rules/`, testées en miroir) :
- `test.js` : `poolSize`, `statePenalty(states, approach)`, `darkThreshold(ticks)` (9, 6, 3), `resolveTest`.
- `character.js` : `sufferState(c, key)` (état déjà coché → `addWound`), `addWound(c)` (4ᵉ → hors jeu), `healWound`, `consumeReverie(c)` (soin de tout ; efface aussi les coches si `REVERIE_CLEARS_TICKS`), `yieldToUrge(c)`, `exploreTick(c)`, `checkGift(c, index)` + `giftRollEffect(giftKey, value)`.
- `creation.js` : `DISTRIBUTIONS` (les deux répartitions), `isDistributionValid`, `creationTodo(draft)`.

## II.5 Arborescence du front (`src/client/src/systems/vileborn/`)

```
config.jsx · Sheet.jsx · GMApp.jsx · Creation.jsx · Brand.jsx · Brand.css · theme.css
config/            approaches.js · states.js · heritages.js (7 héritages : exemples, pulsion, 2 dons avec effet du d6)
                   origins.js · resources.js · suggestions.js (mots) · descriptions.js (textes de l'assistant) · reference.js
config/rules/      test.js · character.js · creation.js
config/reference/  01-test.md · 02-etats-blessures.md · 03-sombre-heritage.md · 04-mobiles-liens.md · 05-obscurite.md (MJ) · 06-defis-nuisibles.md (MJ)
hooks/             useVilRoll.js · useTableCharacters.js · useVilActions.js (Rêverie, Pulsion, états, dons : règle + enregistrement + ligne d'historique)
components/ui/     VilTopBar.jsx (bande fixe) · VilUi.jsx (case, cercle, pill, interrupteur)
components/layout/ VilSheet.jsx (assemblage, joueur et MJ) · VilGmTableRow.jsx · VilHistoryEntry.jsx · VilCircles.jsx (U de cercles + portrait)
                   VilSections.jsx (VilApproaches, VilStates, VilOrigin, VilHeritage, VilBonds)
components/modals/ VilRollModal.jsx · VilDarkDieModal.jsx (MJ) · VilStateChoice.jsx (Q34)
components/creation/ CreationTabs.jsx (Guide, Héritage, Origine, Approches, Mots, Ressource, Identité) · CreationHelp.jsx
gm/tabs/           TabSession.jsx
```

## II.6 Fiche

**Une seule disposition, celle de la fiche papier** (paysage) : grille 3 colonnes sur grand écran (états et blessures | arc des approches + U de cercles autour du portrait | origine, mobiles, ressources), bandeau du bas en 3 colonnes (don | héritage + pulsion | don), puis les liens sous le bandeau. Sous 1100 px : les colonnes passent sous le U ; sous 700 px : tout s'empile, les cercles deviennent deux rangées.

| Section | Joueur | MJ (`VilGmSheet`, présentation compacte) |
|---|---|---|
| Approches | Clic = fenêtre de jet | Lecture |
| U de cercles + portrait | Clic portrait = `AvatarUploader` ; mots en édition | Lecture |
| États, blessures, hors jeu | Clic (Q34), notes de blessure | Clic (complication infligée par le MJ) |
| Origine, mobiles, ressources | Mobiles cochables (grisés par l'insécurité) | Lecture |
| Dons, héritage, pulsion | Cocher un don (d6 automatique), boutons « Céder à la pulsion » et « Consommer la Rêverie » | Lecture + coches |
| Liens | Liste, ajout / niveau hors édition | Lecture |

**Onglets** (`useHashTab`) : joueur Fiche · Journal · Historique · Aide de jeu ; MJ Session · Journal · Historique · Aide de jeu.
**Bande fixe** : titre du jeu, onglets, actions en icônes (édition ; côté MJ : dé d'obscurité, jet libre). `SessionPlayersBar` (`sessionName`, `headerHeight` mesuré) ; `DiceHistoryPanel` monté à la racine de la fiche et de l'interface MJ ; `ToastNotifications sessionId`.

## II.7 Assistant de création

Onglets : **Guide** · Héritage · Origine · Approches · Personnalité et Formation · Ressource et mobiles · Identité, avec Précédent / Suivant, ligne « À faire », colonne d'aide (texte de l'élément survolé ou choisi, un seul fichier `descriptions.js`).
- Héritage : 7 cartes (nom, exemples, pulsion, 2 dons).
- Origine : 7 pills + « Autre… » (nom et effet libres).
- Approches : 2 pills de répartition, puis pour chaque approche les dés restants en pills.
- Personnalité et Formation : 2 saisies chacune, suggestions en pills.
- Ressource : 7 pills + « Autre… » ; aspiration (facultative) ; devoir prérempli.
- Identité : prénom et nom (deux champs, affichés « prénom nom »), devise, nom du joueur, avatar.

## II.8 Interface MJ

`GMApp.jsx` monte directement les onglets (pas de `GMView`). **Session** : colonne de gauche avec `AudioSessionToggle` (`className="vtt-btn vtt-btn-sm w-full"`) en tête puis une ligne par Paria (`VilGmTableRow` : avatar, présence, états, blessures, coches d'héritage) ; à droite `VilGmSheet` du Paria choisi, modifiable (`patchCharacter`). Bande fixe : bouton « Dé d'obscurité » (`VilDarkDieModal` : Faible 9+ · Moyenne 6+ · Puissante 3+ · Sans seuil ; Public / Caché) et jet libre (`FreeDiceModal isGM`).

## II.9 Menus

| Menu | Éléments (briques de la plateforme, libellés par défaut) |
|---|---|
| Joueur | `CreateCharacter`, `SwitchCharacter`, `FreeDice`, `AccessCode`, `DiceConfig`, séparateur, `GMInterface`, `Logout` |
| MJ | `TableManagement`, `DiceConfig`, séparateur, `Logout` |

Icônes de la plateforme (au trait). Habillage : `vtt-menu*` dans `theme.css`.

## II.10 Lots

Lot 1 (création) : schéma complet, serveur, catalogues, assistant, `config.jsx` minimal, thème et marque. Les lots 2 (fiche, jets), 3 (MJ) et 4 (aide de jeu) repassent chacun par cadrage et validation ; leurs structures de données sont fixées ci-dessus.
## II.11 État du lot 1 (2026-11-04)

Codé, non commité :
- **Serveur** : `config.js`, `routes/characters.js`, `CharacterController.js` (COALESCE, transaction, 4 sous-tables), schéma `vileborn-schema.sql`, `tests/server/systems/vileborn/fixture.js` (contrat `/characters` : 10 tests verts).
- **Front** : catalogues (7 héritages et leurs dons, 7 origines, 7 ressources, suggestions de mots), règles `test.js` et `creation.js` testées (14 tests), `config.jsx` (5 hooks, combat vide, dés aux couleurs du slug), `VilHistoryEntry`, assistant de création complet, fiche en lecture seule (portrait modifiable), interface MJ minimale (Session avec musique et fiches de la table, Journal, Historique), thème, marque.
- **Vérifié à l'écran** (jour, nuit, téléphone) : accueil, assistant (création complète de bout en bout), fiche joueur, interface MJ (sans table active).
- **Écarts avec §II.5** : sections de la fiche réunies dans `VilSections.jsx`, onglets de l'assistant dans `CreationTabs.jsx` (fichiers courts, une seule source). Onglet Aide de jeu ajouté au lot 4.
- **Textes à relire par le MJ** : les présentations de Tramesort, Porteruine et Cherchenature sont rédigées d'après leurs exemples (les prétirés n'ont pas de page d'introduction pour eux) ; origines nommées « Croyant », « Orphelin », « Hors-la-loi » d'après les phrases des fiches.
## II.12 État du lot 2 (2026-11-04)

Codé, non commité, vérifié à l'écran (joueur et MJ, table de dev « Lex Umbrae (dev) ») :
- **Fiche joueur vivante** : clic sur une approche → fenêtre de jet (difficulté, Personnalité / Formation grisées par honte / peur, exploration de l'héritage avec d12 dans le même jet, lien, modificateur −3 à +3, résultat affiché) ; états (état coché → « Guérir » ou « Subir à nouveau »), blessures et leur description, hors jeu ; aspiration (guérit la dernière blessure) et devoir (choix de l'état guéri), bloqués par l'insécurité ou Sang glacé coché ; coches de l'héritage ; dons (d6 de la contrepartie lancé et appliqué automatiquement) ; Pulsion et Rêverie (confirmation, ligne d'historique) ; liens (ajout, niveau −1 / 0 / +1, retrait).
- **Mode Édition** (`VilEditForm`, joueur et MJ) : identité, dés, mots des cercles (5 + 5, extensibles), origine, mobiles (réinitialisables), ressources, héritage, pulsion, dons.
- **MJ** : même fiche jouable sans jets, mode Édition, dé d'obscurité (seuils 9+ / 6+ / 3+ ou sans seuil, public ou caché), jet libre.
- **Règles pures testées** : `config/rules/character.js` (états, blessures, mobiles, dons, Rêverie, Pulsion, mots), `test.js` (contexte du jet, rang des coches).
- **Choix d'implémentation** : un ajout de ligne de sous-table (lien, ressource, don, mot) part en PATCH direct et la fiche renvoyée par le serveur remplace la locale (`usePlayerPatch`), pour ne jamais réinsérer une ligne hors table.
- **Reste** : aide de jeu (lot 4).
## II.13 État du lot 4 — aide de jeu (2026-11-04)

Codé, non commité, vérifié à l'écran (joueur et MJ). Onglet « Aide de jeu » sur la fiche et dans l'interface MJ (`ReferenceGuide`, sommaire collé sous la bande fixe) :
- **Tous** : Le test · États et blessures · Sombre héritage (exploration, dons, pulsion, Rêverie de la table) · Mobiles, liens, évolution (Markdown, `config/reference/01` à `04`) ; Les sombres héritages et Les origines, construits depuis les catalogues (`config/reference.js`).
- **MJ seulement** (`visibility: gm` en front matter) : Obscurité (mener les tests, dé d'obscurité, idées de complications des quatre héritages de l'aide de jeu) · Défis et nuisibles (anatomie, conduite, Igritte, la Revenante, familles de nuisibles).
- Les quatre lots prévus sont faits ; le lot 5 (évolutions si le livre de base arrive) reste ouvert.