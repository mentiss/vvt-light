// src/client/src/tools/mediaLinks.js
// ─────────────────────────────────────────────────────────────────────────────
// Lien collé dans le panneau de la musique (documentations/spec_audio.md §14.3,
// §14.3 bis) : YouTube (vidéo ou playlist), Vimeo ou SoundCloud. Fonction pure, testée.
//
// Le client ne fait que reconnaître la source pour choisir la voie (videoIds pour
// YouTube, links pour le reste) et ignorer le texte qui n'est pas un lien de musique ;
// le serveur reste seul juge (utils/audioSources.js) et refuse avec son message.
// Un lien Suno est reconnu pour que le serveur explique pourquoi il le refuse.
// ─────────────────────────────────────────────────────────────────────────────

import { parseYouTubeLink } from './youtubeApi.js';

// Libellés des sources, pour la pastille de la bibliothèque (V-9)
export const SOURCE_LABELS = { youtube: 'YouTube', vimeo: 'Vimeo', soundcloud: 'SoundCloud' };

const HOSTS = {
    vimeo: ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'],
    soundcloud: ['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com', 'on.soundcloud.com'],
    suno: ['suno.com', 'www.suno.com', 'app.suno.ai', 'suno.ai'],
};

/**
 * @param {string} input
 * @returns {{ source: 'youtube', videoId: string|null, listId: string|null }
 *         | { source: 'vimeo'|'soundcloud'|'suno', url: string } | null} null si ce n'est pas un lien de musique
 *   (suno : envoyé au serveur, qui le refuse en expliquant)
 */
export function parseMediaLink(input) {
    const youtube = parseYouTubeLink(input);
    if (youtube) return { source: 'youtube', ...youtube };

    let url;
    try {
        url = new URL(String(input ?? '').trim());
    } catch {
        return null;
    }
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    const source = Object.keys(HOSTS).find(key => HOSTS[key].includes(host));
    return source ? { source, url: url.href } : null;
}
