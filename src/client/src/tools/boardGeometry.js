// src/client/src/tools/boardGeometry.js
// ─────────────────────────────────────────────────────────────────────────────
// Géométrie du tableau (documentations/spec_tableau.md §10.1, §10.8), fonctions pures.
//
// Coordonnées en unités du tableau (le pixel de l'image de fond à l'échelle 1).
// Une vue est { x, y, scale } : (x, y) est le point du tableau affiché en haut à
// gauche, scale le nombre de pixels d'écran par unité. Chacun a la sienne (Q-8).
// ─────────────────────────────────────────────────────────────────────────────

export const MIN_SCALE = 0.05;
export const MAX_SCALE = 8;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Point de l'écran (relatif au coin du tableau affiché) → point du tableau */
export const screenToBoard = (view, px, py) => ({ x: view.x + px / view.scale, y: view.y + py / view.scale });

/** Zoom de facteur `factor` autour du point d'écran (px, py), qui reste sous le pointeur */
export function zoomAt(view, factor, px, py) {
    const scale = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
    const anchor = screenToBoard(view, px, py);
    return { x: anchor.x - px / scale, y: anchor.y - py / scale, scale };
}

/** Vue qui montre toute la boîte dans un cadre de width × height (marge de 5 %) */
export function fitView(box, width, height) {
    if (!box || box.w <= 0 || box.h <= 0 || width <= 0 || height <= 0) return { x: 0, y: 0, scale: 1 };
    const scale = clamp(Math.min(width / box.w, height / box.h) * 0.95, MIN_SCALE, MAX_SCALE);
    return { x: box.x + box.w / 2 - width / (2 * scale), y: box.y + box.h / 2 - height / (2 * scale), scale };
}

/** Boîte englobante d'un tracé [x1, y1, x2, y2, …] */
export function pointsBox(points) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]); maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]); maxY = Math.max(maxY, points[i + 1]);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Boîte englobante d'objets { x, y, w, h } ; null s'il n'y en a pas */
export function itemsBox(items) {
    if (items.length === 0) return null;
    const minX = Math.min(...items.map(i => i.x));
    const minY = Math.min(...items.map(i => i.y));
    const maxX = Math.max(...items.map(i => i.x + i.w));
    const maxY = Math.max(...items.map(i => i.y + i.h));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Rectangle normalisé entre deux points (largeur et hauteur positives) */
export const rectBetween = (a, b) => ({
    x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y),
});

/** Distance d'un point au segment [a, b] */
function segmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const length2 = dx * dx + dy * dy;
    const t = length2 === 0 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / length2, 0, 1);
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Simplification d'un tracé (Ramer-Douglas-Peucker) : garde les points qui
 * s'écartent de plus de `tolerance` de la ligne droite.
 * @param {number[]} points [x1, y1, x2, y2, …]
 * @returns {number[]} même forme, extrémités gardées
 */
export function simplifyPoints(points, tolerance = 1) {
    const count = points.length / 2;
    if (count <= 2) return points.slice();
    const keep = new Array(count).fill(false);
    keep[0] = keep[count - 1] = true;
    const stack = [[0, count - 1]];
    while (stack.length > 0) {
        const [first, last] = stack.pop();
        let maxDistance = 0, index = -1;
        for (let i = first + 1; i < last; i++) {
            const d = segmentDistance(points[2 * i], points[2 * i + 1],
                points[2 * first], points[2 * first + 1], points[2 * last], points[2 * last + 1]);
            if (d > maxDistance) { maxDistance = d; index = i; }
        }
        if (index !== -1 && maxDistance > tolerance) {
            keep[index] = true;
            stack.push([first, index], [index, last]);
        }
    }
    return points.filter((_, i) => keep[Math.floor(i / 2)]);
}

/** Le point (x, y) touche-t-il le tracé, à `radius` près ? (gomme) */
export function hitsStroke(points, width, x, y, radius) {
    const reach = radius + width / 2;
    if (points.length === 2) return Math.hypot(x - points[0], y - points[1]) <= reach;
    for (let i = 0; i + 3 < points.length; i += 2) {
        if (segmentDistance(x, y, points[i], points[i + 1], points[i + 2], points[i + 3]) <= reach) return true;
    }
    return false;
}

/** Initiales d'un nom (« Bjorn Sigurdsson » → « BS ») */
export function initials(name) {
    const words = String(name ?? '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]).toUpperCase();
}
