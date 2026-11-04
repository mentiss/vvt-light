// src/client/src/systems/nimble/config/classes/songweaver.js
// Source : Nimble Heroes — Songweaver 3.0 (PDF, p. 2-14).
// Classe Tisse-chant : 20 niveaux, Arsenal lyrique, Carnet d'adresses, sous-classes, Moquerie cruelle, FAQ.

export default {
    key: 'songweaver', name: 'Tisse-chant', vo: 'Songweaver',
    tagline: 'Essayez donc de résister à mon charme ! (Attendez… NON, NE FAITES PAS ÇA !)',
    summary: 'Charmez les malheureux que vous croisez et inspirez vos alliés vers de fantastiques nouveaux sommets d’héroïsme ! Servez-vous de votre Arsenal lyrique et de votre puissant charisme pour dominer vos ennemis, jusqu’à détourner leurs attaques et les retourner contre leurs propres alliés ! Contrôlez le champ de bataille d’un accord de chaos, d’une ballade héroïque d’enfer ou d’une rhapsodie débilitante.',
    complexity: 3,
    keyStats: ['wil', 'int'],
    hitDie: 8, startingHp: 13,
    saves: { adv: 'wil', dis: 'str' },
    armor: { text: 'Armures de tissu et de cuir', types: ['cloth', 'leather'] },
    weapons: { text: 'Armes de DEX, baguettes', rule: { stats: ['dex'], wand: true } },
    startingGear: [{ key: 'adventurers_garb' }, { key: 'instrument' }, { key: 'dagger' }, { key: 'mirror' }],
    resources: [
        { key: 'inspiration', label: 'Inspiration du Tisse-chant', max: '2*WIL', reset: 'safeRest' },
        { key: 'mana', label: 'Mana', max: '3*INT+LVL', fromLevel: 2, reset: 'safeRest' },
    ],
    spellcasting: {
        schools: ['wind'],
        tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8, 18: 9 },
        note: 'Tours de magie du vent et Moquerie cruelle dès le niveau 1. Au niveau 2, choisissez 1 école de magie supplémentaire à apprendre. Mana : (INT×3)+NIV.',
    },
    levels: {
        1: [
            {
                key: 'windbag', name: 'Moulin à paroles', vo: 'Windbag',
                text: 'Vous connaissez les tours de magie du vent et le sort Moquerie cruelle.',
            },
            {
                key: 'songweavers_inspiration', name: 'Inspiration du Tisse-chant', vo: 'Songweaver’s Inspiration',
                cost: 'réaction gratuite',
                text: '(2×VOL fois par repos sûr) Réaction gratuite : permettez à un allié de relancer un dé unique, quel qu’il soit, ou d’augmenter de 1 le résultat obtenu.',
                uses: { count: '2*WIL', per: 'safeRest' },
            },
        ],
        2: [
            {
                key: 'wind_spellcasting', name: 'Magie du vent, et…', vo: 'Wind Spellcasting and…',
                text: 'Choisissez 1 école de magie supplémentaire à apprendre.',
            },
            {
                key: 'mana_tier_1', name: 'Mana et sorts de rang 1', vo: 'Mana and Unlock Tier 1 Spells',
                text: 'Vous débloquez les sorts de rang 1 et gagnez une réserve de mana pour les lancer. Le maximum de cette réserve est toujours égal à (INT×3)+NIV et elle se recharge lors d’un repos sûr.',
            },
            {
                key: 'jack_of_all_trades', name: 'Touche-à-tout', vo: 'Jack of All Trades',
                text: 'Chaque fois que vous prenez un repos sûr, vous pouvez déplacer un point de compétence comme si vous veniez de monter de niveau.',
            },
            {
                key: 'song_of_rest', name: 'Chant du repos', vo: 'Song of Rest',
                text: 'Chaque fois que vous prenez un repos de terrain, les créatures amies gagnent +1 aux soins pour chaque dé de vie dépensé.',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass',
                text: 'Choisissez une sous-classe de Tisse-chant.',
                subclass: true,
            },
            {
                key: 'quick_wit', name: 'Esprit vif', vo: 'Quick Wit',
                text: 'Lorsque vous lancez l’Initiative, récupérez 2 utilisations dépensées de votre Inspiration du Tisse-chant (elles expirent à la fin du combat si elles ne sont pas dépensées).',
            },
            {
                key: 'i_know_just_the_song', name: 'J’ai la chanson qu’il faut', vo: 'I Know Just the Song',
                text: 'Choisissez 1 sort utilitaire de chaque école de magie que vous connaissez.',
            },
        ],
        4: [
            {
                key: 'tier_2_spells', name: 'Sorts de rang 2', vo: 'Tier 2 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 2.',
            },
            {
                key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou INT.',
                statIncrease: { from: 'key', count: 1 },
            },
            {
                key: 'lyrical_weaponry', name: 'Arsenal lyrique', vo: 'Lyrical Weaponry',
                text: 'Choisissez 1 capacité de la liste Arsenal lyrique.',
                choice: { pool: 'lyrical_weaponry', count: 1 },
            },
            {
                key: 'perform', name: 'En scène !', vo: 'Perform!',
                text: 'Chaque fois que vous vous produisez dans un lieu qui vous inspire, ou que vous échangez des piques avec un autre manieur de mots compétent pendant un repos sûr, vous pouvez choisir d’autres options de Tisse-chant parmi celles qui vous sont accessibles.',
            },
        ],
        5: [
            {
                key: 'a_people_person', name: 'Carnet d’adresses', vo: 'A “People” Person',
                text: 'Vous avez rencontré bien des gens au cours de vos voyages ; certains ont même accepté de vous venir en aide si vous en aviez besoin. Choisissez 2 amis que vous connaissez : vous pouvez les invoquer temporairement par le chant (1 fois par repos sûr chacun).',
                choice: { pool: 'people', count: 2 },
            },
            {
                key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
            {
                key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou DEX.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        6: [
            {
                key: 'tier_3_spells', name: 'Sorts de rang 3', vo: 'Tier 3 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 3.',
            },
            {
                key: 'i_know_just_the_song_2', name: 'J’ai la chanson qu’il faut (2)', vo: 'I Know Just the Song (2)',
                text: 'Choisissez un 2ᵉ sort utilitaire de chaque école de magie que vous connaissez.',
            },
        ],
        7: [
            {
                key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Tisse-chant.',
                subclassFeature: true,
            },
        ],
        8: [
            {
                key: 'tier_4_spells', name: 'Sorts de rang 4', vo: 'Tier 4 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 4.',
            },
            {
                key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou INT.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        9: [
            {
                key: 'lyrical_weaponry_2', name: 'Arsenal lyrique (2)', vo: 'Lyrical Weaponry (2)',
                text: 'Choisissez une 2ᵉ capacité de la liste Arsenal lyrique.',
                choice: { pool: 'lyrical_weaponry', count: 1 },
                upgrades: 'lyrical_weaponry',
            },
            {
                key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou DEX.',
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
                text: 'Vous gagnez votre capacité de sous-classe de Tisse-chant.',
                subclassFeature: true,
            },
        ],
        12: [
            {
                key: 'tier_6_spells', name: 'Sorts de rang 6', vo: 'Tier 6 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 6.',
            },
            {
                key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
                text: '+1 VOL ou INT.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        13: [
            {
                key: 'lyrical_weaponry_3', name: 'Arsenal lyrique (3)', vo: 'Lyrical Weaponry (3)',
                text: 'Choisissez une 3ᵉ capacité de la liste Arsenal lyrique.',
                choice: { pool: 'lyrical_weaponry', count: 1 },
                upgrades: 'lyrical_weaponry',
            },
            {
                key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou DEX.',
                statIncrease: { from: 'secondary', count: 1 },
            },
        ],
        14: [
            {
                key: 'tier_7_spells', name: 'Sorts de rang 7', vo: 'Tier 7 Spells',
                text: 'Vous pouvez désormais lancer des sorts jusqu’au rang 7.',
            },
            {
                key: 'i_know_just_the_song_3', name: 'J’ai la chanson qu’il faut (3)', vo: 'I Know Just the Song (3)',
                text: 'Vous connaissez tous les sorts utilitaires des écoles de magie que vous connaissez.',
            },
        ],
        15: [
            {
                key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass',
                text: 'Vous gagnez votre capacité de sous-classe de Tisse-chant.',
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
                text: '+1 VOL ou INT.',
                statIncrease: { from: 'key', count: 1 },
            },
        ],
        17: [
            {
                key: 'lyrical_weaponry_4', name: 'Arsenal lyrique (4)', vo: 'Lyrical Weaponry (4)',
                text: 'Choisissez une 4ᵉ capacité de la liste Arsenal lyrique.',
                choice: { pool: 'lyrical_weaponry', count: 1 },
                upgrades: 'lyrical_weaponry',
            },
            {
                key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
                text: '+1 FOR ou DEX.',
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
                key: 'im_so_famous', name: 'Je suis tellement célèbre !', vo: 'I’m So Famous!',
                text: '+1 à 2 de vos caractéristiques au choix. Votre Inspiration du Tisse-chant accorde aussi à cet allié l’avantage sur tous ses jets suivants de ce round.',
                statIncrease: { from: 'any', count: 2 },
            },
            {
                key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips',
                text: 'Vos tours de magie gagnent en puissance.',
            },
        ],
    },
    options: {
        lyrical_weaponry: {
            label: 'Arsenal lyrique', vo: 'Lyrical Weaponry',
            text: '**En scène !** Chaque fois que vous vous produisez dans un lieu qui vous inspire, ou que vous échangez des piques avec un autre manieur de mots compétent pendant un repos sûr, vous pouvez choisir d’autres options de Tisse-chant parmi celles qui vous sont accessibles.',
            items: [
                {
                    key: 'heroic_ballad', name: 'Ballade héroïque', vo: 'Heroic Ballad',
                    cost: '1 action',
                    text: '+2 charges maximales d’Inspiration du Tisse-chant. Lorsqu’elle sert à faire relancer l’attaque d’un allié, votre Inspiration du Tisse-chant lui accorde aussi +VOL aux dégâts.',
                },
                {
                    key: 'inspiring_anthem', name: 'Hymne exaltant', vo: 'Inspiring Anthem',
                    cost: '1 action',
                    text: '(1 fois par rencontre) Accordez 1 PV et 1 action à toutes les créatures amies mourantes qui peuvent vous entendre.',
                    uses: { count: '1', per: 'encounter' },
                },
                {
                    key: 'not_my_beautiful_face', name: 'Pas mon joli minoiiis !', vo: 'Not My Beautiful Faaace!',
                    text: 'Passif. (1 fois par rencontre) Lorsque vous vous défendez, forcez l’attaquant à choisir une autre cible à portée s’il rate un jet de sauvegarde de VOL (s’il n’y en a aucune, l’attaque échoue). S’il le rate de 5 ou plus, il s’attaque lui-même ! S’il le réussit, il relance l’attaque et choisit l’un ou l’autre résultat.',
                    uses: { count: '1', per: 'encounter' },
                },
                {
                    key: 'rhapsody_of_the_normal', name: 'Rhapsodie de la banalité', vo: 'Rhapsody of the Normal',
                    cost: '1 action',
                    text: 'Lorsque vous obtenez 4 ou plus sur Moquerie cruelle, vous pouvez dépenser une charge d’Inspiration du Tisse-chant pour supprimer temporairement toutes les capacités spéciales de la cible jusqu’à la fin de son prochain tour. Elle ne peut faire que ce que ferait un villageois moyen sans entraînement : attaquer une fois pour 1d4 dégâts et se déplacer de 6 cases au plus (pas d’armure, de lancement de sorts, de vol, de régénération ni d’autres capacités innées ou acquises).',
                },
                {
                    key: 'song_of_domination', name: 'Chant de domination', vo: 'Song of Domination',
                    cost: '2 actions',
                    text: '(Allonge 6, 1 fois par rencontre) Déplacez de 6 cases tous les ennemis qui peuvent vous entendre s’ils ratent un jet de sauvegarde de VOL, de moitié moins s’ils le réussissent. Ils ne peuvent pas se déplacer lors de leur prochain tour.',
                    uses: { count: '1', per: 'encounter' },
                },
            ],
        },
        people: {
            label: 'Carnet d’adresses', vo: 'A “People” Person',
            text: '**La saveur est gratuite.** Si vous préférez un barde plus traditionnel (un gardien des légendes anciennes) plutôt que des gens que vous connaissez, les personnages ci-dessous peuvent être réinterprétés comme des légendes célèbres de l’histoire que vous invoquez magiquement par le chant. N’hésitez pas à voir avec votre MJ pour y parvenir. Tant que les mécaniques restent à peu près les mêmes, amusez-vous !\n**Créer vos propres relations.** Vous pouvez, avec votre MJ, remplacer Stompy, Mamie Gran, Mal et Linos par vos propres créations si vous le souhaitez : 1 personne de combat dont les dégâts évoluent avec votre niveau (inspirez-vous des autres sorts et capacités pour des dégâts ou effets appropriés), 1 personne de soutien hors combat, 1 qui peut aider dans les situations narratives et 1 qui peut apporter une aide ponctuelle. Suivez ce schéma général et tout ira bien !\n**Note d’équilibrage.** Si vous ne voulez jamais en utiliser une, rendez-la un peu plus forte ; si vous l’utilisez trop souvent, envisagez de baisser légèrement sa puissance ou d’ajouter un autre inconvénient.',
            items: [
                {
                    key: 'stompy', name: 'Stompy', vo: 'Stompy',
                    cost: '2 actions',
                    text: 'Invoquez un énorme géant des collines pendant 1 round. Lorsqu’il entre sur le champ de bataille, adjacent à vous, utilisez le Piétinement de Stompy : faites un test d’Influence DD 10. En cas de réussite, il se déplace de 6 cases dans la direction de votre choix ; en cas d’échec, il se déplace vers VOUS (« TOI PAS AMI ! »). Il inflige NIV + le résultat du test d’Influence en dégâts à tout ce qui se trouve sur son chemin. N’IMPORTE QUELLE autre créature à Allonge 6 de Stompy peut utiliser cette capacité une fois à la place d’une attaque.',
                    uses: { count: '1', per: 'safeRest' },
                },
                {
                    key: 'mal_the_malevolent_imp', name: 'Mal, le diablotin malveillant', vo: 'Mal, the Malevolent Imp',
                    text: 'Invoquez un minuscule fiélon pour 1 nuit. Il peut découvrir des informations dangereuses que vous n’avez aucun droit de connaître ! Ou « s’occuper » d’un problème, avec seulement un très léger risque que les choses tournent mal. Faites un test d’Influence pour le convaincre de vous aider (avec avantage si vous lui demandez quelque chose qu’il trouverait espiègle ou amusant ; avec désavantage s’il s’agit de quelque chose qu’il trouverait bon ou servile).',
                    uses: { count: '1', per: 'safeRest' },
                },
                {
                    key: 'gran_gran', name: 'Mamie Gran (PAS une guenaude)', vo: 'Gran Gran (NOT a hag)',
                    text: 'Pendant un repos, vous pouvez l’invoquer pour 1 heure afin qu’elle panse vos plaies (et vous houspille parce que vous ne mangez pas assez). Elle cuisine et distribue VOL+INT pâtisseries. En manger une rend un point de mana, un dé de vie ou une Blessure. Mangez-les tant qu’elles sont chaudes ! Elles se gâtent au bout de 10 minutes.',
                    uses: { count: '1', per: 'safeRest' },
                },
                {
                    key: 'linos_the_everfriendly', name: 'Linos, l’Ami de toujours', vo: 'Linos, the Everfriendly',
                    text: 'Invoquez une créature volante légendaire (mais amicale) qui vous emmène, vous et votre groupe, partout où vous devez aller. Il peut réclamer une très grande quantité de nourriture en paiement.',
                    uses: { count: '1', per: 'safeRest' },
                },
            ],
        },
    },
    subclasses: [
        {
            key: 'snark', name: 'Héraut du Persiflage', vo: 'Herald of Snark',
            summary: 'Rien de mal à une petite plaisanterie de temps en temps ! Distrayez et découragez vos ennemis par des tours de l’esprit.',
            complexity: 2,
            levels: {
                3: [{
                    key: 'opportunistic_snark', name: 'Pique opportune', vo: 'Opportunistic Snark',
                    cost: 'réaction',
                    text: 'Réaction (Portée 12, lorsqu’un ennemi rate une attaque) : vous pouvez lui lancer Moquerie cruelle ; lancée ainsi, elle inflige le double de dégâts et ne peut pas rater.',
                }],
                7: [{
                    key: 'fight_picker', name: 'Fauteur de bagarre', vo: 'Fight Picker',
                    text: '(1 fois par tour) Lorsqu’un ennemi subit des dégâts de votre Moquerie cruelle, vous pouvez faire en sorte que ce soit l’un de vos alliés qui le provoque, à la place, jusqu’à la fin du tour de l’ennemi.',
                }],
                11: [{
                    key: 'chord_of_chaos', name: 'Accord du chaos', vo: 'Chord of Chaos',
                    cost: '1 action',
                    text: '(1 fois par rencontre) Action : vous pouvez déplacer TOUTES les créatures à portée d’ouïe de votre chant de 3 cases au plus, tant qu’elles ne sont pas déplacées vers un endroit manifestement dangereux.',
                    uses: { count: '1', per: 'encounter' },
                }],
                15: [{
                    key: 'words_like_swords', name: 'Des mots comme des épées', vo: 'Words Like Swords',
                    text: 'Le dé de dégâts de votre Moquerie cruelle devient 1d12.',
                }],
            },
        },
        {
            key: 'courage', name: 'Héraut du Courage', vo: 'Herald of Courage',
            summary: '« Braves héros ! Prêtez l’oreille à mon récit épique… » Ayez bon cœur, et vos amis ne faibliront jamais.',
            complexity: 2,
            levels: {
                3: [{
                    key: 'inspiring_presence', name: 'Présence inspirante', vo: 'Inspiring Presence',
                    text: 'L’allié le plus proche de vous a l’avantage (si plusieurs sont à égale distance, choisissez votre préféré).',
                }],
                7: [{
                    key: 'fire_in_my_bones', name: 'Le feu dans les veines', vo: 'Fire in My Bones',
                    text: 'Votre Inspiration du Tisse-chant accorde aussi 1 action supplémentaire à sa cible.',
                }],
                11: [{
                    key: 'unfailing_resolve', name: 'Résolution infaillible', vo: 'Unfailing Resolve',
                    text: 'Votre Inspiration du Tisse-chant permet à sa cible de relancer avec avantage, ou augmente la face d’un dé de +2.',
                }],
                15: [{
                    key: 'chorus_of_champions', name: 'Chœur des champions', vo: 'Chorus of Champions',
                    cost: 'réaction gratuite',
                    text: '(1 fois par rencontre) Réaction gratuite : donnez 1 action à tous les membres du groupe.',
                    uses: { count: '1', per: 'encounter' },
                }],
            },
        },
        {
            key: 'singing_steel', name: 'Héraut de l’Acier chantant', vo: 'Herald of Singing Steel',
            summary: 'Votre lame tranche aussi profondément que votre esprit. Choisissez cette sous-classe si vous voulez mêler maîtrise musicale et escrime mortelle.',
            complexity: 2,
            levels: {
                3: [{
                    key: 'songwoven_blade', name: 'Lame tissée de chant', vo: 'Songwoven Blade',
                    text: 'Chaque fois que vous faites une attaque de mêlée, vous pouvez lui appliquer les dégâts et tous les autres effets de votre Moquerie cruelle.',
                }],
                7: [
                    {
                        key: 'ha_ha', name: 'Ha-HA !', vo: 'Ha-HA!',
                        text: 'Les créatures que vous provoquez sont aussi affaiblies 10 sur leur première attaque de chaque round.',
                    },
                    {
                        key: 'from_the_chandelier', name: 'Depuis le lustre !', vo: 'From the Chandelier!',
                        text: '(1 fois par rencontre) Prenez appui sur un obstacle proche et déplacez-vous gratuitement (en ignorant les cases ennemies et le terrain difficile) ; vous gagnez l’avantage sur votre prochaine attaque.',
                        uses: { count: '1', per: 'encounter' },
                    },
                ],
                11: [{
                    key: 'riposte', name: 'Riposte', vo: 'Riposte',
                    cost: 'réaction',
                    text: 'Réaction (lorsqu’une créature vous attaque en mêlée mais ne vous inflige aucun dégât) : vous pouvez l’attaquer avec Lame tissée de chant, en lançant un d20 comme dé primaire.',
                }],
                15: [{
                    key: 'ballad_blade', name: 'Lame-ballade', vo: 'Ballad Blade',
                    text: 'Les créatures que vous provoquez sont désormais affaiblies 20 sur leur première attaque de chaque round.',
                }],
            },
        },
        {
            key: 'torment', name: 'Héraut du Tourment', vo: 'Herald of Torment',
            summary: 'On voit souvent les Tisse-chants comme des musiciens qui jouent des airs exaltants et racontent des histoires pleines d’espoir, mais un Héraut du Tourment se sert de ce même don pour empoisonner l’esprit de ses ennemis.',
            complexity: 3,
            levels: {
                3: [{
                    key: 'poison_mind', name: 'Esprit empoisonné', vo: 'Poison Mind',
                    text: 'Au lieu de provoquer, votre Moquerie cruelle empoisonne l’esprit de la cible (jusqu’à ce que vous empoisonniez une autre créature de cette manière).',
                }],
                7: [{
                    key: 'tormented_mind', name: 'Esprit tourmenté', vo: 'Tormented Mind',
                    cost: '1 action',
                    text: '(1 fois par rencontre) Action : tourmentez une créature que vous avez empoisonnée : déplacez-la de VOL cases et faites-lui attaquer une autre créature ou elle-même.',
                    uses: { count: '1', per: 'encounter' },
                }],
                11: [{
                    key: 'mind_worm', name: 'Ver de l’esprit', vo: 'Mind Worm',
                    text: 'À chacun de vos tours, vous pouvez déplacer gratuitement de VOL cases les créatures que vous avez empoisonnées.',
                }],
                15: [{
                    key: 'weak_mind_easy_prey', name: 'Esprit faible, proie facile', vo: 'Weak Mind, Easy Prey',
                    text: 'Vos sorts ont l’avantage contre les créatures empoisonnées, et elles ont le désavantage à leurs jets de sauvegarde contre eux. La première fois, à chaque rencontre, qu’une créature que vous avez tourmentée meurt, Esprit tourmenté se recharge.',
                }],
            },
        },
        {
            key: 'legends', name: 'Héraut des Légendes', vo: 'Herald of Legends',
            summary: 'Vous avez acquis la faculté de canaliser la puissance d’une créature légendaire pour compléter la vôtre.',
            complexity: 4,
            story: true,
            levels: {
                3: [
                    {
                        key: 'legendkeeper', name: 'Gardien des légendes', vo: 'Legendkeeper',
                        text: 'Vous perdez l’accès à vos capacités d’Arsenal lyrique et gagnez à la place :\n**Conte de légende.** Tour de magie, 1 action (Allonge 8). Invoquez un héros légendaire pour vous aider pendant toute cette rencontre (1 au maximum). Chaque Légende peut aussi être sollicitée, par une réaction, pour produire un effet supplémentaire puissant, mais elle quitte ensuite le champ de bataille. Légendes que vous connaissez : l’Égide et le Stylet.',
                    },
                    {
                        key: 'the_aegis', name: 'L’Égide', vo: 'The Aegis',
                        text: 'Les créatures amies dans une zone de 3×3 gagnent une réduction des dégâts de +VOL. **Sollicitation :** chaque fois qu’un allié dans la zone s’interpose, il peut ne subir aucun dégât à la place.',
                    },
                    {
                        key: 'the_stiletto', name: 'Le Stylet', vo: 'The Stiletto',
                        text: 'Les créatures amies dans une zone de 3×3 peuvent se déplacer ou se cacher gratuitement (1 fois par tour). **Sollicitation (Allonge 12) :** chaque fois qu’un allié devrait faire un critique, ajoutez INT d12 dégâts à l’attaque.',
                    },
                ],
                7: [
                    {
                        key: 'two_legends', name: 'Deux légendes', vo: 'Up to 2 Legends',
                        text: 'Vous pouvez avoir jusqu’à 2 Légendes actives à la fois. Vous apprenez aussi les Légendes suivantes : le Guérisseur et le Tacticien.',
                    },
                    {
                        key: 'the_mender', name: 'Le Guérisseur', vo: 'The Mender',
                        text: 'Les créatures amies dans une zone de 3×3 peuvent mettre fin à 1 état négatif qui les affecte à la fin de leur tour. **Sollicitation :** lorsqu’une créature dans la zone tombe à 0 PV, vous pouvez la ranimer à NIV PV ; elle récupère 1 action.',
                    },
                    {
                        key: 'the_tactician', name: 'Le Tacticien', vo: 'The Tactician',
                        text: 'Les créatures amies dans une zone de 3×3 ont +2 à l’Allonge, à la Portée et aux jets d’Évaluer. **Sollicitation (Allonge 12) :** lorsqu’un allié évalue, il réussit et peut choisir deux fois.',
                    },
                ],
                11: [
                    {
                        key: 'banner_bearer', name: 'Porte-étendard', vo: 'Banner Bearer',
                        text: 'Chaque fois que vous devriez vous déplacer, vous pouvez déplacer une Légende invoquée à la place. Vous apprenez les Légendes suivantes : le Seigneur de guerre et le Vieux Chênu.',
                    },
                    {
                        key: 'the_warlord', name: 'Le Seigneur de guerre', vo: 'The Warlord',
                        text: 'TOUTES les créatures dans une zone de 3×3 sont renforcées 10. **Sollicitation (Allonge 12) :** TOUTES les créatures sont renforcées 10 jusqu’à la fin de leur prochain tour.',
                    },
                    {
                        key: 'old_oakum', name: 'Le Vieux Chênu', vo: 'Old Oakum',
                        text: 'Les créatures dans une zone de 3×3 sont ralenties et ne peuvent pas voler. **Sollicitation :** lorsqu’une créature devrait quitter la zone, ramenez-la à l’intérieur et immobilisez-la.',
                    },
                ],
                15: [{
                    key: 'living_legends', name: 'Légendes vivantes', vo: 'Living Legends',
                    text: 'Invoquez une Légende chaque fois que vous lancez l’Initiative. (1 fois par rencontre) Chaque fois qu’une Légende devrait quitter le champ de bataille, vous pouvez à la place lui permettre de rester ; elle ne compte alors pas dans votre maximum habituel.',
                    uses: { count: '1', per: 'encounter' },
                }],
            },
        },
    ],
    spells: [
        {
            key: 'vicious_mockery', name: 'Moquerie cruelle', vo: 'Vicious Mockery',
            school: 'songweaver', tier: 0, utility: false,
            cost: '1 action',
            target: 'Portée 12',
            damage: { dice: '1d6', bonus: 'INT', type: 'psychic' },
            text: 'Dégâts : 1d6+INT psychiques (en ignorant l’armure). En cas de touche : la cible est provoquée jusqu’à la fin de son prochain tour.',
            highLevels: { text: '+3 dégâts tous les 5 niveaux.', every: 5, bonus: 3 },
            notes: 'Réservé au Tisse-chant.',
        },
    ],
    faq: [
        { q: 'Puis-je m’inspirer moi-même ?', a: 'Non. Vous êtes votre premier admirateur, mais vous n’êtes pas votre propre allié.' },
        { q: 'Quand dois-je décider d’utiliser l’Inspiration du Tisse-chant ?', a: 'Après un jet, avant que l’effet ne s’applique.' },
        { q: 'Un dé primaire relancé reste-t-il le dé primaire ?', a: 'Oui.' },
        { q: 'Augmenter un dé de 1 peut-il changer un raté en touche, ou une touche en critique ?', a: 'Oui.' },
        { q: 'Comment fonctionnent les Légendes ?', a: 'Ce sont des êtres immatériels, insensibles à tout dommage, qui n’occupent aucun espace.' },
    ],
};
