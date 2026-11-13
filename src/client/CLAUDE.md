# CLAUDE.md — Frontend (src/client)

Contexte React / CSS. Complète le CLAUDE.md racine. **Les règles du code front sont dans la grille ci-dessous** (identifiants `F-…`) ; ce fichier décrit comment le front fonctionne et les contrats à respecter.

@../../code-rules/front.md

## Arborescence (`documentations/process/spec_arborescence_client.md`, F-TREE)

```
src/
  main.jsx, AppRouter.jsx
  app/        squelette et infrastructure : pages/, components/, context/, hooks/, tools/, styles/
  ui/         primitives d'interface, sans rien savoir du jeu : modal/, panel/, catalog/, menu/, text/, image/, date/, hooks/, tools/
  features/   briques de la table, une par domaine : audio/, board/, dice/, genmap/, initiative/, journal/, npc/, reference/, table/
  systems/    les slugs
```

- **Le domaine d'abord, puis la forme** : une brique de `features/` a ses composants à la racine (un sous-dossier par forme quand ils sont nombreux : `modals/`, `history/`, `panel/`), ses hooks dans `hooks/`, ses fonctions pures dans `tools/`, son CSS à côté.
- **Un dossier = un seul type de fichier** : composants, `hooks/` (`useQuelqueChose`, même couplé à un composant), `tools/` (fonctions pures, ce qui se teste), `data/`.
- **`ui/` ne connaît ni le jeu, ni la table, ni l'API** : pas de `fetchWithAuth`, de socket ni de session, aucun import de `features/` ou de `systems/`.
- **`app/components/` : critère strict**, réservé au thème jour / nuit, à l'identité d'un slug (`SystemBrand`, `SystemCard`) et aux enveloppes d'écran (`SlugPage`, `LoadingScreen`). Au-delà d'une dizaine de fichiers, un domaine s'y cache : on le sort.
- **Le rôle (MJ) se lit dans le nom du fichier** (`GMSendModal`, `TabJournal`), pas dans un dossier.
- **Sens des dépendances** : `systems` → `features` → `ui` → `app`. Seuls les pages, `AppRouter` et les chargeurs dynamiques (`useSlugConfig`, `SystemBrand`) assemblent tout.
- **Imports** : `@/` = `src/`. Un import qui sort de sa brique passe par `@/…` (`import Modal from '@/ui/modal/Modal.jsx'`) ; un import interne à la brique reste relatif. Exception : les `import.meta.glob` des slugs et leurs clés restent relatifs (`../../systems/${slug}/…`).
- **CSS** : la feuille d'une brique (en `@layer components`) ne s'importe que depuis `app/styles/index.css`, dans l'ordre de déclaration ; tous les `@import` en tête (un `@import` après une autre règle est ignoré). Seule exception : `RichTextEditor.css`, importé par ses composants.
- Dettes connues : `RowMenu` (menu ancré générique) vit encore dans `features/audio/panel/` et le tableau l'importe ; la structure interne des slugs n'est pas normalisée.

## Routing et chargement

- Entrée : `src/main.jsx` → `AppRouter.jsx`.
- `/:system` → `SystemLayout` (valide le slug auprès du backend) → `PlayerPage` / `GMPage` / `CreationPage`.
- **Une page = un slug** : un `theme.css` chargé n'est jamais retiré (d'où F-SLUG-LINK). Le garde-fou `useSlugGuard` (accueil, `SystemLayout`) recharge la page si un changement de slug arrive quand même.
- `useSystem()` lit le param `:system` et le valide via `/api/systems` ; `getSystemFromPath()` est la version hors React.
- `systems/:slug/config.jsx` exporte `default { slug, label, dice, diceConfigDefault }`.

## Composants génériques : ne jamais deviner leurs contrats

Avant d'écrire un composant qui reçoit des props de la plateforme, **ouvre la source** et reprends les noms et formes exacts des props (F-CONTRACT). Concerne notamment : `PlayerPage`, `GMPage`, `CreationPage`, `diceEngine.js`, le système de toasts/notifications, `SessionPlayersBar`, `CharacterListModal`, `TabJournal`, `DiceHistoryPage`, `HamburgerMenu` et `HamburgerMenuItems`.

- `DiceHistoryPage` (et non `DiceHistoryTab`) et `ToastNotifications` : prop `sessionId` seule. Le rendu d'un jet est déclaré **une fois** dans le `config.jsx` du slug (`dice.renderHistoryEntry`, `dice.renderAllRollTypes` si le slug rend aussi le jet libre) et lu par l'onglet, le panneau et les notifications. Import depuis `src/features/dice/history/DiceHistoryPage.jsx`.
- Panneau d'historique : `features/dice/history/DiceHistoryPanel.jsx` (prop `sessionId`), brique que le slug monte s'il le veut, **à la racine** de sa fiche ou de son interface MJ (pas dans un onglet) ; son bouton va dans la zone d'actions.
- Zone d'actions (bas à droite) : `features/table/ActionZone.jsx`, posée par `PlayerPage` / `GMPage` ; seules les briques de la plateforme y mettent un `ZoneAction` (v1, prop `badge?` = compteur sur le bouton, `.vtt-action-badge`). Habillage par le slug : `.vtt-action-btn` (états `is-active`, `is-highlighted`), `.vtt-actions-bar` ; icônes remplaçables par `actionIcons: { <id>: … }` dans `config.jsx`. Contrat dans `documentations/plateforme/spec_ui_actions.md`.
- Menus joueur et MJ : briques `ui/menu/HamburgerMenu.jsx` et éléments `features/table/HamburgerMenuItems.jsx` (contrats dans `documentations/plateforme/spec_ui_menu.md`).
- Tableau partagé (`documentations/plateforme/spec_tableau.md` §10.8) : `BoardLayer` monté par `PlayerPage` / `GMPage` (bouton de la zone d'actions, bandeau, fenêtre flottante) ; le slug pose sa bascule par `TableSessionTools` dans son `TabSession` (voir « Session MJ »), et s'il veut un onglet, `features/board/Board.jsx` (props `sessionId`, `role` `'gm'|'player'`, `compact?`) dans un conteneur `vtt-board-page`. Grille par défaut du slug facultative : `board: { grid: { value, unit } }` dans `config.jsx`. Les émissions socket du tableau (`board-drag`, `board-ping`) vivent dans `features/board/hooks/useBoardSlide.js`, jamais dans un slug.
- Initiative (`documentations/plateforme/spec_initiative.md` §9) : `InitiativeLayer` monté par `PlayerPage` / `GMPage` ; le slug l'adopte par un bloc `initiative` dans son `config.jsx` (`mode` `'order'|'sides'` obligatoire ; `label`, `alternate`, `sides`, `opening`, `characterInitiative`, `npcInitiative`, `npcActions`, `npcWound`, `npcContext`, `keepInitiative` (par camp, une façon de payer `{ label, run }` ou un tableau ; `run` débite par `features/table/tools/sessionResources.js`), `delay`, `enemyOrder`, `woundLabels` facultatifs, contrat au §9.8 et §11.3). Aucun code dans la fiche ni dans `GMApp`. Toute la logique (Suivant, camps, réserve…) est dans les fonctions pures de `features/initiative/tools/initiative.js` ; état et avatars par `features/initiative/hooks/useInitiativeSession.js`. Habillage : classes `vtt-initiative-*`.
- Fenêtre flottante (déplaçable, redimensionnable, réductible, mémorisée) : `ui/panel/FloatingPanel.jsx`, contrat dans `documentations/plateforme/spec_ui_panneaux.md`. Elle est un conteneur de requêtes de taille : un menu ou une modale ouvert depuis son contenu passe par `HostedModal` (`ui/modal/ModalHost.jsx`), sinon il est rogné.
- Élément ancré à un bouton (menu d'une pastille, petite fenêtre d'ajout, bulle épinglée) : `ui/panel/Popover.jsx` (props `anchor` = élément DOM, `onClose?` = fermeture par clic extérieur, Échap, défilement ; absent = bulle de lecture `is-tip`, `className?` = habillage du slug), rendu par `HostedModal` (jamais rogné), sous l'ancre ou au-dessus. La plateforme ne pose que `.vtt-popover` (position, plan) ; fond, bordure et police viennent de la classe du slug. Références : tags de Cyberpunk (`TagManager`), États de Maledictum (`MlConditions`).
- Infobulle habillée (à la place du `title` natif) : `ui/text/Tooltip.jsx` (props `text`, `onlyIfTruncated?` = bulle seulement si le contenu est coupé, `className?` = classes du `<span>` porteur), au survol, rendue dans `<body>`. Pour poser la bulle sur un élément existant (une ligne entière) : `useTooltip(text, { onlyIfTruncated?, measureRef? })` → `{ bind, bubble }` (`bind` sur l'élément survolé, `measureRef` = élément dont on mesure la coupure). Habillage : `.vtt-tooltip` (jamais `position` / `top` / `left`). Référence : principes et compétences de Dune.
- Journal (`documentations/plateforme/spec_journal.md`, partie III) : `TabJournal` (`features/journal/TabJournal.jsx`) ne prend aucune prop (journal du MJ, personnage -1) ; `JournalTab` (props `characterId`, `onRead?`) pour la fiche. Les deux montent la brique `Journal` (bascule Privé / Partagé, cartes, filtres, note). Données, compteurs et fenêtre flottante viennent de `JournalProvider` (props `characterId`, `sessionId`, `userName`) et `JournalLayer`, posés par `PlayerPage` / `GMPage` ; le badge de l'onglet des fiches (`journalUnread`) est le total des non lus du MJ et des nouveautés de la table, `onJournalRead` est gardé pour le contrat (le compteur suit seul la lecture). Habillage : classes `vtt-journal-*` (et `rich-editor-*` de l'éditeur).
- Éditeur de texte riche : `ui/text/RichTextEditor.jsx` (props `content`, `onUpdate(html, { remote })`, `onBlur`, `editable`, `placeholder`, `className`, `maxImageSize?`, `toolbar` = `'bubble'` par défaut | `'full'` | `'selection'`, `collaboration?` = `{ doc, awareness, user, seedHtml?, onSeeded? }` (Yjs), `mentions?` = `{ items(query), exists(id), open(id) }` (liens « @ »)). Un Markdown collé est mis en forme. Images (`ui/text/FigureImage.jsx`, nœud `image` en `<figure>`) : sans cadre, taille en %, placement centré ou à gauche / à droite avec le texte autour, légende, barre au clic, bouton « Agrandir » ; insertion par l'ordinateur, une adresse web (rien n'est envoyé au serveur) ou un dépôt ; l'éditeur ouvre lui-même l'agrandissement.
- Agrandissement d'images : `ui/image/ImageLightbox.jsx` (props `images` = `[{ src, caption? }]` et `index`, ou `src` seul ; `onClose`) : zoom, images voisines, légende, classes `vtt-lightbox-*`.
- Champ « période » (calendrier habillé, à la place de `<input type="date">`) : `ui/date/DateRangeField.jsx` (props `value` = `{ from, to }` en AAAA-MM-JJ, `onChange`, `placeholder?`, `className?`), calendrier en `Popover`, classes `vtt-date-*`.
- Aide de jeu (référence des règles) : `features/reference/ReferenceGuide.jsx` (props `sections`, `isGM`, `renderBlock?`, `placeholder?`), contenu en Markdown converti par `markdownToSections` (`features/reference/tools/reference.js`), visibilité `gm` / `player`. Contrat dans `documentations/plateforme/spec_ui_reference.md`.
- Onglet courant gardé dans le hash de l'URL : `useHashTab(TABS, défaut)` (`ui/hooks/useHashTab.js`).
- PNJ (`documentations/plateforme/spec_pnj.md` §6.4, §6.5) : onglet assemblé `features/npc/TabNpcs.jsx` (props `sessionId`, `config` = bloc `npc` du `config.jsx` du slug, `context?` = données de la table pour `initialState`, ex. nombre de héros), briques de `features/npc/` (`NpcAvatar`, `NpcLibrary`, `NpcForm`, `NpcSheet`, `NpcCard`, `NpcSystem`, `NpcPresets` / `NpcPresetEditor`, `NpcItemList` : liste éditable des formulaires de slug, champs `{ key, placeholder, type?, narrow?, multiline?, options?, list? }`), hook `useNpcs(sessionId)` (un PNJ de la table modifié, ajouté ou retiré est signalé dans le navigateur par `vtt:session-npc-changed` : les autres instances du hook et la bande d'initiative suivent). Bloc `npc` facultatif : `librarySide`, `tagGroups` (étiquettes en tête du filtre, `[{ label, tags, of?, owns? }]`, qui s'additionnent dans un groupe ; `of(systemData)` = groupe piloté par la fiche, ses étiquettes posées et verrouillées, `features/npc/tools/npcTags.js`, §11), `hiddenTags` (filtrables mais pas affichées sur les lignes), `defaults`, `summary`, `initialState(npc, { quantity, context })`, `isGroup` (une carte pour un groupe, ex. sbires), `isDown`, `Form` ({ value, onChange }), `Sheet` ({ npc, instance, state, onStateChange, pick, hiddenRolls, sessionId, name, onRoll }), `pick` (jet composé : `groups`, `part`, `extra?(npc, state)`, `resolve(npc, sel, name, state)`, `state` = état à la table ou `null`), `RollWindow`. La plateforme ne pose rien dans la partie système : le slug place les briques (jets préparés, barre de jet par défaut sous la fiche). Habillage : classes `vtt-npc-*`. Référence : Dune.
- Session MJ (`documentations/plateforme/spec_session_mj.md`), le slug garde son `TabSession` et sa disposition :
  - outils de table : `features/table/TableSessionTools.jsx` (props `sessionId`, `className?` commune, `audio?` / `board?` = `{ label?, icon?, className? }` de chaque bascule, ou `false` pour l'omettre), rend un fragment sans conteneur : musique (`AudioSessionToggle`), tableau (`BoardSessionToggle`), puis les outils suivants. Les deux bascules restent utilisables seules ;
  - fiches de la table : `useTableCharacters(activeSession, characterUpdates)` (`features/table/hooks/`) → `{ characters, order, loading, patchCharacter(id, champs) }` (PATCH, affichage immédiat, retour arrière en cas d'échec) ; aucune écoute de socket, le slug transmet `characterUpdates` de `GMApp`. Sélection, mode Édition et stats dérivées restent au slug.
- Copie des accès d'un personnage (message Discord : jeu, nom, lien, code) : `features/table/CopyAccessButton.jsx` (props `character`, `codeOnly?`, `name?`, `label?`, `icon?`, `className?`), habillé par `.vtt-btn`. Message complet dans le `TabSession` (le MJ le transmet) ; `codeOnly` sur l'écran de fin de création (le joueur colle le code seul pour se reconnecter).

## Moteur de dés (`src/features/dice/tools/diceEngine.js`)

Agnostique. Chaque `config.jsx` déclare les hooks :
- `buildNotation(ctx)` → chaîne ou tableau de notations, **un type de dé par chaîne** (F-ROLL). Appelé par le composant avant `roll()`, pas dans le moteur.
- `beforeRoll(ctx)` → ctx enrichi.
- `afterRoll(raw, ctx)` → résultat interprété (succès, critiques…).
- `buildAnimationSequence(raw, ctx, result)` → config d'animation.
- `renderHistoryEntry(entry)` → élément React ou `null`.
- Dés 2D (`spec_diceengine_v2.md` « Dés 2D et apparence ») : `dice.renderer: '2d'` dans `config.jsx` fait jouer `DiceOverlay2D` au lieu de la 3D (aiguillage dans `DiceAnimationOverlay`, 3D chargée à la demande). Apparence d'un dé = configuration au format de `diceConfigDefault.custom`, résolue champ par champ : `waves[n].colors[i]` > `groups[n].color` (objet) > `dice.byType` du slug > réglages du joueur (`features/dice/tools/dice2d.js`). Brique `features/dice/Die2D.jsx` (props `type`, `value`, `config`) réutilisable par les rendus de jet ; habillage `.vtt-die2d*` à partir des variables `--die-*`, jamais de couleurs en dur.
- `raw.groups` correspond 1 pour 1 au tableau de notations : deux chaînes = deux groupes. Le moteur ne lit que le premier terme de dés d'une chaîne (`"1d8+1d10"` ne remonte que le d8 dans `values`).
- Historique (`spec_diceengine_v2.md`, « Passe générique ») : un jet enregistré exige `ctx.rollType` et `ctx.label` (sinon la route le refuse). Le moteur écrit lui-même `notation` et `raw_result` (brut de la bibliothèque) ; le slug range ce que son rendu lit dans `roll_result`, sans clé imposée. Une entrée sans dé passe par `recordHistoryEntry` (`features/dice/tools/diceHistory.js`), jamais par un `POST /dice/roll` à la main. Rendu de secours commun : `features/dice/history/GenericRollEntry.jsx`. Types réservés : `PLATFORM_ROLL_TYPES` (`free_roll`).

## Sockets côté client

- Les mises à jour de personnage passent par HTTP (`onCharacterUpdate` → PUT avec debounce, `patchImmediate` → PUT/PATCH direct sans debounce). Les composants écoutent.
- Les emits d'infrastructure vivent dans `useGMSession`, `usePlayerSession`, `SessionContext`.
- **Tables actives** (`documentations/plateforme/spec_tables.md`) : plusieurs tables d'un slug peuvent être actives. Côté MJ, un onglet est un poste : `useGMSession` ouvre sa table et ne la quitte (`gm-clear-session`) que par `setActiveSession` (autre table, ou `null` = Désactiver), jamais au démontage. Côté joueur, `SessionContext` prend parmi les tables actives (`useActiveTables`) celle dont le personnage est membre (`pickPlayerTable`, `app/tools/playerTable.js`) ; plusieurs : fenêtre de choix (`TableChoiceModal`, montée par `PlayerPage`). Le slug de la page part dans la poignée de main du socket (`SocketContext`). Gestion des tables du MJ : `TableManagementModal` en maître-détail (props `isOpen`, `onClose`, `onSelectTable`, `activeSessionId`), habillage `vtt-tables-*` / `vtt-table-choice-*` (`features/table/tables.css`). Présence en ligne : `useOnlineCharacters(slug)`.
- **Dette connue, non prioritaire** : les ressources de session 2D20 / D6 (`<slug>:update-session-resources`) sont émises par socket depuis `dune/hooks/useSessionResources.js`, `dune/hooks/useDuneRoll.js`, `achtung/Sheet.jsx`, `achtung/gm/tabs/TabSession.jsx`, `achtung/dice/AchtungDiceModal.jsx`, `tecumah/components/gm/tabs/TabResource.jsx`, `tecumah/components/modals/TecumahDiceModal.jsx`. Ne refactore pas ce code sans demande ; pour du nouveau code, ne propage pas ce pattern sans m'en parler.
- L'écoute de `character-full-update` appartient à `useGMSession` / `GMPage`.

## React

- `fetchWithAuth` (`app/hooks/useFetch.js`) est stable d'un rendu à l'autre : il peut figurer dans un tableau de dépendances.
- Ne modélise pas dans l'app une mécanique gérée à la table ; n'automatise que le pénible.

## Stockage navigateur (`app/tools/browserStorage.js`)

Tout passe par `usePersistedState` / `readStored` / `writeStored` (F-STORAGE). Portées : `PLATFORM_SCOPE` (`'platform'`), `<slug>`, `tableScope(slug, table)`. Spec : `documentations/plateforme/spec_browser_storage.md`.

## CSS / style

- Couleurs de la plateforme déclarées à Tailwind dans `app/styles/tokens.css` (`documentations/plateforme/spec_performance.md` §3) : `bg`/`text`/`border`/`divide`/`outline`/`ring`/`placeholder`… sur `primary`, `secondary`, `accent`, `danger`, `success`, `surface`, `surface-alt`, `default` (fond `--color-bg`, texte `--color-text`, bordure `--color-border`), `muted` (texte seulement), plus `glow-{couleur}[-{taille}]`. Tailwind ne produit que les classes trouvées dans le code, avec tous les états (`hover:`, `group-hover:`…) et opacités (`bg-primary/10`). Une couleur d'un seul slug va dans son `theme.css`.
- Mode sombre : `data-theme` posé sur `<html>` par la plateforme (`applyTheme`).
- Style par défaut de la plateforme : une feuille par brique (`ui/modal/modal.css`, `features/audio/audio.css`…), importées dans l'ordre par `app/styles/index.css`.
- `theme.css` est chargé au niveau page (`import.meta.glob` dans `PlayerPage`/`GMPage`). Les `import './theme.css'` restés dans d'anciens slugs sont en trop mais sans effet (exceptions du lint).

## Structure d'un slug côté front

```
systems/:slug/
  config.jsx
  Sheet.jsx
  GMApp.jsx            # contenu MJ directement ici, pas d'indirection vers gm/GMView.jsx
  Creation.jsx
  components/layout/   # sections réutilisables de la fiche
  components/modals/   # modales de dés et autres
  gm/tabs/TabSession.jsx
```

## Tests (`tests/`, Vitest)

- `tests/` reproduit l'arborescence de `src/` : le test de `src/systems/:slug/xxx.js` est `tests/systems/:slug/xxx.test.js`, celui de `src/features/audio/tools/timecode.js` est `tests/features/audio/tools/timecode.test.js`. Le code testé s'importe par `@/…`.
- Imports explicites (`import { describe, it, expect } from 'vitest'`), pas de globales.
- Importe depuis le module public (ex. `config.jsx` du slug), comme le fait le code applicatif.
- Fonctions pures uniquement ; l'environnement Node par défaut suffit (pas de jsdom).
- Les cas de test reprennent les exemples des specs validées dans `documentations/`.

## Fichiers volumineux

Avant de patcher un gros fichier souvent modifié à la main (ex. `Sheet.jsx`), présente le diagnostic et les corrections prévues, puis demande si des modifications manuelles non commitées existent.
