// tests/server/systems/cyberpunk/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js).

export default {
    create: { playerName: 'Joueur test', nom: 'Personnage test' },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
