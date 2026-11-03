// tests/server/systems/woddavampire/coterie.test.js
// Coterie de la table (spec_woddavampire.md §20, §II.17.3 ; livre p. 181) :
// création, verser, plafonds (ancre, 10), retrait (un point perdu), histoire,
// droits, diffusions.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../../helpers/slugApp.js';

describe('woddavampire : coterie', () => {
    let api, sessionId, lalala, aldric, outsider;
    const gm = () => gmToken();
    const rating = (id, key) => api.db.prepare('SELECT rating FROM character_backgrounds WHERE character_id = ? AND background_key = ?').get(id, key)?.rating;
    const pool = (coterie, key) => coterie.backgrounds.find(b => b.backgroundKey === key);

    beforeAll(async () => {
        api = await startSlugApp('woddavampire', 'coterie');
        const db = api.db;
        sessionId = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Prague', 'TABLE1', 'table-1')").run().lastInsertRowid;
        const add = (code, nom) => db.prepare('INSERT INTO characters (access_code, access_url, player_name, nom) VALUES (?, ?, ?, ?)').run(code, code.toLowerCase(), 'joueur', nom).lastInsertRowid;
        lalala = add('LALALA', 'Lalala');
        aldric = add('ALDRIC', 'Aldric');
        outsider = add('OUTSID', 'Hors table');
        for (const id of [lalala, aldric]) db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, id);
        const bg = (id, key, r) => db.prepare("INSERT INTO character_backgrounds (character_id, background_key, rating, details) VALUES (?, ?, ?, '')").run(id, key, r);
        bg(lalala, 'domain', 3); bg(lalala, 'resources', 3); bg(lalala, 'status', 2);
        bg(aldric, 'domain', 2); bg(aldric, 'herd', 4);
        bg(outsider, 'domain', 2);
    });
    afterAll(() => api?.close());

    it('pas de coterie : null ; création réservée au Conteur, ancre poolable', async () => {
        expect((await api.request('GET', `/${sessionId}`, { token: playerToken(lalala) })).body).toBeNull();
        expect((await api.request('POST', `/${sessionId}`, { token: playerToken(lalala), body: { name: 'X', anchorKey: 'domain' } })).status).toBe(403);
        expect((await api.request('POST', `/${sessionId}`, { token: gm(), body: { name: 'X', anchorKey: 'status' } })).status).toBe(400);
        const res = await api.request('POST', `/${sessionId}`, { token: gm(), body: { name: 'Compagnie du Pont', anchorKey: 'domain' } });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ name: 'Compagnie du Pont', anchorKey: 'domain' });
        expect(res.body.table.map(t => t.name)).toEqual(['Lalala', 'Aldric']);
        expect(api.emits.at(-1)).toMatchObject({ room: `woddavampire_session_${sessionId}`, event: 'vda-coterie-update' });
        expect((await api.request('POST', `/${sessionId}`, { token: gm(), body: { name: 'Bis', anchorKey: 'domain' } })).status).toBe(409);
    });

    it('verser : points pris sur la fiche, fiche diffusée', async () => {
        const res = await api.request('POST', `/${sessionId}/contribute/${lalala}`, { token: playerToken(lalala), body: { backgroundKey: 'domain', points: 2 } });
        expect(res.status).toBe(200);
        expect(pool(res.body, 'domain')).toMatchObject({ total: 2, contributions: [{ characterId: lalala, points: 2 }] });
        expect(rating(lalala, 'domain')).toBe(1);
        expect(api.emits.some(e => e.event === 'character-full-update' && e.payload.characterId === lalala)).toBe(true);
    });

    it('refus : pour un autre joueur, sans les points, Historique non poolable, hors table', async () => {
        expect((await api.request('POST', `/${sessionId}/contribute/${aldric}`, { token: playerToken(lalala), body: { backgroundKey: 'domain', points: 1 } })).status).toBe(403);
        expect((await api.request('POST', `/${sessionId}/contribute/${lalala}`, { token: playerToken(lalala), body: { backgroundKey: 'resources', points: 4 } })).status).toBe(400);
        expect((await api.request('POST', `/${sessionId}/contribute/${lalala}`, { token: playerToken(lalala), body: { backgroundKey: 'status', points: 1 } })).status).toBe(400);
        expect((await api.request('POST', `/${sessionId}/contribute/${outsider}`, { token: playerToken(outsider), body: { backgroundKey: 'domain', points: 1 } })).status).toBe(403);
    });

    it('plafond : aucun pool au-dessus de l’ancre', async () => {
        // Ancre (Domaine) à 2 : Troupeau plafonné à 2
        const over = await api.request('POST', `/${sessionId}/contribute/${aldric}`, { token: playerToken(aldric), body: { backgroundKey: 'herd', points: 3 } });
        expect(over.status).toBe(400);
        expect(over.body.error).toMatch(/ancre/);
        const ok = await api.request('POST', `/${sessionId}/contribute/${aldric}`, { token: playerToken(aldric), body: { backgroundKey: 'herd', points: 2 } });
        expect(pool(ok.body, 'herd').total).toBe(2);
        expect(rating(aldric, 'herd')).toBe(2);
    });

    it('le Conteur peut verser pour un joueur (correction)', async () => {
        const res = await api.request('POST', `/${sessionId}/contribute/${aldric}`, { token: gm(), body: { backgroundKey: 'domain', points: 2 } });
        expect(pool(res.body, 'domain').total).toBe(4);
    });

    it('histoire : réservée au Conteur, ajoute un Historique, total borné de 0 à 10', async () => {
        expect((await api.request('PUT', `/${sessionId}/story`, { token: playerToken(lalala), body: { backgroundKey: 'allies', storyPoints: 1 } })).status).toBe(403);
        let res = await api.request('PUT', `/${sessionId}/story`, { token: gm(), body: { backgroundKey: 'allies', storyPoints: 2 } });
        expect(pool(res.body, 'allies')).toMatchObject({ storyPoints: 2, total: 2 });
        res = await api.request('PUT', `/${sessionId}/story`, { token: gm(), body: { backgroundKey: 'domain', storyPoints: 20 } });
        expect(pool(res.body, 'domain')).toMatchObject({ storyPoints: 6, total: 10 });
        res = await api.request('PUT', `/${sessionId}/story`, { token: gm(), body: { backgroundKey: 'domain', storyPoints: 0 } });
        expect(pool(res.body, 'domain').total).toBe(4);
    });

    it('retirer : toute la mise, un point de moins rendu à la fiche', async () => {
        const res = await api.request('POST', `/${sessionId}/withdraw/${lalala}`, { token: playerToken(lalala), body: { backgroundKey: 'domain' } });
        expect(res.status).toBe(200);
        expect(pool(res.body, 'domain').contributions.map(c => c.characterId)).toEqual([aldric]);
        expect(rating(lalala, 'domain')).toBe(2);   // 1 restant + (2 versés − 1)
        expect((await api.request('POST', `/${sessionId}/withdraw/${lalala}`, { token: playerToken(lalala), body: { backgroundKey: 'domain' } })).status).toBe(404);
    });

    it('textes et emblème : joueurs de la table et Conteur', async () => {
        expect((await api.request('PATCH', `/${sessionId}`, { token: playerToken(outsider), body: { notes: 'x' } })).status).toBe(403);   // hors table
        expect((await api.request('PATCH', `/${sessionId}`, { token: playerToken(lalala), body: { emblem: 'data:image/png;base64,AAAA' } })).body.emblem).toBe('data:image/png;base64,AAAA');   // à la table, sans mise
        const res = await api.request('PATCH', `/${sessionId}`, { token: playerToken(aldric), body: { notes: 'Dette envers Ruthven', details: { domain: 'Quartier des tanneurs' } } });
        expect(res.status).toBe(200);
        expect(res.body.notes).toBe('Dette envers Ruthven');
        expect(pool(res.body, 'domain').details).toBe('Quartier des tanneurs');
        expect((await api.request('PATCH', `/${sessionId}`, { token: gm(), body: { name: '  ' } })).status).toBe(400);
    });
});
