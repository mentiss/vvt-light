// src/server/systems/maledictum/PatronController.js
// ─────────────────────────────────────────────────────────────────────────────
// Patron de la table (fiche de groupe, spec_maledictum.md §9.3) : une ligne de
// la table patrons par table de jeu, créée à la première écriture.
//
//   loadPatron(db, sessionId)                    → fiche (valeurs par défaut si jamais écrite)
//   savePatron(db, sessionId, body)              → fiche rechargée (MJ : tout)
//   setSuperiority(db, sessionId, value)         → fiche rechargée (0 à 10)
//   requireTableMember(db, sessionId, user)      → joueur de la table ou MJ
//
// La partie secrète (Handicaps, Influence réelle, notes du MJ) est renvoyée à
// tous : le filtrage d'affichage se fait côté client (choix assumé du projet,
// CLAUDE.md « Sécurité GM/joueurs »). Les écritures sont réservées au MJ.
// Une règle enfreinte lève une PatronError (status HTTP + message).
// ─────────────────────────────────────────────────────────────────────────────

const { parseJson } = require('../../utils/characters');

class PatronError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const SUPERIORITY_MAX = 10;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const int = (v, fallback) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.trunc(Number(v)) : fallback);
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);

function requireTableMember(db, sessionId, user) {
    if (user?.isGM) return;
    const atTable = db.prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?').get(sessionId, user?.characterId);
    if (!atTable) throw new PatronError(403, 'Réservé aux joueurs de la table et au MJ');
}

function _ensureRow(db, sessionId) {
    const row = db.prepare('SELECT id FROM patrons WHERE session_id = ?').get(sessionId);
    if (row) return row.id;
    if (!db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) throw new PatronError(404, 'Table introuvable');
    return db.prepare('INSERT INTO patrons (session_id) VALUES (?)').run(sessionId).lastInsertRowid;
}

function loadPatron(db, sessionId) {
    const r = db.prepare('SELECT * FROM patrons WHERE session_id = ?').get(sessionId);
    if (!r) return { sessionId, data: {}, secret: {}, superiority: 0, superiorityEnabled: true, subtlety: 10, subtletyEnabled: true, updatedAt: null };
    return {
        sessionId, data: parseJson(r.data, {}), secret: parseJson(r.secret, {}),
        superiority: r.superiority, superiorityEnabled: !!r.superiority_enabled, subtlety: r.subtlety, subtletyEnabled: !!r.subtlety_enabled, updatedAt: r.updated_at,
    };
}

/** Écriture du MJ : seuls les champs fournis changent */
function savePatron(db, sessionId, body = {}) {
    _ensureRow(db, sessionId);
    const data = asObject(body.data);
    const secret = asObject(body.secret);
    const superiority = body.superiority === undefined ? null : clamp(int(body.superiority, 0), 0, SUPERIORITY_MAX);
    const subtlety = body.subtlety === undefined ? null : clamp(int(body.subtlety, 10), 1, 10);
    const enabled = body.subtletyEnabled === undefined ? null : (body.subtletyEnabled ? 1 : 0);
    const supEnabled = body.superiorityEnabled === undefined ? null : (body.superiorityEnabled ? 1 : 0);
    db.prepare(`
        UPDATE patrons SET
            data = COALESCE(@data, data),
            secret = COALESCE(@secret, secret),
            superiority = COALESCE(@superiority, superiority),
            superiority_enabled = COALESCE(@supEnabled, superiority_enabled),
            subtlety = COALESCE(@subtlety, subtlety),
            subtlety_enabled = COALESCE(@enabled, subtlety_enabled),
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = @sessionId
    `).run({
        sessionId, data: data ? JSON.stringify(data) : null, secret: secret ? JSON.stringify(secret) : null,
        superiority, supEnabled, subtlety, enabled,
    });
    return loadPatron(db, sessionId);
}

function setSuperiority(db, sessionId, value) {
    if (!Number.isFinite(Number(value))) throw new PatronError(400, 'Supériorité invalide');
    return savePatron(db, sessionId, { superiority: value });
}

module.exports = { PatronError, loadPatron, savePatron, setSuperiority, requireTableMember, SUPERIORITY_MAX };
