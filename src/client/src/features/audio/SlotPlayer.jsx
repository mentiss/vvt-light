// src/client/src/features/audio/SlotPlayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lecteur caché d'une piste (documentations/spec_audio.md §11.7, §14.3) : monté
// seulement quand la piste a un contenu (une piste vide ne crée pas de cadre).
// Se recale sur l'état du serveur avec audioSync.js, la boucle validée par le
// prototype (§9.9, §10.1). Côté MJ, remonte la durée et les erreurs.
//
// Un lecteur par source (YouTube, Vimeo, SoundCloud), tous avec l'interface du
// lecteur YouTube. AudioLayer donne à chaque
// SlotPlayer une clé faite de la piste et de la source : la source d'une instance
// ne change jamais, donc le hook appelé non plus.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef } from 'react';
import { useYouTubePlayer, PLAYER_STATES } from './hooks/useYouTubePlayer.js';
import { useVimeoPlayer } from './hooks/useVimeoPlayer.js';
import { useSoundCloudPlayer } from './hooks/useSoundCloudPlayer.js';
import { planSync } from './tools/audioSync.js';

const PLAYER_HOOKS = {
    youtube: useYouTubePlayer,
    vimeo: useVimeoPlayer,
    soundcloud: useSoundCloudPlayer,
};
const PLAYER_SIZE = { width: 1, height: 1 };

const SYNC_INTERVAL_MS = 1000;   // contrôle de l'écart
const COOLDOWN_MS = 3000;        // pas de nouveau recalage juste après un chargement ou un saut

/**
 * @param {object}   props
 * @param {string}   props.slot          clé de piste (music, ambience1…)
 * @param {object}   props.slotState     état de la piste diffusé par le serveur
 * @param {Function} props.getServerNow  heure estimée du serveur (ms)
 * @param {number}   props.tolerance     écart toléré avant recalage (s)
 * @param {boolean}  props.unlocked      son activé par un clic de l'utilisateur
 * @param {number}   props.volume        volume du lecteur, 0 à 100
 * @param {Function} [props.onReport]    MJ seulement : (action, payload) pour duration / error
 */
const SlotPlayer = ({ slot, slotState, getServerNow, tolerance, unlocked, volume, onReport }) => {
    // Hook fixé par la source, constante pour cette instance (clé de AudioLayer)
    const usePlayer = PLAYER_HOOKS[slotState.source] ?? useYouTubePlayer;
    const { containerRef, player, error } = usePlayer(PLAYER_SIZE);

    const stateRef    = useRef(slotState);
    const loadedIdRef = useRef(null);
    const cooldownRef = useRef(0);
    const reportedRef = useRef({ duration: null, error: null });   // trackId déjà signalé
    const settingsRef = useRef({ tolerance, unlocked, onReport });
    useEffect(() => { stateRef.current = slotState; }, [slotState]);
    useEffect(() => { settingsRef.current = { tolerance, unlocked, onReport }; }, [tolerance, unlocked, onReport]);

    const runSync = useCallback(() => {
        const state = stateRef.current;
        if (!player || !state || !settingsRef.current.unlocked) return;

        const now = Date.now();
        const playerState = PLAYER_STATES[player.getPlayerState?.()] ?? 'unstarted';
        const plan = planSync({
            state, serverNow: getServerNow(), loadedId: loadedIdRef.current, playerState,
            currentTime: player.getCurrentTime?.() ?? 0, threshold: settingsRef.current.tolerance,
        });

        // Durée connue : le serveur peut armer la fin de morceau (MJ seulement)
        const report = settingsRef.current.onReport;
        if (report && state.trackId && !state.duration && reportedRef.current.duration !== state.trackId && loadedIdRef.current === state.mediaId) {
            const duration = player.getDuration?.() ?? 0;
            if (duration > 0) {
                reportedRef.current.duration = state.trackId;
                report('duration', { slot, trackId: state.trackId, duration });
            }
        }

        if (plan.type !== 'load' && plan.type !== 'stop' && now < cooldownRef.current) return;

        switch (plan.type) {
            case 'stop':
                player.stopVideo();
                loadedIdRef.current = null;
                break;
            case 'load':
                if (plan.autoplay) player.loadVideoById({ videoId: state.mediaId, startSeconds: plan.position });
                else player.cueVideoById({ videoId: state.mediaId, startSeconds: plan.position });
                loadedIdRef.current = state.mediaId;
                cooldownRef.current = now + COOLDOWN_MS;
                break;
            case 'play':
                player.seekTo(plan.position, true);
                player.playVideo();
                cooldownRef.current = now + COOLDOWN_MS;
                break;
            case 'pause':
                player.pauseVideo();
                player.seekTo(plan.position, true);
                break;
            case 'seek':
                player.seekTo(plan.position, true);
                cooldownRef.current = now + COOLDOWN_MS;
                break;
            default:
        }
    }, [player, getServerNow, slot]);

    // À chaque état reçu (un morceau rejoué en boucle repart aussi de là), puis à intervalle régulier
    useEffect(() => { runSync(); }, [slotState, unlocked, runSync]);
    useEffect(() => {
        const id = setInterval(runSync, SYNC_INTERVAL_MS);
        return () => clearInterval(id);
    }, [runSync]);

    useEffect(() => { player?.setVolume?.(volume); }, [player, volume]);

    // Vidéo illisible : signalée une fois par morceau (MJ seulement)
    useEffect(() => {
        const state = stateRef.current;
        const report = settingsRef.current.onReport;
        if (!error || !report || !state?.trackId || reportedRef.current.error === state.trackId) return;
        reportedRef.current.error = state.trackId;
        report('error', { slot, trackId: state.trackId });
    }, [error, slot]);

    return <div ref={containerRef} className="vtt-audio-hidden-player" aria-hidden="true" />;
};

export default SlotPlayer;
