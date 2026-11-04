# CLAUDE.md — Backend (src/server)

Règles Express / SQLite / Socket.io. Complète le CLAUDE.md racine.

## Structure

- Entrée : `server.js`, qui monte toutes les routes dynamiquement via `Loader.js`.
- Toutes les routes sont préfixées `/api/:slug/`. Routes partagées montées pour chaque système : sessions, journal, dice, combat, npc, npc-sets, audio, board (tableau partagé, base de module `board.db`, `documentations/spec_tableau.md` §10 ; testée par `tests/server/routes/board.test.js`, banc `startSlugApp(slug, 'board', { shared: true })`).
- Le middleware `systemResolver` injecte `req.system` (config du slug) et `req.db` (connexion SQLite). Utilise-les, n'ouvre jamais de connexion à la main.
- Connexions DB : `db/index.js` (ouverture paresseuse, fermeture après 5 min d'inactivité).
- Bases de module (hors slugs, ex. audio) : une déclaration par base dans `db/modules/<nom>.js`, même forme qu'une config de slug ; `getModuleConfig(nom)` (`db/moduleConfig.js`) ne charge que celle demandée ; connexion par `getDbForSystem(getModuleConfig('audio'))`.

## Routes et contrôleurs

- **Route `/characters` commune** (`routes/characters.js`, spec `documentations/spec_characters_route.md`) : liste, by-url, by-code, `/:id`, `/:id/sessions`, création (code choisi facultatif, 409 s'il est pris), `PUT`, `PATCH`, `DELETE`. Elle appelle le `CharacterController.js` du slug (obligatoire) et lit `config.characters` (`listColumns`, `requiredOnCreate`). Un `systems/:slug/routes/characters.js` n'existe que pour des routes propres au slug (XP, envoi d'objet…) ; monté avant la route commune, il pourrait en remplacer une (seul Noctis le fait, en attente de refonte).
- Contrôleurs clairs : la route valide l'entrée et délègue, la logique métier ne se disperse pas dans les handlers.
- **Ordre de déclaration** : les routes spécifiques (`GET /:id/sessions`) avant les génériques (`GET /:id`), sinon collision.
- `GET /characters` reste **public** (sélection du personnage). Les routes MJ exigent un JWT valide.
- Gestion d'erreurs systématique : `try/catch`, code HTTP explicite, message exploitable, jamais de stack trace renvoyée au client.

## Authentification et droits

Middlewares dans `middlewares/auth.js` : `authenticate`, `requireOwnerOrGM`, `requireGM`.

- **Les joueurs éditent librement leur propre fiche** : c'est une fonctionnalité centrale, pas une exception. Les routes de lecture et d'écriture d'un personnage (`GET /:id`, `PUT /:id`, `PATCH /:id`, avatar, journal…) sont protégées par `authenticate, requireOwnerOrGM`. Le MJ peut agir sur toutes les fiches.
- Création (`POST /characters`, wizard), liste (`GET /characters`) et chargement par code ou URL (`/by-code/:code`, `/by-url/:url`) sont **publics** : ils servent la création et la connexion.
- Suppression et actions purement MJ (envoi d'objets ou de messages, gestion des sessions…) : `authenticate, requireGM`. Le compte MJ est le personnage `id = -1`, jamais supprimable.
- Cookies de refresh : `refreshToken_${slug}` (joueur) et `refreshToken_${slug}_gm` (MJ), httpOnly.
- Ne logge jamais de token, de mot de passe ni de code d'accès.

## SQLite

- Requêtes **paramétrées** uniquement, jamais de concaténation de valeurs dans le SQL.
- **Clés étrangères actives** (`PRAGMA foreign_keys = ON` à chaque connexion, `db/index.js`) : les `ON DELETE CASCADE` / `SET NULL` des schémas jouent, une insertion vers une ligne absente est refusée. Toute clé vers `characters` ou `game_sessions` déclare son `ON DELETE`. Pas d'`INSERT OR REPLACE` sur une table parente (le remplacement supprime la ligne, donc ses enfants). `scripts/migrate.js` coupe les clés pendant une migration.
- **COALESCE** dans les UPDATE pour ne pas écraser les champs non fournis (modèle : `FLAT_COLUMNS` de `vikings` et `fabula`). Un texte vidé (`''`) est bien enregistré ; une colonne ne se remet pas à `NULL` par la sauvegarde de fiche, c'est assumé.
- Écritures multi-tables (`saveFullCharacter`) dans une **transaction** ; `saveFullCharacter` renvoie la fiche rechargée. Les sous-tables (équipement, liens…) se synchronisent avec `syncSubTable` et `updateOrInsert` de `utils/characters.js` (ids stables), jamais une copie locale ni un « tout supprimer puis réinsérer ».
- `saveFullCharacter` doit mapper `accessCode → access_code` dans l'UPDATE des colonnes à plat.
- Schéma d'un slug : partir de `database-template/base.sql`, ne jamais redéfinir les tables partagées (`game_sessions`, `refresh_tokens`, `dice_history`, `character_journal`, `session_characters`). `characters` doit avoir `login_attempts`, `last_attempt_at`, `last_accessed`, et la colonne d'avatar s'appelle `avatar` (pas `avatar_url`).
- Toute évolution de structure : schéma **et** migration (voir CLAUDE.md racine).

## Tests (`tests/server/`, Vitest, `npm test` à la racine)

- **Contrat des routes `/characters`** de tous les slugs (`tests/server/systems/characters.contract.test.js`, spec `documentations/spec_tests_serveur.md`) : le routeur réel est monté sur une base en mémoire créée depuis le schéma du slug (`tests/server/helpers/slugApp.js`), sans `server.js` ni les bases de `database/`.
- Chaque slug fournit `tests/server/systems/<slug>/fixture.js` (corps minimal de création, champ modifié par l'envoi partiel). Le contrat échoue s'il manque.
- Le contrat crée la base depuis `schemaPath` : un schéma désynchronisé des migrations y apparaît.

## Socket.io

### Fonctionnement réel (`socket/index.js` et `socket/platform/`)

- Handlers de la plateforme rangés par domaine dans `socket/platform/` : `presence.js`, `sessions.js` (sessions MJ et rooms), `audio.js`, `board.js` (relais éphémère du tableau : ping et déplacement en direct, sans écriture ; l'émetteur doit être dans la room). Chacun exporte `register(io, socket, sharedState)` et gère sa propre déconnexion ; `socket/index.js` les branche, puis les handlers des slugs. Un nouveau domaine de la plateforme = un nouveau fichier, pas un ajout dans un fichier existant.

- **Une seule room par session**, partagée par le MJ et les joueurs : `${slug}_session_${sessionId}`. Il n'existe pas de room réservée au MJ.
- On y entre et on en sort via `join-session` / `leave-session` `{ sessionId, system }`, émis par les hooks génériques (`useGMSession` côté MJ, `SessionContext` côté joueur). Le serveur ne vérifie pas l'appartenance : le contrôle « ce personnage fait partie de la session » est fait côté client.
- Présence : `character-loaded` / `character-left` mettent à jour `onlineCharacters` et diffusent `online-characters-update` à tout le monde. La clé est `presenceKey(slug, characterId)` : un id n'est unique que dans la base de son slug. Côté client, toute comparaison de présence filtre aussi sur `slug` (`useGMSession` ne transmet que les présences du slug courant).
- Session MJ active : `gm-set-active-session` / `gm-clear-session` mettent à jour `activeSessions` (avec un timer de nettoyage à la déconnexion) et diffusent `gm-session-active` à tout le monde.
- État partagé (personnages en ligne, sessions actives, timers) dans `socket/index.js`.

### Règles pour le nouveau code

- Mise à jour d'un personnage : route HTTP, puis le serveur diffuse `character-full-update { characterId, character }` vers **chaque room de session** du personnage (helper `broadcastCharacterUpdate(io, db, slug, id, fiche)` de `utils/characters.js` ; `emitToCharacterSessions` pour un autre événement, ex. `gm-item-received`).
- Émission vers une room précise (`io.to(room)`), pas d'`io.emit` global pour un événement de session. L'activation de session ne doit pas provoquer d'`io.emit` supplémentaire (rechargements de la page MJ).
- **Modèle de confiance assumé** : tout ce qui part dans une room est reçu par tous ses membres, et c'est voulu. Une info MJ peut être diffusée à la room et filtrée par le client MJ (pattern `session-resources-gm-update` pour les complications 2D20). Pas de room MJ dédiée ni de contrôle d'appartenance serveur à ajouter sans demande explicite.
- Handlers de slug : `systems/:slug/socket/*.js` exporte `register(io, socket)` (la DB s'obtient par `getDbForSystem(getConfigForSystem(SLUG))`). Ils valident le payload (champ autorisé, type, bornes) et encadrent l'écriture d'un `try/catch` ; pas de validations factices.
- **Événements écoutés préfixés par le slug** (`<slug>:<événement>`, ex. `dune:update-session-resources`, `zoneblanche:equipment-add`) : les handlers de tous les slugs sont branchés sur chaque socket, un nom commun les réveillerait tous (et un slug pourrait écrire dans la base d'un autre). Les émissions vers une room du slug n'ont pas besoin de préfixe.
- Exemple de référence : `systems/dune/socket/session-resources.js` (`dune:update-session-resources { sessionId, field, delta }` → `session-resources-update` + `session-resources-gm-update`).