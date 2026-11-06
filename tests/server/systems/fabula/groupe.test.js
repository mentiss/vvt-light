// tests/server/systems/fabula/groupe.test.js
// Fiche de groupe (spec_fabula.md §7) : une par table, joueurs de la table et MJ
// lisent et écrivent, cadrans bornés et cachés par le MJ seul, diffusion dans la room.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../../helpers/slugApp.js';

describe('fabula : fiche de groupe', () => {
    let api, sessionId, lyra, outsider;

    beforeAll(async () => {
        api = await startSlugApp('fabula', 'groupe');
        const db = api.db;
        sessionId = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Aurore', 'TABLE1', 'table-1')").run().lastInsertRowid;
        const add = (code, nom) => db.prepare('INSERT INTO characters (access_code, access_url, player_name, nom) VALUES (?, ?, ?, ?)').run(code, code.toLowerCase(), 'joueur', nom).lastInsertRowid;
        lyra = add('LYRA01', 'Lyra');
        outsider = add('OUTSID', 'Hors table');
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, lyra);
    });
    afterAll(() => api?.close());

    it('fiche vide tant que rien n\'est écrit ; hors table : refusé', async () => {
        const res = await api.request('GET', `/${sessionId}`, { token: playerToken(lyra) });
        expect(res.body).toEqual({ sessionId, notes: '', objets: [], cadrans: [], journal: [] });
        expect((await api.request('GET', `/${sessionId}`, { token: playerToken(outsider) })).status).toBe(403);
    });

    it('notes, objet, entrée de journal : écrits par un joueur, diffusés à la table', async () => {
        await api.request('PUT', `/${sessionId}/notes`, { token: playerToken(lyra), body: { notes: 'Le passeur attend au phare.' } });
        await api.request('POST', `/${sessionId}/objets`, { token: playerToken(lyra), body: { nom: 'Fiole de brume', pi: 2, effet: 'Brouillard' } });
        const res = await api.request('POST', `/${sessionId}/journal`, { token: playerToken(lyra), body: { nom: 'Orvane', type: 'personnage', notes: 'Disparu' } });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            notes: 'Le passeur attend au phare.',
            objets: [{ nom: 'Fiole de brume', pi: 2, effet: 'Brouillard' }],
            journal: [{ nom: 'Orvane', type: 'personnage', notes: 'Disparu' }],
        });
        expect(api.emits.at(-1)).toMatchObject({ room: `fabula_session_${sessionId}`, event: 'fabula-groupe-update' });
    });

    it('cadrans : remplissage borné aux sections, sections de 2 à 12', async () => {
        const added = await api.request('POST', `/${sessionId}/cadrans`, { token: playerToken(lyra), body: { nom: 'Le culte', sections: 6 } });
        const c = added.body.cadrans[0];
        const res = await api.request('PATCH', `/${sessionId}/cadrans/${c.id}`, { token: playerToken(lyra), body: { remplies: 9 } });
        expect(res.body.cadrans[0]).toMatchObject({ sections: 6, remplies: 6, cache: false });
        const small = await api.request('PATCH', `/${sessionId}/cadrans/${c.id}`, { token: gmToken(), body: { sections: 40 } });
        expect(small.body.cadrans[0].sections).toBe(12);
    });

    it('cacher un cadran : MJ seulement', async () => {
        const [c] = (await api.request('GET', `/${sessionId}`, { token: playerToken(lyra) })).body.cadrans;
        expect((await api.request('PATCH', `/${sessionId}/cadrans/${c.id}`, { token: playerToken(lyra), body: { cache: true } })).status).toBe(403);
        expect((await api.request('POST', `/${sessionId}/cadrans`, { token: playerToken(lyra), body: { nom: 'Espions', cache: true } })).status).toBe(403);
        const res = await api.request('PATCH', `/${sessionId}/cadrans/${c.id}`, { token: gmToken(), body: { cache: true } });
        expect(res.body.cadrans[0].cache).toBe(true);
    });

    it('suppression ; élément inconnu ou d\'une autre table : 404', async () => {
        const [o] = (await api.request('GET', `/${sessionId}`, { token: gmToken() })).body.objets;
        expect((await api.request('DELETE', `/${sessionId}/objets/${o.id}`, { token: playerToken(lyra) })).body.objets).toEqual([]);
        expect((await api.request('DELETE', `/${sessionId}/objets/${o.id}`, { token: playerToken(lyra) })).status).toBe(404);
        expect((await api.request('POST', `/${sessionId}/inconnu`, { token: gmToken(), body: {} })).status).toBe(404);
    });
});
