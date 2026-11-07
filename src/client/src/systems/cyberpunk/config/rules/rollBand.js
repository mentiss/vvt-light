// src/client/src/systems/cyberpunk/config/rules/rollBand.js
// ─────────────────────────────────────────────────────────────────────────────
// Bande du résultat 9- / 10-14 / 15+ (spec_cyberpunk.md §5) : fonctions pures.
// Une case par total de 2 à 23 (2d10 + modificateurs usuels) : 8 cases d'échec,
// 5 de succès partiel, 9 de succès plein ; au-delà, le repère reste au bord.
// Seuils : règles §1.2 (15+ plein, 10-14 partiel, 9- échec). Ré-exporté par config.jsx.
// ─────────────────────────────────────────────────────────────────────────────

export const BAND_MIN = 2;
export const BAND_MAX = 23;

/** Zones dans l'ordre d'affichage ; `cells` = largeur relative. */
export const BAND_ZONES = [
    { outcome: 'failure', label: 'Échec',          range: '9-',    from: BAND_MIN, to: 9,        cells: 8 },
    { outcome: 'partial', label: 'Succès partiel', range: '10-14', from: 10,       to: 14,       cells: 5 },
    { outcome: 'success', label: 'Succès plein',   range: '15+',   from: 15,       to: BAND_MAX, cells: 9 },
];

/** Position du repère (0-100 %) : centre de la case du total, borné à la bande. */
export function bandPosition(total) {
    const n = Number.isFinite(total) ? Math.min(BAND_MAX, Math.max(BAND_MIN, Math.round(total))) : BAND_MIN;
    const cells = BAND_MAX - BAND_MIN + 1;
    return ((n - BAND_MIN + 0.5) / cells) * 100;
}
