# Spec — Générateur de Plans de Bâtiments

> Version 1.0 — Spécifications fonctionnelles  
> Statut : **Prêt pour prototypage**  
> Dernière mise à jour : octobre 2026

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Concepts fondamentaux](#2-concepts-fondamentaux)
3. [Paramètres globaux](#3-paramètres-globaux)
4. [Interface utilisateur](#4-interface-utilisateur)
5. [Presets initiaux](#5-presets-initiaux)
6. [Comportement de génération](#6-comportement-de-génération)
7. [Sortie visuelle](#7-sortie-visuelle)
8. [Contraintes techniques structurantes](#8-contraintes-techniques-structurantes)
9. [Hors scope v1](#9-hors-scope-v1)

---

## 1. Vue d'ensemble

Outil **autonome** de génération de plans de bâtiments intérieurs sur grille, hébergé comme une page de la plateforme VTT accessible sans connexion.

L'utilisateur compose un **programme architectural** à partir de types de pièces, définit des paramètres globaux, et obtient un plan exportable en SVG/PNG. L'outil est fonctionnellement indépendant du VTT — aucune base de données, aucune authentification, aucun Socket. Une éventuelle intégration dans le VTT (lien avec une partie, une battlemap) est possible ultérieurement mais hors scope ici.

### Objectif principal

Permettre à un GM de générer un plan de bâtiment utilisable à table en moins de 5 minutes, sans prise en main d'un logiciel dédié, sans assets à importer, sans prompt LLM à affiner.

### Stack cible

- Page de la plateforme VTT (React + Vite, TailwindCSS), sans connexion
- Moteur de génération en JavaScript pur, sans React, testé sous Vitest
- Génération algorithmique pure — déterministe à graine fixée
- Sortie SVG générée en JavaScript pur
- Export PNG via `canvas` natif

---

## 2. Concepts fondamentaux

### 2.1 Le programme

Le programme est la **liste ordonnée des pièces** qui doivent composer le bâtiment. C'est l'input principal de la génération. Deux bâtiments différents se distinguent par leur programme, pas par une "typologie" rigide.

### 2.2 Le type de pièce

Unité de base du programme. Chaque type de pièce porte les propriétés suivantes :

| Propriété | Type | Description |
|---|---|---|
| `id` | string | Identifiant stable du type (ex : `"kitchen"`), utilisé par les règles de voisinage |
| `label` | string | Nom affiché sur le plan (ex : "Cuisine", "Grande salle") |
| `sizeMin` | number | Taille minimale en cases (surface) |
| `sizeMax` | number | Taille maximale en cases (surface). Peut être dépassée de 25 % au plus pour absorber un reste qui ne desservirait rien (§19, D-1) |
| `ratioMin` | number | Ratio largeur/hauteur minimum acceptable (ex : 0.5) |
| `ratioMax` | number | Ratio largeur/hauteur maximum acceptable (ex : 2.0) |
| `structural` | boolean | Si `true` : pièce qui porte la structure générale du bâtiment (cour intérieure, ascenseur…). Posée en premier, empreinte réservée à tous les étages concernés. C'est elle qui garantit la cohérence des plans sur plusieurs étages |
| `outsideAccess` | enum | Accès à l'extérieur (§23) : `"required"` (la pièce touche le mur extérieur et reçoit une porte dehors : entrée, quai, écurie… ; la façade est tirée par la graine), `"optional"` (porte de service possible, avec la probabilité `serviceDoorChance`, si la pièce touche un mur extérieur : cellier, cuisine…), `"forbidden"` |
| `circulation` | boolean | Si `true` : pièce ouverte, qui fait partie de la circulation (entrée, hall, salle commune traversante). Ni mur ni porte entre elle et le couloir ou une autre pièce ouverte (simple pointillé sur le plan) ; les pièces fermées y ouvrent comme sur un couloir |
| `circulationAccess` | enum | Accès à la circulation (couloir, pièce ouverte) (§21, §23) : `"required"` (la pièce y donne toujours directement, jamais par une autre pièce ; son niveau reçoit un couloir quelle que soit la densité : chambre, salle d'eau commune), `"optional"` (cas général), `"forbidden"` (jamais : cellier, annexes) |
| `access` | objet | Accès vers d'autres pièces (§23) : `required` (la pièce ouvre sur une pièce de l'un de ces types et se pose contre elle : cellier → cuisine, salle d'eau attenante → chambre), `optional` (elle peut ouvrir sur ces types : salle d'eau attenante → 2ᵉ chambre), `forbidden` (jamais de porte vers ces types, voisines possibles derrière un mur plein : cellier → salle commune, chambre → chambre). Une pièce qui déclare des types `required` ou `optional` n'ouvre que vers eux ; sans liste, elle ouvre vers toute pièce non interdite |
| `noTransit` | boolean | Si `true` : la pièce n'a qu'une porte vers une autre pièce et ne sert jamais de passage (§20.1, T2-1) ; la porte vers une annexe ne compte pas. Ex. : cellier, réserve, chambre |
| `canShrink` | boolean | Si `true` : la pièce peut céder des cases à une de ses annexes, tant qu'elle garde au moins la moitié de sa plage de taille (§32). Vrai pour les pièces de vie de 9 cases ou plus ; faux pour l'entrée, les pièces ouvertes, les annexes et les petites pièces de service |
| `priority` | boolean | Si `true` : pièce prioritaire, placée juste après les structurants et avant les couloirs, qui la relient comme un structurant (ex. salle commune, cœur du plan) |
| `outdoor` | boolean | Si `true` : pièce à ciel ouvert (cour). Rendu hachuré, emprise laissée vide aux étages supérieurs |
| `floor` | string | Étage cible : `"any"`, `"ground"`, `"upper"`, `"basement"`, ou `"N"` (numéro explicite). Un étage explicite est imposé par l'utilisateur ; pour `"any"` et `"upper"`, l'étage est tiré par la graine. Dans tous les cas, la répartition respecte les pièces structurantes |
| `quantity` | number \| [min, max] | Nombre d'exemplaires requis dans le programme |
| `mustBeAdjacentTo` | string[] | Identifiants des types de pièces auxquels cette pièce doit être adjacente (l'interface affiche leurs libellés) |
| `cannotBeAdjacentTo` | string[] | Identifiants des types de pièces dont cette pièce doit être séparée (l'interface affiche leurs libellés) |

> **Note UI :** Les règles de voisinage (`mustBeAdjacentTo`, `cannotBeAdjacentTo`) sont portées par le type de pièce et appliquées silencieusement par l'algorithme. Elles ne sont pas exposées dans l'interface principale — elles font partie des métadonnées du type et peuvent être consultées/modifiées dans un panneau avancé si besoin.

### 2.3 Le lien vertical

Un lien vertical n'est **pas une pièce** — c'est un connecteur entre deux étages spécifiques. Il représente un escalier, une trappe, ou tout accès inter-niveaux.

| Propriété | Type | Description |
|---|---|---|
| `label` | string | Nom affiché (ex : "Escalier principal", "Trappe cave") |
| `floorFrom` | string | Étage source (ex : `"ground"`, `"basement"`) |
| `floorTo` | string | Étage destination |
| `sizeInCells` | number | Surface de l'empreinte en cases (ex : 6, soit 2×3). La forme est choisie par l'algorithme |

Un lien vertical est **toujours structurant** : il est posé en premier, au même endroit sur les deux étages qu'il relie. Son empreinte est **réservée simultanément** sur les deux étages concernés. Les pièces fonctionnelles ne peuvent pas occuper ces cases.

Un bâtiment peut contenir plusieurs liens verticaux (escalier principal + escalier de service + trappe cave). Ils peuvent connecter des étages différents et ne sont pas contraints d'être au même endroit.

### 2.4 Le preset

Un preset est un **programme prédéfini et modifiable**. Il pré-remplit la liste de pièces, les liens verticaux et les paramètres globaux avec des valeurs raisonnables pour un contexte courant.

Un preset est toujours un point de départ — l'utilisateur peut modifier, supprimer ou ajouter des pièces librement après sélection. Ce n'est pas une contrainte rigide.

En option (§18), un preset porte aussi :
- un **réservoir de pièces de complément** (`optionalRooms`, quantités en plage) dans lequel la graine pioche quand le bâtiment est plus grand que ce que les pièces obligatoires peuvent occuper ;
- un **schéma de circulation** (`layout: { schemes, width }`) : couloir traversant (`spine`), galerie (`gallery`) ou enfilade (`enfilade`), tiré par la graine parmi la liste, avec la largeur du couloir.

### 2.5 La graine

Un entier utilisé pour initialiser le générateur pseudo-aléatoire. À programme et paramètres globaux identiques, la même graine produit toujours le même plan. Elle est affichée après chaque génération réussie pour permettre sa réutilisation.

---

## 3. Paramètres globaux

| Paramètre | Type | Description |
|---|---|---|
| `width` | number | Largeur de l'enveloppe en cases |
| `length` | number | Longueur de l'enveloppe en cases |
| `floors` | number | Nombre d'étages au-dessus du RDC (0 = RDC seul) |
| `basement` | boolean | Présence d'un sous-sol |
| `density` | enum | `"dense"` (par défaut : pas de couloir, circulation par les pièces ouvertes et en enfilade) / `"balanced"` (couloir de largeur 1, seulement là où une desserte manque) / `"spacious"` (couloir de largeur 2, mêmes règles) |
| `corridorMaxWidth` | number | Largeur maximale d'un couloir ou dégagement, en cases (1 à 3, 2 par défaut) |
| `scheme` | enum | Schéma de circulation : `"preset"` (par défaut, celui du preset), `"free"` (aucun, fonctionnement par densité), `"spine"`, `"gallery"`, `"enfilade"` (§18.2) |
| `freeOutline` | boolean | *Expérimental.* Contour libre : l'espace inutilisé est retiré du bâtiment par rectangles calés dans un angle, le bâtiment restant un rectangle ou un L. Par défaut : contour rectangulaire |
| `seed` | number | Graine aléatoire. Si vide : générée automatiquement à chaque lancement |

> La taille des cases n'a pas d'unité fixe en v1. Une case représente une unité de grille — l'utilisateur calibre mentalement selon son besoin (1 case = 1m, 1.5m, etc.).

---

## 4. Interface utilisateur

### 4.1 Structure générale

Layout deux colonnes :

```
┌─────────────────────────┬──────────────────────────────────┐
│   Panneau de composition│   Prévisualisation                │
│   (colonne gauche)      │   (colonne droite)                │
└─────────────────────────┴──────────────────────────────────┘
```

### 4.2 Panneau de composition (colonne gauche)

**Section Preset**
- Dropdown de sélection du preset
- Option "Vide — partir de zéro"
- Un clic sur un preset remplace le programme courant (avec confirmation si le programme a été modifié manuellement)

**Section Programme — Liste de pièces**
- Liste des pièces du programme en cours
- Chaque pièce affiche : label, quantité, taille, étage cible
- Actions par pièce : modifier, dupliquer, supprimer
- Bouton "Ajouter une pièce" — ouvre un sélecteur :
    - Choisir dans la bibliothèque de types connus
    - Ou saisir un label libre (type générique avec valeurs par défaut)

**Section Liens verticaux**
- Liste des liens verticaux définis
- Chaque lien affiche : label, étages connectés, taille
- Actions : modifier, supprimer
- Bouton "Ajouter un escalier / une trappe"

**Section Paramètres globaux**
- Champs : largeur, longueur (en cases)
- Sélecteur : nombre d'étages (0–4), présence d'un sous-sol
- Slider densité : Dense / Équilibré / Aéré
- Champ graine (optionnel, numérique)

**Section Actions**
- Bouton principal **"Générer"**
- Bouton secondaire **"Nouvelle graine"** — relance la génération avec une graine différente sans modifier le programme ni les paramètres

### 4.3 Panneau de prévisualisation (colonne droite)

- Affichage SVG du plan généré
- Si le bâtiment comporte plusieurs niveaux : navigation par tabs (Sous-sol / RDC / Étage 1 / etc.)
- La graine du plan affiché est indiquée sous la prévisualisation
- Bouton **"Exporter SVG"** — télécharge le SVG de l'étage affiché
- Bouton **"Exporter tous les étages (SVG)"** — télécharge un SVG par étage, à la suite (zip éventuel plus tard)
- Bouton **"Exporter PNG"** — conversion côté client via canvas

### 4.4 États d'interface

| État | Comportement |
|---|---|
| Aucun plan généré | Colonne droite affiche un placeholder neutre |
| Génération en cours | Indicateur de chargement (normalement < 500ms) |
| Génération réussie | SVG affiché, graine notée |
| Échec de génération | Message d'erreur explicite + suggestions (voir §6) |

---

## 5. Presets initiaux

Les presets suivants sont fournis à la v1. Ils sont modifiables et servent de référence pour la bibliothèque de types de pièces.

| Preset | Pièces incluses | Étages par défaut |
|---|---|---|
| **Auberge** | Entrée, Salle commune (grande), Cuisine, Cellier, Chambres ×4, Écurie (optionnelle) | RDC + 1 étage |
| **Manoir** | Entrée, Salon, Bibliothèque, Salle à manger, Cuisine, Cellier, Chambres ×4, Chambre des maîtres, Cave | RDC + 1 étage + sous-sol |
| **Lieu de culte** | Nef (grande), Sacristie, Crypte, Entrée, Chapelle latérale | RDC + sous-sol |
| **Entrepôt / Dock** | Hall de stockage (grand), Bureau, Quai de chargement, Salle de garde ; lien vertical : escalier de mezzanine | RDC + 1 étage (la mezzanine, programme réduit) |
| **Poste de garde** | Salle de garde, Bureau du capitaine, Cellules ×2, Armurerie, Entrée, Cour intérieure | RDC + 1 étage |
| **Habitation modeste** | Pièce principale, Cuisine, Chambre ×1–2, Cave | RDC |
| **Vide** | Programme vide — tout à définir | RDC |

> Cette liste est extensible. Chaque preset est un fichier de configuration JSON — ajouter un preset ne nécessite pas de modifier le code du générateur.

---

## 6. Comportement de génération

### 6.1 Ordre de génération

```
1. Poser l'enveloppe globale (grille vide aux dimensions définies)
2. Poser les structurants sur tous les niveaux concernés, au même endroit d'un
   étage à l'autre : empreintes des liens verticaux (escaliers, trappes), puis
   pièces marquées structural=true (cour, ascenseur…)
3. Placer les pièces prioritaires (priority=true), qui deviennent des points
   d'ancrage comme les structurants
4. Placer les couloirs, étage par étage, dans la grille encore libre : relier au
   réseau (entrée, pièces ouvertes) chaque structurant et chaque pièce prioritaire
   qui ne le touche pas déjà. La densité règle largeur et ramifications
5. Distribuer les autres pièces dans les zones restantes, étage par étage,
   en respectant :
   - Les contraintes de taille
   - Les contraintes de voisinage
   - Les cases déjà réservées
   - L'accès au réseau de circulation, couloirs et pièces ouvertes (ou à une
     pièce voisine en densité "dense")
   - Une forme de rectangle, de carré ou de L
6. Élaguer les couloirs : ne retirer que les culs-de-sac qui ne desservent rien ;
   les pièces regrandissent dans l'espace rendu. Les cases restantes vont d'abord à
   une pièce ouverte voisine, puis à une pièce fermée voisine (si sa forme reste
   valide), puis hors du bâtiment en contour libre (le bâtiment restant un rectangle
   ou un L), et seulement en dernier au couloir, dans la limite de sa largeur maximale
7. Percer les ouvertures : au moins une porte par pièce fermée vers le réseau, plus
   les portes directes entre pièces liées par mustBeAdjacentTo, et quelques portes
   supplémentaires tirées par la graine
8. Rendre le SVG
```

> Hiérarchie de placement (§13) : structurants, puis pièces prioritaires, puis couloirs, puis autres pièces. Une pièce ne passe jamais devant un structurant. Les couloirs partent des structurants, qui occupent la même place à chaque étage : les étages sont reliés par construction. Les couloirs sont placés avant les pièces ordinaires, jamais creusés dans des pièces déjà posées ; seuls leurs culs-de-sac sont retirés après coup.

### 6.2 Gestion des échecs

Si l'algorithme ne trouve pas de placement valide après N tentatives :

| Cause probable | Message affiché | Suggestion |
|---|---|---|
| Enveloppe trop petite | "Le bâtiment est trop petit pour accueillir toutes les pièces." | Augmenter largeur ou longueur |
| Programme trop chargé | "Trop de pièces pour la surface définie." | Réduire le nombre de pièces ou augmenter la surface |
| Bâtiment trop grand pour son programme (§17) | "Le bâtiment est trop grand pour son programme." | Réduire largeur ou longueur, ou passer en contour libre (pas de « Nouvelle graine » : aucune ne peut réussir) |
| Place inoccupée (§19) | "Il reste de la place que les pièces n'arrivent pas à occuper." | Nouvelle graine, couloir plus large autorisé, dimensions réduites ou contour libre |
| Contraintes de voisinage impossibles | "Certaines contraintes de placement sont incompatibles." | Vérifier les règles de voisinage |
| Échec aléatoire (graine défavorable) | "La génération n'a pas abouti avec cette graine." | Essayer avec une nouvelle graine |

Dans tous les cas, le bouton "Nouvelle graine" est mis en avant. Pour les erreurs structurelles (enveloppe trop petite, programme trop chargé), les boutons d'action correspondants sont proposés directement dans le message.

### 6.3 Reproductibilité

- La graine utilisée est toujours affichée après une génération réussie
- Un champ permet de saisir une graine connue avant de générer
- À programme, paramètres et graine identiques : le résultat est garanti identique

---

## 7. Sortie visuelle

### 7.1 Contenu du plan

Le SVG généré affiche pour chaque étage :

- **Enveloppe** — mur extérieur du bâtiment
- **Pièces** — rectangles ou L avec label centré
- **Murs intérieurs** — séparations entre pièces ; entre deux espaces de circulation (couloir, pièce ouverte), simple pointillé
- **Ouvertures** — portes entre pièces adjacentes connectées (représentées par une interruption du mur + arc optionnel)
- **Liens verticaux** — symbole d'escalier ou de trappe dans l'empreinte réservée, avec indication des étages connectés
- **Légende d'échelle** — indication du nombre de cases et de l'unité si définie
- **En-tête d'étage** — "Sous-sol", "Rez-de-chaussée", "Étage 1", etc.

### 7.2 Style visuel v1

Style plan technique neutre :
- SVG sans fond (transparent) ; la prévisualisation l'affiche sur fond clair, quel que soit le thème de la plateforme
- Murs en trait noir plein
- Labels en typographie sans-serif lisible
- Portes en trait fin avec arc
- Liens verticaux avec symbole conventionnel (croix hachurée ou flèche montante/descendante)

> Le style visuel (parchemin, blueprint sci-fi, plan architectural moderne) est une couche ultérieure non bloquante. Le SVG v1 est pensé pour être lisible à table et imprimable, pas pour être esthétique.

### 7.3 Export

| Format | Mécanisme | Portée |
|---|---|---|
| SVG (étage courant) | Téléchargement direct du SVG généré | Étage affiché |
| SVG (tous étages) | Un téléchargement SVG par étage, à la suite (zip éventuel plus tard) | Tous les niveaux |
| PNG | Conversion SVG → Canvas → `toDataURL()` côté client | Étage affiché |

---

## 8. Contraintes techniques structurantes

Ces points conditionnent l'implémentation sans être des specs fonctionnelles au sens strict — ils sont notés ici pour guider le prototypage.

- **Grille carrée** — la surface de jeu est une grille de cases carrées. Tout placement est aligné sur la grille. Pas de géométrie libre.
- **Génération côté client** — l'algorithme tourne entièrement dans le navigateur. Pas de backend, pas d'API.
- **Algorithme avec retry** — en cas d'échec de placement, l'algorithme relance avec une variation de la graine (max N tentatives) avant de déclarer un échec à l'utilisateur.
- **Séparation programme / moteur** — les presets et les types de pièces sont des données JSON pures. Le moteur de génération ne contient aucune valeur en dur.
- **SVG programmatique** — le SVG est construit en JavaScript pur (création d'éléments SVG DOM ou template string). Pas de lib de rendu canvas.

---

## 9. Hors scope v1

Les éléments suivants sont explicitement hors scope pour la première version :

- **Fog of war et tokens** — l'outil est un générateur de plans, pas un VTT
- **Édition manuelle de la géométrie** — on ne déplace pas de murs après génération ; on relance avec une nouvelle graine ou on ajuste le programme
- **Styles visuels thématiques** — parchemin, blueprint, etc. (prévu mais non bloquant)
- **Intégration dans le VTT** — standalone uniquement en v1
- **Plans extérieurs** — villes, territoires, camps (intérieurs uniquement)
- **Export multi-étages en une image** — chaque étage est un fichier séparé
- **Collaboration temps réel** — pas de Socket, pas de partage live
- **Sauvegarde du programme** — ni stockage navigateur ni import / export JSON pour le premier prototype ; à revoir ensuite
- **Étages partiels** — une mezzanine est un étage normal au programme réduit
- **LLM** — aucune dépendance à un modèle de langage

---

## 10. Questions avant prototypage

> Points ouverts relevés à la lecture (phase 1). Réponds dans la colonne « Réponse MJ » ; les décisions seront ensuite reportées dans le corps de la spec.

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                                                                                                              |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| G-1 | Où vit l'outil ? (a) app Vite séparée dans le dépôt, (b) page de la plateforme VTT sans connexion (ex. `/outils/plans`), (c) dépôt séparé. | (b) : moteur en JS pur sans React (testable sous Vitest), UI en page plateforme. On profite du build, de la release, de Tailwind et du thème ; l'outil reste autonome fonctionnellement (ni base, ni socket, ni auth) et l'intégration future est gratuite. | b                                                                                                                                                                                                                                                                                                                                       |
| G-2 | Forme de l'enveloppe : rectangle seulement ? Même emprise à tous les étages ? | Rectangle, même emprise à tous les niveaux (sous-sol compris) en v1. | reco                                                                                                                                                                                                                                                                                                                                    |
| G-3 | `sizeInCells` est un nombre, mais l'exemple dit « 2×3 ». | Remplacer par `w` et `h` en cases, rotation de 90° autorisée par l'algorithme. | 2x3 = 6 c'était ça l'idée il me semble                                                                                                                                                                                                                                                                                                  |
| G-4 | Sens exact de `structural` : (a) pièce posée en premier sur son étage, (b) empreinte réservée sur plusieurs étages (double hauteur : nef, hall de stockage). | `structural` = posée en premier. La double hauteur passe par une propriété à part (ex. `spansFloors: 2`), l'emprise devenant vide (« vide sur ») à l'étage du dessus. | structural oui c'est en premier c'est pour dire que cette pièce est importante dans la structure générale du bâtiment, un escalier, un ascenceur, une cours intérieure etc. C'est pas forcément marquant pour la V0 à 1 étages mais important pour la suite, c'est ce qui permet de faire des plans de plusieurs étages coéhrents après |
| G-5 | Mezzanine (Entrepôt) : le modèle n'a pas d'étage partiel, et « Escalier de mezzanine » est listé comme pièce alors que c'est un lien vertical. | v1 : la mezzanine est un étage 1 normal avec un programme réduit ; l'escalier devient un lien vertical. L'étage partiel attend une v2. | oui faisons ça                                                                                                                                                                                                                                                                                                                          |
| G-6 | Accès extérieur : rien ne dit quelle pièce touche la façade ni où est la porte d'entrée. | Propriété `exterior: true` (Entrée, Quai, Écurie, Cour…) : la pièce touche le mur extérieur et reçoit une porte vers l'extérieur ; la façade d'entrée est tirée par la graine. | Oui pourquoi pas.                                                                                                                                                                                                                                                                                                                       |
| G-7 | Cour intérieure : pièce à ciel ouvert, donc rien au-dessus ? Rendu différent ? | Propriété `open: true` : rendu hachuré ou pointillé, emprise vide aux étages supérieurs. |                                                                                                                                                                                                                                                                                                                                         |
| G-8 | Couloirs : la spec les trace après le placement des pièces (§6.1 étape 5), l'approche la plus fragile (il faut alors creuser dans des pièces déjà posées). | Poser d'abord une épine de couloir dont la largeur et les ramifications dépendent de `density`, puis découper les bandes restantes en pièces. « Dense » = peu ou pas de couloir, pièces en enfilade. | Justement le truc important à la base c'est de poser les pièces structurante, on ne creuse pas les couloirs, on les places en fonction des pièces structurante c'est le point important, si on commence par les couloirs comment tu assures que les étages vont être correctement reliés ?                                              |
| G-9 | Portes : toutes les paires de pièces adjacentes, ou juste ce qu'il faut pour que tout soit accessible ? | Chaque pièce a au moins une porte vers le réseau (couloir ou voisine) ; portes directes en plus entre pièces liées par `mustBeAdjacentTo` ; quelques portes supplémentaires tirées par la graine. | à voir mais pour l'instant ok                                                                                                                                                                                                                                                                                                           |
| G-10 | Export de tous les étages en .zip : demande une bibliothèque (JSZip). | v1 : un téléchargement SVG par étage, à la suite, sans bibliothèque. Le zip seulement si les téléchargements multiples gênent. | le zip pour l'instant c'est pas l'important en effet                                                                                                                                                                                                                                                                                    |
| G-11 | Persistance : un programme modifié est-il perdu au rechargement ? Partage d'un programme entre MJ ? | Programme courant gardé dans le navigateur (`localStorage`) ; export / import du programme en JSON (sert aussi à créer des presets). | C'est secondaire ça, pour le premier proto pas besoin de stockage/sauvegarde etc A voir par la suite                                                                                                                                                                                                                                    |
| G-12 | Bibliothèque de types de pièces : d'où vient-elle ? Un type libre créé par l'utilisateur est-il conservé ? | Bibliothèque = un fichier JSON de types, référencé par les presets. Un type libre vit dans le programme courant uniquement. |                                                                                                                                                                                                                                                                                                                                         |
| G-13 | `floor: "upper"` avec plusieurs étages : qui choisit l'étage ? | L'algorithme répartit les pièces `upper` sur les étages ≥ 1 pour équilibrer les surfaces. | Soit c'est imposé par l'utilisateur, ie je veux 3 chambres et une salle de bain, soit c'est lié à la graine. Dans tous les cas, il faut toujorus que cela respecte le principe des structurants                                                                                                                                         |
| G-14 | Thème nuit de la plateforme (si G-1 = b) : le plan suit-il ? | Le plan reste fond blanc (imprimable, conforme au §7.2) ; seule l'UI autour suit le thème. | SVG sans fond non ? en vrai c'est pas super important à ce stade                                                                                                                                                                                                                                                                        |

---

## 11. Prototype P0 — spécification technique

> Validée le 24/10/2026 (P-1 : adresse `/tools/plans` ; P-2 : pas de lien depuis l'accueil ; P-3 : voisinages par `id` ; P-4 : cases restantes à une pièce voisine, sinon au couloir).

### 11.1 Périmètre

- **Un seul étage, le RDC**, avec le preset Auberge (les pièces d'étage sont ignorées). L'escalier vers l'étage 1 est posé pour éprouver les structurants.
- Les trois densités, les pièces ouvertes, les portes (dont la porte extérieure), le rendu SVG.
- Page de test : largeur, longueur, densité, largeur maximale du couloir et contour (expérimentaux, §12), graine, « Générer » et « Nouvelle graine », graine affichée, messages d'échec du §6.2 avec « Largeur +2 » / « Longueur +2 » pour les erreurs de surface.
- Hors P0 : éditeur de programme, autres presets, étages, exports (P1 et P2).

### 11.2 Fichiers

| Fichier | Rôle |
|---|---|
| `src/client/src/genmap/generate.js` | Moteur : graine, structurants, couloirs, pièces, portes |
| `src/client/src/genmap/renderSvg.js` | Rendu SVG d'un étage |
| `src/client/src/genmap/data/engine.json` | Réglages du moteur : tentatives, pénalité de virage, ramifications, branche minimale d'un L (`minArm`), largeur maximale du couloir par défaut, densités |
| `src/client/src/genmap/data/roomTypes.json` | Bibliothèque des types de pièces |
| `src/client/src/genmap/data/presets/inn.json` | Preset Auberge |
| `src/client/src/pages/GenMapPage.jsx` | Page `/tools/plans`, styles de la plateforme comme l'accueil |
| `src/client/tests/genmap/generate.test.js` | Tests du moteur |

### 11.3 Contrat du moteur

- `resolvePreset(preset, roomTypes)` → `{ program, params }` : le preset référence ses types par `id`, le programme porte les types complets et leur quantité.
- `generate(program, params)` avec `params = { width, length, floors, basement, density, seed, corridorMaxWidth?, freeOutline? }` :
  - réussite : `{ ok: true, plan: { seed, attempt, floors: [floor] } }` ;
  - échec : `{ ok: false, reason, steps }`, `reason` parmi `envelope`, `overload`, `adjacency`, `seed` (cause la plus fréquente des tentatives), `steps` = étapes en échec (diagnostic).
- Un étage : `{ level, width, length, facade, rooms, corridor, voids, links, doors }`.
  - pièce : `{ id, typeId, label, exterior, circulation, outdoor, cells: [[x, y]…], labelBox: { x, y, w, h } }` (ensemble de cases formant un rectangle ou un L, `shapeKind(cells)` le vérifie) ;
  - `corridor` : cases du couloir et des dégagements ;
  - `voids` : cases retirées du bâtiment en contour libre ;
  - lien : `{ id, label, x, y, w, h, target }` (`target` = étage desservi) ;
  - porte : `{ x, y, side, between: [a, b], kind }`, sur l'arête `side` de la case `(x, y)`, qui appartient à `a` (la porte ouvre de ce côté) ; `kind` = `door` (battant) ou `opening` (passage, pour les liens et les dégagements) ; `outside` désigne l'extérieur.
- `renderSvg(plan, floorIndex)` → chaîne SVG.

### 11.4 Algorithme d'un étage

1. Graine : générateur mulberry32. En cas d'échec, nouvelle tentative avec une graine dérivée (graine + n × 7919), au plus `attempts` fois : le résultat reste reproductible.
2. Contrôle préalable : somme des surfaces minimales du RDC et des liens supérieure à l'enveloppe → `overload`.
3. Structurants : façade d'entrée tirée par la graine ; la première pièce `exterior` du programme est la pièce d'entrée, posée contre la façade (jamais dans un angle) ; liens verticaux et pièces `structural` posés hors de la façade, à une case au moins des autres réservations.
4. Surfaces cibles : l'espace libre (moins une estimation du couloir à venir) réparti entre les pièces ; recalculé pour les pièces ordinaires une fois les couloirs posés.
5. Placement d'une pièce (pour chaque niveau de la hiérarchie, des plus grandes aux plus petites, pièces `exterior` puis pièces ouvertes d'abord) :
   - la pièce pose un rectangle de sa surface minimale : contre un mur extérieur si `exterior`, sinon de préférence contre le réseau de circulation, les murs et les pièces déjà posées, contre ses voisines imposées et loin de ses voisines interdites ;
   - croissance en rectangle, par côtés entiers, vers sa surface cible ;
   - une pièce restée sous sa cible peut prendre une aile pour former un L (branches et décrochement d'au moins `minArm` cases, une seule aile).
6. Pièces prioritaires (§13, O-1, O-2) : placées selon le point 5, avant les couloirs.
7. Couloirs provisoires (sauf en dense) : du réseau atteint (entrée, couloir, pièces ouvertes qui s'y raccordent) vers chaque structurant et chaque pièce prioritaire qui ne le touche pas déjà, du plus proche de l'entrée au plus lointain, virages pénalisés ; largeur selon la densité, plafonnée par `corridorMaxWidth` ; ramifications tant qu'une case libre reste plus loin du réseau que la portée (portée de la densité, au moins le côté de la plus grande pièce).
8. Autres pièces : placées selon le point 5, puis toutes les pièces grandissent jusqu'à `sizeMax` pour occuper l'espace, pièces ouvertes d'abord.
9. Restes (R-4) : chaque zone libre va entière à une pièce voisine si sa forme reste un rectangle ou un L (pièces ouvertes d'abord) ; sinon, en contour libre (O-4), on retire du bâtiment le plus grand rectangle calé dans un angle de l'enveloppe tel que le bâtiment reste un rectangle ou un L, et on recommence ; le reste va au couloir.
10. Élagage des culs-de-sac (§13, O-3, hors dense) : on garde les plus courts chemins, dans le couloir provisoire, qui relient le réseau (entrée, pièces ouvertes) à chaque pièce ou lien que ce couloir touche ; ce qui dépasse redevient libre, les pièces y regrandissent, puis la règle des restes s'applique à nouveau.
11. Contrôles : couloir sans carré de `corridorMaxWidth + 1` cases de côté ; surface, ratio et forme (rectangle ou L) de chaque pièce ; pièces `exterior` contre l'extérieur ; voisinages ; hors dense, chaque pièce fermée touche le réseau.
12. Portes : porte extérieure de l'entrée sur la façade, une porte dehors par autre pièce `exterior`. Le réseau (couloirs et pièces ouvertes) se parcourt sans porte ; chaque pièce fermée qui le touche y ouvre ; les autres sont reliées de proche en proche à une pièce déjà reliée (enfilade) ; porte directe entre voisines imposées ; portes en plus selon `extraDoorChance`. Tout doit être accessible depuis la porte d'entrée.

### 11.5 Tests

Sur 25 graines, dans chaque densité, en contour libre (dense, équilibré, dense en 15 × 12) et avec une largeur maximale de 1 : aboutissement d'au moins 90 % des graines, même graine donne le même plan, enveloppe couverte sans chevauchement, formes rectangle ou L dans les tailles et ratios, pièces `exterior` contre l'extérieur avec porte dehors, tout accessible depuis l'entrée, voisinages imposés et interdits, largeur maximale du couloir, desserte des pièces fermées par le réseau (hors dense), contour rectangulaire hors contour libre, contour rectangle ou L en contour libre. Plus : cas « programme trop chargé », reconnaissance des formes par `shapeKind`.

### 11.6 Limites constatées

- Quand l'enveloppe est grande pour le programme, les pièces plafonnent à `sizeMax` et le surplus devient un dégagement (en contour rectangulaire) ou est retiré du bâtiment (en contour libre). L'enveloppe par défaut de l'Auberge (12 × 9) est calibrée sur son programme de RDC.
- Depuis la hiérarchie (§13), tous les réglages aboutissent sur les 25 graines testées de l'Auberge, en 2 à 3 tentatives en moyenne (une dizaine avec une largeur maximale de 1).
- La salle commune, prioritaire et ouverte, prend souvent la plus grande part du RDC et forme un L ; en équilibré, elle dessert souvent tout et il n'y a alors presque plus de couloir (le plan ressemble au dense).

---

## 12. Retours sur P0 — questions

> Constats du MJ après essai : avancées de plusieurs cases sur certaines pièces ; couloirs trop grands (ils font des pièces), mal placés ou inutiles ; toutes les pièces sont fermées avec des portes, alors qu'une entrée par exemple est souvent ouverte ; meilleurs résultats en densité « dense ».
>
> Diagnostic :
> - **Avancées** : après la croissance en rectangle, la pièce absorbe n'importe quelle bande libre voisine, même d'une case de large, puis les cases isolées une à une. Le seul garde-fou est le ratio du rectangle englobant et un remplissage de 60 %, ce qui laisse passer des L, des U et des excroissances.
> - **Couloirs trop grands** : les cases que personne ne prend rejoignent le couloir (P-4), qui grossit en « hall » informe.
> - **Couloirs inutiles ou mal placés** : ils sont tracés avant les pièces (c'est voulu, §6.1) mais jamais revus ensuite. Une ramification pousse dès qu'une case libre est loin du couloir, même si aucune pièce n'en a besoin au final ; le tronçon entrée → escalier reste même quand une grande pièce assure déjà le passage.
> - **Pièces toutes fermées** : il manque la notion de pièce de circulation. En dense, les pièces se desservent entre elles, d'où des plans plus crédibles pour un petit bâtiment.

| # | Question | Proposition | Réponse MJ                                                                                            |
|---|---|---|-------------------------------------------------------------------------------------------------------|
| R-1 | Pièce ouverte : une pièce qui fait partie de la circulation (entrée, hall, palier). Pas de mur ni de porte entre elle et le couloir ou une autre pièce ouverte, les autres pièces y ouvrent comme sur un couloir. Comment la marquer sur le plan ? | Nouvelle propriété de type `circulation: true`. Limite avec le couloir en trait fin pointillé (on voit l'espace sans le fermer), libellé conservé. | oui très bien, on affinera ça après pour le moment il faut voir ce que ça donne                       |
| R-2 | Quels types sont ouverts par défaut ? | Entrée oui. Salle commune de l'auberge : à toi de voir (souvent on la traverse pour aller à la cuisine et à l'escalier). Hall de stockage de l'entrepôt, nef du lieu de culte : probablement. | oui ok pour tes reco, de toute façon c'est del a config après ça, à ce stade c'est pas très important |
| R-3 | Nom de la propriété « ciel ouvert » (cour) : `open` prête maintenant à confusion avec « pièce ouverte ». | Renommer en `outdoor` (cour, à ciel ouvert) ; `circulation` pour la pièce ouverte. | oui ok                                                                                                |
| R-4 | Cases restantes (révision de P-4) : où vont-elles ? | D'abord à une pièce ouverte voisine (le hall s'agrandit, c'est naturel), puis à une pièce fermée voisine, et seulement en dernier au couloir. | ça semble ok, à voir avec ma remarque aussi en message                                                |
| R-5 | Couloirs inutiles : les élaguer une fois les pièces posées ? | Oui : on retire les bouts de couloir en cul-de-sac qui ne desservent aucune pièce ni aucun structurant, et on rend leurs cases aux pièces voisines. L'ordre du §6.1 ne change pas (le couloir reste posé avant les pièces), il est seulement nettoyé après. | oui et potentiellement on nettoie aussi lorsqu'une pièce donne sur un couloir qui ne dessert rien     |
| R-6 | Le couloir est-il toujours nécessaire entre l'entrée et l'escalier ? | Non : si une pièce ouverte relie déjà l'entrée à l'escalier, pas de couloir. Le couloir ne sert qu'à atteindre ce que les pièces ouvertes ne desservent pas. | non, reco                                                                                             |
| R-7 | Avancées : quelle forme de pièce accepte-t-on ? | Rectangles par défaut. Un L seulement si l'aile fait au moins 2 cases de profondeur et 3 de long ; jamais de bande d'une case ni de case isolée ajoutée à une pièce fermée. Les restes de ce type vont aux pièces ouvertes ou au couloir (R-4). | pour l'instant restons simple rectangle, carré, L                                                     |
| R-8 | Densité par défaut, et sens des densités. | « Dense » par défaut. Dense : pas de couloir, circulation par les pièces ouvertes et en enfilade. Équilibré : couloir de largeur 1 seulement là où il manque une desserte. Aéré : couloir de largeur 2, mêmes règles. | ah oui, ça rejoint ce que je dit dans mon message                                                     |

> Décisions R-1 à R-8 reportées dans le corps de la spec (§2.2, §3, §6.1, §7.1, §11) le 24/10/2026. Types ouverts par défaut : Entrée et Salle commune.

**Idées du MJ, en expérimentation** (réglages de la page de test, à confirmer ou abandonner après essais) :
- **Contour libre** (`freeOutline`) : l'espace inutilisé qui touche l'extérieur est retiré du bâtiment au lieu de devenir un couloir trop large, ce qui « dégraisse » le bâtiment et lui donne une forme non rectangulaire. Révise G-2 (enveloppe rectangulaire) si l'essai est concluant.
- **Largeur maximale du couloir** (`corridorMaxWidth`, 1 à 3 cases, 2 par défaut) : un plan dont un couloir ou dégagement dépasse cette largeur est rejeté et retenté avec une autre graine.

---

## 13. Ordre de placement et hiérarchie — questions

> Retours du MJ sur l'essai du §12 : le contour libre donne parfois des formes très étranges ; la limite de largeur des couloirs améliore nettement l'équilibré et l'aéré ; pourquoi les pièces peuvent-elles « manger » des couloirs posés avant elles ? Idée : une option qui fait placer une pièce avant les autres, sans jamais passer devant les structurants. Le style des pièces ouvertes est à régler plus tard.
>
> Diagnostic :
> - **Pièces qui mangent les couloirs** : au placement, une pièce ne prend jamais une case de couloir. C'est l'élagage (R-5, R-6) qui retire après coup les tronçons jugés inutiles (souvent parce qu'une pièce ouverte, comme la salle commune, dessert déjà ce qu'ils desservaient) et rend leurs cases aux pièces voisines. Vu de l'extérieur, la pièce a bien mangé le couloir.
> - **Contour libre étrange** : n'importe quelle zone inutilisée qui touche l'extérieur est retirée, quelle que soit la forme qui reste. Rien ne contraint le contour, d'où des encoches au milieu d'une façade ou des découpes profondes.
> - **Ordre actuel** : structurants (entrée, liens verticaux, pièces `structural`), couloirs provisoires, puis toutes les autres pièces dans un ordre fixe : pièces `exterior`, pièces ouvertes, puis les plus grandes d'abord.

| # | Question | Proposition | Réponse MJ                                                                                                                                    |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------|
| O-1 | Hiérarchie de placement : quels niveaux ? | Trois niveaux : 1. structurants ; 2. pièces prioritaires (nouvelle propriété, ex. `priority: true`) ; 3. autres pièces. Dans un même niveau, l'ordre actuel (extérieures, ouvertes, plus grandes). | oui                                                                                                                                           |
| O-2 | Les pièces prioritaires se placent-elles avant ou après les couloirs ? | Avant. Elles deviennent alors des points d'ancrage, comme les structurants : le couloir part de l'entrée et les relie. Une salle commune prioritaire devient ainsi le cœur du plan, et le couloir s'organise autour au lieu de se faire élaguer par elle. | Avant                                                                                                                                         |
| O-3 | Élagage : on garde lequel ? (a) l'actuel, qui retire aussi un couloir doublé par une pièce ouverte (R-6) ; (b) seulement les culs-de-sac qui ne desservent rien (R-5 d'origine) ; (c) aucun. | (b). Avec O-2, le couloir est tracé en connaissant les pièces importantes, il n'y a plus de raison de le retirer parce qu'une pièce ouverte le double. On ne coupe que ce qui ne mène nulle part. | b                                                                                                                                             |
| O-4 | Contour libre : le contraindre ou l'abandonner ? | Le contraindre comme une pièce : on ne retire que des rectangles calés dans un angle du bâtiment, pour que le contour reste un rectangle ou un L (éventuellement un T ou un U plus tard). Sinon, désactivé et mis de côté. | contraindre en effet, le test n'est pas concluant pour le moment mais ça ne veut pas dire que c'est une mauvaise idée, faut ajuster et itérer |
| O-5 | Largeur maximale du couloir : on la sort de l'expérimental ? | Oui : réglage permanent de la page (1 à 3 cases), 2 par défaut. | oui je pense que c'est essentiel en vrai                                                                                                      |
| O-6 | Style des pièces ouvertes (pointillé, fond gris) | Noté pour plus tard, inchangé pour l'instant. | Plus tard                                                                                                                                     |

> Décisions O-1 à O-5 reportées dans le corps de la spec (§2.2, §3, §6.1, §11) le 24/10/2026. Pièce prioritaire par défaut : Salle commune. Le contour libre reste expérimental (à ajuster et itérer) ; la largeur maximale du couloir devient un réglage permanent.

---

## 14. Éprouver la génération sur d'autres programmes — questions

> Retours du MJ après l'essai du §13 : plans bien plus cohérents, même en contour libre. Règle ajoutée : le cellier ne donne jamais sur la salle commune (`noDoorWith`, §2.2). Demande pour plus tard : retoucher le plan après génération (agrandir une pièce, supprimer un couloir, ajouter ou retirer des portes) pour atteindre ce que la génération n'atteindra jamais. Priorité du moment : tester d'autres programmes pour éprouver le moteur.

### 14.1 Démarche proposée

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T-1 | Comment tester ? | Trois outils : (1) les cinq autres presets du §5, en JSON ; (2) le choix du preset dans la page (boutons, pas de liste déroulante) ; (3) une **planche** : bouton « Planche » qui génère 6 graines côte à côte, pour juger d'un coup d'œil la variété et les défauts récurrents. En plus, les tests automatiques tournent sur tous les presets (taux de réussite, règles). | 1 et 2, pas de planche, en faisant 1 et 2 on reste dans notre proto et on se rapproche de notre cible                                                                                                                                                                                                                                                                                                                                        |
| T-2 | Les presets à plusieurs niveaux (manoir, lieu de culte…) | Tant que P1 n'est pas fait, seul leur RDC est généré : les pièces d'étage et de sous-sol sont listées mais ignorées, comme pour l'auberge. | ça sera l'étape d'après, là, on veut éprouver qu'une génération de plan d'un étage soit cohérente avec plusieurs modèles                                                                                                                                                                                                                                                                                                                     |
| T-3 | Un preset peut-il modifier un type pour lui-même ? Ex. : la chambre est à l'étage dans l'auberge, mais au RDC dans l'habitation modeste (preset de plain-pied). | Oui : une entrée de preset peut surcharger des propriétés du type (`{ "type": "bedroom", "quantity": [1, 2], "floor": "ground" }`). La bibliothèque reste unique. | bah fonctionnellement parlant, rien n'empêche n'importe quel type de pièce d'être à n'importe quel étage, c'est juste notre conception. J'ai des chambres chez moi à l'étage mais aussi au RDC par exemple. C'est peut-être plus lié au preset ça enfin certaines pièces peuvent et doivent toujours être à l'étage, par exemple un grenier (je parle pas du grenier à grain !!!!) c'est toujours sous les combles. A voir et discuter plus. |
| T-4 | Habitation modeste : le §5 la décrit « RDC » mais elle a une cave, qui est un sous-sol. | La cave passe au sous-sol (ignorée en P0) ; le preset reste de plain-pied pour le reste. | euh oui mais c'est juste un preset, on pourrait en faire 50 des preset d'habitation modeste                                                                                                                                                                                                                                                                                                                                                  |
| T-5 | Bâtiment sans pièce « Entrée » (habitation modeste) : la première pièce `exterior` sert d'entrée. | La pièce principale porte `exterior`, `circulation` et `priority` : on entre directement dedans. | Oui dans certaines configuration de preset ça pourrait arriver mais c'est assez rare de ne pas avoir une entrée dans un bâtiment                                                                                                                                                                                                                                                                                                             |
| E-1 | Retouche du plan après génération (demande du MJ) | Notée comme étape à part, après P1 : elle sort du §9 (« hors scope v1 ») pour devenir une phase dédiée. À cadrer le moment venu (agrandir ou réduire une pièce, supprimer un couloir, ajouter ou retirer une porte, plan retouché qui ne suit plus la graine). | A discuter après                                                                                                                                                                                                                                                                                                                                                                                                                             |

### 14.2 Nouveaux types de pièces proposés (RDC)

Tailles en cases. « Ouverte » = `circulation`, « Prio » = `priority`. Les types existants (Entrée, Cuisine, Cellier, Écurie, Chambre) sont réutilisés.

| Type (`id`) | Libellé | Taille | Ratio | Ouverte | Prio | Extérieure | Voisinages et portes                                                  | Réponse MJ                                                                                                                                                                                                                                         |
|---|---|---|---|---|---|---|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `living_room` | Salon | 16–30 | 0.5–2 | non | non | non |                                                                       | oui mais un salon peut toucher l'extérieur et avoir des ouvertures extérieure ou pas. Et il faut distinguer les grands salon des petits salons de type boudoir, c'est pareil avec les bilbiothèques bref oui pour les tests en l'état              |
| `library` | Bibliothèque | 12–24 | 0.5–2 | non | non | non |                                                                       | oui ok pour les tests                                                                                                                                                                                                                              |
| `dining_room` | Salle à manger | 16–30 | 0.5–2 | non | non | non | touche la cuisine                                                     | oui ok                                                                                                                                                                                                                                             |
| `hall` | Grand hall (manoir) | 16–36 | 0.5–2 | oui | oui | non | touche l'entrée                                                       | ok mais un hall peut clairement faire office d'entrée aussi                                                                                                                                                                                        |
| `nave` | Nef | 40–90 | 0.35–0.7 (allongée) | oui | oui | non | touche l'entrée                                                       | ok                                                                                                                                                                                                                                                 |
| `sacristy` | Sacristie | 6–12 | 0.5–2 | non | non | non | touche la nef                                                         | ok                                                                                                                                                                                                                                                 |
| `side_chapel` | Chapelle latérale | 9–20 | 0.5–2 | oui | non | non | touche la nef                                                         | ok                                                                                                                                                                                                                                                 |
| `storage_hall` | Hall de stockage | 50–120 | 0.5–2 | oui | oui | non |                                                                       | ok                                                                                                                                                                                                                                                 |
| `loading_dock` | Quai de chargement | 12–30 | 0.3–3 | oui | non | oui | touche le hall de stockage                                            | ok                                                                                                                                                                                                                                                 |
| `office` | Bureau | 6–12 | 0.5–2 | non | non | non |                                                                       | ok, mais on peut réduire sa taille minimale potentiellement enfin à voir, on pourrait aussi envisager (et c'est le cas avec d'autres pièces comme je le disais) d'avoir plusieurs des pièces du même type mais avec des configurations différentes |
| `guard_room` | Salle de garde | 16–30 | 0.5–2 | oui (poste de garde) | oui (poste de garde) | non |                                                                       | ok                                                                                                                                                                                                                                                 |
| `captain_office` | Bureau du capitaine | 9–16 | 0.5–2 | non | non | non | touche la salle de garde                                              | ok                                                                                                                                                                                                                                                 |
| `cell` | Cellule | 4–6 | 0.5–2 | non | non | non | touche la salle de garde ; ne touche pas l'entrée                     | ok                                                                                                                                                                                                                                                 |
| `armory` | Armurerie | 6–12 | 0.5–2 | non | non | non | touche la salle de garde ; pas de porte vers l'entrée                 | ok                                                                                                                                                                                                                                                 |
| `courtyard` | Cour intérieure | 16–36 | 0.5–2 | non | non | non | `structural` + `outdoor` : premier vrai test des pièces structurantes | ok                                                                                                                                                                                                                                                 |
| `main_room` | Pièce principale | 16–30 | 0.5–2 | oui | oui | oui |                                                                       | ok                                                                                                                                                                                                                                                 |

Pour la salle de garde, ouverte et prioritaire dans le poste de garde mais fermée dans l'entrepôt : surcharge par le preset (T-3).

### 14.3 Programmes de RDC proposés

| Preset | RDC généré | Ignoré en P0 | Enveloppe par défaut | Réponse MJ |
|---|---|---|---|------------|
| Manoir | Entrée, Grand hall, Salon, Bibliothèque, Salle à manger, Cuisine, Cellier ; escalier vers l'étage, trappe vers la cave | Chambres ×4, Chambre des maîtres (étage) ; Cave (sous-sol) | 16 × 12 | oui        |
| Lieu de culte | Entrée, Nef, Sacristie, Chapelle latérale ; escalier vers la crypte | Crypte (sous-sol) | 10 × 16 | oui        |
| Entrepôt / Dock | Hall de stockage, Quai de chargement, Bureau, Salle de garde ; escalier de mezzanine | Mezzanine (étage) | 16 × 12 | oui        |
| Poste de garde | Entrée, Salle de garde, Bureau du capitaine, Cellules ×2, Armurerie, Cour intérieure ; escalier | Étage (programme à définir) | 14 × 12 | non        |
| Habitation modeste | Pièce principale, Cuisine, Chambre ×1–2 | Cave (sous-sol, T-4) | 8 × 7 | non        |

### 14.4 Mise en œuvre et constats (24/10/2026)

Fait : presets Manoir (`manor`), Lieu de culte (`temple`) et Entrepôt / Dock (`warehouse`) avec les types du §14.2 qu'ils utilisent, plus Chambre des maîtres, Cave et Crypte (non générés en P0). Choix du preset dans la page par boutons (T-1, sans planche) ; changer de preset reprend ses dimensions et sa densité. Les tests automatiques tournent sur les quatre presets. Poste de garde et Habitation modeste non faits (réponse « non » ci-dessus, raison à préciser). Pas de surcharge de type par preset tant que T-3 n'est pas tranché.

| Preset | Constat (12 à 25 graines testées par réglage) |
|---|---|
| Lieu de culte | Aboutit partout en 4 à 6 tentatives. La nef, ouverte et prioritaire, prend presque tout et dessert tout : les trois densités donnent le même plan. L'entrée tombe souvent sur un long côté de la nef et un bas-côté de 2 cases reste en dégagement : rien n'oriente la nef (entrée sur un petit côté, chœur au fond). |
| Entrepôt / Dock | Aboutit partout en 1 à 3 tentatives. Sans pièce « Entrée », le quai de chargement sert d'entrée (première pièce extérieure du programme). |
| Manoir | Le plus difficile : 10 à 17 tentatives en moyenne, 9 graines sur 12 seulement en aéré (couloir trop large), pas mal de dégagements. Sept pièces dans 16 × 12 avec deux liens verticaux laissent peu de marge. |

### 14.5 Points ouverts issus des réponses

| # | Question | Proposition                                                                                                                                                                                                                                                       | Réponse MJ                                                                                                                                                                                             |
|---|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| F-1 | Étage d'un type de pièce (suite de T-3) : n'importe quel type peut aller à n'importe quel étage, sauf certains qui y sont attachés (grenier : toujours sous les combles). | L'étage porté par le type devient une préférence par défaut ; un type peut le verrouiller (`floorLocked`, ex. grenier = dernier étage) ; le preset place ses pièces librement sauf verrou. À trancher avec P1 (étages).                                           | ok                                                                                                                                                                                                     |
| F-2 | Variantes d'un même type (grand salon / petit salon de type boudoir, bibliothèques, bureaux de tailles différentes). | Des types distincts qui partagent un « rôle » (ex. `living_room_large`, `boudoir`) plutôt qu'un type à configurations multiples : plus simple, et le preset choisit la variante.                                                                                  | oui et non, enfin je susi d'accord sur le principe mais un preset ne fait pas toujours ce choix là. Pour l'instant oui mais dans le futur, l'utilisateur pourra décider directement                    |
| F-3 | Pièce qui peut toucher l'extérieur sans y être obligée (salon avec ou sans fenêtres) ; hall qui fait office d'entrée. | Aujourd'hui `exterior` veut dire « doit toucher l'extérieur et a une porte dehors ». Ajouter un niveau « peut » (préférence, sans porte) le jour où l'on dessine les fenêtres. Le hall d'entrée : un preset peut le marquer `exterior` pour qu'il serve d'entrée. | Oui mais une verranda par exemple c'est forcément collé à l'extérior voir même cela sort du cadre du bâtiment vers l'extérieur mais on a pas toujours des portes/ouvertures sur l'extérieur, à méditer |
| F-4 | Pourquoi « non » au Poste de garde et à l'Habitation modeste (§14.3) ? | pour rester simple et pas trop surchargé de preset mais en vrai tu peux les faires aussi si tu veux, ça ajoute plus de tests pour le proto                                                                                                                        |                                                                                                                                                                                                        |

---

## 15. Pièce contenue dans une autre — réflexion (phase 1)

> Idée du MJ, jugée secondaire : un escalier peut être isolé, mais aussi dans un salon, un hall de manoir, voire une cuisine ; une cheminée (pas vraiment une pièce, mais structurante dans notre modèle) se trouve dans une cuisine, une chambre ou un salon.
>
> Constat : aujourd'hui, un lien vertical a ses propres cases, entourées de murs, avec un seul passage : c'est toujours une cage d'escalier. Rien ne permet de le fondre dans une pièce.
>
> Piste : une notion d'**élément** à côté des pièces. Un élément a une emprise sur la grille, peut être structurant (même place à chaque étage, comme le conduit d'une cheminée), et déclare les types de pièces qui peuvent l'accueillir. Accueilli, il est dessiné dans la pièce hôte sans mur autour, et on y accède par elle. La pièce hôte est placée en premier autour de l'élément (même principe que les pièces prioritaires). Les liens verticaux deviendraient des éléments, isolés (cage) ou accueillis.

| # | Question | Proposition | Réponse MJ                                                                                                                                         |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------|
| C-1 | Élément ou pièce ? | Notion distincte de la pièce, avec sa bibliothèque : escalier, trappe, cheminée, et plus tard puits, autel, four… Les liens verticaux en deviennent un cas particulier (élément qui relie deux étages). | oui disons que dans la réflexion initiale on a spécifié qu'il existait uniquement des "pièces" mais on pourrait tout à fait aller plus loin        |
| C-2 | Où peut aller un élément ? | Il déclare ses pièces hôtes possibles (`hostTypes`) et s'il peut rester isolé (`standalone`). Escalier : isolé ou dans un hall, un salon, une cuisine. Cheminée : jamais isolée, dans une cuisine, une chambre ou un salon. Le preset choisit, la graine tranche entre les possibilités. | oui                                                                                                                                                |
| C-3 | L'emprise de l'élément compte-t-elle dans la surface de la pièce hôte ? | Non : la pièce garde sa surface utile (`sizeMin` / `sizeMax`) et grandit d'autant. | Hum pas forcément, un élément ne va pas obligatoirement agrandir la pièce qui l'accueille, c'est une possiblité mais pas une obligation selon moi. |
| C-4 | Contraintes de position | Cheminée contre un mur (de préférence extérieur, pour le conduit), emprise 1 × 2. Escalier accueilli : contre un mur de la pièce, jamais devant une porte. | oui, tu as raison faut introduire cette notion de jamais devant une porte pour certains éléments                                                   |
| C-5 | Quand ? | Après P1 (étages) : l'intérêt principal (escalier dans le hall au RDC, sur un palier à l'étage ; conduit de cheminée qui traverse les étages) n'apparaît qu'avec plusieurs niveaux. | oui après                                                                                                                                          |

> Bilan des réponses F et C (24/10/2026) :
> - F-1 validé, à mettre en œuvre avec P1. F-2 : types distincts pour l'instant ; plus tard, l'utilisateur choisira lui-même la variante. F-3 : à méditer (une véranda touche forcément l'extérieur, peut même déborder du bâtiment, sans avoir toujours d'ouverture dehors). F-4 : sans réponse, Poste de garde et Habitation modeste restent de côté.
> - Éléments (C-1 à C-5) : notion validée, à faire après P1. C-3 révisé : la pièce hôte peut s'agrandir de l'emprise de l'élément, sans obligation (choix par élément ou par la graine, à préciser). C-4 : certains éléments déclarent « jamais devant une porte ».

---

## 16. Forme du bâtiment (gabarit) — réflexion (phase 1)

> **Reporté** (décision du MJ, 24/10/2026) : réflexion pour plus tard. Priorité à éprouver la génération de base.

> Remarque du MJ : un lieu de culte n'est pas toujours un rectangle ; une église a souvent un plan en croix (croix latine).
>
> Constat : aujourd'hui l'enveloppe est un rectangle, et le seul écart possible est le contour libre (§13, O-4), qui retire après coup les restes inutilisés dans un angle. C'est une forme subie, pas voulue : rien ne permet de demander une croix, un T ou un U. Le moteur sait déjà travailler sur une enveloppe trouée (cases `OUTSIDE` à l'intérieur de la grille), ce qui rend un gabarit imposé dès le départ assez naturel.
>
> Piste : un **gabarit** d'enveloppe, choisi par le preset et modifiable par l'utilisateur. La largeur et la longueur restent celles du rectangle englobant ; le gabarit retire les cases hors forme avant toute génération (étape 1 du §6.1), puis tout se déroule comme aujourd'hui sur la forme restante.

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                           |
|---|---|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| B-1 | Quels gabarits ? | Rectangle (défaut), L, T, U, croix latine (bras inégaux : pied long, tête courte, transept), croix grecque (bras égaux). | oui, on peut ajouter aussi une "altère" comme forme, donc un centre étroit et des ailes plus grandes                                                                                                 |
| B-2 | Proportions d'un gabarit (largeur des bras, position du transept…) | Plages fixées par gabarit dans un fichier de données, valeur tirée par la graine. Ex. croix latine : transept aux deux tiers de la longueur vers la tête, bras du transept de la largeur de la nef. | pour une première version ça me semble bien oui                                                                                                                                                      |
| B-3 | Le gabarit oriente-t-il les pièces ? Pour une église : entrée au pied de la croix, nef dans le bras long, chapelles dans les bras du transept, chœur à la tête. | En deux temps. D'abord la forme seule (les pièces s'y répartissent librement). Ensuite des **zones** nommées par le gabarit (`foot`, `arm`, `head`…) que les types de pièces peuvent viser. | En deux temps oui mais en effet c'est une bonne question à laquelle il n'y pas de réponse formelle, ça dépends quoi                                                                                  |
| B-4 | Entrée sur un petit côté même dans un rectangle (constat du §14.4 : l'entrée tombe souvent sur un long côté de la nef). | Règle de preset « entrée sur un petit côté », indépendante du gabarit, faisable tout de suite. | bah ça dépend du gabarit non ? Sur une église Chrétienne, tu veux que l'entrée soit en bas de la croix, et d'ailleurs c'est possiblement un sas. Donc à étudier, restons simple dans unpremier temps |
| B-5 | Gabarit et contour libre | Le contour libre ne s'applique qu'au gabarit rectangle pour l'instant ; avec un autre gabarit, la forme est imposée et les restes vont aux pièces ou au couloir. | est-ce que c'est pas une 3ème option ?                                                                                                                                                               |
| B-6 | Quand ? | Le gabarit seul (B-1, B-2, B-5) est indépendant des étages et peut se faire avant P1 ; les zones (B-3) ensuite. | oui je pense                                                                                                                                                                                         |

---

## 17. Banc d'essai de la génération de base — constats et questions

> Banc d'essai du 24/10/2026 (script temporaire, non conservé) : les 4 presets, l'enveloppe par défaut multipliée par 0,8 à 1,5, les 3 densités, 15 graines par combinaison, contour rectangulaire.

### 17.1 Constats

| Enveloppe par rapport au défaut | Résultat |
|---|---|
| Plus petite (× 0,8) | Échec propre et bien diagnostiqué (« trop de pièces pour la surface ») pour l'auberge ; manoir en aéré à 9 sur 15. |
| Autour du défaut (× 0,9 à × 1,15) | Tout aboutit, ou presque, en 1 à 20 tentatives, en moins de 0,5 s. |
| Plus grande (× 1,3 et au-delà) | **Échec quasi systématique** sur les quatre presets (0 sur 15 dès × 1,3 pour le manoir, le lieu de culte et l'entrepôt ; l'auberge tombe à 6 sur 15 en 16 × 12). |

- **Cause** : quand l'enveloppe dépasse ce que les pièces peuvent occuper (somme des `sizeMax`), le surplus devient un dégagement trop large, rejeté par la largeur maximale du couloir. Avant cette limite, le même surplus faisait les grands « halls » informes signalés au §12.
- **Message trompeur** : l'échec est rapporté comme « graine défavorable, essayez une nouvelle graine », alors qu'aucune graine ne peut réussir. La vraie cause est « bâtiment trop grand pour son programme ».
- **Lenteur** : un échec épuise les 60 tentatives, jusqu'à 3 s.
- En pratique, le générateur n'accepte aujourd'hui qu'une plage étroite de dimensions par programme. Un MJ qui veut une grande auberge avec le même programme ne peut pas l'obtenir.

### 17.2 Questions

| # | Question | Proposition | Réponse MJ                                                                                 |
|---|---|---|--------------------------------------------------------------------------------------------|
| S-1 | Que faire du surplus quand l'enveloppe est trop grande pour le programme ? (a) agrandir les pièces au-delà de leur `sizeMax` ; (b) ajouter des pièces de complément (réserve, débarras, pièce sans attribution) ; (c) réduire le bâtiment (contour libre, ou enveloppe rétrécie au programme) ; (d) refuser avec un message juste. | (d) toujours, et (b) en option : des pièces de complément tirées d'une liste propre au preset (auberge : réserve, chambre de service ; manoir : boudoir, office…), de taille raisonnable, jusqu'à absorber le surplus. (a) déforme les pièces, (c) existe déjà en contour libre. | hmm, suivons ta reco même si je pense que c'est un mélange avec c aussi à adopter au final |
| S-2 | Message d'échec pour ce cas | Nouvelle cause « bâtiment trop grand pour son programme », détectée avant les tentatives (somme des `sizeMax` et des liens nettement inférieure à la surface) : réponse immédiate, avec les suggestions « réduire les dimensions », « ajouter des pièces » ou « contour libre ». | oui                                                                                        |
| S-3 | Plage de dimensions à viser | Chaque preset devrait aboutir de × 0,9 à × 1,5 au moins de son enveloppe par défaut ; le banc d'essai devient un test automatique sur cette plage. | ok pour moi                                                                                |
| S-4 | Durée d'un échec | Avec S-2, les cas sans issue répondent tout de suite ; les autres gardent leurs 60 tentatives (moins de 0,5 s autour du défaut). | ok pour moi                                                                                |

### 17.3 Décisions et mise en œuvre (24/10/2026)

Direction validée par le MJ, dans cet ordre : (1) message juste pour le bâtiment trop grand ; (2) réservoir de pièces de complément ; (3) schémas de circulation, simples d'abord ; (4) formes du bâtiment, vraiment en dernier. Schémas et réservoir restent des **options** du preset, jamais des obligations du système (point de vigilance du §2.1) ; à terme, l'utilisateur pourra modifier le preset et rendre obligatoires forme, pièces, etc.

Fait pour (1), cause `oversize` :
- détectée avant les tentatives (réponse immédiate) quand le surplus dépasse `maxSurplus` (20 % de la surface, `engine.json`) une fois comptées les tailles maximales des pièces du RDC, les liens et un couloir de la largeur de la densité sur la plus grande dimension ; pas de détection anticipée en contour libre, où le surplus peut être retiré du bâtiment ;
- rapportée aussi après les tentatives quand elles échouent sur un dégagement trop large ;
- message et suggestions au §6.2, boutons « Largeur −2 », « Longueur −2 », « Contour libre ».

Effet sur le banc d'essai : les grandes enveloppes répondent `oversize` en moins d'1 ms au lieu de 0,3 à 3 s ; les cas limites (auberge 16 × 12, entrepôt 18 × 14 en équilibré) tentent encore et réussissent sur un tiers des graines, l'échec étant alors rapporté `oversize`.

---

## 18. Réservoir de pièces et schémas de circulation — questions

> Remarques du MJ : un manoir est souvent organisé autour de couloirs obligatoires (un à gauche et un à droite qui partagent le bâtiment, ou une galerie le long d'un mur extérieur, souvent celui du fond) sur lesquels les pièces s'ajustent ; le preset pourrait porter plus d'informations que sa liste de pièces, ce qui donnerait de meilleurs résultats et piloterait la largeur des couloirs. Le manoir manque aussi de pièces : plusieurs petits salons en plus du grand salon et de la salle à manger, une étude, etc.
>
> Constat : le couloir est aujourd'hui *déduit* (relier l'entrée aux escaliers et aux pièces prioritaires, ramifier, élaguer) ; pour un bâtiment dont le couloir est l'épine dorsale, le moteur doit inventer l'organisation et le fait mal. D'où la difficulté du manoir et les meilleurs résultats en dense.

### 18.1 Réservoir de pièces de complément (étape 2)

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                      |
|---|---|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P-1 | Forme dans le preset | Une seconde liste `optionalRooms`, mêmes entrées que `rooms` (`type`, `quantity` en plage, ex. `[0, 2]`). Avant la génération, la graine pioche dans le réservoir tant que le surplus estimé (§17) dépasse le seuil ; si le réservoir est épuisé, message `oversize`. | Oui mais est-ce que c'est pas la graine qui décide juste si on pioche ou pas dedans et quoi, sinon comment tu garanti qu'une graine sera capable de refaire la même chose ?                     |
| P-2 | Contenu par preset (nouveaux types à valider ensuite, tailles comprises) | Auberge : Réserve, Bureau du tenancier, Lavoir. Manoir : Petit salon ×0–2, Étude, Boudoir, Office, Fumoir. Lieu de culte : Chapelle latérale ×0–2, Baptistère, Salle capitulaire. Entrepôt : Réserve ×0–2, Atelier, Vestiaire. | Pour les tests cette liste me va bien                                                                                                                                                           |
| P-3 | Les pièces piochées respectent-elles les mêmes règles que les autres ? | Oui (tailles, voisinages, portes) ; elles se placent après les pièces obligatoires, au même niveau de hiérarchie que les pièces ordinaires. | oui                                                                                                                                                                                             |
| P-4 | Affichage dans la page | Le réservoir est listé sous le programme (« complément, selon la place ») ; le plan affiche les pièces piochées comme les autres. | oui, faudra juste remonter un bouton de génération plus haut ou rendre collapsable certaines partie sinon l'UX devient vite merdique. C'est pas bien grave pour le moment ça va vite le devenir |

### 18.2 Schémas de circulation (étape 3)

| # | Question | Proposition | Réponse MJ                         |
|---|---|---|------------------------------------|
| SC-1 | Catalogue de départ | Trois schémas : **couloir traversant** (coupe le bâtiment en deux dans sa longueur, pièces de part et d'autre), **galerie** (le long d'un mur, de préférence celui opposé à la façade d'entrée), **enfilade** (pas de couloir). Sans schéma : fonctionnement actuel. Le manoir à deux couloirs (gauche et droite) viendrait ensuite. | ok                                 |
| SC-2 | Paramètres | `layout: { scheme, width }` dans le preset ; la graine choisit le côté, la position exacte et le sens. La largeur du schéma prime sur celle de la densité, dans la limite de la largeur maximale. | ok                                 |
| SC-3 | Place dans l'ordre de génération | Le couloir du schéma est structurant : posé juste après l'entrée et les liens verticaux (que l'on place de préférence contre lui), avant les pièces prioritaires. Il n'est jamais élagué. | oui ça semble bien                 |
| SC-4 | Schéma et densité | Avec un schéma, la densité ne règle plus que les portes supplémentaires et les ramifications éventuelles ; sans schéma, elle garde son rôle actuel. | oui ça me semble correct           |
| SC-5 | Schémas par défaut des presets | Manoir : galerie ou couloir traversant (tirés par la graine). Auberge, entrepôt : sans schéma. Lieu de culte : enfilade. | oui pour les tests on fait comme ça |

> Décisions S et §18 (24/10/2026) : S-1 selon la recommandation (message juste + réservoir), le MJ pressent qu'il faudra aussi y mêler la réduction du bâtiment ; S-2 à S-4, P-1 à P-4, SC-1 à SC-5 validés. P-1 précisé : c'est la graine qui décide si l'on pioche et quoi ; le tirage est fait une fois par graine, à partir d'un générateur dérivé de la graine, et ne dépend que du programme et des dimensions : même graine et mêmes réglages, mêmes pièces piochées. P-4 : remonter les boutons d'action et rendre des parties repliables, avant que l'interface ne devienne pénible.

### 18.3 Mise en œuvre (24/10/2026)

- **Réservoir** : `optionalRooms` dans les presets (contenu du P-2), 12 nouveaux types (Réserve, Bureau du tenancier, Lavoir, Petit salon, Étude, Boudoir, Office, Fumoir, Baptistère, Salle capitulaire, Atelier, Vestiaire ; l'office touche la cuisine, le baptistère la nef). Pioche dans un ordre mélangé par la graine, tant que la capacité (tailles maximales, liens, couloir) reste inférieure à la surface et que la somme des tailles minimales ne dépasse pas `maxLoad` (75 %) de la surface. Les pièces piochées d'un type déjà présent s'ajoutent à ses exemplaires (« Chapelle latérale 1, 2, 3 »).
- **Schémas** : couloir traversant le long du grand côté (aligné sur l'entrée quand elle est sur un petit côté, sinon vers le milieu ; au moins `schemeMinDepth` = 3 cases de pièces de chaque côté) ou galerie contre le mur opposé à la façade, de largeur `layout.width` (sinon `schemeWidth` = 2) dans la limite de la largeur maximale. Posé juste après l'entrée, il ne prend que des cases libres. Les liens verticaux se placent de préférence contre lui. S'il ne touche pas le réseau une fois les pièces prioritaires posées, un raccordement le relie à l'entrée ; couloir et raccordement ne sont jamais élagués. Avec un schéma, pas de ramifications ; l'enfilade supprime tout couloir.
- **Page** : choix de la circulation (« Preset (…) », Libre, Traversant, Galerie, Enfilade) ; boutons Générer / Nouvelle graine en haut du panneau ; programme (avec « Complément, selon la place ») et liens verticaux repliables.

### 18.4 Constats (banc d'essai, 12 graines par cas)

| Preset | × 0,9 | × 1 | × 1,2 | × 1,5 |
|---|---|---|---|---|
| Auberge | 12/12 | 12/12 | 12/12 | 0/12, `oversize` |
| Manoir | 12/12 | 12/12 | 11/12 | 0/12, `oversize` |
| Lieu de culte | 12/12 | 12/12 | 10/12 | 0/12, `oversize` |
| Entrepôt | 12/12 | 12/12 | 12/12 | 0/12, `oversize` |

- Le **× 1,2** passe désormais partout, grâce au réservoir (il échouait au §17). L'objectif S-3 (× 1,5) n'est pas atteint : les réservoirs actuels sont trop petits pour combler une telle surface. Ce sont des données, pas le moteur : un réservoir plus fourni (ou des quantités plus hautes) élargirait la plage. Le test automatique vérifie × 0,9 à × 1,2.
- **Manoir** : avec un schéma, il s'organise autour d'un couloir traversant ou d'une galerie, les pièces rangées de part et d'autre ; il aboutit en 7 à 8 tentatives au défaut, et pioche selon la place boudoir, fumoir, étude, office. Il reste des dégagements en bout de couloir ou le long du mur.
- **Lieu de culte** en enfilade, × 1,2 : la nef en long bandeau, jusqu'à trois chapelles latérales, baptistère et salle capitulaire.

---

## 19. Dégagements qui ne desservent rien et échecs du manoir — questions

> Retours du MJ :
> - Auberge, enfilade, 12 × 9, dense, couloir 1, contour rectangle, graine 509013140 : un bout de couloir coincé en bas à gauche entre le cellier et le mur extérieur. Il ne dessert rien ; le cellier devrait prendre cet espace. Dans une vraie auberge, ce couloir n'existerait que pour une porte de service, et encore : le cellier pourrait l'avoir lui-même.
> - Manoir, 16 × 12, circulation du preset, dense, couloir 1, contour rectangle : beaucoup d'échecs « bâtiment trop grand », et les plans réussis n'ont pas forcément de pièces du réservoir.
>
> Diagnostic :
> - **Auberge** : il reste une bande de 1 × 3 cases contre le cellier. Le cellier (12 cases) et la cuisine (24) sont déjà à leur taille maximale : personne ne peut la prendre sans dépasser `sizeMax`, elle devient donc un dégagement (relié au cellier par un passage).
> - **Manoir** : ce n'est pas le bâtiment qui est trop grand (le contrôle préalable passe), ce sont les tentatives qui échouent sur un dégagement trop large pour un couloir de 1 case (accolé au couloir du schéma, il forme un carré de 2 × 2). Le message `oversize` est donc trompeur dans ce cas. En cause : le réservoir ne pioche que tant que la capacité théorique (toutes les pièces à leur taille maximale) reste inférieure à la surface ; or les pièces atteignent rarement leur maximum (formes, ratios), d'où des restes, et presque aucune pioche à la taille par défaut (0,33 pièce piochée par plan).
>
> Mesures (12 cas, 20 graines chacun, deux réglages testés en plus du fonctionnement actuel) :
>
> | Réglage | Réussites | Couloir et dégagements | Pièces piochées par plan | Manoir 16 × 12, dense, couloir 1 | Graine 509013140 |
> |---|---|---|---|---|---|
> | Actuel | 163 / 240 | 11,5 % de la surface | 0,33 | 4 / 20 | dégagement de 3 cases, cellier 12 |
> | Restes pouvant dépasser `sizeMax` de 25 % | 167 / 240 | 9,6 % | 0,35 | 6 / 20 | — |
> | Réservoir visant 115 % de la surface | 179 / 240 | 10,6 % | 1,30 | 16 / 20 | — |
> | Les deux | 185 / 240 | 9,2 % | 1,36 | 16 / 20 | **aucun dégagement, cellier 15** |
>
> Restent difficiles : manoir × 1,2 avec couloir 1 (0 / 20) et manoir sans schéma en équilibré avec couloir 1 (6 / 20).

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| D-1 | Un reste qui ne dessert rien peut-il agrandir une pièce au-delà de sa taille maximale ? | Oui, de 25 % au plus (`leftoverOverflow`), seulement pour absorber un reste, et seulement si la pièce garde une forme rectangle ou L ; `sizeMax` reste la limite de la croissance normale. Corrige la graine 509013140. | |
| D-2 | Le réservoir doit-il viser plus large que la capacité théorique ? | Oui : piocher jusqu'à 115 % de la surface (`fillMargin`), puisque les pièces n'atteignent presque jamais leur maximum. Plus de pièces de complément à la taille par défaut (1,3 par plan au lieu de 0,33), et le manoir dense en couloir 1 passe de 4 à 16 réussites sur 20. | |
| D-3 | Message des échecs dus à un dégagement trop large | Le distinguer du bâtiment trop grand : « Il reste de la place que les pièces n'arrivent pas à occuper. », suggestions : nouvelle graine, couloir plus large autorisé, dimensions réduites. | |
| D-4 | Porte de service (idée du MJ) | Notée pour plus tard, avec F-3 : une pièce peut recevoir une porte vers l'extérieur sans être `exterior` (cellier, cuisine, écurie). | |

> **Décisions (24/10/2026)** : D-1 à D-4 validés par le MJ. Mis en œuvre : `leftoverOverflow` = 0,25 et `fillMargin` = 1,15 dans `engine.json` ; nouvelle cause d'échec `unfilled` (dégagement plus large que le couloir autorisé), distincte de `oversize`, avec les boutons « Nouvelle graine », « Couloir jusqu'à N cases », « Largeur −2 », « Longueur −2 », « Contour libre ». Tests ajoutés : la graine 509013140 ne laisse plus aucun dégagement, le manoir dense en couloir 1 aboutit sur au moins 14 graines sur 20. D-4 (porte de service) reste pour plus tard.

---

## 20. Graine 539372935 et passage aux étages (P1)

### 20.1 Petit salon coincé entre le cellier et l'étude

> Retour du MJ : manoir, circulation du preset, dense, couloir 1, contour rectangle, graine 539372935 : un petit salon coincé entre un cellier et une étude. Le MJ pense que les formes (§16) régleront ce type de problème à terme.
>
> Diagnostic : le couloir traversant dessert la plupart des pièces, mais le petit salon ne le touche pas. Il passait quand même le contrôle de desserte parce qu'il touchait un **dégagement isolé**, compté à tort comme réseau de circulation. Faute de vraie desserte, l'arbre des portes l'a relié par le cellier et par l'étude : on entre dans un salon de réception en traversant un cellier.
>
> **Corrigé** (24/10/2026) : la desserte ne compte plus que le couloir principal et les pièces ouvertes. Effet : ce plan est maintenant rejeté (tentative suivante), mais le manoir aboutit moins souvent, car une partie de ses réussites reposait sur ce défaut : en dense couloir 1, 10 graines sur 20 au lieu de 16 ; à × 1,2, 4 sur 8. Seuils des tests ajustés en conséquence.

| # | Question | Proposition | Réponse MJ     |
|---|---|---|----------------|
| T2-1 | Pièce de service qu'on ne traverse jamais (cellier, réserve, cellule, office…) | Propriété `noTransit` : une telle pièce peut être un cul-de-sac mais jamais un passage vers une autre pièce. Évite le salon desservi par le cellier, même en enfilade (dense). | oui bonne idée |
| T2-2 | Taux de réussite du manoir après la correction | À reprendre après P1 : avec les étages, une partie du programme (chambres) quitte le RDC et les schémas pourront mieux s'organiser ; les formes (§16) aideront aussi. | oui            |

### 20.2 Étages : phase 1 (questions)

> Objectif du MJ : des plans cohérents d'un étage à l'autre, tout l'intérêt du générateur.
>
> Déjà acquis dans la spec : emprise des liens verticaux réservée à l'identique sur les deux étages qu'ils relient (§2.3) ; structurants posés en premier et au même endroit d'un étage à l'autre (§6.1) ; même emprise à tous les niveaux (G-2) ; mezzanine = étage normal au programme réduit (G-5) ; cour à ciel ouvert = emprise vide au-dessus (G-7) ; pièces `upper` réparties par la graine (G-13) ; étage d'un type = préférence, verrou possible (F-1) ; navigation par onglets d'étage (§4.3).

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                                                                                                                                                                            |
|---|---|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| E2-1 | Ordre de génération | RDC d'abord (il porte l'entrée et la façade), puis les étages en montant, puis le sous-sol. Chaque niveau hérite des contraintes de celui d'en dessous (ou d'au-dessus pour le sous-sol). Si un niveau échoue après ses tentatives, on reprend tout le bâtiment avec la tentative suivante (le résultat reste reproductible). | oui                                                                                                                                                                                                                                                                                                                                                                                                   |
| E2-2 | Racine du réseau à l'étage (il n'y a pas d'entrée) | L'arrivée de l'escalier : son palier joue le rôle de l'entrée. Le couloir de l'étage part de là. | oui évidemment                                                                                                                                                                                                                                                                                                                                                                                        |
| E2-3 | Couloirs d'un étage à l'autre | Avec un schéma (galerie, traversant), le couloir de l'étage se pose **au-dessus** de celui du RDC, comme en vrai (murs porteurs). Sans schéma, il part de l'arrivée de l'escalier et suit les règles actuelles. | oui ça parait cohérent et normal jusque là                                                                                                                                                                                                                                                                                                                                                            |
| E2-4 | Murs d'un étage à l'autre | Préférence, pas obligation : à score égal, une pièce de l'étage se cale sur les murs du dessous. Pas de contrainte stricte en P1 (les étages ont souvent des cloisons différentes). | oui ok                                                                                                                                                                                                                                                                                                                                                                                                |
| E2-5 | Escaliers qui montent plus haut (bâtiment de 2 étages et plus) | Le preset déclare chaque lien (RDC → 1, 1 → 2…). Par défaut, un lien qui prolonge un autre se place au même endroit (cage d'escalier continue) ; la graine peut le décaler si le preset l'autorise. | Oui. Deux choses à noter cependant. 1: un escalier RDC peut aussi aboutir à un sous-sol, là on a séparé mais c'est pas impossible. 2. Il faudrait potentiellement permettre de cliquer sur un escalier pour "monter" ou "descendre" et afficher l'étage suivant/précédent dans l'interface, pas obligatoire immédiatement mais à noter pour l'interface finale je pense                               |
| E2-6 | Sous-sol | Il n'est pas creusé partout : son emprise utile part du lien qui y descend et ne garde que ce que son programme occupe. Le reste est **non excavé** (dessiné plein ou hachuré, ni pièce ni couloir). Évite les dégagements géants sous un manoir qui n'a qu'une cave. | oui ok                                                                                                                                                                                                                                                                                                                                                                                                |
| E2-7 | Étage plus petit que le programme ne le permet (ex. auberge : 4 chambres sur 12 × 9) | Le réservoir (§18.1) s'applique à chaque niveau, avec ses propres pièces de complément (auberge à l'étage : chambre ×0–2, lingerie, salle d'eau). Le message `oversize` porte sur le niveau concerné. | Justement, on peut très bien avoir un étage plus petit que le précédent tant qu'il reste formé dans le cadre de l'étage d'avant, la mezzanine est le parfait exemple même si c'est peut-être un cas à part. Et inversement, on peut aussi avoir un étage plus grand, aka qui dépasse du cadre, exemple typique les maisons avec une alcôve en rdc, l'étage supérieur est plus long de quelques cases. |
| E2-8 | Programmes d'étage des presets | Auberge étage : chambres ×4 (+ réservoir). Manoir étage : chambres ×4, chambre des maîtres (+ boudoir, salle d'eau, lingerie) ; sous-sol : cave. Lieu de culte sous-sol : crypte. Entrepôt étage (mezzanine) : bureau, réserve ×1–2. Poste de garde et habitation modeste toujours de côté. | Pour l'instant ok                                                                                                                                                                                                                                                                                                                                                                                     |
| E2-9 | Contour libre avec étages | Un étage ne déborde jamais du niveau inférieur ; il peut être plus petit (cases retirées au-dessus du vide ou d'une cour). On garde le contour libre réservé au RDC en P1 : les étages reprennent son contour. | cf ma remarque E2-7                                                                                                                                                                                                                                                                                                                                                                                   |
| E2-10 | Interface | Onglets d'étage au-dessus de l'aperçu (Sous-sol, RDC, Étage 1…), paramètres « étages » (0 à 4) et « sous-sol » (oui / non) dans le panneau, initialisés par le preset. La graine affichée vaut pour tout le bâtiment. | oui pour l'instant                                                                                                                                                                                                                                                                                                                                                                                    |

> **Réponses du MJ (24/10/2026)** : E2-1 à E2-4, E2-6, E2-8 et E2-10 validés. T2-1 (`noTransit`) et T2-2 validés.
> - E2-5 : validé, avec deux remarques : un escalier du RDC peut aussi aboutir au sous-sol (déjà possible : un lien relie deux niveaux quelconques) ; plus tard, cliquer sur un escalier pour monter ou descendre d'étage dans l'interface (noté pour l'interface finale).
> - E2-7 et E2-9 : un étage peut être **plus petit** que celui du dessous, tant qu'il reste dans son cadre (la mezzanine en est l'exemple), mais aussi **plus grand**, en débordant du cadre (maison avec une alcôve au RDC, étage plus long de quelques cases).

### 20.3 Mise en œuvre et constats (24/10/2026)

Fait :
- **Génération par niveau** : RDC, étages en montant, puis sous-sol ; chaque niveau hérite de celui d'en dessous (le sous-sol, du RDC). Hors RDC, un niveau a jusqu'à `levelAttempts` (8) essais sur le même dessous avant qu'on reprenne tout le bâtiment ; le résultat reste reproductible.
- **Pièces et étages tirés une fois par graine** (quantités, étage des pièces `upper`, réservoir niveau par niveau). Une pièce « à l'étage » va à l'étage le moins chargé : sans cela, un étage surchargé ne tenait plus au-dessus d'étages déjà resserrés.
- **Escaliers** : même emprise sur les deux niveaux qu'ils relient ; un escalier par étage supplémentaire est ajouté automatiquement dans la même cage (E2-5), un escalier de cave si un sous-sol existe sans lien. Sur le plan, chaque cage indique les niveaux desservis depuis l'étage affiché (« ↑ Étage 2 · ↓ RDC »).
- **Racine** : l'escalier d'arrivée hors RDC (E2-2), qui débouche sur le réseau.
- **Couloir du schéma** reposé au-dessus de celui du RDC (E2-3). Avec une galerie, les ramifications sont réactivées pour atteindre le fond du bâtiment (sans elles, aucun étage de manoir à galerie n'aboutissait).
- **Étage plus petit** (E2-7) : à l'étage, le contour libre est toujours actif ; un étage peu rempli se resserre (rectangle ou L), sans jamais déborder du dessous. La mezzanine de l'entrepôt se réduit ainsi à son programme.
- **Sous-sol** (E2-6) : sans couloir, ce que le programme n'occupe pas est non excavé (hachuré).
- **Desserte à l'étage** : quand l'étage a un couloir, une pièce fermée se pose contre le réseau dès qu'une position le permet ; une pièce qui donne sur le palier de l'escalier est desservie.
- **`noTransit`** (T2-1) : cellier, réserve, cave, lavoir, vestiaire, lingerie, salle d'eau ; une seule porte vers une pièce, jamais un passage.
- **Programmes d'étage** (E2-8) : auberge (chambres + chambre ×0–2, lingerie, salle d'eau), manoir (chambres, chambre des maîtres + chambre ×0–2, boudoir, salle d'eau, lingerie ; cave au sous-sol), lieu de culte (crypte), entrepôt (mezzanine : bureau, réserve ×1–2). Un preset peut surcharger l'étage d'un type (`"floor": "upper"`).
- **Interface** : réglages « Étages au-dessus du RDC » (0 à 4) et « Sous-sol » ; onglets de niveau au-dessus de l'aperçu (E2-10).

Constats (graines de test, réglages par défaut sauf mention) :

| Cas | Résultat |
|---|---|
| Auberge, lieu de culte, entrepôt | Aboutissent sur toutes les graines testées, en quelques dizaines de millisecondes |
| Manoir, schéma du preset | 11 / 12 ; avec couloir traversant 12 / 12 ; avec galerie 5 / 12 |
| Manoir × 0,9 | 7 / 12 |
| Manoir × 1,2 (19 × 14) | 0 / 12 (l'étage échoue ; le RDC seul aboutit 8 / 12) |
| Manoir dense, couloir 1 | 4 / 20 (10 / 20 sans étage) |
| Échec d'un manoir | 0,4 à 0,6 s (60 tentatives de bâtiment) |

Limites :
- **Étage du manoir** : ses pièces (chambres de 16 cases au plus) remplissent mal un étage profond, surtout au-dessus d'une galerie. Un réservoir d'étage plus fourni a été essayé (chambres ×0–4) et dégradait les résultats ; non retenu. Pistes : les formes (§16) et les éléments (§15).
- **Dégagements autour de l'escalier** : en enfilade, un escalier posé à une case d'un mur laisse une bande que personne ne prend (2 à 8 cases au RDC de l'auberge). Interdire cet écart a été essayé et n'améliorait rien ; non retenu.
- **Étage qui déborde** du dessous (alcôve, E2-7) : pas encore traité.
- **Clic sur un escalier** pour changer d'étage (E2-5) : pour l'interface finale.
- Les tests du générateur prennent environ 45 s (tous les niveaux de tous les presets).

---

## 21. Chambres desservies par un couloir

> Retour du MJ : auberge, réglages par défaut, graine 951791901 : à l'étage, la salle d'eau donne sur l'escalier et les chambres donnent sur d'autres chambres et sur la lingerie. Dans un étage de chambres, le couloir devrait dominer ; dans une auberge, une chambre devrait toujours donner sur un couloir.
>
> Diagnostic : l'auberge est en densité dense sans schéma, donc sans couloir à aucun niveau ; l'étage se desservait en enfilade (une chambre servait de passage vers trois autres pièces).

Fait (24/10/2026) :
- Propriété de type `corridorAccess` (§2.2) : la pièce donne toujours directement sur le réseau de circulation (couloir, pièce ouverte ou palier de l'escalier). Un niveau qui contient une telle pièce reçoit un couloir, quelle que soit la densité (largeur `accessCorridorWidth` = 1 dans `engine.json`, dans la limite de la largeur maximale) ; la pièce se pose contre le réseau dès qu'une position le permet, et le plan est rejeté si elle ne le touche pas.
- Chambre et chambre des maîtres sont `corridorAccess` ; la chambre devient aussi `noTransit` (on ne traverse jamais une chambre).
- Le réservoir compte ce couloir dans la capacité du niveau (sinon il piochait trop de chambres à l'étage).
- Graine 951791901 : l'étage a maintenant un couloir sur lequel ouvrent toutes les chambres et la lingerie ; la salle d'eau donne sur le palier.
- Auberge : 25 graines sur 25 au défaut ; à × 0,9 (11 × 8), 17 sur 25, les échecs venant tous du RDC, trop serré pour son programme.

### 21.1 Retest de la graine 951791901

> Retour du MJ : mieux, mais la salle d'eau donne toujours sur l'escalier, et trois pièces donnent sur un couloir inaccessible depuis l'escalier et l'autre couloir. Une salle d'eau ne devrait jamais donner sur un escalier.
>
> Diagnostic : la cage d'escalier coupait le couloir de l'étage en deux tronçons portant le même identifiant ; le moteur les croyait reliés et ne perçait qu'une ouverture depuis l'escalier. Le même défaut existait au RDC (deux tronçons qui ne se touchent que par un angle). Les tests ne le voyaient pas : ils traitaient eux aussi tout le couloir comme un seul nœud.

Corrigé (24/10/2026) :
- Chaque tronçon de couloir a son propre identifiant ; ceux qui touchent la racine ou une pièce ouverte restent du couloir à part entière (portes à battant), les autres sont des dégagements isolés (passage ouvert). L'escalier d'arrivée s'ouvre sur chaque tronçon qu'il touche.
- Sur un niveau qui a un couloir, aucune pièce fermée ne donne sur l'escalier d'arrivée (le palier ne compte plus comme desserte) ; sur un niveau sans couloir (mezzanine de l'entrepôt), c'est encore permis, c'est le seul accès.
- Le test d'accessibilité vérifie désormais la connexion physique, tronçon par tronçon ; nouveau test « aucune pièce fermée sur l'escalier d'un étage qui a un couloir ».
- Effet : des plans auparavant acceptés à tort (pièces inaccessibles) sont rejetés. Auberge en équilibré : 22 graines sur 25 ; manoir en aéré : 7 sur 12 ; manoir dense couloir 1 : 2 sur 20. Seuils des tests alignés, avec renvoi ici.
- Graine 951791901 : l'escalier s'ouvre sur les deux tronçons, toutes les pièces sont accessibles, la salle d'eau donne sur le couloir.

---

## 22. Pièces annexes — réflexion (phase 1)

> Remarque du MJ : une chambre peut servir de passage vers une salle d'eau attenante ou un dressing. Plus largement, certaines pièces n'existent qu'en rapport à une autre ; le cellier l'esquisse déjà (il touche la cuisine, jamais de porte vers la salle commune), mais on peut aller plus loin.
>
> Constat : aujourd'hui ce lien se bricole avec trois règles séparées (`mustBeAdjacentTo`, `noDoorWith`, `noTransit`) et la chambre, `noTransit`, ne peut plus ouvrir sur rien d'autre que le couloir.
>
> Piste : une notion de **pièce annexe**, rattachée à une pièce hôte. Elle se place contre son hôte, n'a qu'une porte, vers cet hôte, et n'existe que si l'hôte existe.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| A-1 | Comment déclarer une annexe ? | Propriété de type `annexOf` : liste des types hôtes possibles (salle d'eau attenante et dressing → chambre, chambre des maîtres ; cellier → cuisine ; office → cuisine ; cellule → salle de garde…). Une annexe est un cul-de-sac : une seule porte, vers son hôte, jamais vers un couloir ni une autre pièce. | |
| A-2 | L'hôte « ne se traverse pas » (chambre) : et l'annexe ? | La porte vers une annexe ne compte pas comme un passage : une chambre `noTransit` peut ouvrir sur sa salle d'eau et son dressing, et seulement sur eux. | |
| A-3 | Combien d'annexes ? | Par hôte, dans le preset : `{ "type": "ensuite", "per": "bedroom", "quantity": [0, 1] }` (chaque chambre a 0 ou 1 salle d'eau attenante, la graine décide, dans la limite de la place, comme le réservoir). | |
| A-4 | Placement | L'annexe se pose juste après son hôte, contre lui, au même niveau ; elle peut toucher un couloir ou une autre pièce sans y ouvrir. Si elle ne trouve pas de place, elle est abandonnée (annexe facultative) ou la tentative échoue (annexe obligatoire). | |
| A-5 | Salle d'eau commune et salle d'eau attenante | Deux types distincts : la salle d'eau commune (sur le couloir, `corridorAccess`) et la salle d'eau attenante (annexe de la chambre). Même chose pour le dressing (toujours annexe). | |
| A-6 | Reprendre l'existant | Le cellier devient annexe de la cuisine (remplace `mustBeAdjacentTo` + `noDoorWith` + `noTransit`) ; l'office, annexe de la cuisine ou de la salle à manger. Les règles séparées restent disponibles pour les autres cas. | |
| A-7 | Quand ? | Avant ou en même temps que les éléments (§15), qui suivent la même logique (un escalier ou une cheminée « dans » une pièce hôte). | |

> Suite du §22 (brainstorm du 24/10/2026) : le MJ veut aller plus loin que les annexes seules. Un cellier peut aussi avoir une porte de service vers l'extérieur ; une salle de bain peut être partagée par deux chambres (une porte vers chacune). La réflexion est reprise et élargie aux §23 à §27, qui remplacent les questions A-1 à A-7.

---

## 23. Accès des pièces — phase 1

> Principe retenu en brainstorm : décrire pour chaque type ce sur quoi il peut ouvrir, plutôt que d'empiler des règles. Précision du MJ : le tableau obligatoire / possible / interdit ne porte que sur des **pièces** (un couloir n'est pas une pièce) ; `noTransit` et l'accès à la circulation restent des propriétés à part.

**Proposition de modèle :**

- **Accès vers d'autres pièces** : `access: { required, optional, forbidden }`, listes de types de pièces.
  - `required` : la pièce ouvre sur au moins une pièce de chacun de ces types (cellier → cuisine ; salle d'eau attenante → chambre) ; elle se place contre elle.
  - `optional` : elle peut ouvrir sur ces types si la place et la graine le permettent (salle d'eau attenante → une 2ᵉ chambre ; écurie → salle commune).
  - `forbidden` : jamais de porte vers ces types (cellier → salle commune ; chambre → chambre). Remplace `noDoorWith`.
  - Une pièce sans `required` ni `optional` vers d'autres pièces n'ouvre que sur la circulation ou l'extérieur.
- **Accès à la circulation** (couloir, pièce ouverte, palier) : `circulation: "required" | "optional" | "forbidden"`.
  - `required` = l'actuel `corridorAccess` (chambre, salle d'eau commune) ;
  - `forbidden` = annexe pure, jamais sur un couloir (dressing, salle d'eau attenante) ;
  - `optional` = cas général.
- **Accès à l'extérieur** : `outside: "required" | "optional" | "forbidden"`.
  - `required` = l'actuel `exterior` (entrée, écurie, quai) ;
  - `optional` = porte de service possible (cellier, cuisine, buanderie), tirée par la graine si la pièce touche un mur extérieur (D-4) ;
  - `forbidden` = cas général.
- **`noTransit`** reste : on ne traverse pas la pièce pour aller ailleurs. Une porte vers une pièce dont elle est l'accès `required` (sa salle d'eau attenante, son dressing) ne compte pas comme un passage.
- **`mustBeAdjacentTo` / `cannotBeAdjacentTo`** restent pour le voisinage sans porte (murs communs).

**Exemples :**

| Type | Vers les pièces (obligatoire / possible / interdit) | Circulation | Extérieur | `noTransit` |
|---|---|---|---|---|
| Cellier | cuisine / — / salle commune, salle à manger | interdit | possible | oui |
| Salle d'eau attenante | chambre / chambre (2ᵉ) / — | interdit | interdit | oui |
| Dressing | chambre / — / — | interdit | interdit | oui |
| Chambre | — / salle d'eau attenante, dressing / chambre | obligatoire | interdit | oui |
| Salle d'eau commune | — / — / chambre | obligatoire | interdit | oui |
| Écurie | — / salle commune, cour / cuisine | possible | obligatoire | non |

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                       |
|---|---|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AC-1 | Le modèle ci-dessus convient-il ? | Oui, avec reprise des données existantes : `noDoorWith` → `access.forbidden`, `corridorAccess` → `circulation: "required"`, `exterior` → `outside: "required"`. Les anciens noms disparaissent du code une fois la reprise faite. | oui on ajustera après                                                                                                                                                                                            |
| AC-2 | Salle de bain partagée (2 chambres) : toujours partagée si le preset le dit, ou partagée quand c'est possible ? | Quand c'est possible : on la cherche d'abord sur un mur commun entre deux chambres ; sinon elle reste attenante à une seule. Le preset peut imposer le partage (`required` 2 exemplaires) si on veut le forcer. | en fonction du preset, pour moi ce sont des pièces différentes, c'est la question est-ce que tu veux une salle de bain partagé ou pas. Pour les tests on peut faire comme ta reco, on affinera après             |
| AC-3 | Une annexe facultative qui ne trouve pas de place | Abandonnée (on ne fait pas échouer le plan pour un dressing) ; une annexe obligatoire fait échouer la tentative. | On l'abandonne pour l'instant. Même réflexion que le reste, dans le futur, quand on mettra la personnalisation des presets, l'utilisateur pourra règler s'il veut la présence obligatoire de cette annexe ou non |
| AC-4 | Combien d'annexes par hôte ? | Dans le preset, par hôte : `{ "type": "ensuite", "per": "bedroom", "quantity": [0, 1] }` ; la graine décide pour chaque chambre, dans la limite de la place. | oui                                                                                                                                                                                                              |
| AC-5 | Porte de service : à quelle fréquence ? | Une probabilité par type dans les données (ex. cellier 0,3, cuisine 0,2), appliquée seulement si la pièce touche un mur extérieur. | oui ok                                                                                                                                                                                                            |

---

## 24. Escalier orienté — phase 1

> Constat du MJ (auberge, graine 951791901 après correction) : l'escalier s'ouvre des deux côtés. Pas impossible, mais rare, surtout quand l'escalier occupe toute la cage.
>
> Causes : un escalier n'a pas d'orientation dans le moteur (toutes ses faces se valent) ; et le couloir de l'étage contourne la cage au lieu de partir du palier, d'où deux tronçons qu'on a reliés en ouvrant la cage des deux côtés.

| # | Question | Proposition | Réponse MJ |
|---|---|---|------------|
| ES-1 | Côté d'arrivée | Un escalier droit a un côté d'arrivée : l'un de ses deux petits côtés, tiré par la graine. On n'ouvre que là, sur un palier. | à tester   |
| ES-2 | Cage qui continue vers le haut | On arrive par un petit côté et on repart par l'autre : à un étage intermédiaire, les deux petits côtés peuvent être ouverts, jamais les grands. | idem       |
| ES-3 | Couloir de l'étage | Il part du palier. Si la cage le coupe malgré tout, on raccorde les tronçons par un couloir, plus jamais par une 2ᵉ ouverture de l'escalier. | ok         |
| ES-4 | Trappe | Une trappe n'a pas de côté : elle s'ouvre dans la pièce qui la contient (rejoint les éléments, §15). En attendant, comportement actuel. | ok         |

---

## 25. Circulation par niveau et pièce maîtresse — phase 1

> Idées du MJ : (1) les principes de circulation ne devraient pas être liés au preset entier mais à chaque niveau (même schéma partout, ou par exemple une auberge en couloir traversant ou en galerie à l'étage) ; (2) pouvoir rendre une pièce plus importante que le reste sans la rendre structurante : le bâtiment est construit autour d'elle, c'est sa raison d'être (auberge, entrepôt, lieu de culte ; beaucoup moins une maison ou un manoir).

| # | Question | Proposition | Réponse MJ                                                                                                           |
|---|---|---|----------------------------------------------------------------------------------------------------------------------|
| CN-1 | Circulation par niveau | `layout` reste la valeur par défaut du preset ; surcharge possible par niveau : `layoutByLevel: { "ground": …, "upper": …, "basement": …, "2": … }`. Ex. auberge : RDC autour de la salle commune, étages en couloir traversant. | oui, faudra prévoir le paramètrage par la suite sur chaque étage je pense ou au moins pour les étages et le sous-sol |
| CN-2 | Couloir d'un schéma à l'étage | Il part de l'escalier d'arrivée (le traversant et la galerie se placent pour passer par le palier). Si l'étage reprend le même schéma que le dessous, la règle actuelle reste : son couloir se pose au-dessus de celui du RDC (E2-3). | ok                                                                                                                   |
| CN-3 | Escalier du RDC | Il se place de préférence là où le couloir de l'étage pourra passer (sur l'axe du futur couloir traversant, contre la future galerie). | oui à tester                                                                                                         |
| CN-4 | Pièce maîtresse | Nouveau schéma `hub` : la circulation s'organise autour d'une pièce nommée par le preset (`layout: { "scheme": "hub", "room": "common_room" }`). Elle est posée juste après l'entrée et les structurants, à un emplacement choisi (au centre, sur l'axe de l'entrée ou contre la façade, selon le preset), prend une part fixée du niveau (ex. 40 à 60 %), et les autres pièces se rangent de préférence autour d'elle ; les couloirs partent d'elle. | oui                                                                                                                  |
| CN-5 | Où l'utiliser | Auberge (RDC autour de la salle commune), entrepôt (autour du hall de stockage), lieu de culte (autour de la nef) ; pas pour la maison ni le manoir. | oui comme on l'a dit                                                                                                 |
| CN-6 | Interface | « Circulation » reste un réglage global de la page qui impose un schéma à tous les niveaux ; « Selon le preset » applique les choix par niveau. Un réglage par niveau dans la page plus tard si besoin. | oui cf ce que je disais plus haut                                                                                    |

---

## 26. Escalier en colimaçon — phase 1

> Demande du MJ : un escalier en colimaçon, structurant, en pièce circulaire qui n'a qu'une seule sortie par niveau ; indispensable pour un phare ou une tour de garde.

| # | Question | Proposition | Réponse MJ                                                                                                                                                                 |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CO-1 | Forme | Lien vertical d'emprise carrée (2 × 2 ou 3 × 3), dessiné en cercle avec des marches rayonnantes et un noyau central. | oui ça semble le plus simple                                                                                                                                               |
| CO-2 | Ouverture | Une seule ouverture par niveau, d'un côté tiré par la graine, qui peut changer d'un étage à l'autre (comme dans une vraie tour). | évidemment                                                                                                                                                                 |
| CO-3 | Hauteur | La cage monte d'un seul tenant sur tous les niveaux qu'elle dessert, même emprise partout. | oui ça semble cohérent                                                                                                                                                     |
| CO-4 | Déclaration | Dans le preset, sur le lien : `"kind": "spiral"` (défaut : `"straight"`). Un preset peut l'utiliser pour tout ou partie de ses liens. | oui, on verra après pour l'idée d'escalier principal et secondaire ou qui donne sur des espaces différents d'un même étage mais ça complexifie le test pour rien en l'état |
| CO-5 | Preset de test | « Tour de garde » : emprise carrée étroite (ex. 7 × 7), 3 à 4 étages, un colimaçon, une ou deux pièces par niveau (salle de garde, armurerie, dortoir, poste de guet au sommet). Le phare attendra les formes rondes (§16). | oui                                                                                                                                                                        |

---

## 27. Preset « maison individuelle » — phase 1

> Demande du MJ : un preset de maison individuelle pour les tests (le contre-exemple de la pièce maîtresse : pas de pièce dominante, pas de couloir imposé).

| # | Question | Proposition | Réponse MJ |
|---|---|---|------------|
| MA-1 | RDC | Entrée, séjour (pièce ouverte), cuisine, WC, cellier ou buanderie (porte de service possible) ; garage possible (accès extérieur obligatoire). | ok         |
| MA-2 | Étage | Chambres ×2–3, salle de bain commune, WC ; salle d'eau attenante et dressing possibles pour la chambre principale. | ok         |
| MA-3 | Dimensions et circulation | Enveloppe 10 × 8, 1 étage, pas de sous-sol, densité dense ; circulation libre au RDC, couloir à l'étage (imposé par les chambres). | ok         |

---

## 28. Ordre de mise en œuvre proposé

1. **Accès des pièces** (§23) : touche toutes les portes, à faire en premier.
2. **Escalier orienté et circulation par niveau** (§24, §25 CN-1 à CN-3) : règlent ensemble l'escalier ouvert des deux côtés.
3. **Pièce maîtresse** (§25 CN-4 à CN-6) et **preset maison** (§27).
4. **Colimaçon** (§26) avec les éléments (§15), puis le preset tour de garde.

---

## 23.1 Accès des pièces — mise en œuvre (24/10/2026)

> Réponses du MJ aux questions AC-1 à MA-3 : toutes validées, avec ces nuances. AC-2 : salle de bain partagée et salle d'eau attenante sont des pièces différentes selon le preset ; pour les tests, la recommandation (partagée quand c'est possible). AC-3 : l'annexe sans place est abandonnée ; plus tard, la personnalisation des presets permettra de la rendre obligatoire. CN-1 : le réglage par niveau dans l'interface viendra ensuite. CO-4 : escaliers principal et secondaire plus tard.

Fait :
- **Noms** : les deux réglages s'appellent `circulationAccess` et `outsideAccess` (le nom `circulation` désigne déjà la pièce ouverte). `exterior`, `corridorAccess` et `noDoorWith` ont disparu des données et du code (§2.2 à jour).
- **`access.required`** : « au moins une pièce de l'un de ces types » (une salle d'eau attenante peut avoir pour hôte une chambre ou la chambre des maîtres). Il vaut voisinage obligatoire (placement, contrôle).
- **Pièce sans liste `required` ni `optional`** : elle ouvre vers toute pièce qui ne lui est pas interdite (écart avec le §23, qui la limitait à la circulation et à l'extérieur : cela aurait supprimé l'enfilade en densité dense).
- **Annexes** (`per` dans le réservoir) : pour chaque pièce hôte, la graine tire le nombre d'annexes ; l'annexe se pose contre son hôte (même niveau), après les autres pièces, et est abandonnée faute de place (AC-3). Elle est reliée par une porte vers son hôte, puis vers les pièces possibles qu'elle touche (salle d'eau partagée quand elle touche une 2ᵉ chambre, AC-2).
- **Porte de service** (AC-5) : `serviceDoorChance` par type (cellier 0,3, cuisine 0,2, lavoir 0,3, réserve 0,2, atelier 0,2), au RDC, si la pièce touche un mur extérieur.
- **Types** : salle d'eau attenante (`ensuite`) et dressing ajoutés ; la chambre interdit la chambre ; la salle d'eau commune a la circulation obligatoire et interdit la chambre ; l'écurie peut ouvrir sur la salle commune et jamais sur la cuisine.
- **Manoir** : salle d'eau attenante ×0–1 et dressing ×0–1 par chambre des maîtres, salle d'eau attenante ×0–1 par chambre.
- **Page** : les règles affichent les accès (« ouvre sur », « sans porte vers », « donne sur la circulation », « porte de service possible ») et les annexes « par chambre ».
- **Tests** : accès entre pièces fermées, circulation obligatoire et interdite, annexe reliée à son hôte, porte dehors seulement si l'accès extérieur est obligatoire ou possible, `noTransit` sans compter les annexes.

Constats (20 graines) :
- Manoir : 24 salles d'eau attenantes, dont 14 partagées entre deux chambres, et 3 dressings sur 17 plans. Le partage est fréquent (dès que la salle d'eau touche une 2ᵉ chambre) : à régler avec la personnalisation (AC-2).
- Auberge : 13 portes de service sur 20 plans.
- Couloir de 1 case un peu plus difficile : auberge en équilibré 20 sur 25 (25 sur 25 en largeur 2), manoir dense 1 sur 20 ; le cellier n'est plus attiré vers le couloir, ses restes élargissent davantage le dégagement. Seuils des tests alignés.

---

## 24.1 Escalier orienté et circulation par niveau — mise en œuvre (24/10/2026)

> Retours du MJ avant cette étape : auberge 265124265 (la salle d'eau donne sur un couloir) et manoir 459602491 (même chose pour la lingerie), à ne pas traiter comme des cas à part. Cause commune : un petit tronçon de couloir derrière la cage d'escalier, relié au reste seulement par l'escalier ouvert des deux côtés. Onglets d'étage remis dans l'ordre (sous-sol à gauche, étages supérieurs à droite).

Fait :
- **Escalier orienté** (ES-1, ES-2) : un escalier droit (rectangle allongé, 2 cases de large au moins) reçoit un côté bas, l'un de ses petits côtés, tiré par la graine parmi ceux dont les deux paliers (bas et haut) sont dans le bâtiment. Au niveau inférieur, il ne s'ouvre que par ce côté ; au niveau supérieur, que par le côté opposé. Une cage qui continue vers le haut ouvre ses deux petits côtés à l'étage intermédiaire (on arrive par l'un, on repart par l'autre). Trappe et escalier carré : ouverts de tous côtés (ES-4).
- **Palier** (ES-3) : hors RDC, une case de couloir est posée devant chaque côté ouvert de l'escalier d'arrivée ; la circulation du niveau part de là. Ailleurs, un couloir qui rejoint un escalier vise la case de son palier. Plus aucune ouverture sur un côté fermé ; si une porte ne peut pas être posée, le voisin suivant est essayé (auparavant, l'escalier était compté comme relié même sans ouverture).
- **Circulation par niveau** (CN-1) : `layoutByLevel` dans le preset (`"upper"`, `"basement"`, `"ground"` ou un numéro d'étage), sinon `layout`. Un niveau qui reprend le même schéma que celui du dessous garde le même tirage et son couloir s'y superpose (E2-3) ; sinon son schéma est posé au plus près du palier (CN-2). Au RDC, si l'étage aura son propre couloir traversant, l'escalier place de préférence son palier haut près de l'axe de ce couloir (CN-3).
- **Auberge** : étages en couloir traversant de 1 case (`"layoutByLevel": { "upper": { "schemes": ["spine"], "width": 1 } }`), RDC libre. Page : « Preset (libre, étages traversant) ».
- **Tentatives** : 120 au lieu de 60 (`engine.json`). L'escalier orienté ne peut plus se coller par un petit côté contre un mur et morcelle davantage le RDC ; une tentative d'auberge coûte quelques millisecondes.
- **Tests** : ouvertures d'escalier seulement sur ses côtés ouverts (au plus deux), couloir traversant à l'étage de l'auberge ; au sous-sol, seul le palier est du couloir.

Constats (25 graines) :

| Cas | 60 tentatives | 120 tentatives (retenu) |
|---|---|---|
| Auberge, réglages par défaut | 20 / 25 | 24 / 25, pire 0,2 s |
| Auberge, équilibré, couloir 1 | 12 / 25 | 17 / 25 |
| Manoir, réglages par défaut | 21 / 25 | 25 / 25, pire 0,6 s |
| Manoir, équilibré, couloir 1 | 2 / 25 | 3 / 25, échec jusqu'à 1,2 s |

- Graines du MJ : auberge 265124265 et manoir 459602491, escalier ouvert d'un seul côté, toutes les pièces sur un couloir qui part du palier ; la salle d'eau et la lingerie donnent sur ce couloir.
- Reste : l'étage du manoir garde parfois une large bande de couloir le long d'un mur, faute de pièces pour la remplir (limite connue, §20.3). Les tests du générateur prennent environ 95 s.

---

## 29. Restes isolés : débarras, et graines de suivi

> Retours du MJ (réglages standard) : entrepôt 309343816, l'étage forme un couloir accessible uniquement depuis le bureau pour aller vers une réserve ; entrepôt 982061165, un bureau donne sur un couloir collé uniquement à un mur ; manoirs 379736610, 170390284, 591626162, 481490943, un grand couloir en bas accessible uniquement par une ouverture depuis un boudoir. Auberges : vrai mieux, plus de comportement bizarre. Lieu de culte 413934975 : un « pilier » au sous-sol (case non excavée au milieu de la crypte), apprécié par le MJ.
>
> Diagnostic : des restes que personne ne prend deviennent des dégagements isolés, reliés par la pièce voisine. Pour l'entrepôt 982061165, en plus, le reste touchait un côté fermé de la cage d'escalier et était pris à tort pour un tronçon relié à l'escalier.
>
> Décisions du MJ : le débarras, oui ; la forme des étages (rectangle ou L) ne change pas pour l'instant, on regarde une fois les étapes en cours finies ; les graines ci-dessus sont gardées pour suivre l'évolution.

Fait (24/10/2026) :
- **Débarras** (type `closet`, 1 à 9 cases) : un dégagement isolé d'au plus `closetMaxSize` (9) cases, en rectangle ou en L, dans le ratio du type, devient une annexe d'une pièce voisine qui l'accepte (jamais une annexe ni une cour ; la chambre et la chambre des maîtres l'acceptent). Les plus grands restent des dégagements.
- **Tronçon et escalier** : hors RDC, un tronçon de couloir n'est relié à l'escalier d'arrivée que s'il contient l'un de ses paliers ; un reste qui touche un côté fermé de la cage est un dégagement isolé (débarras s'il est petit).
- Test : un débarras fait au plus 9 cases et a un hôte.

**Graines de suivi** (à repasser après chaque étape ; réglages standard du preset) :

| Preset | Graine | Ce qu'on surveille | État au 24/10/2026 |
|---|---|---|---|
| Auberge | 951791901 | Étage : chambres desservies par le couloir, salle d'eau | Corrigé (§21, §21.1) |
| Auberge | 265124265 | Salle d'eau sur un tronçon derrière la cage d'escalier | Corrigé (§24.1) |
| Manoir | 459602491 | Lingerie sur un tronçon derrière la cage d'escalier | Corrigé (§24.1) |
| Entrepôt | 309343816 | Mezzanine : reste de 18 cases accessible par le bureau seulement | Ouvert : trop grand pour un débarras (règle « grand reste intérieur » en attente) |
| Entrepôt | 982061165 | Bureau sur un couloir collé à un mur | Corrigé : débarras du bureau |
| Manoir | 379736610 | Grand couloir en bas, accessible par le boudoir | Plan changé (autre tirage depuis les dernières modifications) : à revoir |
| Manoir | 170390284 | Idem | Plan changé ; un débarras rattaché à la lingerie |
| Manoir | 591626162 | Idem | À revoir |
| Manoir | 481490943 | Idem | À revoir |
| Lieu de culte | 413934975 | « Pilier » au sous-sol, apprécié | À garder (piste : éléments, §15) |
| Maison | 771795581 | Étage : couloir sous la chambre des maîtres | Corrigé : salle d'eau attenante imposée par la place (§31) |
| Manoir | 128120654 | Étage : chambre avec deux salles d'eau (sienne et partagée) | Corrigé : une annexe de chaque type par pièce (§31) |

Les graines donnent un autre plan dès que le moteur change le nombre ou l'ordre de ses tirages : une graine « corrigée » peut simplement être devenue un autre plan. Le suivi vaut pour la tendance, pas pour un plan précis.

---

## 30. Pièce maîtresse et maison individuelle — mise en œuvre (24/10/2026)

Fait (§25 CN-4 à CN-6, §27) :
- **Schéma `hub`** : `layoutByLevel.<niveau> = { "schemes": ["hub"], "hub": { "room", "position", "share" } }`. La pièce maîtresse est posée juste après l'entrée et les structurants, d'un seul rectangle de la surface voulue : une part du niveau tirée dans `share` (défaut `hubShare` = 40 à 60 %, `engine.json`), dans la limite de ses tailles. Position : `centre` (au milieu du niveau), `axis` (contre la racine, l'entrée au RDC, et centrée sur elle), `facade` (contre la façade, près de l'entrée). Elle garde ensuite sa surface ; les couloirs partent d'elle (elle est ouverte) et les autres pièces se rangent autour (contact recherché avec le réseau). Largeur des couloirs : celle du preset (`width`) s'il la donne, sinon celle de la densité.
- **Presets** : auberge, RDC autour de la salle commune sur l'axe de l'entrée (40 à 55 %), étages en couloir traversant ; entrepôt, RDC autour du hall de stockage au centre (45 à 60 %) ; lieu de culte, RDC autour de la nef sur l'axe de l'entrée (45 à 60 %), sans couloir. La page affiche par exemple « Preset (libre, étages traversant, RDC autour de la pièce « salle commune ») ». CN-6 : la pièce maîtresse n'est pas proposée dans le réglage global « Circulation » (elle dépend d'une pièce du preset).
- **Maison individuelle** (`house`, 10 × 8, 1 étage, dense) : RDC entrée, séjour (ouvert, prioritaire), cuisine, WC, buanderie (porte de service possible) ; étage chambre des maîtres, chambre ×1–2, salle de bain, WC ; réservoir : garage (accès extérieur obligatoire, peut ouvrir sur l'entrée, la buanderie ou la cuisine), cellier ; annexes de la chambre des maîtres : salle d'eau attenante, dressing. Nouveaux types : séjour, WC (circulation obligatoire, jamais sur la cuisine ni une chambre), buanderie, garage, salle de bain (circulation obligatoire, jamais sur une chambre).
- **Tests** : la maison rejoint tous les tests ; la pièce maîtresse prend au moins 30 % du RDC, et touche l'entrée quand elle est sur son axe.

Constats (20 graines, réglages standard) :

| Preset | Réussite | Pire temps | Part de la pièce maîtresse au RDC |
|---|---|---|---|
| Auberge | 20 / 20 | 0,2 s | 41 % |
| Manoir (pas de pièce maîtresse) | 18 / 20 | 1,1 s | — |
| Lieu de culte | 20 / 20 | < 0,1 s | 47 % |
| Entrepôt | 20 / 20 | 0,1 s | 49 % |
| Maison | 20 / 20 | < 0,1 s | — |

Les tests du générateur repassent à environ 60 s (l'auberge aboutit plus vite avec sa pièce maîtresse).

---

## 31. Annexes imposées par la place, une annexe de chaque type par pièce (24/10/2026)

> Retours du MJ (réglages standard) : générations d'auberge « top ». Maison 771795581, à l'étage : un couloir se crée sous la chambre des maîtres ; il faudrait y ajouter un dressing ou un débarras même si la graine ne l'avait pas prévu, sinon ce n'est pas cohérent. Manoir 128120654, à l'étage : une chambre qui a déjà sa salle d'eau attenante en partage une seconde ; une pièce ne devrait pas recevoir une nouvelle salle d'eau, partagée ou non, si elle en a déjà une.
>
> Diagnostic : maison, le reste sous la chambre des maîtres était un L de 4 cases avec une marche d'une seule case, refusé par la règle de forme (branches de 2 cases) ; manoir, une salle d'eau attenante s'ouvrait vers toute 2ᵉ chambre qu'elle touchait, même déjà pourvue.

Fait :
- **Annexe imposée par la place** : un petit reste isolé (9 cases au plus) devient l'annexe qui manque à une pièce voisine, si sa taille et ses proportions conviennent et que la pièce l'accepte : dressing ou salle d'eau attenante d'une chambre, cellier d'une cuisine… (types à accès obligatoire et circulation interdite). Sinon, un débarras. Pour ces petites annexes, la forme admet une marche d'une case (`shapeKind(cells, 1)`). Elles sont marquées `fromSpace` dans le plan.
- **Une annexe de chaque type par pièce** : une pièce a au plus une annexe d'un type donné, à elle ou partagée ; une salle d'eau attenante ne s'ouvre plus vers une 2ᵉ chambre qui a déjà la sienne ou en partage déjà une. Même règle pour le débarras (un par pièce au plus).
- **Tests** : forme des annexes nées d'un reste, une annexe de chaque type par pièce.
- Maison 771795581 : le reste devient la salle d'eau attenante de la chambre des maîtres. Manoir 128120654 : chaque chambre n'a plus que sa propre salle d'eau.

Graines de suivi ajoutées au §29 : maison 771795581 (corrigé), manoir 128120654 (corrigé).

---

## 32. Une pièce hôte cède des cases à son annexe (24/10/2026)

> Idée du MJ : réduire au besoin la pièce de base ; si enlever quelques cases à la chambre permet de faire rentrer une annexe, c'est le bon choix. Décision : une propriété `canShrink` par type de pièce, vraie pour la plupart ; on ne découpe que si la pièce reste confortable, c'est-à-dire si elle garde au moins la moitié de sa plage de taille (`sizeMin + (sizeMax − sizeMin) / 2`).

Fait :
- **`canShrink`** (§2.2) : vrai pour les pièces de vie de 9 cases ou plus (cuisine, écurie, chambres, cave, crypte, salon, bibliothèque, salle à manger, salle de garde, petit salon, étude, fumoir, salle capitulaire, atelier, garage). Faux pour l'entrée, les pièces ouvertes, les structurantes, les annexes et les petites pièces de service.
- **Seuil de confort** : `shrinkComfort` dans `engine.json` (0,5 = la moitié de la plage). L'hôte garde aussi une forme rectangle ou L, ses proportions, son contact avec le réseau de circulation et, s'il lui est obligatoire, avec l'extérieur. Les voisinages restent valides. On prend le moins de cases possible, de préférence loin du couloir.
- **Usage 1, compléter un reste** : un petit reste isolé trop petit ou mal formé pour l'annexe qui manque est complété par quelques cases de la pièce voisine. Ordre de préférence : l'annexe qui manque telle quelle, puis complétée, puis un débarras tel quel, puis complété.
- **Usage 2, découper l'annexe tirée par la graine** : une annexe du programme sans place contre son hôte n'est plus abandonnée d'office (AC-3) ; elle est découpée dans l'hôte si celui-ci le permet, sinon abandonnée comme avant.
- **Tests** : maison 11666, le reste de 2 cases contre la cuisine devient un cellier de 4 cases (cuisine 24 → 22) ; sans `canShrink`, pas de cellier.

Mesure sur 100 graines, réglages des presets, nombre total d'annexes du programme posées (annexes nées de la place entre parenthèses) :

| Preset | Sans `canShrink` | Seuil 0,5 (retenu) | Seuil 0,25 | Seuil 0 (l'hôte garde son minimum) |
|---|---|---|---|---|
| Maison | 32 (100) | 32 (100) | 39 (102) | 67 (100) |
| Manoir | 177 (132) | 179 (133) | 186 (140) | 253 (142) |
| Auberge | — (82) | — (82) | — (85) | — (85) |
| Entrepôt | — (123) | — (123) | — (124) | — (124) |

Taux de réussite inchangés (au plus une graine d'écart). Avec le seuil retenu, l'effet reste rare : une chambre (9 à 16 cases) doit dépasser 12,5 cases après cession, donc en avoir au moins 17 pour céder une salle d'eau de 4 ; la plupart des pièces sont posées entre leur minimum et le milieu de leur plage.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| CS-1 | Seuil de confort | Le seuil 0,5 bloque presque tout. Proposition : 0,25 (une chambre garde 11 cases au moins) en compromis, ou 0 si l'on considère que le minimum du type est déjà une pièce correcte (la maison double ses annexes). | On teste d'abord à 0,25 ; si ce n'est pas terrible, on passera à 0. |

> Appliqué : `shrinkComfort` = 0,25. Effet de bord : avec un hôte qui cède des cases, une tentative de l'auberge (graine 1037) réussissait avec la salle commune loin de l'entrée. La position `axis` de la pièce maîtresse n'était qu'une préférence ; elle est désormais obligatoire (contre la racine, comme le dit le §30), sinon la tentative échoue et la suivante prend le relais.
>
> Retour du MJ : maison 10×8, couloir de 1, graine 628944719 : une seule salle de bain pour trois chambres, sur le couloir. C'est le programme de la maison : une salle de bain partagée, seule ouverte sur le couloir, pour les deux chambres ; la chambre des maîtres a sa salle d'eau attenante. Accepté tel quel.

---

## 33. Paliers d'escalier dégagés, salle d'eau des maîtres partagée — phase 1 (24/10/2026)

> Retours du MJ (réglages standard) :
> - Maison 628944719, couloir 1 : la salle d'eau attenante de la chambre des maîtres est partagée avec les deux autres chambres (une porte dans chaque chambre), alors qu'il y a déjà une salle de bain sur le couloir. Pas grave, mais surprenant.
> - Entrepôts avec étage : « vraiment propre ».
> - Manoir 500159088, couloir 2, RDC : l'escalier vers l'étage s'ouvre au nord et son ouverture est en partie contre le mur du petit salon ; dans un manoir, l'ouverture regarderait plutôt l'entrée. La trappe du sous-sol est seule au milieu d'un couloir géant. Cas à la marge, la plupart des générations sont propres.
>
> Diagnostic :
> - Manoir 500159088 : l'escalier fait 2 × 3 ; le palier réservé n'est qu'**une case**, devant le milieu du côté ouvert. Sur un côté de 2 cases, l'autre case devant l'ouverture reste libre et le petit salon l'a prise en grandissant. De plus, au niveau de départ, ce palier n'est pas réservé d'avance (le couloir le vise seulement) ; il ne l'est qu'au niveau d'arrivée. Le côté ouvert est tiré au hasard parmi les côtés courts possibles, sans regarder l'entrée.
> - Trappe : c'est le cas connu du « grand reste » intérieur (§29), resté en couloir faute de pièce pour le prendre.
> - Maison 628944719 : la salle d'eau attenante accepte une chambre en accès possible (§23) ; les deux chambres n'ayant pas d'annexe de ce type, la règle « une annexe de chaque type par pièce » (§31) les laisse s'y ouvrir.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| PA-1 | Palier sur toute la largeur | Le palier couvre **toute la largeur** du côté ouvert (2 cases pour un escalier de 2 de large), réservé en couloir dès qu'on pose l'escalier, au niveau de départ comme à celui d'arrivée. Plus aucune pièce ne peut se coller devant l'ouverture. Vaut aussi pour le colimaçon de l'étape 4 (une ouverture par niveau). | oui |
| PA-2 | Ouverture vers l'entrée | Au RDC, l'escalier qui monte ouvre de préférence du côté de l'entrée (palier le plus proche de l'entrée), sauf quand la règle d'axe du couloir de l'étage (CN-3) s'applique déjà. À l'étage, l'ouverture est l'opposée, comme aujourd'hui. Préférence, pas obligation : si ce côté n'est pas possible, l'autre. | oui, en préférence |
| PA-3 | Annexe des maîtres privée | Une annexe tirée **pour une pièce donnée** (`per` dans le preset, ex. salle d'eau de la chambre des maîtres) reste privée : elle ne s'ouvre que sur son hôte. Le partage reste possible pour une salle d'eau posée sans hôte désigné. Autre option : garder le partage tel quel, l'effet est rare. | pas utile de trancher maintenant, on garde comme ça pour le moment |
| PA-4 | Ordre | Faire PA-1 à PA-3 avant l'étape 4 (colimaçon), qui réutilise le palier. La trappe dans un grand couloir attend la règle du « grand reste ». | oui |

Fait (PA-1, PA-2) :
- **Palier sur toute la largeur** : toutes les cases devant le côté ouvert, réservées dès la pose de l'escalier au niveau de départ, et dès le début au niveau d'arrivée (au lieu d'une seule case au milieu). Le couloir rejoint le palier par n'importe laquelle de ses cases, ce qui lui évite de le longer (sinon carré de couloir trop large avec un couloir de 1). Sur un niveau sans couloir prévu (RDC de l'auberge, du lieu de culte, de l'entrepôt), le palier reste réservé pendant le placement des pièces puis devient un petit dégagement devant l'escalier.
- **Ouverture vers l'entrée** : au RDC, l'escalier qui monte ouvre du côté dont le palier est le plus proche de l'entrée, quand les deux côtés sont possibles ; la règle d'axe du couloir de l'étage (CN-3) reste prioritaire.
- **Test** : aucune pièce fermée devant l'ouverture d'un escalier, sur toute sa largeur, à tout niveau qui a un couloir.
- **Mesure sur 40 graines** (réglages des presets) : auberge 40, manoir 40, entrepôt 40, maison 40, lieu de culte 40, maison couloir 1 : 40, auberge en enfilade couloir 1 : 31 (inchangé). Seul recul : manoir couloir 1, de 18 à 13, le palier réservé prenant de la place dans une variante déjà serrée.
- Manoir 500159088 : l'escalier ouvre maintenant vers l'entrée, palier dégagé ; la trappe reste dans une large zone de couloir (règle du « grand reste », à venir).

---

## 34. Colimaçon et tour de garde — phase 2 (24/10/2026)

> Suite du §26 (CO-1 à CO-5 validés). Spécification fonctionnelle à valider avant l'implémentation.

**Escalier en colimaçon**
- Déclaré sur le lien du preset : `"kind": "spiral"` ; emprise carrée de 4 ou 9 cases (`sizeInCells`). Les escaliers ajoutés automatiquement pour les étages supplémentaires reprennent le `kind` de l'escalier qu'ils prolongent : une seule cage sur toute la hauteur (CO-3).
- Une seule ouverture par niveau, d'un côté tiré par la graine, qui peut changer d'un niveau à l'autre (CO-2), même à un niveau intermédiaire (contrairement à l'escalier droit qui continue, ouvert des deux côtés). Palier sur toute la largeur du côté ouvert (PA-1) ; au RDC, ouverture de préférence vers l'entrée (PA-2).
- Dessin : un cercle inscrit dans l'emprise, marches rayonnantes autour d'un noyau central ; mêmes étiquettes que l'escalier droit (« ↑ Étage 2 · ↓ RDC »).

**Preset « Tour de garde »**
- Emprise 7 × 7, 3 étages par défaut (RDC + 3), pas de sous-sol, densité dense, pas de couloir (on passe d'une pièce à l'autre, ou on arrive directement dans la pièce).
- Programme proposé :

| Niveau | Pièces |
|---|---|
| RDC | entrée, salle de garde |
| Étage 1 | armurerie, réserve |
| Étage 2 | dortoir |
| Dernier étage | poste de guet |

- Nouveaux types de pièces : **Armurerie** (6 à 16 cases), **Dortoir** (12 à 30), **Poste de guet** (9 à 45, occupe le dernier niveau). `canShrink` selon la règle du §32.
- Nouveau niveau dans le programme : `"floor": "top"` (dernier étage), pour que le poste de guet reste au sommet si l'on change le nombre d'étages dans la page.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| CO-6 | Place du colimaçon dans la tour | Contre un mur extérieur, de préférence dans un angle (comme dans une vraie tour), pour laisser une pièce d'un seul tenant. | oui, pour l'instant |
| CO-7 | Palier sans couloir | Dans une tour, un dégagement de 2 cases devant l'escalier ferait bizarre. Proposition : sur un niveau sans couloir, le palier appartient à la pièce sur laquelle l'escalier débouche (toutes ses cases à la même pièce, qui reçoit l'ouverture), au lieu de devenir un petit dégagement. S'appliquerait aussi aux RDC sans couloir de l'auberge, du lieu de culte et de l'entrepôt. | ok |
| CO-8 | Programme de la tour | Celui du tableau ci-dessus ; au-delà de 3 étages, les étages intermédiaires en plus reçoivent un dortoir ou une réserve (réservoir). | oui, une salle de vie aussi par exemple |
| CO-9 | Nouveaux types | Armurerie, dortoir, poste de guet aux tailles ci-dessus ; `"floor": "top"` pour le dernier étage. | oui, très bien |

### 34.1 Mise en œuvre (24/10/2026)

- **Colimaçon** : `"kind": "spiral"` sur le lien ; cage carrée (4 cases → 2 × 2) posée contre un mur extérieur, de préférence dans un angle, jamais contre la façade de l'entrée. À chaque niveau, une seule ouverture, tirée parmi les côtés dont le palier est libre (au RDC : le côté le plus proche de l'entrée). Les escaliers ajoutés pour les étages supplémentaires reprennent le colimaçon, dans la même cage. Dessin : cercle, 12 marches rayonnantes, noyau central, étages en abrégé (« ↑É2 ↓RDC »).
- **Palier sans couloir (CO-7)** : sur un niveau sans couloir, le palier reste réservé pendant le placement, puis revient à la pièce sur laquelle l'escalier débouche, de préférence une pièce ouverte, jamais en premier une pièce qu'on ne traverse pas. Cette pièce garde une forme rectangle ou L, la bande d'une case devant l'escalier étant admise (c'est le palier), sans contrainte de proportions ; elle est marquée `landing` dans le plan. Si aucune pièce ne convient, le palier devient un petit dégagement. S'applique aussi aux RDC sans couloir de l'auberge, du lieu de culte et de l'entrepôt.
- **Niveau sans pièce traversable** : un niveau de plusieurs pièces dont aucune ne se traverse (armurerie et réserves) reçoit un couloir d'accès, comme un niveau qui a une chambre ; sans cela, aucun plan ne pouvait les desservir.
- **Preset « Tour de garde »** : 7 × 7, 3 étages, dense, enfilade. Programme : entrée et salle de garde au RDC ; armurerie et réserve à l'étage 1 ; poste de guet au dernier étage (24 cases au moins, pour qu'il occupe le niveau) ; un dortoir sur un étage ; complément : dortoirs (0 à 2), réserves (0 à 3), salle de vie (0 à 1). Escalier à vis de 4 cases.
- **Nouveaux types** : armurerie (6 à 16, qu'on ne traverse pas), dortoir (12 à 30), poste de guet (9 à 45). Niveau `"floor": "top"` (dernier étage), dans le programme et pour les liens.
- **Tests** : la tour entre dans la batterie générale (2, 3 et 4 étages) ; cage unique carrée au même endroit contre un mur extérieur, une seule ouverture par niveau, poste de guet au dernier étage ; palier : devant toute ouverture, du couloir ou des pièces ouvertes, ou une seule pièce qui a reçu le palier. Plage de dimensions de la tour : × 0,9 seulement (son RDC ne remplit pas un 8 × 8).
- **Mesure sur 40 graines** : tour 40 (2, 3 et 4 étages : 40 chacun) ; auberge 40, manoir 40, entrepôt 40, maison 40, lieu de culte 40, maison couloir 1 : 40 ; auberge en enfilade couloir 1 : 35 (31 avant) ; manoir couloir 1 : 13.
- **Limites constatées** : au RDC de la tour, des restes de 7 à 11 cases restent en dégagement autour de l'entrée (règle du « grand reste ») ; un étage qui reçoit surtout des réserves a un couloir d'accès assez large pour une tour.