// src/server/systems/vikings/routes/characters.js
// Routes personnages spécifiques au système Pure Vikings.
// Montée automatiquement sur /api/vikings/characters par Loader.js.
// Spec : documentations/spec_vikings_lot2_serveur.md (§5)
//
// Création, liste et chargement par URL/code : publics (sélection et connexion).
// Lecture/écriture d'une fiche : propriétaire ou MJ. Suppression : MJ.

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode } = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter } = require('../CharacterController');
const { generateAccessUrl } = require('../config');

// ── Broadcast helper ─────────────────────────────────────────────────────────
// Une room par session du personnage, jamais d'io.emit global.

function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare(
        'SELECT session_id FROM session_characters WHERE character_id = ?'
    ).all(characterId);
    for (const { session_id } of sessions) {
        io.to(`vikings_session_${session_id}`).emit('character-full-update', {
            characterId,
            character,
        });
    }
}

// ── GET / — Liste résumée (publique — sélection du personnage) ───────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, prenom, surnom, nom,
                   avatar, age, sexe, saga_actuelle, saga_totale,
                   tokens_blessure, tokens_fatigue
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:             c.id,
            accessCode:     c.access_code,
            accessUrl:      c.access_url,
            playerName:     c.player_name,
            name:           `${c.prenom ?? ''}${c.surnom ? ' "' + c.surnom + '"' : ''}`,
            prenom:         c.prenom,
            surnom:         c.surnom,
            nom:            c.nom,
            avatar:         c.avatar,
            age:            c.age,
            sexe:           c.sexe,
            sagaActuelle:   c.saga_actuelle,
            sagaTotale:     c.saga_totale,
            tokensBlessure: c.tokens_blessure,
            tokensFatigue:  c.tokens_fatigue,
        })));
    } catch (err) {
        console.error('[vikings] GET /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-url/:url — Chargement par access_url (public) ────────────────────

router.get('/by-url/:url', (req, res) => {
    try {
        const row = req.db.prepare('SELECT id FROM characters WHERE access_url = ?').get(req.params.url);
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        req.db.prepare('UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(row.id);
        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[vikings] GET /by-url:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Chargement par access_code (public, login) ──────────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare('SELECT id FROM characters WHERE access_code = ?').get(req.params.code.toUpperCase());
        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[vikings] GET /by-code:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage ────────────────────────────────
// ⚠️ Déclarée AVANT GET /:id : sinon "/12/sessions" correspond à "/:id".

router.get('/:id/sessions', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const sessions = req.db.prepare(`
            SELECT gs.*, COUNT(sc2.character_id) AS character_count
            FROM game_sessions gs
            INNER JOIN session_characters sc  ON gs.id = sc.session_id
            LEFT  JOIN session_characters sc2 ON gs.id = sc2.session_id
            WHERE sc.character_id = ?
            GROUP BY gs.id
            ORDER BY gs.updated_at DESC
        `).all(req.params.id);

        res.json(sessions);
    } catch (err) {
        console.error('[vikings] GET /:id/sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Fiche complète (propriétaire ou MJ) ────────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        const char = loadFullCharacter(req.db, id);
        if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

        req.db.prepare('UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?').run(id);
        res.json(char);
    } catch (err) {
        console.error('[vikings] GET /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Création (publique, assistant de création) ──────────────────────
// Le joueur peut choisir son code d'accès : conservé s'il est libre, 409 sinon (L-4).

router.post('/', (req, res) => {
    try {
        const { playerName, prenom, accessCode } = req.body;

        if (!playerName?.trim() || !prenom?.trim()) {
            return res.status(400).json({ error: 'Le nom du joueur et le prénom du personnage sont requis' });
        }

        let code, url;
        if (accessCode?.trim()) {
            code = accessCode.trim().toUpperCase().substring(0, 6);
            if (req.db.prepare('SELECT id FROM characters WHERE access_code = ?').get(code)) {
                return res.status(409).json({ error: 'Ce code d\'accès est déjà utilisé' });
            }
            let attempts = 0;
            do {
                url = generateAccessUrl();
                attempts++;
            } while (req.db.prepare('SELECT id FROM characters WHERE access_url = ?').get(url) && attempts < 10);
            if (attempts >= 10) return res.status(500).json({ error: 'Impossible de générer une URL unique' });
        } else {
            ({ code, url } = ensureUniqueCode('character', req));
        }

        const result = req.db.prepare(`
            INSERT INTO characters (access_code, access_url, player_name, prenom)
            VALUES (?, ?, ?, ?)
        `).run(code, url, playerName.trim(), prenom.trim());

        const charId = Number(result.lastInsertRowid);

        // Le code est déjà fixé : on ne le laisse pas réécrire par le corps de la requête
        const created = saveFullCharacter(req.db, charId, {
            ...req.body,
            accessCode: undefined,
            playerName: playerName.trim(),
            prenom:     prenom.trim(),
        });

        res.status(201).json(created);
    } catch (err) {
        console.error('[vikings] POST /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Mise à jour complète (propriétaire ou MJ) ─────────────────────

router.put('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }
        const updated = saveFullCharacter(req.db, id, req.body);
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[vikings] PUT /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id — Mise à jour partielle (propriétaire ou MJ) ──────────────────
// Pour patchImmediate (actions de jeu hors mode édition).

router.patch('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }
        const updated = saveFullCharacter(req.db, id, req.body);
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[vikings] PATCH /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:id/avatar — Upload avatar (propriétaire ou MJ) ────────────────────

router.post('/:id/avatar', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ error: 'avatar requis' });
        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const updated = saveFullCharacter(req.db, id, { avatar });
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[vikings] POST /:id/avatar:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Suppression (MJ uniquement, jamais le compte MJ) ───────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === -1) return res.status(403).json({ error: 'Le compte MJ ne peut pas être supprimé' });

        const result = req.db.prepare('DELETE FROM characters WHERE id = ? AND id != -1').run(id);
        if (result.changes === 0) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json({ deleted: true, id });
    } catch (err) {
        console.error('[vikings] DELETE /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
