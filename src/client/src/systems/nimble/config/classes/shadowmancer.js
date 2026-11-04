// src/client/src/systems/nimble/config/classes/shadowmancer.js
// Source : Nimble Heroes — Shadowmancer 3.0 (PDF, p. 3-18).
// Classe Ombromancien : profil, 20 niveaux, tours de magie propres, invocations mineures et majeures,
// 6 sous-classes (dont le Faucheur, sous-classe d'histoire), FAQ.

export default {
    key: 'shadowmancer', name: 'Ombromancien', vo: 'Shadowmancer',
    tagline: 'Absolument pas maléfique (pourquoi diriez-vous une chose pareille ?)',
    summary: 'Usez de votre ruse pour conclure des pactes avec des entités antiques et insondables, et puisez dans leur pouvoir incompréhensible. Pliez les Ombres vivantes à votre volonté, invoquez-les pour submerger vos ennemis : elles vous servent à la fois d\'épée et de chair à canon. Renforcez vos capacités ténébreuses grâce aux invocations mineures et majeures de votre maître.',
    complexity: 3,
    keyStats: ['int', 'dex'],
    hitDie: 8, startingHp: 13,
    saves: { adv: 'int', dis: 'wil' },
    armor: { text: 'Armures de tissu', types: ['cloth'] },
    weapons: { text: 'Lames, baguettes', rule: { tags: ['blade'], wand: true } },
    startingGear: [{ key: 'adventurers_garb' }, { key: 'sickle' }, { key: 'shovel' }],
    resources: [
        { key: 'pilfered_power', label: 'Pouvoir dérobé', max: 'DEX', fromLevel: 2, reset: 'safeRest' },
        { key: 'shadows', label: 'Ombres', max: 'INT', fromLevel: 1, reset: 'encounter' },
    ],
    spellcasting: {
        schools: ['necrotic'],
        tiers: { 2: 1, 5: 2, 7: 3, 10: 4, 13: 5, 16: 6, 19: 7 },
        note: 'Pas de mana : chaque sort de rang se lance grâce au Pouvoir dérobé (DEX fois par repos sûr ; au-delà, votre Patron vous inflige la moitié de vos PV max). Tous vos sorts sont lancés au rang le plus élevé débloqué. Tours de magie d\'Ombromancien dès le niveau 1, école nécrotique (tours de magie et rang 1) à partir du niveau 2.',
    },
    levels: {
        1: [
            { key: 'conduit_of_shadow', name: 'Conduit de l\'ombre', vo: 'Conduit of Shadow',
                text: 'Apprenez les tours de magie d\'Ombromancien.' },
        ],
        2: [
            { key: 'master_of_darkness', name: 'Maître des ténèbres', vo: 'Master of Darkness',
                text: 'Apprenez tous les tours de magie nécrotiques et les sorts nécrotiques de rang 1.' },
            { key: 'pilfered_power', name: 'Pouvoir dérobé', vo: 'Pilfered Power',
                text: 'Vous pouvez dérober du pouvoir à votre Patron pour lancer des sorts de rang (DEX fois avant qu\'il ne s\'en aperçoive). Si vous dépassez cette limite, votre Patron vous inflige des dégâts égaux à la moitié de vos PV max en guise de dédommagement. Ce compteur se réinitialise lorsque vous communiez avec votre Patron pendant un repos sûr.',
                uses: { count: 'DEX', per: 'safeRest' } },
        ],
        3: [
            { key: 'the_pact_is_sealed', name: 'LE PACTE EST SCELLÉ', vo: 'THE PACT IS SEALED',
                text: 'Choisissez une sous-classe d\'Ombromancien et 1 invocation d\'ombre mineure.',
                subclass: true, choice: { pool: 'lesser', count: 1 } },
            { key: 'supplicate', name: 'Supplier', vo: 'Supplicate',
                text: 'Chaque fois que vous communiez avec votre Patron lors d\'un repos sûr, vous pouvez le supplier de vous laisser choisir d\'autres options d\'Ombromancien (il peut demander quelque chose en retour).' },
        ],
        4: [
            { key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'key', count: 1 } },
            { key: 'gift_from_the_master', name: 'Un don du Maître', vo: 'A Gift from the Master',
                text: 'Choisissez 1 invocation d\'ombre majeure.', choice: { pool: 'greater', count: 1 } },
        ],
        5: [
            { key: 'tier_2', name: 'Sorts de rang 2', vo: 'Tier 2 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 2 ; tous vos sorts sont lancés à ce rang.' },
            { key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
            { key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        6: [
            { key: 'gift_from_the_master_2', name: 'Un don du Maître (2)', vo: 'A Gift from the Master (2)',
                text: 'Choisissez une 2ᵉ invocation d\'ombre majeure.', choice: { pool: 'greater', count: 1 } },
            { key: 'shadowmastery', name: 'Maîtrise des ombres', vo: 'Shadowmastery', text: 'Choisissez 1 sort utilitaire nécrotique.' },
        ],
        7: [
            { key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Ombromancien.', subclassFeature: true },
            { key: 'tier_3', name: 'Sorts de rang 3', vo: 'Tier 3 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 3 ; tous vos sorts sont lancés à ce rang.' },
        ],
        8: [
            { key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'key', count: 1 } },
            { key: 'lesser_invocation', name: 'Invocation mineure', vo: 'Lesser Invocation',
                text: 'Choisissez une 2ᵉ invocation d\'ombre mineure.', choice: { pool: 'lesser', count: 1 } },
            { key: 'shadowmastery_2', name: 'Maîtrise des ombres (2)', vo: 'Shadowmastery (2)', text: 'Choisissez un 2ᵉ sort utilitaire nécrotique.' },
        ],
        9: [
            { key: 'gift_from_the_master_3', name: 'Un don du Maître (3)', vo: 'A Gift from the Master (3)',
                text: 'Choisissez une 3ᵉ invocation d\'ombre majeure.', choice: { pool: 'greater', count: 1 } },
            { key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        10: [
            { key: 'tier_4', name: 'Sorts de rang 4', vo: 'Tier 4 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 4 ; tous vos sorts sont lancés à ce rang.' },
            { key: 'upgraded_cantrips_10', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        11: [
            { key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Ombromancien.', subclassFeature: true },
            { key: 'lesser_invocation_2', name: 'Invocation mineure (2)', vo: 'Lesser Invocation (2)',
                text: 'Choisissez une 3ᵉ invocation d\'ombre mineure.', choice: { pool: 'lesser', count: 1 } },
        ],
        12: [
            { key: 'greedy_pact', name: 'Pacte avide', vo: 'Greedy Pact',
                text: 'Lorsque vous devriez subir des dégâts du Pouvoir dérobé, faites une sauvegarde de FOR :\n• **1–9 :** vous subissez les dégâts normalement.\n• **10–19 :** vous ne subissez que 10 PV de dégâts.\n• **20+ :** vous ne subissez aucun dégât et lancez le sort comme s\'il était d\'1 rang plus élevé.' },
            { key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'key', count: 1 } },
        ],
        13: [
            { key: 'tier_5', name: 'Sorts de rang 5', vo: 'Tier 5 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 5 ; tous vos sorts sont lancés à ce rang.' },
            { key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        14: [
            { key: 'gift_from_the_master_4', name: 'Un don du Maître (4)', vo: 'A Gift from the Master (4)',
                text: 'Choisissez une 4ᵉ invocation d\'ombre majeure.', choice: { pool: 'greater', count: 1 } },
            { key: 'shadowmastery_3', name: 'Maîtrise des ombres (3)', vo: 'Shadowmastery (3)', text: 'Vous connaissez tous les sorts utilitaires nécrotiques.' },
        ],
        15: [
            { key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Ombromancien.', subclassFeature: true },
            { key: 'upgraded_cantrips_15', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        16: [
            { key: 'tier_6', name: 'Sorts de rang 6', vo: 'Tier 6 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 6 ; tous vos sorts sont lancés à ce rang.' },
            { key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 INT ou DEX.', statIncrease: { from: 'key', count: 1 } },
        ],
        17: [
            { key: 'dire_shadows', name: 'Ombres funestes', vo: 'Dire Shadows',
                text: 'Les attaques contre vos Ombres sont effectuées avec désavantage. Elles ne subissent aucun dégât sur une sauvegarde réussie.' },
            { key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        18: [
            { key: 'gift_from_the_master_5', name: 'Un don du Maître (5)', vo: 'A Gift from the Master (5)',
                text: 'Choisissez une 5ᵉ invocation d\'ombre majeure.', choice: { pool: 'greater', count: 1 } },
        ],
        19: [
            { key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).', epicBoon: true },
            { key: 'tier_7', name: 'Sorts de rang 7', vo: 'Tier 7 Spells',
                text: 'Vous pouvez désormais lancer des sorts de rang 7 ; tous vos sorts sont lancés à ce rang.' },
        ],
        20: [
            { key: 'eldritch_usurper', name: 'Usurpateur occulte', vo: 'Eldritch Usurper',
                text: '+1 à 2 caractéristiques au choix. (1/rencontre) Lorsque vous lancez *Invoquer une Ombre*, vous pouvez invoquer une Ombre majeure à la place.\n**Ombre majeure.** Un sbire 5d12. Lorsqu\'elle meurt, elle explose en 5 Ombres (en ignorant votre limite d\'Ombres). Placez-les n\'importe où à Allonge 6 ou moins.',
                statIncrease: { from: 'any', count: 2 }, uses: { count: '1', per: 'encounter' } },
            { key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
    },
    options: {
        lesser: {
            label: 'Invocations mineures', vo: 'Lesser Invocations',
            text: '**Supplier.** Chaque fois que vous communiez avec votre Patron lors d\'un repos sûr, vous pouvez le supplier de vous laisser choisir d\'autres options d\'Ombromancien (il peut demander quelque chose en retour).',
            items: [
                { key: 'abhorrent_speech', name: 'Langage abominable', vo: 'Abhorrent Speech', cost: 'passif',
                    text: 'Vous pouvez communiquer avec les créatures horribles (aberrations, morts-vivants, etc.).' },
                { key: 'beguiling_influence', name: 'Influence envoûtante', vo: 'Beguiling Influence', cost: '1 action',
                    text: '(1/repos sûr) Vous pouvez relancer un test d\'Influence.', uses: { count: '1', per: 'safeRest' } },
                { key: 'blood_sight', name: 'Vue du sang', vo: 'Blood Sight', cost: '1 action',
                    text: '(1/repos sûr) Vous pouvez relancer un test d\'Examen. De plus, vous pouvez détecter les traces de sang sur une surface, même après qu\'elle a été nettoyée.',
                    uses: { count: '1', per: 'safeRest' } },
                { key: 'devoted_acolyte', name: 'Acolyte dévoué', vo: 'Devoted Acolyte', cost: 'passif',
                    text: 'Apprenez 2 des langues suivantes : céleste, draconique, langue des profondeurs, infernal ou primordial. Avantage aux tests de Savoir liés à ces 2 langues.' },
                { key: 'eldritch_sense', name: 'Sens occulte', vo: 'Eldritch Sense', cost: 'passif',
                    text: 'Vous pouvez percevoir tout métamorphe ou toute créature dissimulée par la magie à Allonge 6 ou moins.' },
                { key: 'gaze_of_two_minds', name: 'Regard des deux esprits', vo: 'Gaze of Two Minds', cost: '1 action',
                    text: 'Touchez une créature consentante et percevez à travers ses sens plutôt que les vôtres tant que vous maintenez votre concentration.' },
                { key: 'knowledge_from_beyond', name: 'Savoir de l\'au-delà', vo: 'Knowledge from Beyond', cost: '0 action',
                    text: 'Si vous ratez un test d\'Intuition ou d\'Arcanes, vous pouvez subir 1 Blessure pour le réussir à la place.' },
                { key: 'my_favored_pet', name: 'Mon animal préféré', vo: 'My Favored Pet', cost: 'passif',
                    text: 'Une Ombre peut vous tolérer à contrecœur en dehors des combats. Elle peut accomplir (de façon très inquiétante) n\'importe quelle tâche subalterne dont serait capable un roturier en dessous de la moyenne.' },
                { key: 'voice_of_the_dark', name: 'Voix des ténèbres', vo: 'Voice of the Dark', cost: 'passif',
                    text: 'Vous pouvez communiquer par télépathie avec un humanoïde à 6 cases ou moins.' },
                { key: 'whispers_of_the_grave', name: 'Murmures de la tombe', vo: 'Whispers of the Grave', cost: '1 action',
                    text: '(1/repos sûr) Posez 3 questions fermées (oui/non) à une créature morte. Vous ne pourrez plus jamais l\'interroger de cette façon.',
                    uses: { count: '1', per: 'safeRest' } },
            ],
        },
        greater: {
            label: 'Invocations majeures', vo: 'Greater Invocations',
            text: '**Supplier.** Chaque fois que vous communiez avec votre Patron lors d\'un repos sûr, vous pouvez le supplier de vous laisser choisir d\'autres options d\'Ombromancien (il peut demander quelque chose en retour).',
            items: [
                { key: 'armor_of_shadows', name: 'Armure d\'ombres', vo: 'Armor of Shadows', cost: 'passif',
                    text: 'Réduisez tous les dégâts que vous subissez d\'un montant égal au nombre d\'Ombres que vous avez.' },
                { key: 'fiendish_boon', name: 'Faveur démoniaque', vo: 'Fiendish Boon', cost: 'passif',
                    text: 'Augmentez votre DEX ou votre INT de 1. Vous avez 1 dé de vie max de moins.' },
                { key: 'hungering_shadows', name: 'Ombres affamées', vo: 'Hungering Shadows', cost: 'passif',
                    text: 'Chaque fois que l\'une de vos Ombres obtient le maximum, le prochain sort de rang que vous lancez lors de cette rencontre ne consomme pas d\'utilisation de Pouvoir dérobé.' },
                { key: 'one_with_shadows', name: 'Un avec les ombres', vo: 'One with Shadows', cost: '1 action',
                    text: 'Lorsque vous êtes au contact d\'une Ombre ou dans une zone de faible lumière ou d\'obscurité, vous pouvez devenir invisible jusqu\'à ce que vous vous déplaciez ou attaquiez (invoquer et commander des sbires ne compte pas comme une attaque).' },
                { key: 'repelling_blast', name: 'Déflagration répulsive', vo: 'Repelling Blast', cost: 'passif',
                    text: 'Votre *Déflagration d\'ombre* gagne : Sur un coup : repoussé de 2.' },
                { key: 'shadow_magus', name: 'Mage des ombres', vo: 'Shadow Magus', cost: 'passif',
                    text: 'Vos Ombres gagnent +4 d\'Allonge et infligent des dégâts d10 à la place.' },
                { key: 'shadow_spear', name: 'Lance d\'ombre', vo: 'Shadow Spear', cost: 'passif',
                    text: 'Votre *Déflagration d\'ombre* gagne +8 de Portée, ignore les abris, a l\'avantage contre les cibles à terre (au lieu du désavantage) et fait un critique sur un 1.' },
                { key: 'shadow_rush', name: 'Ruée des ombres', vo: 'Shadow Rush', cost: 'passif',
                    text: 'Chaque fois que vos Ombres attaquent, au lieu de lancer les dégâts, vous pouvez faire en sorte que n\'importe lesquelles d\'entre elles infligent le montant maximal, puis meurent.' },
                { key: 'shadow_warp', name: 'Distorsion d\'ombre', vo: 'Shadow Warp', cost: '1 action',
                    text: '(Allonge 12) Échangez votre place avec une créature qui a subi des dégâts nécrotiques ce tour-ci.' },
                { key: 'swarming_shadows', name: 'Ombres grouillantes', vo: 'Swarming Shadows', cost: 'passif',
                    text: 'Chaque fois qu\'une Ombre obtient le maximum, invoquez une autre Ombre au contact de la cible (en ignorant votre limite d\'Ombres).' },
            ],
        },
    },
    subclasses: [
        {
            key: 'red_dragon', name: 'Pacte du Dragon rouge', vo: 'Pact of the Red Dragon',
            summary: 'Les flammes du Grand Dragon sont vôtres. Sa colère est vôtre. Bientôt, même sa chair le sera aussi.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'draconic_crimson_rite', name: 'Rite draconique écarlate', vo: 'Draconic Crimson Rite',
                        text: 'Votre Patron vous accorde la connaissance des sorts de feu. Vos Ombres deviennent des Ombres de dragonnets enflammés. Votre *Déflagration d\'ombre* et vos Ombres peuvent infliger des dégâts de feu ou nécrotiques et infligent l\'état fumant chaque fois qu\'elles obtiennent le maximum.' },
                ],
                7: [
                    { key: 'well_all_burn', name: 'On va TOUS brûler !', vo: 'We\'ll ALL Burn!',
                        text: 'Vous pouvez lancer *Pyroclasme* (Pyroclasm) sans Dérober de pouvoir en vous incluant dans les dégâts. Vous avez l\'avantage à la sauvegarde. Choisissez 1 sort utilitaire de feu.' },
                ],
                11: [
                    { key: 'heart_of_burning_fire', name: 'Cœur de feu ardent', vo: 'Heart of Burning Fire',
                        text: 'Récupérez 1 utilisation de Pouvoir dérobé chaque fois que vous lancez l\'Initiative. Elle expire à la fin du combat si elle n\'est pas utilisée.' },
                ],
                15: [
                    { key: 'enveloped_by_the_master', name: 'Enveloppé par le Maître', vo: 'Enveloped by the Master',
                        text: 'Gagnez 1d4 Blessures pour lancer *Forme draconique* (Dragonform).' },
                ],
            },
        },
        {
            key: 'abyssal_depths', name: 'Pacte des Profondeurs abyssales', vo: 'Pact of the Abyssal Depths',
            summary: 'Des tentacules glacés jaillissent de l\'abîme et entraînent vos ennemis dans un froid et des ténèbres absolus.',
            complexity: 3,
            levels: {
                3: [
                    { key: 'master_of_nightfrost', name: 'Maître du givre nocturne', vo: 'Master of Nightfrost',
                        text: 'Votre Patron vous accorde la connaissance des sorts de glace. Vous gagnez la capacité de respirer sous l\'eau. Vos Ombres deviennent des êtres de givre nocturne. Votre *Déflagration d\'ombre* et vos Ombres peuvent infliger des dégâts de froid ou nécrotiques et, chaque fois qu\'elles obtiennent le maximum, vous gagnez INT+NIV PV temporaires.' },
                ],
                7: [
                    { key: 'shadowrime', name: 'Givre d\'ombre', vo: 'Shadowrime',
                        text: 'Votre *Déflagration d\'ombre* ralentit également. Vous pouvez lancer *Givre-présage* (Omenrime) ou *Lames de givre* (Rimeblades) sans Dérober de pouvoir en dépensant 10 PV temporaires. Choisissez 1 sort utilitaire de glace.' },
                ],
                11: [
                    { key: 'glacial_resilience', name: 'Résilience glaciale', vo: 'Glacial Resilience', cost: 'réaction',
                        text: '(1/repos sûr) Réaction (chaque fois que vous êtes attaqué ou devriez subir un état) : gagnez 10×NIV PV temporaires et mettez fin à TOUS les états négatifs qui vous affectent. À la fin de votre prochain tour, les PV temporaires restants sont perdus.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
                15: [
                    { key: 'cryomancers_reprisal', name: 'Représailles du cryomancien', vo: 'Cryomancer\'s Reprisal',
                        text: 'Payez la moitié de vos PV max pour lancer N\'IMPORTE QUEL sort de glace. Après avoir lancé un sort de glace de cette façon, vous gagnez une aura invisible : la prochaine créature qui vous touche avec une attaque de mêlée lors de cette rencontre subit des dégâts de froid égaux à la moitié des PV que vous avez dépensés pour ce lancement.' },
                ],
            },
        },
        {
            key: 'void', name: 'Pacte du Néant', vo: 'Pact of the Void',
            summary: 'Votre maître cosmique vous contemple depuis au-delà des étoiles. Le temps et l\'espace ne sont que des jouets entre vos mains.',
            complexity: 3,
            levels: {
                3: [
                    { key: 'void_spawn', name: 'Engeance du néant', vo: 'Void Spawn',
                        text: 'Vous pouvez invoquer des Ombres à Allonge 6 ou moins.' },
                    { key: 'void_step', name: 'Pas du néant', vo: 'Void Step',
                        text: 'Vous et vos alliés pouvez vous déplacer entre les cases qu\'occupent vos Ombres comme s\'il s\'agissait de la même case (mais sans pouvoir terminer un déplacement dans une case occupée).' },
                ],
                7: [
                    { key: 'voidstrike', name: 'Frappe du néant', vo: 'Voidstrike',
                        text: 'Vous et vos alliés pouvez attaquer entre les cases qu\'occupent vos Ombres comme s\'il s\'agissait de la même case. Vous obtenez l\'avantage en attaquant de cette façon (ex. un allié à côté d\'une Ombre peut faire une attaque de mêlée contre n\'importe quel ennemi lui aussi au contact d\'une Ombre).' },
                    { key: 'the_vast_cold', name: 'Le Vaste Froid', vo: 'The Vast Cold',
                        text: 'Vos Ombres infligent l\'état ralenti lorsqu\'elles sont attaquées en mêlée.' },
                ],
                11: [
                    { key: 'void_singularity', name: 'Singularité du néant', vo: 'Void Singularity',
                        text: '(Allonge 1 par Ombre) Chaque fois qu\'une ou plusieurs Ombres entrent dans la case d\'une autre Ombre, toutes implosent et meurent, infligeant leurs dégâts cumulés à toutes les créatures de la zone et les attirant vers le centre comme vous le souhaitez.' },
                ],
                15: [
                    { key: 'the_consuming_dark', name: 'Les Ténèbres dévorantes', vo: 'The Consuming Dark',
                        text: '(1/rencontre) Lorsqu\'une Ombre tue un ennemi, vous pouvez la transformer en Ombre majeure.',
                        uses: { count: '1', per: 'encounter' } },
                    { key: 'urgent_command', name: 'Ordre pressant', vo: 'Urgent Command', cost: 'réaction',
                        text: 'Gagnez une Blessure pour déplacer vos Ombres en réaction.' },
                ],
            },
        },
        {
            key: 'endless_swarm', name: 'Pacte de l\'Essaim sans fin', vo: 'Pact of the Endless Swarm',
            summary: 'Nuisibles et vermine… Même les plus faibles deviennent forts par le nombre. Les créatures de votre essaim sont infinies et inflexibles.',
            complexity: 3,
            levels: {
                3: [
                    { key: 'summon_hive', name: 'Invoquer une ruche', vo: 'Summon Hive',
                        text: 'Chaque fois que vous lancez *Invoquer une Ombre*, invoquez aussi une Ruche à Allonge 2 ou moins (maximum INT Ruches).\n**Ruche.** Sbire immobile ; les ennemis à Allonge 2 ou moins attaquent avec désavantage. À la fin de chacun de vos tours, elle engendre un essaim : lancez et mettez de côté 1d4. Chaque fois que vous ou un allié attaquez, vous pouvez dépenser n\'importe lesquels de ces dés pour augmenter les dégâts infligés.',
                        roll: { dice: '1d4', kind: 'plain', label: 'Essaim' } },
                ],
                7: [
                    { key: 'rampant_brood', name: 'Couvée débordante', vo: 'Rampant Brood',
                        text: 'Lorsqu\'une Ruche meurt, elle engendre 2 essaims. Chaque fois que vous lancez *Commander les Ombres*, vos Ruches peuvent aussi se déplacer.' },
                    { key: 'broodlord', name: 'Seigneur de la couvée', vo: 'Broodlord',
                        text: 'Vous pouvez dépenser votre réaction S\'interposer pour qu\'une Ruche S\'interpose pour vous ou pour un allié à la place.' },
                ],
                11: [
                    { key: 'impending_infestation', name: 'Infestation imminente', vo: 'Impending Infestation',
                        text: 'Invoquez 1 Ruche supplémentaire pour chaque fois où vous avez déjà lancé *Invoquer une Ombre* lors de cette rencontre.' },
                ],
                15: [
                    { key: 'terrible_plague', name: 'Terrible fléau', vo: 'Terrible Plague',
                        text: 'Vos essaims passent à des dégâts d8 et l\'Allonge de vos Ruches passe à 3.',
                        roll: { dice: '1d8', kind: 'plain', label: 'Essaim' } },
                ],
            },
        },
        {
            key: 'high_celestial', name: 'Pacte du Haut Céleste', vo: 'Pact of the High Celestial',
            summary: 'N\'ayez crainte ! Vos esprits radieux renforcent, bénissent et protègent ceux que vous jugez dignes.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'divine_bestowal', name: 'Don divin', vo: 'Divine Bestowal',
                        text: 'Vos Ombres deviennent des Esprits radieux : elles perdent la capacité d\'attaquer directement, mais peuvent entrer dans la case d\'un allié et le bénir. Elles se déplacent partout où l\'allié se déplace, et chacune accorde à l\'allié +2 dégâts à ses attaques et +2 de réduction des dégâts des attaques qu\'il subit. Si un allié subit des dégâts, tous les sbires qui le bénissent meurent.' },
                ],
                7: [
                    { key: 'radiant_boon', name: 'Faveur radieuse', vo: 'Radiant Boon',
                        text: 'Vous pouvez cibler des alliés avec *Déflagration d\'ombre* et leur donner des PV temporaires au lieu de leur infliger des dégâts.' },
                ],
                11: [
                    { key: 'divine_bestowal_2', name: 'Don divin (2)', vo: 'Divine Bestowal (2)',
                        text: 'La bénédiction de vos sbires passe à 3.' },
                    { key: 'celestial_armor', name: 'Armure céleste', vo: 'Celestial Armor',
                        text: 'Lorsqu\'un allié béni Se défend ou S\'interpose, 1 sbire qui le bénit peut se sacrifier pour subir les dégâts à sa place.' },
                ],
                15: [
                    { key: 'apotheosis', name: 'Apothéose', vo: 'Apotheosis',
                        text: '(1/repos sûr) Pendant 1 round, vous êtes immunisé contre tous les dégâts et tous les effets négatifs. Chaque fois que vous devriez lancer un d20, lancez un d100 à la place, et chaque fois que vous devriez lancer un dé inférieur à un d20, lancez un d20.',
                        uses: { count: '1', per: 'safeRest' } },
                ],
            },
        },
        {
            key: 'reaver', name: 'Faucheur', vo: 'Reaver',
            summary: 'Rejeté, né à nouveau.',
            complexity: null,
            story: true,
            levels: {
                3: [
                    { key: 'hollow_one', name: 'L\'Évidé', vo: 'Hollow One',
                        text: 'Coupé de votre Patron, vous ne pouvez plus lancer *Déflagration d\'ombre*, ni lancer de sorts de rang grâce au Pouvoir dérobé. En guise de cadeau d\'adieu, vous avez toutefois dérobé un secret à votre Patron : la Faux d\'os magique, une arme de tendons et d\'os imprégnée de magie ténébreuse.' },
                    { key: 'summon_bonescythe', name: 'Invoquer la Faux d\'os', vo: 'Summon Bonescythe', cost: '1 action',
                        text: 'Invoquez une Faux d\'os magique, une arme de mêlée. (Allonge 2) 2d12 tranchants + DEX dégâts nécrotiques à CHAQUE dé (ajoutez 1 dé de dégâts supplémentaire tous les 5 niveaux). Sur un coup (ou à la fin du combat) : elle vole en éclats et doit être invoquée de nouveau pour être utilisée. Les invocations qui affectent *Déflagration d\'ombre* affectent votre Faux d\'os à la place.' },
                    { key: 'shadow_exploit', name: 'Exploitation des ombres', vo: 'Shadow Exploit',
                        text: 'Chaque fois que vous Vous défendez, vous pouvez sacrifier une Ombre pour ne subir aucun dégât. Ou vous pouvez sacrifier une Ombre pour lancer un sort au rang le plus élevé que vous avez débloqué. Chaque utilisation suivante de cette capacité lors d\'une même rencontre coûte 1 Ombre de plus.' },
                ],
                7: [
                    { key: 'grim_harrow', name: 'Herse sinistre', vo: 'Grim Harrow',
                        text: 'Lorsque vous frappez avec votre Faux d\'os, traitez chaque dé comme un dé primaire. Vous pouvez répartir les dés comme vous le souhaitez entre autant de cibles adjacentes à Allonge que vous voulez.' },
                    { key: 'reap', name: 'Moisson', vo: 'Reap',
                        text: 'Lorsque votre Faux d\'os fait un critique ou tue une créature, invoquez une Ombre gratuitement (en ignorant votre limite d\'Ombres).' },
                ],
                11: [
                    { key: 'my_blood_my_power', name: 'Mon sang, mon pouvoir', vo: 'My Blood, My Power',
                        text: 'Vous pouvez subir 1 Blessure pour lancer un sort de rang que vous connaissez au rang le plus élevé que vous avez débloqué.' },
                    { key: 'otherworldly_might', name: 'Puissance d\'outre-monde', vo: 'Otherworldly Might',
                        text: 'Avantage aux sauvegardes de concentration si vous avez des Ombres.' },
                ],
                15: [
                    { key: 'sovereign_one', name: 'Le Souverain', vo: 'Sovereign One',
                        text: 'Invoquez 2 Ombres et votre Faux d\'os gratuitement lorsque vous lancez l\'Initiative.' },
                ],
            },
        },
    ],
    spells: [
        {
            key: 'summon_shadow', name: 'Invoquer une Ombre', vo: 'Summon Shadow',
            school: 'shadowmancer', tier: 0, utility: false, cost: '1 action',
            target: 'Case adjacente',
            text: 'Invoquez 1 Ombre adjacente (un sbire d12).',
            highLevels: { text: '+1 Ombre tous les 5 niveaux.', every: 5 },
            notes: '**Sbires.** Elles suivent les règles des sbires et vous abandonnent immédiatement en dehors des combats.\n**Limite d\'Ombres.** Vous pouvez avoir jusqu\'à INT Ombres.',
        },
        {
            key: 'command_shadows', name: 'Commander les Ombres', vo: 'Command Shadows',
            school: 'shadowmancer', tier: 0, utility: false, cost: '1 action',
            target: 'Vos Ombres',
            text: 'TOUTES vos Ombres se déplacent de 6 puis attaquent (1/round).',
        },
        {
            key: 'shadow_blast', name: 'Déflagration d\'ombre', vo: 'Shadow Blast',
            school: 'shadowmancer', tier: 0, utility: false, cost: '1 action',
            target: 'Portée 8',
            damage: { dice: '1d12', bonus: 'DEX', type: 'necrotic' },
            text: 'Dégâts : 1d12+DEX (1/round).',
            highLevels: { text: '+1d12 tous les 5 niveaux.', every: 5, dice: '1d12' },
        },
    ],
    faq: [
        { q: 'Ombres affamées ou Ombres grouillantes se combinent-elles avec Ruée des ombres ?',
            a: 'Non. Ombres affamées et Ombres grouillantes exigent d\'obtenir le maximum au jet ; Ruée des ombres renonce à lancer les dés.' },
        { q: 'Puis-je dépasser ma limite d\'Ombres ?',
            a: 'Certains sorts et capacités peuvent le permettre, mais tant que vous êtes à votre limite d\'Ombres ou au-delà, lancer *Invoquer une Ombre* n\'a aucun effet.' },
        { q: 'Comment les sbires et les essaims interagissent-ils avec l\'armure ?',
            a: 'Additionnez tous les dés des sbires ou des essaims et traitez-les comme une seule attaque.' },
    ],
};
