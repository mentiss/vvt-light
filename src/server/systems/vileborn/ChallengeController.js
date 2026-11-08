// src/server/systems/vileborn/ChallengeController.js
// ─────────────────────────────────────────────────────────────────────────────
// Défis (spec_vileborn_defis.md §II.2, §II.3) : bibliothèque du MJ (`challenges`)
// et défis en cours d'une table (`session_challenges`). Une fiche est un objet
// JSON (§II.1) ; seuls name, source et family sont en colonnes, pour trier.
// Les routes (routes/challenges.js, routes/session-challenges.js) valident les
// paramètres et délèguent ici.
// ─────────────────────────────────────────────────────────────────────────────

const { parseJson } = require('../../utils/characters');

const APPROACHES = ['force', 'will', 'influence', 'reason', 'precision', 'subterfuge'];
const SOURCES    = ['kit', 'livre', 'apocrypha', 'mj'];
const MAX_TRACK  = 12;
const MAX_ADJUST = 3;

class ValidationError extends Error {}

/** Réponse d'erreur des routes : validation → 400 avec son message ; le reste → 500 sans détail. */
function respondError(res, err, label, message) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    console.error(`[vileborn] ${label}:`, err);
    return res.status(500).json({ error: message });
}

// ── Validation ───────────────────────────────────────────────────────────────

/** Fiche : objet, nom non vide, piste entière de 1 à 12, source connue (défaut : mj). */
function validateSheet(sheet) {
    if (!sheet || typeof sheet !== 'object' || Array.isArray(sheet)) throw new ValidationError('Fiche de défi manquante');
    const name = typeof sheet.name === 'string' ? sheet.name.trim() : '';
    if (!name) throw new ValidationError('Le défi doit avoir un nom');
    if (!Number.isInteger(sheet.track) || sheet.track < 1 || sheet.track > MAX_TRACK) {
        throw new ValidationError(`Le nombre de réussites va de 1 à ${MAX_TRACK}`);
    }
    const source = sheet.source ?? 'mj';
    if (!SOURCES.includes(source)) throw new ValidationError('Source inconnue');
    const family = typeof sheet.family === 'string' && sheet.family ? sheet.family : 'other';
    return { ...sheet, name, source, family };
}

/** Ajustements en jeu : clés parmi les 6 approches, entiers de −3 à +3. */
function validateAdjust(adjust) {
    if (!adjust || typeof adjust !== 'object' || Array.isArray(adjust)) throw new ValidationError('Ajustements invalides');
    for (const [key, value] of Object.entries(adjust)) {
        if (!APPROACHES.includes(key)) throw new ValidationError(`Approche inconnue : ${key}`);
        if (!Number.isInteger(value) || Math.abs(value) > MAX_ADJUST) throw new ValidationError(`Ajustement de −${MAX_ADJUST} à +${MAX_ADJUST}`);
    }
    return adjust;
}

// ── Bibliothèque ─────────────────────────────────────────────────────────────

const formatChallenge = (row) => ({ id: row.id, ...parseJson(row.sheet, {}), name: row.name, source: row.source, family: row.family });

function listChallenges(db) {
    return db.prepare('SELECT * FROM challenges ORDER BY name COLLATE NOCASE').all().map(formatChallenge);
}

function getChallenge(db, id) {
    const row = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id);
    return row ? formatChallenge(row) : null;
}

function createChallenge(db, rawSheet) {
    const { id: _id, ...sheet } = validateSheet(rawSheet);
    const { lastInsertRowid } = db.prepare('INSERT INTO challenges (name, source, family, sheet) VALUES (?, ?, ?, ?)')
        .run(sheet.name, sheet.source, sheet.family, JSON.stringify(sheet));
    return getChallenge(db, lastInsertRowid);
}

/** Remplace la fiche ; null si le défi n'existe pas. */
function updateChallenge(db, id, rawSheet) {
    const { id: _id, ...sheet } = validateSheet(rawSheet);
    const { changes } = db.prepare('UPDATE challenges SET name = ?, source = ?, family = ?, sheet = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(sheet.name, sheet.source, sheet.family, JSON.stringify(sheet), id);
    return changes ? getChallenge(db, id) : null;
}

/** Supprime un modèle ; les défis déjà lancés gardent leur copie (challenge_id passe à NULL). */
function deleteChallenge(db, id) {
    return db.prepare('DELETE FROM challenges WHERE id = ?').run(id).changes > 0;
}

// ── Défis en cours d'une table ───────────────────────────────────────────────

const formatActive = (row) => ({
    id: row.id, sessionId: row.session_id, challengeId: row.challenge_id,
    sheet: parseJson(row.sheet, {}), progress: row.progress, adjust: parseJson(row.adjust, {}), notes: row.notes ?? '',
});

function listActive(db, sessionId) {
    return db.prepare('SELECT * FROM session_challenges WHERE session_id = ? ORDER BY id').all(sessionId).map(formatActive);
}

function getActive(db, id) {
    const row = db.prepare('SELECT * FROM session_challenges WHERE id = ?').get(id);
    return row ? formatActive(row) : null;
}

/** Lance un défi de la bibliothèque à une table : copie de la fiche. null si la table ou le défi n'existe pas. */
function launchChallenge(db, sessionId, challengeId) {
    if (!db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) return null;
    const model = getChallenge(db, challengeId);
    if (!model) return null;
    const { id: _id, ...sheet } = model;
    const { lastInsertRowid } = db.prepare('INSERT INTO session_challenges (session_id, challenge_id, sheet) VALUES (?, ?, ?)')
        .run(sessionId, challengeId, JSON.stringify(sheet));
    return getActive(db, lastInsertRowid);
}

/**
 * Envoi partiel d'un défi en cours : progress (0 à la piste), adjust, notes.
 * Un champ absent est conservé. null si le défi n'existe pas.
 */
function patchActive(db, id, { progress, adjust, notes }) {
    const current = getActive(db, id);
    if (!current) return null;
    if (progress !== undefined && (!Number.isInteger(progress) || progress < 0 || progress > current.sheet.track)) {
        throw new ValidationError(`La piste va de 0 à ${current.sheet.track}`);
    }
    if (notes !== undefined && typeof notes !== 'string') throw new ValidationError('Notes invalides');
    db.prepare(`
        UPDATE session_challenges SET
            progress   = COALESCE(?, progress),
            adjust     = COALESCE(?, adjust),
            notes      = COALESCE(?, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(progress ?? null, adjust !== undefined ? JSON.stringify(validateAdjust(adjust)) : null, notes ?? null, id);
    return getActive(db, id);
}

function deleteActive(db, id) {
    return db.prepare('DELETE FROM session_challenges WHERE id = ?').run(id).changes > 0;
}

module.exports = {
    ValidationError, respondError,
    listChallenges, getChallenge, createChallenge, updateChallenge, deleteChallenge,
    listActive, launchChallenge, patchActive, deleteActive,
};
