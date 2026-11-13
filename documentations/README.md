# Documentation du VTT

Point d'entrée de la documentation : où trouver quoi, et l'état de chaque spec. Les règles du code sont ailleurs (`code-rules/`, `CLAUDE.md`, `AGENTS.md`).

## Par où commencer

| Besoin | Lire |
|---|---|
| Ce qui reste à faire | [`backlog.md`](backlog.md) (et ce qui est livré : [`backlog_fait.md`](backlog_fait.md)) |
| Créer un système de jeu | [`process/guide_new_slug.md`](process/guide_new_slug.md), puis la commande `/new-slug` pour un agent |
| Travailler sur un slug | sa spec dans `slugs/<slug>/` (tableau plus bas) |
| Travailler sur une brique commune (PNJ, tableau, dés, menus…) | sa spec dans `plateforme/` |
| Mettre en prod, relire, tester | `process/` |

## Rangement

```
documentations/
  README.md            ce fichier
  backlog.md           todo
  backlog_fait.md      archive des items en prod
  slugs/<slug>/        spec du slug, règles, transcriptions, catalogues ; planches/ (hors Git)
  plateforme/          specs des briques communes ; planches/ (hors Git sauf anciennes)
  process/             méthode et outillage
  archives/            documents dépassés, gardés pour l'historique
```

Conventions :
- une nouvelle spec se range dans son dossier et s'ajoute à ce fichier ; un document dépassé part dans `archives/` ;
- les fichiers ont été rangés le 2026-11-12 **sans être renommés** : un chemin `documentations/spec_x.md` resté dans un commentaire est périmé, le nom du fichier suffit à le retrouver. Le chantier qui touche un fichier corrige ses chemins ; les noms irréguliers s'harmonisent avec le chantier du slug concerné ;
- les planches (`planche_*.html`), leurs images et les originaux générés restent hors Git (`.gitignore`) ; celles qui étaient déjà suivies le restent.

## Slugs

| Slug | Système | Documents |
|---|---|---|
| `achtung` | Achtung! Cthulhu | `spec_achtung_cthulhu.md` |
| `callofcthulhu` | Call of Cthulhu 7e (Chaosium) | `spec_chaosium_cthulhu.md` : **à valider**, slug pas encore créé |
| `cyberpunk` | The Sprawl (PbtA) | `spec_cyberpunk.md` (refonte, en prod) ; règles du jeu : `sprawl_cyberpunk_fonctionnel_specs.md` |
| `deltagreen` | Delta Green | `spec_deltagreen.md` |
| `dune` | Dune: Adventures in the Imperium | `spec_dune.md` (refonte, en prod) ; `transcription_talents_atouts.md` |
| `fabula` | Fabula Ultima | `spec_fabula.md` (refonte, en prod) ; règles de table (écrites par le MJ de Fabula, priment sur le livre) : `specifications_fonctionnelles_fabula_ultima.md`, `fabula_ultima_conception_des_objets_rare.md` ; onglet Référence : `spec_fabula_reference.md` |
| `maledictum` | Imperium Maledictum (W40K) | `spec_maledictum.md` (en prod) ; `format_catalogues.md`, `demandes_images.md` |
| `nimble` | Nimble 3.x | `spec_nimble.md` (en prod) ; `format_catalogues.md` |
| `noctis` | Noctis Solis (Vermine 2047) | `spec_noctissolis.md` : refonte en attente (changement de système) |
| `tecumah` | Tecumah Gulch (D6) | `spec_tecumah_gulch.md` |
| `tins` | There Is No Spoon | `spec_TINS.md` : **à valider**, slug pas encore créé |
| `vikings` | Pure Vikings | `spec_vikings.md` (règles et refonte) ; état actuel : `spec_vikings_pierre_peinte.md` ; historique de la première refonte : `spec_vikings_lot2_serveur.md`, `spec_vikings_lot3_client.md` (dépassé en partie), `spec_vikings_lot4_graphisme.md` ; `demandes_images.md` |
| `vileborn` | Vileborn (kit d'initiation) | `spec_vileborn.md`, `spec_vileborn_defis.md` (en prod) ; transcriptions du kit et des prétirés |
| `woddavampire` | Vampire : l'Âge des Ténèbres V20 | `spec_woddavampire.md` (en prod) ; `annexe/` : catalogues source des scripts `scripts/woddavampire/` |
| `zoneblanche` | Zone Blanche (2D20) | `spec_regles_zone_blanche.md` |

## Plateforme

| Spec | Sujet | État |
|---|---|---|
| `spec_audio.md` | Musique de la table (façon Watch2Gether) | en prod ; évolutions notées |
| `spec_browser_storage.md` | Stockage navigateur (`usePersistedState`) | en prod |
| `spec_characters_route.md` | Route `/characters` commune | en prod |
| `spec_composition_table.md` | Composition d'une table en temps réel | en prod |
| `spec_correctifs_audit.md` | Correctifs de l'audit de novembre 2026 (connexion, limiteur, droits…) | en prod |
| `spec_diceengine_v2.md` | Moteur de dés, historique des jets | en prod |
| `spec_genmap.md` | Générateur de plans de bâtiments (`/tools/plans`) | prototype, en cours |
| `spec_initiative.md` | Initiative : tours et actions | en prod (v5.25.0) |
| `spec_journal.md` | Journal (notes, messages, objets du MJ) | en prod ; refonte (Privé / Partagé) codée, à tester par le MJ (parties II et III) |
| `spec_plateforme_accueil.md` | Pages communes et marques des slugs | en prod |
| `spec_pnj.md` | PNJ de la plateforme | en prod (v5.23.0) ; Cyberpunk, Delta Green, Tecumah à venir |
| `spec_session_bar.md` | Barre de session des joueurs | en prod |
| `spec_session_mj.md` | Session MJ : hook des personnages de la table, outils de table | validée ; lots 1 et 2 faits, pas encore en prod |
| `spec_performance.md` | Performance du chargement : couleurs par Tailwind (`tokens.css`, fin du générateur), `preconnect` des polices | validée ; lots 1 et 3 faits, pas encore en prod |
| `spec_tableau.md` | Tableau partagé | v1 et v2 (lots A à C) en prod ; lot D à venir |
| `spec_tables.md` | Tables actives (plusieurs tables par slug) | en prod (v5.25.0) |
| `spec_ui_actions.md` | Zone d'actions, panneau d'historique | en prod |
| `spec_ui_catalogue.md` | Modale de catalogue | en prod |
| `spec_ui_menu.md` | Menus joueur et MJ | en prod |
| `spec_ui_modales.md` | Modales habillables | en prod |
| `spec_ui_panneaux.md` | Fenêtres flottantes | en prod |
| `spec_ui_reference.md` | Aide de jeu (référence des règles) | en prod |

Planches (`plateforme/planches/`) : UI kits de la refonte de la plateforme (`UIkit_*.html`, `brand-*.css`), audio, initiative, PNJ, tables, icônes du tableau.

## Process

| Document | Sujet |
|---|---|
| `guide_new_slug.md` | Créer un slug : fichiers, contrats, organisation, standards, checklist |
| `spec_arborescence_client.md` | Rangement de `src/client/src` (règle F-TREE) |
| `spec_grilles_relecture.md` | Grilles de règles `code-rules/` |
| `spec_relecture.md` | Relecture croisée par Codex (`/relecture`) |
| `spec_release.md` | Mise en production (`npm run release`, `/release`) |
| `spec_tests_serveur.md` | Tests serveur : contrat des routes |

## Archives

| Document | Pourquoi archivé |
|---|---|
| `archi-multijdr.md` | Architecture d'origine, dépassée (référence actuelle : les `CLAUDE.md`) |
| `guide_new_slug_jdr.md` | Ancien guide, remplacé par `process/guide_new_slug.md` |
| `audit_code_2026-11.md` | Audit local de novembre 2026 (hors Git), traité par `spec_correctifs_audit.md` |
