// src/client/src/systems/dune/hooks/useSessionResources.js
// Ressources de la table (Impulsion, Menace, Complications pour le MJ) :
// chargement, écoute en temps réel, modification.
// La modification passe par le socket dune:update-session-resources : dette connue
// du pattern 2D20 (src/client/CLAUDE.md), reprise telle quelle.

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { IMPULSION_MAX } from '../config/rules/roll.js';

const EMPTY = { impulsions: 0, menace: 0, complications: 0 };

/**
 * @param {number|null} sessionId
 * @param {boolean} [isGM=false]  écoute aussi session-resources-gm-update (complications)
 * @returns {{ resources, updateResource(field, delta) }}
 */
export function useSessionResources(sessionId, isGM = false) {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const socket = useSocket();
    const [resources, setResources] = useState(EMPTY);

    useEffect(() => {
        if (!sessionId) return;
        let cancelled = false;
        fetchWithAuth(`${apiBase}/session-resources/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data && !cancelled) setResources(prev => ({ ...prev, ...data })); })
            .catch(err => console.error('[dune] ressources de la table :', err));
        return () => { cancelled = true; };
        // fetchWithAuth exclu des dépendances (référence instable)
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket) return;
        const onUpdate = data => setResources(prev => ({ ...prev, ...data }));
        socket.on('session-resources-update', onUpdate);
        if (isGM) socket.on('session-resources-gm-update', onUpdate);
        return () => {
            socket.off('session-resources-update', onUpdate);
            if (isGM) socket.off('session-resources-gm-update', onUpdate);
        };
    }, [socket, isGM]);

    // Mise à jour optimiste ; le serveur confirme par session-resources-update
    const updateResource = useCallback((field, delta) => {
        if (!socket || !sessionId) return;
        setResources(prev => {
            const next = Math.max(0, (prev[field] ?? 0) + delta);
            return { ...prev, [field]: field === 'impulsions' ? Math.min(IMPULSION_MAX, next) : next };
        });
        socket.emit('dune:update-session-resources', { sessionId, field, delta });
    }, [socket, sessionId]);

    return { resources: sessionId ? resources : EMPTY, updateResource };
}
