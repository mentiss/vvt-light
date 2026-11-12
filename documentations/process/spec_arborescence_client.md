# Arborescence du client (`src/client/src/`)

Réorganisation de tout ce qui n'est pas un slug : `components/`, `hooks/`, `tools/`, `context/`, `pages/`, `genmap/` et les CSS de la plateforme. **Déplacements seulement** : aucun fichier n'est renommé, aucune logique ne change. Les seules lignes de code touchées sont les imports, les en-têtes de chemin en commentaire, le découpage de `index.css` (à cascade identique) et quelques chemins de configuration (§6).

Statut : validée le 2026-11-11 (recommandations retenues).

---

## 1. Règles de rangement

Elles iront dans `src/client/CLAUDE.md` (section « Arborescence »).

1. **Quatre dossiers racines** :
   - `app/` : le squelette et l'infrastructure (pages, contexts, accès à l'API, résolution du slug, sessions, stockage, styles globaux) ;
   - `ui/` : les primitives d'interface ;
   - `features/` : les briques de la table, une par domaine ;
   - `systems/` : les slugs.
2. **`ui/` ne connaît ni le jeu, ni la table, ni l'API** : pas de `fetchWithAuth`, pas de socket, pas de session, aucun import de `features/` ni de `systems/`. Il peut s'appuyer sur l'infrastructure d'`app/` (stockage, `getSystemFromPath`).
3. **Le domaine d'abord, puis la forme.** Dans une brique, les composants sont à la racine. Quand ils sont nombreux (repère : environ 8) ou qu'un sous-ensemble se détache, ils vont dans un sous-dossier par forme (`modals/`, `history/`, `panel/`).
4. **Un dossier = un seul type de fichier** : composants à la racine (ou dans leur sous-dossier de forme), `hooks/` pour les `useQuelqueChose`, `tools/` pour les fonctions pures, `data/` pour les données. On ne mélange jamais. Un hook couplé à un composant (`useConfirm` → `ConfirmModal`) va quand même dans `hooks/`.
5. **`hooks/` et `tools/` existent dès le premier fichier** dans une brique de `features/`. `ui/` est traité comme une seule brique : un seul `ui/hooks/` et un seul `ui/tools/`.
6. **`app/components/` a un critère d'entrée strict** : n'y vont que les composants de l'application elle-même, c'est-à-dire le thème jour / nuit, l'identité d'un slug (`SystemBrand`, `SystemCard`) et les enveloppes d'écran (`SlugPage`, `LoadingScreen`). Un composant qui a un domaine de table va dans `features/`, une primitive dans `ui/`. Si `app/components/` dépasse une dizaine de fichiers, c'est le signe qu'un domaine s'y cache : on le sort.
7. **Le rôle (MJ) se lit dans le nom du fichier** (`GMSendModal`, `TabJournal`), pas dans un dossier `gm/`.
8. **Sens des dépendances** :
   - `ui/` n'importe ni `features/` ni `systems/` ;
   - `features/` n'importe pas `systems/` ;
   - seuls les pages, `AppRouter` et les chargeurs dynamiques d'`app/` (`useSlugConfig`, `SystemBrand`) assemblent tout, y compris les fichiers des slugs.
9. **Le CSS d'une brique vit à côté de ses composants**. Il est importé **uniquement** par `app/styles/index.css`, jamais par un composant (voir §4).
10. **`tools/` = ce qui se teste** (fonctions pures). Les tests reproduisent l'arborescence : `src/features/audio/tools/timecode.js` → `tests/features/audio/tools/timecode.test.js`.

## 2. Imports : alias `@/`

- `@/` désigne `src/client/src/`. Il est déclaré dans `vite.config.js` (`resolve.alias`), que Vitest lit aussi, et dans un `jsconfig.json` pour l'éditeur.
- **Un import qui sort de sa brique passe par l'alias** :
  ```js
  import Modal from '@/ui/modal/Modal.jsx';
  import useFetch from '@/app/hooks/useFetch.js';
  ```
- **Un import interne à la brique reste relatif** (`./`, `../hooks/`, `../tools/`). Une brique se déplace alors d'un bloc.
- **Dans les slugs** : tous les imports vers la plateforme passent à `@/…`. Les imports internes au slug ne bougent pas.
- **Exception : les chargements dynamiques des slugs** (`import.meta.glob`, et les clés `` `../systems/${slug}/…` `` qui doivent correspondre au motif du glob) restent en chemins relatifs, corrigés pour la nouvelle profondeur. Ça évite toute incertitude sur la forme des clés renvoyées par Vite avec un alias. C'est un piège à vérifier : une clé qui ne correspond plus au motif ne casse pas le build, elle échoue seulement à l'exécution. Fichiers concernés :
  - `PlayerPage`, `GMPage`, `CreationPage` et `SystemLayout` (thèmes, fiches, interfaces MJ, créations) ;
  - `SystemBrand` (Brand) ;
  - `useSlugConfig` (config).
- Tests : même règle (`@/…` pour importer le code testé).

## 3. Arborescence cible

```
src/
  main.jsx
  AppRouter.jsx
  app/
    pages/        HomePage, PlayerPage, GMPage, CreationPage, GenMapPage, SystemLayout, ErrorPage
    components/   SlugPage, SystemBrand, SystemCard, LoadingScreen, ThemeToggle
    context/      AuthContext, SessionContext, SocketContext, SystemsContext
    hooks/        useFetch, useSystem, useSlugConfig, useSlugGuard, useGMSession, usePlayerSession, usePersistedState
    tools/        browserStorage, browserStorageMigration, utils
    styles/       index.css, base.css, platform.css, placements.css, generated-css-utils.css
  ui/
    modal/        Modal, ModalHost, AlertModal, ConfirmModal, modal.css
    panel/        FloatingPanel, panel.css
    catalog/      CatalogModal, catalog.css
    menu/         HamburgerMenu, menu.css
    text/         Tooltip, ExpandableText, RichTextEditor.jsx, RichTextEditor.css, tooltip.css
    image/        ImageLightbox, AvatarUploader
    hooks/        useConfirm, useFloatingWindow, useDragOrder, useHashTab
    tools/        catalog, floatingGeometry, imageResize
  features/
    audio/        7 composants, panel/ (10), hooks/ (6), tools/ (8), audio.css
    board/        11 composants, hooks/ (4), tools/ (6), board.css
    dice/         Die2D, DiceAnimationOverlay, DiceOverlay2D, DiceOverlay3D, dice2d.css
      modals/     DiceConfigModal, FreeDiceModal
      history/    DiceHistoryList, DiceHistoryPage, DiceHistoryPanel, GenericRollEntry, history.css
      hooks/      useDiceConfig
      tools/      diceEngine, dice2d, diceAnimBridge, diceHistory, freeRoll, rollDate
    genmap/
      tools/      generate, renderSvg
      data/       engine.json, roomTypes.json, presets/
    initiative/   5 composants, hooks/ (1), tools/ (1), initiative.css
    journal/      JournalTab, TabJournal
    npc/          10 composants, hooks/ (1), tools/ (npcFilter), npc.css
    reference/    ReferenceGuide, tools/ (reference), reference.css
    table/        ActionZone, HamburgerMenuItems, SessionPlayersBar, ToastNotifications,
                  CopyAccessButton, TableManagementButton, actions.css, session-bar.css
      modals/     CodeModal, AccessCodeModal, CharacterListModal, GMSendModal,
                  TableManagementModal, TableCharactersModal
      tools/      sessionResources
  systems/        inchangé
```

Disparaissent : `components/`, `hooks/`, `tools/`, `context/`, `pages/` et `genmap/` à la racine de `src/`, ainsi que `index.css` et `generated-css-utils.css` à la racine.

## 4. CSS

**Aujourd'hui**, `main.jsx` importe `index.css`, qui contient tout dans cet ordre :
1. le socle (lignes 1-146) : `tailwindcss`, utilitaires générés, curseurs, `@layer base`, animations des notifications, niveaux de blessure ;
2. un seul bloc `@layer components` (lignes 147-1530), en sections ;
3. des placements hors couche (lignes 1532 et suivantes).

**Après**, `app/styles/index.css` ne contient plus que des `@import`, **dans l'ordre exact des sections d'aujourd'hui**. Chaque feuille de brique enveloppe son contenu dans `@layer components { … }`. L'ordre de déclaration étant inchangé, la cascade est identique ligne pour ligne, et l'habillage par les `theme.css` des slugs ne bouge pas.

| Ordre | Section actuelle (lignes) | Nouvelle feuille |
|---|---|---|
| 1 | `tailwindcss`, utilitaires générés | `app/styles/generated-css-utils.css` (import inchangé) |
| 2 | Socle, base, animations, niveaux de blessure (3-142) | `app/styles/base.css` |
| 3 | Modales génériques (143-216) | `ui/modal/modal.css` |
| 4 | Fenêtres flottantes (217-318) | `ui/panel/panel.css` |
| 5 | Catalogue (319-384) | `ui/catalog/catalog.css` |
| 6 | Historique des jets (385-398) | `features/dice/history/history.css` |
| 7 | Menu hamburger (399-431) | `ui/menu/menu.css` |
| 8 | Barre de session des joueurs (432-586) | `features/table/session-bar.css` |
| 9 | Thème de la plateforme + pages génériques (587-680) | `app/styles/platform.css` |
| 10 | Zone d'actions (681-722) | `features/table/actions.css` |
| 11 | Lecteur audio (723-897) | `features/audio/audio.css` |
| 12 | Aide de jeu (898-937) | `features/reference/reference.css` |
| 13 | Tableau partagé (938-1156) | `features/board/board.css` |
| 14 | Dés 2D (1157-1204) | `features/dice/dice2d.css` |
| 15 | PNJ (1205-1340) | `features/npc/npc.css` |
| 16 | Infobulle (1341-1350) | `ui/text/tooltip.css` |
| 17 | Initiative (1351-1530) | `features/initiative/initiative.css` |
| 18 | Placements hors couche (1532-fin) | `app/styles/placements.css` |

- Les numéros de ligne sont indicatifs : au découpage, je reprends le texte exact de chaque section, commentaires compris.
- Une feuille par section, et non une par brique : le menu (7) et l'infobulle (16) sont tous deux dans `ui/`, mais séparés dans l'ordre actuel. Les fusionner changerait l'ordre de déclaration.
- `RichTextEditor.css` reste importé par ses composants, comme aujourd'hui. C'est le seul import de CSS depuis un composant : je ne le change pas dans ce chantier (voir Q3).
- Les commentaires qui citent `index.css` comme lieu du style par défaut sont mis à jour avec le nom de la nouvelle feuille.

## 5. Table des déplacements

Chemins relatifs à `src/client/src/`. Le nom de fichier ne change jamais.

### `app/`

| Ancien | Nouveau |
|---|---|
| `pages/HomePage.jsx` | `app/pages/HomePage.jsx` |
| `pages/PlayerPage.jsx` | `app/pages/PlayerPage.jsx` |
| `pages/GMPage.jsx` | `app/pages/GMPage.jsx` |
| `pages/CreationPage.jsx` | `app/pages/CreationPage.jsx` |
| `pages/GenMapPage.jsx` | `app/pages/GenMapPage.jsx` |
| `pages/SystemLayout.jsx` | `app/pages/SystemLayout.jsx` |
| `components/platform/ErrorPage.jsx` | `app/pages/ErrorPage.jsx` |
| `components/platform/SlugPage.jsx` | `app/components/SlugPage.jsx` |
| `components/platform/SystemBrand.jsx` | `app/components/SystemBrand.jsx` |
| `components/platform/SystemCard.jsx` | `app/components/SystemCard.jsx` |
| `components/gm/layout/LoadingScreen.jsx` | `app/components/LoadingScreen.jsx` |
| `components/ui/ThemeToggle.jsx` | `app/components/ThemeToggle.jsx` |
| `context/*.jsx` (4) | `app/context/` |
| `hooks/useFetch.js` | `app/hooks/useFetch.js` |
| `hooks/useSystem.js` | `app/hooks/useSystem.js` |
| `hooks/useSlugConfig.js` | `app/hooks/useSlugConfig.js` |
| `hooks/useSlugGuard.js` | `app/hooks/useSlugGuard.js` |
| `hooks/useGMSession.js` | `app/hooks/useGMSession.js` |
| `hooks/usePlayerSession.js` | `app/hooks/usePlayerSession.js` |
| `hooks/usePersistedState.js` | `app/hooks/usePersistedState.js` |
| `tools/browserStorage.js` | `app/tools/browserStorage.js` |
| `tools/browserStorageMigration.js` | `app/tools/browserStorageMigration.js` |
| `tools/utils.js` | `app/tools/utils.js` |
| `index.css` | `app/styles/index.css` (+ découpage, §4) |
| `generated-css-utils.css` | `app/styles/generated-css-utils.css` |

### `ui/`

| Ancien | Nouveau |
|---|---|
| `components/ui/Modal.jsx` | `ui/modal/Modal.jsx` |
| `components/ui/ModalHost.jsx` | `ui/modal/ModalHost.jsx` |
| `components/modals/AlertModal.jsx` | `ui/modal/AlertModal.jsx` |
| `components/modals/ConfirmModal.jsx` | `ui/modal/ConfirmModal.jsx` |
| `components/ui/FloatingPanel.jsx` | `ui/panel/FloatingPanel.jsx` |
| `components/modals/CatalogModal.jsx` | `ui/catalog/CatalogModal.jsx` |
| `components/ui/HamburgerMenu.jsx` | `ui/menu/HamburgerMenu.jsx` |
| `components/ui/Tooltip.jsx` | `ui/text/Tooltip.jsx` |
| `components/ui/ExpandableText.jsx` | `ui/text/ExpandableText.jsx` |
| `components/shared/RichTextEditor.jsx` | `ui/text/RichTextEditor.jsx` |
| `components/shared/RichTextEditor.css` | `ui/text/RichTextEditor.css` |
| `components/ui/ImageLightbox.jsx` | `ui/image/ImageLightbox.jsx` |
| `components/AvatarUploader.jsx` | `ui/image/AvatarUploader.jsx` |
| `hooks/useConfirm.jsx` | `ui/hooks/useConfirm.jsx` |
| `hooks/useFloatingWindow.js` | `ui/hooks/useFloatingWindow.js` |
| `hooks/useDragOrder.js` | `ui/hooks/useDragOrder.js` |
| `hooks/useHashTab.js` | `ui/hooks/useHashTab.js` |
| `tools/catalog.js` | `ui/tools/catalog.js` |
| `tools/floatingGeometry.js` | `ui/tools/floatingGeometry.js` |
| `tools/imageResize.js` | `ui/tools/imageResize.js` |

### `features/`

| Ancien | Nouveau |
|---|---|
| `components/audio/*.jsx` (7) | `features/audio/` |
| `components/audio/panel/*.jsx` (10) | `features/audio/panel/` |
| `hooks/useAudioButtons.js`, `useAudioLibrary.js`, `useAudioSession.js`, `useYouTubePlayer.js`, `useVimeoPlayer.js`, `useSoundCloudPlayer.js` | `features/audio/hooks/` |
| `tools/audioLibrary.js`, `audioSlots.js`, `audioSync.js`, `audioVolume.js`, `mediaApis.js`, `mediaLinks.js`, `timecode.js`, `youtubeApi.js` | `features/audio/tools/` |
| `components/board/*.jsx` (11) | `features/board/` |
| `hooks/useBoardIcons.js`, `useBoardImages.js`, `useBoardSession.js`, `useBoardSlide.js` | `features/board/hooks/` |
| `tools/boardFilters.js`, `boardGeometry.js`, `boardGrid.js`, `boardIcons.js`, `boardRights.js`, `boardSelection.js` | `features/board/tools/` |
| `components/dice/Die2D.jsx` | `features/dice/Die2D.jsx` |
| `components/shared/DiceAnimationOverlay.jsx`, `DiceOverlay2D.jsx`, `DiceOverlay3D.jsx` | `features/dice/` |
| `components/modals/DiceConfigModal.jsx`, `FreeDiceModal.jsx` | `features/dice/modals/` |
| `components/layout/DiceHistoryList.jsx`, `DiceHistoryPage.jsx`, `DiceHistoryPanel.jsx`, `GenericRollEntry.jsx` | `features/dice/history/` |
| `hooks/useDiceConfig.js` | `features/dice/hooks/` |
| `tools/diceEngine.js`, `dice2d.js`, `diceAnimBridge.js`, `diceHistory.js`, `freeRoll.js`, `rollDate.js` | `features/dice/tools/` |
| `genmap/generate.js`, `genmap/renderSvg.js` | `features/genmap/tools/` |
| `genmap/data/` | `features/genmap/data/` |
| `components/initiative/*.jsx` (5) | `features/initiative/` |
| `hooks/useInitiativeSession.js` | `features/initiative/hooks/` |
| `tools/initiative.js` | `features/initiative/tools/` |
| `components/tabs/JournalTab.jsx` | `features/journal/JournalTab.jsx` |
| `components/gm/tabs/TabJournal.jsx` | `features/journal/TabJournal.jsx` |
| `components/npc/*.jsx` (10) | `features/npc/` |
| `components/npc/npcFilter.js` | `features/npc/tools/npcFilter.js` |
| `hooks/useNpcs.js` | `features/npc/hooks/` |
| `components/reference/ReferenceGuide.jsx` | `features/reference/ReferenceGuide.jsx` |
| `tools/reference.js` | `features/reference/tools/` |
| `components/ui/ActionZone.jsx`, `HamburgerMenuItems.jsx`, `CopyAccessButton.jsx` | `features/table/` |
| `components/layout/SessionPlayersBar.jsx`, `ToastNotifications.jsx` | `features/table/` |
| `components/gm/TableManagementButton.jsx` | `features/table/` |
| `components/modals/CodeModal.jsx`, `AccessCodeModal.jsx`, `CharacterListModal.jsx` | `features/table/modals/` |
| `components/gm/modals/GMSendModal.jsx`, `TableManagementModal.jsx`, `TableCharactersModal.jsx` | `features/table/modals/` |
| `tools/sessionResources.js` | `features/table/tools/` |

### Tests (`src/client/tests/`)

| Ancien | Nouveau |
|---|---|
| `tests/tools/audio*.test.js`, `mediaLinks`, `timecode`, `youtubeApi` | `tests/features/audio/tools/` |
| `tests/tools/board*.test.js` | `tests/features/board/tools/` |
| `tests/tools/dice2d`, `diceEngine`, `freeRoll`, `rollDate` | `tests/features/dice/tools/` |
| `tests/tools/initiative.test.js` | `tests/features/initiative/tools/` |
| `tests/tools/reference.test.js` | `tests/features/reference/tools/` |
| `tests/tools/catalog`, `floatingGeometry` | `tests/ui/tools/` |
| `tests/tools/browserStorage`, `browserStorageMigration`, `utils` + l'aide `memoryStorage.js` | `tests/app/tools/` |
| `tests/components/npc/npcFilter.test.js` | `tests/features/npc/tools/` |
| `tests/genmap/generate.test.js` | `tests/features/genmap/tools/` |
| `tests/systems/` | inchangé (imports vers la plateforme passés à `@/`) |

## 6. Outillage et configuration touchés

| Fichier | Changement |
|---|---|
| `src/client/vite.config.js` | `resolve.alias` : `@` → `src` |
| `src/client/jsconfig.json` (nouveau) | `paths` `@/*` pour la navigation de l'éditeur |
| `src/client/src/main.jsx` | `import './app/styles/index.css'` et chemin d'`AppRouter` inchangé |
| `src/client/eslint.config.js` | Exceptions de chemins : `src/tools/browserStorage.js` → `src/app/tools/browserStorage.js` (F-STORAGE) ; `src/hooks/**`, `src/context/**` → `src/app/hooks/**`, `src/app/context/**`, `src/features/*/hooks/**`, `src/ui/hooks/**` (F-SOCK-INFRA). Les listes `LEGACY` ne citent que des slugs : inchangées. |
| `src/client/scripts/generate-css-utils.js` | Sortie vers `src/app/styles/generated-css-utils.css` |
| Chargeurs dynamiques (§2) | Motifs `import.meta.glob` et clés passés à `../../systems/…` |

## 7. Documentation mise à jour dans le même chantier

- `src/client/CLAUDE.md` :
  - nouvelle section « Arborescence » (règles du §1, alias du §2) ;
  - tous les chemins cités mis à jour ;
  - la phrase « `SessionPlayersBar` vit aussi dans `src/components/layout/` » disparaît, puisqu'elle n'a plus d'objet.
- `CLAUDE.md` racine : le lien vers `diceEngine.js` et toute mention de chemin.
- `code-rules/front.md` : les chemins des règles F-STORAGE, F-FETCH, F-HISTORY et F-HASH. Je propose en plus une règle **F-TREE** (relecture) qui reprend les §1 et §2 (voir Q2).
- `.claude/commands/new-slug.md` et `relecture` si elle cite des chemins.
- Les specs qui citent ces chemins (une vingtaine), **sauf** `audit_code_2026-11.md`, qui est un instantané daté.
- Ma mémoire de projet (chemins des fichiers clés).

## 8. Hors périmètre

- **La structure interne des slugs** (`gm/`, `components/layout`…) : ticket à part. Seuls leurs imports vers la plateforme changent.
- **`RowMenu`** (`features/audio/panel/RowMenu.jsx`) : c'est un menu ancré générique, utilisé aussi par le tableau, dont la place serait `ui/menu/`. Mais il dépend des icônes de l'audio et d'une classe `vtt-audio-*`. L'extraire demande de modifier du code : c'est une dette notée dans le backlog. En attendant, `features/board` importe `@/features/audio/panel/RowMenu.jsx`, un import entre briques toléré et signalé.
- **Le serveur** et `tests/server/` : inchangés.

## 9. Méthode

1. **Déplacements simples, sans `git mv`.** Git détecte les renommages au commit, et ton index n'est pas touché.
2. **Un script Node (dans le scratchpad, hors dépôt)** :
   - lit la table du §5 ;
   - déplace les fichiers ;
   - réécrit chaque import du dépôt client (code et tests) : `@/…` entre briques, relatif à l'intérieur d'une brique ;
   - met à jour les en-têtes de chemin en commentaire ;
   - **conserve les fins de ligne** de chaque fichier (CRLF ou LF).
3. **Le découpage de `index.css`** se fait à la main, section par section (Edit), avec une vérification finale : la concaténation des feuilles, dans l'ordre des imports, redonne le contenu d'origine (à l'enveloppe `@layer` près).
4. **Les chargeurs dynamiques** (§2) sont corrigés à la main et vérifiés à l'exécution.
5. **Vérifications** :
   - recherche de tout ancien chemin restant (`components/`, `hooks/`, `tools/`… hors slugs) ;
   - lint, tests et build du front ;
   - à l'écran : accueil, fiche joueur, interface MJ et création sur Vikings, Maledictum et Dune (thèmes chargés, musique, tableau, initiative, PNJ, historique des dés, notifications).
6. **Un seul commit** (bloc « Général »), puis la relecture Codex si tu la veux.

## 10. Questions

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q1 | `ThemeToggle` dans `app/components/` (à côté d'`applyTheme`, dans `app/tools/utils.js`) plutôt que dans `ui/` ? | Oui : il pilote le thème de l'application, ce n'est pas une primitive. | Validé |
| Q2 | Ajouter une règle **F-TREE** (relecture) dans `code-rules/front.md` qui reprend les règles du §1 et l'alias du §2 ? | Oui : le relecteur pourra signaler un fichier mal rangé ou un import relatif entre briques. Plus tard, le sens des dépendances pourra devenir une règle de lint (`no-restricted-imports`), mais pas dans ce chantier. | Validé |
| Q3 | `RichTextEditor.css` : le laisser importé par ses composants (comme aujourd'hui), ou le passer par `app/styles/index.css` comme les autres feuilles ? | Le laisser tel quel : il n'est pas dans la couche `components`, et le déplacer dans l'ordre global serait un changement de cascade que rien ne demande. Je le signale dans la règle comme exception connue. | Validé |
| Q4 | `sessionResources` dans `features/table/tools/` : c'est le débit des ressources de session 2D20 / D6 par HTTP, utilisé par l'initiative et trois slugs. | Oui, `table/` : ce sont les ressources de la table. | Validé |
| Q5 | Les composants sans forme commune d'`app/` vont dans `app/components/`, alors que `ui/` et `features/` gardent leurs composants à la racine. Ça te va ? | Oui : `app/` contient déjà cinq types (pages, context, hooks, tools, styles), et des composants à sa racine se mêleraient aux dossiers. Critère d'entrée strict (§1, règle 6) pour qu'il ne devienne pas un fourre-tout. | Validé |
