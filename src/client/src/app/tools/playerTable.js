// src/client/src/app/tools/playerTable.js
// ─────────────────────────────────────────────────────────────────────────────
// Table du joueur (documentations/spec_tables.md §3.2) : parmi les tables actives
// du slug, celles dont le personnage est membre. Aucune : pas de table. Une : elle.
// Plusieurs : la table où il est déjà, sinon son choix mémorisé, sinon on lui demande.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object}        args
 * @param {number[]}      args.activeIds  tables actives du slug
 * @param {number[]}      args.memberIds  tables du personnage (ordre conservé dans candidates)
 * @param {number|null}   [args.current]  table où il est
 * @param {number|null}   [args.remembered] choix mémorisé pour ce personnage
 * @returns {{ tableId: number|null, candidates: number[], needsChoice: boolean }}
 */
export function pickPlayerTable({ activeIds, memberIds, current = null, remembered = null }) {
    const active = new Set(activeIds);
    const candidates = memberIds.filter(id => active.has(id));

    if (candidates.length === 0) return { tableId: null, candidates, needsChoice: false };
    if (candidates.length === 1) return { tableId: candidates[0], candidates, needsChoice: false };
    if (candidates.includes(current)) return { tableId: current, candidates, needsChoice: false };
    if (candidates.includes(remembered)) return { tableId: remembered, candidates, needsChoice: false };
    return { tableId: null, candidates, needsChoice: true };
}
