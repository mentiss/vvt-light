// src/client/src/features/npc/tools/npcTags.js
// ─────────────────────────────────────────────────────────────────────────────
// Étiquettes pilotées par la fiche (spec_pnj.md §11), fonctions pures testées
// (tests/features/npc/tools/npcTags.test.js).
//
// Un groupe du bloc `npc.tagGroups` qui déclare `of(systemData)` est piloté :
// ses étiquettes viennent de la partie système (rang, espèce…), jamais de la saisie.
//   { label: 'Rang', tags: ['Soldat', …], of: sd => RANKS[sd.rank], owns?: tag => bool }
//   of   : étiquette, liste d'étiquettes, ou rien
//   owns : étiquettes du groupe à retirer quand la fiche change (défaut : celles de `tags`)
// ─────────────────────────────────────────────────────────────────────────────

const pilotedGroups = (tagGroups) => (tagGroups ?? []).filter(g => typeof g.of === 'function');
const ownsOf = (g) => g.owns ?? (t => g.tags.includes(t));

/** Étiquettes que la fiche pose d'elle-même */
export function systemTagsOf(systemData, tagGroups) {
    return pilotedGroups(tagGroups).flatMap(g => [g.of(systemData ?? {})].flat()).filter(Boolean);
}

/** L'étiquette appartient-elle à un groupe piloté (donc hors saisie) ? */
export function isSystemTag(tag, tagGroups) {
    return pilotedGroups(tagGroups).some(g => ownsOf(g)(tag));
}

/**
 * Étiquettes d'une fiche après synchronisation : celles de la fiche d'abord,
 * puis les étiquettes libres. Sans groupe piloté, la liste est rendue telle quelle.
 */
export function syncSystemTags(tags, systemData, tagGroups) {
    const list = tags ?? [];
    if (!pilotedGroups(tagGroups).length) return list;
    const own = systemTagsOf(systemData, tagGroups);
    const free = list.filter(t => !isSystemTag(t, tagGroups) && !own.includes(t));
    return [...new Set([...own, ...free])];
}
