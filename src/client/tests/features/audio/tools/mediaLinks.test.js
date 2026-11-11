// Lien collé dans le panneau de la musique (spec_audio.md §14.3, §14.3 bis)
import { describe, it, expect } from 'vitest';
import { parseMediaLink } from '@/features/audio/tools/mediaLinks.js';

describe('parseMediaLink', () => {
    it('YouTube passe par parseYouTubeLink (vidéo ou playlist)', () => {
        expect(parseMediaLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({ source: 'youtube', videoId: 'dQw4w9WgXcQ', listId: null });
        expect(parseMediaLink('https://youtube.com/playlist?list=PL123abc')).toMatchObject({ source: 'youtube', listId: 'PL123abc' });
    });

    it('reconnaît Vimeo, SoundCloud et Suno (refusé ensuite par le serveur)', () => {
        expect(parseMediaLink('https://vimeo.com/76979871')).toEqual({ source: 'vimeo', url: 'https://vimeo.com/76979871' });
        expect(parseMediaLink('https://soundcloud.com/forss/flickermood').source).toBe('soundcloud');
        expect(parseMediaLink(' https://suno.com/s/7sk5nX6wBBRG16VD ').source).toBe('suno');
    });

    it('ignore ce qui n\'est pas un lien de musique, fichiers son hébergés compris', () => {
        expect(parseMediaLink('bonjour')).toBeNull();
        expect(parseMediaLink('https://example.com/page')).toBeNull();
        expect(parseMediaLink('https://archive.org/download/x/son.mp3')).toBeNull();
        expect(parseMediaLink('http://vimeo.com/76979871')).toBeNull();
        expect(parseMediaLink('')).toBeNull();
    });
});
