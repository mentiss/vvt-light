# Grille back

Règles du code serveur : `src/server/`, `database-template/`, `scripts/`, `tests/server/`. Mode d'emploi (niveaux, exceptions, contrôles) : `code-rules/common.md`. Contexte et fonctionnement : `src/server/CLAUDE.md`.

## Choix assumés (pas des écarts)

C'est une app pour jouer entre amis (une quinzaine de joueurs), pas un produit grand public. Ne sont **pas** des écarts, et ne se remontent pas, même en suggestion :
- la visibilité des informations MJ filtrée côté client (une info MJ peut partir dans la room et être filtrée par le client MJ) ;
- l'absence de contrôle serveur d'appartenance à une room, et l'absence de room réservée au MJ ;
- l'absence de durcissement de sécurité au-delà des règles ci-dessous.

## Règles

### Droits

Routes publiques (sans `authenticate`) : `POST /characters` (création), `GET /characters` (liste), `GET /characters/by-code/:code`, `GET /characters/by-url/:url`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`. Le compte MJ est le personnage `id = -1`.

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| B-AUTH-GM | Règle | Une action réservée au MJ (suppression de personnage, envoi d'objet ou de message, gestion et suppression des tables…) a `authenticate, requireGM`. N'en fait pas partie la suppression de jets de l'historique, ouverte à tout utilisateur connecté (bouton « Tout effacer » proposé à chacun). | Les actions MJ sont protégées côté serveur, c'est la limite de sécurité du projet. | relecture |
| B-AUTH-OWNER | Règle | Lire ou écrire un personnage (`GET`/`PUT`/`PATCH /:id`, avatar, journal…) passe par `authenticate, requireOwnerOrGM`. Le joueur édite librement sa propre fiche. | Un joueur ne touche pas la fiche d'un autre. | relecture |
| B-AUTH-USER | Règle | Toute route d'écriture a au moins `authenticate` (sur la route ou par `router.use`), sauf les routes publiques ci-dessus. Une nouvelle route publique s'ajoute à la liste `PUBLIC` du test, avec sa raison. Noctis est exclu du test jusqu'à sa refonte. | Une écriture anonyme se fait d'un simple appel. | test (`tests/server/routes/rights.test.js`) |
| B-AUTH-CHECK | Règle | Un contrôle d'identité ou de droit ne saute jamais parce qu'un champ est absent : une entrée manquante est un refus. | `if (code && code !== attendu)` laisse passer qui n'envoie pas de code. | relecture |

### SQL et écritures

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| B-SQL-PARAM | Règle | Requêtes paramétrées. Un nom de colonne ou de table interpolé vient d'une liste blanche en constante du fichier, jamais de `req.body`, `req.params` ou d'un payload socket. | Une clé venue du client et interpolée écrit n'importe quelle colonne, ou injecte du SQL. | relecture |
| B-COALESCE | Règle | Un `UPDATE` de fiche n'écrase pas un champ non fourni : `COALESCE(@col, col)` (modèle : `FLAT_COLUMNS` de `vikings` et `fabula`) ou condition `!== undefined`. Un texte vidé (`''`) s'enregistre ; une colonne ne se remet pas à `NULL` par la sauvegarde de fiche, c'est assumé. | Un envoi partiel ne doit pas effacer le reste. | relecture |
| B-TX | Règle | Une écriture sur plusieurs tables (dont `saveFullCharacter`) est dans une transaction ; `saveFullCharacter` renvoie la fiche rechargée. | Pas de fiche à moitié écrite. | relecture |
| B-SUBTABLE | Règle | Les sous-tables (équipement, liens…) se synchronisent par `syncSubTable` / `updateOrInsert` (ids stables), jamais « tout supprimer puis réinsérer ». | Les ids changeraient à chaque sauvegarde, et les lignes qui en dépendent seraient perdues. | relecture |
| B-HELPERS | Règle | Les helpers de `src/server/utils/characters.js` (`syncSubTable`, `updateOrInsert`, `parseJson`, `broadcastCharacterUpdate`, `emitToCharacterSessions`) ne sont jamais recopiés dans un slug. | Une copie ne reçoit pas les correctifs. | relecture |
| B-ACCESSCODE | Règle | `saveFullCharacter` mappe `accessCode → access_code` dans l'`UPDATE` des colonnes à plat. | Sinon le changement de code d'accès est perdu. | test |
| B-DATE | Règle | Les dates se comparent en nombres (`getTime()`, `Date.now()`), jamais une `Date` contre une chaîne. | La comparaison vaut toujours `false` sans erreur. | relecture |
| B-DB | Règle | Connexion par `req.db` dans une route, ou `getDbForSystem(getConfigForSystem(SLUG))` appelé **dans** le handler socket ; jamais de connexion ouverte à la main ni gardée depuis `register`. | Les connexions se ferment après 5 min d'inactivité (`db/index.js`) : une référence gardée devient une connexion fermée. | relecture |

### Routes

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| B-ERR | Règle | Chaque handler a un `try/catch` ou passe par un wrapper ; code HTTP explicite, message exploitable, jamais de stack trace au client. | Une erreur se comprend sans exposer l'intérieur. | relecture |
| B-LOG | Règle | Jamais de jeton, de mot de passe ni de code d'accès dans les logs, y compris à travers une URL loggée (`/by-code/:code`). | Les logs ne sont pas protégés comme la base. | relecture |
| B-ROUTE-ORDER | Règle | Les routes spécifiques (`GET /:id/sessions`) sont déclarées avant les génériques (`GET /:id`). | Sinon la générique capture la requête. | relecture |
| B-ROUTE-URL | Règle | Une route de slug est montée par le Loader sur `/api/:slug/<fichier>` : l'URL appelée par le client correspond à une route réellement montée. | Un écart donne un 404 que rien ne signale avant la partie. | relecture |
| B-BROADCAST | Règle | Toute route qui écrit dans `characters` ou une sous-table de fiche diffuse la fiche : `broadcastCharacterUpdate(io, db, slug, id, fiche)`, ou `emitToCharacterSessions` pour un autre événement. | Sinon la vue MJ reste figée jusqu'au rechargement. | relecture |
| B-NUMBER | Règle | Un nombre reçu dans le corps JSON (`req.body`) ou un payload socket se vérifie par `typeof value === 'number'` et `Number.isFinite(value)` (bornes en plus si besoin), jamais par `Number(value)` seul. Les paramètres d'URL et de requête (`req.params`, `req.query`), toujours des chaînes, se convertissent par `Number()` puis se vérifient (`Number.isInteger`…). | `Number()` accepte n'importe quoi en silence : `true` → 1, `[83]` → 83, `''` → 0, `null` → 0. | relecture |
| B-THIN-ROUTE | Préférence | La route valide l'entrée et délègue ; la logique métier vit dans le contrôleur. | La logique dispersée dans les handlers se duplique. | relecture |

### Socket.io

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| B-ROOM | Règle | Un événement de table part vers sa room (`io.to(\`${slug}_session_${id}\`)`), jamais par `io.emit` global. L'activation de session ne provoque pas d'`io.emit` supplémentaire. | Un `io.emit` touche toutes les tables de tous les slugs, et recharge la page MJ. | relecture |
| B-SOCK-PREFIX | Règle | Un événement écouté par un handler de slug est préfixé `<slug>:` (ex. `dune:update-session-resources`). Les émissions vers une room du slug n'en ont pas besoin. | Les handlers de tous les slugs sont branchés sur chaque socket : un nom commun les réveillerait tous, et un slug pourrait écrire dans la base d'un autre. | relecture |
| B-SOCK-SIG | Règle | Un handler de slug (`systems/<slug>/socket/*.js`) exporte `register(io, socket)` ; il valide le payload (champ autorisé, type, bornes) et encadre l'écriture d'un `try/catch`. Pas de validation factice. | Le payload vient du client. | relecture |
| B-SOCK-DOMAIN | Préférence | Un nouveau domaine socket de la plateforme est un nouveau fichier de `socket/platform/`, qui exporte `register(io, socket, sharedState)`. | Un domaine par fichier, chacun gère sa déconnexion. | relecture |

### Schémas et migrations

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| B-SCHEMA-SHARED | Règle | Un schéma de slug part d'une copie de `database-template/base.sql` (le socle : jamais exécuté seul, `db/index.js` ne joue que le schéma du slug) et garde ses tables telles quelles (`characters`, `game_sessions`, `session_characters`, `dice_history`, `character_journal`, `refresh_tokens`, `npcs`, `session_npcs`) ; `characters` a `login_attempts`, `last_attempt_at`, `last_accessed`, `avatar` (pas `avatar_url`) et la ligne MJ `id = -1`. Colonnes en plus permises. | Une base neuve (réinstallation, tests) doit fonctionner comme une base migrée. | test (`tests/server/systems/schemas.test.js`) |
| B-FK | Règle | Une clé vers `characters` ou `game_sessions` déclare son `ON DELETE` (celui de `base.sql` pour les tables partagées) ; pas d'`INSERT OR REPLACE` sur une table parente. Écart documenté : `dice_history.character_id` en `SET NULL` dans les bases en service de cyberpunk, dune et noctis (un personnage supprimé garde ses jets, anonymes), connu du test. | Les clés étrangères sont actives : le remplacement supprime la ligne, donc ses enfants. | test (`ON DELETE`) ; relecture (`INSERT OR REPLACE`) |
| B-MIGRATION | Règle | Un changement de structure modifie le schéma (`base.sql` ou `<slug>-schema.sql`) **et** ajoute `database-template/migrations/DDMMYYYY_description.sql`. La migration déclare `-- systems: <slugs>` (ou `all`, ou le nom d'une base de module) et référence les lignes par sous-SELECT, jamais par id en dur. `migrations/released.txt` ne s'édite pas à la main. | Les bases neuves partent du schéma, les bases existantes de la migration : les deux doivent arriver au même état. | relecture |
