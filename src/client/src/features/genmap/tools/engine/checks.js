// src/client/src/features/genmap/tools/engine/checks.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Contrôles d'un plan.

import { cellKey, bounds } from './grid.js';
import { wallBetween } from './doors.js';

// Plus grand rectangle contenu dans la pièce : emplacement du libellé
export const largestRect = (cells) => {
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
export const adjacencyIsValid = (rooms, walls) => rooms.every(room => {
    const near = rooms.filter(o => o !== room && wallBetween(walls, room.id, o.id)).map(o => o.typeId);
    const present = new Set(rooms.map(r => r.typeId));
    const required = room.access.required.filter(t => present.has(t));
    return room.mustBeAdjacentTo.every(t => !present.has(t) || near.includes(t))
        && room.cannotBeAdjacentTo.every(t => !near.includes(t))
        && (!required.length || required.some(t => near.includes(t)))
        && (!room.hostId || Boolean(wallBetween(walls, room.id, room.hostId)));
});
