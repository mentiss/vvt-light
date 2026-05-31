/**
 * src/server/socket/handlers.js
 *
 * Tous les handlers Socket.io génériques de la plateforme.
 * Reçoit io, socket, et sharedState en paramètres — pas d'import circulaire.
 *
 * Handlers couverts :
 *   Présence   : character-loaded, character-left
 *   Sessions   : gm-set-active-session, gm-clear-session
 *   Rooms      : join-session, leave-session
 *   Disconnect : nettoyage présence + timer 5min sur sessions GM
 *   Auto-découverte : handlers slug-spécifiques via Loader
 */

const { getAllSystems, getSystemSocketHandlers } = require('../systems/Loader');

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/* ── Helpers ────────────────────────────────────────────────────────────────── */

/**
 * Retourne tous les sessionIds actifs pour un slug donné.
 * Parcourt toutes les entrées de activeSessions (toutes les connexions GM).
 *
 * @param {Map} activeSessions
 * @param {string} system
 * @returns {number[]}
 */
function getActiveSessionsForSlug(activeSessions, system) {
    const ids = new Set();
    for (const sessions of activeSessions.values()) {
        for (const entry of sessions) {
            if (entry.system === system) ids.add(entry.sessionId);
        }
    }
    return [...ids];
}

/**
 * Démarre un timer de nettoyage pour une session GM déconnectée.
 * Si le GM se reconnecte et réémet gm-set-active-session avant expiration,
 * le timer est annulé dans le handler correspondant.
 *
 * @param {import('socket.io').Server} io
 * @param {Map} activeSessions
 * @param {Map} sessionTimers
 * @param {string} system
 * @param {number} sessionId
 */
function startSessionCleanupTimer(io, activeSessions, sessionTimers, system, sessionId) {
    const key = `${system}_${sessionId}`;

    // Annuler un éventuel timer existant pour cette session
    if (sessionTimers.has(key)) {
        clearTimeout(sessionTimers.get(key));
    }

    const timer = setTimeout(() => {
        sessionTimers.delete(key);

        // Vérifier qu'aucun autre GM n'a réactivé la session entretemps
        const stillActive = getActiveSessionsForSlug(activeSessions, system)
            .includes(sessionId);

        if (!stillActive) {
            console.log(`[socket] Session timeout: ${system}_${sessionId} — broadcast déactivation`);
            io.emit('gm-session-active', { sessionId: null, system });
        }
    }, SESSION_TIMEOUT_MS);

    sessionTimers.set(key, timer);
}

/* ── Enregistrement des handlers ────────────────────────────────────────────── */

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {{ onlineCharacters: Map, activeSessions: Map, sessionTimers: Map }} sharedState
 */
function registerHandlers(io, socket, { onlineCharacters, activeSessions, sessionTimers }) {

    /* ════════════════════════════════════════════════════════════════════════
       PRÉSENCE
       ════════════════════════════════════════════════════════════════════════ */

    /**
     * character-loaded — émis par usePlayerSession à la connexion d'un joueur.
     *
     * Actions :
     *   1. Enregistre le personnage dans onlineCharacters
     *   2. Broadcast online-characters-update à tous
     *   3. Répond au socket émetteur avec les sessions actives de son slug
     *      (pour qu'un joueur tardif puisse rejoindre la bonne room)
     */
    socket.on('character-loaded', (data) => {
        if (!data?.characterId) return;

        onlineCharacters.set(data.characterId, {
            ...data,
            socketId: socket.id,
        });

        io.emit('online-characters-update', Array.from(onlineCharacters.values()));

        // Répondre uniquement au joueur qui vient de se connecter
        const activeSlugs = getActiveSessionsForSlug(activeSessions, data.slug);
        if (activeSlugs.length > 0) {
            socket.emit('gm-sessions-active', activeSlugs);
        }
    });

    /**
     * character-left — émis par usePlayerSession à la déconnexion volontaire.
     */
    socket.on('character-left', (charId) => {
        if (charId) onlineCharacters.delete(charId);
        io.emit('online-characters-update', Array.from(onlineCharacters.values()));
    });

    /* ════════════════════════════════════════════════════════════════════════
       SESSIONS GM
       ════════════════════════════════════════════════════════════════════════ */

    /**
     * gm-set-active-session — émis par useGMSession quand le GM active/change de session.
     *
     * Actions :
     *   1. Annule le timer de nettoyage éventuel pour cette session
     *   2. Stocke { system, sessionId } dans activeSessions[socketId]
     *   3. Broadcast gm-session-active { sessionId, system } à tous
     */
    socket.on('gm-set-active-session', ({ sessionId, system = 'vikings' } = {}) => {
        if (!sessionId) return;

        // Annuler le timer de nettoyage si le GM reprend une session
        const key = `${system}_${sessionId}`;
        if (sessionTimers.has(key)) {
            clearTimeout(sessionTimers.get(key));
            sessionTimers.delete(key);
            console.log(`[socket] Timer annulé — GM reconnecté sur ${key}`);
        }

        // Stocker dans activeSessions
        if (!activeSessions.has(socket.id)) {
            activeSessions.set(socket.id, new Set());
        }
        activeSessions.get(socket.id).add({ system, sessionId });

        io.emit('gm-session-active', { sessionId, system });
        console.log(`[socket] Session activée: ${system}_${sessionId} (socket ${socket.id})`);
    });

    /**
     * gm-clear-session — émis par useGMSession quand le GM désactive explicitement.
     *
     * Actions :
     *   1. Retire de activeSessions[socketId]
     *   2. Broadcast gm-session-active { sessionId: null, system } immédiatement
     *      (pas de timer — désactivation volontaire)
     */
    socket.on('gm-clear-session', ({ sessionId, system = 'vikings' } = {}) => {
        if (!sessionId) return;

        const sessions = activeSessions.get(socket.id);
        if (sessions) {
            for (const entry of sessions) {
                if (entry.system === system && entry.sessionId === sessionId) {
                    sessions.delete(entry);
                    break;
                }
            }
            if (sessions.size === 0) activeSessions.delete(socket.id);
        }

        // Annuler le timer éventuel (cas de désactivation après déco/reco)
        const key = `${system}_${sessionId}`;
        if (sessionTimers.has(key)) {
            clearTimeout(sessionTimers.get(key));
            sessionTimers.delete(key);
        }

        io.emit('gm-session-active', { sessionId: null, system });
        console.log(`[socket] Session désactivée: ${system}_${sessionId}`);
    });

    /* ════════════════════════════════════════════════════════════════════════
       ROOMS
       ════════════════════════════════════════════════════════════════════════ */

    socket.on('join-session', ({ sessionId, system = 'vikings' } = {}) => {
        const room = `${system}_session_${sessionId}`;
        socket.join(room);
        console.log(`[socket ${socket.id}] Joined room: ${room}`);
    });

    socket.on('leave-session', ({ sessionId, system = 'vikings' } = {}) => {
        const room = `${system}_session_${sessionId}`;
        socket.leave(room);
        console.log(`[socket ${socket.id}] Left room: ${room}`);
    });

    /* ════════════════════════════════════════════════════════════════════════
       DISCONNECT
       ════════════════════════════════════════════════════════════════════════ */

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);

        // ── Nettoyage présence ──────────────────────────────────────────────
        for (const [charId, char] of onlineCharacters.entries()) {
            if (char.socketId === socket.id) {
                onlineCharacters.delete(charId);
            }
        }
        io.emit('online-characters-update', Array.from(onlineCharacters.values()));

        // ── Nettoyage sessions GM (avec timer 5min) ─────────────────────────
        const sessions = activeSessions.get(socket.id);
        if (sessions) {
            for (const { system, sessionId } of sessions) {
                startSessionCleanupTimer(io, activeSessions, sessionTimers, system, sessionId);
            }
            // On retire immédiatement de activeSessions — si le GM revient
            // avant le timeout, gm-set-active-session le réinsère
            activeSessions.delete(socket.id);
        }
    });

    /* ════════════════════════════════════════════════════════════════════════
       AUTO-DÉCOUVERTE — handlers slug-spécifiques
       Même comportement qu'avant — chaque système enregistre ses handlers.
       ════════════════════════════════════════════════════════════════════════ */

    for (const [slug] of getAllSystems()) {
        const handlers = getSystemSocketHandlers(slug);
        if (handlers.length === 0) continue;

        for (const register of handlers) {
            register(io, socket);
        }
    }
}

module.exports = { registerHandlers, getActiveSessionsForSlug };