// src/client/src/features/audio/hooks/useAudioSession.js
// ─────────────────────────────────────────────────────────────────────────────
// État audio d'une table (documentations/spec_audio.md §11.4, §11.5) :
// - chargement de { enabled, hideTitle, tolerance, state } à l'entrée et à chaque
//   reconnexion du socket (arrivée en cours de route) ;
// - écoute de audio-state / audio-enabled, filtrée sur le slug et la table ;
// - écart d'horloge avec le serveur, mesuré par aller-retour (audio-ping) ;
// - commandes du MJ (POST …/command).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { bestOffset, clockSample } from '../tools/audioSync.js';

const PING_INTERVAL_MS = 30000;
const MAX_SAMPLES = 10;

// État d'une table pas encore chargée (ou d'aucune table)
const EMPTY = { loaded: false, enabled: false, hideTitle: false, tolerance: 1, state: null };

/**
 * @param {number|null} sessionId table active (null : rien)
 * @returns {{ loaded: boolean, enabled: boolean, hideTitle: boolean, tolerance: number, state: object|null,
 *             getServerNow: () => number, sendCommand: (body: object) => Promise<object|null>,
 *             setEnabled: (enabled: boolean) => Promise<boolean> }}
 */
export function useAudioSession(sessionId) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    // Les données retiennent leur table : celles d'une autre table ne sont jamais renvoyées
    const [audio, setAudio] = useState({ sessionId: null, ...EMPTY });
    const samplesRef = useRef([]);

    const addSample = (sample) => { samplesRef.current = [...samplesRef.current, sample].slice(-MAX_SAMPLES); };
    const getServerNow = useCallback(() => Date.now() + bestOffset(samplesRef.current), []);

    /**
     * Réponse du serveur → état local de la table active.
     * full : réponse complète (chargement, activation, commande) ; un événement
     * temps réel seul ne vaut pas chargement.
     */
    const apply = useCallback((data, full = true) => {
        if (!data) return;
        setAudio(prev => {
            const base = prev.sessionId === sessionId ? prev : { sessionId, ...EMPTY };
            return {
                sessionId,
                loaded: full || base.loaded,
                enabled: data.enabled ?? base.enabled,
                hideTitle: data.hideTitle ?? base.hideTitle,
                tolerance: data.tolerance ?? base.tolerance,
                state: data.state ?? base.state,
            };
        });
    }, [sessionId]);

    // ── Chargement, puis à chaque reconnexion du socket ─────────────────────
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        const load = async () => {
            try {
                const sentAt = Date.now();
                const res = await fetchRef.current(`/api/audio/sessions/${sessionId}`);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                addSample(clockSample(sentAt, data.serverTime, Date.now()));
                if (!cancelled) apply(data);
            } catch (err) {
                console.error('[useAudioSession] Load failed:', err);
            }
        };
        load();
        socket?.on('connect', load);
        return () => {
            cancelled = true;
            socket?.off('connect', load);
        };
    }, [sessionId, socket, apply]);

    // ── Temps réel ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const slug = getSystemFromPath();
        const mine = (data) => data?.system === slug && Number(data.sessionId) === Number(sessionId);

        const onState = (data) => { if (mine(data)) apply({ state: data.state, hideTitle: data.hideTitle }, false); };
        const onEnabled = (data) => { if (mine(data)) apply({ enabled: data.enabled }, false); };

        socket.on('audio-state', onState);
        socket.on('audio-enabled', onEnabled);
        return () => {
            socket.off('audio-state', onState);
            socket.off('audio-enabled', onEnabled);
        };
    }, [socket, sessionId, apply]);

    // ── Horloge : quelques mesures à l'entrée, puis régulièrement ───────────
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const ping = () => {
            const sentAt = Date.now();
            socket.emit('audio-ping', (serverTime) => addSample(clockSample(sentAt, serverTime, Date.now())));
        };
        const first = [0, 300, 600, 900].map(delay => setTimeout(ping, delay));
        const id = setInterval(ping, PING_INTERVAL_MS);
        return () => {
            first.forEach(clearTimeout);
            clearInterval(id);
        };
    }, [socket, sessionId]);

    // ── Commandes du MJ ─────────────────────────────────────────────────────
    const sendCommand = useCallback(async (body) => {
        if (!sessionId) return null;
        try {
            const res = await fetchRef.current(`/api/audio/sessions/${sessionId}/command`, { method: 'POST', body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) {
                console.warn('[useAudioSession] Command refused:', body.action, data?.error);
                return null;
            }
            apply(data);
            return data;
        } catch (err) {
            console.error('[useAudioSession] Command failed:', err);
            return null;
        }
    }, [sessionId, apply]);

    const setEnabled = useCallback(async (enabled) => {
        if (!sessionId) return false;
        try {
            const res = await fetchRef.current(`/api/audio/sessions/${sessionId}/enabled`, { method: 'PUT', body: JSON.stringify({ enabled }) });
            if (!res.ok) return false;
            apply(await res.json());
            return true;
        } catch (err) {
            console.error('[useAudioSession] Toggle failed:', err);
            return false;
        }
    }, [sessionId, apply]);

    // Données d'une autre table (changement en cours) ou d'aucune : rien
    const { sessionId: owner, ...current } = audio;
    const data = sessionId && owner === sessionId ? current : EMPTY;
    return { ...data, getServerNow, sendCommand, setEnabled };
}
