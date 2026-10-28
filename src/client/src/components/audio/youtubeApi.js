// src/client/src/components/audio/youtubeApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Accès à l'IFrame API de YouTube (documentations/spec_audio.md §9.6).
//
// - parseYouTubeLink : extrait l'identifiant de vidéo et / ou de playlist d'un
//   lien collé par le MJ (fonction pure, testée sous Vitest).
// - loadYouTubeApi : charge une seule fois le script de l'API et renvoie window.YT.
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const LIST_ID  = /^[A-Za-z0-9_-]{2,64}$/;

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];

/**
 * Lit un lien YouTube (ou un identifiant de vidéo seul).
 *
 * @param {string} input
 * @returns {{ videoId: string|null, listId: string|null } | null} null si rien d'exploitable
 */
export function parseYouTubeLink(input) {
    const text = String(input ?? '').trim();
    if (!text) return null;
    if (VIDEO_ID.test(text)) return { videoId: text, listId: null };

    let url;
    try {
        url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase();
    let videoId = null;

    if (host === 'youtu.be') {
        videoId = url.pathname.split('/')[1] ?? null;
    } else if (YOUTUBE_HOSTS.includes(host)) {
        const [first, second] = url.pathname.split('/').filter(Boolean);
        if (first === 'watch') videoId = url.searchParams.get('v');
        else if (['shorts', 'embed', 'live', 'v'].includes(first)) videoId = second ?? null;
    } else {
        return null;
    }

    const list = url.searchParams.get('list');
    const result = {
        videoId: videoId && VIDEO_ID.test(videoId) ? videoId : null,
        listId:  list && LIST_ID.test(list) ? list : null,
    };
    return result.videoId || result.listId ? result : null;
}

let apiPromise = null;

/**
 * Charge le script de l'IFrame API (une seule fois par page).
 *
 * @returns {Promise<typeof window.YT>}
 */
export function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve, reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve(window.YT);
        };

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
            apiPromise = null;
            reject(new Error('YouTube IFrame API unavailable'));
        };
        document.head.appendChild(script);
    });
    return apiPromise;
}
