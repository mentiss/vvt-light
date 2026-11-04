// src/server/systems/achtung/CharacterController.js

const { syncSubTable, updateOrInsert } = require('../../utils/characters');

const ATTRIBUTES = ['agility', 'brawn', 'coordination', 'insight', 'reason', 'will'];

const SKILLS = [
    'academia', 'athletics', 'engineering', 'fighting', 'medicine',
    'observation', 'persuasion', 'resilience', 'stealth', 'survival',
    'tactics', 'vehicles',
];

function getBonusDamage(value) {
    if (value <= 8)  return 0;
    if (value === 9) return 1;
    if (value <= 11) return 2;
    if (value <= 13) return 3;
    if (value <= 15) return 4;
    return 5;
}

// ── Helpers reshape BDD → client ─────────────────────────────────────────────

function _reshapeAttributes(row) {
    return ATTRIBUTES.map(key => ({
        key,
        value:       row[`attr_${key}`] ?? 0,
        bonusDamage: getBonusDamage(row[`attr_${key}`] ?? 0),
    }));
}

function _reshapeSkills(row) {
    return SKILLS.map(key => ({
        key,
        rank:  row[`skill_${key}_rank`]  ?? 0,
        focus: row[`skill_${key}_focus`] ?? '',
    }));
}

// ── Helpers flatten client → BDD ─────────────────────────────────────────────

function _flattenAttributes(attributes) {
    if (!Array.isArray(attributes)) return {};
    const cols = {};
    for (const a of attributes) {
        if (ATTRIBUTES.includes(a.key)) cols[`attr_${a.key}`] = a.value ?? 0;
    }
    return cols;
}

function _flattenSkills(skills) {
    if (!Array.isArray(skills)) return {};
    const cols = {};
    for (const s of skills) {
        if (SKILLS.includes(s.key)) {
            cols[`skill_${s.key}_rank`]  = s.rank  ?? 0;
            cols[`skill_${s.key}_focus`] = s.focus ?? '';
        }
    }
    return cols;
}

// ── loadFullCharacter ─────────────────────────────────────────────────────────

function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    const talents = db.prepare(
        'SELECT id, name, keywords, effect FROM character_talents WHERE character_id = ? ORDER BY sort_order, id'
    ).all(id);
    const weapons = db.prepare(
        'SELECT id, name, focus, range, damage, salvo, size, qualities, effect FROM character_weapons WHERE character_id = ? ORDER BY sort_order, id'
    ).all(id);
    const items = db.prepare(
        'SELECT id, name, description, effect FROM character_items WHERE character_id = ? ORDER BY sort_order, id'
    ).all(id);
    const spells = db.prepare(
        `SELECT id, name, skill_used, difficulty, cost, duration, effect,
                momentum_spends, spell_key, tradition, flawed
         FROM character_spells WHERE character_id = ? ORDER BY sort_order, id`
    ).all(id);

    return {
        id:         row.id,
        accessCode: row.access_code,
        accessUrl:  row.access_url,
        playerName: row.player_name,
        avatar:     row.avatar ?? null,

        nom:            row.nom            ?? '',
        prenom:         row.prenom         ?? '',
        sexe:           row.sexe           ?? '',
        age:            row.age            ?? null,
        taille:         row.taille         ?? null,
        nationality:    row.nationality    ?? '',
        rank:           row.rank           ?? '',
        archetype:      row.archetype      ?? '',
        background:     row.background     ?? '',
        characteristic: row.characteristic ?? '',
        biography:      row.biography      ?? '',

        truths: [
            row.truth_1 ?? '',
            row.truth_2 ?? '',
            row.truth_3 ?? '',
            row.truth_4 ?? '',
            row.truth_5 ?? '',
        ],

        attributes: _reshapeAttributes(row),
        skills:     _reshapeSkills(row),

        stress:   row.stress   ?? 0,
        injuries: row.injuries ?? 0,
        armour:   row.armour   ?? 0,
        courage:  row.courage  ?? 0,
        fortune:  row.fortune  ?? 3,
        ammo:     row.ammo     ?? 0,

        languages: (() => {
            try { return JSON.parse(row.languages || '[]'); }
            catch { return []; }
        })(),

        isSpellcaster:       row.is_spellcaster === 1,
        power:               row.power ?? 0,
        spellcasterPractice: row.spellcaster_practice ?? null,

        talents: talents.map(t => ({
            id: t.id, name: t.name ?? '', keywords: t.keywords ?? '', effect: t.effect ?? '',
        })),
        weapons: weapons.map(w => ({
            id: w.id, name: w.name ?? '', focus: w.focus ?? '', range: w.range ?? '',
            damage: w.damage ?? 0,
            salvo:     (() => { try { return JSON.parse(w.salvo     || '[]'); } catch { return []; } })(),
            effect:    (() => { try { return JSON.parse(w.effect    || '[]'); } catch { return []; } })(),
            size: w.size ?? '',
            qualities: (() => { try { return JSON.parse(w.qualities || '[]'); } catch { return []; } })(),
        })),
        items: items.map(i => ({
            id: i.id, name: i.name ?? '', description: i.description ?? '', effect: i.effect ?? '',
        })),
        spells: spells.map(s => ({
            id:             s.id,
            name:           s.name           ?? '',
            skillUsed:      s.skill_used     ?? '',
            difficulty:     s.difficulty     ?? 1,
            cost:           s.cost           ?? '',
            duration:       s.duration       ?? '',
            effect:         s.effect         ?? '',
            momentumSpends: s.momentum_spends ?? '',
            spellKey:       s.spell_key      ?? null,
            tradition:      s.tradition      ?? null,
            flawed:         s.flawed === 1,
        })),

        createdAt:    row.created_at,
        updatedAt:    row.updated_at,
        lastAccessed: row.last_accessed,
    };
}

// ── Sous-tables : une ligne par entrée, ordre = position dans le tableau ──────

// Tableau absent → undefined (sous-table intacte) ; lignes sans nom écartées
const _named = (list) => (Array.isArray(list) ? list.filter(e => e?.name?.trim()) : undefined);
const _json  = (value) => JSON.stringify(Array.isArray(value) ? value : []);

function _upsertTalent(db, charId, t, i) {
    const values = [t.name.trim(), t.keywords ?? '', t.effect ?? '', i];
    updateOrInsert(db, t,
        'UPDATE character_talents SET name = ?, keywords = ?, effect = ?, sort_order = ? WHERE id = ? AND character_id = ?', [...values, t.id, charId],
        'INSERT INTO character_talents (character_id, name, keywords, effect, sort_order) VALUES (?, ?, ?, ?, ?)', [charId, ...values]);
}

function _upsertWeapon(db, charId, w, i) {
    const values = [
        w.name.trim(), w.focus ?? '', w.range ?? '', w.damage ?? 0,
        _json(w.salvo), w.size ?? '', _json(w.qualities), _json(w.effect), i,
    ];
    updateOrInsert(db, w,
        `UPDATE character_weapons SET name = ?, focus = ?, range = ?, damage = ?, salvo = ?, size = ?,
         qualities = ?, effect = ?, sort_order = ? WHERE id = ? AND character_id = ?`, [...values, w.id, charId],
        `INSERT INTO character_weapons (character_id, name, focus, range, damage, salvo, size, qualities, effect, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertItem(db, charId, item, i) {
    const values = [item.name.trim(), item.description ?? '', item.effect ?? '', i];
    updateOrInsert(db, item,
        'UPDATE character_items SET name = ?, description = ?, effect = ?, sort_order = ? WHERE id = ? AND character_id = ?', [...values, item.id, charId],
        'INSERT INTO character_items (character_id, name, description, effect, sort_order) VALUES (?, ?, ?, ?, ?)', [charId, ...values]);
}

function _upsertSpell(db, charId, s, i) {
    const values = [
        s.name.trim(),
        s.skillUsed      ?? s.skill_used      ?? '',
        s.difficulty     ?? 1,
        s.cost           ?? '',
        s.duration       ?? '',
        s.effect         ?? '',
        s.momentumSpends ?? s.momentum_spends ?? '',
        s.spellKey       ?? s.spell_key       ?? null,
        s.tradition      ?? null,
        s.flawed ? 1 : 0,
        i,
    ];
    updateOrInsert(db, s,
        `UPDATE character_spells SET name = ?, skill_used = ?, difficulty = ?, cost = ?, duration = ?, effect = ?,
         momentum_spends = ?, spell_key = ?, tradition = ?, flawed = ?, sort_order = ? WHERE id = ? AND character_id = ?`, [...values, s.id, charId],
        `INSERT INTO character_spells
         (character_id, name, skill_used, difficulty, cost, duration,
          effect, momentum_spends, spell_key, tradition, flawed, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

// ── saveFullCharacter ─────────────────────────────────────────────────────────
// Met à jour UNIQUEMENT les champs explicitement présents dans data.

function saveFullCharacter(db, id, data) {
    db.prepare('BEGIN').run();
    try {

        const scalarFields = [];
        const scalarValues = [];

        const addField = (col, val) => {
            scalarFields.push(`${col} = ?`);
            scalarValues.push(val);
        };

        // Identité
        if (data.playerName     !== undefined) addField('player_name',    data.playerName);
        if (data.avatar         !== undefined) addField('avatar',         data.avatar);
        if (data.nom            !== undefined) addField('nom',            data.nom);
        if (data.prenom         !== undefined) addField('prenom',         data.prenom);
        if (data.sexe           !== undefined) addField('sexe',           data.sexe);
        if (data.age            !== undefined) addField('age',            data.age);
        if (data.taille         !== undefined) addField('taille',         data.taille);
        if (data.nationality    !== undefined) addField('nationality',    data.nationality);
        if (data.rank           !== undefined) addField('"rank"',         data.rank);
        if (data.archetype      !== undefined) addField('archetype',      data.archetype);
        if (data.background     !== undefined) addField('background',     data.background);
        if (data.characteristic !== undefined) addField('characteristic', data.characteristic);
        if (data.biography      !== undefined) addField('biography',      data.biography);
        if (data.accessCode     !== undefined) addField('access_code',    data.accessCode);

        // Truths
        if (Array.isArray(data.truths)) {
            const t = data.truths;
            addField('truth_1', t[0] ?? '');
            addField('truth_2', t[1] ?? '');
            addField('truth_3', t[2] ?? '');
            addField('truth_4', t[3] ?? '');
            addField('truth_5', t[4] ?? '');
        }

        // Santé
        if (data.stress   !== undefined) addField('stress',   data.stress);
        if (data.injuries !== undefined) addField('injuries', data.injuries);
        if (data.armour   !== undefined) addField('armour',   data.armour);
        if (data.courage  !== undefined) addField('courage',  data.courage);
        if (data.fortune  !== undefined) addField('fortune',  data.fortune);
        if (data.ammo     !== undefined) addField('ammo',     data.ammo);

        // Langues
        if (data.languages !== undefined) {
            addField('languages', JSON.stringify(Array.isArray(data.languages) ? data.languages : []));
        }

        // Magie
        if (data.isSpellcaster       !== undefined) addField('is_spellcaster',       data.isSpellcaster ? 1 : 0);
        if (data.power               !== undefined) addField('power',                data.power);
        if (data.spellcasterPractice !== undefined) addField('spellcaster_practice', data.spellcasterPractice);

        // Attributs
        if (Array.isArray(data.attributes)) {
            const cols = _flattenAttributes(data.attributes);
            for (const [col, val] of Object.entries(cols)) addField(col, val);
        }

        // Compétences
        if (Array.isArray(data.skills)) {
            const cols = _flattenSkills(data.skills);
            for (const [col, val] of Object.entries(cols)) addField(col, val);
        }

        if (scalarFields.length > 0) {
            scalarFields.push('updated_at = CURRENT_TIMESTAMP');
            scalarValues.push(id);
            db.prepare(
                `UPDATE characters SET ${scalarFields.join(', ')} WHERE id = ?`
            ).run(...scalarValues);
        }

        // ── Tables liées ──────────────────────────────────────────────────────
        // syncSubTable : ids stables (mise à jour par id, insertion sans id,
        // suppression des absents). Une ligne sans nom est retirée, comme avant.

        syncSubTable(db, 'character_talents', id, _named(data.talents), _upsertTalent);
        syncSubTable(db, 'character_weapons', id, _named(data.weapons), _upsertWeapon);
        syncSubTable(db, 'character_items',   id, _named(data.items),   _upsertItem);
        syncSubTable(db, 'character_spells',  id, _named(data.spells),  _upsertSpell);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter, ATTRIBUTES, SKILLS, getBonusDamage };