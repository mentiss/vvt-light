// tests/server/systems/deltagreen/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables.

export default {
    create: {
        playerName:  'Joueur test',
        nom:         'Personnage test',
        age:         34,   // l'envoi partiel doit le conserver (B-COALESCE)
        bonds:       [{ name: 'Lien test', score: 10, isDamaged: false, position: 0 }],
        motivations: [{ text: 'Motivation test', type: 'motivation', position: 0 }],
        skills:      [{ skillKey: 'alertness', specialty: null, score: 40, failedCheck: false }],
        languages:   [{ name: 'Allemand', score: 30, failedCheck: false }],
        equipment:   [{ name: 'Lampe test', category: 'Divers', expense: 'Standard', quantity: 1, notes: '', jsonDetails: {} }],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
