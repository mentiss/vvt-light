// tests/server/routes/initiative.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Route de l'initiative (documentations/spec_initiative.md §9.4) : lecture par un
// joueur, écriture réservée au MJ, forme vérifiée, diffusion à la room de la table,
// avatars gardés à part et retirés avec leur participant, fin de l'initiative.
// L'état vit en mémoire (sharedState) : aucune base de module.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, gmToken, playerToken } from '../helpers/slugApp.js';

const SLUG = 'deltagreen';
const gm = gmToken();
const AVATAR = 'data:image/jpeg;base64,AAAA';

let app;
let sessionId;
let player;

const url = () => `/sessions/${sessionId}`;
const participant = (key, extra = {}) => ({
    key, kind: 'character', refId: 1, side: 'players', name: 'Agent Harper', publicName: '',
    initiative: 14, actions: 1, acted: 0, delayed: false, hidden: false, reserve: false, down: false,
    wound: null, woundForced: false, outRound: null, ...extra,
});
const state = (participants, extra = {}) => ({
    mode: 'order', alternate: true, round: 1, activeKey: participants[0]?.key ?? null,
    opening: 'players', hand: 'players', kept: { players: false, gm: false }, enemyOrder: false, lastSide: null,
    participants, ...extra,
});

beforeAll(async () => {
    app = await startSlugApp(SLUG, 'initiative', { shared: true });
    sessionId = Number(app.db.prepare('INSERT INTO game_sessions (name, access_code, access_url) VALUES (?, ?, ?)')
        .run('Table A', 'CODEA', 'table-a').lastInsertRowid);
    player = playerToken(1);
});

afterAll(async () => {
    await app?.close();
});

describe('Initiative : lecture et droits', () => {
    it('sans initiative en cours, un joueur lit un état vide', async () => {
        const res = await app.request('GET', url(), { token: player });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ state: null, avatars: {} });
    });

    it('sans jeton, la lecture est refusée', async () => {
        expect((await app.request('GET', url())).status).toBe(401);
    });

    it('une table inconnue donne 404', async () => {
        expect((await app.request('GET', '/sessions/9999', { token: gm })).status).toBe(404);
    });

    it('un joueur ne peut ni écrire ni terminer', async () => {
        expect((await app.request('PUT', url(), { body: { state: state([participant('c1')]) }, token: player })).status).toBe(403);
        expect((await app.request('DELETE', url(), { token: player })).status).toBe(403);
    });
});

describe('Initiative : écriture du MJ', () => {
    it('l\'état est gardé, nettoyé des champs inconnus, et diffusé à la room', async () => {
        const res = await app.request('PUT', url(), {
            body: { state: { ...state([participant('c1', { extra: 'ignoré' })]), extra: 'ignoré' }, avatars: { c1: AVATAR } },
            token: gm,
        });
        expect(res.status).toBe(200);
        expect(res.body.state.participants[0]).not.toHaveProperty('extra');
        expect(res.body.state).not.toHaveProperty('extra');
        expect(res.body.avatars).toEqual({ c1: AVATAR });

        const room = `${SLUG}_session_${sessionId}`;
        const events = app.emits.slice(-2);
        expect(events[0]).toMatchObject({ room, event: 'initiative-avatars', payload: { system: SLUG, sessionId, avatars: { c1: AVATAR } } });
        expect(events[1]).toMatchObject({ room, event: 'initiative-state', payload: { system: SLUG, sessionId } });

        const read = await app.request('GET', url(), { token: player });
        expect(read.body.state.participants).toHaveLength(1);
        expect(read.body.avatars).toEqual({ c1: AVATAR });
    });

    it('sans avatar nouveau, initiative-avatars n\'est pas rediffusé ; l\'avatar reste', async () => {
        const before = app.emits.length;
        const res = await app.request('PUT', url(), { body: { state: state([participant('c1', { acted: 1 })]) }, token: gm });
        expect(res.status).toBe(200);
        expect(res.body.avatars).toEqual({ c1: AVATAR });
        expect(app.emits.slice(before).map(e => e.event)).toEqual(['initiative-state']);
    });

    it('un participant retiré emporte son avatar', async () => {
        const res = await app.request('PUT', url(), { body: { state: state([participant('n1', { kind: 'free', refId: null, side: 'gm' })]) }, token: gm });
        expect(res.body.avatars).toEqual({});
        expect(app.emits.at(-2)).toMatchObject({ event: 'initiative-avatars', payload: { avatars: {} } });
    });

    it.each([
        ['un mode inconnu', { mode: 'chaos' }],
        ['un tour non entier', { round: 1.5 }],
        ['un tour en texte', { round: '2' }],
        ['un actif absent de la liste', { activeKey: 'zz' }],
    ])('refuse %s (400)', async (_label, patch) => {
        const res = await app.request('PUT', url(), { body: { state: { ...state([participant('c1')]), ...patch } }, token: gm });
        expect(res.status).toBe(400);
    });

    it.each([
        ['une initiative en texte', { initiative: '14' }],
        ['une blessure inconnue', { wound: 'mort' }],
        ['un camp inconnu', { side: 'neutre' }],
        ['un drapeau non booléen', { reserve: 1 }],
    ])('refuse un participant avec %s (400)', async (_label, patch) => {
        const res = await app.request('PUT', url(), { body: { state: state([participant('c1', patch)]) }, token: gm });
        expect(res.status).toBe(400);
    });

    it('refuse des participants en double et un avatar qui n\'est pas une image', async () => {
        expect((await app.request('PUT', url(), { body: { state: state([participant('c1'), participant('c1')]) }, token: gm })).status).toBe(400);
        expect((await app.request('PUT', url(), { body: { state: state([participant('c1')]), avatars: { c1: 'https://exemple.org/a.png' } }, token: gm })).status).toBe(400);
    });

    it('la fin efface l\'état et diffuse null', async () => {
        const res = await app.request('DELETE', url(), { token: gm });
        expect(res.status).toBe(200);
        expect(app.emits.at(-1)).toMatchObject({ event: 'initiative-state', payload: { system: SLUG, sessionId, state: null } });
        expect((await app.request('GET', url(), { token: player })).body).toEqual({ state: null, avatars: {} });
    });
});
