/**
 * src/server/socket/platform/sessions.js
 *
 * Sessions MJ et rooms de la plateforme (repris de l'ancien socket/handlers.js).
 *
 * Handlers :
 *   Sessions   : gm-set-active-session, gm-clear-session
 *   Rooms      : join-session, leave-session
 *   Disconnect : timer de 5 min sur les sessions du MJ déconnecté
 */

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

/* ── Enregistrement ─────────────────────────────────────────────────────────── */

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {{ activeSessions: Map, sessionTimers: Map }} sharedState
 */
function register(io, socket, { activeSessions, sessionTimers }) {

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
       DISCONNECT — sessions GM (avec timer 5 min)
       ════════════════════════════════════════════════════════════════════════ */

    socket.on('disconnect', () => {
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
}

module.exports = { register, getActiveSessionsForSlug };
