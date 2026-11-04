// tests/server/systems/nimble/fixture.js
// Corps de création (POST /characters) et champ modifié par le test d'envoi
// partiel (tests/server/systems/characters.contract.test.js). Inventaire rempli :
// l'aller-retour et l'envoi partiel vérifient qu'il survit avec les mêmes ids ;
// colonnes JSON remplies : elles reviennent en objets.

export default {
    create: {
        playerName:    'Joueur test',
        prenom:        'Dargoss',
        nom:           'Manfield',
        classKey:      'hunter',
        ancestryKey:   'elf',
        backgroundKey: 'wild_one',
        level:         1,
        statStr: -1, statDex: 2, statInt: 0, statWil: 2,
        saves:         { dex: 1, int: -1 },
        skillPoints:   { stealth: 2 },
        hpCurrent:     13,
        hpMax:         13,
        resources:     { toth: 0 },
        choices:       [{ pool: 'toth', key: 'decoy', level: 2 }],
        languages:     ['common', 'elvish'],
        gold:          4,
        items: [
            { itemKey: 'shortbow', kind: 'weapon', name: 'Arc court', data: { damage: '1d6', stat: 'dex' }, quantity: 1, slots: 2, equipped: true },
            { itemKey: 'cheap_hides', kind: 'armor', name: 'Peaux bon marché', data: { defense: 3, addDex: true }, quantity: 1, slots: 1, equipped: true },
            { itemKey: null, kind: 'gear', name: 'Tatouage de clan', data: {}, quantity: 1, slots: 0 },
        ],
    },
    edit: { field: 'notes', value: 'Notes modifiées' },
};
