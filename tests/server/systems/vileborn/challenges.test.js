// tests/server/systems/vileborn/challenges.test.js
// Défis (spec_vileborn_defis.md §II.2, §II.3) : bibliothèque et défis en cours,
// réservés au MJ ; fiches du kit versées par le schéma ; copie de la fiche au
// lancement ; envoi partiel borné ; cascade à la suppression de la table.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../../helpers/slugApp.js';

const sheet = (over = {}) => ({ name: 'Poursuite dans les toits', source: 'mj', family: 'other', track: 4, difficulty: { force: 1 }, ...over });

describe('vileborn : bibliothèque des défis', () => {
    let api, charId;

    beforeAll(async () => {
        api = await startSlugApp('vileborn', 'challenges');
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('DEFI01', 'defi-01', 'joueur', 'Lucien')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('réservée au MJ, lecture comprise', async () => {
        expect((await api.request('GET', '/', { token: playerToken(charId) })).status).toBe(403);
        expect((await api.request('POST', '/', { token: playerToken(charId), body: { sheet: sheet() } })).status).toBe(403);
        expect((await api.request('GET', '/')).status).toBe(401);
    });

    it('les deux défis du kit sont versés par le schéma', async () => {
        const res = await api.request('GET', '/', { token: gmToken() });
        expect(res.status).toBe(200);
        const igritte = res.body.find(c => c.name === 'Igritte');
        expect(igritte).toMatchObject({ source: 'kit', family: 'other', track: 5, page: 56 });
        expect(igritte.triggers).toEqual([expect.objectContaining({ box: 3 })]);
        expect(res.body.find(c => c.name === 'Revenante')).toMatchObject({ source: 'kit', family: 'fallen', track: 6 });
    });

    it('le livre (24) et l\'Apocrypha (10) sont versés, familles recopiées dans leurs fiches', async () => {
        const { body } = await api.request('GET', '/', { token: gmToken() });
        expect(body.filter(c => c.source === 'livre')).toHaveLength(24);
        expect(body.filter(c => c.source === 'apocrypha')).toHaveLength(10);
        const poltergeist = body.find(c => c.name === 'Poltergeist');
        expect(poltergeist).toMatchObject({ family: 'fallen', track: 5 });
        expect(poltergeist.complications).toHaveLength(7);
        expect(poltergeist.familyRules.length).toBeGreaterThan(0);
    });

    it('création, modification, suppression', async () => {
        const created = await api.request('POST', '/', { token: gmToken(), body: { sheet: sheet() } });
        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ name: 'Poursuite dans les toits', track: 4, source: 'mj' });

        const updated = await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { sheet: { ...created.body, name: '  Fuite  ', track: 5 } } });
        expect(updated.body).toMatchObject({ id: created.body.id, name: 'Fuite', track: 5 });

        expect((await api.request('DELETE', `/${created.body.id}`, { token: gmToken() })).status).toBe(200);
        expect((await api.request('DELETE', `/${created.body.id}`, { token: gmToken() })).status).toBe(404);
        expect((await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { sheet: sheet() } })).status).toBe(404);
    });

    it('fiche invalide : 400', async () => {
        for (const bad of [undefined, sheet({ name: '  ' }), sheet({ track: 0 }), sheet({ track: 13 }), sheet({ track: 2.5 }), sheet({ source: 'autre' })]) {
            expect((await api.request('POST', '/', { token: gmToken(), body: { sheet: bad } })).status).toBe(400);
        }
    });
});

describe('vileborn : défis en cours d\'une table', () => {
    let api, sessionId, modelId, charId;

    beforeAll(async () => {
        api = await startSlugApp('vileborn', 'session-challenges');
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Lex Umbrae', 'LEXUMB', 'lex-umbrae')").run().lastInsertRowid;
        modelId = api.db.prepare("SELECT id FROM challenges WHERE name = 'Igritte'").get().id;
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('DEFI02', 'defi-02', 'joueur', 'Selene')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('réservés au MJ', async () => {
        expect((await api.request('GET', `/?sessionId=${sessionId}`, { token: playerToken(charId) })).status).toBe(403);
        expect((await api.request('POST', '/', { token: playerToken(charId), body: { sessionId, challengeId: modelId } })).status).toBe(403);
    });

    it('lancer copie la fiche du modèle', async () => {
        const res = await api.request('POST', '/', { token: gmToken(), body: { sessionId, challengeId: modelId } });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ sessionId, challengeId: modelId, progress: 0, adjust: {}, notes: '' });
        expect(res.body.sheet).toMatchObject({ name: 'Igritte', track: 5 });
        expect(res.body.sheet.id).toBeUndefined();

        // Modifier le modèle ne touche pas le défi engagé
        api.db.prepare("UPDATE challenges SET sheet = json_set(sheet, '$.track', 9) WHERE id = ?").run(modelId);
        const list = await api.request('GET', `/?sessionId=${sessionId}`, { token: gmToken() });
        expect(list.body).toHaveLength(1);
        expect(list.body[0].sheet.track).toBe(5);
        api.db.prepare("UPDATE challenges SET sheet = json_set(sheet, '$.track', 5) WHERE id = ?").run(modelId);
    });

    it('table ou défi inconnu : 404 ; paramètres manquants : 400', async () => {
        expect((await api.request('POST', '/', { token: gmToken(), body: { sessionId: 9999, challengeId: modelId } })).status).toBe(404);
        expect((await api.request('POST', '/', { token: gmToken(), body: { sessionId, challengeId: 9999 } })).status).toBe(404);
        expect((await api.request('POST', '/', { token: gmToken(), body: { sessionId } })).status).toBe(400);
        expect((await api.request('GET', '/', { token: gmToken() })).status).toBe(400);
    });

    it('envoi partiel : un champ absent est conservé, valeurs bornées', async () => {
        const { body: active } = await api.request('POST', '/', { token: gmToken(), body: { sessionId, challengeId: modelId } });
        const patch = (body) => api.request('PATCH', `/${active.id}`, { token: gmToken(), body });

        expect((await patch({ progress: 3, notes: 'Gaspard l’a touchée' })).body).toMatchObject({ progress: 3, notes: 'Gaspard l’a touchée' });
        expect((await patch({ adjust: { force: 2, precision: 2 } })).body).toMatchObject({ progress: 3, notes: 'Gaspard l’a touchée', adjust: { force: 2, precision: 2 } });
        expect((await patch({ notes: '' })).body).toMatchObject({ progress: 3, notes: '' });

        expect((await patch({ progress: 6 })).status).toBe(400);    // piste de 5
        expect((await patch({ progress: -1 })).status).toBe(400);
        expect((await patch({ adjust: { charme: 1 } })).status).toBe(400);
        expect((await patch({ adjust: { force: 4 } })).status).toBe(400);
        expect((await api.request('PATCH', '/9999', { token: gmToken(), body: { progress: 1 } })).status).toBe(404);
    });

    it('supprimer le modèle garde le défi engagé ; supprimer la table le retire', async () => {
        const modelCopyId = api.db.prepare("INSERT INTO challenges (name, source, family, sheet) VALUES ('Poursuite dans les toits', 'mj', 'other', ?)")
            .run(JSON.stringify(sheet())).lastInsertRowid;
        const { body: active } = await api.request('POST', '/', { token: gmToken(), body: { sessionId, challengeId: modelCopyId } });
        api.db.prepare('DELETE FROM challenges WHERE id = ?').run(modelCopyId);
        const kept = (await api.request('GET', `/?sessionId=${sessionId}`, { token: gmToken() })).body.find(a => a.id === active.id);
        expect(kept).toMatchObject({ challengeId: null, sheet: { name: 'Poursuite dans les toits' } });

        expect((await api.request('DELETE', `/${active.id}`, { token: gmToken() })).status).toBe(200);
        api.db.prepare('DELETE FROM game_sessions WHERE id = ?').run(sessionId);
        expect(api.db.prepare('SELECT COUNT(*) AS n FROM session_challenges WHERE session_id = ?').get(sessionId).n).toBe(0);
    });
});
