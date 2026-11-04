// tests/server/systems/vileborn/fixture.js
// Corps de création (POST /characters) et champ modifié par le test d'envoi
// partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l'aller-retour et l'envoi partiel vérifient qu'elles survivent
// avec les mêmes ids.

export default {
    create: {
        playerName:   'Joueur test',
        prenom:       'Raphaël',
        nom:          'de Normante',
        motto:        'Tout s\'achève dans le sang.',
        dieForce: 6, dieWill: 6, dieInfluence: 10, dieReason: 8, diePrecision: 8, dieSubterfuge: 6,
        originKey:    'noble',
        originName:   'Noble',
        originEffect: 'Vous pouvez cocher colère pour obtenir une réussite d\'Influence.',
        heritageKey:  'chantesang',
        heritageName: 'Chantesang',
        urge:         'Boire du sang humain',
        words: [
            { kind: 'personality', position: 0, label: 'Raffiné' },
            { kind: 'personality', position: 1, label: 'Courageux' },
            { kind: 'training',    position: 0, label: 'Escrime' },
            { kind: 'training',    position: 1, label: 'Étiquette' },
        ],
        gifts: [
            { giftKey: 'heart_cannot_lie', name: 'Le cœur ne saurait mentir', effect: '', drawback: '', checked: false },
            { giftKey: 'blood_power',      name: 'Pouvoir du sang',           effect: '', drawback: '', checked: false },
        ],
        resources: [{ name: 'Anneau sigillaire des Normante', effect: '+1 avec les militaires' }],
    },
    edit: { field: 'motto', value: 'Devise modifiée' },
};
