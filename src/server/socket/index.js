/**
 * src/server/socket/index.js
 *
 * Initialise Socket.io et enregistre tous les handlers.
 * Contient les structures d'état partagées entre handlers.
 *
 * Handlers de la plateforme, un fichier par domaine dans platform/ (chacun
 * exporte register(io, socket, sharedState) et gère sa propre déconnexion) :
 *   presence.js : character-loaded, character-left
 *   sessions.js : gm-set-active-session, gm-clear-session, join-session, leave-session
 *   audio.js    : audio-ping
 *   board.js    : board-ping, board-drag (relais éphémère du tableau, sans écriture)
 *   journal.js  : journal-doc-* (écriture à plusieurs dans le journal partagé, Yjs, spec_journal.md §12)
 * Puis les handlers des slugs, découverts par le Loader (systems/:slug/socket/*.js).
 *
 * Structures :
 *   onlineCharacters : Map<presenceKey, { socketId, slug, characterId, name, playerName, ... }>
 *                      presenceKey = `${slug}:${characterId}` (un id n'est unique que dans la base de son slug)
 *   activeTables     : Map<slug, Map<sessionId, { posts: Set<socketId>, timer }>> : tables actives,
 *                      ouvertes par les postes MJ (utils/activeTables.js, spec_tables.md §4.1)
 *   audioStates      : Map<`${system}_${sessionId}`, état de lecture audio, quatre pistes> (routes/audio.js, spec_audio.md §11.3)
 *   initiativeStates : Map<`${system}_${sessionId}`, { state, avatars }> : initiative de la table,
 *                      écrite par le MJ (routes/initiative.js, spec_initiative.md §9.4)
 *   journalDocs      : Map<`${slug}:${entryId}`, document Yjs ouvert d'une entrée du journal partagé>
 */

const { getAllSystems, getSystem, getSystemSocketHandlers } = require('../systems/Loader');
const presence = require('./platform/presence');
const sessions = require('./platform/sessions');
const audio    = require('./platform/audio');
const board    = require('./platform/board');
const journal  = require('./platform/journal');

const { presenceKey } = presence;

/* ── Structures partagées ───────────────────────────────────────────────────── */
const onlineCharacters = new Map(); // presenceKey → données présence
const activeTables     = new Map(); // slug        → Map<sessionId, { posts, timer }>
const audioStates      = new Map(); // `${system}_${sessionId}` → état de lecture audio
const initiativeStates = new Map(); // `${system}_${sessionId}` → { state, avatars } de l'initiative
const journalDocs      = new Map(); // `${slug}:${entryId}` → document Yjs ouvert (journal partagé)

const sharedState = { onlineCharacters, activeTables, audioStates, initiativeStates, journalDocs };

/* ── Init ────────────────────────────────────────────────────────────────────── */
function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);
        socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));

        // Room du slug de la page : slug donné dans la poignée de main, refaite à chaque
        // reconnexion ; y reçoit la liste des tables actives (spec_tables.md §4.2)
        const { system } = socket.handshake.query ?? {};
        if (typeof system === 'string' && getSystem(system)) socket.join(sessions.slugRoom(system));

        // Plateforme (ordre conservé : la présence se nettoie avant les sessions)
        presence.register(io, socket, sharedState);
        sessions.register(io, socket, sharedState);
        audio.register(io, socket, sharedState);
        board.register(io, socket, sharedState);
        journal.register(io, socket, sharedState);

        // Slugs : handlers découverts par le Loader
        for (const [slug] of getAllSystems()) {
            for (const register of getSystemSocketHandlers(slug)) {
                register(io, socket);
            }
        }
    });
}

module.exports = { initSocket, sharedState, presenceKey };