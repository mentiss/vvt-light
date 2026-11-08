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

/**
 * Geste à deux doigts (spec_tableau.md §12.2) : l'écart des doigts zoome, le déplacement
 * de leur milieu déplace la vue. Le point du tableau pris sous le milieu au départ reste
 * sous le milieu courant.
 * @param {object} view vue au début du geste
 * @param {{px, py}} a0 premier doigt au départ
 * @param {{px, py}} b0 second doigt au départ
 * @param {{px, py}} a  premier doigt maintenant
 * @param {{px, py}} b  second doigt maintenant
 */
export function pinchView(view, a0, b0, a, b) {
    const startDistance = Math.hypot(b0.px - a0.px, b0.py - a0.py) || 1;
    const scale = clamp(view.scale * Math.hypot(b.px - a.px, b.py - a.py) / startDistance, MIN_SCALE, MAX_SCALE);
    const anchor = screenToBoard(view, (a0.px + b0.px) / 2, (a0.py + b0.py) / 2);
    const mid = { px: (a.px + b.px) / 2, py: (a.py + b.py) / 2 };
    return { x: anchor.x - mid.px / scale, y: anchor.y - mid.py / scale, scale };
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

/** Rectangle entre deux points, carré si `square` (Maj, §13.1) : le côté suit le plus grand écart */
export function shapeBetween(a, b, square = false) {
    if (!square) return rectBetween(a, b);
    const side = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    return rectBetween(a, { x: a.x + Math.sign(b.x - a.x || 1) * side, y: a.y + Math.sign(b.y - a.y || 1) * side });
}

/** Angle arrondi au pas (degrés), ramené dans [0, 360[ */
export const snapAngle = (degrees, step = 15) => (((Math.round(degrees / step) * step) % 360) + 360) % 360;

/** Fin de ligne : `to`, ou orientée par pas de 15° depuis `from` à la même longueur (Maj) */
export function lineEnd(from, to, snap = false) {
    if (!snap) return to;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const angle = snapAngle(Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI) * Math.PI / 180;
    return { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length };
}

/** Angle (degrés, sens horaire, 0 vers le haut) du point vu depuis le centre : poignée de rotation */
export const angleFrom = (center, point) => (((Math.atan2(point.x - center.x, center.y - point.y) * 180 / Math.PI) % 360) + 360) % 360;

/**
 * Le point (x, y) est-il dans la boîte de l'objet, tournée de `rotation` degrés autour
 * de son centre, à `radius` près ? (on ramène le point dans le repère de l'objet)
 */
export function hitsBox(item, x, y, radius = 0) {
    const cx = item.x + item.w / 2, cy = item.y + item.h / 2;
    const a = -(item.rotation ?? 0) * Math.PI / 180;
    const dx = x - cx, dy = y - cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(lx) <= item.w / 2 + radius && Math.abs(ly) <= item.h / 2 + radius;
}

/**
 * L'objet est-il entièrement dans le rectangle ? (rectangle de sélection, PC-3) : les quatre
 * coins de sa boîte, tournée avec lui ; un tracé par ses points.
 */
export function itemInRect(item, rect) {
    const inside = (x, y) => x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    if (Array.isArray(item.data?.points) && (item.kind === 'stroke' || item.kind === 'line')) {
        const b = pointsBox(item.data.points);
        return inside(b.x, b.y) && inside(b.x + b.w, b.y + b.h);
    }
    const cx = item.x + item.w / 2, cy = item.y + item.h / 2;
    const a = (item.rotation ?? 0) * Math.PI / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(([sx, sy]) => {
        const dx = sx * item.w / 2, dy = sy * item.h / 2;
        return inside(cx + dx * cos - dy * sin, cy + dx * sin + dy * cos);
    });
}

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
