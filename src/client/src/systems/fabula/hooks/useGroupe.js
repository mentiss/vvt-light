// src/client/src/systems/fabula/hooks/useGroupe.js
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de groupe de la table (spec_fabula.md §7) : chargement, suivi en direct
// (fabula-groupe-update, diffusé par le serveur après chaque écriture) et
// écritures HTTP (la réponse remplace la fiche locale). Aucune émission socket.
//
// const { groupe, loading, error, send } = useGroupe(sessionId);
// send(method, path, body) : path relatif à /groupe/:sessionId ('/notes',
// '/cadrans', '/journal/12'…) ; renvoie true si l'écriture a réussi.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useSocket } from '@/app/context/SocketContext.jsx';

export const useGroupe = (sessionId) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [groupe, setGroupe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) { setGroupe(null); return undefined; }
        let cancelled = false;
        setLoading(true);
        fetchWithAuth(`${apiBase}/groupe/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (!cancelled) setGroupe(data); })
            .catch(e => console.error('[fabula] groupe :', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // fetchWithAuth volontairement hors dépendances (référence instable)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const onUpdate = (payload) => { if (String(payload?.sessionId) === String(sessionId)) setGroupe(payload.groupe); };
        socket.on('fabula-groupe-update', onUpdate);
        return () => socket.off('fabula-groupe-update', onUpdate);
    }, [socket, sessionId]);

    const send = useCallback(async (method, path = '', body) => {
        setError(null);
        try {
            const r = await fetchWithAuth(`${apiBase}/groupe/${sessionId}${path}`, {
                method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
            });
            const data = await r.json().catch(() => null);
            if (!r.ok) { setError(data?.error ?? 'Enregistrement impossible'); return false; }
            setGroupe(data);
            return true;
        } catch (e) {
            setError(e.message ?? 'Enregistrement impossible');
            return false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, sessionId]);

    return { groupe, loading, error, send };
};
