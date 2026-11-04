// src/client/src/systems/dune/config/rules/creation.js
// Règles de l'assistant de création, telles que l'app les applique (spec_dune.md §6.5) :
//   - rangs de base choisis librement : compétences 1 au minimum, principes de 1 à 8 ;
//   - 5 points libres répartis ensuite (+1 par point), principes toujours plafonnés à 8 ;
//   - spécialisation (compétence) et maxime (principe) ouvertes à partir du rang 6 ;
//   - nom du personnage et nom du joueur obligatoires.
// Fonctions pures, testées (tests/systems/dune/config/rules/creation.test.js).

import { COMPETENCES, PRINCIPES } from '../traits.js';

export const FREE_POINTS        = 5;
export const MIN_RANK           = 1;
export const PRINCIPE_MAX       = 8;
export const TEXT_UNLOCK_RANK   = 6;   // spécialisation et maxime

/** État de départ de l'assistant. */
export const initialCreation = () => ({
    identity: {
        prenom: '', nom: '', playerName: '', statutSocial: '', role: '', faction: '',
        traitsPersonnalite: '', ambition: '', motto: '', age: '', taille: '', poids: '', sexe: '', description: '',
    },
    competences: Object.fromEntries(COMPETENCES.map(t => [t.key, { rang: MIN_RANK, bonus: 0, specialisation: '' }])),
    principes:   Object.fromEntries(PRINCIPES.map(t => [t.key, { rang: MIN_RANK, bonus: 0, maxime: '' }])),
    talents: [],
    items:   [],
});

/** Rang final d'un trait : base + points libres. */
export const finalRank = (entry) => entry.rang + entry.bonus;

/** Points libres encore à répartir. */
export const freePointsLeft = (state) =>
    FREE_POINTS
    - Object.values(state.competences).reduce((s, e) => s + e.bonus, 0)
    - Object.values(state.principes).reduce((s, e) => s + e.bonus, 0);

/** Plafond d'un trait (Infinity pour une compétence). */
export const rankMax = (group) => (group === 'principes' ? PRINCIPE_MAX : Infinity);

/** Le texte (spécialisation ou maxime) est-il ouvert pour ce rang final ? */
export const textUnlocked = (entry) => finalRank(entry) >= TEXT_UNLOCK_RANK;

/**
 * Peut-on changer le rang de base de delta ?
 * @param {'competences'|'principes'} group
 */
export const canChangeBase = (entry, group, delta) => {
    const next = entry.rang + delta;
    return next >= MIN_RANK && next + entry.bonus <= rankMax(group);
};

/** Peut-on ajouter (+1) ou retirer (−1) un point libre sur ce trait ? */
export const canChangeBonus = (state, entry, group, delta) => (delta > 0
    ? freePointsLeft(state) > 0 && finalRank(entry) < rankMax(group)
    : entry.bonus > 0);

/** Ce qui reste à faire (texte) ; required : bloque la création. */
export const creationTodo = (state) => {
    const todo = [];
    if (!state.identity.nom.trim())        todo.push({ text: 'Nom du personnage', required: true });
    if (!state.identity.playerName.trim()) todo.push({ text: 'Nom du joueur', required: true });
    const left = freePointsLeft(state);
    if (left > 0) todo.push({ text: `${left} point${left > 1 ? 's' : ''} libre${left > 1 ? 's' : ''} à répartir`, required: false });
    return todo;
};

export const canCreate = (state) => creationTodo(state).every(t => !t.required);

/**
 * Corps du POST /characters. Un texte n'est envoyé que si son rang final l'ouvre.
 */
export const creationPayload = (state) => {
    const trim = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
    return {
        ...trim(state.identity),
        competences: COMPETENCES.map(({ key }) => {
            const e = state.competences[key];
            return { key, rang: finalRank(e), specialisation: textUnlocked(e) ? e.specialisation.trim() : '' };
        }),
        principes: PRINCIPES.map(({ key }) => {
            const e = state.principes[key];
            return { key, rang: Math.min(PRINCIPE_MAX, finalRank(e)), maxime: textUnlocked(e) ? e.maxime.trim() : '' };
        }),
        talents: state.talents,
        items:   state.items,
    };
};
