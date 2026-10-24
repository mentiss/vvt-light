// src/client/src/genmap/renderSvg.js
// ─────────────────────────────────────────────────────────────────────────────
// Rendu SVG d'un étage généré (spec_genmap.md §7) : style plan technique neutre,
// sans fond. Murs tracés aux frontières entre propriétaires de cases (simple pointillé
// entre deux espaces de circulation), cases retirées du bâtiment laissées vides, portes
// en trait fin avec arc, escaliers hachurés, libellés, en-tête d'étage, échelle.
// ─────────────────────────────────────────────────────────────────────────────

import { CORRIDOR, OUTSIDE } from './generate.js';

const CELL   = 32;
const PAD    = 24;
const HEADER = 40;
const FOOTER = 44;

const SIDE_DELTA = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };

export const floorLabel = (level) => (
    level < 0 ? 'Sous-sol' : level === 0 ? 'Rez-de-chaussée' : `Étage ${level}`
);

const escapeXml = (text) => String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Extrémités (en px) de l'arête `side` de la case (x, y)
const edgePoints = (x, y, side) => {
    const px = PAD + x * CELL, py = HEADER + y * CELL;
    return {
        n: [px, py, px + CELL, py],
        s: [px, py + CELL, px + CELL, py + CELL],
        w: [px, py, px, py + CELL],
        e: [px + CELL, py, px + CELL, py + CELL],
    }[side];
};

// Battant et arc d'une porte ouvrant dans la case (x, y)
const doorSymbol = ({ x, y, side }) => {
    const [x1, y1] = edgePoints(x, y, side);
    const [dx, dy] = SIDE_DELTA[side];
    const r = CELL * 0.85;
    const inset = (CELL - r) / 2;
    // Charnière au début de l'arête, battant perpendiculaire vers l'intérieur de la case,
    // arc jusqu'à l'autre bout de l'ouverture
    const horizontal = side === 'n' || side === 's';
    const hx = horizontal ? x1 + inset : x1;
    const hy = horizontal ? y1 : y1 + inset;
    const lx = hx - dx * r, ly = hy - dy * r;
    const ex = horizontal ? hx + r : hx, ey = horizontal ? hy : hy + r;
    const sweep = side === 's' || side === 'w' ? 1 : 0;
    return `<line x1="${hx}" y1="${hy}" x2="${lx}" y2="${ly}" />`
        + `<path d="M${lx} ${ly} A${r} ${r} 0 0 ${sweep} ${ex} ${ey}" stroke-dasharray="2 2" />`;
};

// Escalier en colimaçon (§34) : cercle inscrit dans la cage, marches rayonnantes autour d'un
// noyau, étages desservis en abrégé (la cage est petite)
const shortLabel = (level) => (level < 0 ? 'SS' : level === 0 ? 'RDC' : `É${level}`);
const spiralSymbol = (link, level) => {
    const px = PAD + link.x * CELL, py = HEADER + link.y * CELL;
    const cx = px + link.w * CELL / 2, cy = py + link.h * CELL / 2;
    const r = Math.min(link.w, link.h) * CELL / 2 - 3, core = 4;
    const steps = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * 2 * Math.PI;
        return `<line x1="${cx + core * Math.cos(a)}" y1="${cy + core * Math.sin(a)}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" />`;
    });
    const text = link.targets.map(t => `${t > level ? '↑' : '↓'}${shortLabel(t)}`).join(' ');
    const boxWidth = text.length * 5 + 8;
    return `<g stroke="#000" stroke-width="0.8" fill="none"><circle cx="${cx}" cy="${cy}" r="${r}" />${steps.join('')}<circle cx="${cx}" cy="${cy}" r="${core}" fill="#fff" /></g>`
        + `<rect x="${cx - boxWidth / 2}" y="${cy - 8}" width="${boxWidth}" height="16" fill="#fff" stroke="#000" stroke-width="0.8" />`
        + `<text x="${cx}" y="${cy + 3.5}" font-size="9" text-anchor="middle">${escapeXml(text)}</text>`;
};

// Marches d'un escalier, perpendiculaires à son grand côté, et indication des étages desservis
// depuis l'étage affiché (↑ au-dessus, ↓ en dessous)
const linkSymbol = (link, level) => {
    if (link.kind === 'spiral') return spiralSymbol(link, level);
    const px = PAD + link.x * CELL, py = HEADER + link.y * CELL;
    const w = link.w * CELL, h = link.h * CELL;
    const vertical = h >= w;
    const step = CELL / 3;
    const lines = [];
    for (let d = step; d < (vertical ? h : w); d += step) {
        lines.push(vertical
            ? `<line x1="${px}" y1="${py + d}" x2="${px + w}" y2="${py + d}" />`
            : `<line x1="${px + d}" y1="${py}" x2="${px + d}" y2="${py + h}" />`);
    }
    // Étiquette, tournée dans le sens de la longueur si le lien est trop étroit (trappe)
    const cx = px + w / 2, cy = py + h / 2;
    const text = link.targets.map(t => `${t > level ? '↑' : '↓'} ${floorLabel(t)}`).join(' · ');
    const boxWidth = text.length * 5.6 + 10;
    const label = `<rect x="${cx - boxWidth / 2}" y="${cy - 9}" width="${boxWidth}" height="18" fill="#fff" stroke="#000" stroke-width="0.8" />`
        + `<text x="${cx}" y="${cy + 4}" font-size="10" text-anchor="middle">${escapeXml(text)}</text>`;
    return `<g stroke="#000" stroke-width="0.8">${lines.join('')}</g>`
        + (w < boxWidth && h > w ? `<g transform="rotate(-90 ${cx} ${cy})">${label}</g>` : label);
};

// Libellé centré dans le plus grand rectangle de la pièce, réduit ou coupé s'il déborde
const roomLabel = (room) => {
    const { x, y, w, h } = room.labelBox;
    const cx = PAD + (x + w / 2) * CELL, cy = HEADER + (y + h / 2) * CELL;
    const width = w * CELL - 6;
    const fits = (text, size) => text.length * size * 0.58 <= width;
    let size = 13;
    while (size > 8 && !fits(room.label, size)) size--;
    const words = room.label.split(' ');
    if (fits(room.label, size) || words.length < 2) {
        return `<text x="${cx}" y="${cy + size / 3}" font-size="${size}" text-anchor="middle">${escapeXml(room.label)}</text>`;
    }
    const half = Math.ceil(words.length / 2);
    return `<text x="${cx}" y="${cy - size / 3}" font-size="${size}" text-anchor="middle">`
        + `<tspan x="${cx}">${escapeXml(words.slice(0, half).join(' '))}</tspan>`
        + `<tspan x="${cx}" dy="${size * 1.15}">${escapeXml(words.slice(half).join(' '))}</tspan></text>`;
};

/**
 * SVG d'un étage du plan.
 * @param {{ floors: object[] }} plan  résultat de generate()
 * @param {number} floorIndex
 * @returns {string}
 */
export const renderSvg = (plan, floorIndex = 0) => {
    const floor = plan.floors[floorIndex];
    const { width, length } = floor;
    const svgWidth  = width * CELL + PAD * 2;
    const svgHeight = HEADER + length * CELL + FOOTER;

    // Propriétaire de chaque case
    const owner = new Array(width * length).fill(null);
    const ownerAt = (x, y) => (x >= 0 && y >= 0 && x < width && y < length ? owner[y * width + x] : OUTSIDE);
    floor.rooms.forEach(r => r.cells.forEach(([x, y]) => { owner[y * width + x] = r.id; }));
    floor.corridor.forEach(([x, y]) => { owner[y * width + x] = CORRIDOR; });
    floor.links.forEach(l => {
        for (let y = l.y; y < l.y + l.h; y++) for (let x = l.x; x < l.x + l.w; x++) owner[y * width + x] = l.id;
    });
    floor.voids.forEach(([x, y]) => { owner[y * width + x] = OUTSIDE; });

    // Réseau de circulation : couloirs et pièces ouvertes, séparés par un simple pointillé
    const circulation = new Set(floor.rooms.filter(r => r.circulation).map(r => r.id));
    const isNetwork = (id) => id === CORRIDOR || circulation.has(id);

    // Arêtes ouvertes (portes et passages), vues des deux côtés
    const open = new Set();
    for (const d of floor.doors) {
        const [dx, dy] = SIDE_DELTA[d.side];
        const opposite = { n: 's', s: 'n', e: 'w', w: 'e' }[d.side];
        open.add(`${d.x},${d.y},${d.side}`);
        open.add(`${d.x + dx},${d.y + dy},${opposite}`);
    }

    // Arêtes entre deux propriétaires différents (chaque arête une fois) : mur extérieur, mur
    // intérieur, ou pointillé entre deux espaces de circulation ; quadrillage à l'intérieur
    const interior = [], exterior = [], limits = [], grid = [];
    for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
            const a = ownerAt(x, y);
            if (a === OUTSIDE) continue;
            for (const side of ['n', 'e', 's', 'w']) {
                const [dx, dy] = SIDE_DELTA[side];
                const b = ownerAt(x + dx, y + dy);
                if (b === OUTSIDE) {
                    if (!open.has(`${x},${y},${side}`)) exterior.push(edgePoints(x, y, side));
                    continue;
                }
                if (side !== 'e' && side !== 's') continue;
                if (b === a) grid.push(edgePoints(x, y, side));
                else if (open.has(`${x},${y},${side}`)) continue;
                else if (isNetwork(a) && isNetwork(b)) limits.push(edgePoints(x, y, side));
                else interior.push(edgePoints(x, y, side));
            }
        }
    }
    const segments = (edges) => edges.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join('');

    const cellRects = (cells) => cells.map(([x, y]) => `<rect x="${PAD + x * CELL}" y="${HEADER + y * CELL}" width="${CELL}" height="${CELL}" />`).join('');
    const circulationCells = [...floor.corridor, ...floor.rooms.filter(r => r.circulation).flatMap(r => r.cells)];
    const outdoorRooms = floor.rooms.filter(r => r.outdoor);
    // Sous-sol : la partie non excavée est hachurée (§20, E2-6)
    const unexcavated = floor.level < 0 ? floor.voids : [];

    // Échelle : 5 cases (ou la largeur si plus petite)
    const scale = Math.min(5, width);
    const sy = HEADER + length * CELL + 26;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" font-family="Arial, Helvetica, sans-serif" fill="#000">`
        + `<defs><pattern id="genmap-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#000" stroke-width="0.8" stroke-opacity="0.35" /></pattern></defs>`
        + `<text x="${PAD}" y="${HEADER - 14}" font-size="16" font-weight="bold">${escapeXml(floorLabel(floor.level))}</text>`
        + `<g fill="#000" fill-opacity="0.06">${cellRects(circulationCells)}</g>`
        + `<g fill="url(#genmap-hatch)">${outdoorRooms.map(r => cellRects(r.cells)).join('')}${cellRects(unexcavated)}</g>`
        + `<path d="${segments(grid)}" stroke="#000" stroke-opacity="0.12" stroke-width="0.5" fill="none" />`
        + floor.links.map(link => linkSymbol(link, floor.level)).join('')
        + `<path d="${segments(limits)}" stroke="#000" stroke-width="1" stroke-dasharray="4 3" fill="none" />`
        + `<path d="${segments(interior)}" stroke="#000" stroke-width="2.5" stroke-linecap="square" fill="none" />`
        + `<path d="${segments(exterior)}" stroke="#000" stroke-width="5" stroke-linecap="square" fill="none" />`
        + `<g stroke="#000" stroke-width="1.2" fill="none">${floor.doors.filter(d => d.kind === 'door').map(doorSymbol).join('')}</g>`
        + floor.rooms.map(roomLabel).join('')
        + `<g stroke="#000" stroke-width="1.5" fill="none"><path d="M${PAD} ${sy}H${PAD + scale * CELL}M${PAD} ${sy - 5}V${sy + 5}M${PAD + scale * CELL} ${sy - 5}V${sy + 5}" /></g>`
        + `<text x="${PAD + scale * CELL + 8}" y="${sy + 4}" font-size="11">${scale} cases</text>`
        + `</svg>`;
};
