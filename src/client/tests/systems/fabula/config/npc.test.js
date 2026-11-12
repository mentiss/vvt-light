// tests/systems/fabula/config/npc.test.js
// PNJ de Fabula Ultima (spec_pnj.md §10.5, §10.7 ; livre p.295) : tours selon le rang, Crise,
// états qui baissent le dé d'un attribut, Points Ultima d'un Méchant.
import { describe, it, expect } from 'vitest';
import { crisisOf, initialNpcState, inCrisis, isOut, npcDie, spellRoll, turnsPerRound } from '../../../../src/systems/fabula/config/npc.js';

// Sorts offensifs (spec_pnj.md §12) : textes repris du bestiaire versé
describe('Sort offensif', () => {
    it('lit le test de magie et les dégâts dans le texte du bestiaire', () => {
        expect(spellRoll({ offensive: true, text: 'Test de magie 【INT + VOL】+3. La cible subit【VH + 20】dégâts de ténèbres et Angela récupère…' }))
            .toEqual({ attrs: ['int', 'vol'], bonus: 3, damage: 20, type: 'tenebres' });
        expect(spellRoll({ offensive: true, text: 'Test de magie 【PUI + VOL】+2. La cible subit【VH + 30】dégâts de glace.' }))
            .toEqual({ attrs: ['pui', 'vol'], bonus: 2, damage: 30, type: 'glace' });
    });

    it('sans dégâts dans le texte : test seul', () => {
        expect(spellRoll({ offensive: true, text: 'Test de magie 【INT + VOL】. La cible subit l’état étourdi.' }))
            .toEqual({ attrs: ['int', 'vol'], bonus: 0, damage: null, type: null });
    });

    it('les champs saisis priment sur le texte', () => {
        expect(spellRoll({ offensive: true, attrs: ['vol', 'vol'], magic: 1, damage: 15, type: 'feu', text: 'Test de magie 【INT + VOL】+3.' }))
            .toEqual({ attrs: ['vol', 'vol'], bonus: 1, damage: 15, type: 'feu' });
    });

    it('pas de jet pour un sort défensif ou sans test de magie', () => {
        expect(spellRoll({ offensive: false, text: 'Test de magie 【INT + VOL】+3.' })).toBeNull();
        expect(spellRoll({ offensive: true, text: 'Le hurleur blanc regagne 30 Points de Vie.' })).toBeNull();
    });
});

const wolf = { rank: 'soldat', attributes: { dex: 10, int: 6, pui: 8, vol: 6 }, hp: 45, crisis: 22, mp: 40 };

describe('Rang', () => {
    it('Soldat 1 tour, Élite 2 tours, Champion (N) N tours', () => {
        expect(turnsPerRound(wolf)).toBe(1);
        expect(turnsPerRound({ rank: 'elite' })).toBe(2);
        expect(turnsPerRound({ rank: 'champion', champion: 3 })).toBe(3);
    });
});

describe('À la table', () => {
    it('Crise au seuil imprimé (sinon la moitié des PV), vaincu à 0 PV', () => {
        expect(crisisOf(wolf)).toBe(22);
        expect(crisisOf({ hp: 45 })).toBe(22);
        expect(inCrisis(wolf, { hp: 22 })).toBe(true);
        expect(inCrisis(wolf, { hp: 23 })).toBe(false);
        expect(isOut({ hp: 0 })).toBe(true);
        expect(crisisOf({ hp: 100, crisis: null })).toBe(50);
    });
    it('états : un cran de moins par état lié, cumulés, d6 au minimum', () => {
        expect(npcDie(wolf, { statuses: ['ralenti'] }, 'dex')).toBe(8);
        expect(npcDie(wolf, { statuses: ['ralenti', 'enrage'] }, 'dex')).toBe(6);
        expect(npcDie(wolf, { statuses: ['etourdi'] }, 'int')).toBe(6);
    });
    it('Méchant : Points Ultima selon son rang de Méchant', () => {
        expect(initialNpcState({ ...wolf, villain: 'majeur' })).toEqual({ hp: 45, mp: 40, statuses: [], ultima: 10 });
        expect(initialNpcState(wolf)).toEqual({ hp: 45, mp: 40, statuses: [] });
    });
});
