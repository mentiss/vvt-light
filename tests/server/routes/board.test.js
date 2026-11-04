// tests/server/routes/board.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Route du tableau (documentations/spec_tableau.md §10.2, §10.6) : droits du MJ
// et des joueurs, verrou, duplication avec images, purge à 3 mois, prolongation,
// ménage des tables disparues. La base du slug est en mémoire (slugApp) ; la base
// du module pointe vers un fichier temporaire, jamais vers database/board.db.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startSlugApp, gmToken, playerToken } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const boardConfig = require('../../../src/server/db/modules/board.js');
const { getDbForSystem, closeDbForSystem } = require('../../../src/server/db/index.js');

const SLUG = 'vikings';
const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const STROKE = { kind: 'stroke', data: { points: [0, 0, 10, 20, 30, 5], color: '#c0392b', width: 3 } };

let app;
let boardDb;
let sessionId;
let otherSessionId;
let playerId;
const gm = gmToken();
let player;

const tableUrl = (sid = sessionId) => `/sessions/${sid}`;

beforeAll(async () => {
    // getModuleConfig('board') renvoie ce même objet (cache de require) : la route ouvrira le fichier temporaire
    boardConfig.dbPath = path.join(os.tmpdir(), `vtt-board-test-${process.pid}.db`);
    fs.rmSync(boardConfig.dbPath, { force: true });

    app = await startSlugApp(SLUG, 'board', { shared: true });
    const insertSession = app.db.prepare('INSERT INTO game_sessions (name, access_code, access_url) VALUES (?, ?, ?)');
    sessionId = Number(insertSession.run('Table A', 'CODEA', 'table-a').lastInsertRowid);
    otherSessionId = Number(insertSession.run('Table B', 'CODEB', 'table-b').lastInsertRowid);
    playerId = Number(app.db.prepare(`
        INSERT INTO characters (access_code, access_url, player_name, nom, prenom) VALUES ('P1', 'p1', 'Joueur', 'Sigurdsson', 'Bjorn')
    `).run().lastInsertRowid);
    app.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, playerId);
    player = playerToken(playerId);
    boardDb = getDbForSystem(boardConfig);
});

afterAll(async () => {
    await app?.close();
    closeDbForSystem('board');
    for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${boardConfig.dbPath}${suffix}`, { force: true });
});

const createSlide = async (body = {}) => (await app.request('POST', `${tableUrl()}/slides`, { body, token: gm })).body;
const setSlide = (id, body) => app.request('PUT', `${tableUrl()}/slides/${id}`, { body, token: gm });

describe('Tableau : diapositives', () => {
    it('le MJ crée une diapositive, nommée par défaut', async () => {
        const res = await app.request('POST', `${tableUrl()}/slides`, { body: {}, token: gm });
        expect(res.status).toBe(201);
        expect(res.body.name).toMatch(/^Diapositive \d+$/);
        expect(app.emits.at(-1)).toMatchObject({ room: `${SLUG}_session_${sessionId}`, event: 'board-slides' });
    });

    it('un joueur ne crée pas de diapositive et ne règle pas la table', async () => {
        expect((await app.request('POST', `${tableUrl()}/slides`, { body: {}, token: player })).status).toBe(403);
        expect((await app.request('PUT', tableUrl(), { body: { enabled: true }, token: player })).status).toBe(403);
    });

    it('une table inconnue répond 404', async () => {
        expect((await app.request('GET', tableUrl(9999), { token: gm })).status).toBe(404);
    });
});

describe('Tableau : droits des joueurs (§10.2)', () => {
    it('dessin refusé sans le réglage, permis avec, boîte du trait calculée', async () => {
        const slide = await createSlide();
        expect((await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, { body: STROKE, token: player })).status).toBe(403);

        await setSlide(slide.id, { playersDraw: true });
        const res = await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, { body: STROKE, token: player });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ kind: 'stroke', x: 0, y: 0, w: 30, h: 20, author: playerId });
    });

    it('un joueur ne pose ni jeton ni icône, même avec le dessin ouvert', async () => {
        const slide = await createSlide();
        await setSlide(slide.id, { playersDraw: true, playersMove: true });
        const token = { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { label: 'Garde', color: '#1f1d1a' } };
        const icon = { kind: 'icon', x: 0, y: 0, w: 40, h: 40, data: { icon: 'lorc/campfire', color: '#c0392b' } };
        expect((await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, { body: token, token: player })).status).toBe(403);
        expect((await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, { body: icon, token: player })).status).toBe(403);
    });

    it('déplacement d\'un jeton selon le réglage ; gomme des joueurs limitée aux dessins', async () => {
        const slide = await createSlide();
        const token = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, {
            body: { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { label: 'Garde', color: '#1f1d1a' } }, token: gm,
        })).body;

        expect((await app.request('PATCH', `${tableUrl()}/items/${token.id}`, { body: { x: 100 }, token: player })).status).toBe(403);
        await setSlide(slide.id, { playersMove: true, playersDraw: true });
        const moved = await app.request('PATCH', `${tableUrl()}/items/${token.id}`, { body: { x: 100, y: 50 }, token: player });
        expect(moved.status).toBe(200);
        expect(moved.body).toMatchObject({ x: 100, y: 50 });

        expect((await app.request('DELETE', `${tableUrl()}/items/${token.id}`, { token: player })).status).toBe(403);
        const stroke = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, { body: STROKE, token: gm })).body;
        expect((await app.request('DELETE', `${tableUrl()}/items/${stroke.id}`, { token: player })).status).toBe(200);
    });
});

describe('Tableau : verrou (Q-41)', () => {
    it('un objet verrouillé ne bouge ni ne s\'efface, MJ compris, jusqu\'au déverrouillage', async () => {
        const slide = await createSlide();
        const rect = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, {
            body: { kind: 'rect', x: 0, y: 0, w: 100, h: 50, data: { color: '#2f6db5' } }, token: gm,
        })).body;

        expect((await app.request('PATCH', `${tableUrl()}/items/${rect.id}`, { body: { locked: true }, token: player })).status).toBe(403);
        expect((await app.request('PATCH', `${tableUrl()}/items/${rect.id}`, { body: { locked: true }, token: gm })).status).toBe(200);
        expect((await app.request('PATCH', `${tableUrl()}/items/${rect.id}`, { body: { x: 10 }, token: gm })).status).toBe(409);
        expect((await app.request('DELETE', `${tableUrl()}/items/${rect.id}`, { token: gm })).status).toBe(409);

        const cleared = await app.request('DELETE', `${tableUrl()}/slides/${slide.id}/items`, { token: gm });
        expect(cleared.body.removed).not.toContain(rect.id);

        const unlocked = await app.request('PATCH', `${tableUrl()}/items/${rect.id}`, { body: { locked: false, x: 10 }, token: gm });
        expect(unlocked.body).toMatchObject({ locked: false, x: 10 });
    });
});

describe('Tableau : images et duplication', () => {
    it('image en fond verrouillée, servie à part ; la copie de la diapositive emporte ses images', async () => {
        const slide = await createSlide({ name: 'Village' });
        const upload = await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1, background: true }, token: gm,
        });
        expect(upload.status).toBe(201);
        expect(upload.body).toMatchObject({ kind: 'image', locked: true, w: 1, h: 1 });
        expect((await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1 }, token: player,
        })).status).toBe(403);

        const imageId = upload.body.data.imageId;
        expect((await app.request('GET', `${tableUrl()}/images/${imageId}`, { token: player })).status).toBe(200);

        const copy = await app.request('POST', `${tableUrl()}/slides/${slide.id}/duplicate`, { token: gm });
        expect(copy.status).toBe(201);
        expect(copy.body.name).toBe('Village (copie)');
        const copied = (await app.request('GET', `${tableUrl()}/slides/${copy.body.id}`, { token: gm })).body.items;
        expect(copied).toHaveLength(1);
        expect(copied[0].data.imageId).not.toBe(imageId);
        expect((await app.request('GET', `${tableUrl()}/images/${copied[0].data.imageId}`, { token: gm })).status).toBe(200);
    });

    it('effacer la dernière image qui l\'utilise supprime l\'image', async () => {
        const slide = await createSlide();
        const item = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1 }, token: gm,
        })).body;
        await app.request('DELETE', `${tableUrl()}/items/${item.id}`, { token: gm });
        expect((await app.request('GET', `${tableUrl()}/images/${item.data.imageId}`, { token: gm })).status).toBe(404);
    });
});

describe('Tableau : jetons des PJ (Q-36)', () => {
    it('pose les jetons manquants, une seule fois', async () => {
        const slide = await createSlide();
        const first = await app.request('POST', `${tableUrl()}/slides/${slide.id}/pc-tokens`, { token: gm });
        expect(first.body.items).toHaveLength(1);
        expect(first.body.items[0].data).toEqual({ characterId: playerId });
        const second = await app.request('POST', `${tableUrl()}/slides/${slide.id}/pc-tokens`, { token: gm });
        expect(second.body.items).toHaveLength(0);
    });
});

describe('Tableau : purge et ménage (§10.6)', () => {
    const age = (sid, days) => boardDb.prepare(`
        UPDATE board_sessions SET last_used_at = datetime('now', ?) WHERE slug = ? AND session_id = ?
    `).run(`-${days} days`, SLUG, sid);

    it('purge une autre table inutilisée depuis plus de 3 mois, garde celle « à conserver »', async () => {
        const other = `/sessions/${otherSessionId}`;
        await app.request('POST', `${other}/slides`, { body: { name: 'Ancienne' }, token: gm });
        age(otherSessionId, 100);
        await app.request('GET', tableUrl(), { token: gm });
        expect((await app.request('GET', other, { token: gm })).body.slides).toHaveLength(0);

        await app.request('POST', `${other}/slides`, { body: { name: 'Gardée' }, token: gm });
        await app.request('PUT', other, { body: { keep: true }, token: gm });
        age(otherSessionId, 100);
        await app.request('GET', tableUrl(), { token: gm });
        expect((await app.request('GET', other, { token: gm })).body.slides).toHaveLength(1);
    });

    it('ouvrir un tableau à échéance le prolonge (P-5) ; l\'ouvrir en temps normal ne compte pas', async () => {
        age(sessionId, 10);
        const normal = await app.request('GET', tableUrl(), { token: gm });
        expect(normal.body.prolongedFrom).toBeNull();

        age(sessionId, 85);
        const due = await app.request('GET', tableUrl(), { token: gm });
        expect(due.body.prolongedFrom).not.toBeNull();
        expect(due.body.slides.length).toBeGreaterThan(0);
        const again = await app.request('GET', tableUrl(), { token: gm });
        expect(again.body.prolongedFrom).toBeNull();
    });

    it('le contenu d\'une table supprimée du slug disparaît au chargement par le MJ (P-9)', async () => {
        boardDb.prepare("INSERT INTO board_slides (slug, session_id, name) VALUES (?, 9999, 'Orpheline')").run(SLUG);
        await app.request('GET', tableUrl(), { token: gm });
        const left = boardDb.prepare('SELECT COUNT(*) AS n FROM board_slides WHERE slug = ? AND session_id = 9999').get(SLUG).n;
        expect(left).toBe(0);
    });
});
