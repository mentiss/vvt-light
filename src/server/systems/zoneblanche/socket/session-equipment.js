// src/server/systems/zoneblanche/socket/session-equipment.js
// Handler Socket.io pour le pool matériel de session Zone Blanche.
// Miroir temps réel des routes REST — même logique, pas de duplication de
// validation complexe (cohérent avec le choix "simple, pas de blocage").
//
// Événements écoutés :
//   zoneblanche:equipment-add     { sessionId, itemKey?, label, cost, quantity, characterId }
//   zoneblanche:equipment-remove  { sessionId, itemId }
//   zoneblanche:equipment-clear   { sessionId }
//
// Événement émis (vers la room, après chaque opération) :
//   zoneblanche:equipment-update  { sessionId, budget, total, items[] }

const { getDbForSystem }     = require('../../../db');
const { getConfigForSystem } = require('../../Loader');

const SLUG = 'zoneblanche';

function getState(db, sessionId) {
    db.prepare('INSERT OR IGNORE INTO session_equipment_budget (session_id) VALUES (?)').run(sessionId);
    const budgetRow = db.prepare('SELECT * FROM session_equipment_budget WHERE session_id = ?').get(sessionId);
    const items = db.prepare(
        'SELECT * FROM session_equipment_pool WHERE session_id = ? ORDER BY created_at'
    ).all(sessionId);
    return {
        sessionId,
        budget: budgetRow.budget,
        total:  items.reduce((sum, i) => sum + i.cost * i.quantity, 0),
        items:  items.map(i => ({
            id:                 i.id,
            itemKey:            i.item_key,
            label:              i.label,
            cost:               i.cost,
            quantity:           i.quantity,
            addedByCharacterId: i.added_by_character_id,
            createdAt:          i.created_at,
        })),
    };
}

module.exports = function register(io, socket) {
    const db = getDbForSystem(getConfigForSystem(SLUG));

    const emitUpdate = (sessionId) => {
        io.to(`${SLUG}_session_${sessionId}`).emit('zoneblanche:equipment-update', getState(db, sessionId));
    };

    socket.on('zoneblanche:equipment-add', ({ sessionId, itemKey, label, cost, quantity, characterId } = {}) => {
        if (!sessionId || !label?.trim()) return;
        try {
            const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
            const c   = Number.isInteger(cost) && cost >= 0 ? cost : 0;

            db.prepare(`
                INSERT INTO session_equipment_pool (session_id, item_key, label, cost, quantity, added_by_character_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(sessionId, itemKey ?? null, label.trim(), c, qty, characterId ?? null);

            emitUpdate(sessionId);
        } catch (err) {
            console.error(`[${SLUG}/socket] equipment-add error:`, err);
        }
    });

    socket.on('zoneblanche:equipment-remove', ({ sessionId, itemId } = {}) => {
        if (!sessionId || !itemId) return;
        try {
            db.prepare('DELETE FROM session_equipment_pool WHERE id = ? AND session_id = ?').run(itemId, sessionId);
            emitUpdate(sessionId);
        } catch (err) {
            console.error(`[${SLUG}/socket] equipment-remove error:`, err);
        }
    });

    socket.on('zoneblanche:equipment-clear', ({ sessionId } = {}) => {
        if (!sessionId) return;
        try {
            db.prepare('DELETE FROM session_equipment_pool WHERE session_id = ?').run(sessionId);
            emitUpdate(sessionId);
        } catch (err) {
            console.error(`[${SLUG}/socket] equipment-clear error:`, err);
        }
    });
};