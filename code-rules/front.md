# Grille front

Règles du code client : `src/client/`. Mode d'emploi (niveaux, exceptions, contrôles) : `code-rules/common.md`. Contexte, contrats des composants génériques et moteur de dés : `src/client/CLAUDE.md`.

Le contrôle `lint` désigne une règle ESLint nommée par l'identifiant (`vtt/F-SHRINK`…) dans `src/client/eslint.config.js`. Les fichiers existants en écart y sont listés en exceptions (`LEGACY`) : on retire un fichier de la liste quand on le touche et qu'on le met d'aplomb.

## Choix assumés (pas des écarts)

- La visibilité des informations MJ est filtrée côté client : c'est voulu.
- Les pages de création appellent `fetch` en direct pour les routes publiques (`POST /characters`).
- Les ressources de session 2D20 / D6 émises par socket depuis `dune`, `achtung` et `tecumah` (`<slug>:update-session-resources`) sont une dette connue : on ne la refactore pas sans demande, on ne la propage pas.

## Règles

### React

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-LAZY | Règle | `React.lazy()` est appelé hors du corps des composants (niveau module ou pattern `lazyCache`). | Sinon le composant est recréé à chaque rendu : boucle de remontage. | relecture |
| F-SUBCOMP | Règle | Les sous-composants sont définis au niveau module, jamais dans une fonction de rendu. | Sinon ils sont remontés à chaque rendu et perdent leur état. | relecture |
| F-KEY | Règle | Pas de clé React dérivée d'un index quand l'élément a un identifiant stable. | Ajout, suppression ou tri décalent l'état des lignes. | relecture |
| F-STORAGE | Règle | Jamais `localStorage` / `sessionStorage` en direct hors `tools/browserStorage.js` : `usePersistedState(scope, name, options)` dans React, `readStored` / `writeStored` / `removeStored` ailleurs. Clés par `storageKey` (`vtt:<portée>:<fonction>`), un objet par fonction ; options de `usePersistedState` en constantes du module ; reprise d'une ancienne clé dans `tools/browserStorageMigration.js`. Spec : `spec_browser_storage.md`. | Clés rangées par portée, versions et reprises, synchro entre composants et onglets, `try/catch` (navigation privée, stockage plein). | lint |
| F-HOOKS | Préférence | La logique réutilisable va dans un hook ; une logique recopiée dans plusieurs slugs est proposée comme brique de la plateforme. | Une copie ne reçoit pas les correctifs. | relecture |
| F-HASH | Préférence | L'onglet courant est gardé par `useHashTab(TABS, défaut)`, pas par `window.location.hash` à la main. | Même comportement partout, sans code recopié. | relecture |

### Sockets et données

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-HTTP-UPDATE | Règle | Une fiche se modifie par HTTP (`onCharacterUpdate` avec debounce, `patchImmediate` en direct), jamais par socket. Le serveur diffuse, les composants écoutent. | Une seule voie d'écriture, contrôlée par les droits du serveur. | relecture |
| F-FETCH | Règle | Les appels à l'API passent par `fetchWithAuth` (`hooks/useFetch.js`), hors routes publiques de création et de connexion. | Jeton, rafraîchissement et préfixe du slug y sont gérés. | relecture |
| F-SOCK-INFRA | Règle | Les emits d'infrastructure (`join-session`, `leave-session`, `character-loaded`, `character-left`, `gm-set-active-session`, `gm-clear-session`) restent dans les hooks et contextes génériques (`useGMSession`, `usePlayerSession`, `SessionContext`). | Un second émetteur désynchronise présence et rooms. | lint |
| F-SOCK-EMIT | Règle | Un slug n'émet pas vers le serveur. Tout nouvel emit de slug se discute d'abord, et porte le préfixe `<slug>:`. | Les écritures passent par HTTP ; un emit de slug court-circuite droits et diffusion. | lint |
| F-SOCK-LISTEN | Règle | `character-full-update` n'est écouté que par `useGMSession` / `GMPage` ; un `TabSession` de slug n'écoute que `session-resources-gm-update`. Un slug n'écoute qu'un événement que le serveur émet vraiment. | Écoute en double, ou écouteur mort qui fait croire à une mise à jour. | relecture |
| F-SOCK-OFF | Règle | Chaque `socket.on` a son `socket.off` dans le cleanup de l'effet ; de même pour les écouteurs `window` et les timers. | Sinon l'écouteur survit au démontage et s'empile. | relecture |

### Dés

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-ROLL | Règle | `roll()` renvoie le résultat d'`afterRoll()`, jamais l'objet brut. `buildNotation` est appelé par le composant avant `roll()`, pas par le moteur. **Un seul type de dé par notation** : plusieurs types forment un tableau de notations, un groupe chacune (`["1d8", "1d10"]`, pas `"1d8+1d10"`). Une explosion crée une vague dans son groupe, jamais un nouveau groupe. | Le moteur ne lit que le premier terme d'une notation ; un objet brut renvoyé a causé des bugs persistants. | relecture |
| F-HISTORY | Règle | Une entrée d'historique passe par le moteur (`roll()` avec `ctx.rollType` et `ctx.label`) ou, sans dé, par `recordHistoryEntry` (`tools/diceHistory.js`) : jamais de `POST /dice/roll` à la main. Le slug n'écrit pas la notation, ne prend pas un type de `PLATFORM_ROLL_TYPES` et range ce que son rendu lit dans `roll_result`. | Un seul constructeur de l'entrée ; `notation` et `raw_result` restent fiables pour la plateforme (`spec_diceengine_v2.md`, H-1 à H-4). | relecture |
| F-ROLL-RENDER | Règle | Le rendu d'un jet est déclaré une fois dans le `config.jsx` du slug (`dice.renderHistoryEntry`, et `dice.renderAllRollTypes` s'il rend aussi le jet libre) ; le même rendu sert l'historique et les notifications, sans marge extérieure. | Un jet s'affiche pareil partout ; la marge est portée par la plateforme. | relecture |

### Pages, briques et contrats

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-SLUG-LINK | Règle | Un lien qui change de slug ou mène à l'accueil est un `<a href>`, jamais `navigate()` / `<Link>`. | Une page = un slug : un `theme.css` chargé n'est jamais retiré. | relecture |
| F-SLUG-STRUCT | Règle | Un slug a `config.jsx` (`default { slug, label, dice, diceConfigDefault }`), `Sheet.jsx`, `GMApp.jsx` (contenu MJ directement, pas d'indirection vers `gm/GMView.jsx`), `Creation.jsx`, `gm/tabs/TabSession.jsx`. | Tous les slugs se lisent de la même façon. | relecture |
| F-BRICKS | Règle | Les briques de la plateforme sont utilisées, pas recopiées : `Modal` / `HostedModal`, `DiceHistoryPage` / `DiceHistoryPanel`, `ToastNotifications`, `HamburgerMenu`, `TableManagementButton`, `CopyAccessButton`, `ReferenceGuide`, `Board` / `BoardSessionToggle`, `FloatingPanel`, `Die2D`, `Tooltip`, `ExpandableText`… Une version maison se justifie en commentaire. | Une copie ne reçoit ni les correctifs ni l'habillage. | relecture |
| F-CONTRACT | Règle | Les props passées à un composant générique correspondent à sa signature réelle, lue dans la source : pas de prop inventée, pas de prop ignorée. | Un contrat deviné casse en silence. | relecture |
| F-GAME-ACTIONS | Règle | Les actions de jeu (équiper, attaquer, lancer les dés, sentiments de liens…) restent actives quel que soit le mode Édition ; seule l'édition de texte libre y est soumise. | Le mode Édition sert aux corrections, pas à jouer. | relecture |

### CSS et thème

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-THEME | Règle | Le mode nuit passe par l'attribut `data-theme`, posé par la plateforme sur `<html>` : jamais de classe `.dark`, de variante `dark:`, ni de `data-theme` reposé sur une page. Variables jour sur `:root`, nuit sur `[data-theme="dark"]`. | `dark:` ne suit pas le bouton jour / nuit de l'app : avec `darkMode: 'class'` (`tailwind.config.js`) il attend une classe `.dark` que la plateforme ne pose jamais, il reste donc inerte. | lint (`.dark` en relecture) |
| F-THEME-IMPORT | Règle | `theme.css` n'est jamais importé par un fichier du slug : la page le charge. | Import inutile, qui fait croire que la fiche porte son thème. | lint |
| F-TOKENS | Règle | Couleurs par les classes générées par `generate-css-utils.js` (tokens `primary`, `secondary`, `accent`, `danger`, `success`, `surface`, `surface-alt`, `default`, `muted`, variantes et opacités) : pas d'alias `xxx-base` (utiliser `xxx-default`), pas de couleur Tailwind en dur (`bg-gray-800`) dans la plateforme, pas de classe d'un slug (`viking-*`) hors de ce slug, pas d'hexadécimal hors `theme.css` et configuration de dés. | Chaque slug habille la plateforme par ses tokens. | lint (`bg-`/`border-`/`ring-base`, `viking-`) ; relecture (reste) |
| F-SHRINK | Règle | Tailwind v4 : `shrink-0`, pas `flex-shrink-0`. | Ancienne syntaxe. | lint |
| F-STYLE | Préférence | `style=` est réservé aux valeurs réellement dynamiques ou en px fixes ; une classe manquante s'ajoute dans `theme.css`. | Le thème ne peut pas habiller un style en ligne. | relecture |
| F-CONTROLS | Préférence | Boutons « pill » plutôt que `<select>` et cases à cocher natives. Un contrôle natif est accepté s'il sert mieux l'ergonomie, justifié en commentaire. | Les contrôles natifs ne s'habillent pas par le thème. | lint (avertissement) |

Retirée à la validation (principe, pas une règle du code) : F-TABLE-MECH. Retirée par ce ticket : « jamais `fetchWithAuth` dans un tableau de dépendances » (`fetchWithAuth` est désormais stable).
