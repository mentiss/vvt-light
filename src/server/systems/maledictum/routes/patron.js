// src/server/systems/maledictum/routes/patron.js
// ─────────────────────────────────────────────────────────────────────────────
// Patron de la table, Supériorité du groupe et Subtilité (spec_maledictum.md §9.3),
// monté par le Loader sur /api/maledictum/patron. La route vérifie les droits et
// délègue au contrôleur (PatronController.js). Lecture : joueurs de la table et
// MJ ; écriture : MJ seul.
//
//   GET    /:sessionId                fiche (valeurs par défaut si jamais écrite)
//   PUT    /:sessionId                { data?, secret?, superiority?, subtlety?, subtletyEnabled? }
//   PUT    /:sessionId/superiority    { value }
//
// Après chaque écriture : maledictum-patron-update { sessionId, patron } dans la
// room de la table.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');
const { PatronError, loadPatron, savePatron, setSuperiority, requireTableMember } = require('../PatronController');

const SLUG = 'maledictum';

const broadcast = (req, sessionId, patron) => {
    req.app.get('io')?.to(`${SLUG}_session_${sessionId}`).emit('maledictum-patron-update', { sessionId, patron });
};

/** Réponse, diffusion, erreurs de règle en 4xx */
const handle = (label, fn, { write = true } = {}) => (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        if (!write) requireTableMember(req.db, sessionId, req.user);
        const patron = fn(req, sessionId);
        if (write) broadcast(req, sessionId, patron);
        res.json(patron);
    } catch (err) {
        if (err instanceof PatronError) return res.status(err.status).json({ error: err.message });
        console.error(`[${SLUG}] ${label}:`, err);
        res.status(500).json({ error: err.message });
    }
};

router.get('/:sessionId', authenticate,
    handle('GET /patron', (req, sessionId) => loadPatron(req.db, sessionId), { write: false }));

router.put('/:sessionId/superiority', authenticate, requireGM,
    handle('PUT /patron/superiority', (req, sessionId) => setSuperiority(req.db, sessionId, req.body?.value)));

router.put('/:sessionId', authenticate, requireGM,
    handle('PUT /patron', (req, sessionId) => savePatron(req.db, sessionId, req.body)));

module.exports = router;
