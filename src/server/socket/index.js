/**
 * src/server/socket/index.js
 *
 * Initialise Socket.io et enregistre tous les handlers.
 * Contient les structures d'état partagées entre handlers.
 *
 * Structures :
 *   onlineCharacters : Map<characterId, { socketId, system, name, playerName, ... }>
 *   activeSessions   : Map<socketId, Set<{ system, sessionId }>>
 *   sessionTimers    : Map<`${system}_${sessionId}`, TimeoutId>
 */

const { registerHandlers } = require('./handlers');

/* ── Structures partagées ───────────────────────────────────────────────────── */
const onlineCharacters = new Map(); // characterId → données présence
const activeSessions   = new Map(); // socketId    → Set<{ system, sessionId }>
const sessionTimers    = new Map(); // `${system}_${sessionId}` → TimeoutId

const sharedState = { onlineCharacters, activeSessions, sessionTimers };

/* ── Init ────────────────────────────────────────────────────────────────────── */
function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);
        registerHandlers(io, socket, sharedState);
    });
}

module.exports = { initSocket, sharedState };