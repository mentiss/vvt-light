// src/client/src/systems/zoneblanche/config/base.js
// Données structurelles pures — aucune dépendance React, aucun hook dés.

export const PRINCIPES = [
    { key: 'logique',   label: 'Logique' },
    { key: 'instinct',  label: 'Instinct' },
    { key: 'technique', label: 'Technique' },
    { key: 'presence',  label: 'Présence' },
];

export const COMPETENCES = [
    { key: 'investigation', label: 'Investigation' },
    { key: 'operation',     label: 'Opération' },
    { key: 'deplacement',   label: 'Déplacement' },
    { key: 'esoterisme',    label: 'Ésotérisme' },
];

// Symétrie parfaite : chaque Principe et chaque Compétence apparaît 2 fois en
// majeur et 2 fois en mineur (cf. spec §5).
export const ARCHETYPES = [
    { key: 'animateur',    label: 'Animateur',    principeMajeur: 'presence',  principeMineur: 'technique', competenceMajeure: 'investigation', competenceMineure: 'deplacement',
        description: "Le visage de l'émission. Vingt ans d'antenne ou une communauté fidèle derrière lui, il sait faire parler les gens et tenir un plateau qui déraille. Sur le terrain, c'est souvent lui qui pose les mots sur ce que les autres n'osent pas dire." },
    { key: 'guest_star',   label: 'Guest Star',   principeMajeur: 'presence',  principeMineur: 'instinct',  competenceMajeure: 'deplacement',    competenceMineure: 'investigation',
        description: "L'invité qui apporte un supplément d'âme et d'audience — sportif, chouchou du public ou revenu d'ailleurs. Pas du métier, mais jamais largué : il réagit vite et surprend l'équipe autant que les spectateurs." },
    { key: 'ingenieur',    label: 'Ingénieur',    principeMajeur: 'technique', principeMineur: 'logique',   competenceMajeure: 'operation',      competenceMineure: 'esoterisme',
        description: "Le technicien qui garde tout le monde en vie et le matériel en état. Vingt ans de métier, une caisse à outils, et un instinct pour ce qui va lâcher avant que ça lâche." },
    { key: 'operateur',    label: 'Opérateur',    principeMajeur: 'technique', principeMineur: 'presence',  competenceMajeure: 'deplacement',    competenceMineure: 'operation',
        description: "L'œil et l'oreille de l'émission. Cadreur aguerri, souvent passé par des terrains autrement plus hostiles qu'une maison abandonnée — c'est lui qui capte l'instant où tout bascule." },
    { key: 'scientifique', label: 'Scientifique', principeMajeur: 'logique',   principeMineur: 'technique', competenceMajeure: 'investigation',  competenceMineure: 'deplacement',
        description: "La voix de la rigueur. Docteur, expert judiciaire ou chasseur de fraudes, il vient démonter ou confirmer — et déteste qu'on lui dise ce qu'il doit croire avant d'avoir vérifié." },
    { key: 'producteur',   label: 'Producteur',   principeMajeur: 'logique',   principeMineur: 'instinct',  competenceMajeure: 'operation',      competenceMineure: 'esoterisme',
        description: "Celui qui fait tourner la boutique. Contrats, budget, décisions de tournage — et un instinct du récit qui sait exactement quand pousser l'équipe vers le danger pour la bonne scène." },
    { key: 'medium',       label: 'Médium',       principeMajeur: 'instinct',  principeMineur: 'presence',  competenceMajeure: 'esoterisme',     competenceMineure: 'investigation',
        description: "Le sensitif de l'équipe. Consultant réputé, revenu d'entre les morts ou héritier d'une tradition, il perçoit ce que les instruments ne mesurent pas — et le paye parfois cher." },
    { key: 'exorciste',    label: 'Exorciste',    principeMajeur: 'instinct',  principeMineur: 'logique',   competenceMajeure: 'esoterisme',     competenceMineure: 'operation',
        description: "Le rempart. Formé, officieux ou héréditaire, il porte les rituels et les objets qui protègent l'équipe — à l'endroit précis où la foi et le folklore deviennent difficiles à distinguer." },
];

export function getArchetype(key) {
    return ARCHETYPES.find(a => a.key === key) ?? null;
}