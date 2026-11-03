// src/client/src/tools/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Aide de jeu (documentations/spec_ui_reference.md) : fonctions pures de la
// brique ReferenceGuide.
//   - markdownToSections : fichiers Markdown du slug → sections et blocs ;
//   - isVisible : visibilité MJ / joueur d'une section ou d'un bloc ;
//   - matchingBlocks : blocs d'une section retenus par la recherche.
//
// Markdown reconnu : `# titre` (section), `##`… (intertitre), paragraphes,
// listes (`-`, `*`, `1.`), tableaux, citations (`>`, en texte), `---` ignoré.
// Visibilité : en-tête `visibility: gm | player` (ou `mj`) ; dans le texte,
// `<!-- gm -->` … `<!-- /gm -->` et `<!-- player -->` … `<!-- /player -->`.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeText, searchableText } from './catalog.js';

const SEARCH_FIELDS = ['text', 'items', 'columns', 'rows', 'keywords'];

/** 'gm' | 'player' | null, `mj` accepté pour `gm` */
const normalizeVisibility = (value) => {
    const v = String(value ?? '').trim().toLowerCase();
    if (v === 'gm' || v === 'mj') return 'gm';
    if (v === 'player') return 'player';
    return null;
};

/** En-tête « --- clé: valeur --- » en début de fichier → { meta, body } */
const splitFrontMatter = (text) => {
    const m = String(text ?? '').replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta: {}, body: String(text ?? '') };
    const meta = Object.fromEntries(m[1].split(/\r?\n/)
        .map(line => line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/))
        .filter(Boolean)
        .map(([, k, v]) => [k.toLowerCase(), v]));
    return { meta, body: String(text).slice(m[0].length) };
};

/** Cellules d'une ligne de tableau (`\|` garde une barre dans la cellule) */
const tableCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));

const isTableSeparator = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/;
const VISIBILITY_TAG = /^\s*<!--\s*(\/?)\s*(gm|mj|player)\s*-->\s*$/i;

/** Identifiant de section tiré du nom de fichier : « 02-combat.md » → « combat » */
const sectionId = (name) => String(name).replace(/^.*[\\/]/, '').replace(/\.md$/i, '').replace(/^\d+[-_.\s]*/, '') || String(name);

/**
 * Un fichier Markdown → une section { id, title, visibility, blocks }.
 * @param {string} name nom du fichier (sert à l'id)
 * @param {string} text contenu
 */
export const markdownToSection = (name, text) => {
    const { meta, body } = splitFrontMatter(text);
    const blocks = [];
    let title = null;
    let visibility = null;              // visibilité du passage en cours (commentaires)
    let paragraph = [];
    let list = null;
    let table = null;

    const push = (block) => blocks.push(visibility ? { ...block, visibility } : block);
    const flush = () => {
        if (paragraph.length) push({ type: 'text', text: paragraph.join(' ') });
        if (list) push({ type: 'list', items: list });
        if (table) push({ type: 'table', columns: table.columns, rows: table.rows });
        paragraph = []; list = null; table = null;
    };

    for (const raw of body.split(/\r?\n/)) {
        const line = raw.replace(/\s+$/, '');
        const tag = line.match(VISIBILITY_TAG);
        if (tag) { flush(); visibility = tag[1] ? null : normalizeVisibility(tag[2]); continue; }
        if (!line.trim()) { flush(); continue; }

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            flush();
            if (heading[1].length === 1 && title === null) title = heading[2].trim();
            else push({ type: 'heading', text: heading[2].trim() });
            continue;
        }
        if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flush(); continue; }

        if (line.trim().startsWith('|')) {
            if (isTableSeparator(line)) continue;
            if (!table) { flush(); table = { columns: tableCells(line), rows: [] }; } else table.rows.push(tableCells(line));
            continue;
        }
        const item = line.match(LIST_ITEM);
        if (item) {
            if (!list) flush();
            list = [...(list ?? []), item[1].trim()];
            continue;
        }
        if (list && /^\s{2,}\S/.test(raw)) { list[list.length - 1] += ` ${line.trim()}`; continue; }   // suite d'un élément
        if (list || table) flush();
        paragraph.push(line.trim().replace(/^>\s?/, ''));
    }
    flush();

    const section = { id: sectionId(name), title: title ?? sectionId(name), blocks };
    const v = normalizeVisibility(meta.visibility);
    return v ? { ...section, visibility: v } : section;
};

/**
 * Fichiers Markdown → sections, dans l'ordre des noms de fichier.
 * @param {{ name: string, text: string }[]} files
 */
export const markdownToSections = (files) => [...files]
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }))
    .map(f => markdownToSection(f.name, f.text));

/** Visible dans cette interface : sans visibilité, ou visibilité de l'interface (MJ ou joueur) */
export const isVisible = (item, isGM) => !item?.visibility || (item.visibility === 'gm') === !!isGM;

/**
 * Blocs d'une section retenus par la recherche (query déjà normalisée) ; un intertitre
 * suit le premier bloc retenu sous lui. Titre de section trouvé = section entière.
 */
export const matchingBlocks = (section, blocks, query) => {
    if (!query || normalizeText(section.title).includes(query)) return blocks;
    const kept = [];
    let heading = null;
    for (const block of blocks) {
        if (block.type === 'heading') { heading = block; continue; }
        if (!searchableText(block, SEARCH_FIELDS).includes(query)) continue;
        if (heading) { kept.push(heading); heading = null; }
        kept.push(block);
    }
    return kept;
};

/** Texte avec **gras** et *italique* → segments { text, bold?, italic? } */
export const inlineSegments = (text) => {
    const out = [];
    const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
    let last = 0;
    let m;
    const s = String(text ?? '');
    while ((m = re.exec(s))) {
        if (m.index > last) out.push({ text: s.slice(last, m.index) });
        out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italic: true });
        last = re.lastIndex;
    }
    if (last < s.length) out.push({ text: s.slice(last) });
    return out;
};
