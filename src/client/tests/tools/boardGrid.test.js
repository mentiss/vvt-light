// tests/tools/boardGrid.test.js
// Grille et règle du tableau (documentations/spec_tableau.md §10.3, Q-35, Q-43)
import { describe, it, expect } from 'vitest';
import { formatDistance, measure, resolveGrid, PLATFORM_GRID } from '../../src/tools/boardGrid.js';

describe('resolveGrid : cascade plateforme → slug → table → diapositive', () => {
    it('défaut de la plateforme sans autre niveau', () => {
        expect(resolveGrid()).toEqual(PLATFORM_GRID);
        expect(resolveGrid(null, undefined)).toEqual({ value: 1.5, unit: 'm' });
    });

    it('chaque niveau reprend le précédent tant qu\'il n\'est pas réglé', () => {
        const slug = { value: 5, unit: 'ft' };
        expect(resolveGrid(slug)).toEqual({ value: 5, unit: 'ft' });
        expect(resolveGrid(slug, { value: null, unit: null })).toEqual({ value: 5, unit: 'ft' });
        expect(resolveGrid(slug, { value: 10, unit: null })).toEqual({ value: 10, unit: 'ft' });
        expect(resolveGrid(slug, { value: 10, unit: null }, { value: null, unit: 'm' })).toEqual({ value: 10, unit: 'm' });
    });
});

describe('measure / formatDistance', () => {
    it('distance en cases × valeur d\'une case', () => {
        expect(measure({ x: 0, y: 0 }, { x: 150, y: 0 }, 50, 1.5)).toBeCloseTo(4.5);
        expect(measure({ x: 0, y: 0 }, { x: 30, y: 40 }, 50, 5)).toBeCloseTo(5);
    });

    it('arrondi au dixième, virgule décimale, unité', () => {
        expect(formatDistance(4.5, 'm')).toBe('4,5 m');
        expect(formatDistance(15, 'ft')).toBe('15 ft');
        expect(formatDistance(2.04, 'm')).toBe('2 m');
    });
});
