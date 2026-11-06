// src/client/src/systems/maledictum/config/rules/tables.js
// ─────────────────────────────────────────────────────────────────────────────
// Lecture des tables du livre (config/tables.js) : une valeur de dé → l'entrée.
//   lookupTable('critical', 1d10 + excès, 'left_arm') → Blessure critique du bras
//   lookupTable('fumble', 1d10)  ·  lookupTable('mutation' | 'malignancy' | 'perils' | 'phenomena', d100)
// Une valeur au-delà de la dernière plage prend la dernière entrée (ex. 15+ : mort).
// ─────────────────────────────────────────────────────────────────────────────

import { CRITICAL_WOUNDS, FUMBLES, MUTATIONS, MALIGNANCIES, PERILS, PSYCHIC_PHENOMENA } from '../tables.js';

const CRITICAL_TABLE_BY_LOCATION = {
    head: 'head', left_arm: 'arm', right_arm: 'arm', body: 'body', left_leg: 'leg', right_leg: 'leg',
};

export const TABLE_LABELS = {
    critical: 'Blessure critique', fumble: 'Maladresse', mutation: 'Mutation', malignancy: 'Malignité',
    perils: 'Périls du Warp', phenomena: 'Phénomène psychique',
};

const tableFor = (key, location) => {
    switch (key) {
    case 'critical':   return CRITICAL_WOUNDS?.[CRITICAL_TABLE_BY_LOCATION[location] ?? 'body'] ?? [];
    case 'fumble':     return FUMBLES ?? [];
    case 'mutation':   return MUTATIONS ?? [];
    case 'malignancy': return MALIGNANCIES ?? [];
    case 'perils':     return PERILS ?? [];
    case 'phenomena':  return PSYCHIC_PHENOMENA ?? [];
    default:           return [];
    }
};

export const lookupTable = (key, value, location) => {
    const rows = tableFor(key, location).filter(r => Number.isFinite(Number(r.min)));
    if (!rows.length) return null;
    const v = Number(value);
    const hit = rows.find(r => v >= r.min && v <= (r.max ?? Infinity));
    if (hit) return hit;
    const sorted = [...rows].sort((a, b) => a.min - b.min);
    return v < sorted[0].min ? sorted[0] : sorted[sorted.length - 1];
};
