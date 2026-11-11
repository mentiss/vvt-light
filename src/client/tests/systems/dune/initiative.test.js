// tests/systems/dune/initiative.test.js
// Bloc initiative de Dune (config.jsx, spec_initiative.md §11) : garder la main payé en
// Impulsion ou en Menace (Q-39), débité par la route des ressources de session (Q-43) ;
// blessure tirée de la défaite.
import { describe, it, expect } from 'vitest';
import duneConfig from '../../../src/systems/dune/config.jsx';

const ini = duneConfig.initiative;

/** fetchWithAuth simulé : réserve de départ, requêtes notées. */
function fakeFetch(resources) {
    const calls = [];
    const fetchWithAuth = async (url, options = {}) => {
        calls.push({ url, method: options.method ?? 'GET', body: options.body ? JSON.parse(options.body) : undefined });
        return { ok: true, json: async () => resources };
    };
    return { fetchWithAuth, calls };
}

describe('Initiative Dune', () => {
    it('côté PJ : 2 Impulsion ou +2 Menace ; côté adversaires : 2 Menace', () => {
        expect(ini.keepInitiative.players.map(o => o.label)).toEqual(['2 Impulsion', '+2 Menace']);
        expect(ini.keepInitiative.gm.label).toBe('2 Menace');
    });

    it('dépenser 2 Impulsion : réserve lue puis débitée par la route des ressources', async () => {
        const { fetchWithAuth, calls } = fakeFetch({ impulsions: 3, menace: 0 });
        const result = await ini.keepInitiative.players[0].run({ fetchWithAuth, sessionId: 7 });
        expect(result).toEqual({ ok: true });
        expect(calls.at(-1)).toEqual({ url: '/api/session-resources/7', method: 'PUT', body: { field: 'impulsions', delta: -2 } });
    });

    it('réserve insuffisante : refusé, rien n\'est débité', async () => {
        const { fetchWithAuth, calls } = fakeFetch({ impulsions: 1, menace: 0 });
        const result = await ini.keepInitiative.players[0].run({ fetchWithAuth, sessionId: 7 });
        expect(result.ok).toBe(false);
        expect(calls.some(c => c.method === 'PUT')).toBe(false);
    });

    it('ajouter 2 Menace ne demande pas de réserve', async () => {
        const { fetchWithAuth, calls } = fakeFetch({ impulsions: 0, menace: 0 });
        expect(await ini.keepInitiative.players[1].run({ fetchWithAuth, sessionId: 7 })).toEqual({ ok: true });
        expect(calls).toEqual([{ url: '/api/session-resources/7', method: 'PUT', body: { field: 'menace', delta: 2 } }]);
    });

    it('blessure : vaincu, ou part du seuil de défaite', () => {
        expect(ini.npcWound({ state: { defeated: true } })).toBe('out');
        expect(ini.npcWound({ state: { defeat: 3, defeatMax: 4 } })).toBe('severe');
        expect(ini.npcWound({ state: { defeat: 4, defeatMax: 4, defeated: false } })).toBe('severe');   // seuil atteint, pas vaincu
        expect(ini.npcWound({ state: { defeat: 0, defeatMax: null } })).toBeNull();
    });
});
