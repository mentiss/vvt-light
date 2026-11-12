// tests/server/routes/sessions.test.js
// Mise à jour d'une table (PUT /sessions/:id) : un envoi partiel garde les champs
// absents (B-COALESCE), un champ vidé s'enregistre, un nom vide est refusé.
// Chaque test repart de la même table. Spec : documentations/spec_correctifs_audit.md §7.
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import { startSlugApp, gmToken, playerToken } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const { sharedState } = require('../../../src/server/socket/index.js');
const { openTable } = require('../../../src/server/utils/activeTables.js');

const INITIAL = { name: 'Table', date: '2026-11-01', notes: 'Notes de départ' };

describe('sessions : mise à jour partielle', () => {
    let api, sessionId;

    beforeAll(async () => {
        api = await startSlugApp('fabula', 'sessions', { shared: true });
        sessionId = api.db.prepare(
            "INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Table', 'SES001', 'ses-001')"
        ).run().lastInsertRowid;
    });
    beforeEach(() => {
        api.db.prepare('UPDATE game_sessions SET name = @name, date = @date, notes = @notes WHERE id = @id')
            .run({ ...INITIAL, id: sessionId });
    });
    afterAll(() => api?.close());

    const row = () => api.db.prepare('SELECT name, date, notes FROM game_sessions WHERE id = ?').get(sessionId);
    const put = (body) => api.request('PUT', `/${sessionId}`, { token: gmToken(), body });

    it('envoi du nom seul : date et notes gardées', async () => {
        expect((await put({ name: 'Table renommée' })).status).toBe(200);
        expect(row()).toEqual({ ...INITIAL, name: 'Table renommée' });
    });

    it('envoi des notes seules : nom et date gardés', async () => {
        expect((await put({ notes: 'Nouvelles notes' })).status).toBe(200);
        expect(row()).toEqual({ ...INITIAL, notes: 'Nouvelles notes' });
    });

    it('date et notes vidées : enregistrées vides', async () => {
        expect((await put({ date: '', notes: '' })).status).toBe(200);
        expect(row()).toEqual({ ...INITIAL, date: '', notes: '' });
    });

    it('nom vide : refusé, rien ne change', async () => {
        expect((await put({ name: '  ', notes: 'x' })).status).toBe(400);
        expect(row()).toEqual(INITIAL);
    });
});

// GET /sessions (spec_tables.md §6.1) : chaque table avec sa composition résumée ; MJ seulement.
describe('sessions : liste avec composition', () => {
    let api, withMembers, empty;

    beforeAll(async () => {
        api = await startSlugApp('fabula', 'sessions', { shared: true });
        withMembers = api.db.prepare(
            "INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Avec', 'LST001', 'lst-001')").run().lastInsertRowid;
        empty = api.db.prepare(
            "INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Vide', 'LST002', 'lst-002')").run().lastInsertRowid;
        const charId = api.db.prepare(
            "INSERT INTO characters (access_code, access_url, player_name) VALUES ('CHR001', 'chr-001', 'Camille')").run().lastInsertRowid;
        api.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(withMembers, charId);
    });
    afterAll(() => api?.close());

    it('MJ : chaque table porte ses personnages (id, nom, joueur, avatar)', async () => {
        const res = await api.request('GET', '/', { token: gmToken() });
        expect(res.status).toBe(200);
        const byId = Object.fromEntries(res.body.map(s => [s.id, s]));
        expect(byId[withMembers].characterCount).toBe(1);
        expect(byId[withMembers].characters).toHaveLength(1);
        expect(byId[withMembers].characters[0]).toMatchObject({ playerName: 'Camille', avatar: null });
        expect(byId[withMembers].characters[0].name).toBeTruthy();
        expect(byId[empty].characters).toEqual([]);
    });

    it('joueur : refusé', async () => {
        expect((await api.request('GET', '/', { token: playerToken(1) })).status).toBe(403);
    });
});

// GET /sessions/active (spec_tables.md §4.3) : tables actives du slug, lues par le MJ
// et les joueurs ; déclarée avant GET /:id ; les tables des autres slugs n'y sont pas.
describe('sessions : tables actives', () => {
    let api;

    beforeAll(async () => {
        api = await startSlugApp('fabula', 'sessions', { shared: true });
        sharedState.activeTables.clear();
        openTable(sharedState.activeTables, 'fabula', 4, 'poste-a');
        openTable(sharedState.activeTables, 'fabula', 3, 'poste-b');
        openTable(sharedState.activeTables, 'fabula', 3, 'poste-c');
        openTable(sharedState.activeTables, 'dune', 7, 'poste-d');
    });
    afterAll(() => {
        sharedState.activeTables.clear();
        api?.close();
    });

    it('joueur : tables actives du slug, avec le nombre de postes', async () => {
        const res = await api.request('GET', '/active', { token: playerToken(1) });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 3, posts: 2 }, { id: 4, posts: 1 }]);
    });

    it('MJ : même liste', async () => {
        const res = await api.request('GET', '/active', { token: gmToken() });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 3, posts: 2 }, { id: 4, posts: 1 }]);
    });

    it('sans jeton : refusé', async () => {
        expect((await api.request('GET', '/active')).status).toBe(401);
    });
});
