// src/server/systems/cyberpunk/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes personnages propres à Cyberpunk, montées sur /api/cyberpunk/characters
// AVANT la route commune (src/server/routes/characters.js, spec_characters_route.md)
// qui porte la liste, la lecture, la création, la sauvegarde et la suppression.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { emitToCharacterSessions } = require('../../../utils/characters');
const { loadFullCharacter } = require('../CharacterController');

// ── PATCH /:id/resources — Mise à jour rapide des ressources (Cred, info, matos, retenue) ──

router.patch('/:id/resources', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const { cred, infoTokens, matosTokens, retenue } = req.body;
        req.db.prepare(`
            UPDATE characters SET
                cred         = COALESCE(?, cred),
                info_tokens  = COALESCE(?, info_tokens),
                matos_tokens = COALESCE(?, matos_tokens),
                retenue      = COALESCE(?, retenue),
                updated_at   = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            cred ?? null, infoTokens ?? null, matosTokens ?? null, retenue ?? null,
            req.params.id
        );
        res.json(loadFullCharacter(req.db, req.params.id));
    } catch (err) {
        console.error('[cyberpunk] PATCH /:id/resources:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id/xp — Mise à jour XP et avancements ───────────────────────────

router.patch('/:id/xp', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const db  = req.db;
        const cid = req.params.id;
        const { xp, baseAdvancements, statKey, statDelta, moveId, action, moveTag } = req.body;

        // Mise à jour XP brut et compteur avancements
        if (xp !== undefined || baseAdvancements !== undefined) {
            db.prepare(`
                UPDATE characters SET
                    xp                = COALESCE(?, xp),
                    base_advancements = COALESCE(?, base_advancements),
                    updated_at        = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(xp ?? null, baseAdvancements ?? null, cid);
        }

        // Avancement stat : validation des plafonds
        if (statKey && statDelta) {
            const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(cid);
            const currentVal = char[statKey] ?? 0;
            const newVal     = currentVal + statDelta;
            const maxStat    = (char.base_advancements ?? 0) >= 5 ? 3 : 2;

            if (newVal > maxStat) {
                return res.status(400).json({ error: `Stat plafonnée à +${maxStat} (${char.base_advancements < 5 ? '5 avancements requis pour +3' : 'maximum absolu'})` });
            }
            if (newVal < -2) {
                return res.status(400).json({ error: 'Stat minimum : -2' });
            }

            db.prepare(`UPDATE characters SET ${statKey} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newVal, cid);
        }

        // Avancement move : ajout ou retrait
        if (moveId && action) {
            if (action === 'add') {
                db.prepare('INSERT OR IGNORE INTO character_moves (character_id, move_id) VALUES (?, ?)').run(cid, moveId);
                // Tag verrouillé posé par la manœuvre (spec_cyberpunk.md §9.8) : sur le
                // personnage, ou sur sa console (implant ou objet de CE personnage)
                if (moveTag?.tag_text?.trim()) {
                    const owners = { character: null, cyberware: 'character_cyberware', item: 'character_items' };
                    let entityType = owners[moveTag.entityType] !== undefined ? moveTag.entityType : 'character';
                    let entityId = Number(cid);
                    if (owners[entityType]) {
                        const own = db.prepare(`SELECT id FROM ${owners[entityType]} WHERE id = ? AND character_id = ?`).get(moveTag.entityId, cid);
                        if (own) entityId = own.id; else entityType = 'character';
                    }
                    const variant = ['positive', 'negative', 'neutral'].includes(moveTag.tag_variant) ? moveTag.tag_variant : 'neutral';
                    db.prepare('INSERT INTO tags (entity_type, entity_id, tag_text, tag_variant, locked) VALUES (?, ?, ?, ?, 1)')
                        .run(entityType, entityId, moveTag.tag_text.trim(), variant);
                }
            } else if (action === 'remove') {
                db.prepare('DELETE FROM character_moves WHERE character_id = ? AND move_id = ?').run(cid, moveId);
            }
        }

        res.json(loadFullCharacter(db, cid));
    } catch (err) {
        console.error('[cyberpunk] PATCH /:id/xp:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:id/send-item — Envoi d'un objet par le MJ ─────────────────────────

router.post('/:id/send-item', authenticate, requireGM, (req, res) => {
    try {
        const charId = Number(req.params.id);
        const { name, description = '', quantity = 1, sessionId } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Le nom de l\'item est requis' });
        }

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(charId)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const result = req.db.prepare(`
            INSERT INTO character_items (character_id, name, description, quantity)
            VALUES (?, ?, ?, ?)
        `).run(charId, name.trim(), description.trim(), Math.max(1, quantity));

        const item = { id: result.lastInsertRowid, name: name.trim(), description, quantity };

        // Journal entry
        req.db.prepare(`
            INSERT INTO character_journal (character_id, session_id, type, title, body, metadata, is_read)
            VALUES (?, ?, 'gm_item', ?, ?, ?, 0)
        `).run(
            charId,
            sessionId ?? null,
            `Objet reçu : ${name.trim()}`,
            description || null,
            JSON.stringify({ item })
        );

        // Le joueur recharge sa fiche : la table indiquée, sinon toutes celles du
        // personnage (jamais d'émission à tout le serveur)
        const io = req.app.get('io');
        const payload = { characterId: charId, item };
        if (sessionId) io?.to(`cyberpunk_session_${sessionId}`).emit('gm-item-received', payload);
        else emitToCharacterSessions(io, req.db, 'cyberpunk', charId, 'gm-item-received', payload);

        res.status(201).json({ success: true, item });
    } catch (err) {
        console.error('[cyberpunk] POST /:id/send-item:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;