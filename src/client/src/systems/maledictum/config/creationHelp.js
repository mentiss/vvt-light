// src/client/src/systems/maledictum/config/creationHelp.js
// ─────────────────────────────────────────────────────────────────────────────
// Textes de l'assistant de création (un seul fichier, spec_maledictum.md §11.3) :
// guide, aide de chaque onglet. Les descriptions des origines, factions,
// Fonctions, rôles, talents et pouvoirs viennent de leurs catalogues.
// ─────────────────────────────────────────────────────────────────────────────

export const GUIDE = {
    title: 'Rejoindre la cellule',
    intro: "Vous incarnez un acolyte : un serviteur de l'Imperium recruté par un Inquisiteur, votre Patron, pour enquêter dans l'ombre du secteur Macharien. La création suit le livre : caractéristiques, origine, faction, rôle, équipement, puis l'identité.",
    steps: [
        ['Caractéristiques', 'Neuf valeurs, tirées (2d10 + 20) ou achetées avec 90 points. Tirer dans l\'ordre rapporte 50 XP, réarranger 25 XP.'],
        ['Origine', 'Le monde où vous avez grandi : +5 à une caractéristique fixe, +5 à une autre au choix, un objet. Le setup propose aussi les origines macharriennes de l\'Inquisition.'],
        ['Faction', "L'institution qui vous a formé. Une Fonction est un paquet prêt à l'emploi ; sinon, vous répartissez vous-même les Avantages. L'Inquisition se joue par ses trois Ordos."],
        ['Rôle', 'Ce que vous apportez à la cellule : talents, Avances de compétence et de spécialisation, équipement.'],
        ['Équipement', "Ce que vous recevez et les choix d'objets. Les achats avec vos Solars se font ensuite sur la fiche."],
        ['Identité', 'Nom, apparence, objectifs à court et à long terme (ils rapportent de l\'XP), connexions, divination.'],
    ],
    random: "Chaque étape peut se laisser au hasard : l'XP gagnée s'ajoute au compteur et se dépense ensuite sur la fiche (bouton « Dépenser l'XP »). Tout tirer au hasard rapporte 200 XP.",
    caps: 'À la création : 2 Avances au plus par compétence, 1 par spécialisation ; les prérequis des talents sont ignorés.',
};

export const TAB_HELP = {
    chars: {
        title: 'Caractéristiques',
        text: "Capacité de Combat (CC), Capacité de Tir (CT), Force (F), Endurance (E), Agilité (Ag), Intelligence (Int), Perception (Per), Force Mentale (FM), Sociabilité (Soc). Le bonus est la dizaine (F 34 : BF 3). Un humain se situe entre 30 et 40. Les bonus d'origine et de faction s'ajoutent ensuite et ne comptent pas comme des Avances.",
    },
    origin: { title: 'Origine', text: "Choisissez votre monde natal, ou laissez le d100 décider (+25 XP). Les origines macharriennes du Player's Guide remplacent les mondes : ce sont des parcours marqués par l'Inquisition (possédé exorcisé, intouchable, survivant d'un monde de la mort…)." },
    faction: { title: 'Faction', text: "La faction donne des caractéristiques, 5 Avances de compétence, +1 Influence, un talent souvent, de l'équipement et des Solars. Une Fonction fixe tout cela pour vous ; décochez-la pour répartir vous-même. Au hasard : +75 XP (table de l'Inquisition, Ordos compris)." },
    role: { title: 'Rôle', text: "Le rôle donne des talents au choix, 3 Avances de compétence, 2 de spécialisation et un équipement. Le Mystique devient Psyker : il choisit alors un pouvoir mineur et un pouvoir de discipline (et connaît Châtiment). Laisser le Patron choisir : +50 XP." },
    equipment: { title: 'Équipement', text: "Les objets fixes viennent de l'origine, de la faction et du rôle ; choisissez ceux qui sont au choix. Vous pourrez acheter des objets Courants (et un seul Peu courant) avec vos Solars depuis l'inventaire de la fiche." },
    identity: { title: 'Identité', text: "Un objectif à court terme atteint rapporte 50 XP, un objectif à long terme 500 XP. Les connexions vous lient à un autre acolyte et au Patron. La divination est une prophétie : si votre mort l'accomplit, votre personnage suivant reçoit la moitié de votre XP." },
};
