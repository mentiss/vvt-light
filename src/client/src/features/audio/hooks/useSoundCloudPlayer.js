// src/client/src/features/audio/hooks/useSoundCloudPlayer.js
// ─────────────────────────────────────────────────────────────────────────────
// Lecteur SoundCloud caché (Widget API officielle), source « soundcloud » de la
// musique (documentations/spec_audio.md §14.3). Même interface que le lecteur YouTube
// (voir useVimeoPlayer.js) ; videoId est l'adresse api.soundcloud.com/tracks/<id>.
//
// Le widget répond par rappels et compte en millisecondes : position, durée et état
// sont tenus à jour par ses événements. Il ne saute à une position qu'une fois le
// son lancé : un saut demandé avant attend l'événement de lecture.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { loadSoundCloudApi } from '../tools/mediaApis.js';

const STATE = { unstarted: -1, ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5 };

// single_active=false : sinon un second widget SoundCloud (autre piste) met celui-ci en pause
const widgetSrc = (url) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&single_active=false&visual=false&show_artwork=false`;

/**
 * @returns {{ containerRef: object, player: object|null, error: number|null }}
 */
export function useSoundCloudPlayer() {
    const containerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        let cancelled = false;
        let widget = null;
        let state = STATE.unstarted;
        let time = 0;
        let duration = 0;
        let pendingSeek = null;   // en secondes
        let volumeLevel = 100;    // réglé avant que le widget existe : appliqué à son chargement

        const readDuration = () => widget?.getDuration(ms => { if (ms > 0) duration = ms / 1000; });
        const afterLoad = (start, autoplay) => {
            readDuration();
            widget.setVolume(volumeLevel);
            pendingSeek = start || null;
            if (autoplay) widget.play();
        };

        const load = (SC, url, start, autoplay) => {
            setError(null);
            state = autoplay ? STATE.buffering : STATE.cued;
            time = start || 0;
            duration = 0;
            if (!widget) {
                const iframe = document.createElement('iframe');
                Object.assign(iframe, { width: 1, height: 1, src: widgetSrc(url) });
                iframe.setAttribute('allow', 'autoplay');
                iframe.setAttribute('title', 'Lecteur SoundCloud');
                container.appendChild(iframe);
                widget = SC.Widget(iframe);
                const { Events } = SC.Widget;
                // READY revient à chaque chargement : seul le premier passe par ici (les suivants
                // par le rappel de widget.load), sinon les réglages du premier titre s'appliqueraient aux autres
                let firstReady = true;
                widget.bind(Events.READY, () => {
                    if (cancelled || !firstReady) return;
                    firstReady = false;
                    afterLoad(start, autoplay);
                });
                widget.bind(Events.PLAY, () => {
                    state = STATE.playing;
                    setError(null);
                    readDuration();
                    if (pendingSeek !== null) { widget.seekTo(pendingSeek * 1000); pendingSeek = null; }
                });
                widget.bind(Events.PAUSE, () => { if (state !== STATE.ended) state = STATE.paused; });
                widget.bind(Events.FINISH, () => { state = STATE.ended; });
                widget.bind(Events.PLAY_PROGRESS, (e) => { time = (e?.currentPosition ?? 0) / 1000; });
                widget.bind(Events.ERROR, () => { if (!cancelled) setError(1); });
                return;
            }
            widget.load(url, { auto_play: false, single_active: false, callback: () => { if (!cancelled) afterLoad(start, autoplay); } });
        };

        loadSoundCloudApi()
            .then(SC => {
                if (cancelled) return;
                setPlayer({
                    getPlayerState: () => state,
                    getCurrentTime: () => (pendingSeek ?? time),
                    getDuration: () => duration,
                    loadVideoById: ({ videoId, startSeconds }) => load(SC, videoId, startSeconds, true),
                    cueVideoById: ({ videoId, startSeconds }) => load(SC, videoId, startSeconds, false),
                    seekTo: (seconds) => {
                        if (state === STATE.playing || state === STATE.paused) { time = seconds; widget?.seekTo(seconds * 1000); }
                        else pendingSeek = seconds;
                    },
                    playVideo: () => widget?.play(),
                    pauseVideo: () => widget?.pause(),
                    stopVideo: () => { widget?.pause(); state = STATE.unstarted; },
                    setVolume: (volume) => {
                        volumeLevel = Math.min(100, Math.max(0, volume));
                        widget?.setVolume(volumeLevel);
                    },
                });
            })
            .catch(() => { if (!cancelled) setError(1); });

        return () => {
            cancelled = true;
            container.innerHTML = '';
            setPlayer(null);
        };
    }, []);

    return { containerRef, player, error };
}
