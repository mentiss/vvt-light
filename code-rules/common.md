# Grille commune

Règles du code qui valent partout, front comme back. Elles sont lues par celui qui écrit le code (Claude, via `CLAUDE.md`) et par celui qui le relit (Codex, via `AGENTS.md`). Spec : `documentations/spec_grilles_relecture.md`.

## Mode d'emploi

- **Règle** : un écart est une **correction**, faite sans arbitrage.
- **Préférence** : un écart est accepté s'il est justifié par un commentaire d'exception. Sans justification, le relecteur le remonte en **suggestion**.
- **Commentaire d'exception**, qui cite toujours l'identifiant :
  - règle vérifiée par le lint : `// eslint-disable-next-line vtt/F-CONTROLS -- raison` ;
  - règle relue seulement : `// relecture: B-AUTH-USER — raison`.
- **Contrôle** : `lint` (ESLint du front), `test` (Vitest serveur), `relecture` (relecteur seul).
- Une grille ne contient que ce qui se vérifie dans le code. Les principes de travail (méthode, sur-ingénierie, mécaniques gérées à la table, doc à jour) sont dans les `CLAUDE.md`.
- Un identifiant ne change jamais. Une règle abandonnée est marquée « retirée », pas renumérotée.
- Une règle qui fait débat est une règle mal écrite : on la précise ici, on ne passe pas en force.
- Chaque relecture croisée (`/relecture`) est notée dans `code-rules/relecture-log.md` : un identifiant qui revient trois fois appelle une amélioration de la règle ou de la façon de coder.

Grilles par domaine : `code-rules/front.md` (`src/client`), `code-rules/back.md` (`src/server`, `database-template`, `scripts`, `tests/server`).

## Règles

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| C-SCOPE | Règle | Le diff ne touche que ce que demande le chantier : pas de réécriture complète non demandée, pas de lignes modifiées sans rapport. | Des fichiers sont aussi modifiés à la main ; un diff ciblé se relit et se reprend. | relecture |
| C-SPEC | Règle | Le code respecte la spec validée du slug ou de la brique (`documentations/`) ; aucune règle de jeu absente de la spec n'est inventée. En cas d'écart technique (chemin, colonne, props), le code fait foi et l'écart se signale. | Les specs portent les choix validés avec le MJ. | relecture |
| C-TEST | Règle | Toucher une règle de calcul ou un contrat de route ajoute ou met à jour son test. Front : fonctions pures seulement, dans `src/client/tests/` en miroir de `src/client/src/`, imports Vitest explicites. Serveur : contrat de route dans `tests/server/`. | Les tests suivent ce qu'on touche, sans campagne de rattrapage. | relecture |
| C-SECRET | Règle | Aucun secret dans le code ni dans les logs ; `.env` n'est jamais lu ni affiché. | Le dépôt et les logs ne sont pas des coffres. | relecture |
| C-SLUG-ISOLATED | Règle | Ajouter un slug ne modifie aucun fichier hors de ses dossiers (`src/server/systems/<slug>/`, `src/client/src/systems/<slug>/`, son schéma, ses migrations, ses tests, sa doc). Un slug ne s'appelle pas `platform`. | Zéro registre central : le Loader découvre les slugs seul. | relecture |
| C-DEAD | Préférence | Pas de code mort laissé derrière soi : fichier ou export plus importé, bloc commenté, prop ignorée, écouteur d'un événement jamais émis. | Le code mort se relit, se maintient et trompe. | relecture |
| C-SIZE | Préférence | Un fichier de logique (pas un catalogue de données) de plus de 800 lignes se signale, avec une proposition de découpage. | Au-delà, un fichier se relit mal et se patche mal. | relecture |

Retirées à la validation (principes, pas des règles du code) : C-LANG, C-DOC, C-OVERENG. Retirée le 2026-11-10 : C-CRLF (fins de ligne). Le dépôt est en `core.autocrlf=true` : l'index est normalisé en LF, un changement de fins de ligne ne ressort ni dans le diff ni dans le commit, et le dépôt est déjà mixte.
