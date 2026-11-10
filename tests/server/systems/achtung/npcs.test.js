// tests/server/systems/achtung/npcs.test.js
// PNJ du Gamemaster Guide d'Achtung! Cthulhu versés par le schéma et la migration 10112026_npcs_achtung.sql
// (spec_pnj.md §10.4) : 130 profils, rang et camp en étiquettes, une fiche relue contre le livre (p.161).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('achtung : PNJ du Gamemaster Guide dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('achtung', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('130 profils, chacun étiqueté par son rang et son camp', () => {
        expect(library).toHaveLength(130);
        expect(library.every(n => n.source === 'Gamemaster Guide' && n.tags.length === 2)).toBe(true);
        const rank = (r) => library.filter(n => n.systemData.rank === r).length;
        expect([rank('trooper'), rank('lieutenant'), rank('nemesis')]).toEqual([32, 50, 48]);
    });

    it('Fantassin britannique (p.161) : Troupe, attributs et Stress du livre', () => {
        const tommy = library.find(n => n.nom === 'Fantassin britannique');
        expect(tommy).toMatchObject({ page: 161, tags: ['Troupe', 'Alliés'], systemData: { rank: 'trooper', stress: 6 } });
        expect(tommy.systemData.attributes).toEqual({ agility: 8, brawn: 8, coordination: 9, insight: 7, reason: 7, will: 9 });
    });
});
