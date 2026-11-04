// src/client/src/systems/nimble/config/motivations.js
// Source : Nimble Core Rules 3.3, p. 30-31 (Adventuring Motivation).
// Motivations d'aventurier facultatives : la phrase en gras (name) et les questions qui l'accompagnent (text).

export const MOTIVATION_INTRO = 'Le monde est un endroit dangereux : on ne part généralement pas « à l\'aventure » sans raison. Votre motivation doit donner à votre personnage l\'envie de travailler avec le reste du groupe. Choisissez-en 1 :';

// Encadré de fin de liste
export const MOTIVATION_CUSTOM = {
    title: 'Ou créez la vôtre !', vo: 'Or Make Your Own!',
    text: 'Un bon passé de personnage tisse des liens avec le monde, ses habitants, vos compagnons héros, ou même les méchants. Voyez avec votre MJ et les autres joueurs pour trouver une motivation qui croisera le chemin que prendra l\'histoire. Tout bon héros a un désir. Quel est le vôtre ?',
};

export const MOTIVATIONS = [
    {
        key: 'life_debt', name: 'J\'ai une dette de vie envers quelqu\'un de mon groupe.', vo: 'I owe a life debt to someone in my party.',
        text: 'Discutez avec votre groupe : qui d\'autre a besoin d\'aide pour son histoire ? Qu\'a fait cette personne pour vous aider ?',
    },
    {
        key: 'owe_money', name: 'Je dois BEAUCOUP d\'argent à des gens très dangereux.', vo: 'I owe a LOT of money to some very dangerous people.',
        text: 'Qu\'avez-vous fait de cet argent ? Votre MJ a sûrement de TRÈS bonnes idées de méchants avec qui vous êtes dans de sales draps.',
    },
    {
        key: 'betrayed', name: 'J\'étais le meilleur ami de _______ (qui m\'a trahi).', vo: 'I was best friends with (and betrayed by) _______.',
        text: 'Voulez-vous le reconquérir ? Prendre votre revanche ? Prévenir les autres de sa traîtrise ? Voyez avec votre MJ de qui il pourrait s\'agir.',
    },
    {
        key: 'lost', name: 'Je suis perdu.', vo: 'I’m lost.',
        text: 'Physiquement ? Émotionnellement ? Spirituellement ? Êtes-vous dans le mauvais pays, voire sur le mauvais plan d\'existence ?',
    },
    {
        key: 'grow_in_power', name: 'Je dois gagner en puissance pour vaincre quelqu\'un qui m\'a fait du tort.', vo: 'I need to grow in power to defeat someone who has wronged me.',
        text: 'Savez-vous qui vous a fait du tort, ou est-ce un inconnu ? Une seule personne ou un groupe plus large ? Parlez-en avec votre MJ ; il adorera vous aider à combler les vides.',
    },
    {
        key: 'bring_back_from_dead', name: 'Je cherche un moyen de ramener d\'entre les morts un être cher (ou quelqu\'un que je déteste).', vo: 'I am searching for a way to bring a loved one (or someone I hate) back from the dead.',
        text: 'Qui vous a dit que c\'était possible ? Et si cette personne ne se souvenait pas de vous ?',
    },
    {
        key: 'get_back_home', name: 'J\'essaie de rentrer chez moi.', vo: 'I am trying to get back home.',
        text: 'Où est votre foyer ? Vous en souvenez-vous seulement ? Qu\'est-ce qui vous a poussé à partir ? Parlez-en avec votre MJ ; il peut vous proposer plusieurs terres natales.',
    },
    {
        key: 'stolen_from_me', name: 'Je cherche celui qui m\'a volé quelque chose de précieux.', vo: 'I am searching for the one who stole something valuable from me.',
        text: 'Est-ce un objet ? Une personne ? Un souvenir ? Vous l\'a-t-on vraiment volé, ou avez-vous conclu un mauvais marché ?',
    },
    {
        key: 'polymorphed', name: 'Un magicien m\'a métamorphosé en une autre sorte de créature.', vo: 'I was polymorphed into another kind of creature by a wizard.',
        text: 'Ha ! Quel effet ça ferait, pour un adorable halfelin, de devenir un affreux gobelin ? Qu\'avez-vous fait pour fâcher le magicien ?',
    },
    {
        key: 'duty_calls', name: 'Le devoir m\'appelle. L\'honneur m\'oblige à servir.', vo: 'Duty calls. I am honor-bound to serve.',
        text: 'Qui vous appelle ? Votre roi ? Votre famille ? Une ancienne alliance ou une vieille rancune ? Parlez-en avec votre MJ et les autres joueurs pour trouver des idées et des liens communs.',
    },
    {
        key: 'wanderlust', name: 'Envie d\'ailleurs / pèlerinage.', vo: 'Wanderlust/Pilgrimage.',
        text: 'Quelle chose extraordinaire voulez-vous voir ou vivre ? Avez-vous passé trop de temps loin de la route ? Votre MJ a sûrement des lieux fantastiques en tête pour vous.',
    },
    {
        key: 'hometown_in_danger', name: 'Mon village natal est en danger.', vo: 'My hometown is in danger.',
        text: 'Cherchez-vous un remède ? Des mercenaires ? Une force personnelle ?',
    },
    {
        key: 'curiosity', name: 'Curiosité ! Je veux percer les secrets les plus PROFONDS.', vo: 'Curiosity! I want to learn the DEEP secrets.',
        text: 'Quels secrets ? La magie, le savoir, la politique, ce qui s\'est vraiment passé dans l\'histoire ?',
    },
    {
        key: 'prove_my_worth', name: 'Prouver ma valeur.', vo: 'To prove my worth.',
        text: 'Vous avez toujours été sous-estimé : par votre famille, votre village, vos pairs ou vous-même. Que faudra-t-il pour leur montrer que vous valez plus qu\'ils ne le pensaient ? Quel genre de reconnaissance recherchez-vous ?',
    },
    {
        key: 'prophecy', name: 'J\'obéis à une prophétie.', vo: 'I’m following a prophecy.',
        text: 'Un personnage mystérieux ou un texte ancien a prédit que vous joueriez un rôle crucial dans le destin du monde. Que savez-vous de la prophétie ? Y croyez-vous ?',
    },
];
