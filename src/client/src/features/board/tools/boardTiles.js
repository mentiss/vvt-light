// src/client/src/features/board/tools/boardTiles.js
// ─────────────────────────────────────────────────────────────────────────────
// Carte en tuiles d'une diapositive carte (documentations/plateforme/spec_tableau.md
// §17.1, §17.4), fonctions pures. Une unité du tableau = un pixel de l'original.
// Niveau z : image réduite d'un facteur 2^(levels - 1 - z) ; niveau 0 = toute la carte
// dans une tuile, niveau levels - 1 = pleine résolution. Tuiles du bord plus petites.
// ─────────────────────────────────────────────────────────────────────────────

/** Taille de l'image au niveau z, en pixels de ce niveau */
function levelSize(map, z) {
    const factor = 2 ** (map.levels - 1 - z);
    return { width: Math.ceil(map.width / factor), height: Math.ceil(map.height / factor) };
}

/**
 * Niveau à afficher : le plus petit dont la résolution couvre l'écran, borné au plus détaillé.
 * @param {{ levels: number }} map
 * @param {number} scale  zoom de la vue (pixels d'écran par unité du tableau)
 * @param {number} [pixelRatio] densité de l'écran (window.devicePixelRatio)
 */
export function mapLevel(map, scale, pixelRatio = 1) {
    const top = map.levels - 1;
    const wanted = top + Math.ceil(Math.log2(scale * pixelRatio) - 1e-9);
    return Math.max(0, Math.min(top, wanted));
}

/**
 * Tuiles du niveau z qui touchent la vue, avec leur boîte en unités du tableau.
 * @param {{ width: number, height: number, tileSize: number, levels: number }} map
 * @param {number} z
 * @param {{ x: number, y: number, scale: number }} view coin haut gauche et zoom
 * @param {{ width: number, height: number }} viewport taille du cadre, en pixels d'écran
 * @returns {{ x: number, y: number, box: { x: number, y: number, w: number, h: number } }[]}
 */
export function visibleTiles(map, z, view, viewport) {
    const level = levelSize(map, z);
    const rx = map.width / level.width;     // unités du tableau par pixel du niveau
    const ry = map.height / level.height;
    const cols = Math.ceil(level.width / map.tileSize);
    const rows = Math.ceil(level.height / map.tileSize);
    const tileW = map.tileSize * rx;
    const tileH = map.tileSize * ry;
    const x0 = view.x;
    const y0 = view.y;
    const x1 = view.x + viewport.width / view.scale;
    const y1 = view.y + viewport.height / view.scale;
    if (x1 <= 0 || y1 <= 0 || x0 >= map.width || y0 >= map.height) return [];

    const first = { x: Math.max(0, Math.floor(x0 / tileW)), y: Math.max(0, Math.floor(y0 / tileH)) };
    const last = { x: Math.min(cols - 1, Math.floor(x1 / tileW)), y: Math.min(rows - 1, Math.floor(y1 / tileH)) };
    const tiles = [];
    for (let x = first.x; x <= last.x; x++) {
        for (let y = first.y; y <= last.y; y++) {
            const w = Math.min(map.tileSize, level.width - x * map.tileSize) * rx;
            const h = Math.min(map.tileSize, level.height - y * map.tileSize) * ry;
            tiles.push({ x, y, box: { x: x * tileW, y: y * tileH, w, h } });
        }
    }
    return tiles;
}

/** Adresse d'une tuile, servie sans connexion ; la version déjoue le cache d'une carte renvoyée */
export const tileUrl = (map, z, x, y) =>
    `/board-maps/${map.name}/${z}/${x}_${y}.webp?v=${encodeURIComponent(map.version)}`;
