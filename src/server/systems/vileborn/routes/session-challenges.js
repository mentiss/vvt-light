// src/server/systems/vileborn/routes/session-challenges.js
// ─────────────────────────────────────────────────────────────────────────────
// Défis en cours d'une table (spec_vileborn_defis.md §II.3), montée sur
// /api/vileborn/session-challenges. Réservée au MJ ; aucune diffusion : seul le
// MJ suit les défis, un autre appareil relit en ouvrant l'onglet.
//
// GET    /?sessionId=          → défis en cours [{ id, sessionId, challengeId, sheet, progress, adjust, notes }]
// POST   /  { sessionId, challengeId } → lance un défi de la bibliothèque (copie de la fiche) ; 201
// PATCH  /:id { progress?, adjust?, notes? } → envoi partiel (un champ absent est conservé)
// DELETE /:id                  → retire le défi de la table
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');
const ctrl = require('../ChallengeController');

router.use(authenticate, requireGM);

const toId = (value) => { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : null; };

router.get('/', (req, res) => {
    try {
        const sessionId = toId(req.query.sessionId);
        if (sessionId === null) return res.status(400).json({ error: 'Table invalide' });
        res.json(ctrl.listActive(req.db, sessionId));
    } catch (err) {
        ctrl.respondError(res, err, 'GET /session-challenges', 'Lecture des défis en cours impossible');
    }
});

router.post('/', (req, res) => {
    try {
        const sessionId = toId(req.body?.sessionId);
        const challengeId = toId(req.body?.challengeId);
        if (sessionId === null || challengeId === null) return res.status(400).json({ error: 'Table et défi requis' });
        const active = ctrl.launchChallenge(req.db, sessionId, challengeId);
        if (!active) return res.status(404).json({ error: 'Table ou défi introuvable' });
        res.status(201).json(active);
    } catch (err) {
        ctrl.respondError(res, err, 'POST /session-challenges', 'Lancement du défi impossible');
    }
});

router.patch('/:id', (req, res) => {
    try {
        const id = toId(req.params.id);
        if (id === null) return res.status(400).json({ error: 'Défi invalide' });
        const { progress, adjust, notes } = req.body ?? {};
        const active = ctrl.patchActive(req.db, id, { progress, adjust, notes });
        if (!active) return res.status(404).json({ error: 'Défi introuvable' });
        res.json(active);
    } catch (err) {
        ctrl.respondError(res, err, 'PATCH /session-challenges/:id', 'Enregistrement du défi impossible');
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = toId(req.params.id);
        if (id === null) return res.status(400).json({ error: 'Défi invalide' });
        if (!ctrl.deleteActive(req.db, id)) return res.status(404).json({ error: 'Défi introuvable' });
        res.json({ success: true });
    } catch (err) {
        ctrl.respondError(res, err, 'DELETE /session-challenges/:id', 'Retrait du défi impossible');
    }
});

module.exports = router;
