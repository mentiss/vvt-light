// tests/systems/maledictum/config/rules/character.test.js
// Dérivés d'un personnage (livre de base p.50, 88-92, 122-124) et coûts d'XP (p.90).
import { describe, it, expect } from 'vitest';
import {
    charValue, skillValue, specValue, derived, armourByLocation, toughnessArmourBonus, encumbrance, weaponDamage,
} from '../../../../../src/systems/maledictum/config/rules/character.js';
import { BOOK_SETUP } from '../../../../../src/systems/maledictum/config/setup.js';
import { charAdvanceCost, skillAdvanceCost, skillAdvancesCost } from '../../../../../src/systems/maledictum/config/rules/xp.js';

const severine = {
    charsBase: { ws: 33, bs: 36, str: 29, tgh: 35, ag: 34, int: 38, per: 46, wil: 44, fel: 37 },
    charsAdv: { per: 2 },
    skills: { intuition: 2, reflexes: 4 },
    specs: [{ skill: 'intuition', key: 'human', label: 'Humains', adv: 1 }],
    talents: [],
};

describe('caractéristiques et compétences', () => {
    it('caractéristique = départ + Avances', () => {
        expect(charValue(severine, 'per')).toBe(48);
    });
    it('compétence = caractéristique + 5 par Avance ; spécialisation cumulée (exemple p.92)', () => {
        expect(skillValue(severine, 'intuition')).toBe(58);
        expect(specValue(severine, severine.specs[0])).toBe(63);
        const ag42 = { charsBase: { ag: 42 }, skills: { reflexes: 4 } };
        expect(specValue(ag42, { skill: 'reflexes', key: 'dodge', adv: 1 })).toBe(67);
    });
});

describe('dérivés (p.88)', () => {
    it('Blessures, Blessures critiques, Initiative, Encombrement, seuils', () => {
        expect(derived(severine)).toMatchObject({
            woundsMax: 2 + 6 + 4, criticalsMax: 3, initiative: 4 + 3, encumbranceMax: 5, corruptionThreshold: 7, warpThreshold: 4, augmeticsMax: 3,
        });
    });
    it('talents : Psyker sanctionné (Seuil ×2), Porteur, La chair est faible', () => {
        const c = { ...severine, talents: [{ key: 'sanctioned_psyker' }, { key: 'porter' }, { key: 'flesh_is_weak' }] };
        expect(derived(c)).toMatchObject({ warpThreshold: 8, encumbranceMax: 7, augmeticsMax: 6 });
    });
});

describe('inventaire', () => {
    const items = [
        { kind: 'armour', equipped: true, data: { armour: 2, locations: ['arms', 'body', 'legs'], enc: 2 } },
        { kind: 'armour', equipped: true, data: { armour: 1, locations: ['all'], enc: 1, traits: [{ key: 'subtle' }] } },
        { kind: 'armour', equipped: false, data: { armour: 5, locations: ['head'], enc: 1 } },
        { kind: 'gear', data: { enc: 1 }, quantity: 3 },
    ];
    it('armure : meilleure pièce non Discrète + pièces Discrètes, portées seulement', () => {
        expect(armourByLocation(items)).toEqual({ head: 1, left_arm: 3, right_arm: 3, body: 3, left_leg: 3, right_leg: 3 });
    });
    it('Endurance à l\'armure (règle maison §14.1) : BE − 2, jamais moins de 0, coupée par le setup', () => {
        const tgh = (v) => ({ charsBase: { tgh: v } });
        expect(toughnessArmourBonus(tgh(43), { houseRules: { toughnessArmour: true } })).toBe(2);
        expect(toughnessArmourBonus(tgh(29), { houseRules: { toughnessArmour: true } })).toBe(0);
        expect(toughnessArmourBonus(tgh(15), { houseRules: { toughnessArmour: true } })).toBe(0);
        expect(toughnessArmourBonus(tgh(43), BOOK_SETUP)).toBe(0);
    });
    it('encombrement : armures portées −1', () => {
        expect(encumbrance(items)).toBe(1 + 0 + 1 + 3);
    });
    it('dégâts : valeur fixe, + BF pour la mêlée', () => {
        expect(weaponDamage(severine, { data: { damage: 4, damageBonus: 'sb' } })).toBe(6);
        expect(weaponDamage(severine, { data: { damage: 5 } })).toBe(5);
    });
});

describe('coûts d\'XP (p.90)', () => {
    it('caractéristique selon la nouvelle valeur', () => {
        expect(charAdvanceCost(25)).toBe(20);
        expect(charAdvanceCost(41)).toBe(60);
        expect(charAdvanceCost(60)).toBe(140);
        expect(charAdvanceCost(81)).toBeNull();
    });
    it('compétence : 50 × n° de l\'Avance, 4 au plus', () => {
        expect(skillAdvanceCost(1)).toBe(50);
        expect(skillAdvanceCost(4)).toBe(200);
        expect(skillAdvanceCost(5)).toBeNull();
        expect(skillAdvancesCost(0, 4)).toBe(500);
    });
});
