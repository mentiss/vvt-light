// src/server/routes/npcs.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de la plateforme (documentations/spec_pnj.md §6.3), monté pour tous les
// slugs sur /api/:slug/npcs. Réservé au MJ, lecture comprise. Pas de diffusion
// socket : les PNJ ne vivent que côté MJ.
//
// Bibliothèque
//   GET    /                    → fiches [{ id, prenom, nom, role, …, systemData }]
//   POST   /                    { npc } → création ; 201 + fiche
//   PUT    /:id                 { npc } → modification (champs absents gardés)
//   DELETE /:id                 → suppression (les PNJ à la table gardent leur copie)
// PNJ à la table
//   GET    /sessions/:sid       → PNJ de la table, dans l'ordre
//   POST   /sessions/:sid       { npcId, quantity?, state? } → copies numérotées ; 201 + PNJ ajoutés
//   PATCH  /sessions/:sid/:id   { name?, sheet?, state?, notes?, sortOrder? }
//   DELETE /sessions/:sid/:id   → retire un PNJ
//   DELETE /sessions/:sid       → vide la table
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../middlewares/auth');
const ctrl = require('../utils/npcs');

router.use(authenticate, requireGM);

const readInt = (value) => { const n = Number(value); return Number.isInteger(n) ? n : null; };

// ── PNJ à la table (déclarées avant /:id) ────────────────────────────────────

router.get('/sessions/:sid', (req, res) => {
    try {
        const sid = readInt(req.params.sid);
        if (sid === null) return res.status(400).json({ error: 'Table invalide' });
        if (!ctrl.sessionExists(req.db, sid)) return res.status(404).json({ error: 'Table introuvable' });
        res.json(ctrl.listSessionNpcs(req.db, sid));
    } catch (err) {
        ctrl.respondError(res, err, 'GET /sessions/:sid', 'Lecture des PNJ de la table impossible');
    }
});

router.post('/sessions/:sid', (req, res) => {
    try {
        const sid = readInt(req.params.sid);
        if (sid === null) return res.status(400).json({ error: 'Table invalide' });
        const added = ctrl.addSessionNpcs(req.db, sid, req.body ?? {});
        if (!added) return res.status(404).json({ error: 'Table ou PNJ introuvable' });
        res.status(201).json(added);
    } catch (err) {
        ctrl.respondError(res, err, 'POST /sessions/:sid', 'Ajout du PNJ à la table impossible');
    }
});

router.patch('/sessions/:sid/:id', (req, res) => {
    try {
        const sid = readInt(req.params.sid), id = readInt(req.params.id);
        if (sid === null || id === null) return res.status(400).json({ error: 'PNJ invalide' });
        const npc = ctrl.updateSessionNpc(req.db, sid, id, req.body);
        if (!npc) return res.status(404).json({ error: 'PNJ introuvable à cette table' });
        res.json(npc);
    } catch (err) {
        ctrl.respondError(res, err, 'PATCH /sessions/:sid/:id', 'Modification du PNJ impossible');
    }
});

router.delete('/sessions/:sid/:id', (req, res) => {
    try {
        const sid = readInt(req.params.sid), id = readInt(req.params.id);
        if (sid === null || id === null) return res.status(400).json({ error: 'PNJ invalide' });
        if (!ctrl.removeSessionNpc(req.db, sid, id)) return res.status(404).json({ error: 'PNJ introuvable à cette table' });
        res.json({ success: true });
    } catch (err) {
        ctrl.respondError(res, err, 'DELETE /sessions/:sid/:id', 'Retrait du PNJ impossible');
    }
});

router.delete('/sessions/:sid', (req, res) => {
    try {
        const sid = readInt(req.params.sid);
        if (sid === null) return res.status(400).json({ error: 'Table invalide' });
        res.json({ removed: ctrl.clearSessionNpcs(req.db, sid) });
    } catch (err) {
        ctrl.respondError(res, err, 'DELETE /sessions/:sid', 'Vidage de la table impossible');
    }
});

// ── Bibliothèque ─────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    try {
        res.json(ctrl.listNpcs(req.db));
    } catch (err) {
        ctrl.respondError(res, err, 'GET /', 'Lecture de la bibliothèque impossible');
    }
});

router.post('/', (req, res) => {
    try {
        res.status(201).json(ctrl.createNpc(req.db, req.body?.npc));
    } catch (err) {
        ctrl.respondError(res, err, 'POST /', 'Création du PNJ impossible');
    }
});

router.put('/:id', (req, res) => {
    try {
        const id = readInt(req.params.id);
        if (id === null) return res.status(400).json({ error: 'PNJ invalide' });
        const npc = ctrl.updateNpc(req.db, id, req.body?.npc);
        if (!npc) return res.status(404).json({ error: 'PNJ introuvable' });
        res.json(npc);
    } catch (err) {
        ctrl.respondError(res, err, 'PUT /:id', 'Enregistrement du PNJ impossible');
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = readInt(req.params.id);
        if (id === null) return res.status(400).json({ error: 'PNJ invalide' });
        if (!ctrl.deleteNpc(req.db, id)) return res.status(404).json({ error: 'PNJ introuvable' });
        res.json({ success: true });
    } catch (err) {
        ctrl.respondError(res, err, 'DELETE /:id', 'Suppression du PNJ impossible');
    }
});

module.exports = router;
