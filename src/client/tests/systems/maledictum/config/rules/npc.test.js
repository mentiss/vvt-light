// tests/systems/maledictum/config/rules/npc.test.js
// PNJ à la table : mort subite selon le rôle (livre de base p.317), jet d'attaque d'un profil.
import { describe, it, expect } from 'vitest';
import { attackRoll, critMax, isOut } from '../../../../../src/systems/maledictum/config/rules/npc.js';

describe('Mort subite (p.317)', () => {
    it('Troupe : hors de combat à la première Blessure critique ; Élite à la deuxième', () => {
        expect(isOut({ role: 'troop' }, { crits: 0 })).toBe(false);
        expect(isOut({ role: 'troop' }, { crits: 1 })).toBe(true);
        expect(isOut({ role: 'elite' }, { crits: 1 })).toBe(false);
        expect(isOut({ role: 'elite' }, { crits: 2 })).toBe(true);
    });
    it('Meneur : total complet égal au bonus d\'Endurance', () => {
        expect(critMax({ role: 'leader', chars: { tgh: 50 } })).toBe(5);
        expect(isOut({ role: 'leader', chars: { tgh: 50 } }, { crits: 5 })).toBe(false);
    });
});

describe('Jet d\'attaque d\'un PNJ', () => {
    it('dégâts de base lus en tête de « 5 + DR », à distance si l\'attaque a une portée', () => {
        expect(attackRoll({ value: 25, damage: '5 + DR', range: 'medium', traits: 'Fiable' }))
            .toEqual({ target: 25, damage: 5, ranged: true, note: 'Fiable', theme: null });
    });
});
