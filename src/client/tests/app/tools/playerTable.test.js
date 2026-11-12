// tests/app/tools/playerTable.test.js
// Table du joueur (spec_tables.md §3.2), dont le cas du 2026-11-11 en prod : tables
// Fabula 3 et 4 actives, personnage membre de la 3 seulement.
import { describe, it, expect } from 'vitest';
import { pickPlayerTable } from '@/app/tools/playerTable.js';

describe('pickPlayerTable', () => {
    it('une autre table du slug active en premier : le joueur prend la sienne', () => {
        expect(pickPlayerTable({ activeIds: [4, 3], memberIds: [3] }))
            .toEqual({ tableId: 3, candidates: [3], needsChoice: false });
    });

    it('aucune de ses tables active : pas de table', () => {
        expect(pickPlayerTable({ activeIds: [4], memberIds: [3], current: 3 }))
            .toEqual({ tableId: null, candidates: [], needsChoice: false });
    });

    it('aucune table : pas de table', () => {
        expect(pickPlayerTable({ activeIds: [], memberIds: [] }))
            .toEqual({ tableId: null, candidates: [], needsChoice: false });
    });

    it('plusieurs de ses tables actives : il reste à la sienne', () => {
        expect(pickPlayerTable({ activeIds: [2, 3], memberIds: [3, 2], current: 2, remembered: 3 }))
            .toEqual({ tableId: 2, candidates: [3, 2], needsChoice: false });
    });

    it('plusieurs de ses tables actives, aucune en cours : son choix mémorisé', () => {
        expect(pickPlayerTable({ activeIds: [2, 3], memberIds: [3, 2], remembered: 2 }))
            .toEqual({ tableId: 2, candidates: [3, 2], needsChoice: false });
    });

    it('plusieurs de ses tables actives, choix mémorisé inactif : on lui demande', () => {
        expect(pickPlayerTable({ activeIds: [2, 3], memberIds: [3, 2, 5], current: 5, remembered: 5 }))
            .toEqual({ tableId: null, candidates: [3, 2], needsChoice: true });
    });
});
