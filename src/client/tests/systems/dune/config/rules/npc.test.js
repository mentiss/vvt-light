// tests/systems/dune/config/rules/npc.test.js
// PNJ de Dune (spec_pnj.md §7, livre p.328) : barème des rangs, seuil d'un test
// (valeur unique du mineur), coût en Menace des dés achetés, « Résister à la défaite ».
import { describe, it, expect } from 'vitest';
import {
    applyRankTemplate, defaultNpcData, testThreshold, threatCost, canResistDefeat, hasSpecialisation, bestSkill,
} from '../../../../../src/systems/dune/config/rules/npc.js';

describe('dune : barème des rangs de PNJ (p.328)', () => {
    it('notable par défaut : compétences 7/6/5/5/4, principes 7/6/5/5/5', () => {
        const sd = defaultNpcData();
        expect(sd.rank).toBe('notable');
        expect(sd.competences.map(c => c.rang)).toEqual([7, 6, 5, 5, 4]);
        expect(sd.principes.map(p => p.rang)).toEqual([7, 6, 5, 5, 5]);
    });
    it('mineur : compétences 6/5/5/4/4 et une valeur « Principe » de 5', () => {
        const sd = defaultNpcData('minor');
        expect(sd.competences.map(c => c.rang)).toEqual([6, 5, 5, 4, 4]);
        expect(sd.drive).toBe(5);
    });
    it('majeur : 11 points au-dessus de 4 (total 31), principes 8/7/6/5/4', () => {
        const sd = defaultNpcData('major');
        expect(sd.competences.reduce((t, c) => t + c.rang, 0)).toBe(31);
        expect(sd.principes.map(p => p.rang)).toEqual([8, 7, 6, 5, 4]);
    });
    it('appliquer un barème garde les spécialisations et les maximes', () => {
        const sd = defaultNpcData();
        sd.competences[1].specialisations = ['Lame'];
        sd.principes[0].maxime = 'Je ne quitte jamais mon poste';
        const next = applyRankTemplate(sd, 'major');
        expect(next.competences[1]).toMatchObject({ key: 'combat', rang: 7, specialisations: ['Lame'] });
        expect(next.principes[0]).toMatchObject({ key: 'devoir', rang: 8, maxime: 'Je ne quitte jamais mon poste' });
    });
});

describe('dune : test d\'un PNJ', () => {
    it('notable : compétence + principe choisis', () => {
        const sd = defaultNpcData();
        expect(testThreshold(sd, { competences: 'combat', principes: 'domination' })).toBe(6 + 6);
    });
    it('mineur : compétence + sa valeur unique, quel que soit le principe demandé', () => {
        const sd = { ...defaultNpcData('minor'), drive: 4 };
        expect(testThreshold(sd, { competences: 'analyse' })).toBe(6 + 4);
        expect(testThreshold(sd, { competences: 'analyse', principes: 'foi' })).toBe(10);
    });
    it('spécialisation : seulement si la compétence en a une non vide', () => {
        const sd = defaultNpcData();
        expect(hasSpecialisation(sd, 'combat')).toBe(false);
        sd.competences[1].specialisations = ['  '];
        expect(hasSpecialisation(sd, 'combat')).toBe(false);
        sd.competences[1].specialisations = ['Lasgun'];
        expect(hasSpecialisation(sd, 'combat')).toBe(true);
    });
    it('dés achetés en Menace : 1, puis 2, puis 3 ; 3 dés au plus', () => {
        expect([0, 1, 2, 3].map(threatCost)).toEqual([0, 1, 3, 6]);
        expect(threatCost(4)).toBe(Infinity);
    });
    it('meilleure compétence (résumé)', () => {
        expect(bestSkill(defaultNpcData())).toMatchObject({ key: 'analyse', rang: 7 });
    });
});

describe('dune : défaite d\'un PNJ (p.167-168)', () => {
    it('« Résister » : notable ou majeur, une fois par scène, pas une fois vaincu', () => {
        expect(canResistDefeat(defaultNpcData('minor'), {})).toBe(false);
        expect(canResistDefeat(defaultNpcData('notable'), { resisted: false })).toBe(true);
        expect(canResistDefeat(defaultNpcData('major'), { resisted: true })).toBe(false);
        expect(canResistDefeat(defaultNpcData('major'), { defeated: true })).toBe(false);
    });
});
