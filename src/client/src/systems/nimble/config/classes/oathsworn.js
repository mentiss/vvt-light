// src/client/src/systems/nimble/config/classes/oathsworn.js
// Source : Nimble Heroes — Oathsworn 3.0 (PDF, p. 3-14).
// Classe Assermenté : profil, 20 niveaux, Décrets sacrés, 5 sous-classes (dont le Parjure, sous-classe d'histoire), FAQ.

export default {
    key: 'oathsworn', name: 'Assermenté', vo: 'Oathsworn',
    tagline: 'Ma vie pour mes amis',
    summary: 'Châtiez avec un jugement vertueux : plus vous affrontez le mal, plus vos coups deviennent puissants. Dressez-vous en bastion défensif, protégez vos alliés même à distance et portez la justice dans chaque recoin du royaume. Pansez les blessures et inspirez les autres à embrasser votre noble cause avec une conviction inébranlable.',
    complexity: 2,
    keyStats: ['str', 'wil'],
    hitDie: 10, startingHp: 17,
    saves: { adv: 'str', dis: 'dex' },
    armor: { text: 'Toutes les armures', types: ['cloth', 'leather', 'mail', 'plate', 'shield'] },
    weapons: { text: 'Armes de mêlée de FOR', rule: { stats: ['str'], range: 'melee' } },
    startingGear: [{ key: 'club_mace' }, { key: 'rusty_mail' }, { key: 'wooden_buckler' }, { key: 'manacles' }],
    resources: [
        { key: 'judgment', label: 'Dés de Jugement', max: '2', maxByLevel: { 1: '2', 14: '3' }, die: 'd6',
            dieByLevel: { 1: 'd6', 3: 'd8', 5: 'd10', 8: 'd12', 10: 'd20' }, reset: 'encounter' },
        { key: 'lay_on_hands', label: 'Imposition des mains', max: '5*LVL', fromLevel: 1, reset: 'safeRest' },
        { key: 'mana', label: 'Mana', max: 'WIL+LVL', fromLevel: 2, reset: 'safeRest' },
    ],
    spellcasting: {
        schools: ['radiant'],
        tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 13: 6, 17: 7 },
        note: 'Tours de magie et sorts de rang 1 radiants à partir du niveau 2 seulement (aucun sort au niveau 1).',
    },
    levels: {
        1: [
            { key: 'radiant_judgment', name: 'Jugement radieux', vo: 'Radiant Judgment',
                text: 'Chaque fois qu\'un ennemi vous attaque, lancez et mettez de côté 2d6 dés de Jugement (si vous n\'en avez aucun actuellement). Ils sont dépensés lors de votre prochaine attaque à Allonge de cette rencontre, et infligent leur total en dégâts radiants supplémentaires (ils sont perdus sur un raté).',
                roll: { dice: '2d6', kind: 'plain', label: 'Dés de Jugement' } },
            { key: 'lay_on_hands', name: 'Imposition des mains', vo: 'Lay on Hands', cost: '1 action',
                text: 'Vous gagnez une réserve magique de pouvoir de guérison. Le maximum de cette réserve est toujours égal à 5×NIV et elle se recharge lors d\'un repos sûr. Action : touchez une cible et dépensez autant de pouvoir de guérison restant que vous le souhaitez pour lui rendre autant de PV.' },
        ],
        2: [
            { key: 'radiant_spellcasting', name: 'Mana et magie radiante', vo: 'Mana and Radiant Spellcasting',
                text: 'Vous connaissez les tours de magie et les sorts de rang 1 radiants, et gagnez une réserve de mana. Votre réserve de mana est égale à VOL+NIV et se recharge lors d\'un repos sûr.' },
            { key: 'zealot', name: 'Zélote', vo: 'Zealot',
                text: 'Chaque fois que vous touchez avec une arme de mêlée, vous pouvez dépenser du mana pour infliger +5 dégâts par point de mana dépensé (jusqu\'au rang de sort que vous avez débloqué).' },
            { key: 'paragon_of_virtue', name: 'Parangon de vertu', vo: 'Paragon of Virtue',
                text: 'Avantage aux tests d\'Influence pour convaincre quelqu\'un lorsque vous dites franchement la vérité, désavantage lorsque vous l\'induisez en erreur.' },
        ],
        3: [
            { key: 'subclass', name: 'Sous-classe', vo: 'Subclass', text: 'Engagez-vous dans un Serment et gagnez ses bienfaits.', subclass: true },
            { key: 'radiant_judgment_2', name: 'Jugement radieux (2)', vo: 'Radiant Judgment (2)',
                text: 'Vos dés de Jugement sont des d8.', roll: { dice: '2d8', kind: 'plain', label: 'Dés de Jugement' } },
            { key: 'sacred_decree', name: 'Décret sacré', vo: 'Sacred Decree', text: 'Apprenez 1 Décret sacré.', choice: { pool: 'decrees', count: 1 } },
        ],
        4: [
            { key: 'my_life_for_my_friends', name: 'Ma vie pour mes amis', vo: 'My Life, for My Friends',
                text: 'Vous pouvez S\'interposer gratuitement.' },
            { key: 'tier_2', name: 'Sorts de rang 2', vo: 'Tier 2 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 2.' },
            { key: 'key_stat_increase_4', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        5: [
            { key: 'radiant_judgment_3', name: 'Jugement radieux (3)', vo: 'Radiant Judgment (3)',
                text: 'Vos dés de Jugement sont des d10.', roll: { dice: '2d10', kind: 'plain', label: 'Dés de Jugement' } },
            { key: 'upgraded_cantrips_5', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
            { key: 'secondary_stat_increase_5', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 DEX ou INT.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        6: [
            { key: 'tier_3', name: 'Sorts de rang 3', vo: 'Tier 3 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 3.' },
            { key: 'sacred_decree_2', name: 'Décret sacré (2)', vo: 'Sacred Decree (2)', text: 'Apprenez un 2ᵉ Décret sacré.', choice: { pool: 'decrees', count: 1 } },
        ],
        7: [
            { key: 'subclass_7', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Assermenté.', subclassFeature: true },
            { key: 'master_of_radiance', name: 'Maître du rayonnement', vo: 'Master of Radiance', text: 'Choisissez 1 sort utilitaire radiant.' },
        ],
        8: [
            { key: 'tier_4', name: 'Sorts de rang 4', vo: 'Tier 4 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 4.' },
            { key: 'radiant_judgment_4', name: 'Jugement radieux (4)', vo: 'Radiant Judgment (4)',
                text: 'Vos dés de Jugement sont des d12.', roll: { dice: '2d12', kind: 'plain', label: 'Dés de Jugement' } },
            { key: 'key_stat_increase_8', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        9: [
            { key: 'sacred_decree_3', name: 'Décret sacré (3)', vo: 'Sacred Decree (3)', text: 'Apprenez un 3ᵉ Décret sacré.', choice: { pool: 'decrees', count: 1 } },
            { key: 'secondary_stat_increase_9', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 DEX ou INT.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        10: [
            { key: 'tier_5', name: 'Sorts de rang 5', vo: 'Tier 5 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 5.' },
            { key: 'upgraded_cantrips_10', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
            { key: 'radiant_judgment_5', name: 'Jugement radieux (5)', vo: 'Radiant Judgment (5)',
                text: 'Vos dés de Jugement sont des d20.', roll: { dice: '2d20', kind: 'plain', label: 'Dés de Jugement' } },
        ],
        11: [
            { key: 'subclass_11', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Assermenté.', subclassFeature: true },
            { key: 'master_of_radiance_2', name: 'Maître du rayonnement (2)', vo: 'Master of Radiance (2)', text: 'Choisissez un 2ᵉ sort utilitaire radiant.' },
        ],
        12: [
            { key: 'sacred_decree_4', name: 'Décret sacré (4)', vo: 'Sacred Decree (4)', text: 'Apprenez un 4ᵉ Décret sacré.', choice: { pool: 'decrees', count: 1 } },
            { key: 'key_stat_increase_12', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        13: [
            { key: 'tier_6', name: 'Sorts de rang 6', vo: 'Tier 6 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 6.' },
            { key: 'secondary_stat_increase_13', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 DEX ou INT.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        14: [
            { key: 'sacred_decree_5', name: 'Décret sacré (5)', vo: 'Sacred Decree (5)', text: 'Apprenez un 5ᵉ Décret sacré.', choice: { pool: 'decrees', count: 1 } },
            { key: 'radiant_judgment_6', name: 'Jugement radieux (6)', vo: 'Radiant Judgment (6)',
                text: 'Chaque fois que vous lancez des dés de Jugement, lancez-en 1 de plus.', roll: { dice: '3d20', kind: 'plain', label: 'Dés de Jugement' } },
        ],
        15: [
            { key: 'subclass_15', name: 'Sous-classe', vo: 'Subclass', text: 'Gagnez la capacité de votre sous-classe d\'Assermenté.', subclassFeature: true },
            { key: 'upgraded_cantrips_15', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
        16: [
            { key: 'sacred_decree_6', name: 'Décret sacré (6)', vo: 'Sacred Decree (6)', text: 'Apprenez un 6ᵉ Décret sacré.', choice: { pool: 'decrees', count: 1 } },
            { key: 'key_stat_increase_16', name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase', text: '+1 FOR ou VOL.', statIncrease: { from: 'key', count: 1 } },
        ],
        17: [
            { key: 'tier_7', name: 'Sorts de rang 7', vo: 'Tier 7 Spells', text: 'Vous pouvez désormais lancer des sorts jusqu\'au rang 7.' },
            { key: 'secondary_stat_increase_17', name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase', text: '+1 DEX ou INT.', statIncrease: { from: 'secondary', count: 1 } },
        ],
        18: [
            { key: 'unending_judgment', name: 'Jugement sans fin', vo: 'Unending Judgment',
                text: '+5 dégâts aux attaques de mêlée tant que vous n\'avez aucun dé de Jugement.' },
        ],
        19: [
            { key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).', epicBoon: true },
        ],
        20: [
            { key: 'glorious_paragon', name: 'Parangon glorieux', vo: 'Glorious Paragon',
                text: '+1 à 2 caractéristiques au choix. Vous Vous défendez gratuitement chaque fois que vous Vous interposez.',
                statIncrease: { from: 'any', count: 2 } },
            { key: 'upgraded_cantrips_20', name: 'Tours de magie améliorés', vo: 'Upgraded Cantrips', text: 'Vos tours de magie gagnent en puissance.' },
        ],
    },
    options: {
        decrees: {
            label: 'Décrets sacrés', vo: 'Sacred Decrees',
            text: '**Servir sans compter.** Chaque fois que vous accomplissez un acte désintéressé notable pendant un repos sûr, vous pouvez choisir d\'autres options d\'Assermenté parmi celles qui vous sont accessibles.',
            items: [
                { key: 'blinding_aura', name: 'Aura aveuglante', vo: 'Blinding Aura', cost: '1 action',
                    text: '(1/repos sûr) Les ennemis dans votre aura sont aveuglés jusqu\'à la fin de leur prochain tour.',
                    uses: { count: '1', per: 'safeRest' } },
                { key: 'courage', name: 'Courage !', vo: 'Courage!', cost: '0 action',
                    text: '(1/rencontre) Lorsque vous ou un allié dans votre aura devriez tomber à 0 PV, ses PV passent à 1 à la place.',
                    uses: { count: '1', per: 'encounter' } },
                { key: 'explosive_judgment', name: 'Jugement explosif', vo: 'Explosive Judgment', cost: '2 actions',
                    text: '(1/rencontre) Dépensez vos dés de Jugement et infligez autant de dégâts radiants à tous les ennemis à Allonge 2 ou moins.',
                    uses: { count: '1', per: 'encounter' } },
                { key: 'improved_aura', name: 'Aura améliorée', vo: 'Improved Aura', cost: 'passif',
                    text: '+2 à l\'Allonge de votre aura.' },
                { key: 'radiant_aura', name: 'Aura radieuse', vo: 'Radiant Aura', cost: '1 action',
                    text: '(VOL/repos sûr) Mettez fin à un unique état ou effet néfaste sur vous-même ou sur une autre créature consentante dans votre aura (mettre fin à « mourant » rend 1 PV, mettre fin à « étourdi » rend 1 action, etc.).',
                    uses: { count: 'WIL', per: 'safeRest' } },
                { key: 'reliable_justice', name: 'Justice fiable', vo: 'Reliable Justice', cost: 'passif',
                    text: 'Chaque fois que vous lancez des dés de Jugement, lancez-les avec avantage (lancez-en un de plus et retirez le plus faible).' },
                { key: 'shining_mandate', name: 'Mandat lumineux', vo: 'Shining Mandate', cost: 'passif',
                    text: '(1/round) Lorsque vous êtes attaqué alors que vous avez déjà des dés de Jugement, un allié dans votre aura gagne un dé de Jugement (lancez-en un nouveau, il l\'ajoute à sa prochaine attaque). Vous obtenez l\'avantage aux tests pour percer à jour les illusions.' },
                { key: 'stand_fast_friends', name: 'Tenez bon, mes amis !', vo: 'Stand Fast, Friends!', cost: 'passif',
                    text: 'Chaque fois que vous lancez l\'Initiative, accordez à vos alliés des PV temporaires égaux à votre FOR+VOL. Vous et vos alliés dans votre aura avez l\'avantage contre la peur et contre les effets qui déplaceraient ou mettraient à terre.' },
                { key: 'unstoppable_protector', name: 'Protecteur inarrêtable', vo: 'Unstoppable Protector', cost: 'passif',
                    text: 'Gagnez +2 en Vitesse. Rien ne peut vous empêcher de Vous interposer pour un allié dans votre aura. Si vous Vous interposez pour un PNJ non combattant, vous pouvez Vous interposer de nouveau ce round.' },
                { key: 'well_armored', name: 'Bien cuirassé', vo: 'Well Armored', cost: 'passif',
                    text: 'Chaque fois que vous Vous interposez, gagnez FOR PV temporaires.' },
            ],
        },
    },
    subclasses: [
        {
            key: 'vengeance', name: 'Serment de vengeance', vo: 'Oath of Vengeance',
            summary: 'Renforcez vos dés de Jugement et abattez vos ennemis dans une rétribution explosive.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'aura_of_zeal', name: 'Aura de zèle', vo: 'Aura of Zeal',
                        text: 'Chaque fois que vous lancez des dés de Jugement, lancez-en 1 de plus. Vous gagnez une aura d\'Allonge 4. Votre Jugement radieux se déclenche aussi lorsqu\'un allié dans votre aura est attaqué alors que vous n\'avez aucun dé de Jugement.' },
                ],
                7: [
                    { key: 'avenger', name: 'Vengeur', vo: 'Avenger',
                        text: 'Chaque fois que vous ou un allié dans votre aura gagnez des Blessures, faites passer jusqu\'à autant de dés de Jugement à leur maximum. Puis déplacez-vous gratuitement de jusqu\'à la moitié de votre Vitesse.' },
                ],
                11: [
                    { key: 'unerring_judgment', name: 'Jugement infaillible', vo: 'Unerring Judgment',
                        text: 'Augmentez de 1 les résultats de votre dé primaire aux attaques de mêlée chaque fois que vous avez des dés de Jugement.' },
                ],
                15: [
                    { key: 'maximum_judgment', name: 'Jugement maximal', vo: 'Maximum Judgment',
                        text: 'Chaque fois que vous êtes attaqué, faites passer un dé de Jugement à son maximum.' },
                ],
            },
        },
        {
            key: 'refuge', name: 'Serment du refuge', vo: 'Oath of Refuge',
            summary: 'Levez votre bouclier pour protéger vos alliés et interposez-vous avec plus de force et de détermination.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'aura_of_refuge', name: 'Aura du refuge', vo: 'Aura of Refuge',
                        text: 'Vos boucliers gagnent +VOL en Défense et comptent comme votre focaliseur d\'incantation. Vous gagnez une aura d\'Allonge 4 ; vous pouvez Vous interposer pour un allié n\'importe où dans votre aura.' },
                ],
                7: [
                    { key: 'face_me_foul_creature', name: 'Affronte-moi, immonde créature !', vo: 'Face Me, Foul Creature!',
                        text: 'Lorsque vous Vous interposez, l\'ennemi attaquant est aussi provoqué par vous jusqu\'à la fin de son prochain tour.' },
                ],
                11: [
                    { key: 'glorious_reprieve', name: 'Glorieux répit', vo: 'Glorious Reprieve',
                        text: 'Vous et vos alliés dans votre aura ne perdez pas d\'actions lorsque vous êtes mourants. (1/round) Vous ou un allié dans votre aura pouvez ignorer 1 Blessure gagnée alors que vous êtes mourant.' },
                ],
                15: [
                    { key: 'divine_grace', name: 'Grâce divine', vo: 'Divine Grace',
                        text: 'Vous êtes résistant à tous les dégâts pendant que vous Vous interposez.' },
                ],
            },
        },
        {
            key: 'valor', name: 'Serment de bravoure', vo: 'Oath of Valor',
            summary: 'Le Serment de bravoure fait de vous un chevalier au cœur désintéressé, à la main courageuse et à la volonté inflexible face au danger.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'aura_of_valor', name: 'Aura de bravoure', vo: 'Aura of Valor',
                        text: 'Vous êtes immunisé contre l\'état effrayé ; vous gagnez une aura d\'Allonge 4, et les alliés dans cette zone le sont aussi. Lorsque vous Vous interposez, la créature protégée gagne l\'avantage à son prochain jet de cette rencontre.' },
                ],
                7: [
                    { key: 'exemplar_of_courage', name: 'Modèle de courage', vo: 'Exemplar of Courage',
                        text: 'Chaque fois que vous survivez à une attaque, accordez à un allié dans votre aura l\'avantage à son prochain jet. Lorsque vous Vous interposez pour une créature mourante, accordez-lui 1 action supplémentaire.' },
                ],
                11: [
                    { key: 'balm_for_the_downcast', name: 'Baume des affligés', vo: 'Balm for the Downcast',
                        text: 'Lorsque vous utilisez Imposition des mains, vous pouvez choisir une autre créature dans votre aura qui est soignée du même montant.' },
                ],
                15: [
                    { key: 'no_greater_love', name: 'Nul plus grand amour…', vo: 'No Greater Love…',
                        text: 'Lorsque vous Vous interposez alors que vous êtes mourant, vous subissez 1 Blessure de moins et tous les alliés dans votre aura gagnent 1 action.' },
                ],
            },
        },
        {
            key: 'roaring_thunder', name: 'Serment du tonnerre grondant', vo: 'Oath of Roaring Thunder',
            summary: 'Par la puissance du tonnerre, projetez vos ennemis à travers le champ de bataille et, avec la vivacité de l\'éclair, foncez à leur poursuite pour les abattre.',
            complexity: 2,
            levels: {
                3: [
                    { key: 'aura_of_gales', name: 'Aura des bourrasques', vo: 'Aura of Gales',
                        text: 'Vous gagnez une aura d\'Allonge 4. Les alliés peuvent se déplacer librement dans votre aura.' },
                ],
                7: [
                    { key: 'thunderous_strike', name: 'Frappe tonitruante', vo: 'Thunderous Strike',
                        text: 'Lorsque vous utilisez Zélote, vous pouvez d\'abord vous téléporter de VOL cases par point de mana dépensé. Si votre cible est une créature de taille moyenne ou plus petite, mettez-la aussi à terre.' },
                ],
                11: [
                    { key: 'thunderous_judgment', name: 'Jugement tonitruant', vo: 'Thunderous Judgment', cost: '1 mana',
                        text: '(1 mana, Allonge 12) Échangez votre place avec un allié hors de votre aura qui est attaqué (cela compte comme S\'interposer).' },
                ],
                15: [
                    { key: 'stormstrike', name: 'Frappe-tempête', vo: 'Stormstrike', cost: '1 action',
                        text: '(1/rencontre) Action : échangez votre place avec une créature consentante à Allonge 12 ou moins, puis infligez aux ennemis dans votre aura des dégâts de foudre égaux à un jet de vos dés de Jugement.',
                        uses: { count: '1', per: 'encounter' } },
                ],
            },
        },
        {
            key: 'oathbreaker', name: 'Parjure', vo: 'Oathbreaker',
            summary: 'Déchu, en quête de rédemption.',
            complexity: 3,
            story: true,
            levels: {
                3: [
                    { key: 'dark_benediction', name: 'Bénédiction sombre', vo: 'Dark Benediction',
                        text: 'Vous perdez l\'accès aux sorts radiants suivants : *Frappe sûre* (True Strike), *Soin* (Heal) et *Lien protecteur* (Warding Bond) ; et vous gagnez l\'accès aux sorts nécrotiques suivants : *Attirer* (Entice), *Piège d\'ombre* (Shadow Trap) et *Visage d\'effroi* (Dread Visage). Chaque fois que vous pouvez choisir un sort utilitaire, vous pouvez en choisir un radiant ou nécrotique.' },
                    { key: 'paragon_of_power', name: 'Parangon de puissance', vo: 'Paragon of Power',
                        text: '(Remplace Parangon de vertu) Avantage aux tests de Puissance pour intimider autrui.' },
                    { key: 'aura_of_suffering', name: 'Aura de souffrance', vo: 'Aura of Suffering',
                        text: 'Vous gagnez une aura d\'Allonge 4 et pouvez Vous interposer pour un allié n\'importe où dans votre aura ; en revanche, votre capacité Jugement radieux ne se déclenche plus lorsque vous êtes attaqué. À la place, elle se déclenche chaque fois que vous pourriez Vous interposer mais ne le faites pas.' },
                    { key: 'we_all_suffer', name: 'Nous souffrons tous', vo: 'We All Suffer',
                        text: 'Gagnez +2 Blessures max. Lorsqu\'un allié dans votre aura devrait gagner des Blessures ou rater une sauvegarde, vous pouvez subir l\'effet à sa place et déclencher votre capacité Jugement radieux.' },
                    { key: 'bring_me_your_pain', name: 'Apportez-moi votre douleur', vo: 'Bring Me Your Pain', cost: 'réaction',
                        text: 'Réaction (lorsqu\'un allié consentant dans votre aura devrait tomber à 0 PV) : échangez vos PV avec les siens (si vos PV actuels dépassent ses PV max, il gagne des PV temporaires égaux à la différence), en tombant à 0 PV et en gagnant la Blessure à sa place.' },
                    { key: 'blood_magic', name: 'Magie du sang', vo: 'Blood Magic',
                        text: 'Vous pouvez utiliser *Attirer* (Entice) sur vous-même.' },
                ],
                7: [
                    { key: 'torment', name: 'Tourment', vo: 'Torment',
                        text: 'Votre Imposition des mains vous soigne deux fois plus, et soigne les autres moitié moins. Lorsque vous infligez des dégâts, vous pouvez dépenser du pouvoir de guérison de votre réserve d\'Imposition des mains pour augmenter les dégâts infligés d\'un montant égal aux points dépensés (en ignorant l\'armure).' },
                ],
                11: [
                    { key: 'exploit', name: 'Exploiter', vo: 'Exploit', cost: 'réaction',
                        text: 'Réaction (chaque fois qu\'un allié dans votre aura Se défend) : vous pouvez dépenser vos dés de Jugement pour forcer un ennemi dans votre aura à S\'interposer (une créature ne peut pas S\'interposer contre sa propre attaque).' },
                ],
                15: [
                    { key: 'bloody_terror', name: 'Terreur sanglante', vo: 'Bloody Terror',
                        text: 'Les attaques contre vous subissent un désavantage par Blessure que vous avez (max. 3).' },
                ],
            },
        },
    ],
    spells: [],
    faq: [
        { q: 'Les dés de Jugement sont-ils dépensés sur un raté ?',
            a: 'Oui, ils sont dépensés lors de votre prochaine attaque, qu\'elle touche ou rate (ils expirent aussi à la fin du combat s\'ils ne sont pas utilisés).' },
        { q: 'Puis-je utiliser les dés de Jugement sur des sorts ?', a: 'Sur les sorts à Allonge, oui.' },
        { q: 'Est-ce que je gagne des dés de Jugement quand je M\'interpose ?',
            a: 'Oui, S\'interposer fait de vous la nouvelle cible de l\'attaque. Vous gagnez des dés de Jugement même si l\'attaque du monstre rate ou si tous les dégâts sont absorbés.' },
        { q: 'Les dés de Jugement peuvent-ils faire un critique ou exploser ?',
            a: 'Non. Ce sont des dégâts supplémentaires sur une attaque que vous effectuez (mais l\'attaque elle-même peut faire un critique normalement).' },
        { q: 'Puis-je M\'interposer plus d\'une fois si c\'est gratuit ?',
            a: 'Non. Chaque réaction reste limitée à 1/round, même gratuite.' },
    ],
};
