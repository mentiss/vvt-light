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

describe('Tableau : jetons des PNJ de la table (spec_pnj.md P-21)', () => {
    it('PNJ de la table lisibles par un joueur (nom et avatar seulement) ; jeton gardant nom et couleur', async () => {
        const sheet = { nom: 'Loup', avatar: null, icon: { icon: 'lorc/wolf-head', color: '#9a7a3a' }, gmNotes: 'Secret', systemData: { rank: 'minor' } };
        const npcId = Number(app.db.prepare("INSERT INTO session_npcs (session_id, name, sheet) VALUES (?, 'Loup 2', ?)")
            .run(sessionId, JSON.stringify(sheet)).lastInsertRowid);
        const list = await app.request('GET', `${tableUrl()}/npcs`, { token: player });
        expect(list.status).toBe(200);
        expect(list.body).toEqual([{ id: npcId, name: 'Loup 2', avatar: null, icon: sheet.icon }]);

        const slide = await createSlide();
        const res = await app.request('POST', `${tableUrl()}/slides/${slide.id}/items`, {
            body: { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { npcId, label: 'Loup 2', color: '#1f1d1a' } }, token: gm,
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toEqual({ npcId, label: 'Loup 2', color: '#1f1d1a' });
    });
});

describe('Tableau : objets du lot B (§13)', () => {
    const post = (slideId, body, token = gm) => app.request('POST', `${tableUrl()}/slides/${slideId}/items`, { body, token });
    const patch = (id, body, token = gm) => app.request('PATCH', `${tableUrl()}/items/${id}`, { body, token });

    it('ellipse, ligne, halo et texte : données vérifiées, posés par un joueur si le dessin est ouvert (PB-6)', async () => {
        const slide = await createSlide();
        const line = { kind: 'line', data: { points: [10, 10, 50, 30], color: '#c0392b', width: 3, arrow: true } };
        const text = { kind: 'text', x: 0, y: 0, w: 80, h: 24, data: { text: 'Porte', color: '#1f1d1a', size: 20 } };
        expect((await post(slide.id, line, player)).status).toBe(403);

        await setSlide(slide.id, { playersDraw: true });
        const created = await post(slide.id, line, player);
        expect(created.body).toMatchObject({ kind: 'line', x: 10, y: 10, w: 40, h: 20, data: { arrow: true } });
        expect((await post(slide.id, text, player)).status).toBe(201);
        expect((await post(slide.id, { kind: 'halo', x: 0, y: 0, w: 300, h: 300, data: { color: '#e2b93b' } }, player)).status).toBe(201);
        expect((await post(slide.id, { kind: 'ellipse', x: 0, y: 0, w: 60, h: 40, data: { color: '#3a8f5c', filled: false, width: 4 } }, player)).body.data)
            .toEqual({ color: '#3a8f5c', filled: false, width: 4 });

        expect((await post(slide.id, { ...text, data: { ...text.data, text: 'x'.repeat(501) } })).status).toBe(400);
        expect((await post(slide.id, { ...line, data: { ...line.data, points: [0, 0, 1] } })).status).toBe(400);
        expect((await app.request('DELETE', `${tableUrl()}/items/${created.body.id}`, { token: player })).status).toBe(200);
    });

    it('déplacer une ligne décale ses points avec sa boîte', async () => {
        const slide = await createSlide();
        const line = (await post(slide.id, { kind: 'line', data: { points: [10, 10, 50, 30], color: '#c0392b', width: 3 } })).body;
        const moved = await patch(line.id, { x: 110, y: 60 });
        expect(moved.body).toMatchObject({ x: 110, y: 60, data: { points: [110, 60, 150, 80] } });
    });

    it('rotation : objets permis seulement, verrou respecté, angle ramené dans [0, 360[', async () => {
        const slide = await createSlide();
        const rect = (await post(slide.id, { kind: 'rect', x: 0, y: 0, w: 100, h: 50, data: { color: '#2f6db5' } })).body;
        expect((await patch(rect.id, { rotation: -90 })).body.rotation).toBe(270);
        const token = (await post(slide.id, { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { label: 'Garde', color: '#1f1d1a' } })).body;
        expect((await patch(token.id, { rotation: 45 })).status).toBe(400);
        await patch(rect.id, { locked: true });
        expect((await patch(rect.id, { rotation: 10 })).status).toBe(409);
    });

    it('arrière-plan au-dessus des fonds verrouillés (PB-5), premier plan au-dessus de tout', async () => {
        const slide = await createSlide();
        const background = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1, background: true }, token: gm,
        })).body;
        const a = (await post(slide.id, { kind: 'rect', x: 0, y: 0, w: 10, h: 10, data: { color: '#2f6db5' } })).body;
        const b = (await post(slide.id, { kind: 'rect', x: 0, y: 0, w: 10, h: 10, data: { color: '#c0392b' } })).body;

        await patch(b.id, { order: 'back' });
        const items = (await app.request('GET', `${tableUrl()}/slides/${slide.id}`, { token: gm })).body.items;
        const z = Object.fromEntries(items.map(i => [i.id, i.z]));
        expect(z[background.id]).toBeLessThan(z[b.id]);
        expect(z[b.id]).toBeLessThan(z[a.id]);

        expect((await patch(b.id, { order: 'front' })).body.z).toBeGreaterThan(z[a.id]);
    });

    it('filtre d\'image : gardé avec l\'image déposée, retiré par null ; imageId refusé à la création', async () => {
        const slide = await createSlide();
        const image = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1 }, token: gm,
        })).body;
        const filter = { preset: 'night', brightness: 0.6, contrast: 1.1, saturation: 0.7 };
        const filtered = await patch(image.id, { data: { filter } });
        expect(filtered.body.data).toEqual({ imageId: image.data.imageId, filter });
        expect((await patch(image.id, { data: { filter: { ...filter, brightness: 5 } } })).status).toBe(400);
        expect((await patch(image.id, { data: { filter: null } })).body.data).toEqual({ imageId: image.data.imageId });

        expect((await post(slide.id, { kind: 'image', x: 0, y: 0, w: 1, h: 1, data: { imageId: image.data.imageId } })).status).toBe(400);
    });

    it('dupliquer : copie décalée qui partage l\'image, survit à la suppression de l\'original ; jeton de PJ refusé (PB-4)', async () => {
        const slide = await createSlide();
        await setSlide(slide.id, { gridEnabled: true, gridSize: 40 });
        const image = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/images`, {
            body: { dataUrl: PIXEL, width: 1, height: 1 }, token: gm,
        })).body;
        expect((await app.request('POST', `${tableUrl()}/items/${image.id}/duplicate`, { token: player })).status).toBe(403);
        const copy = await app.request('POST', `${tableUrl()}/items/${image.id}/duplicate`, { token: gm });
        expect(copy.status).toBe(201);
        expect(copy.body).toMatchObject({ x: image.x + 40, y: image.y + 40, data: { imageId: image.data.imageId } });
        expect(copy.body.z).toBeGreaterThan(image.z);

        await app.request('DELETE', `${tableUrl()}/items/${image.id}`, { token: gm });
        expect((await app.request('GET', `${tableUrl()}/images/${image.data.imageId}`, { token: gm })).status).toBe(200);

        const pc = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/pc-tokens`, { token: gm })).body.items[0];
        expect((await app.request('POST', `${tableUrl()}/items/${pc.id}/duplicate`, { token: gm })).status).toBe(409);
    });
});

describe('Tableau : sélection, groupes, objets cachés (lot C, §14)', () => {
    const post = (slideId, body, token = gm) => app.request('POST', `${tableUrl()}/slides/${slideId}/items`, { body, token });
    const rect = (slideId, x = 0) => post(slideId, { kind: 'rect', x, y: 0, w: 10, h: 10, data: { color: '#2f6db5' } }).then(r => r.body);
    const batch = (slideId, body, token = gm) => app.request('PATCH', `${tableUrl()}/slides/${slideId}/items`, { body, token });

    it('écriture groupée tout ou rien : un objet verrouillé fait tout refuser', async () => {
        const slide = await createSlide();
        const a = await rect(slide.id), b = await rect(slide.id, 50);
        await app.request('PATCH', `${tableUrl()}/items/${b.id}`, { body: { locked: true }, token: gm });
        expect((await batch(slide.id, { items: [{ id: a.id, x: 5 }, { id: b.id, x: 55 }] })).status).toBe(409);
        const items = (await app.request('GET', `${tableUrl()}/slides/${slide.id}`, { token: gm })).body.items;
        expect(items.find(i => i.id === a.id).x).toBe(0);

        const moved = await batch(slide.id, { items: [{ id: a.id, x: 5, hidden: true }] });
        expect(moved.body.items[0]).toMatchObject({ x: 5, hidden: true });
    });

    it('cacher : le MJ seul', async () => {
        const slide = await createSlide();
        await setSlide(slide.id, { playersMove: true, playersDraw: true });
        const token = (await post(slide.id, { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { label: 'Garde', color: '#1f1d1a' } })).body;
        expect((await app.request('PATCH', `${tableUrl()}/items/${token.id}`, { body: { hidden: true }, token: player })).status).toBe(403);
        expect((await app.request('PATCH', `${tableUrl()}/items/${token.id}`, { body: { hidden: true }, token: gm })).body.hidden).toBe(true);
    });

    it('grouper réunit les groupes, dégrouper les défait ; un groupe d\'un seul objet disparaît', async () => {
        const slide = await createSlide();
        const [a, b, c] = [await rect(slide.id), await rect(slide.id, 20), await rect(slide.id, 40)];
        expect((await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [a.id] }, token: gm })).status).toBe(400);
        await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [a.id, b.id] }, token: gm });
        const merged = await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [b.id, c.id] }, token: gm });
        expect(new Set(merged.body.items.map(i => i.groupId)).size).toBe(1);
        expect(merged.body.items).toHaveLength(3);

        const ungrouped = await app.request('POST', `${tableUrl()}/slides/${slide.id}/ungroup`, { body: { ids: [a.id] }, token: gm });
        expect(ungrouped.body.items.every(i => i.groupId === null)).toBe(true);

        await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [a.id, b.id] }, token: gm });
        await app.request('DELETE', `${tableUrl()}/items/${b.id}`, { token: gm });
        const items = (await app.request('GET', `${tableUrl()}/slides/${slide.id}`, { token: gm })).body.items;
        expect(items.find(i => i.id === a.id).groupId).toBeNull();
    });

    it('un joueur qui glisse son jeton emmène son groupe (PC-4), pas un autre objet', async () => {
        const slide = await createSlide();
        await setSlide(slide.id, { playersMove: true });
        const token = (await post(slide.id, { kind: 'token', x: 0, y: 0, w: 60, h: 60, data: { label: 'Bjorn', color: '#1f1d1a' } })).body;
        const halo = (await post(slide.id, { kind: 'halo', x: -100, y: -100, w: 260, h: 260, data: { color: '#e2b93b' } })).body;
        const other = await rect(slide.id, 300);
        await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [token.id, halo.id] }, token: gm });

        const moved = await batch(slide.id, { items: [{ id: token.id, x: 50, y: 0 }, { id: halo.id, x: -50, y: -100 }] }, player);
        expect(moved.status).toBe(200);
        expect((await batch(slide.id, { items: [{ id: token.id, x: 60, y: 0 }, { id: other.id, x: 310, y: 0 }] }, player)).status).toBe(403);
        expect((await batch(slide.id, { items: [{ id: token.id, x: 60, y: 0 }, { id: halo.id, x: -40, y: -100, hidden: true }] }, player)).status).toBe(403);
    });

    it('dupliquer une sélection : nouveau groupe pour un groupe copié, jetons des PJ ignorés ; supprimer ignore le verrouillé', async () => {
        const slide = await createSlide();
        const a = await rect(slide.id), b = await rect(slide.id, 20);
        await app.request('POST', `${tableUrl()}/slides/${slide.id}/group`, { body: { ids: [a.id, b.id] }, token: gm });
        const pc = (await app.request('POST', `${tableUrl()}/slides/${slide.id}/pc-tokens`, { body: { x: 500, y: 500 }, token: gm })).body.items[0];
        expect(pc).toMatchObject({ x: 500, y: 500 });

        const copy = await app.request('POST', `${tableUrl()}/slides/${slide.id}/items/duplicate`, { body: { ids: [a.id, b.id, pc.id] }, token: gm });
        expect(copy.status).toBe(201);
        expect(copy.body.items).toHaveLength(2);
        const [ca, cb] = copy.body.items;
        expect(ca.groupId).toBe(cb.groupId);
        expect(ca.groupId).not.toBe((await app.request('GET', `${tableUrl()}/slides/${slide.id}`, { token: gm })).body.items.find(i => i.id === a.id).groupId);

        await app.request('PATCH', `${tableUrl()}/items/${ca.id}`, { body: { locked: true }, token: gm });
        const removed = await app.request('POST', `${tableUrl()}/slides/${slide.id}/items/remove`, { body: { ids: [ca.id, cb.id] }, token: gm });
        expect(removed.body.removed).toEqual([cb.id]);
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
