// Volumes du joueur (spec_audio.md §10.8 : S-13, S-15, S-16)
import { describe, it, expect } from 'vitest';
import { DEFAULT_VOLUMES, normalizeVolumes, slotVolume } from '../../src/tools/audioVolume.js';

describe('réglages du joueur', () => {
    it('part des pré-réglages de la plateforme, et complète les niveaux manquants', () => {
        expect(normalizeVolumes(undefined)).toEqual({ master: 100, music: 50, ambience: 10, effect: 50, muted: false });
        expect(normalizeVolumes({ master: 80, music: 30 })).toEqual({ master: 80, music: 30, ambience: 10, effect: 50, muted: false });
    });

    it('borne chaque niveau entre 0 et 100', () => {
        expect(normalizeVolumes({ master: 150, music: -5, ambience: 'fort', effect: 33.6 }))
            .toEqual({ master: 100, music: 0, ambience: 10, effect: 34, muted: false });
    });
});

describe('slotVolume', () => {
    it('multiplie gain de la vidéo, volume du type et volume général', () => {
        expect(slotVolume('music', 100, DEFAULT_VOLUMES)).toBe(50);
        expect(slotVolume('ambience1', 100, DEFAULT_VOLUMES)).toBe(10);
        expect(slotVolume('ambience2', 50, { ...DEFAULT_VOLUMES, master: 50 })).toBe(3);
        expect(slotVolume('effect', 40, DEFAULT_VOLUMES)).toBe(20);
    });

    it('coupe tout quand le joueur coupe le son', () => {
        expect(slotVolume('music', 100, { ...DEFAULT_VOLUMES, muted: true })).toBe(0);
    });

    it('ignore une piste inconnue', () => {
        expect(slotVolume('nimportequoi', 100, DEFAULT_VOLUMES)).toBe(0);
    });
});
