// src/client/src/systems/achtung/components/SessionResourcesBar.jsx
// Barre ressources de session Achtung — Momentum + Threat (joueurs).
// Complications masquées côté joueur (GM only).
// Socket en réception uniquement — émissions via socket.emit.

import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext.jsx';
import { useFetch }  from '../../../hooks/useFetch.js';
import { useSystem } from '../../../hooks/useSystem.js';

const MAX_MOMENTUM = 6;

const SessionResourcesBar = ({ sessionId }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    const [resources, setResources] = useState({ momentum: 0, threat: 0 });
    const [loading,   setLoading]   = useState(true);

    // ── Chargement initial ────────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionId) return;
        fetchWithAuth(`${apiBase}/session-resources/${sessionId}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setResources(data); })
            .finally(() => setLoading(false));
    }, [sessionId, apiBase]);

    // ── Réception socket ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onUpdate = (data) => setResources(prev => ({ ...prev, ...data }));
        socket.on('session-resources-update', onUpdate);
        return () => socket.off('session-resources-update', onUpdate);
    }, [socket]);

    // ── Émission ──────────────────────────────────────────────────────────────
    const update = useCallback((field, delta) => {
        if (!socket || !sessionId) return;
        socket.emit('update-session-resources', { sessionId, field, delta });
    }, [socket, sessionId]);

    if (!sessionId || loading) return null;

    return (
        <div className="ac-resources-bar justify-center flex-wrap gap-4">

            {/* Momentum — clampé 0–6, modifiable par les joueurs */}
            <div className="ac-resource-item">
                <span className="ac-label">Momentum</span>
                <div className="flex items-center gap-1 mt-1">
                    <button
                        onClick={() => update('momentum', -1)}
                        disabled={resources.momentum <= 0}
                        className="ac-btn ac-btn-ghost w-6 h-6 flex items-center justify-center p-0 text-xs disabled:opacity-30"
                    >−</button>
                    <div className="flex gap-1">
                        {Array.from({ length: MAX_MOMENTUM }).map((_, i) => (
                            <div
                                key={i}
                                className={`ac-pip${i < resources.momentum ? ' active' : ''}`}
                                onClick={() => {
                                    const target = i + 1;
                                    const delta  = target === resources.momentum ? -1 : target - resources.momentum;
                                    update('momentum', delta);
                                }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => update('momentum', 1)}
                        disabled={resources.momentum >= MAX_MOMENTUM}
                        className="ac-btn ac-btn-ghost w-6 h-6 flex items-center justify-center p-0 text-xs disabled:opacity-30"
                    >+</button>
                </div>
                <span className="ac-text-muted text-center mt-0.5">{resources.momentum}/{MAX_MOMENTUM}</span>
            </div>

            <div style={{ width: 1, background: 'var(--ac-border)', alignSelf: 'stretch' }} />

            {/* Threat — lecture seule pour les joueurs */}
            <div className="ac-resource-item">
                <span className="ac-label" style={{ color: 'var(--ac-threat-color)' }}>Threat</span>
                <div className="ac-resource-value mt-1" style={{ color: 'var(--ac-threat-color)' }}>
                    {resources.threat}
                </div>
            </div>
        </div>
    );
};

export default SessionResourcesBar;