// Saisie d'un timecode (spec_audio.md §14.2)
import { describe, it, expect } from 'vitest';
import { parseTimecode } from '@/features/audio/tools/timecode.js';

describe('parseTimecode', () => {
    it('lit les secondes, les minutes et les heures', () => {
        expect(parseTimecode('83')).toBe(83);
        expect(parseTimecode('1:23')).toBe(83);
        expect(parseTimecode(' 1:02:03 ')).toBe(3723);
        expect(parseTimecode('0:05')).toBe(5);
    });

    it('vide : depuis le début', () => {
        expect(parseTimecode('')).toBe(0);
        expect(parseTimecode(undefined)).toBe(0);
    });

    it('refuse ce qui est illisible', () => {
        expect(parseTimecode('1:75')).toBeNull();
        expect(parseTimecode('abc')).toBeNull();
        expect(parseTimecode('-5')).toBeNull();
        expect(parseTimecode('1:2:3:4')).toBeNull();
        expect(parseTimecode('1.5')).toBeNull();
    });
});
