// src/client/src/features/audio/hooks/useAudioLibrary.js
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque audio de la table et catalogue public, côté MJ
// (documentations/spec_audio.md §11.2, §11.4). Chaque écriture renvoie la
// bibliothèque à jour, qui remplace la précédente.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';

/**
 * @param {number|null} sessionId table active
 * @param {boolean} active        charge la bibliothèque seulement quand le panneau est ouvert
 */
export function useAudioLibrary(sessionId, active) {
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    const [library, setLibrary] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [error, setError]     = useState(null);
    const [busy, setBusy]       = useState(false);

    const base = `/api/audio/sessions/${sessionId}`;

    const request = useCallback(async (method, path, body) => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetchRef.current(`${base}${path}`, { method, body: body ? JSON.stringify(body) : undefined });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error ?? 'Erreur du serveur');
                return null;
            }
            return data;
        } catch (err) {
            console.error('[useAudioLibrary] Request failed:', err);
            setError('Serveur injoignable');
            return null;
        } finally {
            setBusy(false);
        }
    }, [base]);

    const reload = useCallback(async () => {
        if (!sessionId) return;
        const data = await request('GET', '/library');
        if (data) setLibrary(data);
    }, [sessionId, request]);

    const reloadCatalog = useCallback(async () => {
        if (!sessionId) return;
        const data = await request('GET', '/catalog');
        if (data) setCatalog(data);
    }, [sessionId, request]);

    useEffect(() => { if (active) reload(); }, [active, reload]);

    /** Écriture : la réponse est la bibliothèque à jour, renvoyée (null en cas d'échec). */
    const write = useCallback(async (method, path, body) => {
        const data = await request(method, path, body);
        if (data) setLibrary(data);
        return data;
    }, [request]);

    return { library, catalog, error, busy, reload, reloadCatalog, write, clearError: () => setError(null) };
}
