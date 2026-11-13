// src/client/src/features/genmap/tools/engine/rooms.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Pièces : placement, croissance, ailes, restes, élagage des couloirs.

import engine from '../../data/engine.json';
import { SIDES, OUTSIDE, CORRIDOR, isCorridor, ownerAt, setOwner, isFree, around, touchesOutside, cellKey, rectCells, cellsOf, cellsWhere, bounds, ratioOf, rectCentre, regionsOf, shapesFor, rectFits, touchesFacade, shapeKind, shapeIsValid, isClip, withClip } from './grid.js';

const centre = (r) => [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2];
export const distance = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

// Une pièce doit toucher ce type : voisinage imposé ou accès obligatoire (§23)
const needsNext = (room, other) => room.mustBeAdjacentTo.includes(other.typeId) || room.access.required.includes(other.typeId);

// Pièce maîtresse (§25, CN-4) : un rectangle de la surface voulue, à l'emplacement que demande le
// preset : `centre` (au milieu du niveau), `axis` (contre la racine, sur son axe : l'entrée au RDC),
// `facade` (contre la façade, près de la racine). Renvoie { x, y, w, h } ou null.
export const placeHub = (g, room, target, position, anchor, anchorId, facade, rnd) => {
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
// `attract` : type de pièce → cages d'escalier qui l'attirent (§38.5, ST-3), contact recherché.
export const placeRooms = (g, rooms, before, isNetwork, rnd, servedOnly = false, attract = null) => {
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
                    // Bâtiment rond (§40.1) : l'amorce peut déborder sur des cases rognées par le disque
                    const all = rectCells(x, y, w, h);
                    if (g.clip?.size ? !all.every(c => isFree(g, ...c) || isClip(g, ...c)) : !rectFits(g, x, y, w, h, 0)) continue;
                    const cells = g.clip?.size ? all.filter(c => isFree(g, ...c)) : all;
                    if (!cells.length) continue;
                    const outside = cells.some(c => touchesOutside(g, ...c));
                    if (room.outsideAccess === 'required' && !outside) continue;
                    // Exposition (§39, B2-9) : obligation = position refusée, préférence = note ; la
                    // fenêtre ne compte pas au sous-sol
                    const wantsWindow = room.exposure === 'window' && room.level >= 0;
                    if (room.exposureRequired && ((wantsWindow && !outside) || (room.exposure === 'interior' && outside))) continue;
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
                    if ([...(attract?.get(room.typeId) ?? [])].some(id => touching.has(id))) score += 10;
                    if (wantsWindow && outside) score += 5;
                    if (room.exposure === 'interior' && outside) score -= 5;
                    for (const r of placed) {
                        if (needsNext(room, r) || needsNext(r, room)) {
                            score += touching.has(r.id) ? 8 : -distance(centre(rect), centre(r.rect)) * 0.3;
                        }
                        if ((room.cannotBeAdjacentTo.includes(r.typeId) || r.cannotBeAdjacentTo.includes(room.typeId)) && touching.has(r.id)) score -= 20;
                        // Préférences de voisinage du type (§43) : se regrouper avec ses semblables
                        // (cellules), chercher (`near`) ou éviter (`avoid`) certains types ; jamais obligatoires
                        if (!touching.has(r.id)) continue;
                        if (room.grouped && r.typeId === room.typeId) score += 12;
                        if (room.near?.includes(r.typeId)) score += 8;
                        if (room.avoid?.includes(r.typeId)) score -= 15;
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
export const growRectangles = (g, rooms, rnd, untilMax) => {
    const order = untilMax
        ? (a, b) => (b.circulation - a.circulation) || (a.area / a.sizeMax - b.area / b.sizeMax)
        : (a, b) => a.area / a.target - b.area / b.target;
    for (let grew = true; grew;) {
        grew = false;
        for (const room of [...rooms].sort(order)) {
            if (room.wing) continue;
            // Bâtiment rond (§40.1) : la bande peut passer sur des cases rognées par le disque
            const options = Object.keys(SIDES).map(side => {
                const strip = stripOf(room.rect, side);
                const free = strip.filter(c => isFree(g, ...c));
                const rect = grow(room.rect, side);
                const w = rect.x1 - rect.x0 + 1, h = rect.y1 - rect.y0 + 1;
                return { strip: free, ok: free.length > 0 && strip.every(c => isFree(g, ...c) || isClip(g, ...c)), rect, area: room.area + free.length, ratio: ratioOf(w, h), long: Math.max(w, h) };
            }).filter(o => o.ok
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
export const addWings = (g, rooms, rnd) => {
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
                        if (!wing.every(c => isFree(g, ...c) || isClip(g, ...c))) break;
                        const b = bounds([...rectCells(x0, y0, w, h), ...wing]);
                        const free = wing.filter(c => isFree(g, ...c));
                        if (free.length && ratioOf(b.w, b.h) <= room.maxRatio) options.push(free);
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
    if (shapeKind(withClip(g, cells)) === 'rect') {
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

// Partage d'un reste (§37, M3) : chaque pièce rectangulaire voisine avance d'un côté entier pris
// dans le reste, tant qu'elle reste dans ses proportions et sous sizeMax + leftoverOverflow
// (une bande le long d'un mur, devant plusieurs pièces, que personne ne pouvait prendre entière).
// Rend vrai si au moins une pièce a avancé.
const shareLeftover = (g, region, neighbours) => {
    const left = new Set(region.map(cellKey));
    let shared = false;
    for (let grew = true; grew;) {
        grew = false;
        for (const room of neighbours) {
            if (room.wing || !room.rect) continue;
            if (withClip(g, cellsOf(g, room.id)).length !== (room.rect.x1 - room.rect.x0 + 1) * (room.rect.y1 - room.rect.y0 + 1)) continue;
            const limit = Math.floor(room.sizeMax * (1 + engine.leftoverOverflow));
            for (const side of Object.keys(SIDES)) {
                // Bâtiment rond (§40.1) : la bande peut passer sur des cases rognées par le disque
                const whole = stripOf(room.rect, side);
                const strip = whole.filter(c => left.has(cellKey(c)));
                if (!strip.length || !whole.every(c => left.has(cellKey(c)) || isClip(g, ...c))) continue;
                const rect = grow(room.rect, side);
                const w = rect.x1 - rect.x0 + 1, h = rect.y1 - rect.y0 + 1;
                if (room.area + strip.length > limit || (ratioOf(w, h) > room.maxRatio && Math.max(w, h) > 2)) continue;
                strip.forEach(c => { setOwner(g, ...c, room.id); left.delete(cellKey(c)); });
                room.rect = rect;
                room.area += strip.length;
                grew = shared = true;
            }
        }
    }
    return shared;
};

// Ce qu'une pièce touche : réseau (couloir ou pièce ouverte), extérieur, pièces voisines
const contactsOf = (g, cells, byId) => {
    const ids = new Set(cells.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))));
    return {
        ids,
        network: [...ids].some(id => isCorridor(id) || byId.get(id)?.circulation),
        outside: ids.has(OUTSIDE),
        types: new Set([...ids].map(id => byId.get(id)?.typeId).filter(Boolean)),
    };
};

// Une pièce déplacée garde ce qui lui est dû : le réseau si elle le touchait, l'extérieur s'il lui
// est obligatoire, ses voisines imposées, ses annexes, les pièces qui ont besoin d'elle ; et ne
// touche aucun type interdit
const keepsContacts = (room, before, after, byId) => {
    if (before.network && !after.network) return false;
    if (room.outsideAccess === 'required' && before.outside && !after.outside) return false;
    if ([...room.mustBeAdjacentTo, ...room.access.required].some(t => before.types.has(t) && !after.types.has(t))) return false;
    if ([...before.ids].some(id => { const r = byId.get(id); return r && !after.ids.has(id) && (r.hostId === room.id || needsNext(r, room)); })) return false;
    return ![...after.ids].some(id => { const r = byId.get(id); return r && (room.cannotBeAdjacentTo.includes(r.typeId) || r.cannotBeAdjacentTo.includes(room.typeId)); });
};

// Déplacement d'une pièce (§37, GR-1) : une pièce rectangulaire voisine du reste glisse dedans
// (d'autant de rangées que le reste en a devant elle) ; la bande qu'elle libère derrière elle doit
// être prise en entier par une autre voisine, ou partagée, sinon on annule. La pièce garde ses
// contacts (keepsContacts). Rend vrai si une pièce a glissé.
const slideIntoLeftover = (g, region, neighbours, byId) => {
    const left = new Set(region.map(cellKey));
    const rooms = [...byId.values()];
    // Ne glissent pas : l'entrée et les pièces à porte dehors obligatoire (leur façade), les pièces
    // ouvertes (le réseau), celles qui ont reçu un palier ; ni une pièce dont les cases ne sont plus
    // exactement son rectangle
    const movable = (room) => !room.wing && room.rect && room.outsideAccess !== 'required' && !room.circulation && !room.landing
        && cellsOf(g, room.id).length === (room.rect.x1 - room.rect.x0 + 1) * (room.rect.y1 - room.rect.y0 + 1);
    for (const room of neighbours) {
        if (!movable(room)) continue;
        for (const side of Object.keys(SIDES)) {
            let depth = 0;
            for (let r = room.rect; stripOf(r, side).every(c => left.has(cellKey(c))); r = grow(r, side)) depth++;
            if (!depth) continue;
            const [dx, dy] = SIDES[side].map(v => v * depth);
            const { x0, y0, x1, y1 } = room.rect;
            const moved = { x0: x0 + dx, y0: y0 + dy, x1: x1 + dx, y1: y1 + dy };
            const oldCells = rectCells(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
            const newCells = rectCells(moved.x0, moved.y0, x1 - x0 + 1, y1 - y0 + 1);
            const newKeys = new Set(newCells.map(cellKey));
            const freed = oldCells.filter(c => !newKeys.has(cellKey(c)));
            const before = contactsOf(g, oldCells, byId);
            const owners = g.owner.slice();
            const state = rooms.map(r => ({ r, rect: r.rect, area: r.area, wing: r.wing }));
            freed.forEach(c => setOwner(g, ...c, null));
            newCells.forEach(c => setOwner(g, ...c, room.id));
            room.rect = moved;
            if (keepsContacts(room, before, contactsOf(g, newCells, byId), byId)) {
                const others = [...new Set(freed.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))))]
                    .map(id => byId.get(id)).filter(r => r && r !== room)
                    .sort((a, b) => (b.circulation - a.circulation) || (a.area / a.sizeMax - b.area / b.sizeMax));
                const taker = others.find(r => shapeIsValid(r, [...cellsOf(g, r.id), ...freed], engine.leftoverOverflow, g));
                if (taker) {
                    freed.forEach(c => setOwner(g, ...c, taker.id));
                    syncShape(g, taker);
                } else shareLeftover(g, freed, others);
                if (freed.every(c => ownerAt(g, ...c) !== null)) return true;
            }
            g.owner = owners;
            state.forEach(({ r, rect, area, wing }) => Object.assign(r, { rect, area, wing }));
        }
    }
    return false;
};

// Restes (R-4) : chaque zone libre va entière à une pièce voisine si sa forme reste un
// rectangle ou un L (pièces ouvertes d'abord) ; sinon, en contour libre, on retire du
// bâtiment ce qui peut l'être dans un angle (carveCorner) et on recommence ; sinon, dans l'ordre
// (§37, GR-1) : les pièces voisines se le partagent (shareLeftover), une voisine y glisse
// (slideIntoLeftover), une pièce y est créée (`fill(region)` : pièce de complément ou réserve,
// rend { room, cells } ou null), et on recommence ; le reste va au couloir (dégagement).
// `freeOutline` vaut 'excavate' au sous-sol : tout reste est non excavé.
export const settleLeftovers = (g, rooms, freeOutline, fill = null) => {
    const byId = new Map(rooms.map(r => [r.id, r]));
    let created = null;
    for (let carved = true; carved;) {
        carved = false;
        for (const region of regionsOf(cellsOf(g, null))) {
            const neighbours = [...new Set(region.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))))]
                .map(id => byId.get(id)).filter(Boolean)
                .sort((a, b) => (b.circulation - a.circulation) || (a.area / a.sizeMax - b.area / b.sizeMax));
            // Une pièce voisine dans ses tailles, sinon en dépassant un peu sizeMax plutôt que de
            // laisser un dégagement qui ne dessert rien (§19)
            const taker = neighbours.find(r => shapeIsValid(r, [...cellsOf(g, r.id), ...region], 0, g))
                ?? neighbours.find(r => shapeIsValid(r, [...cellsOf(g, r.id), ...region], engine.leftoverOverflow, g));
            if (taker) {
                region.forEach(c => setOwner(g, ...c, taker.id));
                syncShape(g, taker);
            } else if (freeOutline === 'excavate') {
                // Sous-sol (§20, E2-6) : ce que le programme n'occupe pas reste non excavé
                region.forEach(c => setOwner(g, ...c, OUTSIDE));
            } else if (freeOutline && region.some(c => touchesOutside(g, ...c)) && carveCorner(g, region)) {
                carved = true;
                break;
            } else if (shareLeftover(g, region, neighbours) || slideIntoLeftover(g, region, neighbours, byId)) {
                carved = true;
                break;
            } else if (fill && (created = fill(region))) {
                created.cells.forEach(c => setOwner(g, ...c, created.room.id));
                byId.set(created.room.id, created.room);
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
export const pruneCorridors = (g, rooms, links, entrance, width, fixed = new Set()) => {
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
export const splitCorridors = (g, rooms, root, landings = null) => {
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
