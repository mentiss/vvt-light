// src/client/src/systems/fabula/config/classes.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue statique des 15 classes officielles de Fabula Ultima.
// Traitement "carte descriptive" : nom, NCMax, texte d'effet affiché tel quel.
// Aucune automatisation mécanique des effets — cohérent avec le traitement
// des talents Achtung! Cthulhu.
//
// Les compétences qui donnent accès à une liste de sorts (learnsSpell: true)
// référencent une spellList définie dans spells.js (fichier séparé, à venir).
// La compétence "Lier et invoquer" de l'Arcaniste référence de la même façon
// la table des Arcana, définie dans arcana.js (fichier séparé, à venir).
// ─────────────────────────────────────────────────────────────────────────────

export const CLASSES = {

    arcaniste: {
        nom: 'Arcaniste',
        tagline: 'Invoque les avatars magiques d\'anciennes entités quasi divines.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
        ],
        competences: [
            {
                key: 'arcanisme_rituel', nom: 'Arcanisme rituel', ncMax: 1,
                description: 'Vous pouvez réaliser des rituels de la discipline Arcanisme tant que leurs effets relèvent des domaines d\'un ou plusieurs Arcana que vous avez liés. Le test de magie des rituels d\'arcanisme utilise [VOL + VOL].',
            },
            {
                key: 'arcanum_urgence', nom: 'Arcanum d\'urgence', ncMax: 6,
                description: 'Tant que vous êtes en Crise, le coût d\'invocation de vos Arcana diminue de [NC × 5] Points de Magie.',
            },
            {
                key: 'cercle_arcanique', nom: 'Cercle arcanique', ncMax: 4,
                description: 'Après avoir volontairement renvoyé un Arcanum durant votre tour de jeu lors d\'un conflit, si l\'Arcanum en question n\'avait pas été invoqué au même tour et si vous êtes équipé d\'une arme arcanique, vous pouvez aussitôt réaliser gratuitement l\'action sort. Le coût du sort que vous lancez de la sorte doit être inférieur ou égal à [NC × 5] Points de Magie (et vous devez toujours le payer).',
            },
            {
                key: 'regeneration_arcanique', nom: 'Régénération arcanique', ncMax: 2,
                description: 'Quand vous invoquez un Arcanum, vous récupérez aussitôt [NC × 5] Points de Vie.',
            },
            {
                key: 'lier_invoquer', nom: 'Lier et invoquer', ncMax: 1,
                description: 'Vous pouvez lier les Arcana à votre âme et les invoquer plus tard. Le meneur de jeu vous expliquera les détails de chaque processus visant à lier un Arcanum chaque fois que vous le rencontrez pour la première fois. Si vous prenez cette compétence à la création de personnage, vous commencez la partie avec un Arcanum de votre choix déjà lié. Vous pouvez utiliser une action et dépenser 40 Points de Magie pour invoquer un Arcanum que vous avez lié (fusion). Un Arcanum peut être renvoyé volontairement (hors action, à votre tour) ou automatiquement (fin de scène, mort/inconscience, changement de scène) ; le renvoi volontaire seul déclenche l\'effet de renvoi.',
                hasArcanaTable: true, arcanaList: 'arcaniste',
            },
        ],
    },

    bricoleur: {
        nom: 'Bricoleur/Bricoleuse',
        tagline: 'Fabrique des inventions et utilise les Points d\'Inventaire de manière innovante.',
        atouts: [
            { type: 'pi', valeur: 2, label: 'Votre maximum de Points d\'Inventaire augmente définitivement de 2.' },
            { type: 'narratif', label: 'Vous pouvez démarrer des projets.' },
        ],
        competences: [
            {
                key: 'accessoire_urgence', nom: 'Accessoire d\'urgence', ncMax: 1,
                description: 'Une fois par scène de conflit, si vous êtes en Crise, vous pouvez effectuer une action supplémentaire à votre tour de jeu. Il s\'agit forcément de l\'action Inventaire.',
            },
            {
                key: 'formule_secrete', nom: 'Formule secrète', ncMax: 5,
                description: 'Lorsque vous créez une potion ou une magisphère dont les effets restaurent des PV et/ou des PM, la quantité restaurée augmente de [NC × 5]. Lorsque vous créez un fragment élémentaire, une potion ou une magisphère qui inflige des dégâts, cet objet inflige [NC] dégâts supplémentaires.',
            },
            {
                key: 'pluie_potions', nom: 'Pluie de potions', ncMax: 2,
                description: 'Lorsque vous créez une potion restaurant les PV et/ou PM d\'une seule créature, vous pouvez étendre ses effets à [NC] créatures supplémentaires. Dans ce cas, elle ne restaure que la moitié des PV et PM normaux pour chaque créature.',
            },
            {
                key: 'visionnaire', nom: 'Visionnaire', ncMax: 5,
                description: 'Quand vous travaillez sur un projet, jusqu\'à [NC × 100] zénits de coût de matériaux sont automatiquement payés. En outre, vous générez [NC] Points de Progression en plus chaque jour. Si plusieurs personnages dotés de cette compétence travaillent sur le même projet, les effets se cumulent.',
            },
            {
                key: 'gadgets', nom: 'Gadgets', ncMax: 5,
                description: `Quand vous obtenez cette compétence pour la première fois, choisissez un type de gadget : alchimie, inoculation ou technomagie. Vous recevez ses atouts de base. Chaque fois que vous reprenez cette compétence, choisissez : atouts de base d'un nouveau type, ou atouts avancés d'un type déjà possédé en base, ou atouts supérieurs d'un type déjà possédé en avancé.

ALCHIMIE — Action Inventaire pour confectionner une potion aux effets puissants mais imprévisibles.
Mélanges : De base (3 PI, lancez 2d20), Avancé (4 PI, lancez 3d20), Supérieur (5 PI, lancez 4d20) — affectez un dé à la cible, un à l'effet.
Table de cibles : 1-6 vous/allié · 7-11 un ennemi · 12-16 vous + tous alliés · 17-20 tous les ennemis.
Table d'effets (extrait) : dégâts de poison, soin 30 PV, dé +1 cran sur DEX/PUI ou INT/VOL, dégâts élémentaires (air/foudre/ténèbres/terre/feu/glace), résistances temporaires, état enragé/empoisonné/multiple, soin PV/PM massif selon le résultat (1 à 20).

INOCULATION — Quand une attaque touche, dépensez 2 PI pour appliquer un effet supplémentaire (une seule inoculation par attaque) :
De base : Cryo/Pyro/Volt (+5 dégâts, type glace/feu/foudre).
Avancées : Cyclone/Exorcisme/Séisme/Ombre (+5 dégâts, type air/lumière/terre/ténèbres).
Supérieures : Vampire (vol de PV ou PM à hauteur de la moitié des dégâts infligés, cible unique), Venin (+5 dégâts type poison + état empoisonné).

TECHNOMAGIE :
- Prise de contrôle technomagique (base) : action + 10 PM, test opposé [INT+INT] contre une créature artificielle rang soldat proche visible — prise de contrôle jusqu'à la fin de la scène (libérée si blessée par vous/un allié).
- Magicanon (avancé) : action Inventaire + 3 PI pour créer une arme à feu (Précision [DEX+INT]+1, Dégâts [VH+10], Deux mains/Distance/Aucune qualité, type de dégâts au choix : air/foudre/terre/feu/glace/physiques). Se détruit à la création d'un nouveau magicanon.
- Magisphère (supérieur) : 3 prototypes de sorts choisis parmi Élémentaliste/Entropiste/Spirite (2 de plus au niveau 20, 2 de plus au niveau 40). Action Inventaire + 2 PI pour créer une magisphère et lancer gratuitement l'un des sorts prototypés (coût PM et test de magie normaux) ; la magisphère est détruite après usage.`,
            },
        ],
    },

    chimeriste: {
        nom: 'Chimériste',
        tagline: 'Apprend les sorts des créatures et parle avec les animaux.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Ritualisme.' },
        ],
        competences: [
            {
                key: 'chimerisme_rituel', nom: 'Chimérisme rituel', ncMax: 1,
                description: 'Vous pouvez réaliser des rituels de la discipline Chimérisme. Lorsque vous obtenez cette compétence, choisissez [INT + VOL] ou [PUI + VOL] : vous utilisez ces attributs pour le test de magie de vos rituels de Chimérisme.',
            },
            {
                key: 'consommation', nom: 'Consommation', ncMax: 5,
                description: 'Après avoir infligé des dégâts à une ou plusieurs créatures au moyen d\'un sort, si vous êtes équipé d\'une arme de type arcanique, dague ou articulée, vous récupérez [NC × 2] Points de Magie.',
            },
            {
                key: 'imitation_sort', nom: 'Imitation de sort', ncMax: 10,
                description: 'Quand vous voyez une créature de type bête, monstre ou plante lancer un sort, vous pouvez immédiatement l\'apprendre sous forme de sort de Chimériste (notez son espèce). Choisissez [INT + VOL] ou [PUI + VOL] pour le test de magie de vos sorts offensifs de Chimériste. Vous pouvez mémoriser jusqu\'à [NC + 2] sorts de cette façon ; au-delà, vous devez en oublier un pour en apprendre un nouveau.',
                learnsSpell: true, spellList: 'chimeriste', spellSource: 'appris en jeu',
            },
            {
                key: 'langue_betes', nom: 'Langue des Bêtes', ncMax: 1,
                description: 'Vous pouvez communiquer avec les créatures appartenant aux types bête, monstre et plante.',
            },
            {
                key: 'pathogenese', nom: 'Pathogenèse', ncMax: 1,
                description: 'Quand vous infligez des dégâts à une ou plusieurs créatures avec un de vos sorts de Chimériste, chacune de ces créatures dont l\'espèce est la même que celle dont vous avez appris ce sort reçoit l\'état empoisonné.',
            },
        ],
    },

    elementaliste: {
        nom: 'Élémentaliste',
        tagline: 'Manie le pouvoir destructeur des éléments.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Ritualisme.' },
        ],
        competences: [
            {
                key: 'artillerie_magique', nom: 'Artillerie magique', ncMax: 3,
                description: 'Quand vous lancez un sort offensif en étant équipé d\'une arme arcanique, vous bénéficiez d\'un bonus égal à [NC × 2] au test de magie.',
            },
            {
                key: 'cataclysme', nom: 'Cataclysme', ncMax: 3,
                description: 'Quand vous lancez un sort de durée instantanée, si vous êtes équipé d\'une arme arcanique, vous pouvez accroître le coût total en PM du sort d\'un maximum de [NC × 10] Points de Magie. S\'il inflige des dégâts, ceux-ci augmentent pour chaque cible de 5 par tranche de 10 PM supplémentaires dépensés.',
            },
            {
                key: 'elementalisme_rituel', nom: 'Élémentalisme rituel', ncMax: 1,
                description: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Élémentalisme. Le test de magie utilise [INT + VOL].',
            },
            {
                key: 'sorcelame', nom: 'Sorcelame', ncMax: 4,
                description: 'Quand vous lancez un sort offensif visant une seule créature en étant équipé d\'une arme arme/lutte/dague/articulé/lance/épée, si le coût total en PM du sort est inférieur ou égal à [NC × 10], vous pouvez utiliser la formule de précision de l\'arme pour le test de magie.',
            },
            {
                key: 'magie_elementaire', nom: 'Magie élémentaire', ncMax: 10,
                description: 'Chaque fois que vous acquérez cette compétence, apprenez un sort d\'Élémentaliste. Le test des sorts offensifs utilise [INT + VOL].',
                learnsSpell: true, spellList: 'elementaliste',
            },
        ],
    },

    entropiste: {
        nom: 'Entropiste',
        tagline: 'Canalise l\'énergie obscure du Cosmos.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Ritualisme.' },
        ],
        competences: [
            {
                key: 'absorption_pm', nom: 'Absorption de PM', ncMax: 5,
                description: 'Après avoir subi des dégâts, vous pouvez immédiatement récupérer [NC × 2] Points de Magie.',
            },
            {
                key: 'entropisme_rituel', nom: 'Entropisme rituel', ncMax: 1,
                description: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Entropisme. Le test de magie utilise [INT + VOL].',
            },
            {
                key: 'nombre_porte_bonheur', nom: 'Nombre Porte-Bonheur', ncMax: 1,
                description: 'Vous avez un nombre porte-bonheur (7 au début de chaque séance). Une fois par scène, après un test, vous pouvez remplacer le résultat d\'un des dés lancés par ce nombre (même hors plage normale du dé). Le résultat remplacé devient votre nouveau nombre porte-bonheur.',
            },
            {
                key: 'temps_derobe', nom: 'Temps dérobé', ncMax: 4,
                description: 'Pendant un conflit, utilisez une action pour dépenser jusqu\'à [NC × 5] PM. Pour chaque tranche de 5 PM : infligez/retirez l\'état ralenti à une créature vue, ou accordez une action Équipement gratuite, ou faites jouer un allié n\'ayant pas encore agi ce round juste après vous. Chaque option une seule fois par utilisation.',
            },
            {
                key: 'magie_entropiste', nom: 'Magie Entropiste', ncMax: 10,
                description: 'Chaque fois que vous obtenez cette compétence, apprenez un sort d\'Entropiste. Le test des sorts offensifs utilise [INT + VOL].',
                learnsSpell: true, spellList: 'entropiste',
            },
        ],
    },

    furie: {
        nom: 'Furie',
        tagline: 'Provoque les ennemis et frappe plus fort après avoir subi des dégâts.',
        atouts: [
            { type: 'pv', valeur: 5, label: 'Votre maximum de Points de Vie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous recevez la capacité de vous équiper d\'armes martiales de corps à corps et d\'armures martiales.' },
        ],
        competences: [
            {
                key: 'adrenaline', nom: 'Adrénaline', ncMax: 5,
                description: 'Tant que vous êtes en Crise, vous infligez [NC × 2] dégâts supplémentaires (attaques, sorts, Arcana, objets ou autres méthodes).',
            },
            {
                key: 'ame_indomptable', nom: 'Âme indomptable', ncMax: 4,
                description: 'Quand vous dépensez au moins 1 Point Fabula, vous recevez un avantage supplémentaire au choix : récupérez [NC × 5] PV, ou [NC × 5] PM, ou débarrassez-vous d\'un état de votre choix.',
            },
            {
                key: 'encaisser', nom: 'Encaisser', ncMax: 5,
                description: 'Quand vous effectuez l\'action Garde sans couvrir une autre créature, récupérez [NC × plus haute intensité de vos liens] PV, et choisissez PUI ou VOL : taille de dé supérieure d\'un cran (max d12) jusqu\'à la fin de votre prochain tour.',
            },
            {
                key: 'frenesie', nom: 'Frénésie', ncMax: 1,
                description: 'Vos tests de précision avec armes lutte/dague/articulé/jet déclenchent une réussite critique dès que les deux dés affichent le même résultat (hors échec critique).',
            },
            {
                key: 'provocation', nom: 'Provocation', ncMax: 5,
                description: 'Action + 5 PM pour un test opposé [PUI + VOL] contre une créature visible : en cas de réussite, elle subit l\'état enragé et doit vous cibler prioritairement. Bonus égal au [NC] sur ce test.',
            },
        ],
    },

    gardien: {
        nom: 'Gardien/Gardienne',
        tagline: 'Protège ses alliés et combat vêtu d\'une armure lourde.',
        atouts: [
            { type: 'pv', valeur: 5, label: 'Votre maximum de Points de Vie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous recevez la capacité de vous équiper d\'armures martiales et de boucliers martiaux.' },
        ],
        competences: [
            {
                key: 'forteresse', nom: 'Forteresse', ncMax: 5,
                description: 'Votre maximum de Points de Vie augmente définitivement de [NC × 3].',
            },
            {
                key: 'garde_du_corps', nom: 'Garde du corps', ncMax: 1,
                description: 'Si vous réalisez l\'action Garde et choisissez de couvrir une autre créature, celle-ci bénéficie d\'une résistance à tous les types de dégâts jusqu\'au début de votre prochain tour.',
            },
            {
                key: 'maitrise_defensive', nom: 'Maîtrise défensive', ncMax: 5,
                description: 'Tant que vous êtes équipé d\'un bouclier ou d\'une armure martiale, tous les dégâts subis sont réduits de [NC] (avant application des affinités).',
            },
            {
                key: 'protection', nom: 'Protection', ncMax: 1,
                description: 'Lorsqu\'une autre créature est menacée par une attaque, un sort ou un danger, vous pouvez prendre sa place (les tests sont effectués contre vous). Vous ne pouvez protéger qu\'une créature à la fois contre le même danger. Une seule utilisation par round en conflit.',
            },
            {
                key: 'boucliers_doubles', nom: 'Boucliers doubles', ncMax: 1,
                description: 'Vous pouvez vous équiper d\'un bouclier dans votre emplacement de main directrice. Avec deux boucliers équipés, vous bénéficiez des effets des deux et pouvez les traiter comme une arme de lutte à deux mains combinée : Boucliers jumeaux — Précision [PUI+PUI], Dégâts [VH+5] physiques + [NC en Maîtrise défensive] dégâts supplémentaires.',
            },
        ],
    },

    maitre_armes: {
        nom: 'Maître d\'Armes',
        tagline: 'Excelle au corps à corps, qu\'il s\'agisse de se battre ou de contrer les attaques.',
        atouts: [
            { type: 'pv', valeur: 5, label: 'Votre maximum de Points de Vie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous recevez la capacité de vous équiper d\'armes martiales de corps à corps et de boucliers martiaux.' },
        ],
        competences: [
            {
                key: 'breche', nom: 'Brèche', ncMax: 3,
                description: 'Action + 5 PM pour une attaque gratuite corps à corps sur une seule créature : en cas de réussite, pas de dégâts mais choisissez — détruire un bouclier équipé, détruire l\'armure équipée, ou infliger [NC × 2] dégâts supplémentaires à la prochaine source de dégâts subie par la cible avant votre prochain tour.',
            },
            {
                key: 'broyage', nom: 'Broyage', ncMax: 4,
                description: 'Quand une attaque de corps à corps touche et inflige des dégâts, vous pouvez y renoncer pour infliger à la place : état étourdi, ou état affaibli, ou perte de [NC × 10] PM à chaque cible touchée.',
            },
            {
                key: 'contre_attaque', nom: 'Contre-attaque', ncMax: 1,
                description: 'Après qu\'un ennemi vous touche ou vous rate avec une attaque de corps à corps dont le test de précision était un nombre pair, vous pouvez réaliser une attaque gratuite de corps à corps contre lui après résolution de la sienne (VH traitée comme 0 pour vos dégâts).',
            },
            {
                key: 'maitrise_armes_cac', nom: 'Maîtrise des armes de corps à corps', ncMax: 4,
                description: 'Bonus de [NC] à tous les tests de précision effectués avec des armes de corps à corps.',
            },
            {
                key: 'tempete_acier', nom: 'Tempête d\'acier', ncMax: 1,
                description: 'Sur une attaque de corps à corps, dépensez 10 PM pour choisir : l\'attaque gagne la propriété multi (2), ou +1 au niveau de multi jusqu\'à multi (3) maximum.',
            },
        ],
    },

    maitre_erudit: {
        nom: 'Maître Érudit',
        tagline: 'Ce puits de savoir soutient ses alliés.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
        ],
        competences: [
            {
                key: 'concentration', nom: 'Concentration', ncMax: 5,
                description: 'Votre maximum de PM augmente définitivement de [NC × 3]. Sur un test ouvert d\'[INT + INT], bonus égal à [NC] au résultat (uniquement tests ouverts).',
            },
            {
                key: 'eclair_genie', nom: 'Éclair de génie', ncMax: 3,
                description: 'Quand vous obtenez 13 ou plus sur un test d\'enquête (créature/objet/lieu, y compris l\'action Analyse), posez au MJ jusqu\'à [NC] questions sur le sujet, immédiatement ou plus tard. Une seule utilisation par créature/objet/lieu.',
            },
            {
                key: 'estimation_rapide', nom: 'Estimation rapide', ncMax: 6,
                description: 'Au début d\'un conflit, dépensez jusqu\'à [NC × 5] PM. Pour chaque tranche de 5 PM : révélez un trait d\'une créature visible, ou révélez son affinité envers un type de dégâts choisi.',
            },
            {
                key: 'savoir_pouvoir', nom: 'Le savoir, c\'est le pouvoir', ncMax: 1,
                description: 'Quand vous effectuez un test de précision, vous pouvez remplacer un des dés d\'attribut par Intuition.',
            },
            {
                key: 'memoire_exercee', nom: 'Mémoire exercée', ncMax: 1,
                description: 'Vous vous rappelez parfaitement tout lieu visité durant la semaine passée et pouvez y enquêter à nouveau mentalement ; Éclair de génie s\'applique aussi à ces souvenirs.',
            },
        ],
    },

    orateur: {
        nom: 'Orateur/Oratrice',
        tagline: 'Gagne des alliés et influence les conflits par le verbe.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
        ],
        competences: [
            {
                key: 'allie_inattendu', nom: 'Allié inattendu', ncMax: 1,
                description: 'Action + 1 Point Fabula pour qu\'une créature non hostile capable de vous entendre vous aide, tant que vous restez bienveillant et vos demandes raisonnables.',
            },
            {
                key: 'condamnation', nom: 'Condamnation', ncMax: 4,
                description: 'Action + 5 PM pour un test opposé [INT + VOL] contre une créature qui vous comprend : en cas de réussite, elle perd [NC × 10] PM et subit étourdi ou traumatisé (au choix). Bonus égal au [NC] sur ce test.',
            },
            {
                key: 'encouragement', nom: 'Encouragement', ncMax: 6,
                description: 'En conflit, action + 5 PM pour qu\'une créature qui vous comprend récupère [NC × 5] PV et choisisse un attribut dont la taille de dé augmente d\'un cran (max d12) jusqu\'au début de votre prochain tour.',
            },
            {
                key: 'confiance_en_toi', nom: 'J\'ai confiance en toi', ncMax: 2,
                description: 'Après qu\'un PJ qui vous entend a effectué un test, dépensez 1 Point Fabula et invoquez un de ses traits ou liens pour relance/amélioration de son résultat. Si vous avez un lien avec lui, il récupère [NC × 10] PM.',
            },
            {
                key: 'persuasion', nom: 'Persuasion', ncMax: 2,
                description: 'Sur un test réussi pour remplir/effacer des sections d\'un Cadran par charme/diplomatie/tromperie/intimidation, dépensez jusqu\'à [NC × 20] PM pour remplir/effacer une section supplémentaire par tranche de 20 PM.',
            },
        ],
    },

    roublard: {
        nom: 'Roublard/Roublarde',
        tagline: 'Saisit les occasions et vole des objets uniques à ses ennemis.',
        atouts: [
            { type: 'pi', valeur: 2, label: 'Votre maximum de Points d\'Inventaire augmente définitivement de 2.' },
        ],
        competences: [
            {
                key: 'a_plus_tard', nom: 'À plus tard !', ncMax: 1,
                description: 'Action + 1 Point Fabula pour disparaître de la scène et réapparaître dans une scène différente où un autre PJ est présent.',
            },
            {
                key: 'coup_bas', nom: 'Coup bas', ncMax: 5,
                description: 'Quand une attaque visant une seule créature déjà sous au moins un état la touche, infligez des dégâts supplémentaires égaux à [NC + nombre d\'états subis par la cible].',
            },
            {
                key: 'esquive', nom: 'Esquive', ncMax: 3,
                description: 'Tant que vous n\'êtes équipé ni de bouclier ni d\'armure martiale, [NC] s\'ajoute à votre Défense.',
            },
            {
                key: 'vivacite', nom: 'Vivacité', ncMax: 3,
                description: 'Au début d\'un conflit, dépensez 10 PM pour effectuer avant le premier round une attaque gratuite ou une action Gêne/Objectif, avec bonus égal à [NC] sur les tests liés.',
            },
            {
                key: 'vol_spirituel', nom: 'Vol spirituel', ncMax: 5,
                description: 'Action pour un test [DEX + VOL] contre la Défense magique d\'une créature visible. Réussite contre un soldat : récupérez [NC] PI. Contre élite/champion : trésor spirituel (valeur ≤ niveau×30, ou 50 si Méchant), une seule fois par créature. Bonus égal au [NC] sur ce test.',
            },
        ],
    },

    sombrelame: {
        nom: 'Sombrelame',
        tagline: 'Utilise des attaques de ténèbres et tire son pouvoir des liens.',
        atouts: [
            { type: 'pv', valeur: 5, label: 'Votre maximum de Points de Vie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous recevez la capacité de vous équiper d\'armes martiales de corps à corps et d\'armures martiales.' },
        ],
        competences: [
            {
                key: 'coeur_tenebres', nom: 'Cœur des ténèbres', ncMax: 1,
                description: 'Une fois par scène, en entrant en Crise, vous pouvez créer un lien de haine envers une créature visible avec laquelle vous n\'avez pas de lien.',
            },
            {
                key: 'douloureuse_lecon', nom: 'Douloureuse leçon', ncMax: 3,
                description: 'Après avoir perdu des PV à cause d\'une autre créature, réalisez gratuitement l\'action Analyse sur elle avec bonus égal à [NC] (une fois par aspect de la créature).',
            },
            {
                key: 'frappe_ombre', nom: 'Frappe de l\'ombre', ncMax: 5,
                description: 'Action : lancez votre dé de Puissance actuel, perdez ce nombre de PV. Si vous ne tombez pas à 0 PV, attaque gratuite avec une arme équipée infligeant [NC + résultat du dé] dégâts supplémentaires, tous convertis en dégâts de ténèbres (type non modifiable).',
            },
            {
                key: 'sang_tenebreux', nom: 'Sang ténébreux', ncMax: 1,
                description: 'Tant que vous êtes en Crise, résistance aux dégâts de ténèbres et de poison.',
            },
            {
                key: 'supplice', nom: 'Supplice', ncMax: 5,
                description: 'Après avoir infligé des dégâts à une ou plusieurs créatures avec lesquelles vous avez un lien, récupérez [NC × 2] PV et [NC × 2] PM.',
            },
        ],
    },

    spirite: {
        nom: 'Spirite',
        tagline: 'Soutient ses alliés grâce à la magie et lance des sorts de lumière.',
        atouts: [
            { type: 'pm', valeur: 5, label: 'Votre maximum de Points de Magie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Ritualisme.' },
        ],
        competences: [
            {
                key: 'magie_soutien', nom: 'Magie de soutien', ncMax: 1,
                description: 'Quand vous lancez un sort ciblant un ou plusieurs alliés en étant équipé d\'une arme arcanique, un allié avec qui vous avez un lien reçoit un bonus égal à l\'intensité du lien à son prochain test de la scène.',
            },
            {
                key: 'pouvoir_guerisseur', nom: 'Pouvoir guérisseur', ncMax: 2,
                description: 'Quand vous lancez un sort ciblant un ou plusieurs alliés en étant équipé d\'une arme arcanique, chacun récupère [NC × nombre de liens que vous avez] PV supplémentaires, distincts des soins du sort.',
            },
            {
                key: 'spiritisme_rituel', nom: 'Spiritisme rituel', ncMax: 1,
                description: 'Vous pouvez réaliser des rituels dont les effets relèvent de la discipline Spiritisme. Le test de magie utilise [INT + VOL].',
            },
            {
                key: 'vismagus', nom: 'Vismagus', ncMax: 1,
                description: 'Quand vous lancez un sort sans assez de PM, vous pouvez payer le double en PV à la place (impossible si cela vous réduit à 0 PV). Si le sort devait vous rendre des PV, il n\'en octroie aucun dans ce cas.',
            },
            {
                key: 'magie_spirituelle', nom: 'Magie spirituelle', ncMax: 10,
                description: 'Chaque fois que vous obtenez cette compétence, apprenez un sort de Spirite. Le test des sorts offensifs utilise [INT + VOL].',
                learnsSpell: true, spellList: 'spirite',
            },
        ],
    },

    tireur_elite: {
        nom: 'Tireur d\'Élite/Tireuse d\'Élite',
        tagline: 'Excelle au combat à distance et annule les attaques à distance.',
        atouts: [
            { type: 'pv', valeur: 5, label: 'Votre maximum de Points de Vie augmente définitivement de 5.' },
            { type: 'narratif', label: 'Vous recevez la capacité de vous équiper d\'armes martiales à distance et de boucliers martiaux.' },
        ],
        competences: [
            {
                key: 'coup_semonce', nom: 'Coup de semonce', ncMax: 4,
                description: 'Quand une attaque à distance touche et inflige des dégâts, renoncez-y pour infliger à la place : état traumatisé, ou état ralenti, ou perte de [NC × 10] PM à chaque cible touchée.',
            },
            {
                key: 'maitrise_armes_distance', nom: 'Maîtrise des armes à distance', ncMax: 4,
                description: 'Bonus de [NC] à tous les tests de précision effectués avec des armes à distance.',
            },
            {
                key: 'oeil_lynx', nom: 'Œil de lynx', ncMax: 5,
                description: 'Sur l\'action Garde sans couvrir une autre créature, choisissez : la prochaine attaque à distance avant la fin de la scène inflige [NC × 2] dégâts supplémentaires, ou attaque gratuite immédiate avec un arc/arme à feu équipée (VH traitée comme 0).',
            },
            {
                key: 'tir_barrage', nom: 'Tir de Barrage', ncMax: 1,
                description: 'Sur une attaque à distance, dépensez 10 PM pour choisir : l\'attaque gagne la propriété multi (2), ou +1 au niveau de multi jusqu\'à multi (3) maximum.',
            },
            {
                key: 'tirs_croises', nom: 'Tirs croisés', ncMax: 1,
                description: 'Après qu\'une créature visible a réalisé une attaque à distance, dépensez un nombre de PM égal au résultat de son test de précision pour la faire échouer contre toutes ses cibles (nécessite d\'être équipé d\'une arme à distance, inopérant contre une réussite critique).',
            },
        ],
    },

    voyageur: {
        nom: 'Voyageur/Voyageuse',
        tagline: 'Ce maître explorateur est accompagné d\'un fidèle compagnon.',
        atouts: [
            { type: 'pi', valeur: 2, label: 'Votre maximum de Points d\'Inventaire augmente définitivement de 2.' },
        ],
        competences: [
            {
                key: 'bourlingueur', nom: 'Bourlingueur', ncMax: 1,
                description: 'Réduisez d\'un cran la taille du dé lancé pour les tests de voyage (minimum d6). Les effets ne se cumulent pas entre personnages ayant cette compétence.',
            },
            {
                key: 'chasseur_tresors', nom: 'Chasseur de trésors', ncMax: 2,
                description: 'Lors d\'un voyage sur la carte du monde, vous faites une découverte sur un résultat de [NC + 1] ou moins au test de voyage (au lieu de 1 seulement).',
            },
            {
                key: 'potins_taverne', nom: 'Potins de taverne', ncMax: 3,
                description: 'En vous reposant dans une auberge/taverne, posez au MJ jusqu\'à [NC] questions sur l\'environnement et les gens qui y vivent.',
            },
            {
                key: 'ressources', nom: 'Ressources', ncMax: 4,
                description: 'Vous récupérez [NC] Points d\'Inventaire après chaque test de voyage.',
            },
            {
                key: 'fidele_compagnon', nom: 'Fidèle compagnon', ncMax: 5,
                description: 'Vous et votre groupe concevez un PNJ compagnon de niveau 5 (bête/créature artificielle/élémentaire/plante), sans initiative propre, ne gagnant pas de niveau, jusqu\'à deux attaques de base, bonus égal à [NC] aux tests de précision/magie, PV max = [(NC × taille de dé Puissance) + moitié de votre niveau]. Une action par tour pour le faire agir. S\'il tombe à 0 PV, il fuit et revient au score de Crise à la prochaine scène commune.',
            },
        ],
    },
};

export const CLASS_ORDER = [
    'arcaniste', 'bricoleur', 'chimeriste', 'elementaliste', 'entropiste',
    'furie', 'gardien', 'maitre_armes', 'maitre_erudit', 'orateur',
    'roublard', 'sombrelame', 'spirite', 'tireur_elite', 'voyageur',
];