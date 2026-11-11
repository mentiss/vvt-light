// tests/tools/dice2d.test.js
// Dés 2D (spec_fabula.md §4.1) : résolution de l'apparence champ par champ
// (dé > groupe > type du slug > joueur), jeu nommé ramené à des couleurs,
// séquence d'animation dépliée en dés.
import { describe, it, expect } from 'vitest';
import {
    resolveDieConfig, playerDieConfig, waveDiceTypes, waveDice, textureUrl,
} from '@/features/dice/tools/dice2d.js';

const player = { foreground: '#fff', background: '#000', outline: '#111', edge: null, texture: 'marble', material: 'metal' };
const byType = { d8: { background: '#1F8E5C', outline: '#9FF5C6', material: 'glass' } };

describe('apparence d\'un dé', () => {
    it('le type du slug fixe ce qu\'il déclare, le joueur garde le reste', () => {
        expect(resolveDieConfig({ player, byType, type: 'd8' })).toEqual({
            foreground: '#fff', background: '#1F8E5C', outline: '#9FF5C6', edge: null, texture: 'marble', material: 'glass',
        });
    });

    it('dé > groupe > type > joueur, champ par champ', () => {
        const r = resolveDieConfig({ player, byType, type: 'd8', group: { background: '#222', foreground: '#ff0' }, die: { background: '#333' } });
        expect(r).toMatchObject({ background: '#333', foreground: '#ff0', outline: '#9FF5C6', texture: 'marble' });
    });

    it('la chaîne « default » du groupe ne fixe rien', () => {
        expect(resolveDieConfig({ player, byType: null, type: 'd6', group: 'default' })).toEqual(player);
    });

    it('jeu nommé du joueur : couleurs de l\'aperçu', () => {
        expect(playerDieConfig({ mode: 'preset', preset: 'bloodmoon' })).toMatchObject({ background: '#6F0000', foreground: '#CDB800' });
        expect(playerDieConfig({ mode: 'preset', preset: 'fire' })).toMatchObject({ background: '#f8d84f' });
    });

    it('configuration personnalisée du joueur reprise telle quelle', () => {
        expect(playerDieConfig({ mode: 'custom', custom: { background: '#2E3F98', texture: '' } }))
            .toMatchObject({ background: '#2E3F98', texture: null });
    });

    it('texture : fichier de la bibliothèque', () => {
        expect(textureUrl('marble')).toBe('/dice-assets/textures/marble.webp');
        expect(textureUrl('cloudy_2')).toBe('/dice-assets/textures/cloudy.alt.webp');
        expect(textureUrl('')).toBeNull();
    });
});

describe('séquence dépliée en dés', () => {
    it('types d\'une vague', () => {
        expect(waveDiceTypes('d6', 3)).toEqual(['d6', 'd6', 'd6']);
        expect(waveDiceTypes('1d8+1d10', 2)).toEqual(['d8', 'd10']);
        expect(waveDiceTypes('2d6+1d8', 3)).toEqual(['d6', 'd6', 'd8']);
        expect(waveDiceTypes('1d100+1d10', 2)).toEqual(['d100', 'd10']);
    });

    it('dés d\'une vague : couleur par dé, sinon type du slug', () => {
        const dice = waveDice({ diceType: '1d8+1d10', color: 'default' }, { dice: [7, 4], colors: [null, { background: '#2266C9' }] }, player, byType);
        expect(dice.map(d => [d.type, d.value, d.config.background])).toEqual([['d8', 7, '#1F8E5C'], ['d10', 4, '#2266C9']]);
    });
});
