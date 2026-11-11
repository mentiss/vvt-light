// src/server/utils/audioSources.js
// ─────────────────────────────────────────────────────────────────────────────
// Sources de la musique hors YouTube (documentations/spec_audio.md §14.3, §14.3 bis) :
// Vimeo et SoundCloud. Son seul. Suno est refusé avec une explication : ses
// fichiers sont encodés et son lecteur intégré ne se pilote pas. Les fichiers son
// hébergés (lien direct, Drive, Dropbox) sont laissés de côté (décision du MJ,
// 2026-11-11 ; Drive interdit d'ailleurs la lecture depuis un autre site).
//
// - parseLink : reconnaît un lien (fonction pure, testée).
// - resolveLink : titre, identifiant à enregistrer (media_id) et durée si connue,
//   par l'oEmbed de vimeo.com ou de soundcloud.com.
//
// Les erreurs (LinkError) portent un message en français, affiché tel quel au MJ.
// ─────────────────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 8000;

const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
const SOUNDCLOUD_HOSTS = ['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com', 'on.soundcloud.com'];
const SUNO_HOSTS = ['suno.com', 'www.suno.com', 'app.suno.ai', 'suno.ai'];

const UNKNOWN = 'Lien non reconnu : YouTube, Vimeo ou SoundCloud';
const PLAYLIST_ONLY_YOUTUBE = 'Les playlists ne s\'importent que depuis YouTube';
const SUNO_REFUSED = 'Suno ne permet pas la lecture de ses morceaux hors de son site';

class LinkError extends Error {}

/**
 * Lit un lien hors YouTube.
 *
 * @param {string} text
 * @returns {{ source: 'vimeo'|'soundcloud', url: string }} url normalisée
 * @throws {LinkError} lien non reconnu, playlist hors YouTube, Suno
 */
function parseLink(text) {
    let url;
    try {
        url = new URL(String(text ?? '').trim());
    } catch {
        throw new LinkError(UNKNOWN);
    }
    if (url.protocol !== 'https:') throw new LinkError(UNKNOWN);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);

    if (VIMEO_HOSTS.includes(host)) {
        if (['showcase', 'album', 'channels', 'groups'].includes(parts[0])) throw new LinkError(PLAYLIST_ONLY_YOUTUBE);
        // vimeo.com/<id>[/<hash>] ou player.vimeo.com/video/<id>?h=<hash>
        const [id, hash] = host === 'player.vimeo.com' ? [parts[1], url.searchParams.get('h')] : [parts[0], parts[1]];
        if (!/^\d+$/.test(id ?? '')) throw new LinkError(UNKNOWN);
        const safeHash = hash && /^[0-9a-f]+$/i.test(hash) ? hash : null;
        return { source: 'vimeo', url: `https://vimeo.com/${id}${safeHash ? `/${safeHash}` : ''}` };
    }

    if (SOUNDCLOUD_HOSTS.includes(host)) {
        if (parts.includes('sets')) throw new LinkError(PLAYLIST_ONLY_YOUTUBE);
        // soundcloud.com/<artiste>/<titre>[/<jeton privé>], ou lien court on.soundcloud.com/<code>
        if (host === 'on.soundcloud.com' ? parts.length !== 1 : parts.length < 2) throw new LinkError(UNKNOWN);
        return { source: 'soundcloud', url: `https://${host === 'on.soundcloud.com' ? host : 'soundcloud.com'}/${parts.join('/')}` };
    }

    if (SUNO_HOSTS.includes(host)) throw new LinkError(SUNO_REFUSED);
    throw new LinkError(UNKNOWN);
}

/** Texte d'un attribut HTML décodé (entités courantes). */
function decodeHtml(text) {
    return text
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

async function fetchJson(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    return res.ok ? res.json() : null;
}

/**
 * Résout un lien hors YouTube.
 *
 * @param {string} text
 * @returns {Promise<{ source: string, mediaId: string, title: string, duration: number|null }>}
 * @throws {LinkError}
 */
async function resolveLink(text) {
    const { source, url } = parseLink(text);
    try {
        if (source === 'vimeo') {
            const data = await fetchJson(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
            if (!data?.title) throw new LinkError('Vidéo Vimeo introuvable, privée ou interdite d\'intégration');
            const duration = Number(data.duration);
            return { source, mediaId: url, title: data.title.trim(), duration: duration > 0 ? duration : null };
        }

        // SoundCloud : le lecteur intégré vise l'adresse api.soundcloud.com/tracks/<id> (jeton privé compris)
        const data = await fetchJson(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
        const src = data?.html?.match(/src="([^"]+)"/)?.[1];
        const apiUrl = src ? new URL(decodeHtml(src)).searchParams.get('url') : null;
        if (!data?.title || !apiUrl?.startsWith('https://api.soundcloud.com/tracks/')) throw new LinkError('Titre SoundCloud introuvable ou privé');
        return { source, mediaId: apiUrl, title: data.title.trim(), duration: null };
    } catch (error) {
        if (error instanceof LinkError) throw error;
        throw new LinkError('Plateforme injoignable, réessaie dans un instant');
    }
}

module.exports = { parseLink, resolveLink, LinkError };
