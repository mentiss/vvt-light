// src/client/src/features/board/tools/boardSelection.js
// ─────────────────────────────────────────────────────────────────────────────
// Sélection du MJ sur le tableau (documentations/spec_tableau.md §14.1, §14.2), pur.
// Une sélection est une liste d'identifiants ; un groupe se sélectionne toujours en
// entier (Q-56). Ce qu'on peut faire d'une sélection se lit ici, pour la barre de
// sélection comme pour le menu contextuel.
// ─────────────────────────────────────────────────────────────────────────────

import { canDuplicate, canRecolor } from './boardRights.js';

/** Identifiants d'un objet et des autres morceaux de son groupe */
export function groupMembers(items, id) {
    const item = items.find(i => i.id === id);
    if (!item) return [];
    if (item.groupId === null || item.groupId === undefined) return [id];
    return items.filter(i => i.groupId === item.groupId).map(i => i.id);
}

/** Sélection étendue aux groupes de ses objets, sans doublon, dans l'ordre d'affichage */
export function expandGroups(items, ids) {
    const wanted = new Set(ids.flatMap(id => groupMembers(items, id)));
    return items.filter(i => wanted.has(i.id)).map(i => i.id);
}

/** Maj + clic : ajoute l'objet (et son groupe) à la sélection, ou l'en retire */
export function toggleInSelection(items, selected, id) {
    const members = groupMembers(items, id);
    if (selected.includes(id)) return selected.filter(x => !members.includes(x));
    return expandGroups(items, [...selected, ...members]);
}

/**
 * Ce que permet une sélection (§14.1, PC-8).
 * @param {object[]} selected objets sélectionnés
 */
export function selectionInfo(selected) {
    const count = selected.length;
    const groups = new Set(selected.map(i => i.groupId).filter(g => g !== null && g !== undefined));
    const allGrouped = selected.every(i => i.groupId !== null && i.groupId !== undefined);
    return {
        count,
        single: count === 1 ? selected[0] : null,               // redimensionner, tourner, filtres, texte : seul
        anyLocked: selected.some(i => i.locked),
        allLocked: count > 0 && selected.every(i => i.locked),
        allHidden: count > 0 && selected.every(i => i.hidden),
        groupable: count >= 2 && !(allGrouped && groups.size === 1),   // déjà un seul et même groupe : rien à grouper
        ungroupable: groups.size > 0,
        duplicable: selected.some(canDuplicate),
        colorable: selected.some(i => canRecolor(i) && !i.locked),
    };
}
