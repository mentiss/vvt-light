// src/client/src/systems/nimble/config/classes/commander.js
// Source : Nimble Heroes — Commander 3.0 (PDF, p. 3-18 du livret).
// Classe Commandant : 20 niveaux, Ordres du commandant, Tactiques de combat, Maîtrises d’armes, sous-classes (dont la Lame-sort), FAQ.

const ORDERS = [
    {
        key: 'commanding_presence', name: 'Présence impérieuse', vo: 'Commanding Presence', cost: '1 action',
        uses: { count: '1', per: 'encounter' },
        text: '(1/rencontre) Faites un test d’Influence et ordonnez à un ennemi d’accomplir une seule action simple ; il passe tout son prochain tour à obéir :\n• 1–9 : **Bouge !** La créature se déplace à l’endroit de votre choix.\n• 10–19 : **À genoux !** Déplacez-la, puis elle est considérée comme à terre.\n• 20+ : **Frappe !** Elle se déplace et attaque une cible de votre choix.',
    },
    {
        key: 'face_me', name: 'Face à moi !', vo: 'Face Me!', cost: '0 action',
        text: 'Après qu’un ennemi a fait un critique ou attaqué un allié mourant, vous pouvez le provoquer. Cela dure jusqu’à ce que vous tombiez à 0 PV.',
    },
    {
        key: 'hold_the_line', name: 'Tenez la ligne !', vo: 'Hold the Line!', cost: '1 action',
        uses: { count: '1', per: 'encounter' },
        text: '(1/rencontre) Réaction (quand un allié tombe à 0 PV) : ordonnez-lui de continuer le combat ! Fixez ses PV à 3× votre NIV.',
    },
    {
        key: 'i_can_do_this_all_day', name: 'Je peux tenir TOUTE LA JOURNÉE !', vo: 'I Can Do This ALL DAY!', cost: '1 action',
        uses: { count: '1', per: 'encounter' },
        text: '(1/rencontre) Réaction (quand vous devriez tomber à 0 PV) : dépensez autant de dés de vie que vous le souhaitez et fixez vos PV à la somme obtenue à la place (n’ajoutez pas votre FOR).',
    },
    {
        key: 'move_it_move_it', name: 'Bougez ! Bougez !', vo: 'Move it! Move it!',
        text: 'Quand vous lancez l’Initiative, donnez-vous, ainsi qu’à un allié, l’avantage au jet et +3 en Vitesse pendant 1 round.',
    },
    {
        key: 'reposition', name: 'Repositionnez-vous !', vo: 'Reposition!', cost: '1 action',
        text: 'Ordonnez à 1 allié de se déplacer gratuitement de jusqu’à sa Vitesse (ou à 2 alliés de jusqu’à la moitié de leur Vitesse). Vous pouvez utiliser cette capacité comme réaction pendant le tour d’un allié.',
    },
];

const TACTICS = [
    {
        key: 'heavy_strike', name: 'Frappe lourde', vo: 'Heavy Strike',
        text: 'Chaque fois que vous touchez, infligez +dé de combat dégâts et repoussez votre cible de FOR cases.',
    },
    {
        key: 'inerrant_strike', name: 'Frappe infaillible', vo: 'Inerrant Strike',
        text: 'Chaque fois que vous ratez, ajoutez 1 au dé primaire et infligez +dé de combat dégâts.',
    },
    {
        key: 'lunging_strike', name: 'Frappe fendante', vo: 'Lunging Strike',
        text: 'Chaque fois que vous attaquez, gagnez +1 en Allonge et +2× dé de combat dégâts.',
    },
    {
        key: 'sweeping_strike', name: 'Frappe balayante', vo: 'Sweeping Strike',
        text: 'Chaque fois que vous attaquez, dépensez 1 action supplémentaire pour choisir n’importe quelle zone d’un seul tenant à l’Allonge de votre arme, et infligez +dé de combat dégâts à TOUTES les cibles qui s’y trouvent (les attaques de zone ne ratent pas sur un 1 et ne font pas de critique sur le maximum).',
    },
];

const WEAPON_MASTERIES = [
    {
        key: 'slashing', name: 'Tranchant', vo: 'Slashing',
        text: '(1/tour) Vos attaques avec des armes tranchantes peuvent frapper 1 créature supplémentaire adjacente à vous et à votre cible.',
    },
    {
        key: 'bludgeoning', name: 'Contondant', vo: 'Bludgeoning',
        text: '(1/tour) Vos attaques avec des armes contondantes infligent +10 dégâts aux adversaires en armure.',
    },
    {
        key: 'piercing', name: 'Perforant', vo: 'Piercing',
        text: '(1/tour) Vos attaques avec des armes perforantes peuvent frapper une autre créature située derrière votre cible, à votre Allonge.',
    },
];

const keyStat = (lvl) => ({
    key: `key_stat_increase_${lvl}`, name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
    statIncrease: { from: 'key', count: 1 }, text: '+1 FOR ou INT.',
});
const secondaryStat = (lvl) => ({
    key: `secondary_stat_increase_${lvl}`, name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
    statIncrease: { from: 'secondary', count: 1 }, text: '+1 DEX ou VOL.',
});
const subclassFeature = (lvl) => ({
    key: `subclass_${lvl}`, name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
    text: 'Gagnez votre capacité de sous-classe de Commandant.',
});
// « Fit for Any Battlefield (N) » : une capacité de combat de plus ou +1 dé de combat maximum.
const fitForAnyBattlefield = (n) => ({
    key: `fit_for_any_battlefield_${n}`, name: `Paré pour tout champ de bataille (${n})`, vo: `Fit for Any Battlefield (${n})`,
    choice: { pool: 'tactics', count: 1 },
    text: 'Choisissez une autre capacité de combat ou gagnez +1 dé de combat maximum.',
});

export default {
    key: 'commander', name: 'Commandant', vo: 'Commander',
    tagline: 'Soldat. Guerrier. Chef intrépide.',
    summary: 'Donnez de puissants ordres tactiques à vos alliés, renforcez leurs capacités et coordonnez des frappes dévastatrices. Exercez votre maîtrise sur tous les types d’armes et maniez-les avec une efficacité mortelle, pour vous assurer la victoire contre n’importe quel ennemi. Menez votre groupe au triomphe par la ruse stratégique, le talent tactique et l’action décisive.',
    complexity: 2,
    keyStats: ['str', 'int'],
    hitDie: 10, startingHp: 17,
    saves: { adv: 'str', dis: 'dex' },
    armor: { text: 'Armures de mailles, boucliers', types: ['cloth', 'leather', 'mail', 'shield'] },
    weapons: { text: 'Toutes les armes martiales', rule: { all: true } },
    startingGear: [{ key: 'short_sword' }, { key: 'javelins', qty: 4 }, { key: 'rusty_mail' }],
    resources: [
        {
            key: 'combat_dice', label: 'Dés de combat', max: 'STR', die: 'd6',
            dieByLevel: { 2: 'd6', 5: 'd8', 9: 'd10', 13: 'd12', 17: 'd20' },
            fromLevel: 2, reset: 'encounter',
        },
        {
            key: 'coordinated_strike_pool', label: 'Réserve de Frappes coordonnées', max: 'INT',
            maxByLevel: { 5: 'INT', 9: 'INT+1', 13: 'INT+2', 17: 'INT+3' },
            fromLevel: 5, reset: 'safeRest',
        },
    ],
    spellcasting: null,
    levels: {
        1: [
            {
                key: 'coordinated_strike', name: 'Frappe coordonnée !', vo: 'Coordinated Strike!',
                uses: { count: '1', per: 'encounter' },
                text: '(1/rencontre) Vous et un allié dans une Allonge de 6 faites tous deux immédiatement et gratuitement une frappe armée ou à mains nues, ou lancez un tour de magie.',
            },
        ],
        2: [
            {
                key: 'fit_for_any_battlefield', name: 'Paré pour tout champ de bataille', vo: 'Fit for Any Battlefield',
                choice: { pool: 'tactics', count: 1 },
                text: 'Choisissez une Tactique de combat. Quand vous lancez l’Initiative, gagnez FOR dés de combat (chacun un d6) ; ils sont perdus à la fin du combat s’ils n’ont pas été dépensés.',
            },
            {
                key: 'field_medic', name: 'Médecin de campagne', vo: 'Field Medic',
                text: 'Lancez 1 dé supplémentaire pour toute potion de soin que vous administrez. Chaque fois que vous ou un allié dépensez des dés de vie pour récupérer des PV, si vous avez passé au moins dix minutes à examiner ses blessures, il peut ajouter votre bonus d’Examen aux PV récupérés.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass', subclass: true,
                text: 'Choisissez une sous-classe de Commandant.',
            },
        ],
        4: [
            {
                key: 'commanders_orders', name: 'Ordres du commandant', vo: 'Commander’s Orders',
                choice: { pool: 'orders', count: 2 },
                text: 'Choisissez 2 Ordres du commandant.\n**Entraînement rigoureux.** Chaque fois que vous vous entraînez avec votre groupe ou d’autres soldats pendant un repos sûr, vous pouvez choisir d’autres options de Commandant parmi celles qui vous sont accessibles.',
            },
            keyStat(4),
        ],
        5: [
            {
                key: 'master_commander', name: 'Maître commandant', vo: 'Master Commander',
                text: 'Vos dés de combat sont désormais des d8. Vous gagnez une réserve supplémentaire de INT utilisations de Frappe coordonnée par repos sûr (vous ne pouvez utiliser Frappe coordonnée qu’1/round). Les attaques faites grâce à vos Frappes coordonnées ignorent désormais le désavantage.',
            },
            secondaryStat(5),
        ],
        6: [
            fitForAnyBattlefield(2),
            {
                key: 'weapon_mastery', name: 'Maîtrise d’arme', vo: 'Weapon Mastery',
                choice: { pool: 'weapon_mastery', count: 1 },
                text: 'Vous pouvez rengainer une arme et en dégainer une autre 2×/round gratuitement. Choisissez une Maîtrise d’arme.',
            },
        ],
        7: [subclassFeature(7)],
        8: [fitForAnyBattlefield(3), keyStat(8)],
        9: [
            {
                key: 'master_commander_2', name: 'Maître commandant (2)', vo: 'Master Commander (2)',
                text: 'Vos dés de combat sont désormais des d10. +1 utilisation de Frappe coordonnée.',
            },
            secondaryStat(9),
        ],
        10: [
            fitForAnyBattlefield(4),
            {
                key: 'weapon_mastery_2', name: 'Maîtrise d’arme (2)', vo: 'Weapon Mastery (2)',
                choice: { pool: 'weapon_mastery', count: 1 },
                text: 'Choisissez une 2ᵉ Maîtrise d’arme.',
            },
        ],
        11: [subclassFeature(11)],
        12: [fitForAnyBattlefield(5), keyStat(12)],
        13: [
            {
                key: 'master_commander_3', name: 'Maître commandant (3)', vo: 'Master Commander (3)',
                text: 'Vos dés de combat sont désormais des d12. +1 utilisation de Frappe coordonnée.',
            },
            secondaryStat(13),
        ],
        14: [
            {
                key: 'weapon_mastery_3', name: 'Maîtrise d’arme (3)', vo: 'Weapon Mastery (3)',
                text: 'Vous maîtrisez complètement tous les types d’armes.',
            },
        ],
        15: [subclassFeature(15)],
        16: [fitForAnyBattlefield(6), keyStat(16)],
        17: [
            {
                key: 'master_commander_4', name: 'Maître commandant (4)', vo: 'Master Commander (4)',
                text: 'Vos dés de combat sont désormais des d20. +1 utilisation de Frappe coordonnée.',
            },
            secondaryStat(17),
        ],
        18: [
            {
                key: 'unparalleled_tactics', name: 'Tactique sans égale', vo: 'Unparalleled Tactics',
                text: 'La première fois de chaque rencontre que vous utilisez Frappe coordonnée, un allié qui peut vous entendre gagne aussi 1 action à utiliser lors de son prochain tour.',
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
                key: 'captain_of_legions', name: 'Capitaine des légions', vo: 'Captain of Legions',
                statIncrease: { from: 'any', count: 2 },
                text: '+1 à 2 de vos caractéristiques au choix. La 1ʳᵉ fois de chaque rencontre que vous utilisez Frappe coordonnée, INT alliés gagnent +1 action (remplace Tactique sans égale).',
            },
        ],
    },
    options: {
        orders: {
            label: 'Ordres du commandant', vo: 'Commander’s Orders',
            text: '**Entraînement rigoureux.** Chaque fois que vous vous entraînez avec votre groupe ou d’autres soldats pendant un repos sûr, vous pouvez choisir d’autres options de Commandant parmi celles qui vous sont accessibles.',
            items: ORDERS,
        },
        tactics: {
            label: 'Tactiques de combat', vo: 'Combat Tactics',
            text: 'Chaque fois que vous attaquez, vous pouvez lancer et dépenser un dé de combat pour utiliser une Tactique de combat (1 au maximum par attaque).',
            items: TACTICS,
        },
        weapon_mastery: {
            label: 'Maîtrises d’armes', vo: 'Weapon Mastery',
            text: 'Choisissez une maîtrise d’arme aux niveaux 6, 10 et 14.',
            items: WEAPON_MASTERIES,
        },
    },
    subclasses: [
        {
            key: 'bulwark', name: 'Champion du Rempart', vo: 'Champion of the Bulwark',
            summary: 'Devenez un mastodonte bardé de fer et soutenez votre groupe par vos prouesses défensives.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'armor_master', name: 'Maître des armures', vo: 'Armor Master',
                        text: 'Vous maîtrisez les armures de plaques.',
                    },
                    {
                        key: 'shield_expert', name: 'Expert du bouclier', vo: 'Shield Expert',
                        text: 'Quand vous êtes équipé d’un bouclier, vous pouvez vous défendre gratuitement ; dans ce cas, vous pouvez infliger à un ennemi adjacent des dégâts égaux à la Défense de votre bouclier.',
                    },
                ],
                7: [
                    {
                        key: 'juggernaut', name: 'Mastodonte', vo: 'Juggernaut',
                        text: 'Quand vous utilisez Frappe coordonnée, vous pouvez dépenser une action supplémentaire pour ajouter 1 à votre dé primaire et infliger des dégâts supplémentaires égaux à votre Défense.',
                    },
                ],
                11: [
                    {
                        key: 'taunting_strike', name: 'Frappe provocante', vo: 'Taunting Strike',
                        text: '(1/tour) Vous pouvez provoquer une créature que vous attaquez jusqu’à la fin de son prochain tour.',
                    },
                ],
                15: [
                    {
                        key: 'shield_wall', name: 'Mur de boucliers', vo: 'Shield Wall',
                        text: '(Allonge 2) Vos boucliers gagnent +2 en Défense. Vos alliés peuvent aussi utiliser la Défense de votre bouclier quand ils se défendent.',
                    },
                ],
            },
        },
        {
            key: 'phalanx', name: 'Champion de la Phalange', vo: 'Champion of the Phalanx',
            summary: '« Unis, nous tenons ; divisés, nous tombons ! »',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'polearm_mastery', name: 'Maîtrise des armes d’hast', vo: 'Polearm Mastery',
                        text: 'Les armes d’Allonge 2 gagnent +1 en Allonge ; OU peuvent être maniées à une main avec un bouclier.',
                    },
                    {
                        key: 'skewer', name: 'Embrocher', vo: 'Skewer',
                        text: 'Vous pouvez faire des attaques d’opportunité contre les ennemis qui entrent à l’Allonge de votre arme. Si le déplacement était forcé, attaquez avec avantage au lieu du désavantage.',
                    },
                ],
                7: [
                    {
                        key: 'formation_march', name: 'Marche en formation', vo: 'Formation March',
                        text: 'Chaque fois que vous vous déplacez, les alliés à l’Allonge de votre arme peuvent se déplacer gratuitement avec vous.',
                    },
                ],
                11: [
                    {
                        key: 'together_we_stand', name: 'Unis, nous tenons', vo: 'Together We Stand',
                        text: 'Ajoutez 1 à vos jets de dés de combat pour chaque allié à l’Allonge de votre arme.',
                    },
                ],
                15: [
                    {
                        key: 'shoulder_to_shoulder', name: 'Épaule contre épaule', vo: 'Shoulder to Shoulder',
                        text: 'Les alliés à l’Allonge de votre arme gagnent +1 en Allonge avec leurs armes et bénéficient de vos Maîtrises d’armes.',
                    },
                ],
            },
        },
        {
            key: 'vanguard', name: 'Champion de l’Avant-garde', vo: 'Champion of the Vanguard',
            summary: 'Un général qui charge en tête et mène depuis le front !',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'advance', name: 'En avant !', vo: 'Advance!',
                        text: '(Allonge 12) Chaque fois que vous utilisez votre Frappe coordonnée, vous et tous vos alliés pouvez d’abord vous déplacer gratuitement de jusqu’à la moitié de votre Vitesse respective. Gagnez l’avantage à la première attaque de mêlée que vous faites contre les ennemis vers lesquels vous vous êtes déplacé ce tour.',
                    },
                ],
                7: [
                    {
                        key: 'experienced_commander', name: 'Commandant expérimenté', vo: 'Experienced Commander',
                        text: 'Votre Frappe coordonnée peut cibler 1 allié supplémentaire.',
                    },
                ],
                11: [
                    {
                        key: 'survey_the_battlefield', name: 'Embrasser le champ de bataille', vo: 'Survey the Battlefield',
                        text: 'Quand vous lancez l’Initiative, récupérez 1 utilisation de Frappe coordonnée. +1 dé de combat maximum.',
                    },
                ],
                15: [
                    {
                        key: 'as_one', name: 'Comme un seul homme !', vo: 'As One!',
                        text: 'Toutes les attaques faites grâce à votre Frappe coordonnée sont faites avec avantage.',
                    },
                ],
            },
        },
        {
            key: 'arena', name: 'Champion de l’Arène', vo: 'Champion of the Arena',
            summary: 'Un combattant simple et obstiné qui ne vise que la gloire !',
            complexity: 1,
            levels: {
                3: [
                    {
                        key: 'single_minded_fighter', name: 'Combattant obstiné', vo: 'Single-minded Fighter',
                        text: 'Vous renoncez à tous les Ordres du commandant. Chaque fois que vous devriez en choisir un, vous gagnez +1 dé de combat maximum à la place.',
                    },
                    {
                        key: 'showstopping_strike', name: 'Frappe spectaculaire', vo: 'Showstopping Strike',
                        uses: { count: '1', per: 'safeRest' },
                        text: '(1/repos sûr) Quand vous utilisez Frappe coordonnée, vous et votre allié faites tous deux automatiquement un critique.',
                    },
                    {
                        key: 'glory_seeker', name: 'Chercheur de gloire', vo: 'Glory Seeker',
                        text: '(1/round) Chaque fois qu’un allié fait un critique, votre prochaine attaque est faite avec avantage.',
                    },
                ],
                7: [
                    {
                        key: 'pushed_to_the_brink', name: 'Poussé à bout', vo: 'Pushed to the Brink',
                        text: 'Frappe spectaculaire se recharge la première fois de chaque rencontre que vous gagnez l’état mourant.',
                    },
                    {
                        key: 'remarkable_strategy', name: 'Stratégie remarquable', vo: 'Remarkable Strategy',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Quand vous évaluez avec une compétence d’INT, vous pouvez lancer un dé de combat et l’ajouter au résultat (sans le dépenser).',
                    },
                ],
                11: [
                    {
                        key: 'superior_striker', name: 'Frappeur supérieur', vo: 'Superior Striker',
                        text: 'Gagnez +FOR à l’Initiative. Frappe spectaculaire se recharge quand vous lancez l’Initiative.',
                    },
                ],
                15: [
                    {
                        key: 'outlast_outmatch', name: 'Tenir plus longtemps, frapper plus fort', vo: 'Outlast, Outmatch',
                        text: 'Votre Frappe coordonnée vous accorde aussi, à vous et à votre allié, des PV temporaires égaux à la valeur maximale de votre dé de combat.',
                    },
                ],
            },
        },
        {
            key: 'siege_breaker', name: 'Champion Brise-siège', vo: 'Champion of the Siege-Breaker',
            summary: 'Déchaînez des tactiques de combat agressives pour désorganiser vos ennemis. Laissez le bouclier derrière vous, il ne ferait que vous alourdir.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'siege_veteran', name: 'Vétéran des sièges', vo: 'Siege Veteran',
                        text: '+FOR en Défense quand vous maniez une arme à deux mains.',
                    },
                    {
                        key: 'mighty_cleave', name: 'Fendoir puissant', vo: 'Mighty Cleave',
                        text: 'Chaque fois que vos dés de dégâts d’une attaque de mêlée totalisent 8 ou plus, vous pouvez choisir 1 cible supplémentaire à l’Allonge de votre arme.',
                    },
                ],
                7: [
                    {
                        key: 'shatter_formation', name: 'Briser la formation', vo: 'Shatter Formation', cost: '1 action',
                        text: '(Nouvelle Tactique de combat) Lancez un dé de combat et infligez autant de dégâts à jusqu’à FOR cibles à l’Allonge de votre arme, et repoussez-les de 2. Vous pouvez utiliser cette capacité pendant un déplacement.',
                    },
                ],
                11: [
                    {
                        key: 'relentless_assault', name: 'Assaut implacable', vo: 'Relentless Assault',
                        text: '+2 dés de combat maximum. Vous lancez les dés de combat avec avantage.',
                    },
                    {
                        key: 'tear_asunder', name: 'Mettre en pièces', vo: 'Tear Asunder',
                        text: '(Nouvelle Tactique de combat) Frappez un adversaire en armure et infligez +dé de combat dégâts. La prochaine attaque non critique contre lui ignore l’armure.',
                    },
                ],
                15: [
                    {
                        key: 'against_the_hordes', name: 'Face aux hordes', vo: 'Against the Hordes',
                        text: 'S’il y a 2 ennemis ou plus à l’Allonge de votre arme, vos attaques de mêlée ont l’avantage et déclenchent toujours Fendoir puissant.',
                    },
                ],
            },
        },
        {
            key: 'spellblade', name: 'Lame-sort', vo: 'Spellblade', story: true,
            summary: 'L’acier rencontre le sort.',
            complexity: null,
            levels: {
                3: [
                    {
                        key: 'arcane_command', name: 'Commandement arcanique', vo: 'Arcane Command',
                        text: 'Votre attention portée aux arcanes vous fait perdre l’accès aux Maîtrises d’armes et aux Tactiques de combat, mais vous gagnez désormais INT mana quand vous lancez l’Initiative (ce mana est perdu s’il n’est pas dépensé à la fin du combat). Chaque fois que vous pourriez choisir une Tactique de combat ou une Maîtrise d’arme, choisissez à la place un autre Ordre du commandant ou un sort de rang 1 (ou inférieur) de n’importe quelle école de magie. Vos Ordres du commandant sont aussi imprégnés de puissance magique :\n• **Face à moi ! (Décret scintillant).** Réaction gratuite (chaque fois qu’un ennemi fait un critique ou attaque un allié mourant) : cet ennemi subit FOR d8 dégâts radiants (en ignorant l’armure), est attiré de jusqu’à 4 cases vers vous, et est provoqué par vous jusqu’à ce que vous tombiez à 0 PV.\n• **Bougez ! Bougez ! (Porté par le vent).** Quand vous lancez l’Initiative, vous pouvez vous donner, ainsi qu’à un allié, l’avantage au jet, +3 en Vitesse et la capacité de voler pendant 1 round. Ensuite, vous pouvez aussi tous deux vous déplacer gratuitement.\n• **Tenez la ligne ! (Armure cristalline).** (1/rencontre) Réaction (quand un allié tombe à 0 PV) : ordonnez-lui de continuer le combat ! Fixez ses PV à 3× votre NIV. De plus, il gagne autant de PV temporaires. Les ennemis qui réduisent ces PV temporaires au corps à corps voient leur Vitesse divisée par deux jusqu’à la fin de leur prochain tour.\n• **Repositionnez-vous ! (Pas éclair).** Action : ordonnez à 1 allié de se déplacer gratuitement de jusqu’à sa Vitesse (ou à 2 alliés de jusqu’à la moitié de leur Vitesse) ; vous pouvez échanger votre place avec l’un d’eux. Vous pouvez utiliser cette capacité comme réaction pendant le tour d’un allié.\n• **Je peux tenir TOUTE LA JOURNÉE ! (Phénix renaissant).** (1/rencontre) Réaction (quand vous devriez tomber à 0 PV) : vous pouvez dépenser autant de dés de vie que vous le souhaitez, fixer vos PV à la somme obtenue à la place, et infliger autant de dégâts de feu à chaque ennemi dans une Allonge de 2 autour de vous. Ils deviennent fumants.\n• **Présence impérieuse (Présence flétrissante).** Les créatures auxquelles vous donnez un ordre subissent des dégâts nécrotiques égaux à la valeur maximale de votre dé de combat (en ignorant l’armure) et sont considérées comme des morts-vivants pendant 1 round.',
                    },
                    {
                        key: 'spellforge', name: 'Forge-sort', vo: 'Spellforge',
                        text: 'Quand vous lancez l’Initiative, vous pouvez lancer gratuitement Enchantement d’arme (amplification possible normalement en dépensant du mana supplémentaire).',
                    },
                    {
                        key: 'deep_knowledge_1', name: 'Savoir profond (1)', vo: 'Deep Knowledge (1)',
                        text: 'Choisissez n’importe quel sort de rang 1 (ou inférieur) et n’importe quel sort utilitaire.',
                    },
                ],
                7: [
                    {
                        key: 'deep_knowledge_2', name: 'Savoir profond (2)', vo: 'Deep Knowledge (2)',
                        text: 'Choisissez n’importe quel sort de rang 2 (ou inférieur) et n’importe quel sort utilitaire.',
                    },
                ],
                11: [
                    {
                        key: 'deep_knowledge_3', name: 'Savoir profond (3)', vo: 'Deep Knowledge (3)',
                        text: 'Choisissez n’importe quel sort de rang 3 (ou inférieur) et n’importe quel sort utilitaire.',
                    },
                ],
                15: [
                    {
                        key: 'deep_knowledge_4', name: 'Savoir profond (4)', vo: 'Deep Knowledge (4)',
                        text: 'Choisissez n’importe quel sort de rang 4 (ou inférieur) et n’importe quel sort utilitaire.',
                    },
                ],
            },
        },
    ],
    spells: [],
    faq: [
        {
            q: 'Comment fonctionnent les attaques de mêlée de zone ?',
            a: 'La zone choisie doit avoir un sens : si un allié se trouve entre deux ennemis, vous ne pouvez pas frapper les deux ennemis en épargnant l’allié !',
        },
        {
            q: 'Frappe balayante et la maîtrise Tranchant se cumulent-elles ?',
            a: 'Non.',
        },
        {
            q: 'Rempart : Expert du bouclier. Puis-je me défendre plus d’une fois par round si c’est gratuit ?',
            a: 'Non. Gratuit signifie simplement que cela ne coûte pas d’action ; les réactions restent limitées à 1/round.',
        },
    ],
};
