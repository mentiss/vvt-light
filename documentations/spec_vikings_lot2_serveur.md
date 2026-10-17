# Refonte Vikings — Lot 2 : serveur et base de données

## Statut

**Validée par le MJ le 2026-10-17** (phase 2 du lot 2 ; questions T-1 à T-3 tranchées comme proposé). Spec fonctionnelle de référence : `documentations/spec_vikings.md` (décisions D-, Q-, R-). Décisions de diagnostic du lot 2 : L-1 à L-4 validées le 2026-10-17 (§9).

Objectif : aligner le serveur et la base du slug `vikings` sur les slugs récents (`zoneblanche`, `fabula`) **sans perte de données**, et garder l'application utilisable à la fin du lot (adaptation minimale du client, L-1).

Hors périmètre : règles métier (restent côté client, comme dans les autres slugs), nouvelles fonctions MJ, refonte graphique, système de combat.

---

## 1. État constaté (DEV et copie de PROD, lecture seule)

- Les deux bases ont **le même schéma**, différent de `database-template/schema.sql` (fichier jamais tenu à jour).
- `dice_history.character_id` et `roll_type` sont `NOT NULL` (migration `11032026_remove_notnull_history_vikings.sql` jamais appliquée) → **les jets du MJ (`character_id` NULL) ne sont pas enregistrés** : la route générique `dice` échoue en silence.
- `characters.access_code` n'est pas `UNIQUE` (aucun doublon dans les deux bases).
- Pas de colonne `nom` (exigée par `base.sql`) ; `nom_parent` à la place.
- Le compte MJ `id = -1` existe dans les deux bases, mais **`schema.sql` ne l'insère pas** : une base neuve n'aurait pas de MJ.
- Noms de compétences : 3 noms de l'app diffèrent du vault (R-1) — voir §3.4.
- `GET /characters` renvoie le compte MJ ; `PUT` sans transaction, sous-tables effacées puis réinsérées, pas de `COALESCE`, `accessCode` jamais sauvegardé ; pas de `PATCH` ; diffusion globale `io.emit('character-light-update')` en plus des rooms.

---

## 2. Schéma cible : `database-template/vikings-schema.sql`

Remplace `schema.sql` (supprimé, T-1) ; `systems/vikings/config.js` → `schemaPath` pointe sur le nouveau fichier. Utilisé uniquement à la création d'une base neuve.

### 2.1 Tables partagées
`game_sessions`, `refresh_tokens`, `dice_history`, `character_journal`, `session_characters` : **copie conforme de `base.sql`** (colonnes, contraintes, index et noms d'index). En particulier `dice_history.character_id` et `roll_type` acceptent `NULL`.

### 2.2 `characters`
Colonnes plateforme **identiques à `base.sql`** (`id`, `access_code` UNIQUE NOT NULL, `access_url` UNIQUE NOT NULL, `player_name` NOT NULL, `avatar`, `nom` NOT NULL DEFAULT '', `prenom`, `sexe`, `age`, `taille`, `poids`, `login_attempts`, `last_attempt_at`, `last_accessed`, `created_at`, `updated_at`), avec deux exceptions assumées :
- `sexe` garde `CHECK (sexe IN ('homme','femme'))` (D-17 ; `NULL` reste accepté, pour le compte MJ) ;
- `prenom` reste **nullable** comme dans `base.sql` ; l'obligation est vérifiée par la route de création (T-2).

Colonnes Vikings :

| Colonne | Type | Défaut | Note |
|---|---|---|---|
| `surnom` | TEXT | — | |
| `activite` | TEXT | — | métier |
| `force`, `agilite`, `perception`, `intelligence`, `charisme`, `chance` | INTEGER | 2 | 1 à 5 |
| `armure` | INTEGER | 0 | |
| `actions_disponibles` | INTEGER | 1 | |
| `seuil_combat` | INTEGER | 1 | |
| `saga_actuelle` | INTEGER | **1** | était 3 (D-11) |
| `saga_totale` | INTEGER | **1** | légende cumulée (D-10) |
| `tokens_blessure` | INTEGER | 0 | 0 à 5 |
| `tokens_fatigue` | INTEGER | 0 | 0 à 10 (D-2) |

`nom` contient le **nom du parent** ; l'affichage « fils de / fille de » est fait par le client (D-17, Q-3).

Index (noms de `base.sql`) : `idx_characters_access_code`, `idx_characters_access_url`, `idx_characters_updated_at`.

Compte MJ, comme les autres schémas : `INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, prenom, nom) VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'MJ', '')`.

### 2.3 Sous-tables Vikings (inchangées)
- `character_skills` (`skill_name`, `specialization`, `level`, `current_points`, UNIQUE `(character_id, skill_name, specialization)`) ;
- `character_traits` (`trait_name`, UNIQUE `(character_id, trait_name)`) ;
- `character_runes` (`rune_name`, `level`, UNIQUE `(character_id, rune_name)`) ;
- `character_items` (`name`, `category`, `quantity`, `location`, `notes`, `weapon_type`, `damage`, `range`, `armor_value`, `requirements` JSON, `custom_item`) ;
- `npc_templates` (utilisée par la route partagée `npc`).

Toutes avec `ON DELETE CASCADE` vers `characters` et un index sur `character_id` ; **ajout de `idx_items_character`** (manquant).

---

## 3. Migration : `database-template/migrations/17102026_vikings_refonte_schema.sql`

Appliquée par `npm run migrate 17102026_vikings_refonte_schema.sql --system=vikings` : le script désactive les clés étrangères puis exécute tout dans **une transaction** (annulée en cas d'erreur). Lignes référencées par sous-SELECT, jamais par id en dur.

### 3.1 `characters` (reconstruction)
SQLite ne sait ni ajouter `UNIQUE` ni renommer avec changement de contrainte par `ALTER` : création d'une table `characters_new` au schéma cible (§2.2), copie, suppression de l'ancienne, renommage.
- `nom` ← `COALESCE(nom_parent, '')` (Q-3, R-6) ;
- `saga_totale` ← `MAX(saga_totale, saga_actuelle)` (R-4) ;
- toutes les autres colonnes copiées telles quelles, ids conservés (les sous-tables et sessions continuent de pointer dessus).
- Si deux personnages avaient le même `access_code`, la contrainte `UNIQUE` fait échouer la copie et **toute la migration est annulée** (vérifié : aucun doublon en DEV ni en PROD).

### 3.2 `dice_history` (reconstruction)
Même procédure vers le schéma de `base.sql` (`character_id` et `roll_type` nullables). **Toutes les lignes sont conservées**, anciens jets compris (L-2) ; ils ne seront simplement plus affichés.

### 3.3 Index des tables partagées
Les index aux anciens noms (`idx_dice_character`, `idx_sessions_access_code`, `idx_refresh_tokens_character`…) sont remplacés par ceux de `base.sql`, et les index manquants créés (`idx_journal_updated_at`, `idx_session_characters_*`, `idx_game_sessions_*`). But : une base migrée et une base neuve ont **exactement la même structure**.

### 3.4 Noms de compétences (R-1)

| Ancien nom (app) | Nouveau nom (vault, annexe A) |
|---|---|
| `Combat CàC armé` | `Combat CàC (armé)` |
| `Combat CàC non armé` | `Combat CàC (non armé)` |
| `Combat à distance` | `Combat distance` |

`UPDATE` simple. La contrainte UNIQUE `(character_id, skill_name, specialization)` ferait échouer la migration si un personnage possédait déjà la même compétence sous les deux noms avec la même spécialisation : cas vérifié avant application (§6).

### 3.5 Divers
- `CREATE INDEX IF NOT EXISTS idx_items_character` ;
- compte MJ : `INSERT OR IGNORE` (déjà présent dans les deux bases, sans effet).

---

## 4. Contrôleur : `systems/vikings/CharacterController.js`

Renommé avec majuscule comme les autres slugs (`characterController.js` → `CharacterController.js` ; attention à la casse sous Linux).

### `loadFullCharacter(db, id)`
Même forme de réponse qu'aujourd'hui (camelCase), avec :
- `nom` au lieu de `nomParent` ;
- un **`id` sur chaque compétence, trait et rune** (les objets l'avaient déjà), nécessaire à `_syncSubTable` (L-3).

### `saveFullCharacter(db, id, data)`
- **Transaction** (`BEGIN` / `COMMIT` / `ROLLBACK`).
- `UPDATE characters` en **`COALESCE`** sur toutes les colonnes à plat : un champ absent du corps n'est pas écrasé (permet le `PATCH`). `accessCode` → `access_code`.
- Sous-tables `skills`, `traits`, `runes`, `items` synchronisées par **`_syncSubTable`** (même helper que `deltagreen`) : entrée avec `id` → mise à jour, sans `id` → insertion, absente du tableau → suppression. Un tableau absent du corps laisse la sous-table intacte.
- Retourne `loadFullCharacter(db, id)`.
- Pas de règle métier côté serveur (plafond SAGA, gains, triple 10 : côté client, comme les autres slugs).

---

## 5. Routes : `systems/vikings/routes/characters.js`

| Méthode | Route | Accès | Changement |
|---|---|---|---|
| GET | `/` | public | **exclut le compte MJ** ; renvoie `nom` au lieu de `nomParent` ; garde les champs actuels (`name`, SAGA, tokens…) |
| GET | `/by-url/:url` | public | inchangé |
| GET | `/by-code/:code` | public | inchangé (code mis en majuscules) |
| GET | `/:id/sessions` | propriétaire ou MJ | inchangé (déclarée avant `/:id`) |
| GET | `/:id` | propriétaire ou MJ | inchangé |
| POST | `/` | public | `playerName` et `prenom` obligatoires ; **code choisi par le joueur conservé mais vérifié unique → 409 si déjà pris** (L-4), sinon code généré ; insertion minimale puis `saveFullCharacter` |
| PUT | `/:id` | propriétaire ou MJ | via `saveFullCharacter` ; diffusion **par room de session uniquement** |
| PATCH | `/:id` | propriétaire ou MJ | **nouveau**, même traitement que PUT avec un corps partiel (pour `patchImmediate`, lot 3) |
| POST | `/:id/avatar` | propriétaire ou MJ | **nouveau**, aligné sur `zoneblanche` |
| DELETE | `/:id` | MJ | **refuse `id = -1` (403)** |

Diffusion : helper `broadcastCharacterUpdate` → `character-full-update { characterId, character }` vers `vikings_session_${sessionId}` pour chaque session du personnage. **Suppression de `io.emit('character-light-update')`** (global, contraire aux règles ; doublon de `character-full-update`). Aucun nouvel événement socket.

---

## 6. Vérification avant application

Sur des **copies** des bases de DEV et de PROD (jamais sur les originaux), par un script ponctuel hors dépôt :
1. contrôles préalables : doublons de `access_code`, collisions de noms de compétences après renommage ;
2. application de la migration avec le runner réel (`runMigrationOnSystem`) ;
3. **même structure** qu'une base neuve créée depuis `vikings-schema.sql` (colonnes, contraintes, clés étrangères, index — comparés par `PRAGMA`) ;
4. **aucune perte** : nombre de lignes identique par table, ids des personnages conservés, `nom` = ancien `nom_parent`, `saga_totale ≥ saga_actuelle`, aucun ancien nom de compétence restant ;
5. `PRAGMA integrity_check` et `foreign_key_check` vides.

Résultats reportés au MJ avant toute application réelle.

---

## 7. Adaptation minimale du client (L-1)

Seulement ce qu'il faut pour que l'app actuelle continue de marcher avec le nouveau contrat :

| Fichier | Changement |
|---|---|
| `src/tools/data.js` | les 3 noms de compétences (§3.4), et la clé `requiresSkill` de *Virtuose de l'arc* |
| `src/tools/utils.js` | `SPECIALIZABLE_SKILLS` et `getSkillExamples` aux nouveaux noms ; `formatFullName` lit `nom` au lieu de `nomParent` |
| `systems/vikings/components/modals/PostureModal.jsx` | liste des compétences de parade/esquive : `Combat CàC (armé)`, `Combat CàC (non armé)` (les entrées « Esquive » et « Parade », qui n'existent pas, disparaissent) |
| `systems/vikings/Creation.jsx`, `Sheet.jsx` | champ `nomParent` → `nom` |

Aucun appel client ne change de verbe HTTP dans ce lot : le `PATCH` est exposé, la bascule vers `patchImmediate` se fait au lot 3. Les ids renvoyés pour les sous-tables sont conservés naturellement par le client (il renvoie les objets reçus).

---

## 8. Procédure de mise en production (pour mémoire)

1. Arrêter l'application (`pm2 stop`) ;
2. **sauvegarder** `database/pure-vikings.db` (et ses fichiers `-wal` / `-shm`) ;
3. déployer le code du lot 2 ;
4. `npm run migrate 17102026_vikings_refonte_schema.sql --system=vikings` ;
5. redémarrer (vide aussi le cache de nom de personnage de `getCharNameExpr`).

---

## 9. Décisions du diagnostic (validées le 2026-10-17)

| # | Sujet | Décision |
|---|---|---|
| L-1 | Livraison du lot 2 seul | Le lot inclut l'adaptation minimale du client (§7) : l'app reste utilisable entre les lots. |
| L-2 | Anciens jets | Conservés en base, non affichés. |
| L-3 | Sous-tables | Ids renvoyés pour toutes les sous-tables, `_syncSubTable` partout. |
| L-4 | Code choisi à la création | Conservé, unicité vérifiée (erreur si déjà pris). |

## 10. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| T-1 | Supprimer `database-template/schema.sql` une fois remplacé ? | Oui : seul Vikings l'utilise, son nom générique et son contenu périmé prêtent à confusion. | Oui |
| T-2 | `prenom` : garder `NOT NULL` en base (comme aujourd'hui) ou suivre `base.sql` (nullable) avec contrôle à la création ? | Suivre `base.sql`, contrôle dans la route. | Suivre `base.sql` |
| T-3 | Le script de vérification de migration (§6) : le garder hors dépôt ou l'ajouter au projet ? | Hors dépôt : il est ponctuel, propre à cette migration. | Hors dépôt |
