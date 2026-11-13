// src/server/utils/journal.js
// Helpers du journal (documentations/plateforme/spec_journal.md, partie III §10-11).
// Partagés par la route du journal privé (routes/journal.js) et, plus tard, celle du
// journal partagé de la table.

// Catégories fixes d'une note (R-15) : une note sans catégorie se lit « notes »
const CATEGORIES = ['notes', 'personnages', 'lieux', 'indices', 'quetes'];

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

/**
 * Texte brut d'un corps HTML : aperçu, recherche, liste légère (J2-3).
 * Les images (base64 comprises) disparaissent, les blocs deviennent des espaces.
 * @param {string|null} html
 * @returns {string}
 */
function htmlToText(html) {
    if (!html) return '';
    return String(html)
        .replace(/<img[^>]*>/gi, ' ')
        .replace(/<\/(p|div|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, m => ENTITIES[m])
        .replace(/\s+/g, ' ')
        .trim();
}

/** Clé de catégorie valide, ou undefined */
const readCategory = (value) => (CATEGORIES.includes(value) ? value : undefined);

/** Nom affiché d'un personnage (« MJ » pour le compte -1), null s'il n'existe pas. */
function characterName(db, id) {
    if (id === -1) return 'MJ';
    const { getCharNameExpr } = require('./characters');
    const row = db.prepare(`SELECT (${getCharNameExpr(db)}) AS name, c.player_name FROM characters c WHERE c.id = ?`).get(id);
    return row?.name || row?.player_name || null;
}

module.exports = { CATEGORIES, htmlToText, readCategory, characterName };
