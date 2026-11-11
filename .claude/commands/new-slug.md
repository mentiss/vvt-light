---
description: Créer un nouveau système de jeu (slug) selon les standards de la plateforme
argument-hint: <slug> [nom du système]
---

Création d'un nouveau slug : **$ARGUMENTS**

Respecte la méthode en trois phases du CLAUDE.md racine. **N'écris aucun fichier avant la fin de la phase 2 et ma validation explicite**, sauf la planche graphique de la phase 2.

## Phase 1 — Cadrage (aucun code)

1. Vérifie que le slug n'existe pas déjà dans `src/server/systems/` ni dans `src/client/src/systems/`, et qu'il ne s'appelle pas `platform` (portée réservée du stockage navigateur, refusée par le Loader), et cherche une spec existante `documentations/spec_<slug>.md`. Si elle existe, c'est ta base : ne repose pas les questions auxquelles elle répond déjà.
2. Demande-moi ce que tu ne sais pas encore. Au-delà de trois ou quatre questions, écris-les dans la spec, en tableaux `| # | Question | Proposition (reco) | Réponse MJ |` : j'y réponds dans l'IDE. Questions de base :
    - mécanique de dés (pool, seuil, d20, 2D20, PbtA…), succès, critiques, explosions ;
    - contenu de la fiche (caractéristiques, compétences, ressources, équipement, liens…) ;
    - besoins côté MJ (ressources de session, PNJ, rounds et tours) ; PNJ : onglet de la plateforme (`features/npc/TabNpcs.jsx`), le slug ne fournit que son bloc `npc` dans `config.jsx` (`documentations/spec_pnj.md` §6.4, référence Dune) ; les tables `npcs` et `session_npcs` viennent de `base.sql`, à recopier dans le schéma ;
    - palette de couleurs et identité visuelle ;
    - les règles de référence (lore, livre de base) si je peux te les fournir : n'invente rien qui les contredise ; les tables qu'on ne trouve que dans un PDF se transcrivent (agent) puis se relisent avec moi.

   Pour chaque fonction, pose-toi la question « **table ou app ?** » : ça se règle autour de la table, ou c'est assez pénible pour que l'app s'en charge ? L'app est au service du jeu ; n'automatise que ce qui le mérite, et l'UX d'abord.
3. Lis le slug de référence `fabula` (config, routes, schéma, `Sheet.jsx`, `GMApp.jsx`, `Brand.jsx`) pour calquer les patterns. La sauvegarde de Fabula (`CharacterController.js` : `FLAT_COLUMNS` en COALESCE, sous-tables par `syncSubTable` de `utils/characters.js`) suit la checklist depuis sa normalisation. La route `/characters` est commune à tous les slugs (`documentations/spec_characters_route.md`) : le slug n'écrit que son contrôleur. Lis aussi `documentations/spec_diceengine_v2.md` (dont la section « Jet libre » : rendu des jets dans l'historique et les notifications) pour le contrat des dés, `documentations/spec_ui_menu.md` pour les menus joueur et MJ, `documentations/spec_ui_actions.md` pour la zone d'actions, `documentations/spec_audio.md` (§11.7, §11.17 à §11.20, §12) pour la musique de la table, `documentations/spec_tableau.md` (§10.8) pour le tableau partagé, et `documentations/spec_plateforme_accueil.md` (§5 marque, §7 slug masqué).
   **Briques de la plateforme à réutiliser avant d'écrire un composant** (lis leur spec) : `Modal` et `ConfirmModal` (`spec_ui_modales.md`), `CatalogModal` (`spec_ui_catalogue.md` : tout ajout depuis un catalogue, inventaire compris ; textes et ordre de l'en-tête réglables par le slug, D-19), `AvatarUploader`, `HamburgerMenu*`, `ActionZone`, `FloatingPanel` / `HostedModal` (`spec_ui_panneaux.md`), `SessionPlayersBar` (`spec_session_bar.md`), `DiceHistoryPanel`, `ReferenceGuide` (`spec_ui_reference.md` : aide de jeu en Markdown, visibilité MJ / joueur), `usePersistedState` (`spec_browser_storage.md`), `useHashTab` (onglet gardé dans l'URL).
4. Si la spec ou les règles sont volumineuses (nombreuses sections, catalogues à transcrire), propose un **découpage en lots**, dans cet ordre : **création → fiche → interface MJ → extra → bonus** (on commence toujours par l'assistant : on crée de vrais personnages pour tester la fiche). La phase 2 détaille le premier lot et fixe dès maintenant les structures de données des suivants, pour ne pas refaire le schéma. Chaque lot repasse par cadrage, spécification et validation.
5. Demande-moi tôt le code d'accès d'un personnage de dev, pour vérifier la fiche à l'écran ; le code MJ de dev est `GMCODE`. Ne lance jamais ton propre serveur sur le port 3001 sans me prévenir, et dis-moi quand relancer `npm run dev` (fichier serveur nouveau, migration).

## Phase 2 — Spécification (à faire valider)

Présente :
- le schéma SQLite du slug (tables propres seulement, bâti sur `base.sql`) ;
- les routes au-delà de `characters.js` et les éventuels handlers socket ;
- la logique des 5 hooks de dés ;
- l'arborescence des composants et le découpage de la fiche (voir « Organisation du code » plus bas) : fiche sur **un seul onglet** inspirée de la fiche papier, découpée en **sections** que la fiche joueur et la fiche MJ assemblent chacune à leur façon ; onglets et ordre (ex. Fiche · Journal · Historique · Aide de jeu) ;
- le contenu des menus joueur et MJ (éléments prêts à l'emploi, éléments propres au slug, icônes ou aucune) et leur habillage ;
- l'emplacement, dans l'onglet Session du MJ, de l'élément d'activation de la musique (`AudioSessionToggle`) et ses classes de bouton ;
- l'emplacement de l'élément d'activation du tableau partagé (`BoardSessionToggle`), et si le slug pose le tableau dans un onglet (`<Board>`, côté MJ et / ou joueur) ;
- le découpage en lots s'il y en a un (phase 1, étape 4).

**Proposition graphique : planche HTML.** Avant tout code d'habillage, produis une planche `documentations/<slug>/planche_<slug>.html`, autonome, qui montre l'identité proposée en mode jour et en mode nuit : tokens `--color-*` et polices, extrait de fiche (en-tête, blocs, ressources), menu hamburger (`vtt-menu*`), modale (`vtt-modal-*`), boutons (`vtt-btn*`), rendu d'un jet (historique et notification), boutons de la zone d'actions (`vtt-action-btn`, états `is-active` et `is-highlighted`), fenêtre flottante réduite, barre de session des joueurs (`vtt-session-bar*`, carte au survol comprise), modale de catalogue, aide de jeu (`vtt-reference-*`), et la marque (`Brand`, en carte d'accueil et en titre). Les ornements de la modale (coins, décors) passent par le décor de la plateforme (`vtt-modal-deco` et les pseudo-éléments du panneau, `overflow: visible`, modèle Vikings) : la planche les montre tels qu'ils seront codés. Un nouvel écran important (interface MJ, fiche de groupe…) a sa propre planche avant le code. Signale ✦ ce qui va au-delà des conventions existantes. **Polices** : tu n'es pas limité à Google Fonts. Une police disponible seulement en téléchargement s'intègre par le mécanisme en place (fichiers dans `src/client/public/fonts/`, `@font-face` dans `src/client/public/fonts/fonts.css`, chargé partout par `index.html`, comme `DuneRise`) : propose-la avec son nom et l'adresse où la télécharger, je dépose moi-même les fichiers dans ce dossier ; la planche la charge depuis `../../src/client/public/fonts/fonts.css`. Ajoute l'équivalent du preflight Tailwind (sinon le navigateur dessine ses bordures de boutons). La planche est validée avec la spec ; ses tokens et classes sont ensuite reportés tels quels dans `theme.css` et `Brand.css`.

Expose les choix ouverts avec leurs avantages et inconvénients, et donne ta recommandation. Une fois validée, la spec est enregistrée (ou mise à jour) dans `documentations/spec_<slug>.md`.

## Phase 3 — Implémentation

Fichiers à créer (aucun fichier hors de ces dossiers ne doit être modifié, la découverte est automatique) :

**Backend**
- `src/server/systems/<slug>/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl?, hidden? }` ; `hidden: true` (slug absent de l'accueil, joignable par son adresse) **seulement si je le demande** : par défaut un slug est visible, même en construction
  et, pour la route `/characters` commune, `characters: { listColumns, requiredOnCreate }` (colonnes en plus dans la liste, champs requis à la création ; défaut : `playerName` seul)
- `src/server/systems/<slug>/CharacterController.js` — `loadFullCharacter(db, id)` (fiche ou `null`) et `saveFullCharacter(db, id, data)` (renvoie la fiche rechargée)
- `src/server/systems/<slug>/routes/characters.js` — **seulement** s'il faut des routes personnage propres au slug (XP, envoi d'objet…) ; jamais de copie des routes communes
- `database-template/<slug>-schema.sql` — un `DEFAULT` sur chaque colonne `NOT NULL` de `characters` (la création commune n'insère que le code, l'URL et les champs requis)

**Frontend** (`src/client/src/systems/<slug>/`)
- `config.jsx`, `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`
- `theme.css` : tokens du slug et habillage des classes de la plateforme (`vtt-menu*`, `vtt-history-card`, `vtt-history-entry`, `vtt-toast`, `vtt-action-btn`), repris de la planche validée
- `Brand.jsx` et `Brand.css` : marque du slug sur la carte de l'accueil et en titre des pages d'accès (`spec_plateforme_accueil.md` §5)

**Polices téléchargées** (seule exception à la règle des dossiers) : un bloc `@font-face` par fichier dans `src/client/public/fonts/fonts.css` (`font-display: swap`), une fois que j'ai déposé les fichiers ; rappelle dans `Brand.css` ou `theme.css` d'où vient la police (« DuneRise : public/fonts/fonts.css (chargé partout) »). Une police Google se charge par `@import` dans `Brand.css` si elle sert à la marque, sinon dans `theme.css`.

### Organisation du code (frontend du slug)

```
systems/<slug>/
  config.jsx · Sheet.jsx · GMApp.jsx · Creation.jsx · Brand.jsx · Brand.css · theme.css
  config/            catalogues (données) ; gros catalogues générés par script depuis les annexes (scripts/<slug>/)
  config/rules/      règles pures (barèmes, coûts, dérivés d'un personnage, résolution des jets), testées en miroir
  config/reference/  aide de jeu en Markdown (un fichier par section), si le slug en a une
  hooks/             lancement d'un jet (un seul hook pour la fiche, les fenêtres et l'assistant), données de table…
  components/ui/     petites briques d'interface du slug, bande fixe (header + sous-header)
  components/layout/ sections de fiche partagées joueur / MJ, assemblages (fiche joueur, fiche MJ), <Slug>HistoryEntry
  components/modals/ toutes les fenêtres, joueur et MJ
  components/creation/ onglets de l'assistant
  gm/tabs/           onglets MJ seulement (TabSession avec AudioSessionToggle et BoardSessionToggle)
```

- **Aucune copie** entre la fiche joueur et la fiche MJ : des sections communes (avec une option de présentation compacte si besoin), chaque fiche garde ses blocs propres. Les dérivés d'un personnage (clan, plafonds, statut…) sont calculés une seule fois dans `config/rules/`, jamais recalculés dans les composants.
- **Pas de logique dans les composants** : fonctions pures et textes dans `config/` ; le composant affiche et appelle.
- **Imports de la plateforme par l'alias `@/`** (`@/ui/modal/Modal.jsx`, `@/features/dice/tools/diceEngine.js`, `@/app/hooks/useFetch.js`) ; les imports internes au slug restent relatifs. Rangement de la plateforme : `src/client/CLAUDE.md`, « Arborescence ».
- Une route serveur en plus de `characters.js` : route mince qui vérifie les droits et délègue à un contrôleur du slug (`<Nom>Controller.js`, erreurs de règle en 4xx) ; la diffusion `character-full-update` est exportée par `CharacterController.js`, pas recopiée.

### Standards d'interface (validés sur Vampire)

- **Bande fixe** : header (titre du jeu seul, jamais le nom du personnage) et sous-header (onglets, actions de page en icônes : jet, édition, XP), boutons de même hauteur, onglet actif lisible jour et nuit. Son `z-index` reste **sous les fenêtres flottantes** (`calc(var(--vtt-z-floating) - 1)`). Sa hauteur est mesurée (ResizeObserver) et donnée à `SessionPlayersBar` (`headerHeight`, avec `sessionName`) et au sommaire de l'aide de jeu (`--vtt-reference-top`) ; le corps de la page fait au moins la hauteur visible, pour que la barre de session descende jusqu'en bas.
- **Onglets** gardés dans le hash de l'URL (`useHashTab`) : un rafraîchissement ne ramène pas au premier onglet.
- **Mode Édition = corrections hors règles** ; les actions de jeu (jauges, soins, catalogue et inventaire, équiper, XP, états) se font hors édition et s'enregistrent tout de suite.
- **Traits lançables** : clic sur la ligne entière (nom et points), même survol partout ; points au-delà de 5 si le système le permet. **Fenêtre de jet** : réserve et difficulté en tête, choix groupés (groupes, mini-onglets), jamais un mur de pills.
- **Inventaire** : une seule liste, armes en tête, ajout par `CatalogModal` hors édition.
- Aucune information en double, colonnes équilibrées, pleine largeur ; pas de texte d'aide inutile ; pas de mention « règle maison » dans l'interface.
- Ce qui ne change aucun calcul se joue **à la table**, pas sur la fiche.
- **Effets visuels** (états, soif…) : jamais au détriment de la lecture ; sous la bande fixe, coupés en édition, limités à l'onglet concerné.
- **Empilement** : pas de `z-index` sur les enfants de la feuille ; une modale n'est jamais rendue comme enfant direct d'un conteneur dont le thème positionne les enfants (`> * { position: relative }` casse son fond fixe) : la rendre à côté.
- **Assistant de création** : onglet Guide d'abord ; colonne d'aide contextuelle avec la description de **chaque** élément choisissable (textes dans un seul fichier) ; interrupteurs avec une vraie phrase d'effet ; compteurs à côté de ce qu'ils comptent ; Précédent / Suivant ; ligne « À faire » ; options rares repliées, options réservées filtrées, points rendus quand un prérequis change ; pas de `<select>` ni `<datalist>` : des pills, avec une pill « Autre… » pour la saisie libre.

## Checklist des standards obligatoires

Vérifie chaque point avant d'annoncer la fin, et coche-les dans ton récapitulatif :

- [ ] Schéma bâti sur `database-template/base.sql`, aucune table partagée redéfinie ; `characters` avec `login_attempts`, `last_attempt_at`, `last_accessed`, colonne `avatar` (pas `avatar_url`).
- [ ] `config.jsx` : bloc `diceConfigDefault` aux couleurs du slug.
- [ ] `config.jsx` : les 5 hooks (`buildNotation`, `beforeRoll`, `afterRoll`, `buildAnimationSequence`, `renderHistoryEntry`).
- [ ] `roll()` exploité comme renvoyant le résultat d'`afterRoll()` ; `buildNotation` appelé dans le composant.
- [ ] Menus de `Sheet.jsx` et `GMApp.jsx` en briques `HamburgerMenu` / `HamburgerMenuSeparator` (`ui/menu/HamburgerMenu.jsx`) et éléments `HamburgerMenuItemXXX` (`features/table/HamburgerMenuItems.jsx`), libellés par défaut ; aucune surcouche ni état de modale de la plateforme dans la fiche. Contenu minimal, celui de Fabula : joueur (création, changer de personnage, jet libre, code d'accès, configuration des dés, interface MJ, déconnexion), MJ (gestion des tables, configuration des dés, déconnexion).
- [ ] Code d'accès : `HamburgerMenuItemAccessCode` dans le menu joueur, `saveFullCharacter` mappe `accessCode → access_code`. Copie des accès (message Discord : jeu, nom, lien, code) par `CopyAccessButton` (`features/table/CopyAccessButton.jsx`) dans le `TabSession` (PJ sélectionné), et en `codeOnly` (code seul) sur l'écran de fin de création ; jamais de copie maison.
- [ ] Déconnexion par `HamburgerMenuItemLogout` (retour à l'accueil) ; `onLogout` de `PlayerPage` n'est pas utilisé.
- [ ] Habillage du menu : classes `vtt-menu*` surchargées dans le `theme.css` du slug, hors couche. Une classe racine qui porte la police du slug cible aussi `.vtt-modal-host`.
- [ ] Rendu des jets : un composant `<Slug>HistoryEntry`, déclaré **une fois** dans `config.jsx` (`dice.renderHistoryEntry`, et `dice.renderAllRollTypes: true` : il rend aussi le jet libre) ; l'onglet, le panneau et les notifications le lisent, rendu identique (pas de mode `compact`) ; il traite le jet libre en premier (`parseFreeRoll` de `features/dice/tools/freeRoll.js`).
- [ ] `DiceHistoryPage` (importé depuis `@/features/dice/history/DiceHistoryPage.jsx`) et `ToastNotifications` avec la seule prop `sessionId`. Panneau d'historique (`features/dice/history/DiceHistoryPanel.jsx`, prop `sessionId`) au choix du slug, décidé en phase 2, monté à la racine de la fiche ou de l'interface MJ.
- [ ] Aucune marge extérieure dans les rendus de jets : la plateforme la porte (`vtt-history-entry`, `ToastShell`).
- [ ] Musique de la table : `AudioSessionToggle` posé dans l'onglet Session du MJ (`sessionId={activeSession.id}`, `className` aux boutons du slug) ; c'est une bascule : « Activer la musique », puis « Musique ▾ » qui ouvre le menu des scènes (boutons préréglés, `spec_audio.md` §12). Rien d'autre à coder (lecteurs, panneau MJ et réglages du son sont montés par `PlayerPage` / `GMPage`). Habillage : le panneau et les réglages reprennent les classes déjà habillées par le slug (`vtt-modal-*`, `vtt-menu*`, `vtt-btn*`) ; les boutons de la zone d'actions (`vtt-action-btn`, états `is-active` et `is-highlighted`, `vtt-actions-bar` ; `spec_ui_actions.md`) sont habillés dans le `theme.css`, icônes remplaçables par `actionIcons` dans `config.jsx` ; vérifier en dev le rendu, panneau réduit compris (décors d'en-tête et de fond).
- [ ] Tableau partagé (`spec_tableau.md` §10.8) : `BoardSessionToggle` posé dans l'onglet Session du MJ (`sessionId={activeSession.id}`, `className` aux boutons du slug). Le bouton de la zone d'actions, le bandeau « Le MJ partage un visuel » et la fenêtre flottante sont montés par `PlayerPage` / `GMPage` (`BoardLayer`) ; onglet facultatif avec `<Board sessionId role />` (MJ : onglet « Tableau » de `GMApp`, comme Vikings) dans un conteneur `vtt-board-page`. Habillage : bloc « Tableau partagé » du `theme.css` (classes `vtt-board*`, modèle : Vikings), jour et nuit, bandeau compris.
- [ ] `theme.css` chargé par `PlayerPage` / `GMPage` : pas d'`import './theme.css'` dans les fichiers du slug.
- [ ] Habillage conforme à la planche validée (`documentations/<slug>/planche_<slug>.html`), jour et nuit.
- [ ] Marque : `Brand.jsx` (contrat `{ variant: 'card' | 'title', slug, label }`) importe `Brand.css` ; `Brand.css` ne contient que des classes préfixées par le slug et les polices de la marque, jamais de `--color-*` globales ; `theme.css` commence par `@import './Brand.css'`.
- [ ] `config.js` serveur sans `hidden`, sauf demande explicite.
- [ ] Polices : chaque police téléchargée a ses fichiers dans `public/fonts/` et son `@font-face` dans `fonts.css` (casse des noms de fichiers identique) ; chaque `font-family` a une police de repli.
- [ ] Pas d'indirection `GMApp.jsx → gm/GMView.jsx`.
- [ ] UPDATE avec COALESCE ; `saveFullCharacter` en transaction avec `syncSubTable` / `updateOrInsert` (`utils/characters.js`) pour les sous-tables, et renvoie la fiche rechargée. Aucun helper recopié dans le slug.
- [ ] Pas de `routes/characters.js` sans route propre au slug ; s'il existe, routes spécifiques déclarées avant les génériques.
- [ ] Fiche mise à jour par HTTP uniquement (`broadcastCharacterUpdate` de `utils/characters.js` côté serveur) ; `character-full-update` laissé au générique. Si des ressources de session sont nécessaires, le choix socket (pattern dune, dette connue) ou HTTP est tranché en phase 2.
- [ ] Routes personnage : `authenticate, requireOwnerOrGM` en lecture/écriture, `requireGM` en suppression.
- [ ] Classes CSS générées uniquement, mode sombre via `data-theme`, pas de `<select>` ni de checkbox.
- [ ] Textes d'interface en français, code en anglais ; casse des noms de fichiers cohérente avec les imports.
- [ ] Règles de calcul du slug (barèmes, coûts, stats dérivées, résolution des jets) en fonctions pures, testées dans `src/client/tests/systems/<slug>/` (miroir de `src/systems/<slug>/`) ; pas de test sur les données de configuration ni sur les composants.
- [ ] `tests/server/systems/<slug>/fixture.js` : corps minimal de création et champ modifié par l'envoi partiel (`documentations/spec_tests_serveur.md`) ; le contrat `/characters` passe (`npm test` à la racine).
- [ ] Organisation du code conforme (`config/rules/`, `hooks/`, `components/ui|layout|modals|creation`, `gm/` réduit à `tabs/`) ; aucune section recopiée entre fiche joueur et fiche MJ ; un seul hook de lancement de jet ; une seule bande fixe.
- [ ] Onglets dans le hash (`useHashTab`) ; `SessionPlayersBar` avec `sessionName` et `headerHeight` mesuré ; bande fixe sous les fenêtres flottantes ; modales jamais enfants directs d'un conteneur aux enfants positionnés.
- [ ] Une route en plus de `characters.js` a ses tests (`startSlugApp(slug, '<route>')` de `tests/server/helpers/slugApp.js`).
- [ ] Schéma modifié en cours de chantier : migration `-- systems: <slug>` pour les bases de dev, même avant la première mise en prod.
- [ ] Imports inutilisés vérifiés aussi pour les noms en majuscules (composants, constantes) : la config ESLint les tolère.
- [ ] Vérifié à l'écran, jour et nuit, côté joueur (code de dev) et côté MJ (`GMCODE`).
- [ ] `cd src/client && npm run lint`, `npm test` et `npm run build` passent.