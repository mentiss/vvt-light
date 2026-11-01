// tests/server/systems/noctis/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d'envoi partiel (tests/server/systems/characters.contract.test.js).
// Noctis attend ses champs en snake_case (player_name).

export default {
    create: { player_name: 'Joueur test', nom: 'Personnage', prenom: 'Test' },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
