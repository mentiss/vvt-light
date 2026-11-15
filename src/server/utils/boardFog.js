// src/server/utils/boardFog.js
// ─────────────────────────────────────────────────────────────────────────────
// Brouillard d'une diapositive (documentations/plateforme/spec_tableau.md §15) :
// lecture, ajout d'une forme et fusion, sans base ni requête (fonctions pures).
//
// Format (board_slides.fog, JSON) : groupes rejoués dans l'ordre, qui alternent
// toujours (jamais deux groupes successifs du même type) :
//   [{ op: 'reveal'|'cover', shapes: [ { x, y, w, h } | { points: [x1, y1, …], r } ] }]
// L'ordre ne compte qu'entre un dévoilement et un recouvrement : des formes
// successives du même type forment un seul groupe (§15.2, 1).
// Ancien format, converti à la lecture : [{ op, x, y, w, h }] (une forme par opération).
// ─────────────────────────────────────────────────────────────────────────────

const FOG_OPS = ['reveal', 'cover'];
const MAX_FOG_GROUPS = 500;          // alternances dévoiler / recouvrir
const MAX_FOG_COORDS = 100000;       // volume total de points (un rectangle compte 4)
const MAX_BRUSH_COORDS = 8000;       // un coup de pinceau : 4 000 points
const MAX_BRUSH_RADIUS = 5000;

const isNum = (value) => typeof value === 'number' && Number.isFinite(value);

/** Boîte englobante d'une forme ; pinceau : ses points élargis du rayon */
function shapeBox(shape) {
    if (!shape.points) return shape;
    const xs = shape.points.filter((_, i) => i % 2 === 0);
    const ys = shape.points.filter((_, i) => i % 2 === 1);
    const x = Math.min(...xs) - shape.r;
    const y = Math.min(...ys) - shape.r;
    return { x, y, w: Math.max(...xs) + shape.r - x, h: Math.max(...ys) + shape.r - y };
}

/** La boîte est-elle entièrement dans le rectangle ? */
const contains = (rect, box) =>
    box.x >= rect.x && box.y >= rect.y && box.x + box.w <= rect.x + rect.w && box.y + box.h <= rect.y + rect.h;

/** Groupes vides retirés, voisins du même type rejoints */
function compact(groups) {
    const out = [];
    for (const group of groups) {
        if (group.shapes.length === 0) continue;
        const last = out.at(-1);
        if (last?.op === group.op) last.shapes.push(...group.shapes);
        else out.push({ op: group.op, shapes: [...group.shapes] });
    }
    return out;
}

/** Brouillard lu en base (texte JSON ou tableau, ancien ou nouveau format) → groupes */
function readFog(raw) {
    let list = raw;
    if (typeof raw === 'string') {
        try { list = JSON.parse(raw); } catch { list = []; }
    }
    if (!Array.isArray(list)) return [];
    return compact(list
        .filter(entry => FOG_OPS.includes(entry?.op))
        .map(entry => (Array.isArray(entry.shapes)
            ? { op: entry.op, shapes: entry.shapes }
            : { op: entry.op, shapes: [{ x: entry.x, y: entry.y, w: entry.w, h: entry.h }] })));
}

/**
 * Forme envoyée par le MJ, vérifiée : { x, y, w, h } ou { points, r } ; null si invalide.
 * Un pinceau d'un seul point (simple clic) fait un rond.
 */
function cleanFogShape(body) {
    if (body.points !== undefined) {
        const { points, r } = body;
        if (!Array.isArray(points) || points.length < 2 || points.length % 2 !== 0 || points.length > MAX_BRUSH_COORDS) return null;
        if (!points.every(isNum) || !isNum(r) || r <= 0 || r > MAX_BRUSH_RADIUS) return null;
        return { points, r };
    }
    const { x, y, w, h } = body;
    if (![x, y, w, h].every(isNum) || w <= 0 || h <= 0) return null;
    return { x, y, w, h };
}

/** Taille du brouillard : nombre de groupes et de coordonnées */
function fogSize(groups) {
    const coords = groups.reduce((sum, g) => sum + g.shapes.reduce((s, shape) => s + (shape.points ? shape.points.length : 4), 0), 0);
    return { groups: groups.length, coords };
}

/**
 * Ajoute une forme au brouillard (§15.2) : un rectangle retire d'abord les formes
 * qu'il contient entièrement (elles n'ont plus d'effet), puis la forme rejoint le
 * dernier groupe s'il est du même type. Renvoie les nouveaux groupes, ou null si le
 * garde-fou de taille est dépassé (rien n'est jamais retiré sans prévenir).
 */
function addFogShape(fog, op, shape) {
    let groups = readFog(fog);
    if (!shape.points) {
        groups = groups.map(g => ({ op: g.op, shapes: g.shapes.filter(s => !contains(shape, shapeBox(s))) }));
    }
    groups = compact([...groups, { op, shapes: [shape] }]);
    const size = fogSize(groups);
    return size.groups > MAX_FOG_GROUPS || size.coords > MAX_FOG_COORDS ? null : groups;
}

module.exports = { FOG_OPS, MAX_FOG_GROUPS, MAX_FOG_COORDS, readFog, cleanFogShape, addFogShape, fogSize };
