# Tests serveur : contrat des routes

> Statut : **validée et implémentée** (2026-11-01). Premier lot : routes `/characters` de tous les slugs.

## 1. Objectif

Sécuriser les livraisons : chaque slug répond aux routes que la plateforme appelle, avec les mêmes droits et les mêmes garanties d'écriture. Le contrat tourne à chaque `npm run release` (sauté en `--fast`).

## 2. Fonctionnement

- Vitest à la racine (`npm test`, `vitest.config.mjs`), dossier `tests/server/`.
- `tests/server/helpers/slugApp.js` monte le **routeur réel** du slug sur une petite app Express, sans `server.js` : base SQLite **en mémoire** créée depuis `schemaPath`, `req.db` / `req.system` injectés comme `systemResolver`, faux `io` qui enregistre les diffusions, jetons signés par `utils/jwt` avec le secret de test (`tests/server/setup.js` ; le `.env` n'est jamais lu).
- Les slugs sont découverts par le `Loader` : un nouveau slug est testé d'office.
- Chaque slug fournit `tests/server/systems/<slug>/fixture.js` :

```js
export default {
    create: { playerName: 'Joueur test', nom: 'Personnage test' }, // corps minimal de POST /
    edit:   { field: 'nom', value: 'Nom modifié' },                // champ de l'envoi partiel
};
```

Un corps de création avec des sous-tables remplies (comme `fabula`) rend l'aller-retour et l'envoi partiel plus probants.

## 3. Contrat `/characters`

| Route | Exigence |
|---|---|
| `POST /` | publique ; 201 ; renvoie la fiche avec `id`, `accessCode`, `accessUrl` |
| `GET /` | publique ; jamais le compte MJ (`id -1`) ; chaque entrée a `id`, `accessCode`, `accessUrl`, `playerName`, `avatar` |
| `GET /by-url/:url`, `GET /by-code/:code` | publiques ; 404 si inconnu ; code insensible à la casse |
| `POST /` avec `accessCode` déjà pris | 409 (route commune ; un slug qui remplace `POST /` n'y est pas soumis) |
| `GET /:id` | 401 sans jeton, 403 pour un autre joueur, 200 propriétaire et MJ, 404 si inconnu |
| `PUT /:id` | 401 sans jeton, 403 pour un autre joueur, 404 si inconnu |
| `GET /:id/sessions` | liste les tables du personnage |
| `PUT /:id` (écriture) | **aller-retour** : renvoyer la fiche chargée ne change rien, ids des sous-tables compris ; **envoi partiel** : seul le champ envoyé change ; diffuse `character-full-update { characterId }` vers `${slug}_session_${id}` de chaque table |
| `PATCH /:id` | présente (route commune) ; 401 sans jeton, 403 pour un autre joueur |
| `DELETE /:id` | présente (route commune) ; 403 pour un joueur et pour le compte MJ (`id -1`), 404 si inconnu ; le MJ supprime |

Depuis la route commune (`spec_characters_route.md`), le banc monte la même pile que `server.js` : `routes/characters.js` du slug s'il existe, puis la route commune.

Champs ignorés dans les comparaisons : `updatedAt`, `lastAccessed` (et leurs formes snake_case).

## 4. Premier passage et correctifs (2026-11-01)

Tous les slugs passent le contrat après ces correctifs :

| Slug | Défaut trouvé | Correctif |
|---|---|---|
| fabula | envoi partiel destructeur (colonnes en assignation directe, sous-tables effacées puis réinsérées) | `FLAT_COLUMNS` en COALESCE, `_syncSubTable`, route `PATCH /:id` |
| noctis | envoi partiel en erreur 500 (`Missing named parameter "prenom"`), sous-tables effacées même absentes, pas de transaction | même normalisation que fabula (colonnes snake_case), transaction |
| cyberpunk | `schemaPath` vers `cyberpunk-schema.sql`, fichier nommé `cyberpunk-schemal.sql` ; compte MJ inséré avant `game_sessions` (clé étrangère) | fichier renommé ; insertion du MJ déplacée après `game_sessions` |
| deltagreen | `schemaPath` vers `deltagreen-schema.sql`, fichier nommé `deltagreen.sql` | fichier renommé |
| achtung | schéma sans `character_weapons.effect`, `character_spells.flawed`, `characters.spellcaster_practice` (ajoutées en prod par migration) | colonnes reportées dans le schéma |
| dune | schéma sans `avatar`, `prenom`, `sexe`, `age`, `taille`, `poids`, `motto` (utilisées par le code) ; `DELETE /:id` sans `authenticate`, donc refusé même au MJ ; `avatar` absent de la liste | colonnes ajoutées au schéma ; `authenticate` ajouté ; `avatar` dans la liste |
| tecumah | `avatar` absent de la liste | ajouté |
| vikings, zoneblanche | — | — |

Les défauts de schéma ne touchaient pas les bases existantes : ils empêchaient de **créer une base neuve** pour le slug (nouvelle installation, VPS réinstallé). Les correctifs portent sur les schémas seulement, sans migration, en supposant que les bases en service ont déjà ces colonnes (les fiches en jeu les utilisent).

Les slugs autres que fabula n'ont qu'un corps de création minimal : leurs aller-retour portent sur une fiche sans sous-table. À enrichir quand on touche un slug.
