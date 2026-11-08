// src/client/src/systems/vileborn/config/challenges.js
// ─────────────────────────────────────────────────────────────────────────────
// Libellés des défis (spec_vileborn_defis.md §II.1, §II.4). Les fiches vivent en
// base (bibliothèque du MJ) : ici seulement les listes qui servent aux filtres et
// au formulaire.
// ─────────────────────────────────────────────────────────────────────────────

import { STATES } from './approaches.js';

/** Provenance d'une fiche */
export const SOURCES = [
    { key: 'kit',       label: "Kit d'initiation" },
    { key: 'livre',     label: 'Livre de base' },
    { key: 'apocrypha', label: 'Apocrypha' },
    { key: 'mj',        label: 'Création du MJ' },
];

/** Familles de nuisibles (noms du kit quand il les donne), puis les autres défis */
export const FAMILIES = [
    { key: 'fallen',   label: 'Déchus' },
    { key: 'fae',      label: 'Fées' },
    { key: 'ferals',   label: 'Polymorphes' },
    { key: 'hexed',    label: 'Maudits' },       // Hexed : traduction de la table, absente du kit
    { key: 'shadows',  label: 'Ombres' },
    { key: 'vampires', label: 'Vampires' },
    { key: 'wildkin',  label: 'Sylvestres' },    // Wildkin : traduction de la table, absente du kit
    { key: 'other',    label: 'Autres défis' },
];

/** Effets d'une complication : les cinq états du kit et la blessure */
export const CHALLENGE_EFFECTS = [...STATES.map(s => ({ key: s.key, label: s.label })), { key: 'wound', label: 'Blessure' }];

/** Quand lancer le dé d'obscurité du défi */
export const DARK_WHEN = [
    { key: 'always',  label: 'À chaque test' },
    { key: 'fromBox', label: "À partir d'une case" },
    { key: 'none',    label: 'Jamais' },
];

const labelOf = (list, key) => list.find(x => x.key === key)?.label ?? key;

// Recherche, filtres et groupes (tools/catalog.js), communs à la bibliothèque et à CatalogModal
export const CHALLENGE_FILTERS = [
    { key: 'source', getValue: c => c.source, options: SOURCES.map(s => ({ value: s.key, label: s.label })) },
    { key: 'family', getValue: c => c.family, options: FAMILIES.map(f => ({ value: f.key, label: f.label })) },
];
export const CHALLENGE_GROUP = { getValue: c => c.family, getLabel: (key) => labelOf(FAMILIES, key) };
export const CHALLENGE_SEARCH = ['name', 'kind', 'description'];

/** Fiches dans l'ordre des familles, puis par nom (groupes dans l'ordre de FAMILIES) */
export const sortByFamily = (list) => {
    const rank = (c) => { const i = FAMILIES.findIndex(f => f.key === c.family); return i < 0 ? FAMILIES.length : i; };
    return [...list].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'fr'));
};
export const sourceLabel = (key) => labelOf(SOURCES, key);
export const familyLabel = (key) => labelOf(FAMILIES, key);
export const effectLabel = (key) => labelOf(CHALLENGE_EFFECTS, key);
