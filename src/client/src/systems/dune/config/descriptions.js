// src/client/src/systems/dune/config/descriptions.js
// Textes d'aide de l'assistant de création (colonne d'aide contextuelle), tirés du
// livre de base FR (p. 102-106) : description et usage de chaque compétence et de
// chaque principe, sens des rangs, exemples de maximes. Un seul fichier de textes.

export const COMPETENCE_HELP = {
    analyse: {
        text: "L'Analyse décrit la prédisposition à assimiler et traiter les informations, se rappeler les faits et s'en servir plus tard : déductions logiques, intuition, perspicacité, compréhension des connaissances théoriques, techniques ou scientifiques.",
        use: "Saisir les détails d'une situation, fouiller un lieu, mener des recherches, se souvenir, tirer des conclusions de ce qu'on sait.",
    },
    combat: {
        text: "Le Combat décrit les compétences martiales, l'intuition face au danger, la compréhension de la tactique et de la stratégie, et la connaissance des outils, techniques et de l'histoire du combat.",
        use: "Combattre, éviter le danger, préparer une bataille, se souvenir des méthodes ou de l'histoire d'un conflit.",
    },
    discipline: {
        text: "La Discipline décrit l'aptitude à dominer son esprit et son corps, et à exercer un ascendant sur les autres par sa présence, sa volonté et son autorité. Elle permet aussi de se concentrer sur une tâche complexe.",
        use: "Résister aux poisons, aux drogues ou à l'influence mentale, dompter ses réflexes sous la douleur, contraindre ou menacer par sa seule présence.",
    },
    mobilite: {
        text: "La Mobilité décrit la capacité de déplacement, l'aptitude à manœuvrer vite ou avec prudence dans son environnement et à surmonter des obstacles physiques.",
        use: "Marcher, courir, sauter, grimper, nager, se déplacer avec vitesse, précision ou discrétion, user de sa force hors du combat.",
    },
    rhetorique: {
        text: "La Rhétorique décrit la capacité à engager la conversation, soutenir une discussion et argumenter ; elle englobe l'insinuation, l'allusion et le sous-entendu, et permet de les repérer chez les autres.",
        use: "Persuader ou tromper, transmettre une information de manière détournée, comprendre ce que l'autre veut vraiment dire.",
    },
};

export const PRINCIPE_HELP = {
    devoir: {
        text: "Le Devoir représente la pression pour trouver sa place dans la société et remplir le rôle qu'on vous a attribué, et le poids de vos obligations.",
        use: "Quand la tâche relève de votre responsabilité et que d'autres comptent sur vous : servir sa Maison, ceux qu'on commande.",
        maximes: ['« Je sers le bon vouloir de la Maison. »', '« Ce qui doit être accompli le sera. »', '« Le devoir est une lame acérée. »'],
    },
    domination: {
        text: "La Domination représente la recherche d'influence, d'autorité ou de contrôle sur l'univers : l'ego du personnage et son droit à prendre ce qu'il veut.",
        use: "Quand l'action sert vos intérêts, directement ou non ; elle peut exiger un sacrifice, mais n'est jamais tout à fait altruiste.",
        maximes: ['« Je prendrai ce qui m’est dû. »', '« Le pouvoir naît sur le tranchant d’un couteau. »', '« Toute puissance invite au défi. »'],
    },
    foi: {
        text: "La Foi représente les exigences morales, religieuses et spirituelles, et le degré de consécration à une entité supérieure.",
        use: "Quand l'action répond à un impératif moral, religieux ou relevant de vos valeurs ; ou quand vous comptez sur la chance ou un plan improvisé.",
        maximes: ['« Ma foi m’offre la certitude là où d’autres doutent. »', '« Dieu nous met à l’épreuve lorsqu’il nous plonge dans l’adversité. »'],
    },
    justice: {
        text: "La Justice rêve de stabilité et d'équité et veut redresser les torts ; elle sert la loi et le bien commun, parfois aussi de mauvaises lois ou la vengeance.",
        use: "Quand l'action est juste, légalement ou moralement : appliquer la loi, châtier au nom de sa Maison, se venger.",
        maximes: ['« Je dois protéger ceux dont je suis responsable. »', '« Je me vengerai du tort que l’on m’a fait. »', '« La vie n’est pas juste. »'],
    },
    verite: {
        text: "La Vérité représente le désir de connaissance et le besoin de découvrir ce qui est vrai, même quand la réponse dérange ou met en danger.",
        use: "Quand la curiosité vous pousse à exiger le meilleur de vous-même, pour connaître à tout prix une réponse ou percer un secret.",
        maximes: ['« Respecter la vérité, tel est le socle de toute chose. »'],
    },
};

/** Sens des rangs (livre : compétences de 4 à 8, principes 8, 7, 6, 5, 4). */
export const COMPETENCE_RANKS = {
    4: 'Vous manquez de formation dans ce domaine.',
    5: 'Vous en possédez des rudiments.',
    6: 'Vous êtes bien formé, ou vous avez mis en pratique votre formation.',
    7: 'Vous êtes très capable et expérimenté.',
    8: 'Vous êtes un maître reconnu.',
};
export const PRINCIPE_RANKS = {
    4: 'Vous ne vous souciez guère de cette notion.',
    5: 'Elle compte, mais vous avez d’autres priorités.',
    6: 'Cette valeur vous influence certainement.',
    7: 'Elle figure parmi vos principales priorités.',
    8: 'Le seul précepte auquel vous accordez de l’importance.',
};

/** Aide par défaut de chaque étape (colonne de droite, quand rien n'est survolé). */
export const STEP_HELP = {
    guide:      { title: 'Créer un personnage', text: "Suivez les étapes dans l'ordre, ou naviguez librement par les onglets. Rien n'est définitif : tout se corrige ensuite sur la fiche, en mode Édition." },
    identite:   { title: 'Identité', text: "Le nom du personnage et celui du joueur sont obligatoires. Rôle, faction, traits et ambition reprennent la feuille officielle : un trait de rôle ou de statut, un trait de réputation (« juste et sage », « impitoyable »)." },
    competences:{ title: 'Compétences', text: 'Chaque test combine une compétence et un principe. Rang de 1 au minimum, sans maximum. La spécialisation s’ouvre au rang 6 : elle fait compter double les dés inférieurs ou égaux au rang de la compétence.' },
    principes:  { title: 'Principes', text: 'Ce qui pousse votre personnage à agir. Rang de 1 à 8 ; le livre conseille 8, 7, 6, 5 et 4. La maxime s’ouvre au rang 6 : une phrase brève sur ce que le personnage éprouve à ce sujet.' },
    points:     { title: 'Points libres', text: 'Cinq points à répartir sur les compétences et les principes, un point par rang. Les principes restent plafonnés à 8.' },
    extras:     { title: 'Talents et atouts', text: 'Facultatifs à la création, ils s’ajoutent aussi en jeu. Catalogue du livre ou saisie libre.' },
    recap:      { title: 'Récapitulatif', text: 'Vérifiez la ligne « À faire », puis créez le personnage. Notez son code d’accès : c’est votre clé.' },
};

/** Texte du Guide (premier onglet). */
export const GUIDE = [
    { title: 'Identité', text: 'Prénom et nom, joueur, statut, et les champs de la feuille officielle.' },
    { title: 'Compétences', text: 'Analyse, Combat, Discipline, Mobilité, Rhétorique : ce que fait le personnage.' },
    { title: 'Principes', text: 'Devoir, Domination, Foi, Justice, Vérité : pourquoi il agit.' },
    { title: 'Points libres', text: 'Cinq points pour affiner.' },
    { title: 'Talents et atouts', text: 'Capacités spéciales et ressources, facultatives.' },
    { title: 'Récapitulatif', text: 'La création, et votre code d’accès.' },
];
