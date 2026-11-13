// tests/systems/maledictum/config/rules/dice.test.js
// Résolution des jets d'Imperium Maledictum (livre de base p.185-191, 211-214, 161-163).
import { describe, it, expect } from 'vitest';
import {
    splitD100, reverseD100, isDouble, evaluate, resolveTest, applySlBonus, edgeTargetBonus, slBand, formatSl,
    hitLocation, resolveAttack, woundsAfterArmour, resolvePower, charsFromDice,
} from '../../../../../src/systems/maledictum/config/rules/dice.js';

describe('d100 : chiffres, inversion, doubles', () => {
    it('100 se lit « 00 »', () => {
        expect(splitD100(100)).toEqual({ tens: 0, units: 0 });
        expect(splitD100(7)).toEqual({ tens: 0, units: 7 });
    });
    it('inversion des dizaines et des unités', () => {
        expect(reverseD100(72)).toBe(27);
        expect(reverseD100(5)).toBe(50);
        expect(reverseD100(50)).toBe(5);
        expect(reverseD100(100)).toBe(100);
    });
    it('doubles : 11 … 99 et 00', () => {
        expect(isDouble(33)).toBe(true);
        expect(isDouble(100)).toBe(true);
        expect(isDouble(34)).toBe(false);
    });
});

describe('Degrés de réussite (livre p.187)', () => {
    it('exemples du livre : 72 contre 26 → +5 ; 54 contre 94 → −4', () => {
        expect(evaluate(26, 72)).toMatchObject({ success: true, sl: 5 });
        expect(evaluate(94, 54)).toMatchObject({ success: false, sl: -4 });
    });
    it('+0 et −0 : mêmes dizaines', () => {
        expect(evaluate(41, 45)).toMatchObject({ success: true, sl: 0 });
        expect(evaluate(47, 45)).toMatchObject({ success: false, sl: 0 });
    });
    it('01-05 réussit et 96-00 échoue toujours, de façon marginale quand la règle change l\'issue', () => {
        expect(evaluate(4, 2)).toMatchObject({ success: true, sl: 0, auto: 'success' });
        expect(evaluate(97, 120)).toMatchObject({ success: false, sl: 0, auto: 'failure' });
        expect(evaluate(3, 60)).toMatchObject({ success: true, sl: 6, auto: null });
    });
    it('paliers et affichage', () => {
        expect(slBand(5, true)).toBe('Réussite stupéfiante');
        expect(slBand(0, false)).toBe('Échec marginal');
        expect(slBand(-3, false)).toBe('Échec impressionnant');
        expect(formatSl(0, true)).toBe('+0');
        expect(formatSl(0, false)).toBe('−0');
    });
});

describe('Avantage et Désavantage (livre p.189)', () => {
    it('Avantage : on garde l\'inversion si elle est meilleure (72 → 27)', () => {
        const r = resolveTest(72, 61, 1);
        expect(r).toMatchObject({ used: 27, reversed: true, success: true, sl: 4 });
    });
    it('Désavantage : on doit inverser si c\'est pire (04 → 40)', () => {
        const r = resolveTest(4, 55, -1);
        expect(r).toMatchObject({ used: 40, reversed: true, success: true, sl: 1 });
    });
    it('chaque source au-delà de la première : ±10 au seuil', () => {
        expect(edgeTargetBonus(1)).toBe(0);
        expect(edgeTargetBonus(3)).toBe(20);
        expect(edgeTargetBonus(-2)).toBe(-10);
        expect(resolveTest(50, 45, 2).target).toBe(55);
    });
});

describe('DR après le jet (livre p.187)', () => {
    it('ils peuvent changer l\'issue ; un total nul garde l\'issue d\'origine', () => {
        const fail = resolveTest(75, 45, 0);   // −3
        expect(applySlBonus(fail, 3)).toMatchObject({ sl: 0, success: false });
        expect(applySlBonus(fail, 4)).toMatchObject({ sl: 1, success: true });
        expect(applySlBonus(resolveTest(25, 45, 0), -2)).toMatchObject({ sl: 0, success: true });
    });
});

describe('Attaques (livre p.211-214)', () => {
    it('localisation par le chiffre des unités', () => {
        expect(hitLocation(31)).toBe('head');
        expect(hitLocation(23)).toBe('right_arm');
        expect(hitLocation(48)).toBe('body');
        expect(hitLocation(100)).toBe('body');
    });
    it('mêlée opposée : arme + écart de DR (exemple p.211 : 3+3, +3 contre −1 → 10)', () => {
        const r = resolveAttack({ roll: 13, target: 45, damage: 6, opposedSl: -1 });
        expect(r).toMatchObject({ sl: 3, hit: true, margin: 4, damage: 10 });
    });
    it('distance : arme + DR ; raté sans dégâts', () => {
        expect(resolveAttack({ roll: 21, target: 41, damage: 5 })).toMatchObject({ hit: true, damage: 7, location: 'head' });
        expect(resolveAttack({ roll: 64, target: 41, damage: 5 })).toMatchObject({ hit: false, damage: 0 });
    });
    it('double réussi : Critique ; double raté : Maladresse', () => {
        expect(resolveAttack({ roll: 33, target: 57, damage: 7 })).toMatchObject({ critical: true, fumble: false });
        expect(resolveAttack({ roll: 66, target: 41, damage: 5 })).toMatchObject({ critical: false, fumble: true });
    });
    it('égalité de DR : la plus haute valeur l\'emporte', () => {
        expect(resolveAttack({ roll: 41, target: 45, damage: 4, opposedSl: 0, opposedSkill: 40 }).hit).toBe(true);
        expect(resolveAttack({ roll: 41, target: 45, damage: 4, opposedSl: 0, opposedSkill: 50 }).hit).toBe(false);
    });
    it('armure : au moins 1 Blessure sur une touche, sauf arme Inefficace (armure doublée)', () => {
        expect(woundsAfterArmour(8, 2)).toBe(6);
        expect(woundsAfterArmour(3, 5)).toBe(1);
        expect(woundsAfterArmour(6, 3, { ineffective: true })).toBe(0);
    });
    it('Endurance à l\'armure (règle maison §14.1) : ajoutée, pas doublée par une arme Inefficace', () => {
        expect(woundsAfterArmour(8, 2, { toughness: 2 })).toBe(4);
        expect(woundsAfterArmour(10, 3, { ineffective: true, toughness: 2 })).toBe(2);   // 3 × 2 + 2
    });
});

describe('Pouvoirs psychiques (livre p.161-163)', () => {
    it('réussite : + Indice Warp ; échec : +1 par DR négatif, au plus l\'Indice', () => {
        expect(resolvePower({ roll: 20, target: 50, warpRating: 2 }).charge).toBe(2);
        expect(resolvePower({ roll: 85, target: 50, warpRating: 1 }).charge).toBe(1);   // −3, plafonné à 1
        expect(resolvePower({ roll: 75, target: 50, warpRating: 4 }).charge).toBe(2);   // −2
    });
    it('Forcer : Avantage et +1d10 de Charge ; Maladresse en forçant : Périls', () => {
        const r = resolvePower({ roll: 82, target: 49, warpRating: 2, push: true, pushDie: 7 });
        expect(r.used).toBe(28);
        expect(r.charge).toBe(9);
        expect(resolvePower({ roll: 88, target: 40, warpRating: 2, push: true, pushDie: 3 })).toMatchObject({ fumble: true, perils: true, charge: 7 });
    });
    it('Critique : Indice réduit de BFM, minimum 1', () => {
        expect(resolvePower({ roll: 22, target: 60, warpRating: 3, wilB: 4 })).toMatchObject({ critical: true, charge: 1 });
    });
});

describe('Création : 2d10 + 20 dans l\'ordre', () => {
    it('neuf paires de d10', () => {
        const keys = ['ws', 'bs', 'str', 'tgh', 'ag', 'int', 'per', 'wil', 'fel'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 1, 10, 10, 5, 5, 2, 9];
        expect(charsFromDice(values, keys)).toEqual({ ws: 23, bs: 27, str: 31, tgh: 35, ag: 39, int: 22, per: 40, wil: 30, fel: 31 });
    });
});
