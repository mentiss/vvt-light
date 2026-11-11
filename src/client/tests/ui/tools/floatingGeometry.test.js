// Position et taille d'une fenêtre flottante (spec_ui_panneaux.md) : ancrage, déplacement, redimensionnement
import { describe, it, expect } from 'vitest';
import { clampRect, collapseRect, defaultRect, expandRect, moveRect, resizeRect } from '@/ui/tools/floatingGeometry.js';

const viewport = { width: 1600, height: 900 };
const rect = { left: 600, top: 200, width: 480, height: 500 };

describe('clampRect', () => {
    it('garde la fenêtre dans le navigateur', () => {
        expect(clampRect({ ...rect, left: -200, top: -50 }, viewport)).toMatchObject({ left: 8, top: 8 });
        expect(clampRect({ ...rect, left: 1500 }, viewport).left).toBe(1600 - 480 - 8);
        // La barre de titre reste atteignable en bas
        expect(clampRect({ ...rect, top: 2000 }, viewport).top).toBe(900 - 44 - 8);
    });

    it('borne la taille entre le minimum et la fenêtre', () => {
        expect(clampRect({ ...rect, width: 100, height: 50 }, viewport)).toMatchObject({ width: 320, height: 240 });
        expect(clampRect({ ...rect, width: 5000, height: 5000 }, viewport)).toMatchObject({ width: 1584, height: 884 });
        // Fenêtre plus petite que le minimum (téléphone) : la fenêtre l'emporte
        expect(clampRect(rect, { width: 300, height: 200 })).toMatchObject({ width: 284, height: 184 });
    });

    it('respecte une taille minimale propre à la fenêtre', () => {
        expect(clampRect({ ...rect, width: 100 }, viewport, { width: 200, height: 100 }).width).toBe(200);
    });
});

describe('defaultRect', () => {
    it('par défaut, en bas à droite, au-dessus des boutons flottants', () => {
        const r = defaultRect(viewport);
        expect(r).toEqual({ left: 1600 - 480 - 16, top: 900 - 600 - 72, width: 480, height: 600 });
    });

    it('suit l’ancrage et le décalage demandés', () => {
        const size = { width: 400, height: 300 };
        const offset = { x: 20, y: 30 };
        expect(defaultRect(viewport, { size, anchor: 'top-left', offset })).toMatchObject({ left: 20, top: 30 });
        expect(defaultRect(viewport, { size, anchor: 'top-right', offset })).toMatchObject({ left: 1600 - 400 - 20, top: 30 });
        expect(defaultRect(viewport, { size, anchor: 'bottom-left', offset })).toMatchObject({ left: 20, top: 900 - 300 - 30 });
        expect(defaultRect(viewport, { size, anchor: 'center' })).toMatchObject({ left: 600, top: 300 });
    });

    it('une taille sous le minimum est relevée avant l’ancrage : le décalage reste respecté', () => {
        const r = defaultRect(viewport, { size: { width: 200, height: 100 }, anchor: 'top-right', offset: { x: 20, y: 30 } });
        expect(r).toEqual({ left: 1600 - 320 - 20, top: 30, width: 320, height: 240 });
    });

    it('réduit la taille à la place disponible (petit écran)', () => {
        const r = defaultRect({ width: 700, height: 500 });
        expect(r.height).toBe(500 - 72 - 8);
        expect(r.top).toBe(8);
        expect(r.top + r.height + 72).toBe(500);
    });
});

describe('moveRect', () => {
    it('déplace sans changer la taille', () => {
        expect(moveRect(rect, 100, -50, viewport)).toEqual({ left: 700, top: 150, width: 480, height: 500 });
    });
});

describe('resizeRect', () => {
    it('agrandit par le bord droit et le bas sans bouger le coin opposé', () => {
        expect(resizeRect(rect, 'se', 100, 60, viewport)).toEqual({ left: 600, top: 200, width: 580, height: 560 });
    });

    it('par le bord gauche et le haut, le bord opposé reste fixe', () => {
        const r = resizeRect(rect, 'nw', -100, -50, viewport);
        expect(r).toEqual({ left: 500, top: 150, width: 580, height: 550 });
        expect(r.left + r.width).toBe(rect.left + rect.width);
    });

    it('ne descend pas sous la taille minimale, même en tirant trop loin', () => {
        const r = resizeRect(rect, 'w', 400, 0, viewport);
        expect(r.width).toBe(320);
        expect(r.left + r.width).toBe(rect.left + rect.width);
    });
});

describe('expandRect / collapseRect (fenêtre réduite, spec_audio.md §14.1)', () => {
    it('s\'ouvre vers le bas quand la place suffit, sans barre à reprendre', () => {
        expect(expandRect(rect, 40, viewport)).toEqual({ rect, barTop: null });
    });

    it('sans place en dessous, s\'ouvre vers le haut, bas calé sur le bas de la barre', () => {
        const bar = { ...rect, top: 840 };   // barre réduite posée en bas de l'écran
        const { rect: open, barTop } = expandRect(bar, 40, viewport);
        expect(open.top + open.height).toBe(840 + 40);
        expect(open.height).toBe(500);
        expect(barTop).toBe(840);
    });

    it('bornée au haut de l\'écran quand la fenêtre est trop haute', () => {
        const { rect: open } = expandRect({ ...rect, top: 600, height: 880 }, 40, viewport);
        expect(open.top).toBe(8);
    });

    it('réduite à nouveau, la barre revient à sa place', () => {
        const bar = { ...rect, top: 840 };
        const { rect: open, barTop } = expandRect(bar, 40, viewport);
        expect(collapseRect(open, barTop, viewport)).toEqual(bar);
        // Ouverte vers le bas : rien ne bouge
        expect(collapseRect(rect, null, viewport)).toBe(rect);
    });
});
