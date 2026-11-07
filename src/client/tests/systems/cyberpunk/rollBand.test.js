// tests/systems/cyberpunk/rollBand.test.js
// Bande du résultat (spec_cyberpunk.md §5) : zones calées sur les seuils des
// règles (§1.2 : 15+ plein, 10-14 partiel, 9- échec), repère au centre de la case
// du total, borné aux extrémités.
import { describe, it, expect } from 'vitest';
import { BAND_ZONES, BAND_MIN, BAND_MAX, bandPosition } from '../../../src/systems/cyberpunk/config.jsx';

describe('zones de la bande', () => {
    it('9- / 10-14 / 15+, sans trou ni chevauchement', () => {
        expect(BAND_ZONES.map(z => [z.outcome, z.from, z.to])).toEqual([
            ['failure', BAND_MIN, 9], ['partial', 10, 14], ['success', 15, BAND_MAX],
        ]);
        for (const z of BAND_ZONES) expect(z.cells).toBe(z.to - z.from + 1);
    });
});

describe('repère', () => {
    const zoneAt = (pct) => {
        let acc = 0;
        const total = BAND_ZONES.reduce((s, z) => s + z.cells, 0);
        for (const z of BAND_ZONES) {
            acc += (z.cells / total) * 100;
            if (pct < acc) return z.outcome;
        }
        return null;
    };

    it('tombe dans la zone de son total, seuils compris', () => {
        expect(zoneAt(bandPosition(9))).toBe('failure');
        expect(zoneAt(bandPosition(10))).toBe('partial');
        expect(zoneAt(bandPosition(14))).toBe('partial');
        expect(zoneAt(bandPosition(15))).toBe('success');
    });

    it('borné aux extrémités', () => {
        expect(bandPosition(-3)).toBe(bandPosition(BAND_MIN));
        expect(bandPosition(40)).toBe(bandPosition(BAND_MAX));
        expect(bandPosition(BAND_MAX)).toBeLessThan(100);
    });
});
