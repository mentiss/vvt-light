// Moteur de dés (src/features/dice/tools/diceEngine.js) : le résultat brut transmis à afterRoll.
// flags.exploded doit décrire les dés réellement tirés, pas un second lancer
// (défaut relevé par l'audit de novembre 2026).
import { describe, it, expect, beforeAll } from 'vitest';
import { roll } from '@/features/dice/tools/diceEngine.js';

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

// Entrée d'historique écrite par le moteur (spec_diceengine_v2.md, « Passe générique : contrat »)
describe('diceEngine : entrée d\'historique', () => {
    const persistOf = async (notation) => {
        const calls = [];
        const fetchFn = async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return { ok: true }; };
        const result = await roll(notation, {
            apiBase: '/api/fabula', fetchFn, sessionId: 3, characterId: 7, characterName: 'Lyra',
            rollType: 'fabula_test', label: 'Test [DEX + INT]',
        }, { afterRoll: (raw) => ({ total: raw.groups[0].total, slugKey: 'libre' }), buildAnimationSequence: () => null });
        return { body: calls[0].body, url: calls[0].url, result };
    };

    it('type et libellé du slug, notation telle que passée à la bibliothèque, résultat du slug intact', async () => {
        const { url, body, result } = await persistOf(['1d8', '1d10']);
        expect(url).toBe('/api/fabula/dice/roll');
        expect(body).toMatchObject({ session_id: 3, character_id: 7, roll_type: 'fabula_test', label: 'Test [DEX + INT]', notation: '["1d8","1d10"]' });
        expect(body.roll_result).toEqual(result);
        expect(body).not.toHaveProperty('successes');
        expect(body).not.toHaveProperty('pool');
    });

    it('brut : un groupe par notation, chaque dé avec ses marques de la bibliothèque', async () => {
        for (let i = 0; i < 100; i++) {
            // Explosion sur 6, succès sur 5+ (même forme que Vikings : 3d10!>=10>=4)
            const { body } = await persistOf('3d6!>=6>=5');
            const [group] = body.raw_result.groups;
            expect(group.notation).toBe('3d6!>=6>=5');
            // Chaque 6 explose et ajoute un dé ; chaque dé à 5+ est un succès
            const sixes = group.dice.filter(d => d.value === 6).length;
            expect(group.dice).toHaveLength(3 + sixes);
            for (const d of group.dice) {
                expect(d.modifiers.includes('explode')).toBe(d.value === 6);
                expect(d.modifiers.includes('target-success')).toBe(d.value >= 5);
            }
            expect(group.total).toBe(group.dice.filter(d => d.value >= 5).length);
        }
    });
});
