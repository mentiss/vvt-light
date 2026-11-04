// src/client/src/systems/vileborn/config/descriptions.js
// Textes de l'assistant de création : aide de chaque onglet et guide.
// Les descriptions des éléments choisissables viennent de leur catalogue
// (approches.js, heritages.js, origins.js, resources.js).

export const TAB_HELP = {
    heritage: {
        title: 'Sombre héritage',
        text: 'La part de ténèbres qui s\'est éveillée en vous dans l\'enfance. Elle vous donne deux dons, et une pulsion à laquelle vous céderez un jour. Survolez un héritage pour le découvrir.',
    },
    origin: {
        title: 'Origine',
        text: 'Le milieu dont vous venez. Elle vous donne un moyen unique d\'aborder les épreuves. Choisissez-en une ou décrivez la vôtre avec « Autre… ».',
    },
    approaches: {
        title: 'Approches',
        text: 'Choisissez une répartition, puis donnez un dé à chaque approche. Pour un test, vous lancez le dé de l\'approche, plus un dé de la même taille si votre personnalité s\'applique et un si votre formation s\'applique ; vous gardez le meilleur.',
    },
    words: {
        title: 'Personnalité et Formation',
        text: 'Deux adjectifs pour votre personnalité, deux verbes ou noms pour votre formation. Quand l\'un d\'eux s\'applique à un test, il ajoute un dé. D\'autres mots viendront en jeu, dans les cercles vides de la fiche.',
    },
    resource: {
        title: 'Ressource et mobiles',
        text: 'Une ressource : un objet ou un appui utile. Vos mobiles : votre aspiration (facultative) guérit une blessure quand elle s\'applique, votre devoir guérit un état ; chacun ne sert qu\'une fois.',
    },
    identity: {
        title: 'Identité',
        text: 'Votre nom, une devise si vous le souhaitez, et un portrait : il sera au centre de votre fiche.',
    },
};

export const WORDS_HELP = {
    personality: { title: 'Personnalité', text: 'Un adjectif qui vous décrit. Utilisable si le mot est lié au test ; c\'est vous qui en jugez, en restant cohérent. La honte vous en prive.' },
    training: { title: 'Formation', text: 'Un verbe ou un nom : ce que vous savez faire. Utilisable si le mot est lié au test. La peur vous en prive.' },
};

export const DISTRIBUTION_HELP = {
    title: 'Répartition des dés',
    text: 'Un dé fort et deux bons, ou quatre bons dés : les deux répartitions des Parias du kit.',
};

export const GUIDE = [
    { title: 'Qui êtes-vous ?', text: 'Un Paria de la Malengeance : un jeune adulte mi-humain mi-nuisible, dont le sombre héritage s\'est éveillé dans l\'enfance. La Lex Umbræ vous enrôle dans l\'ordre du Crépuscule.' },
    { title: 'Les étapes', text: 'Choisissez votre sombre héritage et votre origine, répartissez vos dés d\'approche, trouvez deux mots de personnalité et deux de formation, une ressource et vos mobiles, puis votre nom. Les étapes se font dans l\'ordre de votre choix.' },
    { title: 'Ensuite, en jeu', text: 'Votre fiche s\'étoffe à la table : de nouveaux mots dans les cercles, des liens avec les autres Parias, des évolutions décidées avec l\'Obscurité.' },
];
