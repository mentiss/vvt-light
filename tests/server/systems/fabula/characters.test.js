// tests/server/systems/fabula/characters.test.js
// Cycle des Arcana (spec_fabula.md §3.2) : l'état « renvoi » est enregistré et
// relu, l'id de la ligne reste stable, une valeur inconnue retombe sur « lie ».
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('fabula : arcana', () => {
    let api, charId;
    const put = (body) => api.request('PUT', `/${charId}`, { token: playerToken(charId), body });

    beforeAll(async () => {
        api = await startSlugApp('fabula');
        const created = await api.request('POST', '/', {
            body: { playerName: 'Camille', nom: 'Valmont', arcana: [{ arcanumKey: 'ciel', etat: 'lie' }] },
        });
        charId = created.body.id;
    });
    afterAll(() => api?.close());

    it('Lié → Fusionné → Renvoi → Lié : chaque étape enregistrée, id stable', async () => {
        const [arc] = (await api.request('GET', `/${charId}`, { token: playerToken(charId) })).body.arcana;
        for (const etat of ['fusionne', 'renvoi', 'lie']) {
            const res = await put({ arcana: [{ ...arc, etat }] });
            expect(res.status).toBe(200);
            expect(res.body.arcana).toEqual([expect.objectContaining({ id: arc.id, arcanumKey: 'ciel', etat })]);
        }
    });

    it('Nombre porte-bonheur : 7 par défaut, nombre et usage enregistrés, usage relu en booléen', async () => {
        const before = (await api.request('GET', `/${charId}`, { token: playerToken(charId) })).body;
        expect(before).toMatchObject({ porteBonheur: 7, porteBonheurUtilise: false });
        const res = await put({ porteBonheur: 3, porteBonheurUtilise: true });
        expect(res.body).toMatchObject({ porteBonheur: 3, porteBonheurUtilise: true });
        const reset = await put({ porteBonheurUtilise: false });
        expect(reset.body).toMatchObject({ porteBonheur: 3, porteBonheurUtilise: false });
    });

    it('état inconnu : retombe sur « lie »', async () => {
        const [arc] = (await api.request('GET', `/${charId}`, { token: playerToken(charId) })).body.arcana;
        const res = await put({ arcana: [{ ...arc, etat: 'invoque' }] });
        expect(res.body.arcana[0].etat).toBe('lie');
    });
});
