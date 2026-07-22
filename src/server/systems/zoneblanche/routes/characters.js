// src/server/systems/zoneblanche/routes/characters.js
// Routes personnages spécifiques au slug Zone Blanche.
// Montée automatiquement sur /api/zoneblanche/characters par loader.js.
//
// Création publique (pas d'auth). Lecture par URL/liste : publique (nécessaire
// pour l'écran de sélection de personnage, AVANT authentification).
// Écriture : Owner ou GM. Suppression : GM.

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode } = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter } = require('../CharacterController');

// ── Broadcast helper ─────────────────────────────────────────────────────────

function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare(
        'SELECT session_id FROM session_characters WHERE character_id = ?'
    ).all(characterId);
    for (const { session_id } of sessions) {
        io.to(`zoneblanche_session_${session_id}`).emit('character-full-update', {
            characterId,
            character,
        });
    }
}

// ── GET / — Liste résumée (publique — utilisée pour la sélection de perso) ───

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, nom, prenom,
                   archetype, avatar, updated_at
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:          c.id,
            accessCode:  c.access_code,
            accessUrl:   c.access_url,
            playerName:  c.player_name,
            nom:         c.nom,
            prenom:      c.prenom,
            archetype:   c.archetype,
            avatar:      c.avatar,
            updatedAt:   c.updated_at,
        })));
    } catch (err) {
        console.error('[zoneblanche] GET /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-url/:url — Chargement par access_url (public) ────────────────────

router.get('/by-url/:url', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_url = ?'
        ).get(req.params.url);

        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        req.db.prepare(
            'UPDATE characters SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(row.id);

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[zoneblanche] GET /by-url:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Chargement par access_code (public, login) ──────────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_code = ?'
        ).get(req.params.code);

        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[zoneblanche] GET /by-code:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage ────────────────────────────────
// ⚠️ Doit impérativement être déclarée AVANT GET /:id : sinon Express fait
// correspondre "/12/sessions" à "/:id" et la route n'est jamais atteinte.

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
        console.error('[zoneblanche] GET /:id/sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Fiche complète (Owner ou GM) ───────────────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const char = loadFullCharacter(req.db, Number(req.params.id));
        if (!char) return res.status(404).json({ error: 'Personnage introuvable' });
        res.json(char);
    } catch (err) {
        console.error('[zoneblanche] GET /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Création (publique, sans authentification) ──────────────────────

router.post('/', (req, res) => {
    try {
        const { playerName, nom } = req.body;

        if (!playerName?.trim()) {
            return res.status(400).json({ error: 'playerName est requis' });
        }

        const { code, url } = ensureUniqueCode('character', req);

        const result = req.db.prepare(`
            INSERT INTO characters (access_code, access_url, player_name, nom)
            VALUES (?, ?, ?, ?)
        `).run(code, url, playerName.trim(), (nom ?? '').trim());

        const charId = result.lastInsertRowid;

        saveFullCharacter(req.db, charId, {
            ...req.body,
            playerName: playerName.trim(),
        });

        res.status(201).json(loadFullCharacter(req.db, charId));
    } catch (err) {
        console.error('[zoneblanche] POST /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Mise à jour complète (Owner ou GM) ─────────────────────────────

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
        console.error('[zoneblanche] PUT /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id — Mise à jour partielle (Owner ou GM) ──────────────────────────
// Utilisé pour patchImmediate (Prime Time, matériel hors edit mode, etc.)

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
        console.error('[zoneblanche] PATCH /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /:id/avatar — Upload avatar (Owner ou GM) ────────────────────────────

router.post('/:id/avatar', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ error: 'avatar requis' });

        const updated = saveFullCharacter(req.db, id, { avatar });
        broadcastCharacterUpdate(req.app.get('io'), req.db, id, updated);
        res.json(updated);
    } catch (err) {
        console.error('[zoneblanche] POST /:id/avatar:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Suppression (GM uniquement) ─────────────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (id === -1) return res.status(403).json({ error: 'Le compte GM ne peut pas être supprimé' });

        const result = req.db.prepare('DELETE FROM characters WHERE id = ? AND id != -1').run(id);
        if (result.changes === 0) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json({ success: true });
    } catch (err) {
        console.error('[zoneblanche] DELETE /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;