// tests/server/systems/fabula/fixture.js
// Corps de création (POST /characters) et champ modifié par le test d'envoi
// partiel (tests/server/systems/characters.contract.test.js). Sous-tables
// remplies : l'aller-retour et l'envoi partiel vérifient qu'elles survivent
// avec les mêmes ids.

export default {
    create: {
        playerName: 'Joueur test',
        nom:        'Personnage test',
        classes:   [{ classKey: 'bricoleur', niveau: 3 }, { classKey: 'gardien', niveau: 2 }],
        skills:    [{ classKey: 'bricoleur', skillKey: 'visionnaire', rang: 2, spellsChoisis: [] }],
        arcana:    [{ arcanumKey: 'tour', etat: 'lie' }],
        bonds:     [{ cibleNom: 'Compagnon', cibleType: 'pj', sentiments: ['loyaute'], notes: '' }],
        equipment: [{
            typeEmplacement: 'arme', nomLibre: 'Épée de test', categorie: 'epee',
            precisionAttr1: 'dex', precisionAttr2: 'pui', degatsBonus: 10, degatsType: 'physique',
            mains: 1, portee: 'cac', emplacementEquipe: 'main_directrice',
        }],
    },
    edit: { field: 'nom', value: 'Nom modifié' },
};
