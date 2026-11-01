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
 * Puis les handlers des slugs, découverts par le Loader (systems/:slug/socket/*.js).
 *
 * Structures :
 *   onlineCharacters : Map<presenceKey, { socketId, slug, characterId, name, playerName, ... }>
 *                      presenceKey = `${slug}:${characterId}` (un id n'est unique que dans la base de son slug)
 *   activeSessions   : Map<socketId, Set<{ system, sessionId }>>
 *   sessionTimers    : Map<`${system}_${sessionId}`, TimeoutId>
 *   audioStates      : Map<`${system}_${sessionId}`, état de lecture audio, quatre pistes> (routes/audio.js, spec_audio.md §11.3)
 */

const { getAllSystems, getSystemSocketHandlers } = require('../systems/Loader');
const presence = require('./platform/presence');
const sessions = require('./platform/sessions');
const audio    = require('./platform/audio');

const { presenceKey } = presence;

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
        socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));

        // Plateforme (ordre conservé : la présence se nettoie avant les sessions)
        presence.register(io, socket, sharedState);
        sessions.register(io, socket, sharedState);
        audio.register(io, socket, sharedState);

        // Slugs : handlers découverts par le Loader
        for (const [slug] of getAllSystems()) {
            for (const register of getSystemSocketHandlers(slug)) {
                register(io, socket);
            }
        }
    });
}

module.exports = { initSocket, sharedState, presenceKey };