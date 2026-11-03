// src/client/src/systems/woddavampire/config/chronicle.js
// ─────────────────────────────────────────────────────────────────────────────
// Paramètres de chronique (spec_woddavampire.md §2 et §II.1) : constantes du
// slug. Un slug dérivé (autre décor) ne change que ce fichier et le style.
// ─────────────────────────────────────────────────────────────────────────────

export const CHRONICLE = {
    startingGeneration: 12,        // Génération de départ (12ᵉ iso)
    generationFloor:    4,         // plancher de l'Historique Génération
    flawCap:            7,         // plafond des Handicaps (5, 7 ou 10)
    literacyAssumed:    false,     // false : « Lettré » est un Atout ; true : « Illettré » est un Handicap
    // Lignées autorisées : null = toutes les lignées jouables (décision P-4)
    allowedBloodlines:  null,
    // Règle maison du MJ (§15.4) : Disciplines prenables par tous à la création,
    // avec les points de départ comme avec les points bonus
    commonDisciplines:  ['celerity', 'auspex', 'potence'],
    // Les 1 (§3.1) : false = règle maison, les 1 n'annulent rien (ils ne comptent que pour
    // l'échec critique) ; true = règle du livre, chaque 1 annule un succès lancé
    onesCancelSuccesses: true,
};

// Budgets de création (§5.1, §5.2) : uniques, ceux du livre
export const CREATION_BUDGET = {
    attributePriorities: [7, 5, 3],
    abilityPriorities:   [13, 9, 5],
    abilityMaxAtCreation: 3,
    attributeMax:        5,
    disciplines:         4,
    backgrounds:         5,
    virtues:             7,
    bonusPoints:         15,
};

// Coût en points bonus par point (§5.2)
export const BONUS_COSTS = {
    attribute:  5,
    ability:    2,
    discipline: 7,
    secondaryPath: 4,
    background: 1,
    virtue:     2,
    road:       2,
    willpower:  1,
    // rituel : son niveau (calculé)
};
