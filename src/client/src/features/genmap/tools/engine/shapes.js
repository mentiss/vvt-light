// src/client/src/features/genmap/tools/engine/shapes.js
// Moteur du générateur de plans (spec_genmap.md §16, §40, M5).
// Gabarits du bâtiment : L, T, U, croix latine. Largeur et longueur restent celles du rectangle
// englobant ; le gabarit retire les cases hors forme avant toute génération. Proportions tirées par
// la graine dans les plages de data/shapes.json (B-2) ; orientation tirée parmi les côtés possibles.

import data from '../../data/shapes.json';

export const SHAPES = data.shapes;

const between = (rnd, [low, high]) => low + rnd.next() * (high - low);

// Taille d'une partie, au moins `minPart` cases et en laissant `minPart` cases au reste
const part = (total, fraction) => Math.min(total - data.minPart, Math.max(data.minPart, Math.round(total * fraction)));

// Forme dans un repère canonique (u sur la largeur W, v sur la hauteur H, « haut » = v petit) :
// rend la fonction « case dans le bâtiment »
const MASKS = {
    // Encoche dans l'angle haut droit
    L: (W, H, s, rnd) => {
        const nw = part(W, between(rnd, s.notchWidth)), nh = part(H, between(rnd, s.notchDepth));
        return (u, v) => !(u >= W - nw && v < nh);
    },
    // Barre en haut, pied centré
    T: (W, H, s, rnd) => {
        const bar = part(H, between(rnd, s.barDepth)), stem = part(W, between(rnd, s.stemWidth));
        const s0 = Math.floor((W - stem) / 2);
        return (u, v) => v < bar || (u >= s0 && u < s0 + stem);
    },
    // Base en bas, deux ailes, cour ouverte en haut au milieu
    U: (W, H, s, rnd) => {
        const base = part(H, between(rnd, s.baseDepth));
        const gap = Math.min(W - 2 * data.minPart, Math.max(1, Math.round(W * between(rnd, s.gapWidth))));
        const g0 = Math.floor((W - gap) / 2);
        return (u, v) => v >= H - base || u < g0 || u >= g0 + gap;
    },
    // Nef verticale centrée, transept pleine largeur près de la tête (en haut)
    latin_cross: (W, H, s, rnd) => {
        const nave = part(W, between(rnd, s.naveWidth));
        const depth = Math.max(data.minPart, Math.round(H * between(rnd, s.transeptDepth)));
        const t0 = Math.max(data.minPart, Math.round(H * between(rnd, s.transeptAt)));
        const n0 = Math.floor((W - nave) / 2);
        return (u, v) => (u >= n0 && u < n0 + nave) || (v >= t0 && v < t0 + depth);
    },
};

// Cercle (§40.1, CE-1 à CE-3) : disque inscrit dans le carré de la plus petite dimension, centré ;
// une case en fait partie si son centre est dans le disque. Les cases hors du disque à l'intérieur
// de l'enveloppe sont « rognées » (`clip`) : une pièce rectangle ou L peut les perdre (CE-2). Rend
// aussi le cercle (en cases) pour le dessin du mur en arc.
const circleMask = (width, length) => {
    const d = Math.min(width, length);
    if (d < 2 * data.minPart + 1) return null;
    const cx = width / 2, cy = length / 2, r = d / 2;
    const outside = [];
    for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
            if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 > r * r) outside.push(`${x},${y}`);
        }
    }
    return { outside, side: null, clip: true, circle: { cx, cy, r } };
};

// Passage du repère de la grille au repère canonique, selon le côté où la forme a son « haut »
const FRAMES = {
    n: (x, y, w, h) => [x, y, w, h],
    s: (x, y, w, h) => [x, h - 1 - y, w, h],
    w: (x, y, w, h) => [y, x, h, w],
    e: (x, y, w, h) => [y, w - 1 - x, h, w],
};

/**
 * Cases hors du bâtiment pour un gabarit.
 * @param {string} id  identifiant du gabarit (data/shapes.json)
 * @returns {{ outside: string[], side: string } | null}  cases « x,y » retirées, côté du « haut » ;
 *          null si le gabarit est inconnu ou n'entre pas dans les dimensions
 */
export const shapeMask = (id, width, length, rnd) => {
    const shape = SHAPES.find(s => s.id === id);
    if (!shape) return null;
    if (id === 'circle') return circleMask(width, length);
    // La croix latine a sa nef dans la grande dimension ; les autres formes, n'importe quel côté
    const sides = Object.keys(FRAMES).filter(side => {
        const [, , W, H] = FRAMES[side](0, 0, width, length);
        return Math.min(W, H) >= 2 * data.minPart + 1 && (id !== 'latin_cross' || H >= W);
    });
    if (!sides.length) return null;
    const side = rnd.pick(sides);
    const [, , W, H] = FRAMES[side](0, 0, width, length);
    const inside = MASKS[id](W, H, shape, rnd);
    const outside = [];
    for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
            const [u, v] = FRAMES[side](x, y, width, length);
            if (!inside(u, v)) outside.push(`${x},${y}`);
        }
    }
    return { outside, side };
};
