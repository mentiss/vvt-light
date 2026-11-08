// Moteur de dés (src/tools/diceEngine.js) : le résultat brut transmis à afterRoll.
// flags.exploded doit décrire les dés réellement tirés, pas un second lancer
// (défaut relevé par l'audit de novembre 2026).
import { describe, it, expect, beforeAll } from 'vitest';
import { roll } from '../../src/tools/diceEngine.js';

// Le moteur lit l'adresse pour trouver le slug ; sans animation ni historique
beforeAll(() => {
    globalThis.window ??= { location: { pathname: '/fabula' } };
});

const rawOf = (notation) => roll(notation, { persistHistory: false }, {
    afterRoll: (raw) => raw,
    buildAnimationSequence: () => null,
});

describe('diceEngine : résultat brut', () => {
    it('un groupe par notation du tableau', async () => {
        const raw = await rawOf(['2d6', '1d10']);
        expect(raw.groups.map(g => g.values.length)).toEqual([2, 1]);
        expect(raw.allDice).toHaveLength(3);
    });

    it('explosions : flags.exploded correspond aux dés du jet (3d6!)', async () => {
        for (let i = 0; i < 200; i++) {
            const raw = await rawOf('3d6!');
            const values = raw.groups[0].values;
            // Chaque dé qui explose est un 6 et ajoute un dé au groupe
            expect(raw.flags.exploded.length).toBe(values.length - 3);
            expect(raw.flags.exploded.every(v => v === 6)).toBe(true);
        }
    });
});
