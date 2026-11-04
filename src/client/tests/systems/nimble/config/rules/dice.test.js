// tests/systems/nimble/config/rules/dice.test.js
// Résolution des jets de Nimble : exemples et règles du Core Rules 3.3 (p.9, 13-14, 34).
import { describe, it, expect } from 'vitest';
import { pickDice, resolveAttack, resolveD20, initiativeActions, resolveHitDice, resolveTensDie, resolveMinions } from '../../../../../src/systems/nimble/config/rules/dice.js';

describe('pickDice : retrait de gauche à droite', () => {
    it('avantage : retire le plus bas', () => {
        expect(pickDice([4, 2, 6], 1)).toEqual({ kept: [0, 2], dropped: [1] });
    });
    it('désavantage 2 (exemple du livre, grande hache 2d6) : retire les 2 plus hauts', () => {
        expect(pickDice([6, 1, 5, 3], -2)).toEqual({ kept: [1, 3], dropped: [0, 2] });
    });
    it('égalité : le plus à gauche part en premier', () => {
        expect(pickDice([3, 3, 5], 1).dropped).toEqual([0]);
        expect(pickDice([5, 2, 5], -1).dropped).toEqual([0]);
    });
});

describe('resolveAttack', () => {
    it('le dé primaire à 1 rate : aucun dégât, modificateur compris', () => {
        const r = resolveAttack({ base: [1, 6], sides: 6, bonus: 3 });
        expect(r.miss).toBe(true);
        expect(r.total).toBe(0);
    });
    it('touche : somme des dés gardés + modificateur', () => {
        expect(resolveAttack({ base: [4, 2], sides: 6, bonus: 2 }).total).toBe(8);
    });
    it('critique explosif : la chaîne entière compte, une fois par maximum', () => {
        const r = resolveAttack({ base: [8], sides: 8, chain: [8, 8, 3], bonus: 1 });
        expect(r.crit).toBe(true);
        expect(r.critCount).toBe(3);
        expect(r.total).toBe(8 + 8 + 8 + 3 + 1);
    });
    it('Féroce : un dé de plus par lancer de dégâts de critique', () => {
        const r = resolveAttack({ base: [4], sides: 4, chain: [4, 2], vicious: true, viciousPool: [3, 1, 4, 4] });
        expect(r.vicious).toEqual([3, 1]);
        expect(r.total).toBe(4 + 4 + 2 + 3 + 1);
    });
    it('sans critique : chaîne et Féroce ignorés', () => {
        const r = resolveAttack({ base: [3], sides: 6, chain: [6, 2], vicious: true, viciousPool: [5] });
        expect(r.crit).toBe(false);
        expect(r.total).toBe(3);
    });
    it('arme non maîtrisée : le maximum ne critique pas', () => {
        const r = resolveAttack({ base: [6], sides: 6, chain: [6, 1], canCrit: false });
        expect(r.crit).toBe(false);
        expect(r.total).toBe(6);
    });
    it('avantage : le dé primaire est le plus à gauche restant', () => {
        const r = resolveAttack({ base: [1, 5], sides: 6, edge: 1 });
        expect(r.primaryIndex).toBe(1);
        expect(r.miss).toBe(false);
        expect(r.total).toBe(5);
    });
    it('ouverture (Évaluer) : +1 face, un 1 ne rate plus, un max−1 critique', () => {
        expect(resolveAttack({ base: [1], sides: 6, opening: true }).miss).toBe(false);
        const r = resolveAttack({ base: [5], sides: 6, opening: true, chain: [2] });
        expect(r.crit).toBe(true);
        expect(r.total).toBe(6 + 2);
    });
    it('zone : ne rate pas', () => {
        expect(resolveAttack({ base: [1, 1], sides: 6, canMiss: false, canCrit: false }).total).toBe(2);
    });
    it('d66 : dizaines et unités, ni raté ni critique', () => {
        expect(resolveTensDie([4, 5])).toBe(45);
        const r = resolveAttack({ base: [1, 6], sides: 6, special: true });
        expect(r.total).toBe(16);
        expect(r.miss || r.crit).toBe(false);
    });
});

describe('resolveD20', () => {
    it('1 naturel échoue, 20 naturel réussit, quel que soit le DD', () => {
        expect(resolveD20([1], 0, 30, 10).success).toBe(false);
        expect(resolveD20([20], 0, -5, 40).success).toBe(true);
    });
    it('avantage garde le meilleur dé, désavantage le pire', () => {
        expect(resolveD20([7, 15], 1, 2).total).toBe(17);
        expect(resolveD20([7, 15], -1, 2).total).toBe(9);
    });
    it('sans DD : pas de verdict', () => {
        expect(resolveD20([12], 0, 1).success).toBeNull();
    });
});

describe('initiativeActions', () => {
    it('un chiffre = 1, deux chiffres = 2, 20+ = 3', () => {
        expect(initiativeActions(9)).toBe(1);
        expect(initiativeActions(-2)).toBe(1);
        expect(initiativeActions(10)).toBe(2);
        expect(initiativeActions(19)).toBe(2);
        expect(initiativeActions(20)).toBe(3);
        expect(initiativeActions(18, 20)).toBe(3);
    });
});

describe('resolveMinions (GM\'s Guide p.7)', () => {
    it('5 sbires : on additionne les dés en ignorant les 1', () => {
        expect(resolveMinions([1, 4, 6, 1, 3])).toEqual({ hits: 3, total: 13 });
    });
});

describe('resolveHitDice', () => {
    it('chaque dé + FOR ; FOR négative abaisse chaque dé (exemple : 5 avec −1 soigne 4)', () => {
        expect(resolveHitDice([5], 8, -1).total).toBe(4);
        expect(resolveHitDice([3, 6], 8, 2).total).toBe(13);
    });
    it('Monter le camp : maximum de chaque dé', () => {
        expect(resolveHitDice([1, 2], 8, 1, true).total).toBe(18);
    });
});
