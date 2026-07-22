// src/server/systems/zoneblanche/socket/session-resources.js
// Handler Socket.io pour les ressources de session Zone Blanche.
// Découvert et enregistré automatiquement par loader.js à chaque connexion socket.
//
// NOTE : pas de vérification GM ici pour 'stress', par cohérence avec le
// pattern existant (Achtung/complications) — le verrou réel est la route REST ;
// côté socket, seule l'UI GM expose les contrôles Stress.
//
// Événement écouté  : update-session-resources  { sessionId, field, delta }
// Événement émis    : session-resources-update  { sessionId, audimat, stress, updatedAt }

const { getDbForSystem }     = require('../../../db');
const { getConfigForSystem } = require('../../Loader');

const SLUG = 'zoneblanche';

const CLAMP = {
    audimat: { min: 0, max: 6 },
    stress:  { min: 0, max: Infinity },
};
const ALLOWED = Object.keys(CLAMP);

module.exports = function register(io, socket) {

    socket.on('update-session-resources', ({ sessionId, field, delta } = {}) => {
        if (
            !sessionId ||
            !ALLOWED.includes(field) ||
            typeof delta !== 'number' ||
            !Number.isInteger(delta)
        ) {
            console.warn(`[${SLUG}/socket] update-session-resources: payload invalide`, { sessionId, field, delta });
            return;
        }

        try {
            const db = getDbForSystem(getConfigForSystem(SLUG));
            db.prepare('INSERT OR IGNORE INTO session_resources (session_id) VALUES (?)').run(sessionId);

            const row    = db.prepare('SELECT * FROM session_resources WHERE session_id = ?').get(sessionId);
            const clamp  = CLAMP[field];
            const newVal = Math.min(Math.max(row[field] + delta, clamp.min), clamp.max);

            db.prepare(`
                UPDATE session_resources
                SET ${field} = ?, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ?
            `).run(newVal, sessionId);

            const updated = db.prepare('SELECT * FROM session_resources WHERE session_id = ?').get(sessionId);
            const room    = `${SLUG}_session_${sessionId}`;

            io.to(room).emit('session-resources-update', {
                sessionId: updated.session_id,
                audimat:   updated.audimat,
                stress:    updated.stress,
                updatedAt: updated.updated_at,
            });

            console.log(`[${SLUG}/socket] session-resources [session:${sessionId}]: ${field} → ${newVal}`);
        } catch (err) {
            console.error(`[${SLUG}/socket] update-session-resources error:`, err);
        }
    });
};