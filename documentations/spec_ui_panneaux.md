# Fenêtres flottantes génériques (`FloatingPanel`)

## Statut

**Validée par le MJ le 2026-11-01** (décisions F-1 à F-7, O-1 à O-3 au §1). **Implémentée le 2026-11-01** (`components/ui/FloatingPanel.jsx`, `hooks/useFloatingWindow.js`, `tools/floatingGeometry.js`) ; le panneau audio l'utilise. Vérification en dev par le MJ en attente (§5).

Écart avec le §2.1 : le focus à l'ouverture (F-4) passe par une prop `focusOnOpen` (vrai par défaut), que l'appelant met à faux quand la fenêtre se rouvre seule après un rechargement.

Brique de plateforme, de la même famille que la modale générique (`spec_ui_modales.md`) : `Modal` est la fenêtre qui bloque la page, `FloatingPanel` celle qui flotte sans la bloquer.

Objectif : une fenêtre flottante prête à l'emploi — déplaçable, redimensionnable, réductible, plein écran, mémorisée — que chaque brique remplit de son contenu. Premier usage : le panneau MJ de la musique (`spec_audio.md`). Usages pressentis : outils du tableau partagé, suivi des rounds et de l'initiative, pense-bête du MJ.

Origine : relecture du code de la brique audio par le MJ (`spec_audio.md` §11.16).

Hors périmètre :
- le contenu des fenêtres ;
- le déplacement et le redimensionnement au clavier (F-5) : évolution ;
- l'aimantation aux bords de l'écran et la taille maximale : à ajouter si un vrai besoin apparaît.

---

## 1. Décisions (phase 1, 2026-10-31)

| # | Sujet | Décision |
|---|---|---|
| F-1 | Plusieurs fenêtres | La fenêtre cliquée passe au premier plan (une petite pile commune à toutes les fenêtres flottantes). |
| F-2 | Petit écran | Sous 640 px, la fenêtre s'ouvre en plein écran, sans poignées ni déplacement. Règle de la plateforme, pas une option. |
| F-3 | Échap | Ne ferme pas la fenêtre (elle ne bloque pas la page ; Échap sert aux menus, champs et modales). Fermeture par ✕. |
| F-4 | Focus | Donné à la fenêtre quand elle s'ouvre par un geste de l'utilisateur ; pas quand elle se rouvre seule après un rechargement. |
| F-5 | Clavier | Déplacer et redimensionner au clavier : plus tard (ex. Alt + flèches). Réduire, plein écran et fermer restent au clavier. |
| F-6 | Noms | `tools/panelGeometry.js` devient `tools/floatingGeometry.js` ; `hooks/useFloatingWindow.js` garde son nom. |
| F-7 | Spec | Ce fichier, au format de `spec_ui_modales.md`. |
| O-1 | Options | Déplacement, redimensionnement, réduction, plein écran, fermeture, taille et position de départ, taille minimale, mémorisation : au choix de la fenêtre (§2). |
| O-2 | Position de départ | Par ancrage (`'bottom-right'`…) plutôt qu'en pixels, juste sur tous les écrans. |
| O-3 | Mémorisation | Seulement ce que l'utilisateur peut changer : position si déplaçable, taille si redimensionnable, réduction si réductible. Par `browserStorage` (`spec_browser_storage.md`). |

---

## 2. Composant `components/ui/FloatingPanel.jsx`

### 2.1 Contrat

| Prop | Défaut | Rôle |
|---|---|---|
| `title` | — | Titre (barre de titre, nom de la fenêtre pour les lecteurs d'écran) |
| `subtitle`, `icon` | — | Comme `Modal` |
| `titleExtra` | — | Texte en plus dans la barre de titre (ex. morceau en cours), gardé quand la fenêtre est réduite |
| `onClose` | — | Bouton ✕ ; sans `onClose`, pas de bouton (fenêtre qu'on ne ferme pas) |
| `movable` | `true` | Déplacement par la barre de titre |
| `resizable` | `true` | Poignées sur les 4 bords et les 4 coins |
| `minimizable` | `true` | Bouton Réduire : il ne reste que la barre de titre |
| `expandable` | `true` | Bouton Plein écran |
| `defaultSize` | `{ width: 480, height: 600 }` | Taille à la première ouverture, ramenée dans la fenêtre du navigateur |
| `minSize` | `{ width: 320, height: 240 }` | Taille minimale au redimensionnement |
| `defaultPosition` | `'bottom-right'` | Ancrage : `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'center'` |
| `offset` | `{ x: 16, y: 72 }` | Décalage depuis le bord d'ancrage (le défaut laisse la place aux boutons flottants en bas à droite) |
| `persistAs` | — | Identifiant de mémorisation : clé `vtt:<slug>:panel:<persistAs>`, par slug de la page (chaque jeu garde sa disposition) ; sans lui, rien n'est mémorisé |
| `minimizedActions` | — | Boutons dans la barre de titre, **une fois la fenêtre réduite seulement** (à côté du titre, avant Réduire / Plein écran / Fermer ; un clic dessus ne déplace pas la fenêtre). Le titre et `titleExtra` restent, tronqués si la place manque (`titleExtra` textuel aussi en infobulle) |
| `focusOnOpen` | `true` | Focus donné à la fenêtre à son ouverture (F-4) ; faux quand elle se rouvre seule |
| `className` | — | Classe en plus sur la fenêtre (habillage propre à un usage) |
| `children` | — | Contenu ; il gère son propre défilement et son propre pied |
| `onPaste`, etc. | — | Autres props transmises à l'élément de la fenêtre (ex. Ctrl+V du panneau audio) |

### 2.2 Comportement

- **Position** : fixe dans la page, rendue sur place (pas dans l'emplacement à modales : la fenêtre ne bloque rien et peut coexister avec une modale par-dessus).
- **Reste dans la fenêtre du navigateur** : à l'ouverture, au déplacement, au redimensionnement et quand le navigateur change de taille ; la barre de titre reste toujours atteignable.
- **Premier plan** (F-1) : un clic n'importe où dans la fenêtre la passe devant les autres fenêtres flottantes ; toutes restent sous les modales.
- **Conteneur de requêtes de taille** : le contenu s'adapte à la largeur de la fenêtre (`@container`), pas à celle de l'écran. Conséquence à connaître : ce qui est en position fixe dans le contenu (menus, fenêtres modales) doit passer par l'emplacement à modales (`HostedModal`), sinon il est rogné. Écrit dans le commentaire du composant.
- **Réduite** : barre de titre seule (titre, `titleExtra`, boutons), à sa position.
- **Plein écran** : marge de 1 rem tout autour, ni poignées ni déplacement ; non mémorisé.
- **Petit écran** (F-2) : plein écran d'office, boutons Réduire et Fermer gardés.
- **Accessibilité** : `role="dialog"`, `aria-modal="false"`, nom de la fenêtre par le titre ; boutons nommés ; focus visible ; F-4 pour le focus à l'ouverture.

### 2.3 Structure et classes

Les classes de la modale générique, pour reprendre l'habillage des modales de chaque slug, plus des classes `vtt-floating-*` pour ce qui fait d'elle une fenêtre flottante :

```
section.vtt-modal-panel.vtt-floating-panel[.is-minimized][.is-full]   (style : position, taille, ordre)
  span.vtt-modal-deco
  header.vtt-modal-header.vtt-floating-header                          (poignée de déplacement)
    [span.vtt-modal-icon]
    div.vtt-modal-heading
      h2.vtt-modal-title  (+ small.vtt-floating-title-extra)
      [p.vtt-modal-subtitle]
    button.vtt-modal-expand.vtt-floating-btn   (Réduire / Agrandir)
    button.vtt-modal-expand.vtt-floating-btn   (Plein écran)
    button.vtt-modal-close                     (Fermer)
  div.vtt-floating-body                         (contenu)
  span.vtt-floating-resize.vtt-floating-resize-{n,s,e,w,ne,nw,se,sw}
```

Style par défaut dans `index.css` (`@layer components`, variables `--color-*` seulement) : position fixe, ordre, poignées, état réduit et plein écran, boutons Réduire / Plein écran gardés sur petit écran. Fond, bordure, en-tête, titre et boutons : ceux de la modale. Un slug n'a rien à habiller de plus que ses modales ; il peut cibler `.vtt-floating-panel` s'il veut distinguer les deux.

### 2.4 Briques internes

| Fichier | Rôle |
|---|---|
| `tools/floatingGeometry.js` (ex `panelGeometry.js`) | Calculs purs, testés : rectangle par défaut depuis un ancrage, maintien dans la fenêtre, déplacement, redimensionnement |
| `hooks/useFloatingWindow.js` | Position, taille, réduction (mémorisées par `usePersistedState` si `persistAs`), gestes au pointeur, suivi du redimensionnement du navigateur, options O-1 |
| `components/ui/FloatingPanel.jsx` | Le composant, la pile de premier plan, le petit écran |

---

## 3. Le panneau audio sur `FloatingPanel`

- `AudioGMPanel` devient `<FloatingPanel title="Musique" titleExtra={morceau en cours} persistAs="audio" onClose={…} onPaste={…}>…</FloatingPanel>` ; il ne garde que l'audio (ce qui joue, bibliothèque, pied, Ctrl+V, imports).
- Les classes `vtt-audio-panel*` et `vtt-audio-resize*` disparaissent au profit des `vtt-floating-*`.
- Ouverture et fermeture restent à `AudioLayer` (c'est l'appelant qui décide si la fenêtre est affichée), mémorisées par slug dans `vtt:<slug>:audio` (les volumes restent dans `vtt:platform:audio`).

---

## 4. Fichiers touchés

| Fichier | Changement |
|---|---|
| `src/client/src/components/ui/FloatingPanel.jsx` | Nouveau |
| `src/client/src/hooks/useFloatingWindow.js` | Options O-1, ancrage, mémorisation par `usePersistedState`, pile de premier plan |
| `src/client/src/tools/panelGeometry.js` → `floatingGeometry.js` | Renommé ; rectangle par défaut depuis un ancrage et un décalage |
| `src/client/tests/tools/panelGeometry.test.js` → `floatingGeometry.test.js` | Renommé ; cas des ancrages |
| `src/client/src/index.css` | Style par défaut `vtt-floating-*` ; retrait des `vtt-audio-panel*` / `vtt-audio-resize*` |
| `src/client/src/components/audio/AudioGMPanel.jsx` | Passage sur `FloatingPanel` |
| `src/client/CLAUDE.md` | `FloatingPanel` parmi les composants génériques dont on lit le contrat ; règle du `HostedModal` dans une fenêtre flottante |

---

## 5. Vérifications

- `npm test`, `npm run lint`, `npm run build` (depuis `src/client`).
- En dev, panneau audio : déplacement, redimensionnement par les 8 poignées, réduction, plein écran, fermeture ; position et taille retrouvées après rechargement ; menus ≋ et ⋯ non rognés.
- Fenêtre du navigateur réduite : le panneau y reste.
- Largeur de téléphone (outils du navigateur) : plein écran d'office.
- Vikings et un slug sans habillage : la fenêtre reprend l'habillage des modales.
