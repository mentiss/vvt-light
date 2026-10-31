// src/client/src/components/audio/AudioSessionToggle.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Élément prêt à l'emploi (documentations/spec_audio.md Q-31, Q-32, T-2) : active
// ou désactive la musique de la table, à poser par le slug dans son onglet
// Session. Un slug qui ne le pose pas n'a pas la musique.
// Personnalisable comme les HamburgerMenuItemXXX : label, icon, className.
//
//   <AudioSessionToggle sessionId={activeSession.id} className="vk-btn vk-btn-sm" />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';

const DefaultIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
    </svg>
);

/**
 * @param {object} props
 * @param {number} props.sessionId     table active
 * @param {(enabled: boolean) => React.ReactNode} [props.label] libellé selon l'état
 * @param {React.ReactNode|null} [props.icon] icône (null : aucune)
 * @param {string} [props.className]   classes du bouton (habillage du slug)
 */
const AudioSessionToggle = ({ sessionId, label, icon, className = 'vtt-btn vtt-btn-sm' }) => {
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    const [enabled, setEnabled] = useState(null);   // null : pas encore chargé
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        fetchRef.current(`/api/audio/sessions/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data && !cancelled) setEnabled(!!data.enabled); })
            .catch(err => console.error('[AudioSessionToggle] Load failed:', err));
        return () => { cancelled = true; };
    }, [sessionId]);

    // Activation changée ailleurs (autre onglet du MJ)
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const slug = getSystemFromPath();
        const onEnabled = (data) => {
            if (data?.system === slug && Number(data.sessionId) === Number(sessionId)) setEnabled(!!data.enabled);
        };
        socket.on('audio-enabled', onEnabled);
        return () => socket.off('audio-enabled', onEnabled);
    }, [socket, sessionId]);

    const toggle = async () => {
        setBusy(true);
        try {
            const res = await fetchRef.current(`/api/audio/sessions/${sessionId}/enabled`, { method: 'PUT', body: JSON.stringify({ enabled: !enabled }) });
            if (res.ok) setEnabled(!!(await res.json()).enabled);
        } catch (err) {
            console.error('[AudioSessionToggle] Toggle failed:', err);
        } finally {
            setBusy(false);
        }
    };

    const text = label ? label(!!enabled) : (enabled ? 'Musique activée' : 'Activer la musique');
    return (
        <button type="button" className={`vtt-audio-session-toggle ${className}${enabled ? ' is-active' : ''}`.trim()}
                onClick={toggle} disabled={!sessionId || enabled === null || busy} aria-pressed={!!enabled}
                title={enabled ? 'Désactiver la musique de la table (arrête la lecture chez tous)' : 'Activer la musique pour cette table'}>
            {icon === undefined ? <DefaultIcon /> : icon}
            {text}
        </button>
    );
};

export default AudioSessionToggle;
