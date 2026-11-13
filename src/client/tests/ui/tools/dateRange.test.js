// tests/ui/tools/dateRange.test.js — champ « période » (spec_journal.md R-23)
import { describe, it, expect } from 'vitest';
import { monthGrid, periodLabel, pickDay, previewRange, lastDays, isoDay } from '@/ui/tools/dateRange.js';

describe('monthGrid', () => {
    it('novembre 2026 : 42 jours, du lundi 26 octobre au dimanche 6 décembre', () => {
        const grid = monthGrid(2026, 10);
        expect(grid).toHaveLength(42);
        expect(grid[0]).toEqual({ key: '2026-10-26', day: 26, inMonth: false });
        expect(grid[6]).toEqual({ key: '2026-11-01', day: 1, inMonth: true });
        expect(grid[41].key).toBe('2026-12-06');
    });
    it('un mois qui commence un lundi commence la grille', () => {
        expect(monthGrid(2026, 5)[0]).toEqual({ key: '2026-06-01', day: 1, inMonth: true });
    });
});

describe('periodLabel', () => {
    it('libellés du champ', () => {
        expect(periodLabel({ from: '', to: '' })).toBeNull();
        expect(periodLabel({ from: '2026-11-10', to: '' })).toBe('Depuis le 10/11');
        expect(periodLabel({ from: '', to: '2026-11-13' })).toBe("Jusqu'au 13/11");
        expect(periodLabel({ from: '2026-11-10', to: '2026-11-13' })).toBe('Du 10/11 au 13/11');
        expect(periodLabel({ from: '2026-11-13', to: '2026-11-13' })).toBe('Le 13/11/2026');
    });
});

describe('pickDay', () => {
    it('premier clic : le début, puis la fin', () => {
        const a = pickDay({ from: '', to: '' }, 'from', '2026-11-10');
        expect(a).toEqual({ range: { from: '2026-11-10', to: '' }, mode: 'to', done: false });
        const b = pickDay(a.range, a.mode, '2026-11-13');
        expect(b).toEqual({ range: { from: '2026-11-10', to: '2026-11-13' }, mode: 'from', done: true });
    });
    it('une fin avant le début : les bornes s\'échangent', () => {
        expect(pickDay({ from: '2026-11-10', to: '' }, 'to', '2026-11-02').range).toEqual({ from: '2026-11-02', to: '2026-11-10' });
    });
    it('un nouveau début après la fin efface la fin', () => {
        expect(pickDay({ from: '2026-11-01', to: '2026-11-05' }, 'from', '2026-11-08').range).toEqual({ from: '2026-11-08', to: '' });
    });
});

describe('previewRange', () => {
    it('la période se dessine au survol pendant le choix de la fin', () => {
        expect(previewRange({ from: '2026-11-10', to: '' }, 'to', '2026-11-12')).toEqual({ from: '2026-11-10', to: '2026-11-12' });
        expect(previewRange({ from: '2026-11-10', to: '' }, 'to', '2026-11-08')).toEqual({ from: '2026-11-08', to: '2026-11-10' });
    });
});

describe('lastDays', () => {
    it('7 jours jusqu\'à aujourd\'hui inclus', () => {
        expect(lastDays(7, new Date(2026, 10, 13, 12))).toEqual({ from: '2026-11-06', to: '2026-11-13' });
        expect(isoDay(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
    });
});
