// tests/systems/woddavampire/config/rules/dicePool.test.js
// Résolution d'une réserve de d10 (spec_woddavampire.md §3.1, §3.2, §3.5, §II.3).
import { describe, it, expect } from 'vitest';
import { resolvePool, clampDifficulty, successDegree } from '../../../../../src/systems/woddavampire/config.jsx';

describe('resolvePool', () => {
    it('règle maison : les 1 n’annulent rien (exemple de la spec : 6, 5, 1, 7 à diff 6 = 2 succès)', () => {
        const r = resolvePool([6, 5, 1, 7], 6);
        expect(r.successes).toBe(2);
        expect(r.botch).toBe(false);
        expect(r.degree).toBe('modérée');
    });

    it('échec critique : aucun succès et au moins un 1', () => {
        expect(resolvePool([4, 1, 3, 5], 8).botch).toBe(true);
        expect(resolvePool([4, 2, 3, 5], 8)).toMatchObject({ botch: false, failure: true, successes: 0 });
    });

    it('jets qui ne peuvent pas échouer critiquement (dégâts, absorption) : simple échec', () => {
        expect(resolvePool([1, 2], 6, { cannotBotch: true })).toMatchObject({ botch: false, failure: true });
    });

    it('spécialité : un 10 compte 2 succès', () => {
        expect(resolvePool([10, 7, 3], 6, { specialty: true }).successes).toBe(3);
        expect(resolvePool([10, 7, 3], 6).successes).toBe(2);
    });

    it('règle du livre (option) : chaque 1 annule un succès lancé, jamais un succès automatique', () => {
        expect(resolvePool([6, 5, 1, 7], 6, { onesCancel: true })).toMatchObject({ successes: 1, cancelled: 1 });
        expect(resolvePool([10, 1], 6, { onesCancel: true, specialty: true })).toMatchObject({ successes: 1, cancelled: 1 });
        expect(resolvePool([7, 1, 1], 6, { onesCancel: true, autoSuccesses: 1 })).toMatchObject({ successes: 1, cancelled: 1 });
    });

    it('règle du livre : des 1 qui annulent tous les succès donnent un échec, pas un échec critique', () => {
        expect(resolvePool([7, 1], 6, { onesCancel: true })).toMatchObject({ successes: 0, failure: true, botch: false });
        expect(resolvePool([4, 1], 6, { onesCancel: true }).botch).toBe(true);
    });

    it('succès automatiques : ajoutés sans rouler, et ils évitent l’échec critique', () => {
        const r = resolvePool([1, 2], 6, { autoSuccesses: 1 });
        expect(r).toMatchObject({ successes: 1, rolledSuccesses: 0, autoSuccesses: 1, botch: false });
    });
});

describe('clampDifficulty', () => {
    it('borne la difficulté de 2 à 10, 6 par défaut', () => {
        expect(clampDifficulty(12)).toBe(10);
        expect(clampDifficulty(1)).toBe(2);
        expect(clampDifficulty(undefined)).toBe(6);
    });
});

describe('successDegree', () => {
    it('1 marginale … 5 et plus phénoménale', () => {
        expect(successDegree(1)).toBe('marginale');
        expect(successDegree(4)).toBe('exceptionnelle');
        expect(successDegree(7)).toBe('phénoménale');
        expect(successDegree(0)).toBeNull();
    });
});
