// src/server/systems/achtung/CharacterController.js

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
        'SELECT id, name, focus, range, damage, salvo, size, qualities FROM character_weapons WHERE character_id = ? ORDER BY sort_order, id'
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
            damage: w.damage ?? 0, salvo: w.salvo ?? '', size: w.size ?? '', qualities: w.qualities ?? '',
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

        if (Array.isArray(data.talents)) {
            db.prepare('DELETE FROM character_talents WHERE character_id = ?').run(id);
            const ins = db.prepare(
                'INSERT INTO character_talents (character_id, name, keywords, effect, sort_order) VALUES (?, ?, ?, ?, ?)'
            );
            data.talents.forEach((t, i) => {
                if (!t.name?.trim()) return;
                ins.run(id, t.name.trim(), t.keywords ?? '', t.effect ?? '', i);
            });
        }

        if (Array.isArray(data.weapons)) {
            db.prepare('DELETE FROM character_weapons WHERE character_id = ?').run(id);
            const ins = db.prepare(
                'INSERT INTO character_weapons (character_id, name, focus, range, damage, salvo, size, qualities, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            data.weapons.forEach((w, i) => {
                if (!w.name?.trim()) return;
                ins.run(id, w.name.trim(), w.focus ?? '', w.range ?? '', w.damage ?? 0,
                    w.salvo ?? '', w.size ?? '', w.qualities ?? '', i);
            });
        }

        if (Array.isArray(data.items)) {
            db.prepare('DELETE FROM character_items WHERE character_id = ?').run(id);
            const ins = db.prepare(
                'INSERT INTO character_items (character_id, name, description, effect, sort_order) VALUES (?, ?, ?, ?, ?)'
            );
            data.items.forEach((item, i) => {
                if (!item.name?.trim()) return;
                ins.run(id, item.name.trim(), item.description ?? '', item.effect ?? '', i);
            });
        }

        if (Array.isArray(data.spells)) {
            db.prepare('DELETE FROM character_spells WHERE character_id = ?').run(id);
            const ins = db.prepare(
                `INSERT INTO character_spells
                 (character_id, name, skill_used, difficulty, cost, duration,
                  effect, momentum_spends, spell_key, tradition, flawed, sort_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
            data.spells.forEach((s, i) => {
                if (!s.name?.trim()) return;
                ins.run(
                    id,
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
                    i
                );
            });
        }

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter, ATTRIBUTES, SKILLS, getBonusDamage };