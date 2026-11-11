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
| 2026-11-10 | PNJ, lot 3 : Nimble + Maledictum (`spec_pnj.md` §8) | — | C-CRLF ×11 (fins de ligne lues dans l'index, normalisé en LF par `autocrlf`, au lieu de l'arbre de travail : fichiers gardés tels quels, slugs surtout en LF ; règle retirée le jour même) |
| 2026-11-10 | PNJ, lot 4, sous-lots 4a à 4c : Vikings, VDA, Achtung (`spec_pnj.md` §10), 2 passes | C-SPEC ×4 (Troupe seule jamais vaincue, assistance comptée sans succès du chef, dégâts VDA sans `cannotBotch`, jet Vikings à 5 Blessures) | — | 0 / 0 |
| 2026-11-10 | PNJ, lot 4, sous-lot 4d (Fabula) et retour du MJ sur Vikings (`spec_pnj.md` §10.2, §10.5), 2 passes | C-SPEC ×2 (Crise figée quand les PV changent, type de dégâts variable converti en physique) | — | 1 / 1 (malus de base repris depuis la bibliothèque, Vikings) |
| 2026-11-10 | PNJ, lot 4 : attaque en un clic et historique des jets du MJ (Achtung), 2 passes | C-SPEC (bonus de dégâts d'un groupe absent du résultat enregistré) | — | 0 / 0 |
| 2026-11-10 | Dune, Nimble, Maledictum sur la brique NpcItemList | — | — | 0 / 1 (ordre de tabulation et largeur du texte des talents de Dune : laissé tel quel, décision du MJ) |
| 2026-11-10 | Bibliothèque PNJ : boutons sur la ligne du nom, avatar en haut | — | — | 0 / 0 | 2 / 2 (résultat d'un jet caché affiché sur la fiche Maledictum, « PV par héros » remis à zéro quand un monstre Nimble n'est plus légendaire) |
| 2026-11-10 | Maledictum : écart entre les losanges de la zone d'actions | — | — | 0 / 0 |
| 2026-11-10 | Musique, bloc A : fenêtre flottante réduite qui s'ouvre vers le haut (`spec_audio.md` §14.1) | — | — | 0 / 0 |
| 2026-11-10 | Musique, bloc B : timecode des boutons (`spec_audio.md` §14.2), 2 passes | C-SPEC (timecode : `true` et `[83]` acceptés par `Number()`) | — | 3 / 4 (départ au-delà d'une durée découverte plus tard, arrondi près de la fin, champ non réconcilié après normalisation ; écartée : écriture partielle du PUT sur libellé refusé) ; récurrence C-SPEC sur la validation des nombres : nouvelle règle B-NUMBER |
| 2026-11-10 | Musique, bloc C : nouvelles sources (Vimeo, SoundCloud, Suno, fichier son, `spec_audio.md` §14.3), 2 passes | C-SPEC ×3 (autopause Vimeo et exclusivité SoundCloud qui coupaient une autre piste, `links` mal formé filtré au lieu de refusé) | — | 1 / 1 (écouteur READY du widget SoundCloud figé sur le premier chargement) |
| 2026-11-11 | Musique, complément du bloc C : Suno retiré, Google Drive et Dropbox (`spec_audio.md` §14.3 bis) | — | — | 0 / 0 |
| 2026-11-11 | Musique : retrait de la source « fichier son » (Drive bloqué par le navigateur, MP3 hébergés laissés de côté), 2 passes | C-SPEC (titres YouTube demandés avant la vérification des autres liens d'un ajout mixte) | — | ? / 1 (vérifier dans le test l'absence d'appel réseau, pas seulement le refus) |

## Décompte par identifiant

| Identifiant | Corrections | Dernière |
|---|---|---|
| C-TEST | 2 | 2026-11-08 |
| B-LOG | 1 | 2026-11-08 |
| C-SPEC | 14 | 2026-11-11 |
| F-TOKENS | 1 | 2026-11-09 |
| B-COALESCE | 2 | 2026-11-10 |
