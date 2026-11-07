// src/client/src/systems/cyberpunk/moveConsole.js
// ─────────────────────────────────────────────────────────────────────────────
// Console de manœuvres personnalisable (spec_cyberpunk.md §4) : fonctions pures.
// La fiche porte `moveConsole` : liste ordonnée d'ids de manœuvres posées à côté
// des stats ; null = réglage de base (les manœuvres de base officielles).
// Une manœuvre ne se pose que sur la ligne de SA stat (Q-13) ; une manœuvre sans
// stat des six (aucune, ou Cred) va sur la ligne « Autres ».
// Ré-exporté par config.jsx.
// ─────────────────────────────────────────────────────────────────────────────

/** Lignes de la console, dans l'ordre d'affichage. */
export const CONSOLE_ROWS = ['cran', 'pro', 'chair', 'esprit', 'style', 'synth', 'other'];

/** Ligne d'une manœuvre. */
export const consoleRowOf = (move) => (CONSOLE_ROWS.includes(move?.stat) && move.stat !== 'other' ? move.stat : 'other');

/** Manœuvre de base officielle (accessible à tous, sans achat). */
export const isBaseMove = (move) => move?.playbook === null && move?.type === 'official';

/**
 * Manœuvres que le personnage peut poser : les manœuvres de base et celles qu'il a
 * acquises (détails repris de la bibliothèque quand ils y sont).
 * @returns {Map<number, object>} id → manœuvre
 */
export function consoleCandidates(allMoves = [], charMoves = []) {
    const byId = new Map();
    for (const m of allMoves) if (isBaseMove(m)) byId.set(m.id, m);
    for (const m of charMoves) {
        if (m?.isApproved === false) continue;
        byId.set(m.id, allMoves.find(x => x.id === m.id) ?? m);
    }
    return byId;
}

/**
 * Ids affichés : le réglage enregistré (ids inconnus ou en double écartés), ou
 * à défaut les manœuvres de base dans l'ordre de la bibliothèque.
 */
export function resolveConsoleIds(consoleIds, candidates) {
    if (!Array.isArray(consoleIds)) {
        return [...candidates.values()].filter(isBaseMove).map(m => m.id);
    }
    return [...new Set(consoleIds)].filter(id => candidates.has(id));
}

/** Range les ids par ligne : { cran: [move…], …, other: [move…] }. */
export function groupConsole(ids, candidates) {
    const rows = Object.fromEntries(CONSOLE_ROWS.map(r => [r, []]));
    for (const id of ids) {
        const m = candidates.get(id);
        if (m) rows[consoleRowOf(m)].push(m);
    }
    return rows;
}

/** La manœuvre peut-elle être déposée sur cette ligne ? */
export const canDropOn = (move, row) => !!move && consoleRowOf(move) === row;

/**
 * Pose (ou déplace) une manœuvre : avant `beforeId` s'il est donné et présent,
 * sinon en fin de liste.
 */
export function placeInConsole(ids, moveId, beforeId = null) {
    const rest = ids.filter(id => id !== moveId);
    const at = beforeId !== null && beforeId !== moveId ? rest.indexOf(beforeId) : -1;
    if (at >= 0) rest.splice(at, 0, moveId);
    else rest.push(moveId);
    return rest;
}

/** Pose la manœuvre si elle est absente, la retire sinon (épingle des cartes). */
export const togglePinned = (ids, moveId) => (ids.includes(moveId) ? ids.filter(id => id !== moveId) : [...ids, moveId]);
