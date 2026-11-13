/**
 * src/server/socket/platform/journal.js
 *
 * Écriture à plusieurs dans le journal partagé (documentations/plateforme/spec_journal.md,
 * partie III §12) : relais Yjs entre les éditeurs d'une même entrée, document gardé en
 * mémoire tant qu'au moins un éditeur l'a ouvert, état enregistré en base (table_journal.ydoc).
 * Le HTML (aperçu, recherche, export) est enregistré par les clients en HTTP (PUT …/body).
 *
 * Événements :
 *   journal-doc-open      { system, sessionId, entryId, token } → journal-doc-state { system, entryId, state, seed }
 *                         (ou journal-doc-error { system, entryId, error : 'auth' | 'denied' | 'missing' })
 *   journal-doc-update    { system, entryId, update }  appliqué puis relayé aux autres éditeurs
 *   journal-doc-awareness { system, entryId, update }  curseurs et noms, relais seulement (volatile)
 *   journal-doc-close     { system, entryId }
 *
 * Écriture par socket, par nature (temps réel) : réservée aux sockets qui ont ouvert l'entrée
 * avec un jeton valide et sont membres de la table (MJ partout). Création, suppression,
 * épinglage et titre restent en HTTP (routes/tableJournal.js).
 *
 * État partagé : journalDocs Map<`${slug}:${entryId}`, { doc, sockets, timer, seeding }>.
 */

const Y = require('yjs');
const { getSystem, getConfigForSystem } = require('../../systems/Loader');
const { getDbForSystem } = require('../../db');
const { checkAccessToken } = require('../../utils/jwt');

const SAVE_DELAY_MS = 2000;
const MAX_UPDATE_BYTES = 8 * 1024 * 1024;   // une image collée (spec §12), comme maxHttpBufferSize

const docRoom = (key) => `journal-doc:${key}`;

// Connexion de la base d'un slug, prise dans le handler (B-DB) ; remplaçable par les tests
// (base en mémoire créée depuis le schéma, tests/server/socket/journal.test.js)
let dbFor = (system) => getDbForSystem(getConfigForSystem(system));
const setDbForTests = (fn) => { dbFor = fn; };

/** Payload { system, entryId } valide, ou null */
function readTarget(payload) {
    const { system, entryId } = payload ?? {};
    if (typeof system !== 'string' || !getSystem(system)) return null;
    if (typeof entryId !== 'number' || !Number.isInteger(entryId) || entryId <= 0) return null;
    return { system, entryId, key: `${system}:${entryId}` };
}

const toBytes = (data) => (data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : null);

function register(io, socket, sharedState) {
    const docs = sharedState.journalDocs;
    const opened = new Set();   // clés des entrées ouvertes par ce socket

    // Enregistrement de l'état Yjs en base (connexion prise au moment de l'écriture, B-DB)
    const persist = (key) => {
        const item = docs.get(key);
        if (!item) return;
        clearTimeout(item.timer);
        item.timer = null;
        try {
            const db = dbFor(item.system);
            db.prepare('UPDATE table_journal SET ydoc = ? WHERE id = ?').run(Buffer.from(Y.encodeStateAsUpdate(item.doc)), item.entryId);
        } catch (error) {
            console.error('[journal] Error saving collaborative state:', error);
        }
    };
    const schedule = (item, key) => {
        clearTimeout(item.timer);
        item.timer = setTimeout(() => persist(key), SAVE_DELAY_MS);
    };

    const leave = (key) => {
        if (!opened.delete(key)) return;
        socket.leave(docRoom(key));
        const item = docs.get(key);
        if (!item) return;
        item.sockets.delete(socket.id);
        if (item.seeding === socket.id) item.seeding = null;
        if (item.sockets.size === 0) {
            persist(key);
            item.doc.destroy();
            docs.delete(key);
        }
    };

    socket.on('journal-doc-open', (payload) => {
        const target = readTarget(payload);
        if (!target || typeof payload.sessionId !== 'number' || !Number.isInteger(payload.sessionId)) return;
        const { system, entryId, key } = target;
        const fail = (error) => socket.emit('journal-doc-error', { system, entryId, error });

        // Identité : le jeton d'accès, comme les routes (une entrée manquante est un refus)
        const user = typeof payload.token === 'string' ? checkAccessToken(payload.token) : null;
        if (!user) return fail('auth');

        try {
            const db = dbFor(system);
            const row = db.prepare('SELECT id, ydoc FROM table_journal WHERE id = ? AND session_id = ?').get(entryId, payload.sessionId);
            if (!row) return fail('missing');
            if (!user.isGM) {
                const member = Number.isInteger(user.characterId) && db
                    .prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?')
                    .get(payload.sessionId, user.characterId);
                if (!member) return fail('denied');
            }

            let item = docs.get(key);
            if (!item) {
                const doc = new Y.Doc();
                if (row.ydoc) Y.applyUpdate(doc, new Uint8Array(row.ydoc));
                item = { doc, system, entryId, sockets: new Set(), timer: null, seeding: null, seeded: !!row.ydoc };
                docs.set(key, item);
            }
            item.sockets.add(socket.id);
            opened.add(key);
            socket.join(docRoom(key));

            // Entrée sans état Yjs (créée avant ou copiée d'une note) : le premier qui l'ouvre y charge le HTML
            const seed = !item.seeded && !item.seeding;
            if (seed) item.seeding = socket.id;
            socket.emit('journal-doc-state', { system, entryId, state: Buffer.from(Y.encodeStateAsUpdate(item.doc)), seed });
        } catch (error) {
            console.error('[journal] Error opening collaborative entry:', error);
            fail('missing');
        }
    });

    socket.on('journal-doc-update', (payload) => {
        const target = readTarget(payload);
        if (!target || !opened.has(target.key)) return;
        const update = toBytes(payload.update);
        if (!update || update.byteLength > MAX_UPDATE_BYTES) return;
        const item = docs.get(target.key);
        if (!item) return;
        try {
            Y.applyUpdate(item.doc, update, socket.id);
        } catch (error) {
            console.error('[journal] Invalid collaborative update:', error);
            return;
        }
        if (item.seeding === socket.id) { item.seeding = null; item.seeded = true; }
        socket.to(docRoom(target.key)).emit('journal-doc-update', { system: target.system, entryId: target.entryId, update: Buffer.from(update) });
        schedule(item, target.key);
    });

    socket.on('journal-doc-awareness', (payload) => {
        const target = readTarget(payload);
        if (!target || !opened.has(target.key)) return;
        const update = toBytes(payload.update);
        if (!update || update.byteLength > 64 * 1024) return;
        socket.volatile.to(docRoom(target.key)).emit('journal-doc-awareness', { system: target.system, entryId: target.entryId, update: Buffer.from(update) });
    });

    socket.on('journal-doc-close', (payload) => {
        const target = readTarget(payload);
        if (target) leave(target.key);
    });

    socket.on('disconnect', () => { for (const key of [...opened]) leave(key); });
}

module.exports = { register, setDbForTests };
