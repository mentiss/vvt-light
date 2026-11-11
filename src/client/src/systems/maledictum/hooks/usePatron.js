// src/client/src/systems/maledictum/hooks/usePatron.js
// ─────────────────────────────────────────────────────────────────────────────
// Patron de la table, Supériorité et Subtilité (spec_maledictum.md §9.3) :
// chargement, suivi en direct (maledictum-patron-update, diffusé par le serveur
// après chaque écriture) et écritures HTTP du MJ (la réponse remplace la fiche
// locale). Aucune émission socket. Modèle : useGroupe de fabula.
//
// const { patron, loading, error, save, setSuperiority } = usePatron(sessionId);
// save({ data?, secret?, superiority?, subtlety?, subtletyEnabled? }) → true si réussi
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useSocket } from '@/app/context/SocketContext.jsx';

export const usePatron = (sessionId) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [patron, setPatron] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) { setPatron(null); return undefined; }
        let cancelled = false;
        setLoading(true);
        fetchWithAuth(`${apiBase}/patron/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (!cancelled) setPatron(data); })
            .catch(e => console.error('[maledictum] patron :', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // fetchWithAuth volontairement hors dépendances (référence instable)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const onUpdate = (payload) => { if (String(payload?.sessionId) === String(sessionId)) setPatron(payload.patron); };
        socket.on('maledictum-patron-update', onUpdate);
        return () => socket.off('maledictum-patron-update', onUpdate);
    }, [socket, sessionId]);

    const send = useCallback(async (path, body) => {
        setError(null);
        try {
            const r = await fetchWithAuth(`${apiBase}/patron/${sessionId}${path}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            const data = await r.json().catch(() => null);
            if (!r.ok) { setError(data?.error ?? 'Enregistrement impossible'); return false; }
            setPatron(data);
            return true;
        } catch (e) {
            setError(e.message ?? 'Enregistrement impossible');
            return false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, sessionId]);

    const save = useCallback((body) => send('', body), [send]);
    const setSuperiority = useCallback((value) => send('/superiority', { value }), [send]);

    return { patron, loading, error, save, setSuperiority };
};
