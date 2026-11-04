// tests/server/systems/dune/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables.

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Personnage test',
        talents:    [{ talentName: 'Talent test', description: 'Description' }],
        items:      [{ nom: 'Atout test', description: 'Description', quantite: 1, qualite: null, motsCles: '' }],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
