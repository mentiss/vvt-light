// src/server/systems/woddavampire/config.js
// Configuration du slug Vampire : l'Âge des Ténèbres (V20 Dark Ages).
// Détecté automatiquement par Loader.js au démarrage.
// Spec : documentations/spec_woddavampire.md (partie II).

const path = require('path');

// Vocabulaire des adresses d'accès : l'Église et la foi, les Caïnites, la nuit et le sang
const ADJECTIVES = [
    'vigile', 'matines', 'complies', 'anatheme', 'requiem', 'relique',
    'ostensoir', 'calice', 'crypte', 'cilice', 'psaume', 'litanie',
    'prince', 'sire', 'infant', 'cainite', 'vitae', 'mathusalem',
];

const NOUNS = [
    'nocturne', 'sanglant', 'ecarlate', 'tenebre', 'cendre', 'cierge',
    'abbaye', 'cloitre', 'ossuaire', 'beffroi', 'lignee', 'diablerie',
    'seigneur', 'veneur', 'pelerin', 'heretique', 'penitent', 'gargouille',
];

/**
 * Génère une URL d'accès thématique.
 * Format : "{mot}-{mot}-{nombre 4 chiffres}"
 * @returns {string}  ex : "prince-ostensoir-0412"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'woddavampire',
    label:      "Vampire : l'Âge des Ténèbres",
    dbPath:     path.join(__dirname, '../../../../database/woddavampire.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/woddavampire-schema.sql'),
    generateAccessUrl,
    // Route /characters commune (spec_characters_route.md §4.2)
    characters: {
        listColumns:      ['clan_key', 'generation'],
        requiredOnCreate: ['playerName', 'nom'],
    },
};
