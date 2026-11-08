// tests/server/routes/auth.test.js
// Connexion (POST /auth/login) : le code est obligatoire (B-AUTH-CHECK), et le
// limiteur bloque après 5 échecs en 15 minutes (B-DATE). Spec :
// documentations/spec_correctifs_audit.md §3.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import { startSlugApp } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const authRouter = require('../../../src/server/routes/auth.js');

const GM_URL = 'this-is-MJ';
const GM_CODE = 'GMCODE';

describe('auth : connexion', () => {
    let api, charId;

    beforeAll(async () => {
        api = await startSlugApp('vikings', 'auth', { router: authRouter });
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, prenom, nom) VALUES ('ABC123', 'joueur-test', 'joueur', 'Bjorn', 'Test')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    const login = (body) => api.request('POST', '/login', { body });
    const attempts = (id) => api.db.prepare('SELECT login_attempts FROM characters WHERE id = ?').get(id).login_attempts;
    const resetAttempts = (id) => api.db.prepare('UPDATE characters SET login_attempts = 0, last_attempt_at = NULL WHERE id = ?').run(id);

    it('sans code : refusé, même avec l\'adresse du MJ', async () => {
        const res = await login({ characterUrl: GM_URL });
        expect(res.status).toBe(400);
        expect(res.body.accessToken).toBeUndefined();
        expect((await login({ characterUrl: GM_URL, code: '  ' })).status).toBe(400);
    });

    it('le MJ avec son code obtient un jeton', async () => {
        const res = await login({ characterUrl: GM_URL, code: GM_CODE.toLowerCase() });
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeTruthy();
        expect(res.body.character.id).toBe(-1);
    });

    it('code faux : 401, compté comme tentative', async () => {
        resetAttempts(charId);
        const res = await login({ characterUrl: 'joueur-test', code: 'FAUX00' });
        expect(res.status).toBe(401);
        expect(attempts(charId)).toBe(1);
    });

    it('5 échecs en moins de 15 minutes : 429, même avec le bon code', async () => {
        resetAttempts(charId);
        for (let i = 0; i < 5; i++) {
            expect((await login({ characterUrl: 'joueur-test', code: 'FAUX00' })).status).toBe(401);
        }
        expect((await login({ characterUrl: 'joueur-test', code: 'ABC123' })).status).toBe(429);
    });

    it('dernier échec il y a plus de 15 minutes : un nouvel échec repart de 1', async () => {
        // La connexion réussie remet aussi le compteur à zéro : seul un échec prouve la remise à zéro par expiration
        api.db.prepare("UPDATE characters SET login_attempts = 5, last_attempt_at = datetime('now', '-16 minutes') WHERE id = ?").run(charId);
        expect((await login({ characterUrl: 'joueur-test', code: 'FAUX00' })).status).toBe(401);
        expect(attempts(charId)).toBe(1);
    });

    it('dernier échec il y a plus de 15 minutes : connexion acceptée', async () => {
        api.db.prepare("UPDATE characters SET login_attempts = 5, last_attempt_at = datetime('now', '-16 minutes') WHERE id = ?").run(charId);
        const res = await login({ characterUrl: 'joueur-test', code: 'ABC123' });
        expect(res.status).toBe(200);
        expect(attempts(charId)).toBe(0);
    });

    it('dernier échec il y a 14 minutes : toujours bloqué', async () => {
        api.db.prepare("UPDATE characters SET login_attempts = 5, last_attempt_at = datetime('now', '-14 minutes') WHERE id = ?").run(charId);
        expect((await login({ characterUrl: 'joueur-test', code: 'ABC123' })).status).toBe(429);
    });
});
