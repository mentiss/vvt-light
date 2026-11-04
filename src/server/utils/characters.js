// src/server/utils/characters.js
// Fonctions utilitaires génériques, indépendantes de tout système de jeu.
//
// generateAccessUrl() est conservée ici comme implémentation de référence
// (vocabulaire viking) et sert de fallback dans ensureUniqueCode.
// Chaque slug peut surcharger cette logique via config.js → generateAccessUrl.
//
// Helpers de sauvegarde et de diffusion partagés par les CharacterController
// des slugs (documentations/spec_characters_route.md §6) : syncSubTable,
// updateOrInsert, parseJson, broadcastCharacterUpdate.
//
// Pas d'import du Loader ici : les config.js des slugs importent ce fichier
// pendant que le Loader les charge (require circulaire).

function generateAccessCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Génère un code et une URL uniques pour un personnage ou une session.
 *
 * @param {'character'|'session'} type
 * @param req
 *                                                   Fallback : generateAccessUrl() viking ci-dessus.
 * @returns {{ code: string, url: string }}
 */
function ensureUniqueCode(type = 'character', req) {
    const table = type === 'session' ? 'game_sessions' : 'characters';
    let code, url, attempts = 0;
    const db = req.db;
    do {
        code = generateAccessCode();
        url  = req.system?.generateAccessUrl();
        const existing = db.prepare(
            `SELECT id FROM ${table} WHERE access_code = ? OR access_url = ?`
        ).get(code, url);
        if (!existing) break;
        attempts++;
    } while (attempts < 10);

    if (attempts >= 10) throw new Error('Unable to generate unique access codes after 10 attempts');
    return { code, url };
}

// ─── Helper : expression SQL du nom de personnage (identique à sessions.js) ──
// Cache par connexion pour ne pas re-pragma à chaque requête.
const _nameExprCache = new WeakMap();

function getCharNameExpr(db) {
    if (_nameExprCache.has(db)) return _nameExprCache.get(db);

    const cols = db.pragma('table_info(characters)').map(c => c.name);
    let expr;
    if (cols.includes('nom')) {
        // Prénom (s'il existe) + nom. Chaque morceau est protégé par COALESCE : en SQLite,
        // NULL || 'x' vaut NULL, et un prénom vide (Vampire n'a que `nom`) faisait retomber
        // l'appelant sur player_name. Une chaîne vide reste un repli valide (falsy en JS).
        expr = cols.includes('prenom')
            ? "TRIM(COALESCE(c.prenom, '') || ' ' || COALESCE(c.nom, ''))"
            : "c.nom";
    } else if (cols.includes('prenom')) {
        // Vikings : prénom + surnom optionnel
        expr = cols.includes('surnom')
            ? "c.prenom || COALESCE(' \"' || c.surnom || '\"', '')"
            : "c.prenom";
    } else {
        expr = "c.player_name";
    }

    _nameExprCache.set(db, expr);
    return expr;
}

// ─── Sauvegarde des sous-tables ──────────────────────────────────────────────

/**
 * Synchronise une sous-table en CRUD complet. Entrée avec id → mise à jour ;
 * sans id → insertion ; présente en base mais absente du tableau → suppression.
 * Les entrées vides sont ignorées. L'index est transmis à upsertFn (ordre).
 * Un tableau absent (undefined) laisse la sous-table intacte (envoi partiel).
 *
 * @param {Database} db
 * @param {string}   table        sous-table avec colonnes id et character_id
 * @param {number}   characterId
 * @param {Array|undefined} incoming
 * @param {(db, characterId, item, index) => void} upsertFn
 */
function syncSubTable(db, table, characterId, incoming, upsertFn) {
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

/**
 * Mise à jour par id, sinon insertion. Un id inconnu de la base (id temporaire
 * créé côté client) est traité comme une insertion.
 */
function updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues) {
    const changes = entry.id ? db.prepare(updateSql).run(...updateValues).changes : 0;
    if (!changes) db.prepare(insertSql).run(...insertValues);
}

/** JSON stocké en texte → valeur ; vide ou illisible → fallback ; objet déjà lu → tel quel. */
function parseJson(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

// ─── Diffusion ───────────────────────────────────────────────────────────────

/**
 * Diffuse la fiche complète à chaque table (room) du personnage, une fois par table.
 * @param {import('socket.io').Server|undefined} io
 * @param {Database} db
 * @param {string}   slug
 * @param {number}   characterId
 * @param {object}   character   fiche rechargée (loadFullCharacter)
 */
function broadcastCharacterUpdate(io, db, slug, characterId, character) {
    emitToCharacterSessions(io, db, slug, characterId, 'character-full-update', { characterId, character });
}

/** Émet un événement dans chaque room de table du personnage (jamais d'io.emit global). */
function emitToCharacterSessions(io, db, slug, characterId, event, payload) {
    if (!io) return;
    const sessions = db.prepare(
        'SELECT session_id FROM session_characters WHERE character_id = ?'
    ).all(characterId);
    for (const { session_id } of sessions) {
        io.to(`${slug}_session_${session_id}`).emit(event, payload);
    }
}

module.exports = {
    generateAccessCode, ensureUniqueCode, getCharNameExpr,
    syncSubTable, updateOrInsert, parseJson, broadcastCharacterUpdate, emitToCharacterSessions,
};