// tests/server/systems/fabula/npcs.test.js
// Bestiaire du livre de base de Fabula Ultima versé par le schéma et la migration 10112026_npcs_fabula.sql
// (spec_pnj.md §10.5, F-6) : 59 profils, espèce et rang en étiquettes, une fiche relue contre le livre (p.325).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('fabula : bestiaire du livre dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('fabula', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('59 profils, un seul Méchant (Angela, Élite)', () => {
        expect(library).toHaveLength(59);
        const villains = library.filter(n => n.systemData.villain);
        expect(villains.map(n => [n.nom, n.systemData.rank])).toEqual([['Angela', 'elite']]);
        expect(villains[0].tags).toContain('Méchant');
    });

    it('Hurleur gris (p.325) : dés, PV, PM, résistances en clés de l\'app', () => {
        const wolf = library.find(n => n.nom === 'Hurleur gris');
        expect(wolf).toMatchObject({ page: 325, tags: ['Bête', 'Soldat'] });
        expect(wolf.systemData).toMatchObject({ level: 5, attributes: { dex: 10, int: 8, pui: 8, vol: 6 }, hp: 50, mp: 35 });
        expect(wolf.systemData.affinities).toEqual({ air: 'RE', glace: 'RE' });
    });
});
