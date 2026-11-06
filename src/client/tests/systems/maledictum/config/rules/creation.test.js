// tests/systems/maledictum/config/rules/creation.test.js
// Assistant de création (livre ch. III, Inquisition Player's Guide ch. III) :
// cumul des bonus, Fonction qui remplace les Avantages (D-2), XP des tirages (D-1),
// plafonds de création, fiche envoyée ; actions de jeu de la fiche.
import { describe, it, expect } from 'vitest';
import { SKILLS } from '../../../../../src/systems/maledictum/config/skills.js';
import {
    INITIAL_CREATION, finalChars, creationAdvances, creationTalents, creationXp, creationTodo,
    buildCharacterPayload, factionForRoll, startingSolars,
} from '../../../../../src/systems/maledictum/config/rules/creation.js';
import { themeFor } from '../../../../../src/systems/maledictum/config/rules/themes.js';
import * as A from '../../../../../src/systems/maledictum/config/rules/actions.js';

const ROLLED = [33, 36, 29, 35, 34, 38, 41, 39, 37];

const complete = {
    ...INITIAL_CREATION,
    rolled: ROLLED,
    originKey: 'hive_world', originChoice: 'per',
    factionKey: 'ordo_hereticus', useDuty: true, dutyKey: 'querent',
    roleKey: 'interlocutor',
    prenom: 'Séverine', nom: 'Kael', playerName: 'Joueur',
};

describe('cumul des bonus', () => {
    it('origine (+5 fixe, +5 au choix) et Fonction (+5 +5)', () => {
        const c = finalChars(complete);
        expect(c.ag).toBe(34 + 5);        // Monde-ruche : +5 Ag
        expect(c.per).toBe(41 + 5 + 5);   // +5 au choix (Per) et Questionneur +5 Per
        expect(c.wil).toBe(39 + 5);       // Questionneur +5 FM
    });
    it('la Fonction remplace les Avantages : ses Avances, ses talents', () => {
        const { skills, specs } = creationAdvances(complete);
        expect(skills).toMatchObject({ intuition: 1, presence: 1, rapport: 2 });
        expect(specs).toMatchObject({ 'presence.interrogation': 1 });
        expect(creationTalents(complete)).toContain('ever_vigilant');
    });
    it('le Mystique devient Psyker', () => {
        expect(creationTalents({ ...complete, roleKey: 'mystic' })).toContain('psyker');
    });
});

describe('XP des tirages', () => {
    it('dans l\'ordre +50, réarrangé +25, relancé 0 ; origine +25, faction +75, rôle par le Patron +50', () => {
        expect(creationXp({ ...complete })).toBe(50);
        expect(creationXp({ ...complete, order: [1, 0, 2, 3, 4, 5, 6, 7, 8] })).toBe(25);
        expect(creationXp({ ...complete, rerolled: true })).toBe(0);
        expect(creationXp({ ...complete, originRandom: true, factionRandom: true, roleRandom: true })).toBe(200);
    });
    it('table des factions du setup : les Ordos tirables (PG p.46)', () => {
        expect(factionForRoll(60)).toBe('ordo_hereticus');
        expect(factionForRoll(90)).toBe('ordo_xenos');
    });
});

describe('À faire et fiche envoyée', () => {
    it('plafond de création : 2 Avances par compétence', () => {
        const ws = { ...complete, roleSkills: { rapport: 1 } };
        expect(creationTodo(ws).role.join(' ')).toMatch(/2 Avances au plus/);
    });
    it('fiche complète une fois le rôle rempli', () => {
        const ws = { ...complete, roleTalents: ['air_of_authority', 'briber', 'dealmaker', 'distracting'], roleSkills: { awareness: 1, discipline: 1, linguistics: 1 },
            roleSpecs: ['intuition.human', 'rapport.charm'], roleEquipment: {} };
        const todo = creationTodo(ws);
        expect(todo.role).toEqual([]);
        const role = ws.roleKey;
        expect(role).toBe('interlocutor');
        const payload = buildCharacterPayload(ws, SKILLS);
        expect(payload).toMatchObject({ prenom: 'Séverine', factionKey: 'ordo_hereticus', dutyKey: 'querent', fate: 3, fateMax: 3, xpTotal: 50, influence: { inquisition: 1 } });
        expect(payload.specs.find(s => s.key === 'interrogation')).toMatchObject({ skill: 'presence', adv: 1 });
        expect(payload.items.length).toBeGreaterThan(0);
        expect(payload.items.some(it => it.itemKey)).toBe(true);   // libellés rattachés au catalogue
    });
    it('Solars en dés (Infractionniste 5d10) : moyenne si non tirés', () => {
        expect(startingSolars({ ...complete, factionKey: 'infractionist', useDuty: false })).toBe(28);
    });
});

describe('thème du personnage (spec §8.2)', () => {
    it('Fonction Sœur novice → Sororitas ; sinon la faction ; un choix du joueur prime', () => {
        expect(themeFor({ factionKey: 'adeptus_ministorum', dutyKey: 'sister_novitiate' })).toBe('sororitas');
        expect(themeFor({ factionKey: 'adeptus_ministorum', dutyKey: 'preacher' })).toBe('ecclesiarchy');
        expect(themeFor({ factionKey: 'adeptus_mechanicus', themeKey: 'navy' })).toBe('navy');
        expect(themeFor({})).toBe('hereticus');
    });
});

describe('actions de la fiche', () => {
    const c = { charsBase: { str: 30, tgh: 40, wil: 30, per: 40, ag: 30 }, wounds: 8, criticals: [], xpTotal: 300, xpSpent: 0, fate: 3, fateMax: 3 };
    it('dégâts : armure, plafond, Blessure critique au-delà du maximum (excès)', () => {
        const r = A.takeDamage(c, { damage: 7, armour: 2 });   // max 3 + 8 + 3 = 14
        expect(r).toMatchObject({ wounds: 5, critical: false, patch: { wounds: 13 } });
        const over = A.takeDamage(c, { damage: 12, armour: 2 });
        expect(over).toMatchObject({ wounds: 10, excess: 4, critical: true, patch: { wounds: 14 } });
        expect(A.takeDamage(c, { damage: 3, armour: 0, criticalHit: true }).critical).toBe(true);
    });
    it('Destin : dépenser, brûler (le maximum baisse)', () => {
        expect(A.spendFate(c)).toEqual({ fate: 2 });
        expect(A.burnFate(c)).toEqual({ fateMax: 2, fate: 2 });
        expect(A.spendFate({ fate: 0 })).toBeNull();
    });
    it('XP : achat d\'une Avance de caractéristique et d\'un talent', () => {
        expect(A.advanceChar(c, 'str')).toEqual({ charsAdv: { str: 1 }, xpSpent: 30 });
        expect(A.addTalent(c, 'ever_vigilant')).toMatchObject({ talents: [{ key: 'ever_vigilant', count: 1 }], xpSpent: 100 });
        expect(A.advanceChar({ ...c, xpTotal: 10 }, 'str')).toBeNull();
    });
    it('États : mineur → majeur → retiré', () => {
        let x = { conditions: {} };
        x = { ...x, ...A.cycleCondition(x, 'stunned') };
        expect(x.conditions).toEqual({ stunned: 'minor' });
        x = { ...x, ...A.cycleCondition(x, 'stunned') };
        expect(x.conditions).toEqual({ stunned: 'major' });
        expect(A.cycleCondition(x, 'stunned').conditions).toEqual({});
    });
    it('Influence bornée de −5 à +5', () => {
        expect(A.setInfluence({ influence: {} }, 'inquisition', 9)).toEqual({ influence: { inquisition: 5 } });
        expect(A.setInfluence({ influence: { inquisition: 1 } }, 'inquisition', 0)).toEqual({ influence: {} });
    });
});
