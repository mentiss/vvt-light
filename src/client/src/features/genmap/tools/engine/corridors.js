// src/client/src/features/genmap/tools/engine/corridors.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Couloirs : chemins, pose, réseau atteint.

import engine from '../../data/engine.json';
import { CORRIDOR, ownerAt, setOwner, isFree, around, cellsOf, cellsWhere } from './grid.js';
import { createHeap } from './heap.js';

// Chemin le moins coûteux (virages pénalisés) depuis des cases de départ vers une case cible,
// sur les cases libres. Renvoie les nœuds du chemin (départ compris), chacun avec sa direction.
export const findPath = (g, starts, isTarget, rnd) => {
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
export const layCorridor = (g, path, width) => {
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
export const reachedNetwork = (g, entrance, circulation) => {
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
export const corridorStarts = (g, network) => cellsWhere(g, id => id === null || id === CORRIDOR)
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
export const layCorridors = (g, entrance, circulation, anchors, width, reach, rnd) => {
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
