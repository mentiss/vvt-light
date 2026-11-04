// tests/server/systems/noctis/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d'envoi partiel (tests/server/systems/characters.contract.test.js).
// Noctis attend ses champs en snake_case (player_name). Spécialités et ombres
// remplies (sa création n'enregistre pas les objets) : l'aller-retour vérifie
// que leurs ids restent stables.

export default {
    create: {
        player_name: 'Joueur test',
        nom:         'Personnage',
        prenom:      'Test',
        specialties: [{ name: 'Spécialité test', type: 'normale', niveau: 'debutant', is_dormant: 0, notes: '' }],
        ombres:      [{ type: 'dette', description: 'Description', effect: '' }],    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
