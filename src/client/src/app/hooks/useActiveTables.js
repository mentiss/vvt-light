// src/client/src/app/hooks/useActiveTables.js
// ─────────────────────────────────────────────────────────────────────────────
// Tables actives du slug de la page, telles que le serveur les tient
// (documentations/spec_tables.md §4) : lecture initiale par GET /sessions/active,
// puis la liste complète à chaque changement par `active-tables` (room du slug).
// Relue après une reconnexion : des changements ont pu être manqués.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useFetch } from './useFetch.js';
import { getSystemFromPath } from './useSystem.js';

/**
 * @param {boolean} [enabled=true] false : ni lecture ni écoute (page sans personnage)
 * @returns {Array<{ id: number, posts: number }>|null} null tant que la liste n'est pas lue
 */
export function useActiveTables(enabled = true) {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const [tables, setTables] = useState(null);
    const slug = getSystemFromPath();

    useEffect(() => {
        if (!enabled || !slug) return;
        let alive = true;

        const load = () => fetchWithAuth('/api/sessions/active')
            .then(r => (r.ok ? r.json() : null))
            .then(list => { if (alive && Array.isArray(list)) setTables(list); })
            .catch(err => console.error('[useActiveTables] Error loading active tables:', err));

        const onTables = ({ system, tables: list } = {}) => {
            if (system === slug && Array.isArray(list)) setTables(list);
        };

        load();
        socket?.on('active-tables', onTables);
        socket?.io.on('reconnect', load);
        return () => {
            alive = false;
            socket?.off('active-tables', onTables);
            socket?.io.off('reconnect', load);
        };
    }, [socket, slug, enabled, fetchWithAuth]);

    return tables;
}
