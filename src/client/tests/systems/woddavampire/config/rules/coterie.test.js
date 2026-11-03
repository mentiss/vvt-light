// tests/systems/woddavampire/config/rules/coterie.test.js
// Coterie : plafonds, mises, aperçus (spec_woddavampire.md §20, §II.17.3 ; livre p. 181).
import { describe, it, expect } from 'vitest';
import {
    poolCap, isOverAnchor, shownPools, stakeOf, isMember, isAtTable, memberStakes, contributionOptions, withdrawRefund,
} from '../../../../../src/systems/woddavampire/config/rules/coterie.js';

const pool = (backgroundKey, contributions = [], storyPoints = 0) => ({
    backgroundKey, storyPoints, details: '', contributions, total: storyPoints + contributions.reduce((s, c) => s + c.points, 0),
});
const coterie = {
    anchorKey: 'domain',
    backgrounds: [
        pool('domain', [{ characterId: 1, points: 2 }, { characterId: 2, points: 2 }]),
        pool('herd', [{ characterId: 2, points: 3 }], 1),
        pool('allies'),
    ],
};

describe('plafonds', () => {
    it('ancre : 10 ; autres : la valeur de l’ancre', () => {
        expect(poolCap(coterie, 'domain')).toBe(10);
        expect(poolCap(coterie, 'herd')).toBe(4);
    });
    it('pool au-dessus de l’ancre signalé', () => {
        const low = { ...coterie, backgrounds: [pool('domain', [{ characterId: 1, points: 2 }]), coterie.backgrounds[1]] };
        expect(isOverAnchor(low, low.backgrounds[1])).toBe(true);
        expect(isOverAnchor(coterie, coterie.backgrounds[1])).toBe(false);
    });
});

describe('lecture de la fiche', () => {
    it('pools affichés : l’ancre et ceux qui ont des points', () => {
        expect(shownPools(coterie).map(p => p.backgroundKey)).toEqual(['domain', 'herd']);
    });
    it('mises et membres', () => {
        expect(stakeOf(coterie, 2, 'herd')).toBe(3);
        expect(stakeOf(coterie, 1, 'herd')).toBe(0);
        expect(isMember(coterie, 1)).toBe(true);
        expect(isMember(coterie, 3)).toBe(false);
        expect(memberStakes(coterie, 2)).toBe('Domaine 2, Troupeau 3');
        expect(isAtTable({ table: [{ characterId: 4 }] }, 4)).toBe(true);
        expect(isAtTable({ table: [{ characterId: 4 }] }, 5)).toBe(false);
    });
});

describe('verser et retirer', () => {
    it('versable = points de la fiche, dans la place restante sous le plafond', () => {
        const character = { backgrounds: [{ backgroundKey: 'herd', rating: 3 }, { backgroundKey: 'domain', rating: 1 }, { backgroundKey: 'status', rating: 2 }] };
        const options = Object.fromEntries(contributionOptions(coterie, character).map(o => [o.key, o]));
        expect(options.herd).toMatchObject({ rating: 3, room: 0, max: 0 });
        expect(options.domain).toMatchObject({ rating: 1, room: 6, max: 1 });
        expect(options.status).toBeUndefined();
    });
    it('retirer rend un point de moins', () => {
        expect(withdrawRefund(2)).toBe(1);
        expect(withdrawRefund(1)).toBe(0);
    });
});
