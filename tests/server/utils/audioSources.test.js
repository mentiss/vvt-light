// tests/server/utils/audioSources.test.js
// Liens de la musique hors YouTube (spec_audio.md §14.3, §14.3 bis) : Vimeo et
// SoundCloud reconnus, Suno refusé avec son explication, fichiers son hébergés
// laissés de côté (refusés comme lien inconnu).

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseLink, LinkError } = require('../../../src/server/utils/audioSources.js');

const refused = (link) => {
    try { parseLink(link); } catch (error) { return error instanceof LinkError ? error.message : 'autre erreur'; }
    return null;
};

describe('parseLink', () => {
    it('reconnaît Vimeo, y compris une vidéo non répertoriée', () => {
        expect(parseLink('https://vimeo.com/76979871')).toEqual({ source: 'vimeo', url: 'https://vimeo.com/76979871' });
        expect(parseLink('https://vimeo.com/76979871/abc123')).toEqual({ source: 'vimeo', url: 'https://vimeo.com/76979871/abc123' });
        expect(parseLink('https://player.vimeo.com/video/76979871?h=abc123')).toEqual({ source: 'vimeo', url: 'https://vimeo.com/76979871/abc123' });
    });

    it('reconnaît SoundCloud', () => {
        expect(parseLink('https://soundcloud.com/forss/flickermood?si=x')).toEqual({ source: 'soundcloud', url: 'https://soundcloud.com/forss/flickermood' });
        expect(parseLink('https://on.soundcloud.com/AbCd')).toEqual({ source: 'soundcloud', url: 'https://on.soundcloud.com/AbCd' });
    });

    it('refuse Suno avec son explication', () => {
        expect(refused('https://suno.com/s/7sk5nX6wBBRG16VD')).toMatch(/Suno ne permet pas/);
        expect(refused('https://suno.com/embed/e4e0eba3-aa25-4934-9aa0-3d4646653b4a')).toMatch(/Suno ne permet pas/);
    });

    it('refuse les playlists hors YouTube, les fichiers son hébergés, le http et les liens inconnus', () => {
        expect(refused('https://soundcloud.com/forss/sets/album')).toMatch(/playlists/);
        expect(refused('https://vimeo.com/showcase/123')).toMatch(/playlists/);
        expect(refused('https://archive.org/download/x/pluie.mp3')).toMatch(/non reconnu/);
        expect(refused('https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view')).toMatch(/non reconnu/);
        expect(refused('http://vimeo.com/76979871')).toMatch(/non reconnu/);
        expect(refused('pas un lien')).toMatch(/non reconnu/);
    });
});
