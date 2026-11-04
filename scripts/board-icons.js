// scripts/board-icons.js
// ─────────────────────────────────────────────────────────────────────────────
// Relevé unique de la bibliothèque d'icônes du tableau (documentations/spec_tableau.md §10.7).
//
//   node scripts/board-icons.js
//
// - Lit le dépôt game-icons/icons (licence CC BY 3.0), sans la collection « badges ».
// - Retire le fond noir de chaque SVG et passe le tracé en currentColor.
// - Lit les pages de tags de game-icons.net (une requête toutes les 400 ms).
// - Écrit src/client/public/board/icons/<auteur>/<nom>.svg et index.json :
//     { groups: [{ label, tags: [slug] }], tags: { slug: libellé }, icons: [{ id, tags: [slug] }] }
//
// ⚠ L'index est versionné et retouchable à la main (traduction, recatégorisation) :
// relancer ce script l'ÉCRASE. À ne relancer que pour repartir de zéro.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../src/client/public/board/icons');
const TREE_URL = 'https://api.github.com/repos/game-icons/icons/git/trees/master?recursive=1';
const RAW_URL = 'https://raw.githubusercontent.com/game-icons/icons/master/';
const SITE_URL = 'https://game-icons.net';
const EXCLUDED = ['badges/'];
const CONCURRENCY = 12;
const TAG_DELAY_MS = 400;
const USER_AGENT = 'vtt-board-icons (relevé unique, usage privé)';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const decode = (s) => s.replace(/&amp;/g, '&').trim();

async function get(url, as = 'text') {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return as === 'json' ? res.json() : res.text();
}

/** Fond noir retiré, tracé en couleur courante */
const cleanSvg = (svg) => svg
    .replace(/<path d="M0 0h512v512H0z"\s*\/>/, '')
    .replace(/fill="#fff"/g, 'fill="currentColor"');

/** Tags du site : groupes (premier lien = tag parent) et tags hors groupe */
function parseTags(html) {
    const link = /href="\/tags\/([^"]+)\.html"[^>]*>(?:<img[^>]*>)?([^<]+)<\/a>/g;
    const toTag = (m) => ({ slug: m[1], label: decode(m[2]).replace(/\s+—\s+\d+$/, '') });
    const parts = html.split('<li class="parent">');
    const groups = parts.slice(1).map(part => {
        const tags = [...part.split('</li>')[0].matchAll(link)].map(toTag);
        return { label: tags[0].label, tags };
    });
    const tail = parts.at(-1).split('</li>').slice(1).join('</li>');
    const loose = [...tail.matchAll(link)].map(toTag);
    // Chaque tag hors groupe devient son propre groupe
    return [...groups, ...loose.map(tag => ({ label: tag.label, tags: [tag] }))];
}

async function main() {
    console.log('Liste du dépôt…');
    const tree = await get(TREE_URL, 'json');
    const files = tree.tree.map(e => e.path).filter(p => p.endsWith('.svg') && !EXCLUDED.some(x => p.startsWith(x)));
    console.log(`${files.length} icônes`);

    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    let done = 0;
    const queue = [...files];
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length > 0) {
            const file = queue.shift();
            const svg = cleanSvg(await get(RAW_URL + file));
            const target = path.join(OUT_DIR, file);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, svg);
            if (++done % 500 === 0) console.log(`  ${done} / ${files.length}`);
        }
    }));

    console.log('Tags du site…');
    const groups = parseTags(await get(`${SITE_URL}/tags.html`));
    const tags = {};
    const iconTags = new Map();
    for (const group of groups) {
        for (const tag of group.tags) {
            if (tags[tag.slug]) continue;
            tags[tag.slug] = tag.label;
            const page = await get(`${SITE_URL}/tags/${tag.slug}.html`);
            for (const m of page.matchAll(/href="\/1x1\/([^"]+)\.html"/g)) {
                if (!iconTags.has(m[1])) iconTags.set(m[1], new Set());
                iconTags.get(m[1]).add(tag.slug);
            }
            await sleep(TAG_DELAY_MS);
        }
    }

    const icons = files.map(file => {
        const id = file.replace(/\.svg$/, '');
        return { id, tags: [...(iconTags.get(id) ?? [])].sort() };
    });
    const index = { groups: groups.map(g => ({ label: g.label, tags: g.tags.map(t => t.slug) })), tags, icons };
    fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));

    const untagged = icons.filter(i => i.tags.length === 0).length;
    console.log(`Terminé : ${icons.length} icônes, ${groups.length} catégories, ${untagged} sans tag (« Divers »).`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
