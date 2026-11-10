// tests/server/systems/maledictum/npcs.test.js
// Bestiaire d'Imperium Maledictum versé par le schéma et la migration 10112026_npcs_maledictum.sql
// (spec_pnj.md §8) : profils du livre de base, variantes complétées par leur profil de base.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('maledictum : bestiaire dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('maledictum', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('50 profils du livre de base, étiquetés par rôle et faction', () => {
        expect(library).toHaveLength(50);
        expect(library.every(n => n.source === 'Livre de base')).toBe(true);
        const sister = library.find(n => n.nom === 'Sœur du Silence');
        expect(sister).toMatchObject({ page: 320, tags: ['Meneur', 'Adeptus Astra Telepathica'], systemData: { role: 'leader' } });
    });

    it('variante : compétences et traits de son profil de base en plus des siens', () => {
        const bio = library.find(n => n.nom === 'Biomancien Primaris');
        expect(bio.systemData.skills).toMatchObject({ 'psychic_mastery.biomancy': 80, 'discipline.psychic': 70 });
        expect(bio.systemData.traits).toHaveLength(5);
        expect(bio.systemData.basedOn).toBeUndefined();
    });
});
