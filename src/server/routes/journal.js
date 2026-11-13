// src/server/routes/journal.js
// Route générique journal personnage (notes + messages GM) : le journal « Privé »
// (documentations/plateforme/spec_journal.md, partie III §11.1). Partagée par tous les systèmes.
// Utilise req.db et req.system.slug pour les rooms Socket.

const express = require('express');
const router = express.Router();
const { authenticate, requireOwnerOrGM, requireGM } = require('../middlewares/auth');
const { emitToCharacterSessions } = require('../utils/characters');
const { htmlToText, readCategory, characterName } = require('../utils/journal');

// Diffusion d'une notification à un personnage : la room de la table indiquée, sinon
// les rooms des tables du personnage ; jamais tout le serveur (un id de personnage
// n'est unique que dans la base de son slug : un io.emit atteignait les autres slugs).
function emitToCharacter(io, db, slug, sessionId, characterId, event, payload) {
    if (!io) return;
    if (sessionId) io.to(`${slug}_session_${sessionId}`).emit(event, payload);
    else emitToCharacterSessions(io, db, slug, characterId, event, payload);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// light : entrée de liste, sans le corps HTML (images en base64 comprises) mais avec
// son texte brut (aperçu, recherche) ; le corps se charge à l'ouverture (spec §11.1)
function formatEntry(e, { light = false } = {}) {
    const entry = {
        id: e.id,
        characterId: e.character_id,
        sessionId: e.session_id,
        sessionName: e.session_name || null,
        type: e.type,
        title: e.title,
        category: e.type === 'note' ? (e.category || 'notes') : null,
        pinned: !!e.pinned,
        bodyText: e.body_text ?? htmlToText(e.body),
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
        isRead: !!e.is_read,
        createdAt: e.created_at,
        updatedAt: e.updated_at
    };
    if (!light) entry.body = e.body;
    return entry;
}

// Entrées d'avant la refonte : texte brut calculé et enregistré à la première lecture
// (une migration SQL ne sait pas retirer des balises)
function fillBodyText(db, rows) {
    const missing = rows.filter(r => r.body_text === null && r.body);
    if (!missing.length) return;
    const update = db.prepare('UPDATE character_journal SET body_text = ? WHERE id = ?');
    db.transaction(() => {
        for (const r of missing) {
            r.body_text = htmlToText(r.body);
            update.run(r.body_text, r.id);
        }
    })();
}

// Trace d'un envoi dans le journal du MJ (personnage -1), type gm_sent (R-9)
function recordSent(db, { sessionId, title, body, metadata }) {
    db.prepare(`
        INSERT INTO character_journal (character_id, session_id, type, title, body, body_text, metadata, is_read)
        VALUES (-1, ?, 'gm_sent', ?, ?, ?, ?, 1)
    `).run(sessionId || null, title || null, body || null, htmlToText(body), JSON.stringify(metadata));
}

function loadEntry(db, entryId) {
    return db.prepare(`
        SELECT cj.*, gs.name as session_name
        FROM character_journal cj
                 LEFT JOIN game_sessions gs ON cj.session_id = gs.id
        WHERE cj.id = ?
    `).get(entryId);
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// ─── Routes GM (déclarées AVANT /:characterId pour éviter collision) ────────

router.post('/gm-send', authenticate, requireGM, (req, res) => {
    try {
        const { targetCharacterIds, sessionId, title, body, metadata, toastAnimation = 'default' } = req.body;
        const db = req.db;
        const system = req.system.slug;

        if (!targetCharacterIds?.length) return res.status(400).json({ error: 'No target characters specified' });
        if (!title && !body)             return res.status(400).json({ error: 'Title or body is required' });

        const createdEntries = [];
        const recipients = [];
        const insertStmt = db.prepare(`
            INSERT INTO character_journal (character_id, session_id, type, title, body, body_text, metadata, is_read)
            VALUES (?, ?, 'gm_message', ?, ?, ?, ?, 0)
        `);

        db.transaction(() => {
            for (const charId of targetCharacterIds) {
                if (!db.prepare('SELECT id FROM characters WHERE id = ?').get(charId)) continue;
                const result = insertStmt.run(charId, sessionId || null, title || null, body || null, htmlToText(body), metadata ? JSON.stringify(metadata) : null);
                const entry = loadEntry(db, result.lastInsertRowid);
                if (entry) createdEntries.push(formatEntry(entry));
                recipients.push(characterName(db, charId));
            }
            // Le MJ garde la trace de ce qu'il a envoyé (R-9)
            if (recipients.length) recordSent(db, { sessionId, title, body, metadata: { ...(metadata || {}), to: recipients } });
        })();

        const io = req.app.get('io');
        for (const entry of createdEntries) {
            emitToCharacter(io, db, system, sessionId, entry.characterId, 'gm-message-received',
                { characterId: entry.characterId, entry, toastAnimation });
        }

        res.status(201).json({ sent: createdEntries.length, entries: createdEntries });
    } catch (error) {
        console.error('Error sending GM message:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/gm-send-item', authenticate, requireGM, (req, res) => {
    try {
        const { targetCharacterId, sessionId, item, note, toastAnimation = 'default' } = req.body;
        const db = req.db;
        const system = req.system.slug;

        if (!targetCharacterId) return res.status(400).json({ error: 'Target character is required' });
        if (!item?.name)        return res.status(400).json({ error: 'Item data is required' });
        if (!db.prepare('SELECT id FROM characters WHERE id = ?').get(targetCharacterId))
            return res.status(404).json({ error: 'Character not found' });

        // Objet, entrée du joueur et trace du MJ : ensemble ou pas du tout (B-TX)
        const { formattedItem, journalId } = db.transaction(() => {
        const itemResult = db.prepare(`
            INSERT INTO character_items (character_id, name, category, quantity, location, notes,
                                         weapon_type, damage, range, armor_value, requirements, custom_item)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            targetCharacterId, item.name, item.category || 'item',
            item.quantity || 1, item.location || 'bag', note || null,
            item.weaponType || null, item.damage || null, item.range || null,
            item.armorValue || 0,
            item.requirements ? JSON.stringify(item.requirements) : '{}',
            0
        );

        const formattedItem = { id: itemResult.lastInsertRowid, ...item };

        const journalResult = db.prepare(`
            INSERT INTO character_journal (character_id, session_id, type, title, body, body_text, metadata, is_read)
            VALUES (?, ?, 'gm_item', ?, ?, ?, ?, 0)
        `).run(
            targetCharacterId, sessionId || null,
            `Objet reçu : ${item.name}`, note || null, htmlToText(note),
            JSON.stringify({ item: formattedItem })
        );
        recordSent(db, {
            sessionId, title: `Objet envoyé : ${item.name}`, body: note,
            metadata: { item: formattedItem, to: [characterName(db, targetCharacterId)] },
        });
        return { formattedItem, journalId: journalResult.lastInsertRowid };
        })();

        const journalEntry = formatEntry(loadEntry(db, journalId));

        emitToCharacter(req.app.get('io'), db, system, sessionId, targetCharacterId, 'gm-item-received',
            { characterId: targetCharacterId, item: formattedItem, journalEntry, toastAnimation });

        res.status(201).json({ item: formattedItem, journalEntry });
    } catch (error) {
        console.error('Error sending GM item:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Routes CRUD (/:characterId en dernier pour ne pas capturer les routes statiques) ───

// Tables où une note peut être rangée (R-21) : toutes pour le MJ, celles du personnage sinon
router.get('/:characterId/tables', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const characterId = Number(req.params.characterId);
        const rows = characterId === -1
            ? req.db.prepare('SELECT id, name FROM game_sessions ORDER BY updated_at DESC').all()
            : req.db.prepare(`
                SELECT gs.id, gs.name FROM session_characters sc
                JOIN game_sessions gs ON gs.id = sc.session_id
                WHERE sc.character_id = ? ORDER BY gs.updated_at DESC
            `).all(characterId);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching journal tables:', error);
        res.status(500).json({ error: error.message });
    }
});

// Liste légère (sans corps HTML) ; ?full=1 : entrées complètes (export, « depuis mes notes »),
// limitées à ?ids=1,2,3 si donné
router.get('/:characterId', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const { characterId } = req.params;
        const { sessionId, type, full, ids } = req.query;
        let query = `
            SELECT cj.*, gs.name as session_name
            FROM character_journal cj
            LEFT JOIN game_sessions gs ON cj.session_id = gs.id
            WHERE cj.character_id = ?
        `;
        const params = [characterId];
        if (sessionId) { query += ' AND cj.session_id = ?'; params.push(sessionId); }
        if (type)      { query += ' AND cj.type = ?';       params.push(type); }
        if (full === '1' && ids) {
            const list = String(ids).split(',').map(Number).filter(Number.isInteger);
            if (!list.length) return res.json([]);
            query += ` AND cj.id IN (${list.map(() => '?').join(',')})`;
            params.push(...list);
        }
        query += ' ORDER BY cj.updated_at DESC';

        const rows = req.db.prepare(query).all(...params);
        fillBodyText(req.db, rows);
        res.json(rows.map(r => formatEntry(r, { light: full !== '1' })));
    } catch (error) {
        console.error('Error fetching journal:', error);
        res.status(500).json({ error: error.message });
    }
});

// Entrée complète, chargée à l'ouverture
router.get('/:characterId/:entryId', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const entry = loadEntry(req.db, req.params.entryId);
        if (!entry || entry.character_id !== Number(req.params.characterId))
            return res.status(404).json({ error: 'Journal entry not found' });
        res.json(formatEntry(entry));
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:characterId', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const { characterId } = req.params;
        const { sessionId, type = 'note', title, body, metadata, category, pinned } = req.body;
        const db = req.db;

        if (!db.prepare('SELECT id FROM characters WHERE id = ?').get(characterId))
            return res.status(404).json({ error: 'Character not found' });
        if (sessionId && !db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId))
            return res.status(404).json({ error: 'Session not found' });

        const result = db.prepare(`
            INSERT INTO character_journal (character_id, session_id, type, title, body, body_text, metadata, category, pinned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(characterId, sessionId || null, type, title || null, body || null, htmlToText(body),
            metadata ? JSON.stringify(metadata) : null,
            type === 'note' ? (readCategory(category) ?? 'notes') : null, pinned === true ? 1 : 0);

        res.status(201).json(formatEntry(loadEntry(db, result.lastInsertRowid)));
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:characterId/:entryId', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const { characterId, entryId } = req.params;
        const { title, body, isRead, category, pinned, sessionId } = req.body;
        const db = req.db;

        if (!db.prepare('SELECT id FROM character_journal WHERE id = ? AND character_id = ?').get(entryId, characterId))
            return res.status(404).json({ error: 'Journal entry not found' });
        if (category !== undefined && !readCategory(category))
            return res.status(400).json({ error: 'Unknown category' });
        // Déplacement vers une table (R-21) : identifiant de table existante, ou null = hors table
        if (sessionId !== undefined && sessionId !== null) {
            if (typeof sessionId !== 'number' || !Number.isInteger(sessionId))
                return res.status(400).json({ error: 'Invalid session' });
            if (!db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId))
                return res.status(404).json({ error: 'Session not found' });
        }

        const updates = [];
        const params = [];
        if (title     !== undefined) { updates.push('title = ?');     params.push(title); }
        if (body      !== undefined) { updates.push('body = ?', 'body_text = ?'); params.push(body, htmlToText(body)); }
        if (isRead    !== undefined) { updates.push('is_read = ?');   params.push(isRead ? 1 : 0); }
        if (category  !== undefined) { updates.push('category = ?');  params.push(category); }
        if (pinned    !== undefined) { updates.push('pinned = ?');    params.push(pinned ? 1 : 0); }
        if (sessionId !== undefined) { updates.push('session_id = ?'); params.push(sessionId); }
        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        // Lire, ranger, épingler, déplacer ne sont pas des modifications du contenu
        if (title !== undefined || body !== undefined) updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(entryId, characterId);
        db.prepare(`UPDATE character_journal SET ${updates.join(', ')} WHERE id = ? AND character_id = ?`).run(...params);

        res.json(formatEntry(loadEntry(db, entryId)));
    } catch (error) {
        console.error('Error updating journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:characterId/:entryId', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const result = req.db.prepare(
            'DELETE FROM character_journal WHERE id = ? AND character_id = ?'
        ).run(req.params.entryId, req.params.characterId);

        if (result.changes === 0) return res.status(404).json({ error: 'Journal entry not found' });
        res.json({ deleted: true, id: parseInt(req.params.entryId) });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;