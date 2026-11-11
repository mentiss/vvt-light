// src/client/src/systems/dune/hooks/useSessionHouse.js
// Maison de la table (nom, description) : lecture et écoute de session-maison-update.
// Affichée sur la fiche joueur (C-5).

import { useEffect, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';

/** @returns {{ nom, description }|null} */
export function useSessionHouse(sessionId) {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [house, setHouse] = useState(null);

    useEffect(() => {
        if (!sessionId) return;
        let cancelled = false;
        fetchWithAuth(`${apiBase}/session-maison/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (!cancelled) setHouse(data); })
            .catch(err => console.error('[dune] maison de la table :', err));
        return () => { cancelled = true; };
        // fetchWithAuth exclu des dépendances (référence instable)
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket) return;
        const onUpdate = data => setHouse(data);
        socket.on('session-maison-update', onUpdate);
        return () => socket.off('session-maison-update', onUpdate);
    }, [socket]);

    return sessionId ? house : null;
}
