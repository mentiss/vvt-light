// src/client/src/features/genmap/tools/generate.js
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

import engine from '../data/engine.json';
import { makeRandom } from './engine/random.js';
import { SIDES, OPPOSITE, OUTSIDE, CORRIDOR, isCorridor, createGrid, inside, ownerAt, setOwner, isFree, around, touchesOutside, cellKey, rectCells, cellsOf, cellsWhere, bounds, ratioOf, rectCentre, shapesFor, shapeKind, shapeIsValid, shrinkCandidates, tooWide, withClip } from './engine/grid.js';
import { quantityRange, levelsOf, resolveLevel } from './engine/program.js';
import { placeEntrance, placeStructural, SCHEME, layScheme, layoutFor, isOriented, shortSides, linkSidesAt, landingOf, landingCells, LANDING, linkShapes } from './engine/structure.js';
import { findPath, layCorridor, reachedNetwork, corridorStarts, layCorridors } from './engine/corridors.js';
import { distance, placeHub, placeRooms, growRectangles, addWings, settleLeftovers, pruneCorridors, splitCorridors } from './engine/rooms.js';
import { sharedWalls, placeDoors } from './engine/doors.js';
import { largestRect, adjacencyIsValid } from './engine/checks.js';
import { shapeMask } from './engine/shapes.js';

// Contrat public du moteur (§11.3) : la page, le rendu et les tests importent depuis ce fichier
export { OUTSIDE, CORRIDOR, isCorridor, shapeKind } from './engine/grid.js';
export { mulberry32 } from './engine/random.js';
export { resolvePreset, fitsContext } from './engine/program.js';
export { SHAPES } from './engine/shapes.js';

// ── Génération ───────────────────────────────────────────────────────────────

const levelOfFloor = (floor, params) => (floor === 'ground' ? 0 : floor === 'basement' ? -1 : floor === 'top' ? params.floors : Number(floor));

// Liens verticaux du bâtiment (§38.5) : la graine tire une disposition du preset ; chaque cage,
// rognée aux niveaux qui existent, devient une suite de liens d'un niveau au suivant qui partagent
// son emprise (`cage`). Complément : un étage que rien ne relie au niveau du dessous prolonge la
// cage qui dessert ce niveau (la plus haute, droite de préférence), ou reçoit un escalier ; un
// sous-sol sans cage reçoit un escalier de cave. Pour chaque cage, la graine décide aussi si son
// attirance (`near`, ST-3) joue pour ce plan.
const buildLinks = (program, params, rnd) => {
    const levels = levelsOf(params);
    const [low, high] = [Math.min(...levels), Math.max(...levels)];
    const cages = [];
    const disposition = program.stairs?.length ? rnd.pick(program.stairs) : { cages: [] };
    for (const c of disposition.cages) {
        const from = Math.max(low, levelOfFloor(c.from, params));
        const to = Math.min(high, levelOfFloor(c.to, params));
        const kind = Array.isArray(c.kind) ? rnd.pick(c.kind) : c.kind ?? 'straight';
        const near = rnd.next() < engine.nearChance ? c.near ?? [] : [];
        // Taille : un nombre, ou une par genre quand la graine choisit le genre ({ straight: 6, spiral: 4 })
        const size = (typeof c.size === 'object' ? c.size?.[kind] : c.size) ?? engine.stairSize;
        if (to > from) cages.push({ label: c.label, from, to, kind, size, near });
    }
    for (const level of levels.filter(l => l > 0)) {
        if (cages.some(c => c.from <= level - 1 && c.to >= level)) continue;
        const below = cages.filter(c => c.to === level - 1 && c.kind !== 'trap')
            .sort((a, b) => ((a.kind === 'spiral') - (b.kind === 'spiral')) || (a.from - b.from))[0];
        if (below) below.to = level;
        else cages.push({ label: 'Escalier', from: level - 1, to: level, kind: 'straight', size: engine.stairSize, near: [] });
    }
    if (levels.includes(-1) && !cages.some(c => c.from === -1)) {
        cages.push({ label: 'Escalier de cave', from: -1, to: 0, kind: 'straight', size: engine.cellarStairSize, near: [] });
    }
    // Un lien par paire de niveaux ; `kind` interne : 'spiral' ou rien (droit ; trappe = petite emprise)
    const links = cages.flatMap((c, i) => Array.from({ length: c.to - c.from }, (_, k) => ({
        label: c.label, from: c.from + k, to: c.from + k + 1, sizeInCells: c.size,
        kind: c.kind === 'spiral' ? 'spiral' : undefined, cage: `cage-${i + 1}`, cageFrom: c.from, cageTo: c.to, near: c.near,
    })));
    return links.map((l, i) => ({ ...l, id: `link-${i + 1}` }));
};

const linkTouches = (link, level) => link.from === level || link.to === level;

// Pièces du bâtiment pour une graine (§18.1, §20) : exemplaires du programme et étage de chacun,
// puis pioche dans le réservoir niveau par niveau (jamais au sous-sol, qui reste non excavé).
// Tirage fait une fois par graine : mêmes pièces et mêmes étages d'une tentative à l'autre.
const buildRooms = (program, params, links, corridorWidth, rnd) => {
    const surface = params.width * params.length - (params.voidCells?.length ?? 0);
    const rooms = [];
    const add = (entry, level) => {
        if (level !== null) rooms.push({ ...entry, typeId: entry.id, level, maxRatio: Math.max(entry.ratioMax, 1 / entry.ratioMin) });
    };
    // Entrée de famille (§39) : la graine choisit la variante, exemplaire par exemplaire
    const pick = (entry) => (entry.variants ? rnd.pick(entry.variants) : entry);
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
        for (let i = 0; i < count; i++) {
            const one = pick(entry);
            add(one, levelFor(one));
        }
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
    for (const unit of units.sort((a, b) => b.required - a.required)) {
        const entry = pick(unit.entry);
        const level = levelFor(entry);
        if (level === null || level < 0) continue;
        if (!unit.required && (capacityAt(level) >= surface * engine.fillMargin || neededAt(level) + entry.sizeMin > surface * engine.maxLoad)) continue;
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
                const one = pick(entry);
                annexes.push({ ...one, typeId: one.id, level: host.level, hostId: host.id, maxRatio: Math.max(one.ratioMax, 1 / one.ratioMin) });
            }
        }
    }
    return [...main, ...numbered(annexes)];
};

// Un niveau, pour une tentative : { floor } ou { reason, step }. `below` : niveau généré juste
// avant (celui du dessous pour un étage, le RDC pour le sous-sol). `placed` : position des liens
// verticaux déjà posés, partagée entre les niveaux.
// `sameAsBelow` : même schéma que le niveau du dessous (son couloir se superpose, E2-3) ;
// `aboveSpine` (RDC) : l'étage aura un couloir traversant à lui, l'escalier l'anticipe (CN-3).
const attemptLevel = (rooms, { level, params, density, scheme, width, maxWidth, facade, links, placed, below, rnd, sameAsBelow = false, aboveSpine = false, closetType = null, spaceAnnexTypes = [], hub = null, reservoir = [], storeType = null, typesTaken = [] }) => {
    const g = createGrid(params.width, params.length);
    // Gabarit (§40) : cases hors forme retirées au RDC et au sous-sol ; les étages en héritent
    if (level <= 0) params.voidCells?.forEach(k => setOwner(g, ...k.split(',').map(Number), OUTSIDE));
    // Bâtiment rond (§40.1, CE-2) : cases rognées par le disque, à tous les niveaux
    if (params.clipCells?.length) g.clip = new Set(params.clipCells);
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
        // Même cage (§38.5) : l'emprise est déjà posée, à ce niveau (cases au nom de son escalier)
        // ou seulement à un autre (cases à poser ici)
        const continued = levelLinks.find(l => placed.has(l.id) && l.cage === link.cage);
        const elsewhere = continued ? null : links.find(l => placed.has(l.id) && l.cage === link.cage);
        if (continued) {
            placed.set(link.id, placed.get(continued.id));
            owner.set(link.id, owner.get(continued.id));
            continue;
        }
        if (elsewhere) {
            const r = placed.get(elsewhere.id);
            const cells = rectCells(r.x, r.y, r.w, r.h);
            if (!cells.every(c => isFree(g, ...c))) return { reason: 'envelope', step: 'links' };
            cells.forEach(c => setOwner(g, ...c, link.id));
            placed.set(link.id, r);
            owner.set(link.id, link.id);
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
        const base = spiral ? walls : towardAxis ? (r) => -Math.min(...validBottoms(r).map(b => axisGap(r, b))) : null;
        // Deux cages qui desservent des niveaux communs s'éloignent l'une de l'autre (§38.5, ST-4),
        // jusqu'à la moitié de la longueur du bâtiment : au-delà, chercher plus loin coûte des plans
        // (34 / 40 au lieu de 37 pour le manoir à deux cages, §38.6)
        const rivals = [...new Set(links.filter(o => o.cage !== link.cage && placed.has(o.id)
            && Math.min(o.cageTo, link.cageTo) > Math.max(o.cageFrom, link.cageFrom)).map(o => placed.get(o.id)))];
        const far = (r) => Math.min(...rivals.map(o => distance(rectCentre(r), rectCentre(o))));
        const prefer = rivals.length ? (r) => (base ? base(r) : 0) + Math.min(far(r), Math.max(g.width, g.length) / 2) : base;
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
            // Tout escalier droit posé ici ouvre de préférence, à ce niveau, du côté de la racine
            // (l'entrée au RDC, l'escalier d'arrivée ailleurs) : ni recoin ni palier tourné vers un
            // mur de pièce (§37.6) ; l'escalier qui monte du RDC retrouve la règle PA-2
            const bottoms = validBottoms(rect);
            const openHere = (b) => (level === Math.min(link.from, link.to) ? b : OPPOSITE[b]);
            const towardRoot = !towardAxis && bottoms[0] !== null;
            const best = towardAxis ? Math.min(...bottoms.map(b => axisGap(rect, b)))
                : towardRoot ? Math.min(...bottoms.map(b => entranceGap(openHere(b)))) : null;
            rect.bottom = rnd.pick(towardAxis ? bottoms.filter(b => axisGap(rect, b) === best)
                : towardRoot ? bottoms.filter(b => entranceGap(openHere(b)) === best) : bottoms);
        }
        placed.set(link.id, rect);
        owner.set(link.id, link.id);
        rectCells(rect.x, rect.y, rect.w, rect.h).forEach(c => setOwner(g, ...c, link.id));
    }
    // Paliers des autres cages à ce niveau, posées ici ou à un autre niveau (§38.5) : côtés ouverts
    // de toute la cage, réservés tant que les couloirs ne les ont pas atteints ; sans couloir,
    // jusqu'à ce que les pièces aient grandi (PA-1). Colimaçon traversé sans y arriver : son
    // ouverture à ce niveau, parmi les côtés au palier libre, de préférence vers la racine.
    for (const id of new Set(levelLinks.map(l => owner.get(l.id)))) {
        if (id === root.id) continue;
        const group = levelLinks.filter(l => owner.get(l.id) === id);
        const rect = placed.get(group[0].id);
        if (rect.spiral && rect.spiral[level] == null) {
            const options = Object.keys(SIDES).filter(s => landingCells(rect, s).every(c => isFree(g, ...c)));
            if (!options.length) return { reason: 'envelope', step: 'landing' };
            const gap = (s) => distance(landingOf(rect, s), rectCentre(rootRect));
            const best = Math.min(...options.map(gap));
            rect.spiral[level] = rnd.pick(options.filter(s => gap(s) === best));
        }
        const sides = groupSides(group);
        if (!sides) continue;
        const cells = sides.flatMap(s => landingCells(rect, s)).filter(c => isFree(g, ...c));
        cells.forEach(c => setOwner(g, ...c, LANDING));
        held.push(cells);
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
    // Attirance des cages (§38.5, ST-3) : type de pièce → cages de ce niveau qui l'attirent pour ce plan
    const attract = new Map();
    levelLinks.filter(l => l.near?.length).forEach(l => l.near.forEach(t => attract.set(t, new Set([...(attract.get(t) ?? []), owner.get(l.id)]))));
    if (!placeRooms(g, priority, first, isNetwork, rnd, false, attract)) return { reason: 'envelope', step: 'rooms' };
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
        // Une cage qui traverse ce niveau a deux ouvertures (§38.5) : chacune rejoint le réseau, et
        // le chemin qui la relie n'est pas élagué
        // Cases du réseau réellement reliées à la racine (couloir et pièces ouvertes, de proche en proche)
        const reachedCells = () => {
            const open = (id) => id === CORRIDOR || circulation.has(id) || id === root.id;
            const start = level === 0 ? cellsOf(g, root.id) : [...landingKeys].map(k => k.split(',').map(Number));
            const seen = new Set(start.map(cellKey));
            for (const queue = [...start]; queue.length;) {
                const [x, y] = queue.shift();
                for (const n of around(x, y)) {
                    const k = `${n.x},${n.y}`;
                    if (!seen.has(k) && open(ownerAt(g, n.x, n.y))) { seen.add(k); queue.push([n.x, n.y]); }
                }
            }
            return seen;
        };
        for (const group of held) {
            const reached = reachedCells();
            if (!group.length || group.some(c => reached.has(cellKey(c)))) continue;
            const keys = new Set(group.map(cellKey));
            const before = new Set(cellsOf(g, CORRIDOR).map(cellKey));
            const starts = [...reached].map(k => k.split(',').map(Number))
                .flatMap(([x, y]) => [[x, y], ...around(x, y).filter(n => isFree(g, n.x, n.y)).map(n => [n.x, n.y])])
                .filter(([x, y]) => ownerAt(g, x, y) === CORRIDOR || isFree(g, x, y));
            const path = findPath(g, starts, (x, y) => around(x, y).some(n => keys.has(`${n.x},${n.y}`)), rnd);
            if (!path) return { reason: 'envelope', step: 'corridors' };
            layCorridor(g, path, levelWidth);
            cellsOf(g, CORRIDOR).filter(c => !before.has(cellKey(c))).forEach(c => fixed.add(cellKey(c)));
        }
    }

    // Autres pièces (§6.1 étape 4), cibles recalculées sur l'espace réellement libre. Restes :
    // contour libre au RDC selon le réglage, toujours à l'étage (étage plus petit, §20, E2-7),
    // non excavé au sous-sol
    const outline = basement ? 'excavate' : level > 0 ? true : params.freeOutline;
    if (!setTargets(others, cellsOf(g, null).length)) return { reason: 'overload', step: 'free' };
    if (!placeRooms(g, others, [...first, ...priority], isNetwork, rnd, level !== 0 && levelWidth > 0, attract)) return { reason: 'envelope', step: 'rooms' };
    // Annexes sans place contre leur hôte : mises de côté, découpées plus loin dans l'hôte s'il le
    // permet, sinon abandonnées (§23, AC-3 ; §32)
    const homeless = rooms.filter(r => r.dropped);
    for (const list of [rooms, growing, others]) {
        for (let i = list.length - 1; i >= 0; i--) if (list[i].dropped) list.splice(i, 1);
    }
    // Grand reste (§37, GR-1), quand partage et glissement n'ont rien donné : une pièce de complément
    // du réservoir pour ce niveau, qui a la taille, les proportions et la forme du reste et y est
    // desservie (la graine choisit parmi celles qui vont) ; à défaut, au-delà de la taille d'un
    // débarras, une réserve. Ajoutée comme une annexe imposée par la place (`fromSpace`).
    const onLevel = (floor) => floor === 'any' || floor == null || Number(floor) === level
        || (floor === 'ground' && level === 0) || (floor === 'upper' && level > 0) || (floor === 'top' && level === params.floors);
    let created = 0;
    // Rectangles contenus dans un reste de forme irrégulière (en U, en escalier), du plus grand au
    // plus petit : la pièce en prend un, le bout restant repasse par la règle des restes
    const rectsIn = (cells) => {
        const set = new Set(cells.map(cellKey));
        const found = [];
        for (const [x0, y0] of cells) {
            for (let w = 1; set.has(`${x0 + w - 1},${y0}`); w++) {
                for (let h = 1; rectCells(x0, y0 + h - 1, w, 1).every(c => set.has(cellKey(c))); h++) found.push(rectCells(x0, y0, w, h));
            }
        }
        return found.sort((a, b) => b.length - a.length);
    };
    // Rend { room, cells } ou null
    const fillLeftover = (leftover) => {
        if (basement) return null;
        for (const region of shapeKind(withClip(g, leftover)) ? [leftover] : rectsIn(leftover)) {
            const made = fillWith(region, leftover.length);
            if (made) return made;
        }
        return null;
    };
    const fillWith = (region, leftoverSize) => {
        const box = bounds(region);
        const near = new Set(region.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))));
        const nearRooms = rooms.filter(r => near.has(r.id));
        const onNetwork = [...near].some(id => isCorridor(id) || circulation.has(id));
        // Exposition obligatoire (§39) : une latrine ou un observatoire ne naît pas au milieu du bâtiment
        const touchesOut = region.some(c => touchesOutside(g, ...c));
        const exposureOk = (t) => !t.exposureRequired || (t.exposure === 'window' ? touchesOut : t.exposure !== 'interior' || !touchesOut);
        const shapes = (t, overflow = 0) => exposureOk(t) && region.length >= t.sizeMin && region.length <= Math.floor(t.sizeMax * (1 + overflow))
            && ratioOf(box.w, box.h) <= Math.max(t.ratioMax, 1 / t.ratioMin) && shapeKind(withClip(g, region)) !== null
            && !nearRooms.some(r => t.cannotBeAdjacentTo.includes(r.typeId) || r.cannotBeAdjacentTo.includes(t.id))
            && t.mustBeAdjacentTo.every(id => nearRooms.some(r => r.typeId === id));
        // Hors densité dense, une pièce fermée donne sur le réseau ; en dense, une voisine suffit
        const served = (t) => onNetwork || (levelWidth === 0 && density.corridorWidth === 0 && t.circulationAccess !== 'required' && nearRooms.length > 0);
        // Une pièce de complément ne dépasse pas la quantité maximale de son entrée (une famille compte
        // toutes ses variantes), pièces déjà tirées et pièces posées dans un reste comprises
        const ids = (t) => new Set(t.variants ? t.variants.map(v => v.id) : [t.id]);
        const below = (t) => [...typesTaken, ...rooms.filter(r => r.fromSpace).map(r => r.typeId)].filter(id => ids(t).has(id)).length < quantityRange(t)[1];
        const options = reservoir.filter(t => below(t) && onLevel(t.floor) && !t.structural && !t.outdoor && !t.circulation
            && t.role !== 'annex' && t.outsideAccess !== 'required' && shapes(t) && served(t));
        let type = options.length ? rnd.pick(options) : null;
        // Réserve : sur le réseau, sinon rattachée à une pièce voisine qui accepte d'ouvrir sur une
        // réserve (§23 ; on y entre par elle, comme une annexe)
        let host = null;
        if (!type && storeType && leftoverSize > engine.closetMaxSize && shapes(storeType, engine.leftoverOverflow)) {
            const hosts = served(storeType) ? null : nearRooms.filter(r => !r.outdoor && !r.hostId && !r.noAnnex && r.role !== 'annex'
                && !r.access.forbidden.includes(storeType.id) && (!r.access.optional.length || r.access.optional.includes(storeType.id)));
            if (!hosts) type = storeType;
            else if (hosts.length) { type = storeType; host = rnd.pick(hosts); }
        }
        if (!type) return null;
        const count = typesTaken.filter(t => t === type.id).length + rooms.filter(r => r.fromSpace && r.typeId === type.id).length;
        const rect = shapeKind(withClip(g, region)) === 'rect' ? { x0: box.x, y0: box.y, x1: box.x + box.w - 1, y1: box.y + box.h - 1 } : null;
        const room = {
            ...type, id: `${type.id}-${level}-g${++created}`, typeId: type.id, level, fromSpace: true,
            label: count ? `${type.label} ${count + 1}` : type.label,
            maxRatio: Math.max(type.ratioMax, 1 / type.ratioMin), area: region.length, target: region.length, rect, wing: !rect,
            ...(host ? { hostId: host.id, access: { ...type.access, required: [host.typeId] }, circulationAccess: 'forbidden' } : {}),
        };
        rooms.push(room);
        growing.push(room);
        return { room, cells: region };
    };

    growRectangles(g, others, rnd, false);
    addWings(g, others, rnd);
    growRectangles(g, [...first, ...growing], rnd, true);
    // Avec un couloir, une pièce n'est ajoutée qu'au second passage, une fois le couloir élagué :
    // elle ne doit pas compter sur un couloir provisoire qui va disparaître
    settleLeftovers(g, [...first, ...growing], outline, levelWidth > 0 ? null : fillLeftover);
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
                if (shapeKind(withClip(g, own), 1) && own.length <= Math.floor(r.sizeMax * (1 + engine.leftoverOverflow))) return (r.landing = true);
                cells.forEach(c => setOwner(g, ...c, LANDING));
                return false;
            });
        if (!host) cells.forEach(c => { setOwner(g, ...c, CORRIDOR); fixed.add(cellKey(c)); });
    }

    // Élagage des culs-de-sac (§13, O-3) : les pièces regrandissent dans l'espace rendu, puis largeur maximale
    if (levelWidth > 0) {
        pruneCorridors(g, rooms, linkNodes, root, levelWidth, fixed);
        growRectangles(g, [...first, ...growing], rnd, true);
        settleLeftovers(g, [...first, ...growing], outline, fillLeftover);
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
                && ratioOf(box.w, box.h) <= Math.max(type.ratioMax, 1 / type.ratioMin) && shapeKind(withClip(g, cells), 1) !== null;
            const hosts = [...new Set(cells.flatMap(([x, y]) => around(x, y).map(n => ownerAt(g, n.x, n.y))))]
                .map(o => rooms.find(r => r.id === o))
                .filter(r => r && !r.outdoor && r.role !== 'annex' && !r.hostId && !r.noAnnex);
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
    if (![...first, ...growing].every(r => r.landing || shapeIsValid(r, roomCells.get(r.id), engine.leftoverOverflow, g))) return { reason: 'seed', step: 'shape' };
    if (level === 0 && !rooms.filter(r => r.outsideAccess === 'required').every(r => roomCells.get(r.id).some(c => touchesOutside(g, ...c)))) return { reason: 'seed', step: 'exterior' };
    // Exposition obligatoire (§39, B2-9) : fenêtre (hors sous-sol) ou pièce intérieure
    const exposed = (r) => roomCells.get(r.id).some(c => touchesOutside(g, ...c));
    if (!rooms.filter(r => r.exposureRequired).every(r => (r.exposure === 'window' ? basement || exposed(r) : r.exposure !== 'interior' || !exposed(r)))) return { reason: 'seed', step: 'exposure' };
    if (!adjacencyIsValid(rooms, sharedWalls(g))) return { reason: 'adjacency', step: 'adjacency' };
    if (!rooms.filter(r => r !== entrance && r.circulationAccess !== 'forbidden' && (levelWidth > 0 || r.circulationAccess === 'required')).every(r => touchesNetwork(roomCells.get(r.id)))) return { reason: 'seed', step: 'served' };

    // Portes (§6.1 étape 5)
    const { doors, connected } = placeDoors(g, rooms, linkNodes, corridorParts, root, level === 0 ? facade : null, density, rnd);
    if (!connected) return { reason: 'seed', step: 'doors' };

    // Fenêtres (§39, B2-10) : sur chaque mur extérieur d'une pièce qui en veut (hors sous-sol), une
    // fenêtre au milieu, deux au tiers et aux deux tiers à partir de 6 cases ; jamais sur une porte
    const doorEdges = new Set(doors.map(d => `${d.x},${d.y},${d.side}`));
    const windows = [];
    for (const room of basement ? [] : rooms.filter(r => r.exposure === 'window')) {
        for (const side of Object.keys(SIDES)) {
            const [dx, dy] = SIDES[side];
            const edges = roomCells.get(room.id).filter(([x, y]) => ownerAt(g, x + dx, y + dy) === OUTSIDE && !doorEdges.has(`${x},${y},${side}`))
                .sort((a, b) => (dx ? a[0] - b[0] || a[1] - b[1] : a[1] - b[1] || a[0] - b[0]));
            // Murs d'un seul tenant de ce côté (cases contiguës sur la même ligne)
            const walls = [];
            for (const cell of edges) {
                const last = walls.at(-1)?.at(-1);
                const next = last && (dx ? last[0] === cell[0] && cell[1] === last[1] + 1 : last[1] === cell[1] && cell[0] === last[0] + 1);
                if (next) walls.at(-1).push(cell); else walls.push([cell]);
            }
            for (const wall of walls.filter(w => w.length >= 2)) {
                const spots = wall.length >= 6 ? [Math.floor(wall.length / 3), Math.floor(2 * wall.length / 3)] : [Math.floor(wall.length / 2)];
                spots.forEach(i => windows.push({ x: wall[i][0], y: wall[i][1], side, room: room.id }));
            }
        }
    }

    return {
        floor: {
            level,
            width:  g.width,
            length: g.length,
            facade: level === 0 ? facade : null,
            // Bâtiment rond (§40.1, CE-1) : cercle en cases, pour le mur dessiné en arc
            circle: params.circle,
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
            windows,
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
                // Grand reste (§37, GR-1) : pièces de complément possibles, réserve, et types déjà
                // présents dans le bâtiment (pour numéroter une pièce ajoutée)
                reservoir: (program.optionalRooms ?? []).filter(e => !e.per), storeType: program.storeType,
                typesTaken: [...rooms.map(r => r.typeId), ...floors.flatMap(f => f.rooms.filter(r => r.fromSpace).map(r => r.typeId))],
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
 * @param {{ width, length, floors, basement, density, seed, corridorMaxWidth?, outline?, shape?, freeOutline?, scheme? }} params
 *        `outline` (§40) : 'rect' (défaut), 'shape' (gabarit `shape`) ou 'free' (= `freeOutline`)
 * @returns {{ ok: true, plan: { seed, attempt, floors } } | { ok: false, reason: 'envelope'|'overload'|'oversize'|'unfilled'|'adjacency'|'seed', steps }}
 */
export const generate = (program, input) => {
    // Contour (§16, B-5, §40) : rectangle, gabarit tiré une fois par graine, ou contour libre
    const outline = input.freeOutline ? 'free' : input.outline ?? 'rect';
    const mask = outline === 'shape' ? shapeMask(input.shape, input.width, input.length, makeRandom(input.seed ^ 0x68e31da4)) : null;
    if (outline === 'shape' && !mask) return { ok: false, reason: 'envelope', steps: { '0:shape': 1 } };
    const params = {
        ...input, freeOutline: outline === 'free', voidCells: mask?.outside ?? [],
        clipCells: mask?.clip ? mask.outside : [], circle: mask?.circle ?? null,
    };
    const density = engine.densities[params.density] ?? engine.densities.balanced;
    const surface = params.width * params.length - params.voidCells.length;
    const maxWidth = params.corridorMaxWidth ?? engine.corridorMaxWidth;
    // Disposition des escaliers tirée une fois par graine, sur un tirage à part (§38.5)
    const links = buildLinks(program, params, makeRandom(params.seed ^ 0x2545f491));

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
