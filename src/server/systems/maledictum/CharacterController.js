// src/server/systems/maledictum/CharacterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat :
//   loadFullCharacter(db, id) → objet complet ou null
//   saveFullCharacter(db, id, data) → objet complet mis à jour
//
// loadFullCharacter agrège characters (colonnes à plat, JSON relus) et la
// sous-table character_items (inventaire).
//
// saveFullCharacter persiste en transaction atomique (modèle nimble) :
//   - UPDATE characters : colonnes à plat en COALESCE, un champ absent (ou null)
//     n'est pas écrasé → envoi partiel possible (PATCH). Les colonnes JSON sont
//     sérialisées à l'écriture ;
//   - inventaire synchronisé par syncSubTable (ids stables) ; un tableau absent
//     laisse la sous-table intacte.
// Spec : documentations/spec_maledictum.md §9.
// ─────────────────────────────────────────────────────────────────────────────

const { syncSubTable, updateOrInsert, parseJson } = require('../../utils/characters');

// ── Colonnes à plat : clé camelCase envoyée par le client → colonne SQL ──────

const FLAT_COLUMNS = {
    playerName:   'player_name',
    avatar:       'avatar',
    accessCode:   'access_code',
    prenom:       'prenom',
    nom:          'nom',
    sexe:         'sexe',
    age:          'age',
    taille:       'taille',
    poids:        'poids',
    originKey:    'origin_key',
    factionKey:   'faction_key',
    dutyKey:      'duty_key',
    roleKey:      'role_key',
    themeKey:     'theme_key',
    charsBase:    'chars_base',
    charsAdv:     'chars_adv',
    skills:       'skills',
    specs:        'specs',
    talents:      'talents',
    powers:       'powers',
    wounds:       'wounds',
    criticals:    'criticals',
    injuries:     'injuries',
    conditions:   'conditions',
    fate:         'fate',
    fateMax:      'fate_max',
    corruption:   'corruption',
    mutations:    'mutations',
    malignancies: 'malignancies',
    warpCharge:   'warp_charge',
    influence:    'influence',
    contacts:     'contacts',
    xpTotal:      'xp_total',
    xpSpent:      'xp_spent',
    solars:       'solars',
    goals:        'goals',
    details:      'details',
    bonuses:      'bonuses',
    notes:        'notes',
};

// Colonnes JSON : objet (ou tableau) côté client, texte en base
const JSON_KEYS = {
    charsBase: {}, charsAdv: {}, skills: {}, specs: [], talents: [], powers: [], criticals: [], injuries: [],
    conditions: {}, mutations: [], malignancies: [], influence: {}, contacts: [], goals: {}, details: {}, bonuses: {},
};

// Entiers positifs ou nuls
const COUNTERS = ['wounds', 'fate', 'fate_max', 'corruption', 'warp_charge', 'xp_total', 'xp_spent', 'solars'];

const ITEM_KINDS = ['weapon', 'armour', 'gear', 'augmetic', 'ammo'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const _int = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback);

function _upsertItem(db, charId, it, index) {
    if (!it.name?.trim()) return;
    const kind = ITEM_KINDS.includes(it.kind) ? it.kind : 'gear';
    const values = [
        index, it.itemKey ?? null, kind, it.name.trim(), JSON.stringify(it.data ?? {}),
        Math.max(0, _int(it.quantity, 1)), it.equipped ? 1 : 0, it.notes ?? '',
    ];
    updateOrInsert(db, it,
        `UPDATE character_items SET position = ?, item_key = ?, kind = ?, name = ?, data = ?, quantity = ?, equipped = ?, notes = ?
         WHERE id = ? AND character_id = ?`, [...values, it.id, charId],
        `INSERT INTO character_items (character_id, position, item_key, kind, name, data, quantity, equipped, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
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

    const character = { id: row.id, accessUrl: row.access_url };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) character[key] = row[column];
    for (const [key, fallback] of Object.entries(JSON_KEYS)) character[key] = parseJson(character[key], fallback);

    character.items = db.prepare('SELECT * FROM character_items WHERE character_id = ? ORDER BY position, id').all(id).map(r => ({
        id: r.id, itemKey: r.item_key, kind: r.kind, name: r.name, data: parseJson(r.data, {}),
        quantity: r.quantity, equipped: !!r.equipped, notes: r.notes,
    }));

    character.createdAt    = row.created_at;
    character.updatedAt    = row.updated_at;
    character.lastAccessed = row.last_accessed;
    return character;
}

// ── saveFullCharacter ─────────────────────────────────────────────────────────

/**
 * Persiste un personnage en transaction. Seuls les champs fournis sont écrits :
 * colonnes à plat en COALESCE, inventaire synchronisé si son tableau est présent.
 * Sert au PUT (fiche complète), au PATCH (partiel) et à la création.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data - Données envoyées par le client
 * @returns {object} personnage rechargé
 */
function saveFullCharacter(db, id, data) {
    const params = { id };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) params[column] = data[key] ?? null;
    for (const key of Object.keys(JSON_KEYS)) {
        const column = FLAT_COLUMNS[key];
        if (params[column] !== null && typeof params[column] !== 'string') params[column] = JSON.stringify(params[column]);
    }
    if (params.access_code) params.access_code = String(params.access_code).toUpperCase();
    for (const column of COUNTERS) {
        if (params[column] !== null) params[column] = Math.max(0, _int(params[column]));
    }

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

        syncSubTable(db, 'character_items', id, data.items, _upsertItem);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter };
