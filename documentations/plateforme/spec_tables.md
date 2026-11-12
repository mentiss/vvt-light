# Tables actives

Brique de plateforme, tous les slugs : quelle table est active, pour qui, et comment le MJ et les joueurs le savent. Reprend une fonctionnalité qui n'a presque pas bougé depuis sa création (extraite de l'ancien Vikings), sans changer le modèle de données (`game_sessions`, `session_characters`) ni les fonctions de fond (créer, modifier, supprimer une table, composer ses personnages).

Statut : validée le 2026-11-12. Lot 1 (mécanique) et lot 2 (graphique, planche validée) implémentés le 2026-11-12. Direction et recommandations validées par le MJ le 2026-11-12 (discussion du bug Fabula).

Complète `spec_composition_table.md` (composition en temps réel), dont la limite « plusieurs tables actives sur un même slug » est levée ici.

---

## 1. Constat

Déclencheur : le 2026-11-11 en prod, la fiche d'un personnage de la table Fabula 3 n'affichait ni barre de session ni table active, alors que la table 4 (une table de test) était active en même temps sur un autre poste MJ. Les logs montrent le personnage rejoindre la room de la table 3 puis la quitter dans la même seconde.

| # | Défaut | Cause |
|---|---|---|
| D-1 | Un joueur prend la première table active du slug, pas la sienne | `SessionContext` retient `ids[0]` de `gm-sessions-active` puis vérifie l'appartenance |
| D-2 | Un joueur quitte sa table quand une autre table du slug est activée | `gm-session-active` diffusé à tous ; « pas membre » fait quitter la table courante |
| D-3 | Un joueur ne quitte pas sa table quand le MJ la désactive | la désactivation diffuse `sessionId: null`, sans dire quelle table, et le client l'ignore |
| D-4 | Recharger la page MJ fait sortir puis rentrer tous les joueurs | le démontage émet `gm-clear-session` (diffusion immédiate), puis la page réactive |
| D-5 | Deux onglets MJ sur la même table : fermer l'un coupe la table pour tous | `gm-clear-session` diffuse « plus de table » sans regarder les autres postes |
| D-6 | Le MJ ne voit pas les tables actives sur un autre poste | l'état serveur (par socket) n'est donné qu'au joueur qui arrive, jamais au MJ |
| D-7 | Pas de moyen de désactiver une table | on en sort en activant une autre table, en la supprimant ou en fermant l'onglet |
| D-8 | Restes de l'origine Vikings | défaut `system = 'vikings'` dans les handlers, test `id === -1` mort dans `SessionContext`, commentaires « extrait de App.jsx Vikings » |

---

## 2. Principes

1. **Une table est l'unité de jeu.** Plusieurs tables d'un même slug peuvent être actives en même temps (deux campagnes, une table de test) ; elles ne se gênent pas.
2. **Le serveur fait foi** sur les tables actives. Il ne garde rien en base : l'état vit en mémoire, comme aujourd'hui, et se reconstruit quand les postes MJ se reconnectent.
3. **Un poste MJ** = un onglet de l'interface MJ. Le compte MJ est commun : on ne cherche pas à savoir si deux postes sont la même personne. Chaque poste choisit librement sa table.
4. **Une table est active tant qu'au moins un poste MJ l'a ouverte.** Elle s'arrête quand le dernier poste en sort volontairement, ou 5 minutes après la déconnexion du dernier poste (délai de grâce actuel, conservé).
5. **L'activation reste implicite** : ouvrir une table sur un poste l'active. Recharger la page ou ouvrir un poste de plus ne change rien pour les joueurs (pas de clignotement).
6. **Un joueur rejoint la table active dont son personnage est membre**, et seulement celle-là. S'il y en a plusieurs, il choisit.

---

## 3. Comportement attendu

### 3.1 Côté MJ

| Action | Effet |
|---|---|
| Activer une table sur un poste | Le poste quitte sa table précédente (sortie volontaire) et ouvre la nouvelle. Si la nouvelle n'était active nulle part, elle devient active. |
| Désactiver (nouveau bouton) | Le poste quitte sa table. Si c'était le dernier poste, la table s'arrête **tout de suite**. |
| Supprimer la table active | Comme Désactiver, puis suppression (comportement actuel conservé). |
| Recharger la page, fermer l'onglet, perdre le réseau | Pas une sortie volontaire : si c'était le dernier poste, la table reste active pendant le délai de grâce ; le poste qui revient la reprend sans que les joueurs ne voient rien. |
| Deux postes sur la même table | Fermer ou changer l'un ne touche pas l'autre ; la table reste active. |

La gestion des tables affiche pour chaque table, en direct : **Active ici**, **Active sur un autre poste** (avec le nombre de postes s'il y en a plusieurs), ou rien. Une table active ailleurs peut être activée ici aussi (elle est alors ouverte sur deux postes).

### 3.2 Côté joueur

À l'ouverture de la fiche, puis à chaque changement de la liste des tables actives ou des tables du personnage :

| Tables actives dont le personnage est membre | Effet |
|---|---|
| Aucune | Pas de table : la fiche le montre comme aujourd'hui. S'il était à une table, il la quitte. |
| Une | Il la rejoint (ou y reste). |
| Plusieurs | Il reste à sa table si elle en fait partie ; sinon il reprend le choix mémorisé pour ce personnage s'il en fait partie ; sinon une fenêtre lui demande à quelle table se connecter. |

- Le choix est mémorisé dans le navigateur, par personnage.
- **Changer de table** : élément de menu `HamburgerMenuItemChangeTable`, qui rouvre la même fenêtre et n'apparaît que si le personnage est membre de plusieurs tables actives. Disponible, mais posé dans aucun slug pour l'instant (Q6).
- Une table qui s'arrête fait quitter ses joueurs (corrige D-3).
- L'activation d'une table dont le personnage n'est pas membre est sans effet pour lui (corrige D-1, D-2).

---

## 4. Données et événements

**Aucun changement de base de données.** Aucune migration.

### 4.1 État serveur (mémoire)

Remplace `activeSessions` (par socket) et `sessionTimers` dans `sharedState` (`src/server/socket/index.js`) :

```
activeTables : Map<slug, Map<sessionId, { posts: Set<socketId>, timer: Timeout|null }>>
```

- Une entrée existe tant que la table est active (au moins un poste, ou délai de grâce en cours).
- Fonctions de lecture exportées (remplacent `getActiveSessionsForSlug`) : `listActiveTables(slug)` → `[{ id, posts }]` (nombre de postes).

### 4.2 Événements

| Événement | Sens | Charge | Effet |
|---|---|---|---|
| `gm-set-active-session` | MJ → serveur | `{ sessionId, system }` | Ajoute le poste à la table (annule son délai de grâce éventuel). Diffuse `active-tables` si la liste change. **Nom conservé.** |
| `gm-clear-session` | MJ → serveur | `{ sessionId, system }` | Sortie volontaire : retire le poste ; si c'était le dernier, la table s'arrête tout de suite. Diffuse `active-tables` si la liste change. Émis **seulement** sur un changement ou une désactivation voulus, plus au démontage de la page (D-4). **Nom conservé.** |
| déconnexion d'un socket | — | — | Retire le poste de ses tables ; une table sans poste garde son entrée et lance le délai de grâce ; à son terme, si aucun poste n'est revenu, elle s'arrête et `active-tables` est diffusé. |
| `active-tables` (**nouveau**) | serveur → room du slug | `{ system, tables: [{ id, posts }] }` | Liste complète des tables actives du slug, envoyée à chaque changement. Remplace `gm-session-active` et `gm-sessions-active` (supprimés). |

`join-session` / `leave-session` (rooms) sont inchangés.

**Room du slug** `${slug}_all` (nouvelle) : tous les sockets ouverts sur une page de ce slug, MJ comme joueurs. Le client donne son slug dans la poignée de main de la connexion (`io(url, { query: { system } })`, lu par `getSystemFromPath()`) ; le serveur l'y place à la connexion, après avoir vérifié que le slug existe (slugs chargés par le Loader). Pas de nouvelle émission : la poignée de main est refaite à chaque reconnexion, la room est donc retrouvée seule. Une page = un slug (F-SLUG-LINK) : le slug ne change pas pendant la vie du socket. Accueil ou slug inconnu : aucune room.

### 4.3 Lecture initiale

`GET /api/:slug/sessions/active` (authentifié, MJ et joueurs) → `[{ id, posts }]`. Lu par le MJ et le joueur à l'ouverture de leur page, avant le premier `active-tables`. Remplace la réponse `gm-sessions-active` à `character-loaded` (la présence ne s'occupe plus des tables). Test de contrat dans `tests/server/`.

---

## 5. Impact

### Serveur

| Fichier | Changement |
|---|---|
| `src/server/socket/platform/sessions.js` | Réécrit autour de `activeTables` : postes, délai de grâce, diffusion `active-tables` ; plus de défaut `'vikings'` |
| `src/server/socket/platform/presence.js` | Ne répond plus `gm-sessions-active` |
| `src/server/socket/index.js` | `sharedState` : `activeTables` à la place de `activeSessions` / `sessionTimers` ; à la connexion, entrée dans la room du slug (`handshake.query.system`, slug vérifié) |
| `src/server/routes/sessions.js` | `GET /active` (avant `GET /:id`) |
| `tests/server/` | Contrat de `GET /sessions/active` |

### Client

| Fichier | Changement |
|---|---|
| `app/context/SocketContext.jsx` | Slug de la page dans la poignée de main (`query: { system }`, premier segment de l'adresse ; aucun sur l'accueil) |
| `app/hooks/useActiveTables.js` (nouveau) | Tables actives du slug : lecture initiale, `active-tables`, relecture après reconnexion. Utilisé par `SessionContext` et la gestion des tables |
| `app/hooks/useGMSession.js` | `gm-clear-session` seulement dans `setActiveSession` (changement ou `null` = Désactiver) ; le démontage ne quitte que la room |
| `app/context/SessionContext.jsx` | Réécrit : table du joueur (§3.2), choix mémorisé, fenêtre de choix. **Contrat `useSession()` conservé** (`activeGMSession`, `activeSessionName`, `updateCharacterSessions`) ; ajouts : `tableChoice`, `canChangeTable`, `openTableChoice` |
| `app/hooks/usePlayerSession.js` | `updateCharacterSessions(sessions, character.id)` |
| `app/tools/playerTable.js` (nouveau) | `pickPlayerTable` : choix de la table du joueur, testé (`tests/app/tools/playerTable.test.js`) |
| `features/table/modals/TableManagementModal.jsx` | Lit elle-même les tables actives (`useActiveTables`) : « Active ici », « Active sur un autre poste », « Active, poste MJ déconnecté » ; bouton **Désactiver** (`onSelectTable(null)`, déjà relié à `setActiveSession` par `GMPage`). Aucun slug ni `GMPage` à modifier |
| `features/table/modals/TableChoiceModal.jsx` (nouveau) | Fenêtre de choix de table du joueur, montée par `PlayerPage` |

### Doc et règles

`src/client/CLAUDE.md`, `src/server/CLAUDE.md`, `spec_composition_table.md` (limite levée), `spec_ui_menu.md` (élément Changer de table), `spec_browser_storage.md` (clé du choix de table), grille front F-SOCK-INFRA (noms d'émission inchangés, aucune émission ajoutée).

Hors périmètre, noté pour plus tard : la présence en ligne (`online-characters-update`, diffusée à tous et filtrée par slug côté client) pourra passer par la room du slug.

---

## 6. Lots

1. **Lot 1, mécanique** (cette spec) : serveur, hooks, choix du joueur, état et Désactiver dans la modale avec l'habillage actuel. Corrige D-1 à D-8.
2. **Lot 2, graphique** : refonte visuelle de la gestion des tables (liste, création, personnages, notes, état des tables) et de la fenêtre de choix du joueur. **Planche HTML validée avant le code** (`documentations/tables/planche_tables.html`, hors Git), enchaînée après le lot 1.

### 6.1 Lot 2 : retours du MJ sur la planche (2026-11-12)

- Fenêtre `Modal` de la plateforme, **agrandissable** (`expandable`).
- **Taille fixée par la place disponible, pas par le contenu** : la fenêtre ne grandit pas avec le nombre de personnages ; la liste des tables et le détail défilent chacun dans leur colonne.
- Maître-détail : liste des tables à gauche (recherche, création sur place, état, portraits), table choisie à droite (nom modifiable sur place, Activer / Désactiver, personnages, ajout par recherche, notes).
- Bouton **« Activer »** (pas « Activer ici »), qui ferme la fenêtre ; **« Désactiver » la laisse ouverte** (retour du MJ après essai).
- Pas de mise à jour en direct de la liste des personnages quand un joueur en crée un : la fenêtre la relit à chaque ouverture, ça suffit (décision du MJ).
- **Suppression depuis la carte de la liste** (icône sur la carte, fenêtre de confirmation), plus de zone « Supprimer » en bas du détail.
- **Nom affiché d'un personnage : prénom et nom.** L'ancienne fenêtre d'ajout affichait `nom || name || playerName` : pour Vikings, `nom` est le nom du père, d'où un seul mot sans le prénom. La liste `/characters` renvoie `prenom` et `nom` ; la composition d'une table renvoie `name`, déjà « prénom nom » (`getCharNameExpr`). Même règle que l'écran de connexion et `CopyAccessButton`.
- **Ascenseurs habillables** : les colonnes qui défilent portent `vtt-scroll` (classe de la plateforme, déjà habillée par les slugs).

### 6.2 Lot 2 : implémentation (2026-11-12)

| Fichier | Changement |
|---|---|
| `features/table/modals/TableManagementModal.jsx` | Réécrite en maître-détail (contrat de props inchangé : `isOpen`, `onClose`, `onSelectTable`, `activeSessionId`) ; `Modal` agrandissable, classe `vtt-tables-modal` |
| `features/table/modals/TableCharactersModal.jsx` | **Supprimée** : personnages et ajout fondus dans le détail |
| `features/table/modals/TableChoiceModal.jsx` | Cartes avec les compagnons de chaque table (`GET /sessions/:id`) |
| `features/table/tables.css` (nouveau) | Style par défaut `vtt-tables-*`, `vtt-table-choice-*`, importé par `app/styles/index.css` après `actions.css` |
| `app/hooks/useOnlineCharacters.js` (nouveau) | Présence en ligne du slug ; utilisé par la gestion des tables et par `useGMSession` (logique déplacée, pas recopiée) |
| `src/server/routes/sessions.js` | `GET /` : chaque table porte `characters: [{ id, name, playerName, avatar }]` (portraits de la liste) ; test dans `tests/server/routes/sessions.test.js` |

---

## 7. Questions

| # | Question | Recommandation | Réponse             |
|---|---|---|---------------------|
| Q1 | `active-tables` à tous les sockets (filtré par `system` côté client, comme aujourd'hui) ou seulement aux clients du slug (room par slug, nouvelle émission d'infrastructure à la connexion) ? | À tous : une quinzaine de joueurs, une charge minuscule ; une room par slug ajoute une émission d'infrastructure et un cas de reconnexion de plus pour un gain nul à cette échelle. Je reviens sur ce que j'avais annoncé en discussion, faute de gain réel. | Room par slug : viser le plus propre, pas le plus court. Sans émission ajoutée : slug donné dans la poignée de main de la connexion (§4.2). |
| Q2 | Le choix de table du joueur, mémorisé par personnage dans le navigateur : oubli quand ? | Jamais explicitement : il ne sert que s'il fait partie des tables actives, sinon il est ignoré (et remplacé au prochain choix). | reco. Précisé le 2026-11-12 : recharger la page ramène à la table mémorisée ; le choix ne se représente que si cette table s'arrête et qu'il reste plusieurs tables possibles. Cas marginal, rien de plus pour l'instant (l'élément de menu reste disponible, Q6). |
| Q3 | Fenêtre de choix : peut-on la fermer sans choisir (rester sans table) ? | Oui : la fiche reste utilisable sans table, et **Changer de table** dans le menu permet d'y revenir. | reco                |
| Q4 | Le délai de grâce de 5 minutes (dernier poste MJ déconnecté) | Conservé tel quel. | Validé (discussion) |
| Q5 | Côté MJ, une table active sur un autre poste : l'activer ici sans avertissement ? | Sans avertissement : l'état « Active sur un autre poste » est déjà affiché sur la ligne, et l'ouvrir ici ne coupe rien. | reco                |
| Q6 | (constaté à l'implémentation) « Changer de table » : les menus joueur sont composés **par chaque slug** (éléments posés un à un dans chaque `Sheet.jsx`, avec ses icônes) ; un élément de menu obligerait à modifier les 12 slugs. Où le placer ? | Dans la **zone d'actions** (bas à droite, posée par la page, réservée aux briques de la plateforme) : un bouton « Table » qui n'apparaît que si le personnage est membre de plusieurs tables actives, icône remplaçable par `actionIcons.table`. Aucun slug à modifier. Variante : élément `HamburgerMenuItemChangeTable` exporté, posé par les slugs plus tard, au fil de leurs refontes. | Menu hamburger, pas la zone d'actions (déjà chargée, réservée à ce qui sert pendant la partie). L'élément `HamburgerMenuItemChangeTable` existe (masqué si le personnage n'est pas membre de plusieurs tables actives) mais **n'est posé dans aucun slug pour l'instant**. |
