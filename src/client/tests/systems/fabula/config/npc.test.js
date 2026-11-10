// tests/systems/fabula/config/npc.test.js
// PNJ de Fabula Ultima (spec_pnj.md §10.5, §10.7 ; livre p.295) : tours selon le rang, Crise,
// états qui baissent le dé d'un attribut, Points Ultima d'un Méchant.
import { describe, it, expect } from 'vitest';
import { crisisOf, initialNpcState, inCrisis, isOut, npcDie, turnsPerRound } from '../../../../src/systems/fabula/config/npc.js';

const wolf = { rank: 'soldat', attributes: { dex: 10, int: 6, pui: 8, vol: 6 }, hp: 45, crisis: 22, mp: 40 };

describe('Rang', () => {
    it('Soldat 1 tour, Élite 2 tours, Champion (N) N tours', () => {
        expect(turnsPerRound(wolf)).toBe(1);
        expect(turnsPerRound({ rank: 'elite' })).toBe(2);
        expect(turnsPerRound({ rank: 'champion', champion: 3 })).toBe(3);
    });
});

describe('À la table', () => {
    it('Crise au seuil imprimé (sinon la moitié des PV), vaincu à 0 PV', () => {
        expect(crisisOf(wolf)).toBe(22);
        expect(crisisOf({ hp: 45 })).toBe(22);
        expect(inCrisis(wolf, { hp: 22 })).toBe(true);
        expect(inCrisis(wolf, { hp: 23 })).toBe(false);
        expect(isOut({ hp: 0 })).toBe(true);
        expect(crisisOf({ hp: 100, crisis: null })).toBe(50);
    });
    it('états : un cran de moins par état lié, cumulés, d6 au minimum', () => {
        expect(npcDie(wolf, { statuses: ['ralenti'] }, 'dex')).toBe(8);
        expect(npcDie(wolf, { statuses: ['ralenti', 'enrage'] }, 'dex')).toBe(6);
        expect(npcDie(wolf, { statuses: ['etourdi'] }, 'int')).toBe(6);
    });
    it('Méchant : Points Ultima selon son rang de Méchant', () => {
        expect(initialNpcState({ ...wolf, villain: 'majeur' })).toEqual({ hp: 45, mp: 40, statuses: [], ultima: 10 });
        expect(initialNpcState(wolf)).toEqual({ hp: 45, mp: 40, statuses: [] });
    });
});
