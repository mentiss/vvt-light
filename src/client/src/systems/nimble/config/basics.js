// src/client/src/systems/nimble/config/basics.js
// ─────────────────────────────────────────────────────────────────────────────
// Tables de base de la fiche (Core Rules 3.3 p.6-11, 20) : caractéristiques,
// compétences, tableaux de caractéristiques, états, tailles de dés de vie.
// ─────────────────────────────────────────────────────────────────────────────

/** Les 4 caractéristiques, dans l'ordre de la fiche */
export const STATS = [
    { key: 'str', label: 'FOR', name: 'Force',        field: 'statStr', text: 'Puissance physique, endurance, résistance. Dégâts des armes de FOR, résistance aux Blessures, récupération des PV, concentration, emplacements d\'inventaire, empoignade, Puissance.' },
    { key: 'dex', label: 'DEX', name: 'Dextérité',    field: 'statDex', text: 'Agilité, réflexes et précision. Dégâts des armes de DEX, Initiative, Défense sans armure, empoignade, Discrétion et Finesse.' },
    { key: 'int', label: 'INT', name: 'Intelligence', field: 'statInt', text: 'Savoir et raisonnement. Langues, sorts, baguettes et parchemins, Arcanes, Examen et Savoir.' },
    { key: 'wil', label: 'VOL', name: 'Volonté',      field: 'statWil', text: 'Force de caractère, courage et sagesse. Sorts, Intuition, Influence, Nature et Perception.' },
];
export const STAT_BY_KEY = Object.fromEntries(STATS.map(s => [s.key, s]));

/** Les 10 compétences, dans l'ordre de la fiche */
export const SKILLS = [
    { key: 'arcana',      label: 'Arcanes',     stat: 'int', text: 'Phénomènes magiques, sorts, enchantements ; aberrations, élémentaires, vases.' },
    { key: 'examination', label: 'Examen',      stat: 'int', text: 'Analyse et déduction : blessures, causes de la mort, indices, pièges et mécanismes ; créatures artificielles.' },
    { key: 'finesse',     label: 'Finesse',     stat: 'dex', text: 'Gestes précis : crocheter, désamorcer, piloter, bricoler, tours de mains, escalader une paroi glissante.' },
    { key: 'influence',   label: 'Influence',   stat: 'wil', text: 'Convaincre ou tromper, négocier, gagner la confiance, captiver un public.' },
    { key: 'insight',     label: 'Intuition',   stat: 'wil', text: 'Deviner les intentions, détecter le mensonge, comprendre une situation ; « y avoir pensé » après coup.' },
    { key: 'lore',        label: 'Savoir',      stat: 'int', text: 'Histoire, royaumes, religions ; célestes, dragons, fées, fiélons, géants, humanoïdes, morts-vivants.' },
    { key: 'might',       label: 'Puissance',   stat: 'str', text: 'Soulever, enfoncer, grimper, nager, sauter, exploits de force.' },
    { key: 'naturecraft', label: 'Nature',      stat: 'wil', text: 'Survie, orientation, pistage, animaux ; bêtes, monstruosités, plantes.' },
    { key: 'perception',  label: 'Perception',  stat: 'wil', text: 'Repérer objets cachés, passages secrets, filatures et menaces.' },
    { key: 'stealth',     label: 'Discrétion',  stat: 'dex', text: 'Rester invisible, se faufiler, échapper aux regards.' },
];
export const SKILL_BY_KEY = Object.fromEntries(SKILLS.map(s => [s.key, s]));

/** Tableaux de caractéristiques (p.20) : les plus hautes valeurs dans les caractéristiques clés */
export const STAT_ARRAYS = [
    { key: 'standard', label: 'Standard', values: [2, 2, 0, -1] },
    { key: 'balanced', label: 'Équilibré', values: [2, 1, 1, 0] },
    { key: 'minmax',   label: 'Min-max',  values: [3, 1, -1, -1] },
];

/** États (p.11 et glossaire p.56) ; « mourant » est suivi à part (colonne dying) */
export const CONDITIONS = [
    { key: 'blind',          label: 'Aveuglé',      text: 'Ne voit pas. Les attaques contre vous ont l\'avantage, vos attaques ont le désavantage.' },
    { key: 'charmed',        label: 'Charmé',       text: 'Voit le charmeur comme un allié ; il a l\'avantage aux interactions sociales avec vous.' },
    { key: 'concentrating',  label: 'Concentré',    text: 'Une seule concentration à la fois. Critique subi : sauvegarde de FOR DD 10 ou elle se rompt.' },
    { key: 'dazed',          label: 'Étourdi',      text: 'Un héros perd 1 action ; un monstre perd son déplacement OU 1 attaque à son prochain tour.' },
    { key: 'frightened',     label: 'Effrayé',      text: 'Désavantage aux jets quand la source de la peur est proche ; Vitesse divisée par deux en s\'en approchant.' },
    { key: 'grappled',       label: 'Agrippé',      text: 'Tenu par une créature ; les attaques contre vous deux ont l\'avantage.' },
    { key: 'hidden',         label: 'Caché',        text: 'Votre première attaque a l\'avantage (puis vous n\'êtes plus caché).' },
    { key: 'incapacitated',  label: 'Neutralisé',   text: 'Ne peut rien faire. Les attaques contre vous ont l\'avantage, et les attaques au corps à corps qui touchent sont critiques.' },
    { key: 'invisible',      label: 'Invisible',    text: 'Vos attaques ont l\'avantage, les attaques contre vous le désavantage.' },
    { key: 'poisoned',       label: 'Empoisonné',   text: 'Désavantage à tous les jets (en général, un soin y met fin).' },
    { key: 'prone',          label: 'À terre',      text: 'Déplacement à coût double, désavantage aux attaques. Attaques au corps à corps contre vous : avantage ; à distance : désavantage. Se relever coûte 3 cases.' },
    { key: 'restrained',     label: 'Immobilisé',   text: 'Ne peut pas se déplacer. Les attaques contre vous ont l\'avantage.' },
    { key: 'silenced',       label: 'Réduit au silence', text: 'Ne peut pas lancer de sorts ni utiliser une capacité qui demande de parler.' },
    { key: 'slowed',         label: 'Ralenti',      text: 'Vitesse divisée par deux pendant votre prochain tour.' },
    { key: 'taunted',        label: 'Provoqué',     text: 'Désavantage aux attaques, sauf contre le dernier provocateur.' },
    { key: 'charged',        label: 'Chargé',       text: 'Après des dégâts de foudre, pendant 1 minute ou jusqu\'à la fin du combat ; certains sorts en tirent parti.' },
    { key: 'smoldering',     label: 'Fumant',       text: 'Sans effet seul ; certains sorts et capacités en tirent parti (et y mettent fin).' },
];
export const CONDITION_BY_KEY = Object.fromEntries(CONDITIONS.map(s => [s.key, s]));

/** Tailles de dés de vie, dans l'ordre (augmenter d'un cran : d4 → d6 → … → d20) */
export const DIE_STEPS = [4, 6, 8, 10, 12, 20];

/** Gain de PV fixe par taille de dé de vie (montée de niveau, p.21) */
export const FLAT_HP = { 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 20: 10 };

/** Valeurs par défaut (p.20) */
export const BASE_SPEED = 6;
export const BASE_WOUNDS = 6;
export const BASE_SLOTS = 10;
export const MAX_ACTIONS = 3;
export const STARTING_GOLD = 25;

/** Types d'armures maîtrisables (catalogue d'équipement, `armor.types` des classes) */
export const ARMOR_TYPES = { cloth: 'Tissu', leather: 'Cuir', mail: 'Maille', plate: 'Plaque', shield: 'Bouclier' };

/** Mention de licence (Nimble 3rd Party Creator License v2.0, apps gratuites) */
export const LICENSE_TEXT = 'Cette application est gratuite pour quiconque possède déjà le contenu, découvre le système ou ne peut pas l\'acheter pour le moment. Si vous appréciez Nimble et en avez les moyens, soutenez le jeu en achetant le contenu officiel sur nimbleRPG.com. Mentiss VTT est un produit indépendant publié sous la licence Nimble 3rd Party Creator License. Nimble TTRPG © Nimble Co.';
