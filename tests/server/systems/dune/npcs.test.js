// tests/server/systems/dune/npcs.test.js
// PNJ chiffrés des livres de Dune versés par le schéma et la migration 10112026_npcs_dune.sql
// (spec_pnj.md §7, D-6, D-7) : nombre par source, une fiche relue contre le livre (p.283),
// valeur unique des mineurs, fiches ensuite modifiables comme les autres.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('dune : PNJ des livres dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('dune', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('75 fiches : livre de base, GM Toolkit, Agents of Dune', () => {
        expect(library).toHaveLength(75);
        const bySource = (s) => library.filter(n => n.source === s).length;
        expect([bySource('Livre de base'), bySource('GM Toolkit'), bySource('Agents of Dune')]).toEqual([50, 8, 17]);
        expect(library.filter(n => n.systemData.rank === 'major')).toHaveLength(18);
    });

    it('Garde de Maison (p.283) : compétences, spécialisations, maxime, atouts', () => {
        const guard = library.find(n => n.nom === 'Soldat / Garde de Maison');
        expect(guard).toMatchObject({ page: 283, systemData: { rank: 'notable' } });
        const comp = Object.fromEntries(guard.systemData.competences.map(c => [c.key, c.rang]));
        expect(comp).toEqual({ analyse: 4, combat: 6, discipline: 5, mobilite: 5, rhetorique: 4 });
        expect(guard.systemData.principes.find(p => p.key === 'devoir')).toMatchObject({ rang: 6 });
        expect(guard.systemData.principes.find(p => p.key === 'devoir').maxime).toMatch(/poste/);
        expect(guard.systemData.atouts.length).toBe(4);
    });

    it('mineurs : une valeur « Principe » unique', () => {
        const minors = library.filter(n => n.systemData.rank === 'minor');
        expect(minors.length).toBeGreaterThan(0);
        expect(minors.every(n => Number.isInteger(n.systemData.drive))).toBe(true);
    });

    it('une fiche versée se modifie comme les autres', async () => {
        const leto = library.find(n => n.prenom === 'Leto');
        const res = await api.request('PUT', `/${leto.id}`, { token: gmToken(), body: { npc: { gmNotes: 'Mort à l\'acte 1' } } });
        expect(res.body).toMatchObject({ prenom: 'Leto', gmNotes: 'Mort à l\'acte 1', source: 'Livre de base', page: 242 });
    });
});
