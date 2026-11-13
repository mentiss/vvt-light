// scripts/genmap-bench.js
// ─────────────────────────────────────────────────────────────────────────────
// Banc d'essai du générateur de plans (spec_genmap.md §36.10, M1). Lancé à la main, hors
// `npm test` : `npm run genmap:bench` depuis src/client.
//
// Pour chaque preset : ses réglages, puis une variante à la fois (densité, schéma de
// circulation, largeur maximale du couloir, dimensions × 0,8 et × 1,2), sur des graines fixes.
// Mesures : taux d'aboutissement, tentatives, part du couloir, plus grand couloir d'un seul
// tenant, pièces arrivées au plafond de leur taille.
// Empreinte : condensé de tous les résultats (plans et échecs). Même empreinte = mêmes plans :
// c'est la preuve qu'un remaniement du moteur ne change rien, et l'alarme d'une régression.
//
// Options : --seeds=40 (graines par configuration), --preset=manor (un seul preset),
// --json=rapport.json (rapport complet pour comparer plus tard).
// ─────────────────────────────────────────────────────────────────────────────

import { register } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Le moteur importe ses données JSON sans attribut d'import (syntaxe Vite) : Node le refuse.
// Ce crochet de chargement les sert comme modules, sans rien changer au moteur.
register(`data:text/javascript,${encodeURIComponent(`
    import { readFile } from 'node:fs/promises';
    export async function load(url, context, next) {
        if (!url.endsWith('.json')) return next(url, context);
        const text = await readFile(new URL(url), 'utf8');
        return { format: 'module', source: 'export default ' + text, shortCircuit: true };
    }
`)}`);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/features/genmap');
const readJson = (file) => JSON.parse(readFileSync(path.join(ROOT, file), 'utf8'));

const { generate, resolvePreset, SHAPES } = await import('../src/features/genmap/tools/generate.js');
const roomTypes = readJson('data/roomTypes.json');
const engine    = readJson('data/engine.json');
const PRESET_IDS = ['inn', 'manor', 'temple', 'warehouse', 'house', 'tower', 'guardpost', 'hovel', 'policestation', 'magetower'];

// ── Options ──────────────────────────────────────────────────────────────────

const option = (name) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const SEED_COUNT = Number(option('seeds') ?? 40);
const ONLY       = option('preset');
const JSON_OUT   = option('json');
const SEEDS      = Array.from({ length: SEED_COUNT }, (_, i) => 1000 + i * 37);

// ── Configurations ───────────────────────────────────────────────────────────

// Une variante à la fois autour des réglages du preset, comme dans la page : schémas déclarés par
// le preset pour tout le bâtiment, ou aucun (§37, GR-3) ; bâtiment agrandi, qui fait apparaître les
// grands restes (le bâtiment réduit sort de l'objectif : le programme n'y tient plus, GR-4)
const variantsOf = (program, params) => {
    const width = params.corridorMaxWidth ?? engine.corridorMaxWidth;
    const scale = (k) => ({ width: Math.round(params.width * k), length: Math.round(params.length * k) });
    return [
        { label: 'preset', change: {} },
        ...['dense', 'balanced', 'spacious'].filter(d => d !== params.density)
            .map(density => ({ label: `densité ${density}`, change: { density } })),
        ...['free', ...(program.layout?.schemes ?? []).filter(s => s !== 'hub')]
            .map(scheme => ({ label: `schéma ${scheme}`, change: { scheme } })),
        ...[1, 2, 3].filter(w => w !== width)
            .map(w => ({ label: `couloir ${w}`, change: { corridorMaxWidth: w } })),
        { label: 'taille ×1,2', change: scale(1.2) },
        // Gabarits (§40) : l'enveloppe agrandie de 25 % pour compenser les cases retirées (sauf le
        // gabarit du preset, essayé à ses dimensions)
        ...SHAPES.filter(s => params.outline !== 'shape' || params.shape !== s.id)
            .map(s => ({ label: `gabarit ${s.id}`, change: { outline: 'shape', shape: s.id, ...(params.outline === 'shape' ? {} : scale(1.25)) } })),
        ...(params.outline === 'shape' ? [{ label: 'rectangle', change: { outline: 'rect' } }] : []),
    ];
};

// ── Mesures d'un plan ────────────────────────────────────────────────────────

const sizeMaxOf = new Map(roomTypes.map(t => [t.id, t.sizeMax]));

const STEPS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
const key = (x, y) => `${x},${y}`;
const around = (k) => { const [x, y] = k.split(',').map(Number); return Object.values(STEPS).map(([dx, dy]) => key(x + dx, y + dy)); };

// Plus grande zone d'un seul tenant (4-voisinage) d'un ensemble de cases
const largestRegion = (keys) => {
    const left = new Set(keys);
    let best = 0;
    for (const start of [...left]) {
        if (!left.delete(start)) continue;
        const stack = [start];
        let size = 0;
        while (stack.length) {
            size += 1;
            for (const k of around(stack.pop())) if (left.delete(k)) stack.push(k);
        }
        best = Math.max(best, size);
    }
    return best;
};

// Couloir en trop d'un étage (« grand reste », §29) : cases de couloir qui ne sont sur aucun plus
// court chemin entre la racine (porte d'entrée au RDC, escalier d'arrivée ailleurs) et une porte
// ou un escalier qui donne sur le réseau, élargi à la largeur du couloir. Le réseau = couloir +
// pièces ouvertes. Un dégagement isolé, atteint par une pièce seulement, est tout entier en trop.
const excessCells = (floor, width) => {
    const corridor = new Set(floor.corridor.map(([x, y]) => key(x, y)));
    const owner = new Map();
    floor.rooms.forEach(r => r.cells.forEach(([x, y]) => owner.set(key(x, y), r)));
    const network = new Set([...corridor, ...floor.rooms.filter(r => r.circulation).flatMap(r => r.cells.map(([x, y]) => key(x, y)))]);
    const linkKeys = (l) => Array.from({ length: l.w * l.h }, (_, i) => key(l.x + (i % l.w), l.y + Math.floor(i / l.w)));
    const nextTo = (cells) => [...new Set(cells.flatMap(around))].filter(k => network.has(k));
    const arrival = floor.level === 0 ? null : floor.links.find(l => l.targets.includes(floor.level > 0 ? floor.level - 1 : 0));
    const roots = floor.level === 0
        ? floor.doors.filter(d => d.between.includes('outside')).map(d => key(d.x, d.y)).filter(k => network.has(k))
        : arrival ? nextTo(linkKeys(arrival)) : [];
    const targets = [
        ...floor.doors.flatMap(d => { const [dx, dy] = STEPS[d.side]; return [key(d.x, d.y), key(d.x + dx, d.y + dy)]; }),
        ...floor.links.flatMap(l => nextTo(linkKeys(l))),
    ].filter(k => network.has(k));
    // Plus courts chemins dans le réseau depuis la racine
    const parent = new Map(roots.map(k => [k, null]));
    const queue = [...roots];
    while (queue.length) {
        const k = queue.shift();
        for (const n of around(k)) if (network.has(n) && !parent.has(n)) { parent.set(n, k); queue.push(n); }
    }
    let useful = new Set();
    for (let k of targets) while (k && parent.has(k) && !useful.has(k)) { useful.add(k); k = parent.get(k); }
    for (let i = 1; i < width; i++) useful = new Set([...useful, ...[...useful].flatMap(around).filter(k => corridor.has(k))]);
    return [...corridor].filter(k => !useful.has(k));
};
const excessCorridor = (floor, width) => largestRegion(excessCells(floor, width));

const measure = (plan, width) => {
    const floors = plan.floors;
    const inside = floors.reduce((n, f) => n + f.width * f.length - f.voids.length, 0);
    const corridor = floors.reduce((n, f) => n + f.corridor.length, 0);
    const rooms = floors.flatMap(f => f.rooms);
    return {
        attempts:   plan.attempt,
        corridor:   corridor / inside,
        largest:    Math.max(0, ...floors.map(f => excessCorridor(f, width))),
        atMax:      rooms.filter(r => r.cells.length >= (sizeMaxOf.get(r.typeId) ?? Infinity)).length / Math.max(1, rooms.length),
    };
};

// Échecs structurels : aucune graine ne peut réussir (programme trop chargé, bâtiment trop grand)
const STRUCTURAL = new Set(['overload', 'oversize']);

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const hash = (text) => createHash('sha1').update(text).digest('hex');

// ── Plan en texte (--show=preset:graine[:variante]) ───────────────────────────
// Une lettre par pièce, « . » couloir utile, « # » couloir en trop, « = » escalier, blanc dehors.

const showPlan = (spec) => {
    const [id, seed, variant = 'preset'] = spec.split(':');
    const { program, params } = resolvePreset(readJson(`data/presets/${id}.json`), roomTypes);
    const { change } = variantsOf(program, params).find(v => v.label === variant) ?? { change: {} };
    const run = { scheme: 'preset', ...params, ...change, seed: Number(seed) };
    const result = generate(program, run);
    if (!result.ok) { console.log(`Échec : ${result.reason} (${Object.entries(result.steps ?? {}).map(([s, n]) => `${s} ×${n}`).join(', ')})`); return; }
    const width = run.corridorMaxWidth ?? engine.corridorMaxWidth;
    for (const floor of result.plan.floors) {
        const grid = Array.from({ length: floor.length }, () => Array(floor.width).fill(' '));
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const legend = floor.rooms.map((r, i) => { r.cells.forEach(([x, y]) => { grid[y][x] = letters[i]; }); return `${letters[i]} ${r.label} (${r.cells.length})`; });
        floor.corridor.forEach(([x, y]) => { grid[y][x] = '.'; });
        floor.links.forEach(l => { for (let i = 0; i < l.w * l.h; i++) grid[l.y + Math.floor(i / l.w)][l.x + (i % l.w)] = '='; });
        const excess = excessCells(floor, width);
        excess.forEach(k => { const [x, y] = k.split(',').map(Number); grid[y][x] = '#'; });
        console.log(`\nNiveau ${floor.level} — couloir en trop : ${largestRegion(excess)} cases d'un seul tenant`);
        console.log(grid.map(row => `  ${row.join(' ')}`).join('\n'));
        console.log(`  ${legend.join(' · ')}`);
    }
};

const SHOW = option('show');
if (SHOW) { showPlan(SHOW); process.exit(0); }

// ── Banc ─────────────────────────────────────────────────────────────────────

const started = Date.now();
const rows = [];
for (const id of PRESET_IDS.filter(p => !ONLY || p === ONLY)) {
    const { program, params } = resolvePreset(readJson(`data/presets/${id}.json`), roomTypes);
    for (const { label, change } of variantsOf(program, params)) {
        const run = { scheme: 'preset', ...params, ...change };
        const results = SEEDS.map(seed => generate(program, { ...run, seed }));
        const plans = results.filter(r => r.ok).map(r => ({ seed: r.plan.seed, ...measure(r.plan, run.corridorMaxWidth ?? engine.corridorMaxWidth) }));
        // Graine du plan au plus grand couloir en trop, à regarder avec --show
        const worst = plans.reduce((a, b) => (!a || b.largest > a.largest ? b : a), null);
        const failures = results.filter(r => !r.ok).reduce((acc, r) => ({ ...acc, [r.reason]: (acc[r.reason] ?? 0) + 1 }), {});
        // Étapes en échec des tentatives (diagnostic du moteur), pour le rapport JSON
        const steps = {};
        results.filter(r => !r.ok).forEach(r => Object.entries(r.steps ?? {}).forEach(([s, n]) => { steps[s] = (steps[s] ?? 0) + n; }));
        rows.push({
            preset: id, variant: label, seeds: SEEDS.length, ok: plans.length, failures, steps,
            attempts: mean(plans.map(p => p.attempts)),
            corridor: mean(plans.map(p => p.corridor)),
            largestMean: mean(plans.map(p => p.largest)),
            largestMax: Math.max(0, ...plans.map(p => p.largest)),
            worstSeed: worst?.seed ?? null,
            atMax: mean(plans.map(p => p.atMax)),
            fingerprint: hash(results.map(r => JSON.stringify(r.ok ? r.plan : { reason: r.reason })).join('\n')),
        });
    }
}

// ── Sortie ───────────────────────────────────────────────────────────────────

const pct = (v) => `${Math.round(v * 100)} %`;
const table = rows.map(r => ({
    preset:      r.preset,
    variante:    r.variant,
    aboutis:     `${r.ok}/${r.seeds}`,
    échecs:      Object.entries(r.failures).map(([k, n]) => `${STRUCTURAL.has(k) ? '*' : ''}${k} ${n}`).join(', '),
    tentatives:  r.attempts.toFixed(1),
    couloir:     pct(r.corridor),
    'trop moy':  r.largestMean.toFixed(1),
    'trop max':  r.largestMax,
    plafond:     pct(r.atMax),
    empreinte:   r.fingerprint.slice(0, 8),
}));
console.table(table);

const total = hash(rows.map(r => r.fingerprint).join(''));
const ok = rows.reduce((n, r) => n + r.ok, 0);
const all = rows.reduce((n, r) => n + r.seeds, 0);
console.log(`\n${rows.length} configurations, ${ok}/${all} plans aboutis, ${((Date.now() - started) / 1000).toFixed(1)} s`);
console.log(`Empreinte totale : ${total}`);
console.log('« trop » = plus grande zone de couloir en trop d\'un seul tenant (cases hors des chemins utiles, §29) ; « plafond » = part des pièces à leur taille maximale ; * = échec structurel (aucune graine ne peut réussir).');

if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ date: new Date().toISOString(), seeds: SEED_COUNT, total, rows }, null, 2));
    console.log(`Rapport : ${JSON_OUT}`);
}
