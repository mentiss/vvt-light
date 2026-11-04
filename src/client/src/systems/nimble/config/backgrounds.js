// src/client/src/systems/nimble/config/backgrounds.js
// Source : Nimble Core Rules 3.3, p. 28-29 (Backgrounds).
// Catalogue des historiques (texte, prérequis, usages, effets automatisables) et encadrés liés.

export const BACKGROUNDS_INTRO = 'Les historiques donnent un aperçu du passé de votre personnage : la façon dont il a été élevé, les talents qu\'il a affûtés avant de devenir aventurier, ou même les traits marquants de sa personnalité. N\'hésitez pas à adapter ou à réinventer ces historiques pour qu\'ils collent à l\'histoire de votre personnage. Choisissez 1 historique :';

export const BACKGROUNDS = [
    {
        key: 'back_out_of_retirement', name: 'Sorti de la retraite', vo: 'Back Out of Retirement',
        text: 'Vous avez oublié plus de choses que la plupart des aventuriers d\'aujourd\'hui n\'en savent ! Parlez-en avec votre MJ : qu\'est-ce qui vous a fait sortir de votre retraite ?\n• **Voyons si je me souviens comment on fait…** Subissez 1 Blessure pour utiliser une capacité ou lancer un sort comme si vous étiez d\'un niveau supérieur.\n• **Ces vieux os…** Votre âge a commencé à se voir depuis longtemps. –1 Blessure max.',
        effects: { maxWounds: -1 },
    },
    {
        key: 'devoted_protector', name: 'Protecteur dévoué', vo: 'Devoted Protector',
        text: 'Choisissez 1 allié de votre groupe. Vous pouvez survivre à +3 Blessures max tant qu\'il est à proximité. Chaque fois qu\'il subit une Blessure, vous aussi.',
    },
    {
        key: 'academy_dropout', name: 'Décrocheur de l\'Académie', vo: 'Academy Dropout',
        text: 'L\'école, ce n\'est pas pour tout le monde ! Vous apprenez par l\'expérience, dans le monde réel (du moins, c\'est ce que vous vous dites). Apprenez 1 sort utilitaire de votre choix.',
        effects: { utilitySpell: 1 },
    },
    {
        key: 'made_a_bad_choice', name: 'A fait un MAUVAIS choix', vo: 'Made a BAD Choice',
        text: 'Commencez avec 500 ou 1 000 pièces d\'or supplémentaires, ou un objet magique peu commun ou rare (que votre MJ autorise). Gagnez une malédiction ou un ennemi tout aussi puissant qui veut le récupérer. Si vous choisissez cet historique, votre MJ peut vous permettre d\'en choisir un autre.',
    },
    {
        key: 'haunted_past', name: 'Passé hanté', vo: 'Haunted Past',
        text: 'Vous êtes hanté par des voix qui vous donnent parfois des conseils énigmatiques. Les voix sont parfois TRÈS utiles. D\'autres fois, elles ne veulent que vous voir souffrir. Avantage contre la peur.',
    },
    {
        key: 'ear_to_the_ground', name: 'L\'oreille aux aguets', vo: 'Ear to the Ground',
        text: 'Avantage aux tests pour connaître ou obtenir des rumeurs sur des événements qui vont bientôt se produire ou qui se sont produits il y a moins d\'un an.',
    },
    {
        key: 'what_ive_been_around', name: 'Quoi ? J\'ai roulé ma bosse', vo: 'What? I’ve Been Around',
        text: '(1/lieu ; ou à la discrétion du MJ). Il se trouve que vous connaissez JUSTE la personne qui détient l\'information que vous cherchez, ou qui pourrait vous tirer d\'un mauvais pas, et… Lancez 1d20 :\n• **1–5.** Elle veut votre MORT.\n• **6–12.** Vous lui devez de l\'argent.\n• **13–19.** On peut la convaincre de vous aider.\n• **20.** C\'est votre plus grande admiratrice, ou elle est follement amoureuse de vous.',
    },
    {
        key: 'acrobat', name: 'Acrobate', vo: 'Acrobat',
        text: 'Peut être lancé par un allié plus grand, TRÈS loin. Résistant aux dégâts de chute et de déplacement forcé.',
    },
    {
        key: 'wild_one', name: 'Enfant sauvage', vo: 'Wild One',
        text: 'Que ce soit à cause des brindilles ou des fleurs dans vos cheveux, de votre odeur ou de votre allure, les créatures sauvages ont moins peur de vous et sont plus disposées à vous aider. +1 en Nature. Lors d\'un repos de terrain en pleine nature, vos dés de vie rendent +CLÉ PV.',
        effects: { skills: { naturecraft: 1 } },
    },
    {
        key: 'fey_touched', name: 'Touché par les fées', vo: 'Fey Touched',
        text: 'Vous êtes résistant aux dégâts magiques (–10 dégâts) et vulnérable aux armes de métal (+10 dégâts).',
    },
    {
        key: 'survivalist', name: 'Survivaliste', vo: 'Survivalist',
        text: 'Vous ne manquez jamais de vos propres rations. Tout peut se manger si on s\'en donne la peine ! (1/repos sûr) Mettez fin à un poison qui vous affecte. Avantage aux sauvegardes contre le poison. +1 dé de vie max.',
        uses: { count: '1', per: 'safeRest' },
        effects: { maxHitDice: 1 },
    },
    {
        key: 'home_at_sea', name: 'Chez soi en mer', vo: 'Home at Sea',
        text: 'Récupérez deux fois plus de Blessures et de PV lorsque vous vous reposez sur un navire ou près de l\'eau. Vous pouvez remplacer un second ou un capitaine au besoin. Avantage aux tests de compétence liés à l\'eau.',
    },
    {
        key: 'at_home_underground', name: 'Chez soi sous terre', vo: 'At Home Underground',
        text: 'Vous creusez deux fois plus vite que les autres. Les lieux de repos sûr souterrains comptent toujours comme un logement luxueux pour vous. Vous avez du mal à vous reposer (sauvegarde d\'INT) quand il pleut. « De l\'eau… qui tombe du CIEL ?! »',
    },
    {
        key: 'raised_by_goblins', name: 'Élevé par des gobelins', vo: 'Raised by Goblins',
        text: 'Vous parlez le gobelin comme langue maternelle (bien mieux que quelqu\'un qui l\'a appris plus tard). Vous remarquez et pouvez éviter automatiquement les pièges grossièrement fabriqués, et vous avez l\'avantage pour remarquer et désamorcer les pièges plus sophistiqués.',
        language: 'goblin',
    },
    {
        key: 'former_con_artist', name: '(Ancien) escroc', vo: '(Former) Con Artist',
        text: 'Vous pouvez falsifier la plupart des documents ou imiter les voix à la perfection. Vous avez un contact dans le milieu criminel de la plupart des grandes villes. Cependant, votre réputation vous précède souvent… jusqu\'à ce que vous prouviez que vous êtes digne de confiance.',
    },
    {
        key: 'history_buff', name: 'Passionné d\'histoire', vo: 'History Buff',
        text: 'Avantage à tous les tests de Savoir portant sur des objets, des faits ou des événements remontant à plus de 100 ans.',
    },
    {
        key: 'secretly_undead', name: 'Mort-vivant (en secret)', vo: '(Secretly) Undead',
        text: '**Résistance contre nature :** vous êtes immunisé contre les maladies et n\'avez besoin ni de manger, ni de boire, ni de respirer. Les enfants, les animaux et les célestes sont mal à l\'aise en votre présence ; beaucoup seront horrifiés de découvrir votre vraie nature.',
    },
    {
        key: 'taste_for_the_finer_things', name: 'Goût du raffinement', vo: 'Taste for the Finer Things',
        text: 'Vous connaissez toujours les coutumes et la mode des classes supérieures, et vous connaissez peut-être même nombre de leurs secrets. Avantage aux tests d\'Influence auprès de la haute société.',
    },
    {
        key: 'fearless', name: 'Intrépide', vo: 'Fearless',
        text: 'Vous êtes immunisé contre l\'état effrayé. +1 en Initiative. –1 en Défense.',
        effects: { initiative: 1, defense: -1 },
    },
    {
        key: 'so_dumb_im_smart_sometimes', name: 'Tellement bête que j\'en deviens malin', vo: 'So Dumb I’m Smart Sometimes',
        text: 'Prérequis : INT de 0 ou négative à la création du personnage. (2/repos sûr) Relancez avec avantage un test de compétence ou une sauvegarde liés à l\'INT que vous avez ratés.',
        req: { stat: 'int', max: 0 },
        uses: { count: '2', per: 'safeRest' },
    },
    {
        key: 'wily_underdog', name: 'Outsider rusé', vo: 'Wily Underdog',
        text: 'Prérequis : FOR de 0 ou négative à la création du personnage. (2/repos sûr) Relancez une attaque de FOR, une sauvegarde de FOR ou un test de Puissance ratés en utilisant une autre caractéristique à la place.',
        req: { stat: 'str', max: 0 },
        uses: { count: '2', per: 'safeRest' },
    },
    {
        key: 'bumblewise', name: 'Sagesse des simples', vo: 'Bumblewise',
        text: 'Prérequis : VOL de 0 ou négative à la création du personnage. Un total de 1 ou moins sur n\'importe quel jet lié à la VOL compte comme un 20 naturel (sauvegarde de VOL, test de Nature, de Perception, d\'Influence ou d\'Intuition).',
        req: { stat: 'wil', max: 0 },
    },
    {
        key: 'accidental_acrobat', name: 'Acrobate malgré lui', vo: 'Accidental Acrobat',
        text: 'Prérequis : DEX de 0 ou négative à la création du personnage. Chaque fois que vous ratez un jet lié à la DEX (attaque de DEX, sauvegarde de DEX, test de Discrétion, test de Finesse…), vous pouvez relancer. Si vous échouez encore, les conséquences sont TERRIBLES.',
        req: { stat: 'dex', max: 0 },
    },
    {
        key: 'tradesman_artisan', name: 'Artisan', vo: 'Tradesman/Artisan',
        text: 'Choisissez un métier (boulanger/cuisinier, forgeron, tailleur de pierre, tisserand, maroquinier, etc.). Les tests que vous faites en rapport avec ce métier ont l\'avantage. Vous conservez aussi des connaissances particulières liées à votre métier.',
    },
];

// Encadrés de la page des historiques (p. 28-29)
export const BACKGROUND_NOTES = [
    {
        key: 'change_it_up', title: 'Changez la donne !', vo: 'Change It Up!',
        text: 'Vous pouvez choisir d\'avoir été élevé par n\'importe quelle autre ascendance à la place : échangez la langue connue et obtenez 1 capacité utile ou emblématique que ce peuple vous aurait inculquée (par exemple, les nains connaissent le nain et sont très doués pour la forge ou le travail de la pierre).',
    },
    {
        key: 'make_it_your_own', title: 'Faites-le vôtre !', vo: 'Make It Your Own!',
        text: 'N\'oubliez pas que les historiques ne sont qu\'un point de départ : vous êtes libre de les ajuster, de les réinventer ou de les réécrire entièrement pour qu\'ils collent à l\'histoire de votre personnage. Si vous voulez connaître un sort utilitaire mais que l\'habillage du Décrocheur de l\'Académie ne vous plaît pas, trouvez une autre raison pour laquelle votre personnage pourrait le connaître. Peut-être l\'a-t-il appris d\'un barde itinérant, ou découvert gravé sur une ancienne relique.\nN\'hésitez pas à échanger des traits, à changer l\'habillage ou à mélanger des historiques. Passé hanté pourrait devenir Béni par les esprits si votre personnage voit ces voix de l\'au-delà comme des gardiennes plutôt que des tourmenteuses.\nVoyez avec votre MJ pour que tout changement s\'accorde avec le cadre de votre partie et reste équilibré par rapport aux autres historiques. Ils sont là pour stimuler la créativité : ce que vous en faites ne dépend que de vous !',
    },
];
