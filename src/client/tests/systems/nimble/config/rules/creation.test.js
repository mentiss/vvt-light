// tests/systems/nimble/config/rules/creation.test.js
// Assistant de création (Core Rules 3.3 p.19-21) et montée de niveau (p.21).
import { describe, it, expect } from 'vitest';
import {
    INITIAL_CREATION, statsOf, suggestedAssign, backgroundAllowed, buildCharacterPayload, costInGold, isCreationComplete,
} from '../../../../../src/systems/nimble/config/rules/creation.js';
import { levelUpPlan, applyLevelUp } from '../../../../../src/systems/nimble/config/rules/levelUp.js';
import { damageMonster, levelValue, monsterState, monsterView } from '../../../../../src/systems/nimble/config/rules/encounter.js';

describe('Caractéristiques par tableau', () => {
    it('exemple du livre : le Tricheur en Min-max met +3 en DEX, +1 en INT', () => {
        const assign = suggestedAssign('cheat', 'minmax');
        expect(statsOf({ ...INITIAL_CREATION, arrayKey: 'minmax', assign })).toEqual({ str: -1, dex: 3, int: 1, wil: -1 });
    });
});

describe('Prérequis d\'historique', () => {
    it('« INT 0 ou moins à la création »', () => {
        const bg = { req: { stat: 'int', max: 0 } };
        expect(backgroundAllowed(bg, { int: 0 })).toBe(true);
        expect(backgroundAllowed(bg, { int: 1 })).toBe(false);
        expect(backgroundAllowed({}, { int: 3 })).toBe(true);
    });
});

describe('Création complète', () => {
    const ws = {
        ...INITIAL_CREATION, classKey: 'hunter', ancestryKey: 'elf', backgroundKey: 'wild_one', arrayKey: 'standard',
        assign: suggestedAssign('hunter', 'standard'), prenom: 'Dargoss', nom: 'Manfield', playerName: 'Joueur',
    };
    it('complète et payload de niveau 1 : PV de départ de la classe, paquetage porté', () => {
        expect(isCreationComplete(ws)).toBe(true);
        const p = buildCharacterPayload(ws);
        expect(p).toMatchObject({ level: 1, hpMax: 13, hpCurrent: 13, statDex: 2, statWil: 2, saves: { dex: 1, int: -1 } });
        expect(p.items.find(i => i.itemKey === 'shortbow')?.equipped).toBe(true);
        // INT −1 (tableau Standard, INT non clé) : pas de langue d'ascendance
        expect(p.languages).toEqual(['common']);
        const smart = buildCharacterPayload({ ...ws, assign: { ...ws.assign, int: ws.assign.str, str: ws.assign.int } });
        expect(smart.languages).toEqual(['common', 'elvish']);
    });
    it('coûts en po et pa', () => {
        expect(costInGold('1 000 po')).toBe(1000);
        expect(costInGold('5 pa')).toBe(0.5);
    });
});

describe('Montée de niveau', () => {
    const c = { classKey: 'hunter', level: 3, statDex: 2, statWil: 2, statStr: -1, statInt: 0, hpMax: 21, hpCurrent: 10, skillPoints: {}, choices: [] };
    it('niveau 4 : gain fixe du d8 = 4, augmentation d\'une caractéristique clé', () => {
        const plan = levelUpPlan(c);
        expect(plan.level).toBe(4);
        expect(plan.flat).toBe(4);
        expect(plan.statIncreases[0]?.stats).toEqual(['dex', 'wil']);
    });
    it('application : PV, point de compétence, caractéristique, choix', () => {
        const p = applyLevelUp(c, { hpGain: 4, skill: 'perception', stats: ['dex'], picks: [{ pool: 'toth', key: 'decoy' }] });
        expect(p).toMatchObject({ level: 4, hpMax: 25, hpCurrent: 14, statDex: 3, skillPoints: { perception: 1 } });
        expect(p.choices).toEqual([{ pool: 'toth', key: 'decoy', level: 4 }]);
    });
});

describe('Rencontre : armure des monstres et sbires (PNJ à la table, spec_pnj.md §8)', () => {
    it('armure moyenne −10, ignorée par un critique', () => {
        const m = monsterView({ hp: 40, armor: 'medium' }, null, 'Ogre');
        expect(damageMonster(m, 15).hp).toBe(35);
        expect(damageMonster(m, 15, { crit: true }).hp).toBe(25);
    });
    it('sbires : un seul groupe de la quantité ajoutée ; tout dégât en tue un', () => {
        const state = monsterState({ minion: true }, { quantity: 5 });
        expect(state).toMatchObject({ count: 5, alive: 5 });
        expect(damageMonster(monsterView({ minion: true }, state, 'Gobelins'), 1).alive).toBe(4);
    });
    it('légendaire : PV par héros de la table ; un monstre ordinaire ne fait jamais groupe', () => {
        expect(monsterState({ hp: 20, hpPerHero: true }, { heroes: 4 }).hpMax).toBe(80);
        expect(monsterState({ hp: 20 }, { quantity: 3 })).toMatchObject({ count: 1, hpMax: 20 });
    });
    it('niveaux triés : fractions avant 1, texte en dernier', () => {
        expect(['2', '1', '1/2', '1/3', 'sbire'].sort((a, b) => levelValue(a) - levelValue(b))).toEqual(['1/3', '1/2', '1', '2', 'sbire']);
    });
});
