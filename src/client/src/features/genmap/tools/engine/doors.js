// src/client/src/features/genmap/tools/engine/doors.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Portes : murs partagés et ouvertures.

import { SIDES, OUTSIDE, CORRIDOR, isCorridor, ownerAt, around, flipEdge, cellKey, cellsOf, regionsOf } from './grid.js';

// Murs partagés : « a|b » (ids triés) → arêtes { x, y, side } vues depuis les cases de a
export const sharedWalls = (g) => {
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

export const wallBetween = (walls, a, b) => walls.get(a < b ? `${a}|${b}` : `${b}|${a}`) ?? null;

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
export const placeDoors = (g, rooms, links, { parts, recesses }, root, facade, density, rnd) => {
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
    // Pièce adjointe (§39) : son rôle, ou un hôte désigné (débarras, réserve rattachée)
    const isAnnex = (id) => byId.get(id)?.role === 'annex' || Boolean(byId.get(id)?.hostId);

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
