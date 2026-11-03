// tests/systems/woddavampire/config/rules/combatXp.test.js
// Combat, faiblesses appliquées, expérience (spec_woddavampire.md §6, §10, §17, §II.13).
import { describe, it, expect } from 'vitest';
import {
    buildPool, applyClanWeakness, initiativeValue, initiativeBase, attackSetup, damageSetup, soakSetup, parseDamage,
    xpCost, purchasePatch, xpAvailable,
} from '../../../../../src/systems/woddavampire/config/rules/sheetRules.js';

const char = (extra = {}) => ({
    id: 1, clanKey: 'brujah', generation: 12, roadRating: 6, bloodCurrent: 10, willpowerPermanent: 4, willpowerCurrent: 4,
    strength: 3, dexterity: 3, stamina: 2, wits: 2,
    abilities: [{ abilityKey: 'melee', rating: 2 }], disciplines: [{ disciplineKey: 'celerity', rating: 1 }],
    meritsFlaws: [], damageBashing: 0, damageLethal: 0, damageAggravated: 0, equipment: [], states: [],
    ...extra,
});

describe('Faiblesse appliquée du clan (§17)', () => {
    it('Tzimisce : ÷ 2 par jour sans terre natale, cumulatif, minimum 1', () => {
        expect(applyClanWeakness(char({ clanKey: 'tzimisce', weaknessCounter: 2 }), 9).dice).toBe(2);
        expect(applyClanWeakness(char({ clanKey: 'tzimisce', weaknessCounter: 5 }), 9).dice).toBe(1);
    });

    it('Lhiannan : −1 dé par semaine, sans descendre sous la Vigueur', () => {
        expect(applyClanWeakness(char({ clanKey: 'lhiannan', weaknessCounter: 2 }), 7).dice).toBe(5);
        expect(applyClanWeakness(char({ clanKey: 'lhiannan', weaknessCounter: 9 }), 7).dice).toBe(2);
    });

    it('Gargouilles seules au monde : ÷ 2 tant que c’est coché ; ligne « Faiblesse » dans la réserve', () => {
        const c = char({ clanKey: 'gargoyles', states: ['weakness'] });
        const pool = buildPool(c, { attrKey: 'dexterity', abilityKey: 'melee', physicalBonus: false });
        expect(pool.dice).toBe(2);
        expect(pool.lines.at(-1).label).toMatch(/Faiblesse/);
    });
});

describe('Combat (§10)', () => {
    const armored = char({ equipment: [{ kind: 'armor', equipped: true, rating: 3, penalty: 1 }] });

    it('initiative : Dex + Astuce + Célérité, moins blessures et armure', () => {
        expect(initiativeValue(char())).toBe(6);
        expect(initiativeBase(armored)).toBe(5);
    });

    it('armure : pénalité aux jets de Dextérité, pas à l’absorption', () => {
        expect(buildPool(armored, { attrKey: 'dexterity', abilityKey: 'melee', physicalBonus: false }).dice).toBe(4);
        expect(buildPool(armored, soakSetup(armored, 'lethal')).dice).toBe(2 + 3);
    });

    it('attaque : +1 diff par point de Force manquant ; dégâts For + bonus', () => {
        expect(attackSetup(char({ strength: 2 }), { name: 'Hache de bataille', ability: 'melee', minStrength: 4 }).difficulty).toBe(8);
        const dmg = damageSetup({ name: 'Hache', damage: parseDamage('For + 2 L') });
        expect(buildPool(char(), dmg).dice).toBe(5);
    });

    it('absorption de l’aggravé : Force d’âme seule (+ armure) ; feu : sans armure', () => {
        const c = char({ disciplines: [{ disciplineKey: 'fortitude', rating: 2 }], equipment: [{ kind: 'armor', equipped: true, rating: 1, penalty: 0 }] });
        expect(buildPool(c, soakSetup(c, 'aggravated')).dice).toBe(3);
        expect(buildPool(c, soakSetup(c, 'fire')).dice).toBe(2);
    });
});

describe('Expérience (§6)', () => {
    it('barème : Attribut × 4, nouvelle Capacité 3, Discipline de clan × 5, hors clan × 7, nouvelle 10', () => {
        const c = char();
        expect(xpCost(c, { kind: 'attribute', current: 3 })).toBe(12);
        expect(xpCost(c, { kind: 'ability', current: 0 })).toBe(3);
        expect(xpCost(c, { kind: 'discipline', key: 'celerity', current: 1 })).toBe(5);
        expect(xpCost(c, { kind: 'discipline', key: 'auspex', current: 2 })).toBe(14);
        expect(xpCost(c, { kind: 'discipline', key: 'auspex', current: 0 })).toBe(10);
    });

    it('Caïtifs : toutes leurs Disciplines au tarif hors clan ; nouvel Historique : 10 (choix du MJ)', () => {
        expect(xpCost(char({ clanKey: 'caitiff' }), { kind: 'discipline', key: 'potence', current: 2 })).toBe(14);
        expect(xpCost(char(), { kind: 'background', current: 0 })).toBe(10);
        expect(xpCost(char(), { kind: 'background', current: 2 })).toBe(4);
    });

    it('Route : mentor −1 par point d’écart (plancher : moitié), moment de vérité ÷ 2 ; Vrais Brujah × 2', () => {
        const c = char();
        expect(xpCost(c, { kind: 'road', current: 6 })).toBe(12);
        expect(xpCost(c, { kind: 'road', current: 6, mentorRoad: 8 })).toBe(10);
        expect(xpCost(c, { kind: 'road', current: 6, mentorRoad: 8, momentOfTruth: true })).toBe(5);
        expect(xpCost(char({ clanKey: 'true_brujah' }), { kind: 'road', current: 6 })).toBe(24);
    });

    it('achat : trait + 1, coût ajouté au dépensé ; l’XP disponible peut devenir négative', () => {
        const c = char({ xpTotal: 4, xpSpent: 0 });
        const patch = purchasePatch(c, { kind: 'attribute', key: 'strength', current: 3 });
        expect(patch).toEqual({ xpSpent: 12, strength: 4 });
        expect(xpAvailable({ ...c, ...patch })).toBe(-8);
    });

    it('Discipline à voies : la voie principale monte avec elle', () => {
        const c = char({ disciplines: [{ disciplineKey: 'thaumaturgy', rating: 2 }],
            bloodPaths: [{ disciplineKey: 'thaumaturgy', pathKey: 'creatio_ignis', rating: 2, isPrimary: true }] });
        const patch = purchasePatch(c, { kind: 'discipline', key: 'thaumaturgy', current: 2 });
        expect(patch.bloodPaths[0].rating).toBe(3);
    });
});
