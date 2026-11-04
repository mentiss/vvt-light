// src/client/src/systems/dune/config/rules/roll.js
// Résolution d'un test 2D20 tel que l'app l'applique (spec_dune.md §2.3).
// Fonctions pures, testées (tests/systems/dune/config/rules/roll.test.js).
//
//   seuil      = rang de la compétence + rang du principe
//   20         = complication (0 succès)
//   dé ≤ seuil = 1 succès ; 2 succès si le dé vaut 1, ou si la spécialisation
//                est activée pour ce jet et que le dé est ≤ au rang de la compétence
//   Détermination : avant le jet, un dé de la réserve est posé sur 1 (Q-1)

export const BASE_DICE     = 2;
export const MAX_DICE      = 5;
export const IMPULSION_MAX = 6;
export const MAX_DIFFICULTY = 5;

/** Coût total en Impulsion des dés achetés (index = nombre de dés : 0 à 3). */
export const IMPULSION_COST = [0, 1, 3, 6];

/** Coût en Impulsion de n dés achetés (Infinity au-delà du barème). */
export const impulsionCost = (n) => IMPULSION_COST[n] ?? Infinity;

/** Taille de la réserve : 2 dés de base + dés achetés (Impulsion) + dés générés (Menace), 5 au plus. */
export const poolSize = (boughtWithImpulsion = 0, boughtWithThreat = 0) =>
    Math.min(MAX_DICE, BASE_DICE + boughtWithImpulsion + boughtWithThreat);

/**
 * Résout un dé.
 * @param {number} value
 * @param {{ threshold: number, specialisationThreshold?: number }} opts
 *        specialisationThreshold : rang de la compétence si la spécialisation est activée, 0 sinon
 * @returns {{ successes: number, complication: boolean }}
 */
export function resolveDie(value, { threshold, specialisationThreshold = 0 }) {
    if (value === 20) return { successes: 0, complication: true };
    if (value > threshold) return { successes: 0, complication: false };
    const critical = value === 1 || value <= specialisationThreshold;
    return { successes: critical ? 2 : 1, complication: false };
}

/**
 * Résout un test complet.
 * @param {object}   p
 * @param {number[]} p.values                  valeurs lancées (sans le dé de la Détermination)
 * @param {number}   [p.forcedOnes=0]          dés posés sur 1 par la Détermination
 * @param {number}   p.threshold               seuil (compétence + principe)
 * @param {number}   [p.specialisationThreshold=0]
 * @param {number}   p.difficulty              succès requis
 * @returns {{ dice: Array<{ value, forced, successes, complication }>, successes, complications, success, excess }}
 */
export function resolveRoll({ values, forcedOnes = 0, threshold, specialisationThreshold = 0, difficulty }) {
    const dice = [
        ...Array.from({ length: forcedOnes }, () => ({ value: 1, forced: true })),
        ...values.map(value => ({ value, forced: false })),
    ].map(d => ({ ...d, ...resolveDie(d.value, { threshold, specialisationThreshold }) }));

    const successes     = dice.reduce((sum, d) => sum + d.successes, 0);
    const complications = dice.filter(d => d.complication).length;
    return {
        dice,
        successes,
        complications,
        success: successes >= difficulty,
        excess:  Math.max(0, successes - difficulty),
    };
}

/**
 * Impulsion réellement versée par l'excédent : plafonnée par la place restante (C-3).
 * @param {number} excess   succès excédentaires
 * @param {number} current  Impulsion en réserve
 */
export const impulsionGain = (excess, current) =>
    Math.max(0, Math.min(excess, IMPULSION_MAX - current));
