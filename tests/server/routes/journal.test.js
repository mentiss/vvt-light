// tests/server/routes/journal.test.js
// Journal privé (documentations/plateforme/spec_journal.md, partie III §10.1 et §11.1) :
// liste légère, entrée complète, catégorie, épingle, déplacement de table, trace des
// envois du MJ, texte brut des entrées d'avant la refonte.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken, playerToken } from '../helpers/slugApp.js';

describe('journal privé', () => {
    let api, charId, otherId, tableA;
    const IMG = '<img src="data:image/png;base64,AAAA">';

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'journal', { shared: true });
        const db = api.db;
        tableA = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Saga', 'JRNA01', 'jrn-a')").run().lastInsertRowid;
        charId = db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('JRN001', 'jrn-1', 'joueuse', 'Brynja')").run().lastInsertRowid;
        otherId = db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('JRN002', 'jrn-2', 'joueur', 'Ulf')").run().lastInsertRowid;
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(tableA, charId);
    });
    afterAll(() => api?.close());

    const asPlayer = { token: () => playerToken(charId) };

    it('création : catégorie par défaut « notes », texte brut sans balises ni images', async () => {
        const res = await api.request('POST', `/${charId}`, { token: asPlayer.token(), body: { title: 'Gué', body: `<p>Brume <b>épaisse</b></p>${IMG}` } });
        expect(res.status).toBe(201);
        expect(res.body.category).toBe('notes');
        expect(res.body.pinned).toBe(false);
        expect(res.body.bodyText).toBe('Brume épaisse');
    });

    it('liste légère : pas de corps HTML, texte brut ; entrée complète à part', async () => {
        const list = await api.request('GET', `/${charId}`, { token: asPlayer.token() });
        expect(list.status).toBe(200);
        expect(list.body[0].body).toBeUndefined();
        expect(list.body[0].bodyText).toBe('Brume épaisse');
        const one = await api.request('GET', `/${charId}/${list.body[0].id}`, { token: asPlayer.token() });
        expect(one.body.body).toContain('data:image/png');
    });

    it('?full=1&ids= : entrées complètes demandées seulement', async () => {
        const other = await api.request('POST', `/${charId}`, { token: asPlayer.token(), body: { title: 'Autre', body: '<p>x</p>' } });
        const res = await api.request('GET', `/${charId}?full=1&ids=${other.body.id}`, { token: asPlayer.token() });
        expect(res.body).toHaveLength(1);
        expect(res.body[0].body).toBe('<p>x</p>');
    });

    it('catégorie, épingle et déplacement de table ne changent pas la date de modification', async () => {
        const created = await api.request('POST', `/${charId}`, { token: asPlayer.token(), body: { title: 'Indice', sessionId: tableA } });
        const id = created.body.id;
        api.db.prepare("UPDATE character_journal SET updated_at = '2020-01-01 00:00:00' WHERE id = ?").run(id);
        const res = await api.request('PUT', `/${charId}/${id}`, { token: asPlayer.token(), body: { category: 'indices', pinned: true, sessionId: null } });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ category: 'indices', pinned: true, sessionId: null, updatedAt: '2020-01-01 00:00:00' });
        const back = await api.request('PUT', `/${charId}/${id}`, { token: asPlayer.token(), body: { sessionId: tableA } });
        expect(back.body.sessionId).toBe(tableA);
    });

    it('refus : catégorie inconnue, table inexistante, table non entière', async () => {
        const { body: { id } } = await api.request('POST', `/${charId}`, { token: asPlayer.token(), body: { title: 'x' } });
        expect((await api.request('PUT', `/${charId}/${id}`, { token: asPlayer.token(), body: { category: 'divers' } })).status).toBe(400);
        expect((await api.request('PUT', `/${charId}/${id}`, { token: asPlayer.token(), body: { sessionId: 99999 } })).status).toBe(404);
        expect((await api.request('PUT', `/${charId}/${id}`, { token: asPlayer.token(), body: { sessionId: '1' } })).status).toBe(400);
    });

    it('tables : celles du personnage pour un joueur, toutes pour le MJ', async () => {
        const mine = await api.request('GET', `/${charId}/tables`, { token: asPlayer.token() });
        expect(mine.body.map(t => t.name)).toEqual(['Saga']);
        const gm = await api.request('GET', '/-1/tables', { token: gmToken() });
        expect(gm.body.map(t => t.id)).toContain(tableA);
    });

    it('un joueur ne lit pas le journal d\'un autre', async () => {
        expect((await api.request('GET', `/${otherId}`, { token: asPlayer.token() })).status).toBe(403);
    });

    it('envoi du MJ : trace « gm_sent » dans le journal du MJ, avec les destinataires', async () => {
        const res = await api.request('POST', '/gm-send', { token: gmToken(), body: { targetCharacterIds: [charId, otherId], sessionId: tableA, title: 'Lettre', body: '<p>Ne fais pas confiance</p>' } });
        expect(res.status).toBe(201);
        const gm = await api.request('GET', '/-1?type=gm_sent', { token: gmToken() });
        expect(gm.body[0]).toMatchObject({ type: 'gm_sent', title: 'Lettre', bodyText: 'Ne fais pas confiance', isRead: true });
        expect(gm.body[0].metadata.to).toEqual(['Brynja', 'Ulf']);
    });

    it('entrée d\'avant la refonte : texte brut calculé et enregistré à la première lecture', async () => {
        const id = api.db.prepare("INSERT INTO character_journal (character_id, type, title, body) VALUES (?, 'note', 'Ancienne', '<p>Vieux <i>texte</i></p>')").run(charId).lastInsertRowid;
        const list = await api.request('GET', `/${charId}`, { token: asPlayer.token() });
        expect(list.body.find(e => e.id === id)).toMatchObject({ bodyText: 'Vieux texte', category: 'notes' });
        expect(api.db.prepare('SELECT body_text FROM character_journal WHERE id = ?').get(id).body_text).toBe('Vieux texte');
    });
});
