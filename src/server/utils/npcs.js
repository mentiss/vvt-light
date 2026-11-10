// src/server/utils/npcs.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de la plateforme (documentations/spec_pnj.md §6.2, §6.3) : bibliothèque du
// MJ (`npcs`) et PNJ présents à une table (`session_npcs`, copie de la fiche).
// Commun à tous les slugs ; la partie système (`systemData`) et l'état d'un PNJ
// à la table (`state`) sont opaques ici, propres au slug.
// La route (routes/npcs.js) valide les paramètres et délègue ici.
// ─────────────────────────────────────────────────────────────────────────────

const { parseJson } = require('./characters');

const MAX_TAGS     = 20;
const MAX_TEXT     = 20000;
const MAX_AVATAR   = 2 * 1024 * 1024;     // data URL d'une image recadrée (256 px) : large marge
const MAX_QUANTITY = 20;
const AVATAR_RE    = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const ICON_RE      = /^[a-z0-9-]+\/[a-z0-9-]+$/;              // id d'icône du tableau (auteur/nom)
const COLOR_RE     = /^#[0-9a-fA-F]{6}$/;

class ValidationError extends Error {}

/** Réponse d'erreur des routes : validation → 400 avec son message ; le reste → 500 sans détail. */
function respondError(res, err, label, message) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    console.error(`[npcs] ${label}:`, err);
    return res.status(500).json({ error: message });
}

// ── Validation ───────────────────────────────────────────────────────────────

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Texte facultatif : null s'il est absent, sinon la chaîne bornée ; un texte vidé
 * s'enregistre vide (B-COALESCE). `trim` pour les champs d'une ligne (prénom, rôle).
 */
function optionalText(value, label, { trim = false } = {}) {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') throw new ValidationError(`${label} : texte attendu`);
    if (value.length > MAX_TEXT) throw new ValidationError(`${label} : texte trop long`);
    return trim ? value.trim() : value;
}

/**
 * Fiche d'un PNJ (bibliothèque, ou copie d'un PNJ à la table) : nom obligatoire,
 * étiquettes uniques, avatar image ou icône du tableau, partie système objet.
 */
function validateNpc(raw) {
    if (!isObject(raw)) throw new ValidationError('Fiche de PNJ manquante');
    const nom = typeof raw.nom === 'string' ? raw.nom.trim() : '';
    if (!nom) throw new ValidationError('Le PNJ doit avoir un nom');

    const tags = raw.tags ?? [];
    if (!Array.isArray(tags) || tags.some(t => typeof t !== 'string')) throw new ValidationError('Étiquettes invalides');
    const cleanTags = [...new Set(tags.map(t => t.trim()).filter(Boolean))];
    if (cleanTags.length > MAX_TAGS) throw new ValidationError(`${MAX_TAGS} étiquettes au plus`);

    const avatar = raw.avatar ?? null;
    if (avatar !== null && (typeof avatar !== 'string' || avatar.length > MAX_AVATAR || !AVATAR_RE.test(avatar))) {
        throw new ValidationError('Avatar invalide');
    }
    const icon = raw.icon ?? null;
    if (icon !== null && !(isObject(icon) && ICON_RE.test(icon.icon ?? '') && COLOR_RE.test(icon.color ?? ''))) {
        throw new ValidationError('Icône invalide');
    }
    const page = raw.page ?? null;
    if (page !== null && !Number.isInteger(page)) throw new ValidationError('Page invalide');
    const systemData = raw.systemData ?? {};
    if (!isObject(systemData)) throw new ValidationError('Partie système invalide');

    return {
        prenom:      optionalText(raw.prenom, 'Prénom', { trim: true }),
        nom,
        role:        optionalText(raw.role, 'Rôle', { trim: true }),
        description: optionalText(raw.description, 'Description'),
        gmNotes:     optionalText(raw.gmNotes, 'Notes du MJ'),
        tags:        cleanTags,
        avatar,
        icon:        icon ? { icon: icon.icon, color: icon.color } : null,
        source:      optionalText(raw.source, 'Source', { trim: true }),
        page,
        systemData,
    };
}

// ── Bibliothèque ─────────────────────────────────────────────────────────────

const formatNpc = (row) => ({
    id:          row.id,
    prenom:      row.prenom,
    nom:         row.nom,
    role:        row.role,
    description: row.description,
    gmNotes:     row.gm_notes,
    tags:        parseJson(row.tags, []),
    avatar:      row.avatar,
    icon:        parseJson(row.icon, null),
    source:      row.source,
    page:        row.page,
    systemData:  parseJson(row.system_data, {}),
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
});

function listNpcs(db) {
    return db.prepare('SELECT * FROM npcs ORDER BY nom COLLATE NOCASE, prenom COLLATE NOCASE').all().map(formatNpc);
}

function getNpc(db, id) {
    const row = db.prepare('SELECT * FROM npcs WHERE id = ?').get(id);
    return row ? formatNpc(row) : null;
}

/** Colonnes écrites, dans l'ordre des paramètres des requêtes ci-dessous. */
const npcParams = (n) => [n.prenom, n.nom, n.role, n.description, n.gmNotes, JSON.stringify(n.tags),
    n.avatar, n.icon ? JSON.stringify(n.icon) : null, n.source, n.page, JSON.stringify(n.systemData)];

function createNpc(db, raw) {
    const npc = validateNpc(raw);
    const { lastInsertRowid } = db.prepare(`
        INSERT INTO npcs (prenom, nom, role, description, gm_notes, tags, avatar, icon, source, page, system_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...npcParams(npc));
    return getNpc(db, lastInsertRowid);
}

/**
 * Modifie une fiche : les champs absents de l'envoi gardent leur valeur, un texte
 * reçu à null aussi (B-COALESCE : un texte vidé s'envoie ''). Avatar et icône se
 * retirent par null. Fusion avec la fiche enregistrée, puis validation ; null si absente.
 */
const TEXT_KEYS = ['prenom', 'role', 'description', 'gmNotes', 'source'];
function updateNpc(db, id, raw) {
    const current = getNpc(db, id);
    if (!current) return null;
    if (!isObject(raw)) throw new ValidationError('Fiche de PNJ manquante');
    const defined = Object.fromEntries(Object.entries(raw)
        .filter(([key, v]) => v !== undefined && !(v === null && TEXT_KEYS.includes(key))));
    const npc = validateNpc({ ...current, ...defined });
    db.prepare(`
        UPDATE npcs SET prenom = ?, nom = ?, role = ?, description = ?, gm_notes = ?, tags = ?, avatar = ?,
                        icon = ?, source = ?, page = ?, system_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(...npcParams(npc), id);
    return getNpc(db, id);
}

/** Supprime une fiche ; les PNJ déjà à la table gardent leur copie (npc_id passe à NULL). */
function deleteNpc(db, id) {
    return db.prepare('DELETE FROM npcs WHERE id = ?').run(id).changes > 0;
}

// ── PNJ à la table ───────────────────────────────────────────────────────────

const formatSessionNpc = (row) => ({
    id:        row.id,
    sessionId: row.session_id,
    npcId:     row.npc_id,
    name:      row.name,
    sheet:     parseJson(row.sheet, {}),
    state:     parseJson(row.state, {}),
    notes:     row.notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
});

const sessionExists = (db, sessionId) => !!db.prepare('SELECT 1 FROM game_sessions WHERE id = ?').get(sessionId);

function listSessionNpcs(db, sessionId) {
    return db.prepare('SELECT * FROM session_npcs WHERE session_id = ? ORDER BY sort_order, id')
        .all(sessionId).map(formatSessionNpc);
}

function getSessionNpc(db, sessionId, id) {
    const row = db.prepare('SELECT * FROM session_npcs WHERE id = ? AND session_id = ?').get(id, sessionId);
    return row ? formatSessionNpc(row) : null;
}

/**
 * Nom à la table : le nom de la fiche, puis « Nom 2 », « Nom 3 »… s'il est déjà pris
 * (spec §6.3). `taken` : noms déjà présents à la table.
 */
function nextName(base, taken) {
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base} ${n}`)) n++;
    return `${base} ${n}`;
}

/**
 * Ajoute `quantity` copies de la fiche `npcId` à la table, avec l'état initial
 * fourni par le slug. Renvoie les PNJ ajoutés ; null si la table ou la fiche n'existe pas.
 */
function addSessionNpcs(db, sessionId, { npcId, quantity = 1, state = {} } = {}) {
    if (!Number.isInteger(npcId)) throw new ValidationError('PNJ invalide');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) throw new ValidationError(`Quantité de 1 à ${MAX_QUANTITY}`);
    if (!isObject(state)) throw new ValidationError('État invalide');
    if (!sessionExists(db, sessionId)) return null;
    const npc = getNpc(db, npcId);
    if (!npc) return null;

    const { id: _id, createdAt: _c, updatedAt: _u, ...sheet } = npc;
    const base = [npc.prenom, npc.nom].filter(Boolean).join(' ');
    const insert = db.prepare(`
        INSERT INTO session_npcs (session_id, npc_id, name, sheet, state, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const add = db.transaction(() => {
        const rows = db.prepare('SELECT name, sort_order FROM session_npcs WHERE session_id = ?').all(sessionId);
        const taken = new Set(rows.map(r => r.name));
        let order = rows.reduce((max, r) => Math.max(max, r.sort_order), -1);
        const ids = [];
        for (let i = 0; i < quantity; i++) {
            const name = nextName(base, taken);
            taken.add(name);
            ids.push(insert.run(sessionId, npcId, name, JSON.stringify(sheet), JSON.stringify(state), ++order).lastInsertRowid);
        }
        return ids;
    });
    return add().map(id => getSessionNpc(db, sessionId, id));
}

/**
 * Modifie un PNJ à la table : nom, copie de la fiche, état, notes, ordre ;
 * les champs absents gardent leur valeur. null s'il n'est pas à cette table.
 */
function updateSessionNpc(db, sessionId, id, raw) {
    const current = getSessionNpc(db, sessionId, id);
    if (!current) return null;
    if (!isObject(raw)) throw new ValidationError('Modification manquante');
    const next = { ...current };
    if (raw.name !== undefined) {
        const name = typeof raw.name === 'string' ? raw.name.trim() : '';
        if (!name) throw new ValidationError('Le PNJ doit avoir un nom à la table');
        next.name = name;
    }
    if (raw.sheet !== undefined) next.sheet = validateNpc(raw.sheet);
    if (raw.state !== undefined) {
        if (!isObject(raw.state)) throw new ValidationError('État invalide');
        next.state = raw.state;
    }
    if (raw.notes !== undefined && raw.notes !== null) next.notes = optionalText(raw.notes, 'Notes');   // null : gardées (B-COALESCE)
    if (raw.sortOrder !== undefined) {
        if (!Number.isInteger(raw.sortOrder)) throw new ValidationError('Ordre invalide');
        next.sortOrder = raw.sortOrder;
    }
    db.prepare('UPDATE session_npcs SET name = ?, sheet = ?, state = ?, notes = ?, sort_order = ? WHERE id = ? AND session_id = ?')
        .run(next.name, JSON.stringify(next.sheet), JSON.stringify(next.state), next.notes, next.sortOrder, id, sessionId);
    return getSessionNpc(db, sessionId, id);
}

function removeSessionNpc(db, sessionId, id) {
    return db.prepare('DELETE FROM session_npcs WHERE id = ? AND session_id = ?').run(id, sessionId).changes > 0;
}

/** Vide la table ; renvoie le nombre de PNJ retirés. */
function clearSessionNpcs(db, sessionId) {
    return db.prepare('DELETE FROM session_npcs WHERE session_id = ?').run(sessionId).changes;
}

module.exports = {
    ValidationError, respondError,
    listNpcs, getNpc, createNpc, updateNpc, deleteNpc,
    sessionExists, listSessionNpcs, addSessionNpcs, updateSessionNpc, removeSessionNpc, clearSessionNpcs,
    nextName,
};
