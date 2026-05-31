// context/SessionContext.jsx - Gestion de la session active (broadcast par le GM)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import {getSystemFromPath, useSystem} from '../hooks/useSystem.js';
import {useFetch} from "../hooks/useFetch.js";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [activeGMSession, setActiveGMSession] = useState(null);
    const [activeSessionName, setActiveSessionName] = useState(null);
    const [characterSessions, setCharacterSessions] = useState([]); // Sessions du perso
    const [pendingSessionId, setPendingSessionId] = useState(null);
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const { system } = useSystem();

    useEffect(() => {
        if (!socket) return;

        const currentSystem = getSystemFromPath();

        // Broadcast temps réel — une session change d'état
        // Reçoit { sessionId, system } — filtre par slug courant
        const handleGMSessionActive = ({ sessionId, system } = {}) => {
            if (system !== currentSystem) return;
            console.log('[SessionContext] GM session changed to:', sessionId, 'system:', system);
            setPendingSessionId(sessionId); // null = quitter
        };

        // Réponse directe à character-loaded — sessions actives du slug
        // Reçoit [sessionId, ...] — déjà filtré par le serveur
        const handleGMSessionsActive = (ids = []) => {
            if (!ids.length) return;
            // On prend la première session active du slug
            // (gestion multi-session même slug = évolution future)
            setPendingSessionId(ids[0]);
        };

        socket.on('gm-session-active',  handleGMSessionActive);
        socket.on('gm-sessions-active', handleGMSessionsActive);

        return () => {
            socket.off('gm-session-active',  handleGMSessionActive);
            socket.off('gm-sessions-active', handleGMSessionsActive);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !pendingSessionId) return;
        if (!characterSessions.length) return; // ← attendre que les sessions soient chargées

        const system   = getSystemFromPath();
        const isGM     = characterSessions.some(s => s.id === -1);
        const isMember = isGM || characterSessions.some(s => s.id === pendingSessionId);

        if (!isMember) {
            console.log('[SessionContext] Not a member of session:', pendingSessionId);
            if (activeGMSession) {
                socket.emit('leave-session', { sessionId: activeGMSession, system });
                setActiveGMSession(null);
            }
            return;
        }

        if (activeGMSession && activeGMSession !== pendingSessionId) {
            socket.emit('leave-session', { sessionId: activeGMSession, system });
        }

        socket.emit('join-session', { sessionId: pendingSessionId, system });
        setActiveGMSession(pendingSessionId);
    }, [socket, pendingSessionId, characterSessions]);

    useEffect(() => {
        return () => {
            if (socket && activeGMSession) {
                socket.emit('leave-session', { sessionId: activeGMSession, system });
            }
        };
    }, [socket, activeGMSession]);

    useEffect(() => {
        if (!activeGMSession) { setActiveSessionName(null); return; }
        const system = getSystemFromPath();
        fetchWithAuth(`/api/${system}/sessions/${activeGMSession}`)
            .then(r => r.ok ? r.json() : null)
            .then(s => { if (s) setActiveSessionName(s.name); })
            .catch(() => {});
    }, [activeGMSession]);

    // Méthode pour enregistrer les sessions du personnage
    const updateCharacterSessions = (sessions) => {
        console.log('[SessionContext] Character sessions updated:', sessions);
        setCharacterSessions(sessions);
    };

    return (
        <SessionContext.Provider value={{
            activeGMSession,
            activeSessionName,
            updateCharacterSessions
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within SessionProvider');
    }
    return context;
};