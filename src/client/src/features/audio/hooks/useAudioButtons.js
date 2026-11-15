// src/client/src/features/audio/hooks/useAudioButtons.js
// ─────────────────────────────────────────────────────────────────────────────
// Boutons préréglés de la table, côté MJ (documentations/plateforme/spec_audio.md
// §12.6, §15) : liste relue à chaque audio-buttons-changed (modification ailleurs :
// panneau, onglet Session, autre onglet du MJ), lancement, création et modification
// d'un bouton complet (nom, fondu, pistes), ordre, suppression.
// Chaque écriture renvoie la liste à jour, qui remplace la précédente.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';

export const MAX_AUDIO_BUTTONS = 12;

// Messages du serveur traduits pour l'interface
const MESSAGES = {
    [`${MAX_AUDIO_BUTTONS} buttons at most`]: `${MAX_AUDIO_BUTTONS} boutons au plus.`,
    'Audio is disabled for this session': 'Musique désactivée pour cette table.',
    'Button content was deleted': 'Playlist vide : ce bouton ne peut rien lancer.',
    'A button must play at least one slot': 'Le bouton doit lancer au moins une piste.',
    'Label required': 'Donnez un nom au bouton.',
};

/**
 * @param {number|null} sessionId table active
 * @returns {{ sessionId: number|null, buttons: object[], error: string|null, clearError: Function, run: Function,
 *             create: Function, update: Function, reorder: Function, remove: Function }}
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
        sessionId,
        buttons,
        error,
        clearError: () => setError(null),
        /** Lance un bouton ; l'état de lecture arrive par audio-state. */
        run: (id) => request('POST', `/${id}/run`),
        /** Bouton complet : { label, fade, slots } (slots : voir tools/audioButtons.js). */
        create: (button) => write('POST', '', button),
        /** Modification : { label?, fade?, slots? } ; slots remplace toutes les pistes. */
        update: (id, changes) => write('PUT', `/${id}`, changes),
        reorder: (ids) => write('PUT', '/order', { ids }),
        remove: (id) => write('DELETE', `/${id}`),
    };
}
