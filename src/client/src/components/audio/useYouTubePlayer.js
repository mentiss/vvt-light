// src/client/src/components/audio/useYouTubePlayer.js
// ─────────────────────────────────────────────────────────────────────────────
// Crée un lecteur YouTube (IFrame API) dans le conteneur fourni et suit son état.
// Base du lecteur caché de la brique audio (documentations/spec_audio.md §9.6).
//
// Le lecteur remplace un nœud créé à la main dans le conteneur, jamais un nœud
// rendu par React : YouTube y substitue son <iframe>.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { loadYouTubeApi } from './youtubeApi.js';

// Codes d'état de l'IFrame API, en clair
export const PLAYER_STATES = { '-1': 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued' };

/**
 * @param {{ width?: number, height?: number }} [size] taille du lecteur en px (0 : caché)
 * @returns {{ containerRef: object, player: object|null, state: string, error: number|null }}
 */
export function useYouTubePlayer({ width = 0, height = 0 } = {}) {
    const containerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [state, setState]   = useState('loading');
    const [error, setError]   = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let instance = null;
        let cancelled = false;
        const target = document.createElement('div');
        container.appendChild(target);

        loadYouTubeApi()
            .then(YT => {
                if (cancelled) return;
                instance = new YT.Player(target, {
                    width,
                    height,
                    playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: window.location.origin },
                    events: {
                        onReady:       () => { if (!cancelled) { setPlayer(instance); setState('ready'); } },
                        onStateChange: (e) => { if (!cancelled) { setState(PLAYER_STATES[e.data] ?? String(e.data)); setError(null); } },
                        onError:       (e) => { if (!cancelled) setError(e.data); },
                    },
                });
            })
            .catch(() => { if (!cancelled) setState('api-error'); });

        return () => {
            cancelled = true;
            instance?.destroy?.();
            container.innerHTML = '';
            setPlayer(null);
            setState('loading');
        };
    }, [width, height]);

    return { containerRef, player, state, error };
}
