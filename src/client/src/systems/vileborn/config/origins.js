// src/client/src/systems/vileborn/config/origins.js
// Les sept origines des fiches prétirées (nom, effet, présentation).
// Source : documentations/vileborn/transcription_fiches_pretires_aide.md.

export const ORIGINS = {
    noble: {
        name: 'Noble',
        effect: 'Vous pouvez cocher colère pour obtenir une réussite d\'Influence.',
        text: 'Vous êtes né dans le confort de la vie de cour. Vous avez appris à exercer votre autorité… et à vous protéger des vôtres.',
    },
    outlaw: {
        name: 'Hors-la-loi',
        effect: 'Quand vous devez subir l\'état honte, lancez un d6 : avec un résultat de 5 ou 6, vous ne le subissez pas.',
        text: 'Vous avez grandi parmi les hors-la-loi. Vous vous êtes forgé un caractère au fil des épreuves et avez appris à ne jamais montrer la moindre faiblesse.',
    },
    believer: {
        name: 'Croyant',
        effect: 'Vous pouvez cocher honte pour obtenir une réussite de Volonté.',
        text: 'Vous avez été élevé parmi les croyants. La rigueur d\'une existence vouée à la foi et à l\'étude des textes sacrés a affûté votre esprit et renforcé votre détermination.',
    },
    orphan: {
        name: 'Orphelin',
        effect: 'Vous pouvez cocher peur pour obtenir une réussite de Subterfuge.',
        text: 'Vous avez grandi dans la rue, sans personne. Vous ne pouviez compter que sur votre ingéniosité pour survivre, et une vie d\'épreuves vous a rendu bien plus solide qu\'il n\'y paraît.',
    },
    middle_class: {
        name: 'Classe moyenne',
        effect: 'Quand vous négociez quelque chose, vous pouvez relancer un dé présentant le plus faible résultat.',
        text: 'Vous venez d\'une famille de la classe moyenne dont l\'ambition et le commerce ont fait la fortune.',
    },
    nomad: {
        name: 'Nomade',
        effect: 'Quand vous tentez de gagner la confiance de quelqu\'un, vous pouvez relancer un dé présentant le plus faible résultat.',
        text: 'Vous avez passé votre enfance sur les routes. Vous n\'êtes nulle part vraiment chez vous, même si vous pourriez l\'être n\'importe où.',
    },
    humble: {
        name: 'Humble',
        effect: 'Vous pouvez cocher épuisement pour obtenir une réussite de Volonté.',
        text: 'Vos parents travaillaient la terre et vous avez trimé sans relâche dès votre plus jeune âge.',
    },
};

export const ORIGIN_ORDER = ['noble', 'outlaw', 'believer', 'orphan', 'middle_class', 'nomad', 'humble'];
