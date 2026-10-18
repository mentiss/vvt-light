---
description: Créer un nouveau système de jeu (slug) selon les standards de la plateforme
argument-hint: <slug> [nom du système]
---

Création d'un nouveau slug : **$ARGUMENTS**

Respecte la méthode en trois phases du CLAUDE.md racine. **N'écris aucun fichier avant la fin de la phase 2 et ma validation explicite.**

## Phase 1 — Cadrage (aucun code)

1. Vérifie que le slug n'existe pas déjà dans `src/server/systems/` ni dans `src/client/src/systems/`, et cherche une spec existante `documentations/spec_<slug>.md`. Si elle existe, c'est ta base : ne repose pas les questions auxquelles elle répond déjà.
2. Demande-moi ce que tu ne sais pas encore, en une seule fois :
    - mécanique de dés (pool, seuil, d20, 2D20, PbtA…), succès, critiques, explosions ;
    - contenu de la fiche (caractéristiques, compétences, ressources, équipement, liens…) ;
    - besoins côté MJ (ressources de session, PNJ, combat) ;
    - palette de couleurs et identité visuelle ;
    - les règles de référence (lore, livre de base) si je peux te les fournir : n'invente rien qui les contredise.
3. Lis le slug de référence `fabula` (config, routes, schéma, `Sheet.jsx`, `GMApp.jsx`) pour calquer les patterns. **Ne prends pas `vikings` comme modèle** (en refonte). Lis aussi `documentations/spec_diceengine_v2.md` et `documentations/spec_combat.md` pour les contrats dés et combat.

## Phase 2 — Spécification (à faire valider)

Présente :
- le schéma SQLite du slug (tables propres seulement, bâti sur `base.sql`) ;
- les routes au-delà de `characters.js` et les éventuels handlers socket ;
- la logique des 5 hooks de dés et du bloc combat ;
- l'arborescence des composants et le découpage de la fiche.

Expose les choix ouverts avec leurs avantages et inconvénients, et donne ta recommandation. Une fois validée, la spec est enregistrée (ou mise à jour) dans `documentations/spec_<slug>.md`.

## Phase 3 — Implémentation

Fichiers à créer (aucun fichier hors de ces dossiers ne doit être modifié, la découverte est automatique) :

**Backend**
- `src/server/systems/<slug>/config.js` — `{ slug, label, dbPath, schemaPath, generateAccessUrl? }`
- `src/server/systems/<slug>/routes/characters.js`
- `database-template/<slug>-schema.sql`

**Frontend** (`src/client/src/systems/<slug>/`)
- `config.jsx`, `Sheet.jsx`, `GMApp.jsx`, `Creation.jsx`
- `components/layout/` pour les sections de fiche, `components/modals/` pour les modales
- `gm/tabs/TabSession.jsx`

## Checklist des standards obligatoires

Vérifie chaque point avant d'annoncer la fin, et coche-les dans ton récapitulatif :

- [ ] Schéma bâti sur `database-template/base.sql`, aucune table partagée redéfinie ; `characters` avec `login_attempts`, `last_attempt_at`, `last_accessed`, colonne `avatar` (pas `avatar_url`).
- [ ] `config.jsx` : bloc `diceConfigDefault` aux couleurs du slug.
- [ ] `config.jsx` : les 5 hooks (`buildNotation`, `beforeRoll`, `afterRoll`, `buildAnimationSequence`, `renderHistoryEntry`) + bloc `combat`.
- [ ] `roll()` exploité comme renvoyant le résultat d'`afterRoll()` ; `buildNotation` appelé dans le composant.
- [ ] `AccessCodeModal` intégré : `saveFullCharacter` mappe `accessCode → access_code`, entrée présente dans le menu hamburger de `Sheet.jsx`.
- [ ] `DiceHistoryPage` importé depuis `../../components/layout/DiceHistoryPage.jsx`, props `sessionId` et `renderHistoryEntry` uniquement.
- [ ] Pas d'indirection `GMApp.jsx → gm/GMView.jsx`.
- [ ] UPDATE avec COALESCE ; `saveFullCharacter` en transaction avec `_syncSubTable` pour les sous-tables.
- [ ] Routes spécifiques déclarées avant les génériques ; `GET /characters` public.
- [ ] Fiche mise à jour par HTTP uniquement (`broadcastCharacterUpdate` côté serveur) ; `character-full-update` laissé au générique. Si des ressources de session sont nécessaires, le choix socket (pattern dune, dette connue) ou HTTP est tranché en phase 2.
- [ ] Routes personnage : `authenticate, requireOwnerOrGM` en lecture/écriture, `requireGM` en suppression.
- [ ] Classes CSS générées uniquement, mode sombre via `data-theme`, pas de `<select>` ni de checkbox.
- [ ] Textes d'interface en français, code en anglais ; casse des noms de fichiers cohérente avec les imports.
- [ ] `cd src/client && npm run lint` et `npm run build` passent.