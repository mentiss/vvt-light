// src/client/src/genmap/generate.js
// ─────────────────────────────────────────────────────────────────────────────
// Moteur du générateur de plans (spec_genmap.md §6, §11 à §18). JavaScript pur,
// sans React : à programme, paramètres et graine identiques, le plan est identique.
// Avant les tentatives : pièces de complément piochées dans le réservoir du preset (§18.1).
// Ordre (§6.1, §13, §18.2) : enveloppe, entrée, couloir du schéma de circulation s'il y en a
// un, liens verticaux et pièces structurantes, pièces prioritaires, couloirs qui les relient,
// autres pièces dans l'espace restant, élagage des culs-de-sac, portes.
// Le réseau de circulation = couloirs + pièces ouvertes (`circulation`) : pas de
// mur ni de porte entre eux, les pièces fermées y ouvrent.
// Prototype P0 : seul le rez-de-chaussée est généré.
// Réglages (tentatives, densités…) dans data/engine.json : aucune valeur de jeu ici.
// ─────────────────────────────────────────────────────────────────────────────

import engine from './data/engine.json';

const SIDES    = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' };
export const OUTSIDE  = 'outside';
export const CORRIDOR = 'corridor';

// Couloir principal ou dégagement isolé (« corridor-2 »…)
export const isCorridor = (id) => typeof id === 'string' && (id === CORRIDOR || id.startsWith(`${CORRIDOR}-`));

// ── Hasard déterministe ──────────────────────────────────────────────────────

export const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const makeRandom = (seed) => {
    const next = mulberry32(seed);
    return {
        next,
        int:  (min, max) => min + Math.floor(next() * (max - min + 1)),
        pick: (items) => items[Math.floor(next() * items.length)],
    };
};

// ── Grille ───────────────────────────────────────────────────────────────────
// Une case appartient à un propriétaire : id de pièce, de lien vertical, CORRIDOR,
// OUTSIDE (case retirée du bâtiment en contour libre), ou null (libre).

const createGrid = (width, length) => ({ width, length, owner: new Array(width * length).fill(null) });
const inside     = (g, x, y) => x >= 0 && y >= 0 && x < g.width && y < g.length;
const ownerAt    = (g, x, y) => (inside(g, x, y) ? g.owner[y * g.width + x] : OUTSIDE);
const setOwner   = (g, x, y, id) => { g.owner[y * g.width + x] = id; };
const isFree     = (g, x, y) => inside(g, x, y) && g.owner[y * g.width + x] === null;
const around     = (x, y) => Object.entries(SIDES).map(([side, [dx, dy]]) => ({ x: x + dx, y: y + dy, side }));
const flipEdge   = ({ x, y, side }) => ({ x: x + SIDES[side][0], y: y + SIDES[side][1], side: OPPOSITE[side] });
const touchesOutside = (g, x, y) => around(x, y).some(n => ownerAt(g, n.x, n.y) === OUTSIDE);
const cellKey    = ([x, y]) => `${x},${y}`;

const rectCells = (x, y, w, h) => {
    const cells = [];
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) cells.push([i, j]);
    return cells;
};

const cellsOf = (g, id) => {
    const cells = [];
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g.width; x++) if (ownerAt(g, x, y) === id) cells.push([x, y]);
    return cells;
};

const cellsWhere = (g, test) => {
    const cells = [];
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g.width; x++) if (test(ownerAt(g, x, y))) cells.push([x, y]);
    return cells;
};

const bounds = (cells) => {
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    return { x: x0, y: y0, w: Math.max(...xs) - x0 + 1, h: Math.max(...ys) - y0 + 1 };
};

const ratioOf = (w, h) => Math.max(w, h) / Math.min(w, h);

// Composantes connexes (4-voisinage) d'un ensemble de cases
const regionsOf = (cells) => {
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
const shapesFor = (minArea, maxArea, maxRatio, minSide = 1) => {
    const shapes = [];
    for (let w = minSide; w <= maxArea; w++) {
        for (let h = minSide; w * h <= maxArea; h++) {
            if (w * h >= minArea && ratioOf(w, h) <= maxRatio) shapes.push([w, h]);
        }
    }
    return shapes;
};

// Le rectangle tient sur des cases libres, à `clearance` cases de toute case réservée
const rectFits = (g, x, y, w, h, clearance) => {
    if (x < 0 || y < 0 || x + w > g.width || y + h > g.length) return false;
    for (let j = y - clearance; j < y + h + clearance; j++) {
        for (let i = x - clearance; i < x + w + clearance; i++) {
            if (inside(g, i, j) && ownerAt(g, i, j) !== null) return false;
        }
    }
    return true;
};

// Le rectangle touche la façade d'entrée
const touchesFacade = (g, facade, x, y, w, h) => (
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

// `overflow` : dépassement toléré de sizeMax (fraction), réservé aux restes (§19)
const shapeIsValid = (room, cells, overflow = 0) => {
    const b = bounds(cells);
    return cells.length >= room.sizeMin && cells.length <= Math.floor(room.sizeMax * (1 + overflow))
        && ratioOf(b.w, b.h) <= room.maxRatio
        && shapeKind(cells) !== null;
};

// Cases qu'une pièce hôte peut céder à une annexe (§32) : un rectangle pris dans l'hôte, ajouté aux
// cases `base` (un reste isolé à compléter) s'il y en a. L'hôte doit l'accepter (`canShrink`) et
// garder sa forme, ses proportions et au moins `shrinkComfort` de sa plage de taille ; `keeps`
// vérifie ses autres contacts (réseau, extérieur). L'annexe obtenue a la taille, les proportions et
// la forme de son type (marche d'une case admise pour un reste complété). Candidats du moins
// coûteux au plus coûteux : le moins de cases prises, hors du côté du réseau (`onNetwork`).
const shrinkCandidates = (g, host, type, base, keeps, onNetwork) => {
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
const tooWide = (g, max) => {
    const k = max + 1;
    for (let y = 0; y + k <= g.length; y++) {
        for (let x = 0; x + k <= g.width; x++) {
            if (rectCells(x, y, k, k).every(([i, j]) => isCorridor(ownerAt(g, i, j)))) return true;
        }
    }
    return false;
};

// ── File de priorité (tas binaire) ───────────────────────────────────────────

const createHeap = () => {
    const items = [];
    const swap = (i, j) => { [items[i], items[j]] = [items[j], items[i]]; };
    return {
        get size() { return items.length; },
        push(item) {
            items.push(item);
            let i = items.length - 1;
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (items[parent].cost <= items[i].cost) break;
                swap(parent, i);
                i = parent;
            }
        },
        pop() {
            const top = items[0];
            const last = items.pop();
            if (items.length) {
                items[0] = last;
                let i = 0;
                for (;;) {
                    const l = 2 * i + 1, r = l + 1;
                    let m = i;
                    if (l < items.length && items[l].cost < items[m].cost) m = l;
                    if (r < items.length && items[r].cost < items[m].cost) m = r;
                    if (m === i) break;
                    swap(m, i);
                    i = m;
                }
            }
            return top;
        },
    };
};

// ── Programme ────────────────────────────────────────────────────────────────

// Preset (types référencés par id) → programme (types complets) et paramètres. Le programme
// porte aussi le réservoir de pièces de complément et le schéma de circulation (§18), en option.
export const resolvePreset = (preset, roomTypes) => {
    // Une entrée de preset peut surcharger des propriétés du type, ex. son étage (§20, E2-8)
    const resolve = ({ type, ...overrides }) => ({ ...roomTypes.find(t => t.id === type), ...overrides });
    return {
        params: { ...preset.params },
        program: {
            rooms: preset.rooms.map(resolve),
            optionalRooms: (preset.optionalRooms ?? []).map(resolve),
            verticalLinks: preset.verticalLinks.map(link => ({ ...link })),
            layout: preset.layout ?? null,
            layoutByLevel: preset.layoutByLevel ?? null,
            // Types possibles pour les petits restes isolés (§29, §31) : annexes (accès obligatoire
            // à une pièce, circulation interdite : dressing, salle d'eau attenante, cellier…), et le
            // débarras par défaut
            closetType: roomTypes.find(t => t.id === 'closet') ?? null,
            spaceAnnexTypes: roomTypes.filter(t => t.id !== 'closet' && t.access.required.length && t.circulationAccess === 'forbidden'),
        },
    };
};

const quantityRange = (entry) => (Array.isArray(entry.quantity) ? entry.quantity : [entry.quantity ?? 1, entry.quantity ?? 1]);

const levelsOf = (params) => [
    ...(params.basement ? [-1] : []),
    0,
    ...Array.from({ length: params.floors }, (_, i) => i + 1),
];

// Étage d'une pièce ou d'une extrémité de lien : imposé, ou tiré par la graine (§2.2)
const resolveLevel = (floor, params, rnd) => {
    const levels = levelsOf(params);
    const uppers = levels.filter(l => l > 0);
    if (floor === 'ground') return 0;
    if (floor === 'basement') return params.basement ? -1 : null;
    if (floor === 'upper') return uppers.length ? rnd.pick(uppers) : null;
    if (floor === 'top') return Math.max(...levels);   // dernier étage (§34, CO-9)
    if (floor === 'any' || floor == null) return rnd.pick(levels);
    const level = Number(floor);
    return levels.includes(level) ? level : null;
};

// ── Structurants ─────────────────────────────────────────────────────────────

// Pièce d'entrée : collée à la façade, jamais dans un angle
const placeEntrance = (g, room, facade, rnd) => {
    const horizontal = facade === 'n' || facade === 's';
    const along  = horizontal ? g.width : g.length;
    const across = horizontal ? g.length : g.width;
    const options = shapesFor(room.sizeMin, room.sizeMax, room.maxRatio, 2)
        .filter(([a, d]) => a <= along - 2 && d <= across - 3);
    if (!options.length) return null;

    const [a, d] = rnd.pick(options);
    const offset = rnd.int(1, along - a - 1);
    return {
        n: { x: offset, y: 0, w: a, h: d },
        s: { x: offset, y: g.length - d, w: a, h: d },
        w: { x: 0, y: offset, w: d, h: a },
        e: { x: g.width - d, y: offset, w: d, h: a },
    }[facade];
};

// Lien vertical ou pièce structurante : n'importe où sauf contre la façade, à distance des autres
// réservations. Avec `alongId` (couloir d'un schéma), de préférence contre ce couloir, qui ne
// compte pas dans la distance. `accept` : condition supplémentaire (escalier : paliers dans le
// bâtiment) ; `prefer` : note à maximiser parmi les positions retenues (§25, CN-3).
const placeStructural = (g, shapes, facade, rnd, alongId = null, accept = () => true, prefer = null) => {
    const options = [];
    for (const [w, h] of shapes) {
        for (let y = 0; y + h <= g.length; y++) {
            for (let x = 0; x + w <= g.width; x++) {
                if (touchesFacade(g, facade, x, y, w, h) || !rectFits(g, x, y, w, h, 0) || !accept({ x, y, w, h })) continue;
                let clear = true;
                for (let j = y - 1; j <= y + h && clear; j++) {
                    for (let i = x - 1; i <= x + w; i++) {
                        const o = inside(g, i, j) ? ownerAt(g, i, j) : null;
                        if (o !== null && o !== alongId) { clear = false; break; }
                    }
                }
                if (clear) options.push({ x, y, w, h });
            }
        }
    }
    const along = alongId ? options.filter(r => rectCells(r.x, r.y, r.w, r.h).some(([cx, cy]) => around(cx, cy).some(n => ownerAt(g, n.x, n.y) === alongId))) : [];
    let pool = along.length ? along : options;
    if (prefer && pool.length) {
        const best = Math.max(...pool.map(prefer));
        pool = pool.filter(r => prefer(r) >= best - 1);
    }
    return pool.length ? rnd.pick(pool) : null;
};

// ── Schémas de circulation (§18.2) ───────────────────────────────────────────

// Couloir du schéma, structurant : propriétaire provisoire SCHEME jusqu'à son raccordement
const SCHEME = 'scheme';

// Couloir traversant (`spine`, dans la longueur, pièces de part et d'autre, aligné sur l'entrée
// quand elle est sur un petit côté) ou galerie (`gallery`, contre le mur opposé à la façade).
// Seules les cases libres sont prises (le couloir s'arrête contre l'entrée). À l'étage, `toward`
// (palier de l'escalier) : le couloir traversant passe au plus près du palier (§25, CN-2).
// Renvoie false si le bâtiment est trop étroit pour le schéma.
const layScheme = (g, scheme, width, facade, entranceRect, rnd, toward = null) => {
    const horizontal = g.width >= g.length;              // couloir parallèle au grand côté
    const across = horizontal ? g.length : g.width;
    const depth = engine.schemeMinDepth;
    let from;
    if (scheme === 'gallery') {
        const back = OPPOSITE[facade];
        const vertical = back === 'e' || back === 'w';
        const span = vertical ? g.width : g.length;
        from = back === 'n' || back === 'w' ? 0 : span - width;
        const cells = vertical ? rectCells(from, 0, width, g.length) : rectCells(0, from, g.width, width);
        cells.filter(c => isFree(g, ...c)).forEach(c => setOwner(g, ...c, SCHEME));
        return true;
    }
    const min = depth, max = across - depth - width;
    if (max < min) return false;
    const onShortSide = horizontal ? facade === 'w' || facade === 'e' : facade === 'n' || facade === 's';
    const [e0, e1] = horizontal ? [entranceRect.y, entranceRect.y + entranceRect.h - width] : [entranceRect.x, entranceRect.x + entranceRect.w - width];
    const aligned = [];
    for (let p = Math.max(min, e0); p <= Math.min(max, e1); p++) aligned.push(p);
    const centred = [Math.floor((across - width) / 2) - 1, Math.floor((across - width) / 2), Math.floor((across - width) / 2) + 1].filter(p => p >= min && p <= max);
    if (toward) {
        // Position qui contient le palier, sinon la plus proche
        const c = horizontal ? toward[1] : toward[0];
        const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        const gap = (p) => (c < p ? p - c : c > p + width - 1 ? c - (p + width - 1) : 0);
        const best = Math.min(...options.map(gap));
        from = rnd.pick(options.filter(p => gap(p) === best));
    } else {
        from = rnd.pick(onShortSide && aligned.length ? aligned : centred);
    }
    const cells = horizontal ? rectCells(0, from, g.width, width) : rectCells(from, 0, width, g.length);
    cells.filter(c => isFree(g, ...c)).forEach(c => setOwner(g, ...c, SCHEME));
    return true;
};

// Schéma de circulation d'un niveau (§25, CN-1) : surcharge du preset pour ce niveau (numéro,
// puis « upper », « basement » ou « ground »), sinon schéma du preset entier
const layoutFor = (program, level) => {
    const byLevel = program.layoutByLevel ?? {};
    return byLevel[String(level)] ?? byLevel[level > 0 ? 'upper' : level < 0 ? 'basement' : 'ground'] ?? program.layout;
};

// ── Escalier orienté (§24) ───────────────────────────────────────────────────

// Un escalier droit (rectangle allongé, 2 cases de large au moins) a un côté bas, l'un de ses
// petits côtés : on y entre au niveau inférieur, on sort par le petit côté opposé au niveau
// supérieur (ES-1). Trappe et escalier carré : ouverts de tous côtés (ES-4).
const isOriented = (r) => r.w !== r.h && Math.min(r.w, r.h) >= 2;
const shortSides = (r) => (r.h > r.w ? ['n', 's'] : ['e', 'w']);

// Côtés ouverts d'un lien à un niveau (null : tous). Colimaçon (§34) : un seul côté par niveau,
// choisi quand on traite ce niveau (`rect.spiral` : niveau → côté), commun à toute la cage
const linkSidesAt = (link, rect, level) => (rect.spiral ? [rect.spiral[level]]
    : !isOriented(rect) ? null
    : [level === Math.min(link.from, link.to) ? rect.bottom : OPPOSITE[rect.bottom]]);

// Case de palier devant le milieu d'un côté du rectangle
const landingOf = (r, side) => ({
    n: [r.x + Math.floor(r.w / 2), r.y - 1],
    s: [r.x + Math.floor(r.w / 2), r.y + r.h],
    w: [r.x - 1, r.y + Math.floor(r.h / 2)],
    e: [r.x + r.w, r.y + Math.floor(r.h / 2)],
}[side]);

// Palier complet : toutes les cases devant un côté, sur toute sa largeur (§33, PA-1)
const landingCells = (r, side) => (side === 'n' || side === 's'
    ? Array.from({ length: r.w }, (_, i) => [r.x + i, side === 'n' ? r.y - 1 : r.y + r.h])
    : Array.from({ length: r.h }, (_, i) => [side === 'w' ? r.x - 1 : r.x + r.w, r.y + i]));

// Palier réservé au niveau de départ jusqu'au passage des couloirs (§33, PA-1)
const LANDING = 'landing';

// Emprise d'un lien : la surface demandée (ou juste au-dessus), carrée pour un colimaçon (§34)
const linkShapes = (area, square = false) => {
    let shapes = [];
    for (let a = area; !shapes.length; a++) shapes = shapesFor(a, a, engine.linkMaxRatio).filter(([w, h]) => !square || w === h);
    return shapes;
};

// ── Couloirs ─────────────────────────────────────────────────────────────────

// Chemin le moins coûteux (virages pénalisés) depuis des cases de départ vers une case cible,
// sur les cases libres. Renvoie les nœuds du chemin (départ compris), chacun avec sa direction.
const findPath = (g, starts, isTarget, rnd) => {
    const heap = createHeap();
    const done = new Set();
    for (const [x, y] of starts) heap.push({ x, y, dir: null, cost: 0, prev: null });
    while (heap.size) {
        const node = heap.pop();
        const k = `${node.x},${node.y},${node.dir}`;
        if (done.has(k)) continue;
        done.add(k);
        if (isTarget(node.x, node.y)) {
            const path = [];
            for (let n = node; n; n = n.prev) path.unshift(n);
            return path;
        }
        for (const { x, y, side } of around(node.x, node.y)) {
            if (!isFree(g, x, y)) continue;
            const turn = node.dir && node.dir !== side ? engine.turnCost : 0;
            heap.push({ x, y, dir: side, cost: node.cost + 1 + turn + rnd.next() * 0.1, prev: node });
        }
    }
    return null;
};

// Pose un tronçon de couloir ; en largeur 2, double chaque case sur le côté libre
const layCorridor = (g, path, width) => {
    for (const { x, y, dir } of path) {
        setOwner(g, x, y, CORRIDOR);
        if (width < 2) continue;
        const [ox, oy] = dir === 'n' || dir === 's' ? [1, 0] : [0, 1];
        if (isFree(g, x + ox, y + oy)) setOwner(g, x + ox, y + oy, CORRIDOR);
        else if (isFree(g, x - ox, y - oy)) setOwner(g, x - ox, y - oy, CORRIDOR);
    }
};

// Réseau atteint depuis l'entrée : entrée, couloir, puis pièces ouvertes qui le touchent
// de proche en proche
const reachedNetwork = (g, entrance, circulation) => {
    const ids = new Set([entrance.id, CORRIDOR]);
    for (let grew = true; grew;) {
        grew = false;
        for (const id of circulation) {
            if (ids.has(id)) continue;
            if (cellsOf(g, id).some(([x, y]) => around(x, y).some(n => ids.has(ownerAt(g, n.x, n.y))))) { ids.add(id); grew = true; }
        }
    }
    return ids;
};

// Cases de départ d'un couloir : le couloir déjà posé et les cases libres qui touchent le réseau
const corridorStarts = (g, network) => cellsWhere(g, id => id === null || id === CORRIDOR)
    .filter(([x, y]) => ownerAt(g, x, y) === CORRIDOR || around(x, y).some(n => network.has(ownerAt(g, n.x, n.y))));

// Distance (en cases libres) de chaque case libre au réseau
const networkDistances = (g, network) => {
    const dist = new Map();
    let frontier = cellsWhere(g, id => network.has(id));
    for (let d = 1; frontier.length; d++) {
        const next = [];
        for (const [cx, cy] of frontier) {
            for (const { x, y } of around(cx, cy)) {
                const k = `${x},${y}`;
                if (isFree(g, x, y) && !dist.has(k)) { dist.set(k, d); next.push([x, y]); }
            }
        }
        frontier = next;
    }
    return dist;
};

// Couloirs (§6.1 étape 3, §13 O-2) : relient au réseau atteint (entrée, pièces ouvertes)
// chaque point d'ancrage (liens verticaux, pièces structurantes, pièces prioritaires) qui ne
// le touche pas déjà, puis ramifications tant qu'une case libre reste à plus de `reach`
// cases du réseau. Les culs-de-sac sont élagués ensuite (pruneCorridors). Un point d'ancrage
// `{ id, landings }` : avec des paliers (escalier orienté, §24), le couloir vise ces cases.
const layCorridors = (g, entrance, circulation, anchors, width, reach, rnd) => {
    for (const { id, landings } of anchors) {
        const network = reachedNetwork(g, entrance, circulation);
        if (landings) {
            if ([...landings].some(k => network.has(ownerAt(g, ...k.split(',').map(Number))))) continue;
        } else if (cellsOf(g, id).some(([x, y]) => around(x, y).some(n => network.has(ownerAt(g, n.x, n.y))))) continue;
        const touches = landings ? (x, y) => landings.has(`${x},${y}`) : (x, y) => around(x, y).some(n => ownerAt(g, n.x, n.y) === id);
        const path = findPath(g, corridorStarts(g, network), touches, rnd);
        if (!path) return false;
        layCorridor(g, path, width);
    }

    for (let b = 0; b < engine.maxBranches; b++) {
        const network = reachedNetwork(g, entrance, circulation);
        const dist = networkDistances(g, network);
        const far = Math.max(0, ...dist.values());
        if (far <= reach) break;
        const [tx, ty] = rnd.pick([...dist].filter(([, d]) => d === far)).at(0).split(',').map(Number);
        const path = findPath(g, corridorStarts(g, network), (x, y) => x === tx && y === ty, rnd);
        if (!path) break;
        layCorridor(g, path.slice(0, path.length - reach), width);
    }
    return true;
};

// ── Pièces ───────────────────────────────────────────────────────────────────

const centre = (r) => [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2];
const distance = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

// Une pièce doit toucher ce type : voisinage imposé ou accès obligatoire (§23)
const needsNext = (room, other) => room.mustBeAdjacentTo.includes(other.typeId) || room.access.required.includes(other.typeId);

// Pièce maîtresse (§25, CN-4) : un rectangle de la surface voulue, à l'emplacement que demande le
// preset : `centre` (au milieu du niveau), `axis` (contre la racine, sur son axe : l'entrée au RDC),
// `facade` (contre la façade, près de la racine). Renvoie { x, y, w, h } ou null.
const placeHub = (g, room, target, position, anchor, anchorId, facade, rnd) => {
    const shapes = shapesFor(Math.round(target * 0.85), Math.round(target * 1.1), room.maxRatio, 2);
    const anchorCentre = rectCentre(anchor);
    let best = null;
    for (const [w, h] of shapes) {
        for (let y = 0; y + h <= g.length; y++) {
            for (let x = 0; x + w <= g.width; x++) {
                if (!rectFits(g, x, y, w, h, 0)) continue;
                const rect = { x, y, w, h };
                const centre = rectCentre(rect);
                const touchesAnchor = rectCells(x, y, w, h).some(([cx, cy]) => around(cx, cy).some(n => ownerAt(g, n.x, n.y) === anchorId));
                if (position === 'axis' && !touchesAnchor) continue;   // contre la racine, obligatoire (§30)
                let score = position === 'axis' ? (touchesAnchor ? 100 : 0) - distance(centre, anchorCentre)
                    : position === 'facade' ? (touchesFacade(g, facade, x, y, w, h) ? 100 : 0) + (touchesAnchor ? 20 : 0) - distance(centre, anchorCentre)
                    : -distance(centre, [g.width / 2, g.length / 2]);
                score += -Math.abs(w * h - target) * 0.5 + rnd.next();
                if (!best || score > best.score) best = { score, rect };
            }
        }
    }
    return best?.rect ?? null;
};

// Amorces : chaque pièce pose directement un rectangle de sa surface minimale. Pièce à accès
// extérieur obligatoire contre un mur extérieur ; annexe (`hostId`) contre son hôte, abandonnée
// (`dropped`) faute de place (§23, AC-3) ; ailleurs on préfère le contact avec le réseau de
// circulation (sauf si elle lui est interdite), les murs et les pièces déjà posées (moins de
// recoins perdus), le contact avec les voisines imposées, et on évite les voisines interdites.
// `before` : pièces déjà posées à un niveau précédent de la hiérarchie. `servedOnly` (niveau avec
// couloir) : le contact avec le réseau l'emporte sur tout le reste dès qu'une position le permet.
const placeRooms = (g, rooms, before, isNetwork, rnd, servedOnly = false) => {
    for (const room of rooms) {
        if (room.rect) continue;   // déjà posée (pièce maîtresse, §25)
        let shapes = shapesFor(room.sizeMin, Math.ceil(room.sizeMin * 1.25), room.maxRatio, 2);
        if (!shapes.length) shapes = shapesFor(room.sizeMin, room.sizeMax, room.maxRatio);
        const placed = [...before, ...rooms.filter(r => r.rect)];
        const networkWeight = room.circulationAccess === 'forbidden' ? 0
            : servedOnly || room.circulationAccess === 'required' ? 100 : 6;
        let best = null;
        for (const [w, h] of shapes) {
            for (let y = 0; y + h <= g.length; y++) {
                for (let x = 0; x + w <= g.width; x++) {
                    if (!rectFits(g, x, y, w, h, 0)) continue;
                    const cells = rectCells(x, y, w, h);
                    if (room.outsideAccess === 'required' && !cells.some(c => touchesOutside(g, ...c))) continue;
                    if (room.hostId && !cells.some(([cx, cy]) => around(cx, cy).some(n => ownerAt(g, n.x, n.y) === room.hostId))) continue;
                    let contact = 0, networkContact = 0;
                    const touching = new Set();
                    for (const [cx, cy] of cells) {
                        for (const n of around(cx, cy)) {
                            if (n.x >= x && n.x < x + w && n.y >= y && n.y < y + h) continue;
                            const o = ownerAt(g, n.x, n.y);
                            if (o === null) continue;
                            contact++;
                            if (isNetwork(o)) networkContact++;
                            touching.add(o);
                        }
                    }
                    const rect = { x0: x, y0: y, x1: x + w - 1, y1: y + h - 1 };
                    let score = contact * 0.5 + (networkContact ? networkWeight : 0) + rnd.next() * 3;
                    for (const r of placed) {
                        if (needsNext(room, r) || needsNext(r, room)) {
                            score += touching.has(r.id) ? 8 : -distance(centre(rect), centre(r.rect)) * 0.3;
                        }
                        if ((room.cannotBeAdjacentTo.includes(r.typeId) || r.cannotBeAdjacentTo.includes(room.typeId)) && touching.has(r.id)) score -= 20;
                    }
                    if (!best || score > best.score) best = { score, rect, cells };
                }
            }
        }
        if (!best && room.hostId) { room.dropped = true; continue; }
        if (!best) return false;
        best.cells.forEach(c => setOwner(g, ...c, room.id));
        room.rect = best.rect;
        room.area = best.cells.length;
    }
    return true;
};

// Bande de cases qui prolonge le rectangle d'une pièce d'un côté
const stripOf = ({ x0, y0, x1, y1 }, side) => {
    const cells = [];
    if (side === 'n' || side === 's') for (let x = x0; x <= x1; x++) cells.push([x, side === 'n' ? y0 - 1 : y1 + 1]);
    else for (let y = y0; y <= y1; y++) cells.push([side === 'w' ? x0 - 1 : x1 + 1, y]);
    return cells;
};

const grow = (rect, side) => ({
    ...rect,
    y0: side === 'n' ? rect.y0 - 1 : rect.y0,
    y1: side === 's' ? rect.y1 + 1 : rect.y1,
    x0: side === 'w' ? rect.x0 - 1 : rect.x0,
    x1: side === 'e' ? rect.x1 + 1 : rect.x1,
});

// Croissance en rectangle, par côtés entiers, en respectant le ratio : vers la surface cible,
// puis (`untilMax`) jusqu'à sizeMax pour occuper l'espace libre, pièces ouvertes d'abord (R-4).
const growRectangles = (g, rooms, rnd, untilMax) => {
    const order = untilMax
        ? (a, b) => (b.circulation - a.circulation) || (a.area / a.sizeMax - b.area / b.sizeMax)
        : (a, b) => a.area / a.target - b.area / b.target;
    for (let grew = true; grew;) {
        grew = false;
        for (const room of [...rooms].sort(order)) {
            if (room.wing) continue;
            const options = Object.keys(SIDES).map(side => {
                const strip = stripOf(room.rect, side);
                const rect = grow(room.rect, side);
                const w = rect.x1 - rect.x0 + 1, h = rect.y1 - rect.y0 + 1;
                return { strip, rect, area: w * h, ratio: ratioOf(w, h), long: Math.max(w, h) };
            }).filter(o => o.strip.every(c => isFree(g, ...c))
                && o.area <= room.sizeMax
                && (untilMax || Math.abs(o.area - room.target) < Math.abs(room.area - room.target))
                && (o.ratio <= room.maxRatio || o.long <= 2));
            if (!options.length) continue;
            const best = options.reduce((a, b) => (a.ratio + rnd.next() * 0.2 <= b.ratio + rnd.next() * 0.2 ? a : b));
            best.strip.forEach(c => setOwner(g, ...c, room.id));
            room.rect = best.rect;
            room.area = best.area;
            grew = true;
        }
    }
};

// Aile (R-7) : une pièce restée sous sa cible prend un rectangle accolé à un côté, calé
// dans un angle, pour former un L. Une seule aile par pièce.
const addWings = (g, rooms, rnd) => {
    const arm = engine.minArm;
    for (const room of rooms) {
        if (room.area >= room.target) continue;
        const { x0, y0, x1, y1 } = room.rect;
        const w = x1 - x0 + 1, h = y1 - y0 + 1;
        const options = [];
        for (const side of Object.keys(SIDES)) {
            const horizontal = side === 'n' || side === 's';
            const sideLength = horizontal ? w : h;
            for (let len = arm; len <= sideLength - arm; len++) {
                for (const flush of ['start', 'end']) {
                    for (let depth = arm; room.area + len * depth <= room.sizeMax; depth++) {
                        const offset = flush === 'start' ? 0 : sideLength - len;
                        const wing = horizontal
                            ? rectCells(x0 + offset, side === 'n' ? y0 - depth : y1 + 1, len, depth)
                            : rectCells(side === 'w' ? x0 - depth : x1 + 1, y0 + offset, depth, len);
                        if (!wing.every(c => isFree(g, ...c))) break;
                        const b = bounds([...rectCells(x0, y0, w, h), ...wing]);
                        if (ratioOf(b.w, b.h) <= room.maxRatio) options.push(wing);
                    }
                }
            }
        }
        if (!options.length) continue;
        const target = room.target - room.area;
        const best = options.reduce((a, b) => (Math.abs(a.length - target) + rnd.next() <= Math.abs(b.length - target) + rnd.next() ? a : b));
        best.forEach(c => setOwner(g, ...c, room.id));
        room.area += best.length;
        room.wing = true;
    }
};

// Après une absorption : une pièce restée rectangle peut encore grandir par côtés entiers,
// une pièce en L ne grandit plus
const syncShape = (g, room) => {
    const cells = cellsOf(g, room.id);
    room.area = cells.length;
    if (shapeKind(cells) === 'rect') {
        const b = bounds(cells);
        room.rect = { x0: b.x, y0: b.y, x1: b.x + b.w - 1, y1: b.y + b.h - 1 };
    } else {
        room.wing = true;
    }
};

// Contour libre (§13, O-4) : retire du bâtiment le plus grand rectangle calé dans un angle
// de l'enveloppe, pris dans la zone libre (et les cases déjà retirées), tel que le bâtiment
// reste un rectangle ou un L. Renvoie false si aucune découpe n'est possible.
const carveCorner = (g, region) => {
    const regionSet = new Set(region.map(cellKey));
    const removable = (x, y) => regionSet.has(`${x},${y}`) || ownerAt(g, x, y) === OUTSIDE;
    const corners = [[0, 0, 1, 1], [g.width - 1, 0, -1, 1], [0, g.length - 1, 1, -1], [g.width - 1, g.length - 1, -1, -1]];
    let best = null;
    for (const [cx, cy, dx, dy] of corners) {
        for (let w = 1; w <= g.width && removable(cx + dx * (w - 1), cy); w++) {
            for (let h = 1; h <= g.length; h++) {
                const cells = rectCells(dx > 0 ? cx : cx - w + 1, dy > 0 ? cy : cy - h + 1, w, h);
                if (!cells.every(c => removable(...c))) break;
                const carved = cells.filter(c => regionSet.has(cellKey(c)));
                if (!carved.length || (best && carved.length <= best.length)) continue;
                const carvedSet = new Set(carved.map(cellKey));
                const remaining = cellsWhere(g, id => id !== OUTSIDE).filter(c => !carvedSet.has(cellKey(c)));
                if (shapeKind(remaining) !== null) best = carved;
            }
        }
    }
    if (!best) return false;
    best.forEach(c => setOwner(g, ...c, OUTSIDE));
    return true;
};

// Restes (R-4) : chaque zone libre va entière à une pièce voisine si sa forme reste un
// rectangle ou un L (pièces ouvertes d'abord) ; sinon, en contour libre, on retire du
// bâtiment ce qui peut l'être dans un angle (carveCorner) et on recommence ; le reste va
// au couloir (dégagement). `freeOutline` vaut 'excavate' au sous-sol : tout reste est non excavé.
const settleLeftovers = (g, rooms, freeOutline) => {
    const byId = new Map(rooms.map(r => [r.id, r]));
    for (let carved = true; carved;) {
        carved = false;
        for (const region of regionsOf(cellsOf(g, null))) {
            const neighbours = [...new Set(region.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))))]
                .map(id => byId.get(id)).filter(Boolean)
                .sort((a, b) => (b.circulation - a.circulation) || (a.area / a.sizeMax - b.area / b.sizeMax));
            // Une pièce voisine dans ses tailles, sinon en dépassant un peu sizeMax plutôt que de
            // laisser un dégagement qui ne dessert rien (§19)
            const taker = neighbours.find(r => shapeIsValid(r, [...cellsOf(g, r.id), ...region]))
                ?? neighbours.find(r => shapeIsValid(r, [...cellsOf(g, r.id), ...region], engine.leftoverOverflow));
            if (taker) {
                region.forEach(c => setOwner(g, ...c, taker.id));
                syncShape(g, taker);
            } else if (freeOutline === 'excavate') {
                // Sous-sol (§20, E2-6) : ce que le programme n'occupe pas reste non excavé
                region.forEach(c => setOwner(g, ...c, OUTSIDE));
            } else if (freeOutline && region.some(c => touchesOutside(g, ...c)) && carveCorner(g, region)) {
                carved = true;
                break;
            } else {
                region.forEach(c => setOwner(g, ...c, CORRIDOR));
            }
        }
    }
};

// Élagage (§13, O-3) : on ne retire que les culs-de-sac qui ne desservent rien. On garde,
// dans le couloir provisoire, les plus courts chemins qui relient le réseau (entrée, pièces
// ouvertes) à chaque pièce ou lien que ce couloir touche ; ce qui dépasse redevient libre :
// les pièces y regrandissent, puis le reste suit la règle des restes (settleLeftovers).
// `fixed` : cases du couloir d'un schéma et de son raccordement, jamais élaguées (§18, SC-3).
const pruneCorridors = (g, rooms, links, entrance, width, fixed = new Set()) => {
    const roots = new Set([entrance.id, ...rooms.filter(r => r.circulation).map(r => r.id)]);
    const kept = new Set(fixed);
    const corridor = new Set(cellsOf(g, CORRIDOR).map(cellKey));
    const isReached = (x, y) => kept.has(`${x},${y}`) || roots.has(ownerAt(g, x, y));

    const touchesCorridor = (cells) => cells.some(([x, y]) => around(x, y).some(n => corridor.has(`${n.x},${n.y}`)));
    const clients = [...links.map(l => l.id), ...rooms.map(r => r.id)]
        .filter(id => !roots.has(id) && touchesCorridor(cellsOf(g, id)));
    const clientCells = new Map(clients.map(id => [id, cellsOf(g, id)]));
    const isServed = (id) => clientCells.get(id).some(([x, y]) => around(x, y).some(n => kept.has(`${n.x},${n.y}`)));

    for (;;) {
        const waiting = clients.filter(id => !isServed(id));
        if (!waiting.length) break;

        // Plus court chemin dans le couloir provisoire, du réseau atteint vers un client en attente
        const prev = new Map();
        let frontier = [...corridor].filter(k => {
            const [x, y] = k.split(',').map(Number);
            return !kept.has(k) && around(x, y).some(n => isReached(n.x, n.y));
        });
        frontier.forEach(k => prev.set(k, null));
        let found = null;
        while (frontier.length && !found) {
            const next = [];
            for (const k of frontier) {
                const [x, y] = k.split(',').map(Number);
                if (around(x, y).some(n => waiting.includes(ownerAt(g, n.x, n.y)))) { found = k; break; }
                for (const n of around(x, y)) {
                    const nk = `${n.x},${n.y}`;
                    if (corridor.has(nk) && !kept.has(nk) && !prev.has(nk)) { prev.set(nk, k); next.push(nk); }
                }
            }
            frontier = next;
        }
        if (!found) break;
        for (let k = found; k !== null; k = prev.get(k)) kept.add(k);
    }

    // En largeur 2, le chemin gardé emporte la deuxième file du couloir
    if (width >= 2) {
        for (const k of [...kept]) {
            const [x, y] = k.split(',').map(Number);
            around(x, y).forEach(n => { if (corridor.has(`${n.x},${n.y}`)) kept.add(`${n.x},${n.y}`); });
        }
    }

    [...corridor].filter(k => !kept.has(k)).forEach(k => setOwner(g, ...k.split(',').map(Number), null));
};

// Composantes du couloir, chacune avec son identifiant (§21.1) : deux tronçons séparés (par la
// cage d'escalier, ou qui ne se touchent que par un angle) ne communiquent pas. Celui qui touche
// la racine garde CORRIDOR ; les autres tronçons qui touchent la racine ou une pièce ouverte
// (`parts`) restent du couloir à part entière ; ceux qui ne touchent rien de cela sont des
// dégagements isolés (`recesses`, reliés ensuite comme des pièces, par un passage ouvert).
// `landings` (hors RDC) : cases de palier de l'escalier d'arrivée ; un tronçon ne lui est relié que
// s'il contient l'une d'elles, pas s'il touche un côté fermé de la cage (§24, §29).
const splitCorridors = (g, rooms, root, landings = null) => {
    const parts = [], recesses = [];
    const circulation = new Set(rooms.filter(r => r.circulation).map(r => r.id));
    const roots = landings ? circulation : new Set([root.id, ...circulation]);
    const touches = (region, ids) => region.some(([x, y]) => around(x, y).some(n => ids.has(ownerAt(g, n.x, n.y))));
    const regions = regionsOf(cellsOf(g, CORRIDOR));
    const reachesRoot = (region) => (landings ? region.some(c => landings.has(cellKey(c))) : touches(region, new Set([root.id])));
    const main = regions.find(reachesRoot) ?? regions.find(r => touches(r, roots));
    for (const region of regions) {
        if (region === main) continue;
        const id = `${CORRIDOR}-${parts.length + recesses.length + 2}`;
        (touches(region, roots) ? parts : recesses).push(id);
        region.forEach(c => setOwner(g, ...c, id));
    }
    return { parts, recesses };
};

// ── Portes ───────────────────────────────────────────────────────────────────

// Murs partagés : « a|b » (ids triés) → arêtes { x, y, side } vues depuis les cases de a
const sharedWalls = (g) => {
    const walls = new Map();
    const add = (a, b, edge) => {
        const [first, second, e] = a < b ? [a, b, edge] : [b, a, flipEdge(edge)];
        const k = `${first}|${second}`;
        if (!walls.has(k)) walls.set(k, []);
        walls.get(k).push(e);
    };
    for (let y = 0; y < g.length; y++) {
        for (let x = 0; x < g.width; x++) {
            const a = ownerAt(g, x, y);
            if (a === OUTSIDE) continue;
            for (const n of around(x, y)) {
                const b = ownerAt(g, n.x, n.y);
                if (b === a || (b !== OUTSIDE && (n.side === 'n' || n.side === 'w'))) continue;
                add(a, b, { x, y, side: n.side });
            }
        }
    }
    return walls;
};

const wallBetween = (walls, a, b) => walls.get(a < b ? `${a}|${b}` : `${b}|${a}`) ?? null;

// Arête de porte : de préférence loin des extrémités du mur
const pickEdge = (edges, rnd) => {
    const keys = new Set(edges.map(e => `${e.x},${e.y},${e.side}`));
    const interior = edges.filter(({ x, y, side }) => {
        const [dx, dy] = side === 'n' || side === 's' ? [1, 0] : [0, 1];
        return keys.has(`${x - dx},${y - dy},${side}`) && keys.has(`${x + dx},${y + dy},${side}`);
    });
    return rnd.pick(interior.length ? interior : edges);
};

// Portes (§6.1 étape 5, §23). Le réseau (couloirs + pièces ouvertes) se parcourt sans porte.
// - Extérieur : porte de l'entrée sur la façade ; une porte dehors par pièce `outsideAccess`
//   obligatoire ; porte de service tirée par la graine pour une pièce où elle est possible.
// - Chaque pièce qui touche le réseau atteint y ouvre (sauf `circulationAccess` interdit) ; les
//   autres sont reliées de proche en proche à une pièce déjà reliée (jamais par une pièce
//   `noTransit`) ; voisinages imposés ; quelques portes en plus tirées par la graine.
// - Accès vers d'autres pièces (`access`) : une pièce ne s'ouvre jamais vers un type interdit ;
//   une pièce qui déclare des types obligatoires ou possibles n'ouvre que vers eux. Une pièce à
//   accès obligatoire (annexe, cellier) est reliée à part, par son hôte ; ses accès possibles
//   (2ᵉ chambre d'une salle d'eau attenante) s'ouvrent quand elle les touche.
// Liens verticaux et dégagements isolés : passage ouvert, sans battant. `root` : l'entrée au
// RDC ; à l'étage et au sous-sol, l'escalier d'arrivée (§20, E2-2). `facade` : null hors RDC.
const placeDoors = (g, rooms, links, { parts, recesses }, root, facade, density, rnd) => {
    const walls = sharedWalls(g);
    const doors = [];
    const linked = new Set();
    const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const circulation = new Set(rooms.filter(r => r.circulation).map(r => r.id));
    const isNetwork = (id) => isCorridor(id) || circulation.has(id);
    const linkIds = new Set(links.map(l => l.id));
    const openIds = new Set([...linkIds, ...recesses]);
    const byId = new Map(rooms.map(r => [r.id, r]));

    // Accès (§23) : entre deux pièces fermées, chacune doit accepter l'autre ; vers le réseau ou
    // un escalier, la pièce ne doit pas avoir la circulation interdite
    const restricted = (r) => r.access.required.length > 0 || r.access.optional.length > 0;
    const accepts = (r, other) => !r.access.forbidden.includes(other.typeId)
        && (!restricted(r) || r.access.required.includes(other.typeId) || r.access.optional.includes(other.typeId));
    const canOpen = (a, b) => {
        const ra = byId.get(a), rb = byId.get(b);
        const closedA = ra && !ra.circulation, closedB = rb && !rb.circulation;
        if (closedA && closedB) return accepts(ra, rb) && accepts(rb, ra);
        const room = closedA ? ra : closedB ? rb : null;
        if (!room) return true;
        const other = room === ra ? rb : ra;
        return room.circulationAccess !== 'forbidden' && !(other && room.access.forbidden.includes(other.typeId));
    };
    const isAnnex = (id) => byId.get(id)?.access.required.length > 0;

    // Côtés ouverts d'un escalier orienté (§24) : une ouverture n'est percée que de ces côtés
    const linkSides = new Map(links.map(l => [l.id, l.sides ?? null]));
    const sideAllowed = (edge) => {
        const owner = ownerAt(g, edge.x, edge.y);
        if (linkSides.get(owner) && !linkSides.get(owner).includes(edge.side)) return false;
        const other = flipEdge(edge);
        const otherOwner = ownerAt(g, other.x, other.y);
        return !linkSides.get(otherOwner) || linkSides.get(otherOwner).includes(other.side);
    };

    // Porte qui ouvre dans `into` depuis `from`
    const addDoor = (into, from, kind = 'door', filter = () => true) => {
        const edges = (wallBetween(walls, into, from) ?? []).filter(e => sideAllowed(e) && filter(ownerAt(g, e.x, e.y) === into ? e : flipEdge(e)));
        if (!edges.length) return false;
        const edge = pickEdge(edges, rnd);
        const oriented = ownerAt(g, edge.x, edge.y) === into ? edge : flipEdge(edge);
        doors.push({ ...oriented, between: [into, from], kind });
        linked.add(pairKey(into, from));
        return true;
    };

    if (facade) {
        addDoor(root.id, OUTSIDE, 'door', e => e.side === facade);
        for (const room of rooms) {
            if (room.id === root.id) continue;
            if (room.outsideAccess === 'required') addDoor(room.id, OUTSIDE);
            // Porte de service (§23, AC-5) : si la pièce touche un mur extérieur
            else if (room.outsideAccess === 'optional' && rnd.next() < room.serviceDoorChance) addDoor(room.id, OUTSIDE);
        }
    }

    // Atteindre un nœud du réseau atteint tout le réseau qui le touche
    const nodes = [...rooms.map(r => r.id), ...links.map(l => l.id), CORRIDOR, ...parts, ...recesses]
        .filter(id => id !== CORRIDOR || g.owner.includes(CORRIDOR));
    const reached = new Set();
    const reach = (id) => {
        if (reached.has(id)) return;
        reached.add(id);
        if (!isNetwork(id)) return;
        for (const other of nodes) if (isNetwork(other) && wallBetween(walls, id, other)) reach(other);
    };
    reach(root.id);
    if (linkIds.has(root.id)) {
        // Escalier d'arrivée : il débouche sur chaque morceau de réseau qu'il touche. Sa cage peut
        // couper le couloir en plusieurs tronçons, qui portent le même nom : une ouverture par
        // tronçon, sinon les pièces d'un tronçon resteraient inaccessibles (§21.1)
        const corridorPart = new Map();
        regionsOf(cellsOf(g, CORRIDOR)).forEach((region, i) => region.forEach(c => corridorPart.set(cellKey(c), i)));
        for (const net of nodes.filter(id => isNetwork(id) && wallBetween(walls, root.id, id))) {
            const parts = new Map();
            for (const edge of wallBetween(walls, root.id, net).filter(sideAllowed)) {
                const inRoot = ownerAt(g, edge.x, edge.y) === root.id ? edge : flipEdge(edge);
                const [nx, ny] = [inRoot.x + SIDES[inRoot.side][0], inRoot.y + SIDES[inRoot.side][1]];
                const part = net === CORRIDOR ? corridorPart.get(`${nx},${ny}`) : 0;
                if (!parts.has(part)) parts.set(part, []);
                parts.get(part).push(inRoot);
            }
            if (!parts.size) continue;
            for (const edges of parts.values()) doors.push({ ...pickEdge(edges, rnd), between: [root.id, net], kind: 'opening' });
            linked.add(pairKey(root.id, net));
            reach(net);
        }
    } else if (!isNetwork(root.id) && g.owner.includes(CORRIDOR) && addDoor(root.id, CORRIDOR)) reach(CORRIDOR);

    const transit = (id) => !byId.get(id)?.noTransit;
    const doorCount = (id) => doors.filter(d => d.between.includes(id)).length;

    // Relie `id` à l'un des voisins proposés, dans un ordre tiré par la graine ; un voisin qui ne
    // permet aucune ouverture (côté fermé d'un escalier, §24) est sauté. Renvoie false si aucun.
    const openFrom = (id, candidates) => {
        const pool = [...candidates];
        while (pool.length) {
            const other = pool.splice(Math.floor(rnd.next() * pool.length), 1)[0];
            if (addDoor(id, other, openIds.has(id) || openIds.has(other) ? 'opening' : 'door')) return true;
        }
        return false;
    };

    for (;;) {
        // D'abord tout ce qui touche le réseau atteint, puis un maillon d'enfilade, et on recommence.
        // Les pièces à accès obligatoire sont reliées ensuite, par leur hôte.
        let changed = false;
        for (const id of nodes) {
            if (reached.has(id) || isNetwork(id) || isAnnex(id)) continue;
            const nets = [...reached].filter(r => isNetwork(r) && canOpen(id, r) && wallBetween(walls, id, r));
            if (!openFrom(id, nets)) continue;
            reach(id);
            changed = true;
        }
        if (changed) continue;
        for (const id of nodes) {
            if (reached.has(id) || isAnnex(id)) continue;
            // Une pièce ne donne sur l'escalier d'arrivée que si le niveau n'a pas de couloir (§21.1)
            const viaStair = (r) => r === root.id && !g.owner.includes(CORRIDOR);
            const from = [...reached].filter(r => r !== CORRIDOR && (!linkIds.has(r) || viaStair(r)) && transit(r) && !isAnnex(r) && canOpen(id, r) && wallBetween(walls, id, r));
            if (!openFrom(id, from)) continue;
            reach(id);
            changed = true;
            break;
        }
        if (!changed) break;
    }

    // Pièces à accès obligatoire (§23) : une porte vers l'hôte (le leur s'il est désigné, sinon une
    // pièce voisine d'un type obligatoire), puis vers les pièces possibles qu'elles touchent
    // (salle d'eau partagée entre deux chambres). L'hôte `noTransit` ne compte pas ce passage. Une
    // pièce n'a qu'une annexe de chaque type (§31) : pas de salle d'eau partagée vers une chambre qui
    // a déjà la sienne ou en partage déjà une.
    const annexOfType = (roomId, typeId, except) => rooms.some(r => r.id !== except && r.typeId === typeId
        && (r.hostId === roomId || doors.some(d => d.between.includes(r.id) && d.between.includes(roomId))));
    for (const room of rooms.filter(r => isAnnex(r.id))) {
        const hosts = room.hostId ? [room.hostId]
            : rooms.filter(r => room.access.required.includes(r.typeId) && wallBetween(walls, room.id, r.id)).map(r => r.id);
        const host = hosts.find(id => wallBetween(walls, room.id, id));
        if (!host) continue;
        addDoor(room.id, host);
        if (reached.has(host)) reach(room.id);
        for (const other of rooms) {
            if (other.id === host || linked.has(pairKey(room.id, other.id)) || !room.access.optional.includes(other.typeId)) continue;
            if (annexOfType(other.id, room.typeId, room.id)) continue;
            if (wallBetween(walls, room.id, other.id) && canOpen(room.id, other.id)) addDoor(room.id, other.id);
        }
    }

    for (const room of rooms) {
        for (const other of rooms) {
            if (room.id >= other.id || (isNetwork(room.id) && isNetwork(other.id)) || isAnnex(room.id) || isAnnex(other.id)) continue;
            if (linked.has(pairKey(room.id, other.id)) || !canOpen(room.id, other.id) || !wallBetween(walls, room.id, other.id)) continue;
            if ([room, other].some(r => r.noTransit && doorCount(r.id) > 0)) continue;
            const required = room.mustBeAdjacentTo.includes(other.typeId) || other.mustBeAdjacentTo.includes(room.typeId);
            if (required || rnd.next() < density.extraDoorChance) addDoor(room.id, other.id);
        }
    }

    // Une annexe est atteinte par son hôte
    for (const room of rooms.filter(r => isAnnex(r.id))) {
        if (doors.some(d => d.between.includes(room.id) && d.between.some(id => id !== room.id && reached.has(id)))) reached.add(room.id);
    }

    return { doors, connected: nodes.every(id => reached.has(id)) };
};

// ── Contrôles ────────────────────────────────────────────────────────────────

// Plus grand rectangle contenu dans la pièce : emplacement du libellé
const largestRect = (cells) => {
    const set = new Set(cells.map(cellKey));
    const b = bounds(cells);
    let best = { x: b.x, y: b.y, w: 1, h: 1 };
    for (const [x0, y0] of cells) {
        for (let w = 1; set.has(`${x0 + w - 1},${y0}`); w++) {
            let h = 1;
            while ([...Array(w).keys()].every(i => set.has(`${x0 + i},${y0 + h}`))) h++;
            if (w * h > best.w * best.h) best = { x: x0, y: y0, w, h };
        }
    }
    return best;
};

// Voisinages imposés et interdits ; accès obligatoire (§23) : la pièce touche au moins une pièce
// d'un type obligatoire présent, et une annexe touche son hôte
const adjacencyIsValid = (rooms, walls) => rooms.every(room => {
    const near = rooms.filter(o => o !== room && wallBetween(walls, room.id, o.id)).map(o => o.typeId);
    const present = new Set(rooms.map(r => r.typeId));
    const required = room.access.required.filter(t => present.has(t));
    return room.mustBeAdjacentTo.every(t => !present.has(t) || near.includes(t))
        && room.cannotBeAdjacentTo.every(t => !near.includes(t))
        && (!required.length || required.some(t => near.includes(t)))
        && (!room.hostId || Boolean(wallBetween(walls, room.id, room.hostId)));
});

// ── Génération ───────────────────────────────────────────────────────────────

const levelOfFloor = (floor, params) => (floor === 'ground' ? 0 : floor === 'basement' ? -1 : floor === 'top' ? params.floors : Number(floor));

// Liens verticaux du bâtiment (§20, E2-5) : ceux du preset dont les deux niveaux existent, plus
// un escalier par étage que rien ne dessert depuis le niveau du dessous (dans la même cage que
// l'escalier qu'il prolonge) et un escalier de cave si un sous-sol existe sans lien.
const buildLinks = (program, params) => {
    const levels = levelsOf(params);
    const links = program.verticalLinks
        .map(l => ({ ...l, from: levelOfFloor(l.floorFrom, params), to: levelOfFloor(l.floorTo, params) }))
        .filter(l => levels.includes(l.from) && levels.includes(l.to));
    const main = links.find(l => Math.min(l.from, l.to) === 0 && Math.max(l.from, l.to) === 1);
    for (const level of levels.filter(l => l > 0)) {
        if (links.some(l => Math.min(l.from, l.to) === level - 1 && Math.max(l.from, l.to) === level)) continue;
        links.push({ label: main?.label ?? 'Escalier', from: level - 1, to: level, sizeInCells: main?.sizeInCells ?? engine.stairSize, kind: main?.kind });
    }
    if (levels.includes(-1) && !links.some(l => Math.min(l.from, l.to) === -1)) {
        links.push({ label: 'Escalier de cave', from: 0, to: -1, sizeInCells: engine.cellarStairSize });
    }
    return links.map((l, i) => ({ ...l, id: `link-${i + 1}` }));
};

const linkTouches = (link, level) => link.from === level || link.to === level;

// Pièces du bâtiment pour une graine (§18.1, §20) : exemplaires du programme et étage de chacun,
// puis pioche dans le réservoir niveau par niveau (jamais au sous-sol, qui reste non excavé).
// Tirage fait une fois par graine : mêmes pièces et mêmes étages d'une tentative à l'autre.
const buildRooms = (program, params, links, corridorWidth, rnd) => {
    const surface = params.width * params.length;
    const rooms = [];
    const add = (entry, level) => {
        if (level !== null) rooms.push({ ...entry, typeId: entry.id, level, maxRatio: Math.max(entry.ratioMax, 1 / entry.ratioMin) });
    };
    // Une pièce « à l'étage » va à l'étage le moins chargé (la graine départage) : chaque étage
    // se resserre au-dessus du précédent, un étage surchargé ne tiendrait pas (§20.3)
    const uppers = levelsOf(params).filter(l => l > 0);
    const load = (level) => rooms.filter(r => r.level === level).reduce((s, r) => s + r.sizeMin, 0);
    const levelFor = (entry) => {
        if (entry.floor !== 'upper' || uppers.length < 2) return resolveLevel(entry.floor, params, rnd);
        const least = Math.min(...uppers.map(load));
        return rnd.pick(uppers.filter(l => load(l) === least));
    };
    for (const entry of program.rooms) {
        const [qMin, qMax] = quantityRange(entry);
        const count = rnd.int(qMin, qMax);
        for (let i = 0; i < count; i++) add(entry, levelFor(entry));
    }

    const linkArea = (level) => links.filter(l => linkTouches(l, level)).reduce((s, l) => s + l.sizeInCells, 0);
    const neededAt = (level) => rooms.filter(r => r.level === level).reduce((s, r) => s + r.sizeMin, 0) + linkArea(level);
    // Un niveau avec une pièce à accès obligatoire à la circulation aura un couloir, même en
    // densité dense (§21)
    const corridorAt = (level) => Math.max(corridorWidth, rooms.some(r => r.level === level && r.circulationAccess === 'required') ? engine.accessCorridorWidth : 0);
    const capacityAt = (level) => rooms.filter(r => r.level === level).reduce((s, r) => s + r.sizeMax, 0) + linkArea(level)
        + corridorAt(level) * Math.max(params.width, params.length);

    const units = (program.optionalRooms ?? []).filter(entry => !entry.per)
        .flatMap(entry => Array.from({ length: quantityRange(entry)[1] }, (_, i) => ({ entry, required: i < quantityRange(entry)[0] })));
    for (let i = units.length - 1; i > 0; i--) {
        const j = Math.floor(rnd.next() * (i + 1));
        [units[i], units[j]] = [units[j], units[i]];
    }
    for (const { entry, required } of units.sort((a, b) => b.required - a.required)) {
        const level = levelFor(entry);
        if (level === null || level < 0) continue;
        if (!required && (capacityAt(level) >= surface * engine.fillMargin || neededAt(level) + entry.sizeMin > surface * engine.maxLoad)) continue;
        add(entry, level);
    }

    // Numérotation par type sur tout le bâtiment (« Chambre 1 » à « Chambre 6 »)
    const numbered = (list) => {
        const counts = new Map();
        list.forEach(r => counts.set(r.typeId, (counts.get(r.typeId) ?? 0) + 1));
        const seen = new Map();
        return list.map(r => {
            const n = (seen.get(r.typeId) ?? 0) + 1;
            seen.set(r.typeId, n);
            return { ...r, id: `${r.typeId}-${n}`, label: counts.get(r.typeId) > 1 ? `${r.label} ${n}` : r.label };
        });
    };
    const main = numbered(rooms);

    // Annexes (§23, AC-4) : pour chaque pièce hôte du type `per`, la graine décide du nombre
    // d'annexes ; une annexe est au même niveau que son hôte et se pose contre lui
    const annexes = [];
    for (const entry of (program.optionalRooms ?? []).filter(e => e.per)) {
        for (const host of main.filter(r => r.typeId === entry.per)) {
            const [qMin, qMax] = quantityRange(entry);
            for (let i = rnd.int(qMin, qMax); i > 0; i--) {
                annexes.push({ ...entry, typeId: entry.id, level: host.level, hostId: host.id, maxRatio: Math.max(entry.ratioMax, 1 / entry.ratioMin) });
            }
        }
    }
    return [...main, ...numbered(annexes)];
};

const rectCentre = (r) => [r.x + r.w / 2, r.y + r.h / 2];

// Un niveau, pour une tentative : { floor } ou { reason, step }. `below` : niveau généré juste
// avant (celui du dessous pour un étage, le RDC pour le sous-sol). `placed` : position des liens
// verticaux déjà posés, partagée entre les niveaux.
// `sameAsBelow` : même schéma que le niveau du dessous (son couloir se superpose, E2-3) ;
// `aboveSpine` (RDC) : l'étage aura un couloir traversant à lui, l'escalier l'anticipe (CN-3).
const attemptLevel = (rooms, { level, params, density, scheme, width, maxWidth, facade, links, placed, below, rnd, sameAsBelow = false, aboveSpine = false, closetType = null, spaceAnnexTypes = [], hub = null }) => {
    const g = createGrid(params.width, params.length);
    const basement = level < 0;
    // Une pièce à accès obligatoire à la circulation (chambre…) donne toujours sur le réseau : son
    // niveau a un couloir, quelle que soit la densité (§21, §23). De même un niveau de plusieurs
    // pièces dont aucune ne se traverse (réserves, armurerie : §34)
    const mainRooms = rooms.filter(r => !r.hostId);
    const noPassage = mainRooms.length > 1 && mainRooms.every(r => r.noTransit || r.circulationAccess === 'forbidden');
    const levelWidth = basement ? 0 : width || (rooms.some(r => r.circulationAccess === 'required') || noPassage ? Math.min(engine.accessCorridorWidth, maxWidth) : 0);
    const hasScheme = !basement && (scheme === 'spine' || scheme === 'gallery');
    const circulation = new Set(rooms.filter(r => r.circulation).map(r => r.id));

    // Emprise héritée (§20, E2-9) : un étage ne déborde pas du niveau du dessous ; au-dessus d'une
    // cour à ciel ouvert, du vide
    if (level > 0) {
        below.voids.forEach(c => setOwner(g, ...c, OUTSIDE));
        below.rooms.filter(r => r.outdoor).forEach(r => r.cells.forEach(c => setOwner(g, ...c, OUTSIDE)));
    }

    // Liens déjà posés à un autre niveau : même emprise ici (§2.3). Un escalier qui prolonge celui
    // d'arrivée reprend sa cage (même emprise, cases au nom de l'escalier d'arrivée).
    const levelLinks = links.filter(l => linkTouches(l, level));
    const owner = new Map();
    for (const link of levelLinks.filter(l => placed.has(l.id))) {
        const r = placed.get(link.id);
        const cells = rectCells(r.x, r.y, r.w, r.h);
        const shared = levelLinks.find(o => o !== link && owner.has(o.id) && placed.get(o.id) === r);
        if (shared) { owner.set(link.id, owner.get(shared.id)); continue; }
        if (!cells.every(c => isFree(g, ...c))) return { reason: 'envelope', step: 'links' };
        cells.forEach(c => setOwner(g, ...c, link.id));
        owner.set(link.id, link.id);
    }

    // Racine du réseau (§20, E2-2) : l'entrée au RDC, l'escalier d'arrivée ailleurs
    let root, entrance = null, rootRect;
    if (level === 0) {
        entrance = rooms.find(r => r.outsideAccess === 'required');
        if (!entrance) return { reason: 'envelope', step: 'entrance' };
        const er = placeEntrance(g, entrance, facade, rnd);
        if (!er) return { reason: 'envelope', step: 'entrance' };
        rectCells(er.x, er.y, er.w, er.h).forEach(c => setOwner(g, ...c, entrance.id));
        entrance.rect = { x0: er.x, y0: er.y, x1: er.x + er.w - 1, y1: er.y + er.h - 1 };
        entrance.area = er.w * er.h;
        entrance.target = entrance.area;
        root = entrance;
        rootRect = er;
    } else {
        const arrival = levelLinks.find(l => placed.has(l.id) && (level > 0 ? Math.min(l.from, l.to) === level - 1 : Math.max(l.from, l.to) === 0));
        if (!arrival) return { reason: 'envelope', step: 'arrival' };
        root = { id: owner.get(arrival.id) };
        rootRect = placed.get(arrival.id);
    }
    // Réseau : couloirs, couloir du schéma, pièces ouvertes (le palier de l'escalier est un couloir)
    const isNetwork = (id) => isCorridor(id) || id === SCHEME || circulation.has(id);

    // Côtés ouverts d'une cage à ce niveau (§24) : réunion des côtés de ses escaliers, null = tous
    const groupSides = (group) => {
        const all = group.map(l => linkSidesAt(l, placed.get(l.id), level));
        return all.some(s => s === null) ? null : [...new Set(all.flat())];
    };

    // Palier de l'escalier d'arrivée (§24, ES-1 à ES-3) : des cases de couloir devant chaque côté
    // ouvert, sur toute sa largeur (§33, PA-1), d'où part la circulation du niveau ; ses autres
    // côtés restent fermés. Une trappe garde une seule case de palier. Sur un niveau sans couloir,
    // le palier reste réservé (`held`) jusqu'à ce que les pièces aient grandi (§34, CO-7).
    const fixed = new Set();
    const held = [];
    let netRoot = root, landing = null, landingKeys = null;
    if (!entrance) {
        // Colimaçon : l'ouverture de ce niveau, tirée parmi les côtés au palier libre (§34, CO-2)
        if (rootRect.spiral) {
            const options = Object.keys(SIDES).filter(s => landingCells(rootRect, s).every(c => isFree(g, ...c)));
            if (!options.length) return { reason: 'envelope', step: 'landing' };
            rootRect.spiral[level] = rnd.pick(options);
        }
        const sides = groupSides(levelLinks.filter(l => owner.get(l.id) === root.id));
        const free = Object.keys(SIDES).map(s => landingOf(rootRect, s)).filter(c => isFree(g, ...c));
        const landings = sides ? sides.flatMap(s => landingCells(rootRect, s)) : free.length ? [rnd.pick(free)] : [];
        if (!landings.length || !landings.every(c => isFree(g, ...c))) return { reason: 'envelope', step: 'landing' };
        if (sides && levelWidth === 0) {
            landings.forEach(c => setOwner(g, ...c, LANDING));
            held.push(landings);
        } else landings.forEach(c => { setOwner(g, ...c, CORRIDOR); fixed.add(cellKey(c)); });
        landingKeys = new Set(landings.map(cellKey));
        netRoot = { id: CORRIDOR };
        landing = sides ? landingOf(rootRect, sides[0]) : landings[0];
    }

    // Couloir du schéma (§18.2, §25) : au RDC juste après l'entrée ; à l'étage, au-dessus de celui du
    // dessous si c'est le même schéma (E2-3), sinon au plus près du palier (CN-2)
    if (hasScheme) {
        if (level === 0) {
            if (!layScheme(g, scheme, width, facade, rootRect, rnd)) return { reason: 'envelope', step: 'scheme' };
        } else if (sameAsBelow) {
            below.schemeCells.filter(c => isFree(g, ...c)).forEach(c => setOwner(g, ...c, SCHEME));
        } else if (!layScheme(g, scheme, width, facade, rootRect, rnd, landing)) return { reason: 'envelope', step: 'scheme' };
    }

    // Liens à poser à ce niveau : dans la cage de l'escalier d'arrivée s'ils le prolongent vers le
    // haut, sinon de préférence contre le couloir du schéma. Un escalier droit reçoit son côté bas,
    // ses deux paliers (bas et haut) devant être dans le bâtiment ; au RDC, si l'étage aura un
    // couloir traversant à lui, son palier haut se place près de l'axe de ce couloir (CN-3)
    const anchors = [];
    const horizontal = g.width >= g.length;
    for (const link of levelLinks.filter(l => !placed.has(l.id))) {
        const continued = level > 0 && Math.min(link.from, link.to) === level && levelLinks.find(l => placed.has(l.id) && Math.max(l.from, l.to) === level && l.sizeInCells === link.sizeInCells);
        if (continued) {
            placed.set(link.id, placed.get(continued.id));
            owner.set(link.id, owner.get(continued.id));
            continue;
        }
        const validBottoms = (r) => (!isOriented(r) ? [null] : shortSides(r).filter(s => [s, OPPOSITE[s]].every(side =>
            landingCells(r, side).every(([lx, ly]) => inside(g, lx, ly) && ownerAt(g, lx, ly) !== OUTSIDE))));
        const towardAxis = level === 0 && aboveSpine && Math.min(link.from, link.to) === 0 && Math.max(link.from, link.to) === 1;
        const axisGap = (r, b) => {
            const [lx, ly] = landingOf(r, b ? OPPOSITE[b] : 'n');
            return Math.abs((horizontal ? ly : lx) - ((horizontal ? g.length : g.width) - 1) / 2);
        };
        // Colimaçon (§34) : cage carrée, une ouverture à ce niveau parmi les côtés dont le palier est
        // dans le bâtiment ; contre un mur extérieur, de préférence dans un angle (CO-6)
        const spiral = link.kind === 'spiral';
        const openings = (r) => Object.keys(SIDES).filter(s => landingCells(r, s).every(([lx, ly]) => inside(g, lx, ly) && ownerAt(g, lx, ly) !== OUTSIDE));
        const walls = (r) => 2 * ((r.x === 0) + (r.y === 0) + (r.x + r.w === g.width) + (r.y + r.h === g.length));
        const prefer = spiral ? walls : towardAxis ? (r) => -Math.min(...validBottoms(r).map(b => axisGap(r, b))) : null;
        const accept = spiral ? (r) => openings(r).length > 0 : (r) => validBottoms(r).length > 0;
        const rect = placeStructural(g, linkShapes(link.sizeInCells, spiral), level === 0 ? facade : null, rnd, hasScheme ? SCHEME : null, accept, prefer);
        if (!rect) return { reason: 'envelope', step: 'structural' };
        // Au RDC, l'escalier qui monte ouvre de préférence vers l'entrée (§33, PA-2), sauf si
        // l'axe du couloir de l'étage décide déjà (CN-3)
        const entranceGap = (b) => distance(landingOf(rect, b), rectCentre(rootRect));
        if (spiral) {
            const sides = openings(rect);
            const best = level === 0 ? Math.min(...sides.map(entranceGap)) : null;
            rect.spiral = { [level]: rnd.pick(level === 0 ? sides.filter(s => entranceGap(s) === best) : sides) };
        } else {
            const bottoms = validBottoms(rect);
            const towardEntrance = level === 0 && !towardAxis && Math.min(link.from, link.to) === 0 && bottoms[0] !== null;
            const best = towardAxis ? Math.min(...bottoms.map(b => axisGap(rect, b)))
                : towardEntrance ? Math.min(...bottoms.map(entranceGap)) : null;
            rect.bottom = rnd.pick(towardAxis ? bottoms.filter(b => axisGap(rect, b) === best)
                : towardEntrance ? bottoms.filter(b => entranceGap(b) === best) : bottoms);
        }
        placed.set(link.id, rect);
        owner.set(link.id, link.id);
        rectCells(rect.x, rect.y, rect.w, rect.h).forEach(c => setOwner(g, ...c, link.id));
        // Palier du côté ouvert à ce niveau, réservé tant que les couloirs ne l'ont pas atteint ;
        // sans couloir, jusqu'à ce que les pièces aient grandi (PA-1)
        const open = linkSidesAt(link, rect, level);
        if (open) {
            const cells = open.flatMap(s => landingCells(rect, s)).filter(c => isFree(g, ...c));
            cells.forEach(c => setOwner(g, ...c, LANDING));
            held.push(cells);
        }
    }
    const linkNodes = [...new Set(levelLinks.map(l => owner.get(l.id)))]
        .map(id => ({ id, sides: groupSides(levelLinks.filter(l => owner.get(l.id) === id)) }));
    linkNodes.filter(l => l.id !== root.id).forEach(l => {
        const rect = placed.get(levelLinks.find(x => owner.get(x.id) === l.id).id);
        // Le couloir rejoint le palier par n'importe laquelle de ses cases (PA-1), sans le longer
        anchors.push({ id: l.id, rect, landings: l.sides ? new Set(l.sides.flatMap(s => landingCells(rect, s)).map(cellKey)) : null });
    });
    for (const room of rooms.filter(r => r.structural && r !== entrance)) {
        const rect = placeStructural(g, shapesFor(room.sizeMin, room.sizeMax, room.maxRatio), level === 0 ? facade : null, rnd);
        if (!rect) return { reason: 'envelope', step: 'structural' };
        rectCells(rect.x, rect.y, rect.w, rect.h).forEach(c => setOwner(g, ...c, room.id));
        room.area = rect.w * rect.h;
        anchors.push({ id: room.id, rect });
    }

    // Pièce maîtresse (§25, CN-4) : posée juste après l'entrée et les structurants, à l'emplacement
    // voulu par le preset, avec sa part du niveau ; les couloirs partent d'elle et les autres pièces
    // se rangent autour (contact recherché avec le réseau, dont elle fait partie)
    const hubRoom = hub ? rooms.find(r => r.typeId === hub.room) : null;
    if (hubRoom) {
        const [low, high] = hub.share ?? engine.hubShare;
        const share = low + rnd.next() * (high - low);
        const target = Math.min(hubRoom.sizeMax, Math.max(hubRoom.sizeMin, Math.round(cellsOf(g, null).length * share)));
        const rect = placeHub(g, hubRoom, target, hub.position ?? 'centre', rootRect, root.id, level === 0 ? facade : null, rnd);
        if (!rect) return { reason: 'envelope', step: 'hub' };
        rectCells(rect.x, rect.y, rect.w, rect.h).forEach(c => setOwner(g, ...c, hubRoom.id));
        hubRoom.rect = { x0: rect.x, y0: rect.y, x1: rect.x + rect.w - 1, y1: rect.y + rect.h - 1 };
        hubRoom.area = rect.w * rect.h;
    }

    // Surfaces cibles : l'espace libre réparti entre les pièces (couloir à venir estimé)
    const growing = rooms.filter(r => r !== entrance && !r.structural)
        .sort((a, b) => (Boolean(a.hostId) - Boolean(b.hostId)) || ((b.outsideAccess === 'required') - (a.outsideAccess === 'required')) || (b.circulation - a.circulation) || (b.sizeMax - a.sizeMax));
    const setTargets = (group, free) => {
        const sumMin = group.reduce((s, r) => s + r.sizeMin, 0);
        const sumMax = group.reduce((s, r) => s + r.sizeMax, 0);
        if (sumMin > free) return false;
        const t = sumMax > sumMin ? Math.min(1, (free - sumMin) / (sumMax - sumMin)) : 1;
        for (const room of group) {
            const jitter = 0.85 + rnd.next() * 0.3;
            room.target = Math.min(room.sizeMax, Math.max(room.sizeMin, Math.round((room.sizeMin + (room.sizeMax - room.sizeMin) * t) * jitter)));
        }
        return true;
    };
    const corridorEstimate = hasScheme ? 0 : levelWidth * Math.max(g.width, g.length);
    // La pièce maîtresse a déjà sa surface : elle garde sa cible
    if (!setTargets(growing.filter(r => r !== hubRoom), cellsOf(g, null).length - corridorEstimate)) return { reason: 'overload', step: 'free' };
    if (hubRoom) hubRoom.target = hubRoom.area;
    const first = entrance ? [entrance] : [];

    // Pièces prioritaires (§13, O-1, O-2) : posées et grandies avant les couloirs
    const priority = growing.filter(r => r.priority);
    const others = growing.filter(r => !r.priority);
    if (!placeRooms(g, priority, first, isNetwork, rnd)) return { reason: 'envelope', step: 'rooms' };
    growRectangles(g, priority, rnd, false);
    addWings(g, priority, rnd);

    // Raccordement du couloir du schéma au réseau s'il ne le touche pas ; couloir et raccordement
    // deviennent du couloir fixe, jamais élagué. Ses cases servent de modèle à l'étage du dessus.
    const schemeCells = cellsOf(g, SCHEME);
    if (hasScheme && schemeCells.length) {
        const network = reachedNetwork(g, netRoot, circulation);
        if (!schemeCells.some(([x, y]) => around(x, y).some(n => network.has(ownerAt(g, n.x, n.y))))) {
            const before = new Set(cellsOf(g, CORRIDOR).map(cellKey));
            const path = findPath(g, corridorStarts(g, network), (x, y) => around(x, y).some(n => ownerAt(g, n.x, n.y) === SCHEME), rnd);
            if (!path) return { reason: 'envelope', step: 'scheme' };
            layCorridor(g, path, width);
            cellsOf(g, CORRIDOR).filter(c => !before.has(cellKey(c))).forEach(c => fixed.add(cellKey(c)));
        }
        schemeCells.forEach(c => { setOwner(g, ...c, CORRIDOR); fixed.add(cellKey(c)); });
    }

    // Couloirs provisoires (§6.1 étape 3) vers les liens, les structurants et les pièces
    // prioritaires, du plus proche de la racine au plus lointain. Ramifications : pas avec un
    // couloir traversant, qui dessert déjà les deux côtés ; avec une galerie, oui, pour atteindre
    // le fond d'un bâtiment plus profond que les pièces (§20.3)
    if (levelWidth > 0) {
        const rootCentre = rectCentre(rootRect);
        const anchorIds = [...anchors, ...priority.map(r => ({ id: r.id, rect: { x: r.rect.x0, y: r.rect.y0, w: r.rect.x1 - r.rect.x0 + 1, h: r.rect.y1 - r.rect.y0 + 1 } }))]
            .sort((a, b) => distance(rectCentre(a.rect), rootCentre) - distance(rectCentre(b.rect), rootCentre))
            .map(({ id, landings }) => ({ id, landings }));
        const reach = scheme === 'spine' ? Infinity : Math.max(density.reach, Math.ceil(Math.sqrt(Math.max(...rooms.map(r => r.sizeMax), 1))));
        // Palier rendu aux couloirs, qui le rejoignent, puis complété sur toute sa largeur (PA-1)
        held.flat().forEach(c => setOwner(g, ...c, null));
        if (!layCorridors(g, netRoot, circulation, anchorIds, levelWidth, reach, rnd)) return { reason: 'envelope', step: 'corridors' };
        held.flat().filter(c => isFree(g, ...c)).forEach(c => { setOwner(g, ...c, CORRIDOR); fixed.add(cellKey(c)); });
    }

    // Autres pièces (§6.1 étape 4), cibles recalculées sur l'espace réellement libre. Restes :
    // contour libre au RDC selon le réglage, toujours à l'étage (étage plus petit, §20, E2-7),
    // non excavé au sous-sol
    const outline = basement ? 'excavate' : level > 0 ? true : params.freeOutline;
    if (!setTargets(others, cellsOf(g, null).length)) return { reason: 'overload', step: 'free' };
    if (!placeRooms(g, others, [...first, ...priority], isNetwork, rnd, level !== 0 && levelWidth > 0)) return { reason: 'envelope', step: 'rooms' };
    // Annexes sans place contre leur hôte : mises de côté, découpées plus loin dans l'hôte s'il le
    // permet, sinon abandonnées (§23, AC-3 ; §32)
    const homeless = rooms.filter(r => r.dropped);
    for (const list of [rooms, growing, others]) {
        for (let i = list.length - 1; i >= 0; i--) if (list[i].dropped) list.splice(i, 1);
    }
    growRectangles(g, others, rnd, false);
    addWings(g, others, rnd);
    growRectangles(g, [...first, ...growing], rnd, true);
    settleLeftovers(g, [...first, ...growing], outline);
    // Niveau sans couloir : le palier encore réservé revient à la pièce sur laquelle l'escalier
    // débouche (de préférence une pièce ouverte), si elle garde une forme rectangle ou L (la bande
    // d'une case devant l'escalier admise : c'est le palier) et sa taille, proportions non comptées ;
    // sinon il devient un dégagement devant l'escalier (§33, PA-1 ; §34, CO-7)
    rooms.forEach(r => delete r.landing);
    for (const group of held) {
        const cells = group.filter(c => ownerAt(g, ...c) === LANDING);
        if (!cells.length) continue;
        const contact = new Map();
        cells.forEach(([x, y]) => around(x, y).forEach(n => { const o = ownerAt(g, n.x, n.y); contact.set(o, (contact.get(o) ?? 0) + 1); }));
        const host = rooms.filter(r => contact.has(r.id) && !r.hostId && !r.outdoor && r.circulationAccess !== 'forbidden')
            // Pièce ouverte d'abord, pièce qu'on ne traverse pas en dernier : on doit pouvoir en repartir
            .sort((a, b) => (Boolean(b.circulation) - Boolean(a.circulation)) || (Boolean(a.noTransit) - Boolean(b.noTransit)) || (contact.get(b.id) - contact.get(a.id)))
            .find(r => {
                cells.forEach(c => setOwner(g, ...c, r.id));
                const own = cellsOf(g, r.id);
                if (shapeKind(own, 1) && own.length <= Math.floor(r.sizeMax * (1 + engine.leftoverOverflow))) return (r.landing = true);
                cells.forEach(c => setOwner(g, ...c, LANDING));
                return false;
            });
        if (!host) cells.forEach(c => { setOwner(g, ...c, CORRIDOR); fixed.add(cellKey(c)); });
    }

    // Élagage des culs-de-sac (§13, O-3) : les pièces regrandissent dans l'espace rendu, puis largeur maximale
    if (levelWidth > 0) {
        pruneCorridors(g, rooms, linkNodes, root, levelWidth, fixed);
        growRectangles(g, [...first, ...growing], rnd, true);
        settleLeftovers(g, [...first, ...growing], outline);
    }
    // Un dégagement trop large : de la place que les pièces n'ont pas pu occuper (§19, D-3)
    if (tooWide(g, maxWidth)) return { reason: 'unfilled', step: 'width' };
    const corridorParts = splitCorridors(g, rooms, root, landingKeys);
    // Desserte par le vrai réseau : couloir principal et pièces ouvertes, pas un dégagement isolé
    const servesRoom = (id) => (isCorridor(id) && !corridorParts.recesses.includes(id)) || circulation.has(id);
    const touchesNetwork = (cells) => cells.some(([x, y]) => around(x, y).some(n => servesRoom(ownerAt(g, n.x, n.y))));

    // Découpe d'une annexe dans son hôte (§32), complétant `base` s'il y a lieu : l'hôte garde son
    // contact avec le réseau et, s'il lui est obligatoire, avec l'extérieur ; les voisinages restent
    // valides. Rend vrai si l'annexe a pris ses cases.
    const carveAnnex = (host, type, base, annex, extra = []) => {
        const before = cellsOf(g, host.id);
        const net = touchesNetwork(before);
        const out = host.outsideAccess === 'required' && before.some(c => touchesOutside(g, ...c));
        const keeps = (left) => (!net || touchesNetwork(left)) && (!out || left.some(c => touchesOutside(g, ...c)));
        for (const { cells } of shrinkCandidates(g, host, type, base, keeps, touchesNetwork).slice(0, 6)) {
            const previous = cells.map(c => ownerAt(g, ...c));
            cells.forEach(c => setOwner(g, ...c, annex.id));
            if (adjacencyIsValid([...rooms, ...extra, annex], sharedWalls(g))) return true;
            cells.forEach((c, i) => setOwner(g, ...c, previous[i]));
        }
        return false;
    };
    for (const annex of homeless) {
        const host = rooms.find(r => r.id === annex.hostId);
        if (host && carveAnnex(host, annex, [], annex)) { delete annex.dropped; rooms.push(annex); }
    }

    // Petits restes isolés → annexes imposées par la place (§29, §31) : un dégagement isolé d'au plus
    // `closetMaxSize` cases, en rectangle ou en L (marche d'une case admise), devient une annexe
    // d'une pièce voisine qui l'accepte (jamais une annexe ni une cour) : l'annexe qui manque à
    // cette pièce si sa taille convient (dressing ou salle d'eau attenante d'une chambre, cellier
    // d'une cuisine…), même si la graine ne l'avait pas tirée ; sinon un débarras. Les plus grands
    // restent des dégagements.
    if (closetType) {
        const added = [];
        const accepts = (host, type) => !host.access.forbidden.includes(type.id)
            && ((!host.access.optional.length && !host.access.required.length) || host.access.optional.includes(type.id));
        // La pièce a déjà une annexe de ce type (la sienne, ou une pièce de ce type sans hôte qui
        // lui est destinée : le cellier du programme pour la cuisine)
        const hasAnnex = (host, type) => [...rooms, ...added].some(r => r.typeId === type.id
            && (r.hostId === host.id || (!r.hostId && type.access.required.includes(host.typeId))));
        const annexFor = (host, type) => ({
            ...type, id: `${type.id}-${level}-s${added.length + 1}`, typeId: type.id, level, hostId: host.id, fromSpace: true,
            access: { ...type.access, required: [host.typeId] },
            maxRatio: Math.max(type.ratioMax, 1 / type.ratioMin),
        });
        for (const id of [...corridorParts.recesses]) {
            const cells = cellsOf(g, id);
            if (cells.length > engine.closetMaxSize) continue;
            const box = bounds(cells);
            const fits = (type) => cells.length >= type.sizeMin && cells.length <= type.sizeMax
                && ratioOf(box.w, box.h) <= Math.max(type.ratioMax, 1 / type.ratioMin) && shapeKind(cells, 1) !== null;
            const hosts = [...new Set(cells.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))))]
                .map(o => rooms.find(r => r.id === o))
                .filter(r => r && !r.outdoor && !r.access.required.length);
            // Ordre de préférence : l'annexe qui manque telle quelle, puis complétée par des cases
            // de l'hôte (§32) ; à défaut un débarras tel quel, puis complété
            const missing = (host) => spaceAnnexTypes.filter(type => type.access.required.includes(host.typeId) && accepts(host, type) && !hasAnnex(host, type));
            const asIs = (pairs) => pairs.filter(({ type }) => fits(type));
            const annexes = hosts.flatMap(host => missing(host).map(type => ({ host, type })));
            const closets = hosts.filter(host => accepts(host, closetType) && !hasAnnex(host, closetType)).map(host => ({ host, type: closetType }));
            let annex = null;
            for (const [pairs, shrink] of [[annexes, false], [annexes, true], [closets, false], [closets, true]]) {
                if (!shrink) {
                    const options = asIs(pairs);
                    if (!options.length) continue;
                    const { host, type } = rnd.pick(options);
                    annex = annexFor(host, type);
                    cells.forEach(c => setOwner(g, ...c, annex.id));
                    break;
                }
                annex = pairs.map(({ host, type }) => ({ host, type, annex: annexFor(host, type) }))
                    .find(({ host, type, annex: a }) => carveAnnex(host, type, cells, a, added))?.annex ?? null;
                if (annex) break;
            }
            if (!annex) continue;
            added.push(annex);
            corridorParts.recesses.splice(corridorParts.recesses.indexOf(id), 1);
        }
        // Numérotation par type quand il y en a plusieurs : « Débarras 1 », « Débarras 2 »
        for (const typeId of new Set(added.map(a => a.typeId))) {
            const same = added.filter(a => a.typeId === typeId);
            if (same.length > 1) same.forEach((a, i) => { a.label = `${a.label} ${i + 1}`; });
        }
        rooms.push(...added);
    }

    // Contrôles : formes, accès extérieur, voisinages, desserte par le réseau
    const roomCells = new Map(rooms.map(r => [r.id, cellsOf(g, r.id)]));
    // Pièce qui a reçu le palier d'un escalier : vérifiée à l'absorption (CO-7)
    if (![...first, ...growing].every(r => r.landing || shapeIsValid(r, roomCells.get(r.id), engine.leftoverOverflow))) return { reason: 'seed', step: 'shape' };
    if (level === 0 && !rooms.filter(r => r.outsideAccess === 'required').every(r => roomCells.get(r.id).some(c => touchesOutside(g, ...c)))) return { reason: 'seed', step: 'exterior' };
    if (!adjacencyIsValid(rooms, sharedWalls(g))) return { reason: 'adjacency', step: 'adjacency' };
    if (!rooms.filter(r => r !== entrance && r.circulationAccess !== 'forbidden' && (levelWidth > 0 || r.circulationAccess === 'required')).every(r => touchesNetwork(roomCells.get(r.id)))) return { reason: 'seed', step: 'served' };

    // Portes (§6.1 étape 5)
    const { doors, connected } = placeDoors(g, rooms, linkNodes, corridorParts, root, level === 0 ? facade : null, density, rnd);
    if (!connected) return { reason: 'seed', step: 'doors' };

    return {
        floor: {
            level,
            width:  g.width,
            length: g.length,
            facade: level === 0 ? facade : null,
            rooms: rooms.map(r => ({
                id: r.id, typeId: r.typeId, label: r.label,
                outsideAccess: r.outsideAccess, circulation: !!r.circulation, outdoor: !!r.outdoor, hostId: r.hostId ?? null, fromSpace: !!r.fromSpace, landing: !!r.landing,
                cells: roomCells.get(r.id), labelBox: largestRect(roomCells.get(r.id)),
            })),
            corridor: cellsWhere(g, isCorridor),
            voids: cellsOf(g, OUTSIDE),
            // Un lien par cage d'escalier, avec les niveaux qu'elle dessert depuis celui-ci
            links: linkNodes.map(({ id }) => {
                const group = levelLinks.filter(l => owner.get(l.id) === id);
                const { x, y, w, h } = placed.get(group[0].id);
                return { id, label: group[0].label, kind: group[0].kind ?? 'straight', x, y, w, h, sides: groupSides(group), targets: group.map(l => (l.from === level ? l.to : l.from)).sort((a, b) => a - b) };
            }),
            doors,
            schemeCells,
        },
    };
};

// Une tentative sur tout le bâtiment : RDC, étages en montant, puis sous-sol (§20, E2-1)
const attemptBuilding = (program, params, density, rooms, links, rnd) => {
    const maxWidth = params.corridorMaxWidth ?? engine.corridorMaxWidth;
    const levels = levelsOf(params);

    // Schéma de circulation de chaque niveau (§18.2, §25) : imposé par la page à tous les niveaux,
    // ou tiré pour chaque niveau parmi ceux du preset ; un niveau qui a le même schéma du preset
    // que celui du dessous garde le même tirage (son couloir s'y superpose, E2-3). Sa largeur
    // prime sur celle de la densité ; enfilade = aucun couloir.
    const choice = params.scheme ?? 'preset';
    const schemes = new Map();
    for (const level of [...levels].sort((a, b) => a - b)) {
        const layout = layoutFor(program, level);
        if (choice !== 'preset') schemes.set(level, choice === 'free' ? null : choice);
        else if (level > 0 && layoutFor(program, level - 1) === layout) schemes.set(level, schemes.get(level - 1));
        else schemes.set(level, layout?.schemes?.length ? rnd.pick(layout.schemes) : null);
    }
    const widthOf = (level) => {
        const scheme = schemes.get(level);
        return scheme === 'enfilade' ? 0
            : scheme && scheme !== 'hub' ? Math.min(layoutFor(program, level)?.width ?? engine.schemeWidth, maxWidth)
            // Pièce maîtresse : couloirs de la largeur du preset s'il la donne, sinon de la densité
            : scheme === 'hub' ? Math.min(layoutFor(program, level)?.width ?? density.corridorWidth, maxWidth)
            : Math.min(density.corridorWidth, maxWidth);
    };
    const sameAsBelow = (level) => level > 0 && schemes.get(level) === schemes.get(level - 1) && widthOf(level) === widthOf(level - 1);
    const aboveSpine = schemes.get(1) === 'spine' && !sameAsBelow(1);

    const facade = rnd.pick(Object.keys(SIDES));
    const placed = new Map();
    const floors = [];
    for (const level of [...levels.filter(l => l >= 0), ...levels.filter(l => l < 0)]) {
        const below = level > 0 ? floors.find(f => f.level === level - 1) : floors.find(f => f.level === 0);
        // Hors RDC, un niveau a plusieurs essais sur le même dessous avant qu'on reprenne tout le
        // bâtiment ; les liens posés par un essai raté sont oubliés
        let result;
        for (let i = 0; i < (level === 0 ? 1 : engine.levelAttempts); i++) {
            const tried = new Map(placed);
            const levelRooms = rooms.filter(r => r.level === level).map(r => ({ ...r }));
            result = attemptLevel(levelRooms, {
                level, params, density, scheme: schemes.get(level), width: widthOf(level), maxWidth, facade, links, placed: tried, below, rnd,
                sameAsBelow: sameAsBelow(level), aboveSpine: level === 0 && aboveSpine, closetType: program.closetType, spaceAnnexTypes: program.spaceAnnexTypes,
                hub: schemes.get(level) === 'hub' ? layoutFor(program, level)?.hub ?? null : null,
            });
            if (result.floor) { tried.forEach((rect, id) => placed.set(id, rect)); break; }
        }
        if (!result.floor) return { reason: result.reason, step: `${level}:${result.step}` };
        floors.push(result.floor);
    }
    return { floors: floors.sort((a, b) => a.level - b.level) };
};

/**
 * Génère un plan (spec_genmap.md §6, §20) : tous les niveaux du bâtiment.
 * @param {{ rooms: object[], optionalRooms?: object[], verticalLinks: object[], layout? }} program  types complets + quantité
 * @param {{ width, length, floors, basement, density, seed, corridorMaxWidth?, freeOutline?, scheme? }} params
 * @returns {{ ok: true, plan: { seed, attempt, floors } } | { ok: false, reason: 'envelope'|'overload'|'oversize'|'unfilled'|'adjacency'|'seed', steps }}
 */
export const generate = (program, params) => {
    const density = engine.densities[params.density] ?? engine.densities.balanced;
    const surface = params.width * params.length;
    const maxWidth = params.corridorMaxWidth ?? engine.corridorMaxWidth;
    const links = buildLinks(program, params);

    // Largeur du couloir pour estimer la capacité : celle du schéma du preset, sinon de la densité
    const schemes = params.scheme && params.scheme !== 'preset' ? [params.scheme] : program.layout?.schemes ?? [];
    const corridorWidth = params.scheme === 'free' || !schemes.length ? Math.min(density.corridorWidth, maxWidth)
        : schemes.every(s => s === 'enfilade') ? 0
        : Math.min(program.layout?.width ?? engine.schemeWidth, maxWidth);

    // Pièces et étages, réservoir compris (§18.1) : tirés une fois par graine
    const rooms = buildRooms(program, params, links, corridorWidth, makeRandom(params.seed ^ 0x5bd1e995));

    // Contrôles préalables, au RDC : programme trop chargé, bâtiment trop grand pour son programme
    // (§17, S-2 ; en contour libre, le surplus peut être retiré du bâtiment : on tente quand même)
    const ground = rooms.filter(r => r.level === 0);
    const groundLinks = links.filter(l => linkTouches(l, 0)).reduce((s, l) => s + l.sizeInCells, 0);
    if (ground.reduce((s, r) => s + r.sizeMin, 0) + groundLinks > surface) return { ok: false, reason: 'overload' };
    const capacity = ground.reduce((s, r) => s + r.sizeMax, 0) + groundLinks + corridorWidth * Math.max(params.width, params.length);
    if (!params.freeOutline && surface - capacity > surface * engine.maxSurplus) return { ok: false, reason: 'oversize' };

    const failures = { envelope: 0, overload: 0, oversize: 0, unfilled: 0, adjacency: 0, seed: 0 };
    const steps = {};
    for (let i = 0; i < engine.attempts; i++) {
        // Les tentatives successives dérivent de la graine : le résultat reste reproductible
        const result = attemptBuilding(program, params, density, rooms, links, makeRandom(params.seed + i * 7919));
        if (result.floors) return { ok: true, plan: { seed: params.seed, attempt: i, floors: result.floors } };
        failures[result.reason]++;
        steps[result.step] = (steps[result.step] ?? 0) + 1;
    }
    const reason = Object.entries(failures).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    return { ok: false, reason, steps };
};
