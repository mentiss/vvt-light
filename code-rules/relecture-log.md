# Journal des relectures

Une ligne par relecture croisée (`/relecture`, `documentations/spec_relecture.md`). Sert à voir quelles règles sont ratées à l'écriture : un identifiant qui atteint trois corrections appelle une amélioration (règle mieux placée ou mieux écrite, contrôle mécanique, habitude de code).

| Date | Chantier | Corrections (identifiants) | Contestées | Suggestions retenues / proposées |
|---|---|---|---|---|
| 2026-11-08 | Grilles de règles (ticket 1 : `useFetch`, lint, `Loader.js`) | — | — | 3 / 4 (exceptions du lint au plus juste, `F-STORAGE` précisé, `md:dark:`) |
| 2026-11-08 | Correctifs de l'audit (ticket 3), 2 passes | C-TEST ×2, B-LOG, C-SPEC | — | 6 / 7 (date vidable, jet de création Fabula hors historique, tests indépendants, remise à zéro du limiteur, clés étrangères manquantes, échec en transaction) ; B-AUTH-GM précisée |
| 2026-11-08 | Purge des jetons de rafraîchissement expirés à la connexion | — | — | 0 / 0 |
| 2026-11-08 | Nettoyage du code mort de l'audit | non relu (quota) | — | — |
| 2026-11-08 | Vileborn : défis, lot A | non relu (quota) | — | — |
| 2026-11-08 | Vileborn : défis, lot B (versement des fiches) | non relu (quota) | — | — |
| 2026-11-08 | Modales des slugs vers `Modal` (`spec_ui_modales.md` §12) | — | — | 0 / 0 |
| 2026-11-09 | PNJ, lot 0 : suppression de l'ancien PNJ et du combat de la plateforme (`spec_pnj.md` §5) | — | — | ? / 1 (branches `isNPC` des dés Tecumah) |
| 2026-11-09 | Historique des jets, passe générique (`spec_diceengine_v2.md`, « Passe générique ») | F-TOKENS | — | 0 / 0 |
| 2026-11-10 | PNJ, lot 2 : plateforme + Dune (`spec_pnj.md` §6, §7), 2 passes | B-COALESCE ×2, C-SPEC | — | 6 / 6 (ordre des migrations, réponses tardives et échec du PATCH dans `useNpcs`, formulaire sans clé, responsive de l'onglet, rechargement des PNJ du tableau) |

## Décompte par identifiant

| Identifiant | Corrections | Dernière |
|---|---|---|
| C-TEST | 2 | 2026-11-08 |
| B-LOG | 1 | 2026-11-08 |
| C-SPEC | 2 | 2026-11-10 |
| F-TOKENS | 1 | 2026-11-09 |
| B-COALESCE | 2 | 2026-11-10 |
