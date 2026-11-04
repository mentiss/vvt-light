// src/client/src/systems/nimble/config/classes/stormshifter.js
// Source : Nimble Heroes — Stormshifter 3.0 (PDF, p. 2-14 ; sorts de foudre et de vent p. 15 : écoles communes, dans config/spells.js).
// Classe Mue-tempête : 20 niveaux, formes de bête redoutable, faveurs chimériques, sous-classes, FAQ.

export default {
    key: 'stormshifter', name: 'Mue-tempête', vo: 'Stormshifter',
    tagline: 'Maître du croc et de la tempête',
    summary: 'Aidez vos alliés dans le rôle le plus nécessaire : dégâts, soins ou contrôle. Plongez dans la mêlée sous la forme d’une bête, amicale, féroce, indomptable… ou HORRIBLE. Lancez à distance de puissants sorts pour terrasser, contrôler, soigner, et plus encore.',
    complexity: 3,
    keyStats: ['wil', 'dex'],
    hitDie: 8, startingHp: 13,
    saves: { adv: 'wil', dis: 'str' },
    armor: { text: 'Armures de tissu ou de cuir', types: ['cloth', 'leather'] },
    weapons: { text: 'Bâtons, baguettes', rule: { tags: ['staff'], wand: true } },
    startingGear: [{ key: 'cheap_hides' }, { key: 'staff' }, { key: 'strange_plant' }],
    resources: [
        { key: 'direbeast', label: 'Formes de bête redoutable', max: 'DEX', reset: 'encounter' },
        { key: 'mana', label: 'Mana', max: '3*WIL+LVL', fromLevel: 2, reset: 'safeRest' },
    ],
    spellcasting: {
        schools: ['lightning', 'wind'],
        tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8, 18: 9 },
        note: 'Tours de magie de foudre et de vent dès le niveau 1. Mana : (VOL×3)+NIV. Certaines sous-classes ajoutent une école (Ciel et Tempête : glace ou radiant) ou en remplacent une (Braise et Cendre : feu ; Venin et Toile : nécrotique).',
    },
    levels: {
        1: [
            {
                key: 'master_of_storms', name: 'Maître des tempêtes', vo: 'Master of Storms',
                text: 'Vous connaissez les écoles de la foudre et du vent, et pouvez lancer leurs tours de magie.',
            },
            {
                key: 'beastshift', name: 'Mue bestiale', vo: 'Beastshift',
                cost: '1 action',
                text: 'Action : transformez-vous en une bête inoffensive (écureuil, pigeon, etc.). Tant que vous êtes transformé, vous pouvez parler avec les animaux. La Mue bestiale dure jusqu’à ce que vous tombiez à 0 PV, que vous lanciez un sort, ou que vous y mettiez fin gratuitement pendant votre tour.',
            },
            {
                key: 'direbeast_form', name: 'Forme de bête redoutable', vo: 'Direbeast Form',
                text: 'Vous pouvez prendre par Mue bestiale une forme de bête redoutable DEX fois par rencontre (pendant 1 minute au plus). Vous connaissez la forme de Bête effroyable.',
                uses: { count: 'DEX', per: 'encounter' },
            },
        ],
        2: [
            {
                key: 'mana_tier_1', name: 'Mana et sorts de rang 1', vo: 'Mana and Unlock Tier 1 Spells',
                text: 'Vous débloquez les sorts de rang 1 et gagnez une réserve de mana pour les lancer. Le maximum de cette réserve est toujours égal à (VOL×3)+NIV et elle se recharge lors d’un repos sûr.',
            },
            {
                key: 'direbeast_form_2', name: 'Forme de bête redoutable (2)', vo: 'Direbeast Form (2)',
                text: 'Vous pouvez prendre par Mue bestiale la forme de Bête de la meute.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass',
                text: 'Choisissez une sous-classe de Mue-tempête.',
                subclass: true,
            },
        ],
        4: [
            {
                key: 'tier_2_spells', name: 'Sorts de rang 2', vo: 'Tier 2 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 2.',
            },
            {
                key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou DEX.',
                statIncrease: { from: 'key', count: 1 },
            },
            {
                key: 'stormcaller', name: 'Mande-tempête', vo: 'Stormcaller',
                text: 'Apprenez un sort utilitaire de chaque école de magie que vous connaissez.',
            },
            {
                key: 'be_wild', name: 'Vie sauvage', vo: 'Be Wild',
                text: 'Chaque fois que vous passez une journée avec des animaux sauvages pendant un repos sûr, vous pouvez choisir d’autres options de Mue-tempête parmi celles qui vous sont accessibles.',
            },
        ],
        5: [
            {
                key: 'direbeast_form_3', name: 'Forme de bête redoutable (3)', vo: 'Direbeast Form (3)',
                text: 'Vous pouvez prendre par Mue bestiale la forme de Bête de cauchemar.',
            },
            {
                key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
            {
                key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou INT.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        6: [
            {
                key: 'chimeric_boon', name: 'Faveur chimérique', vo: 'Chimeric Boon',
                text: 'Choisissez 2 faveurs chimériques. Chaque fois que vous prenez par Mue bestiale une forme de bête redoutable, vous pouvez la modifier avec 1 faveur chimérique que vous connaissez.',
                choice: { pool: 'chimeric_boons', count: 2 },
            },
            {
                key: 'tier_3_spells', name: 'Sorts de rang 3', vo: 'Tier 3 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 3.',
            },
        ],
        7: [
            {
                key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Mue-tempête.',
                subclassFeature: true,
            },
            {
                key: 'stormcaller_2', name: 'Mande-tempête (2)', vo: 'Stormcaller (2)',
                text: 'Apprenez un 2ᵉ sort utilitaire de chaque école de magie que vous connaissez.',
            },
        ],
        8: [
            {
                key: 'tier_4_spells', name: 'Sorts de rang 4', vo: 'Tier 4 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 4.',
            },
            {
                key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou DEX.',
                statIncrease: { from: 'key', count: 1 },
            },
            {
                key: 'stormborn', name: 'Né de la tempête', vo: 'Stormborn',
                text: 'Vous devenez chargé chaque fois que vous lancez l’Initiative. Avantage aux tests de Nature et aux jets de sauvegarde de concentration.',
            },
        ],
        9: [
            {
                key: 'chimeric_boon_2', name: 'Faveur chimérique (2)', vo: 'Chimeric Boon (2)',
                text: 'Choisissez une 3ᵉ faveur chimérique.',
                choice: { pool: 'chimeric_boons', count: 1 },
                upgrades: 'chimeric_boons',
            },
            {
                key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou INT.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        10: [
            {
                key: 'tier_5_spells', name: 'Sorts de rang 5', vo: 'Tier 5 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 5.',
            },
            {
                key: 'upgraded_cantrips_10', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
        ],
        11: [
            {
                key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Mue-tempête.',
                subclassFeature: true,
            },
        ],
        12: [
            {
                key: 'tier_6_spells', name: 'Sorts de rang 6', vo: 'Tier 6 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 6.',
            },
            {
                key: 'chimeric_boon_3', name: 'Faveur chimérique (3)', vo: 'Chimeric Boon (3)',
                text: 'Choisissez une 4ᵉ faveur chimérique.',
                choice: { pool: 'chimeric_boons', count: 1 },
                upgrades: 'chimeric_boons',
            },
            {
                key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou DEX.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        13: [
            {
                key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou INT.',
                statIncrease: { from: 'secondary', count: 1 },
            },
            {
                key: 'stormborn_2', name: 'Né de la tempête (2)', vo: 'Stormborn (2)',
                text: 'Chaque fois que vous mettez fin à une forme de bête redoutable, vous pouvez lancer gratuitement un tour de magie.',
            },
        ],
        14: [
            {
                key: 'tier_7_spells', name: 'Sorts de rang 7', vo: 'Tier 7 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 7.',
            },
        ],
        15: [
            {
                key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Mue-tempête.',
                subclassFeature: true,
            },
            {
                key: 'upgraded_cantrips_15', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
        ],
        16: [
            {
                key: 'tier_8_spells', name: 'Sorts de rang 8', vo: 'Tier 8 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 8.',
            },
            {
                key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou DEX.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        17: [
            {
                key: 'chimeric_boon_4', name: 'Faveur chimérique (4)', vo: 'Chimeric Boon (4)',
                text: 'Choisissez une 5ᵉ faveur chimérique.',
                choice: { pool: 'chimeric_boons', count: 1 },
                upgrades: 'chimeric_boons',
            },
            {
                key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou INT.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        18: [
            {
                key: 'tier_9_spells', name: 'Sorts de rang 9', vo: 'Tier 9 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 9.',
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
                key: 'archdruid', name: 'Archidruide', vo: 'Archdruid',
                text: '+1 à 2 de vos caractéristiques au choix. Après avoir lancé un sort de rang 1 ou plus, vous pouvez utiliser la Mue bestiale pour 0 action.',
                statIncrease: { from: 'any', count: 2 },
            },
            {
                key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
        ],
    },
    options: {
        // Formes acquises par niveau (1, 2, 5), pas choisies : listées ici pour la fiche.
        direbeast_forms: {
            label: 'Formes de bête redoutable', vo: 'Direbeast Forms',
            text: 'Bête effroyable au niveau 1, Bête de la meute au niveau 2, Bête de cauchemar au niveau 5. Chaque forme se prend par Mue bestiale (DEX fois par rencontre, pendant 1 minute au plus).',
            items: [
                {
                    key: 'fearsome_beast', name: 'Bête effroyable', vo: 'Fearsome Beast',
                    cost: '1 action',
                    text: 'Transformez-vous en une bête de taille grande. Vous gagnez VOL en Défense, VOL+NIV PV temporaires, l’avantage aux jets de sauvegarde de FOR, et :\n**Effroyable.** Chaque fois que vous vous interposez ou vous défendez, vous pouvez dépenser 1 mana pour forcer l’attaquant à relancer l’attaque (vous devez choisir l’un ou l’autre résultat).\n**Encorner.** 1 action : 1d8+NIV dégâts ; en cas de touche : vous gagnez NIV PV temporaires.',
                    roll: { dice: '1d8', bonus: 'LVL', kind: 'attack', label: 'Encorner' },
                },
                {
                    key: 'beast_of_the_pack', name: 'Bête de la meute', vo: 'Beast of the Pack',
                    cost: '1 action',
                    text: 'Transformez-vous en une bête de taille moyenne. Vous gagnez +DEX en Vitesse, vous pouvez vous déplacer gratuitement de DEX cases à chaque tour, vous avez l’avantage aux jets de sauvegarde de DEX, et :\n**Pas de l’éclair.** (1 fois par tour) Dépensez 1 mana pour vous téléporter gratuitement de DEX cases.\n**Frénésie.** 1 action : 1d6+NIV dégâts. Votre prochaine attaque gagne un avantage croissant au lieu du désavantage. Ce bonus repart de zéro chaque fois que vous faites un critique, ou après que vous utilisez une autre attaque.',
                    roll: { dice: '1d6', bonus: 'LVL', kind: 'attack', label: 'Frénésie' },
                },
                {
                    key: 'beast_of_nightmares', name: 'Bête de cauchemar', vo: 'Beast of Nightmares',
                    cost: '1 action',
                    text: 'Transformez-vous en n’importe quelle bête ou insecte de taille minuscule (à condition qu’il soit horrible). Vous gagnez :\n**Silencieux mais mortel.** Vitesse : 2. Les attaquants ne peuvent pas vous cibler tant que vous ne vous faites pas remarquer (par exemple en attaquant ou en étant vu en train de vous transformer). Les attaques contre vous ont le désavantage. Vous ne pouvez ni vous défendre ni vous interposer, et tout dégât met fin à cette forme.\n**Dard.** 1 action : (1 fois par round, Allonge 0) 1d4+3×NIV dégâts d’acide (en ignorant l’armure) ; en cas de critique : étourdi.',
                    roll: { dice: '1d4', bonus: '3*LVL', kind: 'attack', label: 'Dard' },
                },
            ],
        },
        chimeric_boons: {
            label: 'Faveurs chimériques', vo: 'Chimeric Boons',
            text: 'Chaque fois que vous prenez par Mue bestiale une forme de bête redoutable, vous pouvez la modifier avec 1 faveur chimérique que vous connaissez.\n**Vie sauvage.** Chaque fois que vous passez une journée avec des animaux sauvages pendant un repos sûr, vous pouvez choisir d’autres options de Mue-tempête parmi celles qui vous sont accessibles.',
            items: [
                {
                    key: 'beast_of_the_sea', name: 'Bête des mers', vo: 'Beast of the Sea',
                    text: 'Chaque fois que vous vous défendez contre une attaque de mêlée, vous pouvez aveugler l’attaquant jusqu’au début de son prochain tour. Vous pouvez vous déplacer, respirer et combattre sous l’eau sans pénalité.',
                },
                {
                    key: 'climber', name: 'Grimpeur', vo: 'Climber',
                    text: 'Vous pouvez marcher normalement sur les murs et les plafonds ; vous ignorez le terrain difficile.',
                },
                {
                    key: 'fleet_footed', name: 'Pied léger', vo: 'Fleet Footed',
                    text: 'Vous pouvez vous déplacer gratuitement de 2 cases à chaque tour. Avantage aux tests de Discrétion et contre le fait d’être agrippé.',
                },
                {
                    key: 'earthwalker', name: 'Arpenteur des profondeurs', vo: 'Earthwalker',
                    text: '+FOR en Défense. Vous pouvez creuser à travers le sol (tant que vous ne terminez pas votre tour sous terre). Vous pouvez vous relever gratuitement pendant votre tour quand vous êtes à terre.',
                },
                {
                    key: 'keen_senses', name: 'Sens aiguisés', vo: 'Keen Senses',
                    text: 'Avantage aux tests de Perception et d’Évaluer. Vous n’êtes pas affecté par l’état aveuglé.',
                },
                {
                    key: 'leader_of_the_pack', name: 'Chef de meute', vo: 'Leader of the Pack',
                    text: 'Avantage contre les effets de peur et de charme, pour vous et pour vos alliés à Allonge 6. Vos alliés peuvent se déplacer gratuitement de 2 cases vers vous à chacun de leurs tours.',
                },
                {
                    key: 'phasebeast', name: 'Bête de phase', vo: 'Phasebeast',
                    text: 'Chaque fois que vous passez de cette forme à votre forme normale (et inversement), vous pouvez vous téléporter jusqu’à 6 cases vers un endroit que vous voyez.',
                },
                {
                    key: 'prehensile_tail', name: 'Queue préhensile', vo: 'Prehensile Tail',
                    text: 'Vos attaques de mêlée gagnent : en cas de touche : agrippé (1 au maximum).',
                },
                {
                    key: 'winged', name: 'Ailé', vo: 'Winged',
                    text: 'Vous gagnez une Vitesse de vol. Les déplacements forcés vous déplacent deux fois plus loin quand vous volez.',
                },
            ],
        },
    },
    subclasses: [
        {
            key: 'sky_and_storm', name: 'Cercle du Ciel et de la Tempête', vo: 'Circle of Sky & Storm',
            summary: 'Accordez-vous aux cieux, vastes et sans limite. Maniez l’orage qui approche, à l’intensité sans fin.',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'deepening_study', name: 'Étude approfondie', vo: 'Deepening Study',
                        text: 'Choisissez d’apprendre l’école de la glace ou l’école radiante.',
                    },
                    {
                        key: 'creature_of_the_fey', name: 'Créature féerique', vo: 'Creature of the Fey',
                        text: 'Vous pouvez lancer des sorts sous Mue bestiale.',
                    },
                    {
                        key: 'attuned_to_nature', name: 'En harmonie avec la nature', vo: 'Attuned to Nature',
                        text: '(VOL fois par repos sûr) Ajoutez NIV à n’importe quel test de compétence lié à la nature ou au climat.',
                        uses: { count: 'WIL', per: 'safeRest' },
                    },
                ],
                7: [{
                    key: 'raging_tempest', name: 'Tempête déchaînée', vo: 'Raging Tempest',
                    text: 'Chaque fois que vous faites un critique avec un sort, vous pouvez lancer gratuitement un tour de magie d’une école dont vous n’avez lancé aucun sort ce tour-ci.',
                }],
                11: [{
                    key: 'primordial_force', name: 'Force primordiale', vo: 'Primordial Force',
                    text: '(1 fois par round) Vos sorts de rang 1 ou plus confèrent un effet supplémentaire :\n• **Glace.** Vous gagnez VOL PV temporaires.\n• **Foudre.** Infligez VOL dégâts supplémentaires.\n• **Radiant.** (Allonge 6) Soignez une créature de VOL PV.\n• **Vent.** Volez gratuitement jusqu’à 6 cases.',
                }],
                15: [{
                    key: 'master_of_storm', name: 'Maître de l’orage', vo: 'Master of Storm',
                    text: 'Vous pouvez vous concentrer sur 1 sort de foudre et 1 sort de vent en même temps. (1 fois par rencontre) Lorsque vous lancez un sort de rang 1 ou plus, il coûte 1 action et 3 mana de moins.',
                    uses: { count: '1', per: 'encounter' },
                }],
            },
        },
        {
            key: 'fang_and_claw', name: 'Cercle du Croc et de la Griffe', vo: 'Circle of Fang & Claw',
            summary: 'Canalisez les forces primordiales pour vous transformer plus vite et plus férocement qu’auparavant. Incarnez la férocité des terres sauvages et déchaînez-la sur les ennemis proches.',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'swiftshift', name: 'Mue éclair', vo: 'Swiftshift',
                        text: 'Chaque fois que vous lancez l’Initiative, vous pouvez utiliser la Mue bestiale gratuitement. (1 fois par tour) Vous pouvez passer d’une forme de bête redoutable à une autre pour 0 action (cela coûte toujours une charge de forme de bête redoutable).',
                    },
                    {
                        key: 'unleash_the_beast', name: 'Libérer la bête', vo: 'Unleash the Beast',
                        text: 'Encorner provoque aussi la cible jusqu’à la fin de son prochain tour. Frénésie passe à 1d8+NIV dégâts.',
                    },
                ],
                7: [
                    {
                        key: 'windborne_protector', name: 'Protecteur porté par le vent', vo: 'Windborne Protector',
                        text: 'Doublez les bonus de Défense (VOL) et de PV temporaires de la forme de Bête effroyable. (1 fois par rencontre) Vous pouvez vous interposer depuis Allonge 12.',
                        uses: { count: '1', per: 'encounter' },
                    },
                    {
                        key: 'stormstrider', name: 'Arpenteur d’orage', vo: 'Stormstrider',
                        text: 'Doublez les bonus de déplacement (DEX) et de Vitesse de la Bête de la meute. Lorsque vous vous déplacez sous la forme de Bête de la meute, vous pouvez vous téléporter à la place.',
                    },
                ],
                11: [{
                    key: 'master_of_forms', name: 'Maître des formes', vo: 'Master of Forms',
                    text: '(1 fois par rencontre) Lorsque vous devriez rater ou faire un critique sous une forme de bête redoutable, vous pouvez à la place augmenter ou diminuer le dé primaire de 1.',
                    uses: { count: '1', per: 'encounter' },
                }],
                15: [{
                    key: 'chimeric_sovereign', name: 'Souverain chimérique', vo: 'Chimeric Sovereign',
                    text: 'Vous connaissez toutes les faveurs chimériques ; vos formes de bête redoutable peuvent en avoir 2 à la fois.',
                }],
            },
        },
        {
            key: 'cinder_and_ash', name: 'Cercle de la Braise et de la Cendre', vo: 'Circle of Cinder & Ash',
            summary: 'Le feu a un rôle important dans la nature : il débarrasse des pans de forêt de leurs impuretés ou des vieilles espèces envahissantes pour faire place au neuf.',
            complexity: 3,
            levels: {
                3: [
                    {
                        key: 'wildfire', name: 'Feu de forêt', vo: 'Wildfire',
                        text: 'Remplacez votre école de la foudre ou du vent par l’école du feu.',
                    },
                    {
                        key: 'searing_fang', name: 'Croc brûlant', vo: 'Searing Fang',
                        text: 'Avant d’utiliser la Mue bestiale, vous pouvez lancer gratuitement le sort Arme enchantée (*Enchant Weapon*) sur vous-même.\n**Sorts gratuits.** Ils sont lancés à leur rang de base, mais vous pouvez dépenser du mana supplémentaire comme d’habitude pour les amplifier.',
                    },
                    {
                        key: 'firesight', name: 'Vision du feu', vo: 'Firesight',
                        text: 'Vous avez l’avantage aux tests de compétence liés au feu.',
                    },
                ],
                7: [{
                    key: 'phoenix_flame', name: 'Flamme du phénix', vo: 'Phoenix Flame',
                    text: '(1 fois par rencontre) Vous pouvez lancer Pyroclasme (*Pyroclasm*) pour 0 mana ; vous gagnez autant de PV temporaires que le résultat obtenu. Être mourant ne met pas fin à vos formes de Mue bestiale ; tant que vous êtes mourant, vous gagnez le vol.',
                    uses: { count: '1', per: 'encounter' },
                }],
                11: [{
                    key: 'cinderhide', name: 'Peau de braise', vo: 'Cinderhide',
                    text: 'Vous pouvez lancer Barrière de flammes (*Flame Barrier*) sous Mue bestiale, et pour 2 mana de moins.',
                }],
                15: [{
                    key: 'kindled_kin', name: 'Parenté embrasée', vo: 'Kindled Kin',
                    text: 'Chaque fois que vous gagnez des PV temporaires, choisissez un allié à Allonge 6 qui en gagne autant.',
                }],
            },
        },
        {
            key: 'venom_and_web', name: 'Cercle du Venin et de la Toile', vo: 'Circle of Venom & Web',
            summary: 'Des Mue-tempêtes qui s’allient à la nature des araignées et puisent leur pouvoir dans ces créatures minuscules mais mortelles.',
            complexity: 3,
            // Répartition 7 / 11 : le livret empile « LEVEL 7 » et « LEVEL 11 » devant le même bloc ;
            // découpage retenu : 2 capacités au niveau 7, 2 au niveau 11.
            levels: {
                3: [
                    {
                        key: 'deadly_nature', name: 'Nature mortelle', vo: 'Deadly Nature',
                        text: 'Remplacez votre école de la foudre ou du vent par l’école nécrotique.',
                    },
                    {
                        key: 'too_many_legs', name: 'Trop de pattes, trop d’yeux', vo: 'Too Many Legs, Too Many Eyes',
                        text: 'Vos formes bestiales gagnent gratuitement Grimpeur ou Sens aiguisés.',
                    },
                    {
                        key: 'venom_sacs', name: 'Glandes à venin', vo: 'Venom Sacs',
                        text: 'Les attaques de vos formes bestiales gagnent : en cas de touche : vous pouvez dépenser du mana pour augmenter votre dé primaire de 1 par mana dépensé (jusqu’au rang de sorts que vous avez débloqué) ; en cas de critique : empoisonné jusqu’à la fin de son prochain tour.',
                    },
                ],
                7: [
                    {
                        key: 'ensnare', name: 'Prendre au piège', vo: 'Ensnare',
                        text: 'Chaque fois que vous vous interposez ou vous défendez contre une attaque de mêlée, vous pouvez dépenser 1 mana pour immobiliser l’attaquant jusqu’à la fin de son prochain tour, s’il est de votre taille ou plus petit.',
                    },
                    {
                        key: 'sudden_terror', name: 'Terreur soudaine', vo: 'Sudden Terror',
                        cost: 'réaction',
                        text: '(1 fois par rencontre) Réaction (lorsque vous êtes attaqué en mêlée) : prenez gratuitement la forme de Bête de cauchemar et chevauchez l’attaquant (il doit relancer avec désavantage).',
                        uses: { count: '1', per: 'encounter' },
                    },
                ],
                11: [
                    {
                        key: 'dread_voice', name: 'Voix d’effroi', vo: 'Dread Voice',
                        text: 'Vous pouvez lancer des sorts nécrotiques sous Mue bestiale.',
                    },
                    {
                        key: 'fear_toxin', name: 'Toxine de peur', vo: 'Fear Toxin',
                        text: 'Votre poison effraie aussi.',
                    },
                ],
                15: [
                    {
                        key: 'skitter', name: 'Grouillement', vo: 'Skitter',
                        text: 'Votre forme de Bête de cauchemar obtient gratuitement la faveur chimérique Pied léger.',
                    },
                    {
                        key: 'spiderling_swarm', name: 'Nuée d’araignées', vo: 'Spiderling Swarm',
                        text: 'Prendre au piège empoisonne aussi les créatures tant qu’elles sont immobilisées.',
                    },
                ],
            },
        },
    ],
    spells: [],
    faq: [
        { q: 'Prendre la forme d’une bête inoffensive a-t-il une limite de temps ou coûte-t-il une charge ?', a: 'Non.' },
        { q: 'Puis-je lancer des sorts sous forme animale ?', a: 'Oui. Mais cela met fin à la forme (sauf si une capacité spéciale vous permet de la conserver).' },
        { q: 'En passant d’une forme de bête redoutable à une autre, est-ce que je conserve les PV temporaires et les bonus de Frénésie ?', a: 'Oui, mais ils prennent fin avec le combat s’ils ne sont pas dépensés. Les autres effets passifs (par exemple la Défense ou le déplacement supplémentaires) ne sont pas conservés.' },
        { q: 'Puis-je accumuler de l’avantage avec Frénésie puis lancer un sort avec ?', a: 'Oui. Amusez-vous bien !' },
        { q: 'Les PV temporaires de la Bête effroyable et d’Encorner se cumulent-ils ?', a: 'Non. Les PV temporaires ne se cumulent pas.' },
        { q: 'Puis-je utiliser la Mue bestiale en étant mourant ?', a: 'Oui. Tomber à 0 PV met fin à toute forme active, mais vous pouvez vous transformer à nouveau en étant mourant.' },
    ],
};
