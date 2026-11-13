// tests/server/socket/journal.test.js
// Relais Yjs du journal partagé (documentations/plateforme/spec_journal.md, partie III §12) :
// ouverture refusée sans jeton ou hors de la table, mise à jour refusée d'un socket qui n'a pas
// ouvert l'entrée, relais aux autres éditeurs, état enregistré en base, premier ouvrant chargé
// d'y mettre le HTML (seed).
import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import { listSlugs, gmToken, playerToken } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const Y = require('yjs');
const Database = require('better-sqlite3');
const Loader = require('../../../src/server/systems/Loader.js');
const journal = require('../../../src/server/socket/platform/journal.js');

const SLUG = 'cyberpunk';

// Socket simulé : émissions vers lui (sent), vers une room (relayed), rooms rejointes
function fakeSocket(id, log) {
    const socket = new EventEmitter();
    socket.id = id;
    socket.sent = [];
    socket.rooms = new Set();
    socket.join = (room) => socket.rooms.add(room);
    socket.leave = (room) => socket.rooms.delete(room);
    socket.emit = (event, payload) => { socket.sent.push({ event, payload }); return true; };
    const to = (room) => ({ emit: (event, payload) => log.push({ from: id, room, event, payload }) });
    socket.to = to;
    socket.volatile = { to };
    return socket;
}

describe('relais Yjs du journal partagé', () => {
    let db, table, member, outsider, entryId, shared, log;

    beforeAll(() => {
        listSlugs();
        db = new Database(':memory:');
        db.exec(fs.readFileSync(Loader.getSystem(SLUG).schemaPath, 'utf8'));
        journal.setDbForTests(() => db);
        table = db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Saga', 'YJS001', 'yjs-1')").run().lastInsertRowid;
        member = db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('YJC001', 'yjc-1', 'j', 'Brynja')").run().lastInsertRowid;
        outsider = db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('YJC002', 'yjc-2', 'j', 'Sigrid')").run().lastInsertRowid;
        db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(table, member);
        entryId = db.prepare("INSERT INTO table_journal (session_id, title, body) VALUES (?, 'Résumé', '<p>Avant</p>')").run(table).lastInsertRowid;
    });

    const open = (socket, token) => {
        socket.listeners('journal-doc-open')[0]({ system: SLUG, sessionId: Number(table), entryId: Number(entryId), token });
        return socket.sent.at(-1);
    };
    const connect = (id) => {
        const socket = fakeSocket(id, log);
        journal.register({}, socket, shared);
        return socket;
    };

    it('ouverture : jeton absent ou invalide → auth ; hors de la table → denied', () => {
        shared = { journalDocs: new Map() };
        log = [];
        expect(open(connect('a'), undefined).payload.error).toBe('auth');
        expect(open(connect('b'), 'faux').payload.error).toBe('auth');
        expect(open(connect('c'), playerToken(Number(outsider))).payload.error).toBe('denied');
        expect(shared.journalDocs.size).toBe(0);
    });

    it('premier ouvrant : seed ; le suivant non ; relais aux autres éditeurs ; état enregistré à la fermeture', () => {
        shared = { journalDocs: new Map() };
        log = [];
        const a = connect('a');
        const b = connect('b');
        const stateA = open(a, playerToken(Number(member)));
        expect(stateA.event).toBe('journal-doc-state');
        expect(stateA.payload.seed).toBe(true);
        expect(open(b, gmToken()).payload.seed).toBe(false);

        // a écrit : relayé à la room de l'entrée, appliqué au document du serveur
        const docA = new Y.Doc();
        docA.getText('t').insert(0, 'Bonjour');
        const update = Y.encodeStateAsUpdate(docA);
        a.listeners('journal-doc-update')[0]({ system: SLUG, entryId: Number(entryId), update });
        expect(log.at(-1)).toMatchObject({ from: 'a', room: `journal-doc:${SLUG}:${entryId}`, event: 'journal-doc-update' });

        a.listeners('disconnect')[0]();
        b.listeners('journal-doc-close')[0]({ system: SLUG, entryId: Number(entryId) });
        expect(shared.journalDocs.size).toBe(0);
        const saved = db.prepare('SELECT ydoc FROM table_journal WHERE id = ?').get(entryId).ydoc;
        const restored = new Y.Doc();
        Y.applyUpdate(restored, new Uint8Array(saved));
        expect(restored.getText('t').toString()).toBe('Bonjour');
    });

    it('rouvert : l\'état vient de la base, plus de seed', () => {
        shared = { journalDocs: new Map() };
        log = [];
        const c = connect('c');
        const state = open(c, gmToken());
        expect(state.payload.seed).toBe(false);
        const doc = new Y.Doc();
        Y.applyUpdate(doc, new Uint8Array(state.payload.state));
        expect(doc.getText('t').toString()).toBe('Bonjour');
    });

    it('mise à jour d\'un socket qui n\'a pas ouvert l\'entrée : ignorée', () => {
        shared = { journalDocs: new Map() };
        log = [];
        const intruder = connect('x');
        const doc = new Y.Doc();
        doc.getText('t').insert(0, 'Piratage');
        intruder.listeners('journal-doc-update')[0]({ system: SLUG, entryId: Number(entryId), update: Y.encodeStateAsUpdate(doc) });
        expect(log).toEqual([]);
    });
});
