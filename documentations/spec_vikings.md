# PURE VIKINGS (Pure Saga) — Spec Fonctionnelle (rétro + refonte)

*JDR viking, 9ᵉ siècle — système maison « Pure Saga » (3d10, explosion par caractéristique, seuil par compétence)*

## Statut

**Validée par le MJ le 2026-10-17** — décisions D-1 à D-17 (§11), Q-1 à Q-8 (§12), pratique du combat sur la fiche C-1 à C-8 (§12 bis) et reprise des données R-1 à R-6 (§13). Évolutions notées pour après la refonte : Berserk et compteur de tours (D-4), abandon possible de l'initiative (C-7). Spec rétroactive : Vikings est le premier système de l'app, antérieur au système de slugs et aux specs obligatoires. Ce document décrit :
- les **règles du jeu** telles que définies dans le vault Obsidian du MJ (`X:\jdr\vikings\vault\Vikings SAGA\PURE SAGA`, fichiers `01` à `08`) — **source de vérité des règles** ;
- ce que **l'app fait aujourd'hui** (code de référence : `src/tools/data.js`, `utils.js`, `traitBonuses.js`, `systems/vikings/*`) ;
- les **écarts** entre les deux, numérotés **D-n** et tranchés par le MJ en §11 (le texte indique la règle retenue et, en italique, ce que faisait l'app) ;
- les **cibles de la refonte** (interface MJ, direction graphique).

Aucune implémentation technique ici : les schémas, routes et composants relèvent des specs de lot.

---

## 0. Principes de vision

- **Légende personnelle, pas montée en puissance** : progression lente, chaque gain est mérité narrativement. Un personnage reste un humain crédible après 50 sessions.
- **La SAGA est la monnaie centrale** : elle sert en jeu (héroïsme, assurance, don) et à l'évolution. Elle est rare (1-2 points par arc de 8-10 sessions) et plafonnée.
- **Réalité subjective** : la frontière entre réel et mythe appartient au MJ (test de résistance mentale Chance/Intelligence, issue narrative). Rien à modéliser dans l'app.
- **Ne pas modéliser ce qui se gère à la table** : localisations, modificateurs situationnels, conséquences narratives restent au jugement du MJ.

---

## 1. Moteur de résolution

### 1.1 Le jet
Toujours **3d10** (avant malus de blessure). Deux paramètres croisés :
- la **caractéristique** fixe l'**explosion** (relance : chaque dé explosé ajoute un dé, en chaîne) ;
- la **compétence** fixe le **seuil de succès** (chaque dé ≥ seuil = 1 succès).

Jet de caractéristique pure : seuil **7+**, explosion selon la caractéristique.
Jet de compétence : explosion selon la **meilleure des deux caractéristiques liées** à la compétence.

| Niveau carac | Titre | Explosion |
|---|---|---|
| 1 | Novice | 10 |
| 2 | Initié | 10 |
| 3 | Adepte | 9-10 |
| 4 | Expert | 9-10 |
| 5 | Maître | 8-9-10 |

| Niveau comp | Titre | Seuil |
|---|---|---|
| 0 | Inapte | 7+ |
| 1 | Novice | 7+ |
| 2 | Initié | 6+ |
| 3 | Adepte | 5+ (D-1 : le 6+ du vault `07` est une coquille) |
| 4 | Expert | 5+ |
| 5 | Maître | 4+ |

### 1.2 Compétence comme ressource
Le niveau de compétence est aussi une **réserve de points** : dépenser 1 point = **1 succès automatique** sur un jet de cette compétence. Récupération **uniquement en fin d'arc narratif** ou sur décision du MJ (événement surnaturel, ellipse…).

**App** : chaque compétence porte `niveau` et `points restants` ; la modale de dés propose de 0 à 3 succès auto dans la limite des points restants et les décrémente. **Aucun moyen MJ de restaurer les points** (fin d'arc) → voir §9.

### 1.3 Difficultés
| Difficulté | Succès requis | Spécial |
|---|---|---|
| Standard | 1 | — |
| Challenge | 2 | — |
| Difficile | 3 | — |
| Héroïque | 4 | nécessite SAGA |
| Épique | 5 | nécessite SAGA |
| Impossible | — | — |

**App** : la modale de jet ne demande pas la difficulté ; elle affiche le nombre de succès, la comparaison est faite à la table (sauf Héroïque/Épique, cibles fixes 4/5).

### 1.4 Usages de la SAGA en jeu
- **Héroïque / Épique** : atteindre d'abord **3 succès**, puis dépenser 1 SAGA pour lancer **3d10 bonus** (seuil 7+, explosion sur 10). Réussite → la SAGA revient ; échec → perdue. **Pour atteindre les 3 succès initiaux, tout compte** : succès des dés, bonus de traits, succès auto issus des points de compétence (D-5). **La fatigue relève toutes les barres** : avec +2 succès requis, il faut 5 succès pour lancer les dés SAGA et 6 (héroïque) ou 7 (épique) au total (Q-4). *App actuelle : seuls les succès des dés comptaient, et la fatigue n'était retranchée que du total — à corriger.*
- **Assurance** : difficulté ≤ Difficile, 1 SAGA (perdue) pour lancer deux fois le pool et garder le meilleur. Le respect de la limite de difficulté **reste à la table** ; la modale propose l'option et retient automatiquement le meilleur des deux jets (D-6, conforme à l'existant).
- **Don** : donner 1 SAGA à un autre joueur (définitif). **App** : non outillé (le MJ ajuste à la main).
- **Évolution** : voir §5.

**Plafond** : 5 points de SAGA à tout moment (respecté par l'app sur la jauge de la fiche).

### 1.5 Événements spéciaux
- **Triple 10 naturel** (10-10-10 sur 3d10) : faveur divine, **+1 SAGA automatique** (D-15), dans la limite du plafond de 5 ; compte aussi dans la SAGA totale. Seuls comptent les **3 dés de base** du jet principal (ni les explosions, ni les dés SAGA bonus) : impossible avec moins de 3 dés (blessure). En assurance, un triple 10 est forcément le jet retenu (Q-5). Règle postérieure à la première version de l'app : *à ajouter*.
- **Coup critique en combat** (que des 10) : touche quel que soit le seuil, 4 tokens de blessure, armure comptée pour moitié et endommagée, souvent +1 SAGA. **App** : non détecté (combat hors périmètre, voir §7).

---

## 2. Santé et fatigue

Les états se suivent par **tokens** qui s'accumulent.

### 2.1 Blessures (max 5)
| Tokens | État | Effet |
|---|---|---|
| 1 | Superficielle | aucun |
| 2 | Sérieuse | −1 dé |
| 3 | Critique | −2 dés |
| 4 | Incapacitante | −3 dés (action impossible sans SAGA / succès auto) |
| 5 | Inconscient / KO | hors de combat, jet impossible |

**App** : conforme (pool min 1 dé ; jet bloqué à 5 tokens).

### 2.2 Fatigue (max 10)
| Tokens | État | Effet | Récupération |
|---|---|---|---|
| 1 | Essoufflé | aucun | 5 min |
| 2 | En nage | +1 succès requis | 20 min |
| 4 | Fatigué | +2 succès requis | 2 h |
| 6 | Épuisé | +3 succès requis | 10 h |
| 8 | Exténué | +4 succès requis | 24 h |
| 10+ | Inconscient | KO | — |

Un nombre de tokens intermédiaire reste au palier inférieur (3 tokens = En nage, +1). Jauge de 0 à 10.

**Décision D-2** : aligner l'app sur ce tableau (*app actuelle : 3 tokens → +2, 9 → +5, jauge plafonnée à 9*). **D-3** : retrancher le malus des succès ou l'ajouter à la difficulté revient au même ; présentation libre. Trait *Infatigable* : aucun malus (conforme).

---

## 3. Personnage

### 3.1 Identité
Prénom, surnom, **nom**, sexe, âge, taille, poids, activité/métier, nom du joueur, avatar.

**Décision D-17** :
- le **sexe reste limité à homme / femme** (jeu volontairement « hard history », 9ᵉ siècle) ;
- le champ « nom du parent » est **renommé `nom`**, le champ commun aux slugs modernes : les composants génériques de l'app affichent simplement « Prénom Nom », sans cas particulier. Le contenu ne change pas : `nom` contient le nom du parent (« Ragnar »), simple conversion des données existantes (Q-3) ;
- l'affichage propre à Vikings reste **« Prénom "Surnom" fils de / fille de Nom »**, la formule « fils de » / « fille de » étant déduite du sexe. Le surnom reste un champ propre à Vikings.

### 3.2 Caractéristiques
Force, Agilité, Perception, Intelligence, Charisme, Chance — niveau 1 à 5 (usages détaillés dans le vault `01`).

### 3.3 Valeurs de combat
Armure, actions par tour (base 1), seuil de combat (base 1). Modifiées par les traits (*Bons réflexes* +1 action, *Peau dure* +1 armure, *Insaisissable* +1 seuil…). **App** : ces valeurs sont stockées et incrémentées au moment où le trait est acquis (pas recalculées) — point technique pour le lot serveur.

### 3.4 Compétences
Chaque compétence est liée à deux caractéristiques (explosion = meilleure des deux). Liste ouverte. Certaines sont **cumulables avec spécialisation** : Combat CàC armé (par arme), Combat à distance (par arme), Langue orale, Langue écrite.

**Décision D-13 : le tableau du vault (`04`) fait foi.** Conséquences par rapport à l'app (39 compétences) :
- *Combat à distance* : Agilité/Agilité (app : Agilité/Perception) ;
- *Folklore* : Intelligence/Intelligence (app : Intelligence/Chance) ;
- *Esquive* : supprimée depuis les premiers playtests, elle n'existe pas ;
- **Escalade, Intimidation, Chant, Marchandage** : présentes dans l'app, absentes du tableau du vault mais citées par ses traits → **conservées** (Q-1 ; le MJ vérifiera le vault) ;
- les **noms** des compétences enregistrées sont hétérogènes (ex. « Combat CàC (armé) » et « Combat CàC armé », « Combat distance » et « Combat à distance ») : un nom inconnu fait aujourd'hui retomber l'explosion sur « Force 2 » sans prévenir. Les données existantes devront être normalisées.

### 3.5 Traits et backgrounds
Trois familles : backgrounds narratifs, traits mécaniques, traits majeurs (accès aux sous-systèmes : runes, galdr, transe). Chaque trait a des **effets**, des **conditions** (caractéristiques et/ou compétences) et des **incompatibilités**. 2 à 4 traits à la création.

Types d'effets rencontrés : actions +N, armure +N, seuil +N, succès auto ±N (sur une carac ou une compétence, parfois conditionnels : de nuit, en mer, en pleine lumière…), SAGA +N, points de runes (« livre de sort »), effets purement narratifs.

**App** (65 traits, comparés un par un au vault) :
- incompatibilités rendues **réciproques** dans l'app (le vault n'en note souvent qu'un sens) — cohérent, à conserver ;
- **Décision D-12 : vérifier toutes les conditions du vault**, compétences comprises, avec la bonne logique. *App actuelle (constat corrigé au lot 2b) :* les conditions de compétence et de SAGA figuraient déjà dans les données, mais n'étaient vérifiées que par la modale d'édition, pas par l'assistant de création ; et *Huskarl*, *Foudre de guerre*, *Marin*, *Tueur de monstre* visaient une compétence inexistante (« Combat CàC »), donc impossibles à acquérir. De plus, 14 incompatibilités n'étaient déclarées que dans un sens ; *Banni* « Chance 1 (max) » est traité comme un minimum ; *Survivant miraculeux* et *Orphelin aguerri* « A OU B » comme « A ET B » ; *Langue de serpent* exige Agilité 2, absent du vault (le vault faisant foi, la condition disparaît).
- **Décision D-9 : « SAGA +N » s'applique une seule fois, au moment où le trait est pris** (le plus souvent à la création) : +N à la SAGA actuelle (plafond 5) et à la SAGA totale. *App actuelle : affiché, jamais appliqué.*
- bonus de succès auto : appliqués automatiquement pour une partie des traits, proposés en « bonus conditionnels » cochables pour les autres (de nuit, en mer…) — principe conservé.
- *Insaisissable* : le bonus « Esquive (+1 suc auto) » est **retiré** (Esquive n'existe plus, Q-2) ; le reste du trait est inchangé.
- **Décision D-14** : *Forme de loup* et *Forme d'ours* (« MAGIQUE (RP ONLY) ») restent **hors de l'app**. *Maudit par une Völva* et *Hanté par les Draugr*, barrés dans le vault, sont exclus.

### 3.6 Runes
Futhark de 24 runes (symbole, nom, lettre, sens littéral et ésotérique — conforme vault `06`). Niveau 0 à 5 par rune :

| Niveau | Capacité |
|---|---|
| 0 | Signe inconnu |
| 1 | Identification, légendes |
| 2 | Sensoriel (sentir la présence) |
| 3 | Active : tracer, activer, combiner jusqu'à 3 runes |
| 4 | Objets à charge, tatouages ; jusqu'à 4 runes |
| 5 | Artefacts permanents, visions ; jusqu'à 5 runes |

La rune est une **permission**, jamais un bonus au jet : le jet se fait sur une compétence pratique (Sculpteur, Chant, Ferronnerie…). Mineure (0-2) en soutien, majeure (3+) pour l'intention principale. Modes : **instantané** (galdr, 1 jet, difficulté standard) ou **rituel** (accumulation de succès sur plusieurs étapes et compétences ; un échec critique brise le rituel).

Accès par trait « livre de sort » : *Leader né* 3 pts (galdr uniquement), *Connaissance des runes* 5 pts, *Volva* 8 pts. 1 point = 1 niveau de rune.

**App** : onglet Runes (consultation du Futhark, niveaux éditables en mode édition). Rituels non outillés (gérés à la table) — conforme au principe §0.

---

## 4. Création de personnage

| Étape | Règle (vault `07`) | App aujourd'hui |
|---|---|---|
| 1. Concept | origine sociale, métier, motivation, lien avec le groupe | identité + activité (texte) |
| 2. Caractéristiques | 14 points, min 1 partout | 14 points, min 1, **max 4 à la création** — **conservé** (D-8) |
| 3. Compétences | 10 points, coût = niveau | 10 points, **max 3 à la création** — **conservé** (D-8) |
| 4. Traits | 2 à 4, conditions et incompatibilités | 2 à 4 ; conditions complètes à vérifier (D-12) |
| 5. Runes | si livre de sort : points = somme des traits | conforme |
| 6. SAGA de départ | 1 à 3, fixé avec le MJ | **1 — conservé** (D-11), + les « SAGA +N » des traits choisis (D-9) ; ajustable ensuite par le joueur ou le MJ |
| 7. Équipement | selon statut social (thrall / karl / noble) | inventaire libre + catalogue |

L'assistant comporte 6 étapes ; un code d'accès est généré à la fin.

---

## 5. Évolution

La SAGA dépensée en évolution se fait **entre les scénarios**. Au-delà du niveau 3 (carac ou compétence) : justification RP forte et accord du MJ obligatoires.

| Amélioration | Vault | App |
|---|---|---|
| +1 compétence | 1 | 1 |
| +1 rune existante | 1 | 2 → **1** (D-7, le vault fait foi) |
| Nouvelle rune | 1 | 3 → **1** (D-7) |
| +1 caractéristique | 2 | 2 |
| Nouvelle compétence (niveau 1) | 3 | 3 |
| Nouveau trait | 4 | 4 |

**App** : modale « Expérience » côté joueur, plafond de niveau 5. L'accord du MJ au-delà de 3 n'est pas outillé (règle de table).

**Décision D-10 — SAGA totale = légende cumulée** : le nombre total de points de SAGA **acquis** par le personnage depuis sa création, indicateur de réputation pour le MJ. Elle augmente à chaque **gain** (attribution MJ, triple 10, trait « SAGA +N ») et ne baisse jamais. Une dépense (évolution, assurance, jet héroïque raté) ne la modifie pas, et un point de SAGA récupéré après un jet héroïque réussi n'est pas un gain. *App actuelle : la SAGA totale augmente quand on dépense en évolution — contraire à cette définition, à corriger* (voir §12 pour les valeurs existantes).

---

## 6. Équipement et économie

Monnaie : once d'argent (oz, ≈ 28 g). Catalogue du vault `05` : coût de la vie, armes (type, portée, dégâts en tokens, prérequis Force/Agilité, matériau fer/acier post-830, prix), armures et boucliers (réduction, prérequis, rupture des boucliers, usure).

**App** : inventaire par emplacement (équipé / sac / réserve), catégories arme / armure / objet, objets du catalogue (34 entrées) ou libres, quantité, notes, prérequis (affichés). Pas de prix ni de matériau dans le catalogue de l'app.

---

## 7. Combat — description de l'existant, hors périmètre de la refonte

Le combat **n'est pas refondu** (décision MJ : système lourd, difficile à rendre générique). On le conserve en l'état et on vérifie seulement qu'il continue de fonctionner après la refonte.

Règles (vault `02`) : initiative 2d10 + Agilité ; 1 action par tour (+ traits) ; attaque 3d10 contre le **seuil de combat** de la cible ; dégâts = arme + succès excédentaires − armure ; posture défensive (bonus au seuil) ; viser (+1 succès auto par action, ~3 max) ; localisation (seuil +1/+2) ; modificateurs situationnels.

App : onglet Combat MJ (initiative, tours, combattants PJ/PNJ), action *Posture défensive* (modale de jet), action *Berserk*.

Écarts relevés, **pour mémoire** (non traités dans cette refonte) :
- *Berserk* : durée 3 tours dans l'app contre 5 dans le vault ; +2 succès auto appliqués à **tous** les jets pendant la transe contre « arme à 2 mains » seulement ; fin de transe (4 tokens de fatigue) non automatisée (D-4 : à traiter **après** la refonte initiale).
- Pool d'attaque des PNJ : le malus de blessure est **ajouté** au lieu d'être retranché (bug).
- Idée secondaire du MJ : un **compteur de tours** pour les effets temporaires (transe Berserk…) — à spécifier plus tard.
- Piste du MJ : **abandonner l'initiative** au profit d'un tour « joueurs puis PNJ » selon la situation, comme en 2D20 (C-7) — après la refonte.

---

## 8. Écrans joueur (existant → cible)

| Écran | Aujourd'hui | Cible refonte |
|---|---|---|
| Fiche | identité, caracs, compétences, traits, jauges SAGA/blessures/fatigue, valeurs de combat | même contenu, nouvelle mise en page (§10) |
| Dés | **un onglet** dédié | une **modale** ouverte depuis la fiche (clic sur carac ou compétence), comme les slugs récents |
| Runes | onglet | **intégrées en bas de la fiche**, en version allégée (§8.1) : plus d'onglet dédié, pour éviter les allers-retours entre « ce que je veux faire » et le jet |
| Inventaire | onglet | conservé, bugs corrigés |
| Journal | onglet générique | conservé |
| Historique | onglet « à venir » + panneau latéral ancien | historique générique des jets avec rendu Vikings dédié |
| Expérience | modale | conservée |
| Menu | config des dés, changer de personnage, nouveau personnage, interface MJ, déconnexion | + **code d'accès**, + **jet libre** (comme les slugs récents) |

Les actions de jeu (jauges, succès auto, SAGA) restent actives hors mode édition.

### 8.1 Runes sur la fiche (demande MJ, 2026-10-17)
Section en bas de la fiche, visible seulement si le personnage a un « livre de sort » ou au moins une rune :
- les **runes connues** (niveau ≥ 1) : symbole, nom, niveau, sens ésotérique, et ce que le niveau permet (identification / sensoriel / actif, combinaison jusqu'à 3, 4 ou 5 runes) ;
- un rappel du principe : la rune est une permission ; le jet se fait sur une compétence pratique, juste au-dessus sur la même fiche ;
- les points de runes disponibles (livre de sort − niveaux répartis) ;
- le Futhark complet reste consultable (repliable) ; les niveaux se modifient en mode édition ou par l'évolution.

### 8.2 Pratique du combat hors du système de combat (demande MJ, 2026-10-17)
Le système de combat (§7) n'est pas retouché. La fiche affiche en plus les **valeurs calculées** utiles à la table, sans passer par l'onglet Combat.

**Posture de combat passive** (vault `02`) : bonus au seuil de défense = **niveau de la compétence ÷ 2, arrondi à l'inférieur, maximum 3**, à condition d'avoir 1 action disponible.
- *Combat CàC (armé)* → **parade**, une valeur par spécialisation (par arme) ;
- *Combat CàC (non armé)* → **esquive**.

Décisions du MJ (§12 bis) :
- **Posture passive, une ligne par compétence de combat au contact** possédée (chaque spécialisation de *Combat CàC (armé)*, et *Combat CàC (non armé)*) : le joueur prend celle de ce qu'il utilise au moment où il se défend (C-1). Chaque ligne affiche le bonus et le **seuil de défense qui en résulte** (seuil de combat de base + bonus).
- **Les traits ne modifient pas ce calcul** pour l'instant (*Insaisissable* non pris en compte, C-2).
- **Posture active** : c'est un jet de compétence standard (bonus = marge de réussite) ; il passe par la modale de jet habituelle, la difficulté 1 se gère à la table. Pas de jet dédié (C-3).
- **Pas de jet d'attaque** depuis l'arme pour l'instant : il faudrait que l'app sache quelle arme est en main (C-4).
- **Viser** : option de la modale de jet, **+1 succès auto par action de visée**, cumulable sur plusieurs tours. Le vault conseille une limite autour de 3 ; l'app ne l'impose pas (C-5).
- **Armure totale** affichée à côté du seuil : armures équipées + armure naturelle des traits (C-6). Les boucliers, qui fonctionnent comme un « fusible », sont montrés à part.
- **Pas d'initiative** sur la fiche. Le MJ envisage d'abandonner l'initiative au profit d'un tour « joueurs puis PNJ » selon la situation (comme en 2D20) : changement de règle du **système de combat**, noté pour après la refonte avec D-4 (C-7).
- Rien d'autre pour l'instant, à revoir à l'usage (C-8).

---

## 9. Interface MJ — cible de la refonte

### 9.1 Contrat MJ standard (repris des slugs récents : Zone Blanche, Achtung, Fabula)
1. Liste des personnages de la table : avatar, nom, joueur, résumé, présence en ligne.
2. **Fiche complète du personnage, identique à la fiche joueur** (mêmes sections, même ordre), au lieu de la carte MJ résumée actuelle.
3. Mode édition avec enregistrement ; actions de jeu rapides hors édition (jauges, SAGA).
4. Envoyer une note au journal d'un joueur.
5. Copier le lien et le code d'accès.
6. Gestion des tables.
7. Jet de dés **pour un personnage** depuis sa fiche, **jet libre MJ**, jet MJ existant.
8. Onglet **Historique** des jets.
9. Changer l'avatar d'un personnage.

### 9.2 Existant Vikings à conserver
- Envoi d'un **objet** au joueur (catalogue Vikings).
- Onglet **Combat** (hors périmètre, conservé tel quel).

### 9.3 Fonctions propres à Pure Saga (retenues, Q-7)
- **Attribuer de la SAGA** à un ou plusieurs personnages (récompense de fin de scène ou d'arc), plafond 5 respecté ; le gain compte dans la SAGA totale.
- **Fin d'arc** : restaurer les points de compétence (succès auto) d'un personnage ou de toute la table.
- **Repos** : retirer des tokens de fatigue / blessure rapidement (récupération narrative).
- **Signalement du triple 10** dans l'historique et les notifications ; le +1 SAGA est automatique (D-15).
- *Plus tard* : compteur d'effets temporaires (Berserk, D-4).

---

## 10. Direction graphique

**Intention** : un objet du 9ᵉ siècle (bois, cuir, or vieilli, fer) qui s'utilise comme une application moderne. Surtout pas l'apparence d'une interface d'ordinateur standard. Base : UI kit `documentations/refonte_vikings/UIkit_preview.html`.

- **Palettes** : jour = bois sombre et or (fond `#1a1410`, surface `#2a2118`, or `#d4a017`, texte parchemin `#e8dcc8`) ; nuit = « fer » (fond `#0f1419`, or pâle `#EBCB8B`, bleus nordiques `#81A1C1`).
- **Cadres ornés à trois niveaux** : *lourd* (coins serpents, panneaux principaux), *léger* (entrelacs, sous-sections), *petit* (cartes). En nuit, ornements désaturés.
- **Séparateurs** : **sobres et fins** (les séparateurs ornés du kit sont jugés trop massifs) — ligne dégradée, éventuellement un petit motif discret.
- **Typographie** : *Eagle Lake* pour les titres ; *Grenze Gotisch* réservée aux intitulés courts (à tester) ; une serif lisible pour le texte courant, les chiffres et les champs de saisie.
- **Ergonomie moderne** : interactions directes (clic sur une carac pour lancer, steppers sur les jauges), lisibilité mobile, aucun sacrifice d'usage pour le décor.
- Le kit ne couvre pas boutons, champs, onglets, modales, jauges ni l'interface MJ : ils seront dérivés de son langage visuel et soumis au MJ.

---

## 11. Décisions (réponses du MJ, 2026-10-17)

| # | Sujet | Vault | App | Recommandation | Réponse utilisateur                                                                                                                                             |
|---|---|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| D-1 | Seuil compétence niveau 3 | `01` : 5+ / `07` : 6+ | 5+ | trancher et corriger le fichier du vault fautif | C'est 5+, c'est une coquille sur l'un des fichiers du vault                                                                                                     |
| D-2 | Paliers de fatigue | 2/4/6/8/10+ (un nombre impair reste au palier inférieur) | 3 → +2, 9 → +5, max 9 | aligner sur le vault | A aligner sur le vault                                                                                                                                          |
| D-3 | Fatigue : succès retirés ou difficulté augmentée | difficulté augmentée | succès retirés | équivalent pour réussir/échouer ; afficher « +N succès requis » est plus fidèle | C'est la même chose il me semble donc ça importe peu                                                                                                            |
| D-4 | Berserk (pour mémoire, combat hors périmètre) | 5 tours, +2 succès arme 2 mains, 4 fatigue en fin | 3 tours, +2 sur tout | à traiter avec le compteur de tours | A traiter après la refonte initiale                                                                                                                             |
| D-5 | Condition héroïque/épique | 3 succès « ou succès auto » | succès des dés seuls | compter les succès auto (et bonus de traits ?) | Pour atteindre les 3 succès initiaux, les bonus de traits, les succès auto, les dépenses de points de compétences, tout marche                                  |
| D-6 | Assurance limitée à Difficile | oui | non contrôlé | laisser à la table, ou ajouter le choix de difficulté dans la modale | Laisser le choix à la table, juste avoir l'option dans la modale + sélection du meilleur jet                                                                    |
| D-7 | Coût des runes | 1 / 1 | 2 / 3 | aligner sur le vault | le vault a raison                                                                                                                                               |
| D-8 | Plafonds à la création | aucun (exemple Force 5) | carac 4, compétence 3 | à trancher | Pour une fois c'est l'app qui a raison mais c'est de toute façon modifiable une fois le personnage créé, on garde ce que dit l'app aujourd'hui pour la création |
| D-9 | « SAGA +N » des traits | effet listé | jamais appliqué | préciser : +N à la SAGA de départ ? au plafond ? | Les tratis donnant de la SAGA +N le font au moment où l'on prend le trait, donc généralement à la création et c'est tout                                        |
| D-10 | SAGA totale | non définie | augmente quand on dépense en évolution | définir son sens (légende cumulée ?) ou la retirer | C'est la légende cumulée, le nombre de points de SAGA acquis par un joueur au total, c'est un indicateur de la réputation probable du personnage pour le MJ     |
| D-11 | SAGA de départ | 1 à 3 avec le MJ | 1 | rendre réglable à la création | On laisse à 1, ça s'ajuste soit par la modification côté joueur soit le GM fait le changement depuis son interface                                              |
| D-12 | Conditions des traits | caracs + compétences, OU, max | caracs seules, ET, min | vérifier aussi les compétences et corriger la logique | Oui vérifier aussi les compétences lorsque nécessaire et corriger la logique donc                                                                               | 
| D-13 | Liste des compétences | 35 entrées | 39 (+ Escalade, Intimidation, Chant, Marchandage) ; caracs ≠ sur 2 ; pas d'Esquive | garder les 4 ajouts (cités par des traits), trancher caracs et Esquive | C'est le vault qui a raison, l'esquive a été supprimé depuis les premiers playtests il me semble, le vault est la bonne version                                       |
| D-14 | Traits magiques RP | Forme de loup / d'ours | absents | ajouter en « MJ uniquement » ou laisser hors app | hors app |
| D-15 | Triple 10 naturel | gain de SAGA | non détecté | signaler dans le résultat ; l'attribution reste au MJ | gain automatique selon moi et donc à ajouter dans l'app, c'est une règle créé après la première version de l'app |
| D-16 | Navigation maritime (vault `08`) | règles complètes | absent | hors périmètre de la refonte | hors périmètre |
| D-17 | « fils/fille de » dépend du sexe (contrainte homme/femme en base, 1 personnage sans sexe) | — | — | conserver, ou rendre la formule libre | Contrainte homme/femme, c'est le 9eme siècle, c'est censé être un poil hard history comme jdr. Par contre à modifier pour faire correspondre à l'architecture des tables modernes des slugs c'est à dire on vire le nom_parent pour garder juste nom et donc simplifier la mise en forme des noms/prénoms dans les systèmes générique de l'app |

---

## 12. Questions complémentaires (réponses du MJ, 2026-10-17)

| # | Question | Réponse |
|---|---|---|
| Q-1 | *Escalade, Intimidation, Chant, Marchandage* absentes du tableau du vault mais utilisées par ses traits | **Conservées.** Le MJ vérifiera pourquoi elles manquent au vault. |
| Q-2 | *Insaisissable* donne « Esquive (+1 suc auto) », or Esquive n'existe plus | **Bonus retiré.** |
| Q-3 | Reprise du « nom du parent » existant | **Simple renommage** en `nom`, contenu inchangé ; « fils de » / « fille de » reste ajouté à l'affichage selon le sexe. |
| Q-4 | La fatigue relève-t-elle la barre d'entrée du jet héroïque ? | **Oui** : +N succès requis s'applique à toutes les barres (entrée et cible finale). |
| Q-5 | Dés pris en compte pour le triple 10 | **Les 3 dés de base** uniquement ; en assurance, le jet retenu (forcément le triple 10 s'il y en a un). |
| Q-6 | SAGA totale existante, gonflée par l'ancienne règle | **Laissée telle quelle.** La base de DEV contient surtout des données de test. |
| Q-7 | Fonctions MJ propres à Pure Saga (§9.3) | **Les quatre retenues.** |
| Q-8 | Tableaux complets dans la spec | **Oui, en annexe** (A à D ci-dessous). |

---

## 12 bis. Pratique du combat sur la fiche (réponses du MJ, 2026-10-17 — synthèse en §8.2)

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                 |
|---|---|---|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| C-1 | Posture passive : afficher une valeur par arme maîtrisée (parade) + l'esquive, ou seulement la meilleure ? | Une ligne par arme maîtrisée et l'esquive : le joueur voit tout de suite ce que change son arme en main. | C'est par compètence, ça dépends de ce qu'utilise le personnage au moment où il s'en sert.                                                                                                                                                 |
| C-2 | Les traits qui modifient le seuil entrent-ils dans le calcul affiché (*Insaisissable* : +1 contre CàC si armure légère ou nulle) ? | Oui, avec la condition rappelée à côté (« si armure légère ») plutôt que devinée par l'app. | Pas tranché donc non pour le moment je dirais                                                                                                                                                                                              |
| C-3 | Posture **active** hors combat : proposer sur la fiche un jet « Posture défensive » (compétence de parade/esquive, difficulté 1, bonus = marge de réussite, max 3) ? | Oui, même jet que dans le système de combat, résultat affiché sans être enregistré dans le combat. | Oui, c'est un jet standard en vrai de toute façon, la diff à 1 peut même être uniquement géré à table                                                                                                                                      |
| C-4 | **Jet d'attaque** depuis une arme équipée : 3d10 sur la compétence de l'arme, affichage des dégâts « arme + succès excédentaires » pour un seuil cible saisi par le joueur ? | Oui : c'est le geste le plus fréquent à la table. | Oui on peut mais ça sous entend savoir déterminer quelle est l'arme donc ça compléxifie la chose. j'aurais tendance à ne pas le gérer pour le moment dans l'app                                                                            |
| C-5 | **Viser** (armes à distance) dans ce jet : +1 succès auto par action de visée, jusqu'à 3 ? | Oui, en option du jet d'attaque. | Oui c'est une option ça, je peux viser pendant plusieurs tours pour ajouter un succès auto                                                                                                                                                 |
| C-6 | **Armure** : afficher l'armure totale (armure équipée + armure naturelle des traits) ? | Oui, à côté du seuil. | Oui                                                                                                                                                                                                                                        |
| C-7 | **Initiative** (2d10 + Agilité) lançable depuis la fiche ? | Oui, résultat dans l'historique ; le suivi des tours reste au système de combat. | je pense enlever l'initiative, en vrai ça va surement se gérer comme dans les systèmes 2d20, en fonction de la situation puis chacun son tour, un coup les joueurs, un coup les PNJ. Sans possibilité certes de garder la main, à voir ça. |
| C-8 | Autre chose à faire apparaître ? | — | Là comme ça non, on verra à l'usage                                                                                                                                                                                                            |

---

## 13. Reprise des données existantes (décisions du MJ, 2026-10-17)

Constat fait en lecture seule sur la base de DEV et sur une copie de la PROD (dernière partie : 26/02/2026). Les deux ont **le même schéma** ; la PROD contient 4 personnages de joueurs, 3 personnages de test et le compte MJ.

| # | Constat | Décision |
|---|---|---|
| R-1 | Noms de compétences mélangés : « Combat CàC (armé) » et « Combat CàC armé », « Combat distance » et « Combat à distance » | Les **noms du vault** (annexe A) deviennent la référence ; les lignes au nom de l'app sont converties. Une compétence spécialisable enregistrée sans spécialisation reste sans spécialisation (modifiable ensuite). |
| R-2 | Noms de traits : le vault écrit « Bon réflexes », la base et l'app « Bons réflexes » | Les **noms de l'app** font foi pour les traits (orthographe corrigée de longue date) ; l'annexe B les reprend. |
| R-3 | Avec les conditions complètes (D-12), certains traits déjà acquis ne les rempliraient plus | **Les traits acquis le restent** ; les conditions ne s'appliquent qu'à l'acquisition d'un nouveau trait. |
| R-4 | SAGA totale inférieure à la SAGA actuelle pour 3 personnages de joueurs (l'ancienne règle comptait la dépense) | **Corrigée** : la SAGA totale est remontée au niveau de la SAGA actuelle quand elle est inférieure. Les autres valeurs restent telles quelles (Q-6). |
| R-5 | Les jets de l'historique sont tous à l'ancien format (aucun au format générique) | **Leur affichage n'est pas à conserver** : perdre cet historique est acceptable. |
| R-6 | « Nom du parent » | Renommé `nom`, contenu inchangé (Q-3). |

---

## Annexe A — Compétences (39)

Source : vault `04` (fait foi, D-13) + 4 compétences conservées depuis l'app (Q-1). L'explosion utilise la meilleure des deux caractéristiques. Cumulables avec spécialisation : Combat CàC (armé), Combat distance, Langue orale, Langue écrite.

| Compétence | Carac 1 | Carac 2 | Description & Notes |
|---|---|---|---|
| Combat CàC (armé) | Force | Agilité | Votre aisance au combat avec une arme déterminée de corps à corps. Permet d'effectuer des parades (cf Bonus de posture - compétence cumulable) |
| Combat CàC (non armé) | Force | Agilité | Votre aisance au combat à main nue. Permet d'effectuer des esquives (cf Bonus de posture) |
| Combat distance | Agilité | Agilité | Votre aisance au combat avec une arme déterminée à distance (compétence cumulable). |
| Langue écrite | Intelligence | Intelligence | Compétence déterminant votre compréhension d'une langue écrite autre que les runes. Nécessite une justification RP. |
| Langue orale | Intelligence | Charisme | Concerne l'oral. On considère que vous savez vous exprimer, mais peut être une barrière en pays étranger. Nécessite une justification RP. |
| Divination | Chance | Chance | Vous êtes une passerelle entre les Hommes et les Dieux. Visions du futur, compréhension globale ou secrets divins. |
| Loi | Intelligence | Intelligence | Votre niveau de connaissance des lois, procès et autres décisions prises par les Godi lors du Thing. |
| Folklore | Intelligence | Intelligence | Votre connaissance des légendes et sagas des Dieux comme des Hommes. |
| Herboriste | Agilité | Intelligence | Connaissances des plantes et de leurs pouvoirs. Il ne s'agit pas d'une compétence de soins ! |
| Traque/Chasse | Perception | Intelligence | Compétence permettant de traquer des animaux ou des hommes sur de courtes ou longues distances. |
| Docteur | Intelligence | Chance | Détermine votre aptitude à soigner les blessures de tout type, une connaissance accrue des plantes est un plus. |
| Ferronnerie | Agilité | Agilité | Aptitude à forger des armes et des armures pour le combat et le pillage. Permet aussi de réparer l'équipement endommagé. |
| Connaissance Outgard | Intelligence | Intelligence | Ce que vous savez des autres peuples et de leurs croyances. |
| Ombre | Agilité | Agilité | Votre aptitude à vous déplacer comme une ombre sans un bruit. |
| Survie | Intelligence | Intelligence | Votre aptitude à vous débrouiller seul en pleine nature (faire un feu, trouver de la nourriture, construire un abri, etc.). |
| Raquette | Agilité | Agilité | Habileté à se déplacer à pieds avec des raquettes sur un sol recouvert de neige. |
| Amis des animaux | Charisme | Charisme | Appris à communiquer avec les animaux. Ils peuvent aider ou prévenir d'un danger. Permet de comprendre ce que veut/fait un animal. |
| Orfèvre | Agilité | Intelligence | Créer un modèle en cire, faire un moule en terre cuite pour finalement couler un métal précieux et obtenir un superbe bijou. |
| Potier | Agilité | Intelligence | Vous maniez l'argile et n'avez aucun problème à lui faire prendre la forme que vous souhaitez. |
| Bûcheron | Intelligence | Force | Choisir les arbres, les découper proprement en respectant les Dieux, faire des offrandes et transporter les troncs. |
| Charpentier marine | Agilité | Intelligence | Création et entretien des langskip (sélection bois, coupe, assemblage). Un bon charpentier est aussi un bon marin. |
| Fermier | Intelligence | Force | Retourner la terre, planter, récolter, nourrir vos proches. Savoir préparer les alcools à partir de fruit et de miel. |
| Charpentier | Intelligence | Force | Votre compétence de bâtisseur. Du choix des arbres à la pose du toit pour construire des maisons durables. |
| Pillage | Perception | Chance | Votre propension à trouver des objets de valeurs dans des habitations ou n'importe quel lieu. |
| Danse | Agilité | Agilité | La qualité de votre jeu de jambes lors des soirées alcoolisées. |
| Jeu | Chance | Intelligence | Votre niveau d'expertise dans les jeux de hasard et de stratégie joués lors des longs mois d'hiver. |
| Pêche | Chance | Agilité | Savoir appâter le poisson tout comme les bons coins. Vous n'êtes pas soumis au mal de mer. |
| Sculpteur | Agilité | Agilité | Votre dextérité vous permet de sculpter de superbes pièces en bois tout comme créer des couverts. |
| Navigation | Intelligence | Chance | Votre compétence à piloter un bateau dans la direction voulue. |
| Mineur | Intelligence | Force | Vous savez où vous procurer du minerai et surtout vous connaissez |
| Larcin | Agilité | Perception | L'art de la subtilité : voler une bourse, crocheter une serrure rudimentaire, faire des tours de passe-passe ou tricher discrètement aux jeux. |
| Dressage | Charisme | Force | Soumettre la volonté d'un animal (chien, faucon, cheval) pour qu'il obéisse à des ordres complexes, au-delà de la simple amitié. |
| Cuisine | Intelligence | Perception | Savoir préparer un gibier, reconnaître les ingrédients comestibles et cuisiner un repas de qualité qui remonte le moral des troupes. |
| Brasseur | Intelligence | Agilité | L'art complexe de la fermentation de haute qualité. Bien au-delà du tord-boyaux fermier, vous créez des hydromels et bières d'exception. |
| Couture | Intelligence | Agilité | Votre maîtrise complète de l'art textile, de la toison brute au vêtement d'apparat. Cela va du tissage sur métier vertical et de la teinture par les plantes, jusqu'à la coupe et l'assemblage. Vous savez autant protéger du froid qu'afficher le rang social par la couleur. |
| Escalade | Agilité | Force | Vous savez reconnaître les bonnes prises des mauvaises et utiliser votre savoir faire pour gravir des parois verticale ou des chemin très escarpés. *(conservée depuis l'app, absente du tableau du vault — Q-1)* |
| Intimidation | Charisme | Force | Vous savez utiliser le langage corporel pour intimider les autres et vous servez de votre physique pour faire passer des messages simple.. comme "si tu continues... je te pète la gueule" *(conservée depuis l'app, absente du tableau du vault — Q-1)* |
| Chant | Charisme | Chance | Détermine si vous chantez comme un canard boiteux ou comme une Diva. Permet aussi de chanter les runes (en combat ou non). *(conservée depuis l'app, absente du tableau du vault — Q-1)* |
| Marchandage | Charisme | Perception | Votre compétence à négocier le bon prix lors d'un achat ou d'une vente. Etre un fin marchand est un véritable art. *(conservée depuis l'app, absente du tableau du vault — Q-1)* |

## Annexe B — Traits et backgrounds (65)

Source : vault `04`, noms de traits alignés sur ceux de l'app (R-2). Exclus : Forme de loup, Forme d'ours, Maudit par une Völva, Hanté par les Draugr (D-14, barrés). Les incompatibilités sont **réciproques** (si A exclut B, B exclut A) même quand le vault ne les note que d'un côté. « Livre de sort (N pts) » = points de runes ; « Saga +N » = gain unique à la prise du trait (D-9).

| Trait | Description | Effet(s) | Incompatible avec | Condition(s) |
|---|---|---|---|---|
| Bons réflexes | Vous avez naturellement d'excellents réflexes et pouvez réagir avec une rapidité surprenante, même lorsque vous êtes pris au dépourvu. | Action +1 |  | Agilité 3+ |
| Peau dure | Après avoir passé de longues périodes à affronter les éléments en extérieur, votre peau s'est tannée et endurcie, vous offrant une protection naturelle. | Armure naturelle +1 |  | Force 2, Agilité 2 |
| Vue perçante | Votre acuité visuelle est bien supérieure à la moyenne. Vous voyez plus loin que quiconque et les détails les plus infimes ne vous échappent pas. | Pas de malus lié à la distance |  | Perception 2 |
| Aveugle | Que ce soit une punition ou une épreuve divine, vous avez perdu la vue. En contrepartie, vos autres sens se sont aiguisés pour compenser ce handicap. | Échec auto Perception (vue). 1 suc auto sur les autres sens | Vue perçante, Borgne, Marin, Huskarl, Leader, Berserk, Tatouage | Perception 2, Agilité 2 |
| Foudre de guerre | Le combat est une seconde nature pour vous. Quelle que soit l'arme en main, vous êtes dangereux, mais vous devenez un véritable maître avec vos armes de prédilection. | Action +1, pas de malus de localisation | Aveugle, Huskarl, Leader né | Combat arme 2, Force 2, Agilité 2 |
| Tatouage | Votre corps est couvert de motifs complexes qui effraient les chrétiens et les âmes sensibles, tout en vous assurant la bénédiction des Dieux. Certains motifs peuvent receler des pouvoirs cachés. | Intimidation chrétien (1 suc auto), Chance (1 suc auto) | Peau dure, Aveugle | Charisme 2 |
| Borgne | Vous avez sacrifié un œil (ou l'avez perdu au combat). Cette blessure inspire la crainte ou le respect, car beaucoup y voient la marque d'Odin lui-même et vous pensent sous protection divine. | Intimidation (1 suc auto), Perception (-1 suc auto), Saga +1 | Aveugle, Vue perçante | Force 2, Charisme 2 |
| Huskarl | Vous avez juré fidélité à un Jarl ou un Roi. En tant que garde du corps d'élite, vos réflexes sont conditionnés pour protéger votre seigneur, ce qui limite parfois votre liberté de mouvement. | Action +1. Arme 1 main+bouclier (+1 suc auto) | Aveugle | Combat 2, Force 2 |
| Volva | Vous possédez la rare connaissance des runes et savez manipuler le *heidl* pour éveiller leur magie. Souvent craint et respecté, cet art est traditionnellement féminin. Vous savez enchanter des objets ou lancer des rituels. | Livre de sort (8pts). Chance (+1 suc auto) | Foudre de guerre, Huskarl, Berserk, Marin, Godi | Chance 2, Divination 3, Folklore 2 |
| Berserk | Guerrier-fauve voué à Odin, vous combattez torse nu ou vêtu d'une simple peau de bête. Vous pouvez entrer dans une transe furieuse où la douleur n'existe plus, frappant tout ce qui bouge, ami comme ennemi. | **Transe (5 tours) :** Action +2, Armure +2, SEUIL +1, Arme 2 mains (+2 suc auto), ignore douleur. **Fin :** 4 tokens fatigue. Test Chance pour ciblage. | Aveugle, Huskarl, Leader né, Godi, Sous le regard... | Force 2, Chance 2 |
| Skald | Gardien de la mémoire et poète, vous connaissez de nombreuses sagas que vous narrez lors des banquets, toujours accompagné d'une bonne corne de bière. | Charisme (+1 suc auto), Folklore (+1 suc auto) | Berserk, Huskarl | Folklore 2 |
| Taille imposante | Vous êtes une montagne de muscles, bien plus grand et massif que vos contemporains, ce qui suffit souvent à calmer les ardeurs adverses. | Intimidation (+1 suc auto) |  |  |
| Marin | La mer est votre véritable foyer. Vous ne souffrez ni du mal de mer, ni de la promiscuité à bord, et ignorez le tangage. Vous savez entretenir un navire instinctivement. | Action +1 (en mer), Charpentier marine (+1 suc auto) | Volva, Aveugle, Berserk | Comp arme 1, Force 2, Agilité 2 |
| Leader né | Guerrier charismatique, vous maîtrisez les runes orales (Galdr) pour hurler des ordres qui galvanisent vos troupes ou terrifient vos ennemis au cœur de la mêlée. | Livre de sort (3pts), Action +1 | Berserk, Aveugle, Godi | Charisme 2 |
| Godi | Expert des lois et prêtre respecté, votre impartialité est renommée. Les nobles vous consultent pour les querelles et vous êtes habitué à parler devant le Thing et les Dieux. | Loi (+1 suc auto), Charisme (+1 suc auto) | Berserk, Volva, Foudre de guerre, Leader né | Loi 2, Saga 1 |
| Impistable | Fantôme des bois, vous avez appris à ne laisser aucune trace derrière vous et savez parfaitement effacer celles de vos compagnons. | +2 succès lors de traque (défense) |  | Traque/Chasse 2 |
| Grande concentration | Rien ne peut perturber votre esprit. Vous restez focalisé sur votre tâche quel que soit le chaos environnant. | +1 succès auto sur une compétence de votre choix |  |  |
| Infatigable | Vous semblez inépuisable. Même exténué, vous tenez bon. Vous supportez les longues nuits de veille bien mieux que le commun des mortels. | Pas de malus lié à la fatigue |  |  |
| Force de géant | On vous dit descendant des Jötnar. Sans être nécessairement plus musclé, vous soulevez sans effort des charges qui briseraient le dos de deux hommes normaux. | Force (+2 suc auto) | Grand guérisseur | Force 2 |
| Virtuose de l'arc | Votre maîtrise est telle que l'encochage, la visée et le tir ne forment qu'un seul mouvement fluide et mortel. | Viser devient une action gratuite |  | Combat arc 3 |
| Sanglant | Vous avez la fâcheuse tendance à démembrer vos ennemis. Vos exactions rendent les cadavres méconnaissables et vous donnent une réputation terrifiante. | +1 token blessure sur dégâts, Saga +1, Charisme (-1 suc auto) | Grand guérisseur | Force 3 |
| Ancien esclave | Vous avez connu les fers et acheté votre liberté à la sueur de votre front. Vous savez survivre avec rien et endurez la misère mieux que les nés-libres. | Survie (+1 suc auto), Chance (-1 suc auto) | Noble lignée |  |
| Noble lignée | Le sang des Jarls coule dans vos veines. Même si votre famille a perdu son influence, vous gardez une prestance et un statut naturel qui imposent le respect. | Charisme (+1 suc auto), Saga +1 | Berserk, Ancien esclave |  |
| Grand guérisseur | Formé à soigner les plaies de guerre les plus hideuses, vous avez acquis votre renommée en sauvant la vie d'un personnage important. | Saga +1, Soin (-1 tokens de blessure gratuit) | Force de géant, Sanglant | Docteur 2 |
| Ambidextre | Vous ne faites aucune différence entre votre main gauche et votre main droite, capable de manier deux armes avec une efficacité redoutable. | Action +1. Combat 2 armes à une main possible |  |  |
| Langue de serpent | Menteur pathologique et séducteur invétéré, vous n'avez aucun scrupule à manipuler les gens. Votre éloquence est votre meilleure arme. | Charisme (+2 suc auto) | Noble lignée, Skald, Godi |  |
| Sommeil léger | Vous ne dormez jamais vraiment. Toujours sur le qui-vive, le moindre craquement de brindille suffit à vous réveiller prêt au combat. | Perception (+1 suc auto la nuit) |  |  |
| Campeur | Vous vivez en harmonie avec la nature, capable de dormir n'importe où et de vous nourrir de ce que la forêt vous offre. | Survie (+1 suc auto), Chance (+1 suc auto) |  | Survie 1 |
| Duelliste | Habitué des Holmgang, vous utilisez le défi rituel pour dépouiller vos adversaires. Votre entraînement est spécifique au combat singulier. | Combat CàC (+1 suc auto) | Noble, Skald, Godi, Guérisseur, Leader, Volva, Aveugle |  |
| Boxeur | Vous vous battez à mains nues depuis l'enfance. Vous savez où frapper pour briser les os et assommer rapidement vos adversaires. | Combat sans arme (+1 suc auto). KO auto sur seuil+1 |  |  |
| Divorcé | Votre mariage arrangé fut un échec retentissant. L'union a été dissoute pour incompatibilité, vous laissant une certaine débrouillardise solitaire. | Survie (+1 suc auto) |  |  |
| Sens de l'orientation | Les étoiles et le soleil sont vos guides. Vous savez instinctivement où se trouve le Nord et comment diriger un navire vers sa destination. | Navigation (+1 suc auto), Action (en mer) +1 |  |  |
| Rameur fou | Vous êtes une machine inépuisable sur un banc de nage. Vous propulsez le navire plus vite et maniez la rame comme une arme contondante. | +3km/h lorsque vous ramez |  | Force 2 |
| Banni | Jugé coupable par le Thing, vous êtes un hors-la-loi. Vous ne pouvez revenir sur vos terres natales qu'en conquérant, ce qui vous a appris à survivre en marge. | Survie (+1 suc auto), Saga +1 |  | Chance 1 (max) |
| Troublé | Un mal inconnu ronge votre esprit. Entre pertes de mémoire et confusion, vous êtes assailli de visions prophétiques que vous ne contrôlez pas. | +1 succès difficulté, Divination (+2 succès auto) | MAGIQUE (RP ONLY) | MAGIQUE (RP ONLY) |
| Veuf/Veuve | Votre moitié a quitté ce monde, vous laissant seul(e). Parfois, vous sentez que son fantôme veille encore sur vous ou vous hante. | Survie (+1 suc auto), Chance (-1 suc auto) | Divorcé |  |
| Fin négociant | Marchand vétéran, vous avez l'œil pour estimer la valeur des choses. Vous savez exactement quand conclure une affaire ou quand partir en courant. | Marchandage (+1 suc auto) |  | Marchandage 1 |
| Vaurien | La ruse et la tromperie coulent dans vos veines. Vous savez mentir avec un aplomb tel que même les Dieux pourraient vous croire. | Larcin (+1 suc auto), Langue Orale - Mentir uniquement (+1 suc auto) | Godi, Leader né, Huskarl | Larcin 2 |
| Maître des bêtes | Vous imposez votre dominance aux animaux. Vous commencez le jeu avec un animal fidèle (chien, faucon...) validé par le MJ. | Dressage (+1 suc auto). Le compagnon agit à votre Initiative (1 Action propre) |  | Dressage 2, Amis des animaux 1 |
| Briseur de boucliers | Votre style brutal vise à détruire la protection adverse. Vous savez exactement où frapper pour faire éclater le bois. | Dégâts +1 Token contre les boucliers. Si bouclier détruit : Intimidation (+1 suc auto) gratuit immédiat |  | Force 3 |
| Insaisissable | Anguille sur le champ de bataille, vous misez tout sur la mobilité, refusant les armures lourdes qui vous ralentiraient. | Si Armure légère/nulle : SEUIL +1 contre CàC *(bonus Esquive retiré — Q-2)* | Peau dure, Berserk, Huskarl, Force de géant, Foudre de guerre, Taille imposante | Agilité 3 |
| Sang de troll | On murmure que votre lignée est souillée. Laid, peau grisâtre, vous effrayez les gens mais vos plaies se referment à une vitesse surnaturelle. | Armure naturelle +1. Récupération Blessure (divisée par 2) Charisme (-1 suc auto) sur tous les jets liés au Charisme. *(malus déplacé depuis la colonne « Incompatible » du vault)* | Noble lignée, Skald, Berserk | Force 3 |
| Sang de glace | L'hiver est votre élément. Le froid mordant ne vous atteint pas, là où d'autres mourraient gelés. | Immunisé aux malus/dégâts du froid naturel. Survie en hiver (+1 suc auto) |  | Survie 2 |
| Connaissance des runes | Vous avez appris ou avez eu une révélation pendant un rêve sur la signification et l'utilisation des Runes. Votre savoir vous permet de maîtriser en partie les runes et leurs pouvoirs. | Livre de sort (5pts) | Langue de serpent; Vaurien; | Chant 2 ou Divination 2 ou Folklore 3 |
| Marqué par les Nornes | Une marque physique singulière (difformité, tache de naissance, hétérochromie, six doigts) présente depuis ta naissance trahit que les Nornes ont tissé un destin exceptionnel pour toi. Tu es promis à la grandeur ou à la tragédie, mais jamais à l'oubli. Les gens te regardent avec fascination mêlée de malaise. | Saga +2, Chance (+1 suc auto), Charisme (-1 suc auto). **Obligation narrative :** Le MJ doit intégrer ton destin dans l'arc principal. | Ancien esclave, Sang de Troll, Noble lignée, Né sous Mauvais Augure, Porte-Poisse | Aucune. Le joueur décrit sa marque (validation MJ). |
| Né sous mauvais augure | Ta naissance fut accompagnée de présages funestes : éclipse, corbeau mort sur le seuil, mère morte en couches. Les völvas murmurent ton nom avec inquiétude. Les superstitieux t'évitent, convaincus que le malheur te suit. Pourtant, tu survis là où d'autres périssent. Malédiction ou bénédiction déguisée ? | Chance (+1 suc auto), Charisme (-1 suc auto), Intimidation (+1 suc auto) | Marqué par les Nornes, Noble lignée, Skald, Grand guérisseur | Aucune |
| Rêveur prophétique | Tes rêves sont d'une précision troublante. Tu as rêvé de la mort d'un voisin la veille de sa noyade, du retour d'un raid avant que le drakkar soit visible. Les Nornes te murmurent-elles à l'oreille, ou es-tu simplement très observateur ? Tu ne dors jamais vraiment paisiblement, toujours aux aguets de la prochaine vision. | **1 fois par session :** Déclare un pressentiment. Le MJ te donne un indice vague mais vrai sur un danger imminent. Perception (+1 suc auto). **Accumule +1 Token Fatigue/nuit** (sommeil agité). | Sommeil léger | Perception 2+ |
| Survivant miraculeux | Tu as survécu à quelque chose qui aurait dû te tuer : noyade dans les eaux glacées, incendie qui a consumé ta ferme, chute d'une falaise, massacre où tous les autres sont morts. Ton corps porte les cicatrices de cette épreuve, mais ton esprit refuse de céder. Protégé par les dieux ou simplement trop têtu pour mourir ? | Armure naturelle +1 (peau endurcie), Survie (+1 suc auto), Saga +1 | Peau dure | Force 2+ OU Chance 2+ |
| Porte-poisse | Les malheurs semblent te coller à la peau. Deux compagnons de raid sont morts à tes côtés l'an dernier. La ferme où tu travaillais a brûlé. Le bateau sur lequel tu naviguais a coulé. Toi, tu survis toujours. Coïncidence ? Malédiction ? Les karls refusent de t'embarquer, les femmes font des signes de protection quand tu passes. | Charisme (-2 suc auto), Chance (+2 suc auto). **Tu** survies, mais les autres autour de toi semblent attirer le malheur. | Noble lignée, Skald, Grand guérisseur, Marqué par les Nornes | Aucune |
| Tueur de monstre | Tu as tué une créature légendaire : un ours colossal qui terrorisait trois villages, un loup immense aux yeux de braise, un géant de glace dans les montagnes. Tu portes un trophée bien visible (dent percée en collier, griffe en broche, fourrure en cape). Ton nom inspire peur et respect à parts égales. Les guerriers te testent, les lâches t'évitent. | Intimidation (+1 suc auto), Saga +1 | Langue de serpent | Combat CàC 3+, Force 3+ |
| Sous le regard d'Odin | Le Père-de-Tout semble t'observer. Les corbeaux te suivent parfois, tes intuitions se révèlent justes plus souvent qu'elles ne devraient. Tu as survécu à des situations où la ruse seule t'a sauvé. Coïncidence ou faveur du dieu borgne ? Tu ne cherches pas à le savoir, mais les signes s'accumulent. | Intelligence (+1 suc auto), Saga +1 | Godi, Berserk, Sous le Regard de Thor/Tyr/Freyr/Freyja/Loki | Intelligence 2+ |
| Sous le regard de Thor | Le Tonnerre semble te protéger. Tu as survécu à des orages qui ont tué d'autres hommes. Tes coups frappent avec une force qui surprend même tes adversaires les plus aguerris. Les karls murmurent que le Défenseur de Midgard a posé sa main sur ton épaule. | Force (+1 suc auto), Saga +1 | Godi, Sous le Regard d'Odin/Tyr/Freyr/Freyja/Loki | Force 3+ |
| Sous le regard de Tyr | Tu es un parangon d'honneur et de courage. Ton bras ne tremble jamais, même face à la mort certaine. Tyr le Manchot, gardien des serments, semble guider ta lame. Tu ne recules jamais, même quand la sagesse commanderait la fuite. Les hommes d'honneur te respectent, les lâches te fuient. | Agilité (+1 suc auto), Saga +1 | Godi, Langue de serpent, Berserk, Sous le Regard d'Odin/Thor/Freyr/Freyja/Loki | Agilité 2+ |
| Sous le regard de Freyr | La fertilité et la prospérité te suivent. Tes champs donnent mieux que ceux de tes voisins. Les animaux t'aiment instinctivement. Les affaires que tu touches prospèrent. Le Seigneur des Récoltes semble avoir posé son regard bienveillant sur toi. Chance ou bénédiction du Vane pacifique ? | Charisme (+1 suc auto), Saga +1 | Godi, Sanglant, Sous le Regard d'Odin/Thor/Tyr/Freyja/Loki | Charisme 2+ |
| Sous le regard de Freyja | La Maîtresse de la Magie et de la Beauté semble t'avoir remarqué. Tu es charismatique, ton intuition est troublante, tes perceptions dépassent celles du commun. Certains murmurent que tu pratiques le seidr en secret. Les hommes et les femmes sont attirés par ta présence, sans toujours comprendre pourquoi. | Perception (+1 suc auto), Saga +1 | Godi, Sous le Regard d'Odin/Thor/Tyr/Freyr/Loki | Perception 2+ |
| Sous le regard de Loki | Le Dieu du Chaos et de la Ruse semble trouver ton existence amusante. Les coïncidences impossibles se multiplient autour de toi : la corde qui cède au bon moment, l'ennemi qui trébuche, la porte qui s'ouvre. Tu échappes au destin par des chemins tortueux. Chance pure ou manipulation divine ? | Chance (+1 suc auto), Saga +1 | Godi, Sous le Regard d'Odin/Thor/Tyr/Freyr/Freyja | Chance 2+ |
| Lien avec les Landvættir | Tu respectes profondément les esprits de la terre. Tu laisses toujours des offrandes aux cairns, tu ne souilles jamais les sources sacrées. En retour, les landvættir semblent te guider : les animaux sauvages ne t'attaquent pas sans raison, tu trouves toujours de l'eau en terre inconnue, les loups t'ont épargné plus d'une fois. | Survie (+1 suc auto) en milieu naturel, Dressage (+1 suc auto) | Sanglant | Survie 2+ |
| Jumeau/Jumelle | Tu es né avec un frère ou une sœur jumelle. Ce lien est considéré comme mystique par les Norses. Vous partagez une connexion troublante, une intuition qui vous permet parfois de sentir l'état de l'autre, même à distance. Si ton jumeau est mort, son ombre te hante encore, te protégeant peut-être depuis l'au-delà. | Perception (+1 suc auto). **Si jumeau mort :** Chance (+1 suc auto) supplémentaire. | Aucune | Aucune (décider à la création : vivant ou mort) |
| Enfant des nuits blanches | Tu es né lors du solstice d'été, sous le soleil de minuit qui ne se couche jamais. Les anciens disent que tu es béni par la lumière éternelle. Tu te sens vivant, électrique, sous le jour sans fin, mais l'obscurité t'oppresse comme un linceul. Ton aura est solaire, ta présence rayonnante. | Perception (+1 suc auto) en plein jour/lumière vive, Charisme (+1 suc auto). **Perception (-1 suc auto) dans l'obscurité totale.** | Enfant de l'Hiver Noir, Vue perçante | Aucune |
| Enfant de l'hiver noir | Tu es né lors du solstice d'hiver, dans la nuit polaire la plus longue où le soleil ne se lève jamais. Les anciens murmurent que tu portes l'ombre en toi. Tu vois dans le noir là où d'autres tâtonnent aveugles, mais le soleil éclatant te brûle les yeux et t'aveugle. Ta présence est sombre, glaçante, troublante. | Perception (+1 suc auto) dans l'obscurité/pénombre, Intimidation (+1 suc auto). **Perception (-1 suc auto) en pleine lumière.** | Enfant des Nuits Blanches, Vue perçante | Aucune |
| Orphelin aguerri | Tu as grandi seul, sans famille pour te protéger ou t'enseigner. Tu as appris à survivre par toi-même : voler un pain sans te faire prendre, mentir pour échapper aux coups, te cacher dans l'ombre. Mais cette enfance solitaire a laissé des cicatrices invisibles. Tu ne sais pas faire confiance, et les liens familiaux t'échappent. | Survie (+1 suc auto), Larcin (+1 suc auto), Charisme (-1 suc auto) | Noble lignée, Dernier de la Lignée | Agilité 2+ OU (Survie 1+ ET Larcin 1+) |
| Dernier de la lignée | Tu es le dernier descendant vivant d'une famille autrefois puissante et respectée. Le poids de perpétuer le nom, de restaurer l'honneur perdu, repose entièrement sur tes épaules. Chaque échec est une trahison envers tes ancêtres morts. Les vieux se souviennent encore de ton grand-père, et te jugent à l'aune de sa gloire passée. | Saga +1, Chance (-1 suc auto). **Obligation narrative :** Le MJ peut créer des pressions familiales, sociales, ou des ennemis anciens de ta lignée. | Orphelin Aguerri, Ancien esclave, Bâtard Reconnu | Charisme 2+ |
| Bâtard reconnu | Tu es l'enfant illégitime d'un noble, conçu hors mariage. Mais contrairement à la plupart des bâtards, ton père t'a reconnu publiquement, te donnant son nom mais pas son héritage. Tu portes un nom prestigieux, mais les héritiers légitimes te regardent avec jalousie et mépris. Tu dois prouver ta valeur doublement. | Saga +1 | Noble lignée, Ancien esclave, Orphelin Aguerri, Dernier de la Lignée | Aucune |
| Serment rompu | Tu as trahi un serment sacré, prononcé devant témoins ou sur un anneau. Par nécessité, par lâcheté, ou parce qu'on t'y a forcé, tu as brisé ta parole. Ton honneur est souillé, ton nom sali. Les gens qui connaissent ton passé te méprisent ouvertement. Les dieux eux-mêmes semblent t'avoir tourné le dos. Tu cherches peut-être la rédemption, ou tu t'en fiches. | Charisme (-2 suc auto), Intimidation (+1 suc auto), Chance (-1 suc auto) | Noble lignée, Sous le Regard de Tyr, Grand guérisseur | Aucune |
| Dette de sang | Ta famille doit une compensation massive (wergild) pour un meurtre ou un crime grave commis par l'un des tiens. Cette dette est colossale, impayable en une vie. Tu portes ce fardeau invisible partout où tu vas. Les créanciers peuvent apparaître n'importe quand, les menaces sont constantes, la honte sociale est permanente. | Charisme (-1 suc auto), Survie (+1 suc auto). **Motivation narrative :** Le MJ peut créer des scénarios autour du remboursement ou des conséquences de cette dette. | Noble lignée | Aucune |

## Annexe C — Runes

Source : vault `06`.

| Niveau | Capacité                                                                          |
| ------ | --------------------------------------------------------------------------------- |
| **0**  | Signe inconnu.                                                                    |
| **1**  | Identification littérale et légendes associées.                                   |
| **2**  | Sensoriel : sentir la présence ou l'influence de la rune.                         |
| **3**  | Active : tracer la rune, activer sa magie, combiner jusqu'à 3 runes.              |
| **4**  | Création d'objets à charge, tatouages magiques. On peut combiner jusqu'à 4 runes. |
| **5**  | Artefacts permanents, visions prophétiques. On peut combiner jusqu'à 5 runes.     |

| Rune  | Nom      | Lettre      | Traduction littérale      | Sens ésotérique                                    |
| :---- | :------- | :---------- | :------------------------ | :------------------------------------------------- |
| **ᚠ** | Fehu     | F           | Bétail                    | Argent, richesse                                   |
| **ᚢ** | Uruz     | U           | Aurochs                   | Force, virilité                                    |
| **ᚦ** | Thurisaz | Th          | Thor, Géant               | Monstre, démon, chaos                              |
| **ᚨ** | Ansuz    | A           | Messager, ange            | Communication, source, Odin                        |
| **ᚱ** | Raidho   | R           | Monter à cheval, Charriot | Voyage, moyen de transport, roue                   |
| **ᚲ** | Kauno    | K           | Torche                    | Transition, soin, lumière                          |
| **ᚷ** | Gebo     | G           | Cadeau                    | Cadeau, surprise, baiser, chance, aubaine, fortune |
| **ᚹ** | Wunjo    | W           | Joie                      | Joie, bonheur, romance                             |
| **ᚺ** | Hagalaz  | H           | Grêle                     | Adversité, Perturbation                            |
| **ᚾ** | Naudiz   | N           | Besoin                    | Nécessité, contrainte, friction                    |
| **ᛁ** | Isa      | I (short)   | Glace                     | Stagnation, froid, stase, immobile                 |
| **ᛃ** | Jera     | J           | Année, Moisson            | Moisson, cycle, Abondance                          |
| **ᛇ** | Ihwaz    | Y, I (long) | (Bois d')if               | Yggdrasil, longévité, arbre                        |
| **ᛈ** | Perth    | P           | Foyer                     | Destin, fatalité, Nornes, divination               |
| **ᛉ** | Algiz    | Z (Rr)      | Cerf                      | Abri, protection                                   |
| **ᛊ** | Sowilo   | S           | Soleil                    | Succès, énergie                                    |
| **ᛏ** | Tiwaz    | T           | Le Dieu Tyr               | Courage, se faire justice, guerre, sacrifice       |
| **ᛒ** | Berkanan | B           | Bouleau                   | Fertilité, croissance                              |
| **ᛖ** | Ehwaz    | E           | Cheval                    | Vitesse, progression, confiance                    |
| **ᛗ** | Mannaz   | M           | Homme                     | Humanité, conscience                               |
| **ᛚ** | Laguz    | L           | Eau                       | Inconscient, collectif, mémoire, flux              |
| **ᛜ** | Ingwaz   | Ng          | Graine                    | Harmony, unité, paix                               |
| **ᛟ** | Othila   | O           | Ancêtre                   | Héritage, possession terrestre, noble              |
| **ᛞ** | Dagaz    | D, Dj       | Jour                      | Eveil, aube, percée, progrès, pureté               |

## Annexe D — Équipement et économie

Source : vault `05`. Monnaie : once d'argent (oz ≈ 28 g).

### Coût de la vie

| Nom                    | Description                                                           | Prix Moy.                  |
| :--------------------- | :-------------------------------------------------------------------- | :------------------------- |
| Nécessaire de toilette | Cure oreille, pince à épiler, lime, sur chainette en fer.             | 4 oz                       |
| Pichet de vin          | Vin de basse qualité (Import).                                        | 1-2 oz                     |
| Fruits (au kg)         | Fraîchement ramassés (baies, pommes, fraises).                        | 1 oz                       |
| Sac de provisions      | Un sac contenant des provisions pour une personne pendant une semaine | 1-2 oz                     |
| Chaine (au m)          | Chaîne de fer (transport esclaves).                                   | 10 oz                      |
| Corde (au 10m)         | Corde marine pour langskip.                                           | 6 oz                       |
| Esclave                | Standard, bonne santé, pour dures besognes.                           | 20 oz                      |
| Fourrure               | Peau tannée pour chaleur ou commerce.                                 | Variable                   |
| Médaillon protection   | Marteau ou femme, représente un Dieu.                                 | 12 oz                      |
| Cheval                 | Monture standard.                                                     | 80 oz (ou + selon qualité) |
| Vache                  | Bétail.                                                               | 30 oz                      |
| Corne                  | Taillée dans défense de morse ou corne taureau.                       | 3 oz                       |
| Rame                   | Belle rame monobloc (pin/tilleul).                                    | 8 oz                       |

### Armes

| Arme                | Type     | Dist | Dégâts | Pré-requis   | Matériau | Prix Moy. | Notes                                      |
| :------------------ | :------- | :--- | :----- | :----------- | :------- | :-------- | :----------------------------------------- |
| Hache               | 1 main   | -    | 2      | For 2        | Fer      | 20 oz     | -                                          |
| Gourdin             | 1 main   | -    | 1      | For 1        | Fer/Bois | 15 oz     | -                                          |
| Hache Dane          | 2 mains  | -    | 2      | For 2, Agi 2 | Fer      | 50 oz     | -                                          |
| Glaive              | 2 mains  | -    | 2      | For 2        | Fer      | 20 oz     | -                                          |
| Scramasaxe          | 2 mains  | -    | 1      | For 1        | Fer      | 15 oz     | -                                          |
| Lance               | 2m / Jet | 15m  | 2      | For 2, Agi 2 | Fer      | 36 oz     | Compétence Javelot pour distance possible. |
| Epée                | 1 main   | -    | 2      | For 2        | Fer      | 36 oz     | -                                          |
| Epée longue         | 2 mains  | -    | 2      | For 3        | Fer      | 42 oz     | -                                          |
| Grande hache        | 2 mains  | -    | 2      | For 3        | Fer      | 42 oz     | -                                          |
| Scramasaxe (Acier)  | 2 mains  | -    | 1      | For 1        | Acier    | 36 oz     | Post 830                                   |
| Epée (Acier)        | 1 main   | -    | 2      | For 2        | Acier    | 120 oz    | Post 830                                   |
| Epée longue (Acier) | 2 mains  | -    | 2      | For 3        | Acier    | 160 oz    | Post 830                                   |
| Gde hache (Acier)   | 2 mains  | -    | 2      | For 3        | Acier    | 160 oz    | Post 830                                   |
| Arc                 | Distance | 30m  | 1      | Agi 2        | -        | 25 oz     | Ignore l'armure (sauf bouclier)            |
| Couteau             | 1m / Jet | 15m  | 1      | For 1, Agi 1 | Fer      | 10 oz     | -                                          |
| Javelot             | Distance | 25m  | 2      | For 3        | Fer      | 20 oz     | -                                          |
| Baton               | 2 mains  | -    | 2      | For 2        | Fer/Bois | 15 oz     | -                                          |
| Fronde              | Distance | 20m  | 1      | Agi 1        | -        | 10 oz     | -                                          |

### Armures et boucliers

| Nom              | Réduc Dégâts | Pré-requis | Prix Moy. | Notes                                  |
| :--------------- | :----------- | :--------- | :-------- | :------------------------------------- |
| Tissu            | 0            | -          | 5 oz      | -                                      |
| Tissu décoré     | 0            | -          | 30 oz     | Statut social                          |
| Broigne          | 1            | For 1      | 33 oz     | -                                      |
| Peau de bête     | 1            | For 1      | 25 oz     | -                                      |
| Bouclier en bois | 1            | Comp CàC   | 10 oz     | Se brise si Dégâts > 1                 |
| Plaque de cuir   | 2            | For 2      | 36 oz     | -                                      |
| Bouclier cuir    | 2            | Comp CàC   | 16 oz     | Se brise si Dégâts > 2                 |
| Cuir renforcé    |              |            |           |                                        |
| Casque           |              |            |           | (Généralement empêche critique mortel) |
