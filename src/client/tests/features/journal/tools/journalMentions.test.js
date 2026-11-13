// tests/features/journal/tools/journalMentions.test.js — liens « @ » (spec_journal.md R-18)
import { describe, it, expect } from 'vitest';
import { mentionCandidates, mentionExists, parseMentionId } from '@/features/journal/tools/journalMentions.js';

const privateEntries = [
    { id: 1, type: 'note', title: 'Hallvard le passeur' },
    { id: 2, type: 'gm_message', title: 'Une lettre' },
    { id: 3, type: 'note', title: 'Le sceau brisé' },
];
const tableEntries = [{ id: 5, title: 'Résumé du gué' }, { id: 6, title: 'Hallvard (table)' }];

describe('mentionCandidates', () => {
    it('depuis le journal privé : ses notes (pas les messages du MJ) et les entrées de la table', () => {
        const ids = mentionCandidates({ scope: 'private', privateEntries, tableEntries }).map(c => c.id);
        expect(ids).toEqual(['private:1', 'private:3', 'table:5', 'table:6']);
    });
    it('depuis le journal partagé : jamais une note privée', () => {
        const ids = mentionCandidates({ scope: 'table', privateEntries, tableEntries }).map(c => c.id);
        expect(ids).toEqual(['table:5', 'table:6']);
    });
    it('recherche sans accents ni casse, entrée en cours exclue', () => {
        const found = mentionCandidates({ scope: 'private', privateEntries, tableEntries, query: 'hallv', exclude: 'private:1' });
        expect(found).toEqual([{ id: 'table:6', label: 'Hallvard (table)', group: 'Partagé' }]);
        expect(mentionCandidates({ scope: 'private', privateEntries, tableEntries, query: 'resume' }).map(c => c.id)).toEqual(['table:5']);
    });
});

describe('mentionExists, parseMentionId', () => {
    it('cible encore présente', () => {
        expect(mentionExists('table:5', { scope: 'table', tableEntries })).toBe(true);
        expect(mentionExists('table:9', { scope: 'table', tableEntries })).toBe(false);
        expect(mentionExists('private:1', { scope: 'private', privateEntries })).toBe(true);
    });
    it('une note privée citée ailleurs que dans le journal privé ne s\'ouvre pas', () => {
        expect(mentionExists('private:1', { scope: 'table', privateEntries, tableEntries })).toBe(false);
    });
    it('identifiant mal formé', () => {
        expect(parseMentionId('table:5')).toEqual({ scope: 'table', id: 5 });
        expect(parseMentionId('autre:5')).toBeNull();
        expect(mentionExists(null, { scope: 'table', tableEntries })).toBe(false);
    });
});
