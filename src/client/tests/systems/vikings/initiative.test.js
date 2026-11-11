// tests/systems/vikings/initiative.test.js
// Bloc initiative de Vikings (config.jsx, spec_initiative.md §12, Q-36) : ordre trié (valeur
// saisie par le MJ), blessure tirée des Blessures du PNJ.
import { describe, it, expect } from 'vitest';
import vikingsConfig from '../../../src/systems/vikings/config.jsx';

const ini = vikingsConfig.initiative;
const inst = (sd, state) => ({ sheet: { systemData: sd }, state });

describe('Initiative Vikings', () => {
    it('ordre trié, sans valeur fournie (2d10 + Agilité lancés à la table)', () => {
        expect(ini.mode).toBe('order');
        expect(ini.characterInitiative).toBeUndefined();
        expect(ini.npcActions).toBeUndefined();
    });

    it('blessure : part du maximum, hors de combat au maximum', () => {
        expect(ini.npcWound(inst({ blessureMax: 6 }, { blessure: 0 }))).toBeNull();
        expect(ini.npcWound(inst({ blessureMax: 6 }, { blessure: 3 }))).toBe('moderate');
        expect(ini.npcWound(inst({ blessureMax: 6 }, { blessure: 6 }))).toBe('out');
    });
});
