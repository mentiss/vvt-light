// src/server/systems/dune/characterController.js
// Couche d'accès données pour le système Dune.
//
// Contrat :
//   loadFullCharacter(db, id) → objet complet avec compétences/principes reshapés en tableaux
//   saveFullCharacter(db, id, data) → persistance en transaction, reshape inverse ; renvoie la fiche rechargée

const { syncSubTable } = require('../../utils/characters');

// ── Listes fixes ─────────────────────────────────────────────────────────────

const COMPETENCES = ['analyse', 'combat', 'discipline', 'mobilite', 'rhetorique'];
const PRINCIPES   = ['devoir', 'domination', 'foi', 'justice', 'verite'];

// ── Helpers de reshape ───────────────────────────────────────────────────────

/**
 * Transforme les colonnes plates en tableau de compétences.
 * @param {object} row - Ligne brute SQLite
 * @returns {Array<{ key, rang, specialisation }>}
 */
function _reshapeCompetences(row) {
    return COMPETENCES.map(key => ({
        key,
        rang:           row[`${key}_rang`]           ?? 4,
        specialisation: row[`${key}_specialisation`] ?? '',
    }));
}

/**
 * Transforme les colonnes plates en tableau de principes.
 * @param {object} row - Ligne brute SQLite
 * @returns {Array<{ key, rang, maxime }>}
 */
function _reshapePrincipes(row) {
    return PRINCIPES.map(key => ({
        key,
        rang:   row[`${key}_rang`]   ?? 4,
        maxime: row[`${key}_maxime`] ?? '',
    }));
}

/**
 * Transforme un tableau de compétences en colonnes pour UPDATE.
 * @param {Array<{ key, rang, specialisation }>} competences
 * @returns {object} colonnes SQLite
 */
function _flattenCompetences(competences = []) {
    const cols = {};
    for (const c of competences) {
        if (!COMPETENCES.includes(c.key)) continue;
        cols[`${c.key}_rang`]           = c.rang           ?? 4;
        cols[`${c.key}_specialisation`] = c.specialisation ?? '';
    }
    return cols;
}

/**
 * Transforme un tableau de principes en colonnes pour UPDATE.
 * Valide que rang ≤ 8 (contrainte de règle).
 * @param {Array<{ key, rang, maxime }>} principes
 * @returns {object} colonnes SQLite
 */
function _flattenPrincipes(principes = []) {
    const cols = {};
    for (const p of principes) {
        if (!PRINCIPES.includes(p.key)) continue;
        const rang = Math.min(Number(p.rang ?? 4), 8);
        cols[`${p.key}_rang`]   = rang;
        cols[`${p.key}_maxime`] = p.maxime ?? '';
    }
    return cols;
}

/** Qualité d'un atout : entier de 0 à 4, ou null (non renseignée, atouts d'avant la refonte). */
function _normalizeQualite(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(4, Math.max(0, Math.round(n))) : null;
}

// ── API publique ─────────────────────────────────────────────────────────────

/**
 * Charge un personnage complet depuis la BDD.
 * Compétences et principes sont reshapés en tableaux.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @returns {object|null}
 */
function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    const talents = db.prepare(
        'SELECT id, talent_name, description FROM character_talents WHERE character_id = ? ORDER BY id'
    ).all(id);

    const items = db.prepare(
        'SELECT id, nom, description, quantite, qualite, mots_cles FROM character_items WHERE character_id = ? ORDER BY id'
    ).all(id);

    return {
        id:          row.id,
        accessCode:  row.access_code,
        accessUrl:   row.access_url,
        playerName:  row.player_name,
        avatar:      row.avatar,

        // Identité
        nom:          row.nom          ?? '',
        prenom:       row.prenom       ?? '',
        statutSocial: row.statut_social ?? '',
        description:  row.description   ?? '',
        sexe:         row.sexe ?? 'homme',
        age:          row.age ?? '',
        taille:       row.taille ?? '',
        poids:        row.poids ?? '',
        motto:        row.motto ?? '',
        role:               row.role                ?? '',
        faction:            row.faction             ?? '',
        traitsPersonnalite: row.traits_personnalite ?? '',
        ambition:           row.ambition            ?? '',

        // Détermination
        determination:    row.determination     ?? 1,
        determinationMax: row.determination_max ?? 1,

        // Tableaux reshapés
        competences: _reshapeCompetences(row),
        principes:   _reshapePrincipes(row),

        // Relations
        talents: talents.map(t => ({
            id:          t.id,
            talentName:  t.talent_name,
            description: t.description ?? '',
        })),
        items: items.map(i => ({
            id:          i.id,
            nom:         i.nom,
            description: i.description ?? '',
            quantite:    i.quantite     ?? 1,
            qualite:     i.qualite      ?? null,
            motsCles:    i.mots_cles    ?? '',
        })),

        // Métadonnées
        createdAt:    row.created_at,
        updatedAt:    row.updated_at,
        lastAccessed: row.last_accessed,
    };
}

/**
 * Persiste un personnage complet en transaction.
 * Valide rang principes ≤ 8. Gère les tableaux talents et items.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data - Données envoyées par le client
 */
function saveFullCharacter(db, id, data) {
    const {
        playerName, nom, statutSocial, description,
        determination, determinationMax,
        competences, principes,
        talents, items, avatar,
        prenom, age, taille, poids, sexe, motto,
        role, faction, traitsPersonnalite, ambition,
        accessCode,
    } = data;

    const competenceCols = _flattenCompetences(competences);
    const principeCols   = _flattenPrincipes(principes);

    db.prepare('BEGIN').run();
    try {
        // ── Mise à jour du personnage ──────────────────────────────────────
        db.prepare(`
            UPDATE characters SET
                player_name       = COALESCE(?, player_name),
                nom               = COALESCE(?, nom),
                statut_social     = COALESCE(?, statut_social),
                description       = COALESCE(?, description),
                determination     = COALESCE(?, determination),
                determination_max = COALESCE(?, determination_max),
                avatar            = COALESCE(?, avatar),
                prenom            = COALESCE(?, prenom),
                age               = COALESCE(?, age),
                sexe              = COALESCE(?, sexe),
                taille            = COALESCE(?, taille),
                poids             = COALESCE(?, poids),
                motto             = COALESCE(?, motto),
                role                = COALESCE(?, role),
                faction             = COALESCE(?, faction),
                traits_personnalite = COALESCE(?, traits_personnalite),
                ambition            = COALESCE(?, ambition),

                -- Compétences
                analyse_rang              = COALESCE(?, analyse_rang),
                analyse_specialisation    = COALESCE(?, analyse_specialisation),
                combat_rang               = COALESCE(?, combat_rang),
                combat_specialisation     = COALESCE(?, combat_specialisation),
                discipline_rang           = COALESCE(?, discipline_rang),
                discipline_specialisation = COALESCE(?, discipline_specialisation),
                mobilite_rang             = COALESCE(?, mobilite_rang),
                mobilite_specialisation   = COALESCE(?, mobilite_specialisation),
                rhetorique_rang           = COALESCE(?, rhetorique_rang),
                rhetorique_specialisation = COALESCE(?, rhetorique_specialisation),

                -- Principes
                devoir_rang       = COALESCE(?, devoir_rang),
                devoir_maxime     = COALESCE(?, devoir_maxime),
                domination_rang   = COALESCE(?, domination_rang),
                domination_maxime = COALESCE(?, domination_maxime),
                foi_rang          = COALESCE(?, foi_rang),
                foi_maxime        = COALESCE(?, foi_maxime),
                justice_rang      = COALESCE(?, justice_rang),
                justice_maxime    = COALESCE(?, justice_maxime),
                verite_rang       = COALESCE(?, verite_rang),
                verite_maxime     = COALESCE(?, verite_maxime),

                access_code = COALESCE(?, access_code),
                
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            playerName    ?? null,
            nom           ?? null,
            statutSocial  ?? null,
            description   ?? null,
            determination    != null ? Number(determination)    : null,
            determinationMax != null ? Number(determinationMax) : null,
            avatar   ?? null,
            prenom ?? null,
            age  ?? null,
            sexe ?? null,
            taille ?? null,
            poids ?? null,
            motto ?? null,
            role               ?? null,
            faction            ?? null,
            traitsPersonnalite ?? null,
            ambition           ?? null,

            competenceCols.analyse_rang              ?? null,
            competenceCols.analyse_specialisation    ?? null,
            competenceCols.combat_rang               ?? null,
            competenceCols.combat_specialisation     ?? null,
            competenceCols.discipline_rang           ?? null,
            competenceCols.discipline_specialisation ?? null,
            competenceCols.mobilite_rang             ?? null,
            competenceCols.mobilite_specialisation   ?? null,
            competenceCols.rhetorique_rang           ?? null,
            competenceCols.rhetorique_specialisation ?? null,

            principeCols.devoir_rang       ?? null,
            principeCols.devoir_maxime     ?? null,
            principeCols.domination_rang   ?? null,
            principeCols.domination_maxime ?? null,
            principeCols.foi_rang          ?? null,
            principeCols.foi_maxime        ?? null,
            principeCols.justice_rang      ?? null,
            principeCols.justice_maxime    ?? null,
            principeCols.verite_rang       ?? null,
            principeCols.verite_maxime     ?? null,

            accessCode ?? null,

            id
        );

        // ── Talents : synchronisation (ids stables) ───────────────────────
        // Une entrée sans nom est ignorée (et supprimée si elle existait).
        const validTalents = Array.isArray(talents) ? talents.filter(t => t.talentName?.trim()) : talents;
        syncSubTable(db, 'character_talents', id, validTalents, (db, charId, t) => {
            if (t.id) {
                db.prepare('UPDATE character_talents SET talent_name = ?, description = ? WHERE id = ? AND character_id = ?')
                    .run(t.talentName.trim(), t.description ?? '', t.id, charId);
            } else {
                db.prepare('INSERT INTO character_talents (character_id, talent_name, description) VALUES (?, ?, ?)')
                    .run(charId, t.talentName.trim(), t.description ?? '');
            }
        });

        // ── Atouts : synchronisation (ids stables) ────────────────────────
        // qualite et motsCles sont facultatifs (Q-14) : absents → NULL et ''.
        const validItems = Array.isArray(items) ? items.filter(i => i.nom?.trim()) : items;
        syncSubTable(db, 'character_items', id, validItems, (db, charId, item) => {
            const values = [item.nom.trim(), item.description ?? '', item.quantite ?? 1,
                _normalizeQualite(item.qualite), item.motsCles ?? ''];
            if (item.id) {
                db.prepare(`UPDATE character_items SET nom = ?, description = ?, quantite = ?, qualite = ?, mots_cles = ?
                            WHERE id = ? AND character_id = ?`).run(...values, item.id, charId);
            } else {
                db.prepare(`INSERT INTO character_items (character_id, nom, description, quantite, qualite, mots_cles)
                            VALUES (?, ?, ?, ?, ?, ?)`).run(charId, ...values);
            }
        });
        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }
    return loadFullCharacter(db, id);
}

/**
 * Ajoute un atout et le renvoie au format client (id réel).
 * @returns {{ id, nom, description, quantite, qualite, motsCles }}
 */
function addItem(db, characterId, { nom, description = '', quantite = 1, qualite = null, motsCles = '' }) {
    const q = _normalizeQualite(qualite);
    const qty = Math.max(1, Number(quantite) || 1);
    const { lastInsertRowid } = db.prepare(`
        INSERT INTO character_items (character_id, nom, description, quantite, qualite, mots_cles) VALUES (?, ?, ?, ?, ?, ?)
    `).run(characterId, nom.trim(), String(description ?? ''), qty, q, String(motsCles ?? ''));
    return { id: Number(lastInsertRowid), nom: nom.trim(), description: String(description ?? ''), quantite: qty, qualite: q, motsCles: String(motsCles ?? '') };
}

/**
 * Ajoute un talent et le renvoie au format client (id réel).
 * @returns {{ id, talentName, description }}
 */
function addTalent(db, characterId, { talentName, description = '' }) {
    const { lastInsertRowid } = db.prepare(
        'INSERT INTO character_talents (character_id, talent_name, description) VALUES (?, ?, ?)'
    ).run(characterId, talentName.trim(), String(description ?? ''));
    return { id: Number(lastInsertRowid), talentName: talentName.trim(), description: String(description ?? '') };
}

module.exports = { loadFullCharacter, saveFullCharacter, addItem, addTalent, COMPETENCES, PRINCIPES };