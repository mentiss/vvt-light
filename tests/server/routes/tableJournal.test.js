// tests/server/routes/tableJournal.test.js
// Journal partagé de la table (documentations/plateforme/spec_journal.md, partie III §10.2, §11.2) :
// membres de la table et MJ seulement, suppression par l'auteur ou le MJ, épingle commune,
// nouveautés par personne, diffusion dans la room de la table.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken, playerToken } from '../helpers/slugApp.js';

describe('journal partagé', () => {
    let api, table, other, brynja, ulf, outsider;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'table-journal', { shared: true });
        const db = api.db;
        const addTable = (name, code) => db.prepare('INSERT INTO game_sessions (name, access_code, access_url) VALUES (?, ?, ?)').run(name, code, code.toLowerCase()).lastInsertRowid;
        const addChar = (name, code) => db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES (?, ?, 'joueur', ?)").run(code, code.toLowerCase(), name).lastInsertRowid;
        table = addTable('Saga', 'TJA001');
        other = addTable('Brumes', 'TJB001');
        brynja = addChar('Brynja', 'TJC001');
        ulf = addChar('Ulf', 'TJC002');
        outsider = addChar('Sigrid', 'TJC003');
        for (const c of [brynja, ulf]) db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(table, c);
    });
    afterAll(() => api?.close());

    const as = (id) => ({ token: id === -1 ? gmToken() : playerToken(id) });

    it('création : auteur et nom figés, diffusée dans la room de la table', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', `/${table}`, { ...as(brynja), body: { title: 'Résumé', body: '<p>Le <b>gué</b></p>' } });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ authorId: brynja, authorName: 'Brynja', editorName: 'Brynja', bodyText: 'Le gué', isNew: false });
        const sent = api.emits.slice(before);
        expect(sent.map(e => [e.room, e.event])).toEqual([[`cyberpunk_session_${table}`, 'table-journal-changed']]);
        expect(sent[0].payload.entry.body).toBeUndefined();
    });

    it('nouveautés : nouvelle pour les autres, plus après ouverture ; modifiée par un autre, de nouveau', async () => {
        const { body: entry } = await api.request('POST', `/${table}`, { ...as(brynja), body: { title: 'Rumeurs' } });
        const seenBy = async (who) => (await api.request('GET', `/${table}`, as(who))).body.find(e => e.id === entry.id).isNew;
        expect(await seenBy(ulf)).toBe(true);
        expect(await seenBy(brynja)).toBe(false);
        await api.request('POST', `/${table}/${entry.id}/seen`, as(ulf));
        expect(await seenBy(ulf)).toBe(false);
        // seen_at et updated_at à la seconde : la modification suivante doit être plus récente
        api.db.prepare("UPDATE table_journal_reads SET seen_at = '2020-01-01 00:00:00' WHERE entry_id = ?").run(entry.id);
        await api.request('PUT', `/${table}/${entry.id}/body`, { ...as(-1), body: { body: '<p>Le jarl</p>' } });
        expect(await seenBy(ulf)).toBe(true);
        expect(await seenBy(brynja)).toBe(true);
        expect(await seenBy(-1)).toBe(false);
    });

    it('épingler vaut pour toute la table et ne compte pas comme une modification', async () => {
        const { body: entry } = await api.request('POST', `/${table}`, { ...as(brynja), body: { title: 'Indices' } });
        api.db.prepare("UPDATE table_journal SET updated_at = '2020-01-01 00:00:00' WHERE id = ?").run(entry.id);
        const res = await api.request('PATCH', `/${table}/${entry.id}`, { ...as(ulf), body: { pinned: true } });
        expect(res.body).toMatchObject({ pinned: true, editorName: 'Brynja', updatedAt: '2020-01-01 00:00:00' });
        const forBrynja = (await api.request('GET', `/${table}`, as(brynja))).body.find(e => e.id === entry.id);
        expect(forBrynja.pinned).toBe(true);
    });

    it('titre : le dernier qui écrit devient le modificateur', async () => {
        const { body: entry } = await api.request('POST', `/${table}`, { ...as(brynja), body: { title: 'x' } });
        const res = await api.request('PATCH', `/${table}/${entry.id}`, { ...as(ulf), body: { title: 'Hallvard' } });
        expect(res.body).toMatchObject({ title: 'Hallvard', authorName: 'Brynja', editorName: 'Ulf' });
    });

    it('liste légère, entrée complète à part', async () => {
        const list = await api.request('GET', `/${table}`, as(ulf));
        expect(list.body.every(e => e.body === undefined)).toBe(true);
        const one = await api.request('GET', `/${table}/${list.body[0].id}`, as(ulf));
        expect(typeof one.body.body).not.toBe('undefined');
    });

    it('hors de la table : refusé ; MJ : partout ; table inconnue : 404', async () => {
        expect((await api.request('GET', `/${table}`, as(outsider))).status).toBe(403);
        expect((await api.request('POST', `/${table}`, { ...as(outsider), body: { title: 'x' } })).status).toBe(403);
        expect((await api.request('GET', `/${other}`, as(-1))).status).toBe(200);
        expect((await api.request('GET', '/99999', as(-1))).status).toBe(404);
    });

    it('une entrée d\'une autre table n\'est pas accessible par celle-ci', async () => {
        const { body: entry } = await api.request('POST', `/${other}`, { ...as(-1), body: { title: 'Secret' } });
        expect((await api.request('GET', `/${table}/${entry.id}`, as(brynja))).status).toBe(404);
    });

    it('suppression : auteur ou MJ seulement, diffusée', async () => {
        const { body: entry } = await api.request('POST', `/${table}`, { ...as(brynja), body: { title: 'À jeter' } });
        expect((await api.request('DELETE', `/${table}/${entry.id}`, as(ulf))).status).toBe(403);
        const before = api.emits.length;
        expect((await api.request('DELETE', `/${table}/${entry.id}`, as(brynja))).status).toBe(200);
        expect(api.emits.slice(before)[0]).toMatchObject({ event: 'table-journal-deleted', payload: { id: entry.id } });
        const { body: second } = await api.request('POST', `/${table}`, { ...as(ulf), body: { title: 'Du MJ' } });
        expect((await api.request('DELETE', `/${table}/${second.id}`, as(-1))).status).toBe(200);
    });

    it('refus des corps mal formés', async () => {
        const { body: entry } = await api.request('POST', `/${table}`, { ...as(brynja), body: {} });
        expect(entry.title).toBe('Nouvelle entrée');
        expect((await api.request('PUT', `/${table}/${entry.id}/body`, { ...as(brynja), body: {} })).status).toBe(400);
        expect((await api.request('PATCH', `/${table}/${entry.id}`, { ...as(brynja), body: { pinned: 'oui' } })).status).toBe(400);
    });
});
