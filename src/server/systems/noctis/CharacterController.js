// ─── Valeurs dérivées ─────────────────────────────────────────────────────────

/**
 * Calcule les valeurs dérivées affichées en lecture seule sur la fiche.
 * Initiative, limite de corruption, malus blessure actif.
 */
function computeDerived(char) {
    return {
        initiative:        char.agilite + char.athletisme,
        limite_corruption: char.volonte  + char.sante,
        malus_blessure:    _malusBlessure(char),
    };
}

function _malusBlessure(char) {
    if (char.sante_tue_current   > 0) return -3;
    if (char.sante_blesse_current > 0) return -2;
    if (char.sante_touche_current > 0) return -1;
    return 0;
}

/**
 * Calcule les maximums théoriques des réserves à partir des caractéristiques.
 * Utilisé à la création pour initialiser reserve_effort_max / reserve_sangfroid_max.
 * En jeu, les max stockés font foi (ils peuvent être décrémentés par sacrifice).
 */
function computeReserveMax(char) {
    return {
        reserve_effort_max: char.force + char.sante + char.athletisme
            + char.agilite + char.precision + char.technique,
        reserve_sangfroid_max: char.connaissance + char.perception + char.volonte
            + char.persuasion  + char.psychologie + char.entregent,
    };
}

// ─── Chargement complet ───────────────────────────────────────────────────────

/**
 * Charge un personnage avec toutes ses données associées.
 * @param {Database} db
 * @param {number|string} id
 * @param {number|null} sessionId  — si fourni, charge la fiche de groupe de cette session
 */
function loadFullCharacter(db, id, sessionId = null) {
    const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!char) return null;

    const specialties = db.prepare(
        'SELECT * FROM character_specialties WHERE character_id = ? ORDER BY created_at'
    ).all(id);

    const ombres = db.prepare(
        'SELECT * FROM character_ombres WHERE character_id = ? ORDER BY created_at'
    ).all(id);

    const items = db.prepare(
        'SELECT * FROM character_items WHERE character_id = ? ORDER BY created_at'
    ).all(id);

    // Fiche de groupe : on charge par sessionId si dispo, sinon valeurs vides
    let groupReserve = null;
    if (sessionId) {
        groupReserve = db.prepare(
            'SELECT * FROM session_group_reserve WHERE session_id = ?'
        ).get(sessionId);
    }
    if (!groupReserve) {
        groupReserve = { current: 0, principes: '[]', interdits: '[]', regle_acces: 'libre', notes: '' };
    }

    // Désérialiser les champs JSON de la fiche de groupe
    groupReserve = _parseGroupReserve(groupReserve);

    return {
        ...char,
        // Alias camelCase pour le frontend
        accessCode: char.access_code,
        accessUrl:  char.access_url,
        // Données associées
        specialties,
        ombres,
        items,
        groupReserve,
        // Valeurs dérivées calculées
        ...computeDerived(char),
    };
}

// ─── Sauvegarde complète ──────────────────────────────────────────────────────

/**
 * Met à jour un personnage et ses données associées (spécialités, ombres, items),
 * en transaction. La fiche de groupe est gérée par sa propre route.
 * Seuls les champs fournis sont écrits (src/server/CLAUDE.md) : colonnes en
 * COALESCE, sous-tables synchronisées par _syncSubTable si leur tableau est
 * présent (un tableau absent laisse la sous-table intacte).
 */
function saveFullCharacter(db, id, data) {
    const params = { id };
    for (const column of FLAT_COLUMNS) params[column] = data[column] ?? null;

    const setClauses = FLAT_COLUMNS
        .map(column => `${column} = COALESCE(@${column}, ${column})`)
        .join(',\n            ');

    db.prepare('BEGIN').run();
    try {
        db.prepare(`
            UPDATE characters SET
            ${setClauses},
            updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run(params);

        _syncSubTable(db, 'character_specialties', id, data.specialties, _upsertSpecialty);
        _syncSubTable(db, 'character_ombres',      id, data.ombres,      _upsertOmbre);
        _syncSubTable(db, 'character_items',       id, data.items,       _upsertItem);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

// Colonnes à plat écrites par saveFullCharacter (noctis envoie ses champs en
// snake_case, sous le nom des colonnes). accessCode / accessUrl, groupReserve
// et les valeurs dérivées (initiative, limite_corruption, malus_blessure) n'y
// figurent pas : ignorés, comme avant.
const FLAT_COLUMNS = [
    'nom', 'prenom', 'avatar', 'sexe', 'age', 'taille', 'poids',
    'description_physique', 'activite', 'faction', 'annee_campagne',
    'force', 'sante', 'athletisme', 'agilite', 'precision', 'technique',
    'connaissance', 'perception', 'volonte', 'persuasion', 'psychologie', 'entregent',
    'reserve_effort_max', 'reserve_effort_current', 'reserve_sangfroid_max', 'reserve_sangfroid_current',
    'sante_touche_max', 'sante_touche_current', 'sante_blesse_max', 'sante_blesse_current',
    'sante_tue_max', 'sante_tue_current',
    'eclats_max', 'eclats_current', 'is_fracture',
    'xp_total', 'xp_spent', 'selvarins_current', 'selvarins_month', 'notes',
];

/**
 * Synchronise une sous-table en CRUD complet (même helper que vikings, fabula,
 * deltagreen). Entrée avec id → mise à jour ; sans id → insertion ; présente
 * en BDD mais absente du tableau → suppression.
 */
function _syncSubTable(db, table, characterId, incoming, upsertFn) {
    if (!Array.isArray(incoming)) return;

    const existingIds = db.prepare(
        `SELECT id FROM ${table} WHERE character_id = ?`
    ).all(characterId).map(r => r.id);

    const incomingIds = incoming.filter(i => i?.id).map(i => i.id);

    for (const eid of existingIds) {
        if (!incomingIds.includes(eid)) {
            db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(eid);
        }
    }

    for (const item of incoming) {
        if (item) upsertFn(db, characterId, item);
    }
}

// Mise à jour par id, sinon insertion (id inconnu de la base = insertion).
function _updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues) {
    const changes = entry.id ? db.prepare(updateSql).run(...updateValues).changes : 0;
    if (!changes) db.prepare(insertSql).run(...insertValues);
}

function _upsertSpecialty(db, charId, s) {
    const values = [s.name ?? '', s.type ?? 'normale', s.niveau ?? 'debutant', s.is_dormant ?? 0, s.notes ?? ''];
    _updateOrInsert(db, s,
        `UPDATE character_specialties SET name = ?, type = ?, niveau = ?, is_dormant = ?, notes = ?
         WHERE id = ? AND character_id = ?`, [...values, s.id, charId],
        `INSERT INTO character_specialties (character_id, name, type, niveau, is_dormant, notes)
         VALUES (?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertOmbre(db, charId, o) {
    const values = [o.type ?? 'dette', o.description ?? '', o.effect ?? ''];
    _updateOrInsert(db, o,
        'UPDATE character_ombres SET type = ?, description = ?, effect = ? WHERE id = ? AND character_id = ?',
        [...values, o.id, charId],
        'INSERT INTO character_ombres (character_id, type, description, effect) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertItem(db, charId, it) {
    const values = [
        it.name ?? '', it.description ?? '', it.category ?? 'misc', it.quantity ?? 1,
        it.location ?? 'inventory', it.damage_value ?? 0, it.armor_value ?? '', it.price ?? 0, it.notes ?? '',
    ];
    _updateOrInsert(db, it,
        `UPDATE character_items SET name = ?, description = ?, category = ?, quantity = ?, location = ?,
             damage_value = ?, armor_value = ?, price = ?, notes = ?
         WHERE id = ? AND character_id = ?`, [...values, it.id, charId],
        `INSERT INTO character_items
             (character_id, name, description, category, quantity, location,
              damage_value, armor_value, price, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

function _parseGroupReserve(raw) {
    return {
        ...raw,
        principes: _parseJSON(raw.principes, []),
        interdits: _parseJSON(raw.interdits, []),
    };
}

function _parseJSON(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
}

module.exports = { loadFullCharacter, saveFullCharacter, computeReserveMax, computeDerived };