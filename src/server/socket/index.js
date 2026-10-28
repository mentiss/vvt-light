/**
 * src/server/socket/index.js
 *
 * Initialise Socket.io et enregistre tous les handlers.
 * Contient les structures d'état partagées entre handlers.
 *
 * Structures :
 *   onlineCharacters : Map<presenceKey, { socketId, slug, characterId, name, playerName, ... }>
 *                      presenceKey = `${slug}:${characterId}` (un id n'est unique que dans la base de son slug)
 *   activeSessions   : Map<socketId, Set<{ system, sessionId }>>
 *   sessionTimers    : Map<`${system}_${sessionId}`, TimeoutId>
 *   audioStates      : Map<`${system}_${sessionId}`, état de lecture audio> (routes/audio.js, spec_audio.md §9.3)
 */

const { registerHandlers, presenceKey } = require('./handlers');

/* ── Structures partagées ───────────────────────────────────────────────────── */
const onlineCharacters = new Map(); // presenceKey → données présence
const activeSessions   = new Map(); // socketId    → Set<{ system, sessionId }>
const sessionTimers    = new Map(); // `${system}_${sessionId}` → TimeoutId
const audioStates      = new Map(); // `${system}_${sessionId}` → état de lecture audio

const sharedState = { onlineCharacters, activeSessions, sessionTimers, audioStates };

/* ── Init ────────────────────────────────────────────────────────────────────── */
function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);
        registerHandlers(io, socket, sharedState);
        // PROTOTYPE TEMPORAIRE du lecteur audio (spec_audio.md §9.9), à retirer avec la page /tools/audio
        require('./audioProto').register(io, socket);
    });
}

module.exports = { initSocket, sharedState, presenceKey };