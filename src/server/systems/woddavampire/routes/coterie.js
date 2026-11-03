// src/server/systems/woddavampire/routes/coterie.js
// ─────────────────────────────────────────────────────────────────────────────
// Coterie de la table (spec_woddavampire.md §II.17.3), montée par le Loader sur
// /api/woddavampire/coterie. La route vérifie les droits et délègue au contrôleur
// (CoterieController.js), qui porte les règles.
//
//   GET    /:sessionId                         authentifié        coterie ou null
//   POST   /:sessionId                         Conteur            création { name, anchorKey }
//   PATCH  /:sessionId                         table ou Conteur   textes, emblème, détails
//   PUT    /:sessionId/story                   Conteur            { backgroundKey, storyPoints }
//   POST   /:sessionId/contribute/:characterId propriétaire / MJ  { backgroundKey, points }
//   POST   /:sessionId/withdraw/:characterId   propriétaire / MJ  { backgroundKey }
//
// Après chaque écriture : vda-coterie-update { sessionId, coterie } dans la room
// de la table ; verser et retirer diffusent aussi la fiche du personnage.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM, requireOwnerOrGM } = require('../../../middlewares/auth');
const { loadFullCharacter, broadcastCharacterUpdate } = require('../CharacterController');
const {
    CoterieError, loadCoterie, createCoterie, updateCoterieTexts, setStoryPoints, contribute, withdraw,
} = require('../CoterieController');

const SLUG = 'woddavampire';

const broadcastCoterie = (req, sessionId, coterie) => {
    req.app.get('io')?.to(`${SLUG}_session_${sessionId}`).emit('vda-coterie-update', { sessionId, coterie });
};

/** Exécute une écriture : réponse, diffusion, erreurs de règle en 4xx */
const write = (label, fn, { status = 200, characterUpdated = false } = {}) => (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        const coterie = fn(req, sessionId);
        broadcastCoterie(req, sessionId, coterie);
        if (characterUpdated) {
            const characterId = Number(req.params.characterId);
            broadcastCharacterUpdate(req.app.get('io'), req.db, characterId, loadFullCharacter(req.db, characterId));
        }
        res.status(status).json(coterie);
    } catch (err) {
        if (err instanceof CoterieError) return res.status(err.status).json({ error: err.message });
        console.error(`[${SLUG}] ${label}:`, err);
        res.status(500).json({ error: err.message });
    }
};

router.get('/:sessionId', authenticate, (req, res) => {
    try {
        res.json(loadCoterie(req.db, Number(req.params.sessionId)));
    } catch (err) {
        console.error(`[${SLUG}] GET /coterie/:sessionId:`, err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:sessionId', authenticate, requireGM,
    write('POST /coterie', (req, sessionId) => createCoterie(req.db, sessionId, req.body), { status: 201 }));

router.patch('/:sessionId', authenticate,
    write('PATCH /coterie', (req, sessionId) => updateCoterieTexts(req.db, sessionId, req.user, req.body)));

router.put('/:sessionId/story', authenticate, requireGM,
    write('PUT /coterie/story', (req, sessionId) => setStoryPoints(req.db, sessionId, req.body?.backgroundKey, req.body?.storyPoints)));

router.post('/:sessionId/contribute/:characterId', authenticate, requireOwnerOrGM,
    write('POST /coterie/contribute', (req, sessionId) => contribute(req.db, sessionId, Number(req.params.characterId), req.body?.backgroundKey, req.body?.points),
        { characterUpdated: true }));

router.post('/:sessionId/withdraw/:characterId', authenticate, requireOwnerOrGM,
    write('POST /coterie/withdraw', (req, sessionId) => withdraw(req.db, sessionId, Number(req.params.characterId), req.body?.backgroundKey),
        { characterUpdated: true }));

module.exports = router;
