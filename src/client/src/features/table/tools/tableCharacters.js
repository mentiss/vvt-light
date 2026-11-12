// src/client/src/features/table/tools/tableCharacters.js
// ─────────────────────────────────────────────────────────────────────────────
// Fiches des personnages de la table côté MJ (spec_session_mj.md §3) : fusion
// des mises à jour en direct reçues par useGMSession (characterUpdates).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applique les mises à jour en direct aux fiches de la table.
 * Une mise à jour 'full' remplace la fiche, une 'partial' fusionne ses champs ;
 * un personnage absent de la table est ignoré.
 *
 * @param {Object<number, object>} characters  fiches de la table, par id
 * @param {Object<string, { type: 'full'|'partial', data: object }>} updates  characterUpdates
 * @returns {Object<number, object>} nouvelles fiches, ou `characters` lui-même si rien ne change
 */
export function mergeCharacterUpdates(characters, updates) {
    if (!updates) return characters;
    let next = characters;
    for (const [idStr, update] of Object.entries(updates)) {
        const id = Number(idStr);
        if (!characters[id]) continue;   // pas à cette table
        if (next === characters) next = { ...characters };
        next[id] = update.type === 'full' ? update.data : { ...characters[id], ...update.data };
    }
    return next;
}
