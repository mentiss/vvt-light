/**
 * src/server/socket/platform/sessions.js
 *
 * Tables actives et rooms de la plateforme (documentations/spec_tables.md §4).
 *
 * Handlers :
 *   Tables     : gm-set-active-session (un poste MJ ouvre une table),
 *                gm-clear-session (sortie volontaire du poste)
 *   Rooms      : join-session, leave-session
 *   Disconnect : le poste quitte ses tables ; une table restée sans poste garde
 *                son entrée pendant le délai de grâce, puis s'arrête
 *
 * Toute variation de la liste (tables, nombre de postes) diffuse `active-tables`
 * { system, tables: [{ id, posts }] } dans la room du slug `${slug}_all`, où chaque
 * socket entre à sa connexion (socket/index.js).
 */

const { getSystem } = require('../../systems/Loader');
const { listActiveTables, openTable, leaveTable, dropPost, expireTable } = require('../../utils/activeTables');

const GRACE_MS = 5 * 60 * 1000; // délai de grâce après la déconnexion du dernier poste

/** Room de tous les sockets d'un slug (MJ et joueurs). */
const slugRoom = (slug) => `${slug}_all`;

/** Payload { sessionId, system } valide : slug chargé, identifiant entier positif (B-NUMBER). */
const readTable = (payload) => {
    const { sessionId, system } = payload ?? {};
    if (typeof system !== 'string' || !getSystem(system)) return null;
    if (typeof sessionId !== 'number' || !Number.isInteger(sessionId) || sessionId <= 0) return null;
    return { sessionId, system };
};

/** Diffuse la liste des tables actives du slug à ses sockets. */
function broadcastActiveTables(io, activeTables, system) {
    io.to(slugRoom(system)).emit('active-tables', { system, tables: listActiveTables(activeTables, system) });
}

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {{ activeTables: Map }} sharedState
 */
function register(io, socket, { activeTables }) {

    /* ── Tables actives ──────────────────────────────────────────────────────── */

    // Un poste MJ ouvre une table (activation, reprise après rechargement ou reconnexion)
    socket.on('gm-set-active-session', (payload) => {
        const table = readTable(payload);
        if (!table) return;
        if (openTable(activeTables, table.system, table.sessionId, socket.id)) {
            broadcastActiveTables(io, activeTables, table.system);
        }
    });

    // Sortie volontaire du poste (autre table choisie, Désactiver, table supprimée)
    socket.on('gm-clear-session', (payload) => {
        const table = readTable(payload);
        if (!table) return;
        if (leaveTable(activeTables, table.system, table.sessionId, socket.id)) {
            broadcastActiveTables(io, activeTables, table.system);
        }
    });

    /* ── Rooms ───────────────────────────────────────────────────────────────── */

    socket.on('join-session', (payload) => {
        const table = readTable(payload);
        if (table) socket.join(`${table.system}_session_${table.sessionId}`);
    });

    socket.on('leave-session', (payload) => {
        const table = readTable(payload);
        if (table) socket.leave(`${table.system}_session_${table.sessionId}`);
    });

    /* ── Déconnexion : délai de grâce des tables restées sans poste ──────────── */

    socket.on('disconnect', () => {
        const changed = dropPost(activeTables, socket.id);
        for (const { slug, sessionId, empty } of changed) {
            if (!empty) continue;
            const entry = activeTables.get(slug)?.get(sessionId);
            if (!entry) continue;
            entry.timer = setTimeout(() => {
                entry.timer = null;
                if (expireTable(activeTables, slug, sessionId)) {
                    console.log(`[socket] Table arrêtée (délai de grâce écoulé) : ${slug}_${sessionId}`);
                    broadcastActiveTables(io, activeTables, slug);
                }
            }, GRACE_MS);
        }
        for (const slug of new Set(changed.map(c => c.slug))) broadcastActiveTables(io, activeTables, slug);
    });
}

module.exports = { register, slugRoom };
