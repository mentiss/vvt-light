# VTT Multi-JDR

Table virtuelle (virtual tabletop) pour jouer à plusieurs jeux de rôle entre amis, une quinzaine de joueurs au plus. Chaque jeu est un module autonome, appelé **slug**, avec sa base, ses routes et ses écrans. La plateforme fournit tout ce qui est commun (connexion, tables, dés, journal, PNJ, initiative, tableau partagé, musique…), chaque slug garde ses règles, son contenu et son habillage.

Ce README s'adresse aux développeurs. Il décrit l'état actuel du projet ; le détail vit dans la documentation (`documentations/README.md`), les `CLAUDE.md` et les grilles de règles `code-rules/`.

## Systèmes de jeu

| Slug | Jeu |
|---|---|
| `achtung` | Achtung! Cthulhu |
| `cyberpunk` | The Sprawl (PbtA) |
| `deltagreen` | Delta Green |
| `dune` | Dune: Adventures in the Imperium (2D20) |
| `fabula` | Fabula Ultima |
| `maledictum` | Imperium Maledictum (Warhammer 40 000) |
| `nimble` | Nimble 3.x |
| `noctis` | Noctis Solis (Vermine 2047), masqué de l'accueil, refonte en attente |
| `tecumah` | Tecumah Gulch (D6) |
| `vikings` | Pure Vikings |
| `vileborn` | Vileborn (kit d'initiation) |
| `woddavampire` | Vampire : l'Âge des Ténèbres (V20 Dark Ages) |
| `zoneblanche` | Zone Blanche (2D20) |

Les slugs n'en sont pas tous au même point : aucun ne sert de modèle. Ce qui est attendu d'un slug est décrit dans `documentations/process/guide_new_slug.md`.

## Ce que fait l'app

**Côté joueur**
- Accueil avec la liste des jeux et la reprise des connexions encore valides de l'appareil.
- Connexion par l'adresse et le code d'accès du personnage ; assistant de création propre à chaque jeu.
- Fiche du personnage, modifiable par son joueur, mise à jour en direct chez le MJ.
- Jets de dés animés en 3D (ou en 2D selon le jeu), configurables, avec historique et notifications partagés par la table ; jet libre.
- Journal (notes, messages et objets reçus du MJ), aide de jeu des règles.
- Choix de la table quand le personnage appartient à plusieurs tables actives.
- Thème jour / nuit.

**Côté MJ** (`/<slug>/gm`)
- Gestion des tables : création, composition, notes, activation ; plusieurs tables d'un même jeu peuvent tourner en même temps.
- Personnages de la table avec leur présence en ligne, fiches en direct, copie des accès à envoyer aux joueurs.
- Envoi de notes, messages et objets aux joueurs.
- PNJ : bibliothèque du MJ et PNJ posés à la table, avec leurs jets.
- Initiative : bande de tours et d'actions partagée avec les joueurs (ordre trié ou camps).
- Tableau partagé : diapositives, images, croquis, jetons, brouillard, grille.
- Musique de la table synchronisée chez tous les joueurs, scènes préréglées.
- Historique des jets de la table.

## Stack

| Couche | Technologie |
|---|---|
| Serveur | Node.js 24, Express |
| Base de données | SQLite via `better-sqlite3` |
| Temps réel | Socket.io |
| Client | React 19, Vite, React Router 7 |
| Styles | Tailwind CSS v4, un `theme.css` par slug |
| Éditeur de texte | TipTap v3 |
| Dés | `@3d-dice/dice-box-threejs` (animation), `@dice-roller/rpg-dice-roller` (résolution), moteur maison `diceEngine.js` |
| Authentification | JWT : jeton d'accès court, jeton de rafraîchissement en cookie httpOnly |
| Tests | Vitest (client et serveur) |

## Architecture

### Un slug = un module découvert seul

Il n'y a **aucun registre central**. Au démarrage, `src/server/systems/Loader.js` parcourt `src/server/systems/` : tout dossier qui contient un `config.js` valide devient un jeu actif. Ajouter un slug ne modifie aucun fichier en dehors de ses dossiers :

| Fichier | Rôle |
|---|---|
| `src/server/systems/<slug>/config.js` | Déclaration du slug (nom, base, schéma, options) |
| `src/server/systems/<slug>/CharacterController.js` | Chargement et sauvegarde d'une fiche complète |
| `src/server/systems/<slug>/routes/*.js`, `socket/*.js` | Routes et événements propres au slug (facultatifs) |
| `database-template/<slug>-schema.sql` | Schéma de la base du slug |
| `src/client/src/systems/<slug>/` | `config.jsx` (dés, PNJ, initiative…), `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`, `Brand.jsx`, `theme.css` |

Guide complet : `documentations/process/guide_new_slug.md` (commande `/new-slug` pour un agent Claude Code).

### Bases de données

- **Une base SQLite par slug** (`database/`, hors Git), créée depuis son schéma à la première ouverture. Connexion ouverte à la demande, fermée après 5 minutes d'inactivité (`src/server/db/index.js`).
- **`database-template/base.sql` est le socle** recopié dans chaque schéma de slug, jamais exécuté seul. Tables partagées : `characters`, `game_sessions` (les tables de jeu), `session_characters`, `dice_history`, `character_journal`, `refresh_tokens`, `npcs`, `session_npcs`.
- **Bases de module**, hors des bases de slug : `audio.db` (musique) et `board.db` (tableau partagé), déclarées dans `src/server/db/modules/`. Chaque ligne porte le slug et la table qu'elle concerne.
- **Migrations** : un changement de structure modifie le schéma (bases neuves) **et** ajoute `database-template/migrations/DDMMYYYY_description.sql` (bases existantes), avec l'en-tête `-- systems: <slug,…>` (ou `all`, ou le nom d'une base de module). La release joue les migrations pas encore en prod.

### Routes HTTP

Toutes les routes de jeu sont préfixées par le slug : `/api/<slug>/…`. Les routes partagées sont montées pour chaque slug ; tout fichier de `systems/<slug>/routes/` (sauf `characters.js`) est monté en plus sur `/api/<slug>/<fichier>`.

| Préfixe | Contenu | Droits |
|---|---|---|
| `/auth` | `login`, `refresh`, `logout`, `me` | connexion publique |
| `/characters` | liste, `by-url/:url`, `by-code/:code`, `/:id`, `/:id/sessions`, création, `PUT`, `PATCH`, suppression | création, liste et chargement par code ou adresse publics ; fiche : son joueur ou le MJ ; suppression : MJ |
| `/sessions` | tables de jeu, `GET /active` (tables actives), composition (ajout et retrait de personnages) | une table et les tables actives : connecté ; liste et gestion : MJ |
| `/journal` | entrées d'un personnage, non lus, `gm-send`, `gm-send-item` | son joueur ou le MJ ; envois : MJ |
| `/dice` | enregistrement d'un jet, historique, effacement | historique en lecture publique ; jet et effacement : connecté |
| `/npcs` | bibliothèque du MJ, PNJ d'une table | MJ |
| `/initiative` | état de l'initiative d'une table (en mémoire, sans base) | lecture : la table ; écriture : MJ |
| `/board` | tableau partagé : diapositives, éléments, images, brouillard | lecture : la table ; écriture : MJ |
| `/audio` | musique : bibliothèque, listes, pistes, scènes préréglées, commandes de lecture | état de lecture : la table ; bibliothèque et commandes : MJ |

Routes globales : `GET /api/systems` (jeux disponibles), `GET /api/resume` (connexions à reprendre sur cet appareil), `GET /api/online-characters`, `GET /api/health`.

Contrats détaillés : `documentations/plateforme/` (une spec par brique) et `src/server/CLAUDE.md`.

### Temps réel

- **Room d'une table** : `${slug}_session_${sessionId}`, partagée par le MJ et les joueurs (pas de room réservée au MJ). On y entre par `join-session` / `leave-session`.
- **Room d'un slug** : `${slug}_all`, rejointe à la connexion d'après le slug donné dans la poignée de main ; elle porte l'état des tables actives.
- **Les écritures passent par HTTP** ; le serveur diffuse ensuite le résultat dans les rooms concernées.

| Domaine | Client → serveur | Serveur → client |
|---|---|---|
| Présence | `character-loaded`, `character-left` | `online-characters-update` |
| Tables | `join-session`, `leave-session`, `gm-set-active-session`, `gm-clear-session` | `active-tables`, `session-characters-update`, `character-sessions-changed` |
| Fiches et journal | (HTTP) | `character-full-update`, `gm-item-received` |
| Dés | (HTTP) | `dice-roll` |
| Initiative | (HTTP) | `initiative-state`, `initiative-avatars` |
| Tableau | `board-ping`, `board-drag` (relais éphémères) | `board-ping`, `board-drag` |
| Musique | `audio-ping` | `audio-state`, `audio-enabled`, `audio-buttons-changed` |

Un événement écouté par un slug est préfixé par son nom (`dune:update-session-resources`) ; les slugs diffusent aussi leurs propres événements dans la room de la table (ressources de session 2D20, coterie de Vampire, fiche de groupe de Fabula…).

### Client

`src/client/src/` est rangé par rôle (`documentations/process/spec_arborescence_client.md`) :

```
app/        pages, contexte, hooks et outils de l'application, styles communs
ui/         primitives sans connaissance du jeu : modale, fenêtre flottante, catalogue, menu, texte, image
features/   une brique par domaine : audio, board, dice, initiative, journal, npc, reference, table
systems/    un dossier par slug
```

Les imports entre briques passent par l'alias `@/` (= `src/`). Un slug adopte une brique par son `config.jsx` ou en posant ses composants ; il habille les classes `vtt-*` de la plateforme dans son `theme.css`, en jour et en nuit.

### Sécurité, à la mesure du projet

C'est une app pour jouer entre amis, pas un produit grand public :
- les actions réservées au MJ sont protégées côté serveur (`requireGM`), un joueur n'écrit que sa fiche (`requireOwnerOrGM`), toute écriture exige une connexion ;
- la visibilité des informations MJ est filtrée côté client : c'est un choix assumé ;
- connexion par personnage et code d'accès (le MJ est le personnage `id = -1`), jetons par slug et par rôle ; 5 échecs en 15 minutes bloquent le personnage.

Détail : `code-rules/back.md`.

## Arborescence du dépôt

```
src/server/           serveur Express : server.js, db/, middlewares/, routes/ (partagées), socket/, systems/<slug>/, utils/
src/client/           client React (Vite) : src/, tests/ (Vitest, miroir de src/), scripts/
database-template/    base.sql, <slug>-schema.sql, <module>-schema.sql, migrations/
database/             bases SQLite (hors Git)
documentations/       specs et backlog : index dans documentations/README.md
code-rules/           grilles de règles du code (common, front, back)
scripts/              migrate.js, release.js, install.sh, scripts de génération
tests/server/         tests Vitest des routes (contrats, droits, schémas)
CLAUDE.md, AGENTS.md  consignes pour les agents (Claude Code, Codex)
```

## Démarrer en développement

**Prérequis** : Node.js 24 (version de la prod) et npm.

Créer un fichier `.env` à la racine (jamais commité) :

```dotenv
PORT=3001
NODE_ENV=development          # "production" en prod
JWT_SECRET=une_longue_chaine_aleatoire
JWT_ACCESS_EXPIRATION=15m     # durée du jeton d'accès
JWT_REFRESH_EXPIRATION=30     # durée du jeton de rafraîchissement, en jours
# Production seulement (HTTPS) :
# SSL_KEY_PATH=/etc/letsencrypt/live/<domaine>/privkey.pem
# SSL_CERT_PATH=/etc/letsencrypt/live/<domaine>/fullchain.pem
```

Générer un secret : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

Installer et lancer :

```bash
npm install                                  # dépendances du serveur (racine)
cd src/client && npm install                 # dépendances du client
node scripts/copy-dice-assets.js             # obligatoire après chaque npm install du client
cd ../..
npm run dev                                  # serveur (nodemon, :3001) + client (Vite, :5173)
```

`copy-dice-assets.js` copie les fichiers statiques des dés 3D dans `src/client/public/dice-assets/` : sans lui, les dés ne s'animent pas. Les bases se créent seules à la première ouverture. L'interface se trouve sur http://localhost:5173 (Vite renvoie `/api` et les sockets vers le serveur).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur et client en développement |
| `npm test` | Tests serveur : contrats des routes, droits, schémas |
| `cd src/client && npm run lint` | Lint du client (règles `vtt/…` de la grille front) |
| `cd src/client && npm test` | Tests du client (fonctions pures) |
| `npm run build` | Build du client dans `src/client/dist/` |
| `npm start` | Serveur de production (sert aussi le client buildé) |
| `npm run migrate -- <fichier.sql> [--system=<slug>]` | Joue une migration (le `--` est obligatoire) |
| `npm run release` | Mise en production |

Avant de livrer : lint, tests et build du client verts, et `npm test` à la racine si le serveur est touché.

## Mise en production

`npm run release` part du poste de dev : vérifications, version, build, archive, envoi par SSH, migrations, redémarrage sous pm2 sur le serveur (HTTPS via `https.createServer()`). Configuration dans `deploy.config.json` (modèle : `deploy.config.example.json`). Installation initiale du serveur, retour arrière et certificats : `documentations/process/spec_release.md`.

## Pour aller plus loin

- `documentations/README.md` : index des specs (slugs, briques, process) et backlog.
- `documentations/process/guide_new_slug.md` : créer un jeu.
- `code-rules/` : règles du code, partagées par l'auteur du code et le relecteur.
- `CLAUDE.md`, `src/client/CLAUDE.md`, `src/server/CLAUDE.md` : fonctionnement détaillé du client et du serveur.

## Crédits

- **Icônes du tableau partagé** (`src/client/public/board/icons/`) : [game-icons.net](https://game-icons.net), par Lorc, Delapouite et les autres contributeurs cités dans leur [dépôt](https://github.com/game-icons/icons), sous licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Tracés passés en `currentColor`, fond retiré ; index et catégories relevés une fois par `scripts/board-icons.js`, puis retouchables à la main.
