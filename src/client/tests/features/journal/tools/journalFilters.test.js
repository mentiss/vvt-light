// tests/features/journal/tools/journalFilters.test.js — filtres du journal (spec_journal.md, partie II)
import { describe, it, expect } from 'vitest';
import { filterEntries, splitPinned, isUnread, hasAdvancedFilter } from '@/features/journal/tools/journalFilters.js';

const E = [
    { id: 1, type: 'note', category: 'indices', title: 'Le sceau brisé', bodyText: 'Cire rouge, un corbeau', sessionId: 4, createdAt: '2026-11-10 09:00:00', updatedAt: '2026-11-12 09:00:00', pinned: false },
    { id: 2, type: 'note', category: null, title: 'Dettes', bodyText: 'Promis à Sigrid', sessionId: null, createdAt: '2026-11-01 09:00:00', updatedAt: '2026-11-01 09:00:00', pinned: true },
    { id: 3, type: 'gm_message', title: 'Une lettre', bodyText: 'Ne fais pas confiance', sessionId: 4, createdAt: '2026-11-13 09:00:00', updatedAt: '2026-11-13 09:00:00', isRead: false },
    { id: 4, type: 'gm_sent', title: 'Une lettre', bodyText: '', sessionId: 4, createdAt: '2026-11-13 09:00:00', updatedAt: '2026-11-13 09:00:00' },
];
const ids = (list) => list.map(e => e.id);

describe('filterEntries', () => {
    it('catégorie : une note sans catégorie est une « Note »', () => {
        expect(ids(filterEntries(E, { kind: 'notes' }))).toEqual([2]);
        expect(ids(filterEntries(E, { kind: 'indices' }))).toEqual([1]);
    });
    it('messages reçus du MJ, envois du MJ', () => {
        expect(ids(filterEntries(E, { kind: 'messages' }))).toEqual([3]);
        expect(ids(filterEntries(E, { kind: 'sent' }))).toEqual([4]);
    });
    it('table active, hors table', () => {
        expect(ids(filterEntries(E, { table: 'active', activeTable: 4 }))).toEqual([1, 3, 4]);
        expect(ids(filterEntries(E, { table: 'active', activeTable: null }))).toEqual([]);
        expect(ids(filterEntries(E, { table: 'none' }))).toEqual([2]);
    });
    it('période de création (bornes incluses), une borne seule', () => {
        expect(ids(filterEntries(E, { from: '2026-11-10', to: '2026-11-12' }))).toEqual([1]);
        expect(ids(filterEntries(E, { from: '2026-11-13' }))).toEqual([3, 4]);
        expect(ids(filterEntries(E, { to: '2026-11-01' }))).toEqual([2]);
    });
    it('recherche dans le titre et le texte brut, sans casse', () => {
        expect(ids(filterEntries(E, { query: 'CORBEAU' }))).toEqual([1]);
        expect(ids(filterEntries(E, { query: 'lettre', kind: 'messages' }))).toEqual([3]);
    });
});

describe('splitPinned', () => {
    it('épinglées à part, chaque groupe du plus récent au plus ancien', () => {
        const { pinned, others } = splitPinned(E);
        expect(ids(pinned)).toEqual([2]);
        expect(ids(others)).toEqual([3, 4, 1]);
    });
});

describe('isUnread, hasAdvancedFilter', () => {
    it('non lu : message ou objet du MJ pas encore ouvert', () => {
        expect(E.map(isUnread)).toEqual([false, false, true, false]);
    });
    it('filtre avancé actif', () => {
        expect(hasAdvancedFilter({ table: 'all' })).toBe(false);
        expect(hasAdvancedFilter({ table: 'none' })).toBe(true);
        expect(hasAdvancedFilter({ from: '2026-11-01' })).toBe(true);
    });
});
