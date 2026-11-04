// tests/systems/nimble/config/rules/formula.test.js
// Formules et dés des catalogues (format_catalogues.md §0).
import { describe, it, expect } from 'vitest';
import { evalFormula, parseDice } from '../../../../../src/systems/nimble/config/rules/formula.js';

const vars = { STR: 2, DEX: -1, INT: 3, WIL: 1, KEY: 3, LVL: 4 };

describe('evalFormula', () => {
    it('mana du Mage : 3×INT + NIV', () => {
        expect(evalFormula('3*INT+LVL', vars)).toBe(13);
        expect(evalFormula('(INT×3)+LVL', vars)).toBe(13);
    });
    it('caractéristique négative, parenthèses, priorité', () => {
        expect(evalFormula('DEX', vars)).toBe(-1);
        expect(evalFormula('2*(WIL+1)', vars)).toBe(4);
        expect(evalFormula('-DEX+1', vars)).toBe(2);
    });
    it('vide ou illisible : valeur de repli', () => {
        expect(evalFormula('', vars, 7)).toBe(7);
        expect(evalFormula('INT ?', vars, 1)).toBe(1);
        expect(evalFormula(null, vars, 0)).toBe(0);
    });
});

describe('parseDice', () => {
    it('dés simples et nombre tiré d\'une caractéristique', () => {
        expect(parseDice('2d6', vars)).toEqual({ count: 2, sides: 6, special: null });
        expect(parseDice('WILd8', vars)).toEqual({ count: 1, sides: 8, special: null });
        expect(parseDice('d20', vars)).toEqual({ count: 1, sides: 20, special: null });
    });
    it('caractéristique négative : aucun dé', () => {
        expect(parseDice('DEXd6', vars).count).toBe(0);
    });
    it('d66 : deux d6', () => {
        expect(parseDice('d66', vars)).toEqual({ count: 2, sides: 6, special: 'd66' });
    });
    it('vide ou illisible : null', () => {
        expect(parseDice('', vars)).toBeNull();
        expect(parseDice('3 dés', vars)).toBeNull();
    });
});
