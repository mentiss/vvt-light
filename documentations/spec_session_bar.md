# Barre de session des joueurs (`SessionPlayersBar`)

## Statut

**Validée par le MJ le 2026-10-18** (décisions au §1, planche `documentations/refonte_plateforme/UIkit_session_bar.html`, réponses au §8). Lot 1 implémenté le 2026-10-18 ; ajustements par slug possibles au lot 2.

Sur la planche, les coins de Vikings n'apparaissent pas : leurs images sont des variables du `theme.css` du slug, résolues depuis la planche. Dans l'appli, l'habillage vit dans `theme.css` et les coins s'affichent.

Brique de plateforme : composant générique `src/client/src/components/layout/SessionPlayersBar.jsx`, affiché sur la fiche joueur de tous les slugs.

Même démarche que les modales génériques (`spec_ui_modales.md`) : classes stables `vtt-*`, style par défaut dans `index.css` (`@layer components`), habillage par le `theme.css` du slug, aucune couleur codée en dur ni emoji dans le générique.

Hors périmètre : affichage tablette et téléphone (passe responsive globale à faire plus tard), interface MJ, contenu de la barre au-delà de l'existant (avatar, personnage, joueur, statut).

---

## 1. Décisions du diagnostic (validées le 2026-10-18)

| # | Sujet | Décision |
|---|---|---|
| B-1 | Zoom sur un avatar | Carte flottante hors de la barre, ouverte au survol (souris) après un court délai. Le toucher n'est pas traité (personne ne joue sur tablette ou téléphone pour l'instant). |
| B-2 | Modes d'affichage | Trois modes au choix du joueur : **panneau** (actuel), **rail** (colonne fine de petits avatars) et **masqué** (bouton pour rouvrir). Le masquage reste possible pour récupérer de la place sur la fiche. |
| B-3 | Contrat du composant | Props inchangées (`character`, `sessionId`, `sessionName`, `headerHeight`, `bottomHeight`, `noWidthWhenCollapsed`) : aucune fiche de slug n'est modifiée. |
| B-4 | Style | Classes `vtt-session-bar*`, style par défaut dans `index.css`, surchargeable par le slug. |
| B-5 | Slugs pilotes | Habillage de Vikings et de Cyberpunk. |
| B-6 | Méthode | Planche HTML avec les vrais thèmes des pilotes, à valider avant le code. |

---

## 2. Constat

- Zoom par `transform: scale(2.5)` sur une pastille de 48 px : l'avatar agrandi est rogné par la liste qui défile, recouvre ses voisins, saute au moindre mouvement et reste flou (rendu de 48 px agrandi).
- Tout le style est en `style=` inline, avec des couleurs codées en dur (vert `#22c55e`, gris `#9ca3af` / `#6b7280`) : aucun point d'accroche pour un thème.
- Emoji dans le générique (📋 devant le nom de la session, 👤 sans avatar).
- Mode réduit binaire : la barre disparaît entièrement.
- Usage mort dans Cyberpunk (`Sheet.jsx`, ligne 305) : la barre y est appelée sans `sessionId`, elle ne s'affiche donc jamais à cet endroit (Q-3).

---

## 3. Modes d'affichage

| Mode | Contenu | Passage vers |
|---|---|---|
| Panneau | En-tête (nom de la session, boutons), liste : avatar 48 px, nom du personnage, nom du joueur | Rail, Masqué |
| Rail | Colonne fine : boutons en tête, avatars 36 px avec leur statut, sans texte | Panneau, Masqué |
| Masqué | Petit bouton flottant au bord gauche | Retour au dernier mode visible (panneau ou rail) |

- **Nom de la session** (panneau) : précédé du sur-titre « Table » ; jamais tronqué sur une seule ligne. Il passe sur plusieurs lignes équilibrées, les boutons restant alignés sur la première ; au-delà de 3 lignes, il est coupé avec des points de suspension et le nom complet s'affiche au survol.
- Le mode est **mémorisé par slug** dans le navigateur (clé existante `<slug>_player_session_bar`). Les valeurs déjà enregistrées sont reprises : « réduit » devient **masqué**, « ouvert » devient **panneau**.
- Le comportement au défilement (liste fixée sous le bandeau du slug), l'espace réservé et la position du bouton flottant restent pilotés par les props actuelles (B-3).

---

## 4. Personnages et statuts

| Statut | Rendu |
|---|---|
| Moi | Anneau épais couleur primaire |
| En ligne | Anneau fin couleur primaire, pastille de présence (couleur succès) |
| Hors ligne | Avatar désaturé et estompé, textes atténués |

Sans avatar : **initiales** du personnage (deux lettres au plus) sur fond de surface, à la place de l'emoji.

---

## 5. Carte flottante (zoom)

- **Ouverture** : survol d'un avatar (panneau ou rail) pendant environ 150 ms ; passer d'un avatar à l'autre bascule la carte sans délai. **Fermeture** : la souris quitte l'avatar, ou Échap.
- **Position** : à droite de la barre, alignée sur la ligne de l'avatar, toujours dans l'espace visible de la barre : jamais sous le bandeau collant du slug (`headerHeight`) ni hors du bas de l'écran (recalée vers le bas pour le premier personnage, vers le haut pour le dernier). Elle n'est jamais rognée par la liste et ne décale rien.
- **Contenu** : avatar en grand (environ 220 px, coins arrondis, image entière à sa taille réelle donc nette), nom du personnage, nom du joueur, statut (« Vous », « En ligne », « Hors ligne »). Sans avatar : grandes initiales.
- Au-dessus de la fiche, sous les modales et l'animation des dés.

---

## 6. Classes (contrat d'habillage)

| Classe | Élément |
|---|---|
| `vtt-session-bar` | conteneur ; attribut `data-mode` = `panel`, `rail` ou `hidden` |
| `vtt-session-bar-header`, `-heading`, `-eyebrow`, `-title` | en-tête ; bloc titre (masqué en rail) avec le sur-titre « Table » et le nom de la session |
| `vtt-session-bar-actions`, `-toggle` | groupe de boutons, bouton (icônes au trait génériques) |
| `vtt-session-bar-list` | liste des personnages (défile) |
| `vtt-session-bar-player` | une ligne ; attributs `data-me` et `data-online` |
| `vtt-session-bar-avatar` | conteneur de l'avatar (porte le point de présence, déclenche la carte) |
| `vtt-session-bar-frame` | cadre : anneau de statut et forme (cercle par défaut, coins coupés pour Cyberpunk) |
| `vtt-session-bar-image`, `-initials`, `-presence` | image ou initiales dans le cadre, point de présence |
| `vtt-session-bar-text`, `-name`, `-player-name` | bloc texte (masqué en rail), nom du personnage, nom du joueur |
| `vtt-session-bar-card` (+ `-deco`, `-image`, `-name`, `-player-name`, `-status`) | carte flottante ; attributs `data-me` et `data-online` ; `-deco` vide pour les ornements du slug (comme `vtt-modal-deco`) |
| `vtt-session-bar-reopen` | bouton flottant du mode masqué |

Dimensions (largeur du panneau 14 rem, du rail 3.5 rem, tailles d'avatar) : variables CSS `--vtt-session-bar-*`, redéfinissables par un slug.

---

## 7. Habillage des pilotes

Chaque habillage reprend le vocabulaire existant du slug (première version de la planche trop approximative, retour du MJ) :

- **Vikings** (d'après `spec_vikings_lot4_graphisme.md` et `theme.css`) : panneau `vk-panel` à coins légers `vk-light-sm` côté fiche, filet en dégradé `vk-sep-line` sous l'en-tête, sur-titre `vk-eyebrow` et nom de la table en Grenze Gotisch (`vk-section-title`), boutons `vk-btn-icon`, avatars au rendu de `vk-avatar` (rond, liseré or de 2 px, initiales en Eagle Lake), « moi » signalé par un fond doré léger ; carte `vk-light-sm` aux quatre coins, nom en Eagle Lake, statut en sur-titre sous un filet.
- **Cyberpunk** (d'après la fiche et `theme.css`) : coins arrondis (`rounded-lg` / `rounded-xl`), intitulés `cp-font-ui` en capitales espacées, filet `cp-divider`, boutons du bandeau de la fiche, « moi » signalé par un dégradé néon cyan sans encadré (retour du MJ : l'encadré surchargeait), avatars `rounded-lg` à liseré de 1 px comme `IdentityCard`, avec un halo néon sur les avatars en ligne ; bouton de réouverture à coins coupés ; carte à coins coupés (la découpe casse la bordure aux angles) avec lignes de balayage sur le portrait (retours du MJ, repris de la première planche) ; nom de la carte en `cp-text-glow-cyan`, statut en `cp-stat-badge`.

Rendu exact : voir la planche.

---

## 7 bis. Découpage

1. **Lot 1** : composant, style par défaut, habillage des pilotes Vikings et Cyberpunk, retrait de l'usage mort de Cyberpunk.
2. **Lot 2** : habillage des autres slugs (Fabula, Zone Blanche, Achtung, Delta Green, Dune, Tecumah), sur le même principe : vocabulaire existant de chaque slug, planche avant le code.

Noctis est exclu : il sera entièrement refait (changement de système de jeu). Il garde le style par défaut.

---

## 8. Questions ouvertes

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q-1 | Forme de l'image dans la carte : cercle comme dans la barre, ou carré arrondi qui montre tout le portrait ? | Carré arrondi : le zoom sert à voir le portrait, un cercle en coupe une partie. | Carré arrondi |
| Q-2 | Ordre de la liste : ordre actuel de la session, ou « moi » d'abord puis en ligne puis hors ligne ? | Garder l'ordre de la session : chacun garde sa place, la liste ne saute pas quand quelqu'un se connecte. | Ordre de la session |
| Q-3 | Usage mort de la barre dans Cyberpunk (`Sheet.jsx:305`) | Le retirer dans ce chantier (une ligne, aucun effet visible). | Le retirer |
