# Initiative : tours et actions (brique plateforme)

## Statut

**Phase 1 close le 2026-11-11** (décisions au §8). **Phase 2 close le 2026-11-11** (§9 validé, planche validée : `documentations/initiative/planche_initiative.html`). **Lot 1 implémenté le 2026-11-11** (socle + Delta Green, §10) ; vérification du MJ en dev attendue.

Lecture : les §4 à §7 gardent la trace du brainstorm (vocabulaire et stockage depuis remplacés) ; ce qui fait foi est le §8 (décisions) et le §9 (technique).

Origine : backlog, « gestionnaire plateforme de rounds / tours / initiative », qui remplace le combat de la plateforme supprimé le 2026-11-09 par une vision plus légère (`spec_pnj.md` §5). Les PNJ à la table (`session_npcs`) doivent pouvoir s'y brancher.

Hors périmètre (proposé) : les dégâts, la santé, les actions, les états des personnages (chantier séparé au backlog, mais on laisse la place : voir §4.8), le lien avec les jetons du tableau.

---

## 1. Idée du MJ

- Le MJ lance, sur une table, un compteur de **rounds** et de **tours** ; un slug qui n'a pas adopté la brique ne la propose pas.
- Une **bande de portraits** (PJ et PNJ) en ligne ; le MJ fait avancer le tour par un bouton.
- Le MJ ajoute les personnages, les réordonne, saisit éventuellement une valeur d'initiative ; le slug peut fournir l'initiative de ses personnages (chacun à sa façon).
- **Élément flottant**, placé par chacun où il veut ; par défaut en haut, au-dessus du bandeau. Horizontal ou vertical.

---

## 2. Existant (relevé dans le code)

| Élément | Où | Remarque |
|---|---|---|
| Initiative maison de Delta Green | `deltagreen/gm/tabs/TabSession.jsx` (l. 549, 619-708) | PJ seulement, triés par DEX, bouton « Suivant », état local au MJ (perdu au rechargement, invisible des joueurs). Spec §6.3. Remplacée par la brique si Delta Green l'adopte. |
| Fenêtre flottante | `ui/panel/FloatingPanel.jsx`, `ui/hooks/useFloatingWindow.js`, `ui/tools/floatingGeometry.js` | Déplacement, mémorisation par slug, pile de premier plan, maintien dans l'écran : réutilisables. Mais c'est une fenêtre à barre de titre, habillée comme une modale : trop lourde pour une bande fine (§4.6). |
| Briques activées par table | `AudioSessionToggle`, `BoardSessionToggle` montés dans le `TabSession` des 13 slugs ; `AudioLayer`, `BoardLayer` montés par `PlayerPage` / `GMPage` | Modèle direct pour activer la bande sur une table et l'afficher chez tous. |
| Bases de module | `database/audio.db`, `database/board.db` (`src/server/db/modules/`) | Une ligne porte le slug et la table : pas de migration dans les 13 bases de slugs. |
| PNJ à la table | `session_npcs` (`base.sql`) : `name`, `sheet`, `state`, `sort_order` | `spec_pnj.md` §6 prévoyait une colonne d'initiative ajoutée « par sa propre migration ». Voir Q-9. |
| Zone d'actions | `ZoneAction` (`spec_ui_actions.md`) | Bouton d'ouverture possible pour le MJ (et pour réafficher la bande masquée chez un joueur). |
| Barre de session des joueurs | `SessionPlayersBar` (`spec_session_bar.md`) | Avatars, présence, carte au survol : petites briques réutilisables pour les portraits. |

### 2.1 Façons de jouer un tour selon les slugs

Relevé dans les specs, à corriger si je me trompe :

| Slug | Façon de jouer | Ce que la brique doit permettre |
|---|---|---|
| Delta Green | Ordre par DEX décroissante | Liste triée par une valeur fixe |
| Vampire | Valeur fixe (Dex + Astuce + Célérité) + jet | Valeur saisie ou calculée, tri |
| Maledictum | Initiative statique (BPer + BAg), la spec renvoie au « bloc combat de la plateforme » | Valeur calculée par le slug, tri |
| Vikings | 2d10 + Agilité ; piste du MJ : passer à « joueurs puis PNJ » | Valeur saisie après jet, ou ordre par camps |
| Nimble | d20 + Initiative, règle aussi le nombre d'actions du 1er tour (sur la fiche) | Valeur saisie après jet |
| Tecumah | Initiative par Réflexes | Valeur saisie après jet |
| Fabula | Test d'initiative de groupe, puis **alternance** entre camps ; Élite **deux tours par round** | Ordre libre choisi par le MJ, plusieurs tours pour un participant |
| Zone Blanche, Dune, Achtung (2D20) | Initiative à un camp selon la scène, puis **alternance** ; « garder la main » (agir deux fois) | Ordre libre, « qui n'a pas encore agi ce round » |
| Cyberpunk (PbtA) | Pas de tours | Probablement pas d'adoption |
| Vileborn | Ni initiative ni combat (spec §27) | Pas d'adoption |
| Noctis | Hors périmètre (refonte en attente) | — |

Conclusion : deux grands modes coexistent, l'**ordre trié** (Delta Green, Vampire, Maledictum, Vikings, Nimble, Tecumah) et l'**alternance libre** (2D20, Fabula). La brique doit couvrir les deux sans les coder en dur (§4.2).

---

## 3. Vocabulaire proposé

- **Round** : un passage complet de tous les participants. Compteur affiché (« Round 3 »).
- **Tour** : le moment où un participant agit. Un participant peut avoir plusieurs tours par round (Élite de Fabula).

**Corrigé au §7.5** : ce vocabulaire est l'inverse de celui des règles de la table (« tour » = passage complet). Les §4 et §7.1 à §7.4 gardent l'ancien sens.
- **Participant** : une entrée de la bande : un PJ de la table, un PNJ de la table (`session_npcs`), ou une entrée libre (« Renforts », « L'incendie »).

---

## 4. Propositions

### 4.1 Nom

Le nom doit aller aux deux modes (trié et alternance) et ne pas dire « combat » (une poursuite, une négociation tendue se jouent aussi au tour par tour).

| Proposition | Pour | Contre |
|---|---|---|
| **« Ordre de jeu »** | Neutre, dit ce que c'est, vaut pour les deux modes | Un peu plat |
| « Initiative » | Le mot que tout le monde connaît | Faux pour les 2D20 et Fabula (pas d'ordre d'initiative), Vileborn n'en a pas |
| « Frise » / « Frise des tours » | Décrit la forme (bande de portraits) | Moins parlant hors contexte |
| « Rounds » | Court | Anglicisme, ne dit rien des tours |

**Reco** : « Ordre de jeu » à l'écran (bouton « Lancer l'ordre de jeu », bande titrée « Round 3 »), et `turns` dans le code (`TurnTrack`, `useTurns`, `vtt-turns-*`, `database/turns.db`).

### 4.2 Un seul modèle pour les deux modes

- Une **liste ordonnée** de participants + un **participant actif** + le **numéro de round**.
- Chaque participant a une case « **a agi** ce round » (pastille sur le portrait).
- **Suivant** : passe au prochain participant qui n'a pas agi (mode trié). Fin de liste : round suivant, les « a agi » se vident.
- **Clic sur un portrait** (MJ) : il devient actif (mode alternance : le MJ choisit qui agit ensuite). Le précédent est marqué « a agi ».
- **Tours par round** : un nombre par participant (1 par défaut), affiché en petit (« ×2 ») ; il agit autant de fois avant d'être « a agi ».
- **Tri** : bouton « Trier par initiative » ; sinon l'ordre est celui que le MJ fait au glisser-déposer. Égalités : le MJ départage en glissant.

Pas de « mode » à choisir : c'est la même bande, le MJ se sert de « Suivant » ou du clic selon son jeu. Un slug pourra plus tard en dire plus (ex. grouper par camps) si le besoin vient. **Remplacé par le §7.2** (mode déclaré par le slug, camps dès la v1).

### 4.3 Adoption par un slug

Sur le modèle de l'audio et du tableau :

- Le slug déclare la brique dans son `config.jsx` (bloc `turns`, §4.4) ; **sans ce bloc, rien n'apparaît** (ni bouton, ni bande).
- Le MJ lance l'ordre de jeu depuis la zone d'actions (bouton de la plateforme), sans toggle d'activation dans `TabSession` : contrairement à la musique ou au tableau, il n'y a rien à préparer sur la table à l'avance (Q-5).
- La bande est montée par `PlayerPage` / `GMPage` (`TurnsLayer`, comme `BoardLayer`) : **aucun code dans la fiche ni dans `GMApp`**.

### 4.4 Ce que le slug peut fournir (tout facultatif)

```js
turns: {
  initiative: (character) => number | null,    // valeur d'un PJ (DEX de Delta Green, BPer + BAg de Maledictum)
  npcInitiative: (npc) => number | null,       // valeur d'un PNJ de la table (depuis sa fiche copiée)
  npcTurns: (npc) => number,                   // tours par round (Élite de Fabula : 2)
  initiativeLabel: 'DEX',                      // libellé de la valeur
}
```

Sans fonction, la valeur reste vide et le MJ la saisit (ou range à la main). **Jet d'initiative automatique** : pas en v1 (Q-7).

### 4.5 Ce que voit et fait chacun

**MJ** :
- Lancer / terminer l'ordre de jeu de la table.
- Ajouter : tous les PJ de la table d'un clic, des PNJ de la table, une entrée libre (nom, couleur ou icône).
- Retirer, réordonner (glisser), saisir l'initiative et les tours par round, masquer un participant aux joueurs (embuscade).
- Suivant, clic pour activer, revenir en arrière d'un tour (erreur de clic), remettre le round à 1.

**Joueur** :
- Voit la bande, le round, le participant actif, son propre portrait signalé.
- **« À toi de jouer »** : son portrait mis en avant et une notification à son tour (Q-11).
- Ne modifie rien (Q-12 : bouton « Fin de mon tour » ?).

**Visibilité** : les participants masqués et, au choix (Q-10), les valeurs d'initiative sont filtrés côté client (choix assumé du projet). Les actions sont protégées côté serveur (`requireGM`).

### 4.6 Forme de la bande

- **Flottante par-dessus la page**, sans pousser la mise en page (sinon 13 fiches et leurs bandeaux à reprendre).
- **Par défaut en haut, centrée**, par-dessus le bandeau ; chacun la déplace, sa place est **mémorisée par slug** (comme les fenêtres flottantes).
- **Horizontale ou verticale** au choix de chacun (bouton de bascule, mémorisé). Reco : pas de bascule automatique selon le bord, une bascule manuelle suffit et ne surprend pas.
- **Réduite** : une pastille « Round 3 · portrait actif », pour récupérer la place.
- Réutilise `useFloatingWindow` (position, mémorisation, maintien dans l'écran, premier plan) mais **pas `FloatingPanel`** : pas de barre de titre ni d'habillage de modale, une poignée discrète au bout de la bande. Le MJ a ses boutons (Suivant, Ajouter, ⋯) au bout de la bande ; le joueur n'a que la poignée et la bascule.
- Nombreux participants : la bande défile, l'actif reste visible ; portraits rapetissés au-delà d'une largeur.
- Portraits : avatar (ou initiales), nom au survol, pastilles « a agi », « ×2 », valeur d'initiative.
- Habillage : classes `vtt-turns-*`, style par défaut dans `features/initiative/initiative.css`, `theme.css` par slug ; **planche HTML avant le code** (avec 2 ou 3 slugs pilotes, Q-14).

### 4.7 Données et temps réel

**Remplacé par le §7.1** (pas de base : mémoire du serveur + copie de secours chez le MJ).

**Reco : base de module `database/turns.db`**, comme le tableau et l'audio : une ligne par table (`slug`, `session_id`, `round`, `active`, `participants` en JSON). Le MJ est le seul à écrire : un état entier écrit et diffusé à chaque action reste simple et sans conflit.

Participant (dans le JSON) : `{ key, kind: 'character' | 'npc' | 'free', refId, name, avatar, initiative, turnsPerRound, turnsTaken, hidden }`. Nom et avatar copiés à l'ajout (une entrée libre n'a pas de fiche), rafraîchis depuis la fiche pour un PJ.

| Option | Pour | Contre |
|---|---|---|
| **Base de module `turns.db`** (reco) | Aucune migration dans les 13 bases ; même pattern que `board.db` ; survit au redémarrage | Une base de plus |
| Table dans chaque base de slug | Tout au même endroit que les personnages | Schéma + migration dans 13 slugs pour une brique optionnelle |
| Mémoire du serveur seulement | Rien en base | Perdu à chaque redémarrage du serveur (release en cours de partie) |

Conséquence : l'initiative d'un PNJ vit dans la bande, pas dans `session_npcs` ; pas de colonne ajoutée à `session_npcs`, contrairement à ce qu'envisageait `spec_pnj.md` §6 (à y noter).

Routes (préfixe à fixer en phase 2) : lecture par tous les membres de la table, écritures `requireGM`. Socket : un événement `turns-update` (état complet) dans la room de la table ; un `turns-your-turn` n'est pas utile, le client déduit « c'est à moi » de l'état.

### 4.8 Pour plus tard (place laissée, rien codé)

- États à durée en tours (Berserk, états VDA, Delta Green) : un participant aura une liste de marqueurs décomptés au changement de round.
- Jet d'initiative par le moteur de dés, résultat versé dans la bande.
- Mise en avant du jeton du participant actif sur le tableau.
- Regroupement par camps (PJ / PNJ) pour les 2D20.

---

## 5. Questions

| # | Question | Reco | Réponse                                                                                                                                                                                                                                                                              |
|---|---|---|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-1 | Nom à l'écran (§4.1) ? | « Ordre de jeu », `turns` dans le code | A définir, "ordre de jeu" c'est long, pas terrible. Pour l'instant je préfère encore utilisé Initiative mais c'est à discuter et à faire des propals                                                                                                                                 |
| Q-2 | Un seul modèle « liste + actif + a agi + tours par round », Suivant ou clic selon le jeu, sans mode à choisir (§4.2) ? | Oui |                                                                                                                                                                                                                                                                                      |
| Q-3 | Adoption : bloc `turns` dans `config.jsx`, bande montée par la plateforme, rien dans la fiche ni dans `GMApp` (§4.3) ? | Oui |                                                                                                                                                                                                                                                                                      |
| Q-4 | Quels slugs l'adoptent en v1 ? | Tous sauf Cyberpunk, Vileborn et Noctis ; Delta Green perd son initiative maison | oui                                                                                                                                                                                                                                                                                  |
| Q-5 | L'activation sur la table et le lancement de l'ordre de jeu : deux gestes (brique activée sur la table, puis « Lancer » en début de combat) ou un seul ? | Un seul : la brique est disponible dès que le slug l'a adoptée, le MJ lance et termine l'ordre de jeu ; pas de toggle dans `TabSession`, un bouton dans la zone d'actions du MJ | un seul                                                                                                                                                                                                                                                                              |
| Q-6 | Initiative fournie par le slug (§4.4) : en v1, pour quels slugs ? | Les valeurs fixes seulement (Delta Green, Maledictum, Vampire hors jet) ; les autres : saisie du MJ | reco. Un truc sur la saisie elle doit permettre de placer les portrait dans le bon ordre aussi. Evidemment le MJ peut réordonné après mais par défaut ou sur appuie d'un bouton action/call2action ça trie                                                                           |
| Q-7 | Jet d'initiative : le MJ saisit le résultat annoncé par le joueur, ou le jet du joueur se verse tout seul dans la bande ? | Saisie en v1 ; versement automatique plus tard (lien avec le moteur de dés de chaque slug) | Saisie                                                                                                                                                                                                                                                                               |
| Q-8 | Ajout des participants : PJ de la table en un clic, PNJ de la table, entrées libres. Faut-il aussi ajouter un PNJ de la **bibliothèque** directement (il serait alors ajouté à la table au passage) ? | Oui : un seul geste pour le MJ, le PNJ arrive à la table et dans la bande | oui pourquoi pas, faut quand même que le GM garde la main et puisse retiré ou ne pas mettre certain PNJ à son choix                                                                                                                                                                  |
| Q-9 | Stockage : base de module `turns.db`, état complet en JSON par table (§4.7) ? | Oui | A discuter ça, comme je le disais, je suis pas convaincu qu'on est besoin d'un stockage bdd et encore moins d'un stockage central                                                                                                                                                    |
| Q-10 | Les joueurs voient-ils les valeurs d'initiative ? | Non par défaut, réglage du MJ pour les montrer | Reco. Donc visible pour le GM oui, et option pour montrer aux joueurs éventuellement mais franchement pas un truc obligatoire à mon sens                                                                                                                                             |
| Q-11 | Signal « à toi de jouer » chez le joueur : portrait mis en avant seulement, ou aussi une notification (toast), un son ? | Portrait + toast ; pas de son | pas de son non, toast pourquoi pas mais pas de trace dans l'historique                                                                                                                                                                                                               |
| Q-12 | Le joueur peut-il finir son tour lui-même (« J'ai fini ») ? | Non en v1 : le MJ garde la main sur le rythme | Non à la main du GM toujours                                                                                                                                                                                                                                                         |
| Q-13 | Forme (§4.6) : flottante sans pousser la page, en haut au centre par défaut, déplaçable, horizontale / verticale par bascule manuelle, réductible, tout mémorisé par slug et par personne ? | Oui | oui. Possiblement pour les PNJ ça affiche la carte du PNJ lorsqu'on clique sur un portrait de PNJ, et carte du PJ si le slub a mis en config un affichage pour la carte, j'aime bien cette idée.                                                                                     |
| Q-14 | Slugs pilotes pour la planche et l'habillage ? | Fabula (alternance, Élites à 2 tours), Delta Green (ordre trié, remplace l'existant), Vikings (habillage le plus exigeant) | oui par exemple                                                                                                                                                                                                                                                                      |
| Q-15 | Participant à 0 PV ou hors combat : le retirer, ou le garder grisé (« hors jeu ») ? | Grisé et sauté par « Suivant », retirable | Grisé pour les PJ et toujours dans l'ordre, la plupart des jeu intégre des systèmes de survie avec un jet qui permet de sortir du KO etc. Pour les PNJ par défaut ça reste jusqu'au prochain tour et ça sort de la frise je pense. Option à la main du GM je pense dans tous les cas |
| Q-16 | Un tour « retardé » (le participant attend pour agir plus tard dans le round) : utile en v1 ? | Non : le MJ le glisse plus loin dans la bande | Utile pour certains système de jeu, c'est une mécanique qui existe dans Vampire ça                                                                                                                                                                                                   |
| Q-17 | Les joueurs qui ne sont pas en ligne : leur PJ figure dans la bande quand même ? | Oui, avec le portrait estompé comme dans la barre de session | Non, le MJ peut ajouté ou non, il a la main de toute façon pour faire entrer ou sortir PJ comme PNJ, en ligne comme hors ligne (oui il peut y avoir un combat qui n'implique que 2 PJ sur 4 par exemple, c'est rare mais pas impossible)                                             |

---

## 6. Lots envisagés (à confirmer en phase 2)

1. **Socle** : base de module, routes, socket, `TurnsLayer`, bande MJ et joueur au style par défaut, ajout / retrait / tri / Suivant / round.
2. **Slugs** : bloc `turns` des slugs adoptants, retrait de l'initiative maison de Delta Green, toast « à toi de jouer ».
3. **Habillage** : planche HTML validée, puis `theme.css` des pilotes, puis des autres.

---

## 7. Retours du MJ (2026-11-11) et propositions révisées

Retours : d'accord sur l'ensemble des propositions principales (§4) ; Delta Green perd son initiative maison (Q-4, en partie) ; doute sur une base dédiée ; aller plus loin dans la config (camps de Dune, garder la main) ; niveaux de blessure des PNJ.

### 7.1 Stockage : pas de base

Ce qu'il faut vraiment : que l'état survive au **rechargement** d'une page (MJ ou joueur) et qu'un joueur qui **arrive en cours** le reçoive. Une base ne sert qu'à survivre à un **redémarrage du serveur** (release, plantage, nodemon en dev), rare en pleine partie.

| Option | Pour | Contre |
|---|---|---|
| Base de module (ancienne reco) | Survit à tout | Lourd pour un état de quelques minutes : schéma, module, routes |
| **Mémoire du serveur** (comme les personnages en ligne, `socket/index.js`) | Aucun schéma, aucune route : des événements socket seulement ; rechargements et arrivées couverts | Perdu au redémarrage du serveur |
| Navigateur du MJ seul, relayé par socket | Rien côté serveur | Les joueurs ne voient rien tant que le MJ n'est pas connecté ; deux onglets MJ divergent |

**Reco** : mémoire du serveur, clé `${slug}_session_${id}`, écritures du MJ vérifiées dans le handler. **Plus** une copie de secours dans le navigateur du MJ (`browserStorage`) : si le serveur n'a plus d'ordre de jeu pour la table alors que la copie en a un, le MJ voit « Reprendre l'ordre de jeu (round 3) ». Coût : quelques lignes, et le redémarrage n'est plus un problème.

Conséquence inchangée : rien n'est ajouté à `session_npcs`.

### 7.2 Mode déclaré par le slug

Le slug choisit son mode dans `config.jsx` ; le MJ n'a rien à régler.

**`mode: 'order'`** (ordre trié, §4.2) : liste, initiative, Suivant, tours par round. Delta Green, Vampire, Maledictum, Nimble, Tecumah, Vikings d'aujourd'hui.

**`mode: 'sides'`** (alternance par camps) : Dune, Zone Blanche, Achtung, Fabula, et Vikings si la table passe à « joueurs puis PNJ ».
- La bande montre **deux groupes** (PJ / adversaires), pas un ordre de personnages.
- Le **camp qui a la main** est signalé ; le MJ choisit le camp qui commence le round.
- Dans le camp qui a la main, **on choisit qui agit** : côté PJ, chaque joueur peut prendre la main pour **son** personnage (clic sur son portrait) ou le MJ désigne ; côté adversaires, le MJ.
- Quand le participant a agi, la main passe à l'autre camp ; un camp épuisé laisse l'autre enchaîner ; quand tout le monde a agi, round suivant.
- **Garder la main** : bouton offert au camp qui vient d'agir, **une fois par round et par camp**, avec un coût déclaré par le slug (Dune : Impulsion côté PJ, Menace côté MJ ; Zone Blanche : 2 Audimat / 2 Stress). Les tours par round (Élite de Fabula) restent valables.

```js
turns: {
  mode: 'sides',
  sides: { players: 'Joueurs', gm: 'Adversaires' },          // libellés
  keepInitiative: { players: '2 Impulsion', gm: '2 Menace' }, // texte du bouton ; absent : pas de bouton
  // facultatif : débit automatique de la ressource de session
  onKeepInitiative: (side, ctx) => { /* … */ },
  // inchangé : initiative, npcInitiative, npcTurns, npcWound (§7.3)
}
```

Questions ouvertes : débit automatique de la ressource (Q-19) et joueur qui prend la main lui-même (Q-20). Conséquence : en mode camps, le joueur **écrit** dans l'ordre de jeu (prendre la main, demander à garder la main), donc le serveur vérifie qu'il ne touche qu'à son personnage et seulement quand son camp a la main.

### 7.3 Niveaux de blessure

Une échelle commune, montrée sur le portrait par un filtre (habillable par le slug) :

| Niveau | Rendu proposé |
|---|---|
| Indemne | Portrait normal |
| Blessure légère | Liseré ou voile rouge léger |
| Blessure modérée | Voile plus marqué, une entaille |
| Blessure grave | Portrait assombri, rouge franc |
| Hors de combat | Grisé barré ; sauté par Suivant ; **retiré au début du round suivant** (le MJ peut annuler d'un clic avant) |

- **Qui règle le niveau** : le MJ, par un menu sur le portrait. Si le slug sait le calculer (`npcWound: (npc) => niveau`, ex. PV / PV max pour Fabula ou Nimble), la bande le suit seule et le MJ peut encore forcer.
- **Ce que voient les joueurs** : le niveau, jamais les PV. C'est l'intérêt (« il a l'air salement touché »).
- **Libellés** : par défaut ceux du tableau, renommables par le slug.
- Recoupe le chantier « états des personnages » du backlog : c'en est le premier morceau, limité à un seul état gradué.
- Remplace Q-15.

### 7.4 Nouvelles questions

| # | Question | Reco | Réponse                                                                                                                                                                                                |
|---|---|---|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-18 | Stockage : mémoire du serveur + copie de secours chez le MJ, pas de base (§7.1) ? | Oui | oui                                                                                                                                                                                                    |
| Q-19 | Garder la main : la bande débite elle-même la ressource (Menace, Impulsion…) par le hook du slug, ou affiche le bouton et chacun débite sur sa fiche / son onglet ? | Débit automatique quand le slug fournit le hook : c'est justement le pénible ; Dune et Zone Blanche en v1 | débit auto, coût à renseigner dans la config ou plutôt handler à définir dans la config                                                                                                                |
| Q-20 | Mode camps : un joueur peut-il prendre la main pour son personnage lui-même, ou seul le MJ désigne ? | Le joueur peut, le MJ aussi (ça fluidifie et c'est la règle de Dune : la table choisit) |                                                                                                                                                                                                        |
| Q-21 | Mode camps : un camp qui a fini laisse l'autre enchaîner tous ses tours, c'est bien ta lecture de Dune / 2D20 ? | Oui | Non c'est alternance, un camp joue, peut garder la main puis l'autre joue, peut garder la main puis de nouveau l'autre camp et de nouveau peut garder la main si pas utiliser encore et ainsi de suite |
| Q-22 | Niveaux de blessure (§7.3) : 3 niveaux + hors de combat, pour les PNJ **et** les PJ, ou PNJ seulement ? | PNJ et entrées libres seulement : un PJ a sa fiche, et l'afficher en double prête à confusion | PNJ uniquement je dirais de base. option à la main du GM pour les PJ à voir, pas convaincue                                                                                                            |
| Q-23 | Hors de combat retiré automatiquement au début du round suivant (§7.3) ? | Oui, avec annulation possible tant que le round n'a pas changé | oui reco                                                                                                                                                                                               |
| Q-24 | Niveau calculé par le slug quand il le peut (`npcWound`), sinon manuel ? | Oui ; v1 : manuel partout, calcul ajouté slug par slug quand on y passe | Remplacée par §7.5 (piloté par le système de PNJ dès la v1)                                                                                                                                            |

### 7.5 Retours du MJ (2026-11-11, second passage)

**Vocabulaire.** Les règles de la table disent « tour » pour le passage complet (Zone Blanche : garder la main « une fois par tour maximum de chaque côté »). Mon « round » du §3 est donc ton « tour ». Pour éviter tout malentendu, proposition (Q-25) :
- **Tour** = passage complet de tous les participants. Compteur « Tour 3 ».
- **Action** (ou « à X de jouer ») = le moment où un participant agit. Une Élite de Fabula a **deux actions par tour**.
- « Round » disparaît de l'écran ; dans le code, `round` (passage complet) et `action` restent en anglais.

**Garder la main** : **une fois par tour (passage complet) et par camp**, jamais à chaque changement de personnage. C'est ce que voulait dire « une fois par round » au §7.2, dans l'ancien vocabulaire.

**2D20** : Dune, Zone Blanche et Achtung fonctionnent pareil : mode camps avec garder la main.

**Fabula** : alternance stricte, un PJ, un PNJ, un PJ, un PNJ… ; quand un camp n'a plus personne à faire agir, l'autre enchaîne. C'est le **mode camps sans « garder la main »** :
- même alternance une action à la fois que le 2D20, le camp qui commence est donné par le test d'initiative de groupe ;
- seule différence : pas de bouton pour garder la main (le slug ne déclare pas `keepInitiative`) ;
- une Élite a deux actions dans le tour, donc elle revient deux fois dans l'alternance.

Pas besoin d'un troisième mode, sauf si l'alternance de Fabula a une subtilité que je ne vois pas (Q-26).

**Niveaux de blessure pilotés par le système de PNJ** :
- Le slug déclare `npcWound(sheet, state)` : niveau calculé depuis l'état du PNJ à la table (`session_npcs.state`, ex. PV / PV max).
- Quand le MJ change les PV d'un PNJ dans son onglet PNJ, le portrait suit seul ; le MJ peut encore forcer un niveau depuis la bande.
- Entrée libre (sans fiche) ou slug sans calcul : réglage manuel.
- En phase 2 : relever slug par slug ce que contient `state` (PV, blessures, Stress…) pour écrire chaque calcul.

| # | Question | Reco | Réponse |
|---|---|---|---------|
| Q-25 | Vocabulaire à l'écran : « Tour » pour le passage complet, « action » pour un participant, plus de « round » ? | Oui | oui ok  |
| Q-26 | Fabula = mode camps sans garder la main, le camp qui commence donné par le test d'initiative de groupe ? | Oui | oui     |
| Q-27 | Le niveau de blessure est calculé depuis l'état du PNJ dès la v1, pour les slugs dont le PNJ à la table a des PV (ou équivalent) ? | Oui : c'est le but ; manuel pour les autres et les entrées libres | reco    |

### 7.6 Fabula vérifié dans sa spec (2026-11-11)

Doute du MJ : Fabula serait une alternance dictée par l'initiative, avec un ordre fixe entre les joueurs, à la différence du 2D20. Ce que disent les règles de la table (`specifications_fonctionnelles_fabula_ultima.md` §757-771, et l'aide de jeu `fabula/config/reference.js` l. 82-84) :

- **Initiative** : un **test de groupe** au **début du conflit seulement**, contre la plus haute initiative des PNJ. Il décide **quel camp** commence, pas un ordre entre personnages. Il n'y a pas d'initiative individuelle qui classe les PJ.
- **Réussi** : le camp des PJ commence, **les joueurs choisissent qui ouvre** ; **raté** : le camp des PNJ commence, le MJ choisit.
- **Alternance stricte** : un personnage d'un camp, puis un de l'autre ; quand le camp le moins nombreux a fini, l'autre joue ses tours d'affilée.
- Un tour par manche et par personnage, sauf Élite (deux, décision F-2 de `spec_pnj.md`) et Champion (N).

Différences réelles avec le 2D20, toutes réglables par la config du mode camps :

| | 2D20 (Dune, Zone Blanche, Achtung) | Fabula |
|---|---|---|
| Camp qui commence | Les PJ, sauf surprise (le MJ bascule) | Donné par le test de groupe |
| Qui agit dans le camp | La table choisit, à chaque passage | Les joueurs choisissent (rien ne fige l'ordre) |
| Garder la main | Oui, une fois par tour et par camp, avec un coût | Non |
| Plusieurs actions par tour | Non | Élite, Champion |

Le mode camps couvre donc Fabula, avec `keepInitiative` absent et le camp qui commence choisi par le MJ au lancement (résultat du test).

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-28 | Fabula, manches suivantes : le camp qui a commencé la première manche recommence à chaque manche, ou le MJ le choisit à nouveau (la spec ne le dit pas) ? À vérifier dans le livre ou auprès du MJ de Fabula | Le même camp recommence par défaut, le MJ peut basculer | Vérifié dans le livre (§7.7) |

### 7.7 Fabula : vérifié dans le livre de base (p. 61-63, 2026-11-11)

- **Initiative** (p. 61) : le test de groupe vaut **pour tout le conflit** : « le premier participant à agir **chaque round** sera l'un d'entre eux » (ou un adversaire si le test est raté). Le même camp ouvre donc chaque round, sans bascule. Un participant qui arrive en cours de conflit « s'adapte à l'initiative prédéfinie ». Q-28 réglée : camp d'ouverture fixé au lancement, pas de bascule par round.
- **Alternance** (p. 62) : un tour d'un camp, un tour de l'autre ; quand un camp est en surnombre, il joue ses derniers tours jusqu'à la fin du round. Exemple du livre, 2 PJ contre 3 PNJ, PJ gagnants : PJ, PNJ, PJ, PNJ, PNJ.
- **Ordre dynamique des tours** (p. 63) : « les tours n'appartiennent pas à des personnages spécifiques » ; les joueurs **changent l'ordre d'un round à l'autre** (la sorcière qui a joué en dernier peut ouvrir le round suivant). L'ordre entre joueurs **n'est donc pas fixe**, comme en 2D20.
- **Pas le droit de passer** (p. 62) : un personnage qui peut agir doit jouer son tour. Pour la bande : pas de bouton « passer ».
- **Élites et champions** (p. 63) : plusieurs tours par round, en respectant l'alternance ; ils prennent la place de plusieurs adversaires.
- **Règle optionnelle « initiative ennemie »** (p. 63) : le MJ fait jouer ses adversaires par initiative décroissante, liste fixe chaque round, pour ne pas oublier qui a agi. Pour la bande : option du slug, les PNJ du camp MJ rangés par initiative et le suivant proposé (Q-29).

Conclusion : Fabula = mode camps, sans « garder la main », camp d'ouverture fixé pour tout le conflit. Seules différences avec le 2D20 : qui ouvre (test de groupe au lieu de « les PJ sauf surprise ») et l'absence de « garder la main ».

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-29 | Fabula : proposer la règle optionnelle « initiative ennemie » (PNJ rangés par initiative décroissante, le suivant mis en avant côté MJ) ? | Oui, en réglage du MJ au lancement, éteint par défaut ; l'initiative des PNJ est déjà dans leur fiche | |

---

## 8. Bilan des réponses (2026-11-11)

### 8.1 Acquis

| Sujet | Décision | Réf. |
|---|---|---|
| Modes | Déclarés par le slug : `order` (ordre trié) ou `sides` (camps). Remplace « un seul modèle sans mode » | Q-2, §7.2 |
| Adoption | Bloc `turns` dans `config.jsx`, bande montée par la plateforme, rien dans la fiche ni dans `GMApp` | Q-3 |
| Slugs | Tous sauf Cyberpunk, Vileborn et Noctis. Delta Green perd son initiative maison | Q-4 |
| Lancement | Un seul geste : bouton dans la zone d'actions du MJ, pas de toggle dans `TabSession` | Q-5 |
| Initiative | Le slug fournit les valeurs fixes (Delta Green, Maledictum, Vampire hors jet). Sinon le MJ saisit le résultat annoncé (pas de versement automatique en v1). **La saisie range les portraits** : tri à la validation d'une valeur, le MJ peut ensuite glisser ; bouton « Trier » pour revenir à l'ordre des valeurs | Q-6, Q-7 |
| Participants | **Aucun ajout automatique** : le MJ choisit qui entre et qui sort (PJ en ligne ou non, PNJ de la table, PNJ de la bibliothèque, entrée libre). Liste à cocher avec un raccourci « tous les PJ ». Un PNJ de la bibliothèque entre aussi à la table | Q-8, Q-17 |
| Stockage | Mémoire du serveur + copie de secours chez le MJ ; pas de base | Q-9, Q-18 |
| Valeurs d'initiative | Visibles du MJ seulement ; pas d'option pour les montrer aux joueurs en v1 (jugée non nécessaire) | Q-10 |
| Signal | Portrait mis en avant + toast « À toi de jouer », sans son et **sans trace dans l'historique** | Q-11 |
| Rythme | Le MJ seul fait avancer ; pas de « J'ai fini » côté joueur | Q-12 |
| Forme | Flottante sans pousser la page, en haut au centre par défaut, déplaçable, horizontale / verticale, réductible, mémorisée par slug et par personne | Q-13 |
| Carte au clic | Clic sur un portrait de PNJ : sa fiche ; sur un PJ : la carte que le slug déclare en config, s'il en déclare une | Q-13 |
| Pilotes | Fabula, Delta Green, Vikings | Q-14 |
| Hors de combat | **PJ** : grisé, reste dans l'ordre (jets de survie, sortie de KO). **PNJ** : grisé jusqu'au tour suivant puis sort de la bande. Le MJ peut toujours forcer l'un ou l'autre | Q-15, Q-23 |
| Garder la main | Une fois par tour (passage complet) et par camp. Débit automatique par un handler déclaré dans la config du slug | Q-19, §7.5 |
| Blessures | PNJ seulement en v1, calculées depuis l'état du PNJ à la table quand le slug sait le faire, sinon manuelles ; option PJ écartée pour l'instant | Q-22, Q-24, Q-27 |
| Vocabulaire | « Tour » = passage complet, « action » = un participant ; plus de « round » à l'écran | Q-25 |
| Fabula | Mode camps sans garder la main ; camp d'ouverture fixé par le test de groupe pour tout le conflit ; ordre entre joueurs libre à chaque tour ; pas de « passer » | Q-26, Q-28, §7.7 |

### 8.2 Encore ouvert

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-1 | **Nom.** « Ordre de jeu » écarté (long). Propositions : « Initiative » (ton choix du moment, mot connu de tous), « La main » (« qui a la main », colle au mode camps, moins au mode trié), « Tempo », « Frise ». | « **Initiative** » par défaut, **renommable par le slug** dans sa config (`turns.label`) : le vocabulaire change d'un jeu à l'autre, chaque slug prend le mot de son livre (ex. « Conflit » pour Fabula). Code : `turns` | **Tranché (chat, 2026-11-11)** : « Initiative » côté technique et par défaut à l'écran ; chaque slug donne son nom (Dune et Fabula : « Conflit », Nimble : « Combat »…). Le code s'appelle donc `initiative` et non `turns` (bloc `initiative` du `config.jsx`, `initiative.label`, classes `vtt-initiative-*`) |
| Q-16 | **Action retardée** (Vampire). Proposition, mode trié seulement, activée par le slug (`turns.delay: true`) : bouton « Retarder » sur le participant actif ; il passe « en attente » (pastille), Suivant le saute ; le MJ le fait agir à tout moment d'un clic ; s'il n'a toujours pas agi en fin de tour, Suivant le propose avant de changer de tour. | Oui, ainsi | **Oui** (chat, 2026-11-11) |
| Q-20 | **Mode camps, qui désigne le personnage qui agit ?** Ta réponse à Q-12 (« à la main du GM toujours ») laisse penser : la table choisit à l'oral, **le MJ clique**. La bande des joueurs reste alors en lecture seule (plus simple : aucun droit d'écriture des joueurs à vérifier). | Le MJ seul clique, la table décide à l'oral | **Oui** (chat, 2026-11-11) : la bande des joueurs est en lecture seule |
| Q-21 | **Reformulée : un camp en surnombre.** Exemple : 4 PJ contre 2 PNJ, PJ d'abord : PJ, PNJ, PJ, PNJ… les 2 PNJ ont agi. Les 2 PJ restants jouent-ils à la suite (comme dans Fabula), ou autre chose ? Garder la main reste à part. | À la suite : la bande donne la main au camp qui a encore des personnages | **Reco** (chat, 2026-11-11) |
| Q-30 | **Carte d'un PNJ cliquée par un joueur** (Q-13) : le joueur ne doit pas voir la fiche du PNJ (infos du MJ). Que voit-il ? | Le joueur : nom, portrait, niveau de blessure seulement (ou rien) ; le MJ : la fiche du PNJ | **Tranché** (chat, 2026-11-11) : la carte au clic est pour le MJ. Le joueur ne voit **pas le nom** d'un PNJ (il gâche le RP s'il n'est pas connu en jeu) : portrait et niveau de blessure seulement, pas de carte. Voir Q-31 |
| Q-29 | Fabula : règle optionnelle « initiative ennemie » (§7.7) ? | Oui, réglage au lancement, éteint par défaut | **Reco** (chat, 2026-11-11) |
| Q-31 | Un PNJ sans portrait (ou une entrée libre) n'aurait alors rien qui le distingue chez le joueur. Le MJ peut-il lui donner un **nom affiché aux joueurs** facultatif (« Garde », « Silhouette encapuchonnée ») ? | Oui : vide par défaut (le joueur ne voit que le portrait ou une silhouette générique), saisi par le MJ quand il veut | **Oui** (chat, 2026-11-11) |

**Phase 1 close le 2026-11-11** : toutes les questions tranchées. Q-20 : réponse A (le MJ seul désigne). Suite : spécification technique (§9).

---

## 9. Spécification technique (phase 2, 2026-11-11)

### 9.1 Relevés par slug

Relevé dans le code (chemins relatifs à `src/client/src/systems/<slug>/`).

| Slug | Initiative d'un PJ | PNJ à la table : état (`state`) et fiche (`sheet.systemData`) | Ressource « garder la main » |
|---|---|---|---|
| fabula | `character.initiative` (équipement, `config/utils.js` `computeDerivedStats`) : sert au test de groupe, pas à un ordre | `{ hp, mp, statuses, ultima }` ; `sd.hp`, `sd.init`, `sd.rank` ; `turnsPerRound(sd)` (Élite 2, Champion N, `config/npc.js:31`), `isOut(state)` | — |
| dune | Aucune (2D20) | `{ defeated, defeat, defeatMax, resisted }`, rang `minor/notable/major` | `session_resources.impulsions` / `menace` ; socket `dune:update-session-resources { sessionId, field, delta }` (`hooks/useSessionResources.js`) |
| zoneblanche | Aucune (2D20) | Pas de PNJ (spec_pnj §9.1) | `session_resources.audimat` / `stress` ; HTTP `PUT /api/zoneblanche/session-resources/:id { field, delta }` |
| achtung | Aucune (2D20) | `{ stress, injuries }` (+ `{ count, alive }` pour les troupes) ; `stressMax(sd)`, `injuriesMax(sd)` | `session_resources.momentum` / `threat` ; socket `achtung:update-session-resources` |
| deltagreen | `dex` (colonne), fixe | Pas de PNJ | — |
| maledictum | `derived(c).initiative` (BPer + BAg + bonus, `config/rules/character.js:50`), fixe | `{ wounds, crits }` ; `sd.wounds`, `sd.initiative` | — |
| woddavampire | `initiativeValue(c)` (Dex + Astuce + Célérité, `config/rules/sheetRules.js:222`) + 1d10 lancé depuis la fiche | `{ bashing, lethal, aggravated, … }` (personnage), `{ damage }` (nuée), `{ essence }` (esprit) ; `npcHealthLevels(sd)`, `sd.initiative` (nuée) | — |
| vikings | Jet 2d10 + Agilité (aucun code) | `{ blessure, malus }` ; `sd.blessureMax`, `sd.caracs.agilite`, `sd.actions` ; `isOut(state)` | — |
| tecumah | `getInitiative(agilite, perception)` (`config.jsx:58`, jamais appelé) ; jet en pratique | Pas de PNJ | — |
| nimble | Jet d20 + `initiativeOf(c)` : règle le **nombre d'actions** du 1er tour, déjà géré sur la fiche | `{ hpMax, hp, count, alive }` | — |

Constats :
- **Nimble** : sa spec (§3, l. 62, et D-5) dit « les héros jouent dans l'ordre qui leur va, **les monstres à la fin** : pas de traqueur d'initiative ». C'est un troisième cas : deux camps **sans alternance**. Voir Q-32.
- Delta Green, Zone Blanche et Tecumah n'ont pas de PNJ à la table (chantier PNJ au backlog) : entrées libres seulement pour eux, en attendant.
- Vampire : `TabSession.jsx:78` passe un `onInitiative={() => {}}` vide, à brancher ou retirer.

### 9.2 Modes

| Mode (`initiative.mode`) | Déroulé | Slugs |
|---|---|---|
| `order` | Liste triée ; « Suivant » passe au prochain qui a encore une action | Delta Green, Maledictum, Vampire (avec retard), Vikings, Tecumah |
| `sides` + `alternate: true` | Camps en alternance, une action à la fois ; le camp en surnombre finit seul ; le MJ désigne qui agit dans le camp qui a la main | Dune, Zone Blanche, Achtung (avec garder la main), Fabula (sans) |
| `sides` + `alternate: false` | Tout un camp, puis l'autre ; le MJ désigne dans le camp en cours | Nimble (héros puis monstres) si Q-32 |

### 9.3 État partagé

En mémoire du serveur, une entrée par table (`sharedState.initiativeStates`, clé `${slug}_${sessionId}`), comme l'état de la musique. Aucune base, aucune migration.

```js
{
  mode: 'order' | 'sides',
  alternate: true,              // sides seulement
  round: 1,                     // numéro du tour (passage complet)
  activeKey: 'c12' | null,      // participant qui agit ; null : camp en attente d'une désignation
  opening: 'players' | 'gm',    // sides : camp qui ouvre chaque tour (Fabula : test de groupe ; 2D20 : PJ sauf surprise)
  hand: 'players' | 'gm',       // sides : camp qui a la main
  kept: { players: false, gm: false },  // garder la main déjà utilisé ce tour
  enemyOrder: false,            // Fabula, option « initiative ennemie » (Q-29)
  participants: [{
    key: 'c12' | 'n34' | 'f-<horodatage>',   // c = PJ, n = PNJ de la table, f = entrée libre
    kind: 'character' | 'npc' | 'free',
    refId: 12 | null,           // id du personnage ou de la ligne session_npcs
    side: 'players' | 'gm',     // PJ : players ; PNJ et entrée libre : gm par défaut, modifiable
    name: 'Garde 2',            // vu du MJ seulement
    publicName: '' ,            // nom affiché aux joueurs (Q-31), vide par défaut
    avatar: '…' | null,
    initiative: 14 | null,      // vue du MJ seulement (Q-10)
    actions: 1,                 // actions par tour (Élite Fabula : 2)
    acted: 0,                   // actions faites ce tour
    delayed: false,             // action retardée (Q-16)
    hidden: false,              // invisible des joueurs (embuscade)
    wound: null | 'light' | 'moderate' | 'severe' | 'out',  // PNJ et entrée libre (Q-22)
    woundForced: false,         // réglé à la main : le calcul du slug ne l'écrase plus
    outRound: null | 3,         // tour où un PNJ est passé hors de combat : il sort au tour suivant
  }],
}
```

- Le filtrage pour les joueurs (participants cachés, noms et valeurs des PNJ) se fait **côté client**, choix assumé du projet : un seul état diffusé.
- **Le MJ calcule, le serveur garde** : toutes les transitions (Suivant, désigner, garder la main, retarder, nouveau tour…) sont des fonctions pures du front (§9.5) ; le navigateur du MJ envoie l'état complet. Le serveur vérifie la forme et diffuse. Un seul écrivain (le MJ), donc pas de conflit ; deux onglets MJ : le dernier gagne.

| Option | Pour | Contre |
|---|---|---|
| **État complet envoyé par le MJ** (reco) | Logique au même endroit, testée en fonctions pures ; serveur minuscule (forme + diffusion) | Le serveur ne contrôle pas la cohérence du jeu (il n'en a pas besoin : seul le MJ écrit) |
| Commandes au serveur (`next`, `keep`…) | Le serveur garantit les règles | Logique en double (le MJ en a besoin pour son affichage), route plus grosse |

### 9.4 Serveur

**Route `src/server/routes/initiative.js`**, montée pour tous les slugs sur `/api/:slug/initiative` (une ligne dans `server.js`, comme `audio` et `board`) :

| Route | Droits | Rôle |
|---|---|---|
| `GET /sessions/:sid` | `authenticate` | `{ state }` (ou `{ state: null }`) : pour qui arrive ou recharge |
| `PUT /sessions/:sid` `{ state }` | `requireGM` | Forme vérifiée (`typeof`, B-NUMBER ; ≤ 60 participants ; textes bornés), état gardé, diffusé |
| `DELETE /sessions/:sid` | `requireGM` | Fin de l'initiative : état effacé, diffusé `null` |

- Diffusion : `initiative-state { system, sessionId, state }` dans la room `${slug}_session_${sessionId}`.
- `sharedState.initiativeStates` déclarée dans `socket/index.js` (avec son commentaire, comme `audioStates`). Aucun handler socket.
- Test de contrat `tests/server/routes/initiative.test.js` : lecture par un joueur, écriture refusée au joueur (403), forme invalide (400), écriture puis lecture, fin.

### 9.5 Front : fonctions pures

`src/client/src/features/initiative/tools/initiative.js`, testé dans `tests/tools/initiative.test.js` :

| Fonction | Rôle |
|---|---|
| `createInitiative(config, options)` | État de départ (mode, camp d'ouverture, option initiative ennemie) |
| `addParticipants(state, list)`, `removeParticipant`, `updateParticipant` | Entrées et sorties, réglages d'un participant |
| `sortByInitiative(state)` | Tri décroissant, stable (égalités : ordre actuel) ; appelé à la validation d'une valeur (Q-6) et par « Trier » |
| `moveParticipant(state, key, index)` | Glisser-déposer |
| `next(state)` | Mode `order` : action comptée, prochain dans l'ordre avec une action restante (sauts : PNJ hors de combat, retardés) ; puis les retardés ; puis nouveau tour. Mode `sides` : action comptée, main à l'autre camp s'il lui reste quelqu'un (sinon garde), `activeKey` : le seul candidat s'il n'y en a qu'un, le premier par initiative si `enemyOrder` côté MJ, sinon `null` (le MJ désigne) |
| `designate(state, key)` | Le MJ choisit qui agit (camp qui a la main ; en `order`, n'importe qui) |
| `keepHand(state)` | Le camp qui vient d'agir garde la main (une fois par tour et par camp) |
| `delay(state)` | Retarde le participant actif (Q-16) |
| `newRound(state)` | Tour suivant : `acted` et `kept` remis à zéro, PNJ hors de combat depuis le tour précédent retirés, main au camp d'ouverture |
| `woundFromRatio(ratio)` | Niveau depuis la part de santé restante (1 : indemne ; > ½ : légère ; > ¼ : modérée ; > 0 : grave ; 0 : hors de combat) ; seuils réglables par le slug |
| `visibleTo(state, role)` | Vue joueur : sans cachés, sans `name` ni `initiative` des PNJ et entrées libres |

« Annuler » (erreur de clic, §4.5) : le MJ garde dans son navigateur l'état précédent ; un niveau d'annulation suffit.

### 9.6 Front : composants

| Fichier | Rôle |
|---|---|
| `features/initiative/hooks/useInitiativeSession.js` | Lecture (GET), écoute `initiative-state`, écriture du MJ (PUT / DELETE), copie de secours (`browserStorage`, `vtt:<slug>:initiative:<sessionId>`) et proposition « Reprendre (tour N) » si le serveur n'a plus rien |
| `features/initiative/InitiativeLayer.jsx` | Montée par `GMPage` et `PlayerPage` (comme `BoardLayer`) ; ne rend rien si le slug n'a pas de bloc `initiative` (`useSlugConfig`). MJ : bouton de la zone d'actions (« Lancer » / afficher) ; joueur : la bande dès qu'une initiative est en cours |
| `features/initiative/InitiativeStrip.jsx` | La bande : portraits, tour en cours, camp qui a la main, poignée de déplacement, bascule horizontal / vertical, réduction ; boutons du MJ (Suivant, Garder la main, Ajouter, ⋯ : trier, annuler, terminer) |
| `features/initiative/InitiativePortrait.jsx` | Un portrait : avatar ou silhouette, pastilles (a agi, ×2, retardé, valeur pour le MJ), filtre de blessure, marque « moi » |
| `features/initiative/InitiativeLaunchModal.jsx` | Lancement (`Modal`) : participants (§9.7), camp d'ouverture (`sides`), initiative ennemie (si le slug la propose) |
| `features/initiative/InitiativeEntryMenu.jsx` | Menu d'un portrait (MJ) : valeur, actions par tour, camp, nom affiché aux joueurs, caché, blessure, retirer, retarder ; fiche du PNJ (le `Sheet` du bloc `npc` du slug, contrat de `NpcSystem.jsx`) ou carte du PJ si le slug en déclare une |

Retouches de l'existant :
- `ui/tools/floatingGeometry.js` : ancrage `'top-center'` (et son test).
- `ui/hooks/useFloatingWindow.js` : taille mesurée pour un contenu à taille libre (la bande n'est pas redimensionnable : seule sa position est mémorisée).
- `features/table/ToastNotifications.jsx` : écoute `initiative-state` ; quand le participant actif devient le personnage du joueur, toast « À toi de jouer » (aucune écriture dans l'historique, Q-11).
- `features/npc/hooks/useNpcs.js` : après la modification d'un PNJ de la table, événement du navigateur `vtt:session-npc-changed { sessionId, npc }` ; la bande du MJ recalcule la blessure (si non forcée) et renvoie l'état. Pas de socket : les PNJ restent côté MJ.
- `app/pages/GMPage.jsx`, `app/pages/PlayerPage.jsx` : une ligne chacune.
- `features/initiative/initiative.css` : style par défaut `vtt-initiative-*` (variables `--color-*`) ; habillage dans les `theme.css`.

### 9.7 Ajout des participants (lancement et « Ajouter »)

Liste à cocher, rien de coché d'office (Q-17) :
- **PJ de la table** (en ligne ou non), raccourci « tous les PJ » ; leur initiative calculée à l'ajout par `initiative.characterInitiative(personnage complet)` (lecture `GET /characters/:id`) si le slug la fournit.
- **PNJ de la table** (`useNpcs`) : initiative, actions et blessure par le slug ; avatar de la fiche.
- **PNJ de la bibliothèque** : ajouté à la table (`addToTable`) puis à la bande, en un geste (Q-8).
- **Entrée libre** : nom, camp, nom affiché aux joueurs facultatif.

### 9.8 Contrat du bloc `initiative` du `config.jsx`

Tout est facultatif sauf `mode`.

```js
initiative: {
  label: 'Conflit',                         // nom à l'écran ; défaut « Initiative »
  mode: 'sides',                            // 'order' | 'sides'
  alternate: true,                          // sides : alternance (défaut) ou camp après camp (Nimble)
  sides: { players: 'Acolytes', gm: 'Adversaires' },   // libellés ; défaut « Joueurs » / « Adversaires »
  opening: 'players',                       // sides : camp qui ouvre par défaut ; 'choose' : demandé au lancement (Fabula)
  characterInitiative: (character) => number | null,
  npcInitiative: (instance) => number | null,           // instance = { sheet, state } de session_npcs
  npcActions: (instance) => number,                     // Fabula : turnsPerRound
  npcWound: (instance) => 'light' | … | 'out' | null,   // souvent via woundFromRatio
  keepInitiative: {                                      // absent : pas de bouton
    players: { label: '2 Impulsion', run: (ctx) => … },  // ctx : { socket, fetchWithAuth, apiBase, sessionId }
    gm:      { label: '2 Menace',    run: (ctx) => … },
  },
  delay: true,                              // action retardée (Vampire)
  enemyOrder: true,                         // propose l'option « initiative ennemie » (Fabula)
  woundLabels: { light: 'Égratigné', … },   // libellés des niveaux
  renderCharacterCard: (character) => …,    // carte d'un PJ au clic du MJ
}
```

Le débit de « garder la main » passe par le canal existant du slug (socket ou route des ressources de session) : rien de nouveau côté serveur.

| Slug | label (à confirmer) | mode | Particularités |
|---|---|---|---|
| fabula | Conflit | sides, opening `choose` | `npcActions` (Élite, Champion), `npcWound` (PV), `enemyOrder` |
| dune | Conflit | sides, PJ | garder la main (Impulsion / Menace), `npcWound` (défaite) |
| zoneblanche | — | **hors v1** | plus tard : sides, PJ, garder la main (2 Audimat / 2 Stress) |
| achtung | Initiative | sides, PJ | garder la main (Momentum / Menace), `npcWound` (blessures, troupes) |
| nimble | Combat | sides, `alternate: false` (Q-32) | `npcWound` (PV, groupes) |
| deltagreen | Initiative | order | `characterInitiative` : DEX ; initiative maison retirée de `TabSession.jsx` (l. 548-549, 619-626, 675-708) |
| maledictum | Initiative | order | `characterInitiative` (`derived`), `npcInitiative` (`sd.initiative`), `npcWound` (blessures) |
| woddavampire | Initiative | order, `delay` | `characterInitiative` (`initiativeValue`, le MJ ajoute le d10 annoncé), `npcWound` (niveaux de santé) |
| vikings | Initiative | order | saisie (2d10 + Agilité), `npcWound` (blessure). Pas de `npcActions` : `sd.actions` compte les actions **dans** le tour du PNJ, pas des passages de plus |
| tecumah | — | **hors v1** | plus tard : order, saisie |

Les coûts de « garder la main » sont à vérifier dans la spec de chaque slug au moment de l'écrire (Zone Blanche : 2 / 2, relevé).

### 9.9 Ordre de travail

1. **Planche HTML** (`documentations/initiative/planche_initiative.html`) : la bande au style par défaut et habillée pour Fabula, Delta Green et Vikings ; horizontale, verticale, réduite ; vue MJ et vue joueur ; modes `order` et `sides` ; blessures ; menu d'un portrait ; fenêtre de lancement. Validation avant le code.
2. **Lot 1, socle + Delta Green** : route, état, fonctions pures et tests, couche, bande, lancement, menu, copie de secours, toast ; Delta Green branché (mode `order`), son initiative maison retirée.
3. **Lot 2, mode camps** : Dune, Achtung (garder la main et débit), Fabula (ouverture choisie, actions multiples, initiative ennemie), Nimble.
4. **Lot 3, blessures et autres slugs** : `vtt:session-npc-changed`, `npcWound` des slugs à PNJ ; Maledictum, Vampire (retard), Vikings.
5. **Lot 4, habillage** des `theme.css` restants.

Doc à mettre à jour au fil des lots : `src/client/CLAUDE.md` (brique et bloc `initiative`), `src/server/CLAUDE.md` (route, `sharedState`), `spec_pnj.md` §6 (pas de colonne d'initiative), `spec_deltagreen.md` §6.3, `spec_nimble.md` (l. 62, D-5), `spec_ui_panneaux.md` (ancrage `top-center`).

### 9.10 Questions de la phase 2

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-32 | **Nimble** : sa spec dit « héros dans l'ordre qui leur va, monstres à la fin, pas de traqueur d'initiative » (D-5, validé avec toi). L'adopter quand même, en camps **sans alternance** (tous les héros, puis tous les monstres) ? | Oui : ça sert à voir qui a déjà joué, et les blessures des monstres ; sinon le sortir de la v1 | **Oui** (chat, 2026-11-11) |
| Q-33 | **État complet envoyé par le MJ**, le serveur vérifiant la forme et diffusant (§9.3) ? | Oui | **Oui** (option A, chat, 2026-11-11) |
| Q-34 | **Libellés** du tableau §9.8 (« Conflit » pour Fabula et Dune, « Combat » pour Nimble, « Initiative » ailleurs) : à corriger ? | Tels quels, corrigés slug par slug si besoin | **Oui** (chat, 2026-11-11) |
| Q-35 | **Ordre des lots** (§9.9), Delta Green en premier branché (le plus simple, il remplace l'existant) ? | Oui | **Oui** (chat, 2026-11-11) |
| Q-36 | **Vikings** : mode `order` (2d10 + Agilité saisi) pour l'instant, ou déjà « joueurs puis PNJ » (piste C-7 de sa spec) ? | `order` : la règle actuelle ; la bascule est une ligne de config le jour où la table change | **Oui** (chat, 2026-11-11) |

### 9.11 Retours sur la planche (2026-11-11, v2)

- Menu d'un participant et carte : les champs ne débordent plus (segments de blessure sur deux lignes au besoin).
- Vikings pierre peinte : la bande, son menu, sa carte et la fenêtre de lancement prennent la **dalle taillée** du slug. Dans l'appli : ajouter `.vtt-initiative, .vtt-initiative-menu, .vtt-initiative-card` à `SLAB_TARGETS` (`vikings/components/ui/VkSlabBg.jsx`), fond et bordure transparents dans `theme-pierre.css`.
- Déplacement de la bande : par la poignée **et par le titre** (libellé + tour) ; geste capturé (`setPointerCapture`, pas de sélection de texte) pour qu'il parte à coup sûr.
- Vertical : plus d'ascenseur horizontal (liste en défilement vertical seulement, largeur fixe).
- Bouton de la zone d'actions : sans initiative, « Lancer » (MJ) ; pendant une initiative, **réduire / agrandir** la bande (MJ et joueur).
- **Réordonner au glisser-déposer** (MJ) : un portrait se dépose avant ou après un autre (repère de la couleur primaire) ; en mode camps, le déposer dans l'autre groupe change son camp. `moveParticipant` (§9.5) sert aussi à ça.

Retours v2 (2026-11-11), intégrés dans la v3 :
- Déplacement : tout le fond de la bande déplace aussi (le bandeau « Formulaire DG-117 » de Delta Green est un pseudo-élément du cadre : le clic arrive sur la bande elle-même).
- **Réserve** (demande du MJ) : des PNJ (ou entrées libres) préparés d'avance, au bout de la bande du MJ, **invisibles des joueurs et hors du compte** (ni Suivant, ni alternance des camps) jusqu'à ce que le MJ les **fasse entrer** (menu ⋯ « Faire entrer », ou glisser-déposer dans la bande). Distinct de « caché », qui reste pour un participant qui **agit** sans être vu.
  - Champ `reserve: boolean` du participant (§9.3) ; `remaining()` l'exclut ; `visibleTo('player')` l'exclut.
  - `enter(state, key)` (§9.5) : visible, compte dès maintenant ; en mode trié, rangé par sa valeur, et s'il tombe à une place déjà passée dans ce tour, il agira au tour suivant. En mode camps, il rejoint l'alternance tout de suite.
  - Fenêtre de lancement **et** d'ajout en cours (la même) : une ligne par PNJ (table et bibliothèque) avec un choix explicite **Non / Visible / Caché / Réserve** (retour v3 du MJ : le choix doit exister au lancement comme en cours). Un PJ se coche seulement (ni caché ni réserve).
  - « Mettre en réserve » (menu ⋯, ou glisser dans la réserve) pour sortir un PNJ du compte sans le retirer.

**Retour du MJ (2026-11-11)** : **Tecumah et Zone Blanche sortent de la v1** (adoption plus tard, une ligne de config chacun ; leurs relevés du §9.1 restent valables). Slugs de la v1 : Delta Green, Maledictum, Vampire, Vikings (`order`) ; Dune, Achtung, Fabula, Nimble (`sides`).

---

## 10. Implémentation

### 10.1 Lot 1 : socle + Delta Green (2026-11-11)

| Fichier | Changement |
|---|---|
| `src/server/routes/initiative.js` | Nouveau : `GET`, `PUT` (MJ), `DELETE` (MJ) sur `/sessions/:sid` ; diffusion `initiative-state`, `initiative-avatars` |
| `src/server/utils/initiative.js` | Nouveau : forme de l'état (`validateState`), avatars (`validateAvatars`, `mergeAvatars`) |
| `src/server/socket/index.js` | `sharedState.initiativeStates` |
| `src/server/systems/Loader.js`, `src/server/server.js` | Route partagée `initiative`, montée pour chaque slug |
| `tests/server/routes/initiative.test.js` | Nouveau : droits, forme, diffusion, avatars, fin |
| `tests/server/routes/rights.test.js` | Route `initiative` dans la liste des routeurs partagés |
| `src/client/src/features/initiative/tools/initiative.js` | Nouveau : fonctions pures (§9.5) |
| `src/client/tests/tools/initiative.test.js` | Nouveau : modes trié, 2D20, Fabula (exemple du livre), Nimble ; réserve ; blessures ; vue joueur |
| `src/client/src/features/initiative/hooks/useInitiativeSession.js` | Nouveau : lecture, temps réel, écriture du MJ, annulation, copie de secours |
| `src/client/src/features/initiative/` | Nouveau : `InitiativeLayer`, `InitiativeStrip`, `InitiativeEntryMenu`, `InitiativeLaunchModal` |
| `src/client/src/app/pages/GMPage.jsx`, `PlayerPage.jsx` | `InitiativeLayer` monté (une ligne chacune) |
| `src/client/src/features/table/ToastNotifications.jsx` | Toast « À toi de jouer » sur `initiative-state` |
| `src/client/src/features/initiative/initiative.css` | Style par défaut `vtt-initiative-*` |
| `src/client/src/systems/deltagreen/config.jsx` | Bloc `initiative` (mode trié, DEX) |
| `src/client/src/systems/deltagreen/gm/tabs/TabSession.jsx` | Initiative maison retirée (état, barre, marque « TOUR » des cartes) ; liste toujours rangée par DEX |
| `src/client/src/systems/deltagreen/theme.css` | Habillage de la planche (formulaire DG-117) + dégradation par palier, comme la barre de session |

Écarts avec le §9, assumés :
- **Avatars à part** (§9.3) : un avatar est une data URL de ~30 Ko ; l'envoyer avec l'état à chaque geste aurait fait partir des centaines de Ko par clic. Il part une fois, à l'ajout (`avatars` du `PUT`), est gardé par le serveur et retiré avec son participant ; `initiative-avatars` n'est diffusé que quand ils changent.
- **Position de la bande** : gérée par la bande elle-même (taille libre, seule la position est mémorisée), sans retoucher `useFloatingWindow` ni `floatingGeometry` (§9.6) : ils raisonnent en fenêtres à taille fixe.
- **Fin de l'initiative** : confirmée par une petite fenêtre (« La bande disparaît pour toute la table »), l'annulation ne pouvant pas la rattraper.
- **Carte au survol** : nom, valeur, actions, ce que voient les joueurs. « Voir la fiche » d'un PNJ (le `Sheet` du bloc `npc`) arrive avec les slugs qui ont des PNJ (lots 2 et 3) : Delta Green n'en a pas.
- Le calcul de blessure suivi en direct (`vtt:session-npc-changed`) reste au lot 3, comme prévu.

Retours du MJ en dev :
- 2026-11-11 : côté joueur, la bande passait sous le bandeau de la fiche Delta Green (conteneur `sticky` en `z-50`). Plan de la bande relevé à 90 (`--vtt-z-initiative`, niveau du bandeau du tableau), menu et carte à 110 : au-dessus des bandeaux de tous les slugs (jusqu'à `z-50`) et des fenêtres flottantes, sous la zone d'actions (100), la carte de la barre de session (120) et les modales (150).
- 2026-11-11 : le bouton de la zone d'actions **masque / affiche** la bande entière (il la réduisait, ce qui laissait la barre à l'écran) ; la réduction reste au bouton – de la bande. Bande masquée pendant une initiative : le bouton est mis en avant (`highlighted`) et un **halo** respire autour (`vtt-initiative-halo`, ciblé par `data-action="initiative"`, que `ZoneAction` pose désormais sur chaque bouton ; halo fixe si les animations sont réduites). Le masquage n'est pas mémorisé, et une initiative qui se termine fait réapparaître la bande pour la suivante. MJ et joueur.

---

## 11. Lot 2 : mode camps (Dune, Achtung, Fabula, Nimble)

### 11.1 Vérifié dans les livres (2026-11-11)

Les specs de Dune et d'Achtung ne décrivent pas l'ordre d'action ; relevé dans les livres :

**Dune, Aventures dans l'Imperium (livre de base FR, p. 164, « Ordre d'action »)**
- Début du premier round : le MJ choisit qui agit en premier ; en général un PJ, sauf raison du récit ou si le MJ **paye 2 Menace**.
- Après son tour, un personnage choisit : laisser un camp adverse décider qui agit ensuite, **ou Conserver l'initiative** en dépensant **2 Impulsion** (ou en **ajoutant 2 Menace** s'il préfère ; un PNJ ennemi **dépense** 2 Menace). Il **accomplit alors une nouvelle action lui-même** (difficulté +1) **ou** fait jouer un allié.
- **Limite** : un camp qui a Conservé l'initiative ne peut plus le refaire **tant qu'au moins un ennemi n'a pas agi** (pas « une fois par round »).
- Un camp sans plus personne à faire agir passe la main ; s'il ne reste qu'un camp, ses personnages jouent dans l'ordre de leur choix.
- **Fin du round** : le dernier à avoir agi désigne un **camp adverse pour ouvrir le round suivant**, ou paye 2 Impulsion (ou +2 Menace) pour que son camp commence.

**Achtung! Cthulhu 2D20 (Player Guide, p. 27, « Keep the Initiative »)**
- Début de la scène : le MJ choisit un PJ, sauf bonne raison ou s'il **dépense 2 Threat** pour un PNJ.
- Keep the Initiative : le personnage qui vient d'agir dépense **2 Momentum** et passe la main à **un autre personnage de son camp** (pas lui-même).
- **Limite** : plus personne de ce camp ne peut le refaire **tant que l'opposition n'a pas joué au moins un tour**.
- **Fin du round** : **1 Momentum est perdu** dans la réserve de groupe des PJ, et la main passe au **camp qui n'a pas joué le dernier tour**.

Écart avec nos décisions : le §7.5 (« une fois par tour et par camp ») venait de la spec de Zone Blanche (« une fois par tour maximum de chaque côté »), sortie de la v1. Dune et Achtung, eux, limitent jusqu'à ce que l'adversaire ait agi.

### 11.2 Questions

| # | Question | Reco | Réponse |
|---|---|---|---|
| Q-37 | **Limite de « garder la main »** pour Dune et Achtung : la règle du livre (plus possible tant que l'adversaire n'a pas agi), ou « une fois par tour » comme décidé au §7.5 ? | Le livre : réglage du slug (`keepLimit`), « une fois par tour » restant possible pour Zone Blanche plus tard | **Une fois par tour** (chat, 2026-11-11) : c'est ainsi que toutes les tables l'ont joué. Règle de table, la même pour tous les 2D20 ; pas de réglage `keepLimit` |
| Q-38 | **Dune : le même personnage peut rejouer** après avoir gardé la main (difficulté +1), ou faire jouer un allié. Achtung : un autre personnage seulement. On permet au MJ de redésigner celui qui vient d'agir (une action de plus ce tour) pour Dune ? | Oui pour Dune (réglage du slug) ; la difficulté +1 reste à la table (rappel dans l'infobulle du bouton) | **Non** (chat, 2026-11-11) : dans Dune, la main se donne à un autre personnage, comme joué à la table. Même comportement qu'Achtung : celui qui vient d'agir ne peut pas être redésigné |
| Q-39 | **Dune : payer en Menace** : côté PJ, garder la main coûte 2 Impulsion **ou** +2 Menace au choix du joueur. Deux boutons côté joueurs (« 2 Impulsion », « +2 Menace ») ? | Oui, deux boutons quand c'est le camp des PJ ; côté PNJ, un seul (« 2 Menace » dépensés) | |
| Q-40 | **Ouverture du round suivant (2D20)** : le camp qui n'a pas joué le dernier tour (au lieu d'un camp fixe), et pour Dune la possibilité de payer pour que son propre camp commence ? | Oui : réglage du slug ; à la fin d'un round, le bouton « Garder la main » propose de payer pour ouvrir (Dune) | |
| Q-41 | **Achtung : -1 Momentum à chaque fin de round**, automatique ? | Oui : facile à oublier, c'est l'automatisme « pénible » par excellence | **Non** (chat, 2026-11-11) : jamais joué à la table (« c'est énorme »). Vérifié : le Player Guide a bien les deux règles, -1 Momentum à chaque fin de scène (section Momentum, « At the end of each scene, the GM removes 1 point of Momentum from the group pool ») **et** -1 à chaque fin de round de combat (p. 27). La table ne joue pas la seconde : rien d'automatisé |
| Q-42 | **Lancement 2D20 : adversaires en premier**, le MJ choisit « récit » (gratuit) ou « 2 Menace / 2 Threat » (débités) ? | Oui : trois choix au lancement (Joueurs / Adversaires, récit / Adversaires, 2 Menace) | |
| Q-43 | **Débit des ressources** : par la route HTTP déjà en place de chaque slug (`PUT /session-resources/:id { field, delta }`, qui diffuse), refusé si la réserve ne suffit pas (message, la main n'est pas gardée) ? | Oui ; pas de nouvel `emit` socket dans un slug (dette connue à ne pas propager) | |
| Q-44 | **Nimble** : un monstre de la bibliothèque ajouté depuis l'initiative a besoin du nombre de héros (PV des légendaires). On le tire du nombre de PJ de la table ? | Oui (réglage `npcContext` du slug) | **Oui** (chat, 2026-11-11) |

Autres réponses (chat, 2026-11-11) : **Q-39** oui (deux boutons côté PJ de Dune) ; **Q-40** non : chaque round s'ouvre par le camp de départ, en général les joueurs (comportement déjà en place) ; **Q-41** non, jamais joué ; **Q-42** pas de règle figée : au lancement le MJ choisit le camp qui commence, la Menace éventuelle se règle à la table, rien n'est débité ; **Q-43** oui.

### 11.3 Implémentation du lot 2 (2026-11-11)

| Fichier | Changement |
|---|---|
| `src/client/src/features/table/tools/sessionResources.js` | Nouveau : `changeSessionResource(ctx, field, delta, label)` par la route HTTP du slug ; une dépense lit d'abord la réserve et refuse si elle ne suffit pas |
| `src/client/src/features/initiative/InitiativeLayer.jsx` | « Garder la main » : une ou plusieurs façons de payer par camp (`keepInitiative[camp]` objet ou tableau) ; refus affiché, la main n'est pas gardée |
| `src/client/src/features/initiative/InitiativeStrip.jsx` | Un bouton par façon de payer |
| `src/client/src/features/initiative/InitiativeLaunchModal.jsx` | `npcContext(characters)` du slug passé à `initialState` d'un PNJ de la bibliothèque |
| `src/client/src/systems/fabula/config.jsx` | Bloc `initiative` : « Conflit », camps, ouverture choisie, Héros / Adversaires, initiative ennemie, tours d'Élite et de Champion, blessure par les PV |
| `src/client/src/systems/dune/config.jsx` | « Conflit », camps ; garder la main 2 Impulsion ou +2 Menace (PJ), 2 Menace (adversaires) ; blessure par la défaite |
| `src/client/src/systems/achtung/config.jsx` | Camps ; 2 Momentum (PJ), 2 Threat (adversaires) ; blessure par les blessures, le Stress ou les troupes debout |
| `src/client/src/systems/nimble/config.jsx` | « Combat », camp après camp, Héros / Monstres ; blessure par les PV ou les sbires debout ; nombre de héros |
| `src/client/src/systems/{fabula,dune,achtung,nimble}/theme.css` | Habillage de la bande, du menu, de la carte et du bandeau de refus (Fabula : planche ; les autres : vocabulaire de leur barre de session et de leurs modales, ajouts marqués ✦) ; Dune : halo intérieur du bouton hexagonal |
| `src/client/tests/systems/{fabula,dune,achtung,nimble}/initiative.test.js` | Nouveaux : fonctions du bloc `initiative` (tours, blessures, débit et refus des ressources, nombre de héros) |

« Garder la main » passe à un autre personnage du camp sans réglage : celui qui vient d'agir n'a plus d'action (Q-38).

Reporté au lot 3 : **« Voir la fiche » d'un PNJ** depuis le menu ⋯ (la fiche du slug a besoin de l'état du PNJ à la table et de ses modifications, c'est-à-dire de `useNpcs` dans la couche : même chantier que le suivi des blessures en direct).

---

## 12. Lot 3 : blessures suivies, « Voir la fiche », Maledictum, Vampire, Vikings (2026-11-11)

### 12.1 Blessures suivies en direct

- `useNpcs` signale dans le navigateur du MJ chaque PNJ de la table **modifié**, **ajouté**, **retiré**, ou la table **vidée** (événement `vtt:session-npc-changed` { sessionId, npc | added | removedId | cleared, origin }). Pas de socket : les PNJ restent côté MJ.
- Les autres instances du hook se mettent à jour (l'onglet PNJ voit un PNJ modifié depuis la fiche ouverte par l'initiative, ou ajouté depuis sa fenêtre de lancement).
- La couche d'initiative applique `applyNpcChange` (fonction pure, testée) : la **blessure suit le calcul du slug** (`npcWound`) sauf si le MJ l'a forcée dans le menu ⋯, le **nom** (vu du MJ) suit, un PNJ **retiré de la table** (ou table vidée) sort de la bande. Aucune écriture quand rien ne change.

### 12.2 « Voir la fiche »

Menu ⋯ d'un PNJ de la table (slug avec un bloc `npc`) → fenêtre `InitiativeNpcSheet` : la partie système du slug (`NpcSystem`, comme l'onglet PNJ), son état modifiable (PV, blessures…), ses jets par la fenêtre du slug (`RollWindow`), préférence « jets cachés » de la table partagée avec l'onglet PNJ (`NPC_ROLLS_OPTIONS`, déplacée dans `features/npc/hooks/useNpcs.js`).

### 12.3 Slugs

| Slug | Bloc `initiative` | Habillage |
|---|---|---|
| maledictum | Ordre trié ; PJ : initiative statique (`derived(c).initiative`) ; PNJ : `sd.initiative` ; blessure : Blessures encaissées, une critique = grave, au-delà du rôle = hors de combat | Gothique impérial aux couleurs du thème de la page (`data-livery`) : cadre de métal à liseré intérieur, bande d'en-tête du thème sous le tour, portraits en arche de la barre de session |
| woddavampire | Ordre trié, **action retardée** ; PJ : Dex + Astuce + Célérité (`initiativeValue`, le MJ ajoute le d10 annoncé) ; PNJ : Dex + Astuce (nuée : sa valeur) ; blessure : niveaux de santé, santé de la nuée, Essence d'un esprit | Vélin à double filet de sang, coins de ferronnerie en haut, médaillons cerclés de fer, sang pour qui agit, boutons en plaques de fer ; ✦ pastille « retardé » en flamme de chandelle |
| vikings | Ordre trié, valeur saisie (2d10 + Agilité à la table) ; blessure : Blessures / maximum ; les actions d'un PNJ se jouent dans son tour (pas de passage de plus) | Bois et or (planche) ; pierre peinte : dalle taillée (`SLAB_TARGETS` de `VkSlabBg.jsx`), portraits ronds cerclés d'ocre |

### 12.4 Fichiers

| Fichier | Changement |
|---|---|
| `src/client/src/features/npc/hooks/useNpcs.js` | Événement `vtt:session-npc-changed` (émis et écouté), `NPC_ROLLS_OPTIONS` exportée |
| `src/client/src/features/npc/TabNpcs.jsx` | `ROLLS_OPTIONS` reprise de `useNpcs.js` |
| `src/client/src/features/initiative/tools/initiative.js` (+ test) | `applyNpcChange` |
| `src/client/src/features/initiative/InitiativeLayer.jsx`, `InitiativeEntryMenu.jsx` | Écoute des PNJ modifiés ; bouton « Voir la fiche » |
| `src/client/src/features/initiative/InitiativeNpcSheet.jsx` | Nouveau : fiche du PNJ en fenêtre |
| `src/client/src/systems/{maledictum,woddavampire,vikings}/config.jsx` (+ tests) | Bloc `initiative` |
| `src/client/src/systems/{maledictum,woddavampire,vikings}/theme.css`, `vikings/theme-pierre.css`, `vikings/components/ui/VkSlabBg.jsx` | Habillages |

### 12.5 Retours du MJ après les lots 2 et 3 (2026-11-11)

- **Bibliothèque interminable** dans la fenêtre de lancement (Dune) : recherche par nom, rôle ou étiquette (sans accents) ; les PNJ choisis restent en tête ; 8 résultats au plus, puis « précisez la recherche ».
- **Bande épaisse à l'horizontale** (Dune) : c'était le titre de groupe écrit à la verticale, qui rehaussait la bande à la longueur du mot. Le titre passe sur une ligne au-dessus des portraits (`.vtt-initiative-group-list` pour les portraits), pour tous les slugs.
- **« Garder la main » introuvable** : le bouton n'apparaissait qu'**après** « Suivant », la main déjà passée, et jamais sans autre personnage dans le camp. Il se choisit désormais **à la fin de l'action**, à côté de « Suivant » : « Suivant » passe la main à l'autre camp, « Garder la main · coût » compte l'action et laisse la main au camp (un autre personnage agit). Proposé seulement si un autre personnage du camp peut agir, si l'autre camp a encore quelqu'un, et une fois par tour et par camp. Les joueurs le demandent à l'oral, le MJ clique (Q-20).
- Filtres de blessure : à retravailler plus tard (au-delà des cercles et entailles de la v1), idée notée.

Relecture Codex des lots 2 et 3 (2026-11-11), corrigé :
- Seule la règle « hors de combat » du slug produit ce niveau : un niveau calculé s'arrête à « grave » (Maledictum : toutes les Blessures sans critique ; Achtung : Stress au maximum sans blessure ; Dune : seuil de défaite atteint sans être vaincu).
- Table vidée pendant l'action d'un PNJ : l'actif disparu est effacé (l'état n'est plus refusé par le serveur).
- Camp d'ouverture sans plus personne : le lancement et le tour suivant donnent la main à l'autre camp (plus de blocage).
- « Garder la main » verrouillé pendant le paiement ; la transition part de l'état le plus récent. La fiche ouverte depuis la bande affiche les erreurs d'enregistrement.

Reste au lot 4 : rien d'obligatoire (les huit slugs de la v1 sont branchés et habillés). Tecumah et Zone Blanche viendront quand la table le décidera (une ligne de config, plus « garder la main » pour Zone Blanche).
