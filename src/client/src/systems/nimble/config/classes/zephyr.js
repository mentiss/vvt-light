// src/client/src/systems/nimble/config/classes/zephyr.js
// Source : Nimble Heroes — Zephyr 3.1 (PDF, p. 2-14).
// Classe Zéphyr : 20 niveaux, Élan, Pointes de vitesse, arts martiaux, sous-classes, FAQ.

export default {
    key: 'zephyr', name: 'Zéphyr', vo: 'Zephyr',
    tagline: 'Perfection cinétique implacable',
    summary: 'Vous êtes une force implacable sur le champ de bataille : encaissez les coups et portez des frappes dévastatrices. Déplacez-vous avec une vitesse et une détermination sans égales, en distançant alliés comme ennemis. Ripostez avec précision et faites des frappes ennemies autant d’occasions de contre-attaques dévastatrices.',
    complexity: 3,
    keyStats: ['dex', 'str'],
    hitDie: 8, startingHp: 13,
    saves: { adv: 'dex', dis: 'int' },
    armor: { text: 'Aucune', types: [] },
    weapons: { text: 'Armes de mêlée, attaques à mains nues', rule: { range: 'melee', unarmed: true } },
    startingGear: [{ key: 'staff' }, { name: 'Robe de voyage et sandales' }],
    resources: [
        { key: 'momentum', label: 'Élan', max: null, reset: 'encounter' },
        { key: 'burst_of_speed', label: 'Pointes de vitesse', max: 'DEX', fromLevel: 2, reset: 'encounter' },
    ],
    spellcasting: null,
    levels: {
        1: [
            {
                key: 'iron_defense', name: 'Défense de fer', vo: 'Iron Defense',
                text: 'Votre Défense est égale à DEX+FOR tant que vous ne portez pas d’armure.',
            },
            {
                key: 'momentum', name: 'Élan', vo: 'Momentum',
                text: 'Gagnez 1 point d’Élan pour chaque case parcourue. Vous pouvez dépenser 1 point d’Élan pour ajouter 1 dégât à n’importe quelle attaque de mêlée. Vous perdez tout votre Élan si vous subissez des dégâts, ou à la fin du combat.',
            },
        ],
        2: [
            {
                key: 'burst_of_speed', name: 'Pointe de vitesse', vo: 'Burst of Speed',
                text: 'Lorsque vous lancez l’Initiative, gagnez DEX Pointes de vitesse pour cette rencontre. Vous pouvez dépenser 1 Pointe de vitesse pour utiliser l’une des manœuvres suivantes :\n• **Sillage.** Chaque fois que vous vous défendez : appliquez votre Défense à toutes les attaques dirigées contre vous ce round, OU vous pouvez d’abord vous déplacer d’1 case.\n• **Frappe de bourrasque.** Lancez 1d12 au lieu de 1d4 pour une attaque à mains nues.\n• **Pas du vent.** Déplacez-vous gratuitement, en ignorant les cases ennemies, pendant ce tour.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass',
                text: 'Choisissez une sous-classe de Zéphyr.',
                subclass: true,
            },
            {
                key: 'piercing_blows', name: 'Coups perçants', vo: 'Piercing Blows',
                text: 'Vous pouvez dépenser de l’Élan avant de faire une attaque à mains nues pour gagner l’avantage par tranche de 2 points dépensés.',
            },
        ],
        4: [
            {
                key: 'reactive_force', name: 'Force réactive', vo: 'Reactive Force',
                text: 'Chaque fois que vous subissez une Blessure, gagnez une Pointe de vitesse.',
            },
            {
                key: 'martial_master', name: 'Maître martial', vo: 'Martial Master',
                text: 'Choisissez une capacité d’arts martiaux.',
                choice: { pool: 'martial_arts', count: 1 },
            },
            {
                key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 DEX ou FOR.',
                statIncrease: { from: 'key', count: 1 },
            },
            {
                key: 'focus', name: 'Recueillement', vo: 'Focus',
                text: 'Chaque fois que vous passez du temps à méditer seul dans un lieu venteux pendant un repos sûr, vous pouvez choisir d’autres options de Zéphyr parmi celles qui vous sont accessibles.',
            },
        ],
        5: [
            {
                key: 'supernatural_speed', name: 'Vitesse surnaturelle', vo: 'Supernatural Speed',
                text: 'Tant que vous ne portez pas d’armure, vous pouvez utiliser votre Élan pour traiter un dé primaire lancé contre vous comme s’il avait obtenu 1 de moins par tranche de 2 points d’Élan dépensés.',
            },
            {
                key: 'iron_defense_2', name: 'Défense de fer (2)', vo: 'Iron Defense (2)',
                text: 'Votre Défense est égale à (3×FOR)+DEX tant que vous ne portez pas d’armure.',
            },
            {
                key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 INT ou VOL.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        6: [
            {
                key: 'martial_master_2', name: 'Maître martial (2)', vo: 'Martial Master (2)',
                text: 'Choisissez une 2ᵉ capacité d’arts martiaux.',
                choice: { pool: 'martial_arts', count: 1 },
                upgrades: 'martial_arts',
            },
            {
                key: 'swift_fists', name: 'Poings rapides', vo: 'Swift Fists',
                text: 'Si vous n’avez plus d’action et n’avez pas attaqué ce tour-ci, votre Frappe de bourrasque coûte 0 action.',
            },
            {
                key: 'infuse_strength', name: 'Insuffler la force', vo: 'Infuse Strength',
                text: 'Chaque fois que vous faites une attaque à mains nues, vous pouvez dépenser 1 dé de vie ou plus et les ajouter au total de la frappe. Au lieu d’infliger des dégâts, soignez la cible de ce montant (vous pouvez utiliser l’Élan ou d’autres capacités normalement).',
            },
        ],
        7: [
            {
                key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Zéphyr.',
                subclassFeature: true,
            },
            {
                key: 'galeforce_strike_2', name: 'Frappe de bourrasque (2)', vo: 'Galeforce Strike (2)',
                text: 'Votre Frappe de bourrasque passe à 1d20.',
            },
        ],
        8: [
            {
                key: 'martial_master_3', name: 'Maître martial (3)', vo: 'Martial Master (3)',
                text: 'Choisissez une 3ᵉ capacité d’arts martiaux.',
                choice: { pool: 'martial_arts', count: 1 },
                upgrades: 'martial_arts',
            },
            {
                key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 DEX ou FOR.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        9: [
            {
                key: 'swift_feet', name: 'Pieds agiles', vo: 'Swift Feet',
                text: 'Gagnez +2 en Vitesse et en Initiative tant que vous ne portez pas d’armure.',
            },
            {
                key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 INT ou VOL.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        10: [
            {
                key: 'martial_master_4', name: 'Maître martial (4)', vo: 'Martial Master (4)',
                text: 'Choisissez une 4ᵉ capacité d’arts martiaux.',
                choice: { pool: 'martial_arts', count: 1 },
                upgrades: 'martial_arts',
            },
            {
                key: 'unyielding_resolve', name: 'Résolution inflexible', vo: 'Unyielding Resolve',
                text: 'Ignorez la première Blessure que vous devriez subir à chaque rencontre (les capacités déclenchées par une Blessure, comme Force réactive, se déclenchent quand même).',
            },
        ],
        11: [
            {
                key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Zéphyr.',
                subclassFeature: true,
            },
        ],
        12: [
            {
                key: 'kinetic_marvel', name: 'Merveille cinétique', vo: 'Kinetic Marvel',
                text: 'Doublez les dégâts apportés par l’Élan.',
            },
            {
                key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 DEX ou FOR.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        13: [
            {
                key: 'unyielding_resolve_2', name: 'Résolution inflexible (2)', vo: 'Unyielding Resolve (2)',
                text: 'Ignorez les 2 premières Blessures que vous devriez subir à chaque rencontre.',
            },
            {
                key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 INT ou VOL.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        14: [
            {
                key: 'blur', name: 'Flou', vo: 'Blur',
                text: 'Gagnez 10 points d’Élan lorsque vous lancez l’Initiative.',
            },
        ],
        15: [
            {
                key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Zéphyr.',
                subclassFeature: true,
            },
        ],
        16: [
            {
                key: 'swift_feet_2', name: 'Pieds agiles (2)', vo: 'Swift Feet (2)',
                text: 'Gagnez encore +2 en Vitesse et en Initiative tant que vous ne portez pas d’armure.',
            },
            {
                key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 DEX ou FOR.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        17: [
            {
                key: 'unyielding_resolve_3', name: 'Résolution inflexible (3)', vo: 'Unyielding Resolve (3)',
                text: 'Ignorez les 3 premières Blessures que vous devriez subir à chaque rencontre. Vous avez l’avantage aux jets de sauvegarde de FOR tant que vous êtes mourant.',
            },
            {
                key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 INT ou VOL.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        18: [
            {
                key: 'martial_master_5', name: 'Maître martial (5)', vo: 'Martial Master (5)',
                text: 'Choisissez une 5ᵉ capacité d’arts martiaux.',
                choice: { pool: 'martial_arts', count: 1 },
                upgrades: 'martial_arts',
            },
        ],
        19: [
            {
                key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon',
                text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).',
                epicBoon: true,
            },
        ],
        20: [
            {
                key: 'windborne', name: 'Porté par le vent', vo: 'Windborne',
                text: '+1 à 2 de vos caractéristiques au choix. +1 Pointe de vitesse supplémentaire lorsque vous lancez l’Initiative. Gagnez définitivement 1 action (tant que vous êtes mourant, vous avez au maximum 2 actions).',
                statIncrease: { from: 'any', count: 2 },
            },
        ],
    },
    options: {
        martial_arts: {
            label: 'Arts martiaux', vo: 'Martial Arts Abilities',
            text: '**Recueillement.** Chaque fois que vous passez du temps à méditer seul dans un lieu venteux pendant un repos sûr, vous pouvez choisir d’autres options de Zéphyr parmi celles qui vous sont accessibles.',
            items: [
                {
                    key: 'airshift', name: 'Transport aérien', vo: 'Airshift',
                    text: 'Passif. Si vous traversez l’espace d’une créature consentante en utilisant Pas du vent, elle peut se déplacer avec vous et choisir de terminer son déplacement sur n’importe quelle case adjacente à votre trajet ou située le long de celui-ci.',
                },
                {
                    key: 'bodily_discipline', name: 'Discipline corporelle', vo: 'Bodily Discipline',
                    cost: '1 action',
                    text: 'Mettez fin à un état unique qui vous affecte (mettre fin à mourant rend 1 PV, mettre fin à étourdi rend 1 action, etc.).',
                },
                {
                    key: 'cyclonic_pull', name: 'Attraction cyclonique', vo: 'Cyclonic Pull',
                    text: 'Passif. Chaque fois que vous évitez la totalité des dégâts d’une attaque de mêlée (qu’elle rate ou que vous vous défendiez), vous pouvez échanger votre place avec celle de l’attaquant.',
                },
                {
                    key: 'enduring_soul', name: 'Âme endurante', vo: 'Enduring Soul',
                    text: 'Passif. Chaque fois que vous lancez l’Initiative, gagnez autant de dés de vie que d’actions dont vous disposez à votre premier tour (ils expirent à la fin du combat s’ils ne sont pas utilisés).',
                },
                {
                    key: 'i_jump_on_his_back', name: 'Je lui saute sur le dos !', vo: 'I Jump on His Back!',
                    text: 'Passif. Vous pouvez chevaucher les créatures de votre taille. Quand vous chevauchez une créature, vous gagnez l’avantage contre elle, et TOUS les dégâts que vous évitez lui sont infligés. Si vous entrez dans l’espace d’une créature de votre taille ou plus grande avec Pas du vent ou Arpenteur des cieux, vous la chevauchez gratuitement.',
                },
                {
                    key: 'kinetic_barrage', name: 'Barrage cinétique', vo: 'Kinetic Barrage',
                    text: 'Passif. (1 fois par tour) Chaque fois que vous faites une attaque de mêlée sans dépenser d’Élan, gagnez DEX points d’Élan.',
                },
                {
                    key: 'mighty_soul', name: 'Âme puissante', vo: 'Mighty Soul',
                    text: 'Passif. Vous ne pouvez pas être déplacé contre votre gré. Chaque fois que vous devriez rater un jet, vous pouvez subir une Blessure pour ajouter FOR au résultat obtenu. Vous pouvez répéter cela autant de fois que vous le voulez.',
                },
                {
                    key: 'quickstrike', name: 'Frappe vive', vo: 'Quickstrike',
                    text: 'Passif. Chaque fois que vous vous interposez, vous pouvez d’abord faire gratuitement une attaque à mains nues contre l’ennemi.',
                },
                {
                    key: 'twisting_deflection', name: 'Déviation tournoyante', vo: 'Twisting Deflection',
                    cost: '1 action',
                    text: 'Réaction (lorsque vous évitez la totalité des dégâts d’une attaque de mêlée, qu’elle rate ou que vous vous défendiez) : forcez une autre cible logique à portée à être touchée à votre place.',
                },
                {
                    key: 'skystrider', name: 'Arpenteur des cieux', vo: 'Skystrider',
                    text: 'Passif. Vous ne pouvez pas être agrippé ni immobilisé tant que vous êtes conscient. Quand vous vous déplacez, vous pouvez traverser N’IMPORTE QUEL terrain en ignorant tous ses effets néfastes (par exemple à terre, ennemis, plafonds, cimes des arbres, lave, pointes, nuages).',
                },
            ],
        },
    },
    subclasses: [
        {
            key: 'pain', name: 'Voie de la Douleur', vo: 'Way of Pain',
            summary: 'Accueillez les coups de vos ennemis et laissez-les vous façonner. Votre capacité à souffrir est sans fond.',
            complexity: 2,
            levels: {
                3: [{
                    key: 'bring_the_pain', name: 'Apportez la douleur', vo: 'Bring the Pain',
                    text: 'Les dégâts ne vous font plus perdre votre Élan. (1 fois par round) Vous pouvez subir 1 Blessure pour gagner gratuitement 10 points d’Élan.',
                }],
                7: [{
                    key: 'share_my_pain', name: 'Partager ma douleur', vo: 'Share My Pain',
                    text: '(1 fois par round) Chaque fois que vous subissez des dégâts, vous pouvez n’en subir que la moitié et infliger ce même montant à une autre créature à portée.',
                }],
                11: [{
                    key: 'pain_sharpens_the_mind', name: 'La douleur aiguise l’esprit', vo: 'Pain Sharpens the Mind',
                    text: 'Tant que vous êtes en sang, vous gagnez l’avantage.',
                }],
                15: [{
                    key: 'echoed_agony', name: 'Agonie en écho', vo: 'Echoed Agony',
                    text: 'Votre Partager ma douleur peut aussi cibler une 2ᵉ créature à Allonge 4.',
                }],
            },
        },
        {
            key: 'iron', name: 'Voie du Fer', vo: 'Way of Iron',
            summary: 'Entraînez votre corps à devenir dur comme le fer. Concentrez-vous pour renforcer vos défenses, puis libérez cette énergie en coups dévastateurs.',
            complexity: 2,
            levels: {
                3: [{
                    key: 'steel_yourself', name: 'S’endurcir', vo: 'Steel Yourself',
                    text: 'Lorsque vous lancez l’Initiative, vous devenez Trempé : (1 fois par round) réduisez gratuitement de 10 les dégâts d’une attaque. Lorsque vous touchez, vous pouvez mettre fin à Trempé pour ajouter 1d20 aux dégâts.',
                }],
                7: [
                    {
                        key: 'iron_fists', name: 'Poings de fer', vo: 'Iron Fists',
                        text: 'Lorsque vous mettez fin à Trempé, lancez son d20 avec avantage.',
                    },
                    {
                        key: 'iron_body', name: 'Corps de fer', vo: 'Iron Body',
                        text: 'Vous pouvez doubler la réduction des dégâts de Trempé à chaque round, ou l’utiliser 2 fois par round. Vous devenez Trempé la première fois que vous devriez subir une Blessure à chaque rencontre.',
                    },
                ],
                11: [{
                    key: 'infuse_with_iron', name: 'Insuffler le fer', vo: 'Infuse with Iron',
                    text: 'Lorsque vous utilisez Insuffler la force, votre cible devient Trempée.',
                }],
                15: [{
                    key: 'perfect_alloy', name: 'Alliage parfait', vo: 'Perfect Alloy',
                    text: 'Vous devenez Trempé chaque fois que vous utilisez une Pointe de vitesse.',
                }],
            },
        },
        {
            key: 'hurricanes', name: 'Voie des Ouragans', vo: 'Way of Hurricanes',
            summary: 'Votre poing est comme le vent hurlant, incessant et sans fin. Ceux qui vous affrontent sont battus et meurtris par un tourbillon de frappes mortelles.',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'cyclone', name: 'Cyclone', vo: 'Cyclone',
                        text: '(Allonge 4) Vous pouvez dépenser 1 point d’Élan pour déplacer une créature d’1 case.',
                    },
                    {
                        key: 'cleaving_gale', name: 'Bourrasque fendante', vo: 'Cleaving Gale',
                        text: 'Chaque fois que vous faites un critique, vous pouvez infliger autant de dégâts à une 2ᵉ créature à Allonge 1 de votre cible. (1 fois par tour) Lorsque vous TOUCHEZ, vous pouvez subir une Blessure pour transformer la touche en critique.',
                    },
                ],
                7: [
                    {
                        key: 'hurricane_strike', name: 'Frappe d’ouragan', vo: 'Hurricane Strike',
                        text: 'Votre Frappe de bourrasque peut gagner : zone, Allonge 1.',
                    },
                    {
                        key: 'sidestep', name: 'Pas de côté', vo: 'Sidestep',
                        text: 'Après avoir été attaqué, vous pouvez vous déplacer de 2 cases (une fois les dégâts résolus).',
                    },
                ],
                11: [{
                    key: 'forceful_gust', name: 'Rafale puissante', vo: 'Forceful Gust',
                    text: 'Vos attaques à mains nues peuvent repousser de FOR cases ; vous pouvez subir 1 Blessure pour doubler la distance.',
                }],
                15: [{
                    key: 'tempests_fury', name: 'Fureur de la tempête', vo: 'Tempest’s Fury',
                    text: 'Chaque fois que vous devriez lancer des dés supplémentaires pour un critique, lancez 1d20 à la place.',
                }],
            },
        },
        {
            key: 'flame', name: 'Voie de la Flamme', vo: 'Way of Flame',
            summary: 'Brûlez avec l’ardeur de la bataille, combattez vite et sans retenue, et contrez vos ennemis par des frappes brûlantes.',
            complexity: 3,
            levels: {
                3: [{
                    key: 'exploding_soul', name: 'Âme explosive', vo: 'Exploding Soul',
                    text: 'Chaque fois que vous subissez une ou plusieurs Blessures, faites une attaque à mains nues dont les dégâts sont infligés à TOUTES les autres créatures à Allonge 1. (1 fois par round) Pendant votre tour, vous pouvez subir une Blessure.',
                }],
                7: [{
                    key: 'burning_palm', name: 'Paume ardente', vo: 'Burning Palm',
                    text: 'Vos attaques à mains nues gagnent : en cas de critique : fumant. Vous pouvez doubler les effets de l’Élan contre les créatures fumantes (ce qui met fin à l’état).',
                }],
                11: [{
                    key: 'chain_reaction', name: 'Réaction en chaîne', vo: 'Chain Reaction',
                    text: '(1 fois par tour) Lorsque vous faites un critique avec une attaque à mains nues, infligez des dégâts de feu égaux à votre FOR + l’Élan dépensé aux créatures de votre choix adjacentes à votre cible. Répétez autant de fois que vous le voulez, en ciblant des créatures qui n’ont pas encore subi de dégâts de cet effet ce tour-ci.',
                }],
                15: [{
                    key: 'encompassing_flames', name: 'Flammes enveloppantes', vo: 'Encompassing Flames',
                    text: 'Vous pouvez doubler l’Allonge de Réaction en chaîne et d’Âme explosive.',
                }],
            },
        },
    ],
    spells: [],
    faq: [
        { q: 'Le déplacement quand je chevauche une créature, ou un déplacement forcé, compte-t-il pour mon Élan ?', a: 'Oui.' },
        { q: 'À quoi sert le déplacement d’1 case de Sillage ?', a: 'Si le déplacement vous met hors de l’Allonge ou de la Portée de l’attaque, ou vous donne un abri total, l’attaque rate. S’il vous donne un abri, le désavantage s’applique normalement : le dé primaire est relancé et on garde le plus faible.' },
        { q: 'Puis-je utiliser Insuffler la force sur une attaque d’opportunité ou une Frappe coordonnée ?', a: 'Oui.' },
        { q: 'Puis-je me défendre ou réduire autrement les dégâts de Partager ma douleur ?', a: 'Oui, mais cela réduira d’autant les dégâts que vous infligez en retour.' },
        { q: 'Puis-je subir des Blessures supplémentaires parce qu’Âme explosive se déclenche pendant que je suis mourant ?', a: 'Oui, si vous ratez le jet de sauvegarde de FOR contre des attaques pendant que vous êtes mourant.' },
    ],
};
