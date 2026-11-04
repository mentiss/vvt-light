// src/client/src/systems/vileborn/config/approaches.js
// Les six approches (kit p. 31-32) et les cinq états (fiche de personnage).
// `field` : colonne du personnage (camelCase côté client).

export const APPROACHES = [
    { key: 'force',      field: 'dieForce',      label: 'Force',      text: 'S\'imposer violemment, se donner physiquement à fond.' },
    { key: 'will',       field: 'dieWill',       label: 'Volonté',    text: 'Mobiliser son énergie intérieure, dépasser ses limites.' },
    { key: 'influence',  field: 'dieInfluence',  label: 'Influence',  text: 'Le verbe et la persuasion : convaincre, séduire, commander, négocier.' },
    { key: 'reason',     field: 'dieReason',     label: 'Raison',     text: 'La logique, le savoir et l\'analyse.' },
    { key: 'precision',  field: 'diePrecision',  label: 'Précision',  text: 'La prudence et la minutie.' },
    { key: 'subterfuge', field: 'dieSubterfuge', label: 'Subterfuge', text: 'Ignorer volontairement les règles, porter des coups bas.' },
];

export const STATES = [
    { key: 'anger',      field: 'stateAnger',      label: 'Colère',      effect: '−1 aux tests de Raison, Précision et Subterfuge.', penalty: ['reason', 'precision', 'subterfuge'] },
    { key: 'exhaustion', field: 'stateExhaustion', label: 'Épuisement',  effect: '−1 aux tests de Force, Volonté et Influence.',    penalty: ['force', 'will', 'influence'] },
    { key: 'shame',      field: 'stateShame',      label: 'Honte',       effect: 'Vous ne pouvez pas utiliser votre personnalité.' },
    { key: 'fear',       field: 'stateFear',       label: 'Peur',        effect: 'Vous ne pouvez pas utiliser votre formation.' },
    { key: 'insecurity', field: 'stateInsecurity', label: 'Insécurité',  effect: 'Vous ne pouvez pas utiliser vos mobiles.' },
];

export const WOUNDS = [
    { field: 'wound1', note: 'wound1Note' },
    { field: 'wound2', note: 'wound2Note' },
    { field: 'wound3', note: 'wound3Note' },
];

export const DEFAULT_DUTY = 'Achever votre formation';
export const WORD_SLOTS = 5;   // cercles par côté du U sur la fiche
