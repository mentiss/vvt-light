// src/client/src/systems/woddavampire/hooks/useCoterie.js
// ─────────────────────────────────────────────────────────────────────────────
// Coterie de la table (spec_woddavampire.md §II.17.3) : chargement, suivi en
// direct (vda-coterie-update, diffusé par le serveur après chaque écriture) et
// écritures HTTP (la réponse remplace la coterie locale). Aucune émission socket.
//
// const { coterie, loading, error, send } = useCoterie(sessionId);
// send(method, path, body) : path relatif à /coterie/:sessionId ('', '/story',
// '/contribute/12'…) ; renvoie true si l'écriture a réussi, sinon message dans error.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import { useSystem } from '../../../hooks/useSystem.js';
import { useSocket } from '../../../context/SocketContext.jsx';

export const useCoterie = (sessionId) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [coterie, setCoterie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) { setCoterie(null); return undefined; }
        let cancelled = false;
        setLoading(true);
        fetchWithAuth(`${apiBase}/coterie/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (!cancelled) setCoterie(data); })
            .catch(e => console.error('[woddavampire] coterie :', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // fetchWithAuth volontairement hors dépendances (référence instable)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const onUpdate = (payload) => { if (String(payload?.sessionId) === String(sessionId)) setCoterie(payload.coterie); };
        socket.on('vda-coterie-update', onUpdate);
        return () => socket.off('vda-coterie-update', onUpdate);
    }, [socket, sessionId]);

    const send = useCallback(async (method, path = '', body) => {
        setError(null);
        try {
            const r = await fetchWithAuth(`${apiBase}/coterie/${sessionId}${path}`, {
                method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
            });
            const data = await r.json().catch(() => null);
            if (!r.ok) { setError(data?.error ?? 'Enregistrement impossible'); return false; }
            setCoterie(data);
            return true;
        } catch (e) {
            setError(e.message ?? 'Enregistrement impossible');
            return false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, sessionId]);

    return { coterie, loading, error, send };
};
