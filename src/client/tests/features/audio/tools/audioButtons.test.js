// Boutons de la musique piste par piste (spec_audio.md §15.3, §15.4, §15.7)
import { describe, it, expect } from 'vitest';
import {
    emptyDraft, draftFromActions, draftFromState, draftFromTarget, slotsFromDraft, buttonSummary,
} from '@/features/audio/tools/audioButtons.js';

describe('draftFromActions', () => {
    it('piste absente = Ne pas toucher, null = Arrêter, entrée = Lancer', () => {
        const draft = draftFromActions({ slots: { music: { trackId: 12, playlistId: 3, mode: 'loop', start: 83 }, ambience1: null } });
        expect(draft.music).toEqual({ op: 'play', trackId: 12, playlistId: null, mode: 'loop', startText: '1:23' });
        expect(draft.ambience1.op).toBe('stop');
        expect(draft.ambience2.op).toBe('keep');
        expect(draft.effect.op).toBe('keep');
    });

    it('une playlist garde son mode ; sans mode, « Mode en cours »', () => {
        const draft = draftFromActions({ slots: { music: { playlistId: 3, mode: 'shuffle' }, ambience1: { trackId: 5, playlistId: 3 } } });
        expect(draft.music).toMatchObject({ op: 'play', trackId: null, playlistId: 3, mode: 'shuffle' });
        expect(draft.ambience1.mode).toBeNull();
    });
});

describe('draftFromState et draftFromTarget', () => {
    it('ce qui joue : chaque piste avec un morceau dans son mode, les autres arrêtées', () => {
        const draft = draftFromState({ music: { trackId: 4, mode: 'loop' }, ambience1: { trackId: null }, effect: {} });
        expect(draft.music).toMatchObject({ op: 'play', trackId: 4, mode: 'loop' });
        expect(draft.ambience1.op).toBe('stop');
        expect(draft.ambience2.op).toBe('stop');
        expect(draft.effect.op).toBe('stop');
    });

    it('depuis la bibliothèque : la piste choisie lancée, les autres intactes ; une playlist ne va pas sur l\'effet', () => {
        const track = draftFromTarget({ kind: 'track', trackId: 9, slot: 'ambience2' });
        expect(track.ambience2).toMatchObject({ op: 'play', trackId: 9, mode: null });
        expect(track.music.op).toBe('keep');
        const playlist = draftFromTarget({ kind: 'playlist', playlistId: 3, slot: 'effect' });
        expect(playlist.music).toMatchObject({ op: 'play', playlistId: 3, mode: 'playlist' });
        expect(playlist.effect.op).toBe('keep');
    });
});

describe('slotsFromDraft', () => {
    it('Ne pas toucher absent, Arrêter null, Lancer avec contenu, mode et timecode', () => {
        const draft = emptyDraft();
        draft.music = { op: 'play', trackId: 12, playlistId: null, mode: 'loop', startText: '1:23' };
        draft.ambience1 = { ...draft.ambience1, op: 'stop' };
        expect(slotsFromDraft(draft)).toEqual({ slots: { music: { trackId: 12, mode: 'loop', start: 83 }, ambience1: null } });
    });

    it('aller-retour : un bouton relu puis renvoyé ne change pas', () => {
        const actions = { slots: { music: { trackId: 12, playlistId: 3, start: 30 }, ambience2: { playlistId: 4, mode: 'playlist' }, effect: null } };
        expect(slotsFromDraft(draftFromActions(actions))).toEqual({
            slots: { music: { trackId: 12, start: 30 }, ambience2: { playlistId: 4, mode: 'playlist' }, effect: null },
        });
    });

    it('pas de timecode au hasard, ni à 0', () => {
        const draft = emptyDraft();
        draft.music = { op: 'play', trackId: 12, playlistId: null, mode: 'shuffle', startText: '1:00' };
        draft.ambience1 = { op: 'play', trackId: 13, playlistId: null, mode: null, startText: '0:00' };
        expect(slotsFromDraft(draft)).toEqual({ slots: { music: { trackId: 12, mode: 'shuffle' }, ambience1: { trackId: 13 } } });
    });

    it('refuse un bouton sans piste lancée, un Lancer sans contenu, un timecode illisible', () => {
        const draft = emptyDraft();
        draft.music = { ...draft.music, op: 'stop' };
        expect(slotsFromDraft(draft).error).toMatch(/au moins une piste/);
        draft.music = { ...draft.music, op: 'play' };
        expect(slotsFromDraft(draft).error).toMatch(/Musique : choisissez/);
        draft.music = { op: 'play', trackId: 12, playlistId: null, mode: null, startText: 'abc' };
        expect(slotsFromDraft(draft).error).toMatch(/timecode illisible/);
    });
});

describe('buttonSummary', () => {
    it('les pistes lancées, puis « en fondu »', () => {
        expect(buttonSummary({ slots: { music: { trackId: 1 }, ambience1: null, ambience2: { trackId: 2 } } })).toBe('Musique, Ambiance 2');
        expect(buttonSummary({ fade: true, slots: { music: { trackId: 1 } } })).toBe('Musique · en fondu');
    });
});
