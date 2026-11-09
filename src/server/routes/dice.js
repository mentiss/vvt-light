// src/server/routes/dice.js
// Route générique de l'historique des jets (et des entrées sans dé).
// Partagée par tous les systèmes via systemResolver (req.db, req.system).
//
// Contrat (spec_diceengine_v2.md, « Passe générique : contrat ») :
//   - roll_type, label, roll_result : obligatoires (donnés par le slug)
//   - notation, raw_result          : écrits par le moteur, absents sans dé
//   - roll_result appartient au slug : la route ne lit rien dedans

const express = require('express');
const {getCharNameExpr} = require("../utils/characters");
const { authenticate } = require('../middlewares/auth');
const router  = express.Router();

// ─── POST /roll ──────────────────────────────────────────────────────────────
// Enregistre un jet de dés et le diffuse via Socket.io.

router.post('/roll', authenticate, (req, res) => {
    try {
        const {
            character_id,
            character_name,     // diffusé, pas enregistré
            session_id,
            roll_type,
            label,
            notation,           // chaîne, ou tableau de notations en JSON
            raw_result,         // objet ou chaîne JSON
            roll_result,        // objet ou chaîne JSON
        } = req.body;

        const missing = [['roll_type', roll_type], ['label', label], ['roll_result', roll_result]]
            .filter(([, value]) => value == null || value === '')
            .map(([name]) => name);
        if (missing.length) {
            return res.status(400).json({ error: `Entrée d'historique invalide : ${missing.join(', ')} manquant` });
        }

        // JSON reçus en objet ou en chaîne : enregistrés en chaîne, diffusés en objet
        let rollResult, rawResult;
        try {
            rollResult = _toObject(roll_result);
            rawResult  = _toObject(raw_result);
        } catch {
            return res.status(400).json({ error: 'Entrée d\'historique invalide : JSON illisible' });
        }

        const dbResult = req.db.prepare(`
            INSERT INTO dice_history (character_id, session_id, roll_type, label, notation, raw_result, roll_result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            character_id || null,
            session_id   || null,
            roll_type,
            label,
            notation     || null,
            rawResult ? JSON.stringify(rawResult) : null,
            JSON.stringify(rollResult)
        );

        const rollData = {
            id:             dbResult.lastInsertRowid,
            character_id,
            character_name: character_name || 'Anonyme',
            session_id,
            roll_type,
            label,
            notation:       notation || null,
            raw_result:     rawResult,
            roll_result:    rollResult,
            created_at:     new Date().toISOString()
        };

        // Diffusion Socket.io dans la room de la table, et nulle part ailleurs.
        // Sans table : pas de diffusion (un io.emit global atteignait toutes les
        // pages de tous les slugs, dont les notifications de jets).
        const io = req.app.get('io');
        if (io && session_id) {
            io.to(`${req.system.slug}_session_${session_id}`).emit('dice-roll', rollData);
        }

        res.status(201).json(rollData);

    } catch (error) {
        console.error('[dice/roll] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /history ─────────────────────────────────────────────────────────────
// Historique global (session ou global selon sessionId query param).

router.get('/history', (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        const { sessionId } = req.query;
        const nameExpr      = getCharNameExpr(req.db);

        let query = `
            SELECT
                dh.*,
                (${nameExpr}) AS character_name
            FROM dice_history dh
            LEFT JOIN characters c ON dh.character_id = c.id
        `;
        const params = [];

        if (sessionId) {
            query  += ' WHERE dh.session_id = ?';
            params.push(sessionId);
        }
        query += ' ORDER BY dh.created_at DESC LIMIT ?';
        params.push(limit);

        const rows = req.db.prepare(query).all(...params);
        res.json(rows.map(_parseHistoryRow));

    } catch (error) {
        console.error('[dice/history] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /history/:characterId ────────────────────────────────────────────────
// Historique d'un personnage spécifique.

router.get('/history/:characterId', (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const { sessionId } = req.query;
        const nameExpr      = getCharNameExpr(req.db);

        let query  = `SELECT dh.*, (${nameExpr}) AS character_name FROM dice_history dh LEFT JOIN characters c ON dh.character_id = c.id WHERE character_id = ?`;
        const params = [req.params.characterId];

        if (sessionId) {
            query  += ' AND session_id = ?';
            params.push(sessionId);
        }
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const rows = req.db.prepare(query).all(...params);
        res.json(rows.map(_parseHistoryRow));

    } catch (error) {
        console.error('[dice/history/:characterId] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /history/:id ──────────────────────────────────────────────────────
// Supprime un jet de l'historique. Toute personne connectée (joueur ou MJ) :
// le bouton est proposé à chacun dans l'historique (DiceHistoryList).

router.delete('/history/:id', authenticate, (req, res) => {
    try {
        req.db.prepare('DELETE FROM dice_history WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('[dice/history DELETE] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /history/session/:sessionId ───────────────────────────────────────
// Purge tout l'historique d'une session.

router.delete('/history/session/:sessionId', authenticate, (req, res) => {
    try {
        req.db.prepare('DELETE FROM dice_history WHERE session_id = ?').run(req.params.sessionId);
        res.json({ success: true });
    } catch (error) {
        console.error('[dice/history/session DELETE] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /history ──────────────────────────────────────────────────────────
// Purge tout l'historique (« Tout effacer » sans table, toute personne connectée).

router.delete('/history', authenticate, (req, res) => {
    try {
        req.db.prepare('DELETE FROM dice_history').run();
        res.json({ success: true });
    } catch (error) {
        console.error('[dice/history DELETE all] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Helpers privés ───────────────────────────────────────────────────────────

/** Objet reçu tel quel, chaîne JSON parsée (lève si illisible), absent → null. */
function _toObject(value) {
    if (value == null || value === '') return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
}

/**
 * Parse les colonnes JSON d'une ligne dice_history retournée par SQLite,
 * sans erreur si un JSON est invalide.
 */
function _parseHistoryRow(row) {
    return {
        ...row,
        raw_result:  _safeJsonParse(row.raw_result),
        roll_result: _safeJsonParse(row.roll_result),
    };
}

function _safeJsonParse(str) {
    if (!str) return null;
    try { return JSON.parse(str); }
    catch { return str; } // retourne la string brute si parsing échoue
}

module.exports = router;