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
  - glisser-déposer natif, comme `hooks/useDragOrder.js` : aucune bibliothèque ; piège vu sur la planche : le dépôt fait disparaître l'élément glissé, dont le `dragend` ne part alors plus. L'état « en cours de glisser » se nettoie donc **aussi au dépôt**, pas seulement au `dragend` ;
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
