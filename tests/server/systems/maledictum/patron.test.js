// tests/server/systems/maledictum/patron.test.js
// Patron de la table (spec_maledictum.md §9.3) : une fiche par table, lue par les
// joueurs de la table et le MJ, écrite par le MJ seul ; Supériorité bornée 0-10,
// Subtilité 1-10 ; diffusion dans la room.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../../helpers/slugApp.js';

describe('maledictum : Patron de la table', () => {
    let api, sessionId, severine, outsider;

    beforeAll(async () => {
        api = await startSlugApp('maledictum', 'patron');
        const db = api.db;
        sessionId = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Cellule Horst', 'TABLE1', 'table-1')").run().lastInsertRowid;
        const add = (code, nom) => db.prepare('INSERT INTO characters (access_code, access_url, player_name, nom) VALUES (?, ?, ?, ?)').run(code, code.toLowerCase(), 'joueur', nom).lastInsertRowid;
        severine = add('SEVE01', 'Kael');
        outsider = add('OUTSID', 'Hors table');
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, severine);
    });
    afterAll(() => api?.close());

    it('fiche par défaut tant que rien n\'est écrit ; hors table : refusé', async () => {
        const res = await api.request('GET', `/${sessionId}`, { token: playerToken(severine) });
        expect(res.body).toMatchObject({ sessionId, data: {}, secret: {}, superiority: 0, superiorityEnabled: true, subtlety: 10, subtletyEnabled: true });
        expect((await api.request('GET', `/${sessionId}`, { token: playerToken(outsider) })).status).toBe(403);
    });

    it('écriture réservée au MJ, diffusée à la table', async () => {
        const body = { data: { name: 'Sylvestrine Horst', ordo: 'ordo_hereticus', boons: ['limitless_authority'] }, secret: { liabilities: ['paranoid'] } };
        expect((await api.request('PUT', `/${sessionId}`, { token: playerToken(severine), body })).status).toBe(403);
        const res = await api.request('PUT', `/${sessionId}`, { token: gmToken(), body });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(body);
        expect(api.emits.at(-1)).toMatchObject({ room: `maledictum_session_${sessionId}`, event: 'maledictum-patron-update' });
    });

    it('envoi partiel : un champ absent n\'est pas écrasé', async () => {
        const res = await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { subtlety: 6 } });
        expect(res.body).toMatchObject({ subtlety: 6, data: { name: 'Sylvestrine Horst' }, secret: { liabilities: ['paranoid'] } });
    });

    it('bornes : Supériorité 0-10, Subtilité 1-10', async () => {
        expect((await api.request('PUT', `/${sessionId}/superiority`, { token: gmToken(), body: { value: 14 } })).body.superiority).toBe(10);
        expect((await api.request('PUT', `/${sessionId}/superiority`, { token: gmToken(), body: { value: -3 } })).body.superiority).toBe(0);
        expect((await api.request('PUT', `/${sessionId}/superiority`, { token: gmToken(), body: { value: 'x' } })).status).toBe(400);
        expect((await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { subtlety: 0 } })).body.subtlety).toBe(1);
    });

    it('Supériorité désactivable par table, valeur conservée (§13.2)', async () => {
        const off = await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { superiorityEnabled: false } });
        expect(off.body).toMatchObject({ superiorityEnabled: false, subtlety: 1 });
        const on = await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { superiorityEnabled: true } });
        expect(on.body.superiorityEnabled).toBe(true);
    });

    it('table inconnue : 404', async () => {
        expect((await api.request('PUT', '/9999', { token: gmToken(), body: { superiority: 1 } })).status).toBe(404);
    });
});
