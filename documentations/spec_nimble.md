# Spec — Nimble (slug `nimble`)

> Statut : **chantier autonome** (2026-11-04). Le MJ a confié le slug entier en autonomie : cadrage,
> spécification et implémentation enchaînés sans validation intermédiaire, décisions consignées ici
> (§10 « Décisions prises seul ») et bilan à la livraison. Aucun commit pendant le chantier.
> Le MJ est **joueur** à cette table (Dargoss Manfield, PJ : hors cadre, sert d'hommage pour le
> personnage de test).

## 1. Le jeu

Nimble (Evan Diaz, Nimble Co.) est un hack allégé de D&D 5e : heroic fantasy classique, combats
rapides, aucun jet pour toucher. Références qui font foi : **Nimble 3.x** (`X:\jdr\Nimble\CoreBooks3.0\`) :
Core Rules 3.3, un livret par classe (3.0, Zéphyr 3.1), GM's Guide 3.0. Le vault Obsidian fourni
(`X:\jdr\Nimble\Nimble Vault\`) est en **2.0.3** : écarté comme source de valeurs (cf. D-1). Les
brouillons d'extension (Artificer, Psion, Revenant, Hexbinder, Monsters & More) et le homebrew Nim+
sont hors périmètre.

**Licence.** La licence Nimble 3rd Party Creator v2.0 autorise une app gratuite à reprendre tout texte
publié, à condition d'afficher la mention « app gratuite… soutenez le jeu » de façon visible.
Mentiss VTT est gratuit et privé : la mention (traduite) et l'attribution figurent en tête de l'aide de
jeu et dans le Guide de l'assistant. Pas de logo Nimble (interdit) : la marque du slug est une
typographie maison.

### 1.1 Mécanique de dés

| Jet | Règle | Ce que fait l'app |
|---|---|---|
| **Attaque** (arme, sort, capacité) | On lance les dés de dégâts, on inflige le total. Le dé le plus à gauche (**dé primaire**) décide : **1 = raté** (aucun effet), **maximum = critique** : on relance le dé primaire et on ajoute, à chaque maximum (explosion sans limite). | Tout automatisé : dés, raté, chaîne de critique, modificateur, résultat en un seul jet |
| Avantage / désavantage X | X dés de plus, on retire les X plus bas (avantage) ou plus hauts (désavantage) ; égalité : on retire de gauche à droite ; 1 avantage annule 1 désavantage avant le jet | Un seul curseur net (−3 à +3), retrait de gauche à droite |
| **Féroce** (Vicious) | 1 dé de plus à chaque fois qu'on lance des dégâts de critique | Ajouté à chaque maillon de la chaîne |
| Attaques précipitées | Chaque attaque après la première dans le tour : désavantage cumulatif | En combat, la fiche compte les attaques du tour et propose le désavantage |
| Arme non maîtrisée | Ne peut pas critiquer | Maîtrise calculée (classe ↔ arme), corrigeable |
| Zone, d44/d66/d88, dégâts fixes | Ni raté ni critique | Géré |
| Évaluer : créer une ouverture | Le prochain dé primaire contre la cible : +1 face (ne rate pas, critique plus souvent) | Interrupteur dans la fenêtre d'attaque |
| **Test de compétence** | d20 + compétence ≥ DD ; 1 naturel échoue, 20 naturel réussit | d20 avec avantage / désavantage, DD facultatif |
| **Sauvegarde** | d20 + caractéristique ; la classe donne 1 sauvegarde avantagée (▲) et 1 désavantagée (▼) | ▲ / ▼ appliqués d'office (modifiables dans la fenêtre) |
| **Initiative** | d20 + Initiative : 1 chiffre = 1 action, 2 chiffres = 2, 20+ ou 20 naturel = 3 | Le jet règle les actions du premier tour et passe la fiche « en combat » |
| Dés de vie | Reprendre son souffle : dés lancés + FOR chacun ; Monter le camp : maximum + FOR | Fenêtre de repos |

### 1.2 Le personnage (fiche papier officielle)

Bande du haut : nom, « ascendance, classe et niveau », taille, poids et vitesse, dés de vie (actuels /
max, taille du dé) ; 4 caractéristiques FOR · DEX · INT · VOL (de −1 à +5) avec les flèches de
sauvegarde ▲ / ▼ ; bouclier des PV (actuels / max) et PV temporaires ; Armure (Défense) ;
Initiative ; Blessures (6 cases et un crâne). Bande des 10 compétences (Arcanes INT, Examen INT,
Finesse DEX, Influence VOL, Intuition VOL, Savoir INT, Puissance FOR, Nature VOL, Perception VOL,
Discrétion DEX). Puis des lignes libres : armes, capacités, sorts, objets.

## 2. Table ou app ?

| Fonction | Choix | Pourquoi |
|---|---|---|
| Jets d'attaque (critique explosif, dé primaire, avantage) | **App** | Le cœur du jeu, pénible à la main dès qu'il y a avantage + Féroce |
| Tests, sauvegardes, initiative | **App** | Un clic sur la fiche |
| PV, PV temporaires, Blessures, mourant | **App** | « Subir des dégâts » applique Défense, PV temporaires, passage à 0 (1 Blessure, mourant), dégâts en mourant (2 Blessures, 3 sur critique) |
| Mana, charges et dés de classe, usages « 1/rencontre » « 1/repos sûr » | **App** | Nimble en est plein ; remis à zéro par Fin de rencontre / Repos sûr |
| Actions (3 par tour) | **App, léger** | Trois cases sur la fiche, réglées par l'initiative, dépensées par les jets, rendues par « Fin du tour » |
| Repos (souffle, camp, sûr) | **App** | Plusieurs ressources à remettre d'un coup |
| Montée de niveau | **App** | Guidée : PV (jet avec avantage ou fixe), dé de vie, point de compétence, capacités et choix du niveau |
| États | **App, affichage** | Cases d'états visibles du MJ ; aucun effet calculé (sauf rappel dans les fenêtres) |
| Portée, déplacement, positionnement, zones | **Table** | Tableau partagé ou plateau physique |
| Ordre des tours | **Table** | Les héros jouent dans l'ordre qui leur va, les monstres à la fin : pas de traqueur d'initiative |
| Langues, intermède, artisanat, prix | **Table** | Texte libre, aide de jeu |
| Monstres : PV et attaques | **App (MJ)** | Onglet Rencontre : PV par monstre, armure M/H, sbires, jets d'attaque |

## 3. Lots

Les cinq lots de la méthode (création → fiche → MJ → extra → bonus) sont livrés d'un bloc. Les
structures de données sont fixées pour tous dès le départ.

| Lot | Contenu |
|---|---|
| 1. Création | Assistant : Guide, Classe, Ascendance, Historique, Caractéristiques, Équipement, Identité |
| 2. Fiche | Fiche mono-onglet, jets, jauges, capacités, sorts, inventaire, repos, montée de niveau, mode Édition |
| 3. MJ | Session (PJ de la table, fiche jouable, musique, tableau), Rencontre (monstres), Journal, Historique, Tableau |
| 4. Extra | Aide de jeu : règles en Markdown + catalogues (classes, ascendances, historiques, sorts, équipement, faveurs ; bestiaire côté MJ) |
| 5. Bonus | Personnage d'hommage (Dargoss Manfield) créé pour les tests |

## 4. Données

### 4.1 Catalogues (front, `config/`)

Transcrits et traduits depuis les PDF 3.x, au format fixé par `documentations/nimble/format_catalogues.md`
(contrat de données + glossaire) : `classes/<clé>.js` (11 classes : 20 niveaux, listes de choix,
sous-classes, sorts propres, FAQ), `spells.js` (6 écoles, utilitaires, secrets), `ancestries.js`,
`backgrounds.js`, `motivations.js`, `equipment.js`, `boons.js`, `bestiary.js`, `reference/*.md`.

### 4.2 Schéma SQLite (`database-template/nimble-schema.sql`)

Tables partagées de `base.sql` recopiées telles quelles. `characters` : colonnes plateforme
(dont `prenom`, `nom`, `taille`, `poids`, `age`, `avatar`, `login_attempts`, `last_attempt_at`,
`last_accessed`), puis :

| Colonne | Type | Rôle |
|---|---|---|
| `class_key`, `subclass_key`, `ancestry_key`, `background_key` | TEXT | Clés des catalogues |
| `motivation` | TEXT | Motivation (texte, catalogue ou libre) |
| `level` | INTEGER 1 | Niveau |
| `stat_str`, `stat_dex`, `stat_int`, `stat_wil` | INTEGER 0 | Caractéristiques |
| `saves` | TEXT JSON | `{ str: 1, dex: 0, int: -1, wil: 0 }` (1 ▲, −1 ▼) |
| `skill_points` | TEXT JSON | Points placés au-delà de la caractéristique, par compétence |
| `hp_current`, `hp_max`, `temp_hp` | INTEGER | PV (le max est tiré aux montées de niveau, donc stocké) |
| `wounds` | INTEGER 0 | Blessures |
| `dying` | INTEGER 0 | Mourant (0/1) |
| `hit_dice_spent` | INTEGER 0 | Dés de vie dépensés (le max se calcule) |
| `resources` | TEXT JSON | Ressources de classe `{ mana: 3 }` : dépensé pour une jauge à plafond, compté pour un compteur |
| `uses` | TEXT JSON | Usages consommés des capacités `{ 'class:hunters_mark': 1 }` |
| `choices` | TEXT JSON | Choix de progression `[{ pool, key, level }]` (listes de classe, sorts, faveurs) |
| `conditions` | TEXT JSON | États actifs `['dazed', 'prone']` |
| `bonuses` | TEXT JSON | Ajustements du mode Édition `{ defense, speed, initiative, maxWounds, maxHitDice, slots, hp }` |
| `in_combat`, `actions`, `turn_attacks` | INTEGER | En combat, actions restantes (0-3+), attaques du tour |
| `gold`, `silver` | INTEGER | Bourse |
| `languages` | TEXT JSON | Langues connues (clés ou libellés) |
| `notes` | TEXT | Notes libres |

Sous-table `character_items` (inventaire, ids stables par `syncSubTable`) : `item_key`, `kind`
(`weapon`, `armor`, `shield`, `gear`, `magic`), `name`, `data` (JSON copié du catalogue : dégâts,
propriétés, Défense…), `quantity`, `slots`, `equipped`, `proficient` (NULL = calculé), `notes`,
`position`.

Pourquoi des colonnes JSON plutôt que des sous-tables pour `resources`, `uses`, `choices`,
`conditions` : ce sont de petites tables de clés lues et réécrites en bloc, sans identité propre ;
l'inventaire, lui, est une vraie liste éditée ligne à ligne (sous-table).

### 4.3 Serveur

- `config.js` : `characters: { listColumns: ['class_key', 'level'], requiredOnCreate: ['playerName', 'prenom'] }`.
- `CharacterController.js` : `FLAT_COLUMNS` en COALESCE (JSON sérialisé à l'écriture, relu à la
  lecture), `character_items` par `syncSubTable`, transaction, fiche rechargée.
- **Aucune route ni socket propre** : tout passe par la route `/characters` commune (PUT / PATCH).
- Pas de ressource de session : rien n'est partagé entre joueurs (pas de réserve commune dans Nimble).

## 5. Dés (`config.jsx`)

Types (`ctx.systemData.type`, `rollType` = `nimble_<type>`) :

| Type | Notation | `afterRoll` |
|---|---|---|
| `attack` | `[ 'Nd{s}', '1d{s}!', 'Kd{s}' ]` : dés (avec ceux d'avantage), chaîne de critique pré-tirée, réserve Féroce pré-tirée | Retrait gauche→droite, dé primaire, raté / critique, chaîne utilisée, dés Féroce utilisés, total |
| `check` | `'Nd20'` | Garde le meilleur / pire, 1 et 20 naturels, total, DD |
| `save` | idem `check` | idem |
| `initiative` | idem | Total, actions obtenues |
| `heal` | `'Nd{s}'` (+ `max` pour Monter le camp) | Somme + bonus par dé |
| `damage_flat` | aucune (dés `d66` : `'2d6'`) | d66 : dizaines / unités |

Pré-tirer la chaîne de critique et la réserve Féroce est équivalent statistiquement à les lancer
après coup ; l'animation et l'historique ne montrent **que les dés utilisés** (vagues : dés de base,
puis chaque maillon de la chaîne avec son dé Féroce). Un seul jet, une seule entrée d'historique.

Règles pures dans `config/rules/dice.js` (testées) : `resolveAttack`, `resolveD20`, `initiativeActions`,
`pickDice` (retrait de gauche à droite). Formules et dés de catalogue : `config/rules/formula.js`
(`evalFormula('3*INT+LVL', ctx)`, `parseDice('WILd8', ctx)`), testées.

**Bloc combat** : stub (comme Fabula, Vileborn, Vampire) ; le combat générique (traqueur
d'initiative et file d'attaques validées) ne correspond pas à Nimble (héros puis monstres, aucun
jet pour toucher).

## 6. Interface

### 6.1 Organisation du code (front)

```
systems/nimble/
  config.jsx · Sheet.jsx · GMApp.jsx · Creation.jsx · Brand.jsx · Brand.css · theme.css
  config/          catalogues (§4.1), conditions.js, skills.js, descriptions.js (textes d'aide)
  config/rules/    formula.js · dice.js · character.js (dérivés) · actions.js (patchs de jeu) · creation.js · levelUp.js · encounter.js
  config/reference/  aide de jeu (Markdown) ; config/reference.js assemble règles + catalogues
  hooks/           useNbRoll (seul lancement de jet) · useNbActions · usePlayerPatch · useTableCharacters · useBoxSize
  components/ui/   NbTopBar, NbUi (pills, interrupteur, cases, icônes)
  components/layout/ NbSheet (assemblage), NbSections (bandes, combat, capacités, sorts, inventaire…), NbHistoryEntry, NbGmTableRow, NbEditForm
  components/modals/ jet de test / sauvegarde, attaque, sort, dégâts et soins, repos, montée de niveau, détail d'une capacité, catalogues
  components/creation/ onglets de l'assistant, colonne d'aide
  gm/tabs/         TabSession (musique, tableau, PJ)
  components/npc/  partie système des monstres (onglet Rencontre de la plateforme)
```

### 6.2 Fiche (un seul onglet)

Onglets de la bande fixe : **Fiche · Journal · Historique · Aide de jeu**. Actions de page
(icônes) : montée de niveau, repos, mode Édition.

Disposition calquée sur la fiche papier, pleine largeur :
1. **Bande des caractéristiques** (bande encre crantée, comme la fiche officielle) : identité à gauche
   (portrait, prénom nom, ascendance · classe · niveau), 4 caractéristiques avec ▲ / ▼ (clic =
   sauvegarde), bouclier des PV (clic = dégâts / soins), Armure, Initiative (clic = initiative),
   Blessures (6 cases + crâne), dés de vie, Vitesse.
2. **Bande des compétences** : 10 cases (clic = test).
3. **Trois colonnes** (deux puis une sur écran étroit) :
   - *Au combat* : actions (3 cases) et Fin du tour, attaques (armes équipées, mains nues ; clic =
     attaque), ressources de classe, états ;
   - *Capacités* : classe (par niveau), sous-classe, choix, ascendance, historique, faveurs ; les
     usages se cochent sur la ligne ; clic sur le nom = détail ;
   - *Sorts* (lanceurs) puis *Paquetage* : inventaire (une seule liste, armes en tête, équiper,
     quantité, emplacements utilisés / max), bourse, ajout par `CatalogModal` hors édition.
4. Notes, motivation, langues en pied.

Le **mode Édition** ne sert qu'aux corrections hors règles : caractéristiques, points de compétence,
PV max, sauvegardes, ajustements (`bonuses`), classe / ascendance / historique, identité, maîtrise
d'une arme. Tout le reste se joue hors édition et s'enregistre tout de suite.

### 6.3 Assistant de création

Onglets : **Guide · Classe · Ascendance · Historique · Caractéristiques · Équipement · Identité**,
navigation libre, état ✓ / • par onglet, ligne « À faire », colonne d'aide (description de chaque
élément choisissable), Précédent / Suivant, pas de `<select>`.
- Classe : cartes (caractéristiques clés, dé de vie, PV de départ, sauvegardes ▲▼, armures, armes,
  complexité) ; aide : pitch + capacités du niveau 1-2.
- Ascendance : groupées commune / peu commune / exotique (ces deux dernières repliées, « selon le
  cadre de jeu ») ; Sang-de-fiélon choisit sa sauvegarde neutre devenue ▲ ; Changelin, ses points.
- Historique : prérequis (« INT 0 ou moins à la création ») filtrés selon les caractéristiques ;
  si les caractéristiques changent, l'historique devenu impossible est retiré.
- Caractéristiques : tableau (Standard, Équilibré, Min-max) en pills, puis affectation (clés en tête) ;
  compétences : interrupteur « Compétences héroïques (règle optionnelle) » de 1 à 4 points.
- Équipement : « Paquetage de la classe » (défaut, + historique) ou « 25 po à dépenser » (catalogue).
- Identité : prénom, nom, joueur, portrait, taille, poids, âge, motivation (catalogue ou libre),
  langues (Commun + 1 par point d'INT, langue d'ascendance si INT ≥ 0).
Toujours au niveau 1 ; un départ plus haut se fait ensuite par la montée de niveau de la fiche.

### 6.4 Interface MJ

Onglets : **Session · Rencontre · Journal · Historique · Tableau · Aide de jeu** ; actions : jet libre.
- *Session* : musique (`AudioSessionToggle`) et tableau (`BoardSessionToggle`) en tête de la colonne
  des PJ (`vtt-btn vtt-btn-sm w-full`), PJ de la table (portrait, présence, PV, Blessures), fiche du
  PJ choisi (même assemblage que le joueur, jets au nom du PJ), copie des accès, mode Édition ;
  boutons de table : « Fin de rencontre » et « Repos sûr » pour tous les PJ.
- *Rencontre* : onglet PNJ de la plateforme (`spec_pnj.md` §8) ; bestiaire versé en bibliothèque,
  nouvelles fiches par le formulaire de Nimble ; par monstre à la table :
  PV restants (dégâts / soins, armure M −10 / H −20 sauf critique), sbires en groupe (nombre restant),
  attaques en un clic (règles du dé primaire, sbires sans critique), jet secret possible. En base.
- *Tableau* : `<Board sessionId role="gm" />` dans `vtt-board-page`.

### 6.5 Menus

Joueur (contenu de Fabula) : créer un personnage, changer de personnage, jet libre, code d'accès,
configuration des dés, — , interface MJ, déconnexion. MJ : gestion des tables, configuration des
dés, — , déconnexion. Briques et libellés de la plateforme, sans icônes propres.

### 6.6 Historique

`NbHistoryEntry` déclaré une fois (`renderHistoryEntry`, `renderAllRollTypes: true`), jet libre en
premier. Panneau d'historique monté à la racine de la fiche et de l'interface MJ.

## 7. Identité visuelle (planche `documentations/nimble/planche_nimble.html`)

« **Le carnet de l'aventurier** » : la fiche officielle de Nimble (bandes encre aux bouts crantés,
étiquettes condensées blanches, bouclier des PV, chapelet des Blessures) posée sur un vélin d'enluminure,
avec un rouge héraldique et un or à la feuille pour l'héroïsme.
- Jour : vélin `#F3EBDD`, encre `#2B2826`, rouge héraldique `#9E2A22`, or `#B5832A`, bleu
  d'outremer `#2F4D7A` (mana, magie).
- Nuit : « veillée au donjon » : ardoise bleu-noir `#15171C`, vélin assombri `#1D2027`, encre claire
  `#E9E1D2`, rouge braise `#D9583F`, or chandelle `#E0B055`, outremer `#7FA3D9`.
- Polices (Google, libres) : **Fraunces** (titres, marque : italique noire et chaleureuse, « conte
  héroïque »), **Sofia Sans Condensed** (étiquettes en capitales, comme la fiche), **Crimson Pro**
  (texte courant, livre).
- Signature ✦ : la **bande crantée** (encoches en demi-lune aux extrémités, comme la fiche papier) pour
  la bande des caractéristiques, les en-têtes de modale et le bandeau du rendu des jets ; le
  **dé primaire** cerclé d'or, la chaîne de critique en « étincelles » (✦) dans l'historique.

## 8. Tests

- Front (`src/client/tests/systems/nimble/config/rules/`) : `formula` (formules, dés de catalogue),
  `dice` (retrait gauche→droite, raté, critique en chaîne, Féroce, d66, initiative, tests 1/20),
  `character` (dérivés : Défense, compétences, dés de vie, Blessures max, emplacements, mana),
  `actions` (dégâts : Défense, PV temporaires, 0 PV, mourant, critique ; repos), `creation`
  (tableaux, prérequis d'historique), `levelUp`, `encounter` (armure des monstres, sbires).
- Serveur : `tests/server/systems/nimble/fixture.js` (contrat `/characters`).

## 9. Hors périmètre

Multiclassage (règle optionnelle), variantes de déplacement, Boon & Bane Actions, aventures et lieux
du GM's Guide, extensions en brouillon, homebrew Nim+.

## 10. Décisions prises seul

| # | Sujet | Décision | Raison |
|---|---|---|---|
| D-1 | Version | PDF 3.x (Core 3.3, livrets 3.0, Zéphyr 3.1, GMG 3.0) ; vault 2.0.3 écarté pour les valeurs | Réponse du MJ (« probablement la 3.0 ») ; le vault est en retard d'une édition (ex. prétirés à Rage 1d4) |
| D-2 | Langue des contenus | Tout traduit en français, nom VO en sous-titre (catalogues, aide de jeu) | Table francophone ; le VO garde le lien avec les PDF |
| D-3 | Traductions | Glossaire imposé (`format_catalogues.md` §1) : FOR/DEX/INT/VOL, Blessures, repos sûr, dé primaire, Féroce, Tricheur, Assermenté, Ombromancien, Berger, Tisse-chant, Mue-tempête… | Cohérence entre 7 transcriptions parallèles |
| D-4 | Transcription | Faite par agents, au format du contrat, vérifiée par chargement et par tests de cohérence (clés, niveaux) | Volume (≈ 12 000 lignes de source) |
| D-5 | Combat générique | Non utilisé (stub) ; onglet Rencontre propre au MJ, gardé dans le navigateur | Nimble n'a ni ordre d'initiative ni jet pour toucher ; état de rencontre sans intérêt après la séance |
| D-6 | Critique | Chaîne et réserve Féroce pré-tirées dans le même jet, seuls les dés utilisés sont montrés | Un seul jet, une seule entrée, moteur inchangé |
| D-7 | Actions | 3 cases sur la fiche, initiative → actions, jets → dépense, Fin du tour → 3 ; les attaques du tour proposent le désavantage précipité | Mécanique centrale de Nimble, triviale à suivre pour l'app |
| D-8 | Dégâts | Fenêtre « Subir des dégâts » : Se défendre (Défense, sauf critique), PV temporaires d'abord, 0 PV → 1 Blessure + mourant, dégâts en mourant → 2 Blessures (3 sur critique) | Règles exactes du livre, pénibles à la main |
| D-9 | Montée de niveau | Assistant sur la fiche, hors mode Édition (c'est du jeu : le MJ l'accorde au repos sûr) | Beaucoup d'éléments à la fois |
| D-10 | Départ au-dessus du niveau 1 | Création au niveau 1, puis montées de niveau successives | Une seule logique ; l'or de départ se multiplie à la main |
| D-11 | Compétences héroïques | Règle optionnelle proposée en interrupteur dans l'assistant (1-4 points), désactivée par défaut | Le livre la laisse au MJ |
| D-12 | Maîtrise des armes | Calculée par la règle de la classe ; corrigeable par arme en Édition | Les livrets décrivent la maîtrise en mots (« armes de DEX ») |
| D-13 | Effets d'ascendance et d'historique | Automatisés quand ils changent un nombre de la fiche (Vitesse, Blessures max, dés de vie, compétences, Défense, avantage d'initiative) ; le reste en texte | « Automatiser seulement le pénible » |
| D-14 | Identité visuelle | « Carnet de l'aventurier » (§7) sans validation de planche ; planche produite quand même comme référence | Autonomie demandée |
| D-15 | Personnage de test | « Dargoss Manfield », elfe Chasseur, portrait fourni par le MJ (hommage proposé par le MJ) | Fiche réaliste pour la vérification à l'écran |
| D-16 | Sbires | Jet groupé dédié (`nimble_minions`) : un dé par sbire, les 1 ratent, dégâts additionnés en une seule attaque | GM's Guide p.7 (« roll 5d6, ignoring any 1s ») |
| D-17 | Potions | « Boire » sur une potion du paquetage : jet de soin, PV rendus, une potion de moins | Soins fréquents, trois gestes en un |
| D-18 | PV des légendaires | `hpPerHero` du bestiaire multiplié par le nombre de héros de la table à l'ajout dans la rencontre | Règle du GM's Guide (PV par héros) |
| D-19 | Montée de niveau : PV | Type de jet `nimble_levelhp` (dé de vie avec avantage), ou gain fixe | Core Rules p.21 |
| D-20 | Écoles en plus | Une capacité qui fait apprendre une école (Tisse-chant niv. 2, Mue-tempête, sous-classes) se règle dans la montée de niveau (« Apprendre une école », replié) | Texte libre dans les livrets, pas de champ structuré |

## 11. Implémentation (2026-11-04)

**Serveur** : `src/server/systems/nimble/config.js`, `CharacterController.js` (FLAT_COLUMNS en COALESCE, JSON relus, `character_items` par `syncSubTable`) ; `database-template/nimble-schema.sql` ; `tests/server/systems/nimble/fixture.js`. Aucune route ni socket propre, aucune migration (nouveau slug : la base se crée depuis le schéma).

**Front** (`src/client/src/systems/nimble/`) :
- `config.jsx` (hooks de dés : attack, check, save, initiative, hitdice, plain, levelhp, minions ; combat stub), `Brand.jsx`/`Brand.css`, `theme.css` ;
- `config/` : catalogues transcrits (`classes/*.js`, `spells.js`, `ancestries.js`, `backgrounds.js`, `motivations.js`, `equipment.js`, `boons.js`, `bestiary.js`), `basics.js`, `catalog.js` (index), `descriptions.js`, `reference.js` + `reference/*.md` (19 sections de règles) ;
- `config/rules/` : `formula`, `dice`, `character`, `actions`, `items`, `levelUp`, `creation`, `encounter` (pur) ;
- `hooks/` : `useNbRoll` (seul lancement de jet), `useNbActions`, `usePlayerPatch`, `useTableCharacters`, `useBoxSize` ;
- `components/` : `ui/` (NbTopBar, NbUi), `layout/` (NbSheet, NbBands, NbSections, NbEditForm, NbHistoryEntry, NbGmTableRow, NbMonsterCard), `modals/` (NbRollModal, NbAttackModal, NbHpModal, NbRestModal, NbLevelUpModal, NbChoiceList, NbSheetModals), `creation/` (CreationTabs, CreationHelp) ;
- `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`, `gm/tabs/TabSession.jsx`, `gm/tabs/TabEncounter.jsx`.

**Tests** : `src/client/tests/systems/nimble/config/rules/` (formula, dice, character/actions, creation/levelUp/encounter : 58 tests). Contrat `/characters` serveur au vert.

**Vérifié à l'écran** (Edge headless) : fiche jour et nuit (Dargoss, Chasseur 3 ; Ysolde, Mage 5), attaque et critique en chaîne (animation par vagues, historique, notification), sort, montée de niveau, catalogue d'équipement, aide de jeu et recherche, assistant de création, interface MJ (Session, Rencontre avec bestiaire), planche jour et nuit.

## 12. Points à relire avec le MJ

| # | Sujet | État |
|---|---|---|
| R-1 | Noms traduits libres (ascendances exotiques : Démonide, Lapinou, Avien, Cristallide, Limonien, Raton, Hermineau, Tortuéen, Wyrdelin ; capacités et sorts) | À valider en jeu ; un nom se change dans son catalogue |
| R-2 | Noms de sorts cités dans les textes de classe : quelques variantes avec `spells.js` (ex. « Embraser » / « Embrasement ») | Harmonisation de texte, sans effet sur les règles |
| R-3 | Table du chaos (Wyrdling, Mage du Chaos) : absente des PDF fournis | Non transcrite |
| R-4 | Ressources propres à certaines sous-classes (mana de la Lame-sort, baumes et pièges à bestioles du Chasseur) non déclarées | Se suivent en notes ou par un ajustement |
| R-5 | Dés de Furie du Mage des muscles (`furyDice`), bonus de haut niveau en dés (Déflagration d'ombre) | Rappelés en texte, pas ajoutés automatiquement au jet |
| R-6 | Monstres des aventures régionales (p.86 et suivantes du GM's Guide) | Hors bestiaire, non transcrits |

