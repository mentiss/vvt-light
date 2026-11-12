// src/client/src/features/genmap/tools/engine/structure.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Structurants : entrée, liens verticaux, schémas de circulation, escaliers orientés.

import engine from '../../data/engine.json';
import { OPPOSITE, OUTSIDE, inside, ownerAt, setOwner, isFree, around, rectCells, shapesFor, rectFits, touchesFacade } from './grid.js';

// Pièce d'entrée sur un bâtiment de gabarit (§40) : contre un mur de la façade (côté `facade` de
// la forme, pas forcément le bord de la grille), le mur continuant des deux côtés (jamais dans un
// angle), toutes ses cases dans le bâtiment
const placeEntranceInShape = (g, room, facade, rnd) => {
    const horizontal = facade === 'n' || facade === 's';
    const [fx, fy] = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[facade];
    const options = [];
    for (const [a, d] of shapesFor(room.sizeMin, room.sizeMax, room.maxRatio, 2)) {
        const [w, h] = horizontal ? [a, d] : [d, a];
        for (let y = 0; y + h <= g.length; y++) {
            for (let x = 0; x + w <= g.width; x++) {
                if (!rectFits(g, x, y, w, h, 0)) continue;
                const front = rectCells(x, y, w, h).filter(([cx, cy]) => (horizontal ? cy === (facade === 'n' ? y : y + h - 1) : cx === (facade === 'w' ? x : x + w - 1)));
                if (!front.every(([cx, cy]) => ownerAt(g, cx + fx, cy + fy) === OUTSIDE)) continue;
                // Le mur continue de part et d'autre : les cases voisines dans l'alignement sont dans le bâtiment
                const ends = horizontal ? [[x - 1, front[0][1]], [x + w, front[0][1]]] : [[front[0][0], y - 1], [front[0][0], y + h]];
                if (!ends.every(([ex, ey]) => inside(g, ex, ey) && ownerAt(g, ex, ey) !== OUTSIDE && ownerAt(g, ex + fx, ey + fy) === OUTSIDE)) continue;
                options.push({ x, y, w, h });
            }
        }
    }
    return options.length ? rnd.pick(options) : null;
};

// Pièce d'entrée : collée à la façade, jamais dans un angle
export const placeEntrance = (g, room, facade, rnd) => {
    if (g.owner.includes(OUTSIDE)) return placeEntranceInShape(g, room, facade, rnd);
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
export const placeStructural = (g, shapes, facade, rnd, alongId = null, accept = () => true, prefer = null) => {
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
export const SCHEME = 'scheme';

// Couloir traversant (`spine`, dans la longueur, pièces de part et d'autre, aligné sur l'entrée
// quand elle est sur un petit côté) ou galerie (`gallery`, contre le mur opposé à la façade).
// Seules les cases libres sont prises (le couloir s'arrête contre l'entrée). À l'étage, `toward`
// (palier de l'escalier) : le couloir traversant passe au plus près du palier (§25, CN-2).
// Renvoie false si le bâtiment est trop étroit pour le schéma.
export const layScheme = (g, scheme, width, facade, entranceRect, rnd, toward = null) => {
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
export const layoutFor = (program, level) => {
    const byLevel = program.layoutByLevel ?? {};
    return byLevel[String(level)] ?? byLevel[level > 0 ? 'upper' : level < 0 ? 'basement' : 'ground'] ?? program.layout;
};

// ── Escalier orienté (§24) ───────────────────────────────────────────────────

// Un escalier droit (rectangle allongé, 2 cases de large au moins) a un côté bas, l'un de ses
// petits côtés : on y entre au niveau inférieur, on sort par le petit côté opposé au niveau
// supérieur (ES-1). Trappe et escalier carré : ouverts de tous côtés (ES-4).
export const isOriented = (r) => r.w !== r.h && Math.min(r.w, r.h) >= 2;
export const shortSides = (r) => (r.h > r.w ? ['n', 's'] : ['e', 'w']);

// Côtés ouverts d'un lien à un niveau (null : tous). Colimaçon (§34) : un seul côté par niveau,
// choisi quand on traite ce niveau (`rect.spiral` : niveau → côté), commun à toute la cage
export const linkSidesAt = (link, rect, level) => (rect.spiral ? [rect.spiral[level]]
    : !isOriented(rect) ? null
    : [level === Math.min(link.from, link.to) ? rect.bottom : OPPOSITE[rect.bottom]]);

// Case de palier devant le milieu d'un côté du rectangle
export const landingOf = (r, side) => ({
    n: [r.x + Math.floor(r.w / 2), r.y - 1],
    s: [r.x + Math.floor(r.w / 2), r.y + r.h],
    w: [r.x - 1, r.y + Math.floor(r.h / 2)],
    e: [r.x + r.w, r.y + Math.floor(r.h / 2)],
}[side]);

// Palier complet : toutes les cases devant un côté, sur toute sa largeur (§33, PA-1)
export const landingCells = (r, side) => (side === 'n' || side === 's'
    ? Array.from({ length: r.w }, (_, i) => [r.x + i, side === 'n' ? r.y - 1 : r.y + r.h])
    : Array.from({ length: r.h }, (_, i) => [side === 'w' ? r.x - 1 : r.x + r.w, r.y + i]));

// Palier réservé au niveau de départ jusqu'au passage des couloirs (§33, PA-1)
export const LANDING = 'landing';

// Emprise d'un lien : la surface demandée (ou juste au-dessus), carrée pour un colimaçon (§34)
export const linkShapes = (area, square = false) => {
    let shapes = [];
    for (let a = area; !shapes.length; a++) shapes = shapesFor(a, a, engine.linkMaxRatio).filter(([w, h]) => !square || w === h);
    return shapes;
};
