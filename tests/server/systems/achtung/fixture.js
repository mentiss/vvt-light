// tests/server/systems/achtung/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables (syncSubTable).

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Personnage test',
        talents: [{ name: 'Talent test', keywords: 'Test', effect: 'Effet' }],
        weapons: [{ name: 'Pistolet test', focus: 'Tir', range: 'C', damage: 2, salvo: [], size: '1M', qualities: [], effect: [] }],
        items:   [{ name: 'Objet test', description: 'Description', effect: '' }],
        spells:  [{ name: 'Sort test', skillUsed: 'academia', difficulty: 2, cost: '1', duration: '', effect: 'Effet' }],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
