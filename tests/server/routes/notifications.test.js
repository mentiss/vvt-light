// tests/server/routes/notifications.test.js
// Aucune diffusion à tout le serveur (CLAUDE.md serveur, spec_composition_table.md) :
// un id de personnage ou de table n'est unique que dans la base de son slug.
//   - journal : message et objet du MJ sans table indiquée → rooms des tables du personnage.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken } from '../helpers/slugApp.js';

describe('journal : notifications du MJ', () => {
    let api, charId, sessionA, sessionB;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'journal', { shared: true });
        const db = api.db;
        sessionA = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('A', 'TABA01', 'tab-a')").run().lastInsertRowid;
        sessionB = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('B', 'TABB01', 'tab-b')").run().lastInsertRowid;
        charId = db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('JOUR01', 'jour-01', 'joueur', 'Ines')").run().lastInsertRowid;
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionA, charId);
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionB, charId);
    });
    afterAll(() => api?.close());

    it('message avec table : la room de cette table', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', '/gm-send', { token: gmToken(), body: { targetCharacterIds: [charId], sessionId: sessionA, title: 'Note', body: 'Texte' } });
        expect(res.status).toBe(201);
        expect(api.emits.slice(before).map(e => e.room)).toEqual([`cyberpunk_session_${sessionA}`]);
    });

    it('message sans table : les rooms des tables du personnage, jamais tout le serveur', async () => {
        const before = api.emits.length;
        await api.request('POST', '/gm-send', { token: gmToken(), body: { targetCharacterIds: [charId], title: 'Note', body: 'Texte' } });
        const sent = api.emits.slice(before);
        expect(sent.map(e => e.room).sort()).toEqual([`cyberpunk_session_${sessionA}`, `cyberpunk_session_${sessionB}`].sort());
        expect(sent.every(e => e.event === 'gm-message-received')).toBe(true);
    });
});
