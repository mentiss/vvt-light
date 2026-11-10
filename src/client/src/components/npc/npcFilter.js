// src/client/src/components/npc/npcFilter.js
// ─────────────────────────────────────────────────────────────────────────────
// Filtre de la bibliothèque des PNJ par étiquettes (spec_pnj.md §6.7), fonctions
// pures testées (tests/components/npc/npcFilter.test.js) :
//   - dans un groupe déclaré par le slug (ex. Rang), les étiquettes choisies
//     s'additionnent (Mineur + Notable = les deux rangs) ;
//   - entre groupes, et pour les étiquettes hors groupe, une fiche doit toutes les avoir ;
//   - nombre d'une étiquette = fiches obtenues en l'ajoutant au filtre en cours.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fiches retenues.
 * @param {object[]} npcs
 * @param {object}   f
 * @param {(npc) => boolean} [f.matches]  autre critère (recherche)
 * @param {Map<string, number>} f.groupOf étiquette → index de son groupe
 * @param {number}   f.groupCount
 * @param {string[]} f.selected
 * @param {number|null} [f.except]       groupe dont la sélection est ignorée
 */
export function filterNpcs(npcs, { matches = () => true, groupOf, groupCount, selected, except = null }) {
    return npcs.filter(n => {
        if (!matches(n)) return false;
        const tags = n.tags ?? [];
        for (let gi = 0; gi < groupCount; gi++) {
            if (gi === except) continue;
            const chosen = selected.filter(t => groupOf.get(t) === gi);
            if (chosen.length && !chosen.some(t => tags.includes(t))) return false;
        }
        return selected.filter(t => !groupOf.has(t)).every(t => tags.includes(t));
    });
}

/**
 * Nombre de fiches de chaque étiquette selon le filtre en cours : pour une étiquette
 * d'un groupe, la sélection de son groupe est ignorée (elle s'y additionnerait).
 * @returns {Map<string, number>}
 */
export function tagCounts(npcs, filter, tags) {
    const shown = filterNpcs(npcs, filter);
    const counts = new Map();
    for (const t of tags) {
        const pool = filter.groupOf.has(t) ? filterNpcs(npcs, { ...filter, except: filter.groupOf.get(t) }) : shown;
        counts.set(t, pool.filter(n => (n.tags ?? []).includes(t)).length);
    }
    return counts;
}
