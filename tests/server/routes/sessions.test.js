// tests/server/routes/sessions.test.js
// Mise à jour d'une table (PUT /sessions/:id) : un envoi partiel garde les champs
// absents (B-COALESCE), un champ vidé s'enregistre, un nom vide est refusé.
// Chaque test repart de la même table. Spec : documentations/spec_correctifs_audit.md §7.
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../helpers/slugApp.js';

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
