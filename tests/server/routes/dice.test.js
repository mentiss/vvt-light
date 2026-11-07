// tests/server/routes/dice.test.js
// Diffusion d'un jet (route partagée /dice/roll) : dans la room de la table du
// slug seulement ; un jet sans table n'est diffusé nulle part (il atteignait
// avant toutes les pages de tous les slugs, notifications comprises).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../helpers/slugApp.js';

const ROLL = { notation: '2d10', roll_result: { total: 12, outcome: 'partial' }, character_name: 'Ines' };

describe('dice : diffusion d\'un jet', () => {
    let api, sessionId, charId;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'dice', { shared: true });
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Table', 'TAB001', 'tab-001')").run().lastInsertRowid;
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('DICE01', 'dice-01', 'joueur', 'Ines')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('jet à une table : diffusé dans la room de la table du slug', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', '/roll', { token: playerToken(charId), body: { ...ROLL, character_id: charId, session_id: sessionId } });
        expect(res.status).toBe(201);
        expect(api.emits.slice(before)).toEqual([
            expect.objectContaining({ room: `cyberpunk_session_${sessionId}`, event: 'dice-roll' }),
        ]);
    });

    it('jet sans table : enregistré, diffusé nulle part', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', '/roll', { token: playerToken(charId), body: { ...ROLL, character_id: charId } });
        expect(res.status).toBe(201);
        expect(api.emits.length).toBe(before);
    });
});
