/**
 * src/server/socket/platform/presence.js
 *
 * Présence en ligne des personnages (repris de l'ancien socket/handlers.js).
 *
 * Handlers :
 *   Présence   : character-loaded, character-left
 *   Disconnect : nettoyage de la présence du socket
 */

/** Clé de présence : slug + id, un id n'étant unique que dans la base de son slug. */
const presenceKey = (slug, characterId) => `${slug}:${characterId}`;

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {{ onlineCharacters: Map }} sharedState
 */
function register(io, socket, { onlineCharacters }) {

    /**
     * character-loaded — émis par usePlayerSession à la connexion d'un joueur.
     *
     * Actions :
     *   1. Enregistre le personnage dans onlineCharacters
     *   2. Broadcast online-characters-update à tous
     * Les tables actives ne passent plus par ici : lecture par GET /sessions/active,
     * puis active-tables (spec_tables.md §4).
     */
    socket.on('character-loaded', (data) => {
        if (!data?.characterId) return;

        onlineCharacters.set(presenceKey(data.slug, data.characterId), {
            ...data,
            socketId: socket.id,
        });

        io.emit('online-characters-update', Array.from(onlineCharacters.values()));
    });

    /**
     * character-left — émis par usePlayerSession à la déconnexion volontaire.
     * Ne retire que l'entrée de ce socket : le même id peut exister dans un autre slug.
     */
    socket.on('character-left', (charId) => {
        for (const [key, char] of onlineCharacters.entries()) {
            if (String(char.characterId) === String(charId) && char.socketId === socket.id) {
                onlineCharacters.delete(key);
            }
        }
        io.emit('online-characters-update', Array.from(onlineCharacters.values()));
    });

    /* ── Disconnect : nettoyage de la présence ───────────────────────────────── */

    socket.on('disconnect', () => {
        for (const [key, char] of onlineCharacters.entries()) {
            if (char.socketId === socket.id) {
                onlineCharacters.delete(key);
            }
        }
        io.emit('online-characters-update', Array.from(onlineCharacters.values()));
    });
}

module.exports = { register, presenceKey };
