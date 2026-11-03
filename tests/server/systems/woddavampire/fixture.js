// tests/server/systems/woddavampire/fixture.js
// Corps de création (POST /characters) et champ modifié par le test d'envoi
// partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l'aller-retour et l'envoi partiel vérifient qu'elles survivent
// avec les mêmes ids.

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Aldric de Montfaucon',
        clanKey:    'lasombra',
        roadKey:    'road_of_kings',
        generation: 11,
        bloodCurrent: 7,
        strength: 2, dexterity: 3, stamina: 2,
        abilities:   [{ abilityKey: 'melee', rating: 3, specialties: [], domains: [] },
                      { abilityKey: 'crafts', rating: 1, specialties: [], domains: ['forge'] }],
        backgrounds: [{ backgroundKey: 'generation', rating: 1, details: '' }],
        disciplines: [{ disciplineKey: 'dominate', rating: 2, powers: [] }],
        meritsFlaws: [{ entryKey: 'light_sleeper', kind: 'merit', cost: 2, details: '' }],
    },
    edit: { field: 'nom', value: 'Nom modifié' },
};
