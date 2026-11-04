// src/client/src/systems/nimble/config/classes/hunter.js
// Source : Nimble Heroes — Hunter 3.0 (PDF, p. 3-14 du livret).
// Classe Chasseur : 20 niveaux, Frisson de la traque, sous-classes (dont le Maître des bêtes), FAQ.

const TOTH = [
    {
        key: 'addling_arrow', name: 'Flèche déroutante', vo: 'Addling Arrow', cost: '1 action',
        text: 'Tirez sur une cible : sa prochaine attaque doit viser l’autre créature la plus proche, choisie au hasard.',
    },
    {
        key: 'come_get_some', name: 'Viens par ici !', vo: 'Come Get Some!', cost: '1 action',
        text: 'Attaquez une cible. Elle est provoquée par vous jusqu’à la fin de son prochain tour.',
    },
    {
        key: 'decoy', name: 'Leurre', vo: 'Decoy', cost: '0 action',
        text: 'Quand vous vous défendez : l’attaque rate à la place, et vous pouvez vous éloigner de jusqu’à la moitié de votre Vitesse (là où vous étiez réellement depuis le début !).',
    },
    {
        key: 'fleet_feet', name: 'Pieds légers', vo: 'Fleet Feet', cost: '0 action',
        text: '(1/round) Déplacez-vous gratuitement de jusqu’à votre Vitesse, en ignorant le terrain difficile.',
    },
    {
        key: 'grease_trap', name: 'Piège à graisse', vo: 'Grease Trap', cost: '1 action',
        uses: { count: '1', per: 'encounter' },
        text: '(1/rencontre) Réaction (quand un ennemi se déplace à côté de vous ou d’un allié dans une Allonge de 6) : la cible tombe à terre, est vulnérable aux prochains dégâts de feu qu’elle subit, et est traitée comme si elle était fumante.',
    },
    {
        key: 'hail_of_arrows', name: 'Grêle de flèches', vo: 'Hail of Arrows', cost: '2 actions',
        text: '(Demi-Portée) Tirez sur toutes les créatures d’une zone de 3×3 et ralentissez-les.',
    },
    {
        key: 'heavy_shot', name: 'Tir lourd', vo: 'Heavy Shot', cost: '1 action',
        text: '(Demi-Portée) Tirez sur une créature et repoussez-la de 2 cases.',
    },
    {
        key: 'incendiary_shot', name: 'Tir incendiaire', vo: 'Incendiary Shot', cost: '1 action',
        text: '(Demi-Portée) Attaquez avec une arme à distance, ajoutez VOL d8 dégâts de feu.',
    },
    {
        key: 'multishot', name: 'Tir multiple', vo: 'Multishot', cost: '1 action',
        text: '(Demi-Portée) Tirez sur votre proie et choisissez une 2ᵉ cible à 2 cases ou moins d’elle, qui subit les mêmes dégâts.',
    },
    {
        key: 'pinning_shot', name: 'Tir clouant', vo: 'Pinning Shot', cost: '3 actions',
        text: 'Tirez sur votre proie en lançant 3 fois le nombre de dés habituel. Elle est immobilisée jusqu’à ce qu’elle parvienne à se libérer (DD 10+VOL).',
    },
    {
        key: 'snare_trap', name: 'Piège à collet', vo: 'Snare Trap', cost: '1 action',
        uses: { count: '1', per: 'encounter' },
        text: '(1/rencontre) Réaction (quand un ennemi se déplace à côté de vous ou d’un allié dans une Allonge de 6) : faites-le reculer d’1 case et immobilisez-le (DD 10+VOL pour se libérer).',
    },
    {
        key: 'sharpshooter', name: 'Tireur d’élite', vo: 'Sharpshooter', cost: '1 action',
        text: 'Si vous ne vous êtes pas déplacé ce tour et que votre proie se trouve au-delà d’une Allonge de 3, attaquez-la et infligez le double de dégâts.',
    },
    {
        key: 'vital_shot', name: 'Tir vital', vo: 'Vital Shot', cost: '1 action',
        text: '(Demi-Portée) Tirez sur votre proie entravée. Ignorez son armure, ou doublez le bonus de dégâts de votre Marque du chasseur si elle n’en a pas.',
    },
    {
        key: 'wild_instinct', name: 'Instinct sauvage', vo: 'Wild Instinct', cost: '0 action',
        text: '(1/round) (Coûte 0 charge de Frisson si vous n’en avez aucune) Évaluer, avec avantage.',
    },
];

const keyStat = (lvl) => ({
    key: `key_stat_increase_${lvl}`, name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
    statIncrease: { from: 'key', count: 1 }, text: '+1 DEX ou VOL.',
});
const secondaryStat = (lvl) => ({
    key: `secondary_stat_increase_${lvl}`, name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
    statIncrease: { from: 'secondary', count: 1 }, text: '+1 FOR ou INT.',
});
const subclassFeature = (lvl) => ({
    key: `subclass_${lvl}`, name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
    text: 'Gagnez votre capacité de sous-classe de Chasseur.',
});
const toth = (n, ord) => ({
    key: `thrill_of_the_hunt_${n + 1}`, name: `Frisson de la traque (${ord})`, vo: `Thrill of the Hunt (${n})`,
    choice: { pool: 'toth', count: 1 },
    text: `Choisissez une ${ord} capacité de Frisson de la traque.`,
});

export default {
    key: 'hunter', name: 'Chasseur', vo: 'Hunter',
    tagline: 'Gardien de la Nature',
    summary: 'Survivant expert, vous marquez votre proie et devenez un pisteur implacable lancé à sa poursuite. Que vous fassiez pleuvoir les flèches de loin ou que vous vous rapprochiez pour une mise à mort au contact, votre proie ne vous échappera pas. Exploitez le Frisson de la traque pour déjouer vos cibles : posez des leurres, déclenchez des pièges et frappez avec une efficacité mortelle.',
    complexity: 2,
    keyStats: ['dex', 'wil'],
    hitDie: 8, startingHp: 13,
    saves: { adv: 'dex', dis: 'int' },
    armor: { text: 'Armures de cuir', types: ['cloth', 'leather'] },
    weapons: { text: 'Armes de DEX', rule: { stats: ['dex'] } },
    startingGear: [{ key: 'shortbow' }, { key: 'cheap_hides' }, { key: 'dagger' }, { key: 'hunting_trap' }],
    resources: [
        { key: 'toth', label: 'Charges de Frisson', max: null, fromLevel: 2, reset: 'encounter' },
    ],
    spellcasting: null,
    levels: {
        1: [
            {
                key: 'hunters_mark', name: 'Marque du chasseur', vo: "Hunter's Mark", cost: '1 action',
                text: 'Une créature que vous pouvez voir est marquée comme votre proie pendant 1 jour (ou jusqu’à ce que vous en marquiez une autre). Elle ne peut pas se cacher de vous, et vos attaques contre elle gagnent, au choix, l’avantage OU +NIV dégâts (à choisir avant chaque attaque).',
            },
            {
                key: 'forager', name: 'Fourrageur', vo: 'Forager',
                text: 'Gagnez l’avantage aux tests de compétence pour trouver de la nourriture et de l’eau dans la nature.',
            },
        ],
        2: [
            {
                key: 'thrill_of_the_hunt', name: 'Frisson de la traque', vo: 'Thrill of the Hunt',
                choice: { pool: 'toth', count: 2 },
                text: 'Choisissez 2 capacités de Frisson de la traque (FdT). Gagnez une charge à utiliser pour ces capacités pendant la rencontre chaque fois que :\n• vous TOUCHEZ votre proie en mêlée ;\n• vous faites un CRITIQUE contre votre proie à distance ;\n• votre proie meurt.\n**Souviens-toi de la Nature.** Chaque fois que vous passez une journée en pleine nature pendant un repos sûr, vous pouvez choisir d’autres options de Chasseur parmi celles qui vous sont accessibles.',
            },
            {
                key: 'roll_and_strike', name: 'Rouler et frapper', vo: 'Roll & Strike', cost: '1 action',
                text: 'Si vous n’avez aucune charge de Frisson de la traque, déplacez-vous de jusqu’à votre Vitesse vers votre proie. Si vous terminez adjacent à elle, faites gratuitement une attaque de mêlée contre elle.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass', subclass: true,
                text: 'Choisissez une sous-classe de Chasseur.',
            },
            {
                key: 'trackers_intuition', name: 'Intuition du pisteur', vo: 'Tracker’s Intuition',
                text: 'Vous pouvez reconstituer les événements d’une rencontre passée en étudiant les traces et d’autres indices subtils de l’environnement, et déterminer avec précision la nature et le nombre des créatures, leur direction, leurs actions principales et le temps écoulé.',
            },
        ],
        4: [
            toth(2, '3ᵉ'),
            keyStat(4),
            {
                key: 'explorer_of_the_wilds', name: 'Explorateur des terres sauvages', vo: 'Explorer of the Wilds',
                text: '+2 en Vitesse ; gagnez une Vitesse d’escalade.',
            },
        ],
        5: [
            {
                key: 'hunters_resolve', name: 'Résolution du chasseur', vo: 'Hunter’s Resolve',
                text: 'Chaque fois que vous n’avez aucune charge de Frisson de la traque, gagnez Résolution du chasseur jusqu’à la fin de votre tour : traitez toutes les créatures comme votre proie pour les déplacements et les attaques de mêlée.',
            },
            {
                key: 'final_takedown', name: 'Mise à mort finale', vo: 'Final Takedown', cost: '1 action',
                text: '(1 charge de FdT) Faites un critique contre votre proie en sang en mêlée et doublez les dégâts de votre Marque du chasseur. Si elle survit, elle vous inflige un critique en retour.',
            },
            secondaryStat(5),
        ],
        6: [
            {
                key: 'versatile_bowmaster', name: 'Maître archer polyvalent', vo: 'Versatile Bowmaster',
                text: 'Chaque fois que vous attaquez avec un arc long, vous pouvez lancer 2d4 au lieu de 1d8 ; ou avec une arbalète, 2d8 au lieu de 4d4.',
            },
            toth(3, '4ᵉ'),
        ],
        7: [subclassFeature(7)],
        8: [toth(4, '5ᵉ'), keyStat(8)],
        9: [
            {
                key: 'no_escape', name: 'Pas d’échappatoire', vo: 'No Escape',
                text: 'Chaque fois que vous voyez un ou plusieurs alliés faire une attaque d’opportunité, vous pouvez aussi faire une attaque d’opportunité à distance contre la même cible.',
            },
            secondaryStat(9),
        ],
        10: [
            {
                key: 'veteran_stalker', name: 'Traqueur vétéran', vo: 'Veteran Stalker',
                text: 'Gagnez une charge de Frisson de la traque la première fois que vous êtes en sang au cours d’une rencontre, et pour chaque Blessure que vous gagnez.',
            },
            {
                key: 'keen_eye_steady_hand', name: 'Œil vif, main sûre', vo: 'Keen Eye, Steady Hand',
                text: 'Ajoutez votre VOL aux dégâts de vos armes à distance.',
            },
        ],
        11: [subclassFeature(11)],
        12: [toth(5, '6ᵉ'), keyStat(12)],
        13: [
            {
                key: 'keen_sight', name: 'Vue perçante', vo: 'Keen Sight',
                text: 'Avantage aux tests de Perception.',
            },
            secondaryStat(13),
        ],
        14: [toth(6, '7ᵉ')],
        15: [subclassFeature(15)],
        16: [keyStat(16)],
        17: [
            {
                key: 'peerless_hunter', name: 'Chasseur sans pareil', vo: 'Peerless Hunter',
                text: 'Vous pouvez vous défendre gratuitement contre votre proie.',
            },
            secondaryStat(17),
        ],
        18: [
            {
                key: 'wild_endurance', name: 'Endurance sauvage', vo: 'Wild Endurance',
                text: 'Gagnez 1 charge de Frisson de la traque au début de vos tours.',
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
                key: 'nemesis', name: 'Némésis', vo: 'Nemesis',
                statIncrease: { from: 'any', count: 2 },
                text: '+1 à 2 de vos caractéristiques au choix. Votre Marque du chasseur peut cibler simultanément autant de créatures que vous le souhaitez.',
            },
        ],
    },
    options: {
        toth: {
            label: 'Frisson de la traque', vo: 'Thrill of the Hunt',
            text: 'Note : sauf mention contraire, chaque capacité de Frisson de la traque coûte 1 charge et ne peut pas rater. Les capacités qui dépensent des charges ne peuvent pas en générer de nouvelles. Les charges inutilisées sont perdues à la fin du combat.\n**Souviens-toi de la Nature.** Chaque fois que vous passez une journée en pleine nature pendant un repos sûr, vous pouvez choisir d’autres options de Chasseur parmi celles qui vous sont accessibles.',
            items: TOTH,
        },
    },
    subclasses: [
        {
            key: 'shadowpath', name: 'Gardien de la Voie des ombres', vo: 'Keeper of the Shadowpath',
            summary: 'Traquez votre proie depuis les ombres et abattez vos ennemis avec précision et rapidité.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'ambusher', name: 'Embusqué', vo: 'Ambusher',
                        text: 'Chaque fois que vous lancez l’Initiative, utilisez gratuitement Marque du chasseur. Gagnez l’avantage à la première attaque que vous faites à chaque rencontre.',
                    },
                    {
                        key: 'skilled_tracker', name: 'Pisteur habile', vo: 'Skilled Tracker',
                        text: 'Vous avez l’avantage aux tests de compétence pour pister des créatures.',
                    },
                    {
                        key: 'skilled_navigator', name: 'Navigateur habile', vo: 'Skilled Navigator',
                        text: 'Vous ne pouvez pas vous perdre par des moyens non magiques.',
                    },
                ],
                7: [
                    {
                        key: 'primal_predator', name: 'Prédateur primitif', vo: 'Primal Predator',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Vos attaques armées ignorent l’abri et l’armure ce tour.',
                    },
                ],
                11: [
                    {
                        key: 'dread_hunter', name: 'Chasseur redoutable', vo: 'Dread Hunter',
                        text: 'Choisissez les deux options de Marque du chasseur quand vous attaquez votre proie.',
                    },
                ],
                15: [
                    {
                        key: 'apex_predator', name: 'Superprédateur', vo: 'Apex Predator',
                        text: 'Vous pouvez utiliser votre capacité Prédateur primitif deux fois par rencontre. Gagnez 1 charge de Frisson de la traque quand vous lancez l’Initiative.',
                    },
                ],
            },
        },
        {
            key: 'wild_heart', name: 'Gardien du Cœur sauvage', vo: 'Keeper of the Wild Heart',
            summary: 'Survivant plein de ressources, vous pouvez endurer bien plus d’adversité que presque n’importe quel autre aventurier.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'impressive_form', name: 'Forme impressionnante', vo: 'Impressive Form',
                        text: '+5 PV maximum. Vos dés de vie deviennent des d10.',
                    },
                    {
                        key: 'i_have_the_high_ground', name: 'J’ai l’avantage du terrain', vo: 'I Have the High Ground',
                        text: 'Chaque fois que vous lancez l’Initiative ou gagnez une charge de Frisson de la traque, déplacez-vous gratuitement de jusqu’à la moitié de votre Vitesse, en ignorant le terrain difficile.',
                    },
                ],
                7: [
                    {
                        key: 'resourceful_herbalist', name: 'Herboriste ingénieux', vo: 'Resourceful Herbalist',
                        text: 'Ajoutez votre VOL à votre compétence Examen. Chaque fois que vous prenez un repos sûr dans un lieu proche d’un endroit où des plantes ou des champignons peuvent pousser, vous pouvez passer une journée à récolter des herbes médicinales pour fabriquer VOL Baumes de soin.',
                    },
                    {
                        key: 'healing_salve', name: 'Baume de soin', vo: 'Healing Salve', cost: '1 action',
                        roll: { dice: 'WILd8', bonus: '', kind: 'heal', label: 'Baume de soin' },
                        text: '(Allonge 1) Soignez une créature de VOL d8 PV (seul un herboriste expérimenté peut les administrer, et ils expirent chaque fois que vous prenez un repos sûr).',
                    },
                ],
                11: [
                    {
                        key: 'ha_im_over_here', name: 'Ha ! Je suis par ici !', vo: 'Ha! I’m Over Here!',
                        uses: { count: '1', per: 'safeRest' },
                        text: '(1/repos sûr) Si une attaque devait vous faire tomber à 0 PV, vous vous éloignez à la place de jusqu’à votre Vitesse et ne subissez aucun dégât.',
                    },
                ],
                15: [
                    {
                        key: 'unparalleled_survivalist', name: 'Survivant sans égal', vo: 'Unparalleled Survivalist',
                        text: 'Gagnez +VOL en Défense. Quand vous attaquez, vous pouvez d’abord vous déplacer gratuitement de la moitié de votre Vitesse.',
                    },
                ],
            },
        },
        {
            key: 'pack', name: 'Gardien de la Meute', vo: 'Keeper of the Pack',
            summary: 'Même la plus féroce des proies est faible quand elle est isolée, tandis que la meute tire sa force du nombre. Menez depuis le front, achevez la chasse.',
            complexity: 1,
            levels: {
                3: [
                    {
                        key: 'marked_for_death', name: 'Promis à la mort', vo: 'Marked for Death',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Quand vous touchez votre proie en mêlée, les VOL attaques suivantes contre elle sont faites avec avantage 2.',
                    },
                    {
                        key: 'lead_the_hunt', name: 'Mener la chasse', vo: 'Lead the Hunt',
                        text: 'Les alliés proches peuvent ajouter votre VOL à leur jet de Discrétion.',
                    },
                ],
                7: [
                    {
                        key: 'the_lions_share', name: 'La part du lion', vo: 'The Lion’s Share',
                        text: 'Chaque fois que votre proie meurt, gagnez 3×VOL PV temporaires.',
                    },
                    {
                        key: 'fearsome_alpha', name: 'Alpha redoutable', vo: 'Fearsome Alpha',
                        text: 'Votre proie a le désavantage aux attaques de mêlée contre vous.',
                    },
                ],
                11: [
                    {
                        key: 'frenzied_pack', name: 'Meute frénétique', vo: 'Frenzied Pack',
                        text: 'Les alliés dans une Allonge de 2 bénéficient de votre Marque du chasseur en mêlée.',
                    },
                ],
                15: [
                    {
                        key: 'ferocious_takedown', name: 'Mise à mort féroce', vo: 'Ferocious Takedown',
                        text: 'Quand vous tuez votre proie avec Mise à mort finale, récupérez une utilisation de Promis à la mort.',
                    },
                ],
            },
        },
        {
            key: 'traps', name: 'Gardien des Pièges', vo: 'Keeper of Traps',
            summary: 'Les trappeurs audacieux aiment transporter des babioles et des colifichets pour attirer l’attention. Ils y ajoutent souvent une sorte de porte-bonheur, comme une touffe de queue de renard, selon une vieille superstition.',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'hunters_lure', name: 'Appât du chasseur', vo: 'Hunter’s Lure',
                        text: 'Chaque fois que vous utilisez Marque du chasseur, vous pouvez gagner CLÉ PV temporaires et provoquer votre proie jusqu’à ce que vous perdiez ces PV temporaires.',
                    },
                    {
                        key: 'blinding_trap', name: 'Piège aveuglant', vo: 'Blinding Trap',
                        text: 'Réaction (quand un ennemi se déplace à côté de vous ou d’un allié dans une Allonge de 6) : la cible est aveuglée jusqu’à la fin de son prochain tour.',
                    },
                    {
                        key: 'skilled_trapmaker', name: 'Poseur de pièges habile', vo: 'Skilled Trapmaker',
                        text: 'Vous avez l’avantage aux tests de compétence liés aux pièges.',
                    },
                ],
                7: [
                    {
                        key: 'prolific_trapper', name: 'Trappeur prolifique', vo: 'Prolific Trapper',
                        text: 'Chaque fois que vous prenez un repos sûr dans un lieu où vivent des bestioles sauvages, vous pouvez passer une journée à capturer des bestioles pour fabriquer VOL Pièges à bestioles.',
                    },
                    {
                        key: 'critter_trap', name: 'Piège à bestioles', vo: 'Critter Trap', cost: 'réaction gratuite',
                        roll: { dice: 'WILd6', bonus: '', kind: 'plain', label: 'Piège à bestioles' },
                        text: 'Réaction gratuite (quand un ennemi se déplace à côté de vous ou d’un allié dans une Allonge de 6) : lâchez une bestiole qui attaque l’ennemi et lui inflige VOL d6 dégâts. Vous devez relâcher toutes les bestioles capturées chaque fois que vous prenez un repos sûr.',
                    },
                ],
                11: [
                    {
                        key: 'bait_and_switch', name: 'Appâter et esquiver', vo: 'Bait and Switch',
                        text: 'Vous et vos alliés gagnez +2 en Allonge pour vous interposer contre des attaquants provoqués. (1/rencontre) Vous pouvez utiliser Leurre gratuitement quand vous êtes à terre.',
                    },
                ],
                15: [
                    {
                        key: 'trap_master', name: 'Maître des pièges', vo: 'Trap Master',
                        text: 'Chaque fois que vous utilisez un piège, ajoutez-lui NIV dégâts. L’un de vos pièges peut être utilisé une fois de plus par rencontre.',
                    },
                ],
            },
        },
        {
            key: 'beastmaster', name: 'Maître des bêtes', vo: 'Beastmaster', story: true,
            summary: 'Ensemble, inarrêtables.',
            complexity: null,
            levels: {
                3: [
                    {
                        key: 'beastmaster', name: 'Maître des bêtes', vo: 'Beastmaster',
                        choice: { pool: 'companion', count: 1 },
                        text: 'Choisissez un animal de taille Petite, Moyenne ou Grande comme compagnon. À la place de vos 2 premières capacités de Frisson de la traque (FdT), vous pouvez choisir À la gorge ! et Protège-moi !, à utiliser avec votre compagnon (les attaques de votre compagnon comptent comme les vôtres pour gagner des charges de FdT).\n**Aucune caractéristique ni action à suivre !** Les PV et les déplacements de votre compagnon sont abstraits ; il sait où on a le plus besoin de lui sans qu’on le lui dise, que ce soit pour vous défendre ou attaquer votre proie. Il est assez malin, et vous êtes assez attentionné, pour veiller à ce qu’il ne soit jamais mis en danger de mort.\n**Capacités supplémentaires ?** À la discrétion du MJ, votre compagnon peut aussi faire tout ce que l’animal de base sait faire : voler, flairer des odeurs, servir de monture, etc. Même des actions plus complexes comme agripper ou Aider peuvent être possibles si cela a du sens (vous devrez dépenser 1 action pour le lui ordonner : il ne le fera pas de lui-même).',
                    },
                ],
            },
            options: {
                companion: {
                    label: 'Compagnon', vo: 'Companion',
                    text: 'Taille du compagnon et capacités associées. Les compagnons Moyen et Grand exigent le niveau 3.',
                    items: [
                        {
                            key: 'small_companion', name: 'Petit compagnon', vo: 'Small Companion',
                            roll: { dice: '1d4', bonus: 'LVL', kind: 'attack', label: 'À la gorge !' },
                            text: '(Chat, chauve-souris, faucon, raton laveur, coq, furet, etc.)\n**Yeux perçants.** Marquez une cible gratuitement. (1/rencontre ; niv. 7 : 2/rencontre ; niv. 11 : 3/rencontre)\n**Protège-moi !** (1/rencontre) Quand vous vous défendez, l’attaque rate. Déplacez-vous de la moitié de votre Vitesse. Niveau 7 : 2/rencontre.\n**À la gorge !** (0 action, 1 charge de FdT, 1/rencontre) Attaquez votre proie pour 1d4+NIV dégâts (en ignorant l’armure). Niv. 11 : 2/rencontre. Niv. 15 : 3/rencontre.',
                        },
                        {
                            key: 'medium_companion', name: 'Compagnon moyen', vo: 'Medium Companion',
                            roll: { dice: '1d8', bonus: '3*LVL', kind: 'attack', label: 'À la gorge !' },
                            text: '(Loup, sanglier, panthère, vautour, araignée géante, etc.) Niveau 3 requis.\n**Féroce.** Chaque fois que vous faites un critique contre votre proie, infligez +NIV dégâts (en ignorant l’armure) et déplacez-vous gratuitement de jusqu’à 2 cases. (Niv. 7 : 4 cases ; niv. 15 : 6 cases)\n**Protège-moi !** (1/rencontre) Quand vous vous défendez, attaquez d’abord cette créature pour 1d8+NIV dégâts.\n**À la gorge !** (1 action, 1 charge de FdT, 1/rencontre) Attaquez votre proie pour 1d8+(3×NIV) dégâts (en ignorant l’armure). Niv. 11 : 2/rencontre.',
                        },
                        {
                            key: 'large_companion', name: 'Grand compagnon', vo: 'Large Companion',
                            roll: { dice: '1d12', bonus: '4*LVL', kind: 'attack', label: 'À la gorge !' },
                            text: '(Lion, ours-hibou, élan, scorpion géant, drake, etc.) Niveau 3 requis.\n**Protecteur alpha.** Les dégâts de la première attaque contre vous à chaque round sont divisés par deux.\n**Protège-moi !** (1/rencontre) Après que vous avez gagné une Blessure, votre compagnon peut vous emporter en sécurité jusqu’à 12 cases. Niveau 7 : vous êtes emporté avant de gagner la Blessure. Niveau 15 : 2/rencontre.\n**À la gorge !** (2 actions, 1 charge de FdT, 1/rencontre) Attaquez votre proie pour 1d12+(4×NIV) dégâts (en ignorant l’armure). Si cette créature meurt, vous pouvez infliger la moitié de ces dégâts à une autre créature dans une Allonge de 4. Niveau 11 : 2/rencontre.',
                        },
                    ],
                },
            },
        },
    ],
    spells: [],
    faq: [
        {
            q: 'Combien de charges de FdT puis-je détenir ?',
            a: 'Il n’y a pas de limite, mais elles expirent à la fin du combat : utilisez-les !',
        },
        {
            q: 'Un critique en mêlée me donne-t-il une charge ?',
            a: 'Oui. Un critique est aussi une touche.',
        },
        {
            q: 'Est-ce que je gagne une charge de FdT quand n’importe qui tue ma proie ?',
            a: 'Oui. Mais si c’est vous qui la tuez, vous pouvez obtenir une charge supplémentaire pour l’avoir touchée ou lui avoir infligé un critique.',
        },
        {
            q: 'Les capacités comme Grêle de flèches et Tir clouant infligent-elles aussi des dégâts ?',
            a: 'Oui, elles infligent des dégâts normalement.',
        },
        {
            q: 'Qu’est-ce que la Demi-Portée ?',
            a: 'La moitié de la Portée de votre arme (par ex. la Portée normale d’un arc long est 16 ; sa Demi-Portée est 8).',
        },
        {
            q: 'Mise à mort finale : elle me fait un critique en retour. Peut-on se défendre ou s’interposer contre ce critique ?',
            a: 'Oui. Traitez-le comme une attaque normale, mais passez son dé primaire à sa valeur maximale.',
        },
        {
            q: 'Tir clouant : est-ce que je lance trois fois, ou est-ce que j’ai trois dés primaires ?',
            a: 'Non. Lancez une seule fois, avec 3 fois le nombre de dés que vous lanceriez normalement (par ex. arc long 1d8 » 3d8).',
        },
        {
            q: 'Némésis fait de tout ma proie. Chaque touche en mêlée me donne-t-elle maintenant une charge ?',
            a: 'Oui.',
        },
    ],
};
