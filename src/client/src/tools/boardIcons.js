// src/client/src/tools/boardIcons.js
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque d'icônes du tableau (documentations/spec_tableau.md §10.7) :
// recherche et catégories sur l'index livré avec l'application
// (public/board/icons/index.json, produit par scripts/board-icons.js, retouchable
// à la main). Fonctions pures.
//
// Index : { groups: [{ label, tags: [slug] }], tags: { slug: libellé }, icons: [{ id, tags: [slug] }] }
// où id = '<auteur>/<nom>' (fichier public/board/icons/<id>.svg).
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeText } from './catalog.js';

export const OTHER_GROUP = 'Divers';

/** Nom lisible d'une icône : « lorc/campfire » → « campfire » */
export const iconName = (id) => id.split('/').pop().replace(/-/g, ' ');

/** Libellés des catégories : groupes de l'index, puis « Divers » s'il y a des icônes sans tag */
export function iconGroups(index) {
    const labels = index.groups.map(g => g.label);
    return index.icons.some(i => i.tags.length === 0) ? [...labels, OTHER_GROUP] : labels;
}

/**
 * Icônes d'une catégorie, filtrées par la recherche (nom et libellés des tags, sans accents ni casse).
 * @param {object} index
 * @param {{ group?: string|null, query?: string }} filter
 * @returns {object[]} icônes de l'index
 */
export function searchIcons(index, { group = null, query = '' } = {}) {
    const groupTags = group && group !== OTHER_GROUP ? new Set(index.groups.find(g => g.label === group)?.tags ?? []) : null;
    const words = normalizeText(query).split(/\s+/).filter(Boolean);
    return index.icons.filter(icon => {
        if (group === OTHER_GROUP && icon.tags.length > 0) return false;
        if (groupTags && !icon.tags.some(t => groupTags.has(t))) return false;
        if (words.length === 0) return true;
        const text = normalizeText(`${iconName(icon.id)} ${icon.tags.map(t => index.tags[t] ?? t).join(' ')}`);
        return words.every(w => text.includes(w));
    });
}

/** Contenu d'un fichier SVG d'icône, sans la balise <svg> (pour l'insérer dans le tableau) */
export function svgInner(text) {
    const match = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(text);
    return match ? match[1] : null;
}
