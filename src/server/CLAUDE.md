# CLAUDE.md — Backend (src/server)

Contexte Express / SQLite / Socket.io. Complète le CLAUDE.md racine. **Les règles du code serveur sont dans la grille ci-dessous** (identifiants `B-…`) ; ce fichier décrit comment le serveur fonctionne.

@../../code-rules/back.md

## Structure

- Entrée : `server.js`, qui monte toutes les routes dynamiquement via `Loader.js`.
- Toutes les routes sont préfixées `/api/:slug/`. Routes partagées montées pour chaque système : sessions (dont `GET /active`, tables actives, testée par `tests/server/routes/sessions.test.js`), journal (journal « Privé » du personnage : liste légère, entrée complète, envois du MJ ; helpers `utils/journal.js` ; testée par `tests/server/routes/journal.test.js`), table-journal (journal « Partagé » de la table, `routes/tableJournal.js`, membres de la table et MJ, suppression par l'auteur ou le MJ ; `documentations/plateforme/spec_journal.md` §11.2 ; testée par `tests/server/routes/tableJournal.test.js`), dice, npcs (PNJ : bibliothèque et PNJ de la table, réservée au MJ, contrôleur `utils/npcs.js`, `documentations/plateforme/spec_pnj.md` §6.3, testée par `tests/server/routes/npcs.test.js`), audio (musique, base de module `audio.db`, `documentations/plateforme/spec_audio.md` ; timecodes des boutons testés par `tests/server/routes/audio.test.js`), board (tableau partagé, base de module `board.db`, `documentations/plateforme/spec_tableau.md` §10 ; testée par `tests/server/routes/board.test.js`, banc `startSlugApp(slug, 'board', { shared: true })`), initiative (état en mémoire `sharedState.initiativeStates`, sans base ; le MJ envoie l'état complet, forme vérifiée par `utils/initiative.js`, avatars gardés à part ; `documentations/plateforme/spec_initiative.md` §9.4 ; testée par `tests/server/routes/initiative.test.js`).
- Le middleware `systemResolver` injecte `req.system` (config du slug) et `req.db` (connexion SQLite).
- Connexions DB : `db/index.js` (ouverture paresseuse, fermeture après 5 min d'inactivité, `PRAGMA foreign_keys = ON` à chaque connexion). `scripts/migrate.js` coupe les clés pendant une migration.
- Bases de module (hors slugs, ex. audio) : une déclaration par base dans `db/modules/<nom>.js`, même forme qu'une config de slug ; `getModuleConfig(nom)` (`db/moduleConfig.js`) ne charge que celle demandée ; connexion par `getDbForSystem(getModuleConfig('audio'))`.

## Routes et contrôleurs

- **Route `/characters` commune** (`routes/characters.js`, spec `documentations/plateforme/spec_characters_route.md`) : liste, by-url, by-code, `/:id`, `/:id/sessions`, création (code choisi facultatif, 409 s'il est pris), `PUT`, `PATCH`, `DELETE`. Elle appelle le `CharacterController.js` du slug (obligatoire : `loadFullCharacter` / `saveFullCharacter`) et lit `config.characters` (`listColumns`, `requiredOnCreate`). Un `systems/:slug/routes/characters.js` n'existe que pour des routes propres au slug (XP, envoi d'objet…) ; monté avant la route commune, il pourrait en remplacer une (seul Noctis le fait, en attente de refonte).
- Modèle de sauvegarde d'une fiche : `FLAT_COLUMNS` de `vikings` et `fabula` (colonnes à plat en `COALESCE`, transaction, sous-tables par `syncSubTable` / `updateOrInsert`, fiche rechargée en retour).

## Authentification et droits

Middlewares dans `middlewares/auth.js` : `authenticate`, `requireOwnerOrGM`, `requireGM`.

- **Les joueurs éditent librement leur propre fiche** : c'est une fonctionnalité centrale, pas une exception. Le MJ peut agir sur toutes les fiches.
- Création (wizard), liste et chargement par code ou URL sont publics : ils servent la création et la connexion (liste exacte dans la grille, « Droits »).
- Le compte MJ est le personnage `id = -1`, jamais supprimable.
- Cookies de refresh : `refreshToken_${slug}` (joueur) et `refreshToken_${slug}_gm` (MJ), httpOnly.

## Tests (`tests/server/`, Vitest, `npm test` à la racine)

- **Contrat des routes `/characters`** de tous les slugs (`tests/server/systems/characters.contract.test.js`, spec `documentations/process/spec_tests_serveur.md`) : le routeur réel est monté sur une base en mémoire créée depuis le schéma du slug (`tests/server/helpers/slugApp.js`), sans `server.js` ni les bases de `database/`.
- Chaque slug fournit `tests/server/systems/<slug>/fixture.js` (corps minimal de création, champ modifié par l'envoi partiel). Le contrat échoue s'il manque.
- Le contrat crée la base depuis `schemaPath` : un schéma désynchronisé des migrations y apparaît.

## Socket.io

### Fonctionnement réel (`socket/index.js` et `socket/platform/`)

- Handlers de la plateforme rangés par domaine dans `socket/platform/` : `presence.js`, `sessions.js` (sessions MJ et rooms), `audio.js`, `board.js` (relais éphémère du tableau : ping et déplacement en direct, sans écriture ; l'émetteur doit être dans la room), `journal.js` (écriture à plusieurs dans le journal partagé : relais Yjs, document en mémoire `sharedState.journalDocs`, état enregistré dans `table_journal.ydoc` ; ouverture authentifiée par le jeton et réservée aux membres de la table ; `documentations/plateforme/spec_journal.md` §12, testé par `tests/server/socket/journal.test.js`). Chacun exporte `register(io, socket, sharedState)` et gère sa propre déconnexion ; `socket/index.js` les branche, puis les handlers des slugs (`systems/:slug/socket/*.js`, `register(io, socket)`).
- **Une seule room par session**, partagée par le MJ et les joueurs : `${slug}_session_${sessionId}`. Il n'existe pas de room réservée au MJ.
- On y entre et on en sort via `join-session` / `leave-session` `{ sessionId, system }`, émis par les hooks génériques (`useGMSession` côté MJ, `SessionContext` côté joueur). Le serveur ne vérifie pas l'appartenance : le contrôle « ce personnage fait partie de la session » est fait côté client.
- Présence : `character-loaded` / `character-left` mettent à jour `onlineCharacters` et diffusent `online-characters-update` à tout le monde. La clé est `presenceKey(slug, characterId)` : un id n'est unique que dans la base de son slug. Côté client, toute comparaison de présence filtre aussi sur `slug` (`useGMSession` ne transmet que les présences du slug courant).
- **Tables actives** (`documentations/plateforme/spec_tables.md`) : plusieurs tables d'un même slug peuvent être actives. Un poste MJ (un socket) ouvre sa table par `gm-set-active-session` et la quitte volontairement par `gm-clear-session` ; une table reste active tant qu'un poste l'a ouverte, ou 5 min après la déconnexion de son dernier poste (délai de grâce). État `activeTables` (logique pure dans `utils/activeTables.js`, testée), lecture initiale `GET /sessions/active`, puis `active-tables { system, tables: [{ id, posts }] }` à chaque changement, **dans la room du slug** `${slug}_all`.
- **Room du slug** `${slug}_all` : chaque socket y entre à la connexion, d'après le slug donné dans la poignée de main (`handshake.query.system`, vérifié contre le Loader ; refait à chaque reconnexion). Pas d'émission pour la rejoindre.
- État partagé (personnages en ligne, tables actives) dans `socket/index.js`.
- Mise à jour d'un personnage : route HTTP, puis le serveur diffuse `character-full-update { characterId, character }` vers **chaque room de session** du personnage (`broadcastCharacterUpdate` ; `emitToCharacterSessions` pour un autre événement, ex. `gm-item-received`).
- **Modèle de confiance assumé** : tout ce qui part dans une room est reçu par tous ses membres, et c'est voulu. Une info MJ peut être diffusée à la room et filtrée par le client MJ (pattern `session-resources-gm-update` pour les complications 2D20). Pas de room MJ dédiée ni de contrôle d'appartenance serveur à ajouter sans demande explicite.
- Exemple de référence d'un handler de slug : `systems/dune/socket/session-resources.js` (`dune:update-session-resources { sessionId, field, delta }` → `session-resources-update` + `session-resources-gm-update`).
