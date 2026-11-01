// tests/server/systems/vikings/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d'envoi partiel (tests/server/systems/characters.contract.test.js).

export default {
    create: { playerName: 'Joueur test', prenom: 'Personnage test' },
    edit:   { field: 'prenom', value: 'Prénom modifié' },
};
