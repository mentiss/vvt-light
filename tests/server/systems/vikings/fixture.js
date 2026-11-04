// tests/server/systems/vikings/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d'envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l'aller-retour vérifie que leurs ids restent stables.

export default {
    create: {
        playerName: 'Joueur test',
        prenom:     'Personnage test',
        skills:     [{ name: 'Navigation', specialization: null, level: 2, currentPoints: 0 }],
        traits:     [{ name: 'Brave' }],
        runes:      [{ name: 'Fehu', level: 1 }],
        items:      [{ name: 'Hache test', category: 'arme', quantity: 1, location: 'bag', notes: '' }],
    },
    edit:   { field: 'prenom', value: 'Prénom modifié' },
};
