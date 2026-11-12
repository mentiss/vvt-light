# Spec — Refactoring DiceEngine v2

> **Statut** : Implémenté  
> **Périmètre** : `diceEngine.js` · `diceAnimBridge.js` · `DiceAnimationOverlay.jsx` · `DiceHistoryList.jsx` (onglet `DiceHistoryPage.jsx`, panneau `DiceHistoryPanel.jsx` ; `HistoryPanel.jsx` supprimé le 2026-11-01) · `config.dice` de chaque slug  
> **Objectif** : Moteur de dés véritablement générique, sans aucune connaissance des systèmes de jeu

---

## Principes directeurs

1. **Le moteur exécute, le slug décide.** Le moteur ne sait pas ce qu'est un succès, une complication, une ressource.
2. **Pas de defaults métier.** Aucune valeur par défaut liée à un système (pas de `d10`, pas de `threshold: 7`).
3. **Contrat de hooks clair et stable.** Un slug peut être implémenté sans lire le code du moteur.
4. **Persist et animation sont des responsabilités moteur.** Le slug ne fait jamais `POST /dice/roll` lui-même, n'instancie jamais `DiceAnimationOverlay` directement.
5. **`buildNotation` est appelé par le composant, pas par le moteur.** Le moteur reçoit la notation déjà construite.

---

## Étape 0 — Bridge animation (nouveau fichier)

### Problème

`roll()` est une fonction utilitaire (`diceEngine.js`) — elle ne peut pas `useState` ni rendre du JSX. Pourtant elle doit pouvoir déclencher l'animation et **attendre sa fin** avant de persister et rendre la main.

### Solution : `diceAnimBridge.js`

Un singleton léger (~20 lignes), zéro dépendance externe :

```js
// src/client/src/features/dice/tools/diceAnimBridge.js

let _resolve  = null;
let _listener = null;

export const diceAnimBridge = {
  /** Appelé par <DiceAnimationOverlay> au mount pour s'enregistrer */
  onPlay: (fn) => { _listener = fn; },

  /** Appelé par diceEngine — déclenche l'animation et attend sa fin */
  play: (seq) => new Promise((res) => {
    _resolve = res;
    _listener?.(seq);
  }),

  /** Appelé par <DiceAnimationOverlay> dans son onComplete */
  complete: () => {
    _resolve?.();
    _resolve = null;
  },
};
```

### Singleton `<DiceAnimationOverlay />`

Un seul overlay dans le DOM, monté dans `PlayerPage.jsx` et `GMPage.jsx` (racines de chaque surface). Il s'enregistre sur le bridge à son mount :

```jsx
// Dans DiceAnimationOverlay.jsx
useEffect(() => {
  diceAnimBridge.onPlay((seq) => setCurrentSequence(seq));
}, []);

// Dans le handler onComplete interne
const handleComplete = () => {
  setCurrentSequence(null);
  diceAnimBridge.complete();
};
```

**Aucun composant ne monte plus son propre overlay local.** Les props `animationSequence`, `sequences` (legacy) et `insuranceData` disparaissent — l'overlay ne répond qu'au bridge.

---

## Étape 1 — Contrat de `roll()`

### Signature

```js
await roll(notation, ctx, hooks)
```

`roll()` est **asynchrone** — elle attend la fin de l'animation avant de rendre la main. Le slug reçoit le résultat une seule fois, quand tout est terminé.

| Param | Type | Description |
|---|---|---|
| `notation` | `string \| string[]` | Notation(s) rpg-dice-roller construites par le slug. Une string = 1 groupe. Un tableau = N groupes, un `DiceRoll()` par entrée. |
| `ctx` | `object` | Contexte complet du jet — voir structure ci-dessous |
| `hooks` | `object` | Callbacks slug — voir catalogue ci-dessous |

### Structure de `ctx`

```js
{
    // ── Accès réseau (requis pour le persist) ─────────────────────────────
    apiBase:   string,          // ex: '/api/vikings'
    fetchFn:   Function,        // fetchWithAuth du slug

    // ── Métadonnées pour l'historique ─────────────────────────────────────
    characterId:    number | null,  // null = jet GM anonyme
    sessionId:      number | null,  // null = hors session
    characterName:  string | null,
    rollType:       string,         // obligatoire si enregistré : identifiant libre du slug
                                    // ex: 'vikings_skill', 'dune_2d20' ; jamais 'free_roll' (plateforme)
    label:          string,         // obligatoire si enregistré : libellé lisible (colonne label),
                                    // aussi libellé par défaut de l'animation
    persistHistory: boolean,        // défaut : true — voir section dédiée Étape 5

    // ── Données système opaques ───────────────────────────────────────────
    // Le moteur ne lit jamais ce champ — transmis tel quel aux hooks
    systemData: { /* libre */ },
}
```

### Catalogue des hooks

| Hook | Signature | Rôle | Obligatoire |
|---|---|---|---|
| `beforeRoll` | `(ctx) → ctx` | Validation, enrichissement. Peut lever `RollError`. | Non |
| `afterRoll` | `(raw, ctx) → result` | Interprétation complète des résultats bruts. | Non |
| `buildAnimationSequence` | `(raw, ctx, result) → AnimationSequence \| null` | Structure pour l'overlay. `null` = skip animation. | Non |
| `renderHistoryEntry` | `(entry) → JSX \| null` | Rendu dans l'historique. `null` = rendu générique. | Non |

> **`buildNotation` n'est PAS un hook moteur.** C'est une fonction déclarée dans `config.dice` du slug, appelée par le composant avant de passer la notation à `roll()`. Le moteur reçoit toujours une notation déjà construite.

---

## Étape 2 — Le raw

Sortie de l'exécution interne, entrée de `afterRoll`. **Aucune interprétation.**

### Distinction fondamentale : groupe vs vague

**Groupe** = unité sémantique définie par le slug dans la notation. Le slug décide combien il y en a et ce qu'ils signifient. Le moteur ne crée jamais de groupe supplémentaire — les explosions de dés n'ajoutent pas de groupe.

**Vague** = séquence mécanique à l'intérieur d'un groupe, générée par les explosions. Le moteur les calcule automatiquement. Elles n'existent que pour l'animation.

```
notation : ["3d10!>=9>=7", "3d10!>=10>=7"]
            └─ groupe 0 ─┘   └─ groupe 1 ─┘   ← définis par le slug

raw.groups[0]   ← jet principal  (sens donné par le slug)
  .notation = "3d10!>=9>=7"
  .values   = [9, 4, 10, 6]     ← faces de dés uniquement, explosions incluses, À PLAT
  .total    = 29                 ← total lib (idem ici, pas de modificateur arithmétique)
  .waves    = [
      { dice: [9, 4, 10] },     ← vague 0 : les 3 dés initiaux
      { dice: [6] },            ← vague 1 : explosion du 10 → 1 dé supplémentaire
  ]
```

**Règles :**
- Le nombre de groupes dans `raw` correspond **toujours** au nombre de termes dans la notation.
- `groups[i].values` contient **les faces de dés uniquement** (pas les modificateurs arithmétiques), explosions incluses. C'est ce que `afterRoll` utilise pour interpréter.
- `groups[i].total` contient le total lib (dés + modificateurs arithmétiques) — utile pour les systèmes D&D-like.
- `groups[i].waves` ne sert qu'à `buildAnimationSequence`.

### Modificateurs arithmétiques — règle d'extraction

`rpg-dice-roller` permet des notations mixtes comme `"2d6+3"` ou `"1d20+5"`. Le `+3` est un modificateur arithmétique — il contribue au total de la lib mais **n'est pas une face de dé**.

Règle : `_buildGroups()` n'extrait dans `values[]` et `waves[]` **que les objets `RollResult` correspondant à des dés réels** (pas les modificateurs). Le total arithmétique complet est disponible dans `groups[i].total`.

```
notation : "1d20+5"

raw.groups[0]
  .notation = "1d20+5"
  .values   = [10]    ← face du d20 uniquement
  .total    = 15      ← 10 (dé) + 5 (modificateur)
  .waves    = [{ dice: [10] }]

// Dans afterRoll d'un système D&D-like :
afterRoll: (raw, ctx) => ({
    total:    raw.groups[0].total,   // 15 — on utilise le total avec modificateur
    values:   raw.groups[0].values,  // [10] — la face brute si besoin
})
```

`allDice` reste la concat de tous les `groups[i].values` — uniquement des faces de dés, jamais de modificateurs.

### Structure complète

```js
raw = {
    groups: [
        {
            notation: string,   // terme exact passé à DiceRoll
            values:   number[], // faces de dés uniquement (modificateurs exclus)
            total:    number,   // total lib (dés + modificateurs arithmétiques)
            waves: [
                { dice: number[] },   // vague 0 : dés initiaux
                { dice: number[] },   // vague 1+ : explosions
            ],
        },
    ],
    allDice: number[],      // concat de tous les groups[i].values (faces de dés)
    flags: {
        exploded: number[], // valeurs ayant déclenché une explosion (tous groupes confondus)
    },
}
```

---

## Étape 3 — Comportements par défaut des hooks

| Hook | Comportement par défaut |
|---|---|
| `beforeRoll` | Passe `ctx` tel quel |
| `afterRoll` | Retourne `{ allDice, groups, flags }` — pas d'interprétation |
| `buildAnimationSequence` | Séquence simple : un groupe par `raw.groups`, `diceType` inféré depuis la notation, label depuis `ctx.label` |
| `renderHistoryEntry` | `null` → rendu générique |

### Inférence de `diceType`

Le `diceType` pour l'animation est extrait de la notation du groupe par regex — on cherche le premier `d<N>` ou `dF` :

```
"3d10!>=9>=7"  → "d10"
"2d20"         → "d20"
"1d20+5"       → "d20"   ← modificateur ignoré pour l'inférence
"4dF"          → "dF"
"2d6+1d8"      → "d6"    ← premier dé trouvé — non applicable : pour du mixed, passer diceType en notation complète (voir Étape 6bis)
```

> **Dés hétérogènes dans une animation unique — implémenté.**
> `dice-box-threejs` accepte nativement une notation composite comme `"1d100+1d10@40,5"` —
> le parser `DiceNotation` de la lib crée un `set[]` avec une entrée par type de dé,
> spawne les bons modèles 3D et applique les valeurs forcées (`@`) dans l'ordre du set.
>
> Pour déclencher ce comportement, il suffit de passer une **notation complète** dans le
> champ `diceType` du groupe d'animation, et de fournir les valeurs dans `waves[].dice`
> dans le même ordre que les types déclarés.
>
> `buildBoxNotation` dans l'overlay détecte automatiquement si `diceType` est une notation
> complète (contient `+` ou commence par un chiffre) et l'utilise telle quelle au lieu de
> préfixer le count :
>
> ```js
> // Mono-type (comportement historique inchangé)
> diceType: 'd10',  waves: [{ dice: [7, 3, 9] }]
> → "3d10@7,3,9"
>
> // Multi-type (nouveau)
> diceType: '1d100+1d10',  waves: [{ dice: [40, 5] }]
> → "1d100+1d10@40,5"
> ```

---

## Étape 4 — Double jet (avantage, fortune, assurance...)

`rollWithInsurance` n'existe plus. Les groupes rendent cette abstraction superflue.

### Pattern

```js
await roll(["3d10!>=9>=7", "3d10!>=9>=7"], ctx, hooks)
//          └─ jet 1 ──────┘  └─ jet 2 ──────┘
```

`afterRoll` compare les deux groupes et décide lequel garder :

```js
afterRoll: (raw, ctx) => {
    const successes1 = countSuccesses(raw.groups[0].values, ctx);
    const successes2 = countSuccesses(raw.groups[1].values, ctx);
    const keptGroup  = successes1 >= successes2 ? 0 : 1;
    return {
        successes: Math.max(successes1, successes2),
        keptGroup,
        detail: {
            successes1, successes2,
            values1: raw.groups[0].values,
            values2: raw.groups[1].values,
        },
    };
},
```

`buildAnimationSequence` reçoit `result` et peut mettre en valeur le jet gardé :

```js
buildAnimationSequence: (raw, ctx, result) => ({
    mode: 'single',
    groups: [
        {
            id: 'jet-1', diceType: 'd10',
            color: result.keptGroup === 0 ? 'fortune' : 'default',
            label: result.keptGroup === 0 ? '✅ Jet 1 — gardé' : 'Jet 1',
            waves: raw.groups[0].waves,
        },
        {
            id: 'jet-2', diceType: 'd10',
            color: result.keptGroup === 1 ? 'fortune' : 'default',
            label: result.keptGroup === 1 ? '✅ Jet 2 — gardé' : 'Jet 2',
            waves: raw.groups[1].waves,
        },
    ],
}),
```

---

## Étape 5 — Persist historique

### Timing

Après fin d'animation (ou immédiatement si `animationEnabled === false`). Jamais avant.

### Flag `persistHistory`

`ctx.persistHistory` contrôle si le jet est enregistré en base. **Défaut : `true`.**

| Valeur | Comportement |
|---|---|
| `true` (défaut) | `POST ${apiBase}/dice/roll` après animation |
| `false` | Aucun persist — le jet n'apparaît pas dans l'historique |

**Quand passer `false` :**
- Jets GM secrets (résultat non visible des joueurs)
- Jets de prévisualisation ou debug

**Tous les autres jets sont historisés par défaut**, y compris les jets de posture (`PostureModal`), les jets NPC (`NPCAttackModal`), les jets de compétence — le flag n'est à préciser qu'en cas d'exception.

```js
// Jet GM secret
const result = await roll(notation, { ...ctx, persistHistory: false }, hooks);

// Jet normal — persistHistory non précisé → true par défaut
const result = await roll(notation, ctx, hooks);
```

### Payload `POST ${ctx.apiBase}/dice/roll`

Construit par `recordHistoryEntry` (`features/dice/tools/diceHistory.js`), contrat complet dans « Passe générique : contrat » plus bas (2026-11-09) :

```js
{
    session_id:     ctx.sessionId,
    character_id:   ctx.characterId,
    character_name: ctx.characterName,  // diffusé, pas enregistré
    roll_type:      ctx.rollType,       // obligatoire
    label:          ctx.label,          // obligatoire
    notation:       notation,           // string ou JSON.stringify(array), moteur seul
    raw_result:     buildRawResult(raw.groups), // brut de la bibliothèque, moteur seul
    roll_result:    result,             // résultat du slug (afterRoll)
}
```

---

## Étape 6 — Animation

### Flux complet

```
roll(notation, ctx, hooks) appelé
  → hooks.beforeRoll(ctx)                      peut lever RollError
  → _executeGroups(notation)                   construit raw
  → hooks.afterRoll(raw, ctx)                  → result
  → hooks.buildAnimationSequence(raw, ctx, result)
      → null  → skip vers persist
      → AnimSeq, animationEnabled === false → skip vers persist
      → AnimSeq, animation activée → diceAnimBridge.play(seq) [await]
  → persist (si ctx.persistHistory !== false)
  → return result
```

### Format `AnimationSequence`

```js
{
    mode: 'single',
        groups: [
        {
            id:       string,
            diceType: string,
            // Deux formes possibles :
            //   Forme simple  : 'd10' | 'd20' | 'd6' | 'dF' | ...
            //                   → l'overlay préfixe le count : "3d10@7,3,9"
            //   Forme notation: '1d100+1d10' | '2d6+1d8' | ...
            //                   → l'overlay l'utilise telle quelle : "1d100+1d10@40,5"
            //                   Règle de détection : contient '+' OU commence par /^\d+d/

            color:    string | object,   // 'default' (ou autre chaîne : sans effet sur l'apparence)
                                         // | configuration d'apparence du groupe (voir « Dés 2D et apparence »)
            label:    string,
            waves:    [{ dice: number[], colors?: object[] }],   // colors : une configuration par dé, facultative
            // waves[i].dice doit lister les valeurs dans l'ORDRE des types déclarés
            // dans diceType. Exemple pour '1d100+1d10' :
            //   dice: [40, 5]   ← 40 pour le d100 (dizaines), 5 pour le d10 (unités)
        }
    ],
}
```

## Étape 6bis — Cas d'usage : animation d100 (percentile + unités)

### Contexte

Un jet de 1d100 implique physiquement deux dés distincts :
- un **d100** (percentile) qui affiche les dizaines : 00, 10, 20 … 90
- un **d10** qui affiche les unités : 0–9

La valeur calculée par le moteur est un entier entre 1 et 100.
L'animation doit afficher les deux dés simultanément avec les bonnes faces.

### Décomposition de la valeur

```js
const v     = raw.groups[0].values[0]; // ex: 45
const tens  = Math.floor(v / 10) * 10; // → 40  (face du d100)
const units = v % 10;                  // → 5   (face du d10)
// dice: [40, 5]  ← dans cet ordre, car diceType = '1d100+1d10'
```

⚠️ **Attention** : `raw.groups[0].values` est un **tableau**. Ne jamais appliquer
d'opérateurs arithmétiques directement dessus — JS fait une coercion implicite qui
"fonctionne" si le tableau a exactement un élément, mais plantera avec `NaN` dès qu'il
en a plusieurs. Toujours accéder à `raw.groups[0].values[0]`.

### Pattern complet dans `buildAnimationSequence`

```js
buildAnimationSequence: (raw, ctx, result) => {
    const { diceType } = ctx.systemData;
 
    if (diceType === 'd100') {
        const v = raw.groups[0].values[0];
        return {
            mode: 'single',
            groups: [{
                id:       'main',
                diceType: '1d100+1d10',
                label:    ctx.systemData.rollLabel ?? '',
                waves:    [{ dice: [Math.floor(v / 10) * 10, v % 10] }],
            }],
        };
    }
 
    // Cas standard mono-type
    return {
        mode: 'single',
        groups: [{
            id:       'main',
            diceType: diceType,
            label:    ctx.systemData.rollLabel ?? '',
            waves:    [{ dice: raw.groups[0].values }],
        }],
    };
},
```

### Ce qui a changé dans l'overlay (`DiceAnimationOverlay.jsx`)

```js
// buildBoxNotation — détecte si diceType est une notation complète
const buildBoxNotation = (diceValues, diceType) => {
    // Notation complète (ex: "1d100+1d10", "2d6+1d8")
    if (diceType.includes('+') || /^\d+d/.test(diceType)) {
        return `${diceType}@${diceValues.join(',')}`;
    }
    // Mono-type standard (ex: "d10", "d20", "dF")
    return `${diceValues.length}${diceType}@${diceValues.join(',')}`;
};
```

Aucun fork de `dice-box-threejs` n'est nécessaire. Le parser `DiceNotation` de la lib
supporte nativement les notations composites multi-type. Le blocage était uniquement dans
notre `buildBoxNotation` qui ne généraient que des notations mono-type.

---

## Jet libre (`free_roll`) dans les historiques *(2026-10-23)*

### Enregistrement

`FreeDiceModal` fournit son propre `afterRoll` : le résultat enregistré (`roll_result`) contient, en plus de `allDice`, `groups` et `flags`, le **total**, le **modificateur** et le **libellé** saisi. Avant le 2026-10-23, seuls les dés étaient enregistrés.

### Lecture : `features/dice/tools/freeRoll.js`

`parseFreeRoll(entry)` renvoie `{ label, total, modifier, groups: [{ notation, values, subtotal }] }`, ou `null` si l'entrée n'est pas un jet libre lisible. Les anciens jets restent lisibles : total recalculé à partir des dés, modificateur lu dans la notation du dernier groupe (« 1d8+3 »), libellé « Jet libre ». Test : `tests/tools/freeRoll.test.js`.

### Rendu : chaque slug, dans son style

- Le composant d'historique du slug traite le jet libre **en premier** (`parseFreeRoll`), puis ses propres jets.
- Le slug déclare son rendu **une fois** dans `config.jsx` : `dice.renderHistoryEntry` et `dice.renderAllRollTypes: true` (il rend aussi le jet libre). L'onglet Historique (`DiceHistoryPage`), le panneau (`DiceHistoryPanel`) s'il le monte et les notifications (`ToastNotifications`) le lisent ; ils ne reçoivent plus que `sessionId` (`spec_ui_actions.md` §6.4, 2026-11-01).
- Contenu : libellé et total en évidence, dés regroupés par type avec leur notation (« 2d6 »), modificateur s'il y en a un.
- **Rendu identique** dans l'historique et dans la notification : pas de mode resserré (`compact`), retiré de Fabula, Vikings et Zone Blanche le 2026-10-23 (décision du MJ).
- Le rendu générique de la plateforme reste le filet de sécurité, notamment pour **Noctis** (refonte à venir).

### Marges : portées par la plateforme

- La carte d'historique (`DiceHistoryList`, commune à l'onglet et au panneau) pose la marge intérieure via la classe habillable `vtt-history-entry` (`features/dice/history/history.css`) ; la notification a la sienne (`ToastShell`). Les cadres sont habillables par le slug, sans style en ligne : carte `vtt-history-card`, son bandeau nom / date `vtt-history-card-meta`, notification `vtt-toast` (`is-accent` pour un message mis en avant).
- Le rendu du slug (`dice.renderHistoryEntry`) **ne met aucune marge extérieure**. Seul un décor propre au slug garde un espacement interne au décor : bande teintée et filet gauche de Delta Green, bloc encadré `zb-history-entry` de Zone Blanche.

---

## Dés 2D et apparence des dés *(2026-11-06, spec_fabula.md §4)*

### Choix du rendu

`DiceAnimationOverlay` est un aiguillage, monté comme avant (une fois par page) :

| `config.jsx` du slug | Rendu |
|---|---|
| `dice.renderer: '2d'` | `features/dice/DiceOverlay2D.jsx` |
| absent ou `'3d'` (et hors slug) | `features/dice/DiceOverlay3D.jsx` (dice-box-threejs), chargé à la demande |

- Un slug en 2D ne charge pas la 3D. Tant que la configuration du slug n'est pas chargée, aucun rendu n'écoute : `diceAnimBridge.play()` rend alors la main sans animation (il ne bloque plus un jet sans rendu). Chaque rendu se désabonne du pont au démontage.
- `diceEngine.roll()`, le pont et les hooks des slugs ne changent pas. Les deux rendus suivent le même rythme (`DICE_TIMING`, `features/dice/tools/dice2d.js`) : groupes en séquence, vagues, éclair des explosions, résultat affiché avant de rendre la main, « Passer » à tout moment.
- 2D : chaque dé (`Die2D`) est jeté depuis un bord, ses chiffres défilent, puis il se pose sur sa valeur.

### Apparence d'un dé : une même notation pour la 2D et la 3D

Une configuration de dé, complète ou partielle, au format que lit déjà la 3D (`diceConfigDefault.custom`) : `foreground` (chiffre), `background` (corps), `outline` (contour du chiffre), `edge` (arête), `texture` (clé de la bibliothèque : `marble`, `wood`, `stars`…, images de `public/dice-assets/textures/`), `material` (`plastic`, `metal`, `glass`, `wood`, `none`).

Résolution **champ par champ** (`resolveDieConfig`, `features/dice/tools/dice2d.js`, testée) — la première valeur trouvée gagne :

1. le dé : `waves[n].colors[i]` ;
2. le groupe : `groups[n].color` (objet ; une chaîne comme `'default'` ou `'fortune'` ne fixe rien) ;
3. le type de dé, déclaré par le slug : `dice.byType: { d6: {…}, d8: {…} }` dans `config.jsx` ;
4. le joueur : « Réglages des dés » (un jeu nommé y est ramené aux couleurs de son aperçu).

Sans `colors`, `color` objet ni `byType`, rien ne change pour un slug.

### Règle d'habillage : la configuration donne les valeurs, le CSS le traitement

`Die2D` (`features/dice/Die2D.jsx`) pose sur le dé `--die-fg`, `--die-bg`, `--die-outline`, `--die-edge` et les attributs `data-type`, `data-material`. Le CSS de base (`features/dice/dice2d.css`, `.vtt-die2d*`, `.vtt-dice2d*`) dessine à partir de ces variables seulement : texture découpée à la forme du dé, matière en traitement de surface (plastique : reflet doux ; métal : reflet dur ; verre : translucide ; bois et aucune : mat). Un slug peut passer par la configuration (rendu valable en 2D et, plus tard, en 3D) et / ou styler en CSS (`.vtt-die2d[data-type="d8"]`, rendu propre à la 2D) ; ses effets reprennent les variables (lueur en `var(--die-edge)`), jamais des couleurs en dur. `Die2D` est réutilisable par les rendus de jet des slugs.

### Réglages des dés en 2D

Force, gravité, lumière et sons ne servent qu'à la 3D : masqués quand le slug est en 2D. Couleurs, texture et matière restent (elles s'appliquent à tout ce que le slug ne fixe pas).

### 3D d'ici la modification de la bibliothèque

La bibliothèque n'applique qu'un jeu de couleurs par lancer : la 3D garde une configuration pour tout le lancer, celle du joueur, sinon celle du slug, sinon celle de la plateforme. Colorer chaque dé en 3D est au backlog (modifier la bibliothèque, `patch-package`).

---

## Passe générique : historique des jets sans héritage Vikings *(phase 1, 2026-11-09)*

Décidée avec le MJ le 2026-11-09 : retirer du moteur, de la route `/dice/roll` et des composants communs ce qui n'est pas générique, migrer les données, mettre les slugs en conformité. Tout passe par `roll_result` (décisions H-1 à H-4 ci-dessous).

### Diagnostic (code et bases locales, 2026-11-09)

**Base** : `dice_history` (`base.sql`, recopiée dans les 14 `<slug>-schema.sql`) a 7 colonnes héritées de Vikings : `roll_target`, `pool`, `threshold`, `results`, `successes`, `saga_spent`, `saga_recovered`.

**Données locales** (lecture seule) :

| Slug | Jets | Sans `roll_result` | Anciennes colonnes remplies | `roll_definition` |
|---|---|---|---|---|
| vikings | 166 | **109** | 149 | 0 |
| dune | 36 | 0 | 0 | 2 |
| les 11 autres | 431 | 0 | 0 | 0 |

- Seul Vikings a des données hors de `roll_result` : 109 jets d'avant le 2026-03-05 n'existent que dans les anciennes colonnes (types `carac`, `combat`, `skill`). `VikingsHistoryEntry` les affiche en « Jet (ancien format) », sans dés.
- `roll_definition` n'est écrit par **personne** aujourd'hui : les 2 lignes de Dune viennent d'un ancien code. Seul `DuneHistoryEntry` le mentionne (commentaire).
- Chaque slug a sa propre forme de `roll_result` (ex. `successes` / `succes`, `detail` / `details`, `results` / `values` / `allDice`) : c'est le rendu du slug qui la lit.
- **Base de prod non vérifiée.**

**Écrivains** :
- Moteur (`diceEngine.js`, `_persistRoll`) : envoie encore `successes` et `pool` en plus de `roll_result`.
- Fabula : `FabulaDiceModal` (porte-bonheur) et `useGroupItemUse` (objet utilisé) postent `/dice/roll` en direct, avec `successes`.
- Vileborn : `useVilActions` (`postEvent`, Rêverie / Pulsion) poste en direct, avec `successes: 0, pool: 0` et `notation: '—'`.
- Ces trois envois sont des **événements sans dé** inscrits dans l'historique.

**Route** (`routes/dice.js`) : accepte deux formats (« générique » et « legacy Vikings »), écrit et rediffuse les 7 colonnes, parse `results` à la lecture.

**Lecteurs à corriger** :
- `ToastNotifications` : en-tête (`toast.roll_target`) et rendu de secours (`toast.successes`).
- `DiceHistoryList` (rendu de secours) : `result.results`, `result.succes` (lus dans `roll_result`, donc hors colonnes, mais propres à un slug).
- `features/dice/tools/freeRoll.js` : `entry.roll_target` en libellé de secours.
- `ZoneBlancheHistoryEntry` : `entry.roll_target`, toujours vide depuis mars.
- `VikingsHistoryEntry` : branche « ancien format », à supprimer après la migration.

**Hors de la passe mais liés** (backlog) : une notation à plusieurs types de dés (« 1d10+2d12 ») ne remonte que le premier groupe (`diceRoll.rolls[0]`, règle F-ROLL écrite en conséquence) ; une seule couleur par lancer en 3D.

**Lecteurs de `notation`** : seulement en libellé de secours, quand le slug n'en a pas mis dans `roll_result` (Delta Green, Dune, Fabula, Zone Blanche, rendu de secours `DiceHistoryList`). Aucun rendu n'en tire les dés ni les règles.

**Lecteurs de `roll_type`** : partout. La plateforme y reconnaît ses propres types (`PLATFORM_ROLL_TYPES`, jet libre `free_roll`) ; les rendus d'Achtung, Delta Green, Fabula, Maledictum, Nimble, Vileborn, Vampire et Zone Blanche choisissent leur affichage d'après lui.

### Décisions du MJ (2026-11-09)

Une ligne d'historique sert le rendu par `roll_result`, et par lui seul. `roll_definition` n'a pas lieu d'être : la notation dit déjà ce qui a été lancé.

| # | Règle |
|---|---|
| H-1 | **`roll_result` est l'espace du slug.** Il y range tout ce que son rendu doit savoir, dans la forme qu'il veut, qu'il s'agisse d'un jet ou d'autre chose (événement, objet utilisé…). |
| H-2 | **`notation` est exactement ce que le moteur passe à la bibliothèque de dés** : la chaîne (`2d20`, `3d10!>=10>=4`), ou le tableau de chaînes enregistré en JSON (`["1d8","1d10"]`). Elle est écrite par le moteur, jamais par le slug. Une entrée sans dé n'en a pas (`NULL`) : plus de `porte-bonheur`, `objet` ni `—`. |
| H-3 | **Colonnes de `dice_history`** : les essentiels (`id`, `character_id`, `session_id`, `created_at`), `roll_type`, `label`, `notation`, `roll_result`. Supprimées : `roll_definition`, `roll_target`, `pool`, `threshold`, `results`, `successes`, `saga_spent`, `saga_recovered`. |
| H-4 | **`label` (nouvelle colonne) est le libellé lisible de l'entrée** (« Combat CàC (armé) », « Rêverie »). Le slug le donne, la plateforme l'écrit : `ctx.label` pour un jet (le moteur l'écrit), paramètre du helper pour une entrée sans dé (DE-3). Obligatoire pour une nouvelle entrée, comme `roll_type`. La plateforme le lit pour l'en-tête des notifications et le rendu de secours, à la place de la recherche actuelle (`toast.label` jamais présent, `roll_target` vide : l'en-tête affiche aujourd'hui `roll_type` brut, ex. « vikings_skill »). Le slug reste libre d'avoir son propre libellé dans `roll_result` (H-1) : aucune clé n'y est imposée. |

Le partage qui en découle : la plateforme range ce qu'elle doit connaître (qui, quand, `roll_type`, `label`, `notation`), le slug range le reste dans `roll_result`.

DE-1 et DE-2 (contenu et remplissage de `roll_definition`) sont sans objet.

### Questions

| # | Question | Options | Reco | Réponse                                                                              |
|---|---|---|---|--------------------------------------------------------------------------------------|
| DE-1 | ~~Que contient `roll_definition` ?~~ | | | Sans objet : colonne supprimée (H-3)                                                 |
| DE-2 | ~~Qui remplit `roll_definition` dans les jets existants ?~~ | | | Sans objet (H-3)                                                                     |
| DE-3 | Les entrées sans dé (porte-bonheur et objet de Fabula, Rêverie / Pulsion de Vileborn) postent `/dice/roll` en direct | a) un petit helper de la plateforme (`tools/`) qui écrit une entrée d'historique, utilisé aussi par `_persistRoll` ; b) les faire passer par `roll()` sans dé ; c) les laisser poster en direct, juste nettoyées | **a** : un seul endroit construit le payload, `roll()` reste un lanceur de dés | oui reco                                                                             |
| DE-4 | Règle de `roll_type` : obligatoire (la route refuse une entrée sans lui) ; type de la plateforme sans préfixe (`free_roll`), type d'un slug préfixé `<slug>_`. Le moteur ne met plus `generic` par défaut : un jet sans `ctx.rollType` n'est pas enregistré et le signale en console. | oui / non | **oui** : c'est l'aiguillage de tous les rendus, un jet sans type est un jet que personne ne sait afficher. Les 47 lignes `generic` existantes restent telles quelles : Delta Green 30 (toutes du 2026-04-17, appels corrigés depuis), Noctis 17 (attend sa refonte) | ok, voir question format ci-après                                                    |
| DE-10 | Garder aussi le résultat brut de la bibliothèque (valeurs par groupe et par vague, explosions), écrit par le moteur dans une colonne à lui, à côté de `notation` | a) oui ; b) non, pas tant que rien ne le lit | **b** : chaque slug range déjà ses dés dans `roll_result` (`allDice`, `values`, `results`…) et aucun lecteur n'attend ce brut ; une colonne ajoutée plus tard ne coûte qu'une migration, seuls les jets d'avant n'en auraient pas. À reprendre si un rendu commun de la plateforme (secours, statistiques) voit le jour | oui on garde le résultat brut                                                        |
| DE-11 | `label` des entrées existantes (la colonne est nouvelle) | a) migration : recopier `roll_result.label` quand il existe (10 slugs sur 13 l'ont dans leurs données), sinon laisser `NULL` ; l'affichage retombe alors sur `roll_type` ; b) a + un libellé déduit de `roll_type` par slug, écrit dans la migration | **a** : on reprend ce qui a été saisi, sans inventer ; les entrées sans libellé sont anciennes et le rendu du slug porte de toute façon son titre | oui                                                                                  |
| DE-5 | Migration Vikings : les 109 jets sans `roll_result` | a) reconstruire `roll_result` (`allDice`, `successes`, `detail` avec `pool`, `threshold`, `rollTarget`, `meta` avec `resourceSpent` / `resourceGained`) ; seuils d'explosion laissés vides et `notation` laissée `NULL` (le seuil d'explosion n'a jamais été enregistré, la notation exacte ne se reconstruit pas) ; b) les supprimer | **a** : c'est l'historique de la table | oui reco, on reconstruit                                                             |
| DE-6 | Anciens types Vikings `carac`, `combat`, `skill` (sans préfixe, 149 lignes) | a) les renommer en `vikings_carac`, `vikings_combat`, `vikings_skill` dans la migration ; b) les laisser | **a** : avec la règle DE-4, c'est un `UPDATE` sans risque (`VikingsHistoryEntry` ne lit pas `roll_type`) et la base devient conforme | oui, à voir pour le format si c'est pas plutôt slug:type ?                           |
| DE-7 | Notation à plusieurs types de dés (« 1d10+2d12 ») | dans la passe / hors passe | **hors passe** : sans `roll_definition`, plus de lien avec l'historique ; F-ROLL interdit déjà ce cas, il reste au backlog | ok                                                                                   |
| DE-8 | Couleur par dé en 3D (modifier la bibliothèque) | dans la passe / hors passe | **hors passe** : sujet d'animation, sans lien avec l'historique | ok                                                                                   |
| DE-9 | Base de prod : je compte en lecture seule les jets par slug sur le VPS (même requête qu'en local) avant la spec | oui / non | **oui** : la migration Vikings et la suppression des colonnes doivent tenir sur les vraies données | non, les bases en dév sont toutes ou presque déjà des copies de la PROD donc inutile |

**Format de `roll_type` (DE-4 et DE-6, tranché le 2026-11-09)** : option c. Chaque slug a sa base, deux slugs ne peuvent donc pas entrer en collision ; aucun préfixe n'est imposé. La seule contrainte : un slug ne prend pas un type réservé par la plateforme (`free_roll` aujourd'hui), exception connue des slugs. Les types existants restent tels quels (`dg_skill`, `vda_pool`, `carac`… compris) : DE-6 n'a plus lieu d'être. `roll_type` reste obligatoire.

---

## Passe générique : contrat *(phase 2, 2026-11-09 ; implémenté le 2026-11-09)*

Écarts de l'implémentation : la migration 1 vide aussi les notations de remplissage des anciennes entrées sans dé (`porte-bonheur`, `objet`, `—`) ; les libellés de secours des rendus qui lisaient la notation (Delta Green, Dune, Fabula, Zone Blanche) lisent `label`. Le rendu de secours commun est `features/dice/history/GenericRollEntry.jsx`.

### Table `dice_history`

| Colonne | Écrite par | Contenu |
|---|---|---|
| `id`, `character_id`, `session_id`, `created_at` | route | inchangés |
| `roll_type` | slug (`ctx.rollType`, ou paramètre du helper) | obligatoire ; libre, hors types réservés de la plateforme |
| `label` | slug (`ctx.label`, ou paramètre du helper) | **nouvelle**, obligatoire : libellé lisible de l'entrée (H-4) |
| `notation` | moteur seul | ce que le moteur passe à la bibliothèque : la chaîne, ou le tableau en JSON ; `NULL` sans dé (H-2) |
| `raw_result` | moteur seul | **nouvelle** : résultat brut de la bibliothèque (ci-dessous) ; `NULL` sans dé |
| `roll_result` | slug | forme libre (H-1) |

Supprimées : `roll_definition`, `roll_target`, `pool`, `threshold`, `results`, `successes`, `saga_spent`, `saga_recovered`. `notation` perd partout son `NOT NULL` (encore présent dans les bases Cyberpunk et Noctis).

**`raw_result`** (JSON) : un élément par notation, dans l'ordre du tableau passé au moteur.
```json
{ "groups": [
    { "notation": "3d10!>=10>=4", "total": 3,
      "dice": [ { "value": 10, "modifiers": ["explode", "target-success"] },
                { "value": 4,  "modifiers": ["target-success"] },
                { "value": 2,  "modifiers": [] } ] }
] }
```
`total` et `modifiers` sont ceux de la bibliothèque, recopiés sans interprétation (`modifiers` passe d'un `Set` à un tableau). Le moteur ne lit que le premier terme de dés d'une notation (F-ROLL) : `raw_result` aussi.

### Route `POST /api/:slug/dice/roll`

- Corps : `roll_type`, `label`, `roll_result` (objet ou chaîne JSON) obligatoires ; `character_id`, `character_name`, `session_id`, `notation`, `raw_result` facultatifs. Un champ obligatoire manquant : **400**. Un ancien champ (`successes`, `pool`…) est ignoré.
- `character_name` n'est pas enregistré : il sert à la diffusion, comme aujourd'hui.
- Diffusion `dice-roll` à la room de la table (inchangé) et réponse 201 : `{ id, character_id, character_name, session_id, roll_type, label, notation, raw_result, roll_result, created_at }`, les deux JSON parsés.
- `GET /history` et `GET /history/:characterId` renvoient les mêmes champs (`raw_result` et `roll_result` parsés). Les suppressions ne changent pas.

### Côté client

- **Helper `features/dice/tools/diceHistory.js`** : `recordHistoryEntry(fetchFn, apiBase, { sessionId, characterId, characterName, rollType, label, result, notation?, raw? })`, seul constructeur du corps envoyé. Il exporte aussi `PLATFORM_ROLL_TYPES` (`['free_roll']`), aujourd'hui recopié dans `ToastNotifications` et `DiceHistoryList`.
- **Moteur** : `_persistRoll` passe par le helper avec `ctx.rollType`, `ctx.label`, la notation et le brut. Plus de défaut `generic`, plus de `successes` ni de `pool`. Le contrat de `ctx` gagne deux champs obligatoires dès que le jet est enregistré : `rollType` et `label`. Un jet qui ne les a pas est refusé par la route ; le moteur le signale en console sans bloquer le jet (comme aujourd'hui pour un échec d'enregistrement).
- **Entrées sans dé** (Fabula : porte-bonheur, objet utilisé ; Vileborn : Rêverie, Pulsion) : appel au helper, sans `notation` ni `raw`.
- **Chaque appel à `roll()` des slugs** passe `rollType` et `label`. Inventaire et correction en phase 3, appel par appel.
- **Rendu de secours commun** (`DiceHistoryList` et `ToastNotifications`, aujourd'hui deux versions) : un seul composant. Il affiche les dés de `raw_result` groupe par groupe et `roll_result.total` s'il est un nombre ; rien d'autre n'est lu dans `roll_result`.
- **En-tête des notifications** : `label`, sinon `roll_type`, sinon « Jet ».
- **Lecteurs corrigés** : `features/dice/tools/freeRoll.js` (libellé : `label`, puis `roll_result.label`, puis « Jet libre » ; plus de `roll_target`), `ZoneBlancheHistoryEntry` (`label` au lieu de `roll_target`), `VikingsHistoryEntry` (branche « ancien format » supprimée ; « explosion … » masqué quand les seuils sont inconnus), commentaire de `DuneHistoryEntry` (`roll_definition`).

### Migrations (ordre garanti par le nom)

| Fichier | `systems` | Contenu |
|---|---|---|
| `<date>_1_dice_history_label_raw.sql` | `all` | ajoute `label` et `raw_result` ; `label` recopié de `roll_result.label` quand c'est un texte (DE-11) |
| `<date>_2_vikings_dice_history.sql` | `vikings` | reconstruit les 109 jets sans `roll_result` (DE-5, ci-dessous) |
| `<date>_3_dice_history_drop_legacy.sql` | `all` | supprime les 8 colonnes (`DROP COLUMN`, aucune n'est indexée) |
| `<date>_4_dice_history_notation_nullable.sql` | `cyberpunk` | reconstruit la table sans le `NOT NULL` de `notation` (création, copie, échange), clés `ON DELETE SET NULL` gardées (écart B-FK documenté) et index recréés |

Schémas : mêmes changements dans `base.sql` et les 14 copies `<slug>-schema.sql` (`NOT NULL` retiré de `cyberpunk-schema.sql`).

**Reconstruction Vikings (DE-5)** : 109 jets du 2026-01-28 au 2026-03-05 (`carac` 63, `combat` 29, `skill` 17), tous avec dés, seuil et nombre de dés. Pour chacun :
- `roll_result` = `{ allDice: results, successes, detail: { pool, threshold, rollTarget: roll_target, explosionThresholds: [] }, meta: { resourceSpent: saga_spent, resourceGained: saga_recovered } }` ;
- `label` = `roll_target` (« Jet MJ », nom de la compétence…), ce qui avait été saisi ;
- `notation` et `raw_result` restent `NULL` : les seuils d'explosion n'ont jamais été enregistrés, la notation exacte ne se reconstruit pas.
- Les 40 jets récents qui ont déjà un `roll_result` ne sont pas touchés (leurs anciennes colonnes partent avec la migration 3).

### Tests

- `tests/server/routes/dice.test.js` : 400 sans `roll_type`, sans `label` ou sans `roll_result` ; une entrée sans `notation` est acceptée ; la réponse et la diffusion portent `label` et `raw_result`.
- `tests/server/systems/schemas.test.js` : inchangé (il compare les tables partagées aux schémas).
- Front : `tests/tools/freeRoll.test.js` mis à jour (libellé lu dans `label`) ; un test de la fonction pure qui construit `raw_result` à partir de la bibliothèque.

### Question restante

| # | Question | Options | Reco | Réponse |
|---|---|---|---|---|
| DE-12 | Noctis (hors périmètre jusqu'à sa refonte) n'envoie ni `rollType` ni `label` : avec la nouvelle route, ses jets ne seraient plus enregistrés | a) ajouter `rollType` et `label` à son appel à `roll()`, sans rien toucher d'autre ; b) laisser la route tolérer une entrée sans eux | **a** : deux champs dans un appel, pour qu'il continue de marcher ; ce n'est pas une correction de Noctis, et le contrat reste strict pour tous | Noctis hors périmètre : aucun code Noctis touché. Sa base suit les migrations `all` (même structure que les autres, son `NOT NULL` sur `notation` reste, sans gêne puisqu'il envoie toujours une notation). Conséquence assumée : ses jets sont refusés par la route (400) jusqu'à sa refonte |
