// tests/server/systems/tecumah/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables.

export default {
    create: {
        playerName:  'Joueur test',
        nom:         'Personnage test',
        age:         34,   // l'envoi partiel doit le conserver (B-COALESCE)
        backgrounds: [{ type: 'allies', niveau: 1, notes: 'Note' }],
        items:       [{ name: 'Colt test', description: '', category: 'weapon', quantity: 1, location: 'inventory', damage: 4 }],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
