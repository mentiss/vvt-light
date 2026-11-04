// tests/systems/vileborn/config/rules/test.test.js
// Résolution du test (spec_vileborn.md §1.1, §1.2) : exemples du kit.
import { describe, it, expect } from 'vitest';
import {
    resolveTest, darkThreshold, statePenalty, poolSize,
} from '../../../../../src/systems/vileborn/config/rules/test.js';

describe('Le test : meilleur dé + modificateur contre la difficulté', () => {
    it('kit p. 46 : 2d8 (2 et 7) contre 6 → réussite', () => {
        const r = resolveTest([2, 7], null, { difficulty: 6 });
        expect(r).toMatchObject({ kept: 7, total: 7, verdict: 'success', dark: null, darkComplication: false });
    });
    it('égalité : 5 contre 5', () => {
        expect(resolveTest([5, 3], null, { difficulty: 5 }).verdict).toBe('tie');
    });
    it('en dessous : complication ; le modificateur s\'applique au dé gardé', () => {
        expect(resolveTest([4], null, { difficulty: 5 }).verdict).toBe('complication');
        expect(resolveTest([4], null, { difficulty: 5, modifier: 1 }).verdict).toBe('tie');
        expect(resolveTest([6], null, { difficulty: 6, modifier: -1 }).verdict).toBe('complication');
    });
});

describe('Explorer son sombre héritage : le d12 compte dans la réserve', () => {
    it('kit p. 49 : 1d10 = 3, d12 = 7, difficulté 4, 1 coche → réussite sans complication', () => {
        const r = resolveTest([3], 7, { difficulty: 4, ticks: 1 });
        expect(r).toMatchObject({ kept: 7, keptDark: true, verdict: 'success', darkThreshold: 9, darkComplication: false });
    });
    it('le d12 déclenche une complication au seuil des coches (9+, 6+, 3+)', () => {
        expect(resolveTest([2], 6, { difficulty: 5, ticks: 2 }).darkComplication).toBe(true);
        expect(resolveTest([2], 5, { difficulty: 5, ticks: 2 }).darkComplication).toBe(false);
        expect(resolveTest([8], 3, { difficulty: 5, ticks: 3 })).toMatchObject({ verdict: 'success', keptDark: false, darkComplication: true });
    });
    it('seuils bornés de 1 à 3 coches', () => {
        expect([1, 2, 3].map(darkThreshold)).toEqual([9, 6, 3]);
        expect(darkThreshold(0)).toBe(9);
        expect(darkThreshold(5)).toBe(3);
    });
});

describe('Réserve et états', () => {
    it('1 dé, +1 personnalité, +1 formation', () => {
        expect(poolSize()).toBe(1);
        expect(poolSize({ personality: true })).toBe(2);
        expect(poolSize({ personality: true, training: true })).toBe(3);
    });
    it('colère et épuisement : −1 sur leurs approches', () => {
        const c = { stateAnger: true, stateExhaustion: false };
        expect(statePenalty(c, 'reason')).toBe(-1);
        expect(statePenalty(c, 'force')).toBe(0);
        expect(statePenalty({ stateExhaustion: true }, 'influence')).toBe(-1);
    });
});
