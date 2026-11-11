// tests/tools/boardFilters.test.js
// Filtres d'image du tableau (documentations/spec_tableau.md §13.2, Q-49)
import { describe, it, expect } from 'vitest';
import { filterCss, isNeutral, presetFilter, withSlider, FILTER_MAX } from '@/features/board/tools/boardFilters.js';

describe('filtres d\'image', () => {
    it('un préréglage règle les trois curseurs', () => {
        expect(presetFilter('faded')).toEqual({ preset: 'faded', brightness: 1.1, contrast: 0.75, saturation: 0.5 });
        expect(presetFilter('inconnu').preset).toBe('normal');
    });

    it('un curseur est borné comme côté serveur, le préréglage reste', () => {
        expect(withSlider(presetFilter('sepia'), 'brightness', 5)).toMatchObject({ preset: 'sepia', brightness: FILTER_MAX });
        expect(withSlider(null, 'contrast', -1)).toMatchObject({ preset: 'normal', contrast: 0 });
    });

    it('neutre : rien à appliquer ; sinon les curseurs puis la teinte du préréglage', () => {
        expect(isNeutral(presetFilter('normal'))).toBe(true);
        expect(filterCss(presetFilter('normal'))).toBeUndefined();
        expect(filterCss(withSlider(presetFilter('normal'), 'brightness', 0.8))).toBe('brightness(0.8) contrast(1) saturate(1)');
        expect(filterCss(presetFilter('sepia'))).toBe('brightness(1) contrast(1) saturate(0.9) sepia(0.8)');
    });
});
