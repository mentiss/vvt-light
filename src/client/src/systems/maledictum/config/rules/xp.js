// src/client/src/systems/maledictum/config/rules/xp.js
// ─────────────────────────────────────────────────────────────────────────────
// Coûts d'expérience (livre de base p.90, 102, 114 ; fonctions pures, testées).
//   Caractéristique : +1 par Avance, coût selon la NOUVELLE valeur (barème) ;
//   plafond humain 60.
//   Compétence et spécialisation : +5 par Avance, 4 Avances au plus ;
//   coût de la n-ième Avance : 50 × n (50, 100, 150, 200).
//   Talent : 100 XP ; pouvoir mineur : 60 XP ; pouvoir de discipline : 100 XP.
//   Création : 2 Avances au plus par compétence, 1 par spécialisation.
// ─────────────────────────────────────────────────────────────────────────────

export const CHAR_COSTS = [
    [25, 20], [30, 25], [35, 30], [40, 40], [45, 60], [50, 80], [55, 110], [60, 140], [65, 180], [70, 220], [75, 270], [80, 320],
];
export const SKILL_MAX_ADVANCES = 4;
export const CREATION_SKILL_MAX = 2;
export const CREATION_SPEC_MAX = 1;
export const TALENT_COST = 100;
export const MINOR_POWER_COST = 60;
export const POWER_COST = 100;

/** Coût d'une Avance de caractéristique qui porte la valeur à `newValue` */
export const charAdvanceCost = (newValue) => {
    const v = Number(newValue);
    const band = CHAR_COSTS.find(([max]) => v <= max);
    return band ? band[1] : null;   // au-delà de 80 : hors barème
};

/** Coût de l'Avance n° `next` (1 à 4) d'une compétence ou d'une spécialisation */
export const skillAdvanceCost = (next) => (next >= 1 && next <= SKILL_MAX_ADVANCES ? 50 * next : null);

/** Coût total pour passer de `from` à `to` Avances */
export const skillAdvancesCost = (from, to) => {
    let total = 0;
    for (let n = from + 1; n <= to; n++) total += skillAdvanceCost(n) ?? 0;
    return total;
};

export const powerCost = (power) => (power?.discipline === 'minor' ? MINOR_POWER_COST : POWER_COST);
