# Vikings : habillage « pierre peinte » et refonte de l'expérience

## Statut

**Planche validée par le MJ le 2026-11-07** après six versions : `documentations/refonte_vikings/planche_pierre_peinte.html`
(hors Git) **est la spécification graphique** et fait foi pour tout ce qu'elle montre. Ce document en garde la trace,
fixe le périmètre et le découpage. Deux conditions du MJ :

1. **L'ancien style reste accessible** : chaque joueur choisit « pierre peinte » (nouveau) ou « bois et or » (actuel).
2. **Tout est habillé**, pas seulement ce que montre la planche : fenêtres de la plateforme, barre de session, notifications, etc.

Le système de combat reste hors périmètre (spec_vikings.md §7) : il garde son fonctionnement, seules ses couleurs suivent l'habillage.

**Avancement (2026-11-07)** : lots 1 à 5 implémentés, retours du MJ traités, commités. **Reste le lot 6 : l'assistant de création** (voir §9), à mener dans un nouveau contexte.

Références : spec_vikings.md (règles, §10 direction graphique d'origine), spec_vikings_lot4_graphisme.md (thème actuel),
planche `UIkit_complet.html` (référence du « bois et or »), planche `planche_pierre_peinte.html` (référence du nouveau style).

---

## 1. Ce qui est déjà décidé (au fil des planches)

| # | Sujet | Décision |
|---|---|---|
| D-1 | Deux habillages | « Pierre peinte » et « Bois et or ». **Même disposition** pour les deux : seul l'habillage change. Le bois et or reprend le thème actuel tel quel (coins ornés, Eagle Lake, Grenze Gotisch, losanges de SAGA, cases de blessures et de fatigue). |
| D-2 | Palette pierre peinte | Culture matérielle du 9ᵉ siècle : pierre peinte (ocre rouge, suie, chaux), ambre, argent. Jour : pierre claire. Nuit : ardoise sous l'aurore (§3). |
| D-3 | Polices pierre peinte | Uncial Antiqua (titres), Alegreya SC (intitulés courts, onglets), Alegreya (texte, chiffres, saisies), Noto Sans Runic (runes). Toutes libres (OFL). |
| D-4 | Signature | Le **ruban-serpent** encadre l'en-tête du personnage et porte son nom en runes ; l'inscription coule lentement. Les titres de section sont des tronçons de ce ruban. |
| D-5 | Contenants | Dalles taillées (contour irrégulier, biseau, incision). Jour : texture de pierre légère. Nuit : surface unie, l'arête du haut prend la lumière du ciel. Fenêtres posées sur la page (plateau, notifications, fenêtres) toujours opaques. |
| D-6 | En-tête | Poutre de la maison longue : titre runique animé, onglets en fanions peints. Pas de nom de personnage dans l'en-tête. |
| D-7 | Bandeau d'état | SAGA (perles sur un fil), blessures et fatigue (bâtons à encoches) dans une dalle « État » sous l'en-tête du personnage ; au défilement, il s'amarre dans la poutre. Cliquable comme aujourd'hui. |
| D-8 | Compétences | Lecture « **seuil seul** » : losange du seuil, explosion à côté, dés retirés par les blessures, entailles des succès auto restants. |
| D-9 | Traits | Épithètes gravées sous le nom ; un clic ouvre la description. |
| D-10 | Ordre de la fiche | En-tête du personnage, État, Caractéristiques et Compétences, Combat · Équipement · Bourse et bagages, Runes. Pas de titres de zone. |
| D-11 | Plateau de jet | Remplace la fenêtre de jet : tiroir en bas d'écran, la fiche reste visible. **Repliable** en barre qui garde le dernier résultat. La zone d'actions et les notifications remontent au-dessus ; pendant un combat, il se range à côté du panneau de combat. |
| D-12 | Halle du MJ | Onglet Session : personnages en colonne à gauche (état, SAGA, points, actions rapides +1 Saga, Repos, Jet), fiche complète à droite. **Fin d'arc** en récapitulatif à valider d'un coup (SAGA attribuée, points restaurés, repos). |
| D-13 | Ciels vivants | Nuit : aurore boréale en rideaux de rayons. Jour : ciel nordique, nuages, rayons de soleil. Le ciel réagit au jeu (§3). |
| D-14 | Corbeau | Corbeau « ocre et entrelacs » (dessin Codex, `refonte_vikings/images/raven_knot_*.png`) qui vient se poser sur la dalle État, vit sa vie et repart ; vient aussi après un gain de SAGA ; un clic le fait partir ; reste si le personnage est KO. Sans son. |
| D-15 | Animations | Toutes coupables (réglage du joueur et « réduire les animations » du système). Coupées, le ciel reste affiché, figé. |

---

## 2. Choix de l'habillage

- Le joueur choisit son habillage dans le **menu** de sa page : « Pierre peinte » ou « Bois et or ». Jour / nuit reste sur le bouton de l'en-tête.
- Le choix vaut pour **toutes les pages du slug** que ce joueur ouvre : fiche, création, interface MJ (si c'est le MJ), pages d'accès.
- Le réglage « Animations » rejoint le même menu (modèle : cyberpunk, `CpAnimationsMenuItem`).
- Le bois et or ne reçoit **aucun des effets nouveaux** sauf ceux qui tiennent à la disposition (plateau de jet, bandeau amarré, halle), voir C-8.

## 3. Ciels et effets (pierre peinte)

| Événement | Nuit (aurore) | Jour (ciel) |
|---|---|---|
| Au repos | Rideaux qui ondulent, étoiles | Nuages qui dérivent, rayons de soleil lents |
| Gain de SAGA | Vague de lumière qui traverse le ciel, ruban embrasé | Rayon qui balaie le ciel, vol de corbeaux, ruban embrasé |
| Triple 10 | Éruption dorée du ciel, rune ᛊ | Le soleil perce en or, rune ᛊ |
| Blessures (page joueur) | L'aurore rougit (aurore de sang) | Crépuscule de sang à partir de Critique |
| KO (page joueur) | Le ciel s'éteint, la page se décolore | La page se décolore |
| Ouverture de la fiche | Gravure : le serpent se trace, l'inscription se glisse, le nom se peint | Idem |
| État du corps (page joueur) | Bords de l'écran rougis (blessures, battement de cœur à partir de Critique), vision troublée en périphérie (fatigue) | Idem |

## 4. Tout ce qui doit être habillé

Les deux habillages couvrent **chaque écran et chaque brique de la plateforme** que voit un joueur ou le MJ dans ce slug :

- **Pages du slug** : fiche joueur, interface MJ (tous les onglets, y compris Combat, Tableau, Journal, Historique, Aide de jeu), assistant de création, pages d'accès, d'erreur et de chargement.
- **Fenêtres de la plateforme** (spec_ui_modales.md) : fenêtres et leurs boutons, champs, pastilles, onglets segmentés, confirmations.
- **Menus** (spec_ui_menu.md) : menu hamburger, ses entrées et ses fenêtres (avatar, code d'accès, changer de personnage, réglage des dés, gestion des tables…).
- **Barre de session** (joueurs de la table), **notifications**, **zone d'actions** et ses volets (musique, historique), **panneaux flottants** (spec_ui_panneaux.md).
- **Historique des jets** et rendu des jets (même rendu dans l'historique et les notifications), **journal**, **aide de jeu** (spec_ui_reference.md), **catalogues** (spec_ui_catalogue.md), **tableau partagé**.
- **Fenêtres propres au slug** : évolution, ajout de compétence et de trait, envoi d'objet, posture défensive, jet MJ, inventaire.
- **Combat** (hors périmètre fonctionnel) : couleurs et polices de l'habillage choisi, sans refonte.

Méthode : une planche de contrôle des briques plateforme dans les deux habillages, validée avant le report dans le thème (méthode des planches d'habillage).

## 5. Découpage proposé

| Lot | Contenu | Prérequis |
|---|---|---|
| 1 | **Socle** : choix d'habillage, thème pierre peinte jour et nuit (couleurs, polices, dalles, ruban des titres, poutre et fanions), les deux habillages sur **toutes** les briques plateforme (§4), création et pages d'accès. Planche de contrôle des briques d'abord. | — |
| 2 | **Fiche** : nouvelle disposition commune joueur / MJ (en-tête au ruban-serpent, traits en épithètes, dalle État amarrée, seuil seul, inventaire en panneau) dans les deux habillages. | 1 |
| 3 | **Plateau de jet** : remplace la fenêtre de jet (joueur et MJ), repliable, cohabitation avec zone d'actions, notifications et panneau de combat. | 2 |
| 4 | **Halle du MJ** : colonne des personnages, fiche à droite, fin d'arc en récapitulatif. | 2 |
| 5 | **Vivant** : ciels jour et nuit et leurs réactions, gravure, état du corps, faveur des dieux, corbeau, réglage Animations. | 1, 2 |

Chaque lot se teste avant le suivant. Les règles du jeu ne changent pas.

## 6. Choix appliqués (la planche fait foi)

La planche validée est la spécification graphique : tout ce qu'elle montre s'applique tel quel, sans nouvelle validation. Points qu'elle ne tranche pas, réglés par défaut (à signaler seulement si l'un ne convient pas) :

| # | Sujet | Choix appliqué | Origine |
|---|---|---|---|
| C-1 | Nuits de la pierre peinte | Aurore (par défaut) et Foyer, au choix dans le menu, comme sur la planche. | Planche |
| C-2 | Chances de réussite | Affichées sur les compétences et dans le plateau, désactivables dans le menu (réglage du joueur), comme la case « Chances » de la planche. | Planche |
| C-3 | Corbeau | Page joueur et fiche affichée côté MJ, comme sur la planche. | Planche |
| C-4 | Transe berserk | Épithète Berserk : « Entrer en transe », compteur de tours 1 à 5, « Fin de la transe » ajoute 4 tokens de fatigue, comme sur la planche. Le compteur vit à l'écran (pas de nouvelle colonne en base). | Planche ; stockage : le plus simple |
| C-5 | Récupération des points de compétence côté joueur | Absente de la fiche hors mode Édition, comme sur la planche ; la fin d'arc la fait côté MJ. | Planche |
| C-6 | Choix d'habillage, nuit, animations, chances | Retenus dans le navigateur, propres au slug, comme jour / nuit et les animations de cyberpunk. | Autres slugs |
| C-7 | Habillage par défaut | Pierre peinte. | Nouvelle identité validée |
| C-8 | Effets nouveaux dans le bois et or | Ceux de la disposition (plateau, bandeau amarré, halle, épithètes) ; pas de ciels ni de corbeau : l'ancien style reste l'ancien. | Condition du MJ |
| C-9 | Carte du slug sur l'accueil | Inchangée (l'accueil ne connaît pas la préférence du slug) ; les pages d'accès du slug suivent l'habillage choisi. | Contrainte technique |

## 7. Points techniques à vérifier pendant l'implémentation

- **Zone d'actions et plateau** : la zone mesure sa propre position pour placer les notifications (`--vtt-actions-offset`, ActionZone.jsx). Vérifier qu'elle suit quand le plateau la déplace (`--vtt-actions-bottom`), sans modifier la brique plateforme si possible ; sinon, le signaler avant de la toucher.
- **Coexistence des deux habillages** dans `theme.css` : attribut sur la racine, sans casser les règles actuelles (pièges connus : classes `.vk-*` non « layered » qui écrasent Tailwind, jamais position / display / margin sur les `vtt-*`).
- **Performances** : ciel animé et flou d'état sur une tablette modeste ; coupure automatique si besoin.
- **Corbeau** : masques PNG dans `systems/vikings/assets/` (pas de data URI dans l'app).

## 8. Implémentation

### Lot 1 : socle (2026-11-07)

- **Préférence** : `hooks/useVkLook.js` (`usePersistedState('vikings', 'look')`, `{ skin: 'pierre' | 'bois', night: 'aurore' | 'foyer' }`, pierre et aurore par défaut). `useVkLookOnRoot()` pose `data-vk-skin` et `data-vk-night` sur `<html>` (modèle : `useLivery` de maledictum), avec un compteur pour que le départ d'un composant ne retire pas l'attribut à un autre. Monté dans `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx` et la variante titre de `Brand.jsx` (pages d'accès, d'erreur, de chargement ; la carte de l'accueil n'est pas touchée).
- **Menu** : `components/ui/VkLookMenuItems.jsx` (« Passer au bois et or » / « Passer à la pierre peinte », « Nuit au coin du feu » / « Nuit sous l'aurore »), dans le menu du joueur et du MJ.
- **Thème** : `theme-pierre.css`, importé par `theme.css`, toutes ses règles sous `html[data-vk-skin="pierre"]` ; `theme.css` (bois et or) n'est pas modifié, hors l'import. Polices Uncial Antiqua et Alegreya SC (Google Fonts, comme les polices actuelles du slug).
- **Dalles** : `components/ui/VkSlabBg.jsx` (contour taillé de la planche, texture de jour, arête éclairée la nuit sous l'aurore), rendu par `VkPanel` ; masqué dans le bois et or. Le cadre lourd de la fiche (`vk-sheet-frame`, SheetLayout) n'a pas de dalle : ce sont les sections qui en portent une. Briques de la plateforme sans dalle dessinée (fenêtres, barre de session, menus, journal, aide de jeu, tableau) : pierre en CSS (grain, biseau, liseré intérieur).
- **Reprises CSS seules** sur la fiche actuelle, en attendant le lot 2 : poutre et fanions (`vk-tabbar` sur les barres d'onglets du joueur et du MJ), SAGA en perles sur un fil, blessures et fatigue en bâton à encoches, points de compétence en entailles, caractéristiques en pierres levées, dés en losange.
- **Vérifié à l'écran** : création (pierre jour, aurore, foyer, bois et or nuit), pages d'accès joueur et MJ, fenêtres et journal, barre de session (planches `refonte_plateforme/` avec le vrai thème), puis l'interface MJ connectée (code MJ de dev corrigé par le MJ) : poutre, menu, gestion des tables, « Activer le son », aide de jeu, fiche, fenêtre de jet, zone d'actions.

### Lot 2 : fiche (2026-11-07)

- **Disposition commune** (SheetLayout, joueur et MJ, deux habillages) : en-tête du personnage, dalle État, Caractéristiques et Compétences, Combat · Équipement · Bourse et bagages, Runes ; titres de dalle `vk-band-title` (ruban en pierre peinte, Grenze Gotisch en bois et or), commandes à droite dans `vk-slab-aside`.
- **En-tête** (IdentitySection) : ruban-serpent `components/ui/VkSerpent.jsx` (inscription « Prénom fils / fille de Parent » en runes, fixe ; animée au lot 5), avatar, nom en runes et en clair, détails, **traits en épithètes** (clic : description et effets ; Berserk : « Entrer en transe »). En édition : champs d'identité, épithètes retirables, « Ajouter un trait ». `TraitsSection.jsx` supprimé (remplacé par les épithètes).
- **Dalle État** (SagaStateSection) : SAGA, blessures, fatigue côte à côte ; compteur de transe (tour 1 à 5, « Fin de la transe » +4 fatigue), tenu par SheetLayout, à l'écran seulement (C-4) ; Soigner / Repos et légende en édition. `VitalDock` : version compacte **amarrée dans l'en-tête de la fiche joueur** au défilement (Sheet.jsx).
- **Compétences** : « seuil seul » (losange du seuil, explosion, dés du pool, entailles, chance d'une réussite standard fatigue comprise, jet). Récupération des points en édition seulement (C-5). Règle pure `getSuccessChance` (rules.js) et translittération `toRunes` (runes.js), testées (`tests/systems/vikings/rules.test.js`).
- **Chances** : réglage « Masquer / Afficher les chances » du menu (`odds` dans la préférence, absent = affiché).
- **Équipement et bourse** (`GearSections.jsx`) : objets équipés, « Inventaire » ouvre InventorySection dans une fenêtre ; bourse (onces d'argent), nombre d'objets dans le sac et en réserve.
- **Vérifié à l'écran** (vue MJ) : pierre jour, aurore, bois et or ; mode Édition ; description d'épithète, transe, inventaire en fenêtre. **Non vérifié** : la fiche joueur et son bandeau amarré (pas de code joueur de dev).

### Lot 3 : plateau de jet (2026-11-07)

- **`components/ui/VkTray.jsx`** : tiroir fixé en bas de l'écran, repliable en une barre (titre, résumé du dernier résultat, Déplier, fermer), Échap ferme. Il remplace `VkModal` dans `DiceModal.jsx` (joueur et MJ, même composant) ; **la logique du jet n'est pas modifiée**, seul le contenant change (trois colonnes : le jet · paramètres, malus et options · Saga et lancer ; résultat à gauche, Relancer et Fermer à droite).
- **Cohabitation sans toucher aux briques de la plateforme** : le plateau pose `--vtt-actions-bottom` (variable prévue par index.css) à sa hauteur, puis déclenche un « resize » : ActionZone recalcule `--vtt-actions-offset` et les notifications remontent au-dessus d'elle. La page se rallonge de la hauteur du plateau (`--vk-tray-h` sur `.vk-root`). Panneau de combat présent (fixé en bas à gauche) : le plateau commence à sa droite.
- **Vérifié à l'écran** (vue MJ, sans lancer de jet) : plateau ouvert et replié, pierre peinte de jour et bois et or de nuit ; zone d'actions mesurée à 220 px du bas plateau ouvert, 64 px replié, 16 px fermé. **Non vérifié** : un vrai jet (animation des dés, résultat, notification) et la cohabitation avec le panneau de combat (aucun combat en cours).

### Lot 4 : halle du MJ (2026-11-07)

- **`gm/components/Hall.jsx`** : `HallCard` (un personnage par dalle en colonne à gauche : nom en ruban, avatar, joueur et présence, SAGA, blessures et fatigue cliquables, points de compétence restants, actions rapides +1 Saga, Repos (fatigue à 0), Jet ; clic : sa fiche à droite ; la sélectionnée porte un ruban ambre) et `ArcRecap` (fin d'arc : par personnage, SAGA attribuée (plafond 5, `gainSaga`), points restaurés, blessures et fatigue à 0 ; « Clore l'arc » applique tout d'un coup, une écriture PATCH par personnage).
- **TabSession** : la colonne devient la halle (en-tête « La table · n/m en ligne » et bouton « Fin d'arc », qui remplace la fiche par le récapitulatif) ; Note, Objet, Musique, Tableau restent sous la colonne. **`gm/modals/TableActionsModal.jsx` supprimé** (fin d'arc et actions rapides le remplacent ; le repos partiel se fait sur les bâtons).
- Perles, bâtons et `nextTokens` exportés par `SagaStateSection.jsx` pour la halle (perles en lecture seule).
- **Vérifié à l'écran** : halle et fin d'arc en pierre peinte de jour, sous l'aurore et en bois et or (récapitulatif ouvert puis annulé, aucune écriture). **Non vérifié** : « Clore l'arc », +1 Saga, Repos et le clic sur les bâtons de la halle (écritures en base, non lancées).

### Lot 5 : le vivant (2026-11-07)

- **Réglage** « Couper / Rétablir les animations » (menu, pierre peinte ; `anim` dans la préférence, posé sur `<html data-vk-anim>`). `livingOn(look)` : pierre peinte, animations actives et pas de « réduire les animations » du système. Le bois et or n'a aucun effet vivant (C-8).
- **Événements** (`hooks/useVkLook.js`) : `vk:saga-gain` émis par SheetLayout quand la SAGA du personnage affiché monte, `vk:triple` par DiceModal sur un triple 10 ; `detail.id` = personnage.
- **`components/ui/VkSky.jsx`** : ciel fixé derrière la page (`.vk-root` isolé, ciel en z −1) ; jour (nuages, rayons, corbeaux qui traversent au gain de SAGA, soleil doré au triple 10, crépuscule de sang à partir de Critique), aurore (rideaux, vague au gain, éruption au triple 10, aurore de sang, ciel éteint au KO), foyer (lueur, braises) ; rune ᛊ devant la page au triple 10 (et éclair sous le foyer). Monté dans Sheet.jsx (avec blessures et KO du personnage) et GMApp.jsx (sans).
- **`components/ui/VkBody.jsx`** (page joueur) : bords rougis (battement à partir de Critique), vision troublée (fatigue), page décolorée au KO, par calques à `backdrop-filter` (pas de `filter` sur la page : les éléments fixés resteraient en place).
- **Ruban-serpent** : gravure à l'ouverture (ruban tracé, inscription glissée, nom peint), inscription qui coule, œil qui cligne, embrasement au gain de SAGA et au triple 10.
- **`components/ui/VkRaven.jsx`** : corbeau « ocre et entrelacs » (masques `assets/raven-{perch,up,down}-{fill,line}.png`, tirés des images Codex de la planche) dans la dalle État : arrivée 4,5 s après l'ouverture, puis une chance sur trois toutes les 20 s, et après un gain de SAGA ; gestes ; repart au bout de 20 à 35 s ou au clic ; reste au KO. Aussi sur la fiche côté MJ (C-3).
- **Vérifié à l'écran** (vue MJ, réactions déclenchées par les événements du navigateur, sans écriture) : ciel de jour et aurore, gravure, corbeau posé, embrasement, rune ᛊ et éruption. **Non vérifié** : la page joueur (état du corps, aurore de sang, bandeau amarré : pas de code joueur de dev), le foyer, le vol du corbeau en mouvement et les performances sur tablette.

### Retours du MJ après test (2026-11-07)

- **Fenêtres** : `VkModal` repose désormais sur la fenêtre générique (`components/ui/Modal.jsx`), rendue hors de la page par `HostedModal` ; elles ne restent plus prises dans la carte qui les ouvre (elles passaient sous la carte voisine et sous l'en-tête). Ajout de trait et de compétence : **catalogue de la plateforme** (`CatalogModal`) ; trait hors de portée grisé avec sa raison ; compétence spécialisable : spécialisation demandée avant l'ajout.
- **Plateau de jet** : il se range aussi à droite de la barre de session ouverte (il passait dessous).
- **Survols** (pierre peinte) : fond toujours opaque (Inventaire, Évolution et Fin d'arc la nuit, Édition, Copier les accès).
- **Runes** : plus de « points en trop » (une rune s'apprend aussi en jeu) ; bouton **Futhark** dans le coin de la carte, qui ouvre le futhark dans une fenêtre (même usage qu'Inventaire).
- **Équipement** : chaque arme équipée a son dé d'attaque. Compétence par `getWeaponSkill` (rules.js, testée) : mêlée → Combat CàC (armé), distance → Combat distance, jet → l'une ou l'autre ; lien direct si une seule compétence possible ou une seule dont la spécialisation nomme l'arme, sinon choix dans le plateau parmi les compétences possibles ; aucune : jet de la meilleure caractéristique. L'arme et ses dégâts sont rappelés dans le plateau.
- **Bourse et bagages** : argent, contenu du sac et de la réserve sur la fiche ; un clic sur un objet (ici et dans Équipement) ouvre sa modification ; bouton Inventaire dans les deux cartes.
- **Bois et or** : le ruban-serpent vit aussi (gravure, inscription qui coule, œil, embrasement) ; « Couper les animations » est proposé dans les deux habillages. Ciel, corbeau et état du corps restent propres à la pierre peinte (C-8 révisé).
- **Halle** : plus d'ascenseur horizontal ; Note, Objet, Musique, Tableau dans la barre du haut, à gauche de Copier les accès et Éditer.
- **Sac et réserve repliables**, fermés par défaut (Bourse et bagages reste courte).
- **Catalogue d'objets sans onglets** : « Objet libre » en dernière pastille des filtres, puis la recherche (`tabsAs="pill"`, comme Nimble, Maledictum, Dune).
- **Tablettes au lieu de capsules** (pierre peinte) : pastilles, étiquettes, segments à coins à peine arrondis et biseau, comme les épithètes ; choisie = tablette ocre.
- **Fenêtres en dalle** (pierre peinte) : toutes les fenêtres, de la plateforme comprises, prennent la forme taillée des cartes (`watchModalSlabs` de `VkSlabBg.jsx`, lancé par `useVkLookOnRoot` : un fond de dalle est ajouté à chaque `.vtt-modal-panel` qui apparaît ; texture le jour, arête éclairée sous l'aurore).


## 9. Lot 6 à venir : l'assistant de création (note de reprise, 2026-11-07)

À mener dans un nouveau contexte. Méthode habituelle : diagnostic, proposition, accord du MJ, puis code.

**Demande du MJ** : l'assistant garde son ancienne disposition ; il faut le moderniser comme le reste (pierre peinte et bois et or, même langage que la fiche).

**État actuel** (`src/client/src/systems/vikings/Creation.jsx`, 543 lignes) :
- six étapes en onglets (`STEPS` : Caractéristiques, Compétences, Traits, Runes, Identité, Finalisation), rendues par `renderCaracs()` … `renderFinal()`, navigation par `NavButtons` en bas de chaque étape ;
- il reçoit déjà l'habillage (`useVkLookOnRoot`, dalles via `VkPanel`, poutre et fanions par `.vk-tabs`, tablettes) mais pas la nouvelle disposition ;
- ses fenêtres (spécialisation requise) passent déjà par `VkModal`, donc par la fenêtre générique hors de la page.

**Règles et ergonomie validées, à ne pas contredire** : `spec_vikings.md` §4 (14 points de caractéristiques, max 4 ; 10 points de compétences, max 3 ; 2 à 4 traits avec conditions et incompatibilités ; runes si livre de sort ; SAGA de départ 1 + « SAGA +N » des traits ; code d'accès à la fin) et §4.1 (ordre des étapes, descriptions, recherches, usages des caractéristiques au survol, identité à la fin avec prénom et nom du parent obligatoires).

**Pistes à proposer au MJ** (rien n'est décidé) :
- reprendre la disposition validée sur la refonte de la création de cyberpunk (commit `ee86367`, `spec_cyberpunk.md` §9) : rail des étapes avec coches et résumés, étape en cours au centre, **fiche du personnage en direct** à côté ; ici la fiche en direct pourrait être une version réduite de l'en-tête de la fiche (ruban-serpent avec le nom qui se grave à l'étape Identité, épithètes des traits choisis, caractéristiques en pierres levées) ;
- traits et compétences par le catalogue de la plateforme (`CatalogModal`, comme `EditModals.jsx`) ou en liste dans l'étape ;
- seuil seul, réglette et chances : mêmes composants que la fiche (`SkillsSection`) pour montrer l'effet d'un niveau ;
- le vivant (gravure du ruban à la fin, corbeau qui vient se poser à la finalisation) si le MJ le souhaite.

**Outils de vérification** : serveur de dev du MJ (Vite 5173, backend 3001) ; navigateur Edge sans interface piloté par CDP (port 9333) ; préférences dans le stockage du navigateur `vtt:vikings:look` (`{ skin: 'pierre'|'bois', night: 'aurore'|'foyer', odds, anim }`) et `vtt:vikings:theme` (`{ dark }`) ; code MJ de dev `GMCODE` ; pas de code joueur de dev connu (la page joueur n'a jamais été vérifiée à l'écran).

**Restent non vérifiés des lots 1 à 5** : page joueur connectée (bandeau amarré, état du corps, aurore de sang, plateau à droite de la barre de session) ; écritures de la halle (Clore l'arc, +1 Saga, Repos, bâtons) ; un vrai jet et un vrai triple 10 ; le plateau à côté du panneau de combat ; le foyer ; le vol du corbeau en mouvement ; la fluidité sur tablette ; les survols des boutons.
