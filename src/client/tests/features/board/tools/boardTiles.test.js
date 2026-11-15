// tests/features/board/tools/boardTiles.test.js
// Carte en tuiles (spec_tableau.md §17.1, §17.4) : niveau selon le zoom, tuiles
// visibles, tuiles du bord, adresse avec version. Exemple : la carte du Trøndelag.

import { describe, it, expect } from 'vitest';
import { mapLevel, tileUrl, visibleTiles } from '@/features/board/tools/boardTiles.js';

const MAP = { name: 'trondelag', width: 6953, height: 5291, tileSize: 512, levels: 5, version: '20261115142247' };

describe('mapLevel', () => {
    it('pleine résolution dès que le zoom dépasse la moitié, niveau 0 en vue très éloignée', () => {
        expect(mapLevel(MAP, 1)).toBe(4);
        expect(mapLevel(MAP, 3)).toBe(4);
        expect(mapLevel(MAP, 0.5)).toBe(3);
        expect(mapLevel(MAP, 0.26)).toBe(3);   // le niveau 2 (×0,25) ne suffit plus
        expect(mapLevel(MAP, 0.24)).toBe(2);
        expect(mapLevel(MAP, 0.01)).toBe(0);
    });

    it('un écran haute densité demande un niveau plus détaillé', () => {
        expect(mapLevel(MAP, 0.24, 2)).toBe(3);
    });
});

describe('visibleTiles', () => {
    it('seulement les tuiles qui touchent la vue', () => {
        const tiles = visibleTiles(MAP, 4, { x: 600, y: 100, scale: 1 }, { width: 800, height: 500 });
        expect(tiles.map(t => [t.x, t.y])).toEqual([[1, 0], [1, 1], [2, 0], [2, 1]]);
        expect(tiles[0].box).toEqual({ x: 512, y: 0, w: 512, h: 512 });
    });

    it('tuile du bord plus petite, mise à l\'échelle au niveau réduit', () => {
        const [last] = visibleTiles(MAP, 4, { x: 6900, y: 5200, scale: 1 }, { width: 10, height: 10 });
        expect(last).toMatchObject({ x: 13, y: 10 });
        expect(last.box.w).toBeCloseTo(6953 - 13 * 512);
        expect(last.box.h).toBeCloseTo(5291 - 10 * 512);
        // Niveau 0 : une seule tuile qui couvre toute la carte
        const whole = visibleTiles(MAP, 0, { x: 0, y: 0, scale: 0.1 }, { width: 1000, height: 1000 });
        expect(whole).toHaveLength(1);
        expect(whole[0].box.w).toBeCloseTo(6953);
        expect(whole[0].box.h).toBeCloseTo(5291);
    });

    it('vue hors de la carte : aucune tuile', () => {
        expect(visibleTiles(MAP, 4, { x: -2000, y: 0, scale: 1 }, { width: 500, height: 500 })).toEqual([]);
        expect(visibleTiles(MAP, 4, { x: 8000, y: 0, scale: 1 }, { width: 500, height: 500 })).toEqual([]);
    });
});

describe('tileUrl', () => {
    it('adresse directe, versionnée', () => {
        expect(tileUrl(MAP, 4, 13, 10)).toBe('/board-maps/trondelag/4/13_10.webp?v=20261115142247');
    });
});
