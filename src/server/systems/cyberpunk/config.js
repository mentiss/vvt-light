// src/server/systems/cyberpunk/config.js
// Configuration du slug Cyberpunk (The Sprawl — adaptation 2d10).
// Détecté automatiquement par loader.js au démarrage.

const path = require('path');

const ADJECTIVES = [
    'chromed', 'edged', 'jacked', 'gonk', 'chipped',
    'psycho', 'flatlined', 'glitched', 'fried', 'patched',
    'netcrashed', 'wired', 'braindead', 'choomed', 'ripped',
];
const NOUNS = [
    'choom', 'punk', 'netrunner', 'edgerunner', 'solo',
    'corpo', 'arasaka', 'militech', 'cyber', 'ripperdoc',
    'merc', 'runner', 'ganger', 'fixer', 'nomad',
];

/**
 * Génère une URL d'accès thématique Dune.
 * @returns {string}  ex : "noble-atreides-3147"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = Math.floor(Math.random() * 9999);
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'cyberpunk',
    label:      'Cyberpunk',
    dbPath:     path.join(__dirname, '../../../../database/cyberpunk.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/cyberpunk-schema.sql'),
    generateAccessUrl,
};