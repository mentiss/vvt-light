// tests/systems/achtung/config/npc.test.js
// PNJ d'Achtung! Cthulhu (spec_pnj.md §10.4, Gamemaster Guide p.150-152) : rangs, Stress du barème,
// test d'un Figurant, groupe de Troupes.
import { describe, it, expect } from 'vitest';
import { assistDice, countAssisted, initialNpcState, npcAttack, injuriesMax, isOut, npcTest, rankStress, stressMax } from '../../../../src/systems/achtung/config/npc.js';

const tommy = {
    rank: 'trooper', attributes: { agility: 8, brawn: 8, coordination: 9, insight: 7, reason: 7, will: 9 },
    skills: [{ key: 'fighting', rank: 2, focuses: ['Fusils'] }, { key: 'resilience', rank: 3, focuses: [] }],
};

describe('Rangs', () => {
    it('Troupe : Stress = moitié du plus haut de Force + Résilience ou Volonté + Résilience ; vaincue à la 1re blessure', () => {
        expect(rankStress(tommy)).toBe(6);
        expect(stressMax({ ...tommy, stress: 5 })).toBe(5);   // la fiche prime
        expect(injuriesMax(tommy)).toBe(1);
        expect(rankStress({ ...tommy, rank: 'lieutenant' })).toBe(12);
        expect(injuriesMax({ rank: 'nemesis' })).toBe(3);
    });
});

describe('Tests', () => {
    it('cible = attribut + compétence, rang de la compétence pour le focus', () => {
        expect(npcTest(tommy, 'coordination', 'fighting')).toEqual({ target: 11, skill: 2, focus: true });
    });
    it('Figurant : la qualité donne la cible et le focus', () => {
        expect(npcTest({ rank: 'incidental', quality: 'talented' })).toEqual({ target: 13, skill: 3, focus: true });
    });
});

describe('Attaque d\'un PNJ (spec §3.9)', () => {
    it('à distance : Coordination + Combat, focus, dégâts et salve de l\'arme', () => {
        const r = npcAttack(tommy, { name: 'Fusil Lee-Enfield', focus: 'Fusils', range: 'long', damage: 6, salvo: 'Vicieux', qualities: 'Fiable' }, null);
        expect(r).toMatchObject({ attribute: 'coordination', target: 11, skill: 2, focus: true, dice: 2, assist: 0 });
        expect(r.damage).toEqual({ dice: 6, salvo: 'vicious', innate: [], groupBonus: 0 });
    });
    it('au contact : Force ; groupe de 3 : 2 dés d\'assistance, +2 dégâts', () => {
        const r = npcAttack(tommy, { name: 'Baïonnette', range: 'contact', damage: 3, qualities: 'Vicieux' }, { alive: 3, count: 3 });
        expect(r).toMatchObject({ attribute: 'brawn', target: 10, assist: 2 });
        expect(r.damage).toEqual({ dice: 3, salvo: null, innate: [{ key: 'vicious' }], groupBonus: 2 });
    });
});

describe('Groupe de Troupes (p.150)', () => {
    it('cinq au plus ; 1d20 d\'assistance par autre membre ; vaincu sans membre', () => {
        const state = initialNpcState(tommy, { quantity: 8 });
        expect(state).toMatchObject({ count: 5, alive: 5 });
        expect(assistDice(state)).toBe(4);
        expect(isOut(tommy, { ...state, alive: 0 })).toBe(true);
        expect(initialNpcState({ rank: 'nemesis' }, { quantity: 3 })).toEqual({ stress: 0, injuries: 0 });
    });
    it('une Troupe seule est une fiche simple, vaincue à sa première blessure', () => {
        const state = initialNpcState(tommy, { quantity: 1 });
        expect(state).toEqual({ stress: 0, injuries: 0 });
        expect(isOut(tommy, { ...state, injuries: 1 })).toBe(true);
    });
    it('assistance comptée seulement si le chef réussit (cible 11)', () => {
        expect(countAssisted([15, 16, 5], 2, 11).successes).toBe(0);
        expect(countAssisted([10, 16, 5], 2, 11).successes).toBe(2);
        expect(countAssisted([15, 16, 20], 2, 11).complications).toBe(1);
    });
});
