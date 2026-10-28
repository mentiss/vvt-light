// src/server/socket/audioProto.js
// ─────────────────────────────────────────────────────────────────────────────
// PROTOTYPE TEMPORAIRE (documentations/spec_audio.md §9.9) : relais de la page
// /tools/audio pour tester la synchronisation entre plusieurs clients.
// Un seul état en mémoire, une room fixe, sans base ni connexion.
// À supprimer avec la page une fois la brique en place (la vraie logique est
// dans routes/audio.js).
// ─────────────────────────────────────────────────────────────────────────────

const ROOM = 'audio_proto';
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const state = { status: 'stopped', youtubeId: null, position: 0, refTime: 0, duration: null };

const currentPosition = () => (state.status === 'playing' ? state.position + (Date.now() - state.refTime) / 1000 : state.position);

function register(io, socket) {
    const broadcast = () => io.to(ROOM).emit('proto-audio-state', { state, serverTime: Date.now() });

    socket.on('proto-audio-join', () => {
        socket.join(ROOM);
        socket.emit('proto-audio-state', { state, serverTime: Date.now() });
    });

    socket.on('proto-audio-leave', () => socket.leave(ROOM));

    // Heure du serveur, pour l'estimation de l'écart d'horloge des clients
    socket.on('proto-audio-ping', (ack) => { if (typeof ack === 'function') ack(Date.now()); });

    socket.on('proto-audio-command', ({ action, youtubeId, position } = {}) => {
        const now = Date.now();
        if (action === 'play' && YOUTUBE_ID.test(youtubeId)) {
            Object.assign(state, { status: 'playing', youtubeId, position: Math.max(0, Number(position) || 0), refTime: now, duration: null });
        } else if (action === 'pause' && state.status === 'playing') {
            Object.assign(state, { status: 'paused', position: currentPosition(), refTime: now });
        } else if (action === 'resume' && state.status === 'paused') {
            Object.assign(state, { status: 'playing', refTime: now });
        } else if (action === 'seek' && state.youtubeId && Number.isFinite(Number(position))) {
            Object.assign(state, { position: Math.max(0, Number(position)), refTime: now });
        } else if (action === 'stop') {
            Object.assign(state, { status: 'stopped', youtubeId: null, position: 0, refTime: now, duration: null });
        } else {
            return;
        }
        broadcast();
    });
}

module.exports = { register };
