// tests/features/journal/tools/journalMarkdown.test.js — journal → Markdown (spec_journal.md R-22, Q-4)
import { describe, it, expect } from 'vitest';
import { htmlToMarkdown, entryToMarkdown, entriesToMarkdown, markdownFileName } from '@/features/journal/tools/journalMarkdown.js';

describe('htmlToMarkdown', () => {
    it('titres, paragraphes, marques', () => {
        expect(htmlToMarkdown('<h2>Ce qui s\'est passé</h2><p>On a <strong>passé</strong> le <em>gué</em> de <s>jour</s> nuit.</p><p>Fin.</p>'))
            .toBe('## Ce qui s\'est passé\n\nOn a **passé** le *gué* de ~~jour~~ nuit.\n\nFin.');
    });
    it('surligné (Obsidian), souligné, code, lien, entités', () => {
        expect(htmlToMarkdown('<p><mark>indice</mark> <u>clé</u> <code>x</code> <a href="https://a.b">site</a> &lt;3 &amp; co</p>'))
            .toBe('==indice== <u>clé</u> `x` [site](https://a.b) <3 & co');
    });
    it('listes à puces et numérotées, éléments en paragraphe (TipTap), liste imbriquée', () => {
        expect(htmlToMarkdown('<ul><li><p>Sceau</p></li><li><p>Dette</p><ul><li><p>à Ulf</p></li></ul></li></ul><ol><li><p>un</p></li><li><p>deux</p></li></ol>'))
            .toBe('- Sceau\n- Dette\n  - à Ulf\n\n1. un\n2. deux');
    });
    it('citation sur plusieurs paragraphes', () => {
        expect(htmlToMarkdown('<blockquote><p>Ne fais pas confiance</p><p>au passeur</p></blockquote><p>Signé</p>'))
            .toBe('> Ne fais pas confiance\n>\n> au passeur\n\nSigné');
    });
    it('images : en ligne remplacée, distante gardée ; saut de ligne', () => {
        expect(htmlToMarkdown('<p>a<br>b</p><img src="data:image/png;base64,AAAA"><img src="https://x.y/i.png">'))
            .toBe('a  \nb\n\n[image]![](https://x.y/i.png)');
    });
    it('image de l\'éditeur avec légende : bloc à part, légende en italique', () => {
        expect(htmlToMarkdown('<p>Avant</p><figure data-type="image" data-align="wrap-left" class="rich-editor-figure"><img src="https://x.y/carte.png"><figcaption>Carte du gué</figcaption></figure><p>Après</p>'))
            .toBe('Avant\n\n![](https://x.y/carte.png)\n*Carte du gué*\n\nAprès');
    });
    it('lien @ vers une entrée → [[Titre]], son texte affiché ignoré', () => {
        expect(htmlToMarkdown('<p>Voir <span data-type="mention" data-id="table:2" data-label="Hallvard le passeur">@Hallvard le passeur</span> au gué.</p>'))
            .toBe('Voir [[Hallvard le passeur]] au gué.');
    });
    it('vide', () => {
        expect(htmlToMarkdown('')).toBe('');
        expect(htmlToMarkdown(null)).toBe('');
    });
});

describe('entryToMarkdown, entriesToMarkdown', () => {
    it('une section par entrée : titre, contexte en italique, corps', () => {
        const md = entriesToMarkdown([
            { title: 'Gué', body: '<p>Brume</p>' },
            { title: '', body: '' },
        ], (e) => (e.title ? 'Lieux · 13/11/2026' : ''));
        expect(md).toBe('# Gué\n\n*Lieux · 13/11/2026*\n\nBrume\n\n# Sans titre\n');
    });
    it('niveau de titre', () => {
        expect(entryToMarkdown({ title: 'X', body: '<p>y</p>' }, { level: 2 })).toBe('## X\n\ny\n');
    });
});

describe('markdownFileName', () => {
    it('sans accents ni caractères interdits', () => {
        expect(markdownFileName('journal', 'Privé', 'Delta Green', '2026-11-13')).toBe('journal-prive-delta-green-2026-11-13.md');
    });
});
