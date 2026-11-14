// src/client/tests/systems/vikings/config/traitBonuses.test.js
// Bonus de traits sur un jet (systems/vikings/config/traitBonuses.js).
// Cas : Pion de Loki (spec_vikings.md §3.5), Charisme -1 succès auto sur le jet pur, sauf pour mentir.

import { describe, it, expect } from 'vitest';
import getTraitBonuses from '@/systems/vikings/config/traitBonuses.js';

const pion = { traits: [{ name: 'Pion de Loki' }] };

describe('getTraitBonuses : Pion de Loki', () => {
    it('Charisme pur : -1 succès auto, +1 proposé quand on ment', () => {
        const b = getTraitBonuses(pion, 'charisme', null);
        expect(b.auto).toBe(-1);
        expect(b.conditional).toEqual([{ name: 'Pion de Loki', bonus: 1, condition: 'Vous mentez' }]);
    });

    it('compétence appuyée sur le Charisme : aucun effet', () => {
        const b = getTraitBonuses(pion, 'charisme', 'Éloquence');
        expect(b.auto).toBe(0);
        expect(b.conditional).toEqual([]);
    });

    it('Chance pure : aucun bonus propre au trait', () => {
        expect(getTraitBonuses(pion, 'chance', null).auto).toBe(0);
    });
});
