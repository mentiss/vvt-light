# CLAUDE.md — Frontend (src/client)

Contexte React / CSS. Complète le CLAUDE.md racine. **Les règles du code front sont dans la grille ci-dessous** (identifiants `F-…`) ; ce fichier décrit comment le front fonctionne et les contrats à respecter.

@../../code-rules/front.md

## Routing et chargement

- Entrée : `src/main.jsx` → `AppRouter.jsx`.
- `/:system` → `SystemLayout` (valide le slug auprès du backend) → `PlayerPage` / `GMPage` / `CreationPage`.
- **Une page = un slug** : un `theme.css` chargé n'est jamais retiré (d'où F-SLUG-LINK). Le garde-fou `useSlugGuard` (accueil, `SystemLayout`) recharge la page si un changement de slug arrive quand même.
- `useSystem()` lit le param `:system` et le valide via `/api/systems` ; `getSystemFromPath()` est la version hors React.
- `systems/:slug/config.jsx` exporte `default { slug, label, dice, diceConfigDefault }`.

## Composants génériques : ne jamais deviner leurs contrats

Avant d'écrire un composant qui reçoit des props de la plateforme, **ouvre la source** et reprends les noms et formes exacts des props (F-CONTRACT). Concerne notamment : `PlayerPage`, `GMPage`, `CreationPage`, `diceEngine.js`, le système de toasts/notifications, `SessionPlayersBar`, `CharacterListModal`, `TabJournal`, `DiceHistoryPage`, `HamburgerMenu` et `HamburgerMenuItems`.

- `DiceHistoryPage` (et non `DiceHistoryTab`) et `ToastNotifications` : prop `sessionId` seule. Le rendu d'un jet est déclaré **une fois** dans le `config.jsx` du slug (`dice.renderHistoryEntry`, `dice.renderAllRollTypes` si le slug rend aussi le jet libre) et lu par l'onglet, le panneau et les notifications. Import depuis `src/components/layout/DiceHistoryPage.jsx`.
- Panneau d'historique : `components/layout/DiceHistoryPanel.jsx` (prop `sessionId`), brique que le slug monte s'il le veut, **à la racine** de sa fiche ou de son interface MJ (pas dans un onglet) ; son bouton va dans la zone d'actions.
- Zone d'actions (bas à droite) : `components/ui/ActionZone.jsx`, posée par `PlayerPage` / `GMPage` ; seules les briques de la plateforme y mettent un `ZoneAction` (v1). Habillage par le slug : `.vtt-action-btn` (états `is-active`, `is-highlighted`), `.vtt-actions-bar` ; icônes remplaçables par `actionIcons: { <id>: … }` dans `config.jsx`. Contrat dans `documentations/spec_ui_actions.md`.
- Menus joueur et MJ : briques `components/ui/HamburgerMenu.jsx` et éléments `components/ui/HamburgerMenuItems.jsx` (contrats dans `documentations/spec_ui_menu.md`).
- Tableau partagé (`documentations/spec_tableau.md` §10.8) : `BoardLayer` monté par `PlayerPage` / `GMPage` (bouton de la zone d'actions, bandeau, fenêtre flottante) ; le slug pose `BoardSessionToggle` (props `sessionId`, `label?`, `icon?`, `className?`) dans son `TabSession`, et s'il veut un onglet, `components/board/Board.jsx` (props `sessionId`, `role` `'gm'|'player'`, `compact?`) dans un conteneur `vtt-board-page`. Grille par défaut du slug facultative : `board: { grid: { value, unit } }` dans `config.jsx`. Les émissions socket du tableau (`board-drag`, `board-ping`) vivent dans `hooks/useBoardSlide.js`, jamais dans un slug.
- Initiative (`documentations/spec_initiative.md` §9) : `InitiativeLayer` monté par `PlayerPage` / `GMPage` ; le slug l'adopte par un bloc `initiative` dans son `config.jsx` (`mode` `'order'|'sides'` obligatoire ; `label`, `alternate`, `sides`, `opening`, `characterInitiative`, `npcInitiative`, `npcActions`, `npcWound`, `npcContext`, `keepInitiative` (par camp, une façon de payer `{ label, run }` ou un tableau ; `run` débite par `tools/sessionResources.js`), `delay`, `enemyOrder`, `woundLabels` facultatifs, contrat au §9.8 et §11.3). Aucun code dans la fiche ni dans `GMApp`. Toute la logique (Suivant, camps, réserve…) est dans les fonctions pures de `tools/initiative.js` ; état et avatars par `hooks/useInitiativeSession.js`. Habillage : classes `vtt-initiative-*`.
- Fenêtre flottante (déplaçable, redimensionnable, réductible, mémorisée) : `components/ui/FloatingPanel.jsx`, contrat dans `documentations/spec_ui_panneaux.md`. Elle est un conteneur de requêtes de taille : un menu ou une modale ouvert depuis son contenu passe par `HostedModal` (`components/ui/ModalHost.jsx`), sinon il est rogné.
- Infobulle habillée (à la place du `title` natif) : `components/ui/Tooltip.jsx` (props `text`, `onlyIfTruncated?` = bulle seulement si le contenu est coupé, `className?` = classes du `<span>` porteur), au survol, rendue dans `<body>`. Pour poser la bulle sur un élément existant (une ligne entière) : `useTooltip(text, { onlyIfTruncated?, measureRef? })` → `{ bind, bubble }` (`bind` sur l'élément survolé, `measureRef` = élément dont on mesure la coupure). Habillage : `.vtt-tooltip` (jamais `position` / `top` / `left`). Référence : principes et compétences de Dune.
- `SessionPlayersBar` vit aussi dans `src/components/layout/`.
- `TabJournal` (`components/gm/tabs/TabJournal.jsx`) ne prend aucune prop : c'est le journal du MJ (`JournalTab` avec `characterId = -1`).
- Aide de jeu (référence des règles) : `components/reference/ReferenceGuide.jsx` (props `sections`, `isGM`, `renderBlock?`, `placeholder?`), contenu en Markdown converti par `markdownToSections` (`tools/reference.js`), visibilité `gm` / `player`. Contrat dans `documentations/spec_ui_reference.md`.
- Onglet courant gardé dans le hash de l'URL : `useHashTab(TABS, défaut)` (`hooks/useHashTab.js`).
- PNJ (`documentations/spec_pnj.md` §6.4, §6.5) : onglet assemblé `components/npc/TabNpcs.jsx` (props `sessionId`, `config` = bloc `npc` du `config.jsx` du slug, `context?` = données de la table pour `initialState`, ex. nombre de héros), briques de `components/npc/` (`NpcAvatar`, `NpcLibrary`, `NpcForm`, `NpcSheet`, `NpcCard`, `NpcSystem`, `NpcPresets` / `NpcPresetEditor`, `NpcItemList` : liste éditable des formulaires de slug, champs `{ key, placeholder, type?, narrow?, multiline?, options?, list? }`), hook `useNpcs(sessionId)` (un PNJ de la table modifié, ajouté ou retiré est signalé dans le navigateur par `vtt:session-npc-changed` : les autres instances du hook et la bande d'initiative suivent). Bloc `npc` facultatif : `librarySide`, `tagGroups` (étiquettes en tête du filtre, `[{ label, tags }]`, qui s'additionnent dans un groupe), `hiddenTags` (filtrables mais pas affichées sur les lignes), `defaults`, `summary`, `initialState(npc, { quantity, context })`, `isGroup` (une carte pour un groupe, ex. sbires), `isDown`, `Form` ({ value, onChange }), `Sheet` ({ npc, instance, state, onStateChange, pick, hiddenRolls, sessionId, name, onRoll }), `pick` (jet composé : `groups`, `part`, `extra?(npc, state)`, `resolve(npc, sel, name, state)`, `state` = état à la table ou `null`), `RollWindow`. La plateforme ne pose rien dans la partie système : le slug place les briques (jets préparés, barre de jet par défaut sous la fiche). Habillage : classes `vtt-npc-*`. Référence : Dune.
- Copie des accès d'un personnage (message Discord : jeu, nom, lien, code) : `components/ui/CopyAccessButton.jsx` (props `character`, `codeOnly?`, `name?`, `label?`, `icon?`, `className?`), habillé par `.vtt-btn`. Message complet dans le `TabSession` (le MJ le transmet) ; `codeOnly` sur l'écran de fin de création (le joueur colle le code seul pour se reconnecter).

## Moteur de dés (`src/tools/diceEngine.js`)

Agnostique. Chaque `config.jsx` déclare les hooks :
- `buildNotation(ctx)` → chaîne ou tableau de notations, **un type de dé par chaîne** (F-ROLL). Appelé par le composant avant `roll()`, pas dans le moteur.
- `beforeRoll(ctx)` → ctx enrichi.
- `afterRoll(raw, ctx)` → résultat interprété (succès, critiques…).
- `buildAnimationSequence(raw, ctx, result)` → config d'animation.
- `renderHistoryEntry(entry)` → élément React ou `null`.
- Dés 2D (`spec_diceengine_v2.md` « Dés 2D et apparence ») : `dice.renderer: '2d'` dans `config.jsx` fait jouer `DiceOverlay2D` au lieu de la 3D (aiguillage dans `DiceAnimationOverlay`, 3D chargée à la demande). Apparence d'un dé = configuration au format de `diceConfigDefault.custom`, résolue champ par champ : `waves[n].colors[i]` > `groups[n].color` (objet) > `dice.byType` du slug > réglages du joueur (`tools/dice2d.js`). Brique `components/dice/Die2D.jsx` (props `type`, `value`, `config`) réutilisable par les rendus de jet ; habillage `.vtt-die2d*` à partir des variables `--die-*`, jamais de couleurs en dur.
- `raw.groups` correspond 1 pour 1 au tableau de notations : deux chaînes = deux groupes. Le moteur ne lit que le premier terme de dés d'une chaîne (`"1d8+1d10"` ne remonte que le d8 dans `values`).
- Historique (`spec_diceengine_v2.md`, « Passe générique ») : un jet enregistré exige `ctx.rollType` et `ctx.label` (sinon la route le refuse). Le moteur écrit lui-même `notation` et `raw_result` (brut de la bibliothèque) ; le slug range ce que son rendu lit dans `roll_result`, sans clé imposée. Une entrée sans dé passe par `recordHistoryEntry` (`tools/diceHistory.js`), jamais par un `POST /dice/roll` à la main. Rendu de secours commun : `components/layout/GenericRollEntry.jsx`. Types réservés : `PLATFORM_ROLL_TYPES` (`free_roll`).

## Sockets côté client

- Les mises à jour de personnage passent par HTTP (`onCharacterUpdate` → PUT avec debounce, `patchImmediate` → PUT/PATCH direct sans debounce). Les composants écoutent.
- Les emits d'infrastructure vivent dans `useGMSession`, `usePlayerSession`, `SessionContext`.
- **Dette connue, non prioritaire** : les ressources de session 2D20 / D6 (`<slug>:update-session-resources`) sont émises par socket depuis `dune/hooks/useSessionResources.js`, `dune/hooks/useDuneRoll.js`, `achtung/Sheet.jsx`, `achtung/gm/tabs/TabSession.jsx`, `achtung/dice/AchtungDiceModal.jsx`, `tecumah/components/gm/tabs/TabResource.jsx`, `tecumah/components/modals/TecumahDiceModal.jsx`. Ne refactore pas ce code sans demande ; pour du nouveau code, ne propage pas ce pattern sans m'en parler.
- L'écoute de `character-full-update` appartient à `useGMSession` / `GMPage`.

## React

- `fetchWithAuth` (`hooks/useFetch.js`) est stable d'un rendu à l'autre : il peut figurer dans un tableau de dépendances.
- Ne modélise pas dans l'app une mécanique gérée à la table ; n'automatise que le pénible.

## Stockage navigateur (`tools/browserStorage.js`)

Tout passe par `usePersistedState` / `readStored` / `writeStored` (F-STORAGE). Portées : `PLATFORM_SCOPE` (`'platform'`), `<slug>`, `tableScope(slug, table)`. Spec : `documentations/spec_browser_storage.md`.

## CSS / style

- Classes générées par `generate-css-utils.js` (`generated-css-utils.css`) : variantes `bg`/`text`/`border`/`ring`/`glow`/`placeholder`, états hover/focus/active/disabled/group-hover, opacités comme `bg-primary/10`. S'il manque une classe, on l'ajoute dans `theme.css`.
- Mode sombre : `data-theme` posé sur `<html>` par la plateforme (`applyTheme`).
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

- `tests/` reproduit l'arborescence de `src/` : le test de `src/systems/:slug/xxx.js` est `tests/systems/:slug/xxx.test.js`.
- Imports explicites (`import { describe, it, expect } from 'vitest'`), pas de globales.
- Importe depuis le module public (ex. `config.jsx` du slug), comme le fait le code applicatif.
- Fonctions pures uniquement ; l'environnement Node par défaut suffit (pas de jsdom).
- Les cas de test reprennent les exemples des specs validées dans `documentations/`.

## Fichiers volumineux

Avant de patcher un gros fichier souvent modifié à la main (ex. `Sheet.jsx`), présente le diagnostic et les corrections prévues, puis demande si des modifications manuelles non commitées existent.
