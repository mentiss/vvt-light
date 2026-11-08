// tests/server/systems/deltagreen/routes.test.js
// Routes propres à Delta Green (perte de SAN, évolution) : la fiche modifiée est
// diffusée aux tables du personnage (B-BROADCAST). Spec :
// documentations/spec_correctifs_audit.md §6.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('deltagreen : diffusion de la fiche', () => {
    let api, id, sessionId;

    beforeAll(async () => {
        api = await startSlugApp('deltagreen');
        id = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom, pow, san_current) VALUES ('DGSAN1', 'dg-san-1', 'joueur', 'Agent', 12, 60)").run().lastInsertRowid;
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Table', 'TAB001', 'tab-001')").run().lastInsertRowid;
        api.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, id);
    });
    afterAll(() => api?.close());

    const broadcasts = (from) => api.emits.slice(from).filter(e => e.event === 'character-full-update');

    it('perte de SAN : SAN écrite, fiche diffusée à la table', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', `/${id}/san-loss`, {
            token: playerToken(id),
            body: { situationLabel: 'Cadavre', lossSuccess: '0', lossFailure: '1D6', lossApplied: 4, sessionId },
        });
        expect(res.status).toBe(200);
        expect(res.body.sanCurrent).toBe(56);
        expect(broadcasts(before)).toEqual([
            expect.objectContaining({
                room: `deltagreen_session_${sessionId}`,
                payload: expect.objectContaining({ characterId: id, character: expect.objectContaining({ sanCurrent: 56 }) }),
            }),
        ]);
    });

    it('évolution : fiche diffusée à la table', async () => {
        const before = api.emits.length;
        const res = await api.request('POST', `/${id}/evolve`, { token: playerToken(id), body: { results: [] } });
        expect(res.status).toBe(200);
        expect(broadcasts(before)).toEqual([
            expect.objectContaining({ room: `deltagreen_session_${sessionId}`, payload: expect.objectContaining({ characterId: id }) }),
        ]);
    });
});
