# Refonte du slug Cyberpunk (The Sprawl)

Lancée le 2026-11-06. Les règles du jeu restent celles de `sprawl_cyberpunk_fonctionnel_specs.md`, inchangées.

Planche : `documentations/cyberpunk/planche_cyberpunk.html` (autonome, bascules jour / nuit, manœuvres A / B, texte, animations).

## 1. Cadrage validé

| Sujet | Décision |
|---|---|
| Périmètre | Aspect, UX, correctifs. **Aucune règle touchée.** |
| Base conservée | Coins coupés, néon cyan / magenta / ambre, logo glitché et ferme d'éclairs, hexagones de stats, polices Cyberpunk / Rajdhani / CyberConsole, dépense d'XP (§14.5 des règles). |
| Horloges | **Réservées au MJ** (comme dans Kult) : jamais affichées aux joueurs. |
| Dés | 3D gardée. On travaille l'écran de résultat et le réglage par défaut (`diceConfigDefault`). |

## 2. Diagnostic

- Pas d'ambiance : une palette posée sur des cartes génériques, sans monde derrière.
- Jour et nuit presque identiques (deux sombres, seul le glow change).
- Style incohérent : coins coupés de la plateforme contre boutons arrondis du slug ; nombreux `style=` en dur qui échappent au thème.
- Icônes : emojis (menus, bouton Édition, sélecteurs d'horloge et de menace) et glyphes obscurs (⎚ pour les tags, ⊞ pour le catalogue).
- Tags : ajout par un interrupteur caché par carte.
- Ressources : jetons, Cred et XP mêlés dans une même rangée de compteurs.
- Jet : le résultat est une étiquette, sans montrer où le total tombe.
- MJ : 8 onglets ; Horloges et Menaces séparées alors que liées ; horloge épinglée sans effet hors de son onglet.
- Dette : détour `GMApp` → `gm/GMView.jsx` ; hauteurs codées en dur (`calc(100vh - 112px)`, `headerHeight={125}`).

## 3. Direction graphique (planche §1)

« Le Sprawl derrière le HUD » : l'interface est un HUD chromé (coins coupés, crochets d'angle, numéros de module, lectures en mono) ; la ville derrière change avec le mode.

- **Jour, smog** : ciel brun-ambre, soleil voilé, poussière, néons éteints ; l'ambre sodium devient la couleur principale.
- **Nuit, pluie et néons** : bitume bleu-noir, pluie, enseignes qui grésillent ; le cyan reprend la main.
- Glitch réservé aux événements (logo, tampon d'échec).
- Jeu d'icônes dessinées à la place de tous les emojis et glyphes.

### 3.1 Météo (v2, retours du 2026-11-06)

La météo est **indépendante du mode** : Auto (pluie la nuit, smog le jour), Pluie, Smog, Dégagé, dans les deux modes.

- **Smog = brouillard** (v3) : couches qui défilent à des vitesses différentes, plus denses au sol, ville et enseignes noyées ; poussière en suspension. La nuit, le brouillard prend la teinte des néons.
- Le **jour dégagé est net** : la brume ambre ne vient qu'avec le smog.
- **Projecteurs** gardés, mais la nuit par temps de pluie ou dégagé (ils ne font pas le smog). Un aérodyne passe en toile de fond.
- **Le MJ choisit la météo de la table** (Q-10), depuis son en-tête ; les joueurs la suivent ; chacun peut couper les animations chez lui. Implique un état de table (stockage + diffusion socket) : lot MJ.

### 3.2 Barres d'onglets (v3)

Onglets à leur largeur, alignés à gauche (fiche joueur et MJ) ; la droite de la barre porte l'information utile : la table en cours côté joueur, les **horloges épinglées** côté MJ (elles remplacent la bande séparée).

## 4. Fiche joueur (planche §2)

Mono-onglet, onglets Journal / Historique / Référence conservés.

- **Bande des ressources** en tête (validée) : Cred en credstick (− / +) ; [info] / [matos] / Retenue en losanges : **un clic consomme la ressource** (le losange disparaît), « + » en gagne une ; **au-delà de 5**, le nombre affiché suivi d'un seul losange (clic = −1). À côté, les **Tags** du personnage (et non « États » : ce sont des tags narratifs, spécialisation comprise).
- **XP** au bouton XP de l'en-tête (validée) : barre jusqu'au prochain avancement (10 XP), 5 losanges d'avancements de base.
- **Manœuvres : option B retenue.** Les manœuvres de base sont à côté de leur stat, au centre (clic = jet, description en infobulle) ; la colonne de droite, toujours visible, garde le playbook (acquises, puis à débloquer), avec un ascenseur habillé. Les infobulles passent par un portail : le cadre coupé (`clip-path`) les rognait.
- **Console personnalisable** (v3, idée du MJ) :
  - par défaut, la console montre les manœuvres de base (l'affichage actuel) : rien à faire pour qui ne veut pas s'en occuper ;
  - la colonne a trois onglets : Playbook · De base · Avancement ;
  - toute manœuvre **acquise** (de base, du playbook, ou personnalisée et validée) se **glisse sur la ligne de sa stat**, et seulement celle-là (elle s'allume pendant le glisser) ; les manœuvres sans stat vont sur « Sans jet fixe » ;
  - déposée sur une puce, elle se range avant elle (réordonner) ; ✕ au survol d'une puce la retire ; une épingle sur chaque carte fait la même chose qu'un glisser (tablette, clavier) ; un bouton revient au réglage de base ;
  - les manœuvres du playbook sont marquées d'un losange magenta dans la console ;
  - glisser-déposer natif, comme `ui/hooks/useDragOrder.js` : aucune bibliothèque ; piège vu sur la planche : le dépôt fait disparaître l'élément glissé, dont le `dragend` ne part alors plus. L'état « en cours de glisser » se nettoie donc **aussi au dépôt**, pas seulement au `dragend` ;
  - retenue **sur la fiche du personnage, en base** (Q-12) : une colonne JSON sur `characters` (liste ordonnée des identifiants de manœuvre posés ; vide = réglage de base), dans `cyberpunk-schema.sql` et par migration ; le MJ voit la même console ;
- **Colonne des manœuvres repliable** sur la droite (v4) : repliée, elle devient un rail vertical (libellé, nombre de manœuvres du playbook acquises) ; un clic la déplie et la fiche s'élargit d'autant. État retenu par le navigateur (`usePersistedState`) : c'est un confort d'affichage.
- **Disposition** : à gauche identité, chrome, matos ; au centre stats et manœuvres de base, relations ; à droite les manœuvres du playbook ; en bas, les directives sur toute la largeur (personnelles et de mission côte à côte).
- Identité en « scan », dark secret flouté jusqu'au survol ; relations avec jauge de Lien centrée sur 0.

### 4.1 Tags (v2)

- Le **type** (positif, neutre, négatif) se lit au liseré. Le « + » fait **partie du libellé** (convention du Sprawl), il n'indique pas le type.
- **Ajout** : « + tag » au bout de chaque liste (personnage, implant, relation, objet) ouvre une petite fenêtre :
  - champ de libellé, préfixe « + » ajouté d'office mais désactivable d'un clic (tous les tags n'en ont pas), jamais doublé si on le tape ;
  - type Neutre par défaut (Positif / Neutre / Négatif) ;
  - suggestions de l'entité (`TAG_SUGGESTIONS_BY_TYPE`) rangées en trois colonnes par type et filtrées par la saisie ; un clic ajoute le tag avec son type ; celles déjà posées sont grisées ;
  - Entrée ajoute et laisse la fenêtre ouverte pour enchaîner, Échap ferme.
- **Clic sur un tag** : menu pour changer son type ou le retirer (remplace l'interrupteur « ⎚ » et la croix).
- Aucune donnée ne change (`tags.tag_text`, `tags.tag_variant`). La fenêtre et le menu passent par un portail (`HostedModal`) pour sortir des cadres coupés et des fenêtres flottantes.

## 5. Jet (planche §3)

Formule visible (2d10 + stat + Synth + modificateur) ; après le jet, le total se place sur la bande 9- / 10-14 / 15+, avec un tampon du résultat. L'entrée d'historique et la notification reprennent une mini-bande (même composant).

## 6. MJ (planche §4)

- Onglets : Session · Opération · Manœuvres · Historique · Journal · Tableau · Référence.
- **Opération** = Horloges + Menaces : chaque menace porte ses horloges ; colonne des horloges libres ; filtre Table / Campagne / Toutes. Aucune donnée ne change (table `clock_threats` existante).
- **Horloges en camembert**, ambre aux deux tiers, rouge pulsé une fois pleine.
- **Horloges épinglées** à droite de la barre d'onglets, sur tous les onglets MJ ; **météo de la table** dans l'en-tête MJ.
- Session : agents en vignettes de flux (en ligne, jetons, état) ; fiche ouverte à côté.
- **Fiche unifiée** (2026-11-07) : la vue MJ du personnage est la même fiche que celle du joueur (`SheetBody`, `useSheetEditor`), avec ces différences :
  - une carte « Ressources et progression » (Cred, jetons, XP, avancements de base, tags) au lieu de la bande en tête ;
  - la console du joueur en lecture seule ;
  - aucun jet : le MC ne lance pas les dés, un clic montre la description ;
  - les corrections par le même mode Édition que le joueur ;
  - la case « accomplie » des directives ;
  - une barre d'actions : copier les accès, envoyer un objet, envoyer une note.

## 7. Questions

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-1 | Jour « smog » (ambre devant, néons éteints) et nuit « pluie et néons » (cyan devant) ? | Oui | Ambiance validée ; météo séparée du mode (§3.1) |
| Q-2 | Manœuvres : A (tout dans la colonne, base en lignes compactes) ou B (base à côté des stats, playbook dans la colonne) ? | B | **B retenue** |
| Q-3 | Texte courant : Rajdhani (actuel) ou Chakra Petch ? | Chakra Petch | **Rajdhani** |
| Q-4 | Onglet Opération et bande des horloges épinglées ? | Oui | **Oui** (épinglées à droite de la barre d'onglets, §3.2) |
| Q-5 | Horloges en camembert à la place des barres segmentées ? | Oui | **Oui** |
| Q-6 | Icônes d'horloges et de menaces : jeu dessiné à la place des emojis (images envoyées gardées, anciens emojis toujours affichés) ? | Oui | **Oui** |
| Q-7 | Jetons cliquables dans une bande en tête de fiche, XP réunie au bouton XP ? | Oui | **Validé**, avec consommation au clic et nombre au-delà de 5 (§4) |
| Q-10 | Météo : réglage de chacun dans son menu, ou **météo de la table** choisie par le MJ et suivie par les joueurs (chacun gardant « couper les animations » chez lui) ? | Météo de la table | **Le MJ** |
| Q-11 | Ajout de tag (§4.1) : « + » d'office désactivable, Neutre par défaut, suggestions par type, clic sur un tag = changer de type ou retirer ? | Oui | **Validé** |
| Q-12 | Console personnalisée : où la retenir ? Navigateur du joueur (aucune migration, mais perdue sur un autre appareil et invisible du MJ) ou fiche du personnage en base (une colonne JSON + migration ; suit le joueur partout, le MJ voit la même console) ? | Fiche en base : c'est la façon dont le personnage joue, pas un confort d'affichage | **Fiche en base** |
| Q-13 | Les manœuvres **de Synth** (Pénétrer un système, Renom…) se posent sur Synth : c'est leur ligne, c'est acquis. Mais une manœuvre d'une **autre stat** (ex. Évaluer, Pro) peut-elle aussi se poser sur Synth, au titre de la substitution par un implant ? | Non : la substitution reste l'interrupteur Synth de la fenêtre de jet, validée par le MJ ; sinon l'app trancherait une règle de table | **Non** : la substitution passe par l'interrupteur Synth de la fenêtre de jet |
| Q-8 | Dés par défaut : garder l'actuel ou essayer « Chrome » (acier sombre, chiffres ambre) dans l'app ? | Essayer Chrome | **Essayer Chrome** |
| Q-9 | Ordre des lots : 1 thème et icônes · 2 fiche · 3 jet et historique · 4 MJ (Opération, Session) · 5 dés par défaut et correctifs ? | Oui, thème d'abord comme Fabula | **Oui** (§8) |

## 8. Lots (validés le 2026-11-06)

Planche = référence du thème. Chaque lot se vérifie à l'écran avant le suivant.

| Lot | Contenu |
|---|---|
| 1 | Thème : tokens jour / nuit, monde derrière l'interface (ville, météo Auto / Pluie / Smog / Dégagé, animations coupables), panneaux du HUD, boutons, habillage des briques `vtt-*`, jeu d'icônes (plus d'emojis ni de glyphes), onglets à leur largeur. Météo en Auto tant que le lot 4 n'est pas fait. |
| 2 | Fiche : bande des ressources, XP au bouton, disposition (identité / chrome / matos, console, colonne repliable, directives en bas), console personnalisable (colonne en base + migration), tags (ajout et menu). |
| 3 | Jet et historique : formule, bande 9- / 10-14 / 15+, tampon ; entrée d'historique et notification avec mini-bande. |
| 4 | MJ : onglet Opération, horloges en camembert, horloges épinglées dans la barre, icônes dessinées des horloges et menaces, Session en vignettes de flux, météo de la table (état de table + diffusion). |
| 5 | Dés par défaut (essai « Chrome »), correctifs : détour `GMApp` → `gm/GMView.jsx`, hauteurs codées en dur, `style=` restants. |

## 9. Création de personnage (chantier du 2026-11-07, en discussion)

### 9.1 Cadrage

- Aspect : panneaux du HUD, icônes dessinées, ville derrière, bouton jour / nuit dans l'en-tête (comme la fiche).
- Disposition pleine largeur en trois zones : **rail des étapes** à gauche, **étape en cours** au centre, **dossier de l'opérateur** à droite (le personnage se remplit en direct).
- Étapes : Archétype · Identité · Stats · Manœuvres · Directives · Relations · **Chrome** · **Matos** · Finalisation. Relations et Chrome sont séparés ; Matos est nouveau.
- Retour libre aux étapes déjà faites. Changer d'archétype réinitialise ce qui en dépend, après avertissement.
- Seules les étapes dont dépend la suite bloquent « Suivant » : **archétype**, **manœuvres**, **chrome**. Identité, stats, directives, relations et matos se finissent quand on veut : repère « à finir » au rail, liste de ce qui manque à la Finalisation, création possible une fois tout complet (2026-11-07).
- Règles : le livre a servi de base, mais le système est **entièrement personnalisé par le MJ**. Les catalogues de la config font foi, sans correspondance avec le livre. Les listes de cyberwares par archétype de `PLAYBOOKS` (noms du livre, absents du catalogue) sont obsolètes.

### 9.2 Chrome

- **Socle commun** (tous les personnages, hors slot, affiché en une ligne fixe du bloc Chrome) : **une prise** dans le cou, une **mémoire interne basique**, la **lecture des chips**. Une seule prise = **une seule chip insérée à la fois**.
- Choix dans le **catalogue de la fiche** (`CYBERWARE_ALL`), avec les mêmes lignes que sur la fiche : catégorie, option, tags.
- **Cyberware de l'archétype** : choisi dans une **liste propre à l'archétype**, composée d'entrées du catalogue (à redéfinir : les listes actuelles portent les noms du livre).
  - **Assassin** : un cyberware de l'archétype en plus (2 au total).
  - **Netrunner** : la **console est son chrome imposé**, au choix : **Cyberconsole intégrée** (impossible à confisquer) ou **Prise de console** (prise dédiée implantée, qui laisse la prise du socle libre pour les chips) avec le **deck externe** en objet dans son kit (confiscable, personnalisable, nommable). Il prend ensuite 1 cyberware de sa liste, comme les autres.
- **Fashionware offert** (facultatif) : un implant cosmétique (Techhair, Shift Tacts, Skinwatch, Câblage EMP…), hors slot et sans défaut. Les personnages existants ne changent pas.
- **Cyberware offert** : un, pris **dans tout le catalogue**, mais **de mauvaise qualité** : il arrive avec des tags négatifs, d'autant plus nombreux que l'implant est puissant (un Kerenzikov en porte 2 ou 3). Voir Q-C11 et Q-C12.
- Un de plus seulement avec la manœuvre **Chromé** prise à la création (Q-C13).
- Certains éléments imposent des tags ou un choix dans une liste définie (§9.4).

### 9.3 Matos

- **5 Cred** au départ.
- **Kit à choix par archétype**, gratuit : des groupes du type « 1 arme parmi X », adaptés au playbook (on n'arme pas un Rockerboy comme un Solo). Exemple : le Nomad a **forcément un véhicule** ; il n'est personnalisé et nommé qu'avec la manœuvre Rig.
- **Objet personnalisé** (règle de l'univers, valable aussi en jeu) : un accessoire ajoute un tag sans plus (un silencieux donne +silencieux). Une **personnalisation poussée** (un canon sur une moto, un pilotage à distance) oblige à **nommer** l'objet : il devient un objet auquel le personnage tient. Le nom donné **remplace le nom de l'objet** sur la fiche (Q-C14).
- L'app ne tranche pas ce qui est « poussé » : en jeu, le nom reste modifiable librement et c'est la table qui décide. À la création, le nom est exigé seulement là où un playbook ou une manœuvre le prévoit (§9.7).
- **Chips** : des objets (catégorie nouvelle), achetables en Cred, lus par la prise du socle. Chips de compétence (Karaté, Pilotage, Armes de poing… : « +1 continu tant qu'elle est insérée ») et **chip de comm** (communiquer par la tête, en infiltration par exemple). Une chip occupe la prise : en porter deux demande une **Prise supplémentaire** (cyberware, ex-Prise de Chipware).
- **Communicateur** : le portable « à l'ancienne », externe, non relié à la tête. Le **Neuralink** reste l'OS implanté qui intègre tout, comms comprises.
- Ensuite, **achat** dans le catalogue au prix de l'objet. Un objet sans prix n'est pas achetable.
- Objets **vendus par lot** (grenades) : le prix vaut pour la quantité indiquée (`quantity`), qui arrive sur la ligne de l'objet.
- **Défaut d'achat** : un objet acheté à prix de création peut exiger un tag négatif, pris dans sa liste (`negative_tags`) ; c'est ce qui le rend si peu cher. Un défaut **par objet acheté** : la même arme achetée deux fois donne deux lignes, chacune son défaut ; un achat par quantité (3 grenades) n'en prend qu'un. Le **kit** offert n'en prend pas.
- Les prix et ces défauts ne valent **qu'à la création** : rien ne s'applique ensuite.
- La **Cred non dépensée reste sur la fiche**.

### 9.4 Données de la config (remplies par le MJ)

| Donnée | Où | Rôle |
|---|---|---|
| `price` | objets | Prix en Cred à la création ; absent = pas achetable |
| `quantity` | objets | Unités reçues pour ce prix (1 par défaut) ; ex. grenades |
| `negative_tags` | objets | Défaut à prendre parmi cette liste pour l'acheter à ce prix |
| `tags` (existant) | objets et cyberwares | Tags imposés |
| `tagChoices` | objets et cyberwares | Choix dans une liste définie, au cas par cas : `[{ pick: 1, from: ['…', '…'] }]` |
| `cyberware` | chaque archétype de `PLAYBOOKS` | Liste du cyberware de l'archétype, en noms du catalogue ; nombre à choisir (2 pour l'Assassin) ; console imposée du Netrunner (intégrée ou Prise de console) |
| `kit` | chaque archétype de `PLAYBOOKS` | Groupes du kit : `[{ label: 'Arme', pick: 1, from: ['…'] }]` ; un groupe peut être imposé (véhicule du Nomad) |
| `STARTING_CRED` | config | 5 |

Base : `character_items.quantity` existe déjà (lots) et les tags passent par la table `tags` (déjà là). La Cred restante va dans la Cred de la fiche. Aucune migration : le nom donné remplace le nom de l'objet (Q-C14).

### 9.5 Hors périmètre

- Acheter du chrome en jeu (Cred + charcudoc + éventuellement un jet ; neuf, occasion ou provenance inconnue jouant sur les tags négatifs) : géré à la table. Voir Q-C8.

### 9.6 Questions

| # | Question | Reco | Réponse                                                                                                                                                                                               |
|---|---|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-C1 | Chrome à la création : 2 pour tous (base + offert), 3 avec Chromé. L'Assassin garde-t-il un cyberware de plus (règle du livre) ? | Non : même règle pour tous, le système est personnalisé | **Oui**, l'Assassin a un cyberware en plus ; le Netrunner aussi, mais restreint à certaines possibilités (§9.2)                                                                                       |
| Q-C2 | Liste du Chrome : catalogue entier rangé par catégorie, ou des suggestions par archétype en tête ? | Catalogue entier ; suggestions par archétype seulement si tu les déclares (champ facultatif dans `PLAYBOOKS`), les anciennes listes du livre sont retirées | Le **1er** est confiné à la liste de l'archétype ; l'**offert** se prend dans tout le catalogue, mais de mauvaise qualité (tags négatifs, §9.2)                                                       |
| Q-C3 | Kit : commun à tous, ou propre à chaque archétype ? | Un kit commun, surchargeable par archétype dans la config si tu le veux | **Par archétype** ; objets personnalisés et nommés (§9.3)                                                                                                                                             |
| Q-C4 | Contenu du kit : tu l'écris, ou je propose une première version à corriger ? | Je propose, marquée « à corriger » | proposition puis je regarde/corrige                                                                                                                                                                   |
| Q-C5 | Lots : peut-on acheter plusieurs lots du même objet (quantités cumulées sur une seule ligne) ? | Oui | oui                                                                                                                                                                                                   |
| Q-C6 | Choix de tags : obligatoires pour valider l'étape ? Et la même fenêtre de choix quand on ajoute l'élément depuis le catalogue de la fiche en jeu ? | Oui aux deux : même composant, création et fiche cohérentes | À voir au cas par cas : tags imposés ou choix dans une liste définie (§9.4, `tags` + `tagChoices`)                                                                                                    |
| Q-C7 | Peut-on acheter du chrome avec les 5 Cred de création ? | Non : le chrome de création suit §9.2 seulement | non                                                                                                                                                                                                   |
| Q-C8 | Provenance du chrome en jeu (neuf / occasion / inconnue → tags négatifs proposés à l'ajout depuis le catalogue) : dans ce chantier ou plus tard ? | Plus tard (backlog) : ce chantier reste la création | C'est pas une info capitale ça franchement                                                                                                                                                            |
| Q-C9 | Listes du cyberware par archétype (et kits) : tu les écris dans la config, ou je propose une première version, à partir du catalogue, que tu corriges ? | Je propose, marquée « à corriger » ; c'est toi qui fais foi | **Proposition** : §9.7                                                                                                                                                                                |
| Q-C10 | Netrunner : quelle est la liste restreinte de son cyberware en plus (cyberconsole intégrée, prise de chipware…) ? | À toi : je la mets dans la proposition de Q-C9 | **Oui** : §9.7                                                                                                                                                                                        |
| Q-C11 | Cyberware offert : combien de tags négatifs ? Fixé par implant dans la config (champ `defects`), ou déduit de son prix (paliers que tu fixes) ? | Champ `defects` par implant (1 par défaut) : clair, sans dépendre des prix en jeu | **Champ `defects`** : §9.7                                                                                                                                                                            |
| Q-C12 | Ces tags négatifs : le joueur les choisit (suggestions de tags négatifs, texte libre), ou ils sont imposés par la config, ou laissés au MJ après création ? | Le joueur les choisit dans les suggestions ou les écrit ; le MJ peut les reprendre en mode Édition | **Le joueur**, modifiables ensuite sur la fiche                                                                                                                                                       |
| Q-C13 | Le cyberware dû à Chromé : comme l'offert (tout le catalogue, mauvaise qualité) ou comme celui de l'archétype (liste, sans défaut) ? | Comme l'offert : tout le catalogue, avec défauts | **Comme l'offert** (voir Q-C17)                                                                                                                                                                       |
| Q-C14 | Objet personnalisé et nommé : où ranger le nom ? Le nom donné remplace le nom de l'objet (le modèle du catalogue va dans la description, sans migration), ou une colonne `model` en plus (migration ; fiche « La Veuve · Moto ») ? | Colonne `model` : le modèle reste lisible et l'objet se retrouve dans le catalogue | **Le nom remplace** celui de l'objet, sans migration                                                                                                                                                  |
| Q-C15 | Personnaliser à la création : le véhicule du Nomad seulement, ou tout objet du kit ? Combien de tags ajoutés, et gratuitement ou contre de la Cred ? | Tout objet du kit, 1 tag ajouté gratuit par objet personnalisé ; au-delà c'est la Cred en jeu | **Selon les playbooks et certaines manœuvres** : §9.7                                                                                                                                                 |
| Q-C16 | Manœuvres qui donnent du matos personnalisé à la création (§9.7) : la liste est-elle complète, et les tags à ajouter sont-ils libres (texte + type) ou pris dans une liste ? | Liste complète à vérifier ; tags libres avec suggestions, nombre fixé par la manœuvre | Normalement les moves sont tous correct mais faut faire le tour oui                                                                                                                                   |
| Q-C17 | Le texte de **Chromé** (Fixer) dit « dans ta liste d'archétype », ce qui contredit Q-C13. Et le **Chromé du Techie** ne donne pas de cyberware (accès aux charcudocs) : il ne compte pas à la création ? | Q-C13 fait foi, je corrige le texte de la manœuvre ; Chromé du Techie ignoré à la création | **Oui** : Chromé = même texte pour tous (un cyberware de plus, tout le catalogue, mauvaise qualité), Netrunner compris (fin de la mention « Cyberdeck externe ») ; Chromé du Techie inchangé, sans effet à la création. Migration des manœuvres officielles |
| Q-C18 | Cyberdeck **externe** du Netrunner : il n'existe pas dans le catalogue des objets. On l'ajoute (kit du Netrunner, quand il ne prend pas la Cyberconsole intégrée) ? | Oui, avec des tags que tu fixes | Oui il doit faire un choix, cyberconsole à l'ancienne ou intégré mais il doit forcément prendre une cyberconsole, c'est sonchrome par défaut imposer, c'est pour ça qu'il a un choix de plus pour moi. |

### 9.7 Proposition (Q-C9 à Q-C11), à corriger

Noms tirés des catalogues de la config. Les manœuvres citées sont celles des playbooks en base.

**Cyberware de l'archétype**

| Archétype | Liste | Nombre |
|---|---|---|
| Fixer | Neuralink & Comms · Puce de Mémoire · Cyberoptiques · Synthétiseur Vocal · Peau Synthétique · Face-plate | 1 |
| Netrunner | Console imposée : Cyberconsole intégrée **ou** Prise de console (+ deck externe au kit) — puis 1 parmi : Neuralink & Comms · Prise supplémentaire · Puce de Mémoire · Cyberoptiques | 1 + console |
| Solo | Kerenzikov · Câblage Nerveux · Cyberarmement de corps · Blindage Sous-cutané · Cyberoptiques · Cyberaudition · Prise supplémentaire | 1 |
| Investigator | Cyberoptiques · Cyberaudition · Radar / Sonar · Neuralink & Comms · Puce de Mémoire · Prise supplémentaire | 1 |
| Nomad | Lien de Pilotage (imposé, comme aujourd'hui) | 1 |
| Rockerboy | Cyberarmement de corps · Neuralink & Comms · Techhair · Peau Synthétique · Synthétiseur Vocal · Cyberoptiques | 1 |
| Media | Enregistreur de Braindance · Neuralink & Comms · Cyberoptiques · Cyberaudition · Puce de Mémoire | 1 |
| Edgerunner | Prise supplémentaire · Neuralink & Comms · Câblage Nerveux · Kerenzikov · Cyberoptiques · Cœur Synthétique | 1 |
| Techie | Cyberbras · Neuralink & Comms · Prise supplémentaire · Lien de Pilotage · Cyberoptiques | 1 |
| Assassin | Cyberarmement de corps · Blindage Sous-cutané · Cyberbras · Greffe Musculaire · Sandevistan · Kerenzikov · Slice 'N Dice · Cyberoptiques · Optique de Camouflage · Articulations Silencieuses | 2 |

**Défauts du cyberware offert** (`defects`, nombre de tags négatifs) :
- 1 par défaut : cosmétique, utilitaire, sensoriel simple (Techhair, Skinwatch, Poche de Rangement, Puce de Mémoire, Cyberaudition…) ;
- 2 : combat, protection, membres, sens avancés (Câblage Nerveux, Slice 'N Dice, Blindage Sous-cutané, Cyberbras, Cyberjambes, Greffe Musculaire, Optique de Camouflage, Cyberoptiques, Cyberconsole intégrée…) ;
- 3 : lourd ou rare (Kerenzikov, Sandevistan, Module Berserk, Cyberarmement de corps, Second Cœur, Châssis Linéaire, Monture Multi-Optique).

Cyberarmement de corp : doit obligé un choix sur le type (gorille, monocable, lame mantis, canon, lance grenade...etc.)

**Kits** (gratuits ; « 1 parmi » sauf mention)

| Archétype | Groupes                                                                                                                                                                                                                                                                            |
|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Fixer | Arme de poing : Pistolet de poche · Pistolet semi-automatique · Revolver léger — Protection : Vêtements renforcés · Veste de protection — Communicateur (imposé) — Outil : Générateur de White Noise · Scanner biométrique de poche · Kit de déguisement                           |
| Netrunner | Arme : Pistolet de poche · Pistolet à fléchettes · Taser — Vêtements renforcés (imposé) — Outil : Sniffer Wi-Fi · Injecteur de Virus physique · Brouilleur de signal · Puce daemon (piratage de cam, brouilleur...etc.) — Deck externe (imposé avec la Prise de console, Q-C18)    |
| Solo | Arme principale : Fusil d'assaut · Fusil de combat · Fusil à pompe · Pistolet-mitrailleur — Arme de poing : Pistolet lourd · Revolver lourd · Pistolet semi-automatique — Arme blanche : Couteau · Épée · Machette · Katana — Protection : Gilet pare-balles · Veste de protection |
| Investigator | Arme de poing : Pistolet semi-automatique · Revolver lourd · Pistolet lourd — Veste de protection (imposée) — Outil : Balise traçante · Matériel d'enregistrement · Scanner biométrique de poche — Communicateur (imposé)                                                          |
| Nomad | Véhicule (imposé ; personnalisé et nommé seulement avec Rig) : Moto · Voiture · Van utilitaire · Voiture de course — Arme : Fusil à pompe · Pistolet lourd · Fusil de combat — Veste de protection (imposée)                                                                       |
| Rockerboy | Arme : Pistolet de poche · Revolver léger · Matraque · Couteau — Vêtements renforcés (imposé) — Matériel d'enregistrement · Drogue ; instrument en objet libre                                                                                                                     |
| Media | Arme : Pistolet de poche · Taser — Vêtements renforcés (imposé) — Matériel d'enregistrement (imposé) — Outil : Balise traçante · Sniffer Wi-Fi · Communicateur                                                                                                                     |
| Edgerunner | Arme principale : Fusil d'assaut · Pistolet-mitrailleur · Fusil à pompe — Arme de poing : Pistolet lourd · Pistolet semi-automatique — Gilet pare-balles (imposé) — Soutien : Traumapatch · Airhypo · Grenades à fragmentation (1 lot)                                             |
| Techie | Arme : Pistolet semi-automatique · Taser · Fusil à pompe — Veste de protection (imposée) — Trousse spécialisée (imposée) — Outil : Découpeur thermique · Pistolet à grappin magnétique · Sniffer Wi-Fi. **Avec Expert pris à la création** : le groupe Outil est remplacé par l'outillage de sa sphère (tableau ci-dessous) |
| Assassin | Arme : Fusil de précision · Pistolet lourd · Épée ou machette — Arme de jet : Couteau · Shurikens ou lames de jet — Tenue : Vêtements renforcés · Combinaison furtive                                                                                                              |

Remarque concernant le Techie, il est très versatile et permet en fonction de la spécialisation d'en faire un pur techie qui fait du matos custom, monte des trucs sur des armes etc ou bien d'en faire un charcudoc et là faudrait adapter le matos je pense pour que cela représente le côté versatile.

**Outillage de sphère du Techie** (seulement avec **Expert** pris à la création ; sinon kit standard) :

| Sphère | Outillage |
|---|---|
| Armurier | Kit d'armurier (nouveau) + Silencieux |
| Artificier | Explosifs (1 lot) |
| Cybernéticien | Trousse spécialisée (option : cyber) |
| Électronicien | Station de réparation microélectronique |
| Mécano | Trousse spécialisée (option : mécanique) |
| Médecin | Kit médical d'urgence + Airhypo |

Avec **Intérêts diversifiés** (deuxième sphère), l'outillage se prend dans l'une ou l'autre sphère, pas les deux. Le mécanisme est générique : un groupe du kit qui dépend d'une manœuvre et d'un choix.

**Outillage de spécialisation de l'Edgerunner** (seulement avec **Spécialisation opérationnelle** prise à la création ; remplace le groupe Soutien ; avec Spécialisation étendue, l'une ou l'autre) :

| Spécialisation | Outillage |
|---|---|
| Démolition | Explosifs (1 lot) |
| Combat rapproché / CQC | Couteau · Épée · Machette · Katana (1 parmi) |
| Tir de précision | Fusil de précision |
| Commandement de terrain | Communicateur + Brouilleur de signal |
| Infiltration tactique | Combinaison furtive |
| Guerre électronique | Brouilleur de signal + Sniffer Wi-Fi |
| Médecine de combat | Kit médical d'urgence + Traumapatch |
| Pilotage sous pression | Moto |

**Manœuvres qui ajoutent du matos personnalisé et nommé à la création** (Q-C16, relevées dans la base de dev : les manœuvres du schéma sont périmées, voir les constats) :

| Manœuvre | Effet à la création |
|---|---|
| Rig (Nomad) | Le véhicule du kit devient rigué : profil Puissance / Aspect / Défaut = 3 tags ajoutés (positif, neutre, négatif), nommé |
| Arme personnalisée (Assassin) | Une arme de base + 2 options (2 tags ajoutés), nommée |
| Opérateur de drones (Techie) | 1 drone du catalogue, profil défini (locomotion, gabarit, capacités) en tags, nommé |
| Flotte de drones (Techie) | Un second drone, même règle |
| Expert / Intérêts diversifiés (Techie) | Outillage de la sphère (tableau ci-dessus) |
| Spécialisation opérationnelle / étendue (Edgerunner) | Outillage de la spécialisation (tableau ci-dessus) |
| Daemon / Daemon avancé (Netrunner) | Tag sur la console (§9.8) |

**Entrées à ajouter ou modifier dans les catalogues** :
- Cyberware : **Prise supplémentaire** (remplace Prise de Chipware), **Prise de console** (Netrunner) ; **Puce de Mémoire** recentrée en mémoire blindée (souvenirs protégés de l'effacement et de l'intrusion), la mémoire basique étant au socle.
- Objets : **Deck externe** ; catégorie **Chips** (chips de compétence, chip de comm, **chip daemon**) ; **Épée**, **Machette** et **Katana** à la place d'« Épée ou machette » ; **Drogue** : un seul objet, la nature de la drogue passe par ses tags (pas par le nom, qui demande le mode Édition) ; **Kit d'armurier**.
- **Options des implants** (2026-11-07) : les `optionHint` deviennent des choix (`tagChoices`), en création et depuis le catalogue de la fiche. Capacité → tag ; variante ou modèle → champ « option » + son tag. Cyberoptiques : +zoom d'office, 1 spécialisation ; Cyberaudition 1 ; Neuralink 2 fonctions (rien d'office) ; Cyberconsole intégrée 2 modules ; Peau synthétique 1 ; Monture multi-optique 2 ; Cyberbras et Cyberjambes 1 variante ; Châssis 1 modèle. Sandevistan et Module Berserk : pas de choix de marque, leurs tags négatifs se choisissent (3 offert, 2 pris dans la liste de l'archétype : `archetypeDefects`).
- **Cyberarmement de corps** : type obligatoire (`tagChoices` 1 parmi Gorille, Monocâble, Lames Mantis, Canon, Lance-grenade…) ; aujourd'hui les trois types sont tous posés en tags.
- **Salle de chirurgie portable** (validé) : gardée pour le jeu (clinique d'un Techie Médecin ou Cybernéticien) avec +encombrant et +intransportable sans véhicule, hors kits et sans prix au départ.
- Listes de la référence (contacts, informateurs, spécialisations, daemons, expertises) : aujourd'hui en dur dans `ReferenceTab.jsx`. Elles passent dans la config pour servir à la fois à l'aide de jeu et aux choix de la création (une seule source).

**Constats sur la config** (signalés, pas encore corrigés) :
- `ITEMS_ALL` : Traumapatch, Exosquelette gyroscopique et Salle de chirurgie portable apparaissent deux fois.
- `CYBERWARE_ALL` : catégories écrites tantôt en minuscules (`neural`), tantôt avec une majuscule (`Neural`, `Armement`…). Seules les minuscules ont un libellé dans `ITEM_AND_CYBERWARE_CATEGORY_LABEL`.
- **Schéma périmé** : les manœuvres insérées par `cyberpunk-schema.sql` sont celles d'avant la refonte du 30/05/2026 (Magouilles, Clan, Vétéran de la 4ème Corpo War…). La refonte n'existe que dans les migrations `30052026_*`. Une base neuve (nouvelle installation, bancs de test serveur) part donc avec les anciennes manœuvres. À réaligner : le schéma doit produire les manœuvres de la base actuelle.
- **Fixer** : deux manœuvres « Chromé » en base (id 24 et 151).
- **Edgerunner** : manœuvres Réseau de contacts / Réseau étendu, mais pas de liste de contacts dans la référence (Q-C24).

Je pense qu'il faut supprimer "Salle de chirurgie portable" ça me parait trop opé comme truc ou alors faut lui mettre des tags encombrant, pèse une tonne, intransportable sans véhicule... 

### 9.8 Tags narratifs donnés par les manœuvres

Les manœuvres dont le texte dit « il devient un tag narratif » (personnes, contacts, identités, statut, spécialisation, daemons) posent automatiquement ce tag. Ce tag est **verrouillé** : on ne peut pas le retirer sur la fiche, sauf en **mode Édition**. Même règle à la création et en jeu (Q-C20) ; retirer la manœuvre en mode Édition retire son tag (Q-C22).

Relevé dans la base de dev (Q-C19 corrigée : la première liste venait du schéma périmé) :

| Playbook | Manœuvre | Tag posé | Choix à la pose |
|---|---|---|---|
| Assassin | Fantôme · Double vie | +identité de couverture : … | libellé libre (défini avec le MC) |
| Assassin | Réseau de contacts · Réseau étendu | +contact : … | liste de la référence (Assassin) |
| Edgerunner | Spécialisation opérationnelle · Spécialisation étendue | +<spécialisation> | liste de la référence (Edgerunner) |
| Edgerunner | Réseau de contacts · Réseau étendu | +contact : … | liste à créer, sur la base du Solo (Q-C24) |
| Fixer | Mon équipe · Deuxième équipe | +équipe : … | libellé libre (défini avec le MC) |
| Fixer | Réseau de contacts · Réseau étendu | +contact : … | liste de la référence (Fixer) |
| Investigator | Informateurs · Réseau étendu | +informateur : … | liste de la référence (Investigator) |
| Media | Identité de couverture | +identité de couverture : … | libellé libre |
| Media | Carte de presse | +figure publique | — |
| Media | Contacts · Réseau étendu | +contact : … | liste de la référence (Media) |
| Netrunner | Daemon · Daemon avancé | +daemon … **sur la console** (cyberware ou deck externe) | liste de la référence (daemons) |
| Nomad | Contacts · Réseau étendu | +contact : … | liste de la référence (Nomad) |
| Rockerboy | Célèbre | +célèbre | — |
| Rockerboy | Fanbase · Fanbase extrême | +fanbase : … / +fanbase extrême : … | libellé libre |
| Rockerboy | Contacts · Réseau étendu | +contact : … | liste de la référence (Rockerboy) |
| Solo | Contacts | +contact : … | liste de la référence (Solo) |
| Techie | Expert · Intérêts diversifiés | +<sphère> | liste de la référence (expertises) |

Les manœuvres disent « sur ton personnage **ou une relation** » : à la création, le tag va sur le personnage (Q-C23).

Données : la correspondance manœuvre → tag vit dans la config (par playbook et nom de manœuvre). Base : une colonne `locked` sur la table `tags` (schéma + migration `-- systems: cyberpunk`). Sur la fiche, un tag verrouillé ne propose pas « Retirer » hors mode Édition.

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-C19 | La liste ci-dessus est-elle la bonne (Fantôme et Vétéran sont plutôt des réseaux que des personnes) ? | À toi de trier | Fantôme = une identité de couverture en plus (+identité de couverture) ; Vétéran n'existe plus (schéma périmé). Liste refaite depuis la base |
| Q-C20 | Une manœuvre prise **en jeu** (avancement XP) pose aussi son tag, avec le même choix au besoin ? | Oui : même règle à la création et en jeu, sinon les fiches divergent | **Oui** |
| Q-C21 | Spécialisations : en base, seul le Techie en a (Expert). Y en a-t-il d'autres dans ta façon de jouer, hors manœuvres en base ? | À toi ; le mécanisme du kit est générique | **Edgerunner** : Spécialisation opérationnelle / étendue (outillage proposé §9.7) |
| Q-C22 | Retirer la manœuvre (mode Édition) retire-t-il son tag ? | Oui, s'il est encore verrouillé | **Oui** |
| Q-C23 | Contacts et identités : les manœuvres disent « sur ton personnage ou une relation ». À la création : tag sur le personnage seulement, ou aussi une relation créée d'office (nom à remplir) ? | Tag sur le personnage seulement : la relation se crée en jeu si le contact prend de l'importance | **Oui** |
| Q-C24 | Edgerunner : quelle liste pour Réseau de contacts / Réseau étendu ? Il n'en a pas dans la référence | Reprendre celle du Solo, ou tu en écris une | Proche de l'Assassin et surtout du Solo : je pars de la liste du Solo, à ajuster |
| Q-C25 | **Chip daemon** du kit Netrunner et manœuvre **Daemon** : la chip est un daemon à usage limité (ou portable par un non-Netrunner), la manœuvre un daemon installé sur la console ? | Oui : chip = objet consommable ou amovible, manœuvre = tag verrouillé sur la console | La console a une **mémoire interne** qui stocke des daemons ; la manœuvre = ce daemon est dans ta mémoire ; mémoire extensible par du chrome. Une **chip** est limitée en utilisations ; Extraire des données peut la copier dans la mémoire de la console (usage illimité, dans la limite de la capacité) |
| Q-C26 | Schéma périmé (constats §9.7) : je le réaligne sur la base actuelle dans ce chantier ? | Oui : la création s'appuie sur les manœuvres, et les bancs de test partent du schéma | **Oui** |
| Q-C27 | Mémoire de la console : capacité de base (nombre de daemons) et extension (option « +slots mémoire » de la Cyberconsole, Prise de console…) ? L'app la compte-t-elle (« Daemons 2/3 » sur la ligne de la console, sans bloquer) ou la laisse-t-elle à la table ? | Affichage du compte sans blocage ; la copie d'une chip se fait à la main (le joueur pose le tag du daemon sur sa console) | **Oui** (reco) |
| Q-C28 | Chip daemon : nombre d'utilisations par défaut (tag « 3 utilisations », comme la Trousse spécialisée) ? | 3, réglable par chip dans la config | **Oui** (reco) |

### 9.9 Aide de jeu (décidé le 2026-11-07)

`ReferenceTab.jsx` passe sur la brique de la plateforme (`ReferenceGuide`, contenu en Markdown, `spec_ui_reference.md`), comme les slugs récents. On en profite pour y mettre **toutes les règles** (règles de `sprawl_cyberpunk_fonctionnel_specs.md`, adaptées aux règles de table de cette spec), plus seulement les listes. Les listes (contacts, informateurs, spécialisations, daemons, expertises) vivent dans la config et alimentent à la fois l'aide de jeu et la création.

### 9.10 Lots proposés

Lots A à E implémentés le 2026-11-07 (non commités, en attente du test de l'utilisateur).

| Lot | Contenu |
|---|---|
| A | Données et base : schéma réaligné sur les manœuvres actuelles ; migration (textes de Chromé, doublon Chromé du Fixer, colonne `tags.locked`) ; catalogues (champs `price`, `lot`, `tagChoices`, `defects`, entrées ajoutées et corrigées, doublons, casse des catégories) ; `PLAYBOOKS` (listes de cyberware, console, kits, outillages) ; listes de la référence dans la config ; correspondance manœuvre → tag ; règles pures testées (budget de Cred, kit selon les manœuvres, nombre de chrome) |
| — | Planche `documentations/cyberpunk/planche_creation.html` (validée le 2026-11-07, P-1 à P-4 oui) : trois zones, étapes Stats, Chrome et Matos, dossier de l'opérateur, en jour et en nuit ; descriptions sur les cartes de chrome ; daemon à choisir pour une chip daemon (kit ou achat) ; un défaut par objet acheté. Sur tablette en portrait, le dossier passe sous l'étape (repliable) ; stats placées par clic ou en glissant |
| B | Création, cadre : thème, en-tête avec jour / nuit, rail des étapes, dossier en direct, retour libre ; étapes Archétype à Relations refaites |
| C | Création, Chrome et Matos : socle, cyberware de l'archétype, console du Netrunner, offert avec défauts, Chromé, fashionware ; kit, outillages, matos personnalisé et nommé, achats et lots, Cred restante ; tags des manœuvres ; enregistrement (serveur : tags verrouillés, Cred) |
| D | Fiche : tags verrouillés (retrait en mode Édition seulement), tag posé quand une manœuvre est prise en jeu, ligne du socle, daemons de la console |
| E | Aide de jeu sur `ReferenceGuide`, toutes les règles en Markdown |
