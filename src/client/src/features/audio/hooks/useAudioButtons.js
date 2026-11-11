// src/client/src/features/audio/hooks/useAudioButtons.js
// ─────────────────────────────────────────────────────────────────────────────
// Boutons préréglés de la table, côté MJ (documentations/spec_audio.md §12.6) :
// liste relue à chaque audio-buttons-changed (modification ailleurs : panneau,
// onglet Session, autre onglet du MJ), lancement, création (scène = ce qui joue,
// ou ciblé), renommage, remplacement par ce qui joue, ordre, suppression.
// Chaque écriture renvoie la liste à jour, qui remplace la précédente.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';

export const MAX_AUDIO_BUTTONS = 5;

// Messages du serveur traduits pour l'interface
const MESSAGES = {
    'Nothing is playing': 'Rien ne joue : lancez d\'abord la musique ou une ambiance.',
    [`${MAX_AUDIO_BUTTONS} buttons at most`]: `${MAX_AUDIO_BUTTONS} boutons au plus.`,
    'Audio is disabled for this session': 'Musique désactivée pour cette table.',
    'Button content was deleted': 'Playlist vide : ce bouton ne peut rien lancer.',
};

/**
 * @param {number|null} sessionId table active
 * @returns {{ buttons: object[], error: string|null, clearError: Function, run: Function, saveScene: Function,
 *             createTarget: Function, rename: Function, capture: Function, reorder: Function, remove: Function }}
 */
export function useAudioButtons(sessionId) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    // Les données retiennent leur table : celles d'une autre table ne sont jamais renvoyées
    const [data, setData] = useState({ sessionId: null, buttons: [] });
    const [error, setError] = useState(null);

    const request = useCallback(async (method, path = '', body) => {
        if (!sessionId) return null;
        try {
            const res = await fetchRef.current(`/api/audio/sessions/${sessionId}/buttons${path}`, { method, body: body ? JSON.stringify(body) : undefined });
            const json = await res.json();
            if (!res.ok) {
                setError(MESSAGES[json?.error] ?? 'Action impossible.');
                return null;
            }
            setError(null);
            return json;
        } catch (err) {
            console.error('[useAudioButtons] Request failed:', err);
            setError('Serveur injoignable.');
            return null;
        }
    }, [sessionId]);

    /** Écriture (ou lecture) dont la réponse est la liste à jour. */
    const write = useCallback(async (method, path, body) => {
        const json = await request(method, path, body);
        if (Array.isArray(json)) setData({ sessionId, buttons: json });
        return !!json;
    }, [request, sessionId]);

    // Chargement, et relecture quand les boutons changent ailleurs
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        const load = () => fetchRef.current(`/api/audio/sessions/${sessionId}/buttons`)
            .then(res => (res.ok ? res.json() : null))
            .then(json => { if (!cancelled && Array.isArray(json)) setData({ sessionId, buttons: json }); })
            .catch(err => console.error('[useAudioButtons] Load failed:', err));
        load();

        const slug = getSystemFromPath();
        const onChanged = (msg) => {
            if (msg?.system === slug && Number(msg.sessionId) === Number(sessionId)) load();
        };
        socket?.on('audio-buttons-changed', onChanged);
        return () => {
            cancelled = true;
            socket?.off('audio-buttons-changed', onChanged);
        };
    }, [socket, sessionId]);

    const buttons = data.sessionId === sessionId ? data.buttons : [];

    return {
        buttons,
        error,
        clearError: () => setError(null),
        /** Lance un bouton ; l'état de lecture arrive par audio-state. */
        run: (id) => request('POST', `/${id}/run`),
        saveScene: (label) => write('POST', '', { label, mode: 'scene' }),
        createTarget: ({ label, slot, trackId, playlistId, shuffle, start }) => write('POST', '', { label, mode: 'target', slot, trackId, playlistId, shuffle, start }),
        rename: (id, label) => write('PUT', `/${id}`, { label }),
        /** Timecodes (§14.2) : { start } pour un bouton ciblé, { starts: { piste: secondes | null } } pour une scène. */
        setStart: (id, timecodes) => write('PUT', `/${id}`, timecodes),
        capture: (id) => write('PUT', `/${id}`, { capture: true }),
        reorder: (ids) => write('PUT', '/order', { ids }),
        remove: (id) => write('DELETE', `/${id}`),
    };
}
