# CLAUDE.md

Guide pour Claude Code sur ce dépôt. Les règles spécifiques au front et au back sont dans `src/client/CLAUDE.md` et `src/server/CLAUDE.md` (chargés automatiquement quand tu travailles dans ces dossiers).

## Projet

VTT (virtual tabletop) multi-systèmes pour les tables de JDR de l'auteur (~15 joueurs max). Chaque système de jeu est un module autonome appelé **slug** : sa propre base SQLite, ses routes backend, ses composants frontend.

Stack : React 19 + Vite, TailwindCSS v4, TipTap v3 · Node.js/Express, SQLite via better-sqlite3 · Socket.io · JWT (access token court + refresh token en cookie httpOnly) · dés : `dice-box-threejs` (animation 3D), `rpg-dice-roller` (résolution), `diceEngine.js` maison.

## Méthode de travail (OBLIGATOIRE)

Chaque ticket suit trois phases. Ne passe jamais à la suivante sans validation explicite.

1. **Brainstorming / diagnostic** : analyse, questions sur les cas d'usage, implications DB et sockets. **Aucun code.**
2. **Spécification** : structure de données (schéma SQLite), événements socket, impact UI. Avantages et inconvénients exposés factuellement avant toute décision. Une spec fonctionnelle reste fonctionnelle (le quoi, pas le comment).
3. **Implémentation** : code modulaire et commenté, liste des fichiers touchés.

La phase 1 commence toujours par la lecture de la spec existante dans `documentations/` (voir plus bas).

Principes :
- **Patchs chirurgicaux** sur les fichiers existants, jamais de réécriture complète non demandée. Ne touche pas aux lignes sans rapport avec la demande.
- **Préserve les fins de ligne CRLF** des fichiers existants.
- **Lis la source avant d'écrire.** N'invente jamais un contrat de props, une signature ou un chemin : vérifie dans le code réel, surtout pour les composants génériques (voir `src/client/CLAUDE.md`).
- **Pas de sur-ingénierie** : pas de découpage de fichiers inutile, pas de fabriques quand un objet suffit, pas de validations socket factices, pas de bibliothèque superflue.
- **Sécurité GM/joueurs, à la mesure du projet** : c'est une app pour jouer entre amis, pas un produit grand public. Les **actions** réservées au MJ (écritures, suppressions, envois) sont protégées côté serveur (`requireGM`). La **visibilité** des informations MJ peut être filtrée côté client : c'est un choix assumé, pas une faille. Ne propose pas de durcissement de sécurité non demandé.
- Si une demande est ambiguë, pose la question plutôt que de décider seul, en donnant une recommandation argumentée.

## Langues

- **Interface : français** (tout texte visible par l'utilisateur).
- **Code : anglais** (variables, composants, props, noms de fichiers).

## Commandes

```bash
# Installation (les deux)
npm install                                  # deps backend (racine)
cd src/client && npm install                 # deps frontend
node src/client/scripts/copy-dice-assets.js  # obligatoire après chaque npm install client

# Développement
npm run dev        # backend (nodemon :3001) + frontend (vite :5173)

# Production
npm run build      # build front dans src/client/dist/
npm start          # backend qui sert le front buildé (déployé via pm2)

# Base de données
npm run init-db                              # initialise toutes les bases
npm run migrate 27022025_add_quoi.sql        # joue une migration précise

# Lint (front uniquement)
cd src/client && npm run lint
```

**Aucun test n'existe.** Après une modif, vérifie au minimum que `npm run lint` et `npm run build` passent.

## Architecture

### Découverte des systèmes (pattern central)

**Zéro registre central.** `Loader.js` scanne `src/server/systems/` au démarrage : tout dossier contenant un `config.js` valide devient un système actif. Aucun fichier hors du dossier du slug ne doit être modifié pour en ajouter un.

Fichiers d'un slug :
- `src/server/systems/:slug/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl? }`
- `src/server/systems/:slug/routes/characters.js` — routeur Express (obligatoire)
- `database-template/:slug-schema.sql` — schéma SQLite (bâti sur `base.sql`)
- `src/client/src/systems/:slug/config.jsx` — config front (hooks de dés, combat, `diceConfigDefault`)
- `src/client/src/systems/:slug/Sheet.jsx` — fiche joueur
- `src/client/src/systems/:slug/GMApp.jsx` — interface MJ
- `src/client/src/systems/:slug/Creation.jsx` — assistant de création

Routes supplémentaires : tout `.js` de `routes/` (sauf `characters.js`, `combat.js`) est monté sur `/api/:slug/<fichier>`.
Handlers socket supplémentaires : tout `.js` de `socket/` exporte `function register(io, socket, db)`.

Pour créer un slug, utilise la commande `/new-slug`.

### Slugs actifs

Tous sont des systèmes en usage réel, aucun n'est un brouillon :

| Slug | Système | Remarque |
|---|---|---|
| `fabula` | Fabula Ultima | Implémentation récente la plus complète : **référence à suivre** |
| `zoneblanche` | Zone Blanche (2D20) | Récent |
| `vikings` | Pure Vikings | Le plus ancien, **en refonte** : ne pas le prendre comme modèle |
| `achtung` | Achtung! Cthulhu | |
| `cyberpunk` | The Sprawl (PbtA) | |
| `deltagreen` | Delta Green | |
| `dune` | Dune (2D20) | |
| `noctis` | Noctis Solis (Vermine 2047) | Intégration `accessCode` en attente |
| `tecumah` | Tecumah Gulch (D6) | |

### Base de données

- Une base SQLite par slug, connexion paresseuse fermée après 5 min d'inactivité (`src/server/db/index.js`), créée depuis le schéma à la première ouverture.
- Tables partagées, définies dans `database-template/base.sql` : `characters`, `game_sessions`, `session_characters`, `dice_history`, `character_journal`, `refresh_tokens`. Ne les redéfinis jamais dans un schéma de slug.
- **Toute modification de structure** se fait à deux endroits : le schéma (`base.sql` ou `:slug-schema.sql`) pour les nouvelles bases, **et** une migration `database-template/migrations/DDMMYYYY_description.sql` pour les bases existantes.
- Dans les migrations et seeds, référence les lignes par sous-SELECT, jamais par ID en dur.

### Temps réel

Rooms Socket.io : `${slug}_session_${sessionId}`. L'état partagé (personnages en ligne, sessions actives) vit dans `src/server/socket/index.js`. Le serveur émet, les composants écoutent (détails dans les CLAUDE.md client et server).

## Environnement

- Dev sous **Windows**, prod sous **Linux** : la casse des noms de fichiers et des imports compte.
- HTTP en dev, HTTPS en prod via `https.createServer()`.
- `.env` à la racine : `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, et en prod `SSL_KEY_PATH`, `SSL_CERT_PATH`. Ne lis jamais ce fichier et n'en affiche jamais le contenu.

## Documentation et spécifications (`documentations/`)

La documentation du projet et les **spécifications validées** vivent en Markdown dans `documentations/` :
- specs de slugs : `spec_<slug>.md` (ex. `spec_deltagreen.md`, `spec_achtung_cthulhu.md`) ;
- specs de briques plateforme : `spec_combat.md` (combat générique), `spec_diceengine_v2.md` (moteur de dés) ;
- guides : `guide_new_slug_jdr.md`.

Règles :
- **Avant de travailler sur un slug ou une brique plateforme, lis la spec correspondante.** Elle porte les choix fonctionnels et les règles du jeu validés avec le MJ : ne les contredis pas et n'invente pas de règle absente.
- **En cas d'écart entre une spec et le code, le code fait foi** pour la technique (chemins, noms de colonnes, contrats de props). Certaines specs anciennes contiennent des détails dépassés (ex. `avatar_url` au lieu de `avatar`, cases à cocher). Signale l'écart plutôt que de « corriger » le code vers la spec.
- Une spec produite en phase 2 se range dans `documentations/` au même format, après validation.
- `guide_new_slug_jdr.md` est **obsolète**, notamment pour les chemins de composants et la structure GM (`gm/GMView.jsx`). Ne t'y fie pas : la référence est `/new-slug` et le code de `fabula`.