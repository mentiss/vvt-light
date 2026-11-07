// tests/server/systems/cyberpunk/moveConsole.test.js
// Console de manœuvres personnalisable (spec_cyberpunk.md §4, Q-12) : liste
// ordonnée d'ids sur la fiche ; null tant que le joueur n'a rien posé (réglage de
// base) ; un envoi sans le champ ne l'écrase pas.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('cyberpunk : console de manœuvres', () => {
    let api, id;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk');
        id = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('CONS01', 'cons-01', 'joueur', 'Ines')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('null par défaut (manœuvres de base)', async () => {
        const res = await api.request('GET', `/${id}`, { token: playerToken(id) });
        expect(res.status).toBe(200);
        expect(res.body.moveConsole).toBeNull();
    });

    it('enregistre l\'ordre posé et ne garde que des ids entiers', async () => {
        const res = await api.request('PUT', `/${id}`, { token: playerToken(id), body: { moveConsole: [5, 1, '3', 'x', 2.5] } });
        expect(res.status).toBe(200);
        expect(res.body.moveConsole).toEqual([5, 1, 3]);
    });

    it('envoi partiel : la console n\'est pas écrasée', async () => {
        const res = await api.request('PUT', `/${id}`, { token: playerToken(id), body: { nom: 'Vasquez' } });
        expect(res.body.moveConsole).toEqual([5, 1, 3]);
    });

    it('console vidée : tableau vide gardé (différent du réglage de base)', async () => {
        const res = await api.request('PUT', `/${id}`, { token: playerToken(id), body: { moveConsole: [] } });
        expect(res.body.moveConsole).toEqual([]);
    });
});
