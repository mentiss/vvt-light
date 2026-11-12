# 🎲 VTT Multi-JDR

> Virtual Tabletop léger et modulaire. Conçu pour accueillir plusieurs systèmes de jeu de rôle (JDR) sans réécrire la base existante.

---

## ✨ Philosophie

- **Pas de bibliothèques superflues** — chaque dépendance doit se justifier.
- **Clarté avant tout** — hooks personnalisés côté React, contrôleurs clairs côté Express.
- **Multi-système par isolation** — une base de données SQLite par système, des routes montées dynamiquement.
- **Briques génériques** — la plateforme fournit la mécanique (menus, modales, historique des dés, tableau partagé, audio…), chaque système garde son contenu et sa disposition.
- **Temps réel robuste** — rooms Socket.io isolées par système et par session.

Les règles du code (grilles avec identifiants) sont dans `code-rules/`, le contexte pour les agents dans `CLAUDE.md` et `AGENTS.md`, les specs validées dans `documentations/`.

---

## 🧱 Stack Technique

| Couche       | Technologie                                      |
|--------------|--------------------------------------------------|
| Backend      | Node.js + Express                                |
| Base données | SQLite via `better-sqlite3` (connexions lazy, TTL 5 min) |
| Temps réel   | Socket.io (rooms préfixées par système)          |
| Frontend     | React 19 + Vite                                  |
| Routing      | React Router v7                                   |
| Auth         | JWT + cookie httpOnly (refresh token)            |
| Éditeur      | TipTap v3 (rich text, menus flottants, images)   |
| Dés 3D       | `@3d-dice/dice-box-threejs`                       |
| Dés logique  | `@dice-roller/rpg-dice-roller`                    |
| Styles       | Tailwind CSS v4                                  |

---

## 📁 Structure du Projet

```
/
├── src/
│   ├── server/                        # Backend Express
│   │   ├── server.js                  # Point d'entrée, montage dynamique des routes
│   │   ├── db/                        # Pool lazy de connexions SQLite (TTL 5 min), bases de module
│   │   ├── middlewares/               # systemResolver (req.system, req.db), auth, rateLimits
│   │   ├── routes/                    # Routes partagées : auth, characters (commune), sessions,
│   │   │                              #   journal, dice, audio, board
│   │   ├── socket/                    # Socket.io : index.js + platform/ (présence, sessions, audio, board)
│   │   ├── systems/
│   │   │   ├── Loader.js              # Découverte des systèmes (zéro registre central)
│   │   │   └── <slug>/                # config.js, CharacterController.js, routes/, socket/
│   │   └── utils/                     # characters (helpers de sauvegarde et de diffusion), jwt…
│   │
│   └── client/                        # Frontend React (Vite)
│       ├── src/
│       │   ├── AppRouter.jsx
│       │   ├── components/            # Briques de la plateforme (ui, layout, board, audio, gm…)
│       │   ├── hooks/                 # useFetch, useGMSession, usePersistedState…
│       │   ├── tools/                 # diceEngine, browserStorage…
│       │   └── systems/<slug>/        # config.jsx, Sheet.jsx, GMApp.jsx, Creation.jsx
│       └── tests/                     # Tests Vitest des fonctions pures (miroir de src/)
│
├── code-rules/                        # Grilles de règles du code (common, front, back)
├── database/                          # Bases SQLite (gitignored)
├── database-template/
│   ├── base.sql                       # Tables partagées
│   ├── <slug>-schema.sql              # Schéma de chaque système
│   └── migrations/                    # DDMMYYYY_description.sql (en-tête -- systems:)
├── documentations/                    # Specs validées : index dans documentations/README.md
├── scripts/                           # migrate.js, release.js, install.sh…
├── tests/server/                      # Tests Vitest des routes (contrats, droits, schémas)
├── CLAUDE.md, AGENTS.md               # Consignes pour les agents (Claude Code, Codex)
└── package.json
```

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** v20+
- **npm**

### Variables d'environnement

Créer un fichier **`.env`** à la racine du projet (jamais commité) :

```dotenv
# Serveur
PORT=3001
NODE_ENV=development        # ou "production"

# JWT — changer les secrets avant tout déploiement
JWT_SECRET=change_me_with_a_long_random_string
JWT_ACCESS_EXPIRATION=15m   # durée du token d'accès (ex: 15m, 1h)
JWT_REFRESH_EXPIRATION=30   # durée du refresh token en jours

# SSL — requis uniquement en production (NODE_ENV=production)
# En dev, le serveur tourne en HTTP simple, ces variables sont ignorées
SSL_KEY_PATH=/etc/ssl/private/your-domain.key
SSL_CERT_PATH=/etc/ssl/certs/your-domain.crt
```

> En production, le serveur bascule automatiquement sur HTTPS via `https.createServer()`. Les chemins SSL doivent pointer vers des fichiers lisibles par le process Node.js.  
> Avec Let's Encrypt (Certbot), les chemins sont typiquement :
> ```
> SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
> SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
> ```

> ⚠️ `JWT_SECRET` doit être une chaîne longue et aléatoire en production.  
> Générer avec : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Setup

```bash
# 1. Dépendances backend (racine)
npm install

# 2. Dépendances frontend + assets dés 3D
cd src/client
npm install
node scripts/copy-dice-assets.js   # copie les assets de dice-box-threejs dans public/dice-assets/
cd ../..

# 3. Lancer en développement (les bases SQLite se créent à la première ouverture)
npm run dev
```

> L'étape `copy-dice-assets.js` est **obligatoire** après chaque `npm install` côté client.  
> Elle copie les fichiers statiques (workers, textures, modèles 3D) de `@3d-dice/dice-box-threejs` vers `src/client/public/dice-assets/`. Sans ça, les animations de dés ne se chargent pas.

Le backend démarre sur **http://localhost:3001**.  
Le frontend Vite démarre sur **http://localhost:5173** (proxy vers le backend).

### Build & déploiement production

**Mise en production courante** : `npm run release` depuis le poste de dev (vérifications, version, build, archive, envoi par SSH, migrations, redémarrage pm2). Configuration dans `deploy.config.json` (modèle : `deploy.config.example.json`). Détails, rollback et renouvellement des certificats : `documentations/process/spec_release.md`.

Installation initiale du serveur :

```bash
# 1. Build du frontend (depuis la racine)
npm run build

# 2. Lancer avec pm2 (recommandé)
npm install -g pm2

pm2 start src/server/server.js --name "vtt-jdr" --env production

# Démarrage automatique au reboot
pm2 save
pm2 startup
```

Quelques commandes pm2 utiles :

```bash
pm2 status              # état du process
pm2 logs vtt-jdr        # logs en temps réel
pm2 restart vtt-jdr     # redémarrer après un déploiement
pm2 stop vtt-jdr        # arrêter
```

En production, Express sert le build statique Vite depuis `src/client/dist/`.

---

## 🗄️ Base de Données & Migrations

Chaque système de jeu possède sa propre base SQLite. La connexion est ouverte à la première requête et fermée automatiquement après **5 minutes d'inactivité**.

### Ajouter une migration

Toute modification de structure touche le schéma (pour les bases neuves) **et** une migration (pour les bases existantes).

```bash
# Créer le fichier dans database-template/migrations/
# Format : DDMMYYYY_add_quoi.sql, avec l'en-tête « -- systems: <slug,...|all> »

# Jouer la migration sur un seul système (le -- est obligatoire)
npm run migrate -- 27022025_add_quoi.sql --system=vikings
```

### Tables partagées (présentes dans toutes les BDD, `base.sql`)

`characters`, `game_sessions`, `session_characters`, `dice_history`, `character_journal`, `refresh_tokens`

Les tables propres à un système sont dans son `database-template/<slug>-schema.sql`.

---

## 🌐 API Routes

Toutes les routes sont préfixées par le slug du système : `/api/:system/…`

| Méthode | Route                                    | Description                        |
|---------|------------------------------------------|------------------------------------|
| GET     | `/api/systems`                           | Liste des systèmes disponibles     |
| GET     | `/api/health`                            | Health check                       |
| POST    | `/api/:system/auth/login`                | Connexion (joueur ou MJ, adresse + code) |
| GET     | `/api/:system/characters`                | Liste des personnages              |
| GET     | `/api/:system/characters/:id`            | Fiche complète                     |
| POST    | `/api/:system/characters`                | Créer un personnage                |
| PUT     | `/api/:system/characters/:id`            | Mettre à jour                      |
| DELETE  | `/api/:system/characters/:id`            | Supprimer                          |
| GET     | `/api/:system/sessions`                  | Liste des sessions                 |
| POST    | `/api/:system/sessions`                  | Créer une session                  |
| GET     | `/api/:system/journal/:characterId`      | Entrées journal                    |
| POST    | `/api/:system/journal/:characterId`      | Nouvelle entrée                    |
| PUT     | `/api/:system/journal/:characterId/:id`  | Modifier une entrée                |
| POST    | `/api/:system/dice/roll`                 | Enregistrer un jet                 |
| GET     | `/api/:system/dice/history/:characterId` | Historique dés                     |

---

## 🔌 Événements Socket.io

Les rooms sont isolées par système et session : `${system}_session_${sessionId}`

| Événement (émis)        | Direction       | Description                              |
|-------------------------|-----------------|------------------------------------------|
| `character-loaded`      | Client → Serveur | Joueur en ligne avec son personnage      |
| `character-left`        | Client → Serveur | Joueur déconnecté                        |
| `join-session`          | Client → Serveur | Rejoindre une room de session            |
| `gm-set-active-session` | GM → Serveur     | Activer une session côté GM              |
| `character-full-update` | Serveur → Client | Fiche complète mise à jour (après une écriture HTTP) |
| `gm-item-received`      | Serveur → Client | Item reçu du GM (rechargement perso)     |
| `gm-message-received`   | Serveur → Client | Message/note envoyé par le GM            |

---

## 🎮 Systèmes de Jeu

### Ajouter un nouveau système

1. Créer `src/server/systems/:slug/config.js`
2. Créer `src/server/systems/:slug/CharacterController.js` (la route `/characters` est commune)
3. Créer `database-template/:slug-schema.sql`
4. Créer les composants frontend dans `src/client/src/systems/:slug/`
5. Ajouter la config dés dans `src/client/src/systems/:slug/config.jsx`

La commande `/new-slug` de Claude Code détaille la procédure.

> Le système est découvert automatiquement au démarrage. Aucun fichier central à modifier.

### Systèmes actuels

`fabula` (Fabula Ultima), `zoneblanche` (Zone Blanche), `vikings` (Pure Vikings), `achtung` (Achtung! Cthulhu), `cyberpunk` (The Sprawl), `deltagreen` (Delta Green), `dune` (Dune), `noctis` (Noctis Solis, masqué de l'accueil), `tecumah` (Tecumah Gulch), `woddavampire` (Vampire : l'Âge des Ténèbres), `vileborn` (Vileborn), `nimble` (Nimble), `maledictum` (Imperium Maledictum). Le détail de chacun est dans le tableau des slugs de `CLAUDE.md` et dans `documentations/spec_<slug>.md`.

---

## 🎲 Moteur de Dés

Le moteur (`src/client/src/tools/diceEngine.js`) est générique. Chaque système déclare ses hooks (`buildNotation`, `beforeRoll`, `afterRoll`, `buildAnimationSequence`, `renderHistoryEntry`) dans son `config.jsx` ; l'animation est en 3D (`@3d-dice/dice-box-threejs`) ou en 2D selon le système. Spec : `documentations/plateforme/spec_diceengine_v2.md`.

---

## 🔐 Sécurité

- **Mesure du projet** : une app pour jouer entre amis, pas un produit grand public. Les actions MJ sont protégées côté serveur (`requireGM`), un joueur n'écrit que sa fiche (`requireOwnerOrGM`), toute écriture exige une connexion ; la visibilité des informations MJ est filtrée côté client, c'est voulu (`code-rules/back.md`).
- **Auth** : connexion par adresse et code d'accès du personnage ; JWT access token (courte durée) + refresh token en cookie httpOnly, par système et par rôle.
- **Sockets** : une room par table, partagée par le MJ et les joueurs ; les écritures passent par HTTP.
- **Limitation** : 5 échecs de connexion en 15 minutes bloquent le personnage (`rateLimits.js`).

---

## 🛠️ Scripts npm

| Commande                       | Description                              |
|--------------------------------|------------------------------------------|
| `npm run dev`                  | Lance backend + frontend en développement |
| `npm run build`                | Build du front dans `src/client/dist/`   |
| `npm start`                    | Lance le serveur en production           |
| `npm test`                     | Tests serveur (contrats des routes, droits, schémas) |
| `npm run migrate -- <fichier.sql> [--system=<slug>]` | Joue une migration sur les BDD |
| `npm run release`              | Mise en production (`documentations/process/spec_release.md`) |
| `cd src/client && npm run lint` / `npm test` | Lint et tests du front |

---

## 🎨 Crédits

- **Icônes du tableau partagé** (`src/client/public/board/icons/`) : [game-icons.net](https://game-icons.net), par Lorc, Delapouite et les autres contributeurs cités dans leur [dépôt](https://github.com/game-icons/icons), sous licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Tracés passés en `currentColor`, fond retiré ; index et catégories relevés une fois par `scripts/board-icons.js`, puis retouchables à la main.