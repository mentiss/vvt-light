// tests/systems/nimble/config/rules/character.test.js
// Dérivés d'un personnage (Core Rules 3.3 p.20-23, 33) et actions de jeu (p.9, 17).
import { describe, it, expect } from 'vitest';
import {
    defenseOf, skillValue, maxWounds, maxHitDice, speedOf, resourcesOf, formulaVars, isProficient, initialSaves, featuresOf,
} from '../../../../../src/systems/nimble/config/rules/character.js';
import { takeDamage, heal, safeRest, endEncounter, setResource } from '../../../../../src/systems/nimble/config/rules/actions.js';

const hunter = {
    classKey: 'hunter', ancestryKey: 'elf', level: 3, statStr: -1, statDex: 2, statInt: 0, statWil: 2,
    skillPoints: { stealth: 2 }, hpMax: 21, hpCurrent: 21, tempHp: 0, wounds: 0, dying: false,
    items: [], resources: {}, uses: {}, choices: [], conditions: [], bonuses: {},
};

describe('Défense', () => {
    it('sans armure : DEX', () => {
        expect(defenseOf(hunter)).toBe(2);
    });
    it('armure de maille : base + DEX plafonnée à 2, bouclier en plus', () => {
        const c = { ...hunter, statDex: 4, items: [
            { kind: 'armor', equipped: true, data: { defense: 6, addDex: true, dexMax: 2 } },
            { kind: 'shield', equipped: true, data: { defense: 2 } },
        ] };
        expect(defenseOf(c)).toBe(10);
    });
    it('plaque : pas de DEX', () => {
        expect(defenseOf({ ...hunter, items: [{ kind: 'armor', equipped: true, data: { defense: 10, addDex: false } }] })).toBe(10);
    });
    it('une armure non portée ne compte pas', () => {
        expect(defenseOf({ ...hunter, items: [{ kind: 'armor', equipped: false, data: { defense: 10, addDex: false } }] })).toBe(2);
    });
});

describe('Compétences et valeurs de la bande', () => {
    it('compétence = caractéristique + points placés', () => {
        expect(skillValue(hunter, 'stealth')).toBe(4);
        expect(skillValue(hunter, 'might')).toBe(-1);
    });
    it('Humain : +1 à toutes les compétences', () => {
        expect(skillValue({ ...hunter, ancestryKey: 'human' }, 'might')).toBe(0);
    });
    it('Nain : +1 Blessure max, +2 dés de vie max, −1 Vitesse', () => {
        const dwarf = { ...hunter, ancestryKey: 'dwarf' };
        expect(maxWounds(dwarf)).toBe(7);
        expect(maxHitDice(dwarf)).toBe(5);
        expect(speedOf(dwarf)).toBe(5);
    });
    it('Elfe : +1 Vitesse', () => {
        expect(speedOf(hunter)).toBe(7);
    });
    it('CLÉ : la meilleure caractéristique clé de la classe', () => {
        expect(formulaVars(hunter).KEY).toBe(2);
    });
});

describe('Ressources de classe', () => {
    it('mana du Mage : 3×INT + NIV dès le niveau 2, dépense stockée', () => {
        const mage = { ...hunter, classKey: 'mage', statInt: 3, level: 2, resources: { mana: 4 } };
        const mana = resourcesOf(mage).find(r => r.key === 'mana');
        expect(mana.max).toBe(11);
        expect(mana.value).toBe(7);
        expect(setResource(mage, 'mana', 11).resources.mana).toBe(0);
    });
    it('mana absent au niveau 1', () => {
        expect(resourcesOf({ ...hunter, classKey: 'mage', level: 1 }).some(r => r.key === 'mana')).toBe(false);
    });
});

describe('Sauvegardes de départ', () => {
    it('celles de la classe ; Céleste : la désavantagée devient neutre', () => {
        expect(initialSaves('hunter', 'elf')).toEqual({ str: 0, dex: 1, int: -1, wil: 0 });
        expect(initialSaves('hunter', 'celestial')).toEqual({ str: 0, dex: 1, int: 0, wil: 0 });
    });
});

describe('Maîtrise', () => {
    it('Chasseur : armes de DEX, pas la hache d\'armes de FOR ; mains nues non maîtrisées', () => {
        expect(isProficient(hunter, { data: { stat: 'dex', range: 'ranged' } })).toBe(true);
        expect(isProficient(hunter, { data: { stat: 'str/dex', range: 'melee' } })).toBe(true);
        expect(isProficient(hunter, { data: { stat: 'str', range: 'melee' } })).toBe(false);
        expect(isProficient(hunter, { itemKey: 'unarmed', data: { stat: 'str' } })).toBe(false);
    });
    it('la correction d\'Édition l\'emporte', () => {
        expect(isProficient(hunter, { proficient: true, data: { stat: 'str' } })).toBe(true);
    });
});

describe('Capacités', () => {
    it('niveaux 1 à 3 de la classe, ascendance et choix', () => {
        const ids = featuresOf({ ...hunter, choices: [{ pool: 'toth', key: 'decoy', level: 2 }] }).map(f => f.id);
        expect(ids).toContain('class:hunters_mark');
        expect(ids).toContain('ancestry:elf');
        expect(ids).toContain('option:toth:decoy');
    });
});

describe('Dégâts et soins (p.9)', () => {
    it('Se défendre réduit de la Défense, les PV temporaires absorbent d\'abord', () => {
        const r = takeDamage({ ...hunter, tempHp: 3 }, { amount: 10, defend: true });
        expect(r.reduced).toBe(2);
        expect(r.patch.tempHp).toBe(0);
        expect(r.patch.hpCurrent).toBe(16);
    });
    it('un critique ignore la Défense', () => {
        expect(takeDamage(hunter, { amount: 10, defend: true, crit: true }).patch.hpCurrent).toBe(11);
    });
    it('tomber à 0 PV : 1 Blessure et mourant', () => {
        const r = takeDamage(hunter, { amount: 30 });
        expect(r.patch).toMatchObject({ hpCurrent: 0, dying: true, wounds: 1 });
    });
    it('dégâts en mourant : 2 Blessures, 3 sur un critique', () => {
        const dying = { ...hunter, hpCurrent: 0, dying: true, wounds: 1 };
        expect(takeDamage(dying, { amount: 4 }).patch.wounds).toBe(3);
        expect(takeDamage(dying, { amount: 4, crit: true }).patch.wounds).toBe(4);
    });
    it('un soin met fin à l\'état mourant, sans dépasser le maximum', () => {
        expect(heal({ ...hunter, hpCurrent: 0, dying: true }, 50)).toEqual({ hpCurrent: 21, dying: false });
    });
});

describe('Repos et rencontre (p.17)', () => {
    it('repos sûr : PV, dés de vie, ressources rendus, 1 Blessure guérie', () => {
        const p = safeRest({ ...hunter, hpCurrent: 3, wounds: 2, hitDiceSpent: 3, tempHp: 4, resources: { toth: 2 } });
        expect(p).toMatchObject({ hpCurrent: 21, wounds: 1, hitDiceSpent: 0, tempHp: 0, resources: {} });
    });
    it('fin de rencontre : seules les ressources « par rencontre » repartent', () => {
        const mage = { ...hunter, classKey: 'mage', statInt: 3, level: 2, resources: { mana: 4 } };
        expect(endEncounter(mage).resources).toEqual({ mana: 4 });
        expect(endEncounter({ ...hunter, resources: { toth: 3 } }).resources).toEqual({});
    });
});
