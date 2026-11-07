// src/client/src/systems/cyberpunk/config/catalog.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogues du chrome et du matos : libellés des catégories et champs communs.
// Données : cyberware.js, items.js (spec_cyberpunk.md §9.4).
// ─────────────────────────────────────────────────────────────────────────────

// Champs communs aux cyberwares et aux objets :
//   tags        tags imposés
//   tagChoices  choix dans une liste définie : [{ label, pick, from: [tag, …] }]
// Cyberwares :
//   defects       nombre de tags négatifs quand il est offert à la création (1 par défaut)
//   cosmetic      fashionware : offert hors slot et sans défaut à la création
// Objets (achats de la création seulement, rien ne s'applique ensuite) :
//   price         prix en Cred (absent = pas achetable)
//   quantity      unités reçues pour ce prix (1 par défaut), ex. 3 grenades
//   negative_tags défaut à prendre parmi cette liste pour l'acheter à ce prix

export const ITEM_AND_CYBERWARE_CATEGORY_LABEL = {
    arme_feu:     'Armes à feu',
    grenade:      'Grenades',
    arme_blanche: 'Armes blanches',
    protection:   'Protection',
    equipement:   'Équipement',
    vehicule:     'Véhicules',
    drone:        'Drones',
    // Catégories Cyberware
    neural:       'Système Neural',
    armement:     'Cyber-armement',
    survie:       'Survie & Bioware',
    infiltration: 'Infiltration',
    membres:      'Membres Cyber',
    physique:     'Physique & Greffes',
    sensoriel:    'Capteurs & Optiques',
    social:       'Social & Cosmétique',
    netrunning:   'Netrunning',
    technique:    'Interface Technique',
    // Catégorie Objets
    chip:         'Chips',
};
