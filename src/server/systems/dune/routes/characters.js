// src/server/systems/dune/routes/characters.js
// Routes personnages propres à Dune, montées sur /api/dune/characters AVANT la
// route commune (src/server/routes/characters.js, spec_characters_route.md) qui
// porte la liste, la lecture, la création, la sauvegarde et la suppression.

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { broadcastCharacterUpdate, emitToCharacterSessions } = require('../../../utils/characters');
const { loadFullCharacter, addItem, addTalent } = require('../CharacterController');

const SLUG = 'dune';

// ── POST /:id/items et /:id/talents — Ajout d'une ligne (joueur ou MJ) ──────
// Renvoie la ligne créée avec son id réel : le client l'ajoute à la fiche la plus
// récente, sans risque d'écraser un ajout précédent encore en vol (catalogue,
// ajouts successifs). Les qualité et mots-clefs d'un atout sont facultatifs.

router.post('/:id/items', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }
        const { nom, description = '', quantite = 1, qualite = null, motsCles = '' } = req.body ?? {};
        if (!nom?.trim()) return res.status(400).json({ error: 'Le nom de l\'atout est requis' });
        const item = addItem(req.db, id, { nom, description, quantite, qualite, motsCles });
        broadcastCharacterUpdate(req.app.get('io'), req.db, SLUG, id, loadFullCharacter(req.db, id));
        res.status(201).json(item);
    } catch (err) {
        console.error('[dune] POST /:id/items:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/talents', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }
        const { talentName, description = '' } = req.body ?? {};
        if (!talentName?.trim()) return res.status(400).json({ error: 'Le nom du talent est requis' });
        const talent = addTalent(req.db, id, { talentName, description });
        broadcastCharacterUpdate(req.app.get('io'), req.db, SLUG, id, loadFullCharacter(req.db, id));
        res.status(201).json(talent);
    } catch (err) {
        console.error('[dune] POST /:id/talents:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /:id/send-item ─────────────────────────────────────────────────────
// Envoi d'un atout par le MJ vers un joueur : insère l'atout et émet
// gm-item-received dans les rooms des tables du personnage (jamais à tout le serveur).

router.post('/:id/send-item', authenticate, requireGM, (req, res) => {
    try {
        const charId = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(charId)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }
        const { nom, description = '', quantite = 1, qualite = null, motsCles = '' } = req.body ?? {};
        if (!nom?.trim()) {
            return res.status(400).json({ error: 'Le nom de l\'atout est requis' });
        }

        // qualite / motsCles : facultatifs (spec_dune.md §3.2), remplis par le catalogue
        addItem(req.db, charId, { nom, description: description.trim(), quantite, qualite, motsCles });

        // Fiche à jour pour la table (le MJ la reçoit par character-full-update),
        // puis la notification du joueur
        broadcastCharacterUpdate(req.app.get('io'), req.db, SLUG, charId, loadFullCharacter(req.db, charId));
        emitToCharacterSessions(req.app.get('io'), req.db, SLUG, charId, 'gm-item-received', {
            characterId: charId,
            item: { nom: nom.trim(), description: description.trim(), quantite },
        });

        res.json({ success: true });
    } catch (err) {
        console.error('[dune] POST /:id/send-item:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
