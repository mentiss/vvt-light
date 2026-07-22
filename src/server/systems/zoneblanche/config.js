// src/server/systems/zoneblanche/config.js
// Configuration du slug Zone Blanche.
// Découvert automatiquement par loader.js au démarrage.

const path = require('path');
const { generateAccessCode } = require('../../utils/characters');

// ── Vocabulaire "found footage" pour les URLs ─────────────────────────────────
// Format : "{adjectif}-{nom}-{nombre 2 chiffres}" — ex : "grainy-static-47"

const ADJECTIVES = [
    'grainy', 'flickering', 'silent', 'hollow', 'distant', 'faint', 'cold',
    'restless', 'muffled', 'sealed', 'buried', 'derelict', 'nocturnal',
    'unstable', 'fractured', 'lingering', 'shivering', 'dormant',
];

const NOUNS = [
    'static', 'signal', 'rewind', 'feedback', 'frame', 'echo', 'threshold',
    'attic', 'basement', 'corridor', 'archive', 'sequence', 'transmission',
    'silhouette', 'wavelength', 'artifact', 'residue', 'blackout',
];

function generateAccessUrl() {
    const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun   = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    return `${adj}-${noun}-${suffix}`;
}

module.exports = {
    slug:       'zoneblanche',
    label:      'Zone Blanche',
    dbPath:     path.join(__dirname, '../../../../database/zoneblanche.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/zoneblanche-schema.sql'),

    generateAccessCode,
    generateAccessUrl,
};