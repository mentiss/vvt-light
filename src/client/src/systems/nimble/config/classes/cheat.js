// src/client/src/systems/nimble/config/classes/cheat.js
// Source : Nimble Heroes — The Cheat 3.0 (PDF, p. 3-15 du livret).
// Classe le Tricheur : 20 niveaux, Coups tordus, sous-classes (dont le Quêteur d’honneur et ses Gambits honorables).

const UNDERHANDED = [
    {
        key: 'creative_accounting', name: 'Comptabilité « créative »', vo: '“Creative” Accounting',
        text: 'Volez jusqu’à INT actions à votre prochain tour (gagnez jusqu’à INT actions maintenant ; la prochaine fois que vous devriez gagner des actions, retirez-en le nombre volé). Vous ne pouvez pas utiliser cette capacité 2 tours de suite.',
    },
    {
        key: 'exploit_weakness', name: 'Exploiter la faiblesse', vo: 'Exploit Weakness',
        text: 'Chaque fois que vous réussissez Évaluer : Créer une ouverture contre une créature, vous pouvez utiliser Opportuniste féroce contre elle, même si elle n’est pas distraite. Cela dure 1 minute ou jusqu’à ce que vous l’utilisiez contre une autre cible.',
    },
    {
        key: 'feinting_attack', name: 'Attaque feinte', vo: 'Feinting Attack',
        text: 'Si vous ratez pour la 2ᵉ fois au cours d’un même round, vous pouvez changer le résultat du dé primaire en n’importe quel résultat à la place.',
    },
    {
        key: 'howd_you_get_here', name: 'Comment T’ES arrivé là ?!', vo: 'How’d YOU get here?!', cost: '2 actions',
        text: '(Allonge 12) « Téléportez-vous » à côté d’une cible distraite et faites une attaque de mêlée contre elle. Si vous faites un critique, vous pouvez vous « téléporter » de nouveau.',
    },
    {
        key: 'im_outta_here', name: 'Je me tire !', vo: 'I’m Outta Here!',
        text: 'Quand un allié dans une Allonge de 4 subit un critique, vous pouvez devenir invisible jusqu’à la fin de votre prochain tour, puis vous déplacer gratuitement de jusqu’à la moitié de votre Vitesse.',
    },
    {
        key: 'misdirection', name: 'Diversion', vo: 'Misdirection',
        text: 'Gagnez INT en Défense. Chaque fois que vous vous défendez, vous pouvez à la place diviser les dégâts par deux.',
    },
    {
        key: 'steal_tempo', name: 'Voler le tempo', vo: 'Steal Tempo',
        text: 'Quand vous faites un critique pour la deuxième fois au cours d’un round, votre cible est étourdie et vous donnez 1 action à un allié.',
    },
    {
        key: 'sunder_armor', name: 'Briser l’armure', vo: 'Sunder Armor', cost: '1 action',
        text: 'Après avoir fait un critique contre une créature en armure, brisez son armure : le prochain dé primaire non critique lancé contre elle gagne +2.',
    },
    {
        key: 'tangling_wire', name: 'Fil entravant', vo: 'Tangling Wire',
        text: 'Chaque fois que vous agrippez, vous pouvez immobiliser à la place.',
    },
    {
        key: 'the_setup', name: 'Le Coup monté', vo: 'The Setup', cost: '1 action',
        text: 'Réaction (quand un allié rate une créature adjacente à vous) : vous pouvez faire une attaque d’opportunité contre elle, en la considérant comme distraite.',
    },
    {
        key: 'trickshot', name: 'Tir d’adresse', vo: 'Trickshot',
        text: 'Vous pouvez utiliser Opportuniste féroce sur les attaques avec une arme de lancer (mais vous ne pouvez pas utiliser Tourner la lame sur elles). Chaque fois que vous lancez une arme, vous pouvez dépenser une action supplémentaire pour qu’elle touche une autre créature dans une Allonge de 2 de la première, qui subit la moitié des dégâts.',
    },
];

const HONORABLE_GAMBITS = [
    {
        key: 'deft_parry', name: 'Parade habile', vo: 'Deft Parry',
        text: 'Vous subissez –INT dégâts des ennemis tant qu’ils ont le Dessus.',
    },
    {
        key: 'down_not_out', name: 'À terre, pas vaincu !', vo: 'Down, Not Out!',
        text: 'Tant que vous êtes mourant, réduisez de 1 tous les dés primaires lancés contre vous, et vous avez l’avantage aux jets de sauvegarde.',
    },
    {
        key: 'frightful_confidence', name: 'Assurance effrayante', vo: 'Frightful Confidence',
        text: 'Tant que vous êtes en sang, quand vous êtes attaqué avec avantage, le dé le plus bas de l’attaquant est le dé primaire.',
    },
    {
        key: 'mark_of_deflection', name: 'Marque de déviation', vo: 'Mark of Deflection',
        text: 'Si vous vous êtes déjà défendu ce round, les attaques contre vous sont lancées avec désavantage.',
    },
    {
        key: 'nowhere_to_flee', name: 'Nulle part où fuir !', vo: 'Nowhere to Flee!',
        text: 'Gagnez +INT en Vitesse quand vous vous déplacez vers des ennemis que vous provoquez. Vos attaques d’opportunité ralentissent aussi les cibles de taille Moyenne ou inférieure qu’elles touchent.',
    },
    {
        key: 'redemption_arc', name: 'Arc de rédemption', vo: 'Redemption Arc',
        text: 'Réaction (quand un ennemi qui a le Dessus attaque un allié) : vous pouvez d’abord le provoquer (l’attaque est relancée, choisissez l’un ou l’autre résultat) ; cela dure jusqu’à la fin de son prochain tour.',
    },
    {
        key: 'riposte', name: 'Riposte', vo: 'Riposte',
        text: 'Quand vous vous défendez contre un attaquant au corps à corps, vous pouvez immédiatement faire une attaque d’opportunité contre lui.',
    },
    {
        key: 'say_that_to_my_face', name: 'Répète ça en face !', vo: 'Say That to My Face!', cost: '1 action',
        text: '(Allonge 12) « Téléportez-vous » à côté d’un ennemi provoqué.',
    },
    {
        key: 'victors_confidence', name: 'Assurance du vainqueur', vo: 'Victor’s Confidence',
        text: 'Quand vous tuez un ennemi provoqué, donnez à un allié l’avantage à sa prochaine attaque.',
    },
];

const keyStat = (lvl) => ({
    key: `key_stat_increase_${lvl}`, name: 'Augmentation de caractéristique clé', vo: 'Key Stat Increase',
    statIncrease: { from: 'key', count: 1 }, text: '+1 DEX ou INT.',
});
const secondaryStat = (lvl) => ({
    key: `secondary_stat_increase_${lvl}`, name: 'Augmentation de caractéristique secondaire', vo: 'Secondary Stat Increase',
    statIncrease: { from: 'secondary', count: 1 }, text: '+1 VOL ou FOR.',
});
const subclassFeature = (lvl) => ({
    key: `subclass_${lvl}`, name: 'Sous-classe', vo: 'Subclass', subclassFeature: true,
    text: 'Gagnez votre capacité de sous-classe de Tricheur.',
});
const underhanded = (n, ord) => ({
    key: `underhanded_ability_${n}`, name: `Coup tordu (${n})`, vo: `Underhanded Ability (${n})`,
    choice: { pool: 'underhanded', count: 1 },
    text: `Choisissez un ${ord} Coup tordu.`,
});
const sneakAttack = (n, dice) => ({
    key: `sneak_attack_${n}`, name: `Attaque sournoise (${n})`, vo: `Sneak Attack (${n})`,
    text: `Votre Attaque sournoise passe à ${dice}.`,
});

export default {
    key: 'cheat', name: 'Tricheur', vo: 'The Cheat',
    tagline: 'Cape et dague (et dague…)',
    summary: 'Enfreignez les règles ! Vous pouvez changer les dés que vous lancez pour obtenir les résultats qui vous arrangent le mieux ! Poignardez sournoisement vos ennemis dans le dos avec des critiques dévastateurs, et abattez d’un seul coup même les adversaires lourdement cuirassés ! Battez-vous salement avec du sable de poche et des coups bas. Quand les choses tournent mal, disparaissez pour tricher un autre jour !',
    complexity: 1,
    keyStats: ['dex', 'int'],
    hitDie: 6, startingHp: 10,
    saves: { adv: 'dex', dis: 'wil' },
    armor: { text: 'Armures de cuir', types: ['cloth', 'leather'] },
    weapons: { text: 'Armes de DEX', rule: { stats: ['dex'] } },
    startingGear: [{ key: 'dagger', qty: 2 }, { key: 'sling' }, { key: 'cheap_hides' }, { key: 'chalk' }],
    resources: [],
    spellcasting: null,
    levels: {
        1: [
            {
                key: 'sneak_attack', name: 'Attaque sournoise', vo: 'Sneak Attack',
                roll: { dice: '1d6', bonus: '', kind: 'plain', label: 'Attaque sournoise' },
                text: '(1/tour) Quand vous faites un critique, infligez +1d6 dégâts.',
            },
            {
                key: 'vicious_opportunist', name: 'Opportuniste féroce', vo: 'Vicious Opportunist',
                text: '(1/tour) Quand vous TOUCHEZ une cible distraite avec une attaque de mêlée, vous pouvez changer le résultat du dé primaire en ce que vous voulez (le passer à sa valeur maximale compte comme un critique).\n**Distrait.** Une cible est distraite si elle est adjacente à un allié (ou provoquée par lui), ou si elle ne peut pas vous voir.\n**Oui !** Si vous trouvez un moyen d’attaquer pendant le tour de quelqu’un d’autre, vous pouvez réutiliser cette capacité au cours du même round !',
            },
        ],
        2: [
            {
                key: 'cheat', name: 'Tricherie', vo: 'Cheat',
                uses: { count: '1', per: 'safeRest' },
                text: 'Vous êtes un tricheur accompli. Gagnez les capacités suivantes :\n• (1/round) Vous pouvez soit vous déplacer, soit vous cacher gratuitement.\n• (1/repos sûr) Vous pouvez changer le résultat de n’importe lequel de vos tests de compétence en 10+INT.\n• Si vous obtenez moins de 10 à l’Initiative, vous pouvez le changer en 10.\n• Vous pouvez gagner l’avantage aux tests de compétence quand vous jouez à un jeu, participez à une compétition ou faites un pari. Mais si vous vous faites prendre…\n**De la magie ?** Le Tricheur a certaines capacités qui ont l’air magiques : elles peuvent l’être, mais pas forcément. Vous avez vos méthodes, d’accord ? Inutile d’expliquer comment vous avez fait, pas même au MJ !',
            },
        ],
        3: [
            {
                key: 'subclass_3', name: 'Sous-classe', vo: 'Subclass', subclass: true,
                text: 'Choisissez une sous-classe de Tricheur.',
            },
            { ...sneakAttack(2, '1d8'), roll: { dice: '1d8', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
            {
                key: 'thieves_cant', name: 'Argot des voleurs', vo: 'Thieves’ Cant',
                text: 'Vous apprenez la langue secrète des voleurs et des canailles.',
            },
        ],
        4: [
            keyStat(4),
            {
                key: 'underhanded_ability_1', name: 'Coup tordu', vo: 'Underhanded Ability',
                choice: { pool: 'underhanded', count: 1 },
                text: 'Choisissez un Coup tordu.\n**Secrets du métier.** Chaque fois que vous passez une nuit à parler boutique avec d’autres gens de votre espèce pendant un repos sûr, vous pouvez choisir d’autres options de Tricheur parmi celles qui vous sont accessibles.',
            },
        ],
        5: [
            {
                key: 'twist_the_blade', name: 'Tourner la lame', vo: 'Twist the Blade', cost: '1 action',
                text: 'Changez le résultat d’un dé d’Attaque sournoise en ce que vous voulez.',
            },
            {
                key: 'quick_read', name: 'Lecture rapide', vo: 'Quick Read',
                uses: { count: '1', per: 'encounter' },
                text: '(1/rencontre) Gagnez l’avantage à un test d’Évaluer.',
            },
            secondaryStat(5),
        ],
        6: [
            underhanded(2, '2ᵉ'),
            {
                key: 'thats_not_what_happened', name: 'ÇA ne s’est PAS passé comme ça !', vo: 'THAT’S Not What Happened!',
                cost: 'réaction', uses: { count: '1', per: 'safeRest' },
                text: '(1/repos sûr) Réaction (quand un ennemi distrait vous attaque) : vous pouvez changer le résultat du dé primaire en ce que vous voulez (passer le dé à sa valeur minimale compte comme un raté).',
            },
        ],
        7: [
            subclassFeature(7),
            { ...sneakAttack(3, '2d8'), roll: { dice: '2d8', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
        ],
        8: [underhanded(3, '3ᵉ'), keyStat(8)],
        9: [
            { ...sneakAttack(4, '2d10'), roll: { dice: '2d10', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
            secondaryStat(9),
        ],
        10: [underhanded(4, '4ᵉ')],
        11: [
            subclassFeature(11),
            { ...sneakAttack(5, '2d12'), roll: { dice: '2d12', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
        ],
        12: [underhanded(5, '5ᵉ'), keyStat(12)],
        13: [
            {
                key: 'twist_the_blade_2', name: 'Tourner la lame (2)', vo: 'Twist the Blade (2)',
                text: '(1/tour) Vous pouvez Tourner la lame gratuitement.',
            },
            secondaryStat(13),
        ],
        14: [underhanded(6, '6ᵉ')],
        15: [
            subclassFeature(15),
            { ...sneakAttack(6, '2d20'), roll: { dice: '2d20', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
        ],
        16: [underhanded(7, '7ᵉ'), keyStat(16)],
        17: [
            { ...sneakAttack(7, '3d20'), roll: { dice: '3d20', bonus: '', kind: 'plain', label: 'Attaque sournoise' } },
            secondaryStat(17),
        ],
        18: [underhanded(8, '8ᵉ')],
        19: [
            {
                key: 'epic_boon', name: 'Faveur épique', vo: 'Epic Boon', epicBoon: true,
                text: 'Choisissez une faveur épique (voir p. 75 du Guide du MJ).',
            },
        ],
        20: [
            {
                key: 'supreme_execution', name: 'Exécution suprême', vo: 'Supreme Execution',
                statIncrease: { from: 'any', count: 2 },
                text: '+1 à 2 de vos caractéristiques au choix. Quand vous attaquez avec une lame, vous n’avez pas besoin que la cible soit distraite pour déclencher Opportuniste féroce.',
            },
        ],
    },
    options: {
        underhanded: {
            label: 'Coups tordus', vo: 'Underhanded Abilities',
            text: '**Secrets du métier.** Chaque fois que vous passez une nuit à parler boutique avec d’autres gens de votre espèce pendant un repos sûr, vous pouvez choisir d’autres options de Tricheur parmi celles qui vous sont accessibles.',
            items: UNDERHANDED,
        },
    },
    subclasses: [
        {
            key: 'silent_blade', name: 'Outils de la Lame silencieuse', vo: 'Tools of the Silent Blade',
            summary: 'Tuer, tuer, tuer.',
            complexity: 1,
            levels: {
                3: [
                    {
                        key: 'amidst_all_this_commotion', name: 'Dans toute cette agitation…', vo: 'Amidst All This Commotion…',
                        text: 'Si une créature meurt pendant que vous lui portez une Attaque sournoise, vous pouvez devenir invisible jusqu’à ce que vous attaquiez de nouveau ou jusqu’au début de votre prochain tour.',
                    },
                    {
                        key: 'leave_no_trace', name: 'Ne laisser aucune trace', vo: 'Leave No Trace',
                        text: 'Avantage aux tests de Discrétion quand vous êtes à vos PV maximum.',
                    },
                ],
                7: [
                    {
                        key: 'cunning_strike', name: 'Frappe rusée', vo: 'Cunning Strike',
                        text: 'Infligez +2×INT dégâts chaque fois que vous faites un critique.',
                    },
                ],
                11: [
                    {
                        key: 'professional_skulker', name: 'Rôdeur professionnel', vo: 'Professional Skulker',
                        text: 'Gagnez une Vitesse d’escalade et l’avantage aux tests de Discrétion (remplace Ne laisser aucune trace).',
                    },
                ],
                15: [
                    {
                        key: 'kill', name: 'TUER', vo: 'KILL',
                        text: 'Quand vous portez une Attaque sournoise à un ennemi dont les PV maximum sont inférieurs aux vôtres, il meurt.',
                    },
                ],
            },
        },
        {
            key: 'scoundrel', name: 'Outils de la Canaille', vo: 'Tools of the Scoundrel',
            summary: 'Restez en vie, battez-vous salement.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'low_blow', name: 'Coup bas', vo: 'Low Blow',
                        roll: { dice: '1d4', bonus: '', kind: 'plain', label: 'Coup bas' },
                        text: 'Quand vous portez une Attaque sournoise à une créature que vous ne provoquez pas déjà, vous pouvez dépenser 1 action supplémentaire pour lancer 1d4. La créature est :\n1. Provoquée par vous pour le reste de la rencontre.\n2. Mise à terre, puis provoquée par vous pour le reste de la rencontre.\n3. Étourdie, puis provoquée par vous pour le reste de la rencontre.\n4. Neutralisée jusqu’à la fin du tour du héros suivant.',
                    },
                    {
                        key: 'sweet_talk', name: 'Belles paroles', vo: 'Sweet Talk',
                        text: 'Vous pouvez gagner l’avantage à tous les tests d’Influence avec les PNJ que vous rencontrez pour la première fois. Cela dure jusqu’à ce que vous ratiez un test d’Influence avec eux ou jusqu’à votre deuxième rencontre. Vous avez le désavantage aux tests d’Influence avec eux après avoir utilisé cette capacité (jusqu’à ce que vous regagniez leurs bonnes grâces).',
                    },
                ],
                7: [
                    {
                        key: 'pocket_sand', name: 'Sable de poche', vo: 'Pocket Sand',
                        uses: { count: '2', per: 'encounter' },
                        text: '(2/rencontre : il faut bien ramasser du sable !) Quand vous vous défendez contre une créature adjacente, aveuglez l’attaquant jusqu’au début de son prochain tour et forcez-le à relancer l’attaque (les créatures aveuglées attaquent avec désavantage).',
                    },
                ],
                11: [
                    {
                        key: 'escape_plan', name: 'Plan d’évasion', vo: 'Escape Plan',
                        uses: { count: '1', per: 'safeRest' },
                        text: '(1/repos sûr) Quand vous devriez tomber à 0 PV ou gagner une Blessure, cela n’arrive pas. À la place, vous devenez invisible pendant 1 minute ou jusqu’à ce que vous attaquiez.',
                    },
                ],
                15: [
                    {
                        key: 'heads_i_win', name: 'Pile je gagne, face tu perds', vo: 'Heads I Win, Tails You Lose',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Vos attaques de ce round ne ratent pas, vous faites un critique sur un résultat inférieur de 1 à celui normalement requis, et vous gagnez NIV PV temporaires.',
                    },
                ],
            },
        },
        {
            key: 'serpent', name: 'Outils du Serpent', vo: 'Tools of the Serpent',
            summary: 'Vous avez dompté les terribles crocs de la nature et sa redoutable panoplie de poisons. Choisissez cette sous-classe si vous voulez affaiblir vos ennemis par le venin et la cruauté.',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'vipers_kiss', name: 'Baiser de la vipère', vo: 'Viper’s Kiss',
                        text: 'Les créatures que vous blessez sont empoisonnées jusqu’à la fin de leur prochain tour. Les créatures empoisonnées de cette façon sont aussi distraites.',
                    },
                    {
                        key: 'ive_tried_this_one_before', name: 'J’ai déjà goûté celui-là', vo: 'I’ve Tried This One Before',
                        text: 'Vous avez l’avantage aux jets de sauvegarde contre le poison. De plus, vous pouvez identifier tout poison que vous examinez.',
                    },
                ],
                7: [
                    {
                        key: 'noxious_cloud', name: 'Nuage nocif', vo: 'Noxious Cloud', cost: '1 action',
                        uses: { count: '1', per: 'encounter' },
                        roll: { dice: 'INTd6', bonus: '', kind: 'plain', label: 'Nuage nocif' },
                        text: '(1/rencontre, Allonge 4) Les ennemis dans une zone de 2×2 subissent INT d6 dégâts (en ignorant l’armure) et sont empoisonnés. Les créatures déjà empoisonnées sont aussi étourdies.',
                    },
                ],
                11: [
                    {
                        key: 'cruel_dose', name: 'Dose cruelle', vo: 'Cruel Dose',
                        text: 'Les créatures que vous empoisonnez sont aussi ralenties et la Portée de leurs attaques est divisée par deux.',
                    },
                ],
                15: [
                    {
                        key: 'volatile_toxins', name: 'Toxines volatiles', vo: 'Volatile Toxins',
                        text: 'Nuage nocif peut être utilisé deux fois par rencontre. Chaque fois qu’une créature que vous avez empoisonnée meurt, son corps éclate en un Nuage nocif.',
                    },
                ],
            },
        },
        {
            key: 'gambler', name: 'Outils du Joueur', vo: 'Tools of the Gambler',
            summary: 'Faites-moi confiance : cette fois, c’est du TOUT CUIT. Choisissez cette sous-classe si vous voulez tout risquer sur des coups dangereux et frôler la ruine.',
            complexity: 1,
            levels: {
                3: [
                    {
                        key: 'all_in', name: 'Tapis', vo: 'All In',
                        text: 'Quand vous portez une Attaque sournoise, vous pouvez faire tapis : lancez un unique dé de tapis ; s’il obtient plus que la moyenne, maximisez TOUS vos dés d’Attaque sournoise ; sinon, minimisez-les.',
                    },
                    {
                        key: 'just_a_practice_roll', name: 'C’était juste pour s’entraîner', vo: 'That Was Just a Practice Roll',
                        uses: { count: '1', per: 'encounter' },
                        text: '(1/rencontre) Vous pouvez relancer N’IMPORTE QUEL dé.',
                    },
                    {
                        key: 'its_all_fun_and_games', name: 'C’est juste pour jouer', vo: 'It’s All Fun and Games',
                        text: 'Si vous êtes pris à tricher à un jeu, une compétition ou un pari, vous gagnez l’avantage aux tests de compétence pour échapper aux conséquences.',
                    },
                ],
                7: [
                    {
                        key: 'pocket_aces', name: 'Paire d’as !', vo: 'Pocket Aces!',
                        uses: { count: '1', per: 'safeRest' },
                        text: '(1/repos sûr) Vous pouvez fixer à 20 le jet d’Initiative d’une créature amie.',
                    },
                    {
                        key: 'double_or_nothing', name: 'Quitte ou double !', vo: 'Double or Nothing!',
                        text: 'Quand vous perdez votre jet de « Tapis », vous pouvez retenter une fois. Si vous réussissez, ajoutez 1 dé d’Attaque sournoise maximisé supplémentaire. Si vous échouez, votre attaque rate complètement et votre tour prend fin.',
                    },
                ],
                11: [
                    {
                        key: 'play_the_odds', name: 'Jouer les probabilités', vo: 'Play the Odds',
                        text: '(1/round) Quand une créature vous touche, vous pouvez la forcer à relancer son dé primaire. Si le résultat est plus bas, l’attaque rate ; sinon, c’est un critique.',
                    },
                ],
                15: [
                    {
                        key: 'odds_maker', name: 'Bookmaker', vo: 'Odds Maker',
                        text: 'Vous pouvez utiliser C’était juste pour s’entraîner 2/rencontre, et vous pouvez à la place changer le dé en n’importe quelle autre face.',
                    },
                ],
            },
        },
        {
            key: 'honorseeker', name: 'Le Quêteur d’honneur', vo: 'The Honorseeker', story: true,
            summary: '« Fini les combines. Promis. »',
            complexity: 2,
            levels: {
                3: [
                    {
                        key: 'honorseeker', name: 'Quêteur d’honneur', vo: 'Honorseeker',
                        text: 'Vous renoncez à Attaque sournoise, Opportuniste féroce, aux Coups tordus et à Tourner la lame ; en échange, vous gagnez :\n• **Gambits honorables.** Pour chaque Coup tordu que vous auriez (sauf celui de Vieilles habitudes…), choisissez un Gambit honorable à la place.\n• **Outsider méritant.** Quand les ennemis ont le Dessus, les attaques vous ratent sur 2 ou moins.\n• **Combattant tenace.** (1/tour) Quand vous TOUCHEZ un ennemi qui a le Dessus, vous pouvez changer le résultat du dé primaire en ce que vous voulez et infliger +1d6 dégâts (cela augmente comme vos dés d’Attaque sournoise auraient augmenté).\n**Le Dessus.** Quand ils sont plus nombreux que vos alliés à être adjacents à vous.',
                    },
                    {
                        key: 'prove_your_worth', name: 'Prouve ta valeur !', vo: 'Prove Your Worth!',
                        text: '(Allonge 12, 1/tour) Provoquez gratuitement un ennemi (cela dure jusqu’à ce qu’il vous inflige des dégâts). Gagnez une réduction des dégâts égale à DEX contre les ennemis que vous provoquez.',
                    },
                ],
                5: [
                    {
                        key: 'even_the_odds', name: 'Rééquilibrer les chances', vo: 'Even the Odds',
                        text: 'Quand vous attaquez un ennemi qui a le Dessus, ou êtes attaqué par lui, vous pouvez dépenser une action pour faire monter ou descendre un dé d’une face (remplace Tourner la lame et s’améliore comme elle l’aurait fait).',
                    },
                ],
                7: [
                    {
                        key: 'old_habits', name: 'Vieilles habitudes…', vo: 'Old Habits…',
                        choice: { pool: 'underhanded', count: 1 },
                        text: 'Choisissez 1 Coup tordu.',
                    },
                ],
                11: [
                    {
                        key: 'right_where_i_want_you', name: 'Exactement où je te voulais', vo: 'Right Where I Want You',
                        text: 'Vous avez l’avantage aux attaques et +10 en Défense tant que les ennemis ont le Dessus.',
                    },
                ],
                15: [
                    {
                        key: 'turn_the_tables', name: 'Renverser la situation', vo: 'Turn the Tables',
                        text: 'Quand un ennemi qui a le Dessus vous rate au corps à corps, vous pouvez dépenser une action pour l’attaquer en retour.',
                    },
                ],
                20: [
                    {
                        key: 'supreme_underdog', name: 'Outsider suprême', vo: 'Supreme Underdog',
                        text: '(Remplace Exécution suprême…) Vous subissez 10 dégâts de moins de toutes les attaques des créatures qui ont le Dessus.',
                    },
                ],
            },
            options: {
                honorable_gambits: {
                    label: 'Gambits honorables', vo: 'Honorable Gambits',
                    text: 'Pour chaque Coup tordu que vous auriez (sauf celui de Vieilles habitudes…), choisissez un Gambit honorable à la place.',
                    items: HONORABLE_GAMBITS,
                },
            },
        },
    ],
    spells: [],
    faq: [],
};
