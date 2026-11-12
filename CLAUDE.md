# CLAUDE.md

Guide pour Claude Code sur ce dépôt. Le contexte propre au front et au back est dans `src/client/CLAUDE.md` et `src/server/CLAUDE.md` (chargés automatiquement quand tu travailles dans ces dossiers).

**Les règles du code sont dans `code-rules/`** (grilles avec identifiants, partagées avec le relecteur Codex via `AGENTS.md`) : `common.md` ci-dessous, `front.md` et `back.md` importés par les `CLAUDE.md` des dossiers. Pour `database-template/` (schémas, migrations), lis `code-rules/back.md`. Spec : `documentations/process/spec_grilles_relecture.md`.

@code-rules/common.md

## Projet

VTT (virtual tabletop) multi-systèmes pour les tables de JDR de l'auteur (~15 joueurs max). Chaque système de jeu est un module autonome appelé **slug** : sa propre base SQLite, ses routes backend, ses composants frontend.

Stack : React 19 + Vite, TailwindCSS v4, TipTap v3 · Node.js/Express, SQLite via better-sqlite3 · Socket.io · JWT (access token court + refresh token en cookie httpOnly) · dés : `dice-box-threejs` (animation 3D), `rpg-dice-roller` (résolution), `diceEngine.js` maison.

## Méthode de travail (OBLIGATOIRE)

Chaque ticket suit trois phases. Ne passe jamais à la suivante sans validation explicite.

1. **Brainstorming / diagnostic** : analyse, questions sur les cas d'usage, implications DB et sockets. **Aucun code.**
2. **Spécification** : structure de données (schéma SQLite), événements socket, impact UI. Avantages et inconvénients exposés factuellement avant toute décision. Une spec fonctionnelle reste fonctionnelle (le quoi, pas le comment).
3. **Implémentation** : code modulaire et commenté, liste des fichiers touchés. Une fois lint, tests et build verts, **relecture croisée par Codex** (`/relecture`, `documentations/process/spec_relecture.md`) **proposée à l'utilisateur, lancée seulement sur son accord** (elle coûte cher en quota : une relecture d'une trentaine de fichiers a pris 30 % d'une session) : corrections appliquées, suggestions présentées à l'utilisateur. Si le quota Codex est épuisé, la relecture est sautée, pas reportée : on continue comme avant.

La phase 1 commence toujours par la lecture de la spec existante dans `documentations/` (voir plus bas).

Principes :
- **Patchs chirurgicaux** sur les fichiers existants, jamais de réécriture complète non demandée. Ne touche pas aux lignes sans rapport avec la demande.
- **Lis la source avant d'écrire.** N'invente jamais un contrat de props, une signature ou un chemin : vérifie dans le code réel, surtout pour les composants génériques (voir `src/client/CLAUDE.md`).
- **Pas de sur-ingénierie** : pas de découpage de fichiers inutile, pas de fabriques quand un objet suffit, pas de validations socket factices, pas de bibliothèque superflue.
- **Sécurité GM/joueurs, à la mesure du projet** : c'est une app pour jouer entre amis, pas un produit grand public. Les **actions** réservées au MJ (écritures, suppressions, envois) sont protégées côté serveur (`requireGM`). La **visibilité** des informations MJ peut être filtrée côté client : c'est un choix assumé, pas une faille. Ne propose pas de durcissement de sécurité non demandé.
- Si une demande est ambiguë, pose la question plutôt que de décider seul, en donnant une recommandation argumentée.
- **Doc à jour dans le même chantier** : un changement de contrat, de structure ou de liste (slug ajouté, signature changée, dette résorbée) met à jour le `CLAUDE.md`, la grille de `code-rules/` ou la spec qui le décrit.

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

# Production (voir documentations/process/spec_release.md, ou la commande /release)
npm run release    # vérifs + version + build + archive + envoi + migrations + redémarrage
npm run build      # build front dans src/client/dist/
npm start          # backend qui sert le front buildé (déployé via pm2)

# Base de données
npm run migrate 27022025_add_quoi.sql        # joue une migration précise (les bases se créent seules à la première ouverture)

# Lint (front uniquement)
cd src/client && npm run lint

# Tests unitaires du front (Vitest)
cd src/client && npm test

# Tests serveur : contrat des routes (Vitest, racine)
npm test
```

Après une modif, vérifie au minimum que `npm run lint`, `npm test` et `npm run build` passent (depuis `src/client`), et `npm test` à la racine si le serveur est touché.

**Tests** : Vitest. Un dossier `tests/` par côté, qui reproduit l'arborescence du code testé :
- **Front** (`src/client/tests/`, miroir de `src/client/src/`, ex. `tests/systems/tecumah/xpCosts.test.js` pour `src/systems/tecumah/xpCosts.js`) : fonctions pures uniquement (barèmes, conversions, hooks de dés, stats dérivées), jamais de composants.
- **Serveur** (`tests/server/` à la racine) : tests de contrat des routes, sur base temporaire créée depuis le schéma (voir `src/server/CLAUDE.md`). Chaque slug y a son `tests/server/systems/<slug>/fixture.js`.

Pas de campagne de rattrapage : on ajoute un test quand on touche une règle de calcul ou un contrat. Supprimer un slug implique aussi de supprimer `src/client/tests/systems/<slug>/` et `tests/server/systems/<slug>/`.

## Architecture

### Découverte des systèmes (pattern central)

**Zéro registre central.** `Loader.js` scanne `src/server/systems/` au démarrage : tout dossier contenant un `config.js` valide devient un système actif. Aucun fichier hors du dossier du slug ne doit être modifié pour en ajouter un.

Fichiers d'un slug :
- `src/server/systems/:slug/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl?, hidden?, characters? }` (`hidden: true` : absent de l'accueil, joignable par son adresse ; `characters: { listColumns, requiredOnCreate }` pour la route commune)
- `src/server/systems/:slug/CharacterController.js` — `loadFullCharacter` / `saveFullCharacter` (obligatoire) ; la route `/characters` est commune (`src/server/routes/characters.js`, `documentations/plateforme/spec_characters_route.md`)
- `src/server/systems/:slug/routes/characters.js` — facultatif : routes personnage propres au slug (XP, objets…), montées avant la route commune
- `database-template/:slug-schema.sql` — schéma SQLite (bâti sur `base.sql`)
- `src/client/src/systems/:slug/config.jsx` — config front (hooks de dés, `diceConfigDefault`)
- `src/client/src/systems/:slug/Sheet.jsx` — fiche joueur
- `src/client/src/systems/:slug/GMApp.jsx` — interface MJ
- `src/client/src/systems/:slug/Creation.jsx` — assistant de création

Routes supplémentaires : tout `.js` de `routes/` (sauf `characters.js`) est monté sur `/api/:slug/<fichier>`.
Helpers de sauvegarde et de diffusion partagés (`syncSubTable`, `updateOrInsert`, `parseJson`, `broadcastCharacterUpdate`, `emitToCharacterSessions`) : `src/server/utils/characters.js`, jamais recopiés dans un slug.
Handlers socket supplémentaires : tout `.js` de `socket/` exporte `function register(io, socket)`.

Pour créer un slug, utilise la commande `/new-slug`. Un slug ne peut pas s'appeler `platform` (portée réservée du stockage navigateur, refusée par le Loader).

### Slugs actifs

Tous sont des systèmes en usage réel, aucun n'est un brouillon :

| Slug | Système | Remarque |
|---|---|---|
| `fabula` | Fabula Ultima | Refondu (`spec_fabula.md`) : « Cristal & Commandes », arcanes, fiche de groupe |
| `zoneblanche` | Zone Blanche (2D20) | Récent |
| `vikings` | Pure Vikings | Le plus ancien, refondu deux fois : habillage « pierre peinte » ou « bois et or » au choix du joueur, ciels vivants, plateau de jet, halle du MJ, assistant de création en trois zones (`spec_vikings_pierre_peinte.md`) |
| `achtung` | Achtung! Cthulhu | |
| `cyberpunk` | The Sprawl (PbtA) | |
| `deltagreen` | Delta Green | |
| `dune` | Dune (2D20) | Refondu (`spec_dune.md`) : bande partagée joueur / MJ, fiche partagée, catalogues d'atouts et de talents tirés du livre |
| `noctis` | Noctis Solis (Vermine 2047) | Intégration `accessCode` en attente ; masqué de l'accueil (`hidden`) |
| `tecumah` | Tecumah Gulch (D6) | |
| `woddavampire` | Vampire : l'Âge des Ténèbres (V20 Dark Ages) | Premier slug organisé comme le décrit le guide (`config/rules/`, sections partagées joueur / MJ, hooks), aide de jeu en Markdown, coterie |
| `vileborn` | Vileborn (kit d'initiation) | Création déduite des prétirés, fiche calquée sur la page 1 des prétirés, mode Édition partagé joueur / MJ ; défis côté MJ (bibliothèque en base, `spec_vileborn_defis.md`) |
| `maledictum` | Imperium Maledictum (Warhammer 40 000, setup Inquisition) | Le plus récent (`spec_maledictum.md`) : Patron du groupe, thème selon le rôle de faction du personnage, tables automatisées, aide de jeu |
| `nimble` | Nimble 3.x (hack allégé de D&D 5e) | Créé en autonomie (`spec_nimble.md`) : catalogues transcrits et traduits (11 classes, sorts, bestiaire), critique explosif du dé primaire, montée de niveau guidée, onglet Rencontre côté MJ |

### Base de données

- Une base SQLite par slug, connexion paresseuse fermée après 5 min d'inactivité (`src/server/db/index.js`), créée depuis le schéma à la première ouverture.
- **`database-template/base.sql` est le socle des schémas de slug**, pas un fichier exécuté : chaque `:slug-schema.sql` part d'une copie de son contenu (tables partagées `characters`, `game_sessions`, `session_characters`, `dice_history`, `character_journal`, `refresh_tokens`, et les PNJ `npcs`, `session_npcs`, présentes dans tous les slugs même sans onglet PNJ, `documentations/plateforme/spec_pnj.md`), puis y ajoute ses colonnes et ses tables. `db/index.js` ne joue que le schéma du slug. Une table partagée garde la structure de `base.sql` (colonnes en plus permises).
- **Toute modification de structure** se fait à deux endroits : le schéma (`base.sql` ou `:slug-schema.sql`) pour les nouvelles bases, **et** une migration `database-template/migrations/DDMMYYYY_description.sql` pour les bases existantes.
- Chaque nouvelle migration déclare ses slugs dans son en-tête de commentaires : `-- systems: vikings` (ou `vikings,achtung`, ou `all`). Sans cette ligne, `npm run release` refuse de partir. `migrations/released.txt` liste les migrations déjà en prod : ne l'édite pas à la main, la release le tient à jour.
- **Bases de module** : un module de la plateforme peut avoir sa propre base hors des bases des slugs (ex. `database/audio.db`, `database/board.db`), déclarée seule dans `src/server/db/modules/<module>.js` et chargée par `getModuleConfig(nom)` (`src/server/db/moduleConfig.js`), schéma `database-template/<module>-schema.sql`. Ce n'est pas une base centrale de jeu : chaque ligne porte le slug (et la table, `session_id`) qu'elle concerne. Une migration la vise par son nom (`-- systems: audio`) ; `all` ne vise que les slugs.
- Dans les migrations et seeds, référence les lignes par sous-SELECT, jamais par ID en dur.

### Temps réel

Rooms Socket.io : `${slug}_session_${sessionId}`. L'état partagé (personnages en ligne, sessions actives) vit dans `src/server/socket/index.js`. Le serveur émet, les composants écoutent (détails dans les CLAUDE.md client et server).

## Environnement

- Dev sous **Windows**, prod sous **Linux** : la casse des noms de fichiers et des imports compte.
- HTTP en dev, HTTPS en prod via `https.createServer()`.
- `.env` à la racine : `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, et en prod `SSL_KEY_PATH`, `SSL_CERT_PATH`. Ne lis jamais ce fichier et n'en affiche jamais le contenu.

## Documentation et spécifications (`documentations/`)

La documentation du projet et les **spécifications validées** vivent en Markdown dans `documentations/`. **Point d'entrée : `documentations/README.md`** (index de toutes les specs, avec leur statut). Rangement :
- `backlog.md` (todo) et `backlog_fait.md` (archive des items en prod), à la racine ;
- `slugs/<slug>/` : spec du slug (`spec_<slug>.md`, ex. `spec_deltagreen.md`), documents de règles, transcriptions, catalogues, et ses planches dans `planches/` ;
- `plateforme/` : specs des briques (`spec_pnj.md`, `spec_diceengine_v2.md`, `spec_ui_menu.md`…), planches dans `plateforme/planches/` ;
- `process/` : méthode et outillage (release, relecture, grilles, tests serveur, arborescence du client, guide de création d'un slug pour les humains) ;
- `archives/` : documents dépassés, gardés pour l'historique.

Règles :
- **Avant de travailler sur un slug ou une brique plateforme, lis la spec correspondante.** Elle porte les choix fonctionnels et les règles du jeu validés avec le MJ : ne les contredis pas et n'invente pas de règle absente.
- **En cas d'écart entre une spec et le code, le code fait foi** pour la technique (chemins, noms de colonnes, contrats de props). Certaines specs anciennes contiennent des détails dépassés (ex. `avatar_url` au lieu de `avatar`, cases à cocher). Signale l'écart plutôt que de « corriger » le code vers la spec.
- Une spec produite en phase 2 se range dans le dossier qui lui correspond (`slugs/<slug>/`, `plateforme/`, `process/`), au même format, après validation, et s'ajoute à l'index `documentations/README.md`. Un document qui n'est plus d'actualité part dans `archives/`.
- **Les specs ont été rangées le 2026-11-12 sans être renommées** : un chemin complet `documentations/spec_x.md` resté dans un commentaire ou une autre spec est périmé, le nom suffit à la retrouver. Le chantier qui touche un fichier corrige ses chemins au passage ; les noms irréguliers (`spec_tecumah_gulch.md`, `spec_regles_zone_blanche.md`…) s'harmonisent avec le chantier du slug concerné, pas en campagne.
- Créer un slug : `documentations/process/guide_new_slug.md` (le « quoi », pour les humains comme pour les agents) et la commande `/new-slug` (la méthode de l'agent).