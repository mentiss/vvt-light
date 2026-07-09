# Spécifications Fonctionnelles : Système de Règles - Fabula Ultima

---

## 1. Vue d'ensemble du Système
Fabula Ultima est un jeu de rôle inspiré des JRPG (Japanese Role-Playing Games). Le système repose sur l'utilisation de dés de différentes tailles (d6, d8, d10, d12) représentant les attributs des personnages, combinés deux par deux pour résoudre des actions, avec une forte composante de narration partagée via des points de ressources.

### 1.1. Règles des Jets de Dés (Système de Résolution)

Toutes les actions incertaines sont résolues par un **Test d'Attribut**.

#### A. Structure d'un Test
Le MJ détermine les deux attributs requis pour l'action (ils peuvent être identiques, ex: [INT + INT], ou différents, ex: `[DEX + PUI]`).
Le joueur lance les deux dés correspondants.
**Résultat du Test = (Valeur Dé 1 + Valeur Dé 2) + Modificateurs de compétences/équipement.**

#### B. Niveaux de Difficulté (ND)
Pour que l'action réussisse, le Résultat du Test doit être supérieur ou égal au Niveau de Difficulté fixé par le MJ :
| ND | Difficulté de l'action | Qui est susceptible d'y arriver ? |
|---|---|---|
| 7 | **Facile** | N’importe qui ayant un peu d’entraînement ou de talent inné. |
| 10 | **Normale** | Une personne compétente ou naturellement très douée. |
| 13 | **Difficile** | Un expert ou un prodige. |
| 16 | **Très Difficile** | Un des meilleurs dans ce domaine. |
Quand un personnage effectue un test dans une position particulièrement avantageuse ou handicapante, le meneur de jeu peut imposer un bonus de +2 ou un malus de -2 au résultat.

#### C. La Valeur Haute (VH)
La *Valeur Haute* correspond à la valeur individuelle la plus élevée affichée sur l'un des deux dés lancés (avant application des modificateurs).
La VH est principalement utilisé pour déterminer la quantité de dégâts infligés par une attaque ou le montant de PV/PM soignés par un sort.

#### D. Résultats Spéciaux
 **Succès Critique :** Déclenché lorsque les deux dés affichent le **même résultat numérique**, et que ce résultat est **égal ou supérieur à 6** (ex: double 6, double 7... jusqu'à double 12).
    L'action réussit automatiquement (indépendamment du SD).
    Génère une **Aubaine** gratuite pour le personnage.
 **Échec Critique :** Déclenché lorsque les deux dés affichent la valeur **1** (`1` et `1`).
    L'action échoue automatiquement.
    Le joueur ayant fait l'échec critique gagne immédiatement **1 Point Fabula**.
    Le MJ peut appliquer une complication narrative mineure ou d'une aubaine si l'échec critique ce produit lors d'une scène de conflit.

#### E. Les Aubaines
Lors d'un Succès Critique ou via certains effets, le personnage obtient une aubaine qu'il peut dépenser parmi les options suivantes :
**Affliction :** Une créature est **étourdie**, **traumatisée**, **ralentie** ou **affaiblie**.
**Avantage :** Le prochain test effectué par vous ou un allié bénéficie d’un bonus de +4.
**Démasqué ! :** Vous apprenez les objectifs et les mobiles d’une créature de votre choix.
**Évaluation :** Vous découvrez une **vulnérabilité** ou un **trait** d’une créature que vous pouvez voir.
**Faux pas :** Choisissez une créature présente dans la scène : elle fait une déclaration compromettante choisie par la personne qui l’interprète.
**Faveur :**  Votre comportement vous vaut le soutien ou l’admiration de quelqu’un.
**Information :** Vous repérez un indice ou un détail utile. Le meneur de jeu peut vous dire de quoi il s’agit ou vous demander de le décrire vous-même.
**Lien :** Vous créez un **lien** avec quelqu’un ou quelque chose, ou ajoutez une **émotion** à l’un de vos **liens** existants.
**Objet perdu :** Un objet est détruit, perdu, volé ou abandonné.
**Progression :**  Vous pouvez remplir ou effacer jusqu’à deux sections d’un **Cadran**.
**Rebondissement ! :** Quelqu’un ou quelque chose que vous choisissez apparaît soudain dans la scène.

---

## 2. Spécifications de la Feuille de Personnage

La feuille de personnage regroupe l'ensemble des données dynamiques et statiques d'un Personnage Joueur (PJ).

### 2.1. Données d'Identité et Narratives
**Nom :** Chaîne de caractères.
**Identité :** Une phrase décrivant le concept global du personnage (ex: *Ancien chevalier du royaume en quête de rédemption*). Utilisable mécaniquement via les points Fabula.
**Origine :** Le lieu ou la culture de provenance (ex: *Le Royaume Céleste de Baron*).
**Thème :** L'idéal ou l'émotion dominante du personnage (ex: *Ambition, Justice, Culpabilité, Espoir*). Utilisable pour regagner des points Fabula ou orienter le roleplay.
**Niveau Global :** Entier de 5 (départ) à 50 (maximum). Somme des niveaux de toutes les classes possédées.

### 2.2. Les Attributs Principaux
Chaque attribut est défini par une taille de dé (`d6`, `d8`, `d10`, `d12`).
 |Attribut|Applications|
 |---|---|
|**Dextérité (DEX)**|Mesure la précision, la coordination, l’habileté et les réflexes. Il vous en faudra pour vous déplacer prudemment, vous défendre, fabriquer des objets et manier des armes légères, des arcs et des armes à feu.|
|**Intuition (INT)**|Représente l’observation, l’intelligence et le raisonnement. Elle sert beaucoup pour enquêter, lancer des sorts et vous défendre contre la magie.|
|**Puissance(PUI)**|Mesure votre force et votre robustesse. La plupart des armes lourdes en tirent parti, et votre résistance à la douleur et à la fatigue est elle aussi liée à cet attribut sous forme de Points de Vie.|
|**Volonté (VOL)**|Représente la détermination, le charisme et la discipline. Vous vous en servirez pour la diplomatie et la persuasion, mais elle influence aussi directement votre capacité à lancer des sorts et à utiliser des compétences spéciales sous la forme de Points de Magie.|

### 2.3. Les Statistiques Dérivées (Calculées)
**Points de Vie (PV) :** Max = (Taille du dé PUI de base × 5) + Niveau total + Modificateurs.
**Seuil de Crise:** Égal à la moitié des PV Max divisé par 2, arrondi à  inférieur. Déclenche certains effets et compétences.
**Points de Magie (PM) :** Max = (Taille du dé VOL de base × 5) + Niveau total + Modificateurs.
**Points d'Inventaire (PI) :** Max de base = 6 (peut varier selon les classes/compétences). Utilisés comme ressource consommable pour faire apparaître des objets utilitaires (potions, élixirs, tentes) en cours d'aventure.
**Initiative (INIT) :** Base =  (Taille de dé de DEX + Taille de dé de INT) divisé par 2, arrondi à l'inférieur  + Modificateur d'Armure.
**Défense (DEF) :** Base = Taille de dé de DEX + Modificateur d'Armure/Bouclier. (Si l'armure est lourde, la DEX peut être remplacée par une valeur fixe).
**Défense Magique (DEF.M) :** Base = Taille de dé de INT + Modificateur de Bouclier/Accessoire.

### 2.4. Classes et Compétences
Un personnage doit posséder entre 2 et 3 classes à la création (Niveau global 5).
Chaque classe dispose d'une liste de **Compétences de Classe** dans lesquelles le joueur distribue ses points lors des montées de niveau (maximum 10 niveaux par classe).

### 2.5. Système de Liens
Un personnage peut posséder jusqu'à 6 liens envers d'autres entités (PJ, PNJ, Lieux ou Organisations). Chaque lien possède un score d'intensité (nombre de sentiments cochés, max 3) et est composé de paires de sentiments contradictoires :
> *Admiration* OU *Infériorité*
> *Loyauté* OU *Méfiance*
> *Affection]*OU *Haine*

### 2.6 Les Altérations d'États

Les altérations d'états sont des conditions négatives qui affectent directement la taille des dés d'attributs d'un personnage. Si un personnage subit une altération sur un attribut déjà à `d6`, le dé ne descend pas en dessous, mais l'effet persiste.

| Altération | Attribut Affecté | Effet Mécanique | Description thématique |
| :--- | :--- | :--- | :--- |
| **Étourdi**  | **Intuition (INT)** | La taille du dé d'INT diminue d'un cran. | Distrait, confus, incapable de se concentrer. |
| **Enragé**  | **Dextérité (DEX)** & **Intuition (INT)** | La taille des dés de DEX et d'INS diminue d'un cran. | Submergé par la colère, perd toute finesse historique. |
| **Ralenti**  | **Dextérité (DEX)** | La taille du dé de DEX diminue d'un cran. | Mouvements lourds, réflexes engourdis. |
| **Traumatisé**  | **Volonté (VOL)** | La taille du dé de VOL diminue d'un cran. | Perte de confiance, peur, instabilité émotionnelle. |
| **Affaibli**  | **Puissance (PUI)** | La taille du dé de PUI diminue d'un cran. | Épuisement physique, force musculaire amoindrie. |
| **Empoisonné**  | **Puissance (PUI)** & **Volonté (VOL)** | La taille des dés de PUI et de VOL diminue d'un cran. | Un poison ou une maladie ronge l'organisme de l'intérieur. |

*Note de traitement :* Si une règle ou un objet guérit une altération, l'attribut concerné retrouve sa valeur nominale immédiatement. Les effets de réduction ne se cumulent pas sur un même attribut si la même altération est appliquée deux fois.

---

## 3. Étapes de la Création de Personnage

La création de personnage suit un processus séquentiel strict en 6 étapes :

```
[Étape 1: Concept] --> [Étape 2: Choix des Classes] --> [Étape 3: Attributs]
                                                                |
[Étape 6: Groupe & Liens] <-- [Étape 5: Équipement] <-- [Étape 4: Stats Dérivées]
```

### Étape 1 : Choisir le Concept Évocateur
Définir l'**Identité**, l'**Origine** et le **Thème** initial du personnage.
	
### Étape 2 : Sélectionner les Classes et les Compétences
L'utilisateur peut ajouter entre 2 et 3 classes issues du catalogue officiel (ex. : *Arcaniste, Elementaliste, Gardien, Sombrelame, Tireur d'élite, Voyageur*, etc.).
Distribuer 5 points de niveaux au total entre ces classes.
Pour chaque niveau investi dans une classe, le joueur gagne 1 point de compétence à distribuer parmi les compétences propres à cette classe.
 L'interface doit lister les compétences de la classe sélectionnée, gérer le niveau maximal de chaque compétence (souvent plafonné entre 1 et 10 selon la compétence).

#### Étape 2.1 : Liste des Classes :

### ARCANISTE
*Invoque les avatars magiques d’anciennes entités quasi divines.*

**Atouts gratuits :** 
- Votre maximum de Points de Magie augmente définitivement de 5.

**Arcanisme rituel(NCMax 1)**  — Vous pouvez réaliser des rituels de la discipline **Arcanisme** tant que leurs effets relèvent des **domaines** d’un ou plusieurs Arcana que vous avez liés (voir pages suivantes). Le test de magie des rituels d’arcanisme utilise [VOL + VOL]. 

**Arcanum d'urgence(NCMax 6)** — Tant que vous êtes en **Crise** le coût d’invocation de vos Arcana diminue de [NC × 5] Points de Magie.

**Cercle arcanique(NCMax 4)** — Après avoir volontairement **renvoyé** un Arcanum durant votre tour de jeu lors d’un conflit, si l’Arcanum en question n’avait pas été **invoqué** au même tour et si vous êtes équipé d’une arme **arcanique**, vous pouvez aussitôt réaliser gratuitement l’action sort. Le coût du sort que vous lancez de la sorte doit être **inférieur ou égal à** [NC × 5] **Points de Magie** (et vous devez toujours le payer).

**Régénération arcanique(NCMax 2)** — Quand vous invoquez un arcunum, vous récupérez aussitôt [NC x 5] Points de Vie.

**Lier et invoquer(NCMax 1)**
Vous pouvez **lier** les Arcana à votre âme et les **invoquer** plus tard. Le meneur de jeu vous expliquera les détails de chaque processus visant à lier un Arcanum chaque fois que vous le rencontrez pour la première fois.
Si vous prenez cette compétence à la création de personnage, vous commencez la partie avec un Arcanum de votre choix déjà lié, à choisir dans la liste des pages suivantes. En dehors de cela, vous ne pouvez obtenir de nouveaux Arcana que par l’exploration et le déroulement du récit.
Vous pouvez utiliser une action et dépenser 40 Points de Magie pour **invoquer** un Arcanum que vous avez lié : les détails de l’opération sont les suivantes :
***Fusionner avec un Arcanum*** — Lorsque vous invoquez un Arcanum, vous recevez ses atouts de **fusion** ; ils durent jusqu’à ce que vous le renvoyiez. Vous ne pouvez pas invoquer d’Arcanum quand vous fusionnez déjà avec l’un d’entre eux ; il vous faut d’abord renvoyer ce dernier.
***Renvoyer un Arcanum*** — On peut renvoyer un Arcanum de diverses manières :
- Une fois que la scène en cours s’achève, tous les Arcana sont automatiquement renvoyés.
- Si vous mourez ou perdez connaissance alors que vous fusionnez avec un Arcanum, il est renvoyé.
- Si vous quittez la scène alors que vous fusionnez avec un Arcanum, il est renvoyé.
- Vous pouvez **délibérément** renvoyer un Arcanum : cela ne nécessite pas d’action, mais pendant un conflit, vous ne pouvez le faire qu’à votre tour, **avant ou après** une action.
***Effets du renvoi*** — Le **renvoi** de la plupart des Arcana s’accompagne d’un effet puissant, que vous ne pouvez activer que lorsque vous les renvoyez **volontairement** comme décrit ci-dessus : si l’Arcanum est renvoyé pour n’importe quelle autre raison, l’effet de **renvoi** ne peut pas être déclenché. (Quand l’effet de renvoi d’un Arcanum inflige des dégâts, il en inflige 10 points de plus si vous êtes de **niveau 20 ou supérieur**, ou 20 de plus si vous êtes de **niveau 40 ou supérieur**.) Vous êtes également libre d’ignorer l’effet de **renvoi** si vous ne voulez pas vous en servir.

#### Table des Arcana :
| Nom de l'Arcanum | Domaines | Effets de Fusion | Effet(s) de Renvoi |
|---|---|---|---|
| **Arcanum du Chêne** | *terre, plantes, poison* | Vous bénéficiez de la résistance aux dégâts de **terre** et de **poison** ainsi que de l’immunité à l’état **empoisonné**. Chaque fois que vous récupérez des Points de Vie, vous en récupérez 5 de plus. | **Floraison**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez (y compris vous-même) : chacune se débarrasse de l’état **empoisonné** et regagne 40 Points de Vie. Ce total passe à 50 Points de Vie si vous êtes de **niveau 20 ou plus**, ou à 60 si vous êtes de **niveau 40 ou plus**. |
| **Arcanum du Ciel** | *brouillard, pluie, tempêtes* | Vous bénéficiez de la résistance aux dégâts d’**air **et de **foudre**. Vous pouvez utiliser une action pour prédire les conditions météo du jour à venir dans un rayon de **deux jours de trajet** ; le meneur de jeu vous indiquera les conditions en question. | **Orage**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de **foudre**. Ces dégâts ignorent les résistances. |
| **Arcanum de l'Épée** | *conquête, héroïsme, commandement* | Tous les dégâts infligés par vos attaques sont traités comme s’ils n’avaient aucun type (ce qui fait qu’aucune affinité envers les dégâts ne les affecte) et augmentent de 5. Ils ne peuvent pas recevoir de type tant que vous restez fusionné avec cet Arcanum. Quand vous portez une attaque, vous pouvez lui affecter la propriété **multi (n’importe quel nombre de cibles)**. Dans ce cas, l’Arcanum est immédiatement renvoyé après la résolution de l’attaque (ce n’est pas considéré comme un renvoi délibéré). | - |
| **Arcanum de la Forge** | *feu, chaleur, métal* | Vous bénéficiez d’une résistance aux dégâts de **feu**. Tous les dégâts de **feu** que vous infligez ignorent les résistances. | Quand vous **renvoyez** cet Arcanum, choisissez **Forge** ou **Fournaise** : **Forge**. Vous créez une **armure**, un **bouclier** ou une **arme de base** de votre choix (voir pages 130 à 133). Si vous choisissez de nouveau cette option, l’objet précédemment créé disparaît. Si vous créez une arme de cette façon, elle inflige des dégâts de **feu** au lieu de dégâts **physiques**. **Fournaise**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de **feu**. Ces dégâts ignorent les résistances. |
| **Arcanum du Givre** | *froid, glace, silence* | Vous bénéficiez d’une résistance aux dégâts de **glace** et de l’immunité à l’état **enragé**. Tous les dégâts de **glace** que vous infligez ignorent les résistances. | **Âge de glace**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de **glace**. Ces dégâts ignorent les résistances. |
| **Arcanum du Grimoire** | *savoir, révélations, compréhension* | Vous êtes capable de lire, d’écrire et de comprendre toutes les langues. Vous faites comme si la taille de votre dé d’**Intuition** était supérieure d’un cran (maximum **d12**). | **Oracle**. Vous posez une seule question au meneur de jeu, qui doit répondre sincèrement en vous décrivant la vision que vous montre le Grimoire. Une fois utilisé, cet effet de **renvoi** n’est plus disponible avant la prochaine aube. En outre, on ne peut jamais poser la même question plus d’une fois. C’est le meneur de jeu qui a le dernier mot quand il s’agit de décider si deux questions sont trop proches. |
| **Arcanum du Portail** | *espace, voyage, vide* | Vous bénéficiez d’une résistance aux dégâts de **ténèbres**. Vous bénéficiez d’un bonus de +1 en Défense magique. | Lorsque vous **renvoyez** cet arcanum, choisissez **Néant** ou **Téléportation** : **Néant**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de **ténèbres**. Ces dégâts ignorent les résistances. **Téléportation**. Vous vous téléportez ainsi que jusqu'à 5 autres créatures consentantes à proximité vers une endroit que vous avez déjà visité, à moins **d'une journée de voyage**. |
| **Arcanum de la Roue** | *destin, vitesse, temps* | Vous êtes immunisé contre l’état **ralenti**. Vous bénéficiez d’un bonus de +1 en Défense. | **Interruption du temps**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit l’état **ralenti**. Si une créature choisie de la sorte est déjà **ralentie**, à la place, elle effectue une action de moins à son tour suivant (pour un minimum de 0 action). |
| **Arcanum de la Tour** | *jugement, protection, sacrifice* | Quand vous invoquez cet Arcanum, choisissez un type de dégât : **air, foudre, ténèbres, terre, feu ou glace**. Jusqu’à ce que cet Arcanum soit renvoyé, chacun de vos alliés présents dans la scène dispose de la résistance au type choisi (mais **pas vous**). | **Jugement**. Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de **lumière**. Ces dégâts ignorent les résistances. |

---

### BRICOLEUR/BRICOLEUSE
*Fabrique des inventions et utilise les Points d’Inventaire de manière innovante.*

**Atouts gratuits :**
- Votre maximum de Points d’Inventaire augmente définitivement de 2.
- Vous pouvez démarrer des **projets**.

**Accessoire d'urgence(NCMax 1)** — Une fois par scène de conflit, si vous êtes en **Crise**, vous pouvez effectuer une action supplémentaire à votre tour de jeu. Il s’agit **forcément** de l’action **Inventaire**.

**Formule secrète(NCMax 5)** — Lorsque vous créez une **potion** ou une **magisphère** dont les effets restaurent des PV et/ou des PM, la quantité de points restaurée augmente de [NC × 5]. Lorsque vous créez un **fragment élémentaire**, une **potion** ou une **magisphère** qui inflige des dégâts, cet objet inflige [NC] dégâts supplémentaires.

**Pluie de potions(NCMax 2)** — Lorsque vous créez une **potion** restaurant les PV et/ou PM d’une **seule** créature, vous pouvez étendre ses effets à [NC] créatures supplémentaires. Dans ce cas, elle ne restaure que la moitié des PV et PM normaux pour chaque créature.

**Visionnaire(NCMax 5)** — Quand vous travaillez sur un **projet**, jusqu’à [NC × 100] zénits de coût de matériaux sont automatiquement payés. En outre, vous générez [NC] **Points de Progression** en plus chaque jour. Si plusieurs personnages dotés de cette compétence travaillent sur le même projet, les effets se cumulent.

**Gadgets(NCMax 5)** — Quand vous obtenez cette compétence pour la première fois, choisissez un type de gadget : **alchimie**, **inoculation** ou **technomagie** (voir les descriptions suivantes) . Vous recevez ses **atouts de base**. Chaque fois que vous reprenez cette compétence, choisissez une option : vous obtenez les **atouts de base** d’un nouveau type de gadget, **ou** vous obtenez les **atouts avancés** d’un gadget dont vous possédez déjà les **atouts de base**, **ou** vous obtenez les **atouts supérieurs** d’un type de gadget dont vous possédez déjà les **atouts avancés**.

***Alchimie*** — Vous pouvez recourir à l’action **Inventaire** pour confectionner rapidement une **potion** aux effets puissants mais assez imprévisibles. Choisissez un type de **mélange** parmi ceux que vous avez débloqués (**de base**, **avancé** ou **supérieur**) et dépensez la quantité de Points d’Inventaire adéquate.

#### Table des mélanges :

| Mélange | Coût en PI | Description |
|---|---|---|
| **De base** | 3 | Lancez deux d20 et affectez-en un à la cible et un à l’effet. |
| **Avancé** | 4 | Lancez trois d20 et affectez-en un à la cible et un à l’effet. |
| **Supérieur** | 5 | Lancez quatre d20 et affectez-en un à la cible et un à l’effet. |
Quand vous créez un mélange, lancez le nombre de dés à 20 faces indiqué sur la table, puis affectez l’un des résultats à la table de cibles  et l’autre à la table d’effets. Débarrassez-vous des dés restants, puis décrivez les effets du mélange ! Les deux effets correspondant à « Tous » sur la table d’effet sont toujours disponibles et peuvent être choisis si aucun des effets disponibles ne vous intéresse.

#### Table de cibles :

| Dé | La potion affecte… |
|---|---|
| 1-6 | … vous-même ou un allié présent dans la scène que vous voyez. |
| 7-11 | … un ennemi présent dans la scène que vous voyez. |
| 12-16 | … vous et tous les alliés présents dans la scène. |
| 17-20 | … tous les ennemis présents dans la scène. |

#### Table d'effets :

| Dé | Chaque créature affectée par la potion…  |
|---|---|
| Tous | … subit 20 dégâts de poison. |
| Tous | … récupère 30 Points de Vie. |
| 1 | … fait comme si la taille de ses dés de Dextérité et de Puissance était supérieure d’un cran (jusqu’à un maximum de d12) jusqu’à la fin de son prochain tour. |
| 2 | … fait comme si la taille de ses dés d'Intuition et de Volonté était supérieure d’un cran (jusqu’à un maximum de d12) jusqu’à la fin de son prochain tour. |
| 3 | … subit 20 dégâts d’air. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 4 | … subit 20 dégâts de foudre. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 5 | … subit 20 dégâts de ténèbres. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 6 | … subit 20 dégâts de terre. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 7 | … subit 20 dégâts de feu. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 8 | … subit 20 dégâts de glace. Cette quantité passe à 30 dégâts si vous êtes de niveau 20 ou supérieur, ou à 40 si vous êtes de niveau 40 ou supérieur. |
| 9 | … bénéficie d’une résistance aux dégâts d’air et de feu jusqu’à la fin de la scène. |
| 10 | … bénéficie d’une résistance aux dégâts de foudre et de glace jusqu’à la fin de la scène. |
| 11 | … bénéficie d’une résistance aux dégâts de ténèbres et de terre jusqu’à la fin de la scène. |
| 12 | … subit l’état enragé. |
| 13 | … subit l’état empoisonné. |
| 14 | … subit les états étourdi, traumatisé, ralenti et affaibli. |
| 15 | … se débarrasser de tous les états. |
| 16-17 | … récupère 50 Points de Vie et 50 Points de Magie. |
| 18 | … récupère 100 Points de Vie. |
| 19 | … récupère 100 Points de Magie. |
| 20 | … récupère 100 Points de Vie et 100 Points de Magie. |

***Inoculation*** — Quand une de vos attaques touche une ou plusieurs cibles, vous pouvez dépenser 2 Points d’Inventaire pour produire une inoculation spéciale et en appliquer l’effet à l’attaque en question (si celle-ci disposait de la propriété multi, les effets de l’inoculation s’appliquent à chaque cible). (Vous ne pouvez pas appliquer plus d’une inoculation à la même attaque ; produire et utiliser l’inoculation font tous deux partie de l’action utilisée pour attaquer avec l’arme.)

#### Table d'inoculation :

| Inoculation (*niveau*) | Effet |
|---|---|
| **Cryo***(de base)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type glace. |
| **Pyro***(de base)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type feu. |
| **Volt***(de base)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type foudre. |
| **Cyclone***(avancées)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type air. |
| **Exorcisme***(avancées)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type lumière. |
| **Séisme***(avancées)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type terre. |
| **Ombre***(avancées)* | L’attaque inflige 5 dégâts supplémentaires, et ses dégâts sont désormais du type ténèbres. |
| **Vampire***(supérieures)* | Choisissez une option : vous récupérez un nombre de PV égal à la moitié des PV perdus par la cible de l’attaque, ou vous récupérez un nombre de PM égal à la moitié des PV perdus par la cible de l’attaque. Cette inoculation ne peut être utilisée que si l’attaque visait une seule créature. |
| **Venin***(supérieures)*  | L’attaque inflige 5 dégâts supplémentaires, ses dégâts prennent le type poison et chaque créature touchée subit l’état empoisonné. |

***Technomagie*** — Ce type d'invention ocrtoie divers atouts.

#### Prise de contrôle technomagique (de base)
- Vous pouvez utiliser une action et dépenser 10 Points de Magie pour effectuer un test d'[INT + INT] opposé contre une créature artificielle de rang soldat proche que vous pouvez voir (le meneur de jeu doit vous dire qui constitue une cible valide). En cas de réussite, vous prenez le contrôle de la créature jusqu’à la fin de la scène (le meneur de jeu vous donne son profil). Vous ne pouvez contrôler qu’une créature artificielle à la fois, mais vous pouvez la libérer dès que vous le souhaitez. La créature artificielle est également libérée dès que vous ou un de vos alliés lui faites du mal. Une fois libérée, la créature artificielle reprend le contrôle de ses actes et peut se retourner contre vous.

#### Magicanon (Avancé)
- Vous pouvez effectuer l’action Inventaire et dépenser 3 Points d’Inventaire pour créer une arme à feu connue sous le nom de magicanon (voir profil ci-dessous). Le magicanon tombe en morceaux dès que vous créez un nouveau magicanon. Au moment où vous créez un magicanon, choisissez le type de dégâts qu’il inflige (air, foudre, terre, feu, glace ou physiques).
|Nom|Précision|Dégâts|Mots clés et Qualités|
|Magicanon|[DEX + INT] +1|[VH +10]|Deux mains, Distance, Aucune Qualité|

#### Magisphère (Supérieur)
- Vous développez trois prototypes de magisphères : chacun peut reproduire un sort choisi parmi les listes des classes suivantes : Élémentaliste, Entropiste et Spirite. Les sorts que vous choisissez peuvent tous venir de la même ou relever de listes différentes. (Vous développez aussi deux prototypes de plus en arrivant au niveau 20, et deux autres au niveau 40 (il en va de même si vous avez déjà atteint ces niveaux).)
- Vous pouvez effectuer l’action Inventaire et dépenser 2 Points d’Inventaire pour créer une magisphère et aussitôt réaliser gratuitement l’action Sort, lançant ainsi l’un des sorts pour lequel vous avez développé un prototype. Le sort obéit aux règles ordinaires (y compris pour ce qui concerne le coût en PM et les tests de magie), et la magisphère est détruite après utilisation.

---

### CHIMÉRISTE
*Apprend les sorts des créatures et parle avec les animaux.*

**Atouts gratuits :** 
- Votre maximum de Points de Magie augmente définitivement de 5.
- Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Ritualisme**.

**Chimérisme rituel(NCMax 1)** — Vous pouvez réaliser des rituels de la discipline **Chimérisme**. Lorsque vous obtenez cette compétence, choisissez [INT + VOL] ou [PUI + VOL]. Dorénavant, vous utilisez ces attributs pour le test de magie de vos rituels de Chimérisme.

**Consommation(NCMax 5)** — Après avoir infligé des dégâts à une ou plusieurs créatures au moyen d’un sort, si vous êtes équipé d’une arme de type **arcanique**, **dague** ou **articulée**, vous récupérez [NC × 2] Points de Magie.

**Imitation de sort(NCMax 10)** — Quand vous voyez une créature appartenant à l’espèce **bête**, **monstre** ou **plante** lancer un sort, vous pouvez immédiatement choisir de l’apprendre sous forme de sort de Chimériste : dans ce cas, notez l’**espèce** de la créature dont vous le tenez.
Quand vous obtenez ce sort, choisissez [INT + VOL] ou [PUI + VOL]. Dorénavant, vous utilisez ces attributs pour le test de magie de vos sorts offensifs (r) de Chimériste, quels que soient ceux qu’employait la créature lorsque vous l’avez appris.
Vous pouvez mémoriser jusqu’à [NC + 2] **sorts de Chimériste** de cette façon. Si vous souhaitez mémoriser un nouveau sort de Chimériste alors que vous avez déjà atteint votre limite, vous devez oublier l’un des anciens et le remplacer par le nouveau.

**Langue des Bêtes(NCMax 1)** — Vous pouvez communiquer avec les créatures appartenant aux **bête**, **monstre** et **plante**.

**Pathogenèse** — Quand vous infligez des dégâts à une ou plusieurs créatures avec un de vos sorts de Chimériste, chacune de ces créatures dont l’**espèce** est la même que celle dont vous avez appris ce sort reçoit l’état **empoisonné**.

---

### ÉLÉMENTALISTE
*Manie le pouvoir destructeur des éléments.*

**Atouts gratuits :**
- Votre maximum de Points de Magie augmente définitivement de 5.
- Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Ritualisme**.

**Artillerie magique(NCMax 3)** — Quand vous lancez un sort offensif  en étant équipé d’une arme **arcanique**, vous bénéficiez d’un bonus égal à [NC × 2] au test de magie.

**Cataclysme(NCMax 3)** — Quand vous lancez un sort de durée **instantanée**, si vous êtes équipé d’une arme **arcanique**, vous pouvez **accroître le coût total en PM du sort**, d’un maximum de [NC × 10] Points de Magie. Dans ce cas, s’il inflige des dégâts à une ou plusieurs créatures, ceux-ci augmentent pour chaque cible de 5 par tranche de 10 Points de Magie supplémentaires dépensés.

** Élémentalisme rituel(NCMax 1)** — Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Élémentalisme**. Le test de magie des rituels d’Élémentalisme utilise les attributs [INT + VOL].

**Sorcelame(NCMax 4)** — Quand vous lancez un sort offensif visant **une seule créature** en étant équipé d’une ou plusieurs armes de catégorie **arme**, **lutte**, **dague**, **articulé**, **lance** ou **épée**, si le **coût total en Points de Magie du sort est inférieur ou égal à** [NC × 10], vous pouvez choisir une de ces armes : le test de magie du sort est effectué à l’aide de la formule de précision de l’arme en question.

**Magie élémentaire(NCMax 10)** — Chaque fois que vous acquérez cette compétence, apprenez un sort d’Élémentaliste (voir la table ci-dessous). Le test des sorts d’Élémentaliste offensifs utilise les attributs [INT + VOL].

#### Table des sorts d'Élémentaliste

|Nom|Offensif|Test de Magie|Coût|Cible|Durée|Description|
|---|---|---|---|---|---|---|
|Arme élémentaire|-||10|Une arme|Scène|Vous imprégnez une arme d’énergie magique. Choisissez un type de dégâts : air, foudre, terre, feu ou glace. Tant que ce sort fait effet, tous les dégâts infligés par l’arme sont du type choisi. Si vous êtes équipé de l’arme lorsque vous lancez ce sort, vous pouvez l’utiliser pour réaliser une attaque gratuite dans la même action. Ce sort ne peut être lancé que sur l’arme d’une créature volontaire.|
|Éclair|Oui|[INT + VOL]|20|Une créature|Instantanée|Vous lancez un éclair sur votre adversaire. La cible subit [VH + 25] dégâts de foudre. Les dégâts infligés par ce sort ignorent les résistances.|
|Frappe Volante|-||10|Soi|Instantanée|Le vent porte vos attaques à l’autre bout du champ de bataille. Vous pouvez immédiatement réaliser une attaque gratuite avec une arme de corps à corps dont vous êtes équipé. Cette attaque peut prendre pour cible des créatures qu’on ne peut viser qu’avec des attaques à distance. Si vous utilisez une arme de catégorie lutte ou lance, l’attaque inflige 5 dégâts de plus. Si vous touchez une cible volante à l’aide de cette attaque, vous pouvez la forcer à atterrir immédiatement.|
|Fulgur|Oui|[INT + VOL]|10 PM par cible|Jusqu'à trois créatures|Instantanée|Vous agencez l’électricité en une vague d’éclairs qui crépitent. Chaque cible touchée subit aussitôt [VH + 15] dégâts de foudre. Aubaine : chaque cible touchée par le sort subit l’état étourdi.|
|Glacies|Oui|[INT + VOL]|10 PM par cible|Jusqu'à trois créatures|Instantanée|Vous couvrez vos adversaires d’une épaisse couche de givre. Chaque cible touchée subit aussitôt [VH + 15] dégâts de glace. Aubaine : chaque cible touchée par le sort subit l’état ralenti.|
|Iceberg|Oui|[INT + VOL]|20|Une créature|Instantanée|Un pilier de magie de glace enveloppe votre adversaire, dont la température tombe à un seuil critique. La cible subit [VH + 25] dégâts de glace. Les dégâts infligés par ce sort ignorent les résistances.|
|Ignis|Oui|[INT + VOL]|10 PM par cible|Jusqu'à trois créatures|Instantanée|Vous lâchez un déluge ardent sur vos adversaires en faisant apparaître spontanément des flammes. Chaque cible touchée subit [VH + 15] dégâts de feu. Aubaine : chaque cible touchée par le sort subit l’état traumatisé.|
|Terra|Oui|[INT + VOL]|10 PM par cible|Jusqu'à trois créatures|Instantanée|Des spires de roche pointues jaillissent du sol sous vos adversaires et se referment sur eux. Chaque cible touchée par ce sort subit [VH + 15] dégâts de terre. Ce sort ne peut pas viser des créatures qui volent, lévitent, tombent ou se trouvent dans les airs pour quelque raison que ce soit. Aubaine : chaque cible touchée par ce sort effectue une action de moins à son prochain tour (pour un minimum de 0 action).|
|Trait de feu|Oui|[INT + VOL]|20|Une créature|Instantanée|Vous faites jaillir vers votre adversaire un trait de feu d’une température si élevée qu’il perce la plupart des défenses. La cible subit [VH + 25] dégâts de feu. Les dégâts infligés par ce sort ignorent les résistances.|
|Ventus|Oui|[INT + VOL]|10 PM par cible|Jusqu'à trois créatures|Instantanée|Vous invoquez la puissance des vents contre votre ennemi. Chaque cible touchée par ce sort subit [VH + 15] dégâts d’air. Aubaine : chaque cible volante touchée par ce sort est immédiatement forcée d’atterrir.|
|Voile élémentaire|-||5 PM par cible|Jusqu'à trois créatures|Scène|Vous tissez un voile d’énergie magique qui protège les cibles des éléments déchaînés. Choisissez un type de magie : air, foudre, terre, feu ou glace. Tant que ce sort fait effet, chaque cible bénéficie d’une résistance face au type de dégâts choisi.|
|Vortex|-||10|Soi|Scène|Un véritable ouragan vous entoure, déviant flèches et balles. Jusqu’à ce que les effets de ce sort s’achèvent, vous bénéficiez d’un bonus de +2 à la Défense contre les attaques à distance.|

---

### ENTROPISTE
*Canalise l’énergie obscure du Cosmos.*

**Atouts gratuits :**
- Votre maximum de Points de Magie augmente définitivement de 5.
- Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Ritualisme**.

**Absorption de PM(NCMax 5)** — Après avoir subi des dégâts, vous pouvez immédiatement récupérer [NC × 2] Points de Magie.

**Entropisme rituel(NCMax 1)** — Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Entropisme**. Le test de magie des rituels d’Élémentalisme utilise les attributs [INT + VOL].

**Nombre Porte-Bonheur(NCMax 1)** — Vous avez un **nombre porte-bonheur**. Au début de chaque séance de jeu, il s’agit de 7. Une fois par scène, après avoir réalisé un test, vous pouvez remplacer par ce nombre le résultat d’un des dés que vous avez lancés (même s’il est normalement impossible avec ce dé, par exemple dans le cas d’un d6). Le résultat que vous avez remplacé devient votre **nouveau** nombre porte-bonheur.

**Temps dérobé(NCMax 4)** — Pendant un conflit, vous pouvez utiliser une action pour perturber le déroulement du temps en dépensant jusqu’à [NC × 5] Points de Magie. Pour chaque tranche de 5 PM dépensée de la sorte, choisissez une option :
- Une créature que vous voyez subit l’état **ralenti**.
- Une créature que vous voyez se débarrasse de l’état **ralenti**. 
- Une créature que vous voyez peut aussitôt effectuer gratuitement l’action **Équipement**.
- Vous choisissez un allié que vous pouvez voir et qui n’a pas encore joué son tour durant ce round : cet allié peut jouer immédiatement son tour après le vôtre pendant ce round.
Chaque option ne peut être choisie qu’une fois par utilisation de cette compétence.

**Magie Entropioque(NCMax 10)** — Chaque fois que vous obtenez cette compétence, vous apprenez un sort d’Entropiste (voir la table ci-dessous). Le test de magie des sorts d’Entropistes offensifs utilise [INT + VOL].

#### Table des sorts d'Entropiste

|Nom|Offensif|Test de Magie|Coût|Cible|Durée|Description|
|---|---|---|---|---|---|---|
|Absorption de vigueur|Oui|[INT + VOL]|10|Une créature|Instantanée|Vous volez l’énergie vitale d’une créature. La cible subit [VH + 15] dégâts de ténèbres. Ensuite, vous récupérez un nombre de Points de Vie égal à la moitié des points perdus (si la perte en question a été réduite à 0 d’une façon ou d’une autre, vous ne gagnez ien).|
|Absorption spirituelle|Oui|[INT + VOL]|5|Une créature|Instantanée|Vous absorbez l’énergie psychique d’une créature. La cible perd [VH + 15] Points de Magie. Ensuite, vous récupérez un nombre de Points de Magie égal à la moitié des points perdus (si la perte en question a été réduite à 0 d’une façon ou d’une autre, vous ne gagnez rien).|
|Accélération|-||20|Une créature|Scène|Vous altérez la trame du temps. Jusqu’à ce que cesse l’effet de ce sort, la cible a le pouvoir d’effectuer une action de plus à chacun de ses tours. Une fois qu’elle a réalisé un total de deux actions supplémentaires permises par ce sort, les effets de celui-ci s’achèvent.|
|Anomalie|Oui|[INT + VOL]|20|Une créature|Scène|ous altérez la nature de votre cible. Jusqu’à ce que l’effet de ce sort cesse, lorsqu’elle subit des dégâts d’un type qu’elle absorbe ou contre lesquels elle est immunisée, ils sont traitéscomme si elle y était vulnérable au contraire. Une fois que cela s’est produit, l’effet du sort s’achève.|
|Arme ténébreuse|-||10|Une arme équipée|Scène|Vous imprégnez une arme d’énergie ténébreuse. Tant que ce sort fait effet, tous les dégâts infligés par l’arme sont de type ténèbres. Si vous êtes équipé de l’arme lorsque vous lancez ce sort, vous pouvez l’utiliser pour réaliser une attaque gratuite dans la même action. Ce sort ne peut être lancé que sur l’arme d’une créature volontaire.|
|Arrêt|Oui|[INT + VOL]|10|Une créature|Instantanée|Vous enfermez un adversaire dans un cercle de temps et d’espace altérés. La cible effectue une action de moins à son prochain tour (pour un minimum de 0 action).|
|Dissipation|-||10|Une créature|Instantanée|Vous libérez une vague d’énergie négative qui dissipe toute magie d’une créature. Si la cible était sous l’effet d’un ou plusieurs sorts dont la durée est d’une scène, leur effet sur elle s’arrête immédiatement.|
|Divination|-||10|Soi|Scène|Vous avez un bref aperçu de l’avenir. Jusqu’à la fin de l’effet de ce sort, lorsqu’une créature que vous voyez effectue un test, s’il ne s’agit ni d’un échec critique ni d’une réussite critique, vous pouvez la forcer à relancer les deux dés. Une fois que vous avez forcé deux relances de la sorte, l’effet de ce sort s’achève.|
|Jeu de hasard|-||Jusqu’à 20|Spécial|Instantanée|Vous invoquez un vortex d’énergie chaotique. Lancez votre dé actuel de Volonté une fois pour chaque tranche de 10 points dépensés en lançant ce sort, puis gardez le dé que vous préférez (un seul) : son résultat indique les effets du sort. 1 Vous perdez la moitié de vos Points de Vie actuels et de vos Points de Magie actuels. 2-3 Chaque créature présente lors de la scène, vous y compris, subit l’état empoisonné. 4-6 Chaque créature présente lors de la scène, vous y compris, subit l’état ralenti. 7-8 Choisissez jusqu’à trois créatures que vous pouvez voir : chacune récupère 50 Points de Vie et se débarrasse de tous les états qu’elle a subis. 9+ Choisissez autant de créatures que vous voulez parmi celles que vous voyez. Chacune subit 30 dégâts. Le type des dégâts est déterminé au hasard en lançant un d6 : 1. Air 2. Foudre 3. Ténèbres 4. Terre 5. Feu 6. Poison|
|Miroir|-||10|Une créature|Scène|Vous déformez les lois de la magie. Jusqu’à ce que l’effet de ce sort s’achève, si un sort offensif (rr) est lancé sur votre sujet, la créature qui l’a lancé est prise pour cible à sa place par le sort en question (toutes les autres cibles de ce dernier sont visées normalement). Une fois que cela s’est produit, l’effet du sort s’achève.|
|Oméga|Oui|[INT + VOL]|20|Une créature|Instantanée|Vous invoquez le mauvais sort contre votre adversaire pour transformer sa force en fragilité. La cible perd un nombre de Points de Vie égal à [20 + la moitié de son niveau].|
|Umbra|Oui|[INT + VOL]|10 PM par cible|Jusqu’à 3 créatures|Instantanée|Une tempête d’énergie noire transforme la matière en cendres. Chaque cible touchée par ce sort subit [VH + 15] dégâts de ténèbres. Aubaine : chaque cible touchée par ce sort subit l’état affaibli.|

---

### FURIE
*Provoque les ennemis et frappe plus fort après avoir subi des dégâts.*

**Atouts gratuits :**
- Votre maximum de Points de Vie augmente définitivement de 5.
- Vous recevez la capacité de vous équiper d’**armes martiales de corps à corps** et d’**armures martiales**.

**Adrénaline(NCMax 5)** — Tant que vous êtes en **Crise**, vous infligez[NC × 2] dégâts supplémentaires (avec vos attaques, sorts, Arcana, objets ou autres méthodes).

**Âme indommptable(NCMax 4)** — Quand vous dépensez au moins 1 Point Fabula, vous recevez un avantage supplémentaire. Choisissez une option : 
- Vous récupérez [NC × 5] Points de Vie 
- Vous récupérez [NC × 5] Points de Magie 
- Vous vous débarrassez d’un état de votre choix.

**Encaisser(NCMax 5)** — Quand vous effectuez l’action **Garde**, si vous choisissez de **ne pas** couvrir une autre créature, vous récupérez un nombre de Points de Vie égal à [NC × la plus haute intensité parmi vos liens] et vous devez choisir entre **Puissance** et **Volonté** : vous faites comme si la taille de dé de l’attribut choisi était supérieure d’un cran (jusqu’à un maximum de **d12**) jusqu’à la fin de votre prochain tour.

**Frénésie(NCMax 1)** — Vos tests de précision réalisés avec des armes de catégorie **lutte**, **dague**, **articulé** et **jet** déclenchent une **réussite critique** chaque fois que les deux dés affichent le même résultat (et que vous n’avez pas obtenu d’**échec critique**).

**Provocation(NCMax 5)** — Vous pouvez utiliser une action et dépenser 5 Points de Magie pour réaliser un test opposé de [PUI + VOL] contre une créature que vous voyez : décrivez comment vous la provoquez ! En cas de réussite, la cible subit l’état **enragé** et elle est forcée de concentrer son attention sur vous (ses attaques et sorts offensifs doivent vous inclure dans la liste descibles si possible). Cette obligation cesse si vous perdez connaissance ou quittez la scène, si la créature n’est plus **enragée** ou si quelqu’un d’autre la **provoque**.
Vous bénéficiez d’un bonus égal au [NC] pour les tests effectués pour cette compétence.

---

### GARDIEN/GARDIENNE
*Protège ses alliés et combat vêtu d’une armure lourde.*

**Atouts gratuits :**
- Votre maximum de Points de Vie augmente définitivement de 5.
- Vous recevez la capacité de vous équiper d’**armures martiales** et de **boucliers martiaux**.

**Forteresse(NCMax 5)** — Votre maximum de Points de Vie augmente définitivement de [NC × 3].

**Garde du corps(NCMax 1)** — Si vous réalisez l’action **Garde** et choisissez de couvrir une autre créature, celle-ci bénéficie d’une résistance à tous les types de dégâts jusqu’au début de votre prochain tour.

**Maîtrise défensive(NCMax 5)** — Tant que vous êtes équipé d’un **bouclier** ou d’une **armure martiale**, tous les dégâts que vous subissez sont réduits de [NC] (à appliquer **avant** les affinités aux dégâts).

**Protection(NCMax 1)** — Lorsqu’une autre créature est menacée par une **attaque**, un **sort** ou un autre **danger**, vous pouvez prendre sa place (tous les tests associés au danger sont effectués contre vous ; vous pouvez déclarer l’utilisation de cette compétence **avant ou après** que les tests en question ont été effectués). Si le danger vous a déjà affecté, il vous affecte **deux fois** (résolvez-en les deux effets séparément). En outre, vous ne pouvez pas protéger plusieurs créatures contre le même danger. 
Si vous utilisez cette compétence lors d’un conflit, vous ne pouvez plus vous en servir de nouveau jusqu’au début de votre prochain tour.

**Boucliers doubles(NCMax 1)** — Vous pouvez désormais vous équiper d’un **bouclier** dans votre **emplacement** de **main directrice**. Tant que vous êtes équipé de deux boucliers, vous bénéficiez des effets des deux et pouvez les traiter comme l’arme de **lutte** à deux mains combinée suivante :
|Nom|Précision|Dégâts|Effet|
|Boucliers jumeaux|[PUI + PUI]|[VH +5] physiques|Infligent un nombre de dégâts supplémentaires égal à votre [NC] en **maîtrise défensive**|

---

### MAÎTRE D’ARMES
*Excelle au corps à corps, qu’il s’agisse de se battre ou de contrer les attaques.*

**Atouts gratuits :**
- Votre maximum de Points de Vie augmente définitivement de 5.
- Vous recevez la capacité de vous équiper d’**armes martiales de corps à corps** et de **boucliers martiaux**.

**Brèche(NCMax 3)** — Vous pouvez utiliser une action et dépenser 5 Points de Magie pour effectuer une **attaque gratuite** avec une arme de **corps à corps** dont vous êtes équipé. Cette attaque doit viser **une seule créature**. En cas de réussite, elle n’inflige pas de dégâts, mais vous choisissez une option :
- Vous détruisez un bouclier dont la cible est équipée 
- Vous détruisez l’armure dont la cible est équipée
- Chaque fois que la cible subit des dégâts, quelle qu’en soit la source, avant le début de votre prochain tour, cette source lui inflige [NC × 2] dégâts supplémentaires.

**Broyage(NCMax 4)** — Quand vous touchez une ou plusieurs cibles avec une attaque de **corps à corps** qui leur inflige des dégâts, vous pouvez renoncer aux dégâts en question. Dans ce cas, choisissez une option :
- Infligez l’état **étourdi** à chaque cible touchée par l’attaque.
- Infligez l’état **affaibli** à chaque cible touchée par l’attaque. 
- Chaque cible touchée par l’attaque perd [NC × 10] Points de Magie.
Décrivez votre manoeuvre !

**Contre-attaque(NCMax 1)** — Après qu’un **ennemi vous touche ou vous rate avec une attaque de corps à corps**, si le résultat de son test de précision était un **nombre pair**, vous pouvez réaliser une **attaque gratuite** contre lui (après la résolution de la sienne). Il doit s’agit d’une attaque de **corps à corps**, qui prend **uniquement** pour cible l’ennemi ; traitez votre **valeur haute** [VH] comme s’il s’agissait de 0 lorsque vous en calculez les dégâts.

**Maîtrise des armes de corps à corps(NCMax 4)** — Vous bénéficiez d’un bonus de [NC] à tous les tests de précision effectués avec des armes de **corps à corps**.

**Tempête d'acier(NCMax 1)** — Quand vous effectuez une attaque de **corps à corps**, vous pouvez dépenser 10 Points de Magie pour choisir une option : l’attaque gagne la propriété **multi (2)**, ou vous ajoutez 1 au niveau de **multi** de l’attaque, jusqu’à un maximum de **multi (3)**.

---

### MAÎTRE ÉRUDIT
*Ce puits de savoir soutient ses alliés.*

**Atouts gratuits :** 
- Votre maximum de Points de Magie augmente définitivement de 5.

**Concentration(NCMax 5)** — Votre maximum de Points de Magie augmente définitivement de [NC × 3]. Quand vous effectuez un test ouvert d’ [INT + INT], vous bénéficiez d’un bonus égal à [NC] au résultat (cet effet s’applique **uniquement** aux tests ouverts).

**Éclair de génie(NCMax 3)** — Quand vous obtenez **13 ou plus** à un test réalisé pour enquêter sur une créature, un objet ou un lieu (y compris lorsque vous utilisez l’action **Analyse** lors d’un conflit), vous pouvez poser au meneur de jeu jusqu’à [NC] questions sur le sujet de votre investigation. Vous êtes libre de les poser immédiatement ou de les garder pour plus tard : chaque fois, le meneur de jeu répond sincèrement, et vous décrivez le processus de déduction de votre personnage. Cette compétence ne peut être utilisée qu’une fois par créature, objet ou lieu.

**Estimation rapide(NCMax 6)** — Au début d’un conflit, vous pouvez dépenser jusqu’à [NC × 5] Points de Magie. Pour chaque tranche de 5 Points de Magie dépensée de la sorte, choisissez une option :
- Choisissez une créature que vous voyez et le MJ vous révèle l’un de ses **traits**.
- Nommez un type de dégâts et choisissez une créature que vous voyez, et le MJ révèle l’**affinité** de cette dernière envers le type choisi.

**Le savoir, c'est le pouvoir(NCMax 1)** — Quand vous effectuez un test de précision, vous pouvez remplacer un des dés d’attribut par **Intuition**.

**Mémoire exercée(NCMax 1)** — Vous vous rappelez à la perfection les détails de tout endroit que vous avez visité durant la semaine passée. Vous pouvez « remonter mentalement le temps » pour examiner ces lieux et y enquêter de nouveau : votre compétence **Éclair de génie** s’applique également à ces souvenirs.

---

### ORATEUR/ORATRICE
*Gagne des alliés et influence les conflits par le verbe.*

**Atouts gratuits :** 
- Votre maximum de Points de Magie augmente définitivement de 5.

**Allié inattendu(NCMax 1)** — Vous pouvez utiliser une action et dépenser 1 Point Fabula pour choisir une créature **non hostile** capable de vous entendre et de vous comprendre. Elle vous aide désormais tant que vous demeurez bienveillant et respectueux envers elle et que vos demandes restent raisonnables.

**Condamnation(NCMax 4)** — Vous pouvez utiliser une action et dépenser 5 Points de Magie pour effectuer un test d'[INT + VOL] opposé contre une créature capable de vous entendre et de vous comprendre : décrivez vos accusations ! Si vous réussissez, la cible perd [NC × 10] Points de Magie et subit l’état **étourdi** ou **traumatisé** (c’est vous qui choisissez). Vous bénéficiez d’un bonus égal à votre [NC] au test d'[INT + VOL] réalisé pour cette compétence.

**Encouragement(NCMax 6)** — Pendant un conflit, vous pouvez utiliser une action et dépenser 5 Points de Magie pour choisir une autre créature capable de vous entendre et de vous comprendre. Elle récupère [NC × 5] Points de Vie et choisit entre **Dextérité**, **Intuition**, **Puissance** et **Volonté** : elle fait comme si la taille de dé de l’attribut était supérieure d’un cran (pour un maximum de **d12**) jusqu’au début de votre prochain tour.

**J'ai confiance en toi(NCMax 2)** — Après qu’un personnage joueur capable de vous entendre a effectué un test, vous pouvez dépenser 1 Point Fabula et invoquer l’un de ses traits ou de ses liens pour lui permettre de relancer des dés ou d’améliorer le résultat de son test (conformément aux règles habituelles). Ensuite, si vous avez un **lien** avec ce personnage, il récupère [NC × 10] Points de Magie.

**Persuasion(NCMax 2)** —  Quand vous réussissez un test pour remplir ou effacer des sections d’un Cadran, si votre approche relève du **charme**, de la **diplomatie**, de la **tromperie** ou de l’**intimidation**, vous pouvez dépenser jusqu’à [NC × 20] Points de Magie. Ensuite, remplissez ou effacez une section du même Cadran pour chaque tranche de 20 PM dépensée de la sorte.

---

### ROUBLARD/ROUBLARDE
*Saisit les occasions et vole des objets uniques à ses ennemis.*

**Atouts gratuits:**
- Votre maximum de Points d’Inventaire augmente définitivement de 2.

**À plus tard !(NCMax 1)** — Vous pouvez utiliser une action et dépenser 1 Point Fabula pour disparaître de la scène en cours, et réapparaître quand vous voulez durant une scène **différente** où un autre personnage joueur est présent. Décrivez comment vous vous êtes échappé et avez miraculeusement réussi à vous rendre là-bas !

**Coup bas(NCMax 5)** — Quand une de vos attaques touche une créature, s’il s’agissait de la **seule** créature visée et si elle est sous l’effet d’au moins **un état**, vous pouvez lui infliger des dégâts supplémentaires égaux à [NC + nombres d’états dont la créature est victime].

**Esquive(NCMax 3)** — Tant que vous n’êtes équipé ni de **boucliers** ni d’une **armure martiale**, le [NC] s’ajoute à votre valeur de Défense.

**Vivacité(NCMax 3)** — Au début d’un conflit, vous pouvez dépenser 10 Points de Magie. Dans ce cas, choisissez une option et appliquez-la avant le début du premier round : effectuez une **attaque gratuite** avec une arme dont vous êtes équipé, ou effectuez une action **Gêne** ou **Objectif**. Vous bénéficiez en outre d’un bonus égal à [NC] à tous les tests que vous effectuez dans le cadre de l’option choisie.

**Vol spirituel(NCMax 5)** — Vous pouvez utiliser une action pour effectuer un test de [DEX + VOL] contre la Défense magique d’une créature que vous voyez. Si vous réussissez et si la cible est un **soldat**, vous récupérez [NC] Points d’Inventaire. S’il s’agit d’un personnage d’**élite** ou d’un **champion**, le MJ vous donne le **trésor spirituel** de la cible, un objet valant une quantité de zénits inférieure ou égale à [niveau de la cible × 30, ou 50 si c’est un Méchant]. Ce **trésor spirituel** apparaît dans votre **sac à dos** ; on ne peut détrousser une même créature à l’aide de cette compétence qu’une fois.  Vous bénéficiez d’un bonus égal au [NC] à vos tests de [DEX + VOL] pour cette compétence.

---

### SOMBRELAME
*Utilise des attaques de ténèbres et tire son pouvoir des liens.*

**Atouts gratuits :**
- Votre maximum de Points de Vie augmente définitivement de 5.
- Vous recevez la capacité de vous équiper d’**armes martiales de corps à corps** et d’**armures martiales**.

**Coeur des ténèbres(NCMax 1)** — Une fois par scène, lorsque vous entrez en **Crise**, vous pouvez choisir une créature spécifique que vous voyez et avec laquelle vous n’avez pas de **lien** : créez un **lien** de **haine** envers cette créature.

**Douloureuse leçon(NCMax 3)** — Après qu’une autre créature vous a fait perdre des Points de Vie (au moyen d’une attaque, d’un sort ou de toute autre méthode), vous pouvez aussitôt réaliser gratuitement l’action **Analyse** en la prenant pour cible, bénéficiant alors d’un bonus égal à votre [NC] au test. Rappelez-vous que vous ne pouvez analyser qu’une fois chaque aspect d’une créature.

**Frappe de l'ombre(NCMax 5)** — Vous avez appris à canaliser votre énergie vitale dans vos attaques. Vous pouvez utiliser une action pour effectuer une **Frappe de l’ombre**. Lancez alors votre dé de **Puissance** actuel : le résultat **indique le nombre de Points de Vie que vous perdez**. Si vous n’êtes pas tombé à 0 Point de Vie, vous pouvez réaliser une **attaque gratuite** avec une arme dont vous êtes équipé : si l’attaque touche au moins une cible, elle inflige un nombre de dégâts supplémentaire égal à [NC + résultat obtenu au dé de Puissance]. Tous les dégâts infligés par l’attaque deviennent toutefois des dégâts de **ténèbres**, et on ne peut pas changer leur type.

**Sang ténébreux(NCMax 1)** — Tant que vous êtes en **Crise**, vous bénéficiez d’une résistance aux dégâts de **ténèbres** et de **poison**.

**Supplice(NCMax 5)** — Après avoir infligé des dégâts à une ou plusieurs créatures, si vous avez un lien avec au moins l’une d’entre elles, vous pouvez récupérer [NC × 2] Points de Vie et [NC × 2] Points de Magie.

---+

### SPIRITE
*Soutient ses alliés grâce à la magie et lance des sorts de lumière.*

**Atouts gratuits :**
- Votre maximum de Points de Magie augmente définitivement de 5.
- Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Ritualisme**.

**Magie de soutien(NCMax 1)** — Quand vous lancez un sort qui prend pour cible un ou plusieurs alliés, si vous êtes équipé d’une arme **arcanique**, vous pouvez choisir un de ces alliés vis-à-vis duquel vous avez un **lien**. Cet allié reçoit un bonus au prochain test qu’il effectue durant la scène en cours. Le bonus est égal à l’**intensité** du lien en question.

**Pouvoir guérisseur(NCMax 2)** — Quand vous lancez un sort qui prend pour cible un ou plusieurs alliés, si vous êtes équipé d’une arme **arcanique**, vous pouvez faire récupérer à chacun de ces alliés un nombre de Points de Vie égal à [NC × le nombre de liens que vous avez]. Ces soins s’ajoutent à tous ceux qui proviendraient des effets d’un sort et en sont distincts.

**Spiritisme rituel(NCMax 1)** — Vous pouvez réaliser des rituels dont les effets relèvent de la discipline **Spiritisme**. Le test de magie des rituels de Spiritisme utilise [INT + VOL]

**Vismagus(NCMax 1)** — Quand vous lancez un sort, si vous n’avez pas assez de Points de Magie pour en payer le coût total, vous pouvez choisir de payer **le double en Points de Vie** à la place. Vous ne pouvez pas utiliser cette compétence si l’opération vous réduit à 0 Point de Vie. Si un sort lancé de cette façon est censé vous redonner des Points de Vie, il ne vous en octroie aucun (mais fonctionne normalement vis-à-vis des autres cibles).

**Magie spirituelle(NCMax 10)** — Chaque fois que vous obtenez cette compétence, vous apprenez un sort de Spirite (voir la table ci-dessous). Le test de magie des sorts de Spirite offensifs utilise [INT + VOL].

#### Table des sorts de Spirite :

|Nom|Offensif|Test de Magie|Coût|Cible|Durée|Description|
|---|---|---|---|---|---|---|
|Arme spirituelle|-||10|Une arme équipée|Scène|Vous imprégnez une arme de l’énergie purificatrice de votre âme. Tant que ce sort fait effet, tous les dégâts infligés par l’arme deviennent des dégâts de lumière. Si vous êtes équipé de l’arme lorsque vous lancez ce sort, vous pouvez l’utiliser pour réaliser une attaque gratuite dans la même action. Ce sort ne peut être lancé que sur l’arme d’une créature volontaire.|
|Aura|-||5 PM par cible|Jusqu’à 3 créatures|Scène|Vous projetez votre âme hors de votre corps afin qu’elle entoure les cibles et les protège contre la magie néfaste. Jusqu’à la fin des effets de ce sort, chaque cible fait comme si sa Défense magique était de 12 contre tout effet qui la prend pour cible (mais peut utiliser sa valeur normale si elle est supérieure à 12).|
|Barrière|-||5 PM par cible|Jusqu’à 3 créatures|Scène|Vous projetez votre âme hors de votre corps afin d’en faire une barrière protégeant les cibles contre les attaques. Jusqu’à la fin des effets de ce sort, chaque cible fait comme si sa Défense était de 12 contre tout effet qui la prend pour cible (mais peut utiliser sa valeur normale si elle est supérieure à 12).|
|Éveil|-||20|Une créature|Scène|Vous permettez à une créature de concentrer son énergie vitale pour accomplir ce qui lui était impossible jusqu’alors. Choisissez un attribut : Dextérité, Intuition, Puissance ou Volonté. Jusqu’à ce que l’effet du sort s’achève, la cible fait comme si la taille de dé de cet attribut était supérieure d’un cran (jusqu’à un maximum de d12).|
|Hallucination|Oui|[INT + VOL]|5 PM par cible|Jusqu’à 3 créatures|Instantanée|Vous altérez les perceptions de vos ennemis, provoquant chez eux des hallucinations bizarres ou effrayantes. Choisissez étourdi ou traumatisé : vous infligez cet état à chaque cible touchée par le sort.|
|Lux|Oui|[INT + VOL]|10 PM par cible|Jusqu’à 3 créatures|Instantanée|Vous focalisez votre énergie interne dans une rafale d’aveuglants rayons spirituels. Chaque cible touchée par ce sort subit [VH + 15] dégâts de lumière. Aubaine : chaque cible touchée par le sort subit l’état étourdi.|
|Miséricorde|-||20|Une créature|Scène|Vous renforcez le cœur d’une créature contre la souffrance et le désespoir. Tant que ce sort fait effet, si la cible est réduite à 0 Point de Vie, il lui reste en réalité exactement 1 Point de Vie à la place. Une fois que cela se produit, l’effet du sort s’achève.|
|Purification|-||5 PM par cible|Jusqu’à 3 créatures|Instantanée|Vous renforcez et purifiez l’énergie spirituelle qui parcourt vos compagnons. Chaque cible se débarrasse de tous les états qui l’affectent.|
|Rage|Oui|[INT + VOL]|10|Une créature|Instantanée|Vous faites perdre son sang-froid à une créature, qui abandonne toute prudence. La cible subit l’état enragé et ne peut plus réaliser les actions Garde ou Sort à son prochain tour.|
|Renforcement|-||5 PM par cible|Jusqu’à 3 créatures|Scène|Vous protégez les cibles contre les attaques qui pourraient corrompre leur corps ou leur âme. Choisissez entre étourdi, enragé, empoisonné, traumatisé, ralenti et affaibli. Jusqu’à ce que l’effet de ce sort s’achève, chaque cible est immunisée contre l’état choisi.|
|Soins|-||10 PM par cible|Jusqu’à 3 créatures|Instantanée|Vous revigorez vos compagnons, apaisant leur douleur et leur fatigue. Chaque cible récupère 40 Points de Vie. Cette quantité passe à 50 Points de Vie si vous êtes de niveau 20 ou supérieur, ou 60 Points de Vie si vous êtes de niveau 40 ou supérieur.|
|Torpeur|Oui|[INT + VOL]|5 PM par cible|Jusqu’à 3 créatures|Instantanée|Vous étouffez l’énergie qui parcourt le corps de vos adversaires afin de gêner leurs mouvements. Choisissez ralenti ou affaibli : vous infligez cet état à chaque cible touchée par le sort.|

---

### TIREUR D'ÉLITE/TIREUSE D'ÉLITE
*Excelle au combat à distance et annule les attaques à distance.*

**Atouts gratuits :**
- Votre maximum de Points de Vie augmente définitivement de 5.
- Vous recevez la capacité de vous équiper d’**armes martiales à distance** et de **boucliers martiaux**.

**Coup de semonce(NCMax 4)** — Quand vous touchez une ou plusieurs cibles avec une attaque à distance qui leur inflige des dégâts, vous pouvez renoncer aux dégâts en question. Dans ce cas, choisissez une option :
- Infligez l’état **traumatisé** à chaque cible touchée par l’attaque.
- Infligez l’état **ralenti** à chaque cible touchée par l’attaque.
- Chaque cible touchée par l’attaque perd[NC × 10] Points de Magie.
Décrivez votre manoeuvre !

**Maîtrise des armes à distance(NCMax 4)** — Vous bénéficiez d'un bonus de [NC] à tous les test de précision effectués avec des armes **à distance**.

**Oeil de lynx(NCMax 5)** — Quand vous effectuez l’action **Garde**, si vous décidez de ne **pas** couvrir une autre créature, vous pouvez choisir une option : 
- La prochaine attaque **à distance** que vous effectuez avant la fin de la scène en cours inflige [NC × 2] dégâts supplémentaires.
- Vous pouvez immédiatement effectuer une **attaque gratuite** avec un **arc** ou une **arme à feu** dont vous êtes équipé, en considérant que votre **valeur haute** [VH] est égale à 0 pour calculer les dégâts infligés.

**Tir de Barrage(NCMax 1)** — Quand vous effectuez une attaque **à distance**, vous pouvez dépenser 10 Points de Magie pour choisir une option : l’attaque gagne la propriété **multi (2)**, ou vous ajoutez 1 au niveau de **multi** à l’attaque jusqu’à un maximum de **multi (3)**.

**Tirs croisés(NCMax 1)** — Après qu’une créature que vous voyez a réalisé une attaque **à distance**, vous pouvez dépenser un nombre de Points de Magie égal au résultat de son test de précision pour qu’elle échoue contre toutes ses cibles. Vous ne pouvez utiliser cette compétence que si vous êtes équipé d’une arme **à distance**, et elle ne fonctionne pas contre une **réussite critique** au test de précision.

---

### VOYAGEUR/VOYAGEUSE
*Ce maître explorateur est accompagné d’un fidèle compagnon.*

**Atouts gratuits:**
- Votre maximum de Points d’Inventaire augmente définitivement de 2.

**Bourlingueur(NCMax 1)** — Vous réduisez d’un cran la taille du dé lancé pour les **tests de voyage** (minimum **d6**). Si plusieurs personnages disposent de cette compétence, les effets ne se cumulent **pas**.

**Chasseur de trésors(NCMax 2)** — Quand votre groupe voyage sur la carte du monde, vous faites une **découverte** sur un résultat de [NC + 1] ou moins au **test de voyage** (au lieu de seulement 1).

**Potins de taverne(NCMax 3)** — Quand vous vous reposez dans une auberge ou une taverne, vous pouvez poser au meneur de jeu jusqu’à [NC] questions au sujet de votre environnement et des gens qui vivent là. Le meneur de jeu répond sincèrement, et vous décrivez comment vous avez rassemblé l’information.

**Ressources(NCMax 4)** — Vous récupérez [NC] Points d’Inventaire après chaque test de voyage.

**Fidèle compagnon(NCMax 5)** — Vous et votre groupe concevez ensemble un PNJ de niveau 5 et de type **bête**, **créature artificielle**, **élémentaire** ou **plante** qui devient votre compagnon.
Cette créature n’a pas de valeur d’initiative et ne gagne pas de niveau. Elle peut avoir jusqu’à deux attaques de base, bénéficie d’un bonus égal à [NC] aux tests de précision et aux tests de magie, et son maximum de Points de Vie est égal à [(NC × la taille de son dé de base de Puissance) + la moitié de votre niveau].
Votre compagnon n'a pas de tour indépendant pendant les conflits, mais vous pouvez utiliser une action pour lui faire effectuer une action (une fois par tour). Si votre compagnon est affecté par des effets liés au tour, ceux-ci sont basés sur votre tour. Votre compagnon rejoint et quitte les scènes en même temps que vous, et bénéficie des mêmes avantages pour les repos. S'il est réduit à 0 Point de Vie, votre compagnon fuit la scène et vous rejoint au début de la prochaine scène dans laquelle vous êtes présent, avec un nombre de PV égal à son score de **Crise**.

---

### Étape 3 : Répartition des Dés d'Attributs
Le joueur choisit l'un des trois profils de répartition pour ses quatre attributs (DEX, INT, PUI, VOL) :
*Profil Équilibré :* d8, d8, d8, d8
*Profil Spécialisé :* d10, d10, d6, d6
*Profil Polyvalent :* d10, d8, d8, d6
	
### Étape 4 : Calcul des Statistiques Dérivées
 Calculer les PV Max, PM Max, PI Max, l'Initiative de base, la Défense de base et la Défense Magique de base selon les formules de la section 2.3.
	
### Étape 5 : Achat de l'Équipement Initial
 Le personnage reçoit un budget de **500 Zénits** (monnaie du jeu) pour acheter ses armes initiales, armures, boucliers et accessoires.
 Mettre à jour l'Initiative, la Défense et la Défense Magique en fonction des modificateurs de l'équipement acheté et équipé.

 #### Table des équipements de base disponibles :
  
| Nom Objet | Catégorie | Prérequis | Prix | Précision ou Valeur de Défense | Dégâts ou Valeur de Défense Magique | Mots clés et Qualités | Modificateur d'Initiative |
|---|---|---|---|---|---|---|---|
| Arbalète | Arc | - | 150z | [DEX+INT] | [VH+8] | Deux mains , Distance , Aucune qualité | - |
| Arc court | Arc | - | 200z | [DEX+DEX] | [VH+8] | Deux mains , Distance , Aucune qualité | - |
| Bâton | Arcanique | - | 100z | [VOL+VOL] | [VH+6] | Deux mains , Corps à corps , Aucune qualité | - |
| Grimoire | Arcanique | - | 100z | [INT+INT] | [VH+6]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Pistolet | Arme à feu | Martial | 250z | [DEX+INT] | [VH+8]physiques | Une main , Distance , Aucune qualité | - |
| Chaîne-fouet | Articulée | - | 150z | [DEX+DEX] | [VH+8]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Dague en acier | Dague | - | 150z | [DEX+INT]+1 | [VH+4]physiques | Une main , Corps à corps , Aucune qualité | - |
| Arme improvisée (corps à corps) | Lutte | - | - | [DEX+PUI] | [VH+2]physiques | Une main , Corps à corps , Se brise après l’attaque | - |
| Coup-de-poing en fer | Lutte | - | 150z | [DEX+PUI] | [VH+6]physiques | Une main , Corps à corps , Aucune qualité | - |
| Main nue | Lutte | - | - | [DEX+PUI] | [VH+0]physiques | Une main , Corps à corps , Automatiquement équipée à chaque emplacement de main | - |
| Épée à deux mains | Épée | Martial | 200z | [DEX+PUI]+1 | [VH+10]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Épée de bronze | Épée| Martial | 200z | [DEX+PUI]+1 | [VH+6]physiques | Une main , Corps à corps , Aucune qualité | - |
| Katana | Épée | Martial | 200z | [DEX+INT]+1 | [VH+10]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Rapière | Épée | Martial | 200z | [DEX+INT]+1 | [VH+6]physiques | Une main , Corps à corps , Aucune qualité | - |
| Arme improvisée (distance) | Jet | - | - | [DEX+PUI] | [VH+2]physiques | Une main , Distance , Se brise après l’attaque | - |
| Shuriken | Jet | - | 150z | [DEX+INT] | [VH+4]physiques | Une main , Corps à corps , Aucune qualité | - |
| Lance légère | Lance | Martial | 200z | [DEX+PUI] | [VH+8]physiques | Une main , Corps à corps , Aucune qualité | - |
| Lance lourde | Lance | Martial | 200z | [DEX+PUI] | [VH+12]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Hache de guerre | Lourde | Martial | 250z | [PUI+PUI] | [VH+14]physiques | Deux mains , Corps à corps , Aucune qualité | - |
| Hache large | Lourde | Martial | 250z | [PUI+PUI] | [VH+10]physiques | Une main , Corps à corps , Aucune qualité | - |
| Marteau de fer | Lourde | - | 200z | [PUI+PUI] | [VH+6]physiques | Une main , Corps à corps , Aucune qualité | - |
| Aucune armure | Armure | - | - | Taille de dé DEX | Taille de dé INT | Aucune qualité | - |
| Chemise en soie | Armure | - | 100z | Taille de dé DEX | Taille de dé INT +2 | Aucune qualité | -1 |
| Tenue de voyage | Armure | - | 100z | Taille de dé DEX +1 | Taille de dé INT +1 | Aucune qualité | -1 |
| Tunique de combat | Armure | - | 150z | Taille de dé DEX +1 | Taille de dé INT +1 | Aucune qualité | - |
| Robe de sage | Armure | - | 200z | Taille de dé DEX +1 | Taille de dé INT +2 | Aucune qualité | -2 |
| Brigandine | Armure | Martial | 150z | 10 | Taille de dé INT | Aucune qualité | -2 |
| Plates de bronze | Armure | Martial | 200z | 11 | Taille de dé INT | Aucune qualité | -3 |
| Plates runiques | Armure | Martial | 250z | 11 | Taille de dé INT +1 | Aucune qualité | -3 |
| Plates d’acier | Armure | Martial | 300z | 12 | Taille de dé INT | Aucune qualité | -4 |
| Bouclier de bronze | Bouclier | - | 100z | 2 |  | Aucune qualité | - |
| Bouclier runique | Bouclier | Martial | 150z | 2 | 2 | Aucune qualité | - |

### Étape 6 : Lancez les dés pour les économies
Votre personnage commence la partie avec une quantité de zénits égale à 2d6 × 10. Tout ce qui vous reste après vos achats de la phase précédente s’ajoute à ces économies de base !

---

### Étape 7 : Points Fabula de départ
Chaque personnage joueur commence la partie avec 3 Points Fabula.

---

### Étape 8 : Définition du Groupe et des Liens Initiaux**
 Déterminer le type de groupe (ex: *Gardiens*, *Révolutionnaires*, *Chercheurs de Vérité*).
 *Optionel* Créer un premier Lien avec au moins un autre membre du groupe (cocher 1 sentiment initial).

---

## 4. Économie Narrative : Points Fabula et Points Ultima

L'équilibre des forces de Fabula Ultima repose sur une asymétrie de ressources narratives entre les Joueurs (Points Fabula) et le Meneur de Jeu (Points Ultima dédiés aux Méchants).

### 4.1. Les Points Fabula (Ressources Joueurs)
Chaque joueur commence la campagne avec des points Fabula et en accumule en cours de session. Un joueur ne peut jamais avoir plus de 6 Points Fabula simultanément.

#### A. Obtention des Points Fabula
Un joueur gagne un Point Fabula lorsque :
1. Si un personnage n’en a plus aucun en début de partie, il reçoit immédiatement 1 Point Fabula.
2.  Il effectue un **Échec Critique** sur un test.
3.  Un **Méchant** fait son entrée officielle dans une scène.
4.  Le personnage invoque un de ses **Liens** ou ses **Trait** pour rater automatiquement et volontairement un test (pour compliquer sa situation ou accepter un désavantage narratif).
5. Chaque fois qu’un personnage joueur tombe à 0 Point de Vie et décide de se rendre, il reçoit aussitôt 2 Points Fabula.

#### B. Utilisation des Points Fabula(PF)
Un joueur peut dépenser des points Fabula de diverses manières :
|Effet|Coût en PF|Description|
|---|---|---|
| **Invoquer un Trait** | 1 |  Après avoir réalisé son test, un personnage joueur peut dépenser 1 Point Fabula et invoquer un de ses traits pour relancer aussitôt l’un des dés ou les deux, conservant ensuite le second résultat. Il peut le faire aussi souvent qu’il le souhaite dans le cadre de la même invocation, mais chaque relance (qu’elle concerne un des dés ou les deux) coûte un autre Point Fabula. Vous ne pouvez pas invoquer de trait après un échec critique. |
| **Invoquer un Lien** | 1 |  Après avoir lancé les dés, un personnage peut dépenser 1 Point Fabula pour invoquer un lien et en ajouter l’intensité au résultat. |
| **Modifier le Récit** | 1 | Altérer un élément existant ou en ajouter un nouveau. |
| **Utiliser une compétence** | Variable |  Utiliser une compétence qui nécessite des Points Fabula. |

---

### 4.2. Les Points Ultima (Ressources Antagonistes / MJ)
Le MJ n'a pas de points génériques, mais ses antagonistes majeurs, appelés **Méchant**, disposent de **Points Ultima** en fonction de leur importance dramatique.

#### A. Classification des Méchants et Réserve d'Ultima
**Méchant Mineur :** Dispose de **5 Point Ultima**. Souvent des lieutenants locaux.
**Méchant Majeur :** Dispose de **10 Points Ultima**. Des boss de fin d'acte ou rivaux récurrents.
**Méchant Suprême :** Dispose de **15 Points Ultima**. Le grand antagoniste de la campagne.

#### B. Utilisation des Points Ultima par les Méchants
Un Méchant peut dépenser 1 Point Ultima pour effectuer l'une des actions dramatiques suivantes :
1.  **Échapper à la Mort / Fuite Narrative :** Lorsqu'un Méchant tombe à 0 PV, il peut dépenser 1 Point Ultima pour s'enfuir instantanément de la scène de combat de manière sécurisée (par téléportation, effondrement, diversion), survivant pour menacer à nouveau le groupe plus tard. *Si le Méchant n'a plus de points Ultima, il meurt définitivement ou est capturé selon le choix des joueurs.*
2.  **Invocation de trait :** Permet au Méchant de relancer ses propres dés lors d'une attaque ou d'un test manqué en invoquant un **trait**.
3.  **Récupération :** Purger instantanément toutes les altérations d'état passives qui l'affectent et récupérer 50 PM en plein combat.

## 5. Fonctionnement des Scènes de Conflits

Les conflits dans Fabula Ultima regroupent les combats, les courses-poursuites ou les scènes de tension majeure. Ils suivent un ordre séquentiel strict.

### 5.1. Structure d'une Scène de Conflit
Un conflit est découpé en **Manches (Rounds)**, elles-mêmes composées de **Tours (Turns)**.

```
[Début du Conflit] -> [1. Étape d'Initiative] -> [2. Étape de Manche] -> [3. Alternance des Tours] -> [Fin de Manche / Vérification] -> [Fin du Conflit]
```

1.  **Étape d'Initiative (Début du conflit uniquement) :**
    Les joueurs effectuent un **Jet d'Initiative de Groupe** (généralement basé sur l'Intuition + la Dextérité).
    La Difficulté (DD) est égale à la valeur d'Initiative la plus élevée parmi les PNJ présents.
    **Si réussi :** Le camp des PJ commence la manche (choisissent quel joueur ouvre le bal).
    **Si raté :** Le camp des PNJ commence la manche (le MJ choisit quel PNJ agit en premier).
2.  **Étape de Manche & Alternance :**
    Le jeu fonctionne par alternance stricte : un personnage du camp A agit, puis un personnage du camp B, et ainsi de suite.
    Si un camp a plus de participants que l'autre, une fois que le camp le moins nombreux a épuisé tous ses tours, le camp le plus nombreux joue tous ses tours restants d'affilée.
    Chaque personnage ne dispose que d'**un seul Tour par Manche** (sauf PNJ de rang Champion, voir section 4).

### 5.2. Actions Disponibles durant un Tour
Lors de son tour, un personnage (PJ ou PNJ) peut effectuer **une seule action** parmi les suivantes :

---

 **Analyse**
 Vous tentez d’obtenir une information sur quelque chose ou quelqu’un. En général, il faut pour ce faire réaliser un test ouvert d’[INT + INT].

---

**Attaque**
Vous réalisez une attaque au corps à corps ou à distance.

---

**Compétence**
Pour utiliser certaines compétences, il vous faut y consacrer une action.

---

**Équipement**
Vous échangez autant d’objets équipés que vous voulez contre d’autres, contenus dans votre sac à dos. Cette action ne s’applique pas aux armures.

---

**Garde**
Une fois par tour uniquement. Jusqu’au début de votre prochain tour : Vous bénéficiez d’une résistance contre tous les types de dégâts. Vous recevez un bonus de +2 à tous les tests opposés. Vous pouvez couvrir une autre créature et empêcher les adversaires d’effectuer des attaques de corps à corps contre elle.

---

**Gêne**
Vous effectuez un test (ND 10) contre un adversaire. En cas de réussite, vous lui infligez l’état **étourdi**, **traumatisé**, **ralenti** ou **affaibli**.

---

**Inventaire**
Vous dépensez des Points d’Inventaire pour sortir et immédiatement utiliser un objet consommable.

---

**Objectif**
Vous essayez d’atteindre un objectif spécifique au sein du conflit. L’opération nécessite un test d’attribut ou un test opposé. Les objectifs complexes nécessitent souvent un Cadran.

---

**Sort**
Vous lancez un des **sorts** que vous avez appris.

---

**Autre**
Vous réalisez une action qui n’est couverte par aucun des cas ci-dessus, en négociant sa résolution et ses effets avec le meneur de jeu.

---

### 5.3. Fin du Conflit et Conséquences du Zéro PV
Un conflit se termine lorsque tous les membres d'un camp sont hors de combat (0 PV) ou ont fui.
**Quand un PJ tombe à 0 PV :** Il doit choisir entre deux options mécaniques :
    1.  **Le Sacrifice :** Le PJ meurt définitivement, mais accompli un exploit narratif majeur (gagne automatiquement le combat pour son groupe, détruit un artefact, sauve tout le monde). Cette option est réservée aux moments clés.
    2.  **La Défaite (Hors de Combat) :** Le PJ survit mais s'évanouit ou est capturé. Le MJ prend le contrôle de la narration pour appliquer une conséquence négative (perte d'équipement, fuite du méchant, capture).

---

## 6. Spécifications Fonctionnelles des Feuilles de PNJ

Les PNJ (Monstres, Soldats, Rivaux) possèdent une structure simplifiée par rapport aux PJ, optimisée pour la gestion rapide par le MJ.

### 6.1. Structure des Données de Base
La feuille d'un PNJ doit obligatoirement comporter :
**Nom et Niveau :** Le niveau détermine la puissance globale (de 1 à 60+).
**Espèce :** Catégorisation obligatoire (Bête, Démon, Construct, Élémentaire, Humanoïde, Monstre, Plante, Mort-vivant). Certaines compétences et magies ont des effets spécifiques selon l'espèce.
**Rang :** Détermine le multiplicateur de statistiques et l'économie d'actions :
    *Soldat :* PNJ standard. 1 tour par manche.
    *Élite :* Compte comme deux PNJ. PV et PM doublés. 1 tour par manche mais dispose de plus de compétences.
    *Champion (Nx) :* Compte comme 'x' PNJ (Champion 2, Champion 3, etc.). Ses PV sont multipliés par 'x'. Il gagne **'x' Tours par Manche**, répartis équitablement dans l'ordre d'initiative.

### 6.2. Attributs et Statistiques Dérivées
Les quatre attributs de base sont mesurés en tailles de dés (**d6, d8, d10, d12**) :
**Dextérité (DEX)**
**Intuition (INT)**
**Puissance(PUI)**
**Volonté (VOL)**

**Calculs Automatisés des PNJ :**
**Points de Vie (PV) :** `[Vigueur * 5] + Niveau + (Bonus de Rang)`
**Points de Magie (PM) :** `[Volonté * 5] + Niveau + (Bonus de Rang si Élite/Champion)`
**Défense (DEF) :** Valeur fixe dérivée (généralement `DEX de base + armure`).
**Défense Magique (M.DEF) :** Valeur fixe dérivée (généralement `INT de base + modificateur`).
**Initiative :** Valeur fixe utilisée pour déterminer la difficulté du jet d'initiative global. Calculée via `[DEX + INT] / 2` + modificateurs d'équipement.

### 6.3. Matrice des Affinités Élémentaires
Chaque PNJ possède un profil de résistance pour les 9 types de dégâts (Physique, Feu, Glace, Foudre, Terre, Air, Lumière, Ombre, Poison). Le système doit gérer 5 états d'affinité :
1.  **Vulnérabilité (VU) :** Subit le double des dégâts.
2.  **Neutre :** Subit les dégâts normalement.
3.  **Résistance (RE) :** Subit la moitié des dégâts (arrondi à l'inférieur).
4.  **Immunité (IM) :** Subit 0 dégât.
5.  **Absorption (AB) :** Soigne le PNJ d'un montant égal aux dégâts infligés.

### 6.4. Bloc d'Actions et Équipement
Le PNJ dispose d'une liste d'actions pré-calculées :
* **Attaques de Base :** Liste le nom, les attributs utilisés (ex: `[DEX + VIG]`), le bonus de précision, le type de dégâts et la valeur fixe ajoutée au HR.
* **Sorts et Capacités Spéciales :** Coût en PM, description textuelle de l'effet, jets requis si applicable.

---

## 7. Fonctionnement du Système de Cadrans (Clocks)

Les Cadrans sont des outils visuels circulaires segmentés servant à suivre l'évolution d'une situation complexe, d'une menace imminente ou d'un objectif à long terme.

### 7.1. Typologie et Configuration
Un cadran est défini par :
**Un Titre/Objectif :** (Ex: "Inondation de la salle", "Fuite du Général", "Décryptage du grimoire").
**Une Taille (Nombre de Sections) :** Doit être un nombre pair, généralement **4, 6, 8, 10 ou 12 sections**. Plus le nombre est élevé, plus l'objectif requiert du temps ou des efforts.
**Un Sens d'Origine :** Remplissage (commence vide, se remplit vers le danger/succès) ou Compte à rebours (commence plein, se vide).

### 7.2. Règles d'Interaction Mécanique
Les sections d'un cadran sont modifiées par les actions des PJ et des PNJ :
**Via l'Action "Objectif" :** Un personnage réussit un jet d'attribut adapté à la situation contre une difficulté fixée par le MJ.
    *Succès standard :* Coche 1 section du cadran.
    *Succès critique / Grande Réussite :* Peut cocher 2 sections ou plus selon l'appréciation du MJ.
**Via les Opportunités (Double aux dés) :** Un joueur peut dépenser une opportunité lors de n'importe quel jet pour cocher ou décocher **1 section** d'un cadran actif dans la scène.
**Via les Actions de Scénario :** À la fin de chaque manche ou lors du déclenchement d'une capacité spécifique d'un PNJ, le MJ peut faire progresser un cadran automatiquement d'un nombre fixe de sections.

### 7.3. Déclenchement et Résolution
Dès que la dernière section d'un cadran est cochée (ou vidée si compte à rebours) :
**Interruption Immédiate :** L'effet associé au cadran se déclenche instantanément, gelant temporairement l'action en cours si nécessaire.
**Types d'Effets Applicables :**
    *Cadrans de Menace :* Arrivée de renforts ennemis, effondrement du décor, application d'un statut négatif global.
    *Cadrans d'Objectif :* Victoire alternative (les ennemis s'enfuient), ouverture d'une porte scellée, neutralisation d'un piège complexe.
Une fois résolu, le cadran est archivé et retiré de l'interface active du conflit.

---

## 8. Système d'Équipement

Le système d'équipement de Fabula Ultima permet d'améliorer les capacités offensives et défensives des personnages. L'équipement se divise en quatre grandes catégories : les Armes, les Armures, les Boucliers et les Accessoires.

### 8.1. Règles d'Équipement et Emplacements
Un personnage possède un nombre limité d'emplacements pour s'équiper :
**Les Mains :** Un personnage dispose de deux mains. Il peut s'équiper d'une arme à deux mains, de deux armes à une main (s'il possède les compétences adéquates), ou d'une arme à une main et d'un bouclier.
**L'Armure :** Un personnage ne peut porter qu'une seule armure à la fois.
**L'Accessoire :** Un personnage ne peut s'équiper que d'un seul accessoire à la fois.
**Changement d'équipement :** En combat, un personnage peut utiliser l'action **Équipement** pour modifier les armes, boucliers et accessoires qu'il a en main (à l'exception des armures qui ne peuvent pas être changées pendant un conflit).

### 8.2. Prérequis Martial
Certains équipements de haute qualité ou très lourds portent le mot-clé **Martial**.
**Restriction :** Un personnage ne peut s'équiper d'un objet Martial (arme de mêlée, arme à distance, armure ou bouclier) que si l'une de ses Classes lui octroie explicitement la maîtrise de cette catégorie d'équipement martial.

### 8.3. Structure d'un équipement
Tout équipement possède les caractéristiques suivante :
**Nom :** Nom de l'objet.
**Coût :** Valeur de l'objet en Zénits.
**Type :** Si c'est une arme, une armure, un bouclier ou un accessoire.
**Rareté :** Il peux être considéré comme de base ou rare.
**Qualité :** Description de l'effet de l'équipement.

#### A. Les Armes
Chaque arme est définie par un profil technique précis qui modifie les jets de combat :
**Catégorie :** Détermine le type de l'arme et ses interactions avec certaines compétences de classe.
**Formule de Précision :** Les deux attributs à lancer pour le test d'attaque (ex: `[DEX + PUI]`). Certaines armes ajoutent un modificateur fixe à ce jet (ex: `+1`).
**Formule de Dégâts :** La quantité de dégâts infligés en cas de succès, généralement calculée à partir de la Valeur Haute (VH) des dés lancés pour la précision, additionnée d'une valeur fixe (ex: `[VH + 8]`).
**Type de Dégâts :** Physique, Feu, Glace, Foudre, Air, Terre, Lumière, ou Ténèbres.
**Mots-clés :** Indique si l'arme est à **Une main** ou **Deux mains**, et si elle s'utilise au **Corps à corps** ou **À distance**.

#### B. Armures et Boucliers
L'équipement défensif remplace ou modifie les scores de base de Défense (DEF) et de Défense Magique (DEF.M) d'un personnage :
**Armures légères :** Basées sur l'agilité. Elles utilisent généralement la `Taille de dé DEX` pour la DEF et la `Taille de dé INT` pour la DEF.M, parfois avec un bonus fixe (ex: `Taille de dé DEX + 1`).
**Armures lourdes :** Conçues pour encaisser, elles fixent la DEF à un score statique (ex: `10`, `11` ou `12`) et ignorent l'attribut de Dextérité, mais appliquent souvent un malus à l'Initiative (ex: `-2` ou `-3`).
**Boucliers :** S'équipent dans une main libre. Ils ajoutent un bonus fixe à la DEF et parfois à la DEF.M (ex: `+2 DEF`).

#### C. Accessoires et Objets Magiques
Les accessoires (bagues, amulettes, capes) n'ont aucun prérequis martial et n'affectent pas l'Initiative.
**Utilité :** Ils confèrent généralement des capacités passives puissantes, telles que des résistances à des types de dégâts spécifiques, des immunités à certaines altérations d'état, ou des augmentations de Points de Vie / Points de Magie.

---

## 9. Récapitulatif Exhaustif des Paramètres de Jeu

| Catégorie | Paramètre | Valeurs / Éléments | Mécanique / Règle associée |
| :--- | :--- | :--- | :--- |
| **Attributs** | Dextérité (DEX), Intuition (INT), Puissance (PUI), Volonté (VOL) | d6, d8, d10, d12 | Combinés par paires (ex: `[DEX + PUI]`) pour former la base des tests. |
| **Résolution des Actions** | Test d'Attribut | Résultat = (Dé 1 + Dé 2) + Modificateurs | Doit être supérieur ou égal au Niveau de Difficulté (ND) pour réussir. |
| **Niveaux de Difficulté (ND)** | Seuil de réussite | 7 (Facile), 10 (Normale), 13 (Difficile), 16 (Très Difficile) | Bonus/Malus de positionnement de +2 ou -2 applicable par le MJ. |
| **Résultats Spéciaux** | Valeur Haute (VH), Succès Critique, Échec Critique | VH : Dé le plus élevé. Critique : Double ≥ 6. Échec : Double 1 (`1` et `1`). | VH : Sert au calcul des dégâts/soins. Critique : Réussite auto + 1 Aubaine. Échec : Échec auto + Gain de 1 PF. |
| **Statistiques Dérivées** | PV, PM, PI, INIT, DEF, DEF.M, Seuil de Crise | Dépendent de la taille des dés d'attributs, du niveau et de l'équipement. | Crise = Moitié des PV max (arrondi inférieur), déclenche des effets de classe. |
| **Altérations d'États** | Étourdi, Enragé, Ralenti, Traumatisé, Affaibli, Empoisonné | Réduit la taille du ou des dés d'attributs d'un cran (minimum `d6`). | Étourdi (INT), Enragé (DEX/INT), Ralenti (DEX), Traumatisé (VOL), Affaibli (PUI), Empoisonné (PUI/VOL). |
| **Types de Dégâts** | 9 Éléments | Physique, Feu, Glace, Foudre, Air, Terre, Lumière, Ténèbres, Poison | Interagissent directement avec les vulnérabilités et résistances de la cible. |
| **Affinités Élémentaires** | Vulnérabilité (VU), Neutre, Résistance (RE), Immunité (IM), Absorption (AB) | VU : x2 dégâts. Neutre : Dégâts normaux. RE : x0.5 dégâts. IM : 0 dégât. AB : Soigne des dégâts | Matrice définissant comment une créature réagit à un type de dégât reçu. |
| **Économie Narrative** | Points Fabula (PF) et Points Ultima (PU) | Joueurs (PF) : max 6. Méchants (PU) : Mineur (5), Majeur (10), Suprême (15). | PF : Modifier le récit, invoquer un lien/trait, relancer des dés. PU : Fuite narrative, récupération (PM/états), relance. |
| **Actions de Conflit** | 1 Action par Tour | Analyse, Attaque, Compétence, Équipement, Garde, Gêne, Inventaire, Objectif, Sort, Autre. | Alternance stricte entre camp PJ et PNJ. Une manche = Un tour par participant (sauf Élite et Champions). |
| **Cadrans (Clocks)** | Suivi de situation complexe | 4, 6, 8, 10 ou 12 sections. | Mesure la progression d'un objectif ou d'une menace. Avance via l'action Objectif, les aubaines ou par le MJ. |
| **Système de Liens** | Sentiments | Maximum 6 liens simultanés. Intensité de 1 à 3 par lien. | Sentiments : Admiration/Infériorité, Loyauté/Méfiance, Affection/Haine. Permet d'ajouter son intensité au jet contre 1 PF. |
| **Rangs des PNJ** | Puissance et Économie d'action | Soldat, Élite, Champion | Soldat : 1 tour. Élite : 2 tour, PV/PM doublés. Champion (Nx) : x tours par manche, PV multipliés par x. x étant le nombres de personnage joueur. |
| **Équipement** | 4 Emplacements | 2 Mains (Arme/Bouclier), 1 Armure, 1 Accessoire | Certains équipements nécessitent un prérequis **Martial** débloqué par les classes du personnage. |