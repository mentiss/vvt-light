// src/client/src/features/genmap/tools/engine/grid.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Grille, cases, formes (rectangle ou L), contrôle de largeur du couloir.

import engine from '../../data/engine.json';

export const SIDES    = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
export const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' };
export const OUTSIDE  = 'outside';
export const CORRIDOR = 'corridor';

// Couloir principal ou dégagement isolé (« corridor-2 »…)
export const isCorridor = (id) => typeof id === 'string' && (id === CORRIDOR || id.startsWith(`${CORRIDOR}-`));

// ── Grille ───────────────────────────────────────────────────────────────────
// Une case appartient à un propriétaire : id de pièce, de lien vertical, CORRIDOR,
// OUTSIDE (case retirée du bâtiment en contour libre), ou null (libre).

export const createGrid = (width, length) => ({ width, length, owner: new Array(width * length).fill(null) });
export const inside     = (g, x, y) => x >= 0 && y >= 0 && x < g.width && y < g.length;
export const ownerAt    = (g, x, y) => (inside(g, x, y) ? g.owner[y * g.width + x] : OUTSIDE);
export const setOwner   = (g, x, y, id) => { g.owner[y * g.width + x] = id; };
export const isFree     = (g, x, y) => inside(g, x, y) && g.owner[y * g.width + x] === null;
export const around     = (x, y) => Object.entries(SIDES).map(([side, [dx, dy]]) => ({ x: x + dx, y: y + dy, side }));
export const flipEdge   = ({ x, y, side }) => ({ x: x + SIDES[side][0], y: y + SIDES[side][1], side: OPPOSITE[side] });
export const touchesOutside = (g, x, y) => around(x, y).some(n => ownerAt(g, n.x, n.y) === OUTSIDE);
export const cellKey    = ([x, y]) => `${x},${y}`;

export const rectCells = (x, y, w, h) => {
    const cells = [];
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) cells.push([i, j]);
    return cells;
};

export const cellsOf = (g, id) => {
    const cells = [];
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g.width; x++) if (ownerAt(g, x, y) === id) cells.push([x, y]);
    return cells;
};

export const cellsWhere = (g, test) => {
    const cells = [];
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g.width; x++) if (test(ownerAt(g, x, y))) cells.push([x, y]);
    return cells;
};

export const bounds = (cells) => {
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    return { x: x0, y: y0, w: Math.max(...xs) - x0 + 1, h: Math.max(...ys) - y0 + 1 };
};

export const ratioOf = (w, h) => Math.max(w, h) / Math.min(w, h);
export const rectCentre = (r) => [r.x + r.w / 2, r.y + r.h / 2];

// Composantes connexes (4-voisinage) d'un ensemble de cases
export const regionsOf = (cells) => {
    const left = new Map(cells.map(c => [cellKey(c), c]));
    const regions = [];
    for (const start of cells) {
        if (!left.has(cellKey(start))) continue;
        const region = [];
        const stack = [start];
        left.delete(cellKey(start));
        while (stack.length) {
            const [x, y] = stack.pop();
            region.push([x, y]);
            for (const n of around(x, y)) {
                const k = `${n.x},${n.y}`;
                if (left.has(k)) { stack.push(left.get(k)); left.delete(k); }
            }
        }
        regions.push(region);
    }
    return regions;
};

// Formes w×h dont la surface est comprise entre minArea et maxArea, dans la limite de ratio
export const shapesFor = (minArea, maxArea, maxRatio, minSide = 1) => {
    const shapes = [];
    for (let w = minSide; w <= maxArea; w++) {
        for (let h = minSide; w * h <= maxArea; h++) {
            if (w * h >= minArea && ratioOf(w, h) <= maxRatio) shapes.push([w, h]);
        }
    }
    return shapes;
};

// Le rectangle tient sur des cases libres, à `clearance` cases de toute case réservée
export const rectFits = (g, x, y, w, h, clearance) => {
    if (x < 0 || y < 0 || x + w > g.width || y + h > g.length) return false;
    for (let j = y - clearance; j < y + h + clearance; j++) {
        for (let i = x - clearance; i < x + w + clearance; i++) {
            if (inside(g, i, j) && ownerAt(g, i, j) !== null) return false;
        }
    }
    return true;
};

// Le rectangle touche la façade d'entrée
export const touchesFacade = (g, facade, x, y, w, h) => (
    (facade === 'n' && y === 0) || (facade === 's' && y + h === g.length)
    || (facade === 'w' && x === 0) || (facade === 'e' && x + w === g.width)
);

// Forme d'une pièce (§12, R-7) : rectangle, ou L = rectangle englobant amputé d'un
// rectangle dans un angle, branches et décrochement d'au moins `arm` cases (`minArm` par défaut ;
// 1 pour une petite annexe née d'un reste, §31).
export const shapeKind = (cells, arm = engine.minArm) => {
    const b = bounds(cells);
    if (cells.length === b.w * b.h) return 'rect';
    const set = new Set(cells.map(cellKey));
    const missing = rectCells(b.x, b.y, b.w, b.h).filter(c => !set.has(cellKey(c)));
    const m = bounds(missing);
    if (missing.length !== m.w * m.h) return null;
    const inCorner = (m.x === b.x || m.x + m.w === b.x + b.w) && (m.y === b.y || m.y + m.h === b.y + b.h);
    if (!inCorner || m.w < arm || m.h < arm || b.w - m.w < arm || b.h - m.h < arm) return null;
    return 'L';
};

// Bâtiment rond (§40.1, CE-2) : cases hors du disque (`g.clip`). Une pièce est un rectangle ou un L
// rogné par le disque : sa forme se lit avec les cases rognées de son rectangle englobant.
export const isClip = (g, x, y) => Boolean(g?.clip?.has(`${x},${y}`));
export const withClip = (g, cells) => {
    if (!g?.clip?.size || !cells.length) return cells;
    const b = bounds(cells);
    return [...cells, ...rectCells(b.x, b.y, b.w, b.h).filter(([x, y]) => g.clip.has(`${x},${y}`))];
};

// `overflow` : dépassement toléré de sizeMax (fraction), réservé aux restes (§19) ; `g` : grille,
// pour les cases rognées d'un bâtiment rond
export const shapeIsValid = (room, cells, overflow = 0, g = null) => {
    const b = bounds(cells);
    return cells.length >= room.sizeMin && cells.length <= Math.floor(room.sizeMax * (1 + overflow))
        && ratioOf(b.w, b.h) <= room.maxRatio
        && shapeKind(withClip(g, cells)) !== null;
};

// Cases qu'une pièce hôte peut céder à une annexe (§32) : un rectangle pris dans l'hôte, ajouté aux
// cases `base` (un reste isolé à compléter) s'il y en a. L'hôte doit l'accepter (`canShrink`) et
// garder sa forme, ses proportions et au moins `shrinkComfort` de sa plage de taille ; `keeps`
// vérifie ses autres contacts (réseau, extérieur). L'annexe obtenue a la taille, les proportions et
// la forme de son type (marche d'une case admise pour un reste complété). Candidats du moins
// coûteux au plus coûteux : le moins de cases prises, hors du côté du réseau (`onNetwork`).
export const shrinkCandidates = (g, host, type, base, keeps, onNetwork) => {
    if (!host.canShrink) return [];
    const hostCells = cellsOf(g, host.id);
    const spare = hostCells.length - (host.sizeMin + (host.sizeMax - host.sizeMin) * engine.shrinkComfort);
    if (spare < 1) return [];
    const own = new Set([...hostCells, ...base].map(cellKey));
    const baseKeys = new Set(base.map(cellKey));
    const maxRatio = Math.max(type.ratioMax, 1 / type.ratioMin);
    const area = bounds([...hostCells, ...base]);
    const found = [];
    for (let h = 1; h <= area.h; h++) for (let w = 1; w <= area.w; w++) {
        for (let y = area.y; y + h <= area.y + area.h; y++) for (let x = area.x; x + w <= area.x + area.w; x++) {
            const rect = rectCells(x, y, w, h);
            if (!rect.every(c => own.has(cellKey(c)))) continue;
            const taken = rect.filter(c => !baseKeys.has(cellKey(c)));
            if (!taken.length || taken.length > spare) continue;
            const takenKeys = new Set(taken.map(cellKey));
            const cells = [...base, ...taken];
            const b = bounds(cells);
            if (cells.length < type.sizeMin || cells.length > type.sizeMax || ratioOf(b.w, b.h) > maxRatio) continue;
            if (!shapeKind(cells, base.length ? 1 : engine.minArm)) continue;
            const left = hostCells.filter(c => !takenKeys.has(cellKey(c)));
            const lb = bounds(left);
            if (!shapeKind(left) || ratioOf(lb.w, lb.h) > host.maxRatio || !keeps(left)) continue;
            found.push({ cells, cost: taken.length + (onNetwork(taken) ? 100 : 0) });
        }
    }
    return found.sort((a, b) => a.cost - b.cost);
};

// Un carré de (max + 1) cases de côté entièrement en couloir : couloir trop large
export const tooWide = (g, max) => {
    const k = max + 1;
    for (let y = 0; y + k <= g.length; y++) {
        for (let x = 0; x + k <= g.width; x++) {
            if (rectCells(x, y, k, k).every(([i, j]) => isCorridor(ownerAt(g, i, j)))) return true;
        }
    }
    return false;
};
