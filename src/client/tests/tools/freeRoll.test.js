// src/client/tests/tools/freeRoll.test.js
// Jet libre dans les historiques (spec_diceengine_v2.md, « Jet libre ») :
// jets récents complets, anciens jets sans total ni libellé.

import { describe, it, expect } from 'vitest';
import { parseFreeRoll } from '../../src/tools/freeRoll.js';

const entry = (roll_result, extra = {}) => ({ roll_type: 'free_roll', roll_result, ...extra });

describe('parseFreeRoll', () => {
    it('lit un jet récent (total, modificateur et libellé enregistrés)', () => {
        const parsed = parseFreeRoll(entry({
            groups:   [{ notation: '2d6', values: [3, 5], total: 8 }, { notation: '1d8+3', values: [6], total: 9 }],
            total:    17,
            modifier: 3,
            label:    'Crochetage',
        }));
        expect(parsed).toEqual({
            label:    'Crochetage',
            total:    17,
            modifier: 3,
            groups:   [
                { notation: '2d6', values: [3, 5], subtotal: 8 },
                { notation: '1d8', values: [6],    subtotal: 6 },
            ],
        });
    });

    it('reconstruit un ancien jet : total recalculé, modificateur lu dans la notation, libellé par défaut', () => {
        const parsed = parseFreeRoll(entry(JSON.stringify({
            allDice: [4, 2],
            groups:  [{ notation: '1d6', values: [4], total: 4 }, { notation: '1d4-1', values: [2], total: 1 }],
        })));
        expect(parsed.label).toBe('Jet libre');
        expect(parsed.modifier).toBe(-1);
        expect(parsed.total).toBe(5);
        expect(parsed.groups.map(g => g.notation)).toEqual(['1d6', '1d4']);
    });

    it('ignore les autres types de jet et les résultats illisibles', () => {
        expect(parseFreeRoll({ roll_type: 'vikings_skill', roll_result: { groups: [] } })).toBeNull();
        expect(parseFreeRoll(entry('pas du json'))).toBeNull();
        expect(parseFreeRoll(entry(null))).toBeNull();
    });
});
