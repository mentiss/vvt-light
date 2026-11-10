// tests/server/systems/nimble/npcs.test.js
// Bestiaire de Nimble versé par le schéma et la migration 10112026_npcs_nimble.sql (spec_pnj.md §8) :
// 91 monstres du GM's Guide, sbires et légendaires étiquetés pour le filtre.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('nimble : bestiaire dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('nimble', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('91 monstres : 5 sbires et 20 légendaires étiquetés', () => {
        expect(library).toHaveLength(91);
        expect(library.filter(n => n.tags.includes('Sbire'))).toHaveLength(5);
        expect(library.filter(n => n.tags.includes('Légendaire'))).toHaveLength(20);
    });

    it('sbire : famille et type en étiquettes, pas de niveau ; profil gardé', () => {
        const kobold = library.find(n => n.nom === 'Sbire kobold');
        expect(kobold.tags).toEqual(['Kobolds', 'Sbire']);
        expect(kobold.systemData).toMatchObject({ minion: true, attacks: [{ dice: '1d4', noCrit: true }] });
    });

    it('légendaire : PV par héros', () => {
        expect(library.find(n => n.nom === 'Pudge le Maladroit').systemData).toMatchObject({ hp: 28, hpPerHero: true, legendary: true });
    });
});
