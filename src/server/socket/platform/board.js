/**
 * src/server/socket/platform/board.js
 *
 * Tableau partagé (documentations/spec_tableau.md §10.5) : relais éphémère.
 *
 * Handlers :
 *   board-ping : un ping posé sur une diapositive, renvoyé aux autres membres de la room.
 *   board-drag : position d'un objet pendant qu'on le déplace (volatile : perdu si le
 *                réseau sature, sans gravité).
 *
 * Aucune écriture, aucune vérification de droits : la position définitive d'un objet
 * passe toujours par la route HTTP (PATCH, routes/board.js), qui les vérifie.
 * Seule la forme est contrôlée, et l'émetteur doit être dans la room de la table.
 */

const isNum = (value) => typeof value === 'number' && Number.isFinite(value);

/** Room de la table si le socket en fait partie, sinon null */
function tableRoom(socket, payload) {
    if (!payload || typeof payload.system !== 'string' || !Number.isInteger(payload.sessionId)) return null;
    const room = `${payload.system}_session_${payload.sessionId}`;
    return socket.rooms.has(room) ? room : null;
}

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function register(io, socket) {
    socket.on('board-ping', (payload) => {
        const room = tableRoom(socket, payload);
        if (!room || !Number.isInteger(payload.slideId) || !isNum(payload.x) || !isNum(payload.y)) return;
        if (typeof payload.color !== 'string' || payload.color.length > 20) return;
        const { system, sessionId, slideId, x, y, color } = payload;
        socket.to(room).emit('board-ping', { system, sessionId, slideId, x, y, color });
    });

    socket.on('board-drag', (payload) => {
        const room = tableRoom(socket, payload);
        if (!room || !Number.isInteger(payload.slideId)) return;
        // Plusieurs objets d'un coup (sélection, groupe, §14.5) : { items: [{ itemId, x, y }] }
        if (Array.isArray(payload.items)) {
            if (payload.items.length > 500) return;
            const items = payload.items.filter(i => i && Number.isInteger(i.itemId) && isNum(i.x) && isNum(i.y))
                .map(({ itemId, x, y }) => ({ itemId, x, y }));
            if (items.length !== payload.items.length) return;
            const { system, sessionId, slideId } = payload;
            socket.volatile.to(room).emit('board-drag', { system, sessionId, slideId, items });
            return;
        }
        if (!Number.isInteger(payload.itemId)) return;
        if (!isNum(payload.x) || !isNum(payload.y)) return;
        if ((payload.w !== undefined && !isNum(payload.w)) || (payload.h !== undefined && !isNum(payload.h))) return;
        if (payload.rotation !== undefined && !isNum(payload.rotation)) return;
        const { system, sessionId, slideId, itemId, x, y, w, h, rotation } = payload;
        socket.volatile.to(room).emit('board-drag', { system, sessionId, slideId, itemId, x, y, w, h, rotation });
    });
}

module.exports = { register };
