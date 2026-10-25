// src/client/src/tools/catalog.js
// ─────────────────────────────────────────────────────────────────────────────
// Filtrage de la modale de catalogue générique (CatalogModal,
// documentations/spec_ui_catalogue.md) : recherche dans le texte des objets
// fournis par le slug, rangées de filtres combinées, groupement en intertitres.
//
// La recherche ignore la casse et les accents (« epee » trouve « Épée ») et ne
// lit que les textes, champs imbriqués compris : les nombres (coûts, quantités,
// identifiants) feraient remonter trop de bruit.
// ─────────────────────────────────────────────────────────────────────────────

/** Minuscules, sans accents. */
export const normalizeText = (s) =>
    String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Tous les textes d'une valeur (chaîne, tableau, objet), à n'importe quelle profondeur
const collectText = (value, out) => {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(v => collectText(v, out));
    else if (value && typeof value === 'object') Object.values(value).forEach(v => collectText(v, out));
    return out;
};

/**
 * Texte cherchable d'un objet, normalisé.
 * @param {object}   item
 * @param {string[]} [searchFields]  champs à lire (défaut : tout l'objet)
 */
export const searchableText = (item, searchFields) => {
    const source = searchFields ? searchFields.map(field => item?.[field]) : item;
    return normalizeText(collectText(source, []).join(' '));
};

/**
 * Options d'une rangée de filtres : celles du slug, sinon les valeurs présentes
 * dans les objets, dans l'ordre d'apparition (libellé = valeur).
 * @param {object[]} items
 * @param {{ getValue: Function, options?: { value: *, label: string }[] }} filter
 */
export const filterOptions = (items, filter) => {
    if (filter.options) return filter.options;
    const seen = new Set();
    const options = [];
    for (const item of items) {
        const value = filter.getValue(item);
        if (value == null || value === '' || seen.has(value)) continue;
        seen.add(value);
        options.push({ value, label: String(value) });
    }
    return options;
};

/**
 * Objets qui correspondent à la recherche et à toutes les rangées actives.
 * @param {object[]} items
 * @param {object}   params
 * @param {string}   [params.query]
 * @param {{ key: string, getValue: Function }[]} [params.filters]
 * @param {Object<string, *>} [params.selected]  valeur choisie par rangée (null ou absente = toutes)
 * @param {string[]} [params.searchFields]
 */
export const filterCatalog = (items, { query = '', filters = [], selected = {}, searchFields } = {}) => {
    const q = normalizeText(query).trim();
    const active = filters.filter(f => selected[f.key] != null);
    return items.filter(item =>
        active.every(f => f.getValue(item) === selected[f.key])
        && (!q || searchableText(item, searchFields).includes(q)));
};

/**
 * Groupes d'objets dans l'ordre d'apparition.
 * @returns {{ value: *, items: object[] }[]}
 */
export const groupCatalog = (items, getValue) => {
    const groups = new Map();
    for (const item of items) {
        const value = getValue(item);
        if (!groups.has(value)) groups.set(value, []);
        groups.get(value).push(item);
    }
    return [...groups].map(([value, groupItems]) => ({ value, items: groupItems }));
};
