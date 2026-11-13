# Performance du chargement

Chantier issu du relevé Lighthouse du 2026-11-12 (prod, `/vikings/gm`) : premier affichage 0,9 s, page remplie vers 3 à 3,5 s. Ce document couvre le **lot 1** (feuille commune : couleurs par Tailwind au lieu du générateur) et le **lot 3** (`preconnect` des polices). Les autres pistes du backlog restent à diagnostiquer.

Statut : validée le 2026-11-13 (Q-1 à Q-4 : recommandations retenues). Lots 1 et 3 implémentés le 2026-11-13.

---

## 1. Décisions

| # | Décision |
|---|---|
| D-1 | Lot 1 et lot 3 dans le même chantier ; le lot 2 (chargement à la demande) suit, avec sa propre mesure. |
| D-2 | Aucune classe de couleur produite d'avance : Tailwind ne produit que celles trouvées dans le code. |
| D-3 | Noctis hors périmètre : l'écart de ses séparateurs (§4.3) est accepté sans vérification de plus. |
| D-4 | Mesure Lighthouse refaite en prod après la release, sur la même page, pour comparer au relevé du 2026-11-12. |

---

## 2. Constat

| Mesure (build de prod du 2026-11-13) | Valeur |
|---|---|
| Feuille commune (`index-*.css`), sur toutes les pages | 2,28 Mo décompressée, 128 Ko gzip |
| Part venant de `app/styles/generated-css-utils.css` | ≈ 2,1 Mo |
| Règles écrites par le générateur | 10 870 |
| Classes de cette famille réellement utilisées dans le code | 89 (aucun nom construit à la volée, `bg-${…}`) |
| Plus lourdes : `.group:hover .group-hover\:…` et `.group:focus …` | 255 Ko chacune |

Le coût n'est pas tant le téléchargement (128 Ko compressés) que le travail du navigateur : lire 10 870 règles, et réévaluer les sélecteurs descendants `.group:hover …` à chaque survol, focus ou changement du DOM.

Le reste de la feuille est sain : briques `vtt-*` ≈ 86 Ko, utilitaires Tailwind produits à la demande. Les `theme.css` des slugs sont déjà découpés et chargés avec leur slug.

**Pourquoi le générateur existait** : Tailwind ne crée une couleur que si elle a une valeur dans `@theme`, or la valeur réelle n'existe que dans le `theme.css` du slug, chargé plus tard. Une couleur déclarée sans valeur (`initial`) ne produit aucune classe. Le déblocage est au §3.

---

## 3. Lot 1 : couleurs de la plateforme par Tailwind

### 3.1 Principe

La couleur est déclarée à Tailwind avec une valeur repère, dans un `@theme reference` : rien n'est écrit dans `:root`, et la classe produite pointe la variable :

```css
.hover\:bg-primary\/10:hover {
  background-color: color-mix(in oklab, var(--color-primary, #000) 10%, transparent);
}
```

La valeur vient toujours du `theme.css` du slug, jour comme nuit, thèmes par personnage compris (Maledictum, Vikings). Le repère `#000` ne sert que si aucun slug ne définit la variable.

### 3.2 Correspondances (reprises du générateur, à l'identique)

| Nom de classe | Fond (`bg-`) | Texte (`text-`) | Bordure (`border-`, `divide-`, `outline-`) |
|---|---|---|---|
| `primary`, `secondary`, `accent`, `danger`, `success`, `surface`, `surface-alt` | `--color-<nom>` | `--color-<nom>` | `--color-<nom>` |
| `default`, `base` | `--color-bg` | `--color-text` | `--color-border` |
| `muted` | — | `--color-text-muted` | — |

États (`hover:`, `focus:`, `active:`, `disabled:`, `group-hover:`, `group-focus:`) et opacités (`/5` à `/100`) : fournis par Tailwind, pour toutes les classes, à la demande.

### 3.3 Fichiers

| Fichier | Changement |
|---|---|
| `src/client/src/app/styles/tokens.css` | **Nouveau** (≈ 70 lignes) : `@theme reference` (couleurs, et noms `default` / `base` / `muted` par propriété : `--background-color-*`, `--text-color-*`, `--border-color-*`), `@utility text-base`, `glow-*` (tailles en `@theme inline reference`, une `@utility` par couleur) |
| `src/client/src/app/styles/index.css` | `@import './generated-css-utils.css'` remplacé par `@import './tokens.css'` (même place) |
| `src/client/src/app/styles/generated-css-utils.css` | Supprimé |
| `src/client/scripts/generate-css-utils.js` | Supprimé |
| `src/client/index.html` | Lot 3 (§5) |
| `src/client/eslint.config.js` | Commentaire qui cite le script (l. 110) |
| `src/client/CLAUDE.md` | Section « CSS / style » : `tokens.css` au lieu du générateur |
| `code-rules/front.md` | F-TOKENS : « classes déclarées dans `app/styles/tokens.css` » au lieu de « générées par `generate-css-utils.js` » ; la règle elle-même ne change pas |
| `documentations/process/spec_arborescence_client.md` | Liste du contenu de `app/styles/` |
| `documentations/backlog.md` | Ligne « CSS commune » du chantier |

Pas de test Vitest : aucune règle de calcul ni contrat de route (C-TEST).

### 3.4 Pièges trouvés à l'essai

| Piège | Traitement |
|---|---|
| `text-base` est aussi la taille de police de Tailwind (1rem). Déclaré comme couleur dans `@theme`, il **perd sa taille** (22 éléments, surtout Delta Green). | `@utility text-base { color: var(--color-text); }` : les deux règles coexistent, comme aujourd'hui. |
| `bg-muted`, `border-muted`, `hover:border-muted` sont dans le code mais **n'existent pas** dans le générateur (`muted` réservé au texte) : sans effet aujourd'hui. | `muted` déclaré pour le texte seulement : ces classes restent sans effet, le rendu ne change pas. |
| Le générateur écrit `divide-color: …`, **propriété CSS qui n'existe pas** : `divide-default` ne fait rien aujourd'hui (séparateurs à la couleur du texte). | Tailwind l'applique : séparateurs à la couleur de bordure. Correction acceptée (§4.3). |
| `glow-*` (`drop-shadow` coloré) n'existe pas dans Tailwind, et le nom mêle couleur et taille (`glow-primary-xs`), que `--value()` ne sait pas découper. | Q-1 : les 13 tailles déclarées une fois (`--glow-size-*`), une `@utility glow-<couleur>-*` par couleur (9 avec `default` et `base`), `glow-*` pour la taille par défaut (4px). Une `@utility` non utilisée ne produit rien. |
| `ring-primary` seul dessinait l'anneau (largeur 3 px comprise) ; Tailwind demande aussi `ring` ou `ring-2`. | Aucun usage aujourd'hui : rien à faire. |

---

## 4. Vérification (faite le 2026-11-13, sur un fichier d'essai)

### 4.1 Méthode

Serveurs de dev, Edge sans interface piloté par CDP. Sur chaque écran : **styles calculés de chaque élément** (couleurs normalisées, bordures, filtre, taille de police), puis les mêmes en survol forcé sur les éléments à classes `hover:` / `group-hover:`. Relevé A avec la feuille actuelle, bascule de l'import, relevé B, comparaison. Les captures d'écran servent de contrôle seulement : elles diffèrent toujours à cause du contenu vivant (runes au hasard de Vikings, engrenage de Noctis, horloge de Zone Blanche, ordre des boutons de la zone d'actions).

### 4.2 Résultats

| Passage | Écrans | Éléments | Écarts |
|---|---|---|---|
| Jour : accueil, création et interface MJ (table active, tous les onglets) des 13 slugs | 88 | 33 433 | 12 valeurs sur 3 éléments, page MJ de Noctis (§4.3) |
| Jour + nuit : Delta Green, fiche joueur (Dossier agent, Journal, Historique) et MJ (Agents, Journal, Tableau, Historique) | 14 | 5 752 | aucun |

- Contrôle du relevé de nuit : entre 540 et 620 éléments par écran changent de couleur entre jour et nuit (dont 78 à 253 portant une classe de couleur), et B les rend comme A.
- Opacités : aucune différence. Tailwind mélange en `oklab`, le générateur en `srgb`, mais un mélange avec `transparent` ne change que l'opacité.
- Changement de couche : les classes passent de « hors couche » à `@layer utilities`, sous les `theme.css` des slugs. Aucun effet relevé.
- Non couverts : états `focus:`, `active:`, `disabled:` (même mécanisme que le survol, non forcés), fiches joueur des autres slugs (seul personnage de dev : Delta Green).

### 4.3 Écart accepté

Séparateurs `divide-default` de Noctis (`SpecialtiesCard`) et de `GMSendModal` : couleur du texte aujourd'hui (défaut du générateur, §3.4), couleur de bordure demandée par le code après le chantier.

### 4.4 Gain

| Feuille commune (build de prod) | Avant | Après |
|---|---|---|
| Décompressée | 2,28 Mo | 145 Ko |
| gzip | 128 Ko | 24 Ko |

### 4.5 À l'implémentation

Prévu : relevés rejoués sur le code final. Fait autrement le 2026-11-13 : le build final produit une feuille commune **identique à l'octet** à celle du build d'essai vérifié (même empreinte `index-BL0AyHsh.css`, 145 139 octets), malgré la réécriture de `glow-*` ; relevés non rejoués. Lint (0 erreur), tests (735) et build verts.

---

## 5. Lot 3 : `preconnect` des polices

Les polices des slugs arrivent par `@import url('https://fonts.googleapis.com/…')` dans leurs feuilles : le navigateur ne découvre la connexion qu'une fois la feuille du slug lue, puis enchaîne la feuille de Google et les fichiers de police (chaîne en série, ≈ 200 ms selon Lighthouse).

Dans `src/client/index.html`, avant la feuille `/fonts/fonts.css` :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

Les connexions s'ouvrent dès le HTML, en parallèle du reste. Aucun autre changement.

---

## 6. Questions

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q-1 | `glow-*` : 5 classes utilisées aujourd'hui (`glow-primary-3xs`, `-xs`, `-sm`, `glow-secondary-xs`, `glow-accent-md`). Les déclarer une par une, ou toutes les combinaisons ? | **Toutes les combinaisons.** Une `@utility` non utilisée ne produit rien dans la feuille : un slug qui pose `glow-danger-lg` demain n'a rien à ajouter, comme aujourd'hui. Écrites en une règle par couleur (§3.4), pas une ligne par combinaison. | Oui |
| Q-2 | Nom du nouveau fichier : `tokens.css` ? | **Oui** : c'est le vocabulaire de la règle F-TOKENS. | Oui |
| Q-3 | `planche_tables.html` (plateforme, locale) pointe vers `generated-css-utils.css` ; les deux UI kits de la plateforme pointent déjà vers un chemin disparu depuis l'arborescence. Que faire des planches ? | **Rien** : planches validées et codées, qui ne servent plus de référence. Une prochaine planche qui veut les couleurs copie les règles utiles dans un `<style>`, comme l'UI kit Vikings. | Oui |
| Q-4 | Relecture croisée Codex à la fin ? | **Non** : diff petit, déjà vérifié élément par élément ; pas de quoi justifier le coût en quota. | Oui |
