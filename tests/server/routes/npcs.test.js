// tests/server/routes/npcs.test.js
// PNJ de la plateforme (documentations/spec_pnj.md §6.2, §6.3) : bibliothèque et
// PNJ à la table, réservés au MJ (lecture comprise) ; copie de la fiche à l'ajout,
// numérotation des noms, champs absents gardés, cascade à la suppression de la table.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../helpers/slugApp.js';

const npc = (over = {}) => ({ nom: 'Garde Harkonnen', role: 'Soldat', tags: ['Harkonnen'], systemData: { rank: 'minor' }, ...over });
const ICON = { icon: 'delapouite/guards', color: '#b3412f' };

describe('npcs : bibliothèque', () => {
    let api, charId;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'npcs', { shared: true });
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('PNJ001', 'pnj-001', 'joueur', 'Paul')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('réservée au MJ, lecture comprise', async () => {
        expect((await api.request('GET', '/')).status).toBe(401);
        expect((await api.request('GET', '/', { token: playerToken(charId) })).status).toBe(403);
        expect((await api.request('POST', '/', { token: playerToken(charId), body: { npc: npc() } })).status).toBe(403);
        expect((await api.request('GET', '/sessions/1', { token: playerToken(charId) })).status).toBe(403);
    });

    it('création, lecture triée par nom, modification partielle, suppression', async () => {
        const created = await api.request('POST', '/', { token: gmToken(), body: { npc: npc({ prenom: '  ', icon: ICON, tags: ['Harkonnen', ' Harkonnen ', ''] }) } });
        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ nom: 'Garde Harkonnen', prenom: '', icon: ICON, tags: ['Harkonnen'], systemData: { rank: 'minor' } });

        await api.request('POST', '/', { token: gmToken(), body: { npc: npc({ prenom: 'Vorian', nom: 'Ekkad' }) } });
        const list = await api.request('GET', '/', { token: gmToken() });
        expect(list.body.map(n => n.nom)).toEqual(['Ekkad', 'Garde Harkonnen']);

        // Envoi partiel : les champs absents gardent leur valeur
        const updated = await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { npc: { role: 'Sergent' } } });
        expect(updated.status).toBe(200);
        expect(updated.body).toMatchObject({ nom: 'Garde Harkonnen', role: 'Sergent', icon: ICON, systemData: { rank: 'minor' } });

        // Un texte vidé s'enregistre vide (B-COALESCE), sans toucher au reste
        const cleared = await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { npc: { role: '' } } });
        expect(cleared.body).toMatchObject({ role: '', nom: 'Garde Harkonnen', icon: ICON });
        // Un texte reçu à null garde sa valeur ; l'icône, elle, se retire par null
        const kept = await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { npc: { role: null, tags: ['Harkonnen'], description: 'Garde du palais' } } });
        const nulled = await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { npc: { description: null, icon: null } } });
        expect(kept.body.description).toBe('Garde du palais');
        expect(nulled.body).toMatchObject({ description: 'Garde du palais', icon: null, role: '' });

        expect((await api.request('DELETE', `/${created.body.id}`, { token: gmToken() })).status).toBe(200);
        expect((await api.request('DELETE', `/${created.body.id}`, { token: gmToken() })).status).toBe(404);
        expect((await api.request('PUT', `/${created.body.id}`, { token: gmToken(), body: { npc: npc() } })).status).toBe(404);
    });

    it('fiche invalide : 400', async () => {
        const bad = [undefined, npc({ nom: '  ' }), npc({ tags: 'Harkonnen' }), npc({ systemData: [] }),
            npc({ icon: { icon: '../x', color: '#000000' } }), npc({ icon: { icon: 'lorc/hound', color: 'red' } }),
            npc({ avatar: 'https://exemple.fr/image.png' }), npc({ page: 'douze' })];
        for (const body of bad) {
            expect((await api.request('POST', '/', { token: gmToken(), body: { npc: body } })).status).toBe(400);
        }
    });
});

describe('npcs : PNJ à la table', () => {
    let api, sessionId, npcId;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'npcs', { shared: true });
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Arrakeen', 'TABPNJ', 'tab-pnj')").run().lastInsertRowid;
        npcId = (await api.request('POST', '/', { token: gmToken(), body: { npc: npc({ gmNotes: 'Corrompu' }) } })).body.id;
    });
    afterAll(() => api?.close());

    it('ajout en plusieurs exemplaires : copies numérotées, état initial du slug', async () => {
        const res = await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId, quantity: 3, state: { defeated: false } } });
        expect(res.status).toBe(201);
        expect(res.body.map(n => n.name)).toEqual(['Garde Harkonnen', 'Garde Harkonnen 2', 'Garde Harkonnen 3']);
        expect(res.body[0]).toMatchObject({ npcId, state: { defeated: false }, sheet: { nom: 'Garde Harkonnen', gmNotes: 'Corrompu' } });

        // Un nom libéré est repris avant d'aller plus loin
        await api.request('DELETE', `/sessions/${sessionId}/${res.body[1].id}`, { token: gmToken() });
        const again = await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId } });
        expect(again.body.map(n => n.name)).toEqual(['Garde Harkonnen 2']);

        const list = await api.request('GET', `/sessions/${sessionId}`, { token: gmToken() });
        expect(list.body.map(n => n.name)).toEqual(['Garde Harkonnen', 'Garde Harkonnen 3', 'Garde Harkonnen 2']);
    });

    it('la copie ne suit pas la bibliothèque (modifiée puis supprimée)', async () => {
        await api.request('PUT', `/${npcId}`, { token: gmToken(), body: { npc: { role: 'Capitaine' } } });
        await api.request('DELETE', `/${npcId}`, { token: gmToken() });
        const list = await api.request('GET', `/sessions/${sessionId}`, { token: gmToken() });
        expect(list.body.length).toBe(3);
        expect(list.body.every(n => n.sheet.role === 'Soldat' && n.npcId === null)).toBe(true);
    });

    it('modification : nom, copie de la fiche, état, notes ; champs absents gardés', async () => {
        const [first] = (await api.request('GET', `/sessions/${sessionId}`, { token: gmToken() })).body;
        const res = await api.request('PATCH', `/sessions/${sessionId}/${first.id}`, { token: gmToken(), body: { name: ' Sergent Kel ', state: { defeated: true } } });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ name: 'Sergent Kel', state: { defeated: true }, sheet: { role: 'Soldat' } });

        const sheet = { ...res.body.sheet, role: 'Sergent', systemData: { rank: 'notable' } };
        const res2 = await api.request('PATCH', `/sessions/${sessionId}/${first.id}`, { token: gmToken(), body: { sheet, notes: 'Blessé au bras' } });
        expect(res2.body).toMatchObject({ name: 'Sergent Kel', notes: 'Blessé au bras', state: { defeated: true }, sheet: { role: 'Sergent', systemData: { rank: 'notable' } } });
        // Notes reçues à null : gardées ; vidées : enregistrées vides (B-COALESCE)
        expect((await api.request('PATCH', `/sessions/${sessionId}/${first.id}`, { token: gmToken(), body: { notes: null } })).body.notes).toBe('Blessé au bras');
        expect((await api.request('PATCH', `/sessions/${sessionId}/${first.id}`, { token: gmToken(), body: { notes: '' } })).body.notes).toBe('');

        for (const body of [{ name: '' }, { state: [] }, { sheet: { nom: '' } }, { sortOrder: 1.5 }]) {
            expect((await api.request('PATCH', `/sessions/${sessionId}/${first.id}`, { token: gmToken(), body })).status).toBe(400);
        }
    });

    it('table ou PNJ inconnu : 404 ; quantité hors bornes : 400', async () => {
        const otherNpc = (await api.request('POST', '/', { token: gmToken(), body: { npc: npc({ nom: 'Loup' }) } })).body.id;
        expect((await api.request('GET', '/sessions/999', { token: gmToken() })).status).toBe(404);
        expect((await api.request('POST', '/sessions/999', { token: gmToken(), body: { npcId: otherNpc } })).status).toBe(404);
        expect((await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId: 999 } })).status).toBe(404);
        expect((await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId: otherNpc, quantity: 0 } })).status).toBe(400);
        expect((await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId: otherNpc, quantity: 21 } })).status).toBe(400);
        expect((await api.request('PATCH', `/sessions/999/1`, { token: gmToken(), body: { name: 'X' } })).status).toBe(404);
    });

    it('vider la table, et cascade à la suppression de la table', async () => {
        const res = await api.request('DELETE', `/sessions/${sessionId}`, { token: gmToken() });
        expect(res.body.removed).toBe(3);
        expect((await api.request('GET', `/sessions/${sessionId}`, { token: gmToken() })).body).toEqual([]);

        const otherNpc = (await api.request('POST', '/', { token: gmToken(), body: { npc: npc({ nom: 'Chien-loup' }) } })).body.id;
        await api.request('POST', `/sessions/${sessionId}`, { token: gmToken(), body: { npcId: otherNpc, quantity: 2 } });
        api.db.prepare('DELETE FROM game_sessions WHERE id = ?').run(sessionId);
        expect(api.db.prepare('SELECT COUNT(*) AS n FROM session_npcs WHERE session_id = ?').get(sessionId).n).toBe(0);
    });
});
