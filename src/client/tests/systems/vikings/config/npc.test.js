// tests/systems/vikings/config/npc.test.js
// PNJ de Vikings (spec_pnj.md §10.2, spec_vikings.md §1.1 et §2) : réserve, seuil et explosion d'un jet,
// Blessure à maximum propre (règle de trois sur le barème humain), malus de succès.
import { describe, it, expect } from 'vitest';
import { blessureMalus, caracRoll, skillRoll, isOut, netSuccesses, npcDefaults } from '../../../../src/systems/vikings/config/npc.js';

const guard = { ...npcDefaults(), caracs: { force: 4, agilite: 3, perception: 2, intelligence: 1, charisme: 2, chance: 5 } };
const bear = { ...guard, blessureMax: 8 };

describe('Jet d\'un PNJ', () => {
    it('caractéristique : 3d10, seuil 7+, explosion de la caractéristique', () => {
        expect(caracRoll(guard, 'chance', null)).toEqual({ pool: 3, threshold: 7, explosion: 8, malus: 0, label: 'Chance' });
        expect(caracRoll(guard, 'perception', null).explosion).toBe(10);
    });
    it('compétence : seuil de la compétence, explosion de la meilleure caractéristique liée', () => {
        const r = skillRoll(guard, { name: 'Combat CàC (armé)', level: 3, specialization: 'hache' }, { blessure: 0, malus: 1 });
        expect(r).toEqual({ pool: 3, threshold: 5, explosion: 9, malus: 1, label: 'Combat CàC (armé) (hache)' });
    });
});

describe('Blessure', () => {
    it('humain (5 tokens) : barème du livre, un dé au moins', () => {
        expect([1, 2, 3, 4].map(t => blessureMalus(guard, t))).toEqual([0, 1, 2, 3]);
        expect(caracRoll(guard, 'force', { blessure: 4 }).pool).toBe(1);
    });
    it('ours (8 tokens) : règle de trois, KO au 8e seulement', () => {
        // 8 tokens ramenés sur 5 : 1-3 → 0-1 (sans malus), 4 → 2 (−1), 5-6 → 3 (−2), 7 → 4 (−3)
        expect([1, 2, 3, 4, 5, 6, 7].map(t => blessureMalus(bear, t))).toEqual([0, 0, 0, 1, 2, 2, 3]);
        expect(isOut(bear, { blessure: 7 })).toBe(false);
        expect(isOut(bear, { blessure: 8 })).toBe(true);
        expect(isOut(guard, { blessure: 5 })).toBe(true);
    });
});

describe('Malus de succès', () => {
    it('en bibliothèque, le malus de base de la fiche ; à la table, celui de la carte', () => {
        expect(caracRoll({ ...guard, malus: 2 }, 'force', null).malus).toBe(2);
        expect(caracRoll({ ...guard, malus: 2 }, 'force', { blessure: 0, malus: 0 }).malus).toBe(0);
    });
    it('retiré des succès, jamais négatif', () => {
        expect(netSuccesses(3, 1)).toBe(2);
        expect(netSuccesses(1, 2)).toBe(0);
    });
});
