// tests/server/systems/cyberpunk/xp.test.js
// Avancement (PATCH /characters/:id/xp) : seule une caractéristique du jeu peut
// être visée (B-SQL-PARAM), les écritures sont tout ou rien (B-TX), la fiche est
// diffusée (B-BROADCAST). Spec : documentations/spec_correctifs_audit.md §5.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('cyberpunk : avancement de caractéristique', () => {
    let api, id, sessionId;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk');
        id = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom, cran, xp) VALUES ('XPAV01', 'xp-av-01', 'joueur', 'Vega', 0, 3)").run().lastInsertRowid;
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Table', 'TAB001', 'tab-001')").run().lastInsertRowid;
        api.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, id);
    });
    afterAll(() => api?.close());

    const patchXp = (body) => api.request('PATCH', `/${id}/xp`, { token: playerToken(id), body });
    const row = () => api.db.prepare('SELECT cran, xp, cred FROM characters WHERE id = ?').get(id);

    it('clé hors des caractéristiques : 400, rien n\'est écrit', async () => {
        const before = row();
        const res = await patchXp({ xp: 0, statKey: 'cred = 99, xp', statDelta: 1 });
        expect(res.status).toBe(400);
        expect(row()).toEqual(before);
        expect((await patchXp({ statKey: 'access_code', statDelta: 1 })).status).toBe(400);
    });

    it('paire incomplète ou delta invalide : 400, l\'XP envoyée avec n\'est pas écrite', async () => {
        const before = row();
        for (const pair of [
            { statKey: 'access_code', statDelta: 0 },
            { statKey: 'cran', statDelta: null },
            { statKey: 'cran', statDelta: 0 },
            { statKey: 'cran', statDelta: 1.5 },
            { statDelta: 1 },
        ]) {
            expect((await patchXp({ xp: 0, ...pair })).status, JSON.stringify(pair)).toBe(400);
        }
        expect(row()).toEqual(before);
    });

    it('échec en cours d\'écriture : tout est annulé, rien n\'est diffusé (B-TX)', async () => {
        api.db.prepare('UPDATE characters SET cran = 0, xp = 3 WHERE id = ?').run(id);
        const before = api.emits.length;
        // L'XP et la caractéristique sont écrites, puis la manœuvre inexistante viole sa clé étrangère
        const res = await patchXp({ xp: 0, statKey: 'cran', statDelta: 1, moveId: 999999, action: 'add' });
        expect(res.status).toBe(500);
        expect(row()).toMatchObject({ cran: 0, xp: 3 });
        expect(api.emits.length).toBe(before);
    });

    it('ressources : écrites et diffusées à la table', async () => {
        const before = api.emits.length;
        const res = await api.request('PATCH', `/${id}/resources`, { token: playerToken(id), body: { cred: 7 } });
        expect(res.status).toBe(200);
        expect(row().cred).toBe(7);
        expect(api.emits.slice(before)).toEqual([
            expect.objectContaining({
                room: `cyberpunk_session_${sessionId}`, event: 'character-full-update',
                payload: expect.objectContaining({ characterId: id }),
            }),
        ]);
    });

    it('plafond dépassé : 400, l\'XP envoyée avec n\'est pas écrite non plus', async () => {
        api.db.prepare('UPDATE characters SET cran = 2, xp = 3 WHERE id = ?').run(id);
        const res = await patchXp({ xp: 0, statKey: 'cran', statDelta: 1 });
        expect(res.status).toBe(400);
        expect(row()).toMatchObject({ cran: 2, xp: 3 });
    });

    it('avancement valide : écrit et diffusé à la table', async () => {
        api.db.prepare('UPDATE characters SET cran = 0 WHERE id = ?').run(id);
        const before = api.emits.length;
        const res = await patchXp({ xp: 0, statKey: 'cran', statDelta: 1 });
        expect(res.status).toBe(200);
        expect(row()).toMatchObject({ cran: 1, xp: 0 });
        expect(api.emits.slice(before)).toEqual([
            expect.objectContaining({ room: `cyberpunk_session_${sessionId}`, event: 'character-full-update' }),
        ]);
    });
});
