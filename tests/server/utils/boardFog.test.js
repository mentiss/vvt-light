// tests/server/utils/boardFog.test.js
// Brouillard du tableau (spec_tableau.md §15.2) : lecture de l'ancien format,
// regroupement des formes du même type, retrait des formes recouvertes, garde-fou.

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { readFog, cleanFogShape, addFogShape, MAX_FOG_GROUPS, MAX_FOG_COORDS } = require('../../../src/server/utils/boardFog.js');

const rect = (x, y, w, h) => ({ x, y, w, h });

describe('readFog', () => {
    it('convertit l\'ancien format et regroupe les opérations successives du même type', () => {
        const old = JSON.stringify([
            { op: 'reveal', x: 0, y: 0, w: 10, h: 10 },
            { op: 'reveal', x: 20, y: 0, w: 10, h: 10 },
            { op: 'cover', x: 5, y: 5, w: 2, h: 2 },
        ]);
        expect(readFog(old)).toEqual([
            { op: 'reveal', shapes: [rect(0, 0, 10, 10), rect(20, 0, 10, 10)] },
            { op: 'cover', shapes: [rect(5, 5, 2, 2)] },
        ]);
    });

    it('un texte illisible donne un brouillard vide', () => {
        expect(readFog('pas du json')).toEqual([]);
    });
});

describe('cleanFogShape', () => {
    it('accepte un rectangle et un coup de pinceau, même d\'un seul point', () => {
        expect(cleanFogShape({ x: 0, y: 0, w: 5, h: 5 })).toEqual(rect(0, 0, 5, 5));
        expect(cleanFogShape({ points: [3, 4], r: 10 })).toEqual({ points: [3, 4], r: 10 });
    });

    it('refuse coordonnées impaires, rayon nul ou trop grand, trop de points, rectangle vide', () => {
        expect(cleanFogShape({ points: [1, 2, 3], r: 10 })).toBeNull();
        expect(cleanFogShape({ points: [1, 2], r: 0 })).toBeNull();
        expect(cleanFogShape({ points: [1, 2], r: 6000 })).toBeNull();
        expect(cleanFogShape({ points: new Array(8002).fill(1), r: 10 })).toBeNull();
        expect(cleanFogShape({ points: [1, '2'], r: 10 })).toBeNull();
        expect(cleanFogShape({ x: 0, y: 0, w: 0, h: 5 })).toBeNull();
    });
});

describe('addFogShape', () => {
    const brush = { points: [10, 10, 20, 20], r: 5 };   // boîte : 5, 5 → 25, 25

    it('une forme du même type rejoint le dernier groupe, un autre type en ouvre un', () => {
        let fog = addFogShape([], 'reveal', brush);
        fog = addFogShape(fog, 'reveal', rect(100, 100, 10, 10));
        expect(fog).toHaveLength(1);
        fog = addFogShape(fog, 'cover', { points: [200, 200], r: 3 });
        expect(fog.map(g => g.op)).toEqual(['reveal', 'cover']);
    });

    it('un rectangle retire les formes qu\'il contient entièrement, pas celles qui dépassent', () => {
        let fog = addFogShape([], 'reveal', brush);
        fog = addFogShape(fog, 'reveal', rect(100, 100, 10, 10));
        fog = addFogShape(fog, 'cover', rect(0, 0, 30, 30));       // contient le pinceau
        expect(fog).toEqual([
            { op: 'reveal', shapes: [rect(100, 100, 10, 10)] },
            { op: 'cover', shapes: [rect(0, 0, 30, 30)] },
        ]);
        const partial = addFogShape(addFogShape([], 'reveal', brush), 'cover', rect(0, 0, 20, 20));   // le pinceau dépasse
        expect(partial[0].shapes).toEqual([brush]);
    });

    it('un groupe vidé disparaît et ses voisins du même type se rejoignent', () => {
        let fog = addFogShape([], 'reveal', rect(100, 100, 10, 10));
        fog = addFogShape(fog, 'cover', rect(0, 0, 10, 10));
        fog = addFogShape(fog, 'reveal', brush);
        fog = addFogShape(fog, 'reveal', rect(-1, -1, 12, 12));     // contient le recouvrement : il disparaît
        expect(fog).toHaveLength(1);
        expect(fog[0].op).toBe('reveal');
        expect(fog[0].shapes).toHaveLength(3);
    });

    it('garde-fou : null au-delà du volume de points ou du nombre d\'alternances', () => {
        const big = { points: new Array(8000).fill(1).map((_, i) => i), r: 1 };
        let fog = [];
        for (let i = 0; i * 8000 < MAX_FOG_COORDS - 8000; i += 1) fog = addFogShape(fog, 'reveal', big);
        expect(fog).not.toBeNull();
        expect(addFogShape(fog, 'reveal', big)).toBeNull();

        let alternating = [];
        for (let i = 0; i < MAX_FOG_GROUPS; i += 1) alternating = addFogShape(alternating, i % 2 ? 'cover' : 'reveal', { points: [i, i], r: 1 });
        expect(alternating).toHaveLength(MAX_FOG_GROUPS);
        expect(addFogShape(alternating, MAX_FOG_GROUPS % 2 ? 'cover' : 'reveal', { points: [0, 0], r: 1 })).toBeNull();
    });
});
