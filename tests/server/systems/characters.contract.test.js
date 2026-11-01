// tests/server/systems/characters.contract.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat des routes /characters de TOUS les slugs (découverts par le Loader :
// un nouveau slug est testé d'office). Routes obligatoires = celles que la
// plateforme appelle ; PATCH /:id et DELETE /:id ne sont testés que s'ils
// existent. Règles : src/server/CLAUDE.md (droits, COALESCE, _syncSubTable,
// diffusion character-full-update).
//
// Chaque slug fournit tests/server/systems/<slug>/fixture.js :
//   { create: corps minimal de POST /, edit: { field, value } pour l'envoi partiel }
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import { listSlugs, startSlugApp, playerToken, gmToken } from '../helpers/slugApp.js';

// Champs que toute sauvegarde peut légitimement changer
const VOLATILE_KEYS = ['updatedAt', 'updated_at', 'lastAccessed', 'last_accessed'];
const stable = (character) => {
    const copy = { ...character };
    for (const key of VOLATILE_KEYS) delete copy[key];
    return copy;
};

const fixtureUrl = (slug) => new URL(`./${slug}/fixture.js`, import.meta.url);

describe.each(listSlugs())('%s : contrat /characters', (slug) => {
    let api, fixture, created, other, sessionId;

    beforeAll(async () => {
        api = await startSlugApp(slug);
        if (!fs.existsSync(fixtureUrl(slug))) return;
        fixture = (await import(fixtureUrl(slug).href)).default;

        const first  = await api.request('POST', '/', { body: fixture.create });
        const second = await api.request('POST', '/', { body: fixture.create });
        // Création ratée : les tests le signalent un par un (POST / en tête)
        if (first.status !== 201 && first.status !== 200) return;
        created = first.body;
        other   = second.body;

        // Une table de jeu où le personnage est inscrit (diffusion, /:id/sessions)
        sessionId = Number(api.db.prepare(
            "INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Table test', 'TSTCDE', 'table-test')"
        ).run().lastInsertRowid);
        api.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)')
            .run(sessionId, created.id);
    });

    afterAll(async () => {
        await api?.close();
    });

    it('fournit un corps de création (fixture.js)', () => {
        expect(fixture, `tests/server/systems/${slug}/fixture.js manquant`).toBeDefined();
    });

    // ── Création et lecture publiques ────────────────────────────────────────

    it('POST / crée le personnage (201, id, accessCode, accessUrl)', async () => {
        const res = await api.request('POST', '/', { body: fixture.create });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.accessCode).toBeTruthy();
        expect(res.body.accessUrl).toBeTruthy();
    });

    it('GET / est public, sans le compte MJ, avec les champs communs', async () => {
        const res = await api.request('GET', '/');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(c => c.id === -1)).toBe(false);
        const entry = res.body.find(c => c.id === created.id);
        expect(entry).toBeDefined();
        for (const key of ['id', 'accessCode', 'accessUrl', 'playerName', 'avatar']) {
            expect(entry, `champ « ${key} » absent de la liste`).toHaveProperty(key);
        }
    });

    it('GET /by-url/:url et /by-code/:code sont publics (404 si inconnu)', async () => {
        expect((await api.request('GET', `/by-url/${created.accessUrl}`)).body?.id).toBe(created.id);
        expect((await api.request('GET', `/by-code/${created.accessCode}`)).body?.id).toBe(created.id);
        expect((await api.request('GET', '/by-url/url-inconnue-0000')).status).toBe(404);
        expect((await api.request('GET', '/by-code/ZZZZZZ')).status).toBe(404);
    });

    // ── Droits ───────────────────────────────────────────────────────────────

    it('GET /:id : 401 sans jeton, 403 autre joueur, 200 propriétaire et MJ, 404 inconnu', async () => {
        expect((await api.request('GET', `/${created.id}`)).status).toBe(401);
        expect((await api.request('GET', `/${created.id}`, { token: playerToken(other.id) })).status).toBe(403);
        expect((await api.request('GET', `/${created.id}`, { token: playerToken(created.id) })).status).toBe(200);
        expect((await api.request('GET', `/${created.id}`, { token: gmToken() })).status).toBe(200);
        expect((await api.request('GET', '/999999', { token: gmToken() })).status).toBe(404);
    });

    it('PUT /:id : 401 sans jeton, 403 autre joueur, 404 inconnu', async () => {
        expect((await api.request('PUT', `/${created.id}`, { body: {} })).status).toBe(401);
        expect((await api.request('PUT', `/${created.id}`, { body: {}, token: playerToken(other.id) })).status).toBe(403);
        expect((await api.request('PUT', '/999999', { body: {}, token: gmToken() })).status).toBe(404);
    });

    it('GET /:id/sessions liste les tables du personnage', async () => {
        const res = await api.request('GET', `/${created.id}/sessions`, { token: playerToken(created.id) });
        expect(res.status).toBe(200);
        expect(res.body.map(s => s.id)).toContain(sessionId);
    });

    // ── Écriture ─────────────────────────────────────────────────────────────

    it('aller-retour : renvoyer la fiche chargée ne change rien (ids des sous-tables compris)', async () => {
        const token  = playerToken(created.id);
        const before = (await api.request('GET', `/${created.id}`, { token })).body;
        const put    = await api.request('PUT', `/${created.id}`, { body: before, token });
        expect(put.status).toBe(200);
        expect(stable(put.body)).toEqual(stable(before));
        const after = (await api.request('GET', `/${created.id}`, { token })).body;
        expect(stable(after)).toEqual(stable(before));
    });

    it('envoi partiel : seul le champ envoyé change, le reste est conservé', async () => {
        const token  = playerToken(created.id);
        const before = (await api.request('GET', `/${created.id}`, { token })).body;
        const { field, value } = fixture.edit;
        const put = await api.request('PUT', `/${created.id}`, { body: { [field]: value }, token });
        expect(put.status).toBe(200);
        const after = (await api.request('GET', `/${created.id}`, { token })).body;
        expect(after[field]).toBe(value);
        expect(stable({ ...after, [field]: before[field] })).toEqual(stable(before));
    });

    it('PUT diffuse character-full-update vers la room de chaque table', async () => {
        api.emits.length = 0;
        const token = playerToken(created.id);
        const character = (await api.request('GET', `/${created.id}`, { token })).body;
        await api.request('PUT', `/${created.id}`, { body: character, token });
        const emit = api.emits.find(e => e.event === 'character-full-update');
        expect(emit?.room).toBe(`${slug}_session_${sessionId}`);
        expect(emit?.payload?.characterId).toBe(created.id);
    });

    // ── Routes facultatives : testées si le slug les déclare ─────────────────

    it('PATCH /:id (s’il existe) : 401 sans jeton, 403 autre joueur', async ({ skip }) => {
        if (!api.routes.includes('PATCH /:id')) skip();
        expect((await api.request('PATCH', `/${created.id}`, { body: {} })).status).toBe(401);
        expect((await api.request('PATCH', `/${created.id}`, { body: {}, token: playerToken(other.id) })).status).toBe(403);
    });

    it('DELETE /:id (s’il existe) : réservé au MJ', async ({ skip }) => {
        if (!api.routes.includes('DELETE /:id')) skip();
        expect((await api.request('DELETE', `/${other.id}`, { token: playerToken(other.id) })).status).toBe(403);
        const res = await api.request('DELETE', `/${other.id}`, { token: gmToken() });
        expect(res.status).toBeLessThan(300);
        expect((await api.request('GET', `/${other.id}`, { token: gmToken() })).status).toBe(404);
    });
});
