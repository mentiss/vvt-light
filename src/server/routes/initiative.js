// src/server/routes/initiative.js
// ─────────────────────────────────────────────────────────────────────────────
// Initiative d'une table (documentations/spec_initiative.md §9.4) : route partagée,
// montée pour chaque système sur /api/:slug/initiative.
//
// - L'état vit en mémoire du serveur (sharedState.initiativeStates), comme l'état de
//   lecture de la musique : aucune base. Perdu au redémarrage du serveur ; le
//   navigateur du MJ en garde une copie et propose de la reprendre.
// - Le MJ envoie l'état complet à chaque geste (Q-33) : forme vérifiée
//   (utils/initiative.js), état gardé, diffusé à la room de la table.
// - Les avatars voyagent à part (une fois, à l'ajout) : gardés avec l'état, diffusés
//   par initiative-avatars seulement quand ils changent.
//
//   GET    /sessions/:sid  → { state, avatars }   (tout membre connecté : arrivée, rechargement)
//   PUT    /sessions/:sid  { state, avatars? }    (MJ) → { state, avatars }
//   DELETE /sessions/:sid                         (MJ) → fin de l'initiative
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { authenticate, requireGM } = require('../middlewares/auth');
const { sharedState } = require('../socket/index');
const ctrl = require('../utils/initiative');

const stateKey = (slug, sessionId) => `${slug}_${sessionId}`;
const EMPTY = { state: null, avatars: {} };

// Toutes les routes passent par /sessions/:sid : la table doit exister dans la base du slug
router.param('sid', (req, res, next, sid) => {
    try {
        const sessionId = Number(sid);
        if (!Number.isInteger(sessionId) || !req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Table introuvable' });
        }
        const slug = req.system.slug;
        req.initiative = { slug, sessionId, key: stateKey(slug, sessionId), room: `${slug}_session_${sessionId}`, io: req.app.get('io') };
        next();
    } catch (error) {
        console.error('[initiative] table:', error);
        res.status(500).json({ error: 'Lecture de la table impossible' });
    }
});

const current = (ctx) => sharedState.initiativeStates.get(ctx.key) ?? EMPTY;

router.get('/sessions/:sid', authenticate, (req, res) => {
    try {
        res.json(current(req.initiative));
    } catch (error) {
        console.error('[initiative] GET:', error);
        res.status(500).json({ error: 'Lecture de l\'initiative impossible' });
    }
});

router.put('/sessions/:sid', authenticate, requireGM, (req, res) => {
    try {
        const ctx = req.initiative;
        const state = ctrl.validateState(req.body?.state);
        const incoming = ctrl.validateAvatars(req.body?.avatars);
        const { avatars, changed } = ctrl.mergeAvatars(current(ctx).avatars, incoming, state);
        sharedState.initiativeStates.set(ctx.key, { state, avatars });

        const ids = { system: ctx.slug, sessionId: ctx.sessionId };
        if (changed) ctx.io?.to(ctx.room).emit('initiative-avatars', { ...ids, avatars });
        ctx.io?.to(ctx.room).emit('initiative-state', { ...ids, state });
        res.json({ state, avatars });
    } catch (error) {
        if (error instanceof ctrl.ValidationError) return res.status(400).json({ error: error.message });
        console.error('[initiative] PUT:', error);
        res.status(500).json({ error: 'Enregistrement de l\'initiative impossible' });
    }
});

router.delete('/sessions/:sid', authenticate, requireGM, (req, res) => {
    try {
        const ctx = req.initiative;
        sharedState.initiativeStates.delete(ctx.key);
        ctx.io?.to(ctx.room).emit('initiative-state', { system: ctx.slug, sessionId: ctx.sessionId, state: null });
        res.json(EMPTY);
    } catch (error) {
        console.error('[initiative] DELETE:', error);
        res.status(500).json({ error: 'Fin de l\'initiative impossible' });
    }
});

module.exports = router;
