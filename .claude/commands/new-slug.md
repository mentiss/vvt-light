---
description: Créer un nouveau système de jeu (slug) selon les standards de la plateforme
argument-hint: <slug> [nom du système]
---

Création d'un nouveau slug : **$ARGUMENTS**

Respecte la méthode en trois phases du CLAUDE.md racine. **N'écris aucun fichier avant la fin de la phase 2 et ma validation explicite**, sauf la planche graphique de la phase 2.

## Phase 1 — Cadrage (aucun code)

1. Vérifie que le slug n'existe pas déjà dans `src/server/systems/` ni dans `src/client/src/systems/`, et qu'il ne s'appelle pas `platform` (portée réservée du stockage navigateur, refusée par le Loader), et cherche une spec existante `documentations/spec_<slug>.md`. Si elle existe, c'est ta base : ne repose pas les questions auxquelles elle répond déjà.
2. Demande-moi ce que tu ne sais pas encore, en une seule fois :
    - mécanique de dés (pool, seuil, d20, 2D20, PbtA…), succès, critiques, explosions ;
    - contenu de la fiche (caractéristiques, compétences, ressources, équipement, liens…) ;
    - besoins côté MJ (ressources de session, PNJ, combat) ;
    - palette de couleurs et identité visuelle ;
    - les règles de référence (lore, livre de base) si je peux te les fournir : n'invente rien qui les contredise.
3. Lis le slug de référence `fabula` (config, routes, schéma, `Sheet.jsx`, `GMApp.jsx`, `Brand.jsx`) pour calquer les patterns. **Ne prends pas `vikings` comme modèle** (en refonte). **Exception : la sauvegarde de Fabula** (`CharacterController.js` : colonnes en assignation directe sans COALESCE, sous-tables effacées puis réinsérées) est en tort, dette connue : suis la checklist sur ce point, pas Fabula. Lis aussi `documentations/spec_diceengine_v2.md` (dont la section « Jet libre » : rendu des jets dans l'historique et les notifications) et `documentations/spec_combat.md` pour les contrats dés et combat, `documentations/spec_ui_menu.md` pour les menus joueur et MJ, `documentations/spec_ui_actions.md` pour la zone d'actions, `documentations/spec_audio.md` (§11.7, §11.17 à §11.20, §12) pour la musique de la table, et `documentations/spec_plateforme_accueil.md` (§5 marque, §7 slug masqué).
4. Si la spec ou les règles sont volumineuses (nombreuses sections, catalogues à transcrire), propose un **découpage en lots** : un premier lot jouable (le socle), puis des lots livrables séparément. La phase 2 détaille le premier lot et fixe dès maintenant les structures de données des suivants, pour ne pas refaire le schéma.

## Phase 2 — Spécification (à faire valider)

Présente :
- le schéma SQLite du slug (tables propres seulement, bâti sur `base.sql`) ;
- les routes au-delà de `characters.js` et les éventuels handlers socket ;
- la logique des 5 hooks de dés et du bloc combat ;
- l'arborescence des composants et le découpage de la fiche ;
- le contenu des menus joueur et MJ (éléments prêts à l'emploi, éléments propres au slug, icônes ou aucune) et leur habillage ;
- l'emplacement, dans l'onglet Session du MJ, de l'élément d'activation de la musique (`AudioSessionToggle`) et ses classes de bouton ;
- le découpage en lots s'il y en a un (phase 1, étape 4).

**Proposition graphique : planche HTML.** Avant tout code d'habillage, produis une planche `documentations/<slug>/planche_<slug>.html`, autonome, qui montre l'identité proposée en mode jour et en mode nuit : tokens `--color-*` et polices, extrait de fiche (en-tête, blocs, ressources), menu hamburger (`vtt-menu*`), modale (`vtt-modal-*`), boutons (`vtt-btn*`), rendu d'un jet (historique et notification), boutons de la zone d'actions (`vtt-action-btn`, états `is-active` et `is-highlighted`), fenêtre flottante réduite, et la marque (`Brand`, en carte d'accueil et en titre). Signale ✦ ce qui va au-delà des conventions existantes. **Polices** : tu n'es pas limité à Google Fonts. Une police disponible seulement en téléchargement s'intègre par le mécanisme en place (fichiers dans `src/client/public/fonts/`, `@font-face` dans `src/client/public/fonts/fonts.css`, chargé partout par `index.html`, comme `DuneRise`) : propose-la avec son nom et l'adresse où la télécharger, je dépose moi-même les fichiers dans ce dossier ; la planche la charge depuis `../../src/client/public/fonts/fonts.css`. Ajoute l'équivalent du preflight Tailwind (sinon le navigateur dessine ses bordures de boutons). La planche est validée avec la spec ; ses tokens et classes sont ensuite reportés tels quels dans `theme.css` et `Brand.css`.

Expose les choix ouverts avec leurs avantages et inconvénients, et donne ta recommandation. Une fois validée, la spec est enregistrée (ou mise à jour) dans `documentations/spec_<slug>.md`.

## Phase 3 — Implémentation

Fichiers à créer (aucun fichier hors de ces dossiers ne doit être modifié, la découverte est automatique) :

**Backend**
- `src/server/systems/<slug>/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl?, hidden? }` ; `hidden: true` (slug absent de l'accueil, joignable par son adresse) **seulement si je le demande** : par défaut un slug est visible, même en construction
- `src/server/systems/<slug>/routes/characters.js`
- `database-template/<slug>-schema.sql`

**Frontend** (`src/client/src/systems/<slug>/`)
- `config.jsx`, `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`
- `theme.css` : tokens du slug et habillage des classes de la plateforme (`vtt-menu*`, `vtt-history-entry`, `vtt-action-btn`), repris de la planche validée
- `Brand.jsx` et `Brand.css` : marque du slug sur la carte de l'accueil et en titre des pages d'accès (`spec_plateforme_accueil.md` §5)

**Polices téléchargées** (seule exception à la règle des dossiers) : un bloc `@font-face` par fichier dans `src/client/public/fonts/fonts.css` (`font-display: swap`), une fois que j'ai déposé les fichiers ; rappelle dans `Brand.css` ou `theme.css` d'où vient la police (« DuneRise : public/fonts/fonts.css (chargé partout) »). Une police Google se charge par `@import` dans `Brand.css` si elle sert à la marque, sinon dans `theme.css`.
- `components/layout/` pour les sections de fiche, dont `<Slug>HistoryEntry.jsx` (rendu des jets, partagé par l'historique et les notifications) ; `components/modals/` pour les modales
- `gm/tabs/TabSession.jsx`, avec l'élément d'activation de la musique (`components/audio/AudioSessionToggle.jsx`)

## Checklist des standards obligatoires

Vérifie chaque point avant d'annoncer la fin, et coche-les dans ton récapitulatif :

- [ ] Schéma bâti sur `database-template/base.sql`, aucune table partagée redéfinie ; `characters` avec `login_attempts`, `last_attempt_at`, `last_accessed`, colonne `avatar` (pas `avatar_url`).
- [ ] `config.jsx` : bloc `diceConfigDefault` aux couleurs du slug.
- [ ] `config.jsx` : les 5 hooks (`buildNotation`, `beforeRoll`, `afterRoll`, `buildAnimationSequence`, `renderHistoryEntry`) + bloc `combat`.
- [ ] `roll()` exploité comme renvoyant le résultat d'`afterRoll()` ; `buildNotation` appelé dans le composant.
- [ ] Menus de `Sheet.jsx` et `GMApp.jsx` en briques `HamburgerMenu` / `HamburgerMenuSeparator` (`components/ui/HamburgerMenu.jsx`) et éléments `HamburgerMenuItemXXX` (`components/ui/HamburgerMenuItems.jsx`), libellés par défaut ; aucune surcouche ni état de modale de la plateforme dans la fiche. Contenu minimal, celui de Fabula : joueur (création, changer de personnage, jet libre, code d'accès, configuration des dés, interface MJ, déconnexion), MJ (gestion des tables, configuration des dés, déconnexion).
- [ ] Code d'accès : `HamburgerMenuItemAccessCode` dans le menu joueur, `saveFullCharacter` mappe `accessCode → access_code`.
- [ ] Déconnexion par `HamburgerMenuItemLogout` (retour à l'accueil) ; `onLogout` de `PlayerPage` n'est pas utilisé.
- [ ] Habillage du menu : classes `vtt-menu*` surchargées dans le `theme.css` du slug, hors couche. Une classe racine qui porte la police du slug cible aussi `.vtt-modal-host`.
- [ ] Rendu des jets : un composant `<Slug>HistoryEntry`, déclaré **une fois** dans `config.jsx` (`dice.renderHistoryEntry`, et `dice.renderAllRollTypes: true` : il rend aussi le jet libre) ; l'onglet, le panneau et les notifications le lisent, rendu identique (pas de mode `compact`) ; il traite le jet libre en premier (`parseFreeRoll` de `tools/freeRoll.js`).
- [ ] `DiceHistoryPage` (importé depuis `../../components/layout/DiceHistoryPage.jsx`) et `ToastNotifications` avec la seule prop `sessionId`. Panneau d'historique (`components/layout/DiceHistoryPanel.jsx`, prop `sessionId`) au choix du slug, décidé en phase 2, monté à la racine de la fiche ou de l'interface MJ.
- [ ] Aucune marge extérieure dans les rendus de jets : la plateforme la porte (`vtt-history-entry`, `ToastShell`).
- [ ] Musique de la table : `AudioSessionToggle` posé dans l'onglet Session du MJ (`sessionId={activeSession.id}`, `className` aux boutons du slug) ; c'est une bascule : « Activer la musique », puis « Musique ▾ » qui ouvre le menu des scènes (boutons préréglés, `spec_audio.md` §12). Rien d'autre à coder (lecteurs, panneau MJ et réglages du son sont montés par `PlayerPage` / `GMPage`). Habillage : le panneau et les réglages reprennent les classes déjà habillées par le slug (`vtt-modal-*`, `vtt-menu*`, `vtt-btn*`) ; les boutons de la zone d'actions (`vtt-action-btn`, états `is-active` et `is-highlighted`, `vtt-actions-bar` ; `spec_ui_actions.md`) sont habillés dans le `theme.css`, icônes remplaçables par `actionIcons` dans `config.jsx` ; vérifier en dev le rendu, panneau réduit compris (décors d'en-tête et de fond).
- [ ] `theme.css` chargé par `PlayerPage` / `GMPage` : pas d'`import './theme.css'` dans les fichiers du slug.
- [ ] Habillage conforme à la planche validée (`documentations/<slug>/planche_<slug>.html`), jour et nuit.
- [ ] Marque : `Brand.jsx` (contrat `{ variant: 'card' | 'title', slug, label }`) importe `Brand.css` ; `Brand.css` ne contient que des classes préfixées par le slug et les polices de la marque, jamais de `--color-*` globales ; `theme.css` commence par `@import './Brand.css'`.
- [ ] `config.js` serveur sans `hidden`, sauf demande explicite.
- [ ] Polices : chaque police téléchargée a ses fichiers dans `public/fonts/` et son `@font-face` dans `fonts.css` (casse des noms de fichiers identique) ; chaque `font-family` a une police de repli.
- [ ] Pas d'indirection `GMApp.jsx → gm/GMView.jsx`.
- [ ] UPDATE avec COALESCE ; `saveFullCharacter` en transaction avec `_syncSubTable` pour les sous-tables (Fabula ne le fait pas : dette connue, ne pas la calquer).
- [ ] Routes spécifiques déclarées avant les génériques ; `GET /characters` public.
- [ ] Fiche mise à jour par HTTP uniquement (`broadcastCharacterUpdate` côté serveur) ; `character-full-update` laissé au générique. Si des ressources de session sont nécessaires, le choix socket (pattern dune, dette connue) ou HTTP est tranché en phase 2.
- [ ] Routes personnage : `authenticate, requireOwnerOrGM` en lecture/écriture, `requireGM` en suppression.
- [ ] Classes CSS générées uniquement, mode sombre via `data-theme`, pas de `<select>` ni de checkbox.
- [ ] Textes d'interface en français, code en anglais ; casse des noms de fichiers cohérente avec les imports.
- [ ] Règles de calcul du slug (barèmes, coûts, stats dérivées, résolution des jets) en fonctions pures, testées dans `src/client/tests/systems/<slug>/` (miroir de `src/systems/<slug>/`) ; pas de test sur les données de configuration ni sur les composants.
- [ ] `cd src/client && npm run lint`, `npm test` et `npm run build` passent.