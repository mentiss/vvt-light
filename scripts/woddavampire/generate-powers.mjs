// scripts/woddavampire/generate-powers.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Génère les catalogues de pouvoirs de woddavampire depuis les annexes
// (spec_woddavampire.md §II.11 B-1). Les annexes restent la source : on les
// corrige, puis on relance :   node scripts/woddavampire/generate-powers.mjs
//
// Sorties (versionnées, à ne pas modifier à la main) :
//   src/client/src/systems/woddavampire/config/powers/disciplines.js
//   src/client/src/systems/woddavampire/config/powers/bloodMagic.js
// Le rapport (jets restés en texte, entrées non rattachées) s'affiche à la fin.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG = join(ROOT, 'src', 'client', 'src', 'systems', 'woddavampire');
const ANNEX = join(ROOT, 'documentations', 'annexe_woddavampire');

const { parseRollText, parseCost, powerKey } = await import(pathToUrl(join(SLUG, 'config', 'rules', 'powerRoll.js')));
const { DISCIPLINES } = await import(pathToUrl(join(SLUG, 'config', 'disciplines.js')));
const { PATHS, KRAINA, RITUALS } = await import(pathToUrl(join(SLUG, 'config', 'bloodMagic.js')));

function pathToUrl(p) { return new URL(`file:///${p.replace(/\\/g, '/')}`).href; }

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const stripVo = (s) => s.replace(/\s*\([^)]*\)\s*$/, '').trim();
const report = { textRolls: [], unmatched: [] };

// ── Lecture des annexes : titres, paragraphes et tableaux ────────────────────

/** Découpe un Markdown en blocs { h2, h3, bold, headers, rows } (un par tableau) */
const readTables = (file) => {
    const lines = readFileSync(join(ANNEX, file), 'utf8').split(/\r?\n/);
    const tables = [];
    let h2 = null; let h3 = null; let bold = null; let current = null;
    for (const line of lines) {
        if (line.startsWith('## ')) { h2 = line.slice(3).trim(); h3 = null; bold = null; current = null; continue; }
        if (line.startsWith('### ')) { h3 = line.slice(4).trim(); bold = null; current = null; continue; }
        const b = line.match(/^\*\*([^*]+)\*\*\s*[—-]\s*(.*)$/);
        if (b) { bold = { title: b[1].trim(), text: b[2].trim() }; current = null; continue; }
        if (line.startsWith('|')) {
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            if (!current) { current = { h2, h3, bold, headers: cells, rows: [] }; tables.push(current); continue; }
            if (cells.every(c => /^:?-+:?$/.test(c))) continue;
            current.rows.push(Object.fromEntries(current.headers.map((h, i) => [h, cells[i] ?? ''])));
            continue;
        }
        if (line.trim() === '') current = null;
    }
    return tables;
};

/** Ligne de tableau de pouvoir → objet pouvoir */
const toPower = (row, where, extra = {}) => {
    const label = row['Pouvoir'] ?? row['Rituel'];
    const rollText = row['Jet'] ?? null;
    const roll = rollText ? parseRollText(rollText) : null;
    if (rollText && !roll && !/^[–-](\s|$)/.test(rollText.trim())) report.textRolls.push(`${where} · ${label} : ${rollText}`);
    return {
        level: Number(row['Niv.']) || 0,
        key: powerKey(label),
        label: stripVo(label),
        vo: label.match(/\(([^)]+)\)\s*$/)?.[1] ?? null,
        costText: row['Coût'] && !/^[–-]$/.test(row['Coût']) ? row['Coût'] : null,
        cost: parseCost(row['Coût']),
        rollText: rollText && !/^[–-]$/.test(rollText.trim()) ? rollText : null,   // « – (3 tours) » garde sa précision
        roll,
        duration: row['Durée'] && !/^[–-]$/.test(row['Durée']) ? row['Durée'] : null,
        effect: row['Effet'] ?? '',
        ...extra,
    };
};

// ── Disciplines ──────────────────────────────────────────────────────────────

const DISCIPLINE_BY_LABEL = Object.fromEntries(Object.entries(DISCIPLINES).map(([k, d]) => [norm(d.label), k]));
// Branches : Quietus (caste assamite), Valeren (caste salubri)
const BRANCHES = { 'quietus cruscitus': 'cruscitus', 'quietus hematus': 'hematus',
    'voie du guerisseur': 'healers', 'voie du guerrier': 'warriors', 'voie du veilleur': 'watchers' };

const disciplinePowers = {};
for (const t of readTables('vda20-catalogue-disciplines.md')) {
    if (!t.headers.includes('Pouvoir') || !t.h2 || t.h2.startsWith('Disciplines combinées')) continue;   // combinées : lot 2c
    const head = t.h2.split(' (')[0].split(' – ')[0];
    const key = DISCIPLINE_BY_LABEL[norm(head)];
    if (!key) { report.unmatched.push(`Discipline « ${t.h2} »`); continue; }
    const branch = t.h3 ? BRANCHES[norm(t.h3.split(' (')[0])] ?? null : null;
    if (t.h3 && !branch) report.unmatched.push(`Branche « ${t.h3} » (${t.h2})`);
    for (const row of t.rows) (disciplinePowers[key] ??= []).push(toPower(row, head, branch ? { branch } : {}));
}

// ── Magie du sang ────────────────────────────────────────────────────────────

const PATH_BY_LABEL = {};
for (const [set, paths] of Object.entries(PATHS)) for (const [k, l] of Object.entries(paths)) PATH_BY_LABEL[norm(stripVo(l))] = { set, key: k };
const KRAINA_BY_LABEL = {};
for (const [disc, list] of Object.entries(KRAINA)) for (const [k, l] of Object.entries(list)) KRAINA_BY_LABEL[norm(stripVo(l))] = { disc, key: k };
const RITUAL_BY_LABEL = {};
for (const [set, list] of Object.entries(RITUALS)) for (const r of list) RITUAL_BY_LABEL[`${set}:${norm(r.label)}`] = r.key;

const RITUAL_SET = { 'Mysticisme de l\'Abîme (Lasombra)': 'abyss', 'Nécromancie': 'necromancy', 'Thaumaturgie (Tremere)': 'thaumaturgy' };

const pathPowers = {};      // clé de voie → { text?, levels?: [{ level, text }], powers?: [] }
const krainaPowers = {};    // clé de kraina → [pouvoirs avec attribute]
const ritualInfo = {};      // set → clé de rituel → { effect, costText, rollText, roll }

for (const t of readTables('vda20-catalogue-magie-sang.md')) {
    const set = RITUAL_SET[t.h2];
    // Rituels (Abîme : tableau complet ; Nécromancie, Thaumaturgie : Niv. | Rituel | Effet)
    if (t.headers.includes('Rituel') && set) {
        for (const row of t.rows) {
            const group = row['Rituel'].match(/\[([^\]]+)\]\s*$/)?.[1] ?? null;
            const full = row['Rituel'].replace(/\s*\[[^\]]+\]\s*$/, '');
            const label = stripVo(full);
            const p = toPower({ ...row, Rituel: full }, `Rituel ${set}`);
            // Rituel absent du catalogue de création (ex. Abîme 6 à 8) : ajouté, marqué extra
            const key = RITUAL_BY_LABEL[`${set}:${norm(label)}`] ?? p.key;
            (ritualInfo[set] ??= {})[key] = {
                level: p.level, label, group, extra: !RITUAL_BY_LABEL[`${set}:${norm(label)}`],
                effect: p.effect, costText: p.costText, rollText: p.rollText, roll: p.roll, duration: p.duration,
            };
        }
        continue;
    }
    // Kraina (Koldunisme, Ogham) : Niv. | Pouvoir | Attribut | Coût | Durée | Effet
    if (t.headers.includes('Attribut') && t.headers.includes('Pouvoir')) {
        const name = t.h3 ? stripVo(t.h3) : (t.h2.startsWith('Ogham') ? 'Ogham' : null);
        const k = name && KRAINA_BY_LABEL[norm(name)];
        if (!k) { report.unmatched.push(`Kraina « ${t.h3 ?? t.h2} »`); continue; }
        krainaPowers[k.key] = t.rows.map(row => toPower(row, name, { attributeText: row['Attribut'] }));
        continue;
    }
    // Voie majeure : tableau de pouvoirs sous un ### (Nécromancie, Thaumaturgie)
    if (t.headers.includes('Pouvoir') && t.h3) {
        const p = PATH_BY_LABEL[norm(stripVo(t.h3).replace(/,.*$/, ''))] ?? PATH_BY_LABEL[norm(t.h3.split(' (')[0])];
        if (!p) { report.unmatched.push(`Voie « ${t.h3} »`); continue; }
        (pathPowers[p.key] ??= {}).powers = t.rows.map(row => toPower(row, t.h3));
        continue;
    }
    // Voie mineure de Thaumaturgie : paragraphe en gras + table par niveau
    if (t.bold && t.headers[0] === 'Niv.') {
        const p = PATH_BY_LABEL[norm(stripVo(t.bold.title))];
        if (!p) { report.unmatched.push(`Voie mineure « ${t.bold.title} »`); continue; }
        pathPowers[p.key] = {
            text: t.bold.text,
            levels: t.rows.map(row => ({ level: Number(row['Niv.']), text: t.headers.slice(1).map(h => `${h} : ${row[h]}`).join(' · ') })),
        };
    }
}

// ── Écriture ─────────────────────────────────────────────────────────────────

const OUT = join(SLUG, 'config', 'powers');
mkdirSync(OUT, { recursive: true });
/** JSON lisible : une ligne par entrée (pouvoir, rituel), objets englobants indentés */
const dump = (value, depth = 0) => {
    const pad = '    '.repeat(depth + 1);
    const end = '    '.repeat(depth);
    if (Array.isArray(value) && !value.length) return '[]';
    if (Array.isArray(value)) return `[\n${value.map(v => pad + JSON.stringify(v)).join(',\n')},\n${end}]`;
    if (value && typeof value === 'object' && Object.values(value).some(v => v && typeof v === 'object')) {
        return `{\n${Object.entries(value).map(([k, v]) => `${pad}${JSON.stringify(k)}: ${dump(v, depth + 1)}`).join(',\n')},\n${end}}`;
    }
    return JSON.stringify(value);
};
const banner = (what) => `// ${what}\n// FICHIER GÉNÉRÉ par scripts/woddavampire/generate-powers.mjs depuis les annexes\n// (documentations/annexe_woddavampire/) : ne pas modifier à la main.\n\n`;
writeFileSync(join(OUT, 'disciplines.js'),
    banner('Pouvoirs des Disciplines (annexe vda20-catalogue-disciplines.md)')
    + `export const DISCIPLINE_POWERS = ${dump(disciplinePowers)};\n`);
writeFileSync(join(OUT, 'bloodMagic.js'),
    banner('Pouvoirs de la magie du sang (annexe vda20-catalogue-magie-sang.md)')
    + `export const PATH_POWERS = ${dump(pathPowers)};\n\n`
    + `export const KRAINA_POWERS = ${dump(krainaPowers)};\n\n`
    + `export const RITUAL_INFO = ${dump(ritualInfo)};\n`);

const count = Object.values(disciplinePowers).flat().length;
const structured = Object.values(disciplinePowers).flat().filter(p => p.roll).length;
console.log(`Disciplines : ${Object.keys(disciplinePowers).length}, pouvoirs : ${count}, jets structurés : ${structured}`);
console.log(`Voies : ${Object.keys(pathPowers).length}, kraina : ${Object.keys(krainaPowers).length}, rituels décrits : ${Object.values(ritualInfo).reduce((s, o) => s + Object.keys(o).length, 0)}`);
console.log(`\nJets restés en texte (${report.textRolls.length}) :\n  ${report.textRolls.join('\n  ')}`);
console.log(`\nNon rattachés (${report.unmatched.length}) :\n  ${report.unmatched.join('\n  ')}`);
