// src/server/systems/fabula/routes/session-characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Compteur GM de Points Fabula dépensés par personnage et par session de jeu
// (calcul d'XP de fin de session — retour MJ, Lot C). Manuel, GM uniquement,
// jamais exposé au joueur.
//
// pf_depenses vit directement sur session_characters (colonne slug-spécifique
// ajoutée par ALTER, cf. fabula-schema.sql) — PAS un singleton comme
// session_resources (Achtung/Dune) : c'est une valeur par (session, personnage).
// La route générique src/server/routes/sessions.js ne peut pas l'exposer
// (elle ne sélectionne que les colonnes universelles à tous les slugs), d'où
// cette route dédiée, montée par le loader sur /api/fabula/session-characters.
//
// Pas de Socket.io : lecture/écriture GM uniquement, un seul lecteur, aucune
// synchronisation temps réel à assurer (cohérent avec "pas d'affichage joueur").
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const { authenticate, requireGM } = require('../../../middlewares/auth');

// GET /:sessionId — pf_depenses de tous les personnages de la session (GM)
router.get('/:sessionId', authenticate, requireGM, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);

        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Session introuvable' });
        }

        const rows = req.db.prepare(
            'SELECT character_id, pf_depenses FROM session_characters WHERE session_id = ?'
        ).all(sessionId);

        res.json(Object.fromEntries(rows.map(r => [r.character_id, r.pf_depenses ?? 0])));
    } catch (err) {
        console.error('[fabula] GET /session-characters/:sessionId:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /:sessionId/:characterId — ajuster le compteur (GM)
// Body : { delta: number entier, positif ou négatif }
router.put('/:sessionId/:characterId', authenticate, requireGM, (req, res) => {
    try {
        const sessionId   = Number(req.params.sessionId);
        const characterId = Number(req.params.characterId);
        const { delta } = req.body;

        if (typeof delta !== 'number' || !Number.isInteger(delta)) {
            return res.status(400).json({ error: 'delta doit être un entier' });
        }

        const row = req.db.prepare(
            'SELECT pf_depenses FROM session_characters WHERE session_id = ? AND character_id = ?'
        ).get(sessionId, characterId);
        if (!row) return res.status(404).json({ error: 'Personnage hors de cette session' });

        const newVal = Math.max(0, (row.pf_depenses ?? 0) + delta);

        req.db.prepare(
            'UPDATE session_characters SET pf_depenses = ? WHERE session_id = ? AND character_id = ?'
        ).run(newVal, sessionId, characterId);

        res.json({ sessionId, characterId, pfDepenses: newVal });
    } catch (err) {
        console.error('[fabula] PUT /session-characters/:sessionId/:characterId:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;