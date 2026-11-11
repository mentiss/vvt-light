# Spec — Refonte du slug `fabula` (Fabula Ultima)

> Statut : **phase 2, à relire** (rédigée le 2026-11-05). Planche : `documentations/fabula/planche_fabula.html` (v2, retours du MJ de Fabula intégrés).
> Lancée le 2026-11-04 : carte blanche pour une refonte graphique « waouh », moderne, centrée sur l'usage, **jRPG** (le « j » compte).
> Les règles fonctionnelles restent celles de `specifications_fonctionnelles_fabula_ultima.md`, écrite par le MJ de Fabula : ses écarts au livre sont des règles de table. La présente spec ne change une règle que là où le MJ l'a demandé (§3).

---

## 1. Cadrage validé

| Sujet | Décision |
|---|---|
| Périmètre | Aspect, UX, manière de montrer et d'utiliser. Plus les demandes du MJ : attributs sous la base, cycle des arcanes, compétences dans la fenêtre de jet, fiche de groupe, dés en 2D. |
| Identité | « Cristal & Commandes » : fenêtres de menu bleu nuit partout, jour comme nuit ; c'est le monde derrière qui change (plaine en demi-teinte le jour, ciel étoilé la nuit), avec une ambiance animée qu'on peut couper. |
| Polices | **Classiques** : Credit Valley (marque), Antonio (intitulés, chiffres), PT Sans Narrow (texte). |
| Japonais | Surtitres décoratifs gardés. Katakana pour les mots empruntés (ステータス, ジョブ, コマンド), kanji pour les mots japonais (能力, 絆, 装備, 魔法, 道具, 記録, 判定). Jamais seuls porteurs d'une info. **Le MJ lit le japonais** : rien d'approximatif. |
| Emojis | Aucun : une famille d'icônes SVG propre au slug (`FuIcon`). |
| Dés | Gemmes colorées par taille (d6 pierre, d8 émeraude, d10 saphir, d12 topaze) dans la fiche, la fenêtre de jet et l'historique. **Fabula passe aux dés 2D** (§4). Les dés 3D multicolores vont au backlog. |
| Interface MJ | Barre latérale gardée, en cartes enrichies (mini-jauges, Crise, PF, PF dépensés). |
| Fiche | Mono-onglet ; compétences **et sorts** dépliables au clic ; altérations en arbre (R-3 validé). |

---

## 2. Planche : réponses du MJ (2026-11-05)

| # | Sujet | Réponse |
|---|---|---|
| Q-1 | Fenêtres bleu nuit partout | Pas de retour explicite ; validé de fait par la suite (fond du jour revu, interface validée). |
| Q-2 | Polices | Classique. |
| Q-3 | Surtitres japonais | Gardés, relus. |
| Q-4 | Ambiance animée | Oui ; fond du jour assombri, pétales plus visibles (fait en v2). |
| Q-5 | Dés colorés | Oui en 2D ; 3D au backlog. |
| Q-6 | MJ | Barre latérale en cartes (fait en v2). |
| Q-7 | Compétences dépliables | Oui, et les sorts aussi (fait en v2). |
| R-1 | Bornes des attributs | Validé (§3.1). |
| R-2 | Total coupé dans l'historique | Corrigé sur la planche. |
| R-3 | Altérations en arbre | « Parfait ». |
| R-4 | Objets payés en PI | Relève de la fiche de groupe (§7). |
| — | Interface et bornes | « Très bien ». |

---

## 3. Règles touchées (demandes du MJ)

### 3.1 Attributs : ajustement au-dessus et au-dessous de la base

- Aujourd'hui : chevron ▲ pour un bonus, ▼ seulement pour retirer un bonus (`AttributesPanel`, plancher à 0).
- Cible : ▲ et ▼ montent ou descendent d'un cran, **sous la base comprise**. Le dé effectif reste borné de d6 à d12 ; ▲ disparaît quand il est à d12, ▼ quand il est à d6.
- `effectiveAttrDie` (`config/utils.js`) accepte déjà un ajustement négatif et borne le résultat : seul le panneau change.
- L'ajustement enregistré (`boostsAttributs`) reste dans la plage permise par le dé de base (de d6 − base à d12 − base), pour qu'aucun clic ne soit « perdu » quand une altération est levée ensuite.
- Aucun changement de schéma (JSON existant).

### 3.2 Arcanes : cycle en trois étapes

D'après le §Arcaniste de la spec fonctionnelle, validé par le MJ :

```
Lié ──Fusionner (−40 PM)──▶ Fusionné ──Renvoyer──▶ Renvoi ──Effet utilisé──▶ Lié
                               │
                               └── Renvoyer sans effet ──▶ Lié
```

- Un arcanum ajouté à la fiche est **lié**.
- **Fusionner** retire 40 PM, moins la réduction d'**Arcanum d'urgence** quand le personnage est en Crise ([NC × 5]). Le bouton affiche le coût réel. Le reste (PV de Régénération arcanique, etc.) se fait à la main.
- **Un seul arcanum fusionné à la fois** : « Fusionner » est grisé sur les autres tant qu'un arcanum est fusionné ou en renvoi.
- L'étape affiche le texte utile : effets de fusion quand il est fusionné, effet de renvoi à l'étape Renvoi.
- Un arcanum **sans effet de renvoi** (Arcanum de l'Épée, `effetRenvoi: null`) passe de Fusionné à Lié.
- **Renvoyer sans effet** (fin de scène, perte de connaissance, sortie de scène) ramène directement à Lié.
- PM insuffisants : « Fusionner » est grisé, avec le coût en info-bulle.

### 3.3 Compétences dans la fenêtre de jet

Une ligne « Compétences » dans la fenêtre de jet, en pills, avec **seulement** les compétences du personnage qui modifient ce jet. Chaque compétence concernée porte son effet en donnée dans `classes.js`. `afterRoll` le lit, et l'historique garde le nom de la compétence (« Frénésie ») pour que la table voie pourquoi.

Relevé de `classes.js` (toutes les classes), à valider par le MJ (Q-2) :

| Classe | Compétence | Effet sur le jet | Proposition |
|---|---|---|---|
| Furie | Frénésie | Précision avec arme lutte, dague, articulée ou de jet : **critique sur tout double** (le double 1 reste un échec critique). | Auto (catégorie de l'arme) |
| Maître d'armes | Maîtrise des armes de corps à corps | +[NC] aux tests de précision au corps à corps. | Auto (portée de l'arme) |
| Tireur d'élite | Maîtrise des armes à distance | +[NC] aux tests de précision à distance. | Auto (portée de l'arme) |
| Élémentaliste | Artillerie magique | +[NC × 2] au test de magie d'un sort offensif, avec une arme arcanique équipée. | Auto (arme arcanique équipée) |
| Maître érudit | Concentration | +[NC] sur un test **ouvert** [INT + INT]. | Pill proposée sur [INT + INT], à cocher |
| Furie | Provocation | Test opposé [PUI + VOL], +[NC]. | Raccourci : pré-remplit attributs et bonus |
| Orateur | Condamnation | Test opposé [INT + VOL], +[NC]. | Raccourci |
| Roublard | Vol spirituel | Test [DEX + VOL] contre la Déf. magique, +[NC]. | Raccourci |
| Roublard | Vivacité | +[NC] aux tests de l'attaque ou de l'action gratuite en début de conflit. | Pill manuelle |
| Sombrelame | Douloureuse leçon | Analyse gratuite, +[NC]. | Pill manuelle |
| Furie | Adrénaline | En Crise, +[NC × 2] dégâts. | Auto sur les dégâts en Crise |
| Élémentaliste | Sorcelame | Utiliser la formule de précision de l'arme pour le test de magie (sort à cible unique, coût ≤ [NC × 10]). | Pill qui remplace les attributs |
| Maître érudit | Le savoir, c'est le pouvoir | Remplacer un dé de précision par Intuition. | Rien : la fenêtre laisse déjà choisir les attributs |
| Entropiste | Nombre porte-bonheur | Une fois par scène, après un test, remplacer un dé par le nombre porte-bonheur (7 en début de séance, puis la valeur remplacée). | Bouton après le jet ? (Q-3) |

Écartées (pas un test du personnage, ou dépendent de la cible ou d'un autre joueur) : Coup bas, Cataclysme, Œil de lynx, Frappe de l'ombre, Brèche, Broyage, Coup de semonce, Contre-attaque, Tirs croisés, Magie de soutien, Fidèle compagnon, Bourlingueur (tests de voyage), et les compétences sans effet sur un jet. Elles se gèrent à la main avec le modificateur.

Les armes du catalogue portent `categorie` et `portee` : la pré-activation est possible quand l'arme équipée vient du catalogue ; une arme saisie librement sans catégorie laisse la pill à cocher.

---

## 4. Dés en 2D (brique de plateforme)

Validé : Fabula lance des dés 2D, au centre de l'écran, comme les dés 3D.

- `diceEngine.roll()` ne change pas : il envoie toujours la séquence d'animation (groupes, vagues, libellés, explosions) à `diceAnimBridge`.
- `DiceAnimationOverlay` devient un aiguillage : rendu 3D (`dice-box-threejs`, inchangé) ou rendu 2D (nouveau composant de la plateforme), selon le `config.jsx` du slug (`dice.renderer: '2d'`, défaut `'3d'`).
- Le rendu 2D rejoue la même séquence avec les mêmes temps (vagues, explosions, affichage final) : formes par taille de dé (d4, d6, d8, d10, d12, d20, d100), chiffres qui défilent puis se posent.
- Brique `Die2D` (`type`, `value`, configuration résolue) : utilisée par l'overlay, et réutilisable par les rendus de jet des slugs (historique, notification, fenêtre de jet) pour le même dé partout.
- Un slug en 2D ne charge pas la 3D (page plus légère).
- Contrat à reporter dans `spec_diceengine_v2.md` et `src/client/CLAUDE.md`.

### 4.1 Apparence des dés : une même notation pour la 2D et la 3D (validé le 2026-11-05)

**Format** : une configuration de dé, complète ou partielle, au format que lit déjà la bibliothèque 3D (`diceConfigDefault.custom`) : `foreground` (chiffre), `background` (corps), `outline` (contour du chiffre), `edge` (arête), `texture` (`cloudy`, `marble`, `wood`, `metal`, `stars`, `stainedglass`… : images de `public/dice-assets/`), `material` (`none`, `plastic`, `metal`, `glass`, `wood`).

**Quatre niveaux, résolus champ par champ** (la première valeur trouvée gagne) :

| Ordre | Niveau | Où | Usage |
|---|---|---|---|
| 1 | Dé | séquence : `waves[n].colors[i]` (une configuration par dé, dans l'ordre des valeurs) | cas ponctuel (dé de Détermination de Dune, Fortune d'Achtung) |
| 2 | Groupe | séquence : `groups[n].color` (objet ; la chaîne `'default'` d'aujourd'hui reste acceptée) | un groupe entier d'une autre couleur |
| 3 | Type de dé | `config.jsx` du slug : `dice.byType: { d6: {…}, d8: {…} }` | direction artistique du jeu (gemmes de Fabula) |
| 4 | Joueur | « Réglages des dés », initialisés par `diceConfigDefault` | tout ce que le slug ne fixe pas |

- Une seule fonction pure de la plateforme fait la résolution ; la 2D l'utilise dès maintenant, la 3D le jour où la bibliothèque saura colorer chaque dé. Testée.
- Sans `colors`, `color` ni `byType`, rien ne change pour les slugs existants.
- **Fabula** : `dice.byType` porte les quatre gemmes (d6 pierre, d8 émeraude, d10 saphir, d12 topaze) ; ses hooks gardent `color: 'default'`.

**Configuration et CSS** : la 2D applique **tous** les champs. Elle pose sur chaque dé les variables `--die-fg`, `--die-bg`, `--die-outline`, `--die-edge`, `--die-texture` et les attributs `data-type`, `data-material` ; la texture remplit la forme du dé, teintée par le fond ; la matière devient un traitement de surface (plastique : reflet doux ; métal : reflet dur ; verre : translucide, reflet net ; bois : mat ; aucune : à plat). Le CSS de base dessine à partir de ces variables seulement. Un slug peut :
- passer par la configuration (rendu valable en 2D et, plus tard, en 3D) ;
- et / ou styler en CSS (`.vtt-die2d[data-type="d8"]`…) : rendu propre à la 2D, choix assumé ;
- les deux se combinent : la configuration donne les valeurs, le CSS les reprend (lueur en `var(--die-outline)`) ou les remplace. Fabula : couleurs par configuration, effets (lueur, reflet de gemme) en CSS.

**« Réglages des dés » en 2D** : la 2D applique la configuration du joueur pour tout ce que le slug ne fixe pas (texture, matière…) ; les réglages de couleur gardent donc leur sens. Seuls les réglages de physique (force, gravité) sont masqués en 2D. Ceci remplace la réponse à Q-4 de la planche (« seulement animation activée ou coupée »), donnée avant ce modèle.

**3D d'ici le chantier du backlog** (à trancher, Q-8) : garder la couleur du joueur pour tout le lancer (recommandé), ou appliquer la configuration quand tous les dés du lancer résolvent la même (rechargement des textures à chaque lancer).
- **Backlog** : dés 3D multicolores (une couleur par dé dans un même lancer). La bibliothèque n'applique qu'un jeu de couleurs par lancer ; elle n'est plus maintenue, on la modifiera nous-mêmes (`patch-package`) le jour venu.

---

## 5. Direction graphique (planche v2 = référence du thème)

Report de la planche dans `systems/fabula/theme.css` et `Brand.css` :
- tokens `--fu-*` (fenêtres, or, cuivre, jauges PV / PM / PI / Crise, gemmes de dés, états) ;
- fenêtre `fu-win` (verre, reflet, liseré, éclat de coin) pour les sections de la fiche et les classes `vtt-*` (modales, menu, catalogue, zone d'actions, barre de session, historique) ;
- monde animé derrière la page (pétales le jour, étoiles, aurore et cristaux la nuit), coupé si le système demande moins d'animations ;
- curseur ▶, tampon « Critique ! » / « Fumble… », chiffres de dégâts qui sautent ;
- icônes `FuIcon` à la place de tous les emojis (onglets, menu, zone d'actions, historique, fiche).

Les planches de la plateforme (`refonte_plateforme/`) servent pour vérifier l'habillage des classes `vtt-*`.

---

## 6. Cible UX

### 6.1 Fiche joueur (mono-onglet)
Comme la planche, section 3 : héros (portrait, prénom et nom séparés, joueur, classes, concept, mensurations) ; statut (jauges PV / PM / PI avec seuil de Crise posé sur la jauge, dégâts qui traînent, ±1 / ±5 / ±10 ; Crise, Défense, Déf. magique, Initiative, Zénits) ; attributs et altérations en arbre ; Points Fabula en cristaux avec rappel des règles ; liens et sentiments ; classes et compétences dépliables ; équipement en emplacements avec « Attaquer » ; sorts dépliables avec « Lancer » (sorts avec test seulement) et arcanes (§3.2) ; sac. Mode Édition inchangé dans son principe.

### 6.2 Fenêtre de jet
Préparation et résultat côte à côte, gemmes à la taille effective, modificateur et ND au pas à pas, formule écrite en clair, ligne « Compétences » (§3.3), dégâts selon l'arme ou le sort, relance d'un clic.

### 6.3 Historique et notification
Même rendu (règle de la plateforme) : gemmes miniatures, intitulé, détail, total, verdict, compétence appliquée.

### 6.4 Interface MJ
Barre latérale en cartes (section 7 de la planche) ; la fiche du héros choisi reste `FicheGrid`, identique au joueur. Onglet Groupe (§7).

### 6.5 Assistant de création
Habillé par le thème (fenêtres, dés en gemmes, icônes) ; parcours inchangé.

---

## 7. Fiche de groupe

Source : `X:\jdr\fabula\Fabula Ultima FR\Fiches et Feuilles\Fabula Ultima - FR - Fiche de Groupe.pdf` (lecture seule). Trois blocs :

1. **Objets d'inventaire** : les objets payés en PI, « en fait j'avais ça sur moi », jamais rangés dans un sac.

   | Objet | PI | Effet |
   |---|---|---|
   | Élixir | 3 | Une créature regagne 50 PM. |
   | Remède | 3 | Une créature regagne 50 PV. |
   | Fragment élémentaire | 2 | Une créature subit 10 dégâts d'un type de votre choix (air, foudre, terre, feu ou glace). |
   | Tente magique | 4 | Permet à tout le groupe de se reposer dans la nature. |
   | Tonique | 2 | Une créature récupère d'un seul état. |

   La fiche laisse des lignes vides : la table peut ajouter ses propres objets (nom, PI, effet).
2. **Notes de groupe et cadrans** : un texte libre et des cadrans (trois sur la feuille).
3. **Journal** : des entrées « personnages, créatures et localisations » avec leurs notes.

Proposition :
- **Une fiche par table** (comme la coterie de Vampire) : base du slug, route `/api/fabula/groupe`, diffusion `fabula-groupe-update` dans la room après chaque écriture.
- **Joueurs et MJ** lisent et écrivent tout (Q-6 pour les cadrans).
- **Utiliser un objet** depuis la fiche d'un PJ : un bouton près de la jauge PI ouvre la liste du groupe ; choisir un objet retire ses PI au PJ (grisé si PI insuffisants) et laisse une trace dans l'historique (« Lyra utilise un Remède, −3 PI »). L'effet (soins, état) reste à la main. **Fragment élémentaire** : l'utiliser ouvre le choix du type, sans jet.
- **Où** : onglet « Groupe » côté joueur et côté MJ (la fiche du personnage reste mono-onglet ; le groupe n'est pas le personnage).
- **Cadrans** (validés le 2026-11-05) : nom, nombre de sections (4, 6, 8…), sections remplies ; un clic remplit ou vide.
- Les objets officiels sont une donnée du slug (`config/groupItems.js`), proposée à chaque fiche ; les objets ajoutés par la table sont en base.

---

## 8. Données

| Changement | Où | Migration |
|---|---|---|
| `character_arcana.etat` accepte `renvoi` | `fabula-schema.sql` (CHECK) | Oui : reconstruction de la table (clés étrangères coupées pendant la migration) |
| Ajustement d'attribut négatif | JSON `boosts_attributs` existant | Non |
| Fiche de groupe : `groupes` (une par `session_id` : notes), `groupe_objets` (objets ajoutés : nom, PI, effet), `groupe_cadrans` (nom, sections, remplies), `groupe_journal` (titre, notes) | `fabula-schema.sql` | Oui (création des tables) |
| Compétences au jet | `config/classes.js` (donnée) | Non |
| Objets officiels du groupe | `config/groupItems.js` (donnée) | Non |

Tests : effet des compétences sur le critique et les bonus (`afterRoll`), coût de fusion avec Arcanum d'urgence, bornes des attributs, cycle des arcanes ; contrat de la route du groupe (`tests/server/systems/fabula/`).

---

## 9. Lots proposés

| Lot | Contenu |
|---|---|
| 1 | Thème : `theme.css`, `Brand.css`, `FuIcon`, fenêtres, monde animé, habillage des `vtt-*` ; plus d'emojis. **Implémenté le 2026-11-05** (non commité) : couleurs identiques jour et nuit (tout est fenêtre), monde `FuWorld`, bande `FuBand`, onglets en commandes, panneaux en `.fu-win` avec surtitres japonais, icônes `FuIcon` (menus, onglets, zone d'actions, rendus de jet), dés 3D par défaut aux couleurs des fenêtres. Les boutons `bg-primary text-white` gardent une encre sombre en attendant le lot 2. |
| 2 | Fiche : jauges, attributs en arbre (§3.1), compétences et sorts dépliables, arcanes (§3.2, migration), équipement, sac ; barre latérale MJ en cartes. **Implémenté le 2026-11-05** (non commité) : briques `FuGauge`, `FuDie` ; règles pures dans `config/utils.js` (`attrAdjustable`, `adjustAttrBoost`, `arcanumFusionCost`, `nextArcanumState`, testées) ; migration `05112026_fabula_arcana_renvoi.sql` (à jouer sur les bases existantes) ; test serveur du cycle des arcanes. |
| 3 | Fenêtre de jet et historique : nouveau rendu, compétences (§3.3), dégâts des sorts. **Implémenté le 2026-11-05** (non commité) : effets au jet dans `classes.js` (`rollEffect`), règles pures dans `config/rolls.js` (testées) ; fenêtre sur la `Modal` de la plateforme ; Nombre porte-bonheur (colonnes `porte_bonheur`, `porte_bonheur_utilise`, migration `05112026_fabula_porte_bonheur.sql`, jet corrigé ajouté à l'historique). |
| 4 | Dés 2D (plateforme, §4) puis gemmes Fabula. **Implémenté le 2026-11-06** (non commité) : aiguillage `DiceAnimationOverlay` → `DiceOverlay2D` / `DiceOverlay3D` (3D chargée à la demande) ; `Die2D` ; règles pures `features/dice/tools/dice2d.js` (testées) ; réglages de physique masqués en 2D ; Fabula `dice.renderer: '2d'` et `dice.byType` (gemmes) ; contrat reporté dans `spec_diceengine_v2.md` et `src/client/CLAUDE.md`. |
| 5 | Fiche de groupe (§7) et « Utiliser un objet ». **Implémenté le 2026-11-06** (non commité) : tables `groupes`, `groupe_objets`, `groupe_cadrans`, `groupe_journal` (migration `06112026_fabula_fiche_groupe.sql`) ; `GroupeController.js` et route `/api/fabula/groupe` (membres de la table seulement, cache des cadrans réservé au MJ, diffusion `fabula-groupe-update`) ; onglet « Groupe » joueur et MJ (`GroupSheet` : objets officiels et de la table, notes, cadrans, journal) ; « Utiliser un objet » sous la jauge PI, PI retirés et trace `fabula_objet` dans l'historique ; Fragment élémentaire avec choix du type ; test du contrat de la route. |
| Retour | Disposition de la fiche (2026-11-06, retour de l'utilisateur sur les grands vides) : Héros en bandeau pleine largeur (identité · concept évocateur · mensurations, sans compactage) ; rangée Statut · Attributs (hauteurs voisines) ; puis deux colonnes indépendantes, Points Fabula + Liens + Classes · Équipement + Sorts & Arcana + Sac. Les Liens grandissent jusqu'à 6 liens : dans une colonne libre, ils ne creusent pas de vide sous la rangée. En une colonne : Héros → Statut → Attributs → Équipement → Sorts → Sac → Points Fabula → Liens → Classes. Armure, armes et accessoire réunis dans une fenêtre « Équipement » (装備). Retouches suivantes : Points Fabula à côté du Héros (rappel des règles toujours affiché, plus de « ? »), Statut et Attributs à même hauteur (« Clic sur un dé : test » retiré), objets de l'équipement et du sac encadrés comme les arcanes (emplacement vide en pointillés), filet après le titre d'Équipement et du Sac, pastilles de classe du Héros cliquables (défilement jusqu'à la classe, qui brille), « Ajouter » un lien toujours disponible (brouillon enregistré seulement à « Valider »), barre de session : quand la plateforme fixe la liste au défilement, la fenêtre d'origine restée derrière est masquée. |
| Backlog | Dés 3D multicolores (§4). |

Chaque lot : lint, tests, build ; un commit par chantier.

---

## 10. Questions

Les questions pour le MJ de Fabula (compétences au jet, Nombre porte-bonheur, renvoi sans effet, réglages des dés 2D, onglet Groupe, cadrans, trace des objets, Fragment élémentaire, japonais) sont dans la planche, section 9 (Q-1 à Q-9). **Réponse du MJ (2026-11-05) : toutes les recommandations validées.** Il a aussi signalé le menu « Utiliser un objet » qui passait sous la fenêtre des attributs (corrigé sur la planche : la fenêtre ouverte passe devant ses voisines) ; Nombre porte-bonheur et Fragment élémentaire sont maintenant jouables sur la planche. Les questions Q-2 à Q-7 ci-dessous sont donc tranchées (reco) ; reste Q-1 (ordre des lots).

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q-1 | Ordre des lots : thème d'abord (tout change d'un coup), ou fiche et thème ensemble ? | Thème d'abord : il touche aussi les modales et la création, et se vérifie seul. | Thème d'abord (2026-11-05). |
| Q-2 | Liste des compétences au jet (§3.3) : la valider telle quelle, ou en retirer ou ajouter ? | Telle quelle. | |
| Q-3 | Nombre porte-bonheur : bouton « Remplacer un dé » sur le résultat (une fois par scène, nombre gardé sur la fiche) ? | Oui : c'est pénible à suivre de tête. | |
| Q-4 | Réglages des dés en 2D : seulement animation activée ou coupée ? | Oui. | |
| Q-5 | Fiche de groupe : onglet « Groupe » côté joueur et MJ ? | Oui. | |
| Q-6 | Cadrans : visibles et modifiables par les joueurs, ou réservés au MJ (avec des cadrans cachés) ? | Visibles par tous, cadrans cachés possibles pour le MJ. | |
| Q-7 | « Utiliser un objet » : laisse une trace dans l'historique des jets ? | Oui : la table voit qui a dépensé quoi. | |
| Q-8 | 3D en attendant la modification de la bibliothèque (§4.1) : couleur du joueur pour tout le lancer, ou configuration appliquée quand tout le lancer résout la même ? | Couleur du joueur : rien ne change en 3D d'ici là. | Une configuration pour tout le lancer : celle imposée par le joueur, sinon celle du slug, sinon celle de base de la plateforme. |

---

## 11. Retours du MJ après essai (2026-11-06)

### 11.1 Valeur d'initiative des PJ (correctif, validé)

La fiche calculait l'initiative avec la formule des PNJ (moyenne des tailles de dé DEX et INT + équipement). Pour un PJ, l'initiative vaut **0 + les modificateurs d'initiative de l'équipement porté**. Elle peut être négative.

- Le calcul est corrigé partout où il est fait : fiche, interface MJ, assistant de création.
- **Personnages existants** : une migration recalcule la valeur enregistrée à partir de l'équipement porté, pour que toutes les fiches soient justes dès la mise en prod.
- Test : la règle de calcul (sans équipement : 0 ; modificateurs additionnés ; valeur négative possible ; objets du sac ignorés).

### 11.2 Jet d'initiative depuis la case Initiative (validé : raccourci individuel)

Règle (livre, Scènes de conflit, Initiative) : test de groupe 【DEX + INT】 + initiative. Un PJ mène le test, les autres le soutiennent. Le meneur doit atteindre l'initiative la plus haute parmi les PNJ ; chaque soutien doit atteindre 10, et chaque soutien réussi ajoute +1 au résultat du meneur.

- Un clic sur la case Initiative du Statut (hors mode Édition) ouvre la fenêtre de jet, préremplie : DEX + INT, initiative en modificateur, libellé « Initiative ».
- La fenêtre propose un choix **Meneur / Soutien** :
  - **Soutien** : ND fixé à 10 ; le résultat affiche « Réussi : +1 au meneur » ou « Raté » ;
  - **Meneur** : ND saisi d'après l'annonce du MJ ; les +1 des soutiens réussis s'ajoutent au pas à pas du modificateur.
- Les compétences qui touchent le jet restent proposées, comme pour tout test.
- Le jet part dans l'historique avec son rôle (meneur ou soutien) : la table voit les soutiens.
- Pas de nouvelle donnée en base, pas de nouvel événement socket.
- **Backlog** : test de groupe orchestré par le MJ (désignation du meneur, demande de jet aux joueurs, total et verdict du groupe).

### 11.3 Volet des cadrans sur la fiche (validé)

Demande : quand un cadran est actif et visible des joueurs, un volet s'ouvre sur le côté de la fiche, pour ne pas devoir passer par l'onglet Groupe.

- Volet replié au bord droit de la fiche du joueur, présent seulement s'il y a au moins un cadran **visible et pas plein** (un cadran plein est résolu : il reste dans l'onglet Groupe).
- Fermé, c'est une languette qui porte le nombre de cadrans. Il s'ouvre d'un clic, et tout seul quand un cadran avance. Ouvert ou fermé est retenu par le navigateur.
- Ouvert, il montre les cadrans en version compacte, modifiables comme dans l'onglet Groupe (clic sur une section, −1 / +1), sans les réglages (Q-6 inchangée).
- Mise à jour en direct, comme l'onglet Groupe. Rien ne change côté serveur.
- Pas de volet côté MJ : il a l'onglet Groupe.

**§11.1 à §11.3 implémentés le 2026-11-06** (non commités) : `computeDerivedStats` et l'assistant de création (initiative = équipement porté), migration `06112026_fabula_initiative_pj.sql`, test `config/utils.test.js` ; case Initiative cliquable (`ResourceBar`, prop `onRollInitiative` de `FicheGrid`, fiche du joueur seulement), fenêtre de jet en mode `initiativeRoll` ; volet `components/group/ClockDrawer.jsx` (cadran `Clock` de `GroupSheet` en version `compact`).

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| C-1 | « Cadran actif » : tout cadran visible, ou seulement ceux qui ne sont pas encore pleins ? | Visible et pas plein. | Reco validée par le MJ (2026-11-06). |
| C-2 | Volet en lecture seule, ou avec le clic et −1 / +1 comme dans l'onglet Groupe ? | Modifiable, sans les réglages. | Reco validée. |
| C-3 | Volet ouvert d'office dès qu'un cadran apparaît, ou languette à ouvrir ? | Languette avec le nombre de cadrans, ouverture automatique quand un cadran avance, état retenu par le navigateur. | Reco validée. |
| C-4 | Volet aussi côté MJ, sur la fiche d'un PJ ? | Non. | Reco validée. |
