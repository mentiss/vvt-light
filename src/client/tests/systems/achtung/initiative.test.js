// tests/systems/achtung/initiative.test.js
// Bloc initiative d'Achtung (config.jsx, spec_initiative.md §11) : Keep the Initiative en
// Momentum ou Threat (Q-43), blessure tirée des blessures, du Stress ou des membres d'un groupe.
import { describe, it, expect } from 'vitest';
import achtungConfig from '../../../src/systems/achtung/config.jsx';

const ini = achtungConfig.initiative;
const inst = (sd, state) => ({ sheet: { systemData: sd }, state });

describe('Initiative Achtung', () => {
    it('2 Momentum côté PJ, 2 Threat côté adversaires', async () => {
        expect(ini.keepInitiative.players.label).toBe('2 Momentum');
        const calls = [];
        const fetchWithAuth = async (url, options = {}) => {
            calls.push(options.body ? JSON.parse(options.body) : null);
            return { ok: true, json: async () => ({ momentum: 2, threat: 5 }) };
        };
        expect(await ini.keepInitiative.gm.run({ fetchWithAuth, sessionId: 1 })).toEqual({ ok: true });
        expect(calls.at(-1)).toEqual({ field: 'threat', delta: -2 });
    });

    it('blessures du rang, puis Stress, puis groupe de troupes', () => {
        const lieutenant = { rank: 'lieutenant', injuries: 2, stress: 8 };
        expect(ini.npcWound(inst(lieutenant, { stress: 0, injuries: 0 }))).toBeNull();
        expect(ini.npcWound(inst(lieutenant, { stress: 6, injuries: 0 }))).toBe('severe');
        expect(ini.npcWound(inst(lieutenant, { stress: 8, injuries: 0 }))).toBe('severe');   // Stress au maximum, aucune blessure : debout
        expect(ini.npcWound(inst(lieutenant, { stress: 0, injuries: 1 }))).toBe('moderate');
        expect(ini.npcWound(inst(lieutenant, { stress: 0, injuries: 2 }))).toBe('out');
        expect(ini.npcWound(inst({ rank: 'trooper' }, { stress: 0, injuries: 0, count: 4, alive: 3 }))).toBe('light');
        expect(ini.npcWound(inst({ rank: 'trooper' }, { stress: 0, injuries: 0, count: 4, alive: 0 }))).toBe('out');
    });
});
