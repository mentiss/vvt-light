// src/server/systems/vileborn/routes/challenges.js
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque des défis du MJ (spec_vileborn_defis.md §II.3), montée sur
// /api/vileborn/challenges. Réservée au MJ : les joueurs ne voient rien (Q14).
//
// GET    /      → fiches de la bibliothèque [{ id, ...fiche }]
// POST   /      { sheet } → création (ou duplication) ; 201 + fiche
// PUT    /:id   { sheet } → remplace la fiche
// DELETE /:id   → supprime le modèle (les défis lancés gardent leur copie)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');
const ctrl = require('../ChallengeController');

router.use(authenticate, requireGM);

const readId = (req) => { const id = Number(req.params.id); return Number.isInteger(id) ? id : null; };

router.get('/', (req, res) => {
    try {
        res.json(ctrl.listChallenges(req.db));
    } catch (err) {
        ctrl.respondError(res, err, 'GET /challenges', 'Lecture de la bibliothèque impossible');
    }
});

router.post('/', (req, res) => {
    try {
        res.status(201).json(ctrl.createChallenge(req.db, req.body?.sheet));
    } catch (err) {
        ctrl.respondError(res, err, 'POST /challenges', 'Création du défi impossible');
    }
});

router.put('/:id', (req, res) => {
    try {
        const id = readId(req);
        if (id === null) return res.status(400).json({ error: 'Défi invalide' });
        const challenge = ctrl.updateChallenge(req.db, id, req.body?.sheet);
        if (!challenge) return res.status(404).json({ error: 'Défi introuvable' });
        res.json(challenge);
    } catch (err) {
        ctrl.respondError(res, err, 'PUT /challenges/:id', 'Enregistrement du défi impossible');
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = readId(req);
        if (id === null) return res.status(400).json({ error: 'Défi invalide' });
        if (!ctrl.deleteChallenge(req.db, id)) return res.status(404).json({ error: 'Défi introuvable' });
        res.json({ success: true });
    } catch (err) {
        ctrl.respondError(res, err, 'DELETE /challenges/:id', 'Suppression du défi impossible');
    }
});

module.exports = router;
