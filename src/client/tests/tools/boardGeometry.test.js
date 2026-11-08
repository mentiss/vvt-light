// tests/tools/boardGeometry.test.js
// Géométrie du tableau (documentations/spec_tableau.md §10.1, §10.8)
import { describe, it, expect } from 'vitest';
import {
    angleFrom, fitView, hitsBox, hitsStroke, initials, itemInRect, itemsBox, lineEnd, pinchView, pointsBox, rectBetween, screenToBoard,
    shapeBetween, simplifyPoints, snapAngle, zoomAt, MAX_SCALE,
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

describe('pinchView (deux doigts, spec_tableau.md §12.2)', () => {
    const view = { x: 100, y: 50, scale: 2 };
    const a0 = { px: 100, py: 100 }, b0 = { px: 200, py: 100 };

    it('déplacer les deux doigts sans changer leur écart déplace la vue sans zoomer', () => {
        const next = pinchView(view, a0, b0, { px: 130, py: 140 }, { px: 230, py: 140 });
        expect(next.scale).toBe(2);
        expect(next.x).toBeCloseTo(100 - 30 / 2);
        expect(next.y).toBeCloseTo(50 - 40 / 2);
    });

    it('écarter les doigts zoome, et le point pris sous le milieu suit le milieu', () => {
        const before = screenToBoard(view, 150, 100);
        const next = pinchView(view, a0, b0, { px: 50, py: 200 }, { px: 250, py: 200 });
        expect(next.scale).toBe(4);
        const after = screenToBoard(next, 150, 200);
        expect(after.x).toBeCloseTo(before.x);
        expect(after.y).toBeCloseTo(before.y);
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

describe('lot B : formes, angles, objet tourné (§13)', () => {
    it('Maj : carré dans la direction du geste', () => {
        expect(shapeBetween({ x: 0, y: 0 }, { x: 30, y: 10 }, true)).toEqual({ x: 0, y: 0, w: 30, h: 30 });
        expect(shapeBetween({ x: 0, y: 0 }, { x: -10, y: 30 }, true)).toEqual({ x: -30, y: 0, w: 30, h: 30 });
        expect(shapeBetween({ x: 0, y: 0 }, { x: 30, y: 10 })).toEqual({ x: 0, y: 0, w: 30, h: 10 });
    });

    it('angles par pas de 15°, ramenés dans [0, 360[', () => {
        expect(snapAngle(22)).toBe(15);
        expect(snapAngle(23)).toBe(30);
        expect(snapAngle(-10)).toBe(345);
        expect(snapAngle(359)).toBe(0);
    });

    it('ligne à 15° près, même longueur', () => {
        const end = lineEnd({ x: 0, y: 0 }, { x: 100, y: 3 }, true);
        expect(end.x).toBeCloseTo(Math.hypot(100, 3));
        expect(end.y).toBeCloseTo(0);
    });

    it('angle de la poignée : 0 en haut, 90 à droite, 180 en bas', () => {
        const c = { x: 50, y: 50 };
        expect(angleFrom(c, { x: 50, y: 0 })).toBeCloseTo(0);
        expect(angleFrom(c, { x: 100, y: 50 })).toBeCloseTo(90);
        expect(angleFrom(c, { x: 50, y: 100 })).toBeCloseTo(180);
    });

    it('un rectangle long tourné de 90° se touche dans sa nouvelle orientation', () => {
        const bar = { x: 0, y: 40, w: 100, h: 20, rotation: 90 };   // centre (50, 50), devient vertical
        expect(hitsBox(bar, 50, 5)).toBe(true);
        expect(hitsBox(bar, 5, 50)).toBe(false);
        expect(hitsBox({ ...bar, rotation: 0 }, 5, 50)).toBe(true);
    });
});

describe('itemInRect (rectangle de sélection, PC-3)', () => {
    const rect = { x: 0, y: 0, w: 100, h: 100 };
    it('entièrement dedans seulement', () => {
        expect(itemInRect({ x: 10, y: 10, w: 50, h: 20 }, rect)).toBe(true);
        expect(itemInRect({ x: 80, y: 10, w: 50, h: 20 }, rect)).toBe(false);
    });

    it('un objet tourné compte par ses coins tournés', () => {
        const bar = { x: 10, y: 45, w: 80, h: 10, rotation: 0 };
        expect(itemInRect(bar, { x: 0, y: 40, w: 100, h: 20 })).toBe(true);
        expect(itemInRect({ ...bar, rotation: 90 }, { x: 0, y: 40, w: 100, h: 20 })).toBe(false);
    });

    it('un tracé compte par ses points', () => {
        expect(itemInRect({ kind: 'line', x: 0, y: 0, w: 0, h: 0, data: { points: [10, 10, 90, 90] } }, rect)).toBe(true);
        expect(itemInRect({ kind: 'line', x: 0, y: 0, w: 0, h: 0, data: { points: [10, 10, 190, 90] } }, rect)).toBe(false);
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
