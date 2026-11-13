// features/journal/tools/journalMarkdown.js
// ─────────────────────────────────────────────────────────────────────────────
// Journal → Markdown (documentations/plateforme/spec_journal.md R-22, Q-4) : copier une
// note (chat IA, Obsidian), exporter une liste en un seul fichier .md. Fonctions pures,
// sans DOM (le HTML est celui de l'éditeur : balises connues, bien formé).
//   titres h2 / h3 → ## / ###, gras **, italique *, barré ~~, surligné ==…== (Obsidian),
//   souligné <u>…</u> (pas d'équivalent), listes (imbriquées), citation >, code `,
//   lien [texte](url), lien @ vers une entrée → [[Titre]] (Obsidian),
//   image en ligne (base64) → « [image] » (illisible en texte), image distante → ![](url).
// ─────────────────────────────────────────────────────────────────────────────

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };
const decode = (text) => text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENTITIES[e]);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1] ?? null;

const INLINE = {
    strong: '**', b: '**', em: '*', i: '*', s: '~~', strike: '~~', del: '~~', mark: '==', code: '`',
};

/**
 * HTML de l'éditeur → Markdown.
 * @param {string} html
 * @returns {string}
 */
export function htmlToMarkdown(html) {
    if (!html) return '';
    const tokens = String(html).split(/(<[^>]+>)/).filter(Boolean);
    const blocks = [{ type: 'root', out: '' }];   // pile des blocs ouverts (citation, élément de liste)
    const lists = [];                              // pile des listes : { ordered, index }
    let link = null;                               // lien en cours : { href, start }
    let skip = 0;                                  // contenu ignoré (lien @ déjà écrit)
    const top = () => blocks[blocks.length - 1];
    const write = (text) => { if (!skip) top().out += text; };
    const endBlock = () => { if (!top().out.endsWith('\n\n') && top().out.trim()) top().out = top().out.replace(/\n*$/, '\n\n'); };

    for (const token of tokens) {
        if (!token.startsWith('<')) { write(decode(token).replace(/\n/g, ' ')); continue; }
        const closing = token.startsWith('</');
        const name = token.match(/^<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase();
        if (!name) continue;

        if (skip) { if (name === 'span') skip += closing ? -1 : (token.endsWith('/>') ? 0 : 1); continue; }

        if (INLINE[name]) { write(INLINE[name]); continue; }
        switch (name) {
            case 'u': write(closing ? '</u>' : '<u>'); break;
            case 'br': write('  \n'); break;
            case 'p': case 'div':
                if (closing) { if (top().type === 'li') top().out += '\n'; else endBlock(); }
                break;
            case 'h1': case 'h2': case 'h3': case 'h4':
                if (closing) endBlock();
                else write(`${'#'.repeat(Math.min(Number(name[1]) || 2, 4))} `);
                break;
            case 'ul': case 'ol':
                if (closing) { lists.pop(); if (!lists.length) endBlock(); }
                else lists.push({ ordered: name === 'ol', index: Number(attr(token, 'start')) || 1 });
                break;
            case 'li': {
                if (!closing) { blocks.push({ type: 'li', out: '' }); break; }
                const item = blocks.pop();
                const list = lists[lists.length - 1] ?? { ordered: false, index: 1 };
                const marker = list.ordered ? `${list.index++}. ` : '- ';
                const indent = ' '.repeat(marker.length);
                // Lignes suivantes (paragraphe ou liste imbriquée) décalées sous le texte de l'élément
                const lines = item.out.replace(/\n+$/, '').split('\n').filter((l, i) => i === 0 || l.trim());
                top().out += lines.map((l, i) => (i === 0 ? marker + l : indent + l)).join('\n') + '\n';
                break;
            }
            case 'blockquote': {
                if (!closing) { blocks.push({ type: 'quote', out: '' }); break; }
                const quote = blocks.pop();
                const body = quote.out.trim().split('\n').map(l => (l ? `> ${l}` : '>')).join('\n');
                top().out += `${body}\n\n`;
                break;
            }
            case 'a':
                if (!closing) { link = attr(token, 'href'); write('['); }
                else { write(link ? `](${link})` : ']'); link = null; }
                break;
            // Image de l'éditeur (<figure> : image puis légende) : bloc à part, légende en italique dessous
            case 'figure':
                if (closing) endBlock();
                break;
            case 'figcaption':
                write(closing ? '*' : '\n*');
                break;
            case 'img': {
                const src = attr(token, 'src') ?? '';
                write(src.startsWith('data:') || !src ? '[image]' : `![](${src})`);
                break;
            }
            case 'span':
                // Lien @ vers une entrée du journal (lot 6) : [[Titre]], son texte affiché est ignoré
                if (!closing && attr(token, 'data-type') === 'mention') {
                    write(`[[${decode(attr(token, 'data-label') ?? '')}]]`);
                    if (!token.endsWith('/>')) skip = 1;
                }
                break;
            default: break;
        }
    }
    return blocks[0].out.replace(/[ \t]+\n/g, (m) => (m.startsWith('  ') ? '  \n' : '\n')).replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Une entrée → section Markdown : titre, ligne de contexte en italique, corps.
 * @param {object} entry  entrée complète (corps HTML)
 * @param {object} [opts]
 * @param {string} [opts.context] ligne de contexte (catégorie, table, auteur, date)
 * @param {number} [opts.level=1] niveau du titre
 */
export function entryToMarkdown(entry, { context = '', level = 1 } = {}) {
    const title = `${'#'.repeat(level)} ${entry.title || 'Sans titre'}`;
    const body = htmlToMarkdown(entry.body);
    return [title, context && `*${context}*`, body].filter(Boolean).join('\n\n') + '\n';
}

/** Plusieurs entrées → un seul fichier Markdown, une section par entrée. */
export const entriesToMarkdown = (entries, contextOf = () => '') =>
    entries.map(e => entryToMarkdown(e, { context: contextOf(e) })).join('\n');

/** Nom de fichier sûr (sans accents ni caractères interdits), ex. journal-prive-2026-11-13.md */
export const markdownFileName = (...parts) => `${parts.filter(Boolean).join('-')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;
