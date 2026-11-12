# PNJ de la plateforme : refonte

Statut : phase 1 close (décisions au §4.1). Lot 0 fait (§5). Phase 2 (§6) et lot 1 (planche, version 5) validés le 2026-11-09. Lot 2 (plateforme + Dune) implémenté et commité le 2026-11-10 (§7.3). Lot 3 (Maledictum, Nimble) implémenté et commité le 2026-11-10 (§8.2). Lot 4 (Vikings, VDA, Achtung, Fabula) : spécification validée et implémentée le 2026-11-10 (§10). Restent hors chantier : Cyberpunk, Delta Green, Tecumah, Zone Blanche ; second versement VDA (PNJ mortels du livre, p.382-395).

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
- **Routes** : nouvelle route `/npcs` sur la table `npcs`, écritures **et lectures** réservées au MJ (l'ancienne route `/npc` est supprimée, lot 0).

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

### 4.1 Ce que les réponses décident (2026-11-09)

- **P-1** : bibliothèque **et** PNJ présents à la table (instances avec leur état). L'initiative et le combat restent hors chantier, on leur laisse la place.
- **P-2** : identité commune retenue : prénom, nom, occupation (devenue « rôle ou nature » pour couvrir monstres et animaux, §6.2), avatar, description, notes du MJ, étiquettes.
- **P-3** : pas de sets en v1. On pourra les réintroduire plus tard.
- **P-4** : **une seule source, la base.** Les bestiaires statiques (Maledictum, Nimble) sont versés dans la table `npcs`, puis les fichiers de catalogue disparaissent. La clé `catalogue` du contrat slug (§3) tombe.
- **P-5** : Maledictum et Nimble basculent chacun dans **leur propre lot**.
- **P-7** : le slug choisit la façon de lancer chaque jet (un clic ou fenêtre préremplie). Le MJ veut aussi pouvoir **cacher les jets des PNJ** : voir P-15.
- **P-8** : PNJ, menaces (Cyberpunk) et défis (Vileborn) sont **des systèmes distincts**. Un PNJ Cyberpunk n'a que la fiche commune, sans jets et sans lien vers une menace.
- **P-9** : montrer un PNJ aux joueurs est hors du chantier initial.
- **P-11** : planche HTML avant de coder.

### 4.2 Questions ouvertes par les réponses

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| P-6 | (sans réponse) Ordre des lots ? | **Lot 1, plateforme** : tables `npcs` et `session_npcs`, route `/npcs`, briques (bibliothèque, fiche, formulaire, PNJ à la table), fiche commune seule. **Lot 2, Dune** : pilote de la partie système (compétences, principes, jets 2d20), il retrouve son onglet PNJ. **Lot 3, Maledictum** et **lot 4, Nimble** : bestiaire versé en base, onglet Rencontre basculé (P-5). Ensuite, un lot par slug à la demande. | Pas un lot par slug, regrouper. Un premier lot = la planche, avant tout le reste (2026-11-09). Nouvelle proposition : P-19 |
| P-13 | Bestiaires versés en base (P-4) : comment ? | Comme les défis de Vileborn : les profils sont écrits dans une migration **et** dans le schéma du slug (une base neuve les a aussi), avec leur source et leur page. Ce sont ensuite des PNJ comme les autres, que le MJ modifie ou supprime. Les variantes de Maledictum (« basé sur ») sont versées complètes, sans héritage. | Deux migrations : d'abord la structure (identique pour tous les slugs, `-- systems: all`), puis une migration de données par slug, limitée à ce slug (2026-11-09) |
| P-14 | Lot 1 : l'onglet PNJ apparaît-il tout de suite dans **tous** les slugs (fiche commune seule, sans jets), ou seulement au lot de chaque slug ? | **Au lot de chaque slug.** Ajouter un onglet aux 13 interfaces MJ d'un coup, sans partie système, donne une fiche à moitié vide qu'il faudra reprendre partout. Le lot 1 se teste sur Dune, qui suit immédiatement. | Ouvert : on ne veut peut-être pas la fonction partout. À débattre slug par slug (2026-11-09). Avis validé : **oui** pour Dune, Maledictum, Nimble, Vikings, VDA, Achtung, Delta Green, Tecumah, Zone Blanche ; **à voir** au lot 4 pour Fabula et Cyberpunk ; **non** pour Vileborn (les défis tiennent ce rôle) et Noctis (refonte en attente) |
| P-15 | Jets cachés (P-7) : comment ? | Un réglage dans l'onglet PNJ, **Jets des PNJ : Publics / Cachés**, gardé par table dans le navigateur. Un jet caché ne part ni dans l'historique ni chez les joueurs : seul le MJ le voit, comme le dé d'obscurité de Vileborn (`persistHistory: false`). La plateforme transmet le réglage au jet du slug, qui le respecte qu'il lance en un clic ou par sa fenêtre. || Reco validée (2026-11-09) |
| P-16 | Un PNJ ajouté à la table est-il une **copie** de sa fiche, ou un **renvoi** vers la bibliothèque ? | **Une copie**, comme les défis de Vileborn. Modifier ou supprimer une fiche de la bibliothèque ne change pas un PNJ déjà en scène. L'état propre à l'instance (PV, blessures, notes) vit dans la copie. || Reco validée (2026-11-09) |
| P-17 | Durée de vie des PNJ à la table ? | Une liste par table. Ils y restent jusqu'à ce que le MJ les retire, un par un ou par « Vider ». Pas de notion de scène ni de rencontre nommée en v1 : elle viendra si besoin, avec les sets (P-3). | Oui : instantané. On ajoute des PNJ, ils sont disponibles aussitôt et vivent jusqu'à leur retrait de la vue. Les scènes, ce seront peut-être les sets, plus tard (2026-11-09) |
| P-18 | Avatar du PNJ ? | Même format et même outil que les PJ : image recadrée par `AvatarUploader`, stockée dans la fiche. Sans image, les initiales, comme les jetons du tableau. | Oui. Peut-être aussi les icônes game-icons (P-20). Les jetons du tableau doivent permettre de poser un PNJ ou un monstre avec son avatar, comme un PJ (P-21) (2026-11-09) |
| P-19 | Lots regroupés (P-6) ? | **Lot 1, planche** de l'onglet PNJ (bibliothèque, fiche, PNJ à la table), sur des données réelles de Dune et de Maledictum. **Lot 2, plateforme + Dune** : tables, route, briques, jetons du tableau (P-21), et Dune en pilote de la partie système. **Lot 3, bestiaires** : Maledictum et Nimble ensemble (bestiaires versés en base, onglets Rencontre basculés). **Lot 4, les autres slugs** retenus en P-14, en un seul lot. || Reco validée (2026-11-09) |
| P-20 | Avatar en icône game-icons ? | **Oui, en troisième choix** : image, ou icône de la bibliothèque avec sa couleur, ou initiales. Le sélecteur du tableau (`IconPicker`) sert tel quel. Ça coûte peu et convient bien aux créatures et aux sbires, qui n'ont pas de portrait. || Reco validée (2026-11-09) |
| P-21 | Jeton de PNJ au tableau (« comme un PJ ») : on pose quoi, et d'où ? | Depuis le menu « Ajouter » du tableau, **les PNJ présents à la table** (pas toute la bibliothèque) : le jeton montre leur avatar, ou leur icône, ou leurs initiales, comme un PJ. Si le PNJ est retiré de la table, le jeton reste avec son nom et ses initiales (rien ne casse au tableau). Dans le lot 2. || Reco validée (2026-11-09) |

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
- Fait le 2026-11-09, commit `3fa31bc`.

## 6. Spécification (phase 2, à valider)

### 6.1 Lots

| Lot | Contenu |
|---|---|
| 1 | **Planche** HTML interactive de l'onglet PNJ (bibliothèque, fiche, formulaire, PNJ à la table, avatar), données réelles de Dune et de Maledictum, jour et nuit. Rien n'est codé avant sa validation. |
| 2 | **Plateforme + Dune** : tables, route `/npcs`, briques, jetons du tableau (P-21), Dune en pilote de la partie système. |
| 3 | **Bestiaires** : Maledictum et Nimble, bestiaires versés en base (une migration de données par slug), onglets Rencontre basculés sur les briques, fichiers de bestiaire supprimés. |
| 4 | **Les autres slugs** : Vikings, VDA, Achtung, Delta Green, Tecumah, Zone Blanche ; Fabula et Cyberpunk à trancher à ce moment-là (P-14). |

### 6.2 Données (`base.sql`, migration de structure `-- systems: all`)

**`npcs`** : la bibliothèque du MJ. « PNJ » est le nom du concept : une fiche peut aussi bien être un monstre, un animal ou une entité (MJ, 2026-11-09). Les champs communs restent donc neutres : pas de prénom obligatoire, un « rôle ou nature » plutôt qu'une occupation, et l'icône pour les créatures sans portrait.

| Colonne | Type | Rôle |
|---|---|---|
| `id` | INTEGER PK | |
| `prenom` | TEXT | facultatif (créatures : tout dans `nom`) |
| `nom` | TEXT NOT NULL | « Loup », « Cyber-molosse », « Vorian » |
| `role` | TEXT | rôle ou nature : « Marchand d'eau », « Bête », « Démon mineur » |
| `description` | TEXT | ce que les joueurs peuvent savoir |
| `gm_notes` | TEXT | notes secrètes du MJ |
| `tags` | TEXT JSON `[]` | étiquettes libres, pour trier |
| `avatar` | TEXT | image recadrée (data URL, comme `characters.avatar`) |
| `icon` | TEXT JSON | `{ icon, color }` de la bibliothèque game-icons, si pas d'image (P-20) |
| `source`, `page` | TEXT, INTEGER | origine d'un profil versé (livre, page) ; vide pour un PNJ créé par le MJ |
| `system_data` | TEXT JSON `{}` | partie système, opaque pour la plateforme |
| `created_at`, `updated_at` | DATETIME | |

**`session_npcs`** : les PNJ présents à une table (instantané, P-16, P-17).

| Colonne | Type | Rôle |
|---|---|---|
| `id` | INTEGER PK | |
| `session_id` | INTEGER NOT NULL → `game_sessions(id)` ON DELETE CASCADE | une table supprimée emporte ses PNJ |
| `npc_id` | INTEGER → `npcs(id)` ON DELETE SET NULL | origine, pour information seulement |
| `name` | TEXT NOT NULL | nom à la table (« Garde 2 ») |
| `sheet` | TEXT JSON | copie de la fiche au moment de l'ajout (identité, avatar, icône, `system_data`) |
| `state` | TEXT JSON `{}` | état propre au slug (PV, blessures…), opaque |
| `notes` | TEXT | notes du MJ sur cette instance |
| `sort_order` | INTEGER | ordre d'affichage |
| `created_at` | DATETIME | |

Pas de colonne d'initiative : le futur gestionnaire de rounds l'ajoutera par sa propre migration, la table est faite pour la recevoir. *(2026-11-11 : finalement inutile, l'initiative d'un PNJ vit dans l'état de la brique Initiative, en mémoire du serveur, `spec_initiative.md` §7.1 et §9.3 ; aucune colonne ajoutée.)* Pas de socket : les PNJ ne vivent que côté MJ ; le tableau lit ce dont il a besoin par sa route (§6.5).

### 6.3 Route `/api/:slug/npcs` (routeur partagé, monté pour tous les slugs)

Toutes les routes : `authenticate, requireGM` (lecture comprise).

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/` | bibliothèque complète, triée par nom |
| POST | `/` | créer (`nom` obligatoire) |
| PUT | `/:id` | modifier (champs non fournis conservés, B-COALESCE) |
| DELETE | `/:id` | supprimer (les instances à la table restent, P-16) |
| GET | `/sessions/:sid` | PNJ de la table |
| POST | `/sessions/:sid` | ajouter `{ npcId, quantity }` : copies numérotées (« Garde », puis « Garde 2 »… si le nom est déjà pris à la table), `state` initial fourni par le client (contrat slug `initialState`) |
| PATCH | `/sessions/:sid/:id` | modifier `name`, `state`, `notes`, `sort_order` |
| DELETE | `/sessions/:sid/:id` | retirer un PNJ de la table |
| DELETE | `/sessions/:sid` | vider la table |

Dupliquer une fiche se fait côté client (lecture puis `POST`). Tests de contrat dans `tests/server/routes/npcs.test.js`.

### 6.4 Contrat du slug (bloc `npc` de `config.jsx`, tout facultatif)

```js
npc: {
    defaults:     () => ({ ... }),            // system_data d'une nouvelle fiche
    Form:         ({ value, onChange }) => …, // partie système du formulaire
    Sheet:        ({ npc, state, onStateChange, hiddenRolls }) => …, // partie système de la fiche ; state absent en bibliothèque
    summary:      (npc) => 'Élite · Armure 4', // une ligne dans les listes
    initialState: (npc) => ({ wounds: 0 }),    // état d'une nouvelle instance
}
```

- Sans bloc `npc` : fiche commune seule, sans jets (Cyberpunk, si retenu).
- **Les jets restent au slug** : sa `Sheet` pose ses boutons et lance comme il veut (un clic par son hook, ou sa fenêtre préremplie). La plateforme lui passe seulement `hiddenRolls` (P-15) : un jet caché part avec `persistHistory: false`.
- Le réglage « Jets des PNJ : Publics / Cachés » est gardé par table dans le navigateur (`usePersistedState`, portée `tableScope`).

### 6.5 Briques client

- Hooks : `useNpcs()` (bibliothèque) et `useSessionNpcs(sessionId)` (PNJ de la table), sur `fetchWithAuth`.
- Composants (`features/npc/`) :
  - `NpcAvatar` : image, sinon icône colorée, sinon initiales ;
  - `NpcAvatarPicker` : image (`AvatarUploader`), icône (`IconPicker` du tableau) ou rien ;
  - `NpcLibrary` : liste, recherche, filtre par étiquette ;
  - `NpcForm` : champs communs + emplacement `Form` du slug ;
  - `NpcSheet` : en-tête commun + emplacement `Sheet` du slug ;
  - `NpcTable` : PNJ de la table (ajout avec quantité, retrait, vider, réglage des jets cachés).
- Un onglet assemblé `TabNpcs`, fait de ces briques, que la plupart des slugs posent tel quel ; un slug qui veut une autre disposition assemble les briques lui-même. Disposition fixée par la planche (lot 1).
- Habillage par des classes `vtt-npc-*` dans les `theme.css`.
- **Tableau** (P-21) : jeton `{ sessionNpcId, label }` posé depuis « Ajouter ▸ PNJ de la table » ; le tableau lit l'avatar ou l'icône du PNJ par sa route, et garde le nom si le PNJ a quitté la table.

### 6.6 Questions de phase 2

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| S-1 | Un onglet assemblé `TabNpcs` que les slugs posent tel quel, en plus des briques ? (Ta préférence va d'habitude aux briques ; pour le catalogue, tu avais préféré une seule modale générique.) | **Oui** : la disposition sera la même presque partout, le slug ne fournit que sa partie système (`Form`, `Sheet`). Les briques restent disponibles pour un slug qui veut autre chose. | Oui, avec un CSS de plateforme entièrement surchargeable, qui reprend les classes `vtt-*` existantes quand elles conviennent (`vtt-btn`, `vtt-pill`, `vtt-input`, `vtt-panel`, `vtt-tag`, `vtt-segmented`, `vtt-list-item`, `vtt-catalog-search`, `vtt-modal-*`…) (2026-11-09) |
| S-2 | Supprimer une fiche de la bibliothèque : on demande confirmation, et on prévient si elle est présente à une table ? | Confirmation toujours (`ConfirmModal`) ; pas d'avertissement de présence : les instances sont des copies et ne bougent pas. | Oui (2026-11-09) |

### 6.7 Planche (lot 1) : `documentations/pnj/planche_pnj.html` (hors Git)

Retours sur la version 1 (2026-11-09), intégrés dans la version 2 :

- **Disposition côte à côte retenue** (les PNJ à la table au centre, la bibliothèque en colonne). Les sous-onglets sont écartés.
- **Côté de la bibliothèque** : option du slug, `npc: { librarySide: 'left' | 'right' }`, **à gauche par défaut** (la plupart des slugs ont leurs panneaux à gauche).
- **Bibliothèque repliable** en une barre étroite ; l'état replié est gardé dans le navigateur, par slug.
- **Glisser-déposer** d'une fiche de la bibliothèque vers « À la table ». Le bouton « À la table » et sa quantité restent (écran tactile, ajout multiple).
- **Modifier depuis la bibliothèque** : crayon sur chaque ligne (la fiche s'ouvrait seulement au clic, ce n'était pas visible).
- **Modifier un PNJ à la table** : crayon sur la carte. On modifie **sa copie** (toute la fiche, pas seulement le nom) ; la bibliothèque ne change pas (P-16).

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| PL-1 | Création et modification : en **fenêtre**, ou en **panneau latéral** (la colonne de la bibliothèque s'élargit et devient le formulaire) ? Les deux sont dans la planche. | **Panneau latéral** : les PNJ à la table restent visibles pendant qu'on écrit, et le formulaire a la place de la partie système. La fenêtre reste pour **lire** une fiche de la bibliothèque. Le plateau du bas est écarté : il sert au jet chez Vikings, et un formulaire long y serait à l'étroit. | Panneau latéral, avec une animation pour que le changement soit fluide (2026-11-09) |

Retours sur la version 2 (2026-11-09), intégrés dans la version 3 :

- **Panneau latéral** retenu (PL-1) : il entre en glissant, la table se recompose en fondu ; pas d'animation si le système demande moins de mouvement (`prefers-reduced-motion`).
- **Crayon et corbeille en haut à gauche** de chaque fiche de la bibliothèque (suppression avec confirmation, S-2).
- **Nom d'un PNJ à la table** : c'est le nom de la carte (`session_npcs.name`). Le formulaire d'un PNJ à la table montre « Nom à la table » à la place du prénom et du nom de la fiche d'origine ; renommer sur la carte ou dans le formulaire, c'est le même champ.
- **Modifier un PNJ à la table** modifie bien la carte : toute sa copie (identité, avatar, partie système), pas la bibliothèque. La version 2 n'enregistrait pas la partie système (oubli de la planche).
- **Formulaires système complets** : la partie système d'une fiche se modifie en entier, à la création comme à la modification (Maledictum : rôle, caractéristiques, profil, blessures critiques, attaques, compétences, traits, possessions ; Dune : rangs, spécialisations, maximes).
- **Chaque planche liste en tête ce qu'elle simplifie volontairement**, pour qu'un manque ne passe pas pour un oubli (demande du MJ).

**Planche validée le 2026-11-09** (version 3 pour la disposition, version 5 pour les jets, §6.8). Points pour le lot 2 :
- La partie système de Dune dans la planche (jets en un clic, rang + meilleur principe, PNJ comme les PJ) n'est **pas** la règle du jeu : le lot 2 part de `spec_dune.md`, du livre et de `DuneGMRollModal` pour les PNJ de Dune (types de PNJ, jets, difficulté, Menace). Questions au MJ en début de lot.
- Les thèmes des slugs donnent du padding à `.vtt-btn` : les petits boutons à icône de la brique (crayon, corbeille) fixent le leur (`padding: 0`), sinon l'icône disparaît dans un bouton taillé (Dune).
- Le thème du slug est chargé après les couleurs par défaut de la brique, comme dans l'app : les `vtt-npc-*` ne fixent pas de couleur en dur, seulement des `var(--color-*)`.

### 6.8 Jets composés et jets préparés (à trancher avant le lot 2)

**Constat du MJ (2026-11-09)** : à Dune, un jet associe deux éléments **choisis au moment du jet** (Combat + Domination, ou Combat + Devoir…). La planche lançait une compétence seule, avec le meilleur principe : ce n'est pas la règle, et il manque une étape entre « je clique » et « je lance ». Définir des attaques fixes ne suffit pas : un PNJ sert aussi hors combat.

**Pas propre à Dune.** Plusieurs systèmes composent leur jet à partir de deux éléments de la fiche :

| Composition | Slugs |
|---|---|
| Deux éléments choisis au moment du jet | Dune (compétence + principe), VDA (attribut + capacité), Achtung (attribut + discipline), Zone Blanche (attribut + compétence), Fabula (deux attributs) |
| Une seule valeur | Maledictum, Delta Green (pourcentage), Nimble, Tecumah (code de dés), Vikings (compétence, la caractéristique se déduit) |
| Pas de jet du MJ | Cyberpunk |

Ensuite, presque partout, il reste des choix au moment de lancer (difficulté, dés de Menace, spécialisation…) : c'est la fenêtre de jet du MJ du slug qui les pose. Celle de Dune accepte déjà un rang et un libellé préremplis (`DuneGMRollModal`, props `initialRang`, `initialLabel`).

**Deux besoins distincts :**

1. **Jet composé** (libre, hors combat comme en combat) : on choisit les éléments sur la fiche (un clic sur Combat, un clic sur Domination, ils restent surlignés), une barre montre « Combat 6 + Domination 6 → rang 12 · Lancer », et « Lancer » ouvre la fenêtre de jet du slug préremplie. Pour un système à une seule valeur, un clic suffit.
2. **Jets préparés** : des actions nommées, enregistrées sur la fiche (« Lame — Combat + Domination », « Interroger — Rhétorique + Vérité », « Fusil automatique 40 »), lancées en un clic, avec la même fenêtre préremplie. Utile en combat, quand on répète les mêmes jets ; ça ne remplace pas le jet composé.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| R-1 | Le jet composé : qui le porte, la plateforme ou chaque slug ? | **Une brique de la plateforme**, parce que cinq slugs en ont besoin. Le slug déclare ses groupes d'éléments (Dune : compétences, principes ; un élément de chaque) et ce que donne une sélection (rang, libellé) ; la brique gère la sélection, le surlignage et la barre « Lancer » ; « Lancer » appelle le slug, qui ouvre sa fenêtre préremplie. Un système à une seule valeur déclare un seul groupe : le clic lance aussitôt (ou ouvre sa fenêtre). || Sélection sur la fiche avant de lancer : retenue, « pas mal ça » (planche v4, 2026-11-09). Brique de la plateforme (sélection, surlignage, barre « Lancer »), le slug déclare ses groupes |
| R-2 | Les jets préparés : on les fait, et sont-ils communs à tous les slugs ? | **Oui, communs** : une liste « Jets préparés » dans la fiche (nom + la sélection enregistrée, opaque pour la plateforme), affichée en boutons par la brique, éditée dans le formulaire en reprenant le même sélecteur. Les attaques du bestiaire de Maledictum deviennent des jets préparés à leur versement (lot 3). || Pas en tête de fiche : ça casse la mise en page du slug (Maledictum). Si on garde l'idée, c'est une brique que **le slug place où il veut** dans sa fiche, avec des données du slug (planche v5). Maledictum garde son bloc « Attaques », qui fait déjà ce travail (2026-11-09) |
| R-3 | Après la sélection, on passe **toujours** par la fenêtre de jet du slug, ou un clic lance directement quand il n'y a rien à choisir ? | **Au choix du slug.** Dune passe toujours par sa fenêtre (difficulté, Menace) ; Maledictum peut lancer d'un clic (la valeur du test est connue). Le réglage « Jets des PNJ : cachés » vaut dans les deux cas. || Au choix du slug : Maledictum lance d'un clic, Dune passe par sa fenêtre (planche v4-v5, 2026-11-09) |
| R-4 | Dune : un PNJ a-t-il ses 5 compétences et ses 5 principes comme un PJ, ou un profil plus court selon son importance (figurant, notable, majeur) ? Et les créatures ? | À lire dans le livre au lot 2 ; je te propose ce que j'y trouve avant de coder. | |

**Principe qui en découle (2026-11-09)** : la plateforme ne pose rien dans la partie système de la fiche. Elle fournit des briques (sélection et barre de jet, jets préparés et leur éditeur) que **le slug place où il veut** ; un slug peut aussi ne pas s'en servir (Maledictum et ses attaques). La barre « Lancer » se place par défaut sous la partie système, le slug peut la déplacer.

## 7. Lot 2 : les PNJ de Dune (R-4)

### 7.1 Ce que dit le livre (Dune: Adventures in the Imperium, livre de base, pages imprimées)

**Trois rangs** (p.100, 263, encadré « Creating Non-player Characters » p.328, avec p.136-137 et 190) :

| | Mineur | Notable | Majeur |
|---|---|---|---|
| Principes | **aucun** : une seule valeur « Principe » de 4 à 8, qui remplace le principe dans tout test (5 par défaut ; 4 pour un sous-fifre) ; pas de maxime | deux à 7 et 6, les autres à 5 ; une maxime sur un des deux hauts | 8 / 7 / 6 / 5 / 4 ; une maxime pour chaque principe à 6 ou plus |
| Compétences | 6 / 5 / 5 / 4 / 4 (le 6 = son métier) | 7 / 6 / 5 / 5 / 4 | toutes à 4, puis 11 points (8 au plus) |
| Spécialisations | 1 par compétence à 6, 2 à 7, 3 à 8 | idem | 3 à 5 |
| Traits | 1 (le rôle) | 1, +1 facultatif (réputation) | rôle + réputation (+ faction) |
| Talents | seulement si sa Maison en donne un | 1, parfois 2 | 2 à 4 |
| Atouts | aucun, sauf besoin | 1 | plusieurs |

- **Pas de Détermination** pour un PNJ : 3 points de Menace en tiennent lieu (dé fixé à 1, relance…). Leurs talents sont écrits en Menace.
- **Capacités spéciales de PNJ** (p.328), à la place d'un talent : premier dé acheté gratuit, relance d'un dé acheté en Menace, aide, substitution de compétence, difficulté −1 sur un test donné, effet propre contre de la Menace.
- **Test** : la procédure des PJ (compétence + principe, 2d20, ≤ seuil = 1 succès, 1 = 2 succès, **spécialisation : tout dé ≤ la compétence compte double**, 20 = complication). Un mineur : compétence + sa valeur « Principe » unique. Le livre ne dit pas comment le MJ choisit le principe : librement, comme un PJ.
- **Dés achetés en Menace** : 1, puis 2, puis 3 points ; 3 dés en plus au plus (5d20). L'excédent d'un PNJ passe en Menace, 1 pour 1. Annuler une complication d'un PNJ : 2 Menace.
- **Fiche imprimée** (chap. 9) : rôle et nom ; principes (valeur, maxime sur certains) ; compétences (valeur, spécialisations) ; traits ; talents (nom + effet) ; atouts (noms) ; description, exemples, accroche de scénario. Les 25 archétypes (p.269-295) sont des notables, mais leurs valeurs ne suivent pas toujours la formule (le Garde a les compétences d'un mineur) : les valeurs restent libres.
- **Défaite** (p.167-168) : pas de points de vie. Un **mineur** touché est **vaincu**. Un **notable ou majeur** a une jauge (tâche étendue) : seuil = sa compétence la plus pertinente + la Qualité de ses atouts défensifs, chaque attaque réussie ajoute 2 + la Qualité de l'atout d'attaque. **Résister à la défaite** une fois par scène (1 Menace + la Qualité de l'atout), au prix d'une complication.
- **Créatures** : aucune fiche dans le livre ni le GM Toolkit (le ver est un élément du décor) : un PNJ mineur ou notable fait par le MJ.

### 7.2 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| D-1 | Rang du PNJ (mineur, notable, majeur) sur la fiche ? | **Oui.** Il règle les principes : un **mineur n'a qu'une valeur « Principe »** (la barre de jet devient « Combat 6 + Principe 5 → 11 », un seul clic suffit) ; notable et majeur ont leurs cinq principes (sélection compétence + principe). À la création, le rang **préremplit** les valeurs du barème du livre ; tout reste modifiable ensuite. || Oui (2026-11-09) |
| D-2 | Spécialisations des PNJ au jet ? | **Oui** : liste de spécialisations par compétence (texte), et dans la fenêtre de jet une pastille « Spécialisation » (tout dé ≤ la compétence compte double ; le moteur de Dune le sait déjà). Aujourd'hui la fenêtre du MJ n'en a pas : elle l'aura quand elle vient d'un PNJ. || Oui (2026-11-09) |
| D-3 | Dés achetés en Menace : la fenêtre **débite la Menace** de la table (1, puis 2, puis 3) ? Et l'excédent d'un PNJ **va en Menace** ? | **Oui aux deux**, comme les Impulsions des joueurs : la fenêtre montre le coût, débite la Menace au lancer, et propose « Verser l'excédent en Menace » après le jet. La Détermination des PNJ (3 Menace) reste à la table. || Oui (2026-11-09) |
| D-4 | Contenu de la fiche au-delà des valeurs ? | Traits (liste), talents (nom + effet), atouts (nom + Qualité facultative), maximes : comme le livre, en texte structuré. || Oui, comme dans le livre et les règles (2026-11-09) |
| D-5 | État d'un PNJ à la table ? | **Mineur** : « Vaincu » en un clic (la carte se grise). **Notable et majeur** : une jauge de défaite (points / seuil, seuil saisi par le MJ), « Résister à la défaite » (une fois par scène, une case), « Vaincu ». Complications, atouts écartés : dans les notes de la scène. || Oui, un peu comme sur Maledictum (2026-11-09) |
| D-6 | Verser les **25 archétypes** du chap. 9 dans la bibliothèque (traduits) ? Et les PNJ majeurs du livre (Leto, Jessica, Feyd…) ? | **Les archétypes oui, au lot 3** avec les bestiaires (même travail de transcription et de versement). Les majeurs du livre non : ce sont des personnages du roman, ta campagne a les siens. || Pourquoi seulement au lot 3, et pourquoi pas les majeurs, ils sont dans le livre ? (2026-11-09). Voir D-7 |
| D-7 | (suite de D-6) Les **18 PNJ majeurs** sont bien dans le livre (chap. 9, p.241-262) : Maison Atréides (Leto, Jessica, Paul, Gurney Halleck, Thufir Hawat, Duncan Idaho, Wellington Yueh), Harkonnen (Vladimir, Piter de Vries, Feyd-Rautha, Rabban), Corrino (Shaddam IV, Irulan, Gaius Helen Mohiam, Hasimir Fenring), Fremen (Stilgar, Chani, Liet Kynes). Plus les 25 archétypes (p.269-295) et les PNJ du scénario « Harvesters of Dune » (Corinth Euler, l'équipage de l'Alberich, p.316). Quoi verser, et quand ? | **Les archétypes et les 18 majeurs, à la fin du lot 2** (Dune pilote, fait d'un bloc). Pas au lot 3 : la seule contrainte est que le format de la fiche Dune soit arrêté avant de transcrire, et il l'est au lot 2 ; je verse donc après avoir vérifié la fiche à l'écran. Écarter les majeurs était un jugement de ma part (« ta campagne a les siens »), pas une raison. Les PNJ du scénario : non (spoilers du scénario, peu réutilisables), sauf si tu le joues. | Pourquoi pas ceux du scénario, puisque seul le MJ voit les PNJ ? (2026-11-09) → **Reco corrigée : tout verser**, archétypes, majeurs et PNJ du scénario (avec l'étiquette de leur source) : l'argument des spoilers ne tient pas, la bibliothèque est réservée au MJ. Les suppléments présents (*Agents of Dune*, *GM Toolkit*) sont à vérifier au même moment : leurs PNJ chiffrés seront versés aussi. |


### 7.3 Lot 2 : implémentation (2026-11-10)

**Plateforme**
- Tables `npcs` et `session_npcs` dans `base.sql` et les 13 schémas de slug ; migration `10112026_npcs.sql` (`-- systems: all`). Test de conformité des schémas étendu aux deux tables.
- Route `/api/:slug/npcs` (`routes/npcs.js`, contrôleur `utils/npcs.js`), réservée au MJ ; tests `tests/server/routes/npcs.test.js`.
- Client : hook `useNpcs`, briques `features/npc/` (`NpcAvatar`, `NpcAvatarPicker`, `NpcLibrary`, `NpcForm`, `NpcSheet`, `NpcCard`, `NpcSystem`, `NpcPresets` / `NpcPresetEditor`), onglet assemblé `TabNpcs` ; CSS `vtt-npc-*` dans `app/styles/index.css` (le padding des petits boutons à icône hors couche, sinon les thèmes l'écrasent).
- Tableau (P-21) : jeton `{ npcId, label, color }`, route `GET /board/sessions/:sid/npcs` (nom, avatar, icône ; jamais la fiche), « Jeton de PNJ… » propose d'abord les PNJ de la table ; `IconPicker` reçoit un titre facultatif.

**Dune**
- Règles pures `config/rules/npc.js` (barème des rangs, seuil d'un test, Menace des dés achetés, « Résister ») et leurs tests.
- Bloc `npc` de `config.jsx` : `DuneNpcSheet`, `DuneNpcForm`, `duneNpcPick` (jet composé ; mineur : valeur « Principe » en part fixe), `DuneNpcRollWindow`.
- `DuneGMRollModal` : prop `npc` (spécialisation, jets cachés repris de l'onglet, dés achetés payés en Menace et refusés si la Menace manque, « Verser l'excédent en Menace »).
- Onglet PNJ de nouveau dans l'interface MJ.

**Versement (D-7)** : 75 fiches, migration de données `10112026_npcs_dune.sql` (`-- systems: dune`, sans doublon si rejouée) et mêmes insertions dans `dune-schema.sql` :
- livre de base, 50 : 18 majeurs, 25 archétypes, 7 du scénario « Harvesters of Dune » (dont l'équipage de l'Alberich, mineur) ;
- *GM Toolkit*, 8 notables ;
- *Agents of Dune*, 17 (dont 3 groupes de mineurs).

À relire (lectures et traductions de la transcription) :
- **Coquilles du livre gardées telles quelles** : Corinth Euler recopie les valeurs de Jellicoe ; Obregon a un 5e principe imprimé « Understand », rangé en Vérité ; Rodikar a Sang-froid et Résolution sur Mobilité ; Varis et Nikula partagent leurs traits ; Liet Kynes est au féminin dans ses talents.
- **Noms traduits sans équivalent dans l'app** : « Palais mental » (Mind Palace), « Amortisseur ixien » (Ixian Damper), « Fléchette » (Flip-Dart).
- **Noms repris de l'app** : Impérieux, Célérité, Ténacité, Examen hâtif, Agile, À pas de loup, Laser (lasgun), Dard, Pistolet à aiguilles.
- Les faux contrebandiers d'*Agents of Dune* (principes tous à 4) ont été classés en mineurs.

- Lot 2 commité le 2026-11-10 (`bdf832d`).

## 8. Lot 3 : Maledictum et Nimble

Déjà décidé : les bestiaires passent en base, une migration de données par slug (P-4, P-13) ; les onglets Rencontre basculent sur l'onglet PNJ de la plateforme et le stockage navigateur disparaît (P-5) ; Maledictum lance d'un clic (R-3). La partie système de chaque slug reprend ce que fait sa carte de rencontre actuelle : Maledictum (caractéristiques, attaques, compétences, traits en un clic, Blessures et Blessures critiques selon le rôle), Nimble (PV et armure, dégâts et soins, attaques, capacités, sections des légendaires).

### 8.1 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| L3-1 | Les deux bestiaires servent **aussi à l'aide de jeu** (section « Bestiaire » réservée au MJ, construite depuis `bestiary.js`). Une fois versés en base, que devient cette section ? | **La retirer** : la bibliothèque devient le bestiaire du MJ (recherche, étiquettes, fiches complètes), et garder `bestiary.js` pour l'aide de jeu referait deux sources. Pour Nimble, le texte des familles (rencontres types, butin) n'est pas un profil : il passe en Markdown dans l'aide de jeu (section MJ « Familles de monstres »). || **Garder la section de l'aide de jeu**, même si elle fait doublon avec la bibliothèque : ce n'est pas bien grave (2026-11-10). Les fichiers `bestiary.js` restent donc, et servent aussi de source au versement en base. |
| L3-2 | Nimble : les **sbires** se jouent en groupe (une carte, un nombre de sbires, tout dégât en tue un). Ajouter « 4 Sbires gobelins », c'est 4 cartes, ou une carte de 4 ? | **Une carte de 4**, comme aujourd'hui. Le slug dit qu'une fiche se joue en groupe ; la plateforme crée alors une seule carte, et la quantité devient le nombre de sbires. || Oui (validé dans l'ensemble, 2026-11-10) |
| L3-3 | Nimble : les PV d'un **légendaire** dépendent du nombre de héros de la table. Calculés à l'ajout, comme aujourd'hui ? | **Oui** : l'interface MJ de Nimble passe le nombre de héros à l'onglet, qui le transmet au slug pour l'état initial. || Oui (2026-11-10) |
| L3-4 | Nom de l'onglet : « Rencontre » (comme aujourd'hui) ou « PNJ » (comme Dune) ? | **« Rencontre »** : c'est le mot des deux jeux et celui que tes joueurs connaissent. || Oui (2026-11-10) |
| L3-5 | Nimble : le **monstre libre** (onglet du catalogue actuel) ? | Il devient « Nouvelle fiche » de la bibliothèque, avec le formulaire de Nimble ; plus besoin d'un cas à part. || Oui (2026-11-10) |
| L3-6 | Les rencontres en cours **gardées dans le navigateur** sont perdues à la bascule (P-5). | Accepté en P-5 ; je le rappelle seulement. Il suffit de rajouter les monstres à la table après la mise en prod. || Oui : pas de partie en cours (2026-11-10) |

### 8.2 Lot 3 : implémentation (2026-11-10)

**Plateforme**
- `TabNpcs` : prop `context` (données de la table passées à `initialState(npc, { quantity, context })`) ; bloc `npc.isGroup(npc)` : une fiche qui se joue en groupe donne une seule carte, la quantité passe à l'état initial (L3-2).

**Nimble**
- Règles `config/rules/encounter.js` : `monsterState` (PV, PV par héros des légendaires, nombre de sbires), `monsterView`, `levelValue` (tri des niveaux) ; tests.
- Partie système `components/npc/NbNpcSheet.jsx` (reprise de l'ancienne carte : PV, armure, dégâts et soins, sbires, attaques, capacités et sections) et `NbNpcForm.jsx` (L3-5) ; bloc `npc` : étiquettes Type / Famille / Niveau, sbires en groupe, PV des légendaires selon le nombre de héros de la table (L3-3).
- Onglet « Rencontre » sur `TabNpcs` (L3-4) ; `gm/tabs/TabEncounter.jsx` et `NbMonsterCard.jsx` supprimés.
- Versement : 91 monstres du GM's Guide (`10112026_npcs_nimble.sql`, `-- systems: nimble`, et schéma), étiquettes famille, Sbire, Légendaire, `Niv. X`.

**Maledictum**
- Règles `config/rules/npc.js` (mort subite selon le rôle, jet d'attaque d'un profil) ; tests.
- Partie système `components/npc/MlNpcSheet.jsx` (caractéristiques, attaques et compétences en un clic, jets cachés suivant l'onglet, Blessures et Blessures critiques à la table, traits et possessions) et `MlNpcForm.jsx` ; bloc `npc` : étiquettes Rôle / Faction.
- Onglet « Rencontre » sur `TabNpcs` ; `gm/tabs/TabEncounter.jsx` supprimé.
- Versement : 50 profils du livre de base (`10112026_npcs_maledictum.sql`, `-- systems: maledictum`, et schéma), variantes complétées par leur profil de base.

L'aide de jeu garde la section bestiaire des deux slugs (L3-1) : `bestiary.js` reste, source de l'aide de jeu et du versement.

- Lot 3 commité le 2026-11-10 (`e5ca432`).

## 9. Lot 4 : les autres slugs (phase 1, diagnostic)

Périmètre : Vikings, Vampire : l'Âge des Ténèbres (VDA), Achtung! Cthulhu ; Fabula à trancher (L4-1). **Sortent du lot** (2026-11-10) : Cyberpunk (ses Menaces de l'onglet Opération restent comme elles sont), **Delta Green, Tecumah et Zone Blanche** (pour l'instant ; leur état est gardé au §9.1 pour plus tard). Vileborn et Noctis restent hors chantier.

Pour chaque slug, l'onglet assemblé de la plateforme (planche validée, §6.7) s'applique tel quel ; le slug fournit sa partie système (formulaire, fiche, étiquettes, état à la table) et branche sa fenêtre de jet MJ, comme Dune, Nimble et Maledictum.

### 9.1 Ce qui existe

| Slug | Onglets MJ | Jet du MJ | Ce qu'un PNJ porte selon les règles | Suivi à la table | Données de PNJ |
|---|---|---|---|---|---|
| vikings | Session, Tableau, Journal, Historique, Aide | `GMDiceModal` : réserve de d10, seuil, explosion, jet secret ; libellé « Jet MJ » figé | Comme un PJ : 6 caractéristiques (1-5), Armure, Seuil de combat, actions, compétences ; traits spéciaux réservés au MJ (Changeforme…) ; figurants d'équipage : Seuil 1, sans armure | Jetons de Blessure (0-5), Fatigue (0-10) | aucune |
| woddavampire | Session, Coterie, Journal, Tableau, Historique, Aide | `VdaGmDiceModal` (libellé, dés, difficulté, spécialité, public / caché) par `useVdaRoll`, qui accepte déjà un nom | Comme un PJ (attributs, capacités, disciplines) ; goules, revenants, animaux, nuées, esprits (aide de jeu « Conteur ») ; spec M-7, M-10 (« PNJ hors périmètre tant que le système PNJ n'est pas fini ») | Niveaux de santé (4 seulement pour un figurant), sang, Volonté | aucune |
| achtung | Session, Journal, Tableau, Historique (`gm/GMView.jsx`) | `GMDiceModal` : cible, difficulté, 2 à 5 d20, privé par défaut ; nom « GM » figé | Rien dans la spec ; le PJ a 6 attributs, 12 compétences (rang + focus), Stress, Armure, Courage | Stress, blessures | aucune |
| deltagreen | Agents, Journal, Tableau, Historique (`gm/GMView.jsx`) | aucun du slug : jet libre de la plateforme ; la fenêtre de jet du slug exige un personnage | Rien dans la spec ; le PJ a FOR CON DEX INT POU CHA, PV, VOL, SAN, compétences en % | PV, VOL (SAN pour un humain) | aucune |
| tecumah | Session, Ressources, Journal, Tableau, Historique (`components/gm/GMView.jsx`) | `GMDiceModal` : réserve de D6, bonus, difficulté ; nom « GM » figé | Spec §9.6 : « les PNJ n'ont pas de fiche complète » : défenses, résistance, actions, attaques (compétence, dégâts) | Niveaux de blessure | aucune ; restes de l'ancien PNJ (branches `isNPC` des dés, rendu « Jet NPC ») |
| zoneblanche | Session, Journal, Tableau, Historique | `ZoneBlancheGMDiceModal`, pensée pour un PNJ : nom, objectif, difficulté, seuil de critique, d20 achetés en Stress | Rien : un PNJ ou une entité n'a qu'un objectif et un seuil de critique | aucun (conséquences narratives) | aucune |
| fabula | Session, Groupe, Tableau, Journal, Historique, Aide | aucun du slug : jet libre ; la fenêtre du slug exige un personnage | Spec §6 : niveau, espèce, rang (Soldat, Élite, Champion), dés de DEX INT PUI VOL, PV, PM, DEF, DEF M., initiative, affinités (9 types), attaques, sorts et capacités ; vilains (Points Ultima) | PV, PM, états, horloges | aucune |

Aucun livre transcrit ni catalogue de PNJ n'existe pour ces slugs : rien à verser sans transcription (L4-2).

### 9.2 Questions

| # | Question | Proposition | Réponse MJ                                                                                                                                          |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| L4-1 | **Fabula** : dans le lot ou pas ? | **Oui, en dernier.** C'est le modèle de monstre le plus riche (rang, affinités, attaques, sorts) et le mieux décrit par sa spec : le livre se joue avec des adversaires chiffrés. La spec Fabula est celle du MJ de Fabula : les questions de sa partie lui seront posées. | Dans un premier temps, faut que ça utilise les règles du jeu de base en restant dans la marge des specs de l'app                                    |
| L4-2 | **Données** : bibliothèques vides au départ, ou PNJ des livres versés comme pour Dune ? | **Vides au départ** : rien n'est transcrit, et une transcription se fait sur un livre fourni (comme Dune). Un versement pourra suivre, slug par slug, quand tu me donnes une source. | En fonction des sources, Viking vide pour l'instant, VdA on peut récup ce qui existe de base, Fabula depuis les sources, Achtung depusi les sources |
| L4-3 | **Découpage** : un sous-lot par slug, ou tout d'un coup ? | **Deux sous-lots, un commit chacun** : 4a Vikings, VDA et Achtung (fiches de PJ allégées, jets par la fenêtre MJ du slug) ; 4b Fabula. Chaque sous-lot se vérifie et se relit seul. | des sous lots, un seul commit                                                                                                                       |
| L4-4 | **Nom de l'onglet** : « PNJ » partout ? | **« PNJ »** partout (comme Dune). | oui                                                                                                                                                 |
| L4-5 | **Fenêtre de jet** : un jet lancé depuis un PNJ ouvre la fenêtre MJ du slug **préremplie** (nom du PNJ en libellé, réserve ou cible calculée, jet caché repris de l'onglet) ? | **Oui** : la fenêtre gagne quelques props facultatives (nom, valeurs de départ, caché) ; ouverte depuis le menu, elle reste comme aujourd'hui. Fabula n'a pas de fenêtre MJ : elle est à définir avec le MJ de Fabula. | reco                                                                                                                                                |
| L4-6 | **Jet composé** (choisir sur la fiche, puis lancer, comme Dune) : où ? | Vikings (caractéristique + compétence → réserve de d10), VDA (attribut + capacité → réserve), Achtung (attribut + compétence → cible, focus). | Vikings n'a pas de jet composé, une compétence dépends d'un attribut et définie l'explosivité, sinon c'est un jet d'attribut. Ok pour le reste      |
| L4-7 | **Achtung** : rangs de PNJ du 2d20 (Troupe, Élite, Némésis : jets, Stress et blessures différents selon le rang) ? | **Oui, comme dans le livre**, si tu confirmes que vous les jouez ; sinon une fiche unique (attributs, compétences, Stress, Armure). La spec du slug n'en dit rien. | reco                                                                                                                                                |
| L4-8 | ~~Zone Blanche : une fiche sans caractéristiques sert-elle ?~~ | Sans objet : Zone Blanche sort du lot. Ses PNJ et entités n'ont pas de fiche au sens du système de PNJ ; la fenêtre MJ (nom, objectif, difficulté) suffit. | Zone Blanche hors lot (2026-11-10)                                                                                                                  |
| L4-9 | ~~Tecumah : restes de l'ancien PNJ (branches `isNPC` des dés, rendu « Jet NPC »)~~ | Sans objet : Tecumah sort du lot. Ces restes seront supprimés à son tour. | Tecumah hors lot (2026-11-10)                                                                                                                       |
| L4-10 | **Achtung** passe encore par un `GMView.jsx` (écart à F-SLUG-STRUCT). On le fond dans `GMApp.jsx` en ajoutant l'onglet ? | **Oui**, puisqu'on touche ces fichiers : la grille demande de mettre d'aplomb ce qu'on touche. Patch limité au déplacement, rendu inchangé. | oui tant qu'à faire                                                                                                                                 |
| L4-11 | **Vikings** : habillage des cartes PNJ dans les deux thèmes au choix du joueur (pierre peinte, bois et or) ? | **Oui, les deux** : le MJ voit le thème qu'il a choisi. | oui les deux et habillage de manière générale pour tous les slugs                                                                                   |
| L4-12 | **Planche** : nouvelle planche pour les parties système ? | **Non** : la disposition de l'onglet est celle de la planche validée, et chaque partie système suit le modèle de Maledictum (bloc de valeurs, jets en un clic, compteurs à la table). Une planche seulement si tu veux voir Fabula ou Vikings avant le code. | non                                                                                                                                                 |

### 9.3 Ce que les réponses décident (2026-11-10)

- **Slugs** : Vikings, VDA, Achtung, puis Fabula (règles du livre de base, dans les limites de la spec de l'app : rien de la spec Fabula n'est contredit, rien n'est inventé).
- **Données** : Vikings vide ; VDA versé depuis ce que l'app a déjà (profils de l'aide de jeu, chapitre Conteur) ; Achtung versé depuis le *Gamemaster Guide* (2d20) ; Fabula depuis le bestiaire du livre de base (FR).
- **Sous-lots, un seul commit** pour tout le lot 4 ; onglet « PNJ » partout ; fenêtre MJ du slug préremplie ; habillage des cartes dans chaque slug (les deux thèmes de Vikings) ; `GMView.jsx` d'Achtung fondu dans `GMApp.jsx` ; pas de planche.
- **Vikings n'a pas de jet composé** (L4-6) : une compétence dépend de ses caractéristiques et fixe l'explosion, sinon c'est un jet de caractéristique. Jet composé pour VDA et Achtung.
- **Achtung** : rangs du livre (L4-7).

## 10. Lot 4 : spécification (phase 2, à valider)

### 10.1 Sous-lots

| Sous-lot | Contenu | Versement |
|---|---|---|
| 4a | Vikings | aucun |
| 4b | VDA | profils de l'aide de jeu (`config/reference/07-conteur.md`) : 22 animaux, 8 nuées, 3 démons d'exemple ; plus tard, les PNJ mortels chiffrés du livre de base (chapitre « Antagonists and Storyteller Characters », p.382-395, environ 25) |
| 4c | Achtung, `GMView.jsx` fondu | profils du *Gamemaster Guide* (une centaine, traduits), `10112026_npcs_achtung.sql` |
| 4d | Fabula | bestiaire du livre de base (une soixantaine), `…_npcs_fabula.sql` |

Chaque sous-lot se vérifie à l'écran et se relit seul ; un commit à la fin du lot. Les versements sont des transcriptions comme celle de Dune : coquilles et choix de traduction listés pour relecture.

### 10.2 Vikings

- **Fiche** : 6 caractéristiques (1 à 5), Armure, Seuil de combat, actions, compétences (liste du slug : niveau 0 à 5, spécialisation), armes (nom, dégâts), traits (dont les traits réservés au MJ), étiquettes libres (« Figurant »…).
- **À la table** (retour MJ du 2026-11-10, remplace S4-6) :
  - **Blessure** jusqu'au maximum de tokens du PNJ, réglé sur la fiche (5 pour un humain, 8 pour un ours…) ; malus de dés du barème humain (spec §2.1) **par règle de trois** (token ramené sur 5, arrondi à l'inférieur), KO au maximum seulement. Ours à 8 : 1-3 sans malus, 4 → −1 dé, 5-6 → −2, 7 → −3, 8 → KO.
  - **Pas de Fatigue** : un **Malus** en succès (valeur de base sur la fiche, recopiée à la table et ajustable) ; −1 = un succès de moins au résultat, 0 au minimum.
- **Jets en un clic** : une caractéristique (3d10, seuil 7+, explosion de la caractéristique) ou une compétence (seuil de la compétence, explosion de la meilleure de ses deux caractéristiques), dés retirés par la Blessure ; la fenêtre MJ s'ouvre préremplie (réserve, seuil, explosion, malus, libellé « Nom · compétence », jet secret repris de l'onglet). Aucun jet une fois KO.
- **Fenêtre MJ** (`GMDiceModal`) : props facultatives `name`, `label`, `initial` ({ pool, threshold, explosion, malus }), `secret` ; ouverte depuis le menu, inchangée sauf le réglage du malus (0 par défaut).

### 10.3 VDA

- **Nature** de la fiche, qui choisit les blocs affichés : personnage (mortel, goule, vampire), animal, nuée, esprit.
  - Personnage et animal : Attributs (9, ou les 6 physiques et mentaux d'un animal), Capacités, Disciplines (nom, niveau), Volonté, sang, niveaux de santé (les 7 d'un personnage, ou la liste propre de l'animal : « OK, −1, −1, −2, −5, Neutralisé »), attaques (nom, dés, type C / L / A).
  - Nuée : dégâts, santé, initiative. Esprit : Volonté, Rage, Gnose, Essence, Charmes.
- **À la table** : santé (niveaux perdus), sang et Volonté dépensés, Essence d'un esprit.
- **Jet composé** (comme Dune) : un Attribut + une Capacité choisis sur la fiche → réserve, puis la fenêtre du Conteur préremplie (libellé, dés, difficulté 6, caché repris de l'onglet). Les attaques lancent leur réserve de dégâts en un clic.
- **Fenêtre MJ** (`VdaGmDiceModal`) : props facultatives `name`, `label`, `initial` ({ dice, difficulty, specialty }), `hidden`.

### 10.4 Achtung

- **Rang** (livre p.150-151) : Troupe (Trooper : vaincue à la 1re blessure, pas de réaction, Stress = moitié du plus haut de Force + Résilience ou Volonté + Résilience), Lieutenant (2 blessures, une réaction par round), Némésis ; Figurant (incidental : une qualité de Faible à Exceptionnel → attribut, compétence, cible). Barème indicatif dans le formulaire (totaux d'attributs et de compétences du livre).
- **Fiche** : vérités, 6 attributs, 12 compétences (rang, focus), Stress maximum, Armure, Courage, attaques (nom, compétence, dégâts en dés de combat, qualités), capacités spéciales, dépenses de Menace propres.
- **À la table** : Stress, blessures (vaincu selon le rang).
- **Groupe de Troupes** (livre p.150) : jusqu'à 5 Troupes identiques agissent comme une seule ; le chef lance 2d20, chaque autre membre 1d20 d'assistance, +1 dégât par membre au-delà du premier. Ajoutées à la table, des Troupes forment **une carte de groupe** (comme les sbires de Nimble) qui suit les membres restants.
- **Jet composé** : un attribut + une compétence → cible, focus (zone de critique égale au rang de la compétence) ; fenêtre MJ préremplie (cible, focus, 2d20, ou 2d20 + assistance pour un groupe, libellé, privé repris de l'onglet).
- **Fenêtre MJ** (`GMDiceModal`) : props facultatives `name`, `label`, `initial` ({ target, difficulty, dice, skill, focus }), `secret` ; le critique avec focus passe par `countSuccesses`, qui le gère déjà.

### 10.5 Fabula

- **Fiche** (spec Fabula §6) : niveau, espèce, rang (Soldat, Élite, Champion N), dés de DEX, INT, PUI, VOL, PV, PM, DEF, DEF M., initiative, affinités (9 types : VU, neutre, RE, IM, AB), attaques de base (attributs, précision, dégâts et type), sorts et capacités (coût en PM), vilain (Points Ultima) ; PV et PM selon le rang.
- **À la table** : PV (Crise à la moitié), PM, états (chacun baisse d'un cran le dé de l'attribut lié, comme pour un PJ), Points Ultima d'un vilain (F-5).
- **Réponses du MJ (2026-11-10)** : F-1 fenêtre de jet du MJ (ouverte depuis un PNJ ou depuis le menu, « Jet du MJ ») ; F-2 Élite comme le livre (deux tours par round, PV doublés) ; F-3 N du Champion choisi par le MJ sur la fiche ; F-4 PV et PM tels qu'imprimés ; F-5 Points Ultima suivis à la table ; F-6 bestiaire versé.
- **Implémentation** : `config/npc.js` (tours selon le rang, Crise, dés effectifs, Ultima), `components/npc/FuNpcSheet.jsx` et `FuNpcForm.jsx`, `components/modals/FuGmDiceModal.jsx` (même résultat que la fenêtre du joueur, `RollResult` exporté, maladresse sans Point Fabula), onglet PNJ. Versement : `10112026_npcs_fabula.sql`, 59 profils du livre de base (pages imprimées 315 à 353) ; tous des Soldats, sauf les exemples de boss (Angela, Élite et Méchante mineure ; squale épineux, Champion 3). À relire : un élémentaire de feu (Grenado) vulnérable à la terre, Initiatives qui ne suivent pas la formule, coquilles du livre gardées.
- **Jets** : un test (deux dés d'attributs) ou une attaque en un clic ; la fenêtre de jet MJ, que Fabula n'a pas, est à définir avec le MJ de Fabula (questions à part, au début du sous-lot 4d).

### 10.6 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| S4-1 | **Achtung** : groupe de Troupes en une carte (à l'ajout, la quantité donne la taille du groupe, jusqu'à 5) ? | **Oui**, comme les sbires de Nimble : c'est la règle du livre, et la carte suit les membres restants. || Oui (2026-11-10) |
| S4-2 | **Achtung** : rang Figurant (une qualité, une cible) ? | **Oui** : quelques lignes, et c'est le PNJ le plus fréquent d'une scène. || Oui (2026-11-10) |
| S4-3 | **VDA** : une « nature » (personnage, animal, nuée, esprit) qui choisit les blocs de la fiche ? | **Oui** : les profils de l'aide de jeu n'ont pas les mêmes valeurs ; une fiche unique laisserait la moitié des champs vides. || Oui (2026-11-10) |
| S4-4 | **VDA** : « ce qui existe de base », ce sont bien les profils de l'aide de jeu (animaux, nuées, démons d'exemple) ? | **Oui**, transcrits et relus avec le livre ; le reste du livre (goules, revenants) n'a pas de profil chiffré dans l'app. || Oui (2026-11-10) |
| S4-5 | **Achtung** : verser **tous** les profils du *Gamemaster Guide*, traduits en français ? | **Oui, tous** (Axe, Alliés, cultistes, créatures du Mythe), avec la source et la page ; noms et traductions listés pour relecture, comme pour Dune. || Oui (2026-11-10) |
| S4-6 | **Vikings** : suivre la Fatigue d'un PNJ à la table, en plus des Blessures ? | **Oui** : deux compteurs, comme sur la fiche d'un PJ ; ce sont les deux états du jeu. || Oui (2026-11-10) |

### 10.6 bis Implémentation des sous-lots 4a à 4c (2026-11-10)

**Plateforme**
- Brique `features/npc/NpcItemList.jsx` : liste éditable des formulaires de slug (texte, nombre, pastilles, texte long, suggestions). Dune, Nimble et Maledictum gardent leur copie : bascule à proposer à part.
- `NpcSystem` : `pick.extra(npc, state)` et `pick.resolve(npc, sel, name, state)` reçoivent l'état du PNJ à la table (malus de blessure de VDA) ; Dune inchangé.

**Vikings** : `config/npc.js` (jets, hors de combat), `components/npc/VkNpcSheet.jsx` et `VkNpcForm.jsx`, onglet PNJ ; `GMDiceModal` : props `name`, `label`, `initial`, `secret`. Pas de versement.

**VDA** : `config/rules/npc.js` (santé à niveaux propres, réserve, natures), fiche, formulaire, `vdaNpcPick.js` et `VdaNpcRollWindow.jsx`, onglet PNJ ; `VdaGmDiceModal` : props `name`, `label`, `initial`, `hidden`. Versement : `10112026_npcs_woddavampire.sql`, 34 fiches de l'aide de jeu (livre p.396-403).

**Achtung** : `GMView.jsx` fondu dans `GMApp.jsx` ; `config/npc.js` (rangs, Figurant, Stress du barème, groupe de Troupes), fiche, formulaire, `acNpcPick.js` et `AcNpcRollWindow.jsx`, onglet PNJ ; `GMDiceModal` : props `name`, `label`, `initial` (cible, focus, dés d'assistance), `secret`. Versement : `10112026_npcs_achtung.sql`, 130 profils du *Gamemaster Guide* (pages imprimées 161 à 263), traduits.

À relire dans le versement d'Achtung (transcription) :
- **Rangs du livre gardés même quand ils surprennent** : l'Officier de l'armée britannique est imprimé « Trooper NPC » ; le SS Sonderkommando « Nemesis NPC » ; le berger allemand, sans rang, est classé Troupe ; les formes monstrueuses de Nyarlathotep, sans en-tête, en Némésis.
- **Camps** : le Soleil Noir et les Nachtwölfe sont en Axe (on pourrait les mettre en Autres) ; les animaux en Autres.
- **Coquilles gardées** : règle de McMasters coupée, Mills Bomb « Throwing » au lieu de « Munition », Luger de la Norne sans salve, baïonnette « Piercing » sans valeur, Furies de Foley identiques aux forces d'élite américaines, Halja (trois valeurs d'Armure), Reine mi-go (« Threatening 3 » pour 5 Menace), Fearsome 3 avec un test de difficulté 1 (Grand Aquamage, Yog-Sothoth).
- **Traductions sans équivalent dans l'app** : qualités Fléau (Bane) et Faim (Hunger) ; focus Attaque mentale, Tactique de terrain, Fouissement, Médecine de combat ; noms de sorts traduits librement.
- Les notes complètes des trois parts sont dans le dossier de travail de la session.

### 10.7 Questions pour le MJ de Fabula (sous-lot 4d)

La spec Fabula (`specifications_fonctionnelles_fabula_ultima.md` §4.2, §6) décrit le PNJ ; ces points restent à trancher avec son MJ avant de coder la partie système.

| # | Question | Proposition | Réponse MJ     |
|---|---|---|----------------|
| F-1 | **Jet du MJ pour un PNJ** : Fabula n'a pas de fenêtre de jet MJ (la fenêtre du joueur exige un personnage). | Une **fenêtre de jet MJ** du slug, sur les mêmes règles de dés que les joueurs (deux dés d'attributs, critique et maladresse) : test ou attaque préremplis depuis la fiche (attributs, bonus de précision, dégâts HR + N et type), ND facultatif, jet public ou caché. Ouverte aussi depuis le menu pour un jet libre du MJ. | ok             |
| F-2 | **Élite** : la spec dit « 1 tour par manche, PV et PM doublés » (§6.1) et « 2 tours » (tableau des règles) ; le livre (p.295) dit **deux tours par round, PV doublés, une compétence de plus, Initiative +2** (les PM ne doublent que pour un Champion). Laquelle est la règle de ta table ? | **Le livre**, sauf règle maison voulue : c'est aussi ce que dit le tableau de la spec. Ça ne touche que l'affichage de la carte (tours par manche) : les valeurs de la fiche restent celles saisies (F-4). | livre          |
| F-3 | **Champion (N)** : N choisi par le MJ pour chaque PNJ, ou toujours égal au nombre de PJ (tableau des règles) ? | **Choisi par le MJ sur la fiche** (le livre le fixe à la conception de la rencontre) ; l'onglet propose le nombre de PJ de la table par défaut à l'ajout. | au choix du MJ |
| F-4 | **PV et PM** : saisis tels que le livre les imprime, ou recalculés par l'app selon le rang ? | **Saisis tels quels** : le bestiaire imprime les valeurs finales ; l'app ne recalcule rien. Le seuil de Crise (moitié des PV) s'affiche à la table. | reco tel quel  |
| F-5 | **Méchants** : suivre les Points Ultima à la table (5, 10 ou 15 selon le méchant) ? | **Oui**, un compteur sur la carte ; les usages (fuite, relance, récupération) restent à la table, comme le dit la spec. | oui            |
| F-6 | **Bestiaire** : verser les profils du livre de base (une soixantaine) ? | **Oui**, transcrits du livre français avec la page ; ensuite des fiches comme les autres, que le MJ modifie. | oui            |

## 11. Correctifs de la bibliothèque (2026-11-13, validé, implémenté)

Retours du MJ sur Fabula, vrais pour tous les slugs à étiquettes.

### 11.1 Diagnostic

- **Étiquettes non posées** : le filtre et la recherche ne lisent que les étiquettes de la fiche. Le rang, l'espèce, la nature… choisis en pastilles dans la partie système vont dans `systemData` et rien ne les recopie en étiquettes. Seules les fiches versées par migration les ont (posées dans le SQL). Effet de bord : une fiche du catalogue passée de Soldat à Élite garde « Soldat ».
- **Pas d'autocomplétion** : le champ Étiquettes est un texte libre ; il faut retaper exactement une étiquette existante.
- **Onglet perdu au rechargement** (côté MJ) : Fabula et Zone Blanche gardent l'onglet en mémoire seulement (`useState('session')`). Les 11 autres interfaces MJ et les 13 fiches joueur le gardent déjà dans l'URL.
- **Bibliothèque** : deux états (normale, rail replié), pas d'état élargi.

### 11.2 Ce qui change

**Étiquettes pilotées par la fiche.** Le bloc `npc` du `config.jsx` déclare, groupe par groupe, les étiquettes tirées de la partie système (`systemTags(systemData) → [...]`). Dans le formulaire, choisir une pastille (rang, espèce…) pose aussitôt l'étiquette correspondante et retire l'ancienne du même groupe ; les étiquettes libres ne bougent pas. Le calcul est une fonction pure de la plateforme, testée.

| Slug | Étiquettes pilotées | Restent libres |
|---|---|---|
| Fabula | Rang (Soldat / Élite / Champion), Méchant, Espèce | |
| Dune | Rang | Faction, Livre |
| Achtung | Rang | Camp |
| Vampire | Nature | |
| Maledictum | Rôle | Faction (pas dans la fiche) |
| Nimble | Sbire, Légendaire, Niveau | Famille (pas dans la fiche) |

**Autocomplétion.** Sous le champ Étiquettes, les étiquettes déjà présentes dans la bibliothèque (hors celles de la fiche) en pastilles, filtrées par la saisie ; un clic l'ajoute, Entrée ajoute la saisie telle quelle.

**Onglet dans l'URL.** Fabula et Zone Blanche passent à `useHashTab(TABS, 'session')`, comme Maledictum.

**Colonne élargie.** Un troisième état de la colonne, gardé comme les deux autres : rail, normale, élargie. Il vaut pour la bibliothèque comme pour le formulaire de création et de modification (demande du MJ à l'implémentation).

### 11.3 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| B-1 | Une étiquette pilotée (ex. « Élite ») peut-elle être retirée ou ajoutée à la main dans le champ Étiquettes ? | **Non** : elle s'affiche dans le champ, grisée, sans croix ; on la change par la pastille de la fiche. Sinon la fiche et l'étiquette peuvent se contredire, et c'est le bug d'aujourd'hui. | |
| B-2 | Les fiches **déjà créées à la main** sans étiquettes : comment les rattraper ? | **À la lecture** : la bibliothèque calcule les étiquettes pilotées de chaque fiche avant de filtrer et de chercher, avec la même fonction. Les fiches existantes se retrouvent tout de suite, sans migration ni réenregistrement ; l'enregistrement suivant les écrit pour de bon. | |
| B-3 | Fabula : étiquettes plus fines (« Méchant mineur », « Champion (2) ») ? | **Non** : on garde les groupes actuels (Soldat, Élite, Champion, Méchant), le résumé de la ligne donne le détail. | |
| B-4 | Bibliothèque élargie : que devient la zone « À la table » ? | **Elle se réduit sans disparaître** : la bibliothèque prend les deux tiers environ, ses lignes passent sur deux colonnes ; la table reste une cible pour glisser une fiche. Bouton à côté de celui du rail (‹ / ›, ou une icône « agrandir »). | |
| B-5 | Planche avant de coder l'état élargi ? | **Oui, une planche rapide** (trois états côte à côte), puisque c'est une nouvelle disposition. | Non, pas de planche (2026-11-13) |

B-1 à B-4 : recos validées (2026-11-13).

### 11.4 Implémentation (2026-11-13)

- `features/npc/tools/npcTags.js` (`syncSystemTags`, `systemTagsOf`, `isSystemTag`) et son test : un groupe de `tagGroups` qui déclare `of(systemData)` est piloté ; `owns(tag)` facultatif dit quelles étiquettes le groupe reprend (défaut : sa liste ; Nimble : tout `Niv. …`).
- `TabNpcs` : la bibliothèque est lue avec les étiquettes de la fiche (B-2), le brouillon se resynchronise à chaque modification, état `wide` gardé avec les préférences de la bibliothèque, classe `is-aside-wide`.
- `NpcForm` : étiquettes pilotées verrouillées (B-1), suggestions des étiquettes de la bibliothèque (prop `suggestions`), bouton d'élargissement ; `NpcLibrary` : même bouton, liste sur deux colonnes en mode élargi.
- Slugs : `of` posé sur les groupes du tableau du §11.2 ; Fabula et Zone Blanche passent à `useHashTab`.

## 12. Fabula : sorts offensifs des PNJ (2026-11-13, validé, implémenté)

Demande du MJ : préciser si un sort est offensif ou défensif, et lancer un sort offensif comme une attaque.

**Constat** : les 28 sorts offensifs du bestiaire versé portent déjà `offensive: true`, mais le formulaire ne le montrait pas et la fiche n'avait pas de jet ; le test de magie et les dégâts ne sont que dans le texte (« Test de magie 【INT + VOL】+3. La cible subit【VH + 20】dégâts de ténèbres »).

**Ce qui change**
- Formulaire : pastilles Offensif / Défensif par sort ; un sort offensif montre les champs de jet d'une attaque : deux attributs, bonus au test de magie, dégâts « VH + » (vide : test sans dégâts), type.
- Fiche : un sort offensif a son bouton de jet, sous les attaques ; il ouvre la fenêtre de jet du MJ préremplie (attributs, bonus, dégâts, type).
- Bestiaire existant : sans champs de jet, ils sont lus dans le texte du sort (`spellRoll`, `fabula/config/npc.js`, testé). Les sorts versés ont leur bouton sans migration ; ouvrir la fiche dans le formulaire montre les valeurs lues, écrites en base dès qu'on modifie un sort de la liste (sinon la lecture du texte continue de servir, avec le même résultat).
- Brique `NpcItemList` : champ conditionnel `when(item)`.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| S-1 | Le jet vise la Défense magique, que la fenêtre ne connaît pas : ND facultatif comme pour les attaques ? | Oui. | Oui (2026-11-13) |
| S-2 | Décompter le coût en PM de la carte au lancer ? | Non pour l'instant : le coût n'est pas toujours un nombre (« 5 × C PM »). | Oui à la reco (2026-11-13) |

Données d'un sort : `{ name, cost, target, duration, offensive, attrs?: [a, b], magic?, damage?, type?, text }`.
