// src/server/systems/fabula/config.js
// Configuration du slug Fabula Ultima (JRPG — Need Games / Rooster Games).
// Détecté automatiquement par loader.js au démarrage.

const path = require('path');

// Vocabulaire thématique JRPG / Fabula Ultima
const ADJECTIVES = [
    'radiant', 'valiant', 'eternel', 'arcanique', 'mystique', 'celeste',
    'fatidique', 'errant', 'stoique', 'flamboyant', 'spectral', 'ultime',
    'brise', 'gele', 'sacre', 'oublie', 'vaillant', 'legendaire',
];

const NOUNS = [
    'heros', 'arcaniste', 'vagabond', 'paladin', 'sombrelame', 'phenix',
    'zenith', 'oracle', 'sentinelle', 'chronique', 'ballade', 'ronin',
    'gardien', 'furie', 'voyageur', 'invocateur', 'fabula', 'destinee',
];

/**
 * Génère une URL d'accès thématique Fabula Ultima.
 * Format : "{adjectif}-{nom}-{nombre 4 chiffres}"
 * @returns {string}  ex : "radiant-phenix-0472"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'fabula',
    label:      'Fabula Ultima',
    dbPath:     path.join(__dirname, '../../../../database/fabula.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/fabula-schema.sql'),
    generateAccessUrl,
};