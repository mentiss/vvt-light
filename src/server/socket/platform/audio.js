/**
 * src/server/socket/platform/audio.js
 *
 * Brique audio (documentations/spec_audio.md §11.5).
 *
 * Handlers :
 *   audio-ping : heure du serveur, pour l'écart d'horloge des lecteurs audio.
 *                Lecture seule : aucune écriture, aucune diffusion.
 *
 * L'état de lecture (sharedState.audioStates) est écrit par les routes HTTP du MJ
 * (routes/audio.js), jamais par un événement socket.
 */

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function register(io, socket) {
    socket.on('audio-ping', (ack) => {
        if (typeof ack === 'function') ack(Date.now());
    });
}

module.exports = { register };
