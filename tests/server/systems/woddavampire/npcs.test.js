// tests/server/systems/woddavampire/npcs.test.js
// PNJ du Conteur versés par le schéma et la migration 10112026_npcs_woddavampire.sql (spec_pnj.md §10.3) :
// profils de l'aide de jeu (livre de base V20 Dark Ages p.396-403).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../../helpers/slugApp.js';

describe('woddavampire : PNJ de l\'aide de jeu dans la bibliothèque', () => {
    let api, library;

    beforeAll(async () => {
        api = await startSlugApp('woddavampire', 'npcs', { shared: true });
        library = (await api.request('GET', '/', { token: gmToken() })).body;
    });
    afterAll(() => api?.close());

    it('34 fiches : 22 animaux, 8 nuées, 3 démons, 1 fantôme', () => {
        expect(library).toHaveLength(34);
        const byNature = (k) => library.filter(n => n.systemData.nature === k).length;
        expect([byNature('animal'), byNature('swarm'), byNature('spirit'), byNature('ghost')]).toEqual([22, 8, 3, 1]);
    });

    it('Loup (p.396) : Attributs, santé propre, attaques', () => {
        const wolf = library.find(n => n.nom === 'Loup');
        expect(wolf.systemData.attributes).toEqual({ strength: 3, dexterity: 3, stamina: 3, perception: 3, intelligence: 2, wits: 3 });
        expect(wolf.systemData.health.map(h => h.penalty)).toEqual([0, -1, -1, -3, -5, null]);
        expect(wolf.systemData.attacks[0]).toMatchObject({ name: 'Morsure', dice: 4, type: 'lethal' });
    });

    it('L\'Homme du carrefour : esprit, Essence 20, Charmes du livre', () => {
        const demon = library.find(n => n.nom === 'L\'Homme du carrefour');
        expect(demon.systemData).toMatchObject({ nature: 'spirit', essence: 20, gnosis: 10 });
        expect(demon.systemData.charms.find(c => c.name === 'Vœu').cost).toMatch(/20 Essence/);
    });
});
