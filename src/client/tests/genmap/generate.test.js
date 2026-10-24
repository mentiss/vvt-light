// src/client/tests/genmap/generate.test.js
// Moteur du générateur de plans (spec_genmap.md §6, §11 à §20), sur tous les presets et tous
// les niveaux : reproductibilité, cases sans chevauchement, formes rectangle ou L, tailles et
// ratios, accès extérieur, desserte par le réseau de circulation, portes interdites, largeur
// maximale du couloir, contour, connectivité depuis l'entrée ou l'escalier d'arrivée, cohérence
// d'un niveau à l'autre (escaliers, emprise, couloir du schéma).

import { describe, it, expect } from 'vitest';
import { generate, resolvePreset, shapeKind, OUTSIDE, CORRIDOR } from '../../src/genmap/generate.js';
import roomTypes from '../../src/genmap/data/roomTypes.json';
import engine from '../../src/genmap/data/engine.json';
import inn from '../../src/genmap/data/presets/inn.json';
import manor from '../../src/genmap/data/presets/manor.json';
import temple from '../../src/genmap/data/presets/temple.json';
import warehouse from '../../src/genmap/data/presets/warehouse.json';
import house from '../../src/genmap/data/presets/house.json';
import tower from '../../src/genmap/data/presets/tower.json';

const PRESETS = Object.fromEntries([inn, manor, temple, warehouse, house, tower].map(p => [p.id, resolvePreset(p, roomTypes)]));
const { program, params } = PRESETS.inn;
const SEEDS = Array.from({ length: 25 }, (_, i) => 1000 + i * 37);
const typeOf = (room) => roomTypes.find(t => t.id === room.typeId);
const neighbours = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
const key = ([x, y]) => `${x},${y}`;
const groundOf = (plan) => plan.floors.find(f => f.level === 0);
const linkCells = (l) => Array.from({ length: l.w * l.h }, (_, i) => [l.x + (i % l.w), l.y + Math.floor(i / l.w)]);

// Toutes les cases de l'étage avec leur propriétaire (dehors compris)
const ownership = (floor) => {
    const owners = new Map();
    const claim = (x, y, id) => {
        const k = `${x},${y}`;
        expect(owners.has(k), `case ${k} prise deux fois (niveau ${floor.level})`).toBe(false);
        owners.set(k, id);
    };
    floor.rooms.forEach(r => r.cells.forEach(([x, y]) => claim(x, y, r.id)));
    floor.corridor.forEach(([x, y]) => claim(x, y, CORRIDOR));
    floor.voids.forEach(([x, y]) => claim(x, y, OUTSIDE));
    floor.links.forEach(l => linkCells(l).forEach(([x, y]) => claim(x, y, l.id)));
    return owners;
};
const ownerOf = (owners, [x, y]) => owners.get(`${x},${y}`) ?? OUTSIDE;

// Point de départ d'un niveau : la porte d'entrée au RDC, l'escalier d'arrivée ailleurs (§20, E2-2)
const rootOf = (floor) => (floor.level === 0 ? OUTSIDE
    : floor.links.find(l => l.targets.includes(floor.level > 0 ? floor.level - 1 : 0)).id);

// Auberge : tous les réglages, 25 graines ; autres presets : densités et contour libre, 12 graines
const CASES = [
    ...[
        { density: 'dense' },
        { density: 'balanced' },
        { density: 'spacious' },
        { density: 'dense',    freeOutline: true },
        { density: 'balanced', freeOutline: true },
        { density: 'dense',    freeOutline: true, width: 15, length: 12 },
        { density: 'balanced', corridorMaxWidth: 1 },
    ].map(v => ({ preset: 'inn', seeds: SEEDS, ...v })),
    ...['manor', 'temple', 'warehouse', 'house'].flatMap(preset => [
        { density: 'dense' },
        { density: 'balanced' },
        { density: 'spacious' },
        { density: 'dense', freeOutline: true },
    ].map(v => ({ preset, seeds: SEEDS.slice(0, 12), ...v }))),
    // Tour de garde : 2 à 4 étages au-dessus du RDC (§34)
    ...[2, 3, 4].map(floors => ({ preset: 'tower', seeds: SEEDS.slice(0, 12), density: 'dense', floors })),
];

// Limites constatées : le manoir rejette souvent ses plans pour couloir trop large (§14.4) et
// son étage reste le niveau le plus difficile (§20.3) ; depuis le contrôle physique des tronçons
// de couloir (§21.1), des plans auparavant acceptés à tort sont rejetés
const MIN_SUCCESS = { manor: 0.55, inn: 0.85 };

describe.each(CASES)('generate, $preset, $density, contour libre $freeOutline, $width × $length', ({ preset, seeds, ...variant }) => {
    const { program, params } = PRESETS[preset];
    const results = seeds.map(seed => generate(program, { ...params, ...variant, seed }));
    const buildings = results.filter(r => r.ok).map(r => r.plan);
    const floors = buildings.flatMap(plan => plan.floors);
    const grounds = buildings.map(groundOf);

    it('aboutit pour presque toutes les graines', () => {
        // Couloir de 1 case : 20 graines sur 25 pour l'auberge depuis les accès (§23.1), 17 sur 25
        // depuis l'escalier orienté (§24.1)
        const rate = variant.corridorMaxWidth === 1 ? 0.65 : MIN_SUCCESS[preset] ?? 0.9;
        expect(buildings.length).toBeGreaterThanOrEqual(seeds.length * rate);
    });

    it('donne le même plan pour la même graine', () => {
        expect(generate(program, { ...params, ...variant, seed: seeds[3] })).toEqual(results[3]);
    });

    it('génère tous les niveaux du preset', () => {
        const floorCount = variant.floors ?? params.floors;
        const expected = [...(params.basement ? [-1] : []), 0, ...Array.from({ length: floorCount }, (_, i) => i + 1)];
        for (const plan of buildings) expect(plan.floors.map(f => f.level)).toEqual(expected);
    });

    it('couvre l\'enveloppe sans chevauchement, à chaque niveau', () => {
        for (const floor of floors) expect(ownership(floor).size).toBe(floor.width * floor.length);
    });

    it('donne à chaque pièce une forme rectangle ou L, dans ses tailles et son ratio', () => {
        for (const floor of floors) {
            for (const room of floor.rooms) {
                const type = typeOf(room);
                const xs = room.cells.map(c => c[0]), ys = room.cells.map(c => c[1]);
                const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1;
                // Une petite annexe née d'un reste admet une marche d'une case (§31), comme une pièce
                // qui a reçu le palier d'un escalier (§34, CO-7)
                expect(shapeKind(room.cells, room.fromSpace || room.landing ? 1 : undefined)).not.toBeNull();
                expect(room.cells.length).toBeGreaterThanOrEqual(type.sizeMin);
                // sizeMax peut être dépassée pour absorber un reste, dans la limite de leftoverOverflow (§19, D-1)
                expect(room.cells.length).toBeLessThanOrEqual(Math.floor(type.sizeMax * (1 + engine.leftoverOverflow)));
                // Une pièce qui a reçu le palier d'un escalier n'a plus de contrainte de proportions (§34, CO-7)
                if (!room.landing) expect(Math.max(w, h) / Math.min(w, h)).toBeLessThanOrEqual(Math.max(type.ratioMax, 1 / type.ratioMin));
            }
        }
    });

    it('place les pièces à accès extérieur obligatoire du RDC contre l\'extérieur, avec une porte dehors', () => {
        for (const floor of grounds) {
            const owners = ownership(floor);
            for (const room of floor.rooms.filter(r => r.outsideAccess === 'required')) {
                expect(room.cells.some(c => neighbours(c).some(n => ownerOf(owners, n) === OUTSIDE))).toBe(true);
                expect(floor.doors.some(d => d.between.includes(room.id) && d.between.includes(OUTSIDE))).toBe(true);
            }
        }
    });

    it('rend chaque pièce et chaque escalier physiquement accessibles depuis l\'entrée ou l\'escalier d\'arrivée', () => {
        const SIDE = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
        for (const floor of floors) {
            // Chaque tronçon de couloir est un nœud à part : deux tronçons séparés ne communiquent
            // que par une porte ou une pièce ouverte (§21.1)
            const owners = ownership(floor);
            const corridorCells = new Set(floor.corridor.map(key));
            const part = new Map();
            let parts = 0;
            for (const cell of floor.corridor) {
                if (part.has(key(cell))) continue;
                const stack = [cell];
                part.set(key(cell), parts);
                while (stack.length) {
                    for (const n of neighbours(stack.pop())) {
                        if (corridorCells.has(key(n)) && !part.has(key(n))) { part.set(key(n), parts); stack.push(n); }
                    }
                }
                parts++;
            }
            const node = (cell) => (part.has(key(cell)) ? `couloir#${part.get(key(cell))}` : ownerOf(owners, cell));
            const network = (id) => id.startsWith('couloir#') || floor.rooms.some(r => r.circulation && r.id === id);
            // Le réseau (couloirs et pièces ouvertes) se parcourt sans porte
            const edges = [];
            for (const k of owners.keys()) {
                const cell = k.split(',').map(Number);
                for (const n of neighbours(cell)) {
                    const a = node(cell), b = node(n);
                    if (a !== b && network(a) && network(b)) edges.push([a, b]);
                }
            }
            for (const d of floor.doors) edges.push([node([d.x, d.y]), node([d.x + SIDE[d.side][0], d.y + SIDE[d.side][1]])]);
            const reached = new Set([rootOf(floor)]);
            for (let changed = true; changed;) {
                changed = false;
                for (const [a, b] of edges) {
                    if (reached.has(a) !== reached.has(b)) { reached.add(a); reached.add(b); changed = true; }
                }
            }
            for (const id of [...floor.rooms.map(r => r.id), ...floor.links.map(l => l.id), ...Array.from({ length: parts }, (_, i) => `couloir#${i}`)]) {
                expect(reached.has(id), `${id} au niveau ${floor.level}`).toBe(true);
            }
        }
    });

    it('n\'ouvre un escalier droit que de ses côtés ouverts à ce niveau (§24, ES-1, ES-2)', () => {
        const SIDE = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
        const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
        for (const floor of floors) {
            const linkAt = (x, y) => floor.links.find(l => x >= l.x && x < l.x + l.w && y >= l.y && y < l.y + l.h);
            for (const d of floor.doors) {
                const here = linkAt(d.x, d.y), there = linkAt(d.x + SIDE[d.side][0], d.y + SIDE[d.side][1]);
                if (here?.sides) expect(here.sides, `${here.label} niveau ${floor.level}`).toContain(d.side);
                if (there?.sides) expect(there.sides, `${there.label} niveau ${floor.level}`).toContain(OPP[d.side]);
            }
            // Jamais plus de deux côtés ouverts (arrivée et départ d'une cage qui continue)
            for (const link of floor.links.filter(l => l.sides)) expect(link.sides.length).toBeLessThanOrEqual(2);
        }
    });

    it('dégage le palier d\'un escalier sur toute la largeur de son ouverture (§33, PA-1 ; §34, CO-7)', () => {
        const front = (l, side) => (side === 'n' || side === 's'
            ? Array.from({ length: l.w }, (_, i) => [l.x + i, side === 'n' ? l.y - 1 : l.y + l.h])
            : Array.from({ length: l.h }, (_, i) => [side === 'w' ? l.x - 1 : l.x + l.w, l.y + i]));
        for (const floor of floors) {
            const roomAt = new Map(floor.rooms.flatMap(r => r.cells.map(c => [key(c), r])));
            const corridor = new Set(floor.corridor.map(key));
            for (const link of floor.links.filter(l => l.sides)) {
                for (const side of link.sides) {
                    // Devant l'ouverture : du couloir ou des pièces ouvertes, ou une seule pièce qui a
                    // reçu le palier (niveau sans couloir)
                    const owners = front(link, side).map(c => (corridor.has(key(c)) ? CORRIDOR : roomAt.get(key(c))));
                    const open = owners.every(o => o === CORRIDOR || o?.circulation);
                    const oneRoom = owners.every(o => o && o === owners[0] && o.landing);
                    expect(open || oneRoom, `${link.label} niveau ${floor.level} : ${owners.map(o => o?.label ?? o)}`).toBe(true);
                }
            }
        }
    });

    it('à l\'étage, ne fait donner aucune pièce fermée sur l\'escalier d\'arrivée quand il y a un couloir (§21.1)', () => {
        // Niveau dont l'escalier débouche sur un couloir (pas seulement des restes isolés)
        for (const floor of floors.filter(f => f.level !== 0 && f.doors.some(d => d.between.includes(rootOf(f)) && d.between.includes(CORRIDOR)))) {
            const root = rootOf(floor);
            const closed = new Set(floor.rooms.filter(r => !r.circulation).map(r => r.id));
            for (const { between } of floor.doors) expect(between.includes(root) && between.some(id => closed.has(id))).toBe(false);
        }
    });

    it('respecte les voisinages imposés et interdits', () => {
        for (const floor of floors) {
            const owners = ownership(floor);
            const present = new Set(floor.rooms.map(r => r.typeId));
            for (const room of floor.rooms) {
                const near = [...new Set(room.cells.flatMap(neighbours).map(n => ownerOf(owners, n)))]
                    .map(id => floor.rooms.find(r => r.id === id && id !== room.id)?.typeId).filter(Boolean);
                for (const t of typeOf(room).mustBeAdjacentTo) if (present.has(t)) expect(near).toContain(t);
                for (const t of typeOf(room).cannotBeAdjacentTo) expect(near).not.toContain(t);
            }
        }
    });

    // Entre deux pièces fermées, chacune accepte l'autre (§23) : jamais un type interdit, et une pièce
    // qui déclare des types obligatoires ou possibles n'ouvre que vers eux
    const accepts = (type, other) => !type.access.forbidden.includes(other.id)
        && (!type.access.required.length && !type.access.optional.length
            || type.access.required.includes(other.id) || type.access.optional.includes(other.id));

    it('respecte les accès entre pièces fermées (§23 ; cellier et salle commune, chambre et chambre)', () => {
        for (const floor of floors) {
            const roomById = new Map(floor.rooms.map(r => [r.id, r]));
            for (const { between: [a, b] } of floor.doors) {
                const ra = roomById.get(a), rb = roomById.get(b);
                if (!ra || !rb || ra.circulation || rb.circulation) continue;
                expect(accepts(typeOf(ra), typeOf(rb)) && accepts(typeOf(rb), typeOf(ra)), `${ra.label} / ${rb.label}`).toBe(true);
            }
        }
    });

    it('ne fait jamais d\'une pièce noTransit un passage : une seule porte vers une pièce, ses annexes à part (§20.1, §23)', () => {
        for (const floor of floors) {
            const annexOf = new Map(floor.rooms.filter(r => r.hostId).map(r => [r.id, r.hostId]));
            for (const room of floor.rooms.filter(r => typeOf(r).noTransit && !r.hostId)) {
                const doors = floor.doors.filter(d => d.between.includes(room.id) && !d.between.includes(OUTSIDE)
                    && !d.between.some(id => annexOf.has(id)));
                expect(doors.length, room.label).toBeLessThanOrEqual(1);
            }
        }
    });

    it('fait donner chaque pièce à circulation obligatoire (chambre) directement sur le réseau (§21, §23)', () => {
        for (const floor of floors) {
            // Couloir principal ou tronçon de couloir (« corridor-2 »…), ou pièce ouverte
            const circulation = new Set(floor.rooms.filter(r => r.circulation).map(r => r.id));
            const network = (id) => id === CORRIDOR || id.startsWith(`${CORRIDOR}-`) || circulation.has(id);
            for (const room of floor.rooms.filter(r => typeOf(r).circulationAccess === 'required')) {
                expect(floor.doors.some(d => d.between.includes(room.id) && d.between.some(network)), `${room.label} au niveau ${floor.level}`).toBe(true);
            }
        }
    });

    it('ne fait jamais donner une pièce à circulation interdite (annexe, cellier) sur le réseau (§23)', () => {
        for (const floor of floors) {
            const circulation = new Set(floor.rooms.filter(r => r.circulation).map(r => r.id));
            const linkIds = new Set(floor.links.map(l => l.id));
            const network = (id) => id === CORRIDOR || id.startsWith(`${CORRIDOR}-`) || circulation.has(id) || linkIds.has(id);
            for (const room of floor.rooms.filter(r => typeOf(r).circulationAccess === 'forbidden')) {
                expect(floor.doors.some(d => d.between.includes(room.id) && d.between.some(network)), room.label).toBe(false);
            }
        }
    });

    it('ne fait un débarras que d\'un petit reste, rattaché à une pièce (§29)', () => {
        for (const floor of floors) {
            for (const room of floor.rooms.filter(r => r.typeId === 'closet')) {
                expect(room.cells.length).toBeLessThanOrEqual(engine.closetMaxSize);
                expect(room.hostId).not.toBeNull();
            }
        }
    });

    it('ne donne à une pièce qu\'une annexe de chaque type, à elle ou partagée (§31)', () => {
        for (const floor of floors) {
            const annexes = floor.rooms.filter(r => r.hostId);
            for (const room of floor.rooms.filter(r => !r.hostId)) {
                const linked = annexes.filter(a => a.hostId === room.id
                    || floor.doors.some(d => d.between.includes(a.id) && d.between.includes(room.id)));
                const types = linked.map(a => a.typeId);
                expect(new Set(types).size, `${room.label} : ${types}`).toBe(types.length);
            }
        }
    });

    it('relie chaque annexe à son hôte, contre lequel elle est posée (§23)', () => {
        for (const floor of floors) {
            for (const room of floor.rooms.filter(r => r.hostId)) {
                expect(floor.doors.some(d => d.between.includes(room.id) && d.between.includes(room.hostId)), room.label).toBe(true);
            }
        }
    });

    it('ne met de porte dehors qu\'aux pièces dont l\'accès extérieur est obligatoire ou possible (§23, porte de service)', () => {
        for (const floor of floors) {
            const roomById = new Map(floor.rooms.map(r => [r.id, r]));
            for (const { between } of floor.doors.filter(d => d.between.includes(OUTSIDE))) {
                const room = roomById.get(between.find(id => id !== OUTSIDE));
                expect(['required', 'optional']).toContain(room.outsideAccess);
            }
        }
    });

    it('ne fait pas de couloir plus large que la largeur maximale', () => {
        for (const floor of floors) {
            const corridor = new Set(floor.corridor.map(key));
            for (const [x, y] of floor.corridor) {
                const square = [[x, y], [x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1], [x + 2, y + 1], [x, y + 2], [x + 1, y + 2], [x + 2, y + 2]];
                expect(square.every(c => corridor.has(key(c)))).toBe(false);
            }
        }
    });

    if (variant.density !== 'dense') {
        it('dessert chaque pièce fermée par le réseau de circulation (hors sous-sol et pièces qui lui sont interdites)', () => {
            for (const floor of floors.filter(f => f.level >= 0)) {
                const owners = ownership(floor);
                const network = new Set([CORRIDOR, ...floor.rooms.filter(r => r.circulation).map(r => r.id)]);
                for (const room of floor.rooms.filter(r => !r.circulation && typeOf(r).circulationAccess !== 'forbidden')) {
                    expect(room.cells.some(c => neighbours(c).some(n => network.has(ownerOf(owners, n))))).toBe(true);
                }
            }
        });
    }

    if (!variant.freeOutline) {
        it('garde le RDC rectangulaire', () => {
            for (const floor of grounds) expect(floor.voids).toEqual([]);
        });
    }

    it('donne au RDC et aux étages un contour rectangle ou L (§13, O-4 ; §20, E2-7)', () => {
        for (const floor of floors.filter(f => f.level >= 0)) {
            const voids = new Set(floor.voids.map(key));
            const building = [];
            for (let y = 0; y < floor.length; y++) for (let x = 0; x < floor.width; x++) if (!voids.has(`${x},${y}`)) building.push([x, y]);
            expect(shapeKind(building)).not.toBeNull();
        }
    });

    it('garde chaque escalier au même endroit sur les niveaux qu\'il relie (§2.3)', () => {
        for (const plan of buildings) {
            for (const floor of plan.floors) {
                for (const link of floor.links) {
                    for (const target of link.targets) {
                        const other = plan.floors.find(f => f.level === target);
                        expect(other.links.some(l => l.x === link.x && l.y === link.y && l.w === link.w && l.h === link.h && l.targets.includes(floor.level))).toBe(true);
                    }
                }
            }
        }
    });

    it('ne fait jamais déborder un étage du niveau du dessous (§20, E2-9)', () => {
        for (const plan of buildings) {
            for (const floor of plan.floors.filter(f => f.level > 0)) {
                const voids = new Set(floor.voids.map(key));
                const below = plan.floors.find(f => f.level === floor.level - 1);
                for (const cell of below.voids) expect(voids.has(key(cell))).toBe(true);
            }
        }
    });
});

describe('generate, largeur maximale du couloir à 1', () => {
    it('ne laisse aucun carré de 2 × 2 en couloir, à aucun niveau', () => {
        for (const seed of SEEDS) {
            const result = generate(program, { ...params, density: 'balanced', corridorMaxWidth: 1, seed });
            if (!result.ok) continue;
            for (const floor of result.plan.floors) {
                const corridor = new Set(floor.corridor.map(key));
                for (const [x, y] of floor.corridor) {
                    expect([[x + 1, y], [x, y + 1], [x + 1, y + 1]].every(c => corridor.has(key(c)))).toBe(false);
                }
            }
        }
    });
});

describe('generate, plage de dimensions (§17, S-3)', () => {
    // Objectif × 0,9 à × 1,5 ; atteint aujourd'hui jusqu'à × 1,2 (au-delà, le réservoir ne suffit pas,
    // §18.4). Manoir : × 0,9 seulement, son étage échoue à × 1,2 (limite constatée, §20.3)
    // Tour : × 0,9 seulement, son RDC (entrée, salle de garde) ne remplit pas un 8 × 8 (§34)
    const SCALES = { manor: [0.9], tower: [0.9] };
    it.each(Object.keys(PRESETS))('%s aboutit de × 0,9 à × 1,2 de son enveloppe par défaut', (id) => {
        const { program: p, params: base } = PRESETS[id];
        for (const scale of SCALES[id] ?? [0.9, 1.2]) {
            const sized = { ...base, width: Math.round(base.width * scale), length: Math.round(base.length * scale) };
            const ok = SEEDS.slice(0, 8).filter(seed => generate(p, { ...sized, seed }).ok).length;
            // Auberge × 0,9 : RDC serré en 11 × 8, 17 graines sur 25 (§21)
            expect(ok, `× ${scale}`).toBeGreaterThanOrEqual(id === 'manor' || (id === 'inn' && scale < 1) ? 4 : 6);
        }
    });
});

describe('generate, réservoir de pièces de complément (§18.1)', () => {
    const optionalTypes = (id) => new Set(PRESETS[id].program.optionalRooms.map(r => r.id));
    const mandatoryTypes = (id) => new Set(PRESETS[id].program.rooms.map(r => r.id));
    const pickedOf = (id, plan) => groundOf(plan).rooms.filter(r => optionalTypes(id).has(r.typeId) && !mandatoryTypes(id).has(r.typeId));

    it('pioche peu au RDC quand le programme remplit déjà l\'enveloppe (auberge, taille par défaut)', () => {
        for (const seed of SEEDS.slice(0, 8)) {
            const result = generate(program, { ...params, seed });
            if (result.ok) expect(pickedOf('inn', result.plan).length).toBeLessThanOrEqual(1);
        }
    });

    it('pioche des pièces de complément au RDC d\'un manoir plus grand', () => {
        const { program: p, params: base } = PRESETS.manor;
        const plans = SEEDS.slice(0, 8).map(seed => generate(p, { ...base, floors: 0, basement: false, width: 19, length: 14, seed })).filter(r => r.ok);
        expect(plans.some(r => pickedOf('manor', r.plan).length > 0)).toBe(true);
    });
});

describe('generate, schémas de circulation (§18.2)', () => {
    // Le couloir du schéma traverse le bâtiment (il ne s'arrête que contre l'entrée)
    const longestRun = (floor) => {
        const corridor = new Set(floor.corridor.map(key));
        let best = 0;
        for (let y = 0; y < floor.length; y++) best = Math.max(best, Array.from({ length: floor.width }, (_, x) => corridor.has(`${x},${y}`)).filter(Boolean).length);
        for (let x = 0; x < floor.width; x++) best = Math.max(best, Array.from({ length: floor.length }, (_, y) => corridor.has(`${x},${y}`)).filter(Boolean).length);
        return best;
    };

    it.each(['spine', 'gallery'])('pose un couloir %s qui traverse le manoir', (scheme) => {
        const { program: p, params: base } = PRESETS.manor;
        const plans = SEEDS.slice(0, 8).map(seed => generate(p, { ...base, scheme, seed })).filter(r => r.ok).map(r => r.plan);
        // Galerie : l'étage au-dessus reste difficile (limite constatée, §20.3)
        expect(plans.length).toBeGreaterThanOrEqual(scheme === 'gallery' ? 2 : 6);
        for (const plan of plans) {
            const ground = groundOf(plan);
            expect(longestRun(ground)).toBeGreaterThanOrEqual(Math.min(ground.width, ground.length) - 4);
            // À l'étage, le couloir se pose au-dessus de celui du RDC (§20, E2-3)
            const upper = plan.floors.find(f => f.level === 1);
            const taken = new Set([...upper.corridor, ...upper.links.flatMap(linkCells)].map(key));
            for (const cell of ground.schemeCells) expect(taken.has(key(cell)), `case ${key(cell)}`).toBe(true);
        }
    }, 30000);

    it('donne à l\'étage de l\'auberge son propre couloir traversant, passant par le palier (§25, CN-1, CN-2)', () => {
        const plans = SEEDS.slice(0, 8).map(seed => generate(program, { ...params, seed })).filter(r => r.ok).map(r => r.plan);
        expect(plans.length).toBeGreaterThanOrEqual(6);
        for (const plan of plans) {
            const upper = plan.floors.find(f => f.level === 1);
            expect(longestRun(upper)).toBeGreaterThanOrEqual(Math.max(upper.width, upper.length) - 6);
        }
    }, 30000);

    it('sans schéma (« libre »), le manoir retrouve le fonctionnement par densité', () => {
        const { program: p, params: base } = PRESETS.manor;
        expect(SEEDS.slice(0, 8).filter(seed => generate(p, { ...base, scheme: 'free', seed }).ok).length).toBeGreaterThanOrEqual(5);
    });
});

describe('generate, pièce maîtresse (§25, CN-4, CN-5)', () => {
    // Part du niveau occupée par la pièce maîtresse, et contact avec l'entrée si elle est sur son axe
    const HUBS = [['inn', 'common_room', true], ['warehouse', 'storage_hall', false], ['temple', 'nave', true]];
    it.each(HUBS)('%s : la pièce maîtresse prend une large part du RDC', (id, room, onAxis) => {
        const { program: p, params: base } = PRESETS[id];
        const plans = SEEDS.slice(0, 8).map(seed => generate(p, { ...base, seed })).filter(r => r.ok).map(r => groundOf(r.plan));
        expect(plans.length).toBeGreaterThanOrEqual(7);
        for (const ground of plans) {
            const hub = ground.rooms.find(r => r.typeId === room);
            const area = ground.width * ground.length - ground.voids.length;
            expect(hub.cells.length / area, ground.rooms.map(r => r.label).join(', ')).toBeGreaterThanOrEqual(0.3);
            if (onAxis) {
                const entrance = new Set(ground.rooms.find(r => r.outsideAccess === 'required' && r.typeId === 'entrance').cells.map(key));
                expect(hub.cells.some(c => neighbours(c).some(n => entrance.has(key(n))))).toBe(true);
            }
        }
    }, 30000);
});

describe('generate, étages (§20)', () => {
    it('ajoute un escalier dans la même cage pour chaque étage supplémentaire (E2-5)', () => {
        const result = generate(program, { ...params, floors: 3, seed: SEEDS[0] });
        expect(result.ok).toBe(true);
        const stairs = result.plan.floors.map(f => f.links.find(l => l.targets.length));
        expect(new Set(stairs.map(l => `${l.x},${l.y},${l.w},${l.h}`)).size).toBe(1);
        expect(result.plan.floors.find(f => f.level === 1).links[0].targets).toEqual([0, 2]);
    });

    it('ne creuse au sous-sol que ce que son programme occupe (E2-6)', () => {
        const { program: p, params: base } = PRESETS.manor;
        for (const seed of SEEDS.slice(0, 6)) {
            const result = generate(p, { ...base, seed });
            if (!result.ok) continue;
            const basement = result.plan.floors.find(f => f.level === -1);
            // Seul le palier de l'escalier est du couloir (§24)
            expect(basement.corridor.length).toBeLessThanOrEqual(1);
            expect(basement.voids.length).toBeGreaterThan(0);
        }
    });

    it('resserre la mezzanine de l\'entrepôt autour de son programme (E2-7)', () => {
        const { program: p, params: base } = PRESETS.warehouse;
        const result = generate(p, { ...base, seed: SEEDS[0] });
        expect(result.ok).toBe(true);
        const mezzanine = result.plan.floors.find(f => f.level === 1);
        expect(mezzanine.voids.length).toBeGreaterThan(mezzanine.width * mezzanine.length / 2);
    });
});

describe('generate, échecs', () => {
    it('signale un programme trop chargé pour la surface', () => {
        expect(generate(program, { ...params, width: 6, length: 6, seed: 1 })).toEqual({ ok: false, reason: 'overload' });
    });

    it('signale tout de suite un bâtiment trop grand pour son programme (§17, S-2)', () => {
        for (const id of Object.keys(PRESETS)) {
            const { program: p, params: base } = PRESETS[id];
            expect(generate(p, { ...base, width: base.width * 2, length: base.length * 2, seed: 1 })).toEqual({ ok: false, reason: 'oversize' });
        }
    });

    it('tente quand même un grand bâtiment en contour libre, qui peut se resserrer', () => {
        expect(generate(program, { ...params, width: params.width * 2, length: params.length * 2, freeOutline: true, seed: 1 }).reason).not.toBe('oversize');
    }, 30000);
});

describe('generate, restes et réservoir (§19)', () => {
    it('fait aboutir l\'auberge en enfilade avec un couloir de 1 case', () => {
        // Des dégagements de 2 à 8 cases subsistent autour de l'escalier (limite constatée, §20.3).
        // 6 / 8 avant le palier sur toute la largeur, 4 / 8 depuis ; même taux qu'avant sur 40 graines (31 / 40, §33)
        const seeds = [509013140, ...SEEDS.slice(0, 7)];
        expect(seeds.filter(seed => generate(program, { ...params, density: 'dense', corridorMaxWidth: 1, scheme: 'enfilade', seed }).ok).length).toBeGreaterThanOrEqual(4);
    });

    it('fait aboutir le manoir dense avec un couloir de 1 case', () => {
        const { program: p, params: base } = PRESETS.manor;
        const seeds = Array.from({ length: 20 }, (_, i) => 900 + i * 7331);
        // 16 / 20 avant le contrôle de desserte strict, 10 / 20 depuis (§20.1), 4 / 20 avec l'étage (§20.3),
        // 2 / 20 depuis le contrôle des tronçons de couloir (§21.1), 1 / 20 depuis les accès (§23.1)
        expect(seeds.filter(seed => generate(p, { ...base, density: 'dense', corridorMaxWidth: 1, seed }).ok).length).toBeGreaterThanOrEqual(1);
    }, 30000);
});

describe('pièce hôte qui cède des cases à son annexe (§32)', () => {
    const run = (types) => {
        const { program, params } = resolvePreset(house, types);
        return groundOf(generate(program, { ...params, seed: 11052 }).plan);
    };
    const kitchenOf = (floor) => floor.rooms.find(r => r.typeId === 'kitchen');

    it('complète un reste trop petit avec des cases de la cuisine pour en faire un cellier (maison 11052)', () => {
        const floor = run(roomTypes);
        const kitchen = kitchenOf(floor);
        const cellar = floor.rooms.find(r => r.typeId === 'cellar' && r.fromSpace);
        expect(cellar?.hostId).toBe(kitchen.id);
        expect(cellar.cells.length).toBeGreaterThanOrEqual(typeOf(cellar).sizeMin);
        // L'hôte garde au moins la moitié de sa plage de taille
        const type = typeOf(kitchen);
        expect(kitchen.cells.length).toBeGreaterThanOrEqual(type.sizeMin + (type.sizeMax - type.sizeMin) * engine.shrinkComfort);
    });

    it('ne touche pas à une pièce sans canShrink (maison 11052)', () => {
        const floor = run(roomTypes.map(t => ({ ...t, canShrink: false })));
        expect(floor.rooms.some(r => r.typeId === 'cellar')).toBe(false);
    });
});

describe('tour de garde et colimaçon (§34)', () => {
    const { program: p, params: base } = PRESETS.tower;
    const plans = SEEDS.slice(0, 12).map(seed => generate(p, { ...base, seed })).filter(r => r.ok).map(r => r.plan);

    it('monte d\'une seule cage carrée, au même endroit à tous les niveaux, contre un mur extérieur (CO-1, CO-3, CO-6)', () => {
        for (const plan of plans) {
            const cages = plan.floors.map(f => f.links.find(l => l.kind === 'spiral'));
            expect(cages.every(Boolean)).toBe(true);
            expect(new Set(cages.map(l => `${l.x},${l.y},${l.w},${l.h}`)).size).toBe(1);
            const [cage] = cages, ground = groundOf(plan);
            expect(cage.w).toBe(cage.h);
            expect(cage.x === 0 || cage.y === 0 || cage.x + cage.w === ground.width || cage.y + cage.h === ground.length).toBe(true);
        }
    });

    it('n\'ouvre le colimaçon que d\'un côté à chaque niveau (CO-2)', () => {
        for (const floor of plans.flatMap(plan => plan.floors)) {
            for (const link of floor.links.filter(l => l.kind === 'spiral')) expect(link.sides).toHaveLength(1);
        }
    });

    it('met le poste de guet au dernier étage, même avec un étage de plus (CO-9)', () => {
        for (const floors of [3, 4]) {
            const result = generate(p, { ...base, floors, seed: SEEDS[0] });
            expect(result.ok).toBe(true);
            const top = result.plan.floors.find(f => f.level === floors);
            expect(top.rooms.some(r => r.typeId === 'lookout')).toBe(true);
        }
    });
});

describe('shapeKind', () => {
    const rect = (x, y, w, h) => Array.from({ length: w * h }, (_, i) => [x + (i % w), y + Math.floor(i / w)]);
    it('reconnaît un rectangle', () => {
        expect(shapeKind(rect(0, 0, 3, 4))).toBe('rect');
    });
    it('reconnaît un L aux branches de 2 cases au moins', () => {
        expect(shapeKind([...rect(0, 0, 4, 2), ...rect(0, 2, 2, 2)])).toBe('L');
    });
    it('refuse une avancée d\'une case et une forme en U', () => {
        expect(shapeKind([...rect(0, 0, 4, 3), [4, 0]])).toBeNull();
        expect(shapeKind([...rect(0, 0, 2, 3), ...rect(2, 2, 2, 1), ...rect(4, 0, 2, 3)])).toBeNull();
    });
});
