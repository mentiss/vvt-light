// src/client/src/systems/vileborn/config/heritages.js
// ─────────────────────────────────────────────────────────────────────────────
// Les sept sombres héritages, tels que les fiches prétirées du kit les donnent
// (documentations/vileborn/transcription_fiches_pretires_aide.md) : présentation,
// exemples, pulsion et les deux dons connus de chacun.
//
// Don : { key, name, effect, drawback, roll?, blocksMobiles? }
//   blocksMobiles : coché, le don interdit les mobiles (Sang glacé)
//   roll : contrepartie jouée au d6 en cochant le don (spec Q19, lot 2)
//          { on: [faces], effect: 'state:<clé>' | 'wound' | 'target_wound' }
// ─────────────────────────────────────────────────────────────────────────────

export const HERITAGES = {
    chantesang: {
        name: 'Chantesang',
        text: "Depuis l'avènement de l'obscurité, l'odeur du sang humain vous attire et vous enivre. Doté d'un charisme surnaturel, vous pouvez libérer la puissance de votre sang, même au péril de votre corps humain.",
        examples: 'Libérez le pouvoir de votre sang, affectez les émotions de ceux qui vous entourent, contrôlez le flux de sang autour de vous.',
        urge: 'Boire du sang humain',
        gifts: [
            {
                key: 'heart_cannot_lie', name: 'Le cœur ne saurait mentir',
                effect: 'Cochez ce don pour percevoir les battements de cœur d\'une cible. Pendant cette scène, vous savez si elle ment ou pas.',
                drawback: 'le bruit du sang qui coule vous distrait. Malus de −1 aux tests de Précision tant que ce don est coché.',
            },
            {
                key: 'blood_power', name: 'Pouvoir du sang',
                effect: 'Cochez ce don pour jouir d\'une force incroyable pendant un moment. Vous obtenez automatiquement une réussite de Force.',
                drawback: 'vous soumettez votre cœur à rude épreuve. Lancez un d6 : avec un résultat de 1, vous subissez l\'état épuisement.',
                roll: { on: [1], effect: 'state:exhaustion' },
            },
        ],
    },
    masquegriffe: {
        name: 'Masquegriffe',
        text: "Depuis l'avènement de l'obscurité, vous vous battez contre un besoin nocturne de partir en chasse. Votre odorat s'est affiné, votre corps est devenu plus robuste et le prédateur en vous a toujours envie de chair fraîche.",
        examples: 'Éveillez l\'antique prédateur en vous, connectez-vous à la nature, repoussez les limites de vos perceptions et de vos muscles.',
        urge: 'Chasser des humains',
        gifts: [
            {
                key: 'bestial_form', name: 'Forme bestiale',
                effect: 'Des crocs et des griffes vous poussent. Bénéficiez d\'un bonus de +1 aux tests de Force et ignorez tous les effets d\'épuisement lors de cette scène.',
                drawback: 'vous risquez de vous laisser envahir par vos instincts de chasse. Lancez un d6 : avec un résultat de 1, vous subissez l\'état colère.',
                roll: { on: [1], effect: 'state:anger' },
            },
            {
                key: 'sixth_sense', name: 'Sixième sens',
                effect: 'Vous flairez toutes les menaces à proximité, ce qui vous donne quelques indices à propos de leur nature et, le cas échéant, vous savez s\'il s\'agit de nuisibles.',
                drawback: 'votre instinct de chasse s\'éveille. Malus de −1 aux tests de Raison tant que ce don reste coché.',
            },
        ],
    },
    danselombre: {
        name: 'Danselombre',
        text: "Pour vous, les ombres sont des entités vivantes : vous pouvez communiquer avec elles et les façonner, vous comprenez leur froideur glaciale et la faim dévorante qui les anime. La terreur accompagne le moindre de vos pas.",
        examples: 'Donnez vie à votre ombre et rendez-la tangible, explorez les non-lieux cachés parmi les ombres, déployez des ombres autour de vous.',
        urge: 'Terroriser les humains',
        gifts: [
            {
                key: 'cold_blood', name: 'Sang glacé',
                effect: 'Votre ombre dévore vos émotions. Guérissez deux états et bénéficiez d\'un bonus de +1 aux tests de Raison pour cette scène.',
                drawback: 'un terrible froid vous envahit. Vous ne pouvez plus utiliser vos mobiles tant que ce don reste coché.',
                blocksMobiles: true,
            },
            {
                key: 'shadow_cloak', name: 'Manteau d\'ombres',
                effect: 'Enveloppez une cible d\'ombres pour la dissimuler aux regards tant qu\'elle n\'attire pas l\'attention sur elle.',
                drawback: 'les ombres sont voraces. Lancez un d6 : avec un résultat de 1, la cible subit une blessure.',
                roll: { on: [1], effect: 'target_wound' },
            },
        ],
    },
    marchespectre: {
        name: 'Marchespectre',
        text: "Depuis l'avènement des ténèbres, le voile entre la vie et la mort s'est aminci pour vous. Vous pouvez communier avec l'au-delà et invoquer des esprits dans le monde des vivants… au risque de devenir indifférent à la valeur de la vie.",
        examples: 'Déchirez le voile entre le monde des vivants et celui des morts, devenez immatériel un moment, connectez-vous aux spectres.',
        urge: 'Obéir aux esprits vengeurs',
        gifts: [
            {
                key: 'pale_whispers', name: 'Pâles murmures',
                effect: 'Posez une question à un fantôme, qui est alors contraint de répondre sincèrement.',
                drawback: 'vous adoptez un aspect pâle et troublant. Malus de −1 aux tests d\'Influence tant que ce don est coché.',
            },
            {
                key: 'poltergeist', name: 'Poltergeist',
                effect: 'Matérialisez un fantôme. Tant que vous n\'agissez pas, il bouscule, agite ou pousse une cible de votre choix de quelques mètres.',
                drawback: 'vous vous exposez à la souffrance du spectre que vous invoquez. Lancez un d6 : avec un résultat de 1, vous subissez l\'état peur.',
                roll: { on: [1], effect: 'state:fear' },
            },
        ],
    },
    tramesort: {
        name: 'Tramesort',
        text: "Les fées et les gobelins ont laissé leur marque sur vous. Vous savez faire basculer la fortune, tisser des illusions fugaces et vous glisser un instant dans la peau de petites créatures.",
        examples: 'Faites basculer le destin, créez des illusions mineures, découvrez des secrets, remodelez des idées et des perceptions.',
        urge: 'Jouer avec la vie d\'autrui',
        gifts: [
            {
                key: 'fate_balance', name: 'Balance du destin',
                effect: 'Vous obtenez une réussite à un test de votre choix.',
                drawback: 'à l\'avenir, l\'Obscurité peut provoquer une complication lors d\'un défi de son choix.',
            },
            {
                key: 'fae_revelry', name: 'Débauche des fées',
                effect: 'Laissez s\'exprimer les charmes des fées. Vous bénéficiez d\'un bonus de +1 aux jets de Subterfuge et ignorez tout effet de honte pour cette scène.',
                drawback: 'votre sens de la morale risque de vaciller. Malus de −1 aux jets de Volonté tant que ce don est coché.',
            },
        ],
    },
    porteruine: {
        name: 'Porteruine',
        text: "Le malheur vous suit et vous le voyez venir. Vous percevez les futurs possibles, les catastrophes qui guettent chacun, et vous savez parfois en infléchir le cours.",
        examples: 'Prédisez un malheur et influencez-en le cours, examinez les futurs possibles et les secrets qu\'ils recèlent.',
        urge: 'Provoquer d\'effroyables malheurs',
        gifts: [
            {
                key: 'tragic_echo', name: 'Écho tragique',
                effect: 'Choisissez une cible et infligez-vous une blessure : c\'est elle qui la subit à votre place.',
                drawback: 'rien ne vous garantit que le transfert fonctionne entièrement. Lancez un d6 : avec un résultat de 1, vous subissez aussi une blessure.',
                roll: { on: [1], effect: 'wound' },
            },
            {
                key: 'dark_omen', name: 'Sombre présage',
                effect: 'Demandez à l\'Obscurité de révéler le danger le plus immédiat qui pèse sur un sujet à cet instant, en vous le décrivant sous la forme d\'une brève vision.',
                drawback: 'la vision risque de vous effrayer. Lancez un d6 : avec un résultat de 1, vous subissez l\'état peur.',
                roll: { on: [1], effect: 'state:fear' },
            },
        ],
    },
    cherchenature: {
        name: 'Cherchenature',
        text: "La nature vous parle et vous répond. Vous éveillez les plantes et les racines, entendez des messages dans le vent, et tout ce qui est artificiel vous est un peu étranger.",
        examples: 'Éveillez les forces de la nature, animez plantes et racines, percevez des messages dans le vent, détruisez quelque chose d\'artificiel.',
        urge: 'Détruire les traces de la civilisation',
        gifts: [
            {
                key: 'bark_skin', name: 'Peau d\'écorce',
                effect: 'Votre peau devient dure comme l\'écorce. Pendant cette scène, quand vous êtes sur le point de subir une blessure, lancez un d6 : avec un résultat de 5+, vous ne la subissez pas.',
                drawback: 'vous adoptez une apparence dérangeante. Malus de −1 aux jets d\'Influence tant que ce don est coché.',
            },
            {
                key: 'deep_roots', name: 'Racines profondes',
                effect: 'Vous devenez aussi calme et solide qu\'un arbre. Vous bénéficiez d\'un bonus de +1 aux jets de Volonté et ignorez tout effet de colère pendant cette scène.',
                drawback: 'votre lien avec la terre vous ralentit. Malus de −1 aux jets de Force jusqu\'à la fin de la scène.',
            },
        ],
    },
};

export const HERITAGE_ORDER = ['chantesang', 'masquegriffe', 'danselombre', 'marchespectre', 'tramesort', 'porteruine', 'cherchenature'];
