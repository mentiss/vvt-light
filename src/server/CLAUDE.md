# CLAUDE.md — Backend (src/server)

Règles Express / SQLite / Socket.io. Complète le CLAUDE.md racine.

## Structure

- Entrée : `server.js`, qui monte toutes les routes dynamiquement via `Loader.js`.
- Toutes les routes sont préfixées `/api/:slug/`. Routes partagées montées pour chaque système : sessions, journal, dice, combat, npc, npc-sets.
- Le middleware `systemResolver` injecte `req.system` (config du slug) et `req.db` (connexion SQLite). Utilise-les, n'ouvre jamais de connexion à la main.
- Connexions DB : `db/index.js` (ouverture paresseuse, fermeture après 5 min d'inactivité).

## Routes et contrôleurs

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
- **COALESCE** dans les UPDATE pour ne pas écraser les champs non fournis. Exception assumée : `fabula` n'utilise COALESCE que sur `access_code` et garde l'assignation directe ailleurs.
- Écritures multi-tables (`saveFullCharacter`) dans une **transaction**. Les sous-tables (équipement, liens…) se synchronisent avec le pattern `_syncSubTable`.
- `saveFullCharacter` doit mapper `accessCode → access_code` dans l'UPDATE des colonnes à plat.
- Schéma d'un slug : partir de `database-template/base.sql`, ne jamais redéfinir les tables partagées (`game_sessions`, `refresh_tokens`, `dice_history`, `character_journal`, `session_characters`). `characters` doit avoir `login_attempts`, `last_attempt_at`, `last_accessed`, et la colonne d'avatar s'appelle `avatar` (pas `avatar_url`).
- Toute évolution de structure : schéma **et** migration (voir CLAUDE.md racine).

## Socket.io

### Fonctionnement réel (`socket/handlers.js`)

- **Une seule room par session**, partagée par le MJ et les joueurs : `${slug}_session_${sessionId}`. Il n'existe pas de room réservée au MJ.
- On y entre et on en sort via `join-session` / `leave-session` `{ sessionId, system }`, émis par les hooks génériques (`useGMSession` côté MJ, `SessionContext` côté joueur). Le serveur ne vérifie pas l'appartenance : le contrôle « ce personnage fait partie de la session » est fait côté client.
- Présence : `character-loaded` / `character-left` mettent à jour `onlineCharacters` et diffusent `online-characters-update` à tout le monde.
- Session MJ active : `gm-set-active-session` / `gm-clear-session` mettent à jour `activeSessions` (avec un timer de nettoyage à la déconnexion) et diffusent `gm-session-active` à tout le monde.
- État partagé (personnages en ligne, sessions actives, timers) dans `socket/index.js`.

### Règles pour le nouveau code

- Mise à jour d'un personnage : route HTTP, puis le serveur diffuse `character-full-update { characterId, character }` vers **chaque room de session** du personnage (helper `broadcastCharacterUpdate` des routes `characters.js`).
- Émission vers une room précise (`io.to(room)`), pas d'`io.emit` global pour un événement de session. L'activation de session ne doit pas provoquer d'`io.emit` supplémentaire (rechargements de la page MJ).
- **Modèle de confiance assumé** : tout ce qui part dans une room est reçu par tous ses membres, et c'est voulu. Une info MJ peut être diffusée à la room et filtrée par le client MJ (pattern `session-resources-gm-update` pour les complications 2D20). Pas de room MJ dédiée ni de contrôle d'appartenance serveur à ajouter sans demande explicite.
- Handlers de slug : `systems/:slug/socket/*.js` exporte `register(io, socket)` (la DB s'obtient par `getDbForSystem(getConfigForSystem(SLUG))`). Ils valident le payload (champ autorisé, type, bornes) et encadrent l'écriture d'un `try/catch` ; pas de validations factices.
- Exemple de référence : `systems/dune/socket/session-resources.js` (`update-session-resources { sessionId, field, delta }` → `session-resources-update` + `session-resources-gm-update`).