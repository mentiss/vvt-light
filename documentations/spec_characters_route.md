# Route `/characters` commune

> Statut : **validée et implémentée** (2026-11-04), lots 1 à 4. Phase 1 (diagnostic et décisions Q-1 à Q-8) validée par le MJ le 2026-11-04.

## 1. Objectif

Aujourd'hui chaque slug réécrit sa route `routes/characters.js` (2 958 lignes pour 11 slugs) et recopie les mêmes helpers dans son `CharacterController.js`. Le chantier :

- met la route en commun : un slug n'a plus à écrire de `characters.js` ;
- range les helpers recopiés dans `src/server/utils/` ;
- aligne les slugs sur un seul comportement (décisions du §2) ;
- corrige les défauts trouvés au diagnostic (§7).

Le contrat `tests/server/systems/characters.contract.test.js` sert de filet à chaque lot.

## 2. Décisions de la phase 1

| # | Question | Réponse du MJ |
|---|---|---|
| Q-1 | Noctis hors chantier (route et `PATCH` à part) en attendant sa refonte | Oui |
| Q-2 | `by-code` en majuscules pour tous | Indifférent (les codes sont stockés en majuscules). Retenu : la route commune met le code en majuscules, à un seul endroit, aucun contrôle par slug |
| Q-3 | `last_accessed` mis à jour par `by-url` seulement | Oui (recommandation) |
| Q-4 | `DELETE` pour tous, compte MJ protégé, 404 si introuvable | Oui, MJ seul ; aucune interface de suppression n'est prévue pour l'instant |
| Q-5 | `PATCH` pour tous (même sauvegarde que `PUT`) | Oui |
| Q-6 | Code d'accès choisi à la création, généralisé, 409 si déjà pris | Oui |
| Q-7 | Corriger les défauts (N² Cyberpunk, routes avatar mortes, envoi d'objet à tout le serveur) | Oui, tout |
| Q-8 | Achtung et Zone Blanche sur `syncSubTable` (ids de lignes filles stables), en lot séparé | Oui |

## 3. Montage

- Nouvelle route générique `src/server/routes/characters.js`, montée pour chaque slug sur `/api/<slug>/characters` par `server.js`.
- Si le slug a un `routes/characters.js`, il est monté **avant** la route générique sur le même chemin : ses routes propres s'ajoutent (XP, SAN, atouts…), et une route de même méthode et même chemin prend le pas sur la générique (cas de Noctis).
- `characters.js` sort des routes obligatoires du `Loader` (`REQUIRED_ROUTES`). Devient obligatoire à la place : `CharacterController.js` à la racine du slug.
- La route générique lit le contrôleur du slug par le `Loader` (chargé une fois, comme les routes).
- `tests/server/helpers/slugApp.js` monte la même pile que `server.js` (route du slug puis route générique).

## 4. Contrat du slug

### 4.1 `CharacterController.js` (obligatoire)

| Export | Rôle |
|---|---|
| `loadFullCharacter(db, id)` | fiche complète en camelCase, `null` si introuvable |
| `saveFullCharacter(db, id, data)` | écrit les champs fournis (COALESCE) et les sous-tables fournies, **renvoie la fiche rechargée** |

Dune et Tecumah, dont `saveFullCharacter` ne renvoie rien, sont alignés.

### 4.2 `config.js` (facultatif)

```js
characters: {
    listColumns:      ['clan_key', 'generation'],   // colonnes en plus dans GET / (rendues en camelCase)
    requiredOnCreate: ['playerName', 'nom'],        // défaut : ['playerName']
},
```

Sans bloc `characters`, le slug a la liste de base et seul `playerName` est requis.

## 5. Comportement de la route générique

| Route | Droits | Comportement |
|---|---|---|
| `GET /` | public | colonnes de base `id, access_code, access_url, player_name, prenom?, nom?, avatar, updated_at` (les colonnes absentes du schéma sont ignorées) + `listColumns` ; `id != -1` ; tri `updated_at DESC` ; camelCase |
| `GET /by-url/:url` | public | fiche complète ; met à jour `last_accessed` ; 404 sinon |
| `GET /by-code/:code` | public | code mis en majuscules ; fiche complète ; 404 sinon |
| `GET /:id` | propriétaire ou MJ | fiche complète ; 404 sinon |
| `GET /:id/sessions` | propriétaire ou MJ | `[{ id, name, accessCode, accessUrl, updatedAt }]` |
| `POST /` | public | champs `requiredOnCreate` vérifiés (400) ; `accessCode` facultatif : majuscules, 6 caractères lettres / chiffres (400 sinon), **409 s'il est déjà pris** ; sinon code auto (`ensureUniqueCode`) ; `INSERT` minimal (code, url, champs requis), puis `saveFullCharacter` avec le reste du corps ; 201 avec la fiche |
| `PUT /:id` | propriétaire ou MJ | 404 si introuvable ; `saveFullCharacter` ; diffusion ; fiche |
| `PATCH /:id` | propriétaire ou MJ | identique à `PUT` (le contrôleur n'écrit que ce qui est fourni) |
| `DELETE /:id` | MJ | compte MJ (`id -1`) : 403 ; 404 si introuvable ; `{ success: true }` |

- Erreurs : `{ error }`, 404 = « Personnage introuvable », 500 = message de l'exception, journal préfixé par le slug.
- Diffusion : `character-full-update { characterId, character }` une fois par table du personnage, room `<slug>_session_<id>` (slug tiré de `req.system`).
- Valeurs par défaut de création : elles ne vivent plus dans un `INSERT` de route. Une colonne sans valeur fournie prend le `DEFAULT` du schéma. Pour chaque slug du lot 3 : vérifier que les colonnes `NOT NULL` ont un `DEFAULT` et que les défauts du schéma sont ceux de l'ancien `INSERT` (sinon migration, schéma + `migrations/`).
- `DELETE` : `PRAGMA foreign_keys` n'étant pas activé (dette connue), les lignes filles restent en base comme aujourd'hui. Hors périmètre.

## 6. Helpers communs (`src/server/utils/characters.js`)

| Helper | Version retenue | Remplace |
|---|---|---|
| `syncSubTable(db, table, characterId, incoming, upsertFn)` | celle de Fabula (ignore les lignes vides, passe la position) | 7 copies (3 variantes) |
| `updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues)` | identique partout | 5 copies |
| `parseJson(value, fallback)` | celle de Fabula (valeur vide → repli) | 5 copies + `routes/npc.js`, `routes/npc-sets.js` |
| `broadcastCharacterUpdate(io, db, slug, characterId, character)` | room tirée du slug | 8 copies et 3 boucles écrites dans la route |

`_int`, `_clamp`, `_intOrNull`, `_jsonArray` (Vileborn, Vampire) restent au slug : deux copies seulement, pas de besoin commun.

## 7. Correctifs inclus

| # | Défaut | Correction |
|---|---|---|
| F-1 | Cyberpunk diffuse `character-full-update` N² fois (boucles imbriquées) | disparaît avec la route commune |
| F-2 | `POST /:id/avatar` d'Achtung, Vikings, Zone Blanche jamais appelés par le client | supprimés |
| F-3 | Dune (toujours) et Cyberpunk (sans table active) envoient `gm-item-received` à tout le serveur (`io.emit`), donc aux autres slugs | envoi aux rooms des tables du personnage seulement |
| F-4 | Delta Green, Dune, Tecumah, Cyberpunk sans `PATCH` ; Delta Green sans `DELETE` | apportés par la route commune |

## 8. Routes qui restent au slug

| Slug | Routes |
|---|---|
| Cyberpunk | `PATCH /:id/resources`, `PATCH /:id/xp`, `POST /:id/send-item` |
| Delta Green | `POST /:id/san-loss`, `POST /:id/evolve` |
| Dune | `POST /:id/items`, `POST /:id/talents`, `POST /:id/send-item` |
| Tecumah | `POST /:id/send-item` |
| Noctis | tout son `characters.js` (Q-1) |

Les autres slugs (Achtung, Fabula, Vikings, Vileborn, Vampire, Zone Blanche) n'ont plus de `characters.js`.

Noctis, qui n'avait pas de `DELETE`, reçoit celui de la route commune (MJ seul, compte MJ protégé) : sa route ne déclare pas ce chemin.

## 12. Notes d'implémentation

- `POST /` : la ligne minimale est insérée, puis `saveFullCharacter` écrit le reste dans sa propre transaction (les contrôleurs ouvrent `BEGIN` eux-mêmes, une transaction englobante est impossible). Si la sauvegarde échoue, la ligne créée est supprimée.
- `emitToCharacterSessions(io, db, slug, id, événement, données)` (`utils/characters.js`) sert à l'envoi d'objet de Dune, Tecumah et Cyberpunk (sans table indiquée) ; `broadcastCharacterUpdate` s'appuie dessus.
- `parseJson` rend tel quel un objet déjà lu (comportement des routes PNJ).
- Zone Blanche : vérités et focus en `syncSubTable` ; les talents (clés de catalogue, sans id de ligne) restent en remplacement complet.
- Défauts de création vérifiés pour Cyberpunk, Delta Green, Dune, Tecumah : ceux du schéma sont ceux des anciens `INSERT`, sauf les attributs de Tecumah (6 au schéma, 3 dans l'ancienne route), toujours envoyés par l'assistant : sans effet, pas de migration.
- Fixtures d'Achtung et de Zone Blanche enrichies de sous-tables : l'aller-retour du contrat vérifie la stabilité de leurs ids.

## 9. Impact client

- Pas d'événement socket nouveau ni renommé.
- Réponses alignées à vérifier côté client, slug par slug au lot 3 : `GET /:id/sessions` (Cyberpunk et Delta Green renvoyaient des colonnes brutes avec `date` ; Dune, Tecumah, Vikings, Zone Blanche `gs.*`, Zone Blanche avec `character_count` : vérifier si le client les lit), `GET /` de Vikings (plus de `name` calculé ; `TableCharactersModal` s'en sert seulement en repli après `nom`), messages d'erreur de `by-code`.
- Création : un `accessCode` déjà pris donne 409 au lieu d'un code auto (Dune) ; l'assistant affiche l'erreur reçue.

## 10. Tests

Le contrat existant tourne à chaque lot. Ajouts au contrat :
- `by-code` en minuscules retrouve le personnage ;
- `POST /` avec un `accessCode` déjà pris : 409 ;
- `DELETE /:id` du compte MJ : 403 ;
- `PATCH /:id` et `DELETE /:id` présents pour tous les slugs sauf Noctis.

## 11. Lots

1. **Helpers** dans `utils/characters.js`, branchés dans les contrôleurs et routes existants (comportement inchangé, sauf F-1 et F-3).
2. **Route générique** + montage (`server.js`, `Loader`, `slugApp.js`) ; pilotes **Fabula, Vileborn, Vampire** (déjà conformes) : leur `characters.js` est supprimé.
3. **Autres slugs** un par un : Achtung, Cyberpunk, Delta Green, Dune, Tecumah, Vikings, Zone Blanche (défauts de schéma, alignement du contrôleur, client, F-2).
4. **Achtung et Zone Blanche** passent à `syncSubTable` (Q-8).

Un seul commit pour le chantier, documentation comprise (`src/server/CLAUDE.md`, `/new-slug`, `CLAUDE.md` racine : `characters.js` facultatif, contrôleur obligatoire).
