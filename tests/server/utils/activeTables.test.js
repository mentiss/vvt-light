// tests/server/utils/activeTables.test.js
// Tables actives en mémoire (documentations/spec_tables.md §2, §3.1, §4.1) : une table
// est active tant qu'un poste MJ l'a ouverte ; recharger ou ouvrir un poste de plus
// ne l'arrête pas ; la sortie volontaire du dernier poste l'arrête tout de suite ;
// sa déconnexion ouvre un délai de grâce.
import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { listActiveTables, openTable, leaveTable, dropPost, expireTable } =
    require('../../../src/server/utils/activeTables.js');

describe('tables actives', () => {
    let state;
    beforeEach(() => { state = new Map(); });

    it('deux tables du même slug actives en même temps, un slug ne voit pas l\'autre', () => {
        expect(openTable(state, 'fabula', 4, 'gmA')).toBe(true);
        expect(openTable(state, 'fabula', 3, 'gmB')).toBe(true);
        openTable(state, 'dune', 3, 'gmC');
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 1 }, { id: 4, posts: 1 }]);
        expect(listActiveTables(state, 'dune')).toEqual([{ id: 3, posts: 1 }]);
        expect(listActiveTables(state, 'vikings')).toEqual([]);
    });

    it('le même poste qui réannonce sa table ne change rien', () => {
        openTable(state, 'fabula', 3, 'gmA');
        expect(openTable(state, 'fabula', 3, 'gmA')).toBe(false);
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 1 }]);
    });

    it('deux postes sur la même table : la sortie de l\'un garde la table active', () => {
        openTable(state, 'fabula', 3, 'gmA');
        openTable(state, 'fabula', 3, 'gmB');
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 2 }]);
        expect(leaveTable(state, 'fabula', 3, 'gmA')).toBe(true);
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 1 }]);
    });

    it('sortie volontaire du dernier poste : la table s\'arrête tout de suite', () => {
        openTable(state, 'fabula', 3, 'gmA');
        expect(leaveTable(state, 'fabula', 3, 'gmA')).toBe(true);
        expect(listActiveTables(state, 'fabula')).toEqual([]);
        expect(state.has('fabula')).toBe(false);
    });

    it('sortie d\'un poste qui n\'avait pas la table : sans effet', () => {
        openTable(state, 'fabula', 3, 'gmA');
        expect(leaveTable(state, 'fabula', 3, 'gmB')).toBe(false);
        expect(leaveTable(state, 'fabula', 9, 'gmA')).toBe(false);
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 1 }]);
    });

    it('déconnexion du dernier poste : la table reste active (délai de grâce), sans poste', () => {
        openTable(state, 'fabula', 3, 'gmA');
        openTable(state, 'fabula', 4, 'gmA');
        openTable(state, 'fabula', 4, 'gmB');
        expect(dropPost(state, 'gmA')).toEqual([
            { slug: 'fabula', sessionId: 3, empty: true },
            { slug: 'fabula', sessionId: 4, empty: false },
        ]);
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 0 }, { id: 4, posts: 1 }]);
    });

    it('rechargement de la page MJ : le nouveau poste reprend la table avant la fin du délai', () => {
        openTable(state, 'fabula', 3, 'gmA');
        dropPost(state, 'gmA');
        state.get('fabula').get(3).timer = setTimeout(() => {}, 60_000);
        openTable(state, 'fabula', 3, 'gmA2');
        expect(state.get('fabula').get(3).timer).toBe(null);
        expect(expireTable(state, 'fabula', 3)).toBe(false);
        expect(listActiveTables(state, 'fabula')).toEqual([{ id: 3, posts: 1 }]);
    });

    it('fin du délai sans retour d\'un poste : la table s\'arrête', () => {
        openTable(state, 'fabula', 3, 'gmA');
        dropPost(state, 'gmA');
        expect(expireTable(state, 'fabula', 3)).toBe(true);
        expect(listActiveTables(state, 'fabula')).toEqual([]);
        expect(expireTable(state, 'fabula', 3)).toBe(false);
    });
});
