// Fusion des mises à jour en direct dans les fiches de la table côté MJ (spec_session_mj.md §3)
import { describe, it, expect } from 'vitest';
import { mergeCharacterUpdates } from '@/features/table/tools/tableCharacters.js';

const table = {
    1: { id: 1, prenom: 'Ingrid', pv: 10, notes: 'a' },
    2: { id: 2, prenom: 'Harald', pv: 8 },
};

describe('mergeCharacterUpdates', () => {
    it('une fiche complète remplace la fiche locale', () => {
        const full = { id: 1, prenom: 'Ingrid', pv: 4 };
        const next = mergeCharacterUpdates(table, { 1: { type: 'full', data: full } });
        expect(next[1]).toBe(full);
        expect(next[2]).toBe(table[2]);
    });

    it('une mise à jour partielle fusionne ses champs', () => {
        const next = mergeCharacterUpdates(table, { 2: { type: 'partial', data: { pv: 3 } } });
        expect(next[2]).toEqual({ id: 2, prenom: 'Harald', pv: 3 });
    });

    it('ignore un personnage qui n’est pas à la table', () => {
        const next = mergeCharacterUpdates(table, { 9: { type: 'full', data: { id: 9 } } });
        expect(next).toBe(table);
        expect(next[9]).toBeUndefined();
    });

    it('renvoie le même objet quand il n’y a rien à appliquer', () => {
        expect(mergeCharacterUpdates(table, {})).toBe(table);
        expect(mergeCharacterUpdates(table, null)).toBe(table);
    });

    it('ne modifie pas les fiches reçues', () => {
        mergeCharacterUpdates(table, { 1: { type: 'partial', data: { pv: 0 } } });
        expect(table[1].pv).toBe(10);
    });
});
