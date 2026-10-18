# Modales génériques habillables par slug

## Statut

**Validée par le MJ le 2026-10-18** (décisions M-1 à M-7 au §1, questions U-1 à U-4 tranchées au §10). Lot pilote et lot 2 implémentés.

Brique de plateforme : concerne tous les slugs.

Objectif : donner aux modales génériques (`src/client/src/components/`) une structure et des classes communes, avec un style par défaut propre, que chaque slug peut habiller dans son `theme.css` (coins ornés, boutons, champs) sans aucun code de slug dans le générique.

Hors périmètre :
- le bug des props de `GMSendModal` dans fabula, zoneblanche, achtung, deltagreen et noctis (M-7) : seul son habillage sera repris au lot 2 ;
- les composants de combat génériques, l'animation des dés (`DiceAnimationOverlay`), les notifications, l'historique, le journal (`JournalTab`, `TabJournal`), l'éditeur de texte ;
- les modales propres à un slug (déjà habillées par le slug, ex. `VkModal` de Vikings).

---

## 1. Décisions du diagnostic (validées le 2026-10-18)

| # | Sujet | Décision |
|---|---|---|
| M-1 | Approche | Un composant générique `Modal` + des classes stables `vtt-*`, habillables par le `theme.css` de chaque slug. |
| M-2 | Style de base | Celui de la modale de configuration des dés (fond flouté, panneau arrondi, en-tête avec sous-titre, sélecteur en segments). |
| M-3 | Découpage | **Pilote** : composant, classes, style par défaut ; migration de l'upload d'avatar, de la gestion des tables (et ses sous-modales) et de l'alerte ; habillage Vikings. **Lot 2** : les autres modales génériques (§8). |
| M-4 | Icônes | Pas d'emoji dans les modales génériques. L'icône reste une option du composant, non utilisée par le générique. |
| M-5 | Habillage d'un slug | Tout le style propre à un slug (coins ornés, cadres, polices, boutons) est une **surcharge dans son `theme.css`**. Le générique ne fournit que des classes stables et un élément décoratif vide. Vikings : cadre à coins légers, boutons et champs `vk-` partagés avec les classes `vtt-`. |
| M-6 | Emplacement du style par défaut | Dans `src/client/src/index.css`, dans une couche **`@layer components`** : le `theme.css` d'un slug (hors couche) l'emporte toujours, quel que soit l'ordre de chargement, et les utilitaires Tailwind (`hidden`, `flex`, `w-full`…) restent applicables sur les classes `vtt-*`. |
| M-7 | Bug des props de `GMSendModal` | Hors de ce chantier. |

---

## 2. Constat

- Chaque modale générique recode son fond, son panneau, son en-tête et ses boutons : 5 z-index différents (50, 60, 70, 150, 9999), arrondis et bordures variables, aucun point d'accroche pour un thème de slug.
- 5 modales utilisent `bg-black bg-opacity-50`, syntaxe Tailwind v3 absente de la v4 : le fond est **opaque** au lieu d'assombri (avatar, gestion des tables, composition de table, code d'accès, saisie du code).
- Boutons à couleurs codées en dur (`bg-gray-500 text-white`, `bg-red-600`) ; alias legacy `border-base` / `text-base` (le second entre en conflit avec la taille de police Tailwind) ; boutons principaux `bg-primary text-accent` au contraste incertain selon le thème.
- Les modales récentes (configuration des dés, jet libre) ont la bonne structure mais restent non habillables (couleurs seules) et suivent chacune leur convention (classes Tailwind pour l'une, `style=` pour l'autre).

---

## 3. Composant `components/ui/Modal.jsx`

### 3.1 Contrat

| Prop | Rôle | Défaut |
|---|---|---|
| `onClose` | fermeture (bouton, Échap, clic sur le fond selon `closeOnBackdrop`) | requis |
| `title` | titre court | — |
| `subtitle` | sous-titre (ex. « Apparence de l'animation ») | — |
| `icon` | nœud affiché dans la pastille d'en-tête (non utilisé par le générique, M-4) | — |
| `size` | taille de la fenêtre (§3.3) : `sm`, `md`, `lg`, `xl`, `full` | `md` |
| `expandable` | affiche dans l'en-tête un bouton Agrandir / Réduire (§3.3) | `false` |
| `footer` | actions en pied de fenêtre (boutons) | — |
| `closeOnBackdrop` | le clic sur le fond ferme la modale (U-1) | `true` |
| `alert` | z-index d'alerte, au-dessus de tout (U-2) ; réservé à `AlertModal` (et `ConfirmModal` au lot 2) | `false` |
| `className` | classes ajoutées au panneau | — |
| `children` | corps (défile seul si trop long) | — |

Comportement :
- **Échap** ferme uniquement la modale du dessus (les modales ouvertes s'empilent : gestion des tables → composition de table → alerte) ;
- **un seul z-index** pour toutes les modales (`--vtt-z-modal`) : une modale ouverte depuis une autre est rendue après elle dans le document et passe donc devant ; l'alerte reste au-dessus (U-2) ;
- les props des modales migrées **ne changent pas** : elles sont utilisées par tous les slugs.

### 3.2 Structure et classes

```
div.vtt-modal-backdrop            fond assombri et flouté (clic = fermeture si closeOnBackdrop)
└─ div.vtt-modal-panel.vtt-modal-{size}
   ├─ span.vtt-modal-deco         élément décoratif vide, à disposition des thèmes (ex. coins du bas)
   ├─ header.vtt-modal-header
   │  ├─ span.vtt-modal-icon      (si icon)
   │  ├─ div > h2.vtt-modal-title + p.vtt-modal-subtitle
   │  ├─ button.vtt-modal-expand  (si expandable)
   │  └─ button.vtt-modal-close
   ├─ div.vtt-modal-body.vtt-scroll   défile
   └─ footer.vtt-modal-footer     (si footer)
```

### 3.3 Tailles

Sur le modèle de Bootstrap, la taille se choisit par la prop `size` :

| `size` | Largeur maximale | Usage type |
|---|---|---|
| `sm` | 24 rem (384 px) | alerte, confirmation, saisie d'un code |
| `md` | 32 rem (512 px) | formulaire court, jet de dés |
| `lg` | 48 rem (768 px) | gestion des tables, recadrage d'avatar, configuration des dés |
| `xl` | 64 rem (1024 px) | listes ou contenus riches |
| `full` | tout l'écran, moins une marge de 16 px | consultation d'un long contenu |

- La hauteur suit le contenu, plafonnée à la hauteur de l'écran moins la marge ; au-delà, seul le corps défile (en-tête et pied restent visibles). En `full`, la fenêtre occupe toute la hauteur.
- **Petit écran** : sous 640 px, toutes les tailles prennent la largeur de l'écran moins la marge de 16 px.
- **Agrandir / Réduire** (`expandable`) : un bouton de l'en-tête bascule la fenêtre entre sa taille d'origine et `full`. Le choix n'est pas mémorisé : la modale rouvre toujours à sa taille d'origine (U-3). Le bouton est masqué sur petit écran (sans effet) et quand `size` vaut déjà `full`.
- Le slug ne redéfinit pas les largeurs : elles relèvent de l'ergonomie, pas de l'habillage.

### 3.4 Barres de défilement

- Classe générique **`vtt-scroll`**, posée d'office sur le corps des modales et utilisable sur toute zone qui défile à l'intérieur (liste de personnages, historique d'une modale…).
- Style par défaut : barre fine, poignée `--color-border` (`--color-primary` au survol), piste transparente.
- Réalisation par les propriétés standard `scrollbar-width` et `scrollbar-color` (Chrome, Edge, Firefox, Safari récents) : elles règlent l'épaisseur et les couleurs, **pas** les formes (arrondis, images, flèches). Pour un habillage plus poussé, le slug peut surcharger les pseudo-éléments `::-webkit-scrollbar` dans son `theme.css`, sachant que Chrome les ignore dès qu'une couleur standard est définie.
- Le slug surcharge `.vtt-scroll` dans son `theme.css` comme les autres classes (§6).

---

## 4. Classes de contrôles `vtt-*`

| Classe | Usage | Remplace |
|---|---|---|
| `vtt-btn` | bouton secondaire (Annuler, Retour) | `bg-gray-500 text-white…` |
| `vtt-btn-primary` | action principale | `bg-primary text-accent…` |
| `vtt-btn-danger` | action destructrice | `bg-red-600 text-white…` |
| `vtt-btn-sm`, `vtt-btn-icon` | variantes de taille | — |
| `vtt-input` | champ texte, nombre, zone de texte | bordures et fonds variés |
| `vtt-field-label` | libellé de champ | `text-sm font-semibold…` |
| `vtt-pill` (+ `.is-selected`) | choix parmi des options (pas de `<select>` ni de case à cocher) | boutons ad hoc |
| `vtt-segmented` / `vtt-segment` (+ `.is-active`) | bascule en segments (ex. Preset / Personnalisé) | — |
| `vtt-list-item` (+ `.is-selected`) | ligne sélectionnable d'une liste (table, personnage) | cartes ad hoc |
| `vtt-callout` (+ `-danger`) | message d'information ou d'erreur dans la modale | encadrés ad hoc |

---

## 5. Style par défaut (`index.css`, `@layer components`)

- Uniquement les variables plateforme `--color-*` (aucune couleur codée en dur), dans l'esprit de la configuration des dés : fond `rgba(0,0,0,.7)` flouté, panneau `--color-surface` arrondi à bordure fine `--color-border`, titre court en petites capitales `--color-primary`, sous-titre `--color-text-muted`, corps défilant, pied séparé par un filet.
- Texte sur fond `primary` : nouvelle variable **facultative** `--color-on-primary` (repli : `#fff`), qu'un thème peut définir pour garantir le contraste. Aucune autre variable plateforme n'est ajoutée.
- Un slug qui ne définit aucune classe `vtt-*` obtient ce rendu : sobre, cohérent avec ses couleurs, sans changement d'allure brutal.

---

## 6. Habillage par slug (`theme.css`)

- Le slug redéfinit les classes qu'il veut (`.vtt-modal-panel`, `.vtt-btn-primary`, `.vtt-input`…), hors couche : il l'emporte toujours sur le style par défaut.
- Pour partager un style existant, il regroupe les sélecteurs : `.vk-btn-primary, .vtt-btn-primary { … }`.
- Rien n'est ajouté au code générique pour un slug donné.

**Vikings (pilote, M-5)** :
- `.vtt-modal-panel` : cadre à coins légers du kit (coins du haut sur le panneau, coins du bas sur `.vtt-modal-deco`), fond et ombre de `.vk-panel`, filtre nuit des ornements ;
- `.vtt-modal-title` : Eagle Lake ; `.vtt-modal-header` : fermeture tenue à l'écart des coins ;
- `.vtt-btn*`, `.vtt-input`, `.vtt-field-label`, `.vtt-pill`, `.vtt-segment`, `.vtt-list-item`, `.vtt-callout` : partagés avec les classes `vk-` équivalentes ;
- `--color-on-primary` : couleur du texte sur or du kit ;
- `.vtt-scroll` : poignée bois et or du kit (`.vk-scroll, .vtt-scroll`). La classe s'applique aussi aux zones qui défilent des modales propres à Vikings (corps de `VkModal`, dont la modale de jet), qui en manquent aujourd'hui.

---

## 7. Lot pilote — fichiers touchés

| Fichier | Modification |
|---|---|
| `components/ui/Modal.jsx` | nouveau (§3) |
| `index.css` | classes `vtt-*` et style par défaut (§4, §5) |
| `components/AvatarUploader.jsx` | migration (props inchangées) |
| `components/gm/modals/TableManagementModal.jsx` | migration, sous-modale `SessionFormModal` comprise |
| `components/gm/modals/TableCharactersModal.jsx` | migration, sous-modale `AddCharacterModal` et ligne `CharacterRow` comprises |
| `components/modals/AlertModal.jsx` | migration (appelée par les trois modales ci-dessus) |
| `systems/vikings/theme.css` | habillage (§6), barres de défilement comprises |
| `systems/vikings/components/ui/VkModal.jsx` | classe `vtt-scroll` sur le corps (§3.4) |
| `documentations/refonte_vikings/UIkit_complet.source.html` (+ version autonome) | reprise de l'habillage des modales génériques dans la planche, référence du thème |

Pour chaque modale migrée : fond opaque corrigé, couleurs codées en dur et alias legacy retirés, emojis retirés (M-4), comportement et contenu fonctionnel inchangés.

---

## 8. Lot 2

`CharacterListModal`, `CodeModal`, `AccessCodeModal`, `ConfirmModal`, `DiceConfigModal`, `FreeDiceModal`, `GMSendModal` (habillage seul, M-7). Les confirmations natives du navigateur de la gestion des tables (suppression d'une table, retrait d'un personnage) passent par `ConfirmModal`. Chaque slug peut ensuite habiller ses modales génériques dans son `theme.css`, au rythme de ses propres refontes.

---

## 9. Vérifications

- `npm run lint`, `npm test`, `npm run build` (depuis `src/client`).
- Contrôle visuel par le MJ de chaque modale migrée sur **trois slugs** : Vikings (habillé), et deux slugs sans classes `vtt-*` (Zone Blanche et Fabula), en jour et en nuit. Points d'attention : fond assombri (plus d'opaque), empilement gestion des tables → composition de table → alerte, Échap, clic sur le fond, bouton Agrandir / Réduire, barres de défilement (Chrome et Firefox), affichage sur téléphone.
- Pas de test unitaire : aucune règle de calcul n'est en jeu.

---

## 10. Questions

| # | Question | Proposition | Réponse MJ                                 |
|---|---|---|--------------------------------------------|
| U-1 | Clic sur le fond : ferme-t-il la modale ? | **Oui par défaut**, **non** pour les modales de saisie où une fermeture accidentelle ferait perdre le travail en cours : création / modification de table (`SessionFormModal`) et recadrage d'avatar. Aujourd'hui, la plupart des modales génériques ne se ferment pas au clic sur le fond. | On peut le mettre en option via un props/params |
| U-2 | L'alerte (`AlertModal`) passe-t-elle au-dessus de tout, y compris l'animation des dés, comme aujourd'hui (z-index 9999) ? | **Oui** : une variante « alerte » du z-index (`--vtt-z-alert`), seule exception à la règle du z-index unique. | Oui comme le suggère la reco               |
| U-3 | Agrandir / Réduire : la taille choisie est-elle mémorisée d'une ouverture à l'autre ? | **Non** : la modale rouvre à sa taille d'origine. La mémoriser (par modale, dans le navigateur de chaque joueur) reste possible plus tard si le besoin se fait sentir. | OK |
| U-4 | Quelles modales du pilote sont agrandissables ? | **Gestion des tables** et **composition de table** (listes qui peuvent s'allonger). Pas l'alerte ni les formulaires courts. Au lot 2 : liste des personnages, configuration des dés. | OK |
