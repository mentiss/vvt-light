// Extraction des identifiants d'un lien YouTube (spec_audio.md §9.4, Q-21, Q-22)
import { describe, it, expect } from 'vitest';
import { parseYouTubeLink } from '../../../src/components/audio/youtubeApi.js';

const ID = 'dQw4w9WgXcQ';
const LIST = 'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG';

describe('parseYouTubeLink', () => {
    it('lit les liens de vidéo usuels', () => {
        for (const link of [
            `https://www.youtube.com/watch?v=${ID}`,
            `https://youtube.com/watch?v=${ID}&t=42s`,
            `https://m.youtube.com/watch?v=${ID}`,
            `https://music.youtube.com/watch?v=${ID}`,
            `https://youtu.be/${ID}`,
            `https://youtu.be/${ID}?si=abc`,
            `https://www.youtube.com/shorts/${ID}`,
            `https://www.youtube.com/embed/${ID}`,
            `www.youtube.com/watch?v=${ID}`,
            ID,
        ]) {
            expect(parseYouTubeLink(link)).toEqual({ videoId: ID, listId: null });
        }
    });

    it('lit une playlist, seule ou avec une vidéo', () => {
        expect(parseYouTubeLink(`https://www.youtube.com/playlist?list=${LIST}`)).toEqual({ videoId: null, listId: LIST });
        expect(parseYouTubeLink(`https://www.youtube.com/watch?v=${ID}&list=${LIST}&index=3`)).toEqual({ videoId: ID, listId: LIST });
        expect(parseYouTubeLink(`https://youtu.be/${ID}?list=${LIST}`)).toEqual({ videoId: ID, listId: LIST });
    });

    it('refuse ce qui n\'est pas un lien YouTube exploitable', () => {
        for (const link of ['', '   ', null, 'bonjour', 'https://vimeo.com/123456', 'https://www.youtube.com/', 'https://www.youtube.com/watch?v=court', 'https://evil.com/watch?v=dQw4w9WgXcQ']) {
            expect(parseYouTubeLink(link)).toBeNull();
        }
    });
});
