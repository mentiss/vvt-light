// src/client/src/systems/nimble/config/classes/shepherd.js
// Source : Nimble Heroes — Shepherd 3.0 (PDF, p. 3-14).
// Classe Berger : profil, 20 niveaux, Grâces sacrées, sort Esprit lié, 4 sous-classes (dont la Forge, sous-classe d'histoire), FAQ.

export default {
    key: 'shepherd', name: 'Berger', vo: 'Shepherd',
    tagline: 'Que tous les affligés s\'approchent',
    summary: 'Invoquez un fidèle compagnon à vos côtés pour vous apporter un soutien inestimable au combat. Embrassez l\'équilibre de la vie et de la mort, soutenez vos alliés par des sorts de soin et des bienfaits. Châtiez vos ennemis d\'une fureur radieuse ou flétrissez-les d\'une sombre puissance nécrotique.',
    complexity: 2,
    keyStats: ['wil', 'str'],
    hitDie: 10, startingHp: 17,
    saves: { adv: 'wil', dis: 'dex' },
    armor: { text: 'Armures de mailles, boucliers', types: ['cloth', 'leather', 'mail', 'shield'] },
    weapons: { text: 'Armes de FOR, baguettes', rule: { stats: ['str'], wand: true } },
    startingGear: [{ key: 'rusty_mail' }, { key: 'club_mace' }, { key: 'wooden_buckler' }, { key: 'bell' }],
    resources: [
        { key: 'mend', label: 'Panser (Esprit lié)', max: 'WIL', fromLevel: 1, reset: 'safeRest' },
        { key: 'mana', label: 'Mana', max: '3*WIL+LVL', fromLevel: 2, reset: 'safeRest' },
    ],
    spellcasting: {
        schools: ['radiant', 'necrotic'],
        tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8, 18: 9 },
        note: 'Tours de magie radiants et nécrotiques dès le niveau 1, plus le tour de magie Esprit lié.',
    },
    levels: {
        1: [
            { key: 'keeper_of_life_and_death', name: 'Gardien de la vie et de la mort', vo: 'Keeper of Life & Death',
                text: 'Vous connaissez les tours de magie radiants et nécrotiques.' },
            { key: 'my_buddy', name: 'Mon copain !', vo: 'My Buddy!',
                text: 'Apprenez le tour de magie *Esprit lié*.' },
        ],
        2: [
            { key: 'mana_tier_1', name: 'Mana et sorts de rang 1', vo: 'Mana and Unlock Tier 1 Spells',
                text: 'Vous débloquez les sorts radiants et nécrotiques de rang 1 et gagnez une réserve de mana pour les lancer. Le maximum de cette réserve est toujours égal à (VOL×3)+NIV, et elle se recharge lors d\'un repos sûr.' },
        ],
        3: [
            { key: 'subclass', name: 'Sous-classe', vo: 'Subclass', text: 'Choisissez une sous-classe de Berger.', subclass: true },
            { key: 'master_of_twilight', name: 'Maître du crépuscule', vo: 'Master of Twilight',
                text: 'Choisissez 1 sort utilitaire nécrotique et 1 sort utilitaire radiant.' },
        ],
        4: [
            { key: 'sacred_grace', name: 'Grâce sacrée', vo: 'Sacred Grace', text: 'Choisissez 1 Grâce sacrée.', choice: { pool: 'graces', count: 1 } },
            { key: 'tier_2', name: 'Sorts de rang 2', vo: 'Tier 2 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 2.' },
            { key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 VOL ou FOR.', statIncrease: { from: 'key', count: 1 } },
        ],
        5: [
            { key: 'assist_me_my_friend', name: 'Aide-moi, mon ami !', vo: 'Assist Me, My Friend!',
                text: 'Au lieu que votre esprit attaque ce round, vous pouvez ajouter ses dégâts à l\'une de vos attaques avec une arme de mêlée.' },
            { key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
            { key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
            { key: 'serve', name: 'Servir', vo: 'Serve',
                text: 'Après avoir passé une journée à prendre soin d\'un lieu sacré ou à servir autrui pendant un repos sûr, vous pouvez choisir d\'autres options de Berger parmi celles qui vous sont accessibles.' },
        ],
        6: [
            { key: 'tier_3', name: 'Sorts de rang 3', vo: 'Tier 3 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 3.' },
            { key: 'master_of_twilight_2', name: 'Maître du crépuscule (2)', vo: 'Master of Twilight (2)',
                text: 'Choisissez un 2ᵉ sort utilitaire nécrotique et un 2ᵉ sort utilitaire radiant.' },
        ],
        7: [
            { key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Berger.', subclassFeature: true },
        ],
        8: [
            { key: 'tier_4', name: 'Sorts de rang 4', vo: 'Tier 4 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 4.' },
            { key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 VOL ou FOR.', statIncrease: { from: 'key', count: 1 } },
        ],
        9: [
            { key: 'sacred_grace_2', name: 'Grâce sacrée (2)', vo: 'Sacred Grace (2)', text: 'Choisissez une 2ᵉ Grâce sacrée.', choice: { pool: 'graces', count: 1 } },
            { key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        10: [
            { key: 'tier_5', name: 'Sorts de rang 5', vo: 'Tier 5 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 5.' },
            { key: 'upgraded_cantrips_10', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        11: [
            { key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Berger.', subclassFeature: true },
            { key: 'master_of_twilight_3', name: 'Maître du crépuscule (3)', vo: 'Master of Twilight (3)',
                text: 'Vous connaissez tous les sorts utilitaires nécrotiques et radiants.' },
        ],
        12: [
            { key: 'tier_6', name: 'Sorts de rang 6', vo: 'Tier 6 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 6.' },
            { key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 VOL ou FOR.', statIncrease: { from: 'key', count: 1 } },
        ],
        13: [
            { key: 'sacred_grace_3', name: 'Grâce sacrée (3)', vo: 'Sacred Grace (3)', text: 'Choisissez une 3ᵉ Grâce sacrée.', choice: { pool: 'graces', count: 1 } },
            { key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        14: [
            { key: 'tier_7', name: 'Sorts de rang 7', vo: 'Tier 7 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 7.' },
        ],
        15: [
            { key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Berger.', subclassFeature: true },
            { key: 'upgraded_cantrips_15', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        16: [
            { key: 'tier_8', name: 'Sorts de rang 8', vo: 'Tier 8 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 8.' },
            { key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 VOL ou FOR.', statIncrease: { from: 'key', count: 1 } },
        ],
        17: [
            { key: 'revitalizing_blessing', name: 'Bénédiction revitalisante', vo: 'Revitalizing Blessing',
                text: '(1/round) Chaque fois que vous obtenez 6 ou plus sur un ou plusieurs dés de soin, la cible peut récupérer une Blessure.' },
            { key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        18: [
            { key: 'tier_9', name: 'Sorts de rang 9', vo: 'Tier 9 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 9.' },
        ],
        19: [
            { key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).', epicBoon: true },
        ],
        20: [
            { key: 'twilight_sage', name: 'Sage du crépuscule', vo: 'Twilight Sage',
                text: '+1 à 2 caractéristiques au choix. Votre Esprit lié lance deux fois plus de dés.',
                statIncrease: { from: 'any', count: 2 } },
            { key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
    },
    options: {
        graces: {
            label: 'Grâces sacrées', vo: 'Sacred Graces',
            text: '**Servir.** Après avoir passé une journée à prendre soin d\'un lieu sacré ou à servir autrui pendant un repos sûr, vous pouvez choisir d\'autres options de Berger parmi celles qui vous sont accessibles.',
            items: [
                { key: 'dark_benediction', name: 'Bénédiction sombre', vo: 'Dark Benediction', cost: 'passif',
                    text: 'Votre Esprit lié peut désormais lancer *Attirer* (Entice) et *Toucher flétrissant* (Withering Touch).' },
                { key: 'empowered_companion', name: 'Compagnon renforcé', vo: 'Empowered Companion', cost: 'passif',
                    text: 'Votre Esprit lié gagne +FOR aux dégâts contre les morts-vivants et +VOL aux soins.' },
                { key: 'guiding_spirit', name: 'Esprit guide', vo: 'Guiding Spirit', cost: 'passif',
                    text: 'Chaque fois que votre Esprit lié obtient 6 ou plus sur son dé de dégâts, la prochaine attaque contre cette cible a l\'avantage.' },
                { key: 'hasty_companion', name: 'Compagnon empressé', vo: 'Hasty Companion', cost: 'passif',
                    text: '+4 d\'Allonge pour votre Esprit lié. Il peut aussi agir gratuitement lorsqu\'il est invoqué.' },
                { key: 'illuminate_soul', name: 'Âme illuminée', vo: 'Illuminate Soul', cost: 'passif',
                    text: 'Chaque fois que vous Pansez une créature, faites-la briller d\'une lumière radieuse pendant 1 round. Les attaques contre elle ont le désavantage et les attaques qu\'elle effectue ont l\'avantage.' },
                { key: 'light_bearer', name: 'Porteur de lumière', vo: 'Light Bearer', cost: 'passif',
                    text: 'Votre Esprit lié peut lancer *Soin* (Heal). Chaque fois que vous lancez l\'Initiative, récupérez 1 utilisation de Panser (elle expire à la fin du combat si elle n\'est pas utilisée).' },
                { key: 'not_beyond_my_reach', name: 'Pas hors de MA portée', vo: 'Not Beyond MY Reach', cost: 'passif',
                    text: 'Vous pouvez soigner des créatures mortes depuis moins d\'1 round. Pour chaque tranche de 10 PV soignés à une créature morte de cette façon, vous pouvez lui faire récupérer 1 Blessure à la place (vous devez soigner au moins 1 Blessure pour la ramener à la vie).' },
                { key: 'vengeful_spirit', name: 'Esprit vengeur', vo: 'Vengeful Spirit', cost: '1 action',
                    text: '(Zone, Allonge 2) Votre Esprit lié se sacrifie pour infliger ses dégâts de Blesser à tous les ennemis à Allonge.' },
            ],
        },
    },
    subclasses: [
        {
            key: 'malice', name: 'Luminaire de la Malveillance', vo: 'Luminary of Malice',
            summary: 'Avec la mort pour compagne, vous pouvez déchaîner de sombres puissances sur vos ennemis.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'soul_reaper', name: 'Faucheur d\'âmes', vo: 'Soul Reaper',
                        text: '(1/round) Les attaques de votre compagnon peuvent cibler un 2ᵉ ennemi adjacent.' },
                    { key: 'harbinger_of_decay', name: 'Héraut de la décrépitude', vo: 'Harbinger of Decay',
                        text: 'Les couleurs vives et les odeurs agréables s\'estompent près de vous. La nourriture se gâte plus vite en votre présence, et vous vous réveillez souvent entouré de mouches où que vous logiez. Vous pouvez faire prendre à votre Esprit lié une forme mortifère (un chien zombie, un diablotin sournois, etc.) et faire passer ses dégâts au type nécrotique.' },
                ],
                7: [
                    { key: 'veilwalkers_blessing', name: 'Bénédiction du marcheur du voile', vo: 'Veilwalker\'s Blessing', cost: 'réaction',
                        text: '(1/repos sûr) Réaction (lorsque vous devriez tomber à 0 PV) : tombez à 1 PV à la place, et votre Esprit lié riposte contre l\'attaquant par un critique.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
                11: [
                    { key: 'deathbringers_touch', name: 'Toucher du porte-mort', vo: 'Deathbringer\'s Touch',
                        text: 'Votre Esprit lié et *Toucher flétrissant* (Withering Touch) font aussi un critique sur un 1.' },
                ],
                15: [
                    { key: 'conduit_of_death', name: 'Conduit de la mort', vo: 'Conduit of Death',
                        text: 'Votre capacité Bénédiction du marcheur du voile se recharge lorsque vous lancez l\'Initiative.' },
                ],
            },
        },
        {
            key: 'mercy', name: 'Luminaire de la Miséricorde', vo: 'Luminary of Mercy',
            summary: 'Sauvez les mourants, maniez la lumière, incarnez votre vertu. Votre compassion fait de vous un digne réceptacle de l\'énergie radieuse.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'merciful_healing', name: 'Guérison miséricordieuse', vo: 'Merciful Healing',
                        text: 'Vous pouvez utiliser Panser sur des créatures qui ne sont pas mourantes. Tant que vous êtes mourant, votre Esprit lié peut agir 1/round sans dépenser d\'action.' },
                    { key: 'life_is_beautiful', name: 'La vie est belle', vo: 'Life is Beautiful',
                        text: 'Des créatures inoffensives et charmantes, comme les papillons et les colibris, sont attirées par votre présence et vous suivent souvent. Les fleurs s\'épanouissent avec plus d\'éclat en votre présence.' },
                ],
                7: [
                    { key: 'searing_light', name: 'Lumière brûlante', vo: 'Searing Light', cost: '1 action',
                        text: '1 action : (Allonge 6) Chaque fois que vous soignez des PV, vous pouvez dépenser 1 utilisation de Panser pour infliger à une autre cible des dégâts égaux aux PV rendus.' },
                ],
                11: [
                    { key: 'powerful_healer', name: 'Puissant guérisseur', vo: 'Powerful Healer',
                        text: '(VOL/repos sûr) Chaque fois que vous devriez soigner des PV, vous pouvez à la place accorder autant de PV temporaires, OU soigner le montant maximal que vous pourriez obtenir.',
                        uses: { count: 'WIL', per: 'safeRest' } },
                ],
                15: [
                    { key: 'lifebinders_embrace', name: 'Étreinte du lieur de vie', vo: 'Lifebinder\'s Embrace',
                        text: 'Votre Panser peut soigner 1 créature supplémentaire. Récupérez 1 charge de Panser lorsque vous lancez l\'Initiative (elle expire à la fin du combat si elle n\'est pas dépensée).' },
                ],
            },
        },
        {
            key: 'protection', name: 'Luminaire de la Protection', vo: 'Luminary of Protection',
            summary: '« Mieux vaut prévenir que guérir. Pourquoi attendre que vos amis soient blessés pour les soigner, alors que vous pourriez les empêcher d\'être blessés ? »',
            complexity: 1,
            levels: {
                3: [
                    { key: 'guardian_spirit', name: 'Esprit gardien', vo: 'Guardian Spirit',
                        text: 'Chaque fois que vous Vous interposez, vous pouvez faire en sorte que votre Esprit lié S\'interpose à votre place en dépensant l\'une de ses charges de Panser.' },
                ],
                7: [
                    { key: 'ready_for_danger', name: 'Paré au danger', vo: 'Ready for Danger',
                        text: '+VOL à l\'Initiative ; vous pouvez aussi accorder ce bonus à 1 allié (après son jet).' },
                ],
                11: [
                    { key: 'shield_of_light', name: 'Bouclier de lumière', vo: 'Shield of Light',
                        text: 'Vous pouvez faire en sorte que vos sorts de soin accordent des PV temporaires à la place. (1/rencontre) Vous pouvez utiliser Panser sans dépenser de charge.',
                        uses: { count: '1', per: 'encounter' } },
                ],
                15: [
                    { key: 'ever_vigilant', name: 'Toujours vigilant', vo: 'Ever Vigilant',
                        text: 'Vous obtenez l\'avantage à l\'Initiative. Vous et 1 allié gagnez +1 action au début de chaque rencontre.' },
                ],
            },
        },
        {
            key: 'forge', name: 'Luminaire de la Forge', vo: 'Luminary of the Forge',
            summary: '« Votre Esprit lié est la flamme du fourneau incarnée. »',
            complexity: 2,
            story: true,
            levels: {
                3: [
                    { key: 'flameworker', name: 'Ouvrier de la flamme', vo: 'Flameworker',
                        text: 'Échangez votre connaissance de l\'école de magie nécrotique contre celle du feu. Votre Esprit lié inflige l\'état fumant sur un critique.' },
                    { key: 'seasoned_journeyman', name: 'Compagnon chevronné', vo: 'Seasoned Journeyman',
                        text: 'Chaque fois que vous faites un repos sûr, choisissez l\'une des options suivantes :\n• **Forgeron d\'armes.** Vos armes gagnent +FOR aux dégâts jusqu\'à votre prochain repos sûr.\n• **Armurier.** Votre armure gagne +FOR en Défense jusqu\'à votre prochain repos sûr.',
                        choice: { pool: 'journeyman', count: 1 } },
                ],
                7: [
                    { key: 'lightforged', name: 'Forgé de lumière', vo: 'Lightforged',
                        text: 'Panser accorde aussi VOL+FOR PV temporaires et 1 action.' },
                    { key: 'living_ember', name: 'Braise vivante', vo: 'Living Ember',
                        text: 'Votre Esprit lié inflige le double de dégâts aux cibles fumantes, ce qui met fin à l\'état.' },
                ],
                11: [
                    { key: 'masterwork', name: 'Chef-d\'œuvre', vo: 'Masterwork',
                        text: '+VOL à Forgeron d\'armes et à Armurier ; vous pouvez choisir deux fois.' },
                ],
                15: [
                    { key: 'quench_the_blaze', name: 'Éteindre le brasier', vo: 'Quench the Blaze',
                        text: '(1/rencontre) Lorsqu\'un ennemi fumant perd cet état, vous pouvez l\'immobiliser jusqu\'à la fin de son prochain tour.',
                        uses: { count: '1', per: 'encounter' } },
                ],
            },
            options: {
                journeyman: {
                    label: 'Compagnon chevronné', vo: 'Seasoned Journeyman',
                    text: 'Choix à faire à chaque repos sûr.',
                    items: [
                        { key: 'weaponsmith', name: 'Forgeron d\'armes', vo: 'Weaponsmith',
                            text: 'Vos armes gagnent +FOR aux dégâts jusqu\'à votre prochain repos sûr.' },
                        { key: 'armorsmith', name: 'Armurier', vo: 'Armorsmith',
                            text: 'Votre armure gagne +FOR en Défense jusqu\'à votre prochain repos sûr.' },
                    ],
                },
            },
        },
    ],
    spells: [
        {
            key: 'lifebinding_spirit', name: 'Esprit lié', vo: 'Lifebinding Spirit',
            school: 'shepherd', tier: 0, utility: false, cost: '1 action',
            target: 'Allonge 4 (depuis vous)',
            damage: { dice: '1d8', bonus: 'STR', type: 'radiant' },
            text: 'Invoquez un compagnon spirituel (max. 1) qui vous suit et qui est immunisé contre tout mal. Il peut agir sur une cible à Allonge 4 ou moins de vous avant de revenir à vos côtés. Il peut :\n• **Blesser.** 1 action : il attaque pour 1d8+FOR dégâts radiants (en ignorant l\'armure).\n• **Panser.** 1 action : (VOL/repos sûr) il rend VOL d20 PV à une créature mourante.',
            highLevels: { text: '+FOR dégâts tous les 5 niveaux.', every: 5, bonus: 'STR' },
            notes: '**L\'apparence est libre.** Votre Esprit lié peut prendre la forme de n\'importe quelle créature amicale de taille petite ou très petite (chien, agneau, lapin, moineau, etc.). Donnez aussi un nom à votre petit copain ! En dehors des combats, votre compagnon est un esprit : il peut traverser les murs et les dangers sans dommage et s\'éloigner brièvement de vous (mais il préfère toujours rester fidèlement à vos côtés). Il ne peut pas parler.\n**Attaques précipitées et mon compagnon ?** Vous et votre compagnon utilisez la même réserve d\'actions, mais comptez comme des créatures différentes. Vous pouvez donc chacun attaquer une fois par round sans la pénalité d\'attaques précipitées. Travail d\'équipe !',
        },
    ],
    faq: [
        { q: 'Mon compagnon a-t-il ses propres PV et ses propres actions ?',
            a: 'Non. Il n\'a pas de PV propres et n\'agit que lorsque vous le dirigez.' },
        { q: 'Dois-je invoquer mon compagnon à chaque rencontre ?',
            a: 'Non. Une fois invoqué, il reste fidèlement à vos côtés jusqu\'à ce que vous le congédiiez.' },
        { q: 'Les ennemis peuvent-ils attaquer mon compagnon ? Occupe-t-il de l\'espace ?', a: 'Non.' },
        { q: 'Attaques précipitées et mon compagnon ?',
            a: 'Vous et votre compagnon utilisez la même réserve d\'actions, mais comptez comme des créatures différentes. Vous pouvez donc chacun attaquer une fois par round sans attaques précipitées. Travail d\'équipe !' },
        { q: 'Mon héros peut-il rater exprès pour déclencher Toucher du porte-mort ?',
            a: 'Non. Un héros n\'essaie pas de rater exprès.' },
    ],
};
