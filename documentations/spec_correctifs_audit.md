# Correctifs de l'audit de novembre 2026

> Statut : **validée** (2026-11-08), implémentée. Ticket 3 sur 3 après l'audit (`audit_code_2026-11.md`, local). Premier chantier relu par `/relecture`.
> Ce fichier n'est commité qu'avec les correctifs : il décrit des défauts ouverts.

## 1. Périmètre

Les défauts réels relevés par l'audit, vérifiés un par un dans le code, plus les deux tests serveur reportés du ticket 1 (droits des routes, conformité des schémas). Hors périmètre, comme décidé : noctis, combat et PNJ de la plateforme (§9, Q3).

## 2. Questions

| # | Question | Ma reco | Réponse |
|---|---|---|---|
| Q1 | Les routes de purge de l'historique (`DELETE /dice/history/session/:id` et `DELETE /dice/history`) : l'audit les disait inutilisées, c'est **faux**. C'est le bouton « Tout effacer » de l'historique des jets (`DiceHistoryList`), visible aussi des joueurs. On garde le comportement actuel (tout utilisateur connecté) ? | Oui : `authenticate` sur les trois routes de suppression, comme tu l'as dit pour la suppression d'un jet. Restreindre « Tout effacer » au MJ serait un changement fonctionnel, à décider à part. | |
| Q2 | `ON DELETE` divergents de `base.sql` dans des bases **en service** : `dice_history.character_id` en `SET NULL` (cyberpunk, dune) au lieu de `CASCADE`. Les aligner demande une migration qui reconstruit la table. On aligne, ou on documente l'écart ? | Documenter : supprimer un personnage garde ses jets, anonymes, au lieu de les effacer. Ce n'est pas un bug, et reconstruire une table de prod pour ça est un risque sans gain visible. La règle B-FK note l'exception, le test de schéma la connaît. | |
| Q3 | Le test « droits des routes » parcourt toutes les routes d'écriture. Celles du combat et des PNJ n'ont pas d'authentification, et ils sont hors périmètre. On les exclut du test, ou on y ajoute `authenticate` maintenant ? | Exclure leurs fichiers du test, avec la mention « refonte en attente » : le combat de Vikings appelle ses routes par `fetch` direct (sans jeton), ajouter `authenticate` le casserait sans qu'on le teste. La règle s'appliquera à leur refonte. Même chose pour noctis. | |

## 3. Connexion (`routes/auth.js`, `middlewares/rateLimits.js`)

**Défaut 1, connexion sans code.** `POST /auth/login` ne vérifie le code que s'il est fourni : avec l'URL du MJ et sans code, il rend un jeton MJ.
- Le code devient obligatoire : absent ou vide → 400, faux → 401 (et compté comme tentative).
- Seul appelant côté client : `CodeModal`, qui envoie toujours le code. Rien ne change pour les joueurs.

**Défaut 2, limiteur inopérant.** La date de la dernière tentative est comparée à une chaîne, la comparaison est toujours fausse.
- Comparaison en millisecondes (B-DATE). `last_attempt_at` est écrit par `CURRENT_TIMESTAMP` (UTC, sans fuseau) : il se lit comme une date UTC.
- Comportement attendu, inchangé sur le fond : 5 échecs en moins de 15 minutes → 429 ; au-delà de 15 minutes, compteur remis à zéro ; une connexion réussie le remet à zéro.

## 4. Historique des jets (`routes/dice.js`)

**Défaut 3.** Les trois routes de suppression n'ont aucune authentification. Elles prennent `authenticate` (Q1). Le client passe déjà par `fetchWithAuth`.

Ajout à l'implémentation : `POST /dice/roll` n'avait pas non plus d'authentification (trouvé par le test des droits). Tous ses appelants (moteur de dés, Fabula, Vileborn) passent par `fetchWithAuth` : il prend `authenticate`.

## 5. Cyberpunk (`systems/cyberpunk/routes/characters.js`)

**Défaut 4, `statKey` interpolé.** `PATCH /:id/xp` met dans le SQL une clé venue du client.
- Liste blanche des caractéristiques du jeu : `cran`, `pro`, `chair`, `esprit`, `style`, `synth`. Toute autre clé → 400.
- `statDelta` doit être un entier.
- Les écritures de la route (XP, caractéristique, manœuvre, tag) passent dans une transaction (B-TX).

**Défaut 7 (cyberpunk), fiche non diffusée.** `PATCH /:id/resources` et `PATCH /:id/xp` diffusent la fiche (`broadcastCharacterUpdate`), comme les autres routes de fiche.

## 6. Delta Green (`systems/deltagreen/routes/characters.js`)

**Défaut 7 (deltagreen).** `POST /:id/san-loss` et `POST /:id/evolve` diffusent la fiche.

Constat à l'implémentation : le défaut 7 était masqué. Après ces routes, le client cyberpunk et le client deltagreen appellent `onCharacterUpdate`, dont le `PUT` diffuse la fiche. La diffusion ajoutée suit la règle B-BROADCAST et fait voir le changement au MJ sans attendre le `PUT`.

## 7. Écritures partielles

**Défaut 6.**
- `tecumah/CharacterController.js` et `deltagreen/CharacterController.js` : `age` passe en `COALESCE`, comme les autres colonnes. Un envoi partiel ne l'efface plus (un âge vidé, `''`, s'enregistre toujours).
- `routes/sessions.js`, `PUT /:id` : `name`, `date`, `notes` en `COALESCE`. Un nom fourni vide → 400 (le nom est obligatoire). Le client (`TableManagementModal`) envoie le formulaire complet : rien ne change pour lui.

## 8. Logs (`server.js`)

**Défaut 8.** Le log de chaque requête masque le segment qui suit `/by-code/` et `/by-url/` (`/characters/by-code/***`). Les autres chemins sont inchangés.

## 9. Schémas (`database-template/`)

Comparaison faite pour chaque slug : `base.sql`, schéma du slug créé en mémoire, base de dev (lecture seule, qui reflète la prod). **Les bases en service sont saines** : ce sont les schémas qui ont dérivé. Corriger un schéma ne touche que les bases neuves (réinstallation, tests) : **aucune migration**, sauf mention.

| Slug | Écart du schéma | Correctif |
|---|---|---|
| dune | `game_sessions` sans `date` ni `notes` ; `dice_history` à l'ancien format (`dice_notation`, `result`, `details`) | Tables reprises de la base en service (= `base.sql`, plus `description` et `is_active` de `game_sessions` et `id` de `session_characters`, présents en base). |
| tecumah | `character_journal` à l'ancien format (`content`, `is_public`, `session_id` en `CASCADE`) | Table reprise de `base.sql` (la base en service a déjà été migrée, `19032026_make_tecumah_journal_ok.sql`). |
| deltagreen | pas de compte MJ `id = -1` | Ligne MJ ajoutée comme dans les autres schémas (la base en service l'a déjà). |
| cyberpunk | `character_journal.body` en `NOT NULL` (la base en service ne l'a pas) | Aligné sur la base en service. |

Écarts **documentés, pas corrigés** (Q2) :
- `dice_history.character_id` en `SET NULL` (cyberpunk, dune) ;
- différences de type sans effet : `is_read BOOLEAN` au lieu de `INTEGER`, `notation` sans `NOT NULL`, `type` en `NOT NULL` (cyberpunk) ;
- colonnes en plus propres au slug : `session_characters.pf_depenses` (fabula), `game_sessions.description` / `is_active`, `session_characters.id` (dune).

## 10. Vite (`src/client/vite.config.js`)

**Défaut 9.** `minifier: 'terser'` n'existe pas (Vite 7 : `minify`). Le build est minifié par esbuild, et `drop_console` est ignoré. Correctif : `minify: 'terser'`. Effet en prod : les `console.*` disparaissent du bundle, comme prévu à l'origine.

## 11. Tests

Contrats ajoutés (`tests/server/`) :
- **Connexion** : sans code → 400 ; code faux → 401 ; 5 échecs → 429 ; tentative de plus de 15 minutes → compteur remis à zéro ; MJ avec son code → jeton MJ.
- **Historique** : suppression sans jeton → 401.
- **Cyberpunk** : `statKey` hors liste → 400, base inchangée ; avancement valide → fiche diffusée.
- **Sessions** : `PUT` partiel → les champs absents gardent leur valeur.
- **Droits des routes** (reporté du ticket 1) : pour chaque routeur partagé et de slug, toute route `POST`/`PUT`/`PATCH`/`DELETE` porte `authenticate` (route ou `router.use`), sauf les routes publiques de B-AUTH-USER ; fichiers exclus : combat, PNJ, noctis (Q3).
- **Schémas** (reporté du ticket 1) : chaque schéma de slug, créé en mémoire, a les colonnes et les `ON DELETE` des tables de `base.sql` (colonnes en plus permises, écarts de Q2 listés), les colonnes obligatoires de `characters` et la ligne `id = -1`.

Les règles B-AUTH-USER, B-SCHEMA-SHARED et B-FK (`ON DELETE`) passent en contrôle « test » dans `code-rules/back.md` ; B-FK note l'exception de Q2. B-AUTH-GM et B-AUTH-OWNER restent à la relecture : le test vérifie qu'une connexion est exigée, pas quel rôle.

## 12. Fichiers touchés

- `src/server/routes/auth.js`, `src/server/middlewares/rateLimits.js`, `src/server/routes/dice.js`, `src/server/routes/sessions.js`, `src/server/server.js`
- `src/server/systems/cyberpunk/routes/characters.js`, `src/server/systems/deltagreen/routes/characters.js`
- `src/server/systems/tecumah/CharacterController.js`, `src/server/systems/deltagreen/CharacterController.js`
- `database-template/dune-schema.sql`, `tecumah-schema.sql`, `deltagreen-schema.sql`, `cyberpunk-schema.sql`
- `src/client/vite.config.js`
- `tests/server/` : nouveaux tests (§11)
- `code-rules/back.md` (contrôles, exception B-FK)
