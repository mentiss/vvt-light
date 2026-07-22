// src/server/systems/zoneblanche/CharacterController.js
// Couche d'accès données pour le système Zone Blanche.
//
// Contrat :
//   loadFullCharacter(db, id) → objet complet, Principes/Compétences reshapés en
//                                 tableaux, Vérités/Focus/Talents chargés depuis
//                                 leurs tables dédiées.
//   saveFullCharacter(db, id, data) → persistance en transaction, reshape inverse,
//                                       remplacement complet Vérités/Focus/Talents.

const PRINCIPES   = ['logique', 'instinct', 'technique', 'presence'];
const COMPETENCES = ['investigation', 'operation', 'deplacement', 'esoterisme'];

// ── Helpers de reshape ───────────────────────────────────────────────────────

function _reshapePrincipes(row) {
    return PRINCIPES.map(key => ({
        key,
        rang:   row[`${key}_rang`]   ?? 3,
        maxime: row[`${key}_maxime`] ?? '',
    }));
}

function _reshapeCompetences(row) {
    return COMPETENCES.map(key => ({
        key,
        rang: row[`${key}_rang`] ?? 3,
    }));
}

function _flattenPrincipes(principes = []) {
    const cols = {};
    for (const p of principes) {
        if (!PRINCIPES.includes(p.key)) continue;
        cols[`${p.key}_rang`]   = Math.max(0, Math.min(8, Number(p.rang ?? 3)));
        cols[`${p.key}_maxime`] = p.maxime ?? '';
    }
    return cols;
}

function _flattenCompetences(competences = []) {
    const cols = {};
    for (const c of competences) {
        if (!COMPETENCES.includes(c.key)) continue;
        cols[`${c.key}_rang`] = Math.max(0, Math.min(8, Number(c.rang ?? 3)));
    }
    return cols;
}

// ── API publique ─────────────────────────────────────────────────────────────

function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    const verites = db.prepare(
        'SELECT id, nom, texte FROM character_verites WHERE character_id = ? ORDER BY created_at'
    ).all(id);

    const focus = db.prepare(
        'SELECT id, competence_key AS competenceKey, texte FROM character_focus WHERE character_id = ? ORDER BY created_at'
    ).all(id);

    const talents = db.prepare(
        'SELECT talent_key FROM character_talents WHERE character_id = ? ORDER BY created_at'
    ).all(id).map(t => t.talent_key);

    return {
        ...row,
        accessCode: row.access_code,
        accessUrl:  row.access_url,

        principes:   _reshapePrincipes(row),
        competences: _reshapeCompetences(row),
        verites,
        focus,
        talents,
    };
}

function saveFullCharacter(db, id, data) {
    const {
        playerName, nom, prenom, avatar, sexe, age, taille, poids,
        description, archetype, primeTime,
        principes, competences, verites, focus, talents,
        accessCode,
    } = data;

    const principeCols   = Array.isArray(principes)   ? _flattenPrincipes(principes)    : {};
    const competenceCols = Array.isArray(competences) ? _flattenCompetences(competences) : {};
    const allCols         = { ...principeCols, ...competenceCols };
    const setClauses       = Object.keys(allCols).map(k => `${k} = @${k}`).join(', ');

    db.prepare('BEGIN').run();
    try {
        db.prepare(`
            UPDATE characters SET
                player_name  = COALESCE(@playerName, player_name),
                nom          = COALESCE(@nom, nom),
                prenom       = COALESCE(@prenom, prenom),
                avatar       = COALESCE(@avatar, avatar),
                sexe         = COALESCE(@sexe, sexe),
                age          = COALESCE(@age, age),
                taille       = COALESCE(@taille, taille),
                poids        = COALESCE(@poids, poids),
                description  = COALESCE(@description, description),
                archetype    = COALESCE(@archetype, archetype),
                prime_time   = COALESCE(@primeTime, prime_time),
                access_code  = COALESCE(@accessCode, access_code),
                ${setClauses ? setClauses + ',' : ''}
                updated_at   = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run({
            playerName:  playerName  ?? null,
            nom:         nom         ?? null,
            prenom:      prenom      ?? null,
            avatar:      avatar      ?? null,
            sexe:        sexe        ?? null,
            age:         age         ?? null,
            taille:      taille      ?? null,
            poids:       poids       ?? null,
            description: description ?? null,
            archetype:   archetype   ?? null,
            primeTime:   primeTime   ?? null,
            accessCode:  accessCode  ?? null,
            ...allCols,
            id,
        });

        // ── Vérités : remplacement complet ──────────────────────────────────
        if (Array.isArray(verites)) {
            db.prepare('DELETE FROM character_verites WHERE character_id = ?').run(id);
            const insertVerite = db.prepare(
                'INSERT INTO character_verites (character_id, nom, texte) VALUES (?, ?, ?)'
            );
            for (const v of verites) {
                if (!v.nom?.trim()) continue;
                insertVerite.run(id, v.nom.trim(), v.texte ?? '');
            }
        }

        // ── Focus : remplacement complet ─────────────────────────────────────
        if (Array.isArray(focus)) {
            db.prepare('DELETE FROM character_focus WHERE character_id = ?').run(id);
            const insertFocus = db.prepare(
                'INSERT INTO character_focus (character_id, competence_key, texte) VALUES (?, ?, ?)'
            );
            for (const f of focus) {
                const competenceKey = f.competenceKey ?? f.competence_key;
                if (!f.texte?.trim() || !COMPETENCES.includes(competenceKey)) continue;
                insertFocus.run(id, competenceKey, f.texte.trim());
            }
        }

        // ── Talents : remplacement complet (référence catalogue) ────────────
        if (Array.isArray(talents)) {
            db.prepare('DELETE FROM character_talents WHERE character_id = ?').run(id);
            const insertTalent = db.prepare(
                'INSERT OR IGNORE INTO character_talents (character_id, talent_key) VALUES (?, ?)'
            );
            for (const talentKey of talents) {
                if (!talentKey) continue;
                insertTalent.run(id, talentKey);
            }
        }

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter, PRINCIPES, COMPETENCES };