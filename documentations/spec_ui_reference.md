# Brique « Aide de jeu » (référence des règles)

> Statut : **validée** (2026-11-03). Issue du lot 4 de Vampire (spec_woddavampire.md §II.15, E-5) : la mécanique de l'onglet Référence de Fabula (spec_fabula_reference.md §5) devient une brique de la plateforme ; chaque slug garde son contenu et son habillage.

## 1. Besoin

Un onglet de consultation des règles, côté joueur et côté MJ, avec un sommaire, des sections repliables et une recherche plein texte. Aujourd'hui seul Fabula l'a, codé dans le slug ; Vampire en a besoin à son tour, avec beaucoup plus de contenu (tables de règles et catalogues).

## 2. Ce que fait la brique, ce que fait le slug

| La brique (plateforme) | Le slug |
|---|---|
| Sommaire, sections repliables (fermées par défaut), clic sur le sommaire = ouverture et défilement | Le contenu : fichiers Markdown et / ou sections en données |
| Conversion du Markdown en sections (`markdownToSections`) | Le choix et l'ordre des fichiers |
| Recherche **insensible à la casse et aux accents** (« frenesie » trouve « Frénésie », et inversement) : seuls les blocs trouvés restent, avec leur intertitre ; un titre de section trouvé garde la section entière | Le texte d'exemple du champ de recherche |
| Visibilité : ce qui est réservé au MJ ou au joueur est masqué de l'autre côté (recherche comprise) ; badge « MJ » côté MJ | Les marqueurs de visibilité dans le contenu |
| Rendu des blocs standard : intertitre, texte, liste, tableau | Les blocs propres au slug (ex. calculateur de projet de Fabula) |
| Classes `vtt-reference-*` avec un style par défaut | L'habillage, dans son `theme.css` |

Aucune base, aucune route, aucun événement socket : contenu statique côté client. La visibilité se filtre côté client (choix assumé du projet : les règles sont de toute façon dans le livre).

## 3. Contenu en Markdown

Un fichier = une section. Le slug range ses fichiers dans un dossier (ex. `config/reference/`), préfixés pour l'ordre (`01-jets.md`, `02-combat.md`…), et les charge tous (`import.meta.glob(…, { query: '?raw', eager: true })`).

| Markdown | Devient |
|---|---|
| `# Titre` (première ligne de titre) | Titre de la section |
| `## Intertitre` (et niveaux inférieurs) | Intertitre |
| Paragraphe | Texte |
| Liste `-` ou `1.` | Liste |
| Tableau Markdown | Tableau (première ligne = colonnes) |
| `**gras**`, `*italique*` | Gras, italique dans le texte, les listes et les cellules |

**Visibilité** (par défaut : tout le monde) :

```markdown
---
visibility: gm
---
# Conteur
…
<!-- player -->
Passage que seuls les joueurs voient.
<!-- /player -->
<!-- gm -->
## Conseils au Conteur
Passage que seul le MJ voit, intertitre compris.
<!-- /gm -->
```

- En tête de fichier, `visibility: gm` ou `visibility: player` vaut pour toute la section.
- Dans le fichier, `<!-- gm -->` … `<!-- /gm -->` ou `<!-- player -->` … `<!-- /player -->` encadrent un ou plusieurs blocs.
- `mj` est accepté comme synonyme de `gm`.

## 4. Contrat

Composant `src/client/src/components/reference/ReferenceGuide.jsx` ; conversion dans `src/client/src/tools/reference.js` (fonctions pures, testées).

| Prop | Type | Rôle |
|---|---|---|
| `sections` | `[{ id, title, visibility?, blocks }]` | Contenu, dans l'ordre d'affichage |
| `isGM` | `boolean` | Interface MJ : montre les contenus `gm`, masque les contenus `player` (et inversement) |
| `renderBlock` | `(block) => ReactNode \| undefined` | Facultatif : rendu des blocs propres au slug ; `undefined` = rendu standard |
| `placeholder` | `string` | Facultatif : texte d'exemple du champ de recherche |

`markdownToSections(files)` : `files` = `[{ name, text }]`, triés par nom ; renvoie les sections (id tiré du nom de fichier).

Blocs :

| Bloc | Forme | Champs cherchés |
|---|---|---|
| Intertitre | `{ type: 'heading', text }` | (contexte des blocs qui suivent) |
| Texte | `{ type: 'text', text }` | `text` |
| Liste | `{ type: 'list', items: [string] }` | `items` |
| Tableau | `{ type: 'table', columns: [string], rows: [[string]] }` | `columns`, `rows` |
| Bloc du slug | `{ type: '<autre>', keywords?, … }` | `keywords` |

Tout bloc et toute section peuvent porter `visibility: 'gm' | 'player'` (masqué de l'autre côté). Une section peut aussi porter `gm: true` : simple badge « MJ », visible de tous (comportement de Fabula, R-3).

## 5. Habillage

Classes : `vtt-reference` (conteneur), `vtt-reference-nav`, `vtt-reference-nav-item`, `vtt-reference-search`, `vtt-reference-empty`, `vtt-reference-section`, `vtt-reference-section-head`, `vtt-reference-section-title`, `vtt-reference-badge`, `vtt-reference-body`, `vtt-reference-heading`, `vtt-reference-text`, `vtt-reference-list`, `vtt-reference-table`. Style par défaut dans `index.css` (tokens du thème), surchargeable par le slug.

## 6. Reprise de Fabula

Fabula garde son contenu en données (`config/reference.js`) et passe par la brique, avec un `renderBlock` pour `projectTables` et `projectCalculator`. Son rendu actuel passe dans son `theme.css` : **aucun changement visible**. Le passage de son contenu au Markdown reste possible plus tard.

## 7. Hors périmètre

État ouvert / fermé mémorisé, liens profonds vers une section, filtrage selon le personnage.
