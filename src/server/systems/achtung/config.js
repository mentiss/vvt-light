// src/server/systems/achtung/config.js
// Configuration du slug Achtung! Cthulhu (2D20 Modiphius — WWII Secret War).
// Détecté automatiquement par loader.js au démarrage.

const path = require('path');

// Vocabulaire thématique WWII / occulte
const ADJECTIVES = [
    'shadow', 'covert', 'ancient', 'cursed', 'iron', 'silent',
    'phantom', 'black', 'crimson', 'doomed', 'secret', 'arcane',
    'fallen', 'haunted', 'occult', 'dread', 'spectral', 'buried',
];

const NOUNS = [
    'operative', 'commando', 'codex', 'relic', 'cipher', 'bunker',
    'dispatch', 'regiment', 'signal', 'artifact', 'dossier', 'section',
    'mythos', 'ritual', 'operation', 'agent', 'totem', 'archive',
];

/**
 * Génère une URL d'accès thématique Achtung! Cthulhu.
 * @returns {string}  ex : "shadow-operative-4217"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = Math.floor(Math.random() * 9999);
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'achtung',
    label:      'Achtung! Cthulhu',
    dbPath:     path.join(__dirname, '../../../../database/achtung.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/achtung-schema.sql'),
    generateAccessUrl,
};