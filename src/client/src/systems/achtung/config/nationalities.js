// src/client/src/systems/achtung/config/nationalities.js
// Nationalités jouables — liste fermée avec langues de départ.

export const NATIONALITIES = [
    {
        key: 'australia',
        label: 'Australie',
        languages: ['Anglais'],
        languageNote: 'Les personnages australiens autochtones peuvent aussi connaître une langue autochtone.',
        description: 'Malgré les difficultés de la Grande Dépression, l\'Australie suit la politique britannique face à l\'Allemagne nazie et entre en guerre dans les jours suivant la Grande-Bretagne. Les pilotes australiens se battent vaillamment lors de la Bataille d\'Angleterre, tandis que les troupes australiennes servent en Afrique du Nord, en Méditerranée, et aux côtés des Américains dans le Pacifique.',
    },
    {
        key: 'canada',
        label: 'Canada',
        languages: ['Anglais', 'Français'],
        languageNote: 'Les personnages canadiens des Premières Nations peuvent aussi connaître une langue autochtone.',
        description: 'Le Canada rejoint la déclaration de guerre britannique contre l\'Allemagne, et ses troupes servent en Italie et en Europe du Nord. Sa plus grande contribution est son rôle dans la Bataille de l\'Atlantique, aidant à maintenir les lignes d\'approvisionnement vitales vers la Grande-Bretagne malgré les meutes de sous-marins allemands.',
    },
    {
        key: 'czechoslovakia',
        label: 'Tchécoslovaquie',
        languages: ['Tchèque', 'Slovaque'],
        languageNote: 'Beaucoup de Tchécoslovaques parlent aussi l\'allemand ou le hongrois.',
        description: 'Abandonnée par les Alliés lors des Accords de Munich, la Tchécoslovaquie est rapidement engloutie par l\'Allemagne nazie. Ses soldats et ses pilotes s\'enfuient à l\'étranger pour continuer le combat, formant des unités d\'élite au sein des forces alliées. Leur haine des nazis et leur désir de libérer leur patrie en font des combattants exceptionnellement motivés.',
    },
    {
        key: 'france',
        label: 'France',
        languages: ['Français'],
        languageNote: null,
        description: 'Après la défaite rapide et humiliante de 1940, la France est divisée : la zone occupée sous contrôle nazi et le régime de Vichy au sud. Mais la France Libre du Général de Gaulle continue le combat depuis Londres, et des milliers de résistants sur le sol français risquent leur vie quotidiennement pour aider les Alliés et saboter l\'occupant.',
    },
    {
        key: 'india',
        label: 'Inde',
        languages: ['Anglais', 'Hindi'],
        languageNote: 'Les personnages indiens peuvent aussi connaître l\'ourdou, le bengali ou d\'autres langues régionales.',
        description: 'Le Joyau de la Couronne britannique déclare la guerre à l\'Allemagne et envoie plus de trois millions de soldats volontaires combattre les nazis aux côtés des Alliés. Les troupes indiennes ne défendent pas seulement les frontières contre l\'invasion japonaise, mais servent avec distinction dans chaque théâtre de guerre, tandis que les États indiens font d\'importants dons au fonds de guerre.',
    },
    {
        key: 'norway',
        label: 'Norvège',
        languages: ['Norvégien'],
        languageNote: null,
        description: 'Malgré sa tentative de neutralité, la Norvège est envahie par l\'Allemagne en avril 1940. Le roi Haakon VII refuse de capituler et s\'exile à Londres pour diriger le gouvernement norvégien en exil. La résistance norvégienne joue un rôle crucial, notamment dans le sabotage de la production d\'eau lourde nazie, entravant les ambitions nucléaires allemandes.',
    },
    {
        key: 'poland',
        label: 'Pologne',
        languages: ['Polonais'],
        languageNote: null,
        description: 'La Pologne est la première à subir la Blitzkrieg nazie en septembre 1939. Ses soldats, pilotes et marins s\'enfuient à l\'étranger pour continuer le combat avec une détermination farouche. Les pilotes polonais jouent un rôle crucial lors de la Bataille d\'Angleterre, et l\'intelligence polonaise fournit aux Alliés des informations vitales sur les codes Enigma.',
    },
    {
        key: 'united_kingdom',
        label: 'Royaume-Uni',
        languages: ['Anglais'],
        languageNote: 'Les personnages gallois peuvent aussi parler le gallois.',
        description: 'La Grande-Bretagne est en première ligne de la guerre contre le nazisme. De la Bataille d\'Angleterre aux campagnes d\'Afrique du Nord, en passant par les bombardements nocturnes de la Luftwaffe, le peuple britannique tient bon. La Section M des renseignements militaires et l\'OSS américain recrutent parmi les meilleurs esprits pour lutter contre la menace occulte nazie.',
    },
    {
        key: 'united_states',
        label: 'États-Unis d\'Amérique',
        languages: ['Anglais'],
        languageNote: 'Les personnages issus d\'une minorité ethnique peuvent aussi parler une autre langue (espagnol, langues autochtones, etc.).',
        description: 'Les États-Unis entrent officiellement en guerre après Pearl Harbour en décembre 1941, mais travaillaient secrètement aux côtés des Britanniques bien avant. Majestic, l\'organisation américaine de contre-espionnage occulte, est déjà active depuis des années. Les ressources industrielles et humaines américaines transforment l\'équilibre des forces, et leurs agents rejoignent leurs alliés britanniques dans la Guerre Secrète.',
    },
    {
        key: 'ussr',
        label: 'URSS',
        languages: ['Russe'],
        languageNote: null,
        description: 'Initialement alliée à l\'Allemagne par un pacte de non-agression, l\'Union Soviétique bascule du côté des Alliés lors de l\'invasion allemande en juin 1941. Le Front de l\'Est devient le théâtre de la guerre la plus brutale et la plus sanglante de l\'histoire humaine. Les soldats soviétiques combattent avec une détermination féroce pour défendre leur patrie contre l\'agression nazie et les forces du Surnaturel qui les accompagnent.',
    },
    {
        key: 'other',
        label: 'Autre / Personnalisé',
        languages: [],
        languageNote: 'Précisez la nationalité et la langue de départ ci-dessous.',
        description: 'La Guerre Secrète attire des combattants du monde entier — Néo-Zélandais, Sud-Africains, Nationaux déplacés, Espagnols républicains en exil, et bien d\'autres encore. Choisissez votre nationalité et discutez de ses implications avec votre MJ.',
    },
];