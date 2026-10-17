# CLAUDE.md — Frontend (src/client)

Règles React / CSS. Complète le CLAUDE.md racine.

## Routing et chargement

- Entrée : `src/main.jsx` → `AppRouter.jsx`.
- `/:system` → `SystemLayout` (valide le slug auprès du backend) → `PlayerPage` / `GMPage` / `CreationPage`.
- `useSystem()` lit le param `:system` et le valide via `/api/systems` ; `getSystemFromPath()` est la version hors React.
- `systems/:slug/config.jsx` exporte `default { slug, label, dice, combat, diceConfigDefault }`.

## Composants génériques : ne jamais deviner leurs contrats

Avant d'écrire un composant qui reçoit des props de la plateforme, **ouvre la source** et reprends les noms et formes exacts des props. Concerne notamment : `PlayerPage`, `GMPage`, `CreationPage`, `diceEngine.js`, le système de toasts/notifications, `SessionPlayersBar`, `CharacterListModal`, `TabJournal`, `DiceHistoryPage`.

- `DiceHistoryPage` (et non `DiceHistoryTab`) : seules props `sessionId` et `renderHistoryEntry`. Import depuis `src/components/layout/DiceHistoryPage.jsx`.
- `SessionPlayersBar` vit aussi dans `src/components/layout/`.

## Moteur de dés (`src/tools/diceEngine.js`)

Agnostique. Chaque `config.jsx` déclare les hooks :
- `buildNotation(ctx)` → chaîne ou tableau de notations. **Appelé par le composant avant `roll()`**, pas dans le moteur.
- `beforeRoll(ctx)` → ctx enrichi.
- `afterRoll(raw, ctx)` → résultat interprété (succès, critiques…).
- `buildAnimationSequence(raw, ctx, result)` → config d'animation.
- `renderHistoryEntry(entry)` → élément React ou `null`.

Règles :
- **`roll()` renvoie directement le résultat de `afterRoll()`**, jamais l'objet brut. Le non-respect provoque des bugs persistants.
- `raw.groups` correspond 1 pour 1 au tableau de notations : deux chaînes = deux groupes ; `"1d8+1d10"` = un groupe.
- Les explosions créent des **vagues** d'animation à l'intérieur du groupe parent, jamais de nouveaux groupes.

## Sockets côté client

- **Les mises à jour de personnage passent par HTTP** (`onCharacterUpdate` → PUT, `patchImmediate` → PUT/PATCH direct). Les composants n'émettent pas de socket pour modifier une fiche ; ils écoutent.
- Les emits d'infrastructure (`join-session`, `leave-session`, `character-loaded`, `character-left`, `gm-set-active-session`, `gm-clear-session`) vivent dans les hooks et contextes génériques (`useGMSession`, `usePlayerSession`, `SessionContext`). Ne les réémets pas depuis un slug.
- **Dette connue, non prioritaire** : les ressources de session 2D20 / D6 (`update-session-resources`) sont émises par socket depuis des composants de `dune`, `achtung`, `tecumah` (`SessionResourcesBar`, `TabResource`, `Sheet.jsx` de dune). Ne refactore pas ce code sans demande. Pour du nouveau code, ne propage pas ce pattern sans m'en parler.
- L'écoute de `character-full-update` appartient à `useGMSession` / `GMPage` (générique), pas à un `TabSession` de slug. Un `TabSession` ne déclare que `session-resources-gm-update`.
- Nettoie chaque listener au démontage (`socket.off` dans le cleanup de l'effet).

## React : pièges connus

- `fetchWithAuth` ne doit **jamais** apparaître dans un tableau de dépendances `useCallback`/`useEffect` (référence instable).
- `React.lazy()` est appelé **hors du corps des composants** (pattern `lazyCache`), sinon boucle de remontage.
- Les sous-composants sont définis **au niveau module**, jamais dans une fonction de rendu.
- Logique réutilisable → hooks personnalisés.
- Pas de clé React dérivée d'un index quand un identifiant stable existe.
- `patchImmediate` déclenche un PUT direct sans debounce ; les autres modifications passent par le debounce.
- Les actions de jeu (équiper, attaquer, lancer les dés, sentiments de liens…) restent **toujours actives**, quel que soit le mode édition. Seule l'édition de texte libre est soumise au mode édition.
- Ne modélise pas dans l'app une mécanique gérée à la table.

## CSS / style

- Utilise **uniquement les classes générées par `generate-css-utils.js`** (tokens `primary`, `secondary`, `accent`, `danger`, `success`, `surface`, `surface-alt`, `default`, `muted` ; variantes `bg`/`text`/`border`/`ring`/`glow`/`placeholder`, états hover/focus/active/disabled/group-hover, opacités comme `bg-primary/10`).
- `style=` est réservé aux valeurs réellement dynamiques ou en px fixes. S'il manque une classe, on l'ajoute dans `theme.css`, on ne contourne pas avec `style=`.
- Tokens `xxx-default` (`bg-default`, `text-default`…). `xxx-base` est un alias legacy à ne pas utiliser.
- Mode sombre via l'attribut **`data-theme`**, jamais une classe `.dark`.
- `theme.css` est chargé au niveau page (`import.meta.glob` dans `PlayerPage`/`GMPage`), pas importé dans `Sheet.jsx`.
- **Pas de `<select>` ni de `<input type="checkbox">`** : boutons « pill » stylés.
- Tailwind v4 : `shrink-0` et non `flex-shrink-0`.

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