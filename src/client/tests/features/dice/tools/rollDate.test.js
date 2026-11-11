import { describe, it, expect } from 'vitest';

import { parseRollDate, formatRollDate } from '@/features/dice/tools/rollDate.js';

// Dates locales construites dans le fuseau de la machine : le test ne dépend pas du fuseau
const now = new Date(2026, 10, 1, 21, 40);          // 1er novembre 2026, 21:40
const at = (...args) => new Date(...args).toISOString();

describe('parseRollDate', () => {
    it('lit une date ISO avec fuseau', () => {
        expect(parseRollDate('2026-11-01T20:40:00.000Z').toISOString()).toBe('2026-11-01T20:40:00.000Z');
    });

    it('lit une date SQLite sans fuseau comme de l\'UTC', () => {
        expect(parseRollDate('2026-11-01 20:40:00').toISOString()).toBe('2026-11-01T20:40:00.000Z');
    });

    it('renvoie null pour une date vide ou illisible', () => {
        expect(parseRollDate(null)).toBeNull();
        expect(parseRollDate('pas une date')).toBeNull();
    });
});

describe('formatRollDate (spec_ui_actions.md §6.4)', () => {
    it('« à l\'instant » sous une minute', () => {
        expect(formatRollDate(at(2026, 10, 1, 21, 39, 30), now)).toBe('à l\'instant');
    });

    it('en minutes sous une heure', () => {
        expect(formatRollDate(at(2026, 10, 1, 21, 28), now)).toBe('il y a 12 min');
    });

    it('en heures le même jour', () => {
        expect(formatRollDate(at(2026, 10, 1, 18, 30), now)).toBe('il y a 3 h');
    });

    it('« hier » et l\'heure la veille, même à moins de 24 h', () => {
        expect(formatRollDate(at(2026, 9, 31, 23, 50), now)).toBe('hier 23:50');
    });

    it('jour, mois et heure au-delà', () => {
        expect(formatRollDate(at(2026, 9, 12, 21, 40), now)).toBe('12/10 21:40');
    });

    it('l\'année quand ce n\'est pas l\'année en cours', () => {
        expect(formatRollDate(at(2025, 11, 24, 9, 5), now)).toBe('24/12/2025 09:05');
    });

    it('vide pour une date illisible', () => {
        expect(formatRollDate('', now)).toBe('');
    });
});
