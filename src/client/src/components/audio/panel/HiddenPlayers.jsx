// src/client/src/components/audio/panel/HiddenPlayers.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lecteurs YouTube cachés du panneau MJ, sans son : import d'une playlist YouTube
// (liste des vidéos, sans clé d'API) et relevé des durées manquantes (§11.14).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { useYouTubePlayer } from '../../../hooks/useYouTubePlayer.js';

const IMPORT_TIMEOUT_MS = 15000;

/** Lecteur auxiliaire caché : liste des vidéos d'une playlist YouTube, sans clé d'API (Q-22). */
export const PlaylistImport = ({ listId, onDone, onFail }) => {
    const { containerRef, player, state } = useYouTubePlayer({ width: 1, height: 1 });
    const doneRef = useRef(false);

    useEffect(() => { player?.cuePlaylist({ listType: 'playlist', list: listId }); }, [player, listId]);
    useEffect(() => {
        if (!player || doneRef.current || (state !== 'cued' && state !== 'unstarted')) return;
        const ids = player.getPlaylist?.() ?? [];
        if (ids.length) { doneRef.current = true; onDone(ids); }
    }, [player, state, onDone]);
    useEffect(() => {
        const id = setTimeout(() => { if (!doneRef.current) { doneRef.current = true; onFail(); } }, IMPORT_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, [onFail]);

    return <div ref={containerRef} className="vtt-audio-hidden-player" aria-hidden="true" />;
};

const PROBE_TIMEOUT_MS = 5000;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Relevé des durées manquantes des titres affichés (§11.14) : un lecteur caché charge
 * chaque vidéo sans la jouer et lit sa durée. Une vidéo à la fois ; chacune n'est
 * tentée qu'une fois par ouverture du panneau.
 */
export const DurationProbe = ({ tracks, onFound }) => {
    const { containerRef, player } = useYouTubePlayer({ width: 1, height: 1 });
    const tracksRef = useRef(tracks);
    const onFoundRef = useRef(onFound);
    useEffect(() => { tracksRef.current = tracks; onFoundRef.current = onFound; });

    useEffect(() => {
        if (!player) return undefined;
        let cancelled = false;
        const tried = new Set();
        const run = async () => {
            while (!cancelled) {
                const next = tracksRef.current.find(t => !tried.has(t.id));
                if (!next) { await wait(1000); continue; }
                tried.add(next.id);
                player.cueVideoById(next.mediaId);
                const started = Date.now();
                while (!cancelled && Date.now() - started < PROBE_TIMEOUT_MS) {
                    await wait(300);
                    // La durée doit être celle de cette vidéo, pas de la précédente
                    const duration = player.getVideoData?.()?.video_id === next.mediaId ? player.getDuration?.() : 0;
                    if (duration > 0) { onFoundRef.current(next.id, duration); break; }
                }
            }
        };
        run();
        return () => { cancelled = true; };
    }, [player]);

    return <div ref={containerRef} className="vtt-audio-hidden-player" aria-hidden="true" />;
};
