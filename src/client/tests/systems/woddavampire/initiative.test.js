// tests/systems/woddavampire/initiative.test.js
// Bloc initiative de Vampire (config.jsx, spec_initiative.md §12, spec_woddavampire.md §10.1) :
// ordre trié avec action retardée, Dex + Astuce + Célérité, blessure par les niveaux de santé.
import { describe, it, expect } from 'vitest';
import vdaConfig from '../../../src/systems/woddavampire/config.jsx';

const ini = vdaConfig.initiative;
const inst = (sd, state) => ({ sheet: { systemData: sd }, state });

describe('Initiative Vampire', () => {
    it('ordre trié, action retardée permise', () => {
        expect(ini).toMatchObject({ mode: 'order', delay: true });
    });

    it('PJ : Dextérité + Astuce + Célérité', () => {
        expect(ini.characterInitiative({ dexterity: 3, wits: 2, disciplines: [] })).toBe(5);
    });

    it('PNJ : Dex + Astuce ; nuée : sa valeur d\'initiative', () => {
        expect(ini.npcInitiative(inst({ attributes: { dexterity: 4, wits: 3 } }))).toBe(7);
        expect(ini.npcInitiative(inst({ nature: 'swarm', initiative: 9 }))).toBe(9);
    });

    it('blessure : part des 7 niveaux de santé marqués', () => {
        expect(ini.npcWound(inst({}, { bashing: 0, lethal: 0, aggravated: 0 }))).toBeNull();
        expect(ini.npcWound(inst({}, { bashing: 2, lethal: 0, aggravated: 0 }))).toBe('light');
        expect(ini.npcWound(inst({}, { bashing: 0, lethal: 5, aggravated: 0 }))).toBe('moderate');
        expect(ini.npcWound(inst({}, { bashing: 0, lethal: 0, aggravated: 7 }))).toBe('out');
    });
});
