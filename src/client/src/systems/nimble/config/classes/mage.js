// src/client/src/systems/nimble/config/classes/mage.js
// Source : Nimble Heroes — Mage 3.0 (PDF, p. 3-18 ; les sorts des écoles feu, glace, foudre sont dans config/spells.js).
// Classe Mage : profil, 20 niveaux, capacités de Façonneur de sorts, 6 sous-classes, FAQ.

export default {
    key: 'mage', name: 'Mage', vo: 'Mage',
    tagline: 'Maître des éléments magiques',
    summary: 'Personnalisez vos sorts : étirez le temps, gagnez une vision extradimensionnelle ou lancez plusieurs sorts en écho ! Faites pleuvoir le feu des cieux, figez vos ennemis sur place et frappez avec des éclairs tonitruants. Exigez le Contrôle ou plongez dans le Chaos ! Qu\'est-ce qui vous attend ? Une peau de diamant ? Un enchevêtrement élémentaire ? Des jambes liquéfiées ?!',
    complexity: 4,
    keyStats: ['int', 'wil'],
    hitDie: 6, startingHp: 10,
    saves: { adv: 'int', dis: 'str' },
    armor: { text: 'Armures de tissu', types: ['cloth'] },
    weapons: { text: 'Lames, bâtons, baguettes', rule: { tags: ['blade', 'staff'], wand: true } },
    startingGear: [{ key: 'adventurers_garb' }, { key: 'staff' }, { key: 'soap' }],
    resources: [
        { key: 'mana', label: 'Mana', max: '3*INT+LVL', fromLevel: 2, reset: 'safeRest' },
    ],
    spellcasting: {
        schools: ['fire', 'ice', 'lightning'],
        tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8, 18: 9 },
        note: 'Tours de magie des écoles du feu, de la glace et de la foudre dès le niveau 1 ; vous connaissez tous les sorts des écoles que vous connaissez, jusqu\'au rang débloqué.',
    },
    levels: {
        1: [
            { key: 'elemental_spellcasting', name: 'Magie élémentaire', vo: 'Elemental Spellcasting',
                text: 'Vous connaissez les écoles de magie du feu, de la glace et de la foudre et pouvez lancer leurs tours de magie.' },
        ],
        2: [
            { key: 'mana_tier_1', name: 'Mana et sorts de rang 1', vo: 'Mana and Unlock Tier 1 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 1 et gagnez une réserve de mana pour les lancer. Le maximum de cette réserve est toujours égal à (INT×3)+NIV, et elle se recharge lors d\'un repos sûr.' },
            { key: 'talented_researcher', name: 'Chercheur doué', vo: 'Talented Researcher',
                text: 'Vous obtenez l\'avantage aux tests d\'Arcanes ou de Savoir lorsque vous avez accès à une grande quantité de livres et au temps nécessaire pour les étudier.' },
        ],
        3: [
            { key: 'subclass', name: 'Sous-classe', vo: 'Subclass', text: 'Choisissez une sous-classe de Mage.', subclass: true },
            { key: 'elemental_mastery', name: 'Maîtrise élémentaire', vo: 'Elemental Mastery',
                text: 'Apprenez les sorts utilitaires d\'une école de magie que vous connaissez.' },
            { key: 'study', name: 'Étudiez !', vo: 'Study!',
                text: 'Chaque fois que vous étudiez des livres arcaniques ou êtes instruit par un Mage de plus haut niveau pendant un repos sûr, vous pouvez choisir d\'autres options de Mage parmi celles qui vous sont accessibles.' },
        ],
        4: [
            { key: 'spellshaper', name: 'Façonneur de sorts', vo: 'Spellshaper',
                text: 'Vous gagnez la capacité d\'améliorer vos sorts d\'effets puissants en dépensant du mana supplémentaire. Choisissez 2 capacités de Façonneur de sorts.',
                choice: { pool: 'spellshaper', count: 2 } },
            { key: 'tier_2', name: 'Sorts de rang 2', vo: 'Tier 2 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 2.' },
            { key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        5: [
            { key: 'elemental_surge', name: 'Afflux élémentaire', vo: 'Elemental Surge',
                text: 'Une montée d\'adrénaline et votre harmonie avec les éléments vous confèrent un surcroît de puissance au début du combat. Lorsque vous lancez l\'Initiative, récupérez VOL points de mana (ils expirent à la fin du combat s\'ils ne sont pas utilisés).' },
            { key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
            { key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        6: [
            { key: 'tier_3', name: 'Sorts de rang 3', vo: 'Tier 3 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 3.' },
            { key: 'elemental_mastery_2', name: 'Maîtrise élémentaire (2)', vo: 'Elemental Mastery (2)',
                text: 'Apprenez les sorts utilitaires d\'une 2ᵉ école de magie que vous connaissez.' },
        ],
        7: [
            { key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Mage.', subclassFeature: true },
        ],
        8: [
            { key: 'tier_4', name: 'Sorts de rang 4', vo: 'Tier 4 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 4.' },
            { key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        9: [
            { key: 'spellshaper_2', name: 'Façonneur de sorts (2)', vo: 'Spellshaper (2)',
                text: 'Choisissez 1 capacité de Façonneur de sorts supplémentaire.', choice: { pool: 'spellshaper', count: 1 } },
            { key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        10: [
            { key: 'elemental_surge_2', name: 'Afflux élémentaire (2)', vo: 'Elemental Surge (2)',
                text: 'Votre capacité Afflux élémentaire vous fait désormais récupérer VOL+1d4 points de mana.' },
            { key: 'tier_5', name: 'Sorts de rang 5', vo: 'Tier 5 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 5.' },
            { key: 'upgraded_cantrips_10', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        11: [
            { key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Mage.', subclassFeature: true },
        ],
        12: [
            { key: 'tier_6', name: 'Sorts de rang 6', vo: 'Tier 6 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 6.' },
            { key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        13: [
            { key: 'spellshaper_3', name: 'Façonneur de sorts (3)', vo: 'Spellshaper (3)',
                text: 'Choisissez 1 capacité de Façonneur de sorts supplémentaire.', choice: { pool: 'spellshaper', count: 1 } },
            { key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        14: [
            { key: 'tier_7', name: 'Sorts de rang 7', vo: 'Tier 7 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 7.' },
            { key: 'elemental_mastery_3', name: 'Maîtrise élémentaire (3)', vo: 'Elemental Mastery (3)',
                text: 'Apprenez les sorts utilitaires d\'une 3ᵉ école de magie que vous connaissez.' },
        ],
        15: [
            { key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe de Mage.', subclassFeature: true },
            { key: 'upgraded_cantrips_15', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        16: [
            { key: 'tier_8', name: 'Sorts de rang 8', vo: 'Tier 8 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 8.' },
            { key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        17: [
            { key: 'elemental_surge_3', name: 'Afflux élémentaire (3)', vo: 'Elemental Surge (3)',
                text: 'Votre capacité Afflux élémentaire vous fait désormais récupérer VOL+2d4 points de mana.' },
            { key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou DEX.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        18: [
            { key: 'tier_9', name: 'Sorts de rang 9', vo: 'Tier 9 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 9.' },
        ],
        19: [
            { key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).', epicBoon: true },
        ],
        20: [
            { key: 'archmage', name: 'Archimage', vo: 'Archmage',
                text: '+1 à 2 caractéristiques au choix. Le premier sort de rang que vous lancez à chaque rencontre coûte 1 action de moins et 5 points de mana de moins.',
                statIncrease: { from: 'any', count: 2 } },
            { key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
    },
    options: {
        spellshaper: {
            label: 'Capacités de Façonneur de sorts', vo: 'Spellshaper Abilities',
            text: 'Vous gagnez des capacités de Façonneur de sorts en montant de niveau. Vous pouvez en utiliser 1 par tour.\n**Étudiez !** Chaque fois que vous étudiez des livres arcaniques ou êtes instruit par un Mage de plus haut niveau pendant un repos sûr, vous pouvez choisir d\'autres options de Mage parmi celles qui vous sont accessibles.',
            items: [
                { key: 'dimensional_compression', name: 'Compression dimensionnelle', vo: 'Dimensional Compression', cost: '1+ mana',
                    text: '+4 de Portée à un sort pour chaque point de mana supplémentaire dépensé.' },
                { key: 'echo_casting', name: 'Incantation en écho', vo: 'Echo Casting', cost: '2× mana (min. 1)',
                    text: 'Lorsque vous lancez un sort de rang à cible unique, lancez-en une copie sur une 2ᵉ cible.' },
                { key: 'elemental_destruction', name: 'Destruction élémentaire', vo: 'Elemental Destruction', cost: '1+ mana',
                    text: 'Après avoir touché avec un sort, relancez 1 dé par point de mana dépensé (jusqu\'à VOL points de mana).' },
                { key: 'elemental_transmutation', name: 'Transmutation élémentaire', vo: 'Elemental Transmutation', cost: '1 mana',
                    text: 'Changez le type de dégâts d\'un sort en : feu, froid, foudre, nécrotique ou radiant.' },
                { key: 'extra_dimensional_vision', name: 'Vision extradimensionnelle', vo: 'Extra-Dimensional Vision', cost: '2 mana',
                    text: 'Ignorez la condition de ligne de vue d\'un sort. Votre sort traverse les barrières et les obstacles pour atteindre une cible dont vous connaissez la présence, à portée.' },
                { key: 'methodical_spellweaver', name: 'Tisseur de sorts méthodique', vo: 'Methodical Spellweaver', cost: '–2 mana',
                    text: 'Dépensez 1 action supplémentaire pour réduire de 2 le coût en mana d\'un sort (min. 1).' },
                { key: 'precise_casting', name: 'Incantation précise', vo: 'Precise Casting', cost: '1+ mana',
                    text: 'Choisissez 1 créature par point de mana dépensé : elle n\'est pas affectée par un sort que vous lancez.' },
                { key: 'stretch_time', name: 'Étirer le temps', vo: 'Stretch Time', cost: '2 mana',
                    text: 'Réduisez de 1 le coût en actions d\'un sort (min. 1).' },
            ],
        },
    },
    subclasses: [
        {
            key: 'control', name: 'Invocateur du Contrôle', vo: 'Invoker of Control',
            summary: 'Le cœur de toute réussite magique, c\'est un entraînement et une discipline rigoureux. Un mage puissant ne devrait se contenter de rien de moins qu\'une domination totale.',
            complexity: 4,
            levels: {
                3: [
                    { key: 'force_of_will', name: 'Force de volonté', vo: 'Force of Will',
                        text: '(1/round) Pendant votre tour, vous pouvez Exiger le contrôle gratuitement : choisissez 1 option de la table de Contrôle que vous n\'avez pas encore choisie ; les choix se réinitialisent lorsque vous lancez l\'Initiative, ou lorsque vous avez choisi chaque option une fois.',
                        choice: { pool: 'control_table', count: 1 } },
                    { key: 'deny_fate', name: 'Refuser le destin', vo: 'Deny Fate',
                        text: 'Chaque fois que vous ratez avec un sort (ou si une ou plusieurs créatures réussissent leur sauvegarde contre un sort que vous lancez), vous DEVEZ Exiger le contrôle.' },
                ],
                7: [
                    { key: 'at_any_cost', name: 'À tout prix', vo: 'At Any Cost',
                        text: 'Apprenez 1 tour de magie et 1 sort de rang de l\'école nécrotique.' },
                    { key: 'nullify', name: 'Annulation', vo: 'Nullify',
                        text: '(1/rencontre) Ignorez tout désavantage et tout autre effet négatif sur votre prochaine action de ce tour, puis Exigez le contrôle.',
                        uses: { count: '1', per: 'encounter' } },
                ],
                11: [
                    { key: 'steel_will', name: 'Volonté d\'acier', vo: 'Steel Will',
                        text: 'Chaque fois que vous obtenez un 1 sur un dé d\'Afflux élémentaire, vous pouvez le relancer une fois. (1/repos sûr) Si vous deviez rater une sauvegarde, vous la réussissez à la place.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
                15: [
                    { key: 'supreme_control', name: 'Contrôle suprême', vo: 'Supreme Control',
                        text: 'Chaque fois que vous utilisez Force de volonté, vous pouvez choisir de déclencher deux fois l\'option sélectionnée. Vous pouvez désormais utiliser Force de volonté en réaction.' },
                ],
            },
            options: {
                control_table: {
                    label: 'Table de Contrôle', vo: 'Control Table',
                    text: 'La magie est dangereuse. Vous pouvez en recoudre les bords effilochés à votre avantage… pour un temps.',
                    items: [
                        { key: 'i_insist', name: 'J\'INSISTE', vo: 'I INSIST',
                            text: 'Lancez un tour de magie gratuitement, en ignorant tout désavantage ; il ne peut pas rater.' },
                        { key: 'elemental_affliction', name: 'AFFLICTION ÉLÉMENTAIRE', vo: 'ELEMENTAL AFFLICTION',
                            text: 'Une créature de votre choix à 12 cases ou moins devient chargée, fumante ou ralentie.' },
                        { key: 'no', name: 'NON', vo: 'NO',
                            text: 'Choisissez une créature ; elle ne peut pas blesser une créature de votre choix pendant son prochain tour.' },
                        { key: 'lose_control', name: 'PERTE DE CONTRÔLE', vo: 'LOSE CONTROL',
                            text: 'Faites TOUT ce qui précède, mais c\'est le MJ qui choisit à chaque fois.' },
                    ],
                },
            },
        },
        {
            key: 'chaos', name: 'Invocateur du Chaos', vo: 'Invoker of Chaos',
            summary: 'Embrassez un pouvoir qui dépasse votre compréhension ou votre contrôle. Laissez l\'univers couler en vous, abandonnez-vous aux forces sauvages de la magie, que l\'aléatoire et le CHAOS règnent !',
            complexity: 4,
            levels: {
                3: [
                    { key: 'force_of_chaos', name: 'Force du chaos', vo: 'Force of Chaos',
                        text: 'Chaque fois que vous lancez un sort, vous pouvez choisir de dépenser 1 point de mana de moins en Invoquant le chaos : lancez un dé sur la table du Chaos. Chaque fois que vous obtenez un critique, vous pouvez aussi Invoquer le chaos.\n*Où est la table du Chaos ?* C\'est un secret réservé au MJ ! Disons simplement qu\'obtenir un 1 est vraiment mauvais, mais qu\'obtenir un 20 est GÉNIAL. Si vous tenez absolument à gâcher la surprise, vous la trouverez au revers de la couverture du Guide du MJ. Que le chaos règne !' },
                ],
                7: [
                    { key: 'tempest_mage', name: 'Mage de la tempête', vo: 'Tempest Mage',
                        text: 'Apprenez 1 tour de magie et 1 sort de rang de l\'école du vent.' },
                    { key: 'chaos_lash', name: 'Fouet du chaos', vo: 'Chaos Lash', cost: 'réaction',
                        text: '(1/rencontre) Réaction (lorsqu\'un ennemi se déplace à votre contact) : il est repoussé de 2 cases et, s\'il rate une sauvegarde de VOL, il est également mis à terre. Invoquez le chaos.',
                        uses: { count: '1', per: 'encounter' } },
                ],
                11: [
                    { key: 'thrive_in_chaos', name: 'S\'épanouir dans le chaos', vo: 'Thrive in Chaos',
                        text: 'Chaque fois que vous Invoquez le chaos, vous pouvez lancer deux fois le dé et provoquer les deux effets. (1/repos sûr) Vous pouvez à la place choisir quel résultat utiliser.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
                15: [
                    { key: 'master_of_chaos', name: 'Maître du chaos', vo: 'Master of Chaos',
                        text: 'Chaque fois que vous Invoquez le chaos, lancez le dé avec avantage.' },
                ],
            },
        },
        {
            key: 'wards', name: 'Invocateur des Protections', vo: 'Invoker of Wards',
            summary: 'Drapez-vous dans une armure arcanique et protégez vos coéquipiers par des sauvegardes élémentaires. Devenez indomptable.',
            complexity: 4,
            levels: {
                3: [
                    { key: 'abjurer', name: 'Abjurateur', vo: 'Abjurer',
                        text: 'Les sorts défensifs que vous lancez sur vous-même (*Barrière de flammes* [Flame Barrier], *Bouclier de givre* [Frost Shield] et *Célérité* [Alacrity]) sont toujours lancés comme si vous y aviez dépensé 1 point de mana de plus (en ignorant votre limite habituelle d\'amplification).' },
                    { key: 'elemental_wards', name: 'Protections élémentaires', vo: 'Elemental Wards', cost: 'réaction',
                        text: 'Réaction (lorsqu\'un allié à Allonge 6 ou moins Se défend) : vous pouvez dépenser 1 point de mana pour lancer sur lui une Protection élémentaire :\n• **Protection de flamme.** Infligez d\'abord CLÉ dégâts et l\'état fumant à toutes les créatures au contact de votre allié.\n• **Protection de givre.** Accordez 2×CLÉ PV temporaires (jusqu\'au début de son prochain tour).\n• **Protection de foudre.** Les attaques le ratent sur un résultat de 2 ou moins. Il peut se déplacer de CLÉ cases gratuitement lors de son prochain tour.',
                        choice: { pool: 'elemental_wards', count: 1 } },
                ],
                7: [
                    { key: 'elemental_wards_2', name: 'Protections élémentaires (2)', vo: 'Elemental Wards (2)',
                        text: 'Vos Protections élémentaires gagnent +VOL d\'efficacité et +INT d\'Allonge.' },
                ],
                11: [
                    { key: 'abjurer_2', name: 'Abjurateur (2)', vo: 'Abjurer (2)',
                        text: 'Le 1er sort défensif que vous lancez sur vous-même à chaque rencontre alors que vous êtes mourant est gratuit et ne demande pas de sauvegarde. La 1re Protection que vous lancez sur un allié mourant à chaque rencontre lui accorde également +1 action.' },
                ],
                15: [
                    { key: 'elemental_aegis', name: 'Égide élémentaire', vo: 'Elemental Aegis', cost: 'réaction',
                        text: '(1/repos sûr) Réaction (lorsqu\'une créature amie est attaquée) : jusqu\'à CLÉ créatures à Allonge 8 ou moins gagnent TOUS les effets de vos Protections élémentaires jusqu\'à leur prochain tour.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
            },
            options: {
                elemental_wards: {
                    label: 'Protections élémentaires', vo: 'Elemental Wards',
                    text: 'À chaque déclenchement de Protections élémentaires, choisissez la Protection lancée sur l\'allié.',
                    items: [
                        { key: 'flame_ward', name: 'Protection de flamme', vo: 'Flame Ward',
                            text: 'Infligez d\'abord CLÉ dégâts et l\'état fumant à toutes les créatures au contact de votre allié.' },
                        { key: 'frost_ward', name: 'Protection de givre', vo: 'Frost Ward',
                            text: 'Accordez 2×CLÉ PV temporaires (jusqu\'au début de son prochain tour).' },
                        { key: 'lightning_ward', name: 'Protection de foudre', vo: 'Lightning Ward',
                            text: 'Les attaques le ratent sur un résultat de 2 ou moins. Il peut se déplacer de CLÉ cases gratuitement lors de son prochain tour.' },
                    ],
                },
            },
        },
        {
            key: 'flame', name: 'Invocateur de la Flamme', vo: 'Invoker of Flame',
            summary: 'Vous vous consacrez à l\'art de la pyromancie, choisissant de renoncer à votre maîtrise des autres éléments afin que vos flammes brûlent plus fort et plus chaud que celles de quiconque vous a précédé.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'fiery_dedication', name: 'Dévotion ardente', vo: 'Fiery Dedication',
                        text: 'Désormais, vous ne pouvez plus lancer que des sorts de feu. Vous débloquez les sorts de feu 1 niveau plus tôt.' },
                    { key: 'embercaster', name: 'Lanceur de braises', vo: 'Embercaster',
                        text: 'Lorsque vous lancez *Dard de flamme* (Flame Dart), vous pouvez dépenser 1 point de mana pour lancer 3d4 à la place et ignorer tout désavantage.' },
                ],
                7: [
                    { key: 'thy_embers_keeper', name: 'Gardien de tes braises', vo: 'Thy Embers\' Keeper',
                        text: 'Lorsque l\'Initiative est lancée, lancez *Feu du cœur* (Heart\'s Fire) gratuitement sur un allié.' },
                    { key: 'fireshaper', name: 'Façonneur de feu', vo: 'Fireshaper',
                        text: 'Choisissez 1 sort de glace ou de foudre et traitez-le comme un sort de feu.' },
                ],
                11: [
                    { key: 'flash_fire', name: 'Embrasement éclair', vo: 'Flash Fire',
                        text: '+VOL à l\'Initiative. Lorsque l\'Initiative est lancée, lancez *Arme enchantée* (Enchant Weapon) gratuitement.' },
                    { key: 'fireshaper_2', name: 'Façonneur de feu (2)', vo: 'Fireshaper (2)',
                        text: 'Choisissez 1 sort de glace ou de foudre et traitez-le comme un sort de feu.' },
                ],
                15: [
                    { key: 'phoenixform', name: 'Forme de phénix', vo: 'Phoenixform', cost: 'réaction',
                        text: '(1/repos sûr) Réaction (lorsque vous devriez tomber à 0 PV) : à la place, gagnez les effets du sort *Forme draconique* (Dragonform) (sauf que vous êtes un Phénix de taille moyenne) ; lorsqu\'il prend fin, gagnez 1 Blessure.',
                        uses: { count: '1', per: 'safeRest' } },
                    { key: 'fireshaper_3', name: 'Façonneur de feu (3)', vo: 'Fireshaper (3)',
                        text: 'Choisissez 1 sort de foudre ou de glace et traitez-le comme un sort de feu.' },
                ],
            },
        },
        {
            key: 'frost', name: 'Invocateur du Givre', vo: 'Invoker of Frost',
            summary: 'La glace coule dans vos veines. Cryomancien dévoué, vous renoncez à votre maîtrise des autres éléments afin que votre glace gèle plus profondément.',
            complexity: 3,
            levels: {
                3: [
                    { key: 'crown_of_ice', name: 'Couronne de glace', vo: 'Crown of Ice',
                        text: 'Désormais, vous ne pouvez plus lancer que des sorts de glace. Vous débloquez les sorts de glace 1 niveau plus tôt.' },
                    { key: 'aura_of_cold', name: 'Aura de froid', vo: 'Aura of Cold',
                        text: 'Les ennemis à votre contact sont ralentis. Vos PV temporaires inutilisés de *Bouclier de givre* (Frost Shield) durent jusqu\'à la fin de la rencontre. Votre sort *Fracasser* (Shatter) a une Allonge au lieu d\'une Portée.' },
                ],
                7: [
                    { key: 'crystalline_aegis', name: 'Égide cristalline', vo: 'Crystalline Aegis',
                        text: 'Lorsque vos PV temporaires de *Bouclier de givre* sont perdus, lancez *Fracasser* gratuitement sur un ennemi à votre contact.' },
                    { key: 'frostshaper', name: 'Façonneur de givre', vo: 'Frostshaper',
                        text: 'Choisissez 1 sort de feu ou de foudre et traitez-le comme un sort de glace.' },
                ],
                11: [
                    { key: 'bitter_cold', name: 'Froid mordant', vo: 'Bitter Cold',
                        text: 'Vos sorts ignorent l\'armure des créatures que vous avez entravées.' },
                    { key: 'frostshaper_2', name: 'Façonneur de givre (2)', vo: 'Frostshaper (2)',
                        text: 'Choisissez 1 sort de feu ou de foudre et traitez-le comme un sort de glace.' },
                ],
                15: [
                    { key: 'deep_freeze', name: 'Gel profond', vo: 'Deep Freeze',
                        text: 'Réduisez de 2 le coût en mana de tous vos sorts tant que vous avez des PV temporaires de *Bouclier de givre*.' },
                    { key: 'frostshaper_3', name: 'Façonneur de givre (3)', vo: 'Frostshaper (3)',
                        text: 'Choisissez 1 sort de feu ou de foudre et traitez-le comme un sort de glace.' },
                ],
            },
        },
        {
            key: 'surges', name: 'Invocateur des Surtensions', vo: 'Invoker of Surges',
            summary: 'Galvanisez-vous et pulvérisez vos ennemis d\'une énergie puissante mais instable.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'electrical_dedication', name: 'Dévotion électrique', vo: 'Electrical Dedication',
                        text: 'Désormais, vous ne pouvez plus lancer que des sorts de foudre. Choisissez 1 sort de feu et traitez-le comme un sort de foudre.' },
                    { key: 'power_surge', name: 'Surtension', vo: 'Power Surge',
                        text: 'Vous pouvez stocker jusqu\'à VOL utilisations de l\'état chargé à la fois. Après avoir lancé un sort de dégâts, vous pouvez subir 4 dégâts de foudre pour ajouter 1d8 aux dégâts.',
                        roll: { dice: '1d8', kind: 'plain', label: 'Surtension' } },
                    { key: 'blur', name: 'Flou', vo: 'Blur',
                        text: 'Tant que vous êtes chargé, réduisez de CLÉ TOUS les dégâts autres que de foudre que vous subissez.' },
                ],
                7: [
                    { key: 'jumpstart', name: 'Démarrage en trombe', vo: 'Jumpstart',
                        text: 'Lorsque vous lancez l\'Initiative, devenez chargé ; et gagnez 1 action supplémentaire lors du premier round de combat.' },
                    { key: 'power_surge_2', name: 'Surtension (2)', vo: 'Power Surge (2)',
                        text: 'Votre dé de Surtension devient un d10. Vous pouvez dépenser l\'état chargé pour en obtenir le maximum. Choisissez 1 sort de vent et traitez-le comme un sort de foudre.',
                        roll: { dice: '1d10', kind: 'plain', label: 'Surtension' } },
                ],
                11: [
                    { key: 'power_surge_3', name: 'Surtension (3)', vo: 'Power Surge (3)',
                        text: 'Votre dé de Surtension devient un d12. (1/rencontre) Vous pouvez dépenser l\'état chargé pour porter au maximum n\'importe quel dé d\'un sort que vous lancez.',
                        uses: { count: '1', per: 'encounter' },
                        roll: { dice: '1d12', kind: 'plain', label: 'Surtension' } },
                    { key: 'blur_2', name: 'Flou (2)', vo: 'Blur (2)',
                        text: 'Tant que vous êtes chargé, réduisez de 2×CLÉ TOUS les dégâts autres que de foudre que vous subissez.' },
                ],
                15: [
                    { key: 'power_surge_4', name: 'Surtension (4)', vo: 'Power Surge (4)',
                        text: 'Votre dé de Surtension devient un d20.',
                        roll: { dice: '1d20', kind: 'plain', label: 'Surtension' } },
                    { key: 'haywire', name: 'Détraqué', vo: 'Haywire',
                        text: 'Chaque fois que vous êtes mourant, vous gagnez les effets d\'*Électrocharge* (Electrocharge).' },
                ],
            },
        },
    ],
    spells: [],
    faq: [
        { q: 'Combien de sorts puis-je choisir ?',
            a: 'Vous connaissez tous les sorts des écoles de magie que vous connaissez, jusqu\'au rang que vous avez débloqué.' },
        { q: 'Comment Incantation en écho interagit-elle avec les sorts conditionnels (ex. *Embraser* [Ignite], *Fracasser* [Shatter]) ?',
            a: 'Vous ne pouvez cibler une créature avec le sort dupliqué que si elle remplit aussi les conditions requises.' },
        { q: 'Puis-je lancer plus d\'un sort défensif à la fois ?', a: 'Non.' },
        { q: 'Invocateur des Surtensions : subir des dégâts de Surtension me rend-il chargé ?',
            a: 'Oui, tout dégât de foudre vous donne l\'état chargé.' },
        { q: 'Comment fonctionne Perte de contrôle ?',
            a: 'Vous ne voudrez probablement jamais choisir cette option, mais la 4ᵉ fois que vous Exigez le contrôle au cours d\'une rencontre, vous devez la choisir. Le MJ utilise J\'INSISTE, AFFLICTION ÉLÉMENTAIRE et NON, en choisissant les cibles, les sorts et les autres effets.' },
    ],
};
