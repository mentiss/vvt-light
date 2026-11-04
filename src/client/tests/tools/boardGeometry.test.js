// tests/tools/boardGeometry.test.js
// Géométrie du tableau (documentations/spec_tableau.md §10.1, §10.8)
import { describe, it, expect } from 'vitest';
import {
    fitView, hitsStroke, initials, itemsBox, pointsBox, rectBetween, screenToBoard, simplifyPoints, zoomAt, MAX_SCALE,
} from '../../src/tools/boardGeometry.js';

describe('screenToBoard / zoomAt', () => {
    it('convertit un point de l\'écran selon la vue', () => {
        expect(screenToBoard({ x: 100, y: 50, scale: 2 }, 40, 20)).toEqual({ x: 120, y: 60 });
    });

    it('le point sous le pointeur reste en place pendant le zoom', () => {
        const view = { x: 10, y: 20, scale: 1 };
        const before = screenToBoard(view, 200, 100);
        const after = screenToBoard(zoomAt(view, 2, 200, 100), 200, 100);
        expect(after.x).toBeCloseTo(before.x);
        expect(after.y).toBeCloseTo(before.y);
    });

    it('borne le zoom', () => {
        expect(zoomAt({ x: 0, y: 0, scale: 7 }, 10, 0, 0).scale).toBe(MAX_SCALE);
    });
});

describe('fitView', () => {
    it('centre la boîte et la fait tenir dans le cadre', () => {
        const view = fitView({ x: 0, y: 0, w: 1000, h: 500 }, 500, 500);
        expect(view.scale).toBeCloseTo(0.475);
        const center = screenToBoard(view, 250, 250);
        expect(center.x).toBeCloseTo(500);
        expect(center.y).toBeCloseTo(250);
    });

    it('vue neutre sans contenu ni cadre', () => {
        expect(fitView(null, 500, 500)).toEqual({ x: 0, y: 0, scale: 1 });
        expect(fitView({ x: 0, y: 0, w: 10, h: 10 }, 0, 0)).toEqual({ x: 0, y: 0, scale: 1 });
    });
});

describe('boîtes', () => {
    it('boîte d\'un tracé, d\'objets, rectangle entre deux points', () => {
        expect(pointsBox([0, 0, 10, 20, 30, 5])).toEqual({ x: 0, y: 0, w: 30, h: 20 });
        expect(itemsBox([{ x: 10, y: 10, w: 5, h: 5 }, { x: -5, y: 0, w: 5, h: 50 }])).toEqual({ x: -5, y: 0, w: 20, h: 50 });
        expect(itemsBox([])).toBeNull();
        expect(rectBetween({ x: 10, y: 0 }, { x: 0, y: 8 })).toEqual({ x: 0, y: 0, w: 10, h: 8 });
    });
});

describe('simplifyPoints', () => {
    it('retire les points alignés, garde les extrémités et les coudes', () => {
        const line = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0];
        expect(simplifyPoints(line, 0.5)).toEqual([0, 0, 4, 0]);
        const corner = [0, 0, 5, 0, 10, 0, 10, 5, 10, 10];
        expect(simplifyPoints(corner, 0.5)).toEqual([0, 0, 10, 0, 10, 10]);
    });

    it('laisse intact un tracé de deux points', () => {
        expect(simplifyPoints([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });
});

describe('hitsStroke', () => {
    it('touche le trait à la portée près, épaisseur comprise', () => {
        const points = [0, 0, 100, 0];
        expect(hitsStroke(points, 4, 50, 3, 2)).toBe(true);    // 3 ≤ 2 + 4/2
        expect(hitsStroke(points, 4, 50, 10, 2)).toBe(false);
        expect(hitsStroke(points, 4, 105, 0, 2)).toBe(false);
    });
});

describe('initials', () => {
    it('prénom et nom, mot seul, vide', () => {
        expect(initials('Bjorn Sigurdsson')).toBe('BS');
        expect(initials('garde')).toBe('GA');
        expect(initials('')).toBe('?');
    });
});
