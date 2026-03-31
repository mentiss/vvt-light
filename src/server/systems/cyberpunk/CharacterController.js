// src/server/systems/cyberpunk/CharacterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat : loadFullCharacter(db, id) → objet complet
//           saveFullCharacter(db, id, data) → objet complet mis à jour
//
// loadFullCharacter agrège :
//   - characters (stats, ressources, playbook, identité)
//   - character_directives (personal + mission)
//   - character_relations
//   - character_cyberware
//   - character_items
//   - character_moves (avec jointure moves pour les détails)
//   - tags (polymorphe : character, cyberware, relation, item)
//
// saveFullCharacter persiste en transaction :
//   - UPDATE characters (colonnes plates)
//   - CRUD sur directives, relations, cyberware, items (stable id ou insert/delete)
//   - CRUD sur character_moves
//   - CRUD sur tags (par entity_type + entity_id)
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers tags ─────────────────────────────────────────────────────────────

/**
 * Charge tous les tags pour une entité donnée.
 * @param {object} db
 * @param {string} entityType
 * @param {number} entityId
 * @returns {Array<{id, tag_text, tag_variant}>}
 */
function _loadTags(db, entityType, entityId) {
    return db.prepare(
        'SELECT id, tag_text, tag_variant FROM tags WHERE entity_type = ? AND entity_id = ? ORDER BY id'
    ).all(entityType, entityId);
}

/**
 * Remplace tous les tags d'une entité (delete + insert).
 * @param {object} db
 * @param {string} entityType
 * @param {number} entityId
 * @param {Array<{tag_text, tag_variant}>} tagsArray
 */
function _saveTags(db, entityType, entityId, tagsArray) {
    db.prepare('DELETE FROM tags WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
    if (!Array.isArray(tagsArray)) return;
    const stmt = db.prepare(
        'INSERT INTO tags (entity_type, entity_id, tag_text, tag_variant) VALUES (?, ?, ?, ?)'
    );
    for (const t of tagsArray) {
        stmt.run(entityType, entityId, t.tag_text ?? '', t.tag_variant ?? 'neutral');
    }
}

// ── loadFullCharacter ─────────────────────────────────────────────────────────

/**
 * Charge un personnage complet depuis la BDD.
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @returns {object|null}
 */
function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    // ── Sous-entités ─────────────────────────────────────────────────────────

    const directives = db.prepare(
        'SELECT id, type, text, blank_value, completed FROM character_directives WHERE character_id = ? ORDER BY type, id'
    ).all(id);

    const relations = db.prepare(
        'SELECT id, name, description, link_score FROM character_relations WHERE character_id = ? ORDER BY id'
    ).all(id).map(r => ({
        ...r,
        tags: _loadTags(db, 'relation', r.id),
    }));

    const cyberware = db.prepare(
        'SELECT id, name, option_text, notes FROM character_cyberware WHERE character_id = ? ORDER BY id'
    ).all(id).map(c => ({
        ...c,
        tags: _loadTags(db, 'cyberware', c.id),
    }));

    const items = db.prepare(
        'SELECT id, name, description, quantity FROM character_items WHERE character_id = ? ORDER BY id'
    ).all(id).map(i => ({
        ...i,
        tags: _loadTags(db, 'item', i.id),
    }));

    const moves = db.prepare(`
        SELECT cm.id AS char_move_id, cm.acquired_at,
               m.id, m.type, m.playbook, m.name, m.stat, m.description, m.is_approved
        FROM character_moves cm
        JOIN moves m ON m.id = cm.move_id
        WHERE cm.character_id = ?
        ORDER BY m.type, m.playbook, m.name
    `).all(id);

    // Tags du personnage lui-même
    const characterTags = _loadTags(db, 'character', id);

    // ── Reshape ──────────────────────────────────────────────────────────────

    return {
        id:          row.id,
        accessCode:  row.access_code,
        accessUrl:   row.access_url,
        playerName:  row.player_name,
        sessionId:   row.session_id,

        // Identité
        nom:       row.nom       ?? '',
        prenom:    row.prenom    ?? '',
        sexe:      row.sexe      ?? '',
        apparence: row.apparence ?? '',
        avatar:    row.avatar    ?? null,

        // Playbook
        playbook: row.playbook ?? '',

        // Stats
        cran:   row.cran   ?? 0,
        pro:    row.pro    ?? 0,
        chair:  row.chair  ?? 0,
        esprit: row.esprit ?? 0,
        style:  row.style  ?? 0,
        synth:  row.synth  ?? 0,

        // Ressources
        cred:        row.cred         ?? 0,
        infoTokens:  row.info_tokens  ?? 0,
        matosTokens: row.matos_tokens ?? 0,
        retenue:     row.retenue      ?? 0,

        // Progression
        xp:               row.xp               ?? 0,
        baseAdvancements: row.base_advancements ?? 0,

        // Narratif
        darkSecret: row.dark_secret ?? '',
        notes:      row.notes       ?? '',

        // Tags du personnage
        tags: characterTags,

        // Sous-entités
        directives: directives.map(d => ({
            id:         d.id,
            type:       d.type,
            text:       d.text       ?? '',
            blankValue: d.blank_value ?? '',
            completed:  !!d.completed,
        })),
        relations,
        cyberware,
        items,
        moves: moves.map(m => ({
            charMoveId:  m.char_move_id,
            acquiredAt:  m.acquired_at,
            id:          m.id,
            type:        m.type,
            playbook:    m.playbook,
            name:        m.name,
            stat:        m.stat,
            description: m.description,
            isApproved:  !!m.is_approved,
        })),

        // Métadonnées
        createdAt:    row.created_at,
        updatedAt:    row.updated_at,
        lastAccessed: row.last_accessed,
    };
}

// ── saveFullCharacter ─────────────────────────────────────────────────────────

/**
 * Persiste un personnage complet en transaction atomique.
 * CRUD sur toutes les sous-entités.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data
 * @returns {object} personnage rechargé
 */
function saveFullCharacter(db, id, data) {
    const {
        playerName, nom, prenom, sexe, apparence, avatar,
        playbook,
        cran, pro, chair, esprit, style, synth,
        cred, infoTokens, matosTokens, retenue,
        xp, baseAdvancements,
        darkSecret, notes,
        tags: characterTags,
        directives, relations, cyberware, items, moves,
        accessCode,
    } = data;

    db.prepare('BEGIN').run();
    try {
        // ── 1. UPDATE characters ──────────────────────────────────────────────
        db.prepare(`
            UPDATE characters SET
                player_name       = COALESCE(?, player_name),
                nom               = COALESCE(?, nom),
                prenom            = COALESCE(?, prenom),
                sexe              = COALESCE(?, sexe),
                apparence         = COALESCE(?, apparence),
                avatar            = COALESCE(?, avatar),
                playbook          = COALESCE(?, playbook),
                cran              = COALESCE(?, cran),
                pro               = COALESCE(?, pro),
                chair             = COALESCE(?, chair),
                esprit            = COALESCE(?, esprit),
                style             = COALESCE(?, style),
                synth             = COALESCE(?, synth),
                cred              = COALESCE(?, cred),
                info_tokens       = COALESCE(?, info_tokens),
                matos_tokens      = COALESCE(?, matos_tokens),
                retenue           = COALESCE(?, retenue),
                xp                = COALESCE(?, xp),
                base_advancements = COALESCE(?, base_advancements),
                dark_secret       = COALESCE(?, dark_secret),
                notes             = COALESCE(?, notes),
                access_code       = COALESCE(?, access_code),
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            playerName   ?? null, nom         ?? null, prenom   ?? null,
            sexe         ?? null, apparence   ?? null, avatar   ?? null,
            playbook     ?? null,
            cran         ?? null, pro         ?? null, chair    ?? null,
            esprit       ?? null, style       ?? null, synth    ?? null,
            cred         ?? null, infoTokens  ?? null, matosTokens ?? null,
            retenue      ?? null,
            xp           ?? null, baseAdvancements ?? null,
            darkSecret   ?? null, notes       ?? null,
            accessCode   ?? null,
            id
        );

        // ── 2. Tags du personnage ─────────────────────────────────────────────
        if (Array.isArray(characterTags)) {
            _saveTags(db, 'character', id, characterTags);
        }

        // ── 3. Directives ─────────────────────────────────────────────────────
        if (Array.isArray(directives)) {
            const existingIds = db.prepare(
                'SELECT id FROM character_directives WHERE character_id = ?'
            ).all(id).map(r => r.id);

            const incomingIds = directives.filter(d => d.id).map(d => d.id);

            // Suppression des absents
            for (const eid of existingIds) {
                if (!incomingIds.includes(eid)) {
                    db.prepare('DELETE FROM character_directives WHERE id = ?').run(eid);
                }
            }

            const upsertDirective = db.prepare(`
                INSERT INTO character_directives (id, character_id, type, text, blank_value, completed, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    type        = excluded.type,
                    text        = excluded.text,
                    blank_value = excluded.blank_value,
                    completed   = excluded.completed,
                    updated_at  = CURRENT_TIMESTAMP
            `);

            const insertDirective = db.prepare(`
                INSERT INTO character_directives (character_id, type, text, blank_value, completed)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const d of directives) {
                if (d.id) {
                    upsertDirective.run(d.id, id, d.type, d.text ?? '', d.blankValue ?? '', d.completed ? 1 : 0);
                } else {
                    insertDirective.run(id, d.type, d.text ?? '', d.blankValue ?? '', d.completed ? 1 : 0);
                }
            }
        }

        // ── 4. Relations ──────────────────────────────────────────────────────
        if (Array.isArray(relations)) {
            const existingIds = db.prepare(
                'SELECT id FROM character_relations WHERE character_id = ?'
            ).all(id).map(r => r.id);

            const incomingIds = relations.filter(r => r.id).map(r => r.id);

            for (const eid of existingIds) {
                if (!incomingIds.includes(eid)) {
                    db.prepare('DELETE FROM character_relations WHERE id = ?').run(eid);
                }
            }

            const upsertRelation = db.prepare(`
                INSERT INTO character_relations (id, character_id, name, description, link_score, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    name        = excluded.name,
                    description = excluded.description,
                    link_score  = excluded.link_score,
                    updated_at  = CURRENT_TIMESTAMP
            `);

            const insertRelation = db.prepare(`
                INSERT INTO character_relations (character_id, name, description, link_score)
                VALUES (?, ?, ?, ?)
            `);

            for (const r of relations) {
                if (r.id) {
                    upsertRelation.run(r.id, id, r.name ?? '', r.description ?? '', r.link_score ?? 1);
                    if (Array.isArray(r.tags)) _saveTags(db, 'relation', r.id, r.tags);
                } else {
                    const result = insertRelation.run(id, r.name ?? '', r.description ?? '', r.link_score ?? 1);
                    if (Array.isArray(r.tags)) _saveTags(db, 'relation', result.lastInsertRowid, r.tags);
                }
            }
        }

        // ── 5. Cyberware ──────────────────────────────────────────────────────
        if (Array.isArray(cyberware)) {
            const existingIds = db.prepare(
                'SELECT id FROM character_cyberware WHERE character_id = ?'
            ).all(id).map(r => r.id);

            const incomingIds = cyberware.filter(c => c.id).map(c => c.id);

            for (const eid of existingIds) {
                if (!incomingIds.includes(eid)) {
                    db.prepare('DELETE FROM character_cyberware WHERE id = ?').run(eid);
                }
            }

            const upsertCyberware = db.prepare(`
                INSERT INTO character_cyberware (id, character_id, name, option_text, notes, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    name        = excluded.name,
                    option_text = excluded.option_text,
                    notes       = excluded.notes,
                    updated_at  = CURRENT_TIMESTAMP
            `);

            const insertCyberware = db.prepare(`
                INSERT INTO character_cyberware (character_id, name, option_text, notes)
                VALUES (?, ?, ?, ?)
            `);

            for (const c of cyberware) {
                if (c.id) {
                    upsertCyberware.run(c.id, id, c.name ?? '', c.option_text ?? '', c.notes ?? '');
                    if (Array.isArray(c.tags)) _saveTags(db, 'cyberware', c.id, c.tags);
                } else {
                    const result = insertCyberware.run(id, c.name ?? '', c.option_text ?? '', c.notes ?? '');
                    if (Array.isArray(c.tags)) _saveTags(db, 'cyberware', result.lastInsertRowid, c.tags);
                }
            }
        }

        // ── 6. Inventaire ─────────────────────────────────────────────────────
        if (Array.isArray(items)) {
            const existingIds = db.prepare(
                'SELECT id FROM character_items WHERE character_id = ?'
            ).all(id).map(r => r.id);

            const incomingIds = items.filter(i => i.id).map(i => i.id);

            for (const eid of existingIds) {
                if (!incomingIds.includes(eid)) {
                    db.prepare('DELETE FROM character_items WHERE id = ?').run(eid);
                }
            }

            const upsertItem = db.prepare(`
                INSERT INTO character_items (id, character_id, name, description, quantity, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    name        = excluded.name,
                    description = excluded.description,
                    quantity    = excluded.quantity,
                    updated_at  = CURRENT_TIMESTAMP
            `);

            const insertItem = db.prepare(`
                INSERT INTO character_items (character_id, name, description, quantity)
                VALUES (?, ?, ?, ?)
            `);

            for (const i of items) {
                if (i.id) {
                    upsertItem.run(i.id, id, i.name ?? '', i.description ?? '', i.quantity ?? 1);
                    if (Array.isArray(i.tags)) _saveTags(db, 'item', i.id, i.tags);
                } else {
                    const result = insertItem.run(id, i.name ?? '', i.description ?? '', i.quantity ?? 1);
                    if (Array.isArray(i.tags)) _saveTags(db, 'item', result.lastInsertRowid, i.tags);
                }
            }
        }

        // ── 7. Moves débloqués ────────────────────────────────────────────────
        // On ne touche les moves que si le champ est présent (pour éviter
        // d'effacer les moves lors d'un save partiel de la fiche)
        if (Array.isArray(moves)) {
            const existingMoveIds = db.prepare(
                'SELECT move_id FROM character_moves WHERE character_id = ?'
            ).all(id).map(r => r.move_id);

            const incomingMoveIds = moves.map(m => m.id ?? m.move_id).filter(Boolean);

            // Suppression des moves retirés
            for (const mid of existingMoveIds) {
                if (!incomingMoveIds.includes(mid)) {
                    db.prepare('DELETE FROM character_moves WHERE character_id = ? AND move_id = ?').run(id, mid);
                }
            }

            // Ajout des nouveaux
            const insertMove = db.prepare(`
                INSERT OR IGNORE INTO character_moves (character_id, move_id) VALUES (?, ?)
            `);
            for (const mid of incomingMoveIds) {
                if (!existingMoveIds.includes(mid)) {
                    insertMove.run(id, mid);
                }
            }
        }

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter };