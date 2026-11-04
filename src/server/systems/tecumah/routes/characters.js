// src/server/systems/tecumah/routes/characters.js
// Routes personnages propres à Tecumah Gulch, montées sur /api/tecumah/characters
// AVANT la route commune (src/server/routes/characters.js, spec_characters_route.md)
// qui porte la liste, la lecture, la création, la sauvegarde et la suppression.

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');
const { broadcastCharacterUpdate, emitToCharacterSessions } = require('../../../utils/characters');
const { loadFullCharacter } = require('../CharacterController');

// ── POST /:id/send-item — Envoi d'un objet par le MJ ─────────────────────────

router.post('/:id/send-item', authenticate, requireGM, (req, res) => {
    try {
        const charId = Number(req.params.id);
        const {
            name, description = '', category = 'misc', quantity = 1,
            damage = 0, rangeShort = 0, rangeMedium = 0, rangeLong = 0, skillKey = '',
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Le nom de l\'item est requis' });
        }

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(charId)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const result = req.db.prepare(`
            INSERT INTO character_items
                (character_id, name, description, category, quantity, location,
                 damage, range_short, range_medium, range_long, skill_key)
            VALUES (?, ?, ?, ?, ?, 'inventory', ?, ?, ?, ?, ?)
        `).run(
            charId, name.trim(), description.trim(), category,
            Math.max(1, quantity),
            damage, rangeShort, rangeMedium, rangeLong, skillKey,
        );

        const item = {
            id:          result.lastInsertRowid,
            name:        name.trim(),
            description: description.trim(),
            category,
            quantity:    Math.max(1, quantity),
            location:    'inventory',
            damage, rangeShort, rangeMedium, rangeLong, skillKey,
        };

        // Fiche à jour pour la table (le MJ la reçoit par character-full-update),
        // puis la notification du joueur
        broadcastCharacterUpdate(req.app.get('io'), req.db, 'tecumah', charId, loadFullCharacter(req.db, charId));
        emitToCharacterSessions(req.app.get('io'), req.db, 'tecumah', charId, 'gm-item-received', {
            characterId: charId,
            item,
        });

        res.status(201).json({ success: true, item });
    } catch (err) {
        console.error('[tecumah] POST /:id/send-item:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
