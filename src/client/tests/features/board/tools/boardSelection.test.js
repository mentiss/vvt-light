// tests/tools/boardSelection.test.js
// Sélection du MJ sur le tableau (documentations/spec_tableau.md §14.1, §14.2)
import { describe, it, expect } from 'vitest';
import { expandGroups, groupMembers, selectionInfo, toggleInSelection } from '@/features/board/tools/boardSelection.js';

const items = [
    { id: 1, kind: 'image', groupId: null, data: { imageId: 4 } },
    { id: 2, kind: 'token', groupId: 7, data: { label: 'Garde', color: '#000' } },
    { id: 3, kind: 'halo', groupId: 7, data: { color: '#e2b93b' } },
    { id: 4, kind: 'token', groupId: null, data: { characterId: 9 } },
];

describe('groupes dans la sélection (Q-56)', () => {
    it('un morceau entraîne tout son groupe', () => {
        expect(groupMembers(items, 3)).toEqual([2, 3]);
        expect(groupMembers(items, 1)).toEqual([1]);
        expect(expandGroups(items, [3, 1])).toEqual([1, 2, 3]);
    });

    it('Maj + clic ajoute ou retire tout le groupe', () => {
        expect(toggleInSelection(items, [1], 2)).toEqual([1, 2, 3]);
        expect(toggleInSelection(items, [1, 2, 3], 3)).toEqual([1]);
    });
});

describe('ce que permet une sélection (§14.1, PC-8)', () => {
    it('un seul objet, ou plusieurs', () => {
        expect(selectionInfo([items[0]]).single).toBe(items[0]);
        expect(selectionInfo([items[0], items[1]]).single).toBeNull();
    });

    it('grouper : au moins deux objets, pas déjà un seul et même groupe', () => {
        expect(selectionInfo([items[1], items[2]]).groupable).toBe(false);
        expect(selectionInfo([items[1], items[2]]).ungroupable).toBe(true);
        expect(selectionInfo([items[0], items[1], items[2]]).groupable).toBe(true);
        expect(selectionInfo([items[0]]).groupable).toBe(false);
    });

    it('couleur et duplication selon les objets (PC-6, PB-4)', () => {
        expect(selectionInfo([items[0]]).colorable).toBe(false);
        expect(selectionInfo([items[3]]).colorable).toBe(false);
        expect(selectionInfo([items[3]]).duplicable).toBe(false);
        expect(selectionInfo([items[2], items[3]]).colorable).toBe(true);
    });
});
