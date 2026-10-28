// Synchronisation du lecteur local sur l'état du serveur (spec_audio.md §9.3, §9.6)
import { describe, it, expect } from 'vitest';
import { clockSample, bestOffset, expectedPosition, planSync } from '../../../src/components/audio/audioSync.js';

const playing = { status: 'playing', youtubeId: 'aaaaaaaaaaa', position: 10, refTime: 100_000, duration: 200 };

describe('horloge', () => {
    it('mesure l\'écart au milieu de l\'aller-retour', () => {
        // Envoi à 1000, réponse du serveur 5050, reçue à 1100 : serveur en avance de 4000 ms
        expect(clockSample(1000, 5050, 1100)).toEqual({ offset: 4000, rtt: 100 });
    });

    it('retient l\'échantillon au plus court aller-retour', () => {
        expect(bestOffset([{ offset: 4100, rtt: 300 }, { offset: 4000, rtt: 40 }, { offset: 3900, rtt: 120 }])).toBe(4000);
        expect(bestOffset([])).toBe(0);
    });
});

describe('expectedPosition', () => {
    it('avance avec le temps en lecture, reste fixe en pause', () => {
        expect(expectedPosition(playing, 105_000)).toBe(15);
        expect(expectedPosition({ ...playing, status: 'paused' }, 105_000)).toBe(10);
    });

    it('s\'arrête à la durée connue', () => {
        expect(expectedPosition(playing, 500_000)).toBe(200);
        expect(expectedPosition({ ...playing, duration: null }, 500_000)).toBe(410);
    });
});

describe('planSync', () => {
    const at = (overrides) => planSync({ state: playing, serverNow: 105_000, loadedId: playing.youtubeId, playerState: 'playing', currentTime: 15, ...overrides });

    it('ne fait rien quand le lecteur est dans la tolérance', () => {
        expect(at({ currentTime: 15.8 })).toEqual({ type: 'none', drift: expect.closeTo(0.8) });
    });

    it('recale au-delà de la tolérance, en avance comme en retard', () => {
        expect(at({ currentTime: 12 })).toMatchObject({ type: 'seek', position: 15 });
        expect(at({ currentTime: 18 })).toMatchObject({ type: 'seek', position: 15 });
        expect(at({ currentTime: 16, threshold: 0.5 })).toMatchObject({ type: 'seek' });
    });

    it('charge la vidéo du serveur, lancée ou non selon son statut', () => {
        expect(at({ loadedId: 'bbbbbbbbbbb' })).toEqual({ type: 'load', position: 15, autoplay: true });
        expect(at({ loadedId: null, state: { ...playing, status: 'paused' } })).toEqual({ type: 'load', position: 10, autoplay: false });
    });

    it('relance un lecteur arrêté ou en pause (arrivée tardive, fin de pub)', () => {
        expect(at({ playerState: 'paused', currentTime: 3 })).toMatchObject({ type: 'play', position: 15 });
        expect(at({ playerState: 'cued', currentTime: 0 })).toMatchObject({ type: 'play', position: 15 });
    });

    it('attend pendant la mise en mémoire tampon', () => {
        expect(at({ playerState: 'buffering', currentTime: 2 })).toMatchObject({ type: 'none' });
    });

    it('met en pause et cale la position quand le serveur est en pause', () => {
        const paused = { ...playing, status: 'paused' };
        expect(at({ state: paused, currentTime: 14 })).toMatchObject({ type: 'pause', position: 10 });
        expect(at({ state: paused, playerState: 'paused', currentTime: 10.4 })).toMatchObject({ type: 'none' });
        expect(at({ state: paused, playerState: 'paused', currentTime: 30 })).toMatchObject({ type: 'seek', position: 10 });
    });

    it('arrête la lecture locale quand le serveur est arrêté', () => {
        const stopped = { status: 'stopped', youtubeId: null };
        expect(at({ state: stopped })).toEqual({ type: 'stop' });
        expect(at({ state: stopped, playerState: 'paused' })).toEqual({ type: 'none' });
    });

    it('ne relance pas une vidéo finie localement, sauf retour en arrière du serveur', () => {
        expect(at({ playerState: 'ended', currentTime: 15.5 })).toMatchObject({ type: 'none' });
        expect(at({ playerState: 'ended', currentTime: 200 })).toMatchObject({ type: 'play', position: 15 });
    });
});
