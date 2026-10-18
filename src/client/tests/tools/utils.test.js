// src/client/tests/tools/utils.test.js
// Lecture des dates du serveur (spec_journal.md, J-3) : SQLite renvoie l'heure UTC sans fuseau.

import { describe, it, expect } from 'vitest';
import { parseServerDate } from '../../src/tools/utils.js';

describe('parseServerDate', () => {
    it('lit un horodatage SQLite comme une heure UTC', () => {
        expect(parseServerDate('2026-10-18 09:30:00').toISOString()).toBe('2026-10-18T09:30:00.000Z');
    });

    it('respecte un fuseau déjà présent', () => {
        expect(parseServerDate('2026-10-18T09:30:00Z').toISOString()).toBe('2026-10-18T09:30:00.000Z');
        expect(parseServerDate('2026-10-18T11:30:00+02:00').toISOString()).toBe('2026-10-18T09:30:00.000Z');
    });

    it('renvoie null pour une valeur absente ou illisible', () => {
        expect(parseServerDate(null)).toBeNull();
        expect(parseServerDate('')).toBeNull();
        expect(parseServerDate('pas une date')).toBeNull();
    });
});
