// src/client/src/tools/mediaApis.js
// ─────────────────────────────────────────────────────────────────────────────
// Scripts officiels des lecteurs Vimeo et SoundCloud (documentations/spec_audio.md
// §14.3), chargés à la demande, une seule fois par page, comme l'API YouTube
// (tools/youtubeApi.js). Aucune dépendance npm.
// ─────────────────────────────────────────────────────────────────────────────

const pending = new Map();

/** Charge un script une fois ; résout avec `getGlobal()` quand il est prêt. */
function loadScriptOnce(src, getGlobal) {
    const ready = getGlobal();
    if (ready) return Promise.resolve(ready);
    if (pending.has(src)) return pending.get(src);

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => (getGlobal() ? resolve(getGlobal()) : reject(new Error(`${src}: API missing`)));
        script.onerror = () => {
            pending.delete(src);
            reject(new Error(`${src} unavailable`));
        };
        document.head.appendChild(script);
    });
    pending.set(src, promise);
    return promise;
}

/** Player SDK de Vimeo : window.Vimeo.Player */
export const loadVimeoApi = () => loadScriptOnce('https://player.vimeo.com/api/player.js', () => window.Vimeo?.Player && window.Vimeo);

/** Widget API de SoundCloud : window.SC.Widget */
export const loadSoundCloudApi = () => loadScriptOnce('https://w.soundcloud.com/player/api.js', () => window.SC?.Widget && window.SC);
