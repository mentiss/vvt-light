// src/client/src/features/board/tools/boardGrid.js
// ─────────────────────────────────────────────────────────────────────────────
// Grille et règle du tableau (documentations/spec_tableau.md §10.3), fonctions pures.
// Cascade (Q-43) : plateforme → slug (config.jsx : board.grid) → table → diapositive ;
// un niveau à null reprend le précédent. La taille d'une case (en unités du tableau)
// est propre à la diapositive.
// ─────────────────────────────────────────────────────────────────────────────

export const GRID_UNITS = [{ id: 'm', label: 'm' }, { id: 'ft', label: 'ft' }];
export const PLATFORM_GRID = { value: 1.5, unit: 'm' };

const pick = (level, key) => (level && level[key] !== null && level[key] !== undefined ? level[key] : undefined);

/**
 * Valeur et unité d'une case, du niveau le plus précis au plus général.
 * @param {...({ value?: number|null, unit?: string|null }|null|undefined)} levels slug, table, diapositive
 * @returns {{ value: number, unit: string }}
 */
export function resolveGrid(...levels) {
    let { value, unit } = PLATFORM_GRID;
    for (const level of levels) {
        value = pick(level, 'value') ?? value;
        unit = pick(level, 'unit') ?? unit;
    }
    return { value, unit };
}

/** Distance entre deux points du tableau, en unités de jeu (valeur × nombre de cases) */
export const measure = (a, b, gridSize, value) => (Math.hypot(b.x - a.x, b.y - a.y) / gridSize) * value;

/** « 4,5 m », « 15 ft » : arrondi au dixième, virgule décimale */
export const formatDistance = (distance, unit) =>
    `${(Math.round(distance * 10) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ${unit}`;
