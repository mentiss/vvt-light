// src/server/systems/maledictum/config.js
// Configuration du slug Imperium Maledictum (Warhammer 40 000, setup Inquisition).
// Détecté automatiquement par Loader.js au démarrage.
// Spec : documentations/spec_maledictum.md.

const path = require('path');

// Vocabulaire des adresses d'accès : l'Inquisition et le secteur Macharien
const ADJECTIVES = [
    'hereticus', 'malleus', 'xenos', 'puritain', 'radical', 'vigilant',
    'macharien', 'gothique', 'sanctifie', 'purge', 'occulte', 'impérial',
    'clandestin', 'suspect', 'damne', 'fidele', 'sombre', 'ardent',
];

const NOUNS = [
    'rosette', 'acolyte', 'aquila', 'reliquaire', 'cogitateur', 'servo-crane',
    'bolter', 'cathedrale', 'ruche', 'sceau', 'litanie', 'encensoir',
    'hab-bloc', 'conclave', 'inquisiteur', 'cellule', 'heresie', 'bucher',
];

/**
 * Génère une URL d'accès thématique.
 * Format : "{mot}-{mot}-{nombre 4 chiffres}"
 * @returns {string}  ex : "vigilant-rosette-0412"
 */
function generateAccessUrl() {
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)].normalize('NFD').replace(/[̀-ͯ]/g, '');
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${adj}-${noun}-${num}`;
}

module.exports = {
    slug:       'maledictum',
    label:      'Imperium Maledictum : Inquisition',
    dbPath:     path.join(__dirname, '../../../../database/maledictum.db'),
    schemaPath: path.join(__dirname, '../../../../database-template/maledictum-schema.sql'),
    generateAccessUrl,
    // Route /characters commune (spec_characters_route.md §4.2)
    characters: {
        listColumns:      ['faction_key', 'role_key'],
        requiredOnCreate: ['playerName', 'prenom'],
    },
};
