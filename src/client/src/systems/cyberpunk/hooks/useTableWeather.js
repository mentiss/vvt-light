// src/client/src/systems/cyberpunk/hooks/useTableWeather.js
// ─────────────────────────────────────────────────────────────────────────────
// Météo de la table (spec_cyberpunk.md §3.1, Q-10) : choisie par le MJ, suivie par
// les joueurs. Lecture GET /api/cyberpunk/weather/:sessionId, mise à jour par
// l'événement cyberpunk-weather-update (room de la table). Sans table : 'auto'.
// setWeather (MJ seulement, la route refuse les joueurs) : PUT puis diffusion.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';

export const WEATHERS = [
    { id: 'auto',  label: 'Auto'    },
    { id: 'rain',  label: 'Pluie'   },
    { id: 'smog',  label: 'Smog'    },
    { id: 'clear', label: 'Dégagé'  },
];

export const useTableWeather = (rawSessionId) => {
    const sessionId = rawSessionId ? Number(rawSessionId) : null;   // la diffusion porte un nombre
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const { apiBase } = useSystem();
    const [state, setState] = useState({ sessionId: null, weather: 'auto' });

    // fetchWithAuth hors des dépendances : référence instable (src/client/CLAUDE.md)
    useEffect(() => {
        if (!sessionId || !apiBase) return undefined;
        let alive = true;
        fetchWithAuth(`${apiBase}/weather/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (alive && data?.weather) setState({ sessionId, weather: data.weather }); })
            .catch(() => {});
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, apiBase]);

    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const onUpdate = (data) => { if (data?.sessionId === sessionId) setState({ sessionId, weather: data.weather }); };
        socket.on('cyberpunk-weather-update', onUpdate);
        return () => socket.off('cyberpunk-weather-update', onUpdate);
    }, [socket, sessionId]);

    const setWeather = useCallback(async (weather) => {
        if (!sessionId || !apiBase) return;
        setState({ sessionId, weather });   // optimiste ; la diffusion confirme
        await fetchWithAuth(`${apiBase}/weather/${sessionId}`, { method: 'PUT', body: JSON.stringify({ weather }) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, apiBase]);

    // La météo d'une autre table (changement de table) ne s'applique pas
    const weather = state.sessionId === sessionId ? state.weather : 'auto';
    return { weather, setWeather };
};
