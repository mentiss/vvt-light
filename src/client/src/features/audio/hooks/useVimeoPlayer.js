// src/client/src/features/audio/hooks/useVimeoPlayer.js
// ─────────────────────────────────────────────────────────────────────────────
// Lecteur Vimeo caché (Player SDK officiel), source « vimeo » de la musique
// (documentations/spec_audio.md §14.3). Même interface que le lecteur YouTube, celle
// dont SlotPlayer se sert : getPlayerState (codes de l'IFrame API), getCurrentTime,
// getDuration, loadVideoById / cueVideoById ({ videoId, startSeconds }), seekTo,
// playVideo, pauseVideo, stopVideo, setVolume (0-100). videoId est l'adresse de la vidéo.
//
// Le SDK répond par promesses : position, durée et état sont tenus à jour par ses
// événements, pour que la synchronisation les lise tout de suite. Le lecteur Vimeo
// ne se crée qu'avec une vidéo : il naît au premier chargement.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { loadVimeoApi } from '../tools/mediaApis.js';

const STATE = { unstarted: -1, ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5 };

/**
 * @param {{ width?: number, height?: number }} [size] taille du cadre en px
 * @returns {{ containerRef: object, player: object|null, error: number|null }}
 */
export function useVimeoPlayer({ width = 1, height = 1 } = {}) {
    const containerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        let cancelled = false;
        let instance = null;
        let state = STATE.unstarted;
        let time = 0;
        let duration = 0;
        let request = 0;   // dernier chargement demandé : une réponse plus ancienne est ignorée
        let volumeLevel = 1;   // réglé avant que le lecteur existe : appliqué à sa création

        const fail = (err) => {
            if (cancelled) return;
            console.warn('[useVimeoPlayer]', err?.name ?? err);
            setError(1);
        };

        const bind = (vimeo) => {
            vimeo.on('playing', () => { state = STATE.playing; setError(null); });
            vimeo.on('pause', () => { if (state !== STATE.ended) state = STATE.paused; });
            vimeo.on('ended', () => { state = STATE.ended; });
            vimeo.on('bufferstart', () => { state = STATE.buffering; });
            vimeo.on('bufferend', () => { if (state === STATE.buffering) state = STATE.playing; });
            vimeo.on('timeupdate', (data) => { time = data.seconds; if (data.duration > 0) duration = data.duration; });
            vimeo.on('error', fail);
        };

        const load = async (Vimeo, url, start, autoplay) => {
            const id = ++request;
            setError(null);
            state = autoplay ? STATE.buffering : STATE.cued;
            time = start || 0;
            duration = 0;
            try {
                if (!instance) {
                    const target = document.createElement('div');
                    container.appendChild(target);
                    // autopause coupé : sinon un second lecteur Vimeo (autre piste) met celui-ci en pause
                    instance = new Vimeo.Player(target, { url, width, height, controls: false, autoplay: false, autopause: false, dnt: true });
                    bind(instance);
                    await instance.ready();
                    await instance.setVolume(volumeLevel);
                } else {
                    await instance.loadVideo(url);
                }
                if (cancelled || id !== request) return;
                const total = await instance.getDuration();
                if (total > 0) duration = total;
                if (start) await instance.setCurrentTime(start);
                if (autoplay) await instance.play().catch(() => { state = STATE.paused; });
            } catch (err) {
                if (id === request) fail(err);
            }
        };

        loadVimeoApi()
            .then(Vimeo => {
                if (cancelled) return;
                setPlayer({
                    getPlayerState: () => state,
                    getCurrentTime: () => time,
                    getDuration: () => duration,
                    loadVideoById: ({ videoId, startSeconds }) => { load(Vimeo, videoId, startSeconds, true); },
                    cueVideoById: ({ videoId, startSeconds }) => { load(Vimeo, videoId, startSeconds, false); },
                    seekTo: (seconds) => { time = seconds; instance?.setCurrentTime(seconds).catch(() => {}); },
                    playVideo: () => { instance?.play().catch(() => { state = STATE.paused; }); },
                    pauseVideo: () => { instance?.pause().catch(() => {}); },
                    stopVideo: () => { instance?.pause().catch(() => {}); state = STATE.unstarted; },
                    setVolume: (volume) => {
                        volumeLevel = Math.min(1, Math.max(0, volume / 100));
                        instance?.setVolume(volumeLevel).catch(() => {});
                    },
                });
            })
            .catch(fail);

        return () => {
            cancelled = true;
            instance?.destroy().catch(() => {});
            container.innerHTML = '';
            setPlayer(null);
        };
    }, [width, height]);

    return { containerRef, player, error };
}
