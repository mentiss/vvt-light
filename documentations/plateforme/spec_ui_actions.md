# Spec — Zone d'actions et panneau d'historique (plateforme)

> Statut : **Implémenté le 2026-11-01** (spécification §6 validée, décisions en §5) ; vérification du MJ en dev attendue.
> Origine : retours du MJ sur l'audio (`spec_audio.md` §11.18) : boutons flottants des slugs qui se superposaient à ceux de la musique (Dune, Zone Blanche), et panneau latéral d'historique du MJ de Dune jugé « assez sympa ».

---

## 1. Idée

Deux briques de la plateforme, liées :

1. **Zone d'actions** : l'emplacement des boutons flottants de la musique (bas à droite) devient une zone générale de boutons d'actions de la plateforme (musique, historique, d'autres plus tard), avec une version courte en mini-menu.
2. **Panneau d'historique des jets** : un panneau latéral d'historique en brique plateforme, ouvert depuis la zone d'actions, en plus de l'onglet Historique que chaque slug garde.

## 2. Existant (relevé dans le code)

### 2.1 Boutons flottants

| Élément | Où | Position | Remarque |
|---|---|---|---|
| Musique : réglages du son, panneau MJ | `features/audio/AudioPlayerWidget.jsx`, monté par `AudioLayer` (PlayerPage / GMPage) | bas droite, plan 100 | habillés par chaque `theme.css` (`vtt-audio-toggle`) |
| Notifications (jets, messages du MJ) | `features/table/ToastNotifications.jsx`, monté par chaque slug | bas droite, 4 rem du bas, plan 50 | le volet des réglages du son passe devant elles |
| Historique (ex-bouton 📜 de Dune MJ), Jet MJ (Zone Blanche) | retirés le 2026-11-01 | — | la zone d'actions est la place prévue pour ce genre d'accès |

### 2.2 Historique des jets

- **Onglet Historique** : `features/dice/history/DiceHistoryPage.jsx`, dans les 9 slugs, joueur et MJ (18 usages). Rendu par `renderHistoryEntry` du slug ; suppression d'un jet et remise à zéro.
- **Panneau latéral** : `components/layout/HistoryPanel.jsx` (263 lignes), tiroir pleine hauteur à droite avec fond qui bloque la page. Mêmes fonctions que l'onglet (chargement, temps réel par socket, suppression, remise à zéro), **code en double** avec `DiceHistoryPage`, mise en forme en Tailwind et `style=` (15), non habillable par les slugs.
- Utilisé par : **Cyberpunk MJ** (entrée « Historique des jets » du menu), **Dune MJ** (bouton « 📜 Historique des jets » de l'onglet Ressources). Import mort dans la fiche Dune.
- Les 9 `config.jsx` exposent déjà `dice.renderHistoryEntry` : la plateforme peut monter le panneau **sans code dans les slugs**, comme la couche audio.

## 3. Pistes (à trancher en §4)

- **Zone** : un conteneur générique en bas à droite (classes `vtt-actions*`), monté par `PlayerPage` / `GMPage` ; la musique et l'historique y déclarent leurs boutons ; chaque bouton peut ouvrir un volet (comme les réglages du son) ou une fenêtre (panneau MJ, historique).
- **Mini-menu** : la zone se replie en un seul bouton qui déplie les actions (ex. « ⋯ » ou une icône de la plateforme) ; choix mémorisé par slug.
- **Panneau d'historique** : soit le tiroir actuel rendu non bloquant et habillable, soit une `FloatingPanel` ancrée à droite (déplaçable, réductible, mémorisée par slug, comme le panneau de la musique). Dans les deux cas, une seule liste partagée avec l'onglet (fin du code en double).

## 4. Questions

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                              |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A-1 | Qui met des boutons dans la zone ? | La plateforme seulement en v1 (musique, historique). Un slug pourra en déclarer plus tard (ex. jet du MJ) si le besoin revient | reco                                                                                                                                                                                                                                    |
| A-2 | Contenu par rôle | Joueur : réglages du son (si musique active), historique. MJ : réglages du son, panneau de la musique, historique | oui reco                                                                                                                                                                                                                                |
| A-3 | Forme de la zone | Les boutons en ligne, comme aujourd'hui ; un bouton « replier » les range dans un bouton unique (mini-menu) qui déplie la liste vers le haut, avec icône et libellé | reco oui                                                                                                                                                                                                                                |
| A-4 | Le mini-menu : choisi par chacun, ou automatique ? | Choisi par chacun (mémorisé par slug), et automatique sur petit écran (< 640 px) | oui                                                                                                                                                                                                                                     |
| A-5 | Habillage | Classes génériques `vtt-actions`, `vtt-action-btn` (états `is-active`, `is-playing`…) ; les blocs « Musique : boutons flottants » des 8 `theme.css` sont renommés (même rendu), pas réécrits | oui                                                                                                                                                                                                                                     |
| A-6 | Notifications : elles sont au-dessus de la zone, et le volet des réglages du son passe devant elles | La plateforme place les notifications au-dessus de la zone, quelle que soit sa hauteur ; un volet ouvert reste devant | oui pas un soucis                                                                                                                                                                                                                       |
| A-7 | Ancien combat (file de validation en bas à droite, Vikings et Tecumah MJ) | Hors périmètre (le combat n'est pas refondu) ; on vérifie seulement qu'il reste utilisable avec la zone | hors périmètre oui                                                                                                                                                                                                                      |
| B-1 | Forme du panneau d'historique | Une `FloatingPanel` ancrée à droite, haute, déplaçable, réductible et mémorisée par slug, comme la musique (une seule mécanique de fenêtre, habillage déjà fait par les slugs) ; pas de fond bloquant | ok reco                                                                                                                                                                                                                                 |
| B-2 | Adoption par les slugs | Active par défaut dans tous les slugs (rien à coder) ; un slug peut la couper par un réglage de son `config.jsx` | hmmm pas forcément parce que pour moi c'est lié à est-ce qu'on intégre ou pas l'historique des jets. Bon spoiler, ça risque être genre sur tous les slugs mais autant laissé la main au slug non ? Je sais pas à discuter/argumenter ça |
| B-3 | Joueurs et MJ ? | Les deux | reco les deux                                                                                                                                                                                                                           |
| B-4 | Contenu | Le même que l'onglet (jets de la table, suppression et remise à zéro pour le MJ) ; une seule liste partagée entre l'onglet et le panneau, `HistoryPanel.jsx` supprimé | Tu veux supprimer le vieux système c'est bien ça ?                                                                                                                                                                                      |
| B-5 | Accès actuels (menu Cyberpunk MJ, bouton de l'onglet Ressources de Dune MJ) | Retirés au profit du bouton de la zone ; l'entrée du menu Cyberpunk peut rester et ouvrir le panneau de la plateforme si tu y tiens | Non j'y tiens pas plus que ça, je ne me souvenais même pas qu'on avait ça sur cyberpunk c'est pour dire                                                                                                                                 |
| B-6 | Faut-il un raccourci clavier pour ouvrir l'historique ? | Non en v1 | non                                                                                                                                                                                                                                     |
| C-1 | Ordre | Zone d'actions (musique dedans, aucun changement visible hors le mini-menu), puis panneau d'historique, puis retrait des accès des slugs ; puis le lot 2 de l'audio (boutons préréglés) | ok reco                                                                                                                                                                                                                                 |

## 5. Décisions (2026-11-01)

Tranchées par le MJ en §4 :

- **Zone d'actions** : la plateforme seule y met des boutons en v1 (A-1). Joueur : réglages du son si la musique est active, historique ; MJ : réglages du son, panneau de la musique, historique (A-2). Boutons en ligne, repliables en un bouton unique (mini-menu) qui déplie la liste vers le haut, avec icône et libellé (A-3) ; replié ou non au choix de chacun, mémorisé par slug, et replié d'office sur petit écran (< 640 px) (A-4). Classes génériques `vtt-actions`, `vtt-action-btn` ; les blocs d'habillage des 8 `theme.css` sont renommés, même rendu (A-5).
- **Notifications** : placées par la plateforme au-dessus de la zone ; un volet ouvert reste devant elles (A-6).
- **Ancien combat** (Vikings, Tecumah) : hors périmètre (A-7), puis supprimé le 2026-11-09 (`spec_pnj.md` §5).
- **Panneau d'historique** : une `FloatingPanel` ancrée à droite, haute, déplaçable, réductible, mémorisée par slug, sans fond bloquant (B-1) ; joueurs et MJ (B-3) ; accès du menu MJ de Cyberpunk et de l'onglet Ressources de Dune retirés (B-5) ; pas de raccourci clavier en v1 (B-6).
- **Ordre** : zone d'actions (musique dedans), puis panneau d'historique, puis retrait des accès des slugs ; ensuite le lot 2 de l'audio (C-1).

Décidé ensuite (discussion du 2026-11-01, remplace B-2 et précise A-1 à A-4, B-3, B-4) :

- **Le panneau d'historique est une brique que le slug monte**, comme il compose son menu avec les éléments `HamburgerMenuItemXXX` : la plateforme fournit une liste d'historique commune, l'onglet `DiceHistoryPage` et le panneau, construits sur elle ; le slug choisit onglet, panneau, les deux ou rien. Pas de panneau monté d'office par la plateforme (code chargé pour rien, et la politique d'onglets et d'accès appartient au slug). **Aucun onglet n'est supprimé.**
- **Déclaration unique dans la config du slug** : le rendu d'un jet (`dice.renderHistoryEntry`, déjà présent) et `renderAllRollTypes` sont déclarés une fois dans `config.jsx` et lus par toutes les briques (onglet, panneau, notifications) **à la place** des props actuelles. Unification faite **dans ce chantier**, pour les 9 slugs (Noctis : changement mécanique seulement, il reste hors du reste). Là où ce que le slug passe aujourd'hui diffère de sa config (ex. Dune passe `<DuneHistoryEntry>`), le bon rendu est choisi une fois pour toutes.
- **Périmètre d'essai du panneau** : Dune et Cyberpunk, **côté MJ seulement** (intérêt : rester sur la fiche d'un joueur et voir les jets passés). Leurs anciens accès (menu MJ de Cyberpunk, onglet Ressources de Dune) sont retirés ; `HistoryPanel.jsx` est supprimé après vérification de tout ce qui en dépend.
- **Liste commune** : temps réel (comme l'ancien panneau), suppression et remise à zéro comme aujourd'hui. **Date hybride** : « à l'instant », « il y a 12 min », « il y a 3 h » le même jour, « hier 21:40 », puis « 12/10 21:40 » ; date complète en infobulle ; fonction pure testée.
- **Zone d'actions, montage sur le modèle des modales** (`ModalHostProvider` / `HostedModal`) : la plateforme pose la zone et son emplacement au niveau de celui des modales (dans `PlayerPage` / `GMPage`, autour de la page du slug) ; une brique de la plateforme, où qu'elle soit montée, y rend par portail un composant unique de la plateforme (ex. `<ZoneAction icon label active onSelect order>`). Un seul composant de bouton : la zone indique son mode par une classe et la CSS montre boutons ou liste ; ordre par `order` ; habillage par les slugs sur ce composant, comme pour les boutons actuels de la musique ; une brique démontée retire son bouton d'elle-même. La musique passe par le même mécanisme. Seules les briques de la plateforme l'utilisent en v1 (A-1).
- **Mini-menu** : l'affichage actuel (boutons) reste ; on peut le réduire en mini-menu **et revenir** aux boutons, au choix de chacun, mémorisé par slug ; réduit d'office sur petit écran (A-3, A-4).

À faire en phase 2 : comparer, slug par slug, ce qui est passé aux onglets et aux notifications avec la config ; relever tout ce qui dépend de `HistoryPanel` ; contrat de la zone et de `ZoneAction` ; volet attaché à une action (réglages du son) ; place des notifications au-dessus de la zone.

## 6. Spécification technique (phase 2, 2026-11-01)

### 6.1 Relevés

**Rendu d'un jet, slug par slug** (onglets, notifications, config) :

| Slug | `config.dice.renderHistoryEntry` | Onglets (fiche, MJ) | Notifications | Écart |
|---|---|---|---|---|
| Achtung | `<AchtungHistoryEntry roll>` | même composant | même composant, après `details: roll_result` | adaptation inutile : le composant lit `roll_result ?? details` et la notification reçoit déjà `roll_result` |
| Cyberpunk | `<DiceEntryHistory roll>` | la config | même composant | aucun |
| Delta Green | `<DiceEntryHistory roll>` | la config | la config | aucun |
| Dune | `<DuneHistoryEntry roll>` | même composant (écrit en ligne) | même composant | aucun |
| Fabula | `<FabulaHistoryEntry roll>` | la config | même composant | aucun |
| Tecumah | `<TecumahHistoryEntry entry>` | la config | même composant | aucun |
| Vikings | `<VikingsHistoryEntry entry>` | la config | même composant | aucun |
| Zone Blanche | `<ZoneBlancheHistoryEntry entry>` | même composant | même composant | aucun |
| Noctis | rendu écrit dans la config | la config, **sans** `renderAllRollTypes` | **aucun rendu** (générique) | voir Q-1 |

Les 8 slugs hors Noctis passent `renderAllRollTypes` partout. Achtung et Zone Blanche ont d'autres `renderHistoryEntry` dans des jeux de hooks secondaires (dommages, assistance) : seul `config.dice` compte ici. Aucun rendu à choisir : l'unification ne change l'affichage d'aucun des 8 slugs.

**Ce qui dépend de `HistoryPanel.jsx`** :

- code : `cyberpunk/gm/GMView.jsx` (import, état `historyPanelOpen`, entrée du menu « Historique des jets », composant) ; `dune/gm/tabs/TabResources.jsx` (import, état `historyOpen`, bouton « 📜 Historique des jets », composant, commentaire d'en-tête) ; `dune/Sheet.jsx` (import inutilisé) ;
- commentaires : `features/dice/tools/diceEngine.js` (l. 71), `features/dice/history/history.css` (bloc `vtt-history-entry`) ;
- docs : `spec_diceengine_v2.md` (périmètre, l. 484 et 491), `/new-slug` (checklist), `archi-multijdr.md` (schéma ancien), `src/client/CLAUDE.md` (contrat de `DiceHistoryPage`) ;
- `index.html` à la racine du dépôt cite un ancien `src/components/HistoryPanel.js` : fichier d'avant Vite, plus servi (le serveur sert `src/client/dist/index.html`), hors chantier.

Rien d'autre ne l'importe : la suppression est sans risque une fois ces points traités.

**Accès à la config du slug depuis la plateforme** : `app/hooks/useSlugConfig.js` charge `systems/<slug>/config.jsx` du slug de l'adresse (asynchrone : `null` au premier rendu). Les briques s'en servent ; elles n'affichent rien tant que la config n'est pas là.

**Montage** : `PlayerPage` et `GMPage` posent `ModalHostProvider` autour de la page du slug (chargée à la demande) et montent `AudioLayer` à l'intérieur : un fournisseur de zone posé au même niveau est vu par la page du slug et par la couche audio.

### 6.2 Zone d'actions (`features/table/ActionZone.jsx`)

- **`ActionZoneProvider`** : posé par `PlayerPage` / `GMPage` dans `ModalHostProvider`. Rend la zone (`div.vtt-actions`, en bas à droite, plan 100 comme aujourd'hui), avec deux emplacements : `vtt-actions-panels` (volets, au-dessus) et `vtt-actions-buttons` (actions). Partage par contexte les emplacements et le mode.
- **`ZoneAction`** : rendu par portail dans l'emplacement, comme `HostedModal`. Props : `id`, `icon`, `label`, `order` (fixé par la plateforme : réglages du son 10, panneau de la musique 20, historique 30), `active` (sa fenêtre ou son volet est ouvert), `highlighted` (quelque chose tourne, ex. musique en lecture), `badge` (compteur sur le bouton, ex. non lus du journal, ordre 50 ; `.vtt-action-badge`, ajouté par `spec_journal.md` §13), `onSelect`, et `children` = contenu du volet, affiché quand `active` (les actions à fenêtre n'en ont pas). Sans fournisseur : ne rend rien (la brique fonctionne sans bouton).
- **Icône surchargeable par le slug** (Q-3) : chaque action a une icône de base de la plateforme (au trait, comme celles de la musique) ; un slug peut la remplacer dans son `config.jsx` par `actionIcons: { history, sound, music }` (une clé par identifiant d'action, facultative). `ZoneAction` prend l'icône du slug (lue par `useSlugConfig`) si elle existe. Seul mécanisme, valable aussi pour les actions de la musique montées par la plateforme.
- **Un seul composant, deux rendus selon le mode** lu dans le contexte : boutons → `button.vtt-action-btn` (icône, libellé en infobulle) ; mini-menu → `button.vtt-menu-item` dans un `.vtt-menu` (icône et libellé) : la liste reprend l'habillage du menu de chaque slug, rien à habiller en plus.
- **Mini-menu réversible** : en mode boutons, un petit bouton « Replier » au bout de la rangée ; en mode mini-menu, un seul bouton (`vtt-action-btn vtt-actions-toggle`) ouvre la liste vers le haut, qui finit par « Afficher les boutons ». Choisir une action ferme la liste. Mode mémorisé par slug (`vtt:<slug>:actions`, `{ collapsed }`) ; mini-menu imposé sous 640 px (sans changer le choix enregistré). Zone vide (aucune action montée) : rien n'est affiché, pas même le bouton de bascule.
- **Notifications au-dessus de la zone** : la zone publie sa hauteur dans `--vtt-actions-offset` (sur `<html>`, mise à jour par `ResizeObserver`, 0 si vide) ; `ToastNotifications` place sa pile à `bottom: calc(var(--vtt-actions-offset, 0px) + 1rem)` au lieu de `bottom-16`. Un volet ouvert reste devant elles (A-6).
- **Habillage** : `vtt-actions`, `vtt-action-btn` (états `is-active`, `is-highlighted`), `vtt-actions-toggle`. Chaque bouton porte `data-action="<id>"` (ajout du 2026-11-11, `spec_initiative.md` §10) pour cibler une action précise, ex. le halo de l'initiative masquée. Les blocs « Musique : boutons flottants » des 8 `theme.css` sont renommés mécaniquement (`.vtt-audio-toggle` → `.vtt-action-btn` ; `.vtt-audio-widget.is-playing .vtt-audio-toggle:not(.vtt-audio-toggle-gm)` → `.vtt-action-btn.is-highlighted` ; `.vtt-audio-toggle-gm.is-active` → `.vtt-action-btn.is-active` ; `.vtt-audio-buttons` → `.vtt-actions-buttons`) : même rendu. Le placement hors couche du volet est repris pour `.vtt-actions-panels`.

### 6.3 Musique sur la zone

`AudioPlayerWidget` ne dessine plus ses boutons : il rend deux `ZoneAction` — « Réglages du son » (ordre 10, `highlighted` si une piste joue, volet = contenu actuel des réglages, ouverture mémorisée comme aujourd'hui dans `vtt:<slug>:audio`) et, pour le MJ, « Musique » (ordre 20, `active` si le panneau est ouvert). Comportement inchangé ; la logique d'`AudioLayer` ne bouge pas.

### 6.4 Historique des jets

- **Déclaration unique** (`config.jsx` du slug) : `dice.renderHistoryEntry` (existant) et `dice.renderAllRollTypes` (nouveau, `true` pour les 8 slugs, absent pour Noctis = `false`).
- **`features/dice/tools/rollDate.js`** : `formatRollDate(timestamp, now)` → « à l'instant », « il y a 12 min », « il y a 3 h » (même jour), « hier 21:40 », « 12/10 21:40 » ; `fullRollDate` pour l'infobulle. Test `tests/tools/rollDate.test.js`.
- **`features/dice/history/DiceHistoryList.jsx`** (nouveau) : le cœur actuel de `DiceHistoryPage` : chargement (200 jets), **temps réel** (`dice-roll`, repris de l'ancien panneau), barre (nombre, Actualiser, Tout effacer), cartes (nom, date hybride, suppression), rendu par la config (`useSlugConfig`) avec le rendu générique de repli. Prop : `sessionId`.
- **`DiceHistoryPage`** : la liste, centrée (`max-w-2xl`). **Contrat : `sessionId` seul** (`renderHistoryEntry` et `renderAllRollTypes` retirés, lus dans la config). Aucun onglet supprimé.
- **`features/dice/history/DiceHistoryPanel.jsx`** (nouveau, brique montée par le slug) : prop `sessionId` ; une `ZoneAction` « Historique des jets » (ordre 30, `active` si ouvert) et, ouvert, une `FloatingPanel` « Historique des jets » (`persistAs="history"`, collée au côté droit comme l'ancien panneau, presque toute la hauteur, ~360 px de large, `resizable`, `minimizable`) contenant la liste. Ouverture mémorisée par slug (`vtt:<slug>:history`, `{ open }`). À monter **à la racine** de la fiche ou de l'interface MJ, pas dans un onglet.
- **`ToastNotifications`** : `renderDiceToast` et `renderAllRollTypes` retirés, lus dans la config ; contrat : `sessionId` seul.
- **`HistoryPanel.jsx` supprimé.**

### 6.5 Slugs

- **Les 9** : retrait des props `renderHistoryEntry` / `renderAllRollTypes` / `renderDiceToast` aux 18 `DiceHistoryPage` et aux 17 `ToastNotifications` ; `dice.renderAllRollTypes: true` dans les 8 configs hors Noctis ; imports devenus inutiles retirés. Noctis : retrait des props seulement.
- **Cyberpunk MJ** (`gm/GMView.jsx`) : entrée de menu, état et ancien panneau retirés ; `<DiceHistoryPanel sessionId={activeSession?.id} />` à la racine.
- **Dune MJ** (`gm/GMView.jsx`) : `<DiceHistoryPanel>` à la racine ; `gm/tabs/TabResources.jsx` : bouton, état et ancien panneau retirés. `Sheet.jsx` : import inutilisé retiré.

### 6.6 Documentation

`src/client/CLAUDE.md` (contrats de `DiceHistoryPage`, `ToastNotifications`, zone d'actions), `/new-slug` (checklist : `dice.renderAllRollTypes`, `DiceHistoryPanel` au choix du slug, habillage `vtt-action-btn`), `spec_diceengine_v2.md` (« Jet libre », périmètre), `spec_browser_storage.md` (`vtt:<slug>:actions`, `vtt:<slug>:history`), `spec_audio.md` (boutons sur la zone), `spec_ui_panneaux.md` (usage historique).

### 6.7 Fichiers

Créés : `features/table/ActionZone.jsx`, `features/dice/history/DiceHistoryList.jsx`, `features/dice/history/DiceHistoryPanel.jsx`, `features/dice/tools/rollDate.js`, `tests/tools/rollDate.test.js`.
Modifiés : `app/pages/PlayerPage.jsx`, `app/pages/GMPage.jsx`, `features/audio/AudioPlayerWidget.jsx`, `features/dice/history/DiceHistoryPage.jsx`, `features/table/ToastNotifications.jsx`, `app/styles/index.css`, les 9 slugs (config, fiche, interface MJ), Dune `TabResources.jsx`, 8 `theme.css`, docs du §6.6.
Supprimé : `components/layout/HistoryPanel.jsx`.

### 6.8 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | Noctis : ses notifications n'ont aujourd'hui aucun rendu propre (rendu générique), alors que sa config en a un. Lues dans la config, elles prendraient ce rendu (comme son onglet) | Accepter : c'est la règle « historique et notification identiques », et c'est le seul changement visible pour Noctis | Oui |
| Q-2 | Ouverture du panneau d'historique mémorisée par slug (il se rouvre après un rechargement) ? | Oui, comme le panneau de la musique | Oui |
| Q-3 | Icône de l'action « Historique des jets » | Une icône au trait comme celles de la musique (parchemin ou dé), pas un émoji | Une icône de base, que les slugs doivent pouvoir surcharger. Proposé ensuite : surcharge par la config du slug, `actionIcons: { history, sound, music }` (une clé par action, icône de la plateforme à défaut), seul mécanisme valable aussi pour les actions de la musique montées par la plateforme ; la forme du bouton reste habillable en CSS |
| Q-4 | Position par défaut du panneau | En haut à droite, sous l'en-tête, 380 px de large, presque toute la hauteur ; puis déplacé et mémorisé | Le côté droit, comme l'ancien panneau : collé à droite, presque toute la hauteur, ~360 px ; déplaçable, redimensionnable, mémorisé |
| Q-5 | Suppression et remise à zéro de l'historique sont visibles aussi des joueurs (existant) | Inchangé dans ce chantier (hors périmètre), à noter au backlog si tu veux le restreindre | Oui, hors périmètre |
