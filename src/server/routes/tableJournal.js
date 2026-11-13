// src/server/routes/tableJournal.js
// ─────────────────────────────────────────────────────────────────────────────
// Journal « Partagé » de la table (documentations/plateforme/spec_journal.md, partie III
// §10.2, §11.2), monté sur /api/:slug/table-journal. Partagé par tous les systèmes.
// Joueurs de la table et MJ lisent et écrivent tout ; supprimer est réservé à l'auteur
// et au MJ. Épingler vaut pour toute la table (Q-1) ; le titre est un champ simple, le
// dernier qui écrit gagne (Q-2).
//
//   GET    /:sessionId                 liste légère (sans corps HTML), isNew pour le demandeur
//                                      ?full=1&ids=1,2 : entrées complètes (export)
//   GET    /:sessionId/:id             entrée complète
//   POST   /:sessionId                 { title?, body? } création (vide, ou copie d'une note : « Partager »)
//   PATCH  /:sessionId/:id             { title?, pinned? }
//   PUT    /:sessionId/:id/body        { body } corps HTML
//   POST   /:sessionId/:id/seen        entrée vue par le demandeur
//   DELETE /:sessionId/:id             auteur ou MJ
//
// Après chaque écriture, dans la room de la table :
//   table-journal-changed { system, sessionId, entry }   (entrée légère, bodyChanged si le corps a changé)
//   table-journal-deleted { system, sessionId, id }
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { htmlToText, characterName } = require('../utils/journal');

// ─── Helpers ────────────────────────────────────────────────────────────────

const me = (req) => (req.user.isGM ? -1 : req.user.characterId);

function formatEntry(row, { light = false, viewer = null } = {}) {
    const entry = {
        id: row.id,
        sessionId: row.session_id,
        title: row.title,
        bodyText: row.body_text ?? '',
        pinned: !!row.pinned,
        authorId: row.author_id,
        authorName: row.author_name,
        editorId: row.editor_id,
        editorName: row.editor_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
    if (viewer !== null) {
        // Nouveau pour le lecteur : créé ou modifié par un autre depuis sa dernière ouverture
        entry.isNew = row.editor_id !== viewer && (!row.seen_at || row.seen_at < row.updated_at);
    }
    if (!light) entry.body = row.body;
    return entry;
}

const loadRow = (db, sessionId, id, viewer) => db.prepare(`
    SELECT tj.*, r.seen_at FROM table_journal tj
    LEFT JOIN table_journal_reads r ON r.entry_id = tj.id AND r.character_id = ?
    WHERE tj.id = ? AND tj.session_id = ?
`).get(viewer, id, sessionId);

const markSeen = (db, id, viewer) => db.prepare(`
    INSERT INTO table_journal_reads (entry_id, character_id, seen_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(entry_id, character_id) DO UPDATE SET seen_at = CURRENT_TIMESTAMP
`).run(id, viewer);

function broadcast(req, sessionId, event, payload) {
    req.app.get('io')?.to(`${req.system.slug}_session_${sessionId}`)
        .emit(event, { system: req.system.slug, sessionId, ...payload });
}

// Table existante et demandeur membre (le MJ l'est partout). Refus si un champ manque (B-AUTH-CHECK).
function requireTableMember(req, res, next) {
    const sessionId = Number(req.params.sessionId);
    if (!Number.isInteger(sessionId) || sessionId <= 0) return res.status(400).json({ error: 'Invalid session' });
    try {
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId))
            return res.status(404).json({ error: 'Session not found' });
        if (!req.user.isGM) {
            const member = Number.isInteger(req.user.characterId) && req.db
                .prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?')
                .get(sessionId, req.user.characterId);
            if (!member) return res.status(403).json({ error: 'Not a member of this table' });
        }
        req.sessionId = sessionId;
        next();
    } catch (error) {
        console.error('Error checking table membership:', error);
        res.status(500).json({ error: error.message });
    }
}

// Entrée de la table (404 sinon), chargée pour le demandeur
function requireEntry(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid entry' });
    const row = loadRow(req.db, req.sessionId, id, me(req));
    if (!row) return res.status(404).json({ error: 'Journal entry not found' });
    req.entry = row;
    next();
}

// Dernier modificateur : le demandeur, date de modification à maintenant
const touch = (req) => ({ id: me(req), name: characterName(req.db, me(req)) });

// ─── Routes ─────────────────────────────────────────────────────────────────

router.use('/:sessionId', authenticate, requireTableMember);

router.get('/:sessionId', (req, res) => {
    try {
        const viewer = me(req);
        const { full, ids } = req.query;
        let query = `
            SELECT tj.*, r.seen_at FROM table_journal tj
            LEFT JOIN table_journal_reads r ON r.entry_id = tj.id AND r.character_id = ?
            WHERE tj.session_id = ?
        `;
        const params = [viewer, req.sessionId];
        if (full === '1' && ids) {
            const list = String(ids).split(',').map(Number).filter(Number.isInteger);
            if (!list.length) return res.json([]);
            query += ` AND tj.id IN (${list.map(() => '?').join(',')})`;
            params.push(...list);
        }
        query += ' ORDER BY tj.updated_at DESC';
        res.json(req.db.prepare(query).all(...params).map(r => formatEntry(r, { light: full !== '1', viewer })));
    } catch (error) {
        console.error('Error fetching table journal:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:sessionId/:id', requireEntry, (req, res) => {
    res.json(formatEntry(req.entry, { viewer: me(req) }));
});

router.post('/:sessionId', (req, res) => {
    try {
        const { title, body } = req.body;
        if (title !== undefined && title !== null && typeof title !== 'string') return res.status(400).json({ error: 'Invalid title' });
        if (body !== undefined && body !== null && typeof body !== 'string') return res.status(400).json({ error: 'Invalid body' });
        const db = req.db;
        const author = touch(req);
        const id = db.transaction(() => {
            const result = db.prepare(`
                INSERT INTO table_journal (session_id, title, body, body_text, author_id, author_name, editor_id, editor_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(req.sessionId, title || 'Nouvelle entrée', body || null, htmlToText(body), author.id, author.name, author.id, author.name);
            markSeen(db, result.lastInsertRowid, author.id);
            return result.lastInsertRowid;
        })();
        const row = loadRow(db, req.sessionId, id, author.id);
        broadcast(req, req.sessionId, 'table-journal-changed', { entry: formatEntry(row, { light: true }), bodyChanged: true });
        res.status(201).json(formatEntry(row, { viewer: author.id }));
    } catch (error) {
        console.error('Error creating table journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:sessionId/:id', requireEntry, (req, res) => {
    try {
        const { title, pinned } = req.body;
        if (title !== undefined && typeof title !== 'string') return res.status(400).json({ error: 'Invalid title' });
        if (pinned !== undefined && typeof pinned !== 'boolean') return res.status(400).json({ error: 'Invalid pinned' });
        if (title === undefined && pinned === undefined) return res.status(400).json({ error: 'No fields to update' });

        const updates = [];
        const params = [];
        if (pinned !== undefined) { updates.push('pinned = ?'); params.push(pinned ? 1 : 0); }
        // Renommer est une modification ; épingler n'en est pas une (range pour toute la table)
        if (title !== undefined) {
            const editor = touch(req);
            updates.push('title = ?', 'editor_id = ?', 'editor_name = ?', 'updated_at = CURRENT_TIMESTAMP');
            params.push(title, editor.id, editor.name);
        }
        params.push(req.entry.id);
        req.db.prepare(`UPDATE table_journal SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        if (title !== undefined) markSeen(req.db, req.entry.id, me(req));

        const row = loadRow(req.db, req.sessionId, req.entry.id, me(req));
        broadcast(req, req.sessionId, 'table-journal-changed', { entry: formatEntry(row, { light: true }), bodyChanged: false });
        res.json(formatEntry(row, { light: true, viewer: me(req) }));
    } catch (error) {
        console.error('Error updating table journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:sessionId/:id/body', requireEntry, (req, res) => {
    try {
        const { body } = req.body;
        if (typeof body !== 'string') return res.status(400).json({ error: 'Body is required' });
        const editor = touch(req);
        req.db.prepare(`
            UPDATE table_journal SET body = ?, body_text = ?, editor_id = ?, editor_name = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(body, htmlToText(body), editor.id, editor.name, req.entry.id);
        markSeen(req.db, req.entry.id, editor.id);

        const row = loadRow(req.db, req.sessionId, req.entry.id, editor.id);
        broadcast(req, req.sessionId, 'table-journal-changed', { entry: formatEntry(row, { light: true }), bodyChanged: true });
        res.json(formatEntry(row, { light: true, viewer: editor.id }));
    } catch (error) {
        console.error('Error saving table journal body:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:sessionId/:id/seen', requireEntry, (req, res) => {
    try {
        markSeen(req.db, req.entry.id, me(req));
        res.json({ seen: true, id: req.entry.id });
    } catch (error) {
        console.error('Error marking table journal entry as seen:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:sessionId/:id', requireEntry, (req, res) => {
    try {
        if (!req.user.isGM && req.entry.author_id !== me(req))
            return res.status(403).json({ error: 'Only the author or the GM can delete this entry' });
        req.db.prepare('DELETE FROM table_journal WHERE id = ?').run(req.entry.id);
        broadcast(req, req.sessionId, 'table-journal-deleted', { id: req.entry.id });
        res.json({ deleted: true, id: req.entry.id });
    } catch (error) {
        console.error('Error deleting table journal entry:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
