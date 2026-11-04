// tests/systems/dune/config/rules/creation.test.js
// Règles de l'assistant de création Dune (spec_dune.md §6.5).
import { describe, it, expect } from 'vitest';
import {
    initialCreation, freePointsLeft, canChangeBase, canChangeBonus, textUnlocked,
    creationTodo, canCreate, creationPayload, FREE_POINTS,
} from '../../../../../src/systems/dune/config/rules/creation.js';

const withState = (fn) => { const s = initialCreation(); fn(s); return s; };

describe('dune : points libres', () => {
    it('5 points au départ, décomptés sur compétences et principes', () => {
        const s = withState(s => { s.competences.combat.bonus = 2; s.principes.foi.bonus = 1; });
        expect(freePointsLeft(initialCreation())).toBe(FREE_POINTS);
        expect(freePointsLeft(s)).toBe(2);
    });
    it('plus de point possible quand tout est réparti ; un principe ne dépasse pas 8', () => {
        const s = withState(s => { s.competences.combat.bonus = 5; s.principes.foi.rang = 8; });
        expect(canChangeBonus(s, s.competences.analyse, 'competences', 1)).toBe(false);
        s.competences.combat.bonus = 0;
        expect(canChangeBonus(s, s.principes.foi, 'principes', 1)).toBe(false);
        expect(canChangeBonus(s, s.competences.analyse, 'competences', 1)).toBe(true);
    });
    it('rang de base : 1 au minimum, principe + points libres ≤ 8', () => {
        const foi = { rang: 7, bonus: 1, maxime: '' };
        expect(canChangeBase(foi, 'principes', 1)).toBe(false);
        expect(canChangeBase({ rang: 1, bonus: 0 }, 'competences', -1)).toBe(false);
        expect(canChangeBase({ rang: 12, bonus: 0 }, 'competences', 1)).toBe(true);
    });
});

describe('dune : textes et création', () => {
    it('spécialisation et maxime ouvertes au rang final 6 (points libres compris)', () => {
        expect(textUnlocked({ rang: 5, bonus: 0 })).toBe(false);
        expect(textUnlocked({ rang: 5, bonus: 1 })).toBe(true);
    });
    it('nom et joueur obligatoires ; points restants signalés sans bloquer', () => {
        const s = initialCreation();
        expect(canCreate(s)).toBe(false);
        s.identity.nom = 'ibn-Javid'; s.identity.playerName = 'Antoine';
        expect(canCreate(s)).toBe(true);
        expect(creationTodo(s)).toEqual([{ text: '5 points libres à répartir', required: false }]);
    });
    it('envoi : rangs finaux, texte ignoré tant que le rang ne l’ouvre pas', () => {
        const s = withState(s => {
            s.competences.combat = { rang: 5, bonus: 1, specialisation: ' Krys ' };
            s.competences.analyse = { rang: 4, bonus: 0, specialisation: 'Botanique' };
        });
        const body = creationPayload(s);
        expect(body.competences.find(c => c.key === 'combat')).toEqual({ key: 'combat', rang: 6, specialisation: 'Krys' });
        expect(body.competences.find(c => c.key === 'analyse')).toEqual({ key: 'analyse', rang: 4, specialisation: '' });
    });
});
