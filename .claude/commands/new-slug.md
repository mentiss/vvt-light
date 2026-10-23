---
description: Créer un nouveau système de jeu (slug) selon les standards de la plateforme
argument-hint: <slug> [nom du système]
---

Création d'un nouveau slug : **$ARGUMENTS**

Respecte la méthode en trois phases du CLAUDE.md racine. **N'écris aucun fichier avant la fin de la phase 2 et ma validation explicite.**

## Phase 1 — Cadrage (aucun code)

1. Vérifie que le slug n'existe pas déjà dans `src/server/systems/` ni dans `src/client/src/systems/`, et cherche une spec existante `documentations/spec_<slug>.md`. Si elle existe, c'est ta base : ne repose pas les questions auxquelles elle répond déjà.
2. Demande-moi ce que tu ne sais pas encore, en une seule fois :
    - mécanique de dés (pool, seuil, d20, 2D20, PbtA…), succès, critiques, explosions ;
    - contenu de la fiche (caractéristiques, compétences, ressources, équipement, liens…) ;
    - besoins côté MJ (ressources de session, PNJ, combat) ;
    - palette de couleurs et identité visuelle ;
    - les règles de référence (lore, livre de base) si je peux te les fournir : n'invente rien qui les contredise.
3. Lis le slug de référence `fabula` (config, routes, schéma, `Sheet.jsx`, `GMApp.jsx`) pour calquer les patterns. **Ne prends pas `vikings` comme modèle** (en refonte). Lis aussi `documentations/spec_diceengine_v2.md` (dont la section « Jet libre » : rendu des jets dans l'historique et les notifications) et `documentations/spec_combat.md` pour les contrats dés et combat, et `documentations/spec_ui_menu.md` pour les menus joueur et MJ.

## Phase 2 — Spécification (à faire valider)

Présente :
- le schéma SQLite du slug (tables propres seulement, bâti sur `base.sql`) ;
- les routes au-delà de `characters.js` et les éventuels handlers socket ;
- la logique des 5 hooks de dés et du bloc combat ;
- l'arborescence des composants et le découpage de la fiche ;
- le contenu des menus joueur et MJ (éléments prêts à l'emploi, éléments propres au slug, icônes ou aucune) et leur habillage.

Expose les choix ouverts avec leurs avantages et inconvénients, et donne ta recommandation. Une fois validée, la spec est enregistrée (ou mise à jour) dans `documentations/spec_<slug>.md`.

## Phase 3 — Implémentation

Fichiers à créer (aucun fichier hors de ces dossiers ne doit être modifié, la découverte est automatique) :

**Backend**
- `src/server/systems/<slug>/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl? }`
- `src/server/systems/<slug>/routes/characters.js`
- `database-template/<slug>-schema.sql`

**Frontend** (`src/client/src/systems/<slug>/`)
- `config.jsx`, `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`
- `theme.css` : tokens du slug et habillage des classes de la plateforme (`vtt-menu*`, `vtt-history-entry`)
- `components/layout/` pour les sections de fiche, dont `<Slug>HistoryEntry.jsx` (rendu des jets, partagé par l'historique et les notifications) ; `components/modals/` pour les modales
- `gm/tabs/TabSession.jsx`

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
- [ ] Rendu des jets : un composant `<Slug>HistoryEntry` sert à `renderHistoryEntry` et à `renderDiceToast`, rendu identique (pas de mode `compact`) ; il traite le jet libre en premier (`parseFreeRoll` de `tools/freeRoll.js`).
- [ ] `renderAllRollTypes` passé à `DiceHistoryPage` (importé depuis `../../components/layout/DiceHistoryPage.jsx`, props `sessionId`, `renderHistoryEntry`, `renderAllRollTypes`), à `ToastNotifications` et à `HistoryPanel` s'il y en a un.
- [ ] Aucune marge extérieure dans les rendus de jets : la plateforme la porte (`vtt-history-entry`, `ToastShell`).
- [ ] `theme.css` chargé par `PlayerPage` / `GMPage` : pas d'`import './theme.css'` dans les fichiers du slug.
- [ ] Pas d'indirection `GMApp.jsx → gm/GMView.jsx`.
- [ ] UPDATE avec COALESCE ; `saveFullCharacter` en transaction avec `_syncSubTable` pour les sous-tables.
- [ ] Routes spécifiques déclarées avant les génériques ; `GET /characters` public.
- [ ] Fiche mise à jour par HTTP uniquement (`broadcastCharacterUpdate` côté serveur) ; `character-full-update` laissé au générique. Si des ressources de session sont nécessaires, le choix socket (pattern dune, dette connue) ou HTTP est tranché en phase 2.
- [ ] Routes personnage : `authenticate, requireOwnerOrGM` en lecture/écriture, `requireGM` en suppression.
- [ ] Classes CSS générées uniquement, mode sombre via `data-theme`, pas de `<select>` ni de checkbox.
- [ ] Textes d'interface en français, code en anglais ; casse des noms de fichiers cohérente avec les imports.
- [ ] `cd src/client && npm run lint`, `npm test` et `npm run build` passent.