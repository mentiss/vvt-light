// tests/server/routes/audio.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Route de la musique (documentations/spec_audio.md §14.2) : timecode des boutons.
// Bouton ciblé sur un titre lancé depuis son timecode, timecode refusé ou ramené
// à 0, scène enregistrée sans position puis départ réglé à la main, boucle qui
// repart du timecode. La base du slug est en mémoire (slugApp) ; la base du module
// pointe vers un fichier temporaire, jamais vers database/audio.db.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startSlugApp, gmToken } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const audioConfig = require('../../../src/server/db/modules/audio.js');
const { getDbForSystem, closeDbForSystem } = require('../../../src/server/db/index.js');

const SLUG = 'vikings';
const gm = gmToken();

let app;
let sessionId;
let playlistId;
let trackId;      // durée connue : 300 s
let shortId;      // durée inconnue, sert à la boucle
let newId;        // durée inconnue à la création du bouton, connue au lancement

const url = (p = '') => `/sessions/${sessionId}${p}`;
const command = (body) => app.request('POST', url('/command'), { body, token: gm });
const music = async () => (await app.request('GET', url(), { token: gm })).body.state.slots.music;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

beforeAll(async () => {
    // getModuleConfig('audio') renvoie ce même objet (cache de require) : la route ouvrira le fichier temporaire
    audioConfig.dbPath = path.join(os.tmpdir(), `vtt-audio-test-${process.pid}.db`);
    fs.rmSync(audioConfig.dbPath, { force: true });

    app = await startSlugApp(SLUG, 'audio', { shared: true });
    sessionId = Number(app.db.prepare('INSERT INTO game_sessions (name, access_code, access_url) VALUES (?, ?, ?)')
        .run('Table A', 'CODEA', 'table-a').lastInsertRowid);

    const db = getDbForSystem(audioConfig);
    const collectionId = db.prepare('INSERT INTO audio_collections (slug, session_id, name) VALUES (?, ?, ?)').run(SLUG, sessionId, 'Ambiances').lastInsertRowid;
    playlistId = Number(db.prepare('INSERT INTO audio_playlists (collection_id, name) VALUES (?, ?)').run(collectionId, 'Combat').lastInsertRowid);
    const insertTrack = db.prepare('INSERT INTO audio_tracks (playlist_id, media_id, title, duration, position) VALUES (?, ?, ?, ?, ?)');
    trackId = Number(insertTrack.run(playlistId, 'aaaaaaaaaaa', 'Tambours', 300, 0).lastInsertRowid);
    shortId = Number(insertTrack.run(playlistId, 'bbbbbbbbbbb', 'Cor', null, 1).lastInsertRowid);
    newId = Number(insertTrack.run(playlistId, 'ccccccccccc', 'Chant', null, 2).lastInsertRowid);

    await app.request('PUT', url('/enabled'), { body: { enabled: true }, token: gm });
});

afterAll(async () => {
    await app?.close();
    closeDbForSystem('audio');
    for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${audioConfig.dbPath}${suffix}`, { force: true });
});

const createTarget = (body) => app.request('POST', url('/buttons'), { body: { label: 'Combat', mode: 'target', slot: 'music', ...body }, token: gm });
const removeAll = async () => {
    const { body } = await app.request('GET', url('/buttons'), { token: gm });
    for (const b of body) await app.request('DELETE', url(`/buttons/${b.id}`), { token: gm });
};

describe('Musique : sources hors YouTube (§14.3, sans réseau)', () => {
    it('la source et l\'identifiant d\'un titre passent dans la bibliothèque, l\'état et la copie', async () => {
        const db = getDbForSystem(audioConfig);
        const id = Number(db.prepare('INSERT INTO audio_tracks (playlist_id, source, media_id, title, position) VALUES (?, ?, ?, ?, ?)')
            .run(playlistId, 'vimeo', 'https://vimeo.com/76979871', 'Brume', 9).lastInsertRowid);
        const library = (await app.request('GET', url('/library'), { token: gm })).body;
        expect(library[0].playlists[0].tracks.find(t => t.id === id)).toMatchObject({ source: 'vimeo', mediaId: 'https://vimeo.com/76979871' });

        await command({ slot: 'ambience1', action: 'play', trackId: id });
        const state = (await app.request('GET', url(), { token: gm })).body.state.slots.ambience1;
        expect(state).toMatchObject({ source: 'vimeo', mediaId: 'https://vimeo.com/76979871' });
        await command({ slot: 'ambience1', action: 'stop' });

        const copied = (await app.request('POST', url(`/tracks/${id}/copy`), { body: { playlistId }, token: gm })).body[0].playlists[0].tracks.at(-1);
        expect(copied).toMatchObject({ source: 'vimeo', mediaId: 'https://vimeo.com/76979871', title: 'Brume' });
        await app.request('DELETE', url(`/tracks/${copied.id}`), { token: gm });
        await app.request('DELETE', url(`/tracks/${id}`), { token: gm });
    });

    it('un lien refusé fait tout refuser, avant tout appel réseau, avec un message en français', async () => {
        const before = (await app.request('GET', url('/library'), { token: gm })).body[0].playlists[0].tracks.length;
        let res = await app.request('POST', url(`/playlists/${playlistId}/tracks`), {
            body: { links: ['https://vimeo.com/76979871', 'https://example.com/page'] }, token: gm,
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Lien non reconnu/);
        res = await app.request('POST', url(`/playlists/${playlistId}/tracks`), { body: { links: ['https://suno.com/s/abc'] }, token: gm });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Suno/);
        // Vidéo YouTube et lien refusé dans le même ajout : rien n'est résolu ni ajouté, sur les deux routes
        const mixed = { videoIds: ['dQw4w9WgXcQ'], links: ['https://suno.com/s/abc'] };
        expect((await app.request('POST', url(`/playlists/${playlistId}/tracks`), { body: mixed, token: gm })).status).toBe(400);
        expect((await app.request('POST', url('/playlists'), { body: mixed, token: gm })).status).toBe(400);
        res = await app.request('POST', url('/playlists'), { body: { links: ['https://soundcloud.com/a/sets/b'] }, token: gm });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/playlists/);
        // Liste mal formée : refus du lot entier, sur les deux routes
        for (const links of [['https://vimeo.com/76979871', ''], 'https://vimeo.com/76979871', [42]]) {
            expect((await app.request('POST', url(`/playlists/${playlistId}/tracks`), { body: { links }, token: gm })).status).toBe(400);
            expect((await app.request('POST', url('/playlists'), { body: { links }, token: gm })).status).toBe(400);
        }
        const after = (await app.request('GET', url('/library'), { token: gm })).body;
        expect(after[0].playlists).toHaveLength(1);
        expect(after[0].playlists[0].tracks).toHaveLength(before);
    });
});

describe('Musique : timecode des boutons', () => {
    it('un bouton ciblé sur un titre se lance depuis son timecode', async () => {
        const res = await createTarget({ trackId, start: 83 });
        expect(res.status).toBe(201);
        const button = res.body.at(-1);
        expect(button.actions).toEqual({ slot: 'music', trackId, start: 83 });

        expect((await app.request('POST', url(`/buttons/${button.id}/run`), { token: gm })).status).toBe(200);
        const slot = await music();
        expect(slot.trackId).toBe(trackId);
        expect(slot.start).toBe(83);
        expect(slot.position).toBe(83);
        await removeAll();
    });

    it('refuse un timecode illisible, ou sur une playlist ; au-delà de la durée, depuis le début', async () => {
        expect((await createTarget({ trackId, start: 'abc' })).status).toBe(400);
        expect((await createTarget({ trackId, start: -4 })).status).toBe(400);
        expect((await createTarget({ trackId, start: true })).status).toBe(400);
        expect((await createTarget({ trackId, start: [83] })).status).toBe(400);
        expect((await createTarget({ trackId, start: '83' })).status).toBe(400);
        expect((await createTarget({ playlistId, start: 30 })).status).toBe(400);

        const res = await createTarget({ trackId, start: 400 });
        expect(res.status).toBe(201);
        expect(res.body.at(-1).actions).toEqual({ slot: 'music', trackId });
        // Arrondi avant la comparaison : 299,8 s sur 300 s tomberait pile à la fin
        expect((await createTarget({ trackId, start: 299.8 })).body.at(-1).actions).toEqual({ slot: 'music', trackId });
        await removeAll();
    });

    it('un départ au-delà d\'une durée connue après coup repart du début', async () => {
        // Durée inconnue à la création : le départ est gardé
        const id = (await createTarget({ trackId: newId, start: 400 })).body.at(-1).id;
        // Durée connue au lancement : depuis le début
        getDbForSystem(audioConfig).prepare('UPDATE audio_tracks SET duration = 200 WHERE id = ?').run(newId);
        await app.request('POST', url(`/buttons/${id}/run`), { token: gm });
        expect(await music()).toMatchObject({ trackId: newId, position: 0, start: 0 });
        await removeAll();
    });

    it('une durée remontée plus courte que le départ remet le départ à 0', async () => {
        const id = (await createTarget({ trackId: shortId, start: 100 })).body.at(-1).id;
        await app.request('POST', url(`/buttons/${id}/run`), { token: gm });
        await command({ slot: 'music', action: 'duration', trackId: shortId, duration: 50 });
        expect((await music()).start).toBe(0);
        await command({ slot: 'music', action: 'stop' });
        getDbForSystem(audioConfig).prepare('UPDATE audio_tracks SET duration = NULL WHERE id = ?').run(shortId);
        await removeAll();
    });

    it('le timecode d\'un bouton ciblé se change et se vide', async () => {
        const id = (await createTarget({ trackId })).body.at(-1).id;
        let res = await app.request('PUT', url(`/buttons/${id}`), { body: { start: 42 }, token: gm });
        expect(res.body.find(b => b.id === id).actions.start).toBe(42);
        res = await app.request('PUT', url(`/buttons/${id}`), { body: { start: null }, token: gm });
        expect(res.body.find(b => b.id === id).actions).not.toHaveProperty('start');
        expect((await app.request('PUT', url(`/buttons/${id}`), { body: { start: 'x' }, token: gm })).status).toBe(400);
        await removeAll();
    });

    it('une scène s\'enregistre sans position, son départ se règle à la main', async () => {
        await command({ slot: 'music', action: 'play', trackId, position: 120 });
        const created = await app.request('POST', url('/buttons'), { body: { label: 'Taverne', mode: 'scene' }, token: gm });
        const scene = created.body.at(-1);
        expect(scene.actions.slots.music).toEqual({ trackId, playlistId, mode: 'playlist' });

        let res = await app.request('PUT', url(`/buttons/${scene.id}`), { body: { starts: { music: 30 } }, token: gm });
        expect(res.body.find(b => b.id === scene.id).actions.slots.music.start).toBe(30);
        // Piste vide ou inconnue : refusé
        expect((await app.request('PUT', url(`/buttons/${scene.id}`), { body: { starts: { ambience1: 10 } }, token: gm })).status).toBe(400);
        expect((await app.request('PUT', url(`/buttons/${scene.id}`), { body: { starts: { nope: 10 } }, token: gm })).status).toBe(400);

        await command({ slot: 'music', action: 'stop' });
        await app.request('POST', url(`/buttons/${scene.id}/run`), { token: gm });
        expect((await music()).position).toBe(30);

        res = await app.request('PUT', url(`/buttons/${scene.id}`), { body: { starts: { music: null } }, token: gm });
        expect(res.body.find(b => b.id === scene.id).actions.slots.music).not.toHaveProperty('start');
        await removeAll();
    });

    it('en boucle, le morceau repart de son timecode', async () => {
        await command({ slot: 'music', action: 'mode', mode: 'loop' });
        const id = (await createTarget({ trackId: shortId, start: 60 })).body.at(-1).id;
        await app.request('POST', url(`/buttons/${id}/run`), { token: gm });
        // Durée remontée par le lecteur du MJ : fin dans 0,2 s (+ 1 s de marge du serveur)
        await command({ slot: 'music', action: 'duration', trackId: shortId, duration: 60.2 });
        const before = (await music()).refTime;
        await wait(1500);

        const slot = await music();
        expect(slot.trackId).toBe(shortId);
        expect(slot.refTime).toBeGreaterThan(before);
        expect(slot.position).toBe(60);
        await command({ slot: 'music', action: 'stop' });
        await removeAll();
    });
});
