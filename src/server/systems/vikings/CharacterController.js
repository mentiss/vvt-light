// src/server/systems/vikings/CharacterController.js
// Couche d'accès données pour le système Pure Vikings.
// Spec : documentations/spec_vikings_lot2_serveur.md (§4)
//
// Contrat :
//   loadFullCharacter(db, id) → objet complet en camelCase ; skills, traits,
//                                runes et items portent chacun leur id.
//   saveFullCharacter(db, id, data) → transaction ; colonnes à plat en COALESCE
//                                (un champ absent n'est pas écrasé → PATCH) ;
//                                sous-tables synchronisées par _syncSubTable
//                                (un tableau absent laisse la sous-table intacte).
// Aucune règle métier ici (plafond SAGA, gains, triple 10 : côté client).

// ── Colonnes à plat : clé camelCase envoyée par le client → colonne SQL ──────

const FLAT_COLUMNS = {
    playerName:         'player_name',
    prenom:             'prenom',
    nom:                'nom',
    surnom:             'surnom',
    sexe:               'sexe',
    age:                'age',
    taille:             'taille',
    poids:              'poids',
    activite:           'activite',
    avatar:             'avatar',
    accessCode:         'access_code',
    force:              'force',
    agilite:            'agilite',
    perception:         'perception',
    intelligence:       'intelligence',
    charisme:           'charisme',
    chance:             'chance',
    armure:             'armure',
    actionsDisponibles: 'actions_disponibles',
    seuilCombat:        'seuil_combat',
    sagaActuelle:       'saga_actuelle',
    sagaTotale:         'saga_totale',
    tokensBlessure:     'tokens_blessure',
    tokensFatigue:      'tokens_fatigue',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Synchronise une sous-table en CRUD complet (même helper que deltagreen).
 * Entrée avec id → mise à jour ; sans id → insertion ;
 * présente en BDD mais absente du tableau → suppression.
 */
function _syncSubTable(db, table, characterId, incoming, upsertFn) {
    if (!Array.isArray(incoming)) return;

    const existingIds = db.prepare(
        `SELECT id FROM ${table} WHERE character_id = ?`
    ).all(characterId).map(r => r.id);

    const incomingIds = incoming.filter(i => i.id).map(i => i.id);

    for (const eid of existingIds) {
        if (!incomingIds.includes(eid)) {
            db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(eid);
        }
    }

    for (const item of incoming) {
        upsertFn(db, characterId, item);
    }
}

// Mise à jour par id, sinon insertion. Un id inconnu de la base (id temporaire
// créé côté client, ex. Date.now() dans l'inventaire) est traité comme une insertion.
function _updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues) {
    const changes = entry.id ? db.prepare(updateSql).run(...updateValues).changes : 0;
    if (!changes) db.prepare(insertSql).run(...insertValues);
}

function _upsertSkill(db, charId, s) {
    const values = [s.name, s.specialization || null, s.level ?? 0, s.currentPoints ?? 0];
    _updateOrInsert(db, s,
        `UPDATE character_skills SET skill_name = ?, specialization = ?, level = ?, current_points = ?
         WHERE id = ? AND character_id = ?`, [...values, s.id, charId],
        `INSERT INTO character_skills (character_id, skill_name, specialization, level, current_points)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertTrait(db, charId, t) {
    _updateOrInsert(db, t,
        'UPDATE character_traits SET trait_name = ? WHERE id = ? AND character_id = ?', [t.name, t.id, charId],
        'INSERT INTO character_traits (character_id, trait_name) VALUES (?, ?)', [charId, t.name]);
}

function _upsertRune(db, charId, r) {
    _updateOrInsert(db, r,
        'UPDATE character_runes SET rune_name = ?, level = ? WHERE id = ? AND character_id = ?', [r.name, r.level ?? 1, r.id, charId],
        'INSERT INTO character_runes (character_id, rune_name, level) VALUES (?, ?, ?)', [charId, r.name, r.level ?? 1]);
}

function _upsertItem(db, charId, item) {
    const values = [
        item.name, item.category, item.quantity ?? 1, item.location || 'bag', item.notes || null,
        item.weaponType || null, item.damage ?? null, item.range || null, item.armorValue ?? 0,
        JSON.stringify(item.requirements ?? {}), item.customItem ? 1 : 0,
    ];
    _updateOrInsert(db, item,
        `UPDATE character_items SET name = ?, category = ?, quantity = ?, location = ?, notes = ?,
             weapon_type = ?, damage = ?, range = ?, armor_value = ?, requirements = ?, custom_item = ?
         WHERE id = ? AND character_id = ?`, [...values, item.id, charId],
        `INSERT INTO character_items (character_id, name, category, quantity, location, notes,
             weapon_type, damage, range, armor_value, requirements, custom_item)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _parseJson(text, fallback) {
    try { return text ? JSON.parse(text) : fallback; } catch { return fallback; }
}

// ── API publique ─────────────────────────────────────────────────────────────

function loadFullCharacter(db, characterId) {
    const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    if (!char) return null;

    const skills = db.prepare(`
        SELECT id, skill_name AS name, specialization, level, current_points AS currentPoints
        FROM character_skills WHERE character_id = ? ORDER BY id
    `).all(characterId);

    const traits = db.prepare(
        'SELECT id, trait_name AS name FROM character_traits WHERE character_id = ? ORDER BY id'
    ).all(characterId);

    const runes = db.prepare(
        'SELECT id, rune_name AS name, level FROM character_runes WHERE character_id = ? ORDER BY id'
    ).all(characterId);

    const items = db.prepare('SELECT * FROM character_items WHERE character_id = ? ORDER BY id').all(characterId).map(item => ({
        id:           item.id,
        name:         item.name,
        category:     item.category,
        quantity:     item.quantity,
        location:     item.location,
        notes:        item.notes,
        weaponType:   item.weapon_type,
        damage:       item.damage,
        range:        item.range,
        armorValue:   item.armor_value,
        requirements: _parseJson(item.requirements, {}),
        customItem:   item.custom_item === 1,
    }));

    return {
        id:                 char.id,
        accessCode:         char.access_code,
        accessUrl:          char.access_url,
        playerName:         char.player_name,
        prenom:             char.prenom,
        nom:                char.nom,
        surnom:             char.surnom,
        sexe:               char.sexe,
        age:                char.age,
        taille:             char.taille,
        poids:              char.poids,
        activite:           char.activite,
        avatar:             char.avatar,
        force:              char.force,
        agilite:            char.agilite,
        perception:         char.perception,
        intelligence:       char.intelligence,
        charisme:           char.charisme,
        chance:             char.chance,
        armure:             char.armure,
        actionsDisponibles: char.actions_disponibles,
        seuilCombat:        char.seuil_combat,
        sagaActuelle:       char.saga_actuelle,
        sagaTotale:         char.saga_totale,
        tokensBlessure:     char.tokens_blessure,
        tokensFatigue:      char.tokens_fatigue,
        skills,
        traits,
        runes,
        items,
        createdAt:          char.created_at,
        updatedAt:          char.updated_at,
    };
}

function saveFullCharacter(db, id, data) {
    const params = { id };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) params[column] = data[key] ?? null;
    if (params.access_code) params.access_code = String(params.access_code).toUpperCase();

    const setClauses = Object.values(FLAT_COLUMNS)
        .map(column => `${column} = COALESCE(@${column}, ${column})`)
        .join(',\n                ');

    db.prepare('BEGIN').run();
    try {
        db.prepare(`
            UPDATE characters SET
                ${setClauses},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run(params);

        _syncSubTable(db, 'character_skills', id, data.skills, _upsertSkill);
        _syncSubTable(db, 'character_traits', id, data.traits, _upsertTrait);
        _syncSubTable(db, 'character_runes',  id, data.runes,  _upsertRune);
        _syncSubTable(db, 'character_items',  id, data.items,  _upsertItem);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter };
