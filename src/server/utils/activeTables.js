// src/server/utils/activeTables.js
// ─────────────────────────────────────────────────────────────────────────────
// Tables actives, en mémoire (documentations/spec_tables.md §2, §4.1).
// Une table est active tant qu'au moins un poste MJ (un socket) l'a ouverte, ou
// pendant le délai de grâce qui suit la déconnexion de son dernier poste.
//
// État : Map<slug, Map<sessionId, { posts: Set<socketId>, timer: Timeout|null }>>
// Fonctions sans effet de bord hors de l'état reçu : les minuteries et les
// diffusions sont gérées par socket/platform/sessions.js. Chaque écriture
// renvoie true si la liste diffusée (tables et nombre de postes) a changé.
// ─────────────────────────────────────────────────────────────────────────────

const tablesOf = (state, slug) => {
    if (!state.has(slug)) state.set(slug, new Map());
    return state.get(slug);
};

const dropIfEmpty = (state, slug) => {
    if (state.get(slug)?.size === 0) state.delete(slug);
};

/** Liste diffusée : [{ id, posts }] triée par id (posts = nombre de postes MJ ouverts). */
function listActiveTables(state, slug) {
    const tables = state.get(slug);
    if (!tables) return [];
    return [...tables.entries()]
        .map(([id, entry]) => ({ id, posts: entry.posts.size }))
        .sort((a, b) => a.id - b.id);
}

/** Un poste ouvre une table : elle devient (ou reste) active, son délai de grâce est annulé. */
function openTable(state, slug, sessionId, postId) {
    const tables = tablesOf(state, slug);
    const entry = tables.get(sessionId) ?? { posts: new Set(), timer: null };
    tables.set(sessionId, entry);
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = null; }
    if (entry.posts.has(postId)) return false;
    entry.posts.add(postId);
    return true;
}

/** Sortie volontaire d'un poste : la table s'arrête tout de suite s'il était le dernier. */
function leaveTable(state, slug, sessionId, postId) {
    const entry = state.get(slug)?.get(sessionId);
    if (!entry || !entry.posts.delete(postId)) return false;
    if (entry.posts.size === 0) {
        if (entry.timer) clearTimeout(entry.timer);
        state.get(slug).delete(sessionId);
        dropIfEmpty(state, slug);
    }
    return true;
}

/**
 * Déconnexion d'un poste : il quitte toutes ses tables. Les tables restées sans
 * poste gardent leur entrée (délai de grâce) et sont renvoyées pour que l'appelant
 * lance leur minuterie. Renvoie [{ slug, sessionId }] des slugs dont la liste a changé
 * (empty : la table n'a plus de poste).
 */
function dropPost(state, postId) {
    const changed = [];
    for (const [slug, tables] of state) {
        for (const [sessionId, entry] of tables) {
            if (entry.posts.delete(postId)) changed.push({ slug, sessionId, empty: entry.posts.size === 0 });
        }
    }
    return changed;
}

/** Fin du délai de grâce : la table s'arrête si aucun poste n'est revenu. */
function expireTable(state, slug, sessionId) {
    const entry = state.get(slug)?.get(sessionId);
    if (!entry || entry.posts.size > 0) return false;
    state.get(slug).delete(sessionId);
    dropIfEmpty(state, slug);
    return true;
}

module.exports = { listActiveTables, openTable, leaveTable, dropPost, expireTable };
