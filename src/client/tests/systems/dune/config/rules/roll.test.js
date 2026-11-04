// tests/systems/dune/config/rules/roll.test.js
// Résolution du test 2D20 de Dune (spec_dune.md §2.3, Q-1, C-2, C-3).
import { describe, it, expect } from 'vitest';
import { resolveDie, resolveRoll, impulsionCost, poolSize, impulsionGain } from '../../../../../src/systems/dune/config/rules/roll.js';

describe('dune : résolution d’un dé', () => {
    it('20 = complication, même sous un seuil de 20', () => {
        expect(resolveDie(20, { threshold: 20 })).toEqual({ successes: 0, complication: true });
    });
    it('au-dessus du seuil : 0 ; sous le seuil : 1 ; un 1 compte toujours double', () => {
        expect(resolveDie(13, { threshold: 12 }).successes).toBe(0);
        expect(resolveDie(12, { threshold: 12 }).successes).toBe(1);
        expect(resolveDie(1,  { threshold: 12 }).successes).toBe(2);
    });
    it('spécialisation activée : les dés ≤ au rang de la compétence comptent double', () => {
        expect(resolveDie(8, { threshold: 16, specialisationThreshold: 8 }).successes).toBe(2);
        expect(resolveDie(9, { threshold: 16, specialisationThreshold: 8 }).successes).toBe(1);
        expect(resolveDie(8, { threshold: 16 }).successes).toBe(1);
    });
});

describe('dune : résolution d’un test', () => {
    it('exemple de la planche : Combat 8 + Foi 8, spécialisation, Détermination, difficulté 2', () => {
        const r = resolveRoll({ values: [6, 12, 20], forcedOnes: 1, threshold: 16, specialisationThreshold: 8, difficulty: 2 });
        expect(r.dice.map(d => [d.value, d.forced, d.successes])).toEqual([[1, true, 2], [6, false, 2], [12, false, 1], [20, false, 0]]);
        expect(r).toMatchObject({ successes: 5, complications: 1, success: true, excess: 3 });
    });
    it('échec : moins de succès que la difficulté, pas d’excédent', () => {
        expect(resolveRoll({ values: [15, 9], threshold: 11, difficulty: 3 })).toMatchObject({ successes: 1, success: false, excess: 0 });
    });
});

describe('dune : ressources du jet', () => {
    it('barème dégressif de l’Impulsion', () => {
        expect([0, 1, 2, 3].map(impulsionCost)).toEqual([0, 1, 3, 6]);
        expect(impulsionCost(4)).toBe(Infinity);
    });
    it('réserve : 2 dés de base, 5 au plus', () => {
        expect(poolSize()).toBe(2);
        expect(poolSize(2, 1)).toBe(5);
        expect(poolSize(3, 2)).toBe(5);
    });
    it('excédent versé : plafonné par la place restante (6 au plus)', () => {
        expect(impulsionGain(3, 4)).toBe(2);
        expect(impulsionGain(3, 0)).toBe(3);
        expect(impulsionGain(2, 6)).toBe(0);
    });
});
