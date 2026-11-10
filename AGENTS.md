# AGENTS.md

Consignes pour les agents autres que Claude Code (Codex…) qui travaillent sur ce dépôt.

## Projet

VTT (table de jeu virtuelle) multi-systèmes pour les tables de JDR de l'auteur, une quinzaine de joueurs au plus. Chaque système de jeu est un module autonome appelé **slug**, avec sa base SQLite, ses routes et ses composants. Stack : React 19 + Vite, Tailwind v4 · Node.js / Express, SQLite (better-sqlite3) · Socket.io.

Le contexte complet (architecture, slugs actifs, commandes, environnement) est dans `CLAUDE.md` à la racine, puis `src/client/CLAUDE.md` et `src/server/CLAUDE.md`. Lis-les : ils s'adressent à Claude Code mais valent pour toi.

## Règles du code

Le référentiel des règles est dans `code-rules/` :
- `code-rules/common.md` : mode d'emploi (règle / préférence, exceptions, contrôles) et règles communes ;
- `code-rules/front.md` : `src/client/` ;
- `code-rules/back.md` : `src/server/`, `database-template/`, `scripts/`, `tests/server/`.

Chaque règle a un identifiant (`F-STORAGE`, `B-AUTH-GM`…) : cite-le quand tu t'y réfères. Les « choix assumés » listés en tête des grilles ne sont pas des écarts.

## Specs

Les spécifications validées sont dans `documentations/` (`spec_<slug>.md`, `spec_<brique>.md`). Elles portent les choix fonctionnels et les règles de jeu. En cas d'écart technique entre une spec et le code, le code fait foi.

## Consignes de base

- **Aucune commande Git qui modifie l'état** (`add`, `commit`, `stash`, `checkout`, `reset`, `restore`…). Lecture seule : `status`, `diff`, `log`, `show`.
- Ne lis jamais `.env` et n'en affiche jamais le contenu ; ne lis pas les bases `*.db`.
- Fins de ligne : pas une remarque de relecture (C-CRLF retirée, `core.autocrlf=true` normalise l'index).
- Interface en français, code (identifiants, fichiers, props) en anglais.
- Réponds en français.
