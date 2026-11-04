// src/server/systems/nimble/config.js
// Configuration du slug Nimble (heroic fantasy, hack allégé de D&D 5e).
// Détecté automatiquement par Loader.js au démarrage.
// Spec : documentations/spec_nimble.md.

const path = require('path');

// Vocabulaire des adresses d'accès : la route des héros
const ADJECTIVES = [
    'agile', 'vaillant', 'preste', 'hardi', 'fougueux', 'intrepide',
    'rusé', 'farouche', 'loyal', 'sauvage', 'radieux', 'sombre',
    'leste', 'tenace', 'fier', 'errant', 'ardent', 'vif',
];

const NOUNS = [
    'griffon', 'auberge', 'dague', 'grimoire', 'ours-hibou', 'kobold',
    'lanterne', 'donjon', 'dragon', 'fleche', 'bouclier', 'taverne',
    'gobelin', 'heros', 'carquois', 'sortilege', 'chope', 'tresor',
];

/**
 * Génère une URL d'accès thématique.
 * Format : "{mot}-{mot}-{nombre 4 chiffres}"
 * @returns {string}  ex : "preste-griffon-0412"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)].normalize('NFD').replace(/[̀-ͯ]/g, '');
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'nimble',
    label:      'Nimble',
    dbPath:     path.join(__dirname, '../../../../database/nimble.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/nimble-schema.sql'),
    generateAccessUrl,
    // Route /characters commune (spec_characters_route.md §4.2)
    characters: {
        listColumns:      ['class_key', 'level'],
        requiredOnCreate: ['playerName', 'prenom'],
    },
};
