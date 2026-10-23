# Menu hamburger générique, en briques, habillable par slug

## Statut

**Proposée le 2026-10-23** (décisions D-1 à D-8 au §1 issues du diagnostic). Questions Q-1 à Q-4 tranchées par le MJ le 2026-10-23 (§11). **Lot pilote implémenté et validé le 2026-10-23** (commit fd7e26c). **Lot 2 implémenté le 2026-10-23**, en attente du contrôle visuel du MJ.

Brique de plateforme : concerne les menus joueur (`Sheet.jsx`) et MJ (`GMApp.jsx` / `gm/GMView.jsx`) des 9 slugs.

Objectif : ne plus recoder dans 18 fichiers la mécanique du menu (bouton, ouverture, fermeture, modales de la plateforme), **sans unifier les menus** : chaque slug garde le choix, l'ordre, les libellés et l'habillage de ses éléments.

Hors périmètre :
- les onglets, bandeaux et autres boutons d'en-tête ;
- l'enregistrement de l'avatar hors mode édition sur Cyberpunk, Dune et Tecumah (à vérifier à part, voir §9) ;
- la refonte de Noctis.

---

## 1. Décisions (diagnostic validé le 2026-10-23)

| # | Sujet | Décision |
|---|---|---|
| D-1 | Approche | Des **briques assemblables** : `HamburgerMenu`, `HamburgerMenuItem`, `HamburgerMenuSeparator`, et des éléments prêts à l'emploi `HamburgerMenuItemXXX`. Pas de menu unifié. |
| D-2 | Nommage | Tous les composants commencent par `HamburgerMenu` ; les éléments prêts à l'emploi sont `HamburgerMenuItem` suivi du nom de l'élément. |
| D-3 | Éléments prêts à l'emploi | Ceux du §5. Un même élément sert au joueur et au MJ quand l'action est la même (jet libre, configuration des dés, déconnexion). Les éléments propres à un slug (Évolution de Delta Green, Dépenser des PP de Tecumah, Historique des jets du MJ Cyberpunk) restent au slug, faits avec `HamburgerMenuItem`. |
| D-4 | Déconnexion | **Identique joueur et MJ** : déconnexion, puis retour à l'**accueil de la plateforme** (`/`). Ajoutée là où elle manque (MJ de Fabula et de Zone Blanche). |
| D-5 | Icônes | Une icône SVG au trait par défaut pour chaque élément prêt à l'emploi ; le slug peut la remplacer (emoji, `VkIcon`…) ou n'en mettre aucune. À la migration, les slugs qui avaient des icônes (emojis, `VkIcon`) **les gardent** : elles font partie de leur habillage ; les autres prennent l'icône standard ou aucune (Q-3). |
| D-6 | Modales des éléments | Rendues dans un **emplacement à modales des pages génériques** (`PlayerPage`, `GMPage`), par portail : elles ne disparaissent pas à la fermeture du menu et ne sont pas coupées par le cadre d'un thème. Le thème jour / nuit est déjà sur `<html>` (commit 3cc5661). |
| D-7 | Découpage | En lots, **habillage des slugs compris** dans les lots (§8). |
| D-8 | Défauts corrigés au passage | Dune : « Créer un personnage » mène à `/dune/` au lieu de `/dune/creation`. Déconnexion absente (D-4). Achtung MJ : ajout de la gestion des tables au menu (l'onglet Session y donne déjà accès ; l'un n'empêche pas l'autre). |

---

## 2. Constat

- Menu recodé dans les 18 fichiers : état d'ouverture, surcouche `fixed inset-0` pour fermer au clic extérieur, fermeture à la main dans chaque `onClick`, pas de fermeture à Échap.
- Modales de la plateforme déclarées dans chaque fiche (`showDiceConfig`, `showAccessCode`, `showCharList`…) avec le même code, dont « changer de personnage » écrit 9 fois (une variante bricolée sur Noctis).
- Rendus hétérogènes : emojis (6 slugs), `VkIcon` (Vikings), aucune icône (Zone Blanche) ; classes de menu existantes chez Achtung (`ac-menu-*`), Zone Blanche (`zb-menu-*`), Vikings (`vk-menu-*`), Noctis (`ns-header-menu-item`), styles en ligne ailleurs.
- Déconnexion MJ vers des destinations différentes selon le slug (`/<slug>/gm`, `/<slug>/`, `/`, sur place), absente chez Fabula et Zone Blanche.

---

## 3. Briques de base (`components/ui/HamburgerMenu.jsx`)

### 3.1 `HamburgerMenu`

| Prop | Rôle | Défaut |
|---|---|---|
| `children` | éléments du menu | requis |
| `button` | contenu du bouton (icône du slug, ☰…) | icône « menu » de la plateforme |
| `buttonClassName` | classes ajoutées au bouton (ex. `vk-btn vk-btn-icon`) | — |
| `title` | infobulle et libellé accessible du bouton | « Menu » |
| `align` | côté d'ouverture sous le bouton : `right`, `left` | `right` |
| `className` | classes ajoutées au panneau | — |

Comportement :
- ouverture et fermeture au clic sur le bouton ; fermeture au clic à l'extérieur, à **Échap** et après le clic sur un élément ;
- plus de surcouche plein écran : la page reste utilisable derrière ;
- panneau placé sous le bouton, au-dessus de la fiche, sous les modales.

### 3.2 `HamburgerMenuItem`

| Prop | Rôle | Défaut |
|---|---|---|
| `children` | libellé | requis |
| `onClick` | action (le menu se ferme ensuite) | — |
| `href` | lien : rendu en `<a href>` (règle « une page = un slug ») | — |
| `icon` | nœud affiché avant le libellé ; `null` ou absent : pas d'icône | — |
| `danger` | action destructrice (déconnexion) | `false` |
| `disabled` | élément inactif | `false` |
| `className` | classes ajoutées | — |

### 3.3 `HamburgerMenuSeparator`

Un filet entre deux groupes d'éléments. Aucune prop.

### 3.4 Structure et classes

```
div.vtt-menu-root                    conteneur (position relative)
├─ button.vtt-menu-button            bouton du menu
└─ div.vtt-menu (+ .vtt-menu-left)   panneau, si ouvert
   ├─ button|a.vtt-menu-item (+ .is-danger)
   │  ├─ span.vtt-menu-icon          (si icône)
   │  └─ span.vtt-menu-label
   └─ div.vtt-menu-separator
```

---

## 4. Emplacement à modales des pages génériques

- `PlayerPage` et `GMPage` rendent un emplacement, toujours monté, **à côté** de la fiche ou de l'interface MJ, et le partagent par un contexte (`ModalHost`).
- Un élément prêt à l'emploi y rend sa modale par un **portail** React : la modale reste dans l'arbre de l'élément (props à jour, état gardé), mais s'affiche hors du menu.
- Sans emplacement (composant utilisé hors de ces pages), la modale est rendue dans `<body>`, jamais sur place : l'élément vit dans un menu fermé, donc masqué.
- L'emplacement est placé **avant** la page : les notifications, que les slugs rendent en dernier, restent devant les modales.
- Une classe racine de slug qui porte la police (ex. `.vk-root`) cible aussi `.vtt-modal-host` dans le `theme.css` du slug, pour que les modales de l'emplacement gardent sa police.
- Les modales y héritent du thème du slug (`theme.css` chargé par la page) et du jour / nuit (posé sur `<html>`).
- L'emplacement peut servir plus tard à d'autres éléments génériques (ex. barre d'actions de la session MJ).

---

## 5. Éléments prêts à l'emploi

Props communes à tous : `label` (libellé par défaut ci-dessous), `icon` (absent : icône par défaut ; nœud : remplace ; `null` : aucune), `className`.

| Composant | Libellé par défaut | Action | Props propres | Joueur | MJ |
|---|---|---|---|---|---|
| `HamburgerMenuItemCreateCharacter` | Créer un personnage | lien `/<slug>/creation` | — | ✓ | |
| `HamburgerMenuItemSwitchCharacter` | Changer de personnage | `CharacterListModal`, puis `/<slug>/<accessUrl>` du personnage choisi | `currentCharId` | ✓ | |
| `HamburgerMenuItemAvatar` | Changer l'avatar | `AvatarUploader` | `currentAvatar`, `onChange` (le slug enregistre) | ✓ | |
| `HamburgerMenuItemAccessCode` | Code d'accès | `AccessCodeModal` | `character`, `onSuccess` | ✓ | |
| `HamburgerMenuItemFreeDice` | Jet de dés libre | `FreeDiceModal` | `characterId`, `characterName`, `sessionId`, `isGM` | ✓ | ✓ |
| `HamburgerMenuItemDiceConfig` | Configuration des dés | `DiceConfigModal` | — | ✓ | ✓ |
| `HamburgerMenuItemGMInterface` | Interface MJ | lien `/<slug>/gm` | — | ✓ | |
| `HamburgerMenuItemPlayerView` | Vue joueur | lien `/<slug>/` | — | | ✓ |
| `HamburgerMenuItemTableManagement` | Gestion des tables | `TableManagementModal` | `activeSessionId`, `onSelectTable` | | ✓ |
| `HamburgerMenuItemHome` | Accueil de la plateforme | lien `/` | — | ✓ | ✓ |
| `HamburgerMenuItemLogout` | Déconnexion | déconnexion, puis `/` (D-4) ; marqué `danger` | — | ✓ | ✓ |

- Libellés par défaut sur tous les éléments prêts à l'emploi, dans tous les slugs (Q-4) : les libellés actuels (« Config animations dés », « Gérer les tables »…) disparaissent. `label` reste disponible pour un besoin futur.
- Le slug est déduit de l'adresse (`useSystem`), jamais passé en prop.
- `onLogout` de `PlayerPage` n'est plus nécessaire aux fiches migrées ; il reste fourni tant que des fiches l'utilisent.

---

## 6. Icônes par défaut

- Jeu d'icônes SVG au trait de la plateforme, dans le style de celles de l'accueil (`vtt-icon-line`) : menu, créer, personnes, portrait, clé, dé, réglages, couronne (MJ), œil (vue joueur), tables, maison, porte (déconnexion).
- Pas d'emoji dans le générique (comme M-4 des modales) ; un slug qui veut ses emojis ou ses propres icônes les passe en `icon`.
- Migration (Q-3) : Achtung, Cyberpunk, Dune, Fabula, Tecumah gardent leurs emojis actuels, Vikings ses `VkIcon` ; Delta Green, Zone Blanche et Noctis, sans icônes, restent sans icônes (`icon={null}`).

---

## 7. Style par défaut et habillage

- Style par défaut dans `index.css`, couche `@layer components`, uniquement avec les variables `--color-*` : panneau `--color-surface` à bordure fine et ombre, éléments en ligne avec icône `--color-primary`, survol teinté `--color-primary`, élément `danger` en `--color-danger`, filet `--color-border`.
- Chaque slug surcharge les classes `vtt-menu*` dans son `theme.css`, hors couche. S'il a déjà ses classes de menu, il les partage (`.zb-menu-item, .vtt-menu-item { … }`), comme H-5 des modales.
- Slugs sans classes de menu (Cyberpunk, Delta Green, Dune, Fabula, Tecumah) : habillage écrit au lot 2, dans l'identité de leur barre de session et de leurs modales.

---

## 8. Lots

| Lot | Contenu |
|---|---|
| **Pilote** | Briques (§3), emplacement à modales (§4), éléments prêts à l'emploi (§5), icônes (§6), style par défaut (§7). Migration des menus joueur et MJ de **Vikings** (référence : menu à icônes, habillage par partage des classes `vk-menu-*`) et **Cyberpunk** **sans habillage** : il sert à contrôler le style par défaut. |
| **Lot 2** | Habillage du menu de **Cyberpunk**, une fois le lot pilote contrôlé. Migration et habillage des autres slugs : Achtung, Delta Green, Dune, Fabula, Tecumah, Zone Blanche. Noctis : migration de la mécanique seulement, **aucun habillage** (Q-2). Découpable en plusieurs lots si l'habillage le demande. Corrections D-8 de chaque slug dans son lot. |

Pour chaque menu migré : surcouche `fixed inset-0` et états des modales de la plateforme retirés de la fiche, comportement et contenu fonctionnel inchangés (hors D-4 et D-8).

---

## 9. Points à vérifier hors chantier

- Avatar : Cyberpunk, Dune et Tecumah ne mettent à jour que la fiche en cours d'édition (`setEditableChar`) ; hors mode édition, le nouvel avatar n'est peut-être pas enregistré. Achtung et Fabula enregistrent tout de suite (`patchImmediate`).

---

## 10. Vérifications

- `npm run lint`, `npm test`, `npm run build` (depuis `src/client`).
- Contrôle visuel par le MJ sur chaque slug migré, joueur et MJ, en jour et en nuit : ouverture, fermeture (clic extérieur, Échap, après un élément), chaque élément et sa modale, déconnexion vers l'accueil, liens (création, interface MJ, vue joueur), affichage sur téléphone.
- Pas de test unitaire : aucune règle de calcul n'est en jeu.

---

## 11. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | Faut-il une planche d'habillage, comme pour les modales ? | **Non** : les slugs à classes de menu existantes les partagent ; pour les autres, l'habillage suit l'identité déjà validée de leur barre de session et de leurs modales. Planche seulement si un rendu pose question. | Non. |
| Q-2 | Noctis (refonte à venir) est-il migré au lot 2 ? | **Oui pour la mécanique** (changer de personnage, déconnexion), en gardant son rendu `ns-header-menu-item` partagé avec `vtt-menu-item`, sans travail d'habillage. | Oui, mais aucun habillage. Cyberpunk, lui, est habillé : sans habillage au lot pilote pour contrôler le style par défaut, puis en style Cyberpunk au lot 2. |
| Q-3 | À la migration, les slugs à emojis (Achtung, Cyberpunk, Delta Green, Dune, Fabula, Tecumah) gardent-ils leurs emojis ? | **Icônes par défaut de la plateforme**, sauf avis contraire du MJ slug par slug au moment de son lot. | Les slugs qui ont des emojis gardent ce qu'ils avaient (c'est leur habillage) ; sinon icône standard ou aucune. |
| Q-4 | Les libellés actuels des slugs sont-ils gardés ? | **Libellés par défaut** du §5 partout, pour que les menus se lisent pareil d'un slug à l'autre ; `label` reste disponible. | Libellés par défaut sur les éléments plateforme / mutualisés. |
