// src/server/systems/cyberpunk/routes/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes personnages spécifiques au slug Cyberpunk.
// Montée automatiquement sur /api/cyberpunk/characters par loader.js.
//
// Création publique (pas d'auth).
// Lecture par URL ou code : publique.
// Écriture : auth requise (propriétaire ou GM).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireOwnerOrGM, requireGM } = require('../../../middlewares/auth');
const { ensureUniqueCode } = require('../../../utils/characters');
const { loadFullCharacter, saveFullCharacter } = require('../CharacterController');
const { generateAccessUrl } = require('../config');

// ── GET / — Liste résumée (GM uniquement) ─────────────────────────────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(`
            SELECT id, access_code, access_url, player_name, nom, prenom,
                   playbook, cred, info_tokens, matos_tokens, retenue,
                   xp, base_advancements, avatar, updated_at
            FROM characters
            WHERE id != -1
            ORDER BY updated_at DESC
        `).all();

        res.json(rows.map(c => ({
            id:               c.id,
            accessCode:       c.access_code,
            accessUrl:        c.access_url,
            playerName:       c.player_name,
            nom:              c.nom,
            prenom:           c.prenom,
            playbook:         c.playbook,
            cred:             c.cred,
            infoTokens:       c.info_tokens,
            matosTokens:      c.matos_tokens,
            retenue:          c.retenue,
            xp:               c.xp,
            baseAdvancements: c.base_advancements,
            avatar:           c.avatar,
            updatedAt:        c.updated_at,
        })));
    } catch (err) {
        console.error('[cyberpunk] GET /characters:', err);
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
        console.error('[cyberpunk] GET /by-url:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /by-code/:code — Chargement par access_code (public, pour login) ─────

router.get('/by-code/:code', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT id FROM characters WHERE access_code = ?'
        ).get(req.params.code.toUpperCase());

        if (!row) return res.status(404).json({ error: 'Personnage introuvable' });

        res.json(loadFullCharacter(req.db, row.id));
    } catch (err) {
        console.error('[cyberpunk] GET /by-code:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id — Chargement complet (auth requise) ──────────────────────────────

router.get('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const char = loadFullCharacter(req.db, req.params.id);
        if (!char) return res.status(404).json({ error: 'Personnage introuvable' });
        res.json(char);
    } catch (err) {
        console.error('[cyberpunk] GET /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /:id/sessions — Sessions du personnage ────────────────────────────────

router.get('/:id/sessions', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const sessions = req.db.prepare(`
            SELECT gs.id, gs.name, gs.date, gs.updated_at
            FROM game_sessions gs
            JOIN session_characters sc ON sc.session_id = gs.id
            WHERE sc.character_id = ?
            ORDER BY gs.updated_at DESC
        `).all(req.params.id);

        res.json(sessions);
    } catch (err) {
        console.error('[cyberpunk] GET /:id/sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST / — Création (public) ────────────────────────────────────────────────

router.post('/', (req, res) => {
    try {
        const db = req.db;
        const {
            playerName, nom, prenom, playbook,
            // Stats
            cran, pro, chair, esprit, style, synth,
            // Ressources initiales
            cred, infoTokens, matosTokens,
            // Sous-entités (wizard)
            directives, relations, cyberware, moves,
            // Narratif
            darkSecret, apparence, sexe,
        } = req.body;

        let code, url;
        // Génération de codes uniques
        ({ code, url } = ensureUniqueCode('character', req));
        // const accessCode = ensureUniqueCode(
        //     db,
        //     () => Math.random().toString(36).substring(2, 8).toUpperCase(),
        //     'characters'
        // );
        // const accessUrl = ensureUniqueCode(
        //     db,
        //     generateAccessUrl,
        //     'characters',
        //     'access_url'
        // );

        // Insert minimal — on crée l'enregistrement pour obtenir l'id
        const result = db.prepare(`
            INSERT INTO characters (
                player_name, nom, prenom, playbook,
                cran, pro, chair, esprit, style, synth,
                apparence, sexe, dark_secret,
                cred, info_tokens, matos_tokens,
                access_code, access_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            playerName ?? '', nom ?? '', prenom ?? '', playbook ?? '',
            cran ?? 0, pro ?? 0, chair ?? 0, esprit ?? 0, style ?? 0, synth ?? 0,
            apparence ?? '', sexe ?? '', darkSecret ?? '',
            cred ?? 0, infoTokens ?? 0, matosTokens ?? 0,
            code, url
        );

        const newId = result.lastInsertRowid;

        // Persister les sous-entités via saveFullCharacter (transaction)
        // On ne passe que les champs qui contiennent des sous-entités —
        // les colonnes plates sont déjà en BDD, COALESCE(null, col) les laisse intactes.
        saveFullCharacter(db, newId, {
            directives: Array.isArray(directives)  ? directives  : [],
            relations:  Array.isArray(relations)   ? relations   : [],
            cyberware:  Array.isArray(cyberware)   ? cyberware   : [],
            moves:      Array.isArray(moves)       ? moves       : [],
        });

        res.status(201).json(loadFullCharacter(db, newId));
    } catch (err) {
        console.error('[cyberpunk] POST /characters:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /:id — Sauvegarde complète (auth requise) ─────────────────────────────

router.put('/:id', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(id)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const updated = saveFullCharacter(req.db, id, req.body);

        // Broadcast Socket.io si le personnage est dans une session active
        const io = req.app.get('io');
        if (io) {
            const sessions = req.db.prepare(
                'SELECT session_id FROM session_characters WHERE character_id = ?'
            ).all(id);
            for (const { session_id } of sessions) {
                const payload = { characterId: id, character: updated };
                for (const { session_id } of sessions) {
                    io.to(`cyberpunk_session_${session_id}`).emit('character-full-update', payload);
                }
            }
        }

        res.json(updated);
    } catch (err) {
        console.error('[cyberpunk] PUT /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id/resources — Mise à jour rapide des ressources (Cred, info, matos, retenue) ──

router.patch('/:id/resources', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const { cred, infoTokens, matosTokens, retenue } = req.body;
        req.db.prepare(`
            UPDATE characters SET
                cred         = COALESCE(?, cred),
                info_tokens  = COALESCE(?, info_tokens),
                matos_tokens = COALESCE(?, matos_tokens),
                retenue      = COALESCE(?, retenue),
                updated_at   = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            cred ?? null, infoTokens ?? null, matosTokens ?? null, retenue ?? null,
            req.params.id
        );
        res.json(loadFullCharacter(req.db, req.params.id));
    } catch (err) {
        console.error('[cyberpunk] PATCH /:id/resources:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /:id/xp — Mise à jour XP et avancements ───────────────────────────

router.patch('/:id/xp', authenticate, requireOwnerOrGM, (req, res) => {
    try {
        const db  = req.db;
        const cid = req.params.id;
        const { xp, baseAdvancements, statKey, statDelta, moveId, action } = req.body;

        // Mise à jour XP brut et compteur avancements
        if (xp !== undefined || baseAdvancements !== undefined) {
            db.prepare(`
                UPDATE characters SET
                    xp                = COALESCE(?, xp),
                    base_advancements = COALESCE(?, base_advancements),
                    updated_at        = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(xp ?? null, baseAdvancements ?? null, cid);
        }

        // Avancement stat : validation des plafonds
        if (statKey && statDelta) {
            const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(cid);
            const currentVal = char[statKey] ?? 0;
            const newVal     = currentVal + statDelta;
            const maxStat    = (char.base_advancements ?? 0) >= 5 ? 3 : 2;

            if (newVal > maxStat) {
                return res.status(400).json({ error: `Stat plafonnée à +${maxStat} (${char.base_advancements < 5 ? '5 avancements requis pour +3' : 'maximum absolu'})` });
            }
            if (newVal < -2) {
                return res.status(400).json({ error: 'Stat minimum : -2' });
            }

            db.prepare(`UPDATE characters SET ${statKey} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newVal, cid);
        }

        // Avancement move : ajout ou retrait
        if (moveId && action) {
            if (action === 'add') {
                db.prepare('INSERT OR IGNORE INTO character_moves (character_id, move_id) VALUES (?, ?)').run(cid, moveId);
            } else if (action === 'remove') {
                db.prepare('DELETE FROM character_moves WHERE character_id = ? AND move_id = ?').run(cid, moveId);
            }
        }

        res.json(loadFullCharacter(db, cid));
    } catch (err) {
        console.error('[cyberpunk] PATCH /:id/xp:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /:id — Suppression (GM uniquement) ─────────────────────────────────

router.delete('/:id', authenticate, requireGM, (req, res) => {
    try {
        req.db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('[cyberpunk] DELETE /:id:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/send-item', authenticate, requireGM, (req, res) => {
    try {
        const charId = Number(req.params.id);
        const { name, description = '', quantity = 1, sessionId } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Le nom de l\'item est requis' });
        }

        if (!req.db.prepare('SELECT id FROM characters WHERE id = ?').get(charId)) {
            return res.status(404).json({ error: 'Personnage introuvable' });
        }

        const result = req.db.prepare(`
            INSERT INTO character_items (character_id, name, description, quantity)
            VALUES (?, ?, ?, ?)
        `).run(charId, name.trim(), description.trim(), Math.max(1, quantity));

        const item = { id: result.lastInsertRowid, name: name.trim(), description, quantity };

        // Journal entry
        req.db.prepare(`
            INSERT INTO character_journal (character_id, session_id, type, title, body, metadata, is_read)
            VALUES (?, ?, 'gm_item', ?, ?, ?, 0)
        `).run(
            charId,
            sessionId ?? null,
            `Objet reçu : ${name.trim()}`,
            description || null,
            JSON.stringify({ item })
        );

        // Broadcast socket
        const io = req.app.get('io');
        if (io) {
            const payload = { characterId: charId, item };
            const room = sessionId ? `cyberpunk_session_${sessionId}` : null;
            if (room) {
                io.to(room).emit('gm-item-received', payload);
            } else {
                io.emit('gm-item-received', payload);
            }
        }

        res.status(201).json({ success: true, item });
    } catch (err) {
        console.error('[cyberpunk] POST /:id/send-item:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;