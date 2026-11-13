// tests/ui/tools/markdownPaste.test.js — Markdown collé (spec_journal.md R-22)
import { describe, it, expect } from 'vitest';
import { looksLikeMarkdown } from '@/ui/tools/markdownPaste.js';

describe('looksLikeMarkdown', () => {
    it('reconnaît blocs et marques', () => {
        expect(looksLikeMarkdown('## Résumé\nLe gué')).toBe(true);
        expect(looksLikeMarkdown('- un\n- deux')).toBe(true);
        expect(looksLikeMarkdown('1. un')).toBe(true);
        expect(looksLikeMarkdown('> citation')).toBe(true);
        expect(looksLikeMarkdown('un **mot** gras')).toBe(true);
        expect(looksLikeMarkdown('voir [site](https://a.b)')).toBe(true);
    });
    it('laisse le texte ordinaire', () => {
        expect(looksLikeMarkdown('Le passeur cache quelque chose.')).toBe(false);
        expect(looksLikeMarkdown('Prix : 3 * 4 = 12')).toBe(false);
        expect(looksLikeMarkdown('#hashtag sans espace')).toBe(false);
        expect(looksLikeMarkdown('')).toBe(false);
    });
});
