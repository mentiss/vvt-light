// tests/systems/fabula/initiative.test.js
// Bloc initiative de Fabula (config.jsx, spec_initiative.md §7.7, §11) : tours d'Élite et de
// Champion, initiative du PNJ, blessure tirée des PV.
import { describe, it, expect } from 'vitest';
import fabulaConfig from '../../../src/systems/fabula/config.jsx';

const ini = fabulaConfig.initiative;
const inst = (sd, state) => ({ sheet: { systemData: sd }, state });

describe('Initiative Fabula', () => {
    it('conflit en camps, ouverture choisie au lancement, sans garder la main', () => {
        expect(ini).toMatchObject({ label: 'Conflit', mode: 'sides', opening: 'choose', enemyOrder: true });
        expect(ini.keepInitiative).toBeUndefined();
    });

    it('Soldat 1 tour, Élite 2, Champion N', () => {
        expect(ini.npcActions(inst({ rank: 'soldat' }))).toBe(1);
        expect(ini.npcActions(inst({ rank: 'elite' }))).toBe(2);
        expect(ini.npcActions(inst({ rank: 'champion', champion: 3 }))).toBe(3);
    });

    it('initiative et blessure du PNJ depuis sa fiche et ses PV', () => {
        expect(ini.npcInitiative(inst({ init: 9 }))).toBe(9);
        expect(ini.npcWound(inst({ hp: 40 }, { hp: 40 }))).toBeNull();
        expect(ini.npcWound(inst({ hp: 40 }, { hp: 18 }))).toBe('moderate');
        expect(ini.npcWound(inst({ hp: 40 }, { hp: 0 }))).toBe('out');
    });
});
