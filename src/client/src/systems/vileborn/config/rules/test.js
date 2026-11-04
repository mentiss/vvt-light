// src/client/src/systems/vileborn/config/rules/test.js
// ─────────────────────────────────────────────────────────────────────────────
// Résolution du test Vileborn (spec_vileborn.md §1.1, §1.2, §II.4) — pur.
//   - réserve : 1 dé de l'approche, +1 si la personnalité s'applique, +1 si la
//     formation s'applique (honte et peur les interdisent) ;
//   - on garde le meilleur dé (le d12 d'obscurité de l'héritage compte dans la
//     réserve), on ajoute le modificateur, on compare à la difficulté ;
//   - verdict : au-dessus réussite, égalité, en dessous complication ;
//   - d12 d'héritage : complication en plus s'il atteint le seuil des coches.
// ─────────────────────────────────────────────────────────────────────────────

import { STATES } from '../approaches.js';

export const DIFFICULTIES = [
    { value: 4, label: 'Facile' },
    { value: 5, label: 'Normale' },
    { value: 6, label: 'Difficile' },
    { value: 7, label: 'Très difficile' },
];
export const DEFAULT_DIFFICULTY = 5;

/** Seuil de complication du d12 selon les coches du sombre héritage (1 → 9+, 2 → 6+, 3 → 3+) */
export const darkThreshold = (ticks) => ({ 1: 9, 2: 6, 3: 3 })[Math.min(3, Math.max(1, ticks))];

/** Seuils du dé d'obscurité improvisé par le MJ */
export const DARK_INTENSITIES = [
    { key: 'weak',     label: 'Faible',    threshold: 9 },
    { key: 'average',  label: 'Moyenne',   threshold: 6 },
    { key: 'powerful', label: 'Puissante', threshold: 3 },
];

/** Malus des états pour une approche (colère, épuisement : −1 chacun) */
export const statePenalty = (character, approachKey) =>
    0 - STATES.filter(s => s.penalty?.includes(approachKey) && character?.[s.field]).length;   // 0 - n : jamais −0

/** Nombre de dés de la réserve (hors d12) */
export const poolSize = ({ personality = false, training = false } = {}) => 1 + (personality ? 1 : 0) + (training ? 1 : 0);

/**
 * Résout un test.
 * @param {number[]} values  dés de l'approche
 * @param {number|null} dark d12 d'obscurité de l'héritage (compte dans la réserve) ou null
 * @param {{ difficulty: number, modifier?: number, ticks?: number }} opts
 */
export const resolveTest = (values, dark, { difficulty, modifier = 0, ticks = 0 }) => {
    const all = dark ? [...values, dark] : [...values];
    const kept = Math.max(...all);
    const total = kept + modifier;
    const verdict = total > difficulty ? 'success' : total < difficulty ? 'complication' : 'tie';
    const threshold = dark ? darkThreshold(ticks) : null;
    return {
        kept, total, difficulty, modifier, verdict,
        keptDark: !!dark && dark > Math.max(...values),
        dark: dark ?? null, darkThreshold: threshold,
        darkComplication: !!dark && dark >= threshold,
    };
};

/** Rang d'une coche : 1ʳᵉ, 2ᵉ, 3ᵉ */
export const ordinal = (n) => (n === 1 ? '1ʳᵉ' : `${n}ᵉ`);

export const VERDICT_LABELS ={ success: 'Réussite', tie: 'Égalité', complication: 'Complication' };

/** Ce que les états interdisent dans la fenêtre de jet : { personality, training } → raison ou null */
export const blockedByStates = (c) => ({
    personality: c?.stateShame ? 'Honte : vous ne pouvez pas utiliser votre personnalité.' : null,
    training:    c?.stateFear  ? 'Peur : vous ne pouvez pas utiliser votre formation.' : null,
});

/**
 * Contexte d'un test (systemData), états appliqués.
 * @param {object} c        personnage
 * @param {{ approach, die, difficulty, personality, training, explore, modifier, bondLevel }} choices
 * @param {number} ticks    coches de l'héritage après l'exploration (si explore)
 */
export const buildTestContext = (c, choices, ticks = 0) => {
    const blocked = blockedByStates(c);
    return {
        type: 'test',
        approach: choices.approach,
        die: choices.die,
        difficulty: choices.difficulty ?? DEFAULT_DIFFICULTY,
        personality: !!choices.personality && !blocked.personality,
        training: !!choices.training && !blocked.training,
        explore: !!choices.explore,
        ticks: choices.explore ? ticks : 0,
        modifier: (choices.modifier ?? 0) + (choices.bondLevel ?? 0) + statePenalty(c, choices.approach),
    };
};
