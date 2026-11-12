# Demandes d'images pour Codex — slug Imperium Maledictum

> **Statut (2026-11-06)** : 17 / 17 générées par `codex exec` (commande `/codex-image`), aucune
> relance. Toutes en PNG (pas de SVG) ; textures et marque converties en WebP. Fichiers allégés dans
> `images/` (planche), originaux pleine résolution dans `originaux/`. Crâne à rouage et sceau de
> pureté sortis en couleur : utilisés comme images, sans teinte par le thème.

Images à générer pour remplacer les ornements dessinés à la main dans la planche
(`planche_themes.html`). Elles seront déposées dans `src/client/public/systems/maledictum/`
(nom de fichier indiqué) puis teintées par le thème quand c'est possible.

Deux familles :
- **Ornements** : silhouettes **monochromes** (noir pur sur fond **transparent**), pour être
  colorées en CSS par chaque thème (masque). SVG si Codex sait le faire, sinon PNG transparent
  1024 px de large.
- **Textures** : images en couleur, **raccordables** (tileable) sans couture visible, PNG ou WebP
  1024 × 1024, légères (elles passent derrière du texte : contraste faible).

Style commun : gothique impérial de Warhammer 40 000 (néo-gothique, cathédrale, grimdark), gravure
ou ferronnerie, traits nets, **aucun texte lisible, aucun logo officiel de Games Workshop** (pas de
reproduction exacte de l'Aquila officielle ni du sceau de l'Inquisition : une création dans l'esprit).

## Ornements communs (base « gothique impérial »)

| Fichier | Demande (en anglais pour Codex) |
|---|---|
| `aquila.svg` | Stylised double-headed imperial eagle, wings fully spread horizontally, two heads looking outward, small skull at the chest, gothic engraving style, flat black silhouette on transparent background, symmetrical, wide format 5:2, no text |
| `skull.svg` | Front-facing human skull icon, gothic grimdark style, flat black silhouette with eye sockets and nose cut out, transparent background, square, readable at 16 px |
| `winged-skull.svg` | Skull with two short swept feathered wings, gothic imperial style, flat black silhouette, transparent background, wide format 3:1 |
| `purity-seal.png` | Purity seal: round red wax seal with irregular edges and an embossed skull, two torn parchment strips hanging below covered with tiny illegible scripture lines, isolated on transparent background, top view, realistic but clean, vertical format 1:2 |
| `corner.svg` | Gothic cathedral corner ornament (tracery with a small skull), for the corner of a frame, flat black silhouette, transparent background, square |
| `arch-frame.svg` | Pointed gothic arch frame (ogive) for a portrait, thin double outline with small tracery at the apex, flat black lines, transparent inside and outside, vertical format 4:5 |
| `banner.svg` | Medieval scroll banner (phylactery) with forked ends, flat black silhouette, transparent background, wide format 6:1 |

## Ordo Hereticus

| Fichier | Demande |
|---|---|
| `hereticus-sigil.svg` | Inquisitorial "I" sigil: a tall capital I with three horizontal bars and a small skull at its centre, gothic metalwork style, flat black silhouette, transparent background — an original design, not the official logo |
| `hereticus-vellum.webp` | Seamless tileable texture of aged vellum parchment, warm ivory, subtle stains and fibres, very low contrast, no text, no folds |
| `hereticus-vellum-night.webp` | Same vellum parchment texture lit by candlelight, very dark brown almost black, warm faint glow, very low contrast, seamless tileable |

## Adepta Sororitas

| Fichier | Demande |
|---|---|
| `sororitas-fleur.svg` | Ornate fleur-de-lys, gothic and martial, flat black silhouette, transparent background, square |
| `sororitas-glass.webp` | Seamless tileable texture of a gothic stained-glass window: deep crimson, royal blue and gold glass pieces in black lead lines, diamond pattern, slightly glowing, darkened so white text stays readable on top |
| `sororitas-marble.webp` | Seamless tileable texture of polished white marble with very faint grey veins, very low contrast, for a light background |

## Adeptus Mechanicus

| Fichier | Demande |
|---|---|
| `mechanicus-cogskull.svg` | Half-skull inside a cog wheel: left half bone, right half circuitry and machinery, gothic industrial style, flat black silhouette, transparent background, square — an original design, not the official logo |
| `mechanicus-plate.webp` | Seamless tileable texture of worn brass and iron plate with rivets and scratches, dark, low contrast |
| `mechanicus-screen.webp` | Seamless tileable texture of an old green phosphor cogitator screen: faint scanlines, slight noise, very dark green, no text |

## Marque (carte d'accueil)

| Fichier | Demande |
|---|---|
| `brand-cathedral.webp` | Dark gothic cathedral interior at night seen from the nave, candles and red light through a rose window, a huge imperial eagle carved above the altar, grimdark Warhammer 40k atmosphere, empty centre for a title, 3:2, no text |

## Deuxième série (2026-11-06, itération 3) — 11 / 11 générées

Toutes en silhouette noire sur fond transparent, teintées par le thème. Prompts exacts dans le lot
lancé par `/codex-image` (même style que ci-dessus).

| Fichier | Usage dans la planche |
|---|---|
| `servo-skull.png` | Crâne-serviteur qui flotte en haut à droite de la fiche |
| `rosette.png` | Emblème du Patron (Inquisiteur), icône « Interface MJ » du menu |
| `chained-tome.png` | Filigrane du bloc Talents |
| `candles.png` | Cierges de part et d'autre du portrait |
| `rosary-divider.png` | Séparateur (chapelet de crânes) |
| `spires.png` | Silhouette de la ruche au bas de la bande |
| `laurel.png` | Supériorité (bande) et XP disponible |
| `creed-icon.png` | Emblème Sororitas (filigrane de l'identité) |
| `brazier.png` | Emblème Ordo Hereticus (filigrane de l'identité) |
| `mechadendrite.png` | Emblème Mechanicus (filigrane de l'identité) |
| `censer.png` | Encensoir qui se balance en haut à gauche de la fiche |

## Troisième série (2026-11-06, itération 4) — neuf thèmes, 36 / 36 générées

Par thème : `<clé>-sigil.png` (sigle du rôle de faction, au sommet de l'ogive, pastilles de Destin),
`<clé>-emblem.png` (filigrane de l'identité), `<clé>-day.webp` et `<clé>-night.webp` (textures ;
la nuit sert aussi, assombrie, de fond à la bande). Clés : `malleus`, `xenos`, `ecclesiarchy`,
`militarum`, `administratum`, `telepathica`, `navy`, `roguetrader`, `underhive`.

Une relance : `malleus-emblem` (la première version reposait sur une étoile à six branches,
connotation religieuse évitée) → cercle de protection à anneaux de runes, épée et crâne.
