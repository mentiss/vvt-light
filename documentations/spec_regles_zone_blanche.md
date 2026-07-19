# ZONE BLANCHE — Spec Fonctionnelle (WIP)

*JDR d'enquête paranormale télévisée — moteur 2D20 Modiphius*

## Statut
Document de travail — système largement gravé (création de personnage complète, économie des jauges, arsenal MJ). Restent des points ouverts listés en fin de document. Aucune implémentation technique.

---

## 0. Principes de Vision

**Principe d'ambiguïté** : le système ne tranche jamais la réalité du paranormal. Chaque scénario, voire chaque phénomène, peut être authentique ou explicable — c'est la vérité du MJ, jamais celle des règles. Toutes les mécaniques doivent fonctionner dans les deux lectures.

**Doctrine de captation** : filmer capte automatiquement ce qui se passe dans le champ — aucun jet pour « voir si on capte » (pas de jet de perception déguisé qui télégraphie l'événement). Le jet intervient au dépouillement : vérifier les rushs, analyser, chercher l'anomalie dans la masse.

---

## 1. Moteur de Résolution

Système **2D20 Modiphius** standard :

- **Jet :** 2d20. Chaque dé ≤ score total (Principe + Compétence) = 1 succès.
- **Difficulté :** nombre de succès requis, échelle 0 à 5, difficulté de base 1. Une difficulté 0 signifie que le jet sert uniquement à générer de l'Audimat (tout succès = marge).
- **Critique :** dé = 1, OU dé ≤ rang Compétence si Focus applicable → 2 succès.
- **Complication :** dé = 20 → complication active. Le MJ propose un effet immédiat OU encaisse 1 Stress.
- **Achat de d20 :** maximum 3 d20 supplémentaires par jet (achetés et gratuits confondus) — **on ne lance jamais plus de 5d20, règle immuable**. Tarif progressif **par jauge** : 1er d20 payé dans une monnaie = 1, 2e dans la même monnaie = 2, 3e = 3. Les monnaies se panachent librement (ex. 1 d20 en Audimat + 1 d20 en Stress = 1 + 1) ; l'achat en Stress alimente la jauge du MJ. Les d20 **gratuits** (talents) comptent dans la limite des 3 mais n'incrémentent pas les compteurs tarifaires.
- **Assistance :** règle standard 2d20 — un allié qui justifie narrativement son aide lance 1d20 sur sa propre combinaison Principe + Compétence (pas nécessairement la même que le porteur du jet) ; ses succès s'ajoutent au résultat. Ses 20 génèrent des complications normalement.
- **Prime Time (Fortune) :** ressource individuelle. **3 par personnage en début de scénario** — c'est la valeur de départ, pas un plafond : il n'y a pas de plafond, et pas de limite d'utilisation par jet. Usage : remplacer un d20 par un résultat de 1 avant le lancer (critique automatique), OU relancer un d20 après le lancer. Régénération : uniquement sur un instant narratif fort ou un insight de folie, toujours à la discrétion du MJ — jamais automatique. « Je dépense un Prime Time » — c'est le moment du personnage.
- **Initiative et tours :** l'initiative revient aux joueurs ou aux PNJ/entités selon la narration de la scène. Ensuite, alternance chacun son tour. **Garder la main** (agir deux fois de suite) : 2 Audimat côté joueurs, 2 Stress côté MJ — une fois par tour maximum de chaque côté.
- **Santé et conséquences :** aucun système de santé — les conséquences sur les personnages (blessures, terreur, épuisement) sont purement narratives, portées par la fiction et les complications.

---

## 2. Jauges

### Audimat (Momentum)
- Pool partagé entre tous les joueurs. **Démarre à 0** en début de scénario.
- Plafond : **6** — la jauge ne peut jamais dépasser 6 (sauf plafond réduit par exposition de trucage, cf. §9).
- **Gain (source unique) :** la marge — chaque succès au-dessus de la difficulté du jet octroie 1 Audimat, dans la limite du plafond.
- **Dégradation :** −1 Audimat à chaque changement de scène.
- **Dépenses standard :**
    - Achat de d20 : tarif progressif 1/2/3 (cf. §1)
    - Obtenir une information (question au MJ) : 1
    - Activer une Vérité (usage génératif) : 2
    - Garder la main : 2 (une fois par tour)
    - Coûts des talents : selon le talent

### Stress (Menace)
- Pool du MJ, visible des joueurs. **Démarre à 6** en début de scénario.
- **Gain :** échecs, complications (1 par 20 non converti en effet immédiat), achat de d20 supplémentaires payés en Stress (par le MJ comme par les joueurs, cf. §1), certains talents des joueurs.
- **Dépenses :** interventions fictionnelles selon la grille de coûts (§11), garder la main : 2 (une fois par tour), achat de d20 pour les jets de PNJ (tarif progressif 1/2/3).

---

## 3. La Matrice 4×4

### Principes (L'approche)
- **Logique**
- **Instinct**
- **Technique**
- **Présence**

### Compétences (L'action)
- **Investigation**
- **Opération**
- **Déplacement**
- **Ésotérisme**

---

## 4. Éléments de Personnage

### Maximes
Guide narratif attaché à un Principe. Un personnage ne possède pas une maxime par Principe : il en a **une et une seule par Principe débloqué** (le Principe majeur à la création, puis tout Principe atteignant le rang 6 — cf. règle de déblocage ci-dessous). Sert de justification RP pour l'utilisation d'un Principe sur un jet — la justification reste libre, la maxime est un appui supplémentaire ; le MJ a le dernier mot sur le Principe utilisé. C'est aussi un moto pour le joueur : suivre sa maxime, c'est respecter ce en quoi le personnage croit.

**Modèle :** chaque maxime est liée à un Principe et taguée avec les archétypes qui peuvent la choisir (relation N-N).

- **À la création :** 1 maxime, choisie dans le pool [archétype × Principe majeur], ou créée sur mesure (joueur + validation MJ, ou MJ seul). Les listes sont des exemples, pas des limites.
- **Déblocage :** un personnage dispose d'une maxime pour chaque Principe de rang 6 ou plus (choisie dans le pool [archétype × Principe], ou sur mesure avec validation MJ). Le Principe majeur donne sa maxime dès la création quel que soit son rang. Un build qui monte un second Principe à 6 dès la création démarre donc avec 2 maximes — c'est un choix assumé (le personnage de conviction), payé en freebies.
- **Quotas de pool :** 5 maximes par archétype sur son Principe majeur, 3 sur les autres Principes (quota strict, pour l'équité et pour limiter la paralysie du choix).

### Vérités
Permettent d'introduire des faits dans la fiction. Permanentes — une Vérité reste toujours vraie. Le contexte seul juge de leur pertinence. Pas de mécanique d'épuisement.

**Deux usages :**
- **Passif/descriptif (gratuit)** — la Vérité colore la fiction : elle justifie une connaissance, une familiarité, un accès évident. Le MJ en tient compte sans coût.
- **Actif/génératif (2 Audimat)** — le joueur introduit un fait nouveau qui change la situation, avec validation MJ selon le contexte.

*Exemple : "Ingénieur sénior" — les batteries tombent à 0, je dépense 2 Audimat et j'invoque ma Vérité pour établir que j'avais pris des batteries de rechange.*

**Règle de design :** une Vérité établit des faits durables qui impliquent un faisceau d'usages à table (à la manière de "Capitaine vétéran des commandos" → tactique, discrétion, survie, débrouille). Jamais un événement ponctuel (sauf s'il fonde un état permanent), jamais une aptitude (territoire des Compétences et Focus), jamais une faveur ponctuelle.

**Vérité vs background libre :** le background reste libre et gratuit — tout joueur peut décider de son passé, et le MJ en tient compte narrativement. La Vérité est autre chose : un fait **contractualisé** (le MJ s'engage, il est toujours vrai) et **génératif** (il donne le droit d'introduire des faits contre de l'Audimat). C'est pour ça que ça s'appelle une Vérité, pas un background.

**À la création :** 1 Vérité, choisie dans le pool fixe de l'archétype (6 par archétype), ou créée sur mesure (joueur + validation MJ, ou MJ seul).

### Talents
Capacités activables selon des conditions listées par le talent. Fréquence d'usage propre à chaque talent. Liés à un archétype — pas à une stat.

**À la création :** 2 talents, choisis dans le pool de l'archétype (6 par archétype). Progression XP possible ultérieurement (coût élevé prévu).

**Règles de design :**
- Un talent est toujours **actif** : il décrit sa mécanique d'activation et ses conditions. Jamais de bonus passif permanent (ce serait une stat déguisée).
- Un talent ne **génère jamais d'Audimat** — l'économie de base (marges de réussite) suffit. Exception encadrée : les talents de trucage, qui échangent de l'Audimat contre du Stress et un risque différé.
- Les jauges (Audimat, Stress) servent de **monnaie**, jamais de **seuil-condition** (pas de « si le Stress ≥ X »).
- Générer du Stress est un coût valide (ressource exclusivement MJ).
- Pas de talent dupliquant l'économie de base du Momentum/Audimat (ex. « poser une question au MJ » existe déjà à 1 Audimat) : un talent fait mieux ou autrement.
- Pas de méta-jeu sur les jauges (pas de contre d'une dépense de Stress du MJ).
- Pas de Force RP : les effets sociaux donnent des bonus à qui suit, jamais des obligations (PNJ comme joueurs).
- Pas de jet créé artificiellement (cf. doctrine de captation).
- Pas de clones renommés entre archétypes ; les familles de mécaniques proches sont assumées et documentées.

*Exemple : "Puissance en Bovis" (Médium) — lors d'un événement paranormal, je calcule la puissance en bovis, le prochain d20 acheté est gratuit. Une fois par scène.*

### Focus
Expertises précises permettant de déclencher des critiques (dé ≤ rang Compétence) sur des situations spécifiques.
- Accès limité aux compétences majeure et mineure de l'archétype.
- **Nombre par personnage :** 2 focus sur la compétence majeure, 1 focus sur la compétence mineure.
- Communs à tous les archétypes — c'est l'archétype qui filtre l'accès, pas le focus lui-même.

---

## 5. Archétypes

8 archétypes. Chaque archétype définit :
- 1 Principe majeur + 1 Principe mineur
- 1 Compétence majeure + 1 Compétence mineure
- L'accès aux Talents, Vérités, Maximes et Focus disponibles

Symétrie parfaite : chaque Principe et chaque Compétence apparaît exactement 2 fois en majeur et 2 fois en mineur.

### Tableau des Archétypes

| Archétype | Principe majeur | Principe mineur | Compétence majeure | Compétence mineure |
|---|---|---|---|---|
| Animateur | Présence | Technique | Investigation | Déplacement |
| Guest Star | Présence | Instinct | Déplacement | Investigation |
| Ingénieur | Technique | Logique | Opération | Ésotérisme |
| Opérateur | Technique | Présence | Déplacement | Opération |
| Scientifique | Logique | Technique | Investigation | Déplacement |
| Producteur | Logique | Instinct | Opération | Ésotérisme |
| Médium | Instinct | Présence | Ésotérisme | Investigation |
| Exorciste | Instinct | Logique | Ésotérisme | Opération |

---

## 6. Focus (complets)

### Investigation
1. **Œil de lynx** — Détecter un détail physique anormal qui sort du cadre de l'environnement. Trouver l'élément qui ne devrait pas être là.
2. **Indices paranormaux** — Reconnaître et localiser des traces d'activité paranormale dans un environnement (cercles de sel, symboles, objets déplacés, marques rituelles).
3. **Criminologie** — Reconstitution d'un événement passé sur une scène, lecture de traces d'activité humaine.
4. **Recherche documentaire** — Exploitation de sources sur le lieu ou l'événement (archives, web, témoignages écrits).
5. **Observation comportementale** — Lire les réactions et attitudes des personnes présentes en temps réel.
6. **Écoute active** — Percevoir des anomalies acoustiques, sons anormaux, voix ou murmures dans un lieu.

### Opération
1. **Captation** — Maîtrise de la caméra et du son en conditions difficiles. Permet de saisir le bon angle, d'isoler une source sonore ou de capturer un événement fugace avant qu'il disparaisse.
2. **Drone** — Pilotage en environnement contraint (couloirs étroits, hauteurs, zones inaccessibles). Permet d'explorer et de documenter des espaces où l'équipe ne peut pas se rendre physiquement.
3. **Relevé d'anomalies** — Utilisation et interprétation des instruments de mesure (EMF, thermomètres, hygromètres). Permet de détecter et quantifier des perturbations physiques dans un environnement.
4. **Communication paranormale** — Maîtrise des outils de contact avec les entités (spirit box, EVP recorder, table de Ouija). Permet d'établir ou d'interpréter un signal dans le bruit.
5. **Spectrographie** — Exploitation des caméras thermiques, infrarouges et de vision nocturne. Permet de percevoir et documenter ce que l'œil nu ne peut pas voir.
6. **Logistique** — Installation, câblage et gestion du matériel sur le terrain. Permet d'anticiper les besoins, de sécuriser un dispositif de surveillance ou de pallier une défaillance technique.

### Déplacement
1. **Discrétion** — Se déplacer sans bruit, sans être vu, sans perturber l'environnement. Permet d'observer une situation sans l'influencer ou de traverser un espace sensible sans alerter.
2. **Orientation** — Conserver son sens de l'espace et de la direction dans un environnement inconnu ou dégradé. Permet de ne pas se perdre, de mémoriser un plan, de retrouver son chemin en cas de panique ou d'obscurité totale.
3. **Réactivité** — Gérer son corps et ses mouvements dans l'urgence. Permet de réagir physiquement à un événement soudain, qu'il soit paranormal ou simplement dangereux.
4. **Intérieur** — Être à l'aise pour se déplacer en bâtiment, quel que soit son état (habité, abandonné, en ruine). Permet de se mouvoir efficacement dans des espaces clos, couloirs, escaliers ou pièces encombrées.
5. **Extérieur** — Être à l'aise pour se déplacer en environnement naturel ou non-bâti (forêt, cimetière, terrain vague, ruines à ciel ouvert). Permet de se mouvoir efficacement sur un sol irrégulier, dans la végétation ou à découvert.
6. **Endurance** — Maintenir sa mobilité et son efficacité sur la durée. Permet de rester opérationnel après plusieurs heures de tournage éprouvant, dans le froid, l'obscurité ou le stress.

> Note de consolidation : les focus **Maîtrise du terrain** et **Positionnement** ont été retirés et remplacés par **Intérieur** et **Extérieur**, pour éliminer le chevauchement perçu entre les deux anciens focus. Le cas ambigu des ruines (bâtiment en ruine vs ruines à ciel ouvert) est volontairement laissé à l'appréciation de la table, dans la même logique que les Vérités.

### Ésotérisme
1. **Occultisme** — Connaissance pratique et théorique des arts occultes : entités, hiérarchies démoniaques, symboles et rituels magiques. Permet d'identifier une pratique, une invocation ou une présence par ses signes caractéristiques.
2. **Psychométrie** — Capacité à lire l'histoire émotionnelle et spirituelle d'un objet ou d'un lieu par le contact physique. Permet de percevoir des événements passés ou des empreintes laissées par des présences.
3. **Rites sacrés** — Maîtrise des pratiques religieuses de protection et de bannissement : prières, objets sacrés, imposition des mains, exorcisme. Permet d'intervenir activement face à une entité ou de purifier un espace.
4. **Radiesthésie** — Utilisation du pendule et mesure d'énergie bovis pour détecter des flux énergétiques, des présences ou des anomalies dans un espace.
5. **Sixième sens** — Perception innée et passive de signaux paranormaux. Permet de ressentir une présence, une intention ou une anomalie sans instrument ni pratique délibérée.
6. **Voyance** — Pratique active de consultation (boule de cristal, tarots, communication avec les morts). Permet d'obtenir des informations sur une entité, un événement passé ou à venir.

---

## 7. Maximes (complètes)

### Pool Logique (13)
1. « Toute anomalie a une explication. Mon travail, c'est de la trouver avant d'avoir peur. »
2. « Un phénomène qu'on ne peut pas reproduire est un phénomène qu'on ne comprend pas encore. »
3. « Éliminer l'impossible d'abord. Ce qui reste mérite qu'on s'y attarde. »
4. « L'ordre dans lequel les choses arrivent dit toujours quelque chose. Toujours. »
5. « Croire ou ne pas croire n'est pas la question. Comprendre est la question. »
6. « Un esprit a des habitudes, comme tout le monde. Trouvez le motif, vous trouvez l'esprit. »
7. « Je n'ai jamais convaincu personne en argumentant. J'ai convaincu en démontrant. »
8. « Je ne choisis pas l'explication qui me rassure. Je choisis celle qui survit à la vérification. »
9. « Chacun son poste, chacun sa raison d'y être. Une équipe qui sait pourquoi elle fait les choses n'a pas le temps d'avoir peur. »
10. « Avant d'interroger les morts, je lis ce qu'ils ont signé de leur vivant. »
11. « Comprendre une chose, c'est déjà cesser de la subir. »
12. « Je ne connais rien à leurs machines. Mais je sais quand une histoire ne tient pas debout. »
13. « Un problème à la fois. C'est comme ça qu'on démêle un nœud de câbles, c'est comme ça qu'on traverse une nuit. »

| Archétype | Quota | Pool Logique |
|---|---|---|
| Scientifique | 5 | 1, 3, 6, 8, 10 |
| Producteur | 5 | 2, 5, 7, 9, 11 |
| Ingénieur | 3 | 2, 7, 8 |
| Exorciste | 3 | 4, 6, 10 |
| Médium | 3 | 6, 10, 11 |
| Animateur | 3 | 1, 5, 9 |
| Guest Star | 3 | 5, 11, 12 |
| Opérateur | 3 | 2, 9, 13 |

### Pool Instinct (11)
1. « La peur est un message. La refuser, c'est raccrocher au nez de celui qui prévient. »
2. « Le silence n'est jamais vide. Il suffit de savoir l'écouter. »
3. « Réfléchir trop longtemps, c'est déjà mourir un peu. Je fais confiance à mon premier geste. »
4. « Il y a une différence entre le froid d'une cave et le froid d'une présence. Ma peau la connaît. »
5. « Une intuition qu'on ignore revient toujours. Plus tard, plus fort, et rarement pour de bonnes nouvelles. »
6. « Un lieu vous accueille ou vous supporte. Aucun instrument ne mesure la différence, moi si. »
7. « Ce métier ne s'apprend pas. Il se réveille. »
8. « Mon premier souvenir n'est pas une image. C'est une sensation. Elle ne m'a jamais quittée. »
9. « Je ne suis pas devenu sensible. J'ai juste arrêté de faire semblant de ne pas l'être. »
10. « Quand quelqu'un a vraiment vu quelque chose, ça se lit sur lui des semaines après. Ce regard-là ne s'invente pas. »
11. « Il y a des pannes normales et des pannes qui n'en sont pas. Et croyez-moi, on préfère les premières. »

| Archétype | Quota | Pool Instinct |
|---|---|---|
| Médium | 5 | 2, 4, 7, 8, 9 |
| Exorciste | 5 | 1, 3, 5, 6, 10 |
| Guest Star | 3 | 1, 5, 9 |
| Producteur | 3 | 5, 6, 10 |
| Animateur | 3 | 1, 2, 10 |
| Ingénieur | 3 | 3, 5, 11 |
| Opérateur | 3 | 3, 4, 5 |
| Scientifique | 3 | 5, 9, 10 |

### Pool Technique (13)
1. « On ne meurt pas d'un fantôme. On meurt d'une lampe qui lâche au mauvais moment. »
2. « L'amateurisme tue plus sûrement que n'importe quelle entité. »
3. « Chaque problème a un outil. Chaque outil a un réglage. Chaque réglage a son moment. »
4. « Je ne crois pas aux fantômes. Je crois aux capteurs qui les enregistrent. »
5. « Le terrain décide, le matériel suit, jamais l'inverse. »
6. « Un plan B n'est pas une option, c'est le minimum syndical. »
7. « Il n'y a pas de conditions impossibles. Il y a des configurations pas encore trouvées. »
8. « L'obscurité est un problème technique. Les problèmes techniques ont des solutions. »
9. « Ce qui est fait correctement n'est fait qu'une fois. »
10. « L'exactitude n'est pas de la froideur. C'est du respect — pour les vivants comme pour les morts. »
11. « Chaque chose dans l'ordre, chaque ordre pour une raison. C'est ma manière de prier. »
12. « Je ne sais pas réparer grand-chose. Mais je sais tenir une lampe sans trembler, et certains soirs c'est le poste le plus important. »
13. « Mes rituels ont leurs réglages, comme leurs machines. Une bougie mal placée, c'est une porte mal fermée. »

| Archétype | Quota | Pool Technique |
|---|---|---|
| Ingénieur | 5 | 3, 4, 6, 7, 8 |
| Opérateur | 5 | 1, 2, 5, 8, 9 |
| Animateur | 3 | 2, 5, 9 |
| Scientifique | 3 | 3, 4, 7 |
| Guest Star | 3 | 1, 2, 12 |
| Producteur | 3 | 5, 6, 9 |
| Médium | 3 | 10, 11, 13 |
| Exorciste | 3 | 9, 10, 11 |

### Pool Présence (13)
1. « Les gens ne se confient pas à un micro. Ils se confient à quelqu'un qui écoute. »
2. « Je parle aux vivants comme aux morts : avec respect, et sans baisser les yeux. »
3. « Tout est bon à filmer, surtout ce qui nous terrifie. C'est pour ça qu'on nous regarde. »
4. « Chaque témoin a droit à ma confiance le temps de son récit. Après, on vérifie. »
5. « Le trac et la terreur, c'est le même animal. Je l'ai dressé il y a longtemps. »
6. « Le public sent le mensonge à travers l'écran. Alors je ne mens jamais — je choisis juste ce que je montre. »
7. « Chaque lieu a un gardien, chaque témoin une blessure. On n'entre dans aucun des deux sans être invité. »
8. « Savoir se taire au bon moment, c'est aussi de l'animation. »
9. « Le lien qu'on tisse avec les gens, c'est le seul matériel qui ne tombe jamais en panne. »
10. « On ne survit pas à une présence en se faisant petit. On lui montre qu'on tient debout. »
11. « Les morts aussi ont besoin qu'on les regarde en face. Personne ne l'a fait depuis longtemps, c'est souvent pour ça qu'ils crient. »
12. « Il faut être deux pour une possession. Je refuse simplement d'être le second. »
13. « Je ne parle pas beaucoup. Mais quand je dis que ça va tenir, ça tient. »

| Archétype | Quota | Pool Présence |
|---|---|---|
| Animateur | 5 | 3, 5, 6, 8, 9 |
| Guest Star | 5 | 1, 4, 5, 9, 10 |
| Opérateur | 3 | 6, 8, 9 |
| Médium | 3 | 2, 7, 11 |
| Ingénieur | 3 | 8, 9, 13 |
| Scientifique | 3 | 1, 4, 8 |
| Producteur | 3 | 3, 4, 6 |
| Exorciste | 3 | 10, 11, 12 |

> Note de consolidation : modèle retenu = pools croisés Principe × Archétype (relation N-N). Quota strict 5/3 pour l'équité entre archétypes et pour limiter la paralysie du choix. Chaque archétype dispose ainsi d'un catalogue de 14 maximes (5+3+3+3), dont 5 accessibles à la création. Le chevauchement entre les 2 archétypes majeurs d'un même Principe est toléré (1-2 maximes) tant que chacun conserve des maximes exclusives. Les maximes 12-13 de chaque pool (sauf Instinct 11) ont été écrites sur mesure pour couvrir les archétypes éloignés du Principe (couverture minimum : 3 par case).

---

## 8. Vérités (complètes)

Pools fixes de 6 Vérités par archétype. À la création : 1 au choix dans le pool (ou sur mesure avec validation MJ).

### Animateur
1. **Visage connu du PAF** — vingt ans d'antenne, tout le monde l'a déjà vu quelque part. Les portes s'ouvrent, les témoins se détendent.
2. **Ancien reporter de guerre** — sang-froid sous pression, terrain hostile, images tournées dans des conditions impossibles, contacts dans la presse.
3. **Créateur de l'émission** — le concept, c'est le sien. Il l'a vendu, défendu, incarné depuis le pilote.
4. **Enfant du sérail** — a grandi dans les coulisses de la télé. Connaît tout le monde dans le métier.
5. **Une communauté fidèle** — des centaines de milliers d'abonnés qui répondent présents : appels à témoins, archives introuvables, soutien public.
6. **Ancien de la libre antenne** — des années de radio nocturne à écouter des inconnus raconter leurs peurs. Sait faire parler n'importe qui, tenir l'antenne seul, reconnaître un mytho en trente secondes.

### Guest Star
1. **Sportif de haut niveau** — condition physique, discipline, gestion du stress et de la douleur, habitude des médias.
2. **A grandi dans une maison hantée** — familiarité d'enfance avec les phénomènes, aucune panique face à l'inexpliqué, vocabulaire vécu pour en parler avec les témoins.
3. **Chouchou du public** — capital sympathie énorme : les témoins se confient, les sceptiques baissent la garde, un appel à témoins fonctionne toujours.
4. **Vedette d'un autre temps** — tout le monde de plus de 40 ans le reconnaît. Nostalgie mobilisable, vieux réseau du showbiz, habitude des plateaux.
5. **Reconverti dans l'humanitaire** — des années de missions ONG : terrain difficile, contact avec des populations méfiantes, logistique de crise.
6. **Influenceur du web** — communauté mobilisable en direct, maîtrise de l'image et du montage, appels à témoins qui tournent en quelques heures, habitude de se filmer seul dans le noir.

### Ingénieur
1. **Ingénieur sénior** — vingt ans de métier, les certifications, les réflexes.
2. **Ancien de la sécurité industrielle** — des années à auditer des sites à risque : normes, points de défaillance, procédures d'urgence.
3. **Autodidacte de génie** — pas de diplôme, mais a démonté et remonté tout ce qui lui est passé entre les mains depuis l'enfance.
4. **Membre de l'équipe depuis la saison 1** — connaît l'émission, ses coulisses, ses légendes internes et tout le monde sur le plateau.
5. **Réseau de fournisseurs et de récupérateurs** — sait toujours où trouver une pièce, même rare, même à 3h du matin, même dans une ville inconnue.
6. **Ancien du broadcast** — a fait ses armes dans la télé en direct, où une panne à l'antenne n'est pas une option. Le stress technique, c'est son élément.

### Opérateur
1. **Cadreur de guerre** — a filmé des zones de conflit. Une maison qui craque la nuit, ça ne fait pas trembler la caméra.
2. **Passionné d'urbex** — lecture des bâtiments abandonnés, repérage des dangers structurels, culture des lieux "hantés" et de leur communauté.
3. **Membre de l'équipe depuis la saison 1** — l'émission, ses coulisses, ses légendes internes : il était là avant tout le monde.
4. **Pompier volontaire** — secourisme, lecture des bâtiments dangereux, sang-froid en urgence, respect instantané des autorités locales.
5. **Baroudeur de l'extrême** — a cadré des documentaires en jungle, désert, haute montagne : autonomie totale, matériel en conditions dégradées, endurance aux tournages qui durent.
6. **Le regard que les réalisateurs s'arrachent** — réputation établie dans le métier : quand il dit qu'un plan est bon, il est bon. Son nom au générique est une garantie.

### Scientifique
1. **Docteur en physique** — thèse, publications, rigueur académique. Le titre impressionne les témoins et agace les sceptiques de salon.
2. **Expert judiciaire** — méthodes forensiques, crédibilité légale, contacts aux tribunaux, habitude du rapport qui engage.
3. **Chasseur de fraudes** — a démonté publiquement des médiums de plateau, des photos truquées, des maisons hantées touristiques. Certains s'en souviennent.
4. **Accès aux archives universitaires** — cartes anciennes, thèses oubliées, fonds documentaires fermés au public : son badge ouvre encore ces portes.
5. **Vulgarisateur suivi** — chaîne/podcast science à forte audience : sait expliquer simplement, communauté mobilisable, crédibilité publique face aux témoins.
6. **Élevé par des parents "croyants"** — spiritisme, tables tournantes, pendules à la maison. Est devenu scientifique *contre* ça — mais connaît ce monde de l'intérieur.

### Producteur
1. **Vingt ans de télévision** — a produit du flux, du documentaire, du direct. Sait ce qui fait tenir une émission — et ce qui la tue.
2. **Ancien producteur de faits divers** — a couvert les affaires les plus sombres du pays. A des restes : contacts, archives, instinct du récit vrai.
3. **Patron de sa boîte de production** — pouvoir de décision immédiat sur le tournage, connaissance des contrats/assurances/autorisations, personnel à disposition.
4. **Un carnet d'adresses en or** — chaînes, distributeurs, attachés de presse, avocats du milieu : une vie de networking télévisuel.
5. **A enterré une émission concurrente** — connaît l'équipe d'en face, leurs méthodes, leurs trucages — et ce qu'ils ont vraiment filmé avant d'arrêter.
6. **Petit-fils de rebouteux** — dans sa famille, on "tirait le feu" et on désenvoûtait les bêtes. Il n'y croit pas. Mais il connaît les gestes, les mots, les usages.

### Médium
1. **Magnétiseur de campagne** — les gens de sa région viennent le voir depuis toujours : clientèle fidèle, réseau rural, connaissance des traditions locales de guérison.
2. **Consultant réputé** — des années de cabinet : particuliers endeuillés, familles inquiètes, parfois des gens très haut placés qui ne veulent pas que ça se sache.
3. **Mort deux minutes** — accident, arrêt cardiaque, réanimation. Un état permanent en est resté : crédibilité totale auprès des endeuillés, connaissance intime de "l'autre côté", dossier médical qui atteste.
4. **Élevé dans une tradition spirituelle** — cercles, séances, correspondances avec des médiums du monde entier : toute une culture héritée, avec ses réseaux encore vivants.
5. **A travaillé avec la police** — officieusement, sur des disparitions. Certains enquêteurs le rappellent encore. D'autres le détestent.
6. **Auteur sur l'au-delà** — livres publiés, salons, courrier de lecteurs : documentation accumulée, notoriété dans le milieu, témoignages reçus de toute la France.

### Exorciste
1. **Ordonné, puis écarté** — prêtre formé à l'exorcisme par l'Église, mis à l'écart pour avoir pris "trop au sérieux" un cas. N'a jamais rendu son col.
2. **Formé à Rome** — a suivi le vrai cursus, celui dont on ne parle pas : théologie, discernement, protocoles du rituel romain.
3. **Héritier d'une lignée de désenvoûteurs** — dans sa région, sa famille "faisait ça" depuis des générations. Les gens du pays viennent encore frapper à sa porte.
4. **Consultant officieux du diocèse** — l'Église ne le reconnaît pas publiquement, mais quand un cas déborde, c'est son téléphone qui sonne.
5. **Vingt ans de cas documentés** — des dossiers constitués sur chaque intervention : archive personnelle de cas comparables, familles reconnaissantes qu'on peut recontacter, expérience des schémas récurrents.
6. **Bibliothèque d'ouvrages interdits** — une collection unique de traités, rituels et correspondances, accumulée par sa lignée ou rachetée pièce par pièce.

> Note de consolidation : pools propres à chaque archétype (pas de partage, sauf doublon assumé "Membre de l'équipe depuis la saison 1" entre Ingénieur et Opérateur). Libellés en forme générique masculine, déclinables librement. Le "ancien" n'est utilisé que lorsque le passé est incompatible avec le présent du personnage (reporter de guerre → animateur), pas pour les activités cumulables (pompier volontaire). Certaines Vérités de réseau/accès présupposent une phase hors tournage (voir piste jour/nuit en À définir).

---

## 9. Talents (complets)

Pools de 6 talents par archétype. À la création : 2 au choix.

### Mécanique commune : le trucage et son exposition
Certains talents fabriquent de faux phénomènes. Un trucage réalisé **persiste dans la fiction** :
- Le MJ peut l'exposer en dépensant **5 Stress** (cf. grille §11 — entre Manifestation et Hostilité).
- Chaque complication survenant **dans le cadre du trucage** (ré-examen de la zone, dépouillement des rushs concernés, retour du témoin...) réduit de 1 le coût d'exposition, cumulativement.
- **Exposition :** le plafond d'Audimat de l'équipe baisse de 2 (6 → 4) jusqu'à la fin de la session, cumulable ; l'équipe perd immédiatement tout Audimat excédentaire. Dans la fiction, la crédibilité de l'émission en prend un coup.

### Ingénieur
1. **Système D** — Quand l'Ingénieur répare, rafistole ou détourne du matériel avec des moyens de fortune, réduisez la difficulté de 1 (min 0). Une fois par scène, si le jet réussit, l'objet réparé fonctionne sans complication possible jusqu'à la fin de la scène.
2. **Diagnostic éclair** — Une fois par scène, quand du matériel tombe en panne ou se comporte anormalement, demandez au MJ la cause réelle de la panne (naturelle ou non), sans jet. Si la cause est paranormale, générez 3 Stress.
3. **Ceinture et bretelles** — Une fois par scène, quand une complication technique frappe l'équipe (panne, batterie vide, signal perdu), dépensez 2 Audimat pour l'annuler : le dispositif de secours prévu prend le relais.
4. **Overclocking** — Avant un jet d'Opération utilisant du matériel, poussez l'appareil au-delà de ses specs : le jet gagne un d20 gratuit, mais tout dé affichant 16-20 génère une complication sur ce jet. À volonté.
5. **Le manuel, c'est moi** — Une fois par scène, quand un allié en ligne de communication avec l'Ingénieur effectue un jet d'Opération, dépensez 1 Audimat : l'allié utilise le rang d'Opération de l'Ingénieur à la place du sien. *(flag VTT : interaction entre joueurs à prévoir)*
6. **Deuxième lecture** — Une fois par scène, après un jet d'Opération raté, relancez un seul d20 en re-vérifiant les réglages. Si le jet échoue encore, le MJ gagne 1 Stress.

### Opérateur
1. **L'œil du monteur** — Une fois par scène, quand l'Opérateur dépouille des rushs (images, sons, mesures enregistrées), il peut relancer jusqu'à deux d20 sur ce jet d'analyse. *(flag playtest : puissant)*
2. **Caméra à l'épaule** — Une fois par scène, quand l'Opérateur filme en pleine action physique (course, poursuite, escalade), il utilise son rang de Déplacement à la place d'Opération sur ce jet.
3. **Le bon angle** — Dépensez 3 Audimat : un allié relance un d20 sur un jet effectué dans le champ d'une caméra de l'Opérateur. À volonté.
4. **Repérage instinctif** — Une fois par scène, en entrant dans un nouvel espace, demandez au MJ le principal danger physique du lieu. Générez 1 Stress.
5. **Le matos encaisse** — Une fois par scène, quand une complication frappe un jet de l'Opérateur, il peut la faire porter par son matériel : l'équipement concerné est hors service jusqu'à réparation, la complication est absorbée.
6. **Au plus près** — Une fois par scène, avant un jet d'Opération pour filmer un phénomène en cours, gagnez un d20 gratuit ; toute complication sur ce jet touche physiquement l'Opérateur ou son matériel.

### Scientifique
1. **Méthode expérimentale** — Dépensez 1 Prime Time avant un jet d'Investigation : réussite automatique, sans marge (aucun Audimat généré). *(exclusif : le seul succès automatique du jeu)*
2. **Esprit universel** — Une fois par scène, dépensez 2 Audimat : gagnez un focus supplémentaire jusqu'à la fin de la scène, choisi sur une compétence de rang 4+ (pas de focus improvisé sur un domaine délaissé).
3. **Explication naturelle** — Une fois par scène, demandez au MJ si le phénomène observé a une explication naturelle possible. Si la réponse est non, générez 2 Stress. *(un « oui » ne dit pas que c'est la bonne explication)*
4. **Écoutez la raison** — Quand le Scientifique expose un plan d'action argumenté, dépensez 1 Audimat par allié concerné : jusqu'à la fin de la scène, ceux qui suivent ses directives réduisent de 1 la difficulté de leurs jets directement liés au plan (min 0).
5. **Cartographie mentale** — Une fois par session, le Scientifique révèle qu'il a étudié les plans du lieu en amont : jusqu'à la fin de la scène en cours, l'équipe réduit de 1 la difficulté de ses jets d'orientation dans le bâtiment.
6. **Directeur de recherche** — Quand le Scientifique assiste le jet d'Investigation d'un allié, son d20 d'assistance déclenche des critiques sur un résultat ≤ son rang d'Investigation, même sans focus applicable. Si ce d20 n'obtient aucun succès, la difficulté du jet assisté augmente de 1.

### Producteur
1. **Instinct du direct** — Le Producteur peut à tout moment céder son tour d'action à un autre membre de l'équipe, qui agit à sa place. *(playtesté : équivalent de « Diriger », Achtung)*
2. **Dans l'oreillette** — Une fois par scène, dépensez 1 Audimat : un allié qui vient de rater un jet relance un d20, à condition que le Producteur puisse lui parler.
3. **Optimisation budgétaire** — Une fois par session, une dépense d'Audimat de l'équipe est réduite de 2 (min 1).
4. **Mon assistant s'en occupe** — Une fois par session, le Producteur délègue une tâche hors site à son équipe de production (recherche, course, appel, vérification) : le résultat arrive à la fin de la scène suivante, sans jet. Générez 1 Stress.
5. **Le nez du fait divers** — Une fois par scène, face à un témoin ou un document, demandez au MJ s'il dissimule quelque chose d'important. Générez 1 Stress. *(flag : famille « question fermée » avec Question piège de l'Animateur — à trancher ou assumer)*
6. **La séquence qu'il nous faut** — Une fois par session, le Producteur commande discrètement un trucage à un membre de l'équipe (qui l'exécute — ou refuse) : s'il est réalisé, gagnez 3 Audimat, générez 2 Stress. Mécanique d'exposition commune ; si le trucage est exposé, le complice porte le chapeau dans la fiction — sauf si le Producteur assume publiquement.

### Animateur
1. **Confessionnal** — Dépensez 2 Audimat : le témoin que l'Animateur interroge se livre comme s'ils étaient seuls au monde. Réduisez de 1 la difficulté des jets d'Investigation par interaction avec lui jusqu'à la fin de la scène.
2. **Tenir l'antenne** — Une fois par scène, dépensez 1 Audimat : un allié ou un PNJ paniqué, tétanisé ou socialement affecté par une complication reprend immédiatement ses moyens.
3. **Question piège** — Une fois par scène, demandez au MJ si le dernier propos tenu par un PNJ était sincère. Générez 1 Stress.
4. **Tout est animable** — Quand l'Animateur aborde une action en la jouant pour la caméra, il utilise Présence à la place du Principe normalement requis sur ce jet (le MJ arbitre la pertinence).
5. **Suivez le guide** — Dépensez 1 Audimat par allié concerné : jusqu'à la fin de la scène, ceux qui suivent les instructions de déplacement de l'Animateur réduisent de 1 la difficulté de leurs jets de Déplacement liés à l'évacuation ou au regroupement (min 0).
6. **Le grand frisson** — Une fois par scène, l'Animateur amplifie à l'antenne un non-événement (courant d'air, craquement, silence trop long) pour en faire un moment de télévision : gagnez 2 Audimat, générez 2 Stress. Mécanique d'exposition commune.

### Guest Star
1. **La baraka** — Une fois par session, après un jet raté de la Guest Star, l'échec reste un échec mais ne peut générer ni complication ni Stress.
2. **Regard neuf** — Une fois par scène, la Guest Star pose sa question naïve : demandez au MJ quel élément de la situation l'équipe tient à tort pour acquis. Générez 2 Stress.
3. **Étoile montante** — Une fois par session, quand la Guest Star obtient un critique naturel (dé à 1 ou dé ≤ rang avec focus — hors Prime Time et talents), le prochain d20 acheté par l'équipe est gratuit.
4. **Montée d'adrénaline** — Après avoir été témoin ou victime d'un événement paranormal, le prochain jet de Déplacement de la Guest Star gagne un d20 gratuit.
5. **Pas prévu au programme** — Une fois par scène, quand un effet présenté comme paranormal cible directement la Guest Star, elle peut immédiatement tenter un jet de Déplacement pour s'y soustraire avant sa résolution.
6. **Sous les projecteurs** — Quand la Guest Star agit dans le champ d'une caméra qui tourne, dépensez 1 Audimat pour réduire la difficulté de son jet de 1 (min 0). À volonté.

### Médium
1. **Puissance en Bovis** — Lors d'un événement paranormal, le Médium calcule la puissance en bovis : le prochain d20 acheté est gratuit. Une fois par scène.
2. **Transe** — Avant un jet d'Ésotérisme, le Médium entre en transe : le jet gagne un d20 gratuit ; en cas d'échec du jet, le contrecoup frappe le Médium — le MJ gagne 2 Stress et décrit l'effet du retour. À volonté.
3. **Empreinte des lieux** — Une fois par scène, au contact d'un objet ou d'un lieu, posez une question au MJ sur son passé émotionnel. Payez 3 Audimat OU générez 2 Stress (au choix du joueur).
4. **Canal protecteur** — Une fois par scène, dépensez 1 Audimat : le Médium détourne sur lui une complication présentée comme paranormale qui visait un allié.
5. **Sonder autrement** — Une fois par scène, quand le Médium explore par ses sens plutôt que par l'examen, il utilise son rang d'Ésotérisme à la place d'Investigation sur ce jet.
6. **Apaisement** — Une fois par session, dépensez 2 Audimat : le Médium apaise la scène — toute activité hostile ou perturbatrice cesse jusqu'à la fin de la scène, ou jusqu'à ce qu'on la provoque. *(flag : en discussion, à confirmer)*

### Exorciste
1. **Sanctuaire** — L'Exorciste peut consacrer une zone restreinte (une pièce, un cercle, un véhicule) : dans cette zone, le MJ dépense 2 Stress de plus pour déclencher un événement paranormal. La première consécration de la session est gratuite ; l'entretenir coûte 2 Audimat au début de chaque scène suivante, sinon elle s'éteint. Consacrer une nouvelle zone (ou re-consacrer une zone éteinte) coûte 3 Audimat, puis le loyer normal. Une seule zone consacrée à la fois.
2. **Au nom de ce qui est saint** — Après un jet d'Ésotérisme visant à protéger, purifier ou bannir, dépensez 2 Audimat pour ajouter 1 succès au résultat. Ce succès ne compte pas dans la marge (ne génère pas d'Audimat).
3. **Nommer le Mal** — Une fois par scène, face à une manifestation, demandez au MJ ce qu'il y a *réellement* derrière. Générez 2 Stress. *(agnostique : « une goule », « des rats et une chaudière » et « rien d'identifiable » sont des réponses valides)*
4. **Préparatifs minutieux** — Une fois par session, déclarez qu'un rituel a été préparé à l'avance (temps et matériel réunis) : le premier jet d'Ésotérisme lié à ce rituel réduit sa difficulté de 2 (min 0).
5. **Rempart de foi** — Une fois par scène, quand un effet présenté comme paranormal cible directement un allié, l'Exorciste peut s'interposer : l'effet est annulé. Générez 2 Stress.
6. **Trousse du praticien** — Une fois par scène, l'Exorciste révèle qu'un objet utilisé (par lui ou un allié) avait été béni ou préparé de sa main — le sel, l'eau, mais aussi le pendule du Médium, la caméra de l'Opérateur... éventuellement à l'insu de son propriétaire : le jet concerné gagne un d20 gratuit.

> Note de consolidation : familles de mécaniques assumées entre archétypes — re-roll payé en Stress (Deuxième lecture), protection d'allié (Canal protecteur = redirection/Audimat, Rempart de foi = annulation/Stress), buffs de groupe au tarif standard « 1 Audimat par allié » (Écoutez la raison, Suivez le guide), risque/récompense (Overclocking = fenêtre de complication élargie, Transe = contrecoup sur échec), trucage (Le grand frisson = amplifier, La séquence qu'il nous faut = fabriquer par complice). La grille tarifaire des questions au MJ : question fermée = 1 Stress, ouverte = 2 Stress, stratégique = 3 Stress (ou double prix Audimat/Stress, cf. Empreinte des lieux).

---

## 10. Répartition des Stats

Modèle **équilibré** (type Dune) : Principes et Compétences partagent la même échelle. Le focus devient un vrai « power spike » situationnel (~50%+ de critique par jet quand il s'applique sur une compétence maîtrisée) — chacun son moment de gloire.

### Répartition à la création

Pour les **Principes** ET les **Compétences** (deux pools séparés, aucun transfert) :

- **Socle imposé :** 5 (majeur) / 4 (mineur) / 3 / 3 (les deux autres)
- **Freebies :** 4 points à répartir librement par axe
- **Maximums à la création :** 7 (majeur) / 6 (mineur) / 5 (les deux autres)
- **Pas de plancher :** les trous sont des choix assumés — les personnages dépendent du groupe, pas d'eux-mêmes

### Topologie des builds

| Build | Exemple | Combo majeur (P+C) | Combo faible |
|---|---|---|---|
| Full spécialiste | 7/6/3/3 | 14 | 6 |
| Modéré | 6/5/4/3 | 12 | 7-8 |
| Généraliste | 5/4/5/5 | 10 | 8-10 |

La cible de départ (12-14 en combo fort) est atteinte par ceux qui la visent ; le généraliste paie sa polyvalence en plafond. L'égalisation partielle (ex. 5/4/5/5) est autorisée : elle coûte tous les freebies et sacrifie tout pic — trade-off honnête.

> Note : l'évolution XP des stats n'est pas prioritaire — le système vise d'abord le one-shot. Max absolu provisoire : 8.

---

## 11. Grille de coûts en Stress (arsenal du MJ)

La grille tarife des **interventions fictionnelles**, pas des modificateurs : le MJ achète un événement (*installer*, *perturber*, *déclencher*, *cibler*, *lâcher*), et l'effet mécanique éventuel découle de la fiction achetée. Conformément au principe d'ambiguïté, **la grille tarife l'effet, pas sa cause** : une panne coûte pareil qu'elle soit l'œuvre d'un esprit ou d'une batterie fatiguée.

| Palier | Coût | Ce que le MJ achète |
|---|---|---|
| **Frisson** | 1-2 | *Installer* une ambiance : bruit inexpliqué, chute de température, porte qui claque, ombre en périphérie, parasites |
| **Interférence** | 2-4 | *Perturber* l'équipe : panne d'équipement, lumières d'une zone qui lâchent, faux signal, matériel déplacé |
| **Manifestation** | 4-6 | *Déclencher* un phénomène indéniable : objet projeté, EVP clair, apparition fugace, écriture sur un mur |
| **Hostilité** | 6-8 | *Cibler* quelqu'un : contact physique, isolement d'un personnage (porte condamnée), possession d'un PNJ, blessure |
| **Climax** | 10+ | *Lâcher* l'événement du scénario : manifestation majeure prolongée, possession d'un PJ, l'entité sort du cadre |

**Règles satellites :**
- **Booster un phénomène en cours :** +1-2 Stress pour amplifier un événement déjà lancé sans repayer le palier (le frisson devient interférence, la manifestation s'éternise).
- **Sanctuaire :** +2 au coût de tout achat paranormal dans la zone consacrée (cf. talent de l'Exorciste).
- **Exposition d'un trucage :** 5 Stress (confirmé — entre Manifestation et Hostilité), réduit de 1 par complication survenue dans le cadre du trucage (cf. §9).

**Budget indicatif :** sur un one-shot de 4-5 scènes à 4-5 joueurs, le MJ encaisse ~15-25 Stress (complications, achats de d20 en Stress, talents). Soit : de l'ambiance en continu, 2-4 interférences, 1-2 manifestations, et une hostilité OU un climax — rarement les deux sans que les joueurs aient bien nourri la machine. Le MJ économise pour son grand moment, et les joueurs le voient venir (jauge visible) sans pouvoir l'empêcher.

---

## 12. Matériel

### Principes

Le matériel d'enquête paranormale est **purement narratif** : aucun bonus chiffré, aucune stat d'objet. Il ancre la fiction (ce qu'on peut tenter, filmer, mesurer), alimente les focus et les talents, et reste soumis au principe d'ambiguïté — chaque objet *fait quelque chose* (il bipe, il bouge, il rassure) sans que le système dise jamais s'il mesure quelque chose de réel.

**Budget de production :** l'équipe dispose d'un budget en points, représentant à la fois l'argent, la masse et la place dans le camion — on ne peut pas tout prendre. Rien n'est gratuit.
- **Budget standard : 18 points** — variante serrée : 14 (émission fauchée) — variante confortable : 22 (prod qui a les moyens).
- Échelle de coût 1 à 5 : 1 = petit et léger / 2 = matériel standard / 3 = matériel sérieux ou encombrant / 4 = gros matériel de prod / 5 = les grands kits.
- **Exemplaires multiples** hors lots définis : linéaire simple — chaque exemplaire supplémentaire coûte le prix de l'unité.

**Règle de composition des kits :** un kit rend un praticien fonctionnel (le quotidien du métier dans une valise) mais n'inclut jamais ses pièces maîtresses — les objets de précision, rares ou encombrants restent des items à l'unité. Le dilemme de production : plus de couverture (kits) ou plus d'excellence (pièces maîtresses), rarement les deux.

### Détection & mesure

| Item | Coût |
|---|---|
| K2 | 2 (×4 pour 5) |
| Mel Meter | 3 |
| Trifield (EMF de précision) | 4 |
| Thermomètre laser | 1 |
| Sonde de température ambiante | 1 (×4 pour 3) |
| Détecteur de mouvement | 2 (×4 pour 5) |
| Capteur de vibration/pression | 1 (×4 pour 3) |
| Data logger | 2 |
| Boussole | 1 |

- **K2 (détecteur EMF d'entrée de gamme)** — Boîtier plastique de la taille d'une télécommande, rangée de LEDs vert-jaune-rouge qui s'illuminent selon l'intensité du champ électromagnétique. L'icône du genre : réactif, nerveux, spectaculaire à l'image — et notoirement sensible aux téléphones, câbles muraux et talkies de l'équipe.
- **Mel Meter** — L'appareil sérieux du chasseur : écran digital affichant simultanément champ EMF et température, valeurs chiffrées et non plus de simples LEDs. Conçu à l'origine par un père endeuillé pour "contacter" sa fille — le folklore de l'objet fait partie de l'objet.
- **Trifield** — Le haut de gamme : mesure multi-axes, distinction des sources naturelles et artificielles. C'est l'instrument que le Scientifique accepte de regarder — et celui dont les relevés sont les plus durs à contester au dépouillement.
- **Thermomètre laser** — Pistolet à visée laser, température de surface instantanée du point visé. Traque les points froids pièce par pièce.
- **Sonde de température ambiante** — Petit boîtier à écran posé au sol, qui suit la température de l'air en continu. C'est elle qui documente la "chute brutale de 8 degrés" dont parlera le montage.
- **Détecteur de mouvement** — Capteur infrarouge passif sur trépied ou à ventouse, LED ou alarme au déclenchement. Posé dans les pièces vides. Quand il sonne et que tout le monde est ailleurs, personne ne rigole plus.
- **Capteur de vibration/pression** — Palet discret posé sur un meuble, une porte, une marche. S'illumine à la moindre sollicitation. Parfait pour "verrouiller" un objet qu'on soupçonne de bouger.
- **Data logger** — Enregistreur autonome multi-capteurs (température, hygrométrie, EMF) qui trace des courbes toute la nuit. Sans intérêt à l'antenne, précieux au dépouillement — l'outil des équipes qui bossent.
- **Boussole** — La bonne vieille boussole à aiguille. Low-tech, sans piles, impossible à soupçonner de bug. Quand l'aiguille tourne sans raison, c'est autrement plus troublant qu'une LED.

### Communication

| Item | Coût |
|---|---|
| Spirit box (SB7) | 3 |
| Enregistreur EVP | 2 (×3 pour 4) |
| Planche de Ouija | 2 |
| Pendule de radiesthésie | 1 |
| Boule de cristal | 2 |
| Coffret de trigger objects | 2 |

- **Spirit box (SB7)** — Boîtier radio qui balaye les fréquences AM/FM à toute vitesse, crachant un hachis de parasites et de fragments d'émissions. Les "réponses" émergent du bruit — un mot, deux syllabes, un prénom. La machine à ambiguïté par excellence, au son immédiatement reconnaissable à l'antenne.
- **Enregistreur EVP** — Dictaphone numérique à micro sensible. On pose des questions au silence, on laisse tourner, on écoute au casque au dépouillement.
- **Planche de Ouija** — Planche de bois ou de carton, alphabet en arc de cercle, OUI/NON/AU REVOIR, et sa planchette. L'objet que la production adore, que les témoins refusent de regarder et que l'Exorciste refuse de toucher. Rien que la sortir change l'ambiance d'une pièce.
- **Pendule de radiesthésie** — Masse de laiton, de cristal ou de bois au bout d'une chaînette. Oui, non, peut-être — et la mesure en bovis pour qui pratique. Silencieux et hypnotique à l'image.
- **Boule de cristal** — Sphère de cristal véritable, son coffret capitonné et son socle. Lourde, fragile, hypnotique à l'image — l'outil de la voyance posée, pas de l'improvisation. *(Pièce maîtresse : hors Mallette du médium.)*
- **Coffret de trigger objects** — Objets-appâts censés provoquer l'interaction : balle, jouet d'époque, boîte à musique mécanique, poupée à LED. On les pose, on les cadre, on les cercle à la craie, et on attend.

### Vision augmentée

| Item | Coût |
|---|---|
| Caméra thermique | 4 |
| Caméra IR / vision nocturne | 3 |
| Caméra full spectrum | 3 |
| Caméra SLS | 4 |
| Lampe UV | 1 |

- **Caméra thermique** — Peint le monde en fausses couleurs de chaleur. Les silhouettes chaudes là où il n'y a personne, les empreintes qui restent sur un fauteuil vide — c'est elle qui fait les miniatures des replays.
- **Caméra IR / vision nocturne** — Le regard vert-gris emblématique de l'émission : filmer dans le noir total, avec ce rendu granuleux qui rend le moindre couloir inquiétant.
- **Caméra full spectrum** — Capteur modifié pour capter du proche UV au proche infrarouge, couleurs étranges, halos inexpliqués. Personne ne sait vraiment interpréter ce qu'elle montre — c'est précisément ce qui la rend indispensable.
- **Caméra SLS** — Capteur de cartographie de mouvement (hérité des consoles de jeu) monté sur tablette : dessine des squelettes filaires sur ce qu'il croit reconnaître comme humain. Quand un squelette apparaît assis sur une chaise vide, l'équipe a son moment.
- **Lampe UV** — Torche à lumière noire. Révèle fluides, traces de nettoyage, inscriptions effacées, retouches récentes — l'outil qui fait parler les murs, au propre.

### Protection & rituel

| Item | Coût |
|---|---|
| Nécessaire de prêtre *(kit)* | 3 |
| Kit de purification *(kit)* | 2 |
| Nécessaire de traçage *(kit)* | 1 |
| Crucifix mural / symbole religieux majeur | 2 |
| Amulettes & grigris (le lot de l'équipe) | 1 |
| Grimoire / livre de rituels ancien | 3 |

- **Nécessaire de prêtre** — Bible ou rituel courant, étole, 2 cierges, fiole d'eau bénite, crucifix de poche. Le quotidien du ministère dans une sacoche. *(Pièces maîtresses hors kit : grimoire ancien, crucifix mural.)*
- **Kit de purification** — Sauge, encens, brûleur, sel en poignées, allumettes. La fumigation, geste télégénique par excellence : la fumée qui dérive, s'épaissit ou refuse d'entrer dans une pièce raconte une histoire toute seule.
- **Nécessaire de traçage** — Gros sel en sac, craie, cordeau, bougies. Tracer un cercle propre, marquer la position des objets pour vérifier au retour s'ils ont bougé.
- **Crucifix mural / symbole majeur** — Du grand modèle qu'on accroche ou qu'on brandit. La question de savoir si ça protège ou si ça provoque reste ouverte.
- **Amulettes & grigris** — Les protections personnelles de l'équipe : médaille de baptême, patte de lapin, pierre percée. Chacun le sien, personne n'en parle, tout le monde le touche avant d'entrer.
- **Grimoire / livre de rituels ancien** — L'ouvrage rare, annoté, à la provenance douteuse — distinct de la bible courante du Nécessaire. Un objet avec du poids, au propre comme au figuré. *(Pièce maîtresse.)*

### Terrain & soutien

| Item | Coût |
|---|---|
| Kit de base de l'émission *(kit)* | 5 |
| Kit d'enquête *(kit)* | 5 |
| Mallette du médium *(kit)* | 3 |
| Valise du sceptique *(kit)* | 2 |
| Kit du pisteur *(kit)* | 1 |
| Paire de talkies-walkies | 1 (×3 paires pour 2) |
| Kit de premiers secours | 1 |

- **Kit de base de l'émission** — Éclairage (frontales, torches, projecteur), énergie (batteries, power banks, chargeurs), 2 paires de talkies, premiers secours. Le camp de base dans deux caisses — il ne fait *que* le camp de base.
- **Kit d'enquête** — Le dispositif de détection standard de l'émission, dans deux flight cases : 2 K2, 3 détecteurs de mouvement, 2 sondes de température, 1 enregistreur EVP, et une vieille radio AM/FM à molette (spirit box de fortune — balayage manuel, et les vraies stations s'invitent dans le signal). *(Pièces maîtresses hors kit : SB7, Mel Meter, Trifield, toutes les caméras d'enquête — le kit détecte, il ne voit pas et ne mesure pas finement.)*
- **Mallette du médium** — Pendule, baguettes de sourcier, échelle de Bovis et son manuel, jeu de tarot, nappe de séance. Le quotidien du praticien. *(Pièce maîtresse hors kit : boule de cristal.)*
- **Valise du sceptique** — Thermomètre laser, boussole, anémomètre, mètre laser, loupe, miroir télescopique. Tout pour *démonter* un phénomène. *(Pièces maîtresses hors kit : Trifield, data logger.)*
- **Kit du pisteur** — Farine/poudre, fil, clochettes, adhésif de marquage. Saupoudrer un seuil, tendre une barrière sonore dans un couloir — l'artisanat qui ne tombe jamais en panne.
- **Paire de talkies-walkies** — La ligne de vie entre les groupes séparés. Portée médiocre dans le béton, grésillements permanents — et le jour où une voix inconnue s'invite sur le canal, tout le monde s'en souvient.
- **Kit de premiers secours** — Parce que statistiquement, le vrai danger de la nuit, c'est le plancher pourri et le verre brisé.

---

## À définir (prochaines étapes)

- [ ] Structure de scénario jour/nuit (phase repérage/enquête de jour vs phase tournage nocturne) — dépendant du scénario, à la main du MJ
- [ ] Coûts XP (talents chers d'avance, maximes supplémentaires) — non prioritaire, focus one-shot
- [ ] Flags à trancher : Le nez du fait divers vs Question piège (famille ou doublon ?), Apaisement (à confirmer), L'œil du monteur (playtest)

*Note : la notion de « scène » (unité des fréquences de talents, du decay d'Audimat, etc.) est volontairement non définie — elle se tranche à table, à la discrétion du MJ.*