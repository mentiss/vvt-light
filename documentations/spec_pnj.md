# PNJ de la plateforme : refonte

Statut : **phase 1 (diagnostic)**, questions ouvertes au §4. Rien n'est codé.

## 1. Demande

Refaire et finaliser le système de PNJ de la plateforme. Pour chaque slug, il doit permettre de :

- stocker, créer et modifier des PNJ utilisables par ce slug ;
- tenir une fiche avec une partie commune (nom, occupation, avatar…) et une partie propre au système de jeu ;
- lancer les dés depuis la fiche selon le système, ou pas du tout quand le MJ ne lance pas de dés (Cyberpunk).

Contraintes :

- **Générique** : treize systèmes aux règles différentes.
- **S'inspirer de Maledictum** (onglet Rencontre).
- **Pas de compatibilité exigée avec les défis de Vileborn.**
- **Compatible avec deux chantiers futurs**, hors périmètre ici : la refonte du combat, et la gestion plateforme des rounds, des tours et de l'initiative.

## 2. Existant

### 2.1 Plateforme

| Élément | État |
|---|---|
| Route `/npc` (`src/server/routes/npc.js`), table `npc_templates` | CRUD de modèles : `name`, `description`, `combat_stats` (JSON), `system_data` (JSON). **Aucun `requireGM`.** |
| Route `/npc-sets`, tables `npc_sets`, `npc_set_entries` | Groupes de modèles (avec quantité), liés ou non à une table. **Aucun `requireGM`.** |
| Montage | Les deux routes sont montées pour **tous** les slugs (`Loader.js`, `server.js`), même quand leur base n'a pas les tables. |
| Schémas | `npc_templates` est complet dans `vikings-schema.sql` seulement. Il est **tronqué** dans `tecumah-schema.sql` (pas de `description`, `system_data`, `updated_at` : un `INSERT` de la route échoue sur une base Tecumah neuve). `npc_sets` n'est dans aucun schéma. |
| Migrations | `28022026_add_npc_templates.sql` et `22032026_npc_sets.sql`, sans en-tête `-- systems:`. Jouées quand seuls Vikings, Dune et Tecumah existaient : les slugs créés depuis (Cyberpunk, Delta Green, Achtung, Fabula, Zone Blanche, VDA, Vileborn, Nimble, Maledictum, Noctis) n'ont très probablement **aucune** de ces tables en prod. |
| `TabNPC.jsx` (1 022 lignes) + `NPCCard`, `NPCSetCard` | Onglet générique Bibliothèque / Sets. Contrat : bloc `npc` de la config (`renderNPCForm`, `buildNPCData`, `parseNPCData`, `renderNPCSummary`, `renderNPCDetail`, `getQuickRolls`). **Seul Dune l'utilise.** Emojis dans les onglets, `console.log` laissé. |
| `NPCModal.jsx`, `NPCAttackModal.jsx` | Bibliothèque de modèles et attaque de PNJ **pour le combat** (bloc `combat` de la config). Utilisés par Vikings et Tecumah. Les instances de PNJ vivent en mémoire serveur, dans l'état du combat (`combatState.js`). |

### 2.2 Par slug

| Slug | PNJ aujourd'hui | Où c'est rangé | Jet MJ existant |
|---|---|---|---|
| vikings | Combat seulement (`NPCModal`) ; `config/npcs.js` est du code mort | `npc_templates` | `GMDiceModal` : réserve de d10, seuil, explosion |
| tecumah | Combat seulement (`NPCModal`, `TecumahNPCForm`) | `npc_templates` (tronquée) | `GMDiceModal` : D6 + Wild Die, difficulté |
| dune | Onglet PNJ = `TabNPC` (compétences, principes) | `npc_templates`, `npc_sets` | `DuneGMRollModal` : 2d20, rang, difficulté |
| maledictum | Onglet Rencontre : bestiaire statique, PNJ ajoutés à la rencontre, blessures suivies, jets d100 en un clic | navigateur, par table | via `useMlRoll` (valeur cible) |
| nimble | Onglet Rencontre : bestiaire statique ou monstre libre, PV, sbires groupés, attaques en un clic | navigateur, par table | via `useNbRoll` |
| vileborn | Défis (hors sujet ici, mais même schéma « bibliothèque en base → copie à la table ») | tables du slug | dé d'obscurité |
| cyberpunk | Menaces (impulsion, actions) dans l'onglet Opération | tables du slug | **aucun** (le MJ ne lance pas) |
| woddavampire | Aucun (spec M-10 : « PNJ et combat hors périmètre ») | — | `VdaGmDiceModal` : réserve, difficulté |
| zoneblanche | Aucun | — | `ZoneBlancheGMDiceModal` (pensée « pour un PNJ ») |
| achtung | Aucun | — | `GMDiceModal` : cible, difficulté, d20 |
| deltagreen | Aucun (hooks PNJ du combat à `null`) | — | dés libres seulement |
| fabula | Aucun | — | dés libres seulement |
| noctis | Hors périmètre (refonte du slug en attente) | — | — |

### 2.3 Ce qu'on retient

1. **Deux notions mélangées** : le *modèle* (la fiche en bibliothèque) et l'*instance* (« Garde 2 » qui a pris 3 blessures dans cette scène). L'ancien code les sépare mal : les modèles sont en base et les instances seulement dans le combat. Maledictum et Nimble ont fait l'inverse : instances seulement, gardées dans le navigateur. Le combat et l'initiative futurs ont besoin d'**instances** : c'est sur elles qu'on suit les PV et qu'on place un tour de jeu.
2. **Les jets se lancent déjà par slug** : chaque slug a sa modale MJ ou son hook de jet. Le générique n'a qu'à demander au slug « quels jets propose ce PNJ » et lui déléguer le lancement.
3. **Bestiaires statiques** (Maledictum, Nimble, bientôt d'autres) : une fiche en base doit pouvoir **naître d'une entrée de catalogue** (copiée, puis modifiable), comme les défis de Vileborn.
4. **L'existant se jette presque entier** : `TabNPC`, `npc_sets`, les cartes. Seuls `NPCModal` et `NPCAttackModal` restent, parce que le combat de Vikings et de Tecumah les utilise et que le combat est hors périmètre.

### 2.4 Décisions déjà prises (2026-11-09)

- **Table rase.** Le code et les données de l'ancien système sont jetables : il n'a pas vraiment servi.
  - On supprime `TabNPC`, `NPCCard`, `NPCSetCard`, les routes `/npc` et `/npc-sets`, et les tables `npc_templates`, `npc_sets` et `npc_set_entries`.
  - Les données Dune ne sont pas reprises (réponse à P-10).
  - **Le combat de la plateforme part aussi** (lot 0, §5). Il n'est pas utilisé : Tecumah sert peu, et le MJ de Vikings ne s'en sert plus. Le garder imposerait sa propre notion de PNJ au nouveau système et au futur gestionnaire de rounds et de tours, qui reprendra le besoin en plus léger.
- **Les tables PNJ vont dans `base.sql`.** Tout slug, présent ou futur, les a dans sa base, même s'il n'utilise pas la fonction. Les migrations futures en sont simplifiées. Une migration `-- systems: all` les crée dans les bases existantes.

## 3. Pistes (à trancher au §4)

- **Une table `npcs` dans `base.sql`**, présente dans toutes les bases.
  - Colonnes communes : prénom, nom, occupation, avatar (même format que `characters.avatar`, même `AvatarUploader`), description, notes du MJ, étiquettes, source (clé de catalogue d'origine, facultative).
  - Plus un JSON opaque `system_data`, propre au slug.
  - Migration `-- systems: all`.
- **Instances prévues dès maintenant, pas forcément construites.** Une table `session_npcs` (PNJ présents à une table) : copie de la fiche au moment de l'ajout, état courant en JSON opaque (PV, blessures…), nom d'instance, et une place pour l'initiative.
  - Le futur gestionnaire de rounds et le combat refondu liraient cette table au lieu d'inventer leurs propres PNJ.
  - Elle remplacerait aussi le stockage navigateur de Maledictum et Nimble.
- **Contrat slug (bloc `npc` de `config.jsx`), tout facultatif.** Sans bloc, la fiche commune seule fonctionne, ce qui suffit déjà pour Fabula ou Cyberpunk en v1.
  - `Form` : partie système du formulaire.
  - `Sheet` : partie système de la fiche.
  - `getRolls(npc)` : jets proposés.
  - `roll(npc, rollKey)` : lancement, par le hook ou la modale du slug.
  - `catalogue` : entrées importables.
  - `initialState(npc)` : état d'une instance.
- **Briques plutôt qu'un gros onglet** : hook `useNpcs` (CRUD), bibliothèque (liste, recherche, filtres, fondée sur `CatalogModal` ou ses principes), cadre de fiche et cadre de formulaire (partie commune + emplacement du slug). Chaque slug assemble son onglet et garde sa disposition.
- **Routes** : `/npc` réécrite sur `npcs`, écritures **et lectures** réservées au MJ.
  - L'ancienne route reste en place, sous un autre nom, tant que le combat de Vikings et de Tecumah l'utilise.

## 4. Questions

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                      |
|---|---|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P-1 | Périmètre de ce chantier : la **bibliothèque** seule (créer, modifier, consulter, lancer les dés depuis la fiche), ou aussi les **PNJ à la table** (instances avec leur état : PV, blessures) ? | Bibliothèque **et** instances à la table. Sans instances, Maledictum et Nimble garderaient leur stockage navigateur, et le futur gestionnaire de rounds n'aurait rien sur quoi s'appuyer. L'initiative et le combat restent hors périmètre : on leur laisse seulement la place. | les deux                                                                                                                                                                                                                        |
| P-2 | Identité commune : quels champs ? | Prénom, nom (deux champs, comme les PJ), occupation, avatar, description (ce que les joueurs peuvent savoir), notes du MJ (secrètes), étiquettes libres (« Harkonnen », « Acte 2 ») pour trier. Les créatures sans prénom (« Loup ») mettent tout dans le nom. | Oui ça me semble pas mal                                                                                                                                                                                                        |
| P-3 | Les **sets** de l'ancien système (groupes de PNJ avec quantité) : on les garde ? | Non. Les étiquettes trient la bibliothèque. « Ajouter 4 Gardes à la table » se fait à l'ajout (quantité, numérotation automatique, comme dans Maledictum). | On peut ne pas garder pour l'instant l'idée de set, et le ré-introduire dans une amélioration du système si on veut plus tard                                                                                                   |
| P-4 | Bestiaires statiques (Maledictum, Nimble) : comment s'articulent-ils avec la bibliothèque en base ? | Le catalogue du slug reste en code. « Créer depuis le bestiaire » copie l'entrée dans la base, où elle devient modifiable. Ajouter un PNJ à la table peut aussi partir directement du bestiaire, sans passer par la bibliothèque. | Je pense qu'il faut tout basculer sur le système de NPC une fois qu'on l'a fait. Avoir une double base dont une statique c'est de la merde.                                                                                     |
| P-5 | Maledictum et Nimble basculent-ils sur la brique dans ce chantier (fin du stockage navigateur) ? | Oui, si P-1 est retenu : ce sont les deux slugs qui ont déjà un vrai besoin, et ils valident la généricité. Les rencontres en cours dans le navigateur sont perdues (on te prévient avant la release). | Ils basculent dans un lot propre à eux je pense non ?                                                                                                                                                                           |
| P-6 | Quels slugs reçoivent leur **partie système** (formulaire, fiche, jets) dans ce chantier ? | Lot plateforme et pilotes : Dune (migre son onglet PNJ), Maledictum, Nimble. Ensuite, un lot par slug, chacun avec ses questions de règles : Vikings, Tecumah, Zone Blanche, Achtung, VDA, Delta Green, Fabula, Cyberpunk (menaces ?). Noctis reste hors périmètre. Entre-temps, l'onglet PNJ peut s'ouvrir partout avec la seule fiche commune. |                                                                                                                                                                                                                                 |
| P-7 | Jets depuis la fiche : boutons en un clic (Maledictum : la valeur est connue, on lance), ou ouverture de la modale MJ du slug préremplie (Dune) ? | Au choix du slug, par jet : un clic quand tout est connu, modale préremplie quand il reste une difficulté ou des dés de Menace à choisir. La plateforme n'impose rien, elle affiche la liste que donne `getRolls`. | au choix du slugs je dirais mais possiblement un système qui permet de cacher tous les jets de NPC si c'est du oneclick non ? Après à voir comment on gère tout ça, ça mérite une bonne réflexion pour pas faire n'importe quoi |
| P-8 | Cyberpunk : ses **menaces** deviennent-elles des PNJ ? | Non. Une menace n'est pas un PNJ (c'est souvent une corpo ou un lieu), et l'onglet Opération marche. Un PNJ Cyberpunk = fiche commune + éventuellement un lien vers sa menace, sans jets. À rediscuter au lot Cyberpunk. | Non, un PNJ n'est pas forcément une menace, c'est la même chose avec Vileborn, un défi n'est pas forcément un PNJ, ce sont des systèmes distincts                                                                               |
| P-9 | Montrer un PNJ aux joueurs (portrait et description) ? | Hors v1. Le tableau partagé sait déjà afficher une image. Le lien jeton ↔ PNJ du tableau (Q-18 de `spec_tableau.md`) se fera quand la bibliothèque existera. | Hors du chantier initial en effet                                                                                                                                                                                               |
| P-10 | Données Dune en prod (`npc_templates`, `npc_sets`) : on les migre vers `npcs` ? | Oui, par la migration (compétences et principes recopiés dans `system_data`, sets abandonnés). À confirmer : y a-t-il des PNJ Dune en prod qui valent d'être gardés ? | Non : table rase, rien n'est repris (2026-11-09)                                                                                                                                                                                |
| P-12 | `NPCModal` et `NPCAttackModal` servent au combat de **Vikings et Tecumah** (ajout et attaque d'un PNJ en combat, via l'ancienne route `/npc`). Les supprimer avec le reste retire les PNJ de ces deux combats jusqu'à la refonte du combat. | Garder ces deux modales et leur route (renommée, avec sa table) jusqu'à la refonte du combat, puis tout supprimer à ce moment-là. Sinon, accepter que les combats Vikings et Tecumah perdent leurs PNJ en attendant. | **Sans objet** : le combat de la plateforme est supprimé avec l'ancien système de PNJ (lot 0, §5). Son besoin passe au futur gestionnaire de rounds et de tours, en plus léger (2026-11-09)                                     |
| P-11 | Disposition de l'onglet : bibliothèque et table côte à côte (liste à gauche, fiche à droite), ou deux sous-onglets ? | Planche HTML avant de coder, avec deux variantes et des données réelles de Dune et Maledictum. | Planche et on voit                                                                                                                                                                                                              |

## 5. Lot 0 : dégagement (validé le 2026-11-09)

Un commit à part, avant les lots PNJ. On supprime l'ancien système de PNJ **et** le combat de la plateforme, pour partir d'un terrain propre.

- **Serveur** :
  - routes `combat.js`, `npc.js`, `npc-sets.js`, et leur montage (`Loader.js`, `server.js`) ;
  - `utils/combatState.js`, et le code de combat qui reste dans le serveur.
- **Briques client** :
  - `components/combat/` ;
  - `components/gm/npc/` ;
  - `CombatantCard`, `CombatantControls`, `AttackValidationQueue` ;
  - hooks `useAttackFlow`, `useDefenseOpportunity` ;
  - `components/gm/tabs/TabNPC.jsx`.
- **Slugs** :
  - Vikings : onglet Combat du MJ, `useCombat`, panneau de combat de la fiche, `config/npcs.js` ;
  - Tecumah : onglet Combat, `TecumahNPCForm` ;
  - Dune : onglet PNJ et ses composants (il revient avec la nouvelle brique) ;
  - blocs `combat` des configurations.
- **Base** :
  - migration `-- systems: all` qui supprime `npc_templates`, `npc_sets`, `npc_set_entries` (`DROP TABLE IF EXISTS`) ;
  - tables retirées des schémas de Vikings et de Tecumah.
- **Doc** :
  - `spec_combat.md` et `spec_combat_suite.md` supprimées ;
  - `CLAUDE.md`, grilles et specs de slug qui citent le combat ou `/npc` mis à jour.
