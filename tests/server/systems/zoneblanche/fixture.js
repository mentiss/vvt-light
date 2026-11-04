// tests/server/systems/zoneblanche/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables (syncSubTable).

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Personnage test',
        verites: [{ nom: 'Vérité test', texte: 'Texte' }],
        focus:   [{ competenceKey: 'investigation', texte: 'Focus test' }],
        talents: [],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
