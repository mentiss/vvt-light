// tests/systems/nimble/initiative.test.js
// Bloc initiative de Nimble (config.jsx, spec_initiative.md Q-32, Q-44) : héros puis monstres,
// blessure tirée des PV ou des sbires debout, nombre de héros pour un monstre ajouté.
import { describe, it, expect } from 'vitest';
import nimbleConfig from '../../../src/systems/nimble/config.jsx';

const ini = nimbleConfig.initiative;

describe('Initiative Nimble', () => {
    it('camp après camp, sans alternance', () => {
        expect(ini).toMatchObject({ label: 'Combat', mode: 'sides', alternate: false });
    });

    it('blessure : PV, ou sbires encore debout', () => {
        expect(ini.npcWound({ state: { hpMax: 40, hp: 40, count: 1, alive: 1 } })).toBeNull();
        expect(ini.npcWound({ state: { hpMax: 40, hp: 8, count: 1, alive: 1 } })).toBe('severe');
        expect(ini.npcWound({ state: { hpMax: 0, hp: 0, count: 5, alive: 2 } })).toBe('moderate');
        expect(ini.npcWound({ state: { hpMax: 0, hp: 0, count: 5, alive: 0 } })).toBe('out');
    });

    it('nombre de héros tiré des PJ de la table, au moins 1', () => {
        expect(ini.npcContext([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual({ heroes: 3 });
        expect(ini.npcContext([])).toEqual({ heroes: 1 });
    });
});
