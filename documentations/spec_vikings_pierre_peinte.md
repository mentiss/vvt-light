# Vikings : habillage « pierre peinte » et refonte de l'expérience

## Statut

**Planche validée par le MJ le 2026-11-07** après six versions : `documentations/refonte_vikings/planche_pierre_peinte.html`
(hors Git) **est la spécification graphique** et fait foi pour tout ce qu'elle montre. Ce document en garde la trace,
fixe le périmètre et le découpage. Deux conditions du MJ :

1. **L'ancien style reste accessible** : chaque joueur choisit « pierre peinte » (nouveau) ou « bois et or » (actuel).
2. **Tout est habillé**, pas seulement ce que montre la planche : fenêtres de la plateforme, barre de session, notifications, etc.

Le système de combat reste hors périmètre (spec_vikings.md §7) : il garde son fonctionnement, seules ses couleurs suivent l'habillage.

**Avancement (2026-11-07)** : lots 1 à 5 implémentés, retours du MJ traités, commités. Lot 6 (assistant de création, §9) : planche validée, implémenté, en attente du test du MJ.

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
- **Cohabitation sans toucher aux briques de la plateforme** : le plateau pose `--vtt-actions-bottom` (variable prévue par features/table/actions.css) à sa hauteur, puis déclenche un « resize » : ActionZone recalcule `--vtt-actions-offset` et les notifications remontent au-dessus d'elle. La page se rallonge de la hauteur du plateau (`--vk-tray-h` sur `.vk-root`). Panneau de combat présent (fixé en bas à gauche) : le plateau commence à sa droite.
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

- **Fenêtres** : `VkModal` repose désormais sur la fenêtre générique (`ui/modal/Modal.jsx`), rendue hors de la page par `HostedModal` ; elles ne restent plus prises dans la carte qui les ouvre (elles passaient sous la carte voisine et sous l'en-tête). Ajout de trait et de compétence : **catalogue de la plateforme** (`CatalogModal`) ; trait hors de portée grisé avec sa raison ; compétence spécialisable : spécialisation demandée avant l'ajout.
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
- **Fenêtres en dalle** (pierre peinte) : toutes les fenêtres, de la plateforme comprises, prennent la forme taillée des cartes (`watchPlatformSlabs` de `VkSlabBg.jsx`, lancé par `useVkLookOnRoot` : un fond de dalle est ajouté à chaque `.vtt-modal-panel` qui apparaît ; texture le jour, arête éclairée sous l'aurore). Même dalle pour les cartes de l'historique (`.vtt-history-card`, onglet et panneau) et les notifications (`.vtt-toast`, opaques), retour du 2026-11-09.


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

### 9.1 Diagnostic (2026-11-07)

L'assistant porte déjà l'habillage (dalles, fanions, tablettes) mais garde la disposition d'avant la refonte : un grand panneau centré à largeur fixe, des onglets d'étapes non cliquables, un « Suivant » bloqué tant que le budget de l'étape n'est pas dépensé à l'unité, des cartes « stat » génériques au lieu des éléments de la fiche, et rien ne montre le personnage qui se forme avant la Finalisation. Les règles (§4 de spec_vikings.md) et l'ergonomie validée (§4.1 : ordre des étapes, identité à la fin, descriptions, recherches, usages des caractéristiques) ne bougent pas.

Aucun impact base ni socket : la création envoie toujours le même personnage à la même route.

### 9.2 Proposition

**Disposition** (celle validée pour la création de cyberpunk, pleine largeur) :

- **Poutre** en haut, comme la fiche : titre runique animé, « Naissance d'un Viking », bouton jour / nuit.
- **Rail des étapes** à gauche, en fanions verticaux : coche, résumé en une ligne (« 14 / 14 · For 4, Agi 3… », « 3 traits »), retour libre à toute étape déjà ouverte. Runes grisée avec sa raison quand aucun trait ne donne de livre de sort.
- **Étape en cours** au centre.
- **Pierre du personnage** à droite, qui se remplit en direct : c'est l'en-tête de la fiche en réduit (ruban-serpent, épithètes des traits choisis), puis les caractéristiques en pierres levées, SAGA de départ en perles (1 + les « SAGA +N »), actions, seuil, armure, compétences en lecture « seuil seul », runes. Le nom se grave dans le ruban à l'étape Identité (avant : inscription neutre).
- Tablette : la pierre passe sous l'étape, repliable.

**Les étapes** (mêmes règles, mêmes éléments que la fiche) :

| Étape | Proposition |
|---|---|
| Caractéristiques | Six pierres levées de la fiche, avec stepper, description courte dessous ; zone des usages en jeu conservée. Budget en entailles sur un bâton (même langage que les points de compétence). |
| Compétences | Liste d'ajout dans l'étape, recherche conservée ; compétences choisies en lignes « seuil seul » (losange du seuil, explosion de la meilleure carac liée), stepper, retrait. Spécialisation demandée en fenêtre, comme aujourd'hui. |
| Traits | Traits en épithètes gravées (même tablette que sur la fiche), effets et conditions dessous ; trait hors de portée grisé **avec sa raison** (comme le catalogue de la fiche) ; compteur 2 à 4. |
| Runes | Futhark en grille (même rendu que la fenêtre Futhark de la fiche), stepper par rune, budget en entailles. |
| Identité | Champs actuels ; le nom se grave en direct dans le ruban de la pierre. |
| Finalisation | La pierre passe au centre en grand comme récapitulatif ; code d'accès personnalisé ; liste de ce qui manque s'il reste des étapes à finir. Après création : gravure du ruban, rune ᛊ, code d'accès et « Accéder à ma fiche ». |

**Les deux habillages** : même disposition ; le bois et or garde son habillage, sans ciel ni corbeau (C-8).

**Code** : `Creation.jsx` devient l'ossature (état, rail, pierre, envoi) ; les étapes vont dans `components/creation/` (un fichier par étape, l'actuel fait 543 lignes et la pierre en direct l'alourdirait). La pierre réutilise les éléments de la fiche là où leur contrat le permet (`VkSerpent`, pierres levées, épithètes) ; à vérifier pièce par pièce, sans toucher au rendu de la fiche.

**Planche** : `documentations/refonte_vikings/planche_creation.html` (hors Git, v2 du 2026-11-07), à valider avant le code ; recos Q-L6-1 à 6 acceptées par le MJ le 2026-11-07. Retours v1 : descriptions des compétences en entier dans la liste d'ajout ; sens ésotérique de chaque rune affiché d'emblée sous son sens littéral (le joueur choisit sur le sens caché).

**Implémentation (2026-11-07, planche validée par le MJ)** :
- `Creation.jsx` : ossature (état, poutre avec le choix d'habillage, rail, étape, pierre en direct, envoi) ; étapes dans `components/creation/` (`StepCaracs`, `StepSkills` avec la fenêtre de spécialisation, `StepTraits`, `StepRunes`, `StepIdentity`, `StepFinal` et `Birth`), pièces partagées (`CreationParts` : stepper, bâton d'entailles, seuil et chance, navigation), `CreationRail`, `CreationStone` (en-tête de la fiche en lecture sur une tablette pleine), `CreationSummary` (colonne et récapitulatif).
- Règles de l'assistant : `config/creation.js` (budgets, état d'un trait, étapes « à finir » / « à revoir » / sautée, ce qui manque, SAGA et valeurs de départ, recherche), testées dans `tests/systems/vikings/creation.test.js`.
- Le ruban se regrave quand on cesse d'écrire le nom (700 ms) ; naissance : `VK_TRIPLE` (rune ᛊ, ciel, ruban), `VkRaven` avec `once` (une seule visite).
- CSS : disposition commune dans `theme.css` (bloc « Assistant de création »), pierre peinte dans `theme-pierre.css`.
- Vérifié à l'écran sur le serveur de dev (création simulée, rien d'écrit en base) : pierre peinte jour et aurore, bois et or, naissance avec le corbeau, tablette et téléphone.

### 9.3 Questions

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-L6-1 | Navigation : aujourd'hui chaque étape bloque « Suivant » tant que son budget n'est pas dépensé. Libérer comme cyberpunk (rail libre, repère « à finir », création possible une fois tout complet) ? Un trait devenu hors de portée parce qu'on a baissé une carac ensuite serait signalé en rouge sur la pierre et au rail. | Oui : on revient affiner ses caracs après avoir vu les conditions des traits, sans tout refaire | |
| Q-L6-2 | Compétences et traits : liste dans l'étape (comme aujourd'hui) ou catalogue de la plateforme en fenêtre (comme la fiche) ? | Liste dans l'étape : l'étape entière sert à choisir, une fenêtre par-dessus n'apporte rien ; le rendu des lignes reprend celui du catalogue | |
| Q-L6-3 | Ciel vivant derrière l'assistant (pierre peinte, animations actives), au repos seulement ? | Oui, au repos ; la vague de lumière part à la création du personnage | |
| Q-L6-4 | Corbeau qui vient se poser sur la pierre à la naissance du personnage (écran après création) ? | Oui, une seule visite, pierre peinte seulement | |
| Q-L6-5 | La création n'a pas de menu : ajouter le choix d'habillage (pierre peinte / bois et or) dans la poutre, à côté du jour / nuit ? Sinon un nouveau joueur ne peut pas choisir avant sa fiche. | Oui, un bouton dans la poutre | |
| Q-L6-6 | Le titre « Naissance d'un Viking » : garder ? | Garder | |

### 9.4 Après le premier test : écran d'accueil et équipement (2026-11-07, en discussion)

**Constats.**
- **Accueil** : l'assistant ouvre directement sur les caractéristiques, sans rien dire de l'univers ni du parcours. Le texte existe déjà, écrit par le MJ : le Guide du joueur de l'aide de jeu (`config/reference/01-guide.md` : « Le monde en l'an 810 », « Le point de départ », « Le pacte », « Un métier avant tout »). Sa section « Créer son personnage » ne colle pas à l'app (SAGA 1 à 3 avec le MJ là où l'app applique 1 + les traits, D-11 ; équipement et concept en étapes) : à ne pas reprendre telle quelle.
- **Équipement** : absent de l'assistant par décision (§4 de spec_vikings.md : « inventaire libre + catalogue », 6 étapes). Le guide dit « selon votre statut social (thrall affranchi, karl libre ou noble), à définir avec le MJ », mais **aucune règle ne dit ce que donne chaque statut**. Techniquement, rien ne manque : les objets partent déjà avec la création (`items`), l'argent est un objet « Onces d'argent » de la bourse, et le catalogue a des prix en onces (`config/equipment.js`, consultation seulement aujourd'hui). Pas de migration, sauf pour garder le statut social sur la fiche.

**Proposition.**
- **Étape 0 « Avant de commencer »**, en tête du rail : l'univers en quelques paragraphes tirés du guide, le parcours des étapes de l'app, le conseil « Un métier avant tout », un bouton qui ouvre le guide complet dans une fenêtre, puis « Commencer ».
- **Étape « Équipement »** entre Runes et Identité (l'ordre du guide), non bloquante comme les autres. Son contenu dépend des réponses ci-dessous.

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-L6-7 | Un écran d'accueil « Avant de commencer » en étape 0 ? | Oui, avec des extraits du Guide du joueur (une seule source, déjà tenue par le MJ), sans texte nouveau ; le guide entier en fenêtre | |
| Q-L6-8 | Le conseil « Un métier avant tout » : seulement à l'accueil, ou aussi en encadré dans l'étape Compétences, au moment du choix ? | Les deux : c'est à l'étape Compétences qu'il sert | |
| Q-L6-9 | Une étape Équipement dans l'assistant ? | Oui, entre Runes et Identité | Oui |
| Q-L6-10 | Ce qu'elle propose : (a) objets libres du catalogue, comme l'inventaire de la fiche, sans limite ; (b) statut social choisi, qui donne un argent de départ, puis achats au prix du catalogue ; (c) un paquetage fixe par statut. | (b) si le MJ donne l'argent de départ de chaque statut ; sinon (a), et le MJ ajuste à la table | Ni (a) ni (b) : un **kit selon les compétences de métier et les traits / backgrounds**, puis un peu d'argent (vraiment pas trop) et des achats libres. Ça se négocie ensuite avec le MJ. Voir §9.5 |
| Q-L6-11 | Pour (b) ou (c) : argent de départ (ou paquetage) d'un thrall affranchi, d'un karl libre, d'un noble ? Les objets sans prix (« variable ») sont-ils achetables ? | À fixer par le MJ (aucune règle ne le dit) ; objets sans prix : non achetables à la création | Sans objet (pas de statut social) : voir §9.5 |
| Q-L6-12 | Le statut social reste-t-il sur la fiche (nouvelle colonne, migration) ou ne sert-il qu'à la création ? | Seulement à la création : il fixe l'argent, le récit le porte ensuite | Sans objet |
| Q-L6-13 | L'argent non dépensé : il reste dans la bourse ? | Oui, en onces d'argent | Voir §9.5 |


Autres retours du MJ (2026-11-07) : la mention « Le personnage, en direct » au-dessus de la pierre est retirée (faite). L'écart du guide sur la SAGA de départ n'en est pas un : la création se fait avec le MJ, rien à changer.

### 9.5 Étape Équipement : le kit de départ (2026-11-07, en discussion)

**Demande du MJ.** Pas d'équipement libre (« éviter de laisser les gens prendre tout et n'importe quoi ») : un **kit** qui découle du personnage.
1. Les **compétences de métier** donnent les outils du métier (des outils sont à ajouter au catalogue).
2. Les **traits et backgrounds** complètent : Virtuose de l'arc donne un arc, Berserk une peau de bête et de quoi entrer en transe, Noble lignée de l'argent ou une épée…
3. Puis **un peu d'argent**, « vraiment pas trop », et des **achats libres** au prix du catalogue.
4. Ensuite, ça se négocie avec le MJ (il ajuste l'inventaire sur la fiche, comme aujourd'hui).

**Proposition de fonctionnement.**
- L'étape montre trois blocs : « Votre métier vous donne », « Vos traits vous donnent », « Le marché » (argent restant, catalogue avec les prix, achats). Le kit se recalcule si l'on revient changer une compétence ou un trait.
- Quand une source propose un choix (« une épée ou 30 oz »), le joueur choisit dans le bloc.
- Le kit est gratuit. Un objet du kit peut être retiré (sans remboursement). Un même objet donné par deux sources n'arrive qu'une fois.
- Les achats se font avec l'argent de départ, au prix du catalogue ; un objet sans prix n'est pas achetable. L'argent non dépensé reste dans la bourse (objet « Once d'argent », déjà en place sur la fiche).
- Rangement : armes et armures du kit équipées, le reste dans le sac.
- Données dans la config du slug (`config/kits.js`) : compétence → objets, trait → objets ou choix, argent de départ et ses modificateurs. Outils nouveaux ajoutés au catalogue (`config/equipment.js`). Aucune migration : les objets partent déjà avec la création.

**Kits, corrigés par le MJ le 2026-11-07** (✦ = objet à ajouter au catalogue, sans prix : à la création il ne vient que du kit, son prix se fixe à la table ; « MJ » = ligne décidée par le MJ ; les autres restent des propositions à corriger). Un objet de catalogue garde ses valeurs (dégâts, armure, prix).

| Compétence | Kit | Correction MJ |
|---|---|---|
| Combat CàC (armé), Combat CàC (non armé), Combat distance | Rien : une compétence de combat ne donne pas d'arme | MJ |
| Bûcheron | Hache de bûcheron ✦ : un outil, arme de fortune (1 main, 1 token au lieu de 2, For 2) | MJ (outil ≠ hache de combat ; arme de fortune, Q-L6-20) |
| Charpentier, Charpentier marine | Outils de charpentier ✦ (herminette, tarière, ciseaux) | |
| Sculpteur | Outils de sculpteur ✦ (couteaux et gouges) | |
| Ferronnerie | Outils de forgeron ✦ (marteau, pinces) | |
| Orfèvre | Outils d'orfèvre ✦ (petits marteaux, moules) | |
| Potier | Outils de potier ✦ | |
| Couture | Nécessaire de couture ✦ (aiguilles en os, fil, forces) | |
| Mineur | Pic ✦ | |
| Fermier | Faucille ✦ | |
| Pêche | Filet et lignes ✦ | |
| Traque/Chasse | Couteau, collets ✦ | |
| Herboriste | Herbes médicinales ✦ (simples séchés, en cataplasme ou infusion) | |
| Docteur | Herbes médicinales ✦, Bandes de lin ✦ | MJ (pas de « trousse de soins » à l'époque : herbes, tissu) |
| Cuisine | Chaudron ✦ | |
| Brasseur | Matériel de brasseur ✦, Corne à boire | |
| Dressage | Longe et licol ✦ | |
| Survie | Briquet et pierre à feu ✦, Provisions (semaine) | |
| Escalade, Navigation | Corde (10m) | |
| Raquette | Raquettes ✦ | |
| Marchandage | Marchandises de troc ✦ (fourrures, perles, laine) | Balance écartée : anachronique en 810, voir plus bas |
| Langue écrite | Outils de graveur ✦ (pour les runes gravées) | |
| Divination | Runes de divination ✦ (osselets ou bâtonnets) | |
| Jeu | Plateau de hnefatafl ✦ | |
| Langue orale, Loi, Folklore, Connaissance Outgard, Ombre, Amis des animaux, Pillage, Danse, Intimidation, Chant, Larcin | Rien | |

| Trait / background | Kit | Correction MJ |
|---|---|---|
| Virtuose de l'arc | Arc (et flèches ✦) | MJ |
| Berserk | Peau de bête, Champignons de transe ✦ (et le nécessaire pour préparer la mixture) | MJ |
| Noble lignée | Au choix : Épée, ou 20 oz d'argent (30, c'était trop) | MJ |
| Foudre de guerre | Hache (la hache de combat à une main du catalogue) | MJ |
| Aveugle | Bâton | MJ |
| Campeur | Nécessaire de camping ✦ (couverture, peau de tente, briquet) | MJ |
| Sous le regard d'Odin, de Thor, de Tyr, de Freyr, de Freyja, de Loki | Pendentif à l'effigie du dieu ✦ (Odin, marteau de Thor…) | MJ |
| Bâtard reconnu | Bracelet d'argent ✦, offert par le père (anneau de bras, cadeau de rang) | MJ (« quelque chose ») ; objet proposé |
| Dernier de la lignée | Arme de famille ✦ (une arme du catalogue, nommée par le joueur) | MJ (« quelque chose ») ; objet proposé |
| Skald | Rien : un conteur, pas un barde | MJ |
| Huskarl | Au choix : Bouclier en bois ou Casque ; et au choix une arme : Lance, Hache (de combat) ou Javelot (dons du seigneur) | MJ |
| Duelliste | Bouclier en bois | |
| Briseur de boucliers | Hache (de combat) | |
| Volva | Bâton de völva ✦ | |
| Godi | Anneau du temple ✦ (l'anneau sur lequel on prête serment) | |
| Connaissance des runes | Outils de graveur ✦ | |
| Leader né | Corne d'appel ✦ | |
| Grand guérisseur | Herbes médicinales ✦, Bandes de lin ✦, Runes de guérison ✦ (gravées sur écorce, les *limrúnar* du Sigrdrífumál) | MJ (herbes, tissu, runes) |
| Fin négociant | Marchandises de troc ✦, argent de départ doublé | |
| Rameur fou | Rame | |
| Marin | Corde (10m) | |
| Maître des bêtes | L'animal fidèle (objet libre nommé par le joueur : chien, faucon…) | |
| Tueur de monstre | Trophée de la créature ✦ (objet libre nommé) | |
| Veuf/Veuve | Un objet du défunt ✦ (objet libre nommé) | |
| Divorcé | La dot rendue : +10 oz d'argent | |
| Lien avec les Landvættir | Offrandes ✦ (pain, bière, petits objets à déposer) | |
| Orphelin aguerri | Couteau | |
| Vaurien | Dés pipés ✦ | |
| Borgne | Cache-œil ✦ | |
| Ancien esclave, Dette de sang | Pas d'argent de départ | |
| Banni | Rien | |
| Les autres traits (Bons réflexes, Peau dure, Vue perçante, Tatouage, Taille imposante, Impistable, Grande concentration, Infatigable, Force de géant, Sanglant, Ambidextre, Langue de serpent, Sommeil léger, Boxeur, Sens de l'orientation, Troublé, Insaisissable, Sang de troll, Sang de glace, Marqué par les Nornes, Né sous mauvais augure, Rêveur prophétique, Survivant miraculeux, Porte-poisse, Jumeau/Jumelle, Enfant des nuits blanches, Enfant de l'hiver noir, Serment rompu) | Rien | |

**Vérifications historiques (2026-11-07).**
- *Balance* : les balances pliantes et leurs poids standardisés se répandent en Scandinavie dans la seconde moitié du 9ᵉ siècle ; à Kaupang (fondée vers 800), la première phase paie en marchandises (troc). En 810, la balance est anachronique : remplacée par des marchandises de troc.
- *Soins* : pas de trousse ; des simples (l'achillée contre les saignements), du linge propre pour panser, et pour le guérisseur les runes : le Sigrdrífumál (poème de l'Edda, manuscrit du 13ᵉ siècle) veut que le *læknir* connaisse les « runes des branches », gravées sur l'écorce. Source littéraire, plus tardive que 810.
- *Hache* : la « Hache » du catalogue (1 main, 2 tokens, For 2, 20 oz) figure dans la table des **armes** du vault : c'est la hache de combat. La hache de bûcheron est un **outil**, à ajouter à part (✦).

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-L6-14 | Une compétence de métier donne son kit dès le niveau 1 ? | Oui : simple, et le conseil « un métier avant tout » s'en trouve récompensé | Oui |
| Q-L6-15 | Les épées (36 oz et plus) dans le kit d'une compétence de combat ? | Non, réservées aux traits (Noble lignée, Dernier de la lignée) et aux achats : une épée dit le rang | Non : l'épée est très rare et très chère, et une compétence de combat ne donne aucune arme |
| Q-L6-16 | Argent de départ ? | 10 oz : un couteau, ou une semaine de provisions et quelques babioles (Couteau 10, Provisions 2, Corde 6) ; modifié par les traits du tableau | Oui, quelque chose comme ça (10 oz) |
| Q-L6-17 | Les objets ajoutés (✦) ont-ils un prix (achetables au marché) ? | Prix fixés par le MJ ; sans prix, ils ne viennent que du kit | À la création, ils ne viennent que du kit. Ils sont au catalogue, le prix se fixe à la table |
| Q-L6-19 | La « Hache » du catalogue devient-elle « Hache de combat » (nom affiché ; les inventaires existants gardent leur nom) ? | Oui : on voit la différence avec la hache de bûcheron | Non : la « Hache » du catalogue reste la hache de combat ; c'est la nouvelle qui s'appelle « Hache de bûcheron » |
| Q-L6-20 | Hache de bûcheron utilisée pour frapper : arme improvisée (valeurs moindres) ou simple objet ? | Simple objet ; le MJ arbitre à la table s'il s'en sert | Arme de fortune : un peu moins puissante qu'une vraie arme, mais elle peut servir d'arme si besoin |
| Q-L6-18 | Écran d'accueil (Q-L6-7) et conseil « Un métier avant tout » dans l'étape Compétences (Q-L6-8) : on garde les recos ? | Oui | Oui |

**Planche v3 (2026-11-07)** : `refonte_vikings/planche_creation.html`, validée par le MJ.

**Réglages du MJ (2026-11-08)** : il a ajusté les kits et les montants directement dans `config/kits.js`, qui fait foi sur les tableaux ci-dessus (argent de départ 8 oz, Noble lignée : épée ou 12 oz, Divorcé : 5 oz).

**Implémentation (2026-11-07)** :
- Étapes 0 « Avant de commencer » (`StepIntro`, paragraphes du guide lus par `guideParagraphs` de `config/reference.js` ; aide de jeu complète en fenêtre) et 5 « Équipement » (`StepGear`) ; encadré « Un métier avant tout » dans les Compétences (`TradeAdvice`).
- Kits : `config/kits.js` (tables ci-dessus) ; règles dans `config/creation.js` (`getCreationKit`, `getCreationInventory`, `CREATION_MARKET`), testées. Choix du joueur gardés à part (`gear` : retirés, choix, noms, achats).
- Catalogue : outils et objets des kits ajoutés sans prix à `config/equipment.js` ; « Hache de bûcheron » arme de fortune (1 main, 1 token, For 2), rangée au sac.
- À la création : armes et armures du kit équipées, le reste au sac, achats regroupés par quantité, argent restant en « Once d'argent » ; l'armure de départ compte les objets équipés. Aucune migration.
- Vérifié à l'écran (pierre peinte, jour) : accueil, aide de jeu, Compétences, Équipement avec achat, récapitulatif. Non vérifié : largeur téléphone de l'étape Équipement (serveur de dev arrêté).