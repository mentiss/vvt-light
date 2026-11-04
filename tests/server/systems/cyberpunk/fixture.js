// tests/server/systems/cyberpunk/fixture.js
// Corps minimal de création (POST /characters) et champ modifié par le test
// d’envoi partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l’aller-retour vérifie que leurs ids restent stables.

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Personnage test',
        tags:       [{ tag_text: 'Tag test', tag_variant: 'positive' }],
        directives: [{ type: 'personal', text: 'Directive test', blankValue: '', completed: false }],
        relations:  [{ name: 'Relation test', description: 'Description', link_score: 1, tags: [{ tag_text: 'Lien', tag_variant: 'neutral' }] }],
        cyberware:  [{ name: 'Implant test', option_text: 'Option', notes: '', tags: [{ tag_text: '+fiable', tag_variant: 'positive' }] }],
        items:      [{ name: 'Objet test', description: 'Description', quantity: 1 }],
        moves:      [{ id: 1 }],
    },
    edit:   { field: 'nom', value: 'Nom modifié' },
};
