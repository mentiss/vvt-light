// tests/systems/maledictum/initiative.test.js
// Bloc initiative de Maledictum (config.jsx, spec_initiative.md §12) : initiative statique
// des PJ et des PNJ, blessure par les Blessures et les Blessures critiques.
import { describe, it, expect } from 'vitest';
import mlConfig from '../../../src/systems/maledictum/config.jsx';

const ini = mlConfig.initiative;
const inst = (sd, state) => ({ sheet: { systemData: sd }, state });

describe('Initiative Maledictum', () => {
    it('ordre trié, valeur fixe du PNJ reprise de sa fiche', () => {
        expect(ini.mode).toBe('order');
        expect(ini.npcInitiative(inst({ initiative: 7 }))).toBe(7);
        expect(ini.npcInitiative(inst({ initiative: null }))).toBeNull();
    });

    it('blessure : Blessures encaissées, critique grave, au-delà hors de combat', () => {
        const elite = { role: 'elite', wounds: 12 };
        expect(ini.npcWound(inst(elite, { wounds: 0, crits: 0 }))).toBeNull();
        expect(ini.npcWound(inst(elite, { wounds: 4, crits: 0 }))).toBe('light');
        expect(ini.npcWound(inst(elite, { wounds: 12, crits: 0 }))).toBe('severe');   // toutes les Blessures, aucune critique : debout
        expect(ini.npcWound(inst(elite, { wounds: 12, crits: 1 }))).toBe('severe');
        expect(ini.npcWound(inst(elite, { wounds: 12, crits: 2 }))).toBe('out');
    });
});
