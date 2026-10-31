// Bibliothèque audio côté client : durée lisible, recherche, emplacement (spec_audio.md §11.13, §11.14)
import { describe, it, expect } from 'vitest';
import { formatTime, normalizeQuery, titleMatches, findPlaylist, newestPlaylist, displayedTracks } from '../../src/tools/audioLibrary.js';

const library = [
    { id: 1, name: 'Campagne', playlists: [
        { id: 11, name: 'Taverne', tracks: [{ id: 101, title: 'Chant d’hiver' }, { id: 102, title: 'Ballade du Skalde' }] },
        { id: 12, name: 'Mer', tracks: [{ id: 103, title: 'Brume sur le fjord' }] },
    ] },
    { id: 2, name: 'Ambiances', playlists: [{ id: 21, name: 'Pluie', tracks: [{ id: 201, title: 'Pluie forte' }] }] },
];

describe('formatTime', () => {
    it('affiche minutes et secondes, puis les heures au-delà d’une heure', () => {
        expect(formatTime(227)).toBe('3:47');
        expect(formatTime(6085)).toBe('1:41:25');
        expect(formatTime(5)).toBe('0:05');
        expect(formatTime(null)).toBe('0:00');
    });
});

describe('recherche', () => {
    it('ignore la casse et les accents', () => {
        expect(titleMatches('Chant d’hiver', normalizeQuery('HIVER'))).toBe(true);
        expect(titleMatches('Brume sur le fjord', normalizeQuery('brumé'))).toBe(true);
        expect(titleMatches('Ballade du Skalde', normalizeQuery('drakkar'))).toBe(false);
    });

    it('une recherche vide ne correspond à rien', () => {
        expect(titleMatches('Pluie forte', normalizeQuery('   '))).toBe(false);
    });
});

describe('displayedTracks', () => {
    it('donne les titres de la playlist ouverte', () => {
        expect(displayedTracks(library, { playlistId: 11 }, '').map(t => t.id)).toEqual([101, 102]);
        expect(displayedTracks(library, { collectionId: 1, playlistId: null }, '')).toEqual([]);
    });

    it('en recherche, cherche dans toute la bibliothèque', () => {
        expect(displayedTracks(library, { playlistId: 11 }, 'pluie').map(t => t.id)).toEqual([201]);
    });
});

describe('emplacement', () => {
    it('retrouve une playlist et sa collection', () => {
        expect(findPlaylist(library, 21)).toMatchObject({ collection: { id: 2 }, playlist: { id: 21 } });
        expect(findPlaylist(library, 99)).toBeNull();
    });

    it('donne la playlist la plus récente (celle qu’un ajout vient de créer)', () => {
        expect(newestPlaylist(library).id).toBe(21);
        expect(newestPlaylist([])).toBeNull();
    });
});
