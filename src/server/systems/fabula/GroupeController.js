// src/server/systems/fabula/GroupeController.js
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de groupe (spec_fabula.md §7) : une par table de jeu, partagée par les
// joueurs de la table et le MJ (Q-5). Les objets officiels (Élixir, Remède…)
// sont une donnée du client (config/groupItems.js) ; la base ne garde que les
// objets ajoutés par la table, les notes, les cadrans et le journal.
//
//   loadGroupe(db, sessionId)                    → fiche (vide si jamais écrite)
//   updateNotes(db, sessionId, notes)
//   addRow(db, sessionId, kind, data, user)      → kind : objets | cadrans | journal
//   updateRow(db, sessionId, kind, id, data, user)
//   removeRow(db, sessionId, kind, id)
//   requireTableMember(db, sessionId, user)      → joueur de la table ou MJ
//
// Cadrans (Q-6) : visibles et modifiables par tous ; seul le MJ les cache ou les
// montre (le filtrage des cadrans cachés se fait côté client, choix assumé).
// Les écritures renvoient la fiche rechargée ; une règle enfreinte lève une
// GroupeError (status HTTP + message).
// ─────────────────────────────────────────────────────────────────────────────

class GroupeError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const JOURNAL_TYPES = ['personnage', 'creature', 'lieu'];
const SECTIONS_MIN = 2;
const SECTIONS_MAX = 12;

const text = (v, max = 2000) => String(v ?? '').slice(0, max);
const int  = (v, fallback) => (Number.isInteger(Number(v)) && v !== '' && v !== null ? Number(v) : fallback);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Joueur dont le personnage est à la table, ou MJ */
function requireTableMember(db, sessionId, user) {
    if (user?.isGM) return;
    const atTable = db.prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?').get(sessionId, user?.characterId);
    if (!atTable) throw new GroupeError(403, 'Réservé aux joueurs de la table et au MJ');
}

/** Ligne du groupe de la table, créée à la première écriture */
function _ensureGroupe(db, sessionId) {
    const row = db.prepare('SELECT id FROM groupes WHERE session_id = ?').get(sessionId);
    if (row) return row.id;
    if (!db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) throw new GroupeError(404, 'Table introuvable');
    return db.prepare('INSERT INTO groupes (session_id) VALUES (?)').run(sessionId).lastInsertRowid;
}

function loadGroupe(db, sessionId) {
    const g = db.prepare('SELECT id, notes FROM groupes WHERE session_id = ?').get(sessionId);
    if (!g) return { sessionId, notes: '', objets: [], cadrans: [], journal: [] };
    return {
        sessionId,
        notes: g.notes,
        objets: db.prepare('SELECT id, nom, pi, effet FROM groupe_objets WHERE groupe_id = ? ORDER BY id').all(g.id),
        cadrans: db.prepare('SELECT id, nom, sections, remplies, cache FROM groupe_cadrans WHERE groupe_id = ? ORDER BY id').all(g.id)
            .map(c => ({ ...c, cache: !!c.cache })),
        journal: db.prepare('SELECT id, nom, type, notes FROM groupe_journal WHERE groupe_id = ? ORDER BY id').all(g.id),
    };
}

function updateNotes(db, sessionId, notes) {
    const id = _ensureGroupe(db, sessionId);
    db.prepare('UPDATE groupes SET notes = ? WHERE id = ?').run(text(notes, 20000), id);
    return loadGroupe(db, sessionId);
}

// Colonnes écrites par type de ligne, valeurs normalisées (champ absent → inchangé)
const KINDS = {
    objets: {
        table: 'groupe_objets',
        fields: (d, prev) => ({
            nom:   d.nom   !== undefined ? text(d.nom, 120) : prev?.nom ?? '',
            pi:    d.pi    !== undefined ? clamp(int(d.pi, 1), 0, 99) : prev?.pi ?? 1,
            effet: d.effet !== undefined ? text(d.effet, 1000) : prev?.effet ?? '',
        }),
    },
    cadrans: {
        table: 'groupe_cadrans',
        fields: (d, prev) => {
            const sections = d.sections !== undefined ? clamp(int(d.sections, 6), SECTIONS_MIN, SECTIONS_MAX) : prev?.sections ?? 6;
            const remplies = d.remplies !== undefined ? int(d.remplies, 0) : prev?.remplies ?? 0;
            return {
                nom: d.nom !== undefined ? text(d.nom, 120) : prev?.nom ?? '',
                sections,
                remplies: clamp(remplies, 0, sections),
                cache: d.cache !== undefined ? (d.cache ? 1 : 0) : prev?.cache ?? 0,
            };
        },
    },
    journal: {
        table: 'groupe_journal',
        fields: (d, prev) => ({
            nom:   d.nom   !== undefined ? text(d.nom, 120) : prev?.nom ?? '',
            type:  d.type  !== undefined ? (JOURNAL_TYPES.includes(d.type) ? d.type : 'personnage') : prev?.type ?? 'personnage',
            notes: d.notes !== undefined ? text(d.notes, 5000) : prev?.notes ?? '',
        }),
    },
};

function _kind(kind) {
    const k = KINDS[kind];
    if (!k) throw new GroupeError(404, 'Élément inconnu');
    return k;
}

/** Cacher ou montrer un cadran : MJ seulement */
function _checkCache(kind, data, user) {
    if (kind === 'cadrans' && data?.cache !== undefined && !user?.isGM) {
        throw new GroupeError(403, 'Seul le MJ cache ou montre un cadran');
    }
}

function addRow(db, sessionId, kind, data, user) {
    const k = _kind(kind);
    _checkCache(kind, data, user);
    const groupeId = _ensureGroupe(db, sessionId);
    const values = k.fields(data ?? {}, null);
    const cols = Object.keys(values);
    db.prepare(`INSERT INTO ${k.table} (groupe_id, ${cols.join(', ')}) VALUES (?, ${cols.map(() => '?').join(', ')})`)
        .run(groupeId, ...Object.values(values));
    return loadGroupe(db, sessionId);
}

function _requireRow(db, sessionId, k, id) {
    const row = db.prepare(`SELECT t.* FROM ${k.table} t JOIN groupes g ON g.id = t.groupe_id WHERE t.id = ? AND g.session_id = ?`).get(id, sessionId);
    if (!row) throw new GroupeError(404, 'Élément introuvable');
    return row;
}

function updateRow(db, sessionId, kind, id, data, user) {
    const k = _kind(kind);
    _checkCache(kind, data, user);
    const prev = _requireRow(db, sessionId, k, id);
    const values = k.fields(data ?? {}, prev);
    const cols = Object.keys(values);
    db.prepare(`UPDATE ${k.table} SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`).run(...Object.values(values), id);
    return loadGroupe(db, sessionId);
}

function removeRow(db, sessionId, kind, id) {
    const k = _kind(kind);
    _requireRow(db, sessionId, k, id);
    db.prepare(`DELETE FROM ${k.table} WHERE id = ?`).run(id);
    return loadGroupe(db, sessionId);
}

module.exports = { GroupeError, loadGroupe, updateNotes, addRow, updateRow, removeRow, requireTableMember };
