// tests/systems/woddavampire/config/rules/npc.test.js
// PNJ du Conteur (spec_pnj.md §10.3) : santé à niveaux propres (animaux, livre p.396-399),
// réserve du jet composé, hors de combat selon la nature.
import { describe, it, expect } from 'vitest';
import { cycleNpcHealth, npcPool, npcWound, isOut, initialNpcState, parseHealth } from '../../../../../src/systems/woddavampire/config/rules/npc.js';

// Loup (aide de jeu, chapitre Conteur) : santé OK, −1, −1, −3, −5, Neutralisé
const wolf = {
    nature: 'animal', attributes: { strength: 3, dexterity: 3, stamina: 3, perception: 3, intelligence: 2, wits: 3 },
    abilities: [{ key: 'brawl', rating: 3 }, { key: 'alertness', rating: 2 }],
    health: [{ label: 'OK', penalty: 0 }, { label: '−1', penalty: -1 }, { label: '−1', penalty: -1 }, { label: '−3', penalty: -3 },
             { label: '−5', penalty: -5 }, { label: 'Neutralisé', penalty: null }],
};

describe('Santé d\'un PNJ', () => {
    it('niveaux propres : malus du pire niveau atteint, Neutralisé hors de combat', () => {
        expect(npcWound(wolf, { lethal: 4 }).penalty).toBe(-3);
        expect(isOut(wolf, { lethal: 5 })).toBe(false);
        expect(isOut(wolf, { lethal: 5, bashing: 1 })).toBe(true);
    });
    it('niveaux saisis comme dans le livre', () => {
        expect(parseHealth('OK, −1, −5, Neutralisé')).toEqual([
            { label: 'OK', penalty: 0 }, { label: '−1', penalty: -1 }, { label: '−5', penalty: -5 }, { label: 'Neutralisé', penalty: null }]);
        expect(parseHealth('  ')).toBeNull();
    });
    it('sans niveaux sur la fiche : les 7 du livre', () => {
        expect(npcWound({}, { bashing: 2 }).penalty).toBe(-1);
    });
    it('case cliquée : contondant, puis létal, puis aggravé', () => {
        expect(cycleNpcHealth(wolf, { bashing: 1 }, 0)).toEqual({ bashing: 0, lethal: 1, aggravated: 0 });
    });
});

describe('Jet composé', () => {
    it('Attribut + Capacité, malus de blessure retranché', () => {
        expect(npcPool(wolf, null, { attribute: 'strength', ability: 'brawl' })).toBe(6);
        expect(npcPool(wolf, { lethal: 2 }, { attribute: 'strength', ability: 'brawl' })).toBe(5);
    });
});

describe('Nuées et esprits', () => {
    it('nuée hors de combat quand sa santé est épuisée ; esprit à 0 Essence', () => {
        expect(isOut({ nature: 'swarm', healthPoints: 7 }, { damage: 7 })).toBe(true);
        expect(initialNpcState({ nature: 'spirit', essence: 6 })).toEqual({ essence: 6 });
        expect(isOut({ nature: 'spirit' }, { essence: 0 })).toBe(true);
    });
});
