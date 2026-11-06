// tests/server/systems/maledictum/fixture.js
// Corps de création (POST /characters) et champ modifié par le test d'envoi
// partiel (tests/server/systems/characters.contract.test.js). Inventaire rempli :
// l'aller-retour et l'envoi partiel vérifient qu'il survit avec les mêmes ids ;
// colonnes JSON remplies : elles reviennent en objets.

export default {
    create: {
        playerName: 'Joueur test',
        prenom:     'Séverine',
        nom:        'Kael',
        originKey:  'hive_world',
        factionKey: 'ordo_hereticus',
        dutyKey:    'querent',
        roleKey:    'mystic',
        charsBase:  { ws: 33, bs: 36, str: 29, tgh: 35, ag: 34, int: 38, per: 46, wil: 44, fel: 37 },
        skills:     { intuition: 2, presence: 1 },
        specs:      [{ skill: 'intuition', key: 'human', label: 'Humains', adv: 1 }],
        talents:    [{ key: 'ever_vigilant', count: 1 }],
        influence:  { inquisition: 1 },
        fate:       3,
        fateMax:    3,
        solars:     400,
        items: [
            { itemKey: 'shotpistol', kind: 'weapon', name: 'Pistolet à grenaille', data: { damage: 4, range: 'short' }, quantity: 1, equipped: true },
            { itemKey: 'armoured_bodyglove', kind: 'armour', name: 'Combinaison blindée', data: { armour: 2, locations: ['arms', 'body', 'legs'] }, quantity: 1, equipped: true },
            { itemKey: null, kind: 'gear', name: 'Rosaire de l\'Ordo', data: {}, quantity: 1 },
        ],
    },
    edit: { field: 'notes', value: 'Notes modifiées' },
};
