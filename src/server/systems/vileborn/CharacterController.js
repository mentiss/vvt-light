// src/server/systems/vileborn/CharacterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat :
//   loadFullCharacter(db, id) → objet complet ou null
//   saveFullCharacter(db, id, data) → objet complet mis à jour
//   broadcastCharacterUpdate(io, db, id, character) → diffusion character-full-update
//
// loadFullCharacter agrège characters (colonnes à plat) et les sous-tables :
// words (personnalité, formation), gifts, resources, bonds.
//
// saveFullCharacter persiste en transaction atomique (modèle woddavampire) :
//   - UPDATE characters : colonnes à plat en COALESCE, un champ absent (ou null)
//     n'est pas écrasé → envoi partiel possible (PATCH). Un texte vidé ('') est
//     bien enregistré vide.
//   - Sous-tables synchronisées par _syncSubTable : mise à jour par id, insertion
//     sans id, suppression des lignes absentes du tableau ; un tableau absent
//     laisse la sous-table intacte.
// ─────────────────────────────────────────────────────────────────────────────

// ── Colonnes à plat : clé camelCase envoyée par le client → colonne SQL ──────

const FLAT_COLUMNS = {
    playerName:        'player_name',
    avatar:            'avatar',
    accessCode:        'access_code',
    prenom:            'prenom',
    nom:               'nom',
    motto:             'motto',
    // Approches
    dieForce:          'die_force',
    dieWill:           'die_will',
    dieInfluence:      'die_influence',
    dieReason:         'die_reason',
    diePrecision:      'die_precision',
    dieSubterfuge:     'die_subterfuge',
    // États
    stateAnger:        'state_anger',
    stateExhaustion:   'state_exhaustion',
    stateShame:        'state_shame',
    stateFear:         'state_fear',
    stateInsecurity:   'state_insecurity',
    // Blessures
    wound1:            'wound_1',
    wound2:            'wound_2',
    wound3:            'wound_3',
    wound1Note:        'wound_1_note',
    wound2Note:        'wound_2_note',
    wound3Note:        'wound_3_note',
    outOfPlay:         'out_of_play',
    // Origine
    originKey:         'origin_key',
    originName:        'origin_name',
    originEffect:      'origin_effect',
    // Mobiles
    aspiration:        'aspiration',
    aspirationChecked: 'aspiration_checked',
    duty:              'duty',
    dutyChecked:       'duty_checked',
    // Sombre héritage
    heritageKey:       'heritage_key',
    heritageName:      'heritage_name',
    heritageExamples:  'heritage_examples',
    heritageTicks:     'heritage_ticks',
    urge:              'urge',
};

// Colonnes 0/1 : exposées en booléens au client
const BOOLEAN_KEYS = [
    'stateAnger', 'stateExhaustion', 'stateShame', 'stateFear', 'stateInsecurity',
    'wound1', 'wound2', 'wound3', 'outOfPlay', 'aspirationChecked', 'dutyChecked',
];

const WORD_KINDS = ['personality', 'training'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const _int = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback);
const _clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Synchronise une sous-table en CRUD complet (même helper que woddavampire et
 * fabula). Entrée avec id → mise à jour ; sans id → insertion ; présente en BDD
 * mais absente du tableau → suppression. L'index est transmis à upsertFn.
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

function _upsertWord(db, charId, w) {
    if (!WORD_KINDS.includes(w.kind) || !w.label?.trim()) return;
    const values = [w.kind, _int(w.position), w.label.trim()];
    _updateOrInsert(db, w,
        'UPDATE character_words SET kind = ?, position = ?, label = ? WHERE id = ? AND character_id = ?',
        [...values, w.id, charId],
        'INSERT INTO character_words (character_id, kind, position, label) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertGift(db, charId, g, index) {
    if (!g.name?.trim()) return;
    const values = [index, g.giftKey ?? null, g.name.trim(), g.effect ?? '', g.drawback ?? '', g.checked ? 1 : 0];
    _updateOrInsert(db, g,
        `UPDATE character_gifts SET position = ?, gift_key = ?, name = ?, effect = ?, drawback = ?, checked = ?
         WHERE id = ? AND character_id = ?`, [...values, g.id, charId],
        `INSERT INTO character_gifts (character_id, position, gift_key, name, effect, drawback, checked)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertResource(db, charId, r, index) {
    if (!r.name?.trim()) return;
    const values = [index, r.name.trim(), r.effect ?? ''];
    _updateOrInsert(db, r,
        'UPDATE character_resources SET position = ?, name = ?, effect = ? WHERE id = ? AND character_id = ?',
        [...values, r.id, charId],
        'INSERT INTO character_resources (character_id, position, name, effect) VALUES (?, ?, ?, ?)',
        [charId, ...values]);
}

function _upsertBond(db, charId, b, index) {
    if (!b.name?.trim()) return;
    const values = [index, b.name.trim(), b.description ?? '', _clamp(_int(b.level), -1, 1)];
    _updateOrInsert(db, b,
        'UPDATE character_bonds SET position = ?, name = ?, description = ?, level = ? WHERE id = ? AND character_id = ?',
        [...values, b.id, charId],
        'INSERT INTO character_bonds (character_id, position, name, description, level) VALUES (?, ?, ?, ?, ?)',
        [charId, ...values]);
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
    for (const key of BOOLEAN_KEYS) character[key] = !!character[key];

    character.words = all('SELECT * FROM character_words WHERE character_id = ? ORDER BY kind, position, id').map(w => ({
        id: w.id, kind: w.kind, position: w.position, label: w.label,
    }));
    character.gifts = all('SELECT * FROM character_gifts WHERE character_id = ? ORDER BY position, id').map(g => ({
        id: g.id, giftKey: g.gift_key, name: g.name, effect: g.effect, drawback: g.drawback, checked: !!g.checked,
    }));
    character.resources = all('SELECT * FROM character_resources WHERE character_id = ? ORDER BY position, id').map(r => ({
        id: r.id, name: r.name, effect: r.effect,
    }));
    character.bonds = all('SELECT * FROM character_bonds WHERE character_id = ? ORDER BY position, id').map(b => ({
        id: b.id, name: b.name, description: b.description, level: b.level,
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
    for (const key of BOOLEAN_KEYS) {
        const column = FLAT_COLUMNS[key];
        if (typeof params[column] === 'boolean') params[column] = params[column] ? 1 : 0;
    }
    if (params.access_code) params.access_code = String(params.access_code).toUpperCase();
    if (params.heritage_ticks !== null) params.heritage_ticks = _clamp(_int(params.heritage_ticks), 0, 3);

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

        _syncSubTable(db, 'character_words',     id, data.words,     _upsertWord);
        _syncSubTable(db, 'character_gifts',     id, data.gifts,     _upsertGift);
        _syncSubTable(db, 'character_resources', id, data.resources, _upsertResource);
        _syncSubTable(db, 'character_bonds',     id, data.bonds,     _upsertBond);

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
 * personnage.
 */
function broadcastCharacterUpdate(io, db, characterId, character) {
    if (!io) return;
    const sessions = db.prepare('SELECT session_id FROM session_characters WHERE character_id = ?').all(characterId);
    for (const { session_id } of sessions) {
        io.to(`vileborn_session_${session_id}`).emit('character-full-update', { characterId, character });
    }
}

module.exports = { loadFullCharacter, saveFullCharacter, broadcastCharacterUpdate };
