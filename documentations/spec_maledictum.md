# Spec — Imperium Maledictum (slug provisoire `maledictum`, setup Inquisition)

> Statut : **phase 1, cadrage** (2026-11-06). Aucun code. Les questions sont dans les tableaux, colonne
> « Réponse MJ » : réponds directement dans le fichier. Un « oui » valide la reco.
> Règles : en autonomie, comme Nimble. Les choix de règles que je fais seul sont listés en §6
> (« Décisions proposées ») : je les applique sauf objection. Les vraies questions sont en §7.
> Visuel : itéré ensemble, planche de pistes `documentations/maledictum/planche_pistes.html` (§8).

## 1. Le jeu

Imperium Maledictum (Cubicle 7, 2023), JDR Warhammer 40 000 dans le secteur Macharien. Les PJ sont
les agents d'un **Patron**, une figure de pouvoir de l'Imperium créée en groupe avant les personnages.

Références qui font foi (`X:\jdr\w40k\Imperium Maledictum\`) :
- **Livre de base** (CORE) et son aide-mémoire (Rule cheets) ;
- **Inquisition Player's Guide** (PG) et **Inquisition Gamemaster's Guide** (GMG), pour le setup
  Inquisition ;
- hors périmètre pour l'instant : Macharian Adversary Guide, Macharian Requisition Guide, Rokarth.

Relevés de travail, faits par lecture du texte extrait (non versionnés, dans le scratchpad de la
session) : création, règles de jeu, ajouts Inquisition. Leurs points douteux sont repris en §6.

### 1.1 Mécanique de dés (d100 sous la valeur)

| Élément | Règle |
|---|---|
| Test | 1d100 ≤ Compétence (ou Spécialisation, ou Caractéristique) modifiée par la Difficulté |
| Difficultés | Très facile +60, Facile +40, Routinier +20, **Exigeant +0** (défaut), Difficile −10, Ardu −20, Très ardu −30 |
| Degrés de réussite (SL) | dizaines de la valeur − dizaines du jet ; **+0 et −0 existent** (réussite / échec marginal) ; 8 paliers de lecture, de « Réussite stupéfiante » (+5) à « Échec stupéfiant » (−5) |
| Automatiques | 01-05 réussite, 96-00 échec, toujours à ±0 |
| **Avantage** | on **peut** inverser dizaines et unités (71 → 17) ; Désavantage : on **doit** inverser si c'est pire ; les sources s'annulent une pour une ; chaque source en plus du même côté = ±10 |
| Ajustements après le jet | Influence, Supériorité, Talents, Destin : ±SL ajoutés au résultat |
| Test opposé | le plus haut SL gagne ; écart de SL = résultat |
| Test étendu | cumul des SL jusqu'à un seuil |
| Doubles en attaque | SL positif : **Critique** ; SL négatif : **Maladresse** (même si l'opposition est perdue / gagnée) |
| Localisation | chiffre des unités du jet d'attaque (1 tête, 2 bras G, 3 bras D, 4 jambe G, 5 jambe D, 6-0 corps) |
| Dégâts | mêlée (opposée) : arme + écart de SL ; tir (non opposé sauf esquive) : arme + SL ; − Armure de la localisation |
| Pouvoirs psychiques | Test de Maîtrise psychique, Charge Warp (+ Indice Warp en réussite, +1 par −SL en échec), Forcer (Avantage, +1d10 Charge), Périls au-delà du Seuil Warp |

### 1.2 Le personnage

- 9 Caractéristiques (CC, CT, F, E, Ag, Int, Per, FM, Soc en libellés provisoires), bonus = dizaine.
- 20 Compétences et 77 Spécialisations, Avances de +5 (4 au plus chacune ; la Spécialisation cumule
  les Avances de sa Compétence).
- 93 Talents (+22 dans le PG), coût fixe 100 XP.
- Dérivés : Blessures max = BF + 2×BE + BFM ; Blessures critiques max = BE ; Initiative = BPer + BAg
  (statique) ; Encombrement = BF + BE ; seuil de Corruption = BFM + BE ; Seuil Warp = BFM (×2 si
  sanctionné) ; Destin 3.
- Influence par Faction de −5 à +5 (+SL aux tests sociaux), Contacts avec Influence personnelle.
- Équipement : armes (dégâts, portée, chargeur, traits), armure **par localisation**, Solars.
- Corruption, Mutations et Malignités ; Blessures critiques (62 entrées sur 4 tables), Séquelles,
  États mineurs / majeurs.

### 1.3 Le groupe et le MJ

- **Patron** (une fiche par table) : Faction et Ordo, Philosophie (PG), Attitude, Faveurs (Boons),
  Handicaps (Liabilities, choisis **en secret** par le MJ), Influence (positive connue des joueurs,
  le reste secret), Grade de solde.
- **Supériorité** : réserve **du groupe** (+SL sur un test par tour, ±1 selon le combat).
- **Subtilité** (PG, règle optionnelle) : jauge de groupe 1-10 en quatre paliers (Clandestin,
  Suspect, Manifeste, Exposé), **tenue en secret par le MJ**, effets en SL sur les techniques
  discrètes ou brutales.
- PNJ : profil en trois rôles (Troupe, Élite, Meneur), ≈48 profils dans CORE, ≈20 dans le GMG.

## 2. Setups et découpage en slugs

Le jeu se décline en « setups » (Inquisition, Rogue Trader, Garde impériale…) qui changent les
options de création permises, le Patron type, et l'identité visuelle.

**Proposition** : un slug **moteur + setup Inquisition** d'abord. Les règles et catalogues du
livre de base sont écrits sans aucune valeur de setup en dur ; le setup est un fichier de constantes
(`config/setup.js` : factions, origines, rôles et suppléments permis, Patron type, livrée de
l'interface MJ). Un futur setup sera un **slug dérivé** (son propre `config.js` serveur et sa base,
le même schéma), qui importe le moteur du parent et ne change que `setup.js` et son habillage.
C'est le chemin déjà prévu pour Vampire (« Rome by Night »).

**Astartes** : Imperium Maledictum ne prévoit pas de Space Marines jouables (échelle humaine,
aucune règle d'Astartes PJ dans les livres fournis). Un setup Astartes demanderait soit des règles
maison, soit un autre jeu (Deathwatch, Wrath & Glory) : à garder en tête, hors de ce chantier.

## 3. Table ou app ?

| Fonction | Choix | Pourquoi |
|---|---|---|
| Tests d100 : Difficulté, Avantage / Désavantage, SL, paliers | **App** | Le cœur du jeu ; l'inversion des dés et le comptage d'Avantages sont pénibles à la main |
| Ajustements de SL après le jet (Influence, Supériorité, Talents) | **App** | Proposés dans la fenêtre de jet, appliqués au résultat |
| Destin : relancer, +1 SL **depuis le résultat du jet** | **App** | Un clic sur le jet qui vient d'échouer ; brûler du Destin reste un bouton sur la fiche |
| Attaques : critique / maladresse, localisation, dégâts | **App** | Tout se lit sur le même jet ; la fenêtre affiche dégâts et localisation |
| Subir des dégâts : armure de la localisation, Blessures, passage en Blessure critique | **App** | Calcul systématique à chaque coup |
| Blessures critiques : jet de gravité et table | **App** (lot extra) | 62 entrées, jet + lecture de table à chaque coup grave |
| Maladresse (d10) | **App** | Table courte, jet automatique |
| États mineurs / majeurs | **App, affichage** | Pastilles sur la fiche ; rappel des effets, pas d'automatisme sauf Désavantage proposé |
| Corruption, seuil, Mutations / Malignités | **App** | Compteur et seuil calculé ; tirage sur les tables (lot extra) |
| Pouvoirs psychiques : Charge Warp, Forcer, Périls | **App** | Comptabilité pénible et risquée ; alerte au-delà du Seuil |
| Initiative statique | **App** | Calculée ; le bloc combat de la plateforme ordonne |
| Supériorité du groupe | **App** | Partagée et visible de tous, réglée par le MJ, appliquée aux jets |
| Subtilité | **App, MJ seul** | Jauge secrète ; seul le MJ la voit et la règle |
| Influence et Contacts | **App** | Fiche : Influence par Faction, liste de Contacts ; valeurs secrètes du MJ cachées |
| Patron | **App** (lot MJ) | Fiche de groupe ; parties secrètes (Handicaps, Influence négative) côté MJ |
| Dépense d'XP | **App** | Coûts dépendants de la valeur (barème), plafonds, prérequis de Talents |
| Encombrement, armure portée | **App** | Calculés depuis l'inventaire |
| Munitions | **Table** | Abstraites dans le livre (on ne décompte qu'en Rafale / Tir rapide) |
| Objectifs court / long terme | **Fiche, texte** | +50 / +500 XP donnés par le MJ |
| Divination, Connexions, dix questions | **Fiche, texte** | Narratif (assistant) |
| Activités entre les missions (Endeavours) | **Table** | Narratif, effets au cas par cas ; résumé dans l'aide de jeu |
| Familiers (PG) | **App** (bonus) | Sous-système à part, plus tard |
| Possession, Marques du Chaos (GMG) | **Table** | Rare, conduit par le MJ ; aide de jeu MJ |

## 4. Lots

| Lot | Contenu |
|---|---|
| 1. Création | Assistant : Guide, Caractéristiques (tirées dans l'app avec bonus d'XP, ou achat de points), Origine, Faction / Fonction, Rôle, Équipement (achats Courants + 1 Rare), Détails (nom, apparence, objectifs, connexions, divination), Finitions, dépense de l'XP gagnée. Demande les catalogues : origines, factions, rôles, compétences, talents, **équipement** |
| 2. Fiche | Fiche mono-onglet, jets, attaques, dégâts subis, Blessures critiques (saisie), États, Destin, Corruption, Influence et Contacts, inventaire, pouvoirs psychiques, XP, mode Édition |
| 3. MJ | Patron (fiche de groupe, parts secrètes), Supériorité, Subtilité, PNJ (bestiaire CORE + GMG), combat, onglet Session (musique, tableau) |
| 4. Extra | Tables automatisées (Blessures critiques, Maladresse, Mutations / Malignités, Phénomènes et Périls), aide de jeu en Markdown |
| 5. Bonus | Familiers, livrées de faction au-delà des trois premières, réquisitions, activités entre les missions |

Les structures de données de tous les lots sont fixées en phase 2 (schéma en une fois).

**Transcription** : les tables mal extraites (armes de mêlée, armures, Phénomènes psychiques,
Maladresse, Blessures critiques, armes du PG) se relisent **sur le PDF** (pages en image), pas sur
le texte extrait. Le reste se transcrit depuis le texte puis se contrôle par échantillon.

## 5. Données, premières lignes (détaillées en phase 2)

- `characters` : identité (prénom, nom séparés), caractéristiques (valeur de départ et Avances),
  clés d'origine / faction / fonction / rôle, Blessures, Destin (actuel, max), Corruption,
  Charge Warp, Solars, XP (total, dépensé), livrée choisie, notes.
- Sous-tables : Avances de Compétences et Spécialisations, Talents (avec prises multiples et
  options), inventaire, pouvoirs psychiques, Influence par Faction, Contacts, Blessures critiques,
  Séquelles, Mutations / Malignités.
- États en JSON (`{ stunned: 'minor' }`).
- De table : Patron (une fiche par table de jeu, `game_sessions`), Supériorité et Subtilité par
  table. Diffusion par HTTP puis `broadcast` du serveur, comme la fiche de groupe Fabula.

## 6. Décisions proposées (je les applique sauf objection)

| # | Point | Décision proposée | Réponse MJ |
|---|---|---|---|
| D-1 | Création 100 % aléatoire : « 200 XP » annoncés, bonus listés = 175 | Le PG donne **+50 XP** au rôle choisi par le Patron (CORE : +25). Avec lui, 50 + 25 + 75 + 50 = 200 : on suit le PG | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-2 | Fonction (Duty) et Avantages de faction : cumul ou remplacement ? | La Fonction **remplace** le bloc Avantages (paquet de création rapide) : on prend ses Solars, son talent, son équipement | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-3 | Talents de Fonction absents de la liste (Stalwart, Fanaticism, Scrounger) | Remplacés par le talent des Avantages de la faction (Drilled, Faithful, Well-prepared) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-4 | Fonctions qui sortent des listes de leur faction (Missionary, Sister Novitiate, Navis Officer, Adventurer) | Prises telles qu'imprimées ; « Leadership » = Présence (Commandement) ; « Navigation (10) » lu 1 | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-5 | Interlocuteur : 4 talents au choix (les autres rôles : 2) | Le texte est net (8 options, « choose 4 ») : **4** | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-6 | Dégâts de mêlée : « + SL » (résumé) ou « + écart de SL » (procédure et exemple) | **Écart de SL** | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-7 | Couverture : +3 / +6 (livre) ou +2 / +4 / +6 (aide-mémoire) | **Livre** : partielle +3, totale +6 | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-8 | Faction Inquisition du livre de base | En setup Inquisition, **remplacée par les trois Ordos** du PG (Hereticus, Malleus, Xenos) ; les 8 autres factions restent | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-9 | Origines | Les 8 origines planétaires du livre **et** les 20 origines macharriennes du PG, au choix (tables d100 séparées) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-10 | Rôles | Les 6 du livre + les 4 du PG (Assassin, Cruciator, Explicator, Seeker) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-11 | Noms de spécialisations incohérents (Awareness (Sound), Intuition (People), Lore (Imperium)…) | Rattachés à la spécialisation existante la plus proche (Ouïe, Humains…) ; Lore (Imperium) → Adeptus Terra | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-12 | Talents cités sans définition (« I Am The Law », Boons « Auto-Seance », Liability « Xenogenetics ») | Retirés des listes, signalés dans l'aide de jeu | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-13 | Tables à trous ou mélangées (Phénomènes psychiques, Maladresse, armes de mêlée, armures) | Relues sur le PDF ; ce qui reste illisible est signalé, jamais inventé | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-14 | Clés et libellés | Clés stables en anglais (`ordo_hereticus`, `awareness`), libellés français à part (glossaire relisible, changeable sans migration) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| D-15 | Contenu chiffré propre aux campagnes (Légitimité des Conclaves) | Hors périmètre : relève du scénario | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |

## 7. Questions

### 7.1 Cadre

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| Q-1 | Nom du slug et libellé | Slug `maledictum`, libellé « Imperium Maledictum : Inquisition ». Un futur setup = slug dérivé (`maledictumrt`, « Imperium Maledictum : Rogue Trader ») | Oui, `maledictum` |
| Q-2 | Langue des termes de jeu : aucune VF officielle n'existe | **Français**, calqué sur la VF de Warhammer Fantasy 4 (même éditeur, même famille de règles : CC, CT, F, E, Ag, Int, Per, FM, Soc, Degrés de réussite) ; noms propres 40K en VO quand l'usage français les garde (Ordo Hereticus, Adeptus Mechanicus, Astra Militarum). Glossaire dans un fichier à part, relu ensemble avant la transcription | Oui, francisé |
| Q-3 | Tu es MJ ou joueur à cette table ? Qui d'autre relit ? | (information) | Joueur (peut-être MJ plus tard) |
| Q-4 | Règle de **Subtilité** (optionnelle dans le PG) | **Oui** : c'est l'âme du setup Inquisition, et une jauge secrète est exactement ce que l'app gère bien | Oui |
| Q-5 | **Patron** : à quelle échelle ? | **Une fiche par table de jeu** (`game_sessions`) : une table = une cellule d'acolytes. Créée par le MJ ; les joueurs voient les Faveurs et l'Influence positive | Oui : la fiche de groupe (comme la coterie) |
| Q-6 | Les 6 Inquisiteurs du GMG comme Patrons prêts à l'emploi | **Oui**, en catalogue pour l'interface MJ (lot MJ) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| Q-7 | Code d'accès d'un personnage de dev pour vérifier la fiche | Je le crée moi-même au lot 1 si tu préfères (code `GMCODE` pour le MJ) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |

### 7.2 Règles à l'écran

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| Q-8 | Caractéristiques à la création : tirage dans l'app ? | **Oui** : 2d10+20 lancés dans l'assistant (dés visibles), avec les trois options du livre (garder : +50 XP, réarranger : +25 XP, relancer : 0) ; achat de 90 points en alternative | Oui, dés 3D |
| Q-9 | Tirages aléatoires de l'assistant (origine +25 XP, faction +75 XP sur la colonne de l'origine, rôle choisi par le Patron +50 XP) | **Oui**, un bouton « Laisser le destin décider » par étape, l'XP gagnée s'affiche au compteur | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| Q-10 | Destin depuis le résultat d'un jet (relancer, +1 SL) | **Oui** : boutons sous le jet dans l'historique, pour son auteur seulement, tant que le Destin le permet | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| Q-11 | La Supériorité s'applique-t-elle d'office ? | **Proposée** dans la fenêtre de jet (interrupteur « Utiliser la Supériorité (+N) »), une fois par tour ; le MJ règle la valeur | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| Q-12 | Dégâts infligés aux PNJ : automatisés côté MJ ? | **Oui** (lot MJ) : le jet d'attaque d'un PJ propose « Appliquer à… » un PNJ de la rencontre (armure unique des PNJ, mort subite des Troupes / Élites) | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |
| Q-13 | Traductions des catalogues (talents, armes, pouvoirs) : texte complet ou résumé ? | **Résumé structuré** (effet en une à trois phrases, chiffres exacts), comme Nimble ; la page du livre est citée pour le détail | Choix appliqué (« vas-y avec tes choix », 2026-11-06) |

## 8. Identité visuelle (validée le 2026-11-06)

Planche de pistes, itération 1 : `documentations/maledictum/planche_pistes.html` (A Dossier de
l'Ordo, B Cogitateur, C Cathédrale de fer).

Retour du MJ (2026-11-06) : **C retenue comme base**, mais il manque le néo-gothique et
l'iconographie de l'univers (scellés, crânes…) ; idée d'une **vision par rattachement**
(Ministorum = C, Mechanicus = B…) au-delà du seul jour / nuit.

Proposition retenue pour l'itération 2 : une **base « Imperium gothique »** (la C chargée
d'iconographie : crânes, Aquila, sceaux de pureté, cachets de cire, phylactères, ogives, litanies en
Haut Gothique) et une **livrée par faction** en deuxième axe (palette, ornement signature, texture,
police des libellés), chacune en jour et en nuit. La disposition ne change jamais d'une livrée à
l'autre.

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| V-1 | Qui porte la livrée ? | La fiche prend d'office celle de la **faction du personnage** ; le joueur peut en choisir une autre ; l'interface MJ garde celle du setup (Inquisition) | Validé : thème selon le **rôle de faction** (§8.2) |
| V-2 | Jets dans l'historique et les notifications | Rendus dans la **livrée de leur auteur** : on voit d'un coup d'œil qui a lancé | Validé (planche) |
| V-3 | Combien de livrées au premier lot ? | Base + **Inquisition, Ministorum, Mechanicus** ; les 6 autres en bonus ou au fil des personnages créés | **Les 12 thèmes** sont dessinés et validés (§8.2) |
| V-4 | Police des titres | Une gothique pour la marque et les grands titres (candidates : Pirata One, Grenze Gotisch, CloisterBlack déjà téléchargée), Cinzel pour les libellés, Garamond pour le texte : au choix dans la planche | **Bank Gothic Medium** ; polices par thème au §8.2 |
| V-5 | Pictogrammes (crânes, Aquila, rouages) | Dessinés en SVG dans la planche ; si besoin de plus fin, game-icons.net (CC BY 3.0), fichiers à récupérer | **Générés par Codex** (`/codex-image`), silhouettes teintées par le thème |
| V-6 | Dés | d100 en deux d10 (dizaines et unités), en 3D comme Delta Green ; le d10 des dizaines aux couleurs de la livrée | |

### 8.1 Décisions visuelles (MJ, 2026-11-06)

Planche de travail : `documentations/maledictum/planche_themes.html` (itération 4), images dans
`documentations/maledictum/images/` (générées par `/codex-image`, demandes dans `demandes_images.md`).

| Sujet | Décision |
|---|---|
| Principe | Base commune « gothique impérial » (piste C enrichie d'iconographie) et **un thème par personnage** selon son rôle de faction, jour et nuit. **Disposition strictement identique** d'un thème à l'autre. |
| Thèmes | Les 12 du §8.2, validés |
| Iconographie | Niveau actuel validé (« juste niveau, sans surcharge ») : Aquila, crânes, coins ajourés, ogive, sceaux de pureté, chapelet, flèches de la ruche, crâne-serviteur, encensoir, cierges, rosette, laurier, emblèmes de thème en filigrane |
| Titres (communs) | **Bank Gothic Medium** (dessin de 1930, domaine public), migrée dans `public/fonts/` et `fonts.css` |
| Ordo Hereticus | Libellés **Bank Gothic Light** (migrée), texte **Spectral** (Google) |
| Adepta Sororitas | Libellés **Bank Gothic Light**, texte **Cormorant Garamond** (Google) |
| Adeptus Mechanicus | Libellés **Share Tech Mono**, texte **Cormorant Garamond** (Google) |
| Chiffres | Ceux des polices (chiffres des libellés). Les chiffres de Haut Gothique, jolis mais trop chargés, ne sont pas retenus |
| Écartées | Univers 73 Black Extended (commerciale, Linotype) ; Caslon Antique (complétée de ses accents, `downloads/w40k/CaslonAntique-FR.ttf`, non retenue) |
| Fenêtres, menu, barre de session | Fond plein des cartes (opaque, même quand les cartes sont translucides), coins ornés des cartes ; en-tête de fenêtre à la texture de la bande |
| Zone d'actions | Losanges de 38 px, espacés de 34 px (ne se chevauchent plus) |

### 8.2 Les douze thèmes et leur attribution

Thème par défaut selon le **rôle de faction** (Faction, affinée par la Fonction quand elle a sa propre
image), changeable par le joueur. Disposition identique pour tous ; chaque thème a ses couleurs jour et
nuit, son sigle (sommet de l'ogive, pastilles de Destin), son emblème en filigrane et ses textures.

| Clé | Thème | Attribution par défaut | Libellés · texte |
|---|---|---|---|
| `hereticus` | Ordo Hereticus | Faction Ordo Hereticus | Bank Gothic Light · Spectral |
| `malleus` | Ordo Malleus | Faction Ordo Malleus | Bank Gothic Light · Spectral |
| `xenos` | Ordo Xenos | Faction Ordo Xenos | Bank Gothic Light · Crimson Pro |
| `ecclesiarchy` | Ecclésiarchie | Adeptus Ministorum (sauf Sœur novice) | Cinzel · Cormorant Garamond |
| `sororitas` | Adepta Sororitas | Fonction Sœur novice (Ministorum) | Bank Gothic Light · Cormorant Garamond |
| `mechanicus` | Adeptus Mechanicus | Adeptus Mechanicus | Share Tech Mono · Cormorant Garamond |
| `militarum` | Astra Militarum | Astra Militarum | Stardos Stencil · Spectral |
| `administratum` | Administratum | Adeptus Administratum | Special Elite · Crimson Pro |
| `telepathica` | Astra Telepathica | Adeptus Astra Telepathica | Marcellus SC · Cormorant Garamond |
| `navy` | Flotte impériale | Imperial Navy | Bank Gothic Light · Spectral |
| `roguetrader` | Libre-Marchand | Dynastie de Libre-Marchand | Cinzel Decorative · Cormorant Garamond |
| `underhive` | Pègre de la ruche | Infractionniste | Permanent Marker · Crimson Pro |

Interface MJ : thème de l'Ordo du Patron de la table (Ordo Hereticus par défaut). Polices Google
(Spectral, Crimson Pro, Cormorant Garamond, Share Tech Mono, Cinzel, Cinzel Decorative, Stardos
Stencil, Special Elite, Marcellus SC, Permanent Marker) chargées par le `theme.css` du slug ; Bank
Gothic par `fonts.css`. Images dans `documentations/maledictum/images/`, reportées dans `systems/maledictum/assets/`.

## 9. Données (implémentées)

### 9.1 Schéma (`database-template/maledictum-schema.sql`)

Tables partagées reprises de `base.sql` telles quelles. Propre au slug :

- **`characters`** (colonnes du slug, toutes avec un `DEFAULT`) : `prenom`, `nom`, `sexe`, `age`,
  `taille`, `poids` ; `origin_key`, `faction_key`, `duty_key`, `role_key`, `theme_key` (thème choisi,
  vide = celui du rôle de faction) ; `chars_base` et `chars_adv` (JSON par caractéristique) ;
  `skills` (JSON `{ clé: Avances }`), `specs` (JSON `[{ skill, key, label, adv }]`), `talents`
  (JSON `[{ key, count, option? }]`), `powers` (JSON de clés) ; `wounds`, `criticals` (JSON
  `[{ id, location, label, treatment, treated, dead }]`), `injuries`, `conditions` (JSON
  `{ stunned: 'minor' }`) ; `fate`, `fate_max`, `corruption`, `mutations`, `malignancies`,
  `warp_charge` ; `influence` (JSON `{ faction: -5…+5 }`), `contacts` (JSON) ; `xp_total`,
  `xp_spent`, `solars` ; `goals`, `details`, `bonuses` (JSON), `notes`.
- **`character_items`** : inventaire (`item_key` du catalogue ou `NULL` pour un objet libre, `kind`
  weapon / armour / gear / augmetic / ammo, `name`, `data` JSON copié du catalogue et modifiable,
  `quantity`, `equipped`, `notes`, `position`), synchronisé par `syncSubTable` (ids stables).
- **`patrons`** : une ligne par table de jeu (`session_id` UNIQUE, `ON DELETE CASCADE`) ; `data`
  (partie connue des joueurs), `secret` (Handicaps, Influence réelle, notes du MJ), `superiority`
  (0-10), `subtlety` (1-10, défaut 10), `subtlety_enabled`.

Pas de migration : la base se crée depuis le schéma à la première ouverture.

### 9.2 Routes et temps réel

- `/characters` : route commune. `CharacterController.js` : `FLAT_COLUMNS` en COALESCE,
  `accessCode → access_code`, compteurs bornés à 0, inventaire par `syncSubTable`.
  `config.characters` : `listColumns: ['faction_key', 'role_key']`, `requiredOnCreate: ['playerName', 'prenom']`.
- `/api/maledictum/patron` (`routes/patron.js`, mince ; logique dans `PatronController.js`) :
  `GET /:sessionId` (membre de la table ou MJ), `PUT /:sessionId` et `PUT /:sessionId/superiority`
  (`requireGM`). Après écriture, diffusion `maledictum-patron-update` à la room de la table.
- Aucun handler socket propre au slug. La partie secrète du Patron est filtrée côté client (modèle
  de confiance assumé du projet).

## 10. Dés

- `config.jsx` : types `maledictum_test`, `maledictum_attack`, `maledictum_power`,
  `maledictum_chargen` (2d10 + 20 ×9), `maledictum_d10`, `maledictum_table` (tirage d'une table,
  avec bonus éventuel). d100 animé en `1d100+1d10` (dizaines, unités), comme Delta Green. Dés 3D,
  `diceConfigDefault` cire rouge et métal doré.
- Règles pures dans `config/rules/dice.js` (testées) : Degrés de réussite, +0 / −0, 01-05 et 96-00,
  Avantage / Désavantage (inversion, ±10 par source au-delà de la première), DR ajoutés après le jet,
  doubles (Critique / Maladresse), localisation par les unités, mêlée opposée (écart de DR, égalité
  départagée par la valeur), armure (1 Blessure au moins), pouvoirs (Charge Warp, Forcer, Périls).
- Un seul hook de lancement (`hooks/useMlRoll.js`) pour la fiche, les fenêtres, l'assistant et l'onglet
  Rencontre. Rendu `MlHistoryEntry` déclaré une fois (`renderAllRollTypes`), au thème de l'auteur du jet.
- Fenêtre de jet : difficulté en tête, Avantage / Désavantage, puis ce qui s'ajoute après le jet
  (Supériorité, Influence pour un test social, autres DR) ; attaque : jet opposé et Rafale ;
  pouvoir : Forcer. Après le jet : Destin (relancer, +1 DR), Périls, Maladresse, purge, tables.
- `combat` : bloc minimal (pas d'automatisation d'initiative au-delà du combat générique).

## 11. Interface

- **Fiche joueur** (`Sheet.jsx` → `MlSheet`) : mono-onglet en trois colonnes (Acolyte, Patron,
  Blessures (avec les Blessures critiques et les séquelles : elles en découlent), Ressources ·
  Caractéristiques, Compétences, Armes, Armure, Inventaire · Talents, Pouvoirs, Influence et
  Contacts, Corruption, Objectifs et XP). Dégâts subis : valeur saisie au clavier ou par − / +. Onglets Fiche, Journal,
  Historique, Aide de jeu. Mode Édition (`MlEditForm`) pour les corrections hors règles.
- **Assistant** (`Creation.jsx`) : Guide, Caractéristiques, Origine, Faction, Rôle, Équipement,
  Identité ; colonne d'aide ; tirages au hasard avec leur XP.
- **Interface MJ** (`GMApp.jsx`), onglets Session, Patron, Rencontre, Tableau, Journal, Historique,
  Aide de jeu (parties MJ marquées `visibility: gm`). Session : musique, tableau, « Début de séance »
  qui rend le Destin, agents en **vignettes de flux**, fiche de l'agent choisi dans un **pict-écran**
  (planche `maledictum/planche_pict_ecran.html`, validée le 2026-11-06) : cadre de bronze au thème
  du MJ (bandeau « Flux pict · Dossier d'agent », copie des accès et mode Édition), seul l'écran
  au thème de l'agent. Rencontre : bestiaire, PNJ gardés dans le navigateur par table.
- Thème : `data-livery` posé sur la page (fiche : thème du personnage ; MJ : Ordo du Patron) et sur
  chaque fiche ou jet affiché ailleurs. Sigles et emblèmes passent par des variables (`--im-sigil`,
  `--im-emblem`) : un thème imbriqué (agent dans l'interface MJ) prend toujours les siens.

## 12. Décisions prises en autonomie et points à relire

### 12.1 Décisions (règles)

| # | Point | Décision |
|---|---|---|
| D-16 | 01-05 / 96-00 qui contredisent le seuil | Réussite ou échec **marginal** (DR 0) quand la règle change l'issue ; DR normal sinon |
| D-17 | Destin « +1 DR » | Appliqué au résultat affiché dans la fenêtre ; l'historique garde le jet d'origine |
| D-18 | Tirages de l'assistant (origine, faction, rôle) | Tirés par l'app (hasard local), pas aux dés 3D ; seules les caractéristiques roulent à l'écran |
| D-19 | Faction tirée au hasard | Table des factions du setup (PG p.46, Ordos compris) |
| D-20 | Achats après la création | Sur la fiche (catalogue, Solars à la main) ; l'assistant ne fait que l'équipement de départ |
| D-21 | Combat | Bloc minimal ; Q-12 (« Appliquer à… » un PNJ) **non fait** : les PNJ se blessent à la main dans l'onglet Rencontre |
| D-22 | Équipement de départ nommé autrement que le catalogue | Rattaché par une table d'alias (`config/rules/items.js`) ; « Fusil de chasse » seul → fusil à pompe ; « Locomotion augmétique » → jambe augmétique ; libellés composés (« X et Y », « X avec Y ») découpés |
| D-23 | Q-10 Destin depuis le résultat | Boutons dans la fenêtre de jet, juste après le jet (pas dans l'historique) |

### 12.2 À relire avec le livre

- **Équipement de départ resté libre** (sans caractéristiques) : Armure de plates, Armure carapace
  (Sœur novice), Uniforme d'officier, Silencieux, Omnispex, Livre d'extraits du Lectitio Divinatus,
  objets « au choix ».
- **Équipement du PG** : munitions Exitus sans arme Exitus ; valeurs « * » (Daemonblade, Armes
  digitales, boucliers) mises à `null` et expliquées ; Inflict (Fatigue/Fear) de la Daemonblade
  interprété ; Liber Heresius (table) / Inquisitorial Tome (texte) ; restrictions d'Ordo déduites du
  texte (Serre venimeuse scythienne, Lame xénophase, Neuro-disrupteur, Bâton des Vrais Noms) ;
  traductions à valider (Lame éclipse, Armure de garde, Scanner de culpabilité, Grenade psyk-out,
  Pistolet à grenaille, Capuchon nul).
- **Pouvoirs** : Marque et Lame psychique « Average (+20) » lus +20 ; Panique induite portée Moyenne
  (profil) contre Courte (texte) ; état « Terrified » (Visions terrifiantes) absent des états, gardé
  en VO ; termes hors glossaire.
- **Tables** : 60 Blessures critiques transcrites ; état « Rattled » cité sans définition ; ambiguïté
  de la table des Périls ; bestiaire sans les pouvoirs détaillés des psykers ennemis, et quelques
  spécialisations libres (Logique (Mathématiques), Lingua Technis…) affichées par leur nom.
- **Patron** : correspondance des noms de Faveurs et Handicaps entre les fiches d'Inquisiteurs du GMG
  et les tables.

### 12.3 Vérifié à l'écran (2026-11-06)

Fiche joueur jour et nuit, fenêtre de jet et résultat, interface MJ (Session, Patron avec un
Inquisiteur chargé, Rencontre et bestiaire), fiche Mechanicus de nuit, assistant (Guide,
Caractéristiques, Faction, Rôle). Corrigés au passage : titre de la bande (hauteur, espace),
boutons du header, dégâts d'armes calculés, armure de départ portée, Armes et Armure empilées quand la
colonne est étroite, intitulés du bestiaire, double réglage des Blessures des PNJ, portées traduites,
pouvoirs de discipline rangés par discipline, onglet Équipement de l'assistant marqué fait trop tôt.
Pas encore parcourus : assistant de bout en bout jusqu'à l'envoi, Journal, Aide de jeu, Tableau,
les dix autres thèmes en situation.
