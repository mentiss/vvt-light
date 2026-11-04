// tests/systems/vileborn/config/rules/character.test.js
// Actions de jeu d'un Paria (spec_vileborn.md §1.3, §1.4, §5) : chaque action
// renvoie le patch à enregistrer.
import { describe, it, expect } from 'vitest';
import {
    displayName, addWound, sufferState, healWound, mobilesBlocked, spendAspiration, spendDuty,
    exploreTicks, giftRollPatch, yieldToUrge, consumeReverie, giftInfo, wordSlots, slotsToWords,
} from '../../../../../src/systems/vileborn/config/rules/character.js';
import { buildTestContext } from '../../../../../src/systems/vileborn/config/rules/test.js';

const gifts = [
    { id: 1, giftKey: 'cold_blood', name: 'Sang glacé', checked: true },
    { id: 2, giftKey: 'shadow_cloak', name: 'Manteau d\'ombres', checked: false },
];

describe('Nom affiché', () => {
    it('prénom puis nom, sans espace en trop si l\'un manque', () => {
        expect(displayName({ prenom: 'Raphaël', nom: 'de Normante' })).toBe('Raphaël de Normante');
        expect(displayName({ prenom: ' Thalia ', nom: '' })).toBe('Thalia');
        expect(displayName(null)).toBe('');
    });
});

describe('Mots en cases (mode Édition)', () => {
    const c = { words: [
        { id: 3, kind: 'training', position: 0, label: 'Escrime' },
        { id: 1, kind: 'personality', position: 1, label: 'Courageux' },
        { id: 2, kind: 'personality', position: 0, label: 'Raffiné' },
    ] };
    it('5 cases par côté, dans l\'ordre', () => {
        expect(wordSlots(c, 'personality')).toEqual(['Raffiné', 'Courageux', '', '', '']);
        expect(wordSlots(c, 'training')).toEqual(['Escrime', '', '', '', '']);
    });
    it('cases vides retirées, positions recalculées, ids repris par rang', () => {
        expect(slotsToWords(c, ['', 'Courageux', 'Rusé', '', ''], ['Escrime', '', '', '', ''])).toEqual([
            { id: 2, kind: 'personality', position: 0, label: 'Courageux' },
            { id: 1, kind: 'personality', position: 1, label: 'Rusé' },
            { id: 3, kind: 'training', position: 0, label: 'Escrime' },
        ]);
    });
});

describe('États et blessures', () => {
    it('subir un état déjà coché coche une blessure à la place', () => {
        expect(sufferState({}, 'fear')).toEqual({ stateFear: true });
        expect(sufferState({ stateFear: true }, 'fear')).toEqual({ wound1: true });
    });
    it('la 4ᵉ blessure met hors jeu', () => {
        expect(addWound({ wound1: true })).toEqual({ wound2: true });
        expect(addWound({ wound1: true, wound2: true, wound3: true })).toEqual({ outOfPlay: true });
    });
    it('guérir une blessure efface la dernière cochée et sa description', () => {
        expect(healWound({ wound1: true, wound2: true, wound2Note: 'côte fêlée' })).toEqual({ wound2: false, wound2Note: '' });
        expect(healWound({})).toEqual({});
    });
});

describe('Mobiles', () => {
    it('aspiration : cochée, guérit une blessure ; devoir : guérit l\'état choisi', () => {
        expect(spendAspiration({ wound1: true })).toEqual({ aspirationChecked: true, wound1: false, wound1Note: '' });
        expect(spendDuty('anger')).toEqual({ dutyChecked: true, stateAnger: false });
        expect(spendDuty(null)).toEqual({ dutyChecked: true });
    });
    it('bloqués par l\'insécurité ou par Sang glacé coché', () => {
        expect(mobilesBlocked({})).toBeNull();
        expect(mobilesBlocked({ stateInsecurity: true })).toMatch(/Insécurité/);
        expect(mobilesBlocked({ gifts })).toMatch(/Sang glacé/);
        expect(mobilesBlocked({ gifts: gifts.map(g => ({ ...g, checked: false })) })).toBeNull();
    });
});

describe('Sombre héritage, dons, pulsion, Rêverie', () => {
    it('explorer coche la case suivante, jamais au-delà de 3', () => {
        expect(exploreTicks({ heritageTicks: 0 })).toBe(1);
        expect(exploreTicks({ heritageTicks: 3 })).toBe(3);
    });
    it('contrepartie au d6 : état (ou blessure s\'il est déjà coché), blessure, rien pour une cible', () => {
        expect(giftRollPatch({}, 'state:exhaustion')).toEqual({ stateExhaustion: true });
        expect(giftRollPatch({ stateExhaustion: true }, 'state:exhaustion')).toEqual({ wound1: true });
        expect(giftRollPatch({}, 'wound')).toEqual({ wound1: true });
        expect(giftRollPatch({}, 'target_wound')).toEqual({});
        expect(giftInfo({ giftKey: 'blood_power' }).roll).toEqual({ on: [1], effect: 'state:exhaustion' });
    });
    it('céder à la pulsion efface les coches de l\'héritage et des dons', () => {
        const p = yieldToUrge({ heritageTicks: 2, gifts });
        expect(p.heritageTicks).toBe(0);
        expect(p.gifts.every(g => !g.checked)).toBe(true);
        expect(p.gifts.map(g => g.id)).toEqual([1, 2]);
    });
    it('Rêverie (table) : soin de tout, coches conservées ; version du kit : coches effacées', () => {
        const c = { stateAnger: true, wound1: true, wound1Note: 'x', outOfPlay: true, heritageTicks: 2, gifts };
        const p = consumeReverie(c);
        expect(p).toMatchObject({ stateAnger: false, wound1: false, wound1Note: '', outOfPlay: false });
        expect(p.heritageTicks).toBeUndefined();
        expect(p.gifts).toBeUndefined();
        expect(consumeReverie(c, true).heritageTicks).toBe(0);
    });
});

describe('Contexte d\'un test', () => {
    it('honte et peur retirent personnalité et formation ; états, lien et modificateur s\'additionnent', () => {
        const c = { stateShame: true, stateAnger: true };
        const ctx = buildTestContext(c, { approach: 'reason', die: 8, personality: true, training: true, modifier: 1, bondLevel: 1 });
        expect(ctx).toMatchObject({ type: 'test', personality: false, training: true, explore: false, ticks: 0, modifier: 1, difficulty: 5 });
    });
    it('exploration : coches transmises pour le seuil du d12', () => {
        expect(buildTestContext({}, { approach: 'force', die: 10, explore: true }, 2)).toMatchObject({ explore: true, ticks: 2, modifier: 0 });
    });
});
