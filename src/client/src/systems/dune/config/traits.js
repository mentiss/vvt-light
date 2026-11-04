// src/client/src/systems/dune/config/traits.js
// Compétences et principes (livre FR, feuille officielle) : clés de la base, libellés.
// Source unique des libellés : fiche, fenêtres de jet, PNJ, création.

export const COMPETENCES = [
    { key: 'analyse',    label: 'Analyse' },
    { key: 'combat',     label: 'Combat' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'mobilite',   label: 'Mobilité' },
    { key: 'rhetorique', label: 'Rhétorique' },
];

export const PRINCIPES = [
    { key: 'devoir',     label: 'Devoir' },
    { key: 'domination', label: 'Domination' },
    { key: 'foi',        label: 'Foi' },
    { key: 'justice',    label: 'Justice' },
    { key: 'verite',     label: 'Vérité' },
];

const LABELS = Object.fromEntries([...COMPETENCES, ...PRINCIPES].map(t => [t.key, t.label]));

/** Libellé d'une compétence ou d'un principe (la clé si inconnue). */
export const traitLabel = (key) => LABELS[key] ?? key;

/** Prénom et nom d'un personnage, pour l'historique et les titres (C-4). */
export const characterFullName = (character) =>
    [character?.prenom, character?.nom].map(s => s?.trim()).filter(Boolean).join(' ');
