// tests/server/routes/audio.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Route de la musique (documentations/spec_audio.md §14, §15) : sources hors
// YouTube, timecode des boutons, boutons piste par piste (Lancer / Arrêter / Ne pas
// toucher, mode, limite, ménage) et fondu d'un bouton. La base du slug est en mémoire (slugApp) ; la base du module
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

const state = async () => (await app.request('GET', url(), { token: gm })).body.state;
const createButton = (slots, extra = {}) => app.request('POST', url('/buttons'), { body: { label: 'Combat', slots, ...extra }, token: gm });
const update = (id, body) => app.request('PUT', url(`/buttons/${id}`), { body, token: gm });
const run = (id) => app.request('POST', url(`/buttons/${id}/run`), { token: gm });
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
    it('un bouton sur un titre se lance depuis son timecode', async () => {
        const res = await createButton({ music: { trackId, start: 83 } });
        expect(res.status).toBe(201);
        const button = res.body.at(-1);
        expect(button.actions).toEqual({ slots: { music: { trackId, playlistId, start: 83 } } });

        expect((await run(button.id)).status).toBe(200);
        const slot = await music();
        expect(slot.trackId).toBe(trackId);
        expect(slot.start).toBe(83);
        expect(slot.position).toBe(83);
        await removeAll();
    });

    it('refuse un timecode illisible, ou sur une playlist, ou au hasard ; au-delà de la durée, depuis le début', async () => {
        for (const start of ['abc', -4, true, [83], '83']) {
            expect((await createButton({ music: { trackId, start } })).status).toBe(400);
        }
        expect((await createButton({ music: { playlistId, start: 30 } })).status).toBe(400);
        expect((await createButton({ music: { trackId, mode: 'shuffle', start: 30 } })).status).toBe(400);

        const res = await createButton({ music: { trackId, start: 400 } });
        expect(res.status).toBe(201);
        expect(res.body.at(-1).actions.slots.music).toEqual({ trackId, playlistId });
        // Arrondi avant la comparaison : 299,8 s sur 300 s tomberait pile à la fin
        expect((await createButton({ music: { trackId, start: 299.8 } })).body.at(-1).actions.slots.music).toEqual({ trackId, playlistId });
        await removeAll();
    });

    it('un départ au-delà d\'une durée connue après coup repart du début', async () => {
        // Durée inconnue à la création : le départ est gardé
        const id = (await createButton({ music: { trackId: newId, start: 400 } })).body.at(-1).id;
        // Durée connue au lancement : depuis le début
        getDbForSystem(audioConfig).prepare('UPDATE audio_tracks SET duration = 200 WHERE id = ?').run(newId);
        await run(id);
        expect(await music()).toMatchObject({ trackId: newId, position: 0, start: 0 });
        await removeAll();
    });

    it('une durée remontée plus courte que le départ remet le départ à 0', async () => {
        const id = (await createButton({ music: { trackId: shortId, start: 100 } })).body.at(-1).id;
        await run(id);
        await command({ slot: 'music', action: 'duration', trackId: shortId, duration: 50 });
        expect((await music()).start).toBe(0);
        await command({ slot: 'music', action: 'stop' });
        getDbForSystem(audioConfig).prepare('UPDATE audio_tracks SET duration = NULL WHERE id = ?').run(shortId);
        await removeAll();
    });

    it('le timecode se change et se vide en modifiant les pistes du bouton', async () => {
        const id = (await createButton({ music: { trackId } })).body.at(-1).id;
        let res = await update(id, { slots: { music: { trackId, start: 42 } } });
        expect(res.body.find(b => b.id === id).actions.slots.music.start).toBe(42);
        res = await update(id, { slots: { music: { trackId } } });
        expect(res.body.find(b => b.id === id).actions.slots.music).not.toHaveProperty('start');
        expect((await update(id, { slots: { music: { trackId, start: 'x' } } })).status).toBe(400);
        await removeAll();
    });

    it('en boucle, le morceau repart de son timecode', async () => {
        await command({ slot: 'music', action: 'mode', mode: 'loop' });
        // Mode absent : la piste garde la Boucle
        const id = (await createButton({ music: { trackId: shortId, start: 60 } })).body.at(-1).id;
        await run(id);
        // Durée remontée par le lecteur du MJ : fin dans 0,2 s (+ 1 s de marge du serveur)
        await command({ slot: 'music', action: 'duration', trackId: shortId, duration: 60.2 });
        const before = (await music()).refTime;
        await wait(1500);

        const slot = await music();
        expect(slot.trackId).toBe(shortId);
        expect(slot.mode).toBe('loop');
        expect(slot.refTime).toBeGreaterThan(before);
        expect(slot.position).toBe(60);
        await command({ slot: 'music', action: 'stop' });
        await command({ slot: 'music', action: 'mode', mode: 'playlist' });
        await removeAll();
    });
});

describe('Musique : boutons piste par piste (§15)', () => {
    it('Lancer, Arrêter, Ne pas toucher', async () => {
        await command({ slot: 'ambience1', action: 'play', trackId: shortId });
        await command({ slot: 'ambience2', action: 'play', trackId: newId });
        const id = (await createButton({ music: { trackId }, ambience2: null })).body.at(-1).id;
        await run(id);

        const { slots } = await state();
        expect(slots.music).toMatchObject({ status: 'playing', trackId });
        expect(slots.ambience1).toMatchObject({ status: 'playing', trackId: shortId });   // pas touchée
        expect(slots.ambience2.status).toBe('stopped');                                    // arrêtée
        await command({ action: 'stopAll' });
        await removeAll();
    });

    it('le mode fixé par le bouton s\'applique, absent il est gardé', async () => {
        await command({ slot: 'music', action: 'mode', mode: 'loop' });
        const keep = (await createButton({ music: { trackId } })).body.at(-1).id;
        const set = (await createButton({ music: { playlistId, mode: 'shuffle' } })).body.at(-1).id;
        await run(keep);
        expect((await music()).mode).toBe('loop');
        await run(set);
        expect((await music()).mode).toBe('shuffle');
        expect((await music()).playlistId).toBe(playlistId);
        await command({ slot: 'music', action: 'stop' });
        await command({ slot: 'music', action: 'mode', mode: 'playlist' });
        await removeAll();
    });

    it('refuse un bouton mal formé', async () => {
        const refused = [
            {},                                                   // aucune piste
            { music: null, ambience1: null },                     // rien à lancer
            { nope: { trackId } },                                // piste inconnue
            { music: 'x' },                                       // entrée illisible
            { music: {} },                                        // ni titre ni playlist
            { music: { trackId: '12' } },                         // identifiant en texte
            { music: { trackId: 999999 } },                       // titre absent de la table
            { effect: { playlistId } },                           // playlist sur l'effet
            { ambience1: { playlistId, mode: 'shuffle' } },       // mode non permis sur la piste
        ];
        for (const slots of refused) expect((await createButton(slots)).status).toBe(400);
        expect((await createButton({ music: { trackId } }, { fade: 'oui' })).status).toBe(400);
        expect((await app.request('POST', url('/buttons'), { body: { label: 'X', slots: [] }, token: gm })).status).toBe(400);
    });

    it('le nom et le fondu se changent sans toucher aux pistes', async () => {
        const id = (await createButton({ music: { trackId } })).body.at(-1).id;
        const res = await update(id, { label: 'Présent', fade: true });
        expect(res.body.find(b => b.id === id)).toMatchObject({ label: 'Présent', actions: { fade: true, slots: { music: { trackId, playlistId } } } });
        expect((await update(id, { label: ' ' })).status).toBe(400);
        await removeAll();
    });

    it('12 boutons au plus', async () => {
        for (let i = 0; i < 12; i += 1) expect((await createButton({ music: { trackId } })).status).toBe(201);
        expect((await createButton({ music: { trackId } })).status).toBe(409);
        await removeAll();
    });

    it('ménage : la piste au contenu supprimé passe à Arrêter, un bouton qui ne lance plus rien disparaît', async () => {
        const db = getDbForSystem(audioConfig);
        const insert = db.prepare('INSERT INTO audio_tracks (playlist_id, media_id, title, position) VALUES (?, ?, ?, ?)');
        const gone = Number(insert.run(playlistId, 'ddddddddddd', 'Éphémère', 20).lastInsertRowid);
        const both = (await createButton({ music: { trackId }, ambience1: { trackId: gone } })).body.at(-1).id;
        const alone = (await createButton({ ambience2: { trackId: gone } })).body.at(-1).id;

        await app.request('DELETE', url(`/tracks/${gone}`), { token: gm });
        const buttons = (await app.request('GET', url('/buttons'), { token: gm })).body;
        expect(buttons.find(b => b.id === both).actions.slots).toEqual({ music: { trackId, playlistId }, ambience1: null });
        expect(buttons.find(b => b.id === alone)).toBeUndefined();
        await removeAll();
    });
});

describe('Musique : fondu d\'un bouton (§15.5)', () => {
    it('le morceau qui jouait est gardé pour le lecteur sortant, la piste change de lecteur', async () => {
        await command({ slot: 'music', action: 'play', trackId: shortId, position: 10 });
        await command({ slot: 'ambience1', action: 'play', trackId: newId });
        const lane = (await music()).lane;
        const id = (await createButton({ music: { trackId } }, { fade: true })).body.at(-1).id;
        await run(id);

        const { slots } = await state();
        expect(slots.music).toMatchObject({ trackId, lane: lane + 1 });
        expect(slots.music.fade).toMatchObject({ duration: 3000, from: { mediaId: 'bbbbbbbbbbb', source: 'youtube', lane } });
        expect(slots.music.fade.from.position).toBeGreaterThanOrEqual(10);
        // Piste non citée : ni changée ni en fondu
        expect(slots.ambience1).toMatchObject({ trackId: newId, fade: null });

        // Un changement ordinaire efface le fondu, sans changer de lecteur
        await command({ slot: 'music', action: 'play', trackId: shortId });
        expect(await music()).toMatchObject({ fade: null, lane: lane + 1 });
        await command({ action: 'stopAll' });
        await removeAll();
    });

    it('Arrêter en fondu : le son descend jusqu\'au silence ; rien ne jouait : pas de fondu ; l\'effet reste sec', async () => {
        await command({ slot: 'music', action: 'play', trackId });
        await command({ slot: 'effect', action: 'play', trackId: shortId });
        const id = (await createButton({ music: null, ambience1: null, effect: { trackId: newId } }, { fade: true })).body.at(-1).id;
        await run(id);

        const { slots } = await state();
        expect(slots.music.status).toBe('stopped');
        expect(slots.music.fade.from.mediaId).toBe('aaaaaaaaaaa');
        expect(slots.ambience1.fade).toBeNull();
        expect(slots.effect).toMatchObject({ trackId: newId, fade: null });
        await command({ action: 'stopAll' });
        await removeAll();
    });
});
