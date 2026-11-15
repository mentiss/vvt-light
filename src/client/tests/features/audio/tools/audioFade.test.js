// Fondu d'un bouton (spec_audio.md §15.5, §15.6)
import { describe, it, expect } from 'vitest';
import { FADE_WAIT_MS, fadeLevel, fadeOutElapsed, fadeOutActive } from '@/features/audio/tools/audioFade.js';

describe('fadeLevel', () => {
    it('le lecteur entrant monte de 0 à 1, le sortant descend de 1 à 0', () => {
        expect(fadeLevel(0, 3000, 'in')).toBe(0);
        expect(fadeLevel(3000, 3000, 'in')).toBe(1);
        expect(fadeLevel(0, 3000, 'out')).toBe(1);
        expect(fadeLevel(3000, 3000, 'out')).toBeCloseTo(0);
    });

    it('à puissance constante : pas de creux au milieu', () => {
        const inLevel = fadeLevel(1500, 3000, 'in');
        const outLevel = fadeLevel(1500, 3000, 'out');
        expect(inLevel).toBeCloseTo(Math.SQRT1_2);
        expect(inLevel ** 2 + outLevel ** 2).toBeCloseTo(1);
    });

    it('borné avant le début et après la fin ; durée nulle : fondu terminé', () => {
        expect(fadeLevel(-500, 3000, 'in')).toBe(0);
        expect(fadeLevel(9000, 3000, 'in')).toBe(1);
        expect(fadeLevel(0, 0, 'in')).toBe(1);
        expect(fadeLevel(0, 0, 'out')).toBeCloseTo(0);
    });
});

describe('fadeOutElapsed', () => {
    it('l\'ancien morceau suit la lecture réelle du nouveau : pas de descente pendant un chargement', () => {
        expect(fadeOutElapsed(0, 5000)).toBe(0);
        expect(fadeOutElapsed(1200, 6000)).toBe(1200);
    });

    it('le nouveau tarde : l\'ancien descend quand même après l\'attente', () => {
        expect(fadeOutElapsed(0, FADE_WAIT_MS + 1500)).toBe(1500);
        expect(fadeOutElapsed(2000, FADE_WAIT_MS + 1500)).toBe(2000);
    });
});

describe('fadeOutActive', () => {
    const fade = { from: { mediaId: 'a' }, at: 10_000, duration: 3000 };
    const limit = 10_000 + FADE_WAIT_MS + 3000 + 1000;

    it('le lecteur sortant est gardé jusqu\'à la borne de sécurité (attente, durée, marge)', () => {
        expect(fadeOutActive(fade, 10_000)).toBe(true);
        expect(fadeOutActive(fade, limit - 1)).toBe(true);
        expect(fadeOutActive(fade, limit)).toBe(false);
    });

    it('rien ne jouait, ou pas de fondu : pas de lecteur sortant', () => {
        expect(fadeOutActive({ ...fade, from: null }, 10_500)).toBe(false);
        expect(fadeOutActive(null, 10_500)).toBe(false);
    });
});
