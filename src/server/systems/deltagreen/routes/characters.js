// src/server/systems/deltagreen/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes personnages propres à Delta Green, montées sur /api/deltagreen/characters
// AVANT la route commune (src/server/routes/characters.js, spec_characters_route.md)
// qui porte la liste, la lecture, la création, la sauvegarde et la suppression.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM } = require('../../../middlewares/auth');
const { loadFullCharacter } = require('../CharacterController');

// ── POST /:id/san-loss — Appliquer une perte de SAN ──────────────────────────
// Déduit loss_applied de san_current, recalcule sr, insère dans le log.

router.post('/:id/san-loss', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const db = req.db;
        const charId = req.params.id;

        const {
            situationLabel, lossSuccess, lossFailure,
            lossApplied, sessionId,
        } = req.body;

        const char = db.prepare(
            'SELECT san_current, pow FROM characters WHERE id = ?'
        ).get(charId);

        if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

        const sanBefore = char.san_current;
        const sanAfter  = Math.max(0, sanBefore - (lossApplied ?? 0));
        const newSr     = sanAfter - (char.pow ?? 10);

        db.prepare('BEGIN').run();
        try {
            // Mettre à jour san_current et sr
            db.prepare(`
                UPDATE characters SET san_current = ?, sr = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(sanAfter, newSr, charId);

            // Insérer l'entrée dans le log
            const logRow = db.prepare(`
                INSERT INTO character_san_log
                    (character_id, session_id, situation_label, loss_success, loss_failure,
                     loss_applied, san_before, san_after)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                charId,
                sessionId ?? null,
                situationLabel ?? '',
                lossSuccess ?? '0',
                lossFailure ?? '1',
                lossApplied ?? 0,
                sanBefore,
                sanAfter
            );

            db.prepare('COMMIT').run();

            // Date posée par la base (DEFAULT CURRENT_TIMESTAMP) : renvoyée pour
            // que l'historique l'affiche sans attendre un rechargement
            const { created_at: createdAt } = db.prepare(
                'SELECT created_at FROM character_san_log WHERE id = ?'
            ).get(logRow.lastInsertRowid);

            res.json({
                sanCurrent: sanAfter,
                sr:         newSr,
                logEntry: {
                    id:             logRow.lastInsertRowid,
                    createdAt,
                    situationLabel: situationLabel ?? '',
                    lossSuccess:    lossSuccess    ?? '0',
                    lossFailure:    lossFailure    ?? '1',
                    lossApplied:    lossApplied    ?? 0,
                    sanBefore,
                    sanAfter,
                },
            });
        } catch (err) {
            db.prepare('ROLLBACK').run();
            throw err;
        }
    } catch (err) {
        console.error('[deltagreen] POST /:id/san-loss:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:id/evolve — Évolution post-session ─────────────────────────────────
// Les jets D4 sont effectués côté client (diceEngine).
// Le client envoie les résultats : { results: [{ skillId, languageId?, gain }] }
// Le serveur applique les gains et décoche toutes les cases.

router.post('/:id/evolve', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const db     = req.db;
        const charId = req.params.id;
        const { results } = req.body; // [{ skillId?, languageId?, gain }]

        if (!Array.isArray(results)) {
            return res.status(400).json({ error: 'results doit être un tableau' });
        }

        db.prepare('BEGIN').run();
        try {
            for (const entry of results) {
                const gain = Math.max(0, entry.gain ?? 0);
                if (entry.skillId) {
                    db.prepare(`
                        UPDATE character_skills
                        SET score = MIN(99, score + ?), failed_check = 0
                        WHERE id = ? AND character_id = ?
                    `).run(gain, entry.skillId, charId);
                } else if (entry.languageId) {
                    db.prepare(`
                        UPDATE character_languages
                        SET score = MIN(99, score + ?), failed_check = 0
                        WHERE id = ? AND character_id = ?
                    `).run(gain, entry.languageId, charId);
                }
            }

            // Décochage sécurité — s'assure qu'aucune case ne reste cochée
            db.prepare(
                'UPDATE character_skills   SET failed_check = 0 WHERE character_id = ?'
            ).run(charId);
            db.prepare(
                'UPDATE character_languages SET failed_check = 0 WHERE character_id = ?'
            ).run(charId);

            db.prepare('COMMIT').run();

            res.json(loadFullCharacter(db, charId));
        } catch (err) {
            db.prepare('ROLLBACK').run();
            throw err;
        }
    } catch (err) {
        console.error('[deltagreen] POST /:id/evolve:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;