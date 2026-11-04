// src/server/systems/vileborn/config.js
// Configuration du slug Vileborn.
// Détecté automatiquement par Loader.js au démarrage.
// Spec : documentations/spec_vileborn.md (partie II).

const path = require('path');

// Vocabulaire des adresses d'accès : l'ordre du Crépuscule, les Parias, l'obscurité
const ADJECTIVES = [
    'paria', 'gardien', 'cadet', 'crepuscule', 'reverie', 'sacrement',
    'heritage', 'pulsion', 'ombre', 'spectre', 'griffe', 'ruine',
    'luminarien', 'egas', 'aurelie', 'umbrae', 'malengeance', 'nuisible',
];

const NOUNS = [
    'sombre', 'vile', 'nocturne', 'sanglant', 'glace', 'cendre',
    'argentacier', 'salpetre', 'lanterne', 'rune', 'brume', 'tenebre',
    'loup', 'revenant', 'corbeau', 'epine', 'eclipse', 'serment',
];

/**
 * Génère une URL d'accès thématique.
 * Format : "{mot}-{mot}-{nombre 4 chiffres}"
 * @returns {string}  ex : "paria-salpetre-0412"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'vileborn',
    label:      'Vileborn',
    dbPath:     path.join(__dirname, '../../../../database/vileborn.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/vileborn-schema.sql'),
    generateAccessUrl,
    // Route /characters commune (spec_characters_route.md §4.2)
    characters: {
        listColumns:      ['heritage_name'],
        requiredOnCreate: ['playerName', 'nom'],
    },
};
