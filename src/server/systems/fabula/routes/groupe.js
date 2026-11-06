// src/server/systems/fabula/routes/groupe.js
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de groupe de la table (spec_fabula.md §7), montée par le Loader sur
// /api/fabula/groupe. La route vérifie les droits et délègue au contrôleur
// (GroupeController.js), qui porte les règles. Joueurs de la table et MJ
// lisent et écrivent tout ; cacher ou montrer un cadran est réservé au MJ.
//
//   GET    /:sessionId                    fiche (vide si jamais écrite)
//   PUT    /:sessionId/notes              { notes }
//   POST   /:sessionId/:kind              ajout   (kind : objets | cadrans | journal)
//   PATCH  /:sessionId/:kind/:id          modification partielle
//   DELETE /:sessionId/:kind/:id          suppression
//
// Après chaque écriture : fabula-groupe-update { sessionId, groupe } dans la room
// de la table.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate } = require('../../../middlewares/auth');
const {
    GroupeError, loadGroupe, updateNotes, addRow, updateRow, removeRow, requireTableMember,
} = require('../GroupeController');

const SLUG = 'fabula';

const broadcastGroupe = (req, sessionId, groupe) => {
    req.app.get('io')?.to(`${SLUG}_session_${sessionId}`).emit('fabula-groupe-update', { sessionId, groupe });
};

/** Lecture ou écriture d'un membre de la table : réponse, diffusion, erreurs de règle en 4xx */
const handle = (label, fn, { status = 200, broadcast = true } = {}) => (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        requireTableMember(req.db, sessionId, req.user);
        const groupe = fn(req, sessionId);
        if (broadcast) broadcastGroupe(req, sessionId, groupe);
        res.status(status).json(groupe);
    } catch (err) {
        if (err instanceof GroupeError) return res.status(err.status).json({ error: err.message });
        console.error(`[${SLUG}] ${label}:`, err);
        res.status(500).json({ error: err.message });
    }
};

router.get('/:sessionId', authenticate,
    handle('GET /groupe', (req, sessionId) => loadGroupe(req.db, sessionId), { broadcast: false }));

router.put('/:sessionId/notes', authenticate,
    handle('PUT /groupe/notes', (req, sessionId) => updateNotes(req.db, sessionId, req.body?.notes)));

router.post('/:sessionId/:kind', authenticate,
    handle('POST /groupe', (req, sessionId) => addRow(req.db, sessionId, req.params.kind, req.body, req.user), { status: 201 }));

router.patch('/:sessionId/:kind/:id', authenticate,
    handle('PATCH /groupe', (req, sessionId) => updateRow(req.db, sessionId, req.params.kind, Number(req.params.id), req.body, req.user)));

router.delete('/:sessionId/:kind/:id', authenticate,
    handle('DELETE /groupe', (req, sessionId) => removeRow(req.db, sessionId, req.params.kind, Number(req.params.id))));

module.exports = router;
