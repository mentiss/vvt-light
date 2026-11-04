// src/client/src/systems/nimble/config/classes/berserker.js
// Source : Nimble Heroes — Berserker 3.0 (PDF, p. 3-14 du livret).
// Classe Berserker : 20 niveaux, Arsenal sauvage, sous-classes (dont Mage des muscles), FAQ.

const SAVAGE_ARSENAL = [
    {
        key: 'death_blow', name: 'Coup fatal', vo: 'Death Blow',
        text: 'Chaque fois que vous faites un critique, vous pouvez doubler les dégâts de vos dés de Furie (au lieu de lancer des dés supplémentaires).',
    },
    {
        key: 'deathless_rage', name: 'Rage immortelle', vo: 'Deathless Rage',
        text: '(1/tour) Tant que vous êtes mourant, vous pouvez subir 1 Blessure pour gagner 1 action et 1 dé de Furie.',
    },
    {
        key: 'dismantle', name: 'Démanteler', vo: 'Dismantle',
        text: 'Après avoir lancé une attaque, dépensez autant de dés de Furie que vous le souhaitez : augmentez votre dé primaire de 1 pour chacun.',
    },
    {
        key: 'eager_for_battle', name: 'Avide de bataille', vo: 'Eager for Battle',
        text: 'Vous avez l’avantage à l’Initiative. Déplacez-vous gratuitement de 2×DEX cases lors de votre premier tour de chaque rencontre.',
    },
    {
        key: 'into_the_fray', name: 'Dans la mêlée', vo: 'Into the Fray', cost: '1 action',
        text: 'Bondissez de jusqu’à 2×DEX cases vers un ennemi. Si vous atterrissez à l’Allonge de votre arme d’au moins 2 ennemis, faites gratuitement une attaque contre l’un d’eux.',
    },
    {
        key: 'mighty_endurance', name: 'Endurance prodigieuse', vo: 'Mighty Endurance',
        text: 'Vous pouvez désormais survivre à 4 Blessures supplémentaires avant de mourir.',
    },
    {
        key: 'more_blood', name: 'ENCORE DU SANG !', vo: 'MORE BLOOD!',
        text: 'Chaque fois qu’un ennemi vous inflige un critique, gagnez 1 dé de Furie. Chaque fois que vous tombez à 0 PV, entrez en Rage gratuitement.',
    },
    {
        key: 'rampage', name: 'Saccage', vo: 'Rampage',
        text: '(1/tour) Après avoir touché, vous pouvez considérer que votre attaque suivante de ce tour a obtenu le même résultat au lieu de la relancer.',
    },
    {
        key: 'swift_fury', name: 'Furie véloce', vo: 'Swift Fury',
        text: 'Chaque fois que vous gagnez un dé de Furie, déplacez-vous gratuitement de jusqu’à DEX cases, en ignorant le terrain difficile.',
    },
    {
        key: 'thunderous_steps', name: 'Pas de tonnerre', vo: 'Thunderous Steps',
        text: 'Après vous être déplacé d’au moins 4 cases pendant votre Rage, vous pouvez infliger FOR dégâts contondants à toutes les créatures adjacentes à l’endroit où vous vous arrêtez.',
    },
    {
        key: 'unstoppable_force', name: 'Force irrésistible', vo: 'Unstoppable Force',
        text: 'Tant que vous êtes mourant, subir des dégâts vous inflige 1 Blessure (au lieu de 2) et les critiques vous en infligent 2 (au lieu de 3).',
    },
    {
        key: 'whirlwind', name: 'Tourbillon', vo: 'Whirlwind', cost: '2 actions',
        text: 'Zone. Attaquez TOUTES les cibles à l’Allonge de votre arme de mêlée.',
    },
    {
        key: 'youre_next', name: 'T’es le prochain !', vo: 'You’re Next!', cost: '1 action',
        text: 'Pendant votre Rage, vous pouvez faire un test de Puissance pour démoraliser un ennemi dans une Allonge de 12 (DD : ses PV actuels). En cas de réussite, il fuit immédiatement le combat.',
    },
];

// Sorts « musculaires » du Mage des muscles. furyDice : nombre de dés de Furie requis pour lancer le sort.
const MUSCLE_SPELLS = [
    {
        key: 'power_word_clobber', name: 'Mot de pouvoir : Tabasser', vo: 'Power Word: Clobber',
        school: 'berserker', tier: 0, utility: false, cost: '1 action', furyDice: 1,
        target: '',
        damage: { dice: '1d10', bonus: 'STR' },
        text: '1d10+FOR+dés de Furie (DF) dégâts. Si touché : une créature de taille Moyenne ou inférieure est tabassée.',
        notes: '**Tabassé.** Toute créature de taille Moyenne ou inférieure qui est étourdie, agrippée, à terre, ou qui a été déplacée de force ce round est aussi considérée comme tabassée ce round.',
    },
    {
        key: 'throwmaturgy', name: 'Lancethaumaturgie', vo: 'Throwmaturgy',
        school: 'berserker', tier: 0, utility: false, cost: '2 actions', furyDice: 1,
        target: 'Allonge 3/DF',
        damage: { dice: '1d6', bonus: 'STR' },
        text: 'Lancez une créature tabassée sur un autre ennemi ; tous deux subissent 1d6+FOR+DF dégâts et retombent à terre (s’ils sont de taille Moyenne ou inférieure). OU : pour 1 action, lancez plutôt un rocher ou un objet similaire pouvant être lancé.',
        notes: '**3/DF ?** Si vous avez 1 dé de Furie, vous pouvez lancer à 3 cases ; 2 dés de Furie, 6 cases ; et ainsi de suite.',
    },
    {
        key: 'polymorph_chicken', name: 'Métamorphose : POULET !', vo: 'Polymorph: CHICKEN!',
        school: 'berserker', tier: 0, utility: false, cost: '1 action', furyDice: 3,
        target: 'Allonge 3/DF',
        text: 'Hurlez « Poulet » à une créature, qui est effrayée jusqu’à la fin de son prochain tour (créatures Grandes ou plus : provoquées à la place).',
    },
    {
        key: 'thunderfist', name: 'Poing-tonnerre', vo: 'Thunderfist',
        school: 'berserker', tier: 0, utility: false, cost: '2 actions', furyDice: 3, tags: ['aoe'],
        target: 'Cône DF, zone',
        damage: { dice: '1d20', bonus: 'STR' },
        text: '1d20+FOR+DF.',
    },
    {
        key: 'teleport', name: '« Téléportation »', vo: '“Teleport”',
        school: 'berserker', tier: 0, utility: false, cost: '1 action', furyDice: 4,
        target: '',
        text: 'Additionnez vos dés de Furie et bondissez de jusqu’à ce nombre de cases.',
    },
    {
        key: 'meat_ward', name: 'Rempart de viande', vo: 'Meat Ward',
        school: 'berserker', tier: 0, utility: false, cost: '1 action', furyDice: 5, tags: ['reaction'],
        target: 'Allonge 1',
        text: 'Réaction : quand vous êtes attaqué, déplacez une autre créature de taille Moyenne ou inférieure dans votre case et déplacez-vous dans une autre case adjacente.',
        notes: '**Rappel !** Chaque réaction est limitée à 1/round.',
    },
    {
        key: 'powershout_weaklings', name: 'Cri de pouvoir : MAUVIETTES !', vo: 'Powershout: WEAKLINGS!',
        school: 'berserker', tier: 0, utility: false, cost: '2 actions', furyDice: 6, tags: ['aoe'],
        target: 'Allonge 6, zone',
        text: '(1/rencontre) DF dégâts aux ennemis, qui sont effrayés (les ennemis Grands ou plus sont provoqués à la place), et les attaques infligent +10 dégâts aux ennemis en armure ce round.',
    },
    {
        key: 'earthquake', name: 'Séisme', vo: 'Earthquake',
        school: 'berserker', tier: 0, utility: false, cost: '2 actions', furyDice: 7, tags: ['aoe'],
        target: 'Allonge 3',
        damage: { dice: '3d20', bonus: '' },
        text: '(1/rencontre) Bondissez dans les airs et retombez avec une force sismique jusqu’à 2× votre Vitesse plus loin. Les créatures dans une Allonge de 3 subissent 3d20+DF dégâts et sont ralenties. Les créatures tabassées sont mises à terre.',
    },
];

export default {
    key: 'berserker', name: 'Berserker', vo: 'Berserker',
    tagline: 'Courroux et ruine',
    summary: 'Devenez une machine à dégâts enragée. Accueillez la mort comme une vieille amie et continuez à vous battre ! Infligez une brutalité incroyable : plus le combat dure, plus votre Rage s’intensifie. Utilisez votre Arsenal sauvage : choisissez des capacités pour écraser vos ennemis et rire au nez de la mort !',
    complexity: 2,
    keyStats: ['str', 'dex'],
    hitDie: 12, startingHp: 20,
    saves: { adv: 'str', dis: 'int' },
    armor: { text: 'Aucune', types: [] },
    weapons: { text: 'Toutes les armes de FOR', rule: { stats: ['str'] } },
    startingGear: [{ key: 'battleaxe' }, { name: 'Rations (viande)' }, { key: 'rope' }],
    resources: [
        {
            key: 'fury', label: 'Dés de Furie', max: 'KEY', die: 'd4',
            dieByLevel: { 1: 'd4', 6: 'd6', 9: 'd8', 13: 'd10', 17: 'd12' },
            reset: 'encounter',
        },
    ],
    spellcasting: null,
    levels: {
        1: [
            {
                key: 'rage', name: 'Rage', vo: 'Rage', cost: '1 action',
                text: '(1/tour) Lancez un dé de Furie (1d4) et mettez-le de côté. Ajoutez-le à chaque attaque de FOR que vous faites. Vous pouvez avoir au maximum CLÉ dés de Furie ; ils sont perdus quand votre Rage prend fin.\n**C’est tout ce que t’as ?!** Quand vous êtes attaqué, vous pouvez dépenser 1 dé de Furie ou plus pour réduire les dégâts subis de FOR+DEX par dé dépensé.\n**Votre Rage prend fin…** si vous quittez le combat, tombez à 0 PV, ou passez 1 round sans attaquer ni entrer en Rage.\n**Oui !** Vous pouvez entrer en Rage et gagner un autre dé de Furie même si vous êtes déjà en Rage. Si vous êtes déjà au maximum, lancez normalement et choisissez lesquels garder.',
            },
        ],
        2: [
            {
                key: 'intensifying_fury', name: 'Furie croissante', vo: 'Intensifying Fury',
                text: 'Si vous êtes en Rage au début de votre tour, lancez gratuitement 1 dé de Furie.',
            },
            {
                key: 'one_with_the_ancients', name: 'Un avec les Anciens', vo: 'One with the Ancients',
                uses: { count: '1', per: 'safeRest' },
                text: '(1/repos sûr) Face à une décision sur la direction ou la ligne de conduite à suivre, vous pouvez appeler vos ancêtres pour qu’ils vous guident vers la voie la plus dangereuse ou la plus difficile.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass', subclass: true,
                text: 'Choisissez une sous-classe de Berserker.',
            },
            {
                key: 'bloodlust', name: 'Soif de sang', vo: 'Bloodlust',
                text: 'Dépensez 1 dé de Furie ou plus pendant votre tour : déplacez-vous gratuitement de DEX cases par dé dépensé.',
            },
        ],
        4: [
            {
                key: 'enduring_rage', name: 'Rage tenace', vo: 'Enduring Rage',
                text: 'Tant que vous êtes mourant, vous entrez automatiquement et gratuitement en Rage au début de votre tour, vous disposez d’un maximum de 2 actions au lieu de 1, et vous ignorez les jets de sauvegarde de FOR pour attaquer.',
            },
            {
                key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                statIncrease: { from: 'key', count: 1 },
                text: '+1 FOR ou DEX.',
            },
            {
                key: 'savage_arsenal_1', name: 'Arsenal sauvage', vo: 'Savage Arsenal',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez 1 capacité de l’Arsenal sauvage.\n**Courroux et ruine.** Chaque fois que vous accomplissez un acte de destruction notable ou un exploit de force pendant un repos sûr, vous pouvez choisir d’autres options de Berserker parmi celles qui vous sont accessibles.',
            },
        ],
        5: [
            {
                key: 'rage_2', name: 'Rage (2)', vo: 'Rage (2)',
                text: 'Chaque fois que vous entrez en Rage, gagnez 2 dés de Furie au lieu d’un.',
            },
            {
                key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                statIncrease: { from: 'secondary', count: 1 },
                text: '+1 INT ou VOL.',
            },
        ],
        6: [
            {
                key: 'savage_arsenal_2', name: 'Arsenal sauvage (2)', vo: 'Savage Arsenal (2)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 2ᵉ capacité de l’Arsenal sauvage.',
            },
            {
                key: 'intensifying_fury_2', name: 'Furie croissante (2)', vo: 'Intensifying Fury (2)',
                text: 'Vos dés de Furie sont désormais des d6.',
            },
        ],
        7: [
            {
                key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
                text: 'Gagnez votre capacité de sous-classe de Berserker.',
            },
        ],
        8: [
            {
                key: 'savage_arsenal_3', name: 'Arsenal sauvage (3)', vo: 'Savage Arsenal (3)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 3ᵉ capacité de l’Arsenal sauvage.',
            },
            {
                key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                statIncrease: { from: 'key', count: 1 },
                text: '+1 FOR ou DEX.',
            },
        ],
        9: [
            {
                key: 'intensifying_fury_3', name: 'Furie croissante (3)', vo: 'Intensifying Fury (3)',
                text: 'Vos dés de Furie sont désormais des d8.',
            },
            {
                key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                statIncrease: { from: 'secondary', count: 1 },
                text: '+1 INT ou VOL.',
            },
        ],
        10: [
            {
                key: 'savage_arsenal_4', name: 'Arsenal sauvage (4)', vo: 'Savage Arsenal (4)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 4ᵉ capacité de l’Arsenal sauvage.',
            },
        ],
        11: [
            {
                key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
                text: 'Gagnez votre capacité de sous-classe de Berserker.',
            },
        ],
        12: [
            {
                key: 'savage_arsenal_5', name: 'Arsenal sauvage (5)', vo: 'Savage Arsenal (5)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 5ᵉ capacité de l’Arsenal sauvage.',
            },
            {
                key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                statIncrease: { from: 'key', count: 1 },
                text: '+1 FOR ou DEX.',
            },
        ],
        13: [
            {
                key: 'intensifying_fury_4', name: 'Furie croissante (4)', vo: 'Intensifying Fury (4)',
                text: 'Vos dés de Furie sont désormais des d10.',
            },
            {
                key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                statIncrease: { from: 'secondary', count: 1 },
                text: '+1 INT ou VOL.',
            },
        ],
        14: [
            {
                key: 'savage_arsenal_6', name: 'Arsenal sauvage (6)', vo: 'Savage Arsenal (6)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 6ᵉ capacité de l’Arsenal sauvage.',
            },
        ],
        15: [
            {
                key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
                text: 'Gagnez votre capacité de sous-classe de Berserker.',
            },
        ],
        16: [
            {
                key: 'savage_arsenal_7', name: 'Arsenal sauvage (7)', vo: 'Savage Arsenal (7)',
                choice: { pool: 'savage_arsenal', count: 1 },
                text: 'Choisissez une 7ᵉ capacité de l’Arsenal sauvage.',
            },
            {
                key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                statIncrease: { from: 'key', count: 1 },
                text: '+1 FOR ou DEX.',
            },
        ],
        17: [
            {
                key: 'intensifying_fury_5', name: 'Furie croissante (5)', vo: 'Intensifying Fury (5)',
                text: 'Vos dés de Furie sont désormais des d12.',
            },
            {
                key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                statIncrease: { from: 'secondary', count: 1 },
                text: '+1 INT ou VOL.',
            },
        ],
        18: [
            {
                key: 'deep_rage', name: 'RAGE PROFONDE', vo: 'DEEP RAGE',
                text: 'Tomber à 0 PV ne met pas fin à votre Rage.',
            },
        ],
        19: [
            {
                key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', epicBoon: true,
                text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).',
            },
        ],
        20: [
            {
                key: 'boundless_rage', name: 'RAGE SANS LIMITES', vo: 'BOUNDLESS RAGE',
                statIncrease: { from: 'any', count: 2 },
                text: '+1 à 2 de vos caractéristiques au choix. Chaque fois que vous obtenez moins de 5 sur un dé de Furie, remplacez le résultat par 5.',
            },
        ],
    },
    options: {
        savage_arsenal: {
            label: 'Arsenal sauvage', vo: 'Savage Arsenal',
            text: '**Courroux et ruine.** Chaque fois que vous accomplissez un acte de destruction notable ou un exploit de force pendant un repos sûr, vous pouvez choisir d’autres options de Berserker parmi celles qui vous sont accessibles.',
            items: SAVAGE_ARSENAL,
        },
    },
    subclasses: [
        {
            key: 'mountainheart', name: 'Voie du Cœur-de-montagne', vo: 'Path of the Mountainheart',
            summary: 'Encaissez des coups terribles et des dégâts écrasants. Balayez d’un haussement d’épaules la mort et la maladie qui terrasseraient les plus puissantes armées.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'stones_resilience', name: 'Résilience de la pierre', vo: 'Stone’s Resilience',
                        text: 'Chaque fois que vous dépensez des dés de Furie pour réduire des dégâts subis, ajoutez la valeur du dé à la réduction.',
                    },
                    {
                        key: 'mountainous_tenacity', name: 'Ténacité de la montagne', vo: 'Mountainous Tenacity',
                        text: 'Chaque fois que vous dépensez des dés de vie pour récupérer des PV, pour chaque tranche de 10 PV que vous récupéreriez, vous pouvez soigner 1 Blessure à la place.',
                    },
                ],
                7: [
                    {
                        key: 'unbreakable', name: 'Inébranlable', vo: 'Unbreakable',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Pendant votre Rage, si vous deviez subir votre dernière Blessure ou un autre état négatif de votre choix, vous ne le subissez pas.',
                    },
                ],
                11: [
                    {
                        key: 'titans_fury', name: 'Fureur du titan', vo: 'Titan’s Fury',
                        text: 'Après avoir raté une attaque ou subi un critique d’un ennemi, entrez en Rage gratuitement.',
                    },
                ],
                15: [
                    {
                        key: 'mountains_endurance', name: 'Endurance de la montagne', vo: 'Mountain’s Endurance',
                        text: 'Tant que vous êtes mourant, si une attaque contre vous devait être un critique, elle est relancée à la place (les capacités déclenchées par un critique, comme Fureur du titan, se déclenchent quand même).',
                    },
                ],
            },
        },
        {
            key: 'red_mist', name: 'Voie de la Brume rouge', vo: 'Path of the Red Mist',
            summary: 'Laissez libre cours à votre fureur offensive et ne laissez de vos ennemis qu’une brume pourpre qui flotte dans l’air.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'blood_frenzy', name: 'Frénésie sanguinaire', vo: 'Blood Frenzy',
                        text: '(1/tour) Pendant votre Rage, chaque fois que vous faites un critique ou tuez un ennemi, gagnez 1 dé de Furie ou passez 1 dé de Furie à son maximum.',
                    },
                    {
                        key: 'savage_awareness', name: 'Vigilance sauvage', vo: 'Savage Awareness',
                        text: 'Avantage aux tests de Perception pour remarquer ou suivre la trace du sang. Vision aveugle 2 pendant votre Rage : dans cette Portée, vous ignorez l’état aveuglé et voyez à travers les ténèbres et l’invisibilité.',
                    },
                ],
                7: [
                    {
                        key: 'unstoppable_brutality', name: 'Brutalité irrésistible', vo: 'Unstoppable Brutality',
                        text: 'Pendant votre Rage, vous pouvez gagner 1 Blessure pour relancer n’importe quelle attaque ou jet de sauvegarde, en ignorant le désavantage.',
                    },
                ],
                11: [
                    {
                        key: 'opportunistic_frenzy', name: 'Frénésie opportuniste', vo: 'Opportunistic Frenzy',
                        text: 'Pendant votre Rage, vous pouvez faire des attaques d’opportunité sans désavantage, et vous pouvez les faire chaque fois qu’un ennemi entre à l’Allonge de votre arme de mêlée.',
                    },
                ],
                15: [
                    {
                        key: 'onslaught', name: 'Déferlement', vo: 'Onslaught',
                        text: 'Pendant votre Rage, gagnez +2 en Vitesse. (1/round) Vous pouvez vous déplacer gratuitement.',
                    },
                ],
            },
        },
        {
            key: 'titans_grip', name: 'Voie de la Poigne du titan', vo: 'Path of the Titan’s Grip',
            summary: 'Rossez des chefs gobelins avec leurs propres sbires, plantez des bandits dans le sol et projetez vos ennemis à travers le champ de bataille.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'titans_grip', name: 'Poigne du titan', vo: 'Titan’s Grip',
                        text: 'Vous maîtrisez les frappes à mains nues, qui gagnent : Si touché : agrippé (contre les créatures de taille Moyenne ou inférieure).',
                    },
                    {
                        key: 'living_weapon', name: 'Arme vivante', vo: 'Living Weapon',
                        text: 'Pendant votre Rage, les créatures vivantes agrippées peuvent servir d’armes improvisées :\n• Très petite : 1d4+FOR, Légère, Lancer 6 ;\n• Petite : 1d6+FOR, Lancer 4 ;\n• Moyenne : 1d10+FOR (à deux mains).\nLes armes vivantes subissent autant de dégâts qu’elles en infligent.',
                    },
                ],
                7: [
                    {
                        key: 'meat_shield', name: 'Bouclier de chair', vo: 'Meat Shield',
                        text: 'Tant que vous agrippez une créature, vous bénéficiez d’un abri contre les attaques des autres créatures. Les attaques qui vous ratent frappent une créature que vous agrippez.',
                    },
                ],
                11: [
                    {
                        key: 'wrathful_grip', name: 'Poigne courroucée', vo: 'Wrathful Grip',
                        text: 'Vos frappes à mains nues infligent désormais 1d6+FOR. Vous pouvez dépenser un dé de Furie pour forcer une créature à relancer un jet de sauvegarde destiné à échapper à votre étreinte.',
                    },
                ],
                15: [
                    {
                        key: 'sickening_blow', name: 'Coup écœurant', vo: 'Sickening Blow',
                        text: 'Chaque fois que vous faites un critique contre un ennemi avec une arme improvisée, ajoutez au total un dé primaire maximisé.',
                    },
                    {
                        key: 'catch', name: 'Attrape !', vo: 'Catch!',
                        text: 'Vos armes improvisées gagnent +4 en Lancer.',
                    },
                ],
            },
        },
        {
            key: 'burning_rage', name: 'Voie de la Rage ardente', vo: 'Path of the Burning Rage',
            summary: 'Tout brûlera tandis que votre colère attise les flammes de la bataille, immolant tout sur son passage dans une destruction ardente.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'stoke_the_flames', name: 'Attiser les flammes', vo: 'Stoke the Flames',
                        text: 'Chaque fois que la taille de vos dés de Furie devrait augmenter, lancez à la place 1 dé de Furie supplémentaire quand vous entrez en Rage.',
                    },
                    {
                        key: 'overflowing_fury', name: 'Furie débordante', vo: 'Overflowing Fury',
                        text: '(Allonge 2) Pour chaque dé de Furie que vous défaussez au-delà de votre maximum, infligez 5 dégâts de feu à une créature à votre Allonge ; elle devient fumante.',
                    },
                ],
                7: [
                    {
                        key: 'hot_headed', name: 'Tête brûlée', vo: 'Hot Headed',
                        text: 'Entrez en Rage gratuitement quand vous lancez l’Initiative. +2 à l’Allonge de Furie débordante.',
                    },
                ],
                11: [
                    {
                        key: 'explosion', name: 'EXPLOSION !', vo: 'EXPLOSION!',
                        text: 'Quand vous attaquez une créature fumante, vous pouvez infliger la même quantité de dégâts à TOUTES les autres créatures adjacentes à votre cible OU ignorer l’armure des créatures fumantes ; cela met fin à l’état.',
                    },
                ],
                15: [
                    {
                        key: 'pyromania', name: 'Pyromanie', vo: 'Pyromania',
                        text: 'Considérez chacun de vos dés de Furie comme s’il avait toujours obtenu 5.',
                    },
                ],
                20: [
                    {
                        key: 'boundless_flames', name: 'FLAMMES SANS LIMITES', vo: 'BOUNDLESS FLAMES',
                        statIncrease: { from: 'any', count: 2 },
                        text: '(Remplace RAGE SANS LIMITES) +1 à 2 de vos caractéristiques au choix. (1/round) Quand vous êtes attaqué, infligez la moitié des dégâts de vos dés de Furie à une créature adjacente.',
                    },
                ],
            },
        },
        {
            key: 'muscle_mage', name: 'Mage des muscles', vo: 'Muscle Mage', story: true,
            summary: '« Homme-chapeau-pointu fait magie. MOI avoir chapeau pointu. MOI FAIRE MAGIE ! » — Fleximus le Sage',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'muscle_magic', name: 'Magie musculaire', vo: 'Muscle Magic',
                        text: 'Vos muscles ont « percé les secrets des arcanes » (et quiconque le conteste est sur le point de passer une mauvaise journée). Vous perdez l’accès à l’Arsenal sauvage et à toutes vos maîtrises d’armes, mais vous gagnez l’accès aux « sorts musculaires », qui exigent d’avoir un certain nombre de dés de Furie pour être lancés.',
                    },
                    {
                        key: 'strength_of_mind', name: 'FORCE de l’esprit', vo: 'STRENGTH of Mind',
                        text: 'Ajoutez votre FOR aux compétences basées sur l’INT.',
                    },
                ],
                7: [
                    {
                        key: 'im_fine_totally_fine', name: 'Ça va ! Tout va bien !', vo: 'I’m Fine! Totally Fine!',
                        uses: { count: '1', per: 'safeRest' },
                        text: '(1/repos sûr) Quand vous tombez à 0 PV, distribuez à vos alliés un nombre d’actions égal au nombre de dés de Furie que vous aviez.',
                    },
                ],
                11: [
                    {
                        key: 'flexpertise', name: 'Flexpertise', vo: 'Flexpertise',
                        text: 'Réduisez de 2 le nombre de dés de Furie requis par vos sorts musculaires.',
                    },
                ],
                15: [
                    {
                        key: 'high_flexemplar', name: 'Grand Flexemplaire', vo: 'High Flexemplar',
                        text: 'Gagnez +4 Blessures maximum. « Ça va ! Tout va bien ! » est illimité.',
                    },
                ],
            },
            spells: MUSCLE_SPELLS,
        },
    ],
    spells: [],
    faq: [
        {
            q: 'Dés de Furie',
            a: 'Ils ne sont PAS dépensés quand vous attaquez. Vous continuez à les accumuler à mesure que votre fureur grandit ; ils ne sont perdus que quand votre Rage prend fin (à la fin du combat ou quand vous gagnez l’état mourant) ou quand vous les dépensez pour utiliser une capacité comme « C’est tout ce que t’as ?! ».',
        },
        {
            q: 'Furie croissante',
            a: 'Vous pouvez toujours entrer en Rage 1/tour avec cette capacité. Autrement dit : vous pouvez toujours dépenser une action pour entrer en Rage et lancer un dé de Furie supplémentaire.',
        },
        {
            q: 'Rage tenace',
            a: 'Vous ne pouvez pas entrer de nouveau en Rage lors d’un tour où vous avez déclenché cette capacité, puisque la Rage est limitée à 1/tour. « Gratuitement » signifie seulement que vous n’avez pas à utiliser d’action ou d’autre ressource pour le faire.\nCette capacité se cumule avec Furie croissante, puisque les deux se produisent « au début de votre tour » (exemple : quand vous gagnez pour la première fois l’état mourant, votre Rage prend fin et vous perdez tous vos dés de Furie ; puis au début de votre tour, vous entrez gratuitement en Rage grâce à Rage tenace ; puis vous lancez gratuitement un dé de Furie supplémentaire grâce à Furie croissante).',
        },
        {
            q: 'Voie du Cœur-de-montagne : Inébranlable',
            a: 'Cela s’applique à N’IMPORTE QUEL état décrit dans les Règles de base, ou à tout autre état spécial infligé par des monstres ou des effets d’environnement. Si vous annulez l’état mourant, vous tombez à 1 PV à la place.',
        },
    ],
};
