// src/server/systems/woddavampire/CharacterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat :
//   loadFullCharacter(db, id) → objet complet ou null
//   saveFullCharacter(db, id, data) → objet complet mis à jour
//   broadcastCharacterUpdate(io, db, id, character) → diffusion character-full-update
//
// loadFullCharacter agrège characters (colonnes à plat, `states` JSON parsé) et
// les sous-tables : abilities, backgrounds, disciplines, bloodPaths, rituals,
// meritsFlaws, derangements, bloodBonds, equipment.
//
// saveFullCharacter persiste en transaction atomique (modèle fabula / vikings) :
//   - UPDATE characters : colonnes à plat en COALESCE, un champ absent (ou null)
//     n'est pas écrasé → envoi partiel possible (PATCH). Un texte vidé ('') est
//     bien enregistré vide.
//   - Sous-tables synchronisées par _syncSubTable : mise à jour par id, insertion
//     sans id, suppression des lignes absentes du tableau ; un tableau absent
//     laisse la sous-table intacte.
// ─────────────────────────────────────────────────────────────────────────────

// ── Colonnes à plat : clé camelCase envoyée par le client → colonne SQL ──────
// (`states`, en JSON, est traité à part)

const FLAT_COLUMNS = {
    playerName:         'player_name',
    avatar:             'avatar',
    accessCode:         'access_code',
    nom:                'nom',
    prenom:             'prenom',
    sexe:               'sexe',
    age:                'age',
    taille:             'taille',
    poids:              'poids',
    // Identité
    chronicle:          'chronicle',
    concept:            'concept',
    natureKey:          'nature_key',
    demeanorKey:        'demeanor_key',
    sire:               'sire',
    // Clan
    clanKey:            'clan_key',
    casteKey:           'caste_key',
    originClanKey:      'origin_clan_key',
    weaknessDetail:     'weakness_detail',
    // Sang
    generation:         'generation',
    bloodCurrent:       'blood_current',
    // Route et Vertus
    roadKey:            'road_key',
    roadPathKey:        'road_path_key',
    roadRating:         'road_rating',
    virtueMoral:        'virtue_moral',
    virtueControl:      'virtue_control',
    virtueCourage:      'virtue_courage',
    // Volonté
    willpowerPermanent: 'willpower_permanent',
    willpowerCurrent:   'willpower_current',
    // Attributs
    strength:           'strength',
    dexterity:          'dexterity',
    stamina:            'stamina',
    charisma:           'charisma',
    manipulation:       'manipulation',
    appearance:         'appearance',
    perception:         'perception',
    intelligence:       'intelligence',
    wits:               'wits',
    // Santé (L2)
    damageBashing:      'damage_bashing',
    damageLethal:       'damage_lethal',
    damageAggravated:   'damage_aggravated',
    // États (L2)
    weaknessCounter:    'weakness_counter',
    // Histoire
    historyLife:        'history_life',
    historySire:        'history_sire',
    historyNights:      'history_nights',
    languages:          'languages',
    description:        'description',
    notes:              'notes',
    // Expérience (L2)
    xpTotal:            'xp_total',
    xpSpent:            'xp_spent',
    // Mortels (L4)
    isMortal:           'is_mortal',
};

const MERIT_KINDS     = ['merit', 'flaw'];
const EQUIPMENT_KINDS = ['weapon', 'armor', 'shield', 'item'];   // item : objet sans jet (inventaire)

// ── Helpers ──────────────────────────────────────────────────────────────────

function _parseJson(str, fallback) {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

const _jsonArray = (value) => JSON.stringify(Array.isArray(value) ? value : []);
const _int = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback);
const _intOrNull = (value) => (value === null || value === undefined || value === '' ? null : _int(value));

/**
 * Synchronise une sous-table en CRUD complet (même helper que fabula, vikings
 * et deltagreen). Entrée avec id → mise à jour ; sans id → insertion ; présente
 * en BDD mais absente du tableau → suppression. L'index est transmis à upsertFn.
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

    incoming.forEach((item, index) => {
        if (item) upsertFn(db, characterId, item, index);
    });
}

// Mise à jour par id, sinon insertion. Un id inconnu de la base (id temporaire
// créé côté client) est traité comme une insertion.
function _updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues) {
    const changes = entry.id ? db.prepare(updateSql).run(...updateValues).changes : 0;
    if (!changes) db.prepare(insertSql).run(...insertValues);
}

function _upsertAbility(db, charId, a) {
    if (!a.abilityKey) return;
    const values = [a.abilityKey, _int(a.rating), _jsonArray(a.specialties), _jsonArray(a.domains)];
    _updateOrInsert(db, a,
        `UPDATE character_abilities SET ability_key = ?, rating = ?, specialties = ?, domains = ?
         WHERE id = ? AND character_id = ?`, [...values, a.id, charId],
        `INSERT INTO character_abilities (character_id, ability_key, rating, specialties, domains)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertBackground(db, charId, b) {
    if (!b.backgroundKey) return;
    const values = [b.backgroundKey, _int(b.rating), b.details ?? ''];
    _updateOrInsert(db, b,
        'UPDATE character_backgrounds SET background_key = ?, rating = ?, details = ? WHERE id = ? AND character_id = ?',
        [...values, b.id, charId],
        'INSERT INTO character_backgrounds (character_id, background_key, rating, details) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertDiscipline(db, charId, d) {
    if (!d.disciplineKey) return;
    const values = [d.disciplineKey, _int(d.rating), _jsonArray(d.powers)];
    _updateOrInsert(db, d,
        'UPDATE character_disciplines SET discipline_key = ?, rating = ?, powers = ? WHERE id = ? AND character_id = ?',
        [...values, d.id, charId],
        'INSERT INTO character_disciplines (character_id, discipline_key, rating, powers) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertBloodPath(db, charId, p) {
    if (!p.disciplineKey || !p.pathKey) return;
    const values = [p.disciplineKey, p.pathKey, _int(p.rating), p.isPrimary ? 1 : 0];
    _updateOrInsert(db, p,
        `UPDATE character_blood_paths SET discipline_key = ?, path_key = ?, rating = ?, is_primary = ?
         WHERE id = ? AND character_id = ?`, [...values, p.id, charId],
        `INSERT INTO character_blood_paths (character_id, discipline_key, path_key, rating, is_primary)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertRitual(db, charId, r) {
    if (!r.disciplineKey || (!r.ritualKey && !r.customName)) return;
    const values = [r.disciplineKey, r.ritualKey ?? null, Math.max(1, _int(r.level, 1)), r.customName ?? ''];
    _updateOrInsert(db, r,
        `UPDATE character_rituals SET discipline_key = ?, ritual_key = ?, level = ?, custom_name = ?
         WHERE id = ? AND character_id = ?`, [...values, r.id, charId],
        `INSERT INTO character_rituals (character_id, discipline_key, ritual_key, level, custom_name)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertMeritFlaw(db, charId, m) {
    if (!m.entryKey) return;
    const values = [m.entryKey, MERIT_KINDS.includes(m.kind) ? m.kind : 'merit', _int(m.cost, 1), m.details ?? ''];
    _updateOrInsert(db, m,
        `UPDATE character_merits_flaws SET entry_key = ?, kind = ?, cost = ?, details = ?
         WHERE id = ? AND character_id = ?`, [...values, m.id, charId],
        `INSERT INTO character_merits_flaws (character_id, entry_key, kind, cost, details)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertDerangement(db, charId, d) {
    if (!d.derangementKey) return;
    const values = [d.derangementKey, d.incurable ? 1 : 0, d.details ?? ''];
    _updateOrInsert(db, d,
        'UPDATE character_derangements SET derangement_key = ?, incurable = ?, details = ? WHERE id = ? AND character_id = ?',
        [...values, d.id, charId],
        'INSERT INTO character_derangements (character_id, derangement_key, incurable, details) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertBloodBond(db, charId, b) {
    const level = Math.min(3, Math.max(1, _int(b.level, 1)));
    const values = [b.regnant ?? '', level, b.lastDrink ?? ''];
    _updateOrInsert(db, b,
        'UPDATE character_blood_bonds SET regnant = ?, level = ?, last_drink = ? WHERE id = ? AND character_id = ?',
        [...values, b.id, charId],
        'INSERT INTO character_blood_bonds (character_id, regnant, level, last_drink) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertEquipment(db, charId, e, index) {
    const values = [
        EQUIPMENT_KINDS.includes(e.kind) ? e.kind : 'weapon',
        e.itemKey ?? null, e.name ?? '',
        _intOrNull(e.difficulty), e.damage ?? '', _intOrNull(e.rangeM),
        _intOrNull(e.rating), _intOrNull(e.penalty), Math.max(0, _intOrNull(e.quantity) ?? 1),
        e.equipped === false ? 0 : 1, e.notes ?? '', index,
    ];
    _updateOrInsert(db, e,
        `UPDATE character_equipment SET kind = ?, item_key = ?, name = ?, difficulty = ?, damage = ?, range_m = ?,
                rating = ?, penalty = ?, quantity = ?, equipped = ?, notes = ?, ordre = ?
         WHERE id = ? AND character_id = ?`, [...values, e.id, charId],
        `INSERT INTO character_equipment (character_id, kind, item_key, name, difficulty, damage, range_m,
                rating, penalty, quantity, equipped, notes, ordre)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

// ── loadFullCharacter ─────────────────────────────────────────────────────────

/**
 * Charge un personnage complet depuis la BDD.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @returns {object|null}
 */
function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    const all = (sql) => db.prepare(sql).all(id);

    const character = { id: row.id, accessUrl: row.access_url };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) character[key] = row[column];
    character.isMortal = !!row.is_mortal;
    character.states   = _parseJson(row.states, []);

    character.abilities = all('SELECT * FROM character_abilities WHERE character_id = ? ORDER BY id').map(a => ({
        id: a.id, abilityKey: a.ability_key, rating: a.rating,
        specialties: _parseJson(a.specialties, []), domains: _parseJson(a.domains, []),
    }));
    character.backgrounds = all('SELECT * FROM character_backgrounds WHERE character_id = ? ORDER BY id').map(b => ({
        id: b.id, backgroundKey: b.background_key, rating: b.rating, details: b.details,
    }));
    character.disciplines = all('SELECT * FROM character_disciplines WHERE character_id = ? ORDER BY id').map(d => ({
        id: d.id, disciplineKey: d.discipline_key, rating: d.rating, powers: _parseJson(d.powers, []),
    }));
    character.bloodPaths = all('SELECT * FROM character_blood_paths WHERE character_id = ? ORDER BY id').map(p => ({
        id: p.id, disciplineKey: p.discipline_key, pathKey: p.path_key, rating: p.rating, isPrimary: !!p.is_primary,
    }));
    character.rituals = all('SELECT * FROM character_rituals WHERE character_id = ? ORDER BY level, id').map(r => ({
        id: r.id, disciplineKey: r.discipline_key, ritualKey: r.ritual_key, level: r.level, customName: r.custom_name,
    }));
    character.meritsFlaws = all('SELECT * FROM character_merits_flaws WHERE character_id = ? ORDER BY id').map(m => ({
        id: m.id, entryKey: m.entry_key, kind: m.kind, cost: m.cost, details: m.details,
    }));
    character.derangements = all('SELECT * FROM character_derangements WHERE character_id = ? ORDER BY id').map(d => ({
        id: d.id, derangementKey: d.derangement_key, incurable: !!d.incurable, details: d.details,
    }));
    character.bloodBonds = all('SELECT * FROM character_blood_bonds WHERE character_id = ? ORDER BY id').map(b => ({
        id: b.id, regnant: b.regnant, level: b.level, lastDrink: b.last_drink,
    }));
    character.equipment = all('SELECT * FROM character_equipment WHERE character_id = ? ORDER BY ordre, id').map(e => ({
        id: e.id, kind: e.kind, itemKey: e.item_key, name: e.name, difficulty: e.difficulty, damage: e.damage,
        rangeM: e.range_m, rating: e.rating, penalty: e.penalty, quantity: e.quantity ?? 1, equipped: !!e.equipped, notes: e.notes, ordre: e.ordre,
    }));

    character.createdAt    = row.created_at;
    character.updatedAt    = row.updated_at;
    character.lastAccessed = row.last_accessed;
    return character;
}

// ── saveFullCharacter ─────────────────────────────────────────────────────────

/**
 * Persiste un personnage en transaction. Seuls les champs fournis sont écrits :
 * colonnes à plat en COALESCE, sous-tables synchronisées si leur tableau est
 * présent. Sert au PUT (fiche complète), au PATCH (partiel) et à la création.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data - Données envoyées par le client
 * @returns {object} personnage rechargé
 */
function saveFullCharacter(db, id, data) {
    const params = { id };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) params[column] = data[key] ?? null;
    if (params.access_code) params.access_code = String(params.access_code).toUpperCase();
    if (typeof params.is_mortal === 'boolean') params.is_mortal = params.is_mortal ? 1 : 0;
    params.states = Array.isArray(data.states) ? JSON.stringify(data.states) : null;

    const setClauses = [...Object.values(FLAT_COLUMNS), 'states']
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

        _syncSubTable(db, 'character_abilities',    id, data.abilities,    _upsertAbility);
        _syncSubTable(db, 'character_backgrounds',  id, data.backgrounds,  _upsertBackground);
        _syncSubTable(db, 'character_disciplines',  id, data.disciplines,  _upsertDiscipline);
        _syncSubTable(db, 'character_blood_paths',  id, data.bloodPaths,   _upsertBloodPath);
        _syncSubTable(db, 'character_rituals',      id, data.rituals,      _upsertRitual);
        _syncSubTable(db, 'character_merits_flaws', id, data.meritsFlaws,  _upsertMeritFlaw);
        _syncSubTable(db, 'character_derangements', id, data.derangements, _upsertDerangement);
        _syncSubTable(db, 'character_blood_bonds',  id, data.bloodBonds,   _upsertBloodBond);
        _syncSubTable(db, 'character_equipment',    id, data.equipment,    _upsertEquipment);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

// ── Diffusion ─────────────────────────────────────────────────────────────────

/**
 * Diffuse la fiche à jour (character-full-update) dans chaque room de session du
 * personnage. Partagé par routes/characters.js et routes/coterie.js (verser, retirer).
 */
function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare('SELECT session_id FROM session_characters WHERE character_id = ?').all(characterId);
    for (const { session_id } of sessions) {
        io.to(`woddavampire_session_${session_id}`).emit('character-full-update', { characterId, character });
    }
}

module.exports = { loadFullCharacter, saveFullCharacter, broadcastCharacterUpdate };
