import { useState, useEffect, useCallback } from 'react';
import { useSocket }  from '../../../context/SocketContext.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { useFetch }   from '../../../hooks/useFetch.js';
import { useSystem }  from '../../../hooks/useSystem.js';
import {useGMSession} from "../../../hooks/useGMSession.js";

const DEFAULT = {
    current:     0,
    principes:   [],
    interdits:   [],
    regle_acces: 'libre',
    notes:       '',
};

export function useGroupReserve() {
    const socket                    = useSocket();
    const { activeGMSession }       = useSession();
    const { activeSession }         = useGMSession({ apiBase: useSystem().apiBase });
    const fetchWithAuth             = useFetch();
    const { apiBase }               = useSystem();

    // Côté joueur : activeGMSession (SessionContext)
    // Côté GM     : activeSession.id (useGMSession) si le contexte joueur est vide
    const sessionId = activeGMSession ?? activeSession?.id ?? null;

    const [groupReserve, setGroupReserve] = useState(null);
    const [loading,      setLoading]      = useState(false);

    // ── Chargement HTTP quand la session change ───────────────────────────────
    useEffect(() => {
        if (!sessionId) { setGroupReserve(null); return; }
        setLoading(true);
        fetchWithAuth(`${apiBase}/sessions/${sessionId}/group-reserve`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setGroupReserve(data); })
            .catch(err => console.error('[useGroupReserve] load:', err))
            .finally(() => setLoading(false));
    }, [sessionId, apiBase]); // fetchWithAuth absent intentionnellement

    // ── Demande initiale via socket ────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !sessionId) return;
        socket.emit('noctis:group-reserve-get', { sessionId: sessionId });
    }, [socket, sessionId]);

    // ── Sync socket ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const handler = (data) => {
            setGroupReserve(prev => prev ? { ...prev, ...data } : { ...DEFAULT, ...data });
        };
        socket.on('noctis:group-reserve-update', handler);
        return () => socket.off('noctis:group-reserve-update', handler);
    }, [socket]);

    // ── Mise à jour complète (principes, interdits, règle, notes) ─────────────
    const updateGroupReserve = useCallback(async (patch) => {
        if (!sessionId) return;
        try {
            await fetchWithAuth(`${apiBase}/sessions/${sessionId}/group-reserve`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(patch),
            });
            // Le broadcast socket met à jour l'état local
        } catch (err) {
            console.error('[useGroupReserve] update:', err);
        }
    }, [sessionId, apiBase]); // fetchWithAuth absent

    // ── Fluctuation narrative (+3/+5/-3/-5) ───────────────────────────────────
    const applyFluctuation = useCallback(async (delta, raison = '') => {
        if (!sessionId) return;
        try {
            await fetchWithAuth(`${apiBase}/sessions/${sessionId}/group-reserve/fluctuation`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ delta, raison }),
            });
        } catch (err) {
            console.error('[useGroupReserve] fluctuation:', err);
        }
    }, [sessionId, apiBase]); // fetchWithAuth absent

    return {
        groupReserve: groupReserve ?? DEFAULT,
        loading,
        hasSession:   !!sessionId,
        updateGroupReserve,
        applyFluctuation,
    };
}