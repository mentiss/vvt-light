// tests/systems/woddavampire/config/rules/powerRoll.test.js
// Lecture des colonnes « Jet » et « Coût » des annexes (spec_woddavampire.md §II.11 B-1).
import { describe, it, expect } from 'vitest';
import { parseRollText, parseCost, isSimpleCost, powerKey } from '../../../../../src/systems/woddavampire/config/rules/powerRoll.js';

describe('Jets des annexes', () => {
    it('format simple : abréviations, Capacité, difficulté et précision', () => {
        expect(parseRollText('Per + Survie, diff 6 (modifiée par la force du prédateur)')).toEqual({
            traits: [{ kind: 'attribute', key: 'perception' }, { kind: 'ability', key: 'survival' }],
            choices: [], difficulty: 6, diffNote: 'modifiée par la force du prédateur',
        });
    });

    it('Vertus, Volonté, Route ; « Conscience » est la Capacité après un Attribut, la Vertu seule', () => {
        expect(parseRollText('Man + Maîtrise/Instinct, diff 8').traits[1]).toEqual({ kind: 'virtue', key: 'virtueControl' });
        expect(parseRollText('Volonté, diff 4').traits).toEqual([{ kind: 'willpower', key: 'willpower' }]);
        expect(parseRollText('Per + Conscience, diff 6').traits[1]).toEqual({ kind: 'ability', key: 'awareness' });
        expect(parseRollText('Conscience, diff 7').traits[0]).toEqual({ kind: 'virtue', key: 'virtueMoral' });
    });

    it('difficulté à fixer (« diff = Volonté de la cible ») ou absente', () => {
        expect(parseRollText('Int + Subterfuge, diff = Volonté actuelle de la cible')).toMatchObject({ difficulty: null, diffNote: '= Volonté actuelle de la cible' });
        expect(parseRollText('Man + Intimidation')).toMatchObject({ difficulty: null, diffNote: null });
    });

    it('choix entre deux Capacités', () => {
        expect(parseRollText('Int + Empathie ou Médecine, diff 7').choices).toEqual([[{ kind: 'ability', key: 'empathy' }, { kind: 'ability', key: 'medicine' }]]);
    });

    it('à la table : jets opposés, formulations libres, pas de jet', () => {
        expect(parseRollText('Int + Intimidation contre Volonté de la cible')).toBeNull();
        expect(parseRollText('Man + Animaux pour commander (diff selon la table)')).toBeNull();
        expect(parseRollText('– (3 tours)')).toBeNull();
    });
});

describe('Coûts des annexes', () => {
    it('sang et Volonté, seul le coût de base compte', () => {
        expect(parseCost('1 S + 1 V')).toEqual({ blood: 1, willpower: 1 });
        expect(parseCost('1 S (+1 V par tour en plus)')).toEqual({ blood: 1, willpower: 0 });
        expect(parseCost('–')).toEqual({ blood: 0, willpower: 0 });
    });

    it('coût simple : proposé coché ; conditionnel : décoché', () => {
        expect(isSimpleCost('2 S')).toBe(true);
        expect(isSimpleCost('1 S + 1 V')).toBe(true);
        expect(isSimpleCost('1 V contre un vampire')).toBe(false);
    });

    it('clé stable depuis le nom VO', () => {
        expect(powerKey("Communion du prédateur (Predator's Communion)")).toBe('predators_communion');
        expect(powerKey('Memento Mori')).toBe('memento_mori');
    });
});
