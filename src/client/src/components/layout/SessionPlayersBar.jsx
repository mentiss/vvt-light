// src/client/src/components/layout/SessionPlayersBar.jsx
// Panneau latéral des personnages de la session (fiche joueur, tous les slugs).
// Composant générique habillable : classes vtt-session-bar-* (style par défaut dans
// index.css, surcharges dans le theme.css du slug). Voir documentations/spec_session_bar.md.
// Trois modes mémorisés par slug : panneau, rail, masqué. Survol d'un avatar : carte flottante.

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal }      from 'react-dom';
import { useSocket }         from '../../context/SocketContext.jsx';
import { toSystemUrl, useFetch } from '../../hooks/useFetch.js';
import useSystem from "../../hooks/useSystem.js";

const MODES            = ['panel', 'rail', 'hidden'];
const CARD_OPEN_DELAY  = 150;   // ms de survol avant d'ouvrir la carte
const CARD_CLOSE_DELAY = 80;    // laisse passer d'un avatar au voisin sans clignotement

const ICONS = {
    rail:   'M11 17l-5-5 5-5M18 17l-5-5 5-5',
    panel:  'M13 7l5 5-5 5M6 7l5 5-5 5',
    hidden: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12.8 12.8 0 0 1-3.2 4.2M6.6 6.6C4.3 8 2.7 10.2 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 5.4-1.6',
    reopen: 'M9 5l7 7-7 7',
};

// Mode mémorisé ; reprend les anciennes valeurs (« 1 » = réduit → masqué, « 0 » = ouvert → panneau)
function readMode(key) {
    try {
        const value = localStorage.getItem(key);
        if (value === '1') return 'hidden';
        return MODES.includes(value) ? value : 'panel';
    } catch {
        return 'panel';
    }
}

// Initiales du personnage (deux au plus), affichées quand il n'a pas d'avatar
function getInitials(name = '') {
    const words = name.split(/[\s-]+/).filter(w => /^\p{Lu}/u.test(w));
    return (words.length ? words.slice(0, 2).map(w => w[0]).join('') : name.charAt(0)).toUpperCase();
}

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);

const ToggleButton = ({ mode, label, onClick }) => (
    <button type="button" className="vtt-session-bar-toggle" onClick={() => onClick(mode)} title={label} aria-label={label}>
        <Icon d={ICONS[mode]} />
    </button>
);

const PlayerAvatar = ({ char }) => (
    <>
        <span className="vtt-session-bar-frame">
            {char.avatar
                ? <img className="vtt-session-bar-image" src={char.avatar} alt={char.name} />
                : <span className="vtt-session-bar-initials">{getInitials(char.name)}</span>}
        </span>
        {char.isOnline && <span className="vtt-session-bar-presence" />}
    </>
);

const PlayerCard = ({ char, ref }) => (
    <div
        ref={ref}
        className="vtt-session-bar-card"
        data-me={char.isMe || undefined}
        data-online={char.isOnline || undefined}
        aria-hidden="true"
    >
        <div className="vtt-session-bar-card-deco" />
        <div className="vtt-session-bar-card-image">
            {char.avatar ? <img src={char.avatar} alt="" /> : getInitials(char.name)}
        </div>
        <div className="vtt-session-bar-card-name">{char.name}</div>
        {char.playerName && <div className="vtt-session-bar-card-player-name">{char.playerName}</div>}
        <div className="vtt-session-bar-card-status">
            {char.isMe ? 'Vous' : char.isOnline ? 'En ligne' : 'Hors ligne'}
        </div>
    </div>
);

const SessionPlayersBar = ({ character, sessionId, sessionName, headerHeight = null, bottomHeight = null, noWidthWhenCollapsed = false }) => {
    const [sessionCharacters, setSessionCharacters] = useState([]);
    const [onlineCharacters,  setOnlineCharacters]  = useState([]);
    const [isListFixed,       setIsListFixed]        = useState(false);
    const [isButtonScrolled,  setIsButtonScrolled]   = useState(false);
    const [hovered,           setHovered]            = useState(null);   // { char, anchor } de la carte ouverte

    const socket        = useSocket();
    const fetchWithAuth = useFetch();
    const {slug} = useSystem();
    const STORAGE_KEY = `${slug}_player_session_bar`;

    const [mode,        setMode]        = useState(() => readMode(STORAGE_KEY));
    const [lastVisible, setLastVisible] = useState(mode === 'rail' ? 'rail' : 'panel');
    const isHidden = mode === 'hidden';

    const barRef    = useRef(null);
    const listRef   = useRef(null);
    const cardRef   = useRef(null);
    const timersRef = useRef({});

    // Mémoriser le mode
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* stockage indisponible */ }
    }, [mode, STORAGE_KEY]);

    // Détecter le scroll pour fixer la liste
    useEffect(() => {
        if (bottomHeight !== null && isHidden) return;
        const handleScroll = () => {
            setIsListFixed(window.scrollY > 100 && !isHidden);
            setIsButtonScrolled(window.scrollY > 100 && isHidden);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHidden, bottomHeight]);

    // Charger les personnages de la session
    useEffect(() => {
        if (!sessionId) { setSessionCharacters([]); return; }
        fetchWithAuth(`/api/sessions/${sessionId}`)
            .then(res => res.json())
            .then(session => setSessionCharacters(session.characters || []))
            .catch(err => console.error('[SessionPlayersBar] Error loading session characters:', err));
    }, [sessionId]);

    // Composition de la table modifiée par le MJ (ajout / retrait d'un personnage)
    useEffect(() => {
        if (!socket || !sessionId) return;
        const handleComposition = ({ system, sessionId: id, session }) => {
            if (system === slug && String(id) === String(sessionId)) setSessionCharacters(session.characters || []);
        };
        socket.on('session-characters-update', handleComposition);
        return () => socket.off('session-characters-update', handleComposition);
    }, [socket, sessionId, slug]);

    // Écouter les mises à jour des personnages en ligne
    useEffect(() => {
        if (!socket) return;
        const handleOnlineUpdate = (characters) => setOnlineCharacters(characters);
        fetch(toSystemUrl('/api/online-characters'))
            .then(res => res.json())
            .then(setOnlineCharacters)
            .catch(console.error);
        socket.on('online-characters-update', handleOnlineUpdate);
        return () => socket.off('online-characters-update', handleOnlineUpdate);
    }, [socket]);

    // ── Carte flottante ───────────────────────────────────────────────────────
    const closeCard = (now = false) => {
        clearTimeout(timersRef.current.open);
        clearTimeout(timersRef.current.close);
        if (now) setHovered(null);
        else timersRef.current.close = setTimeout(() => setHovered(null), CARD_CLOSE_DELAY);
    };

    const openCard = (char, anchor) => {
        clearTimeout(timersRef.current.open);
        clearTimeout(timersRef.current.close);
        // Carte déjà ouverte : bascule immédiate d'un avatar à l'autre
        if (hovered) setHovered({ char, anchor });
        else timersRef.current.open = setTimeout(() => setHovered({ char, anchor }), CARD_OPEN_DELAY);
    };

    // Position : à droite de la liste, centrée sur l'avatar, dans l'espace visible
    // (sous le bandeau du slug, au-dessus du bas de l'écran)
    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!hovered || !card || !listRef.current) return;
        const barRect  = barRef.current.getBoundingClientRect();
        const listRect = listRef.current.getBoundingClientRect();
        const anchor   = hovered.anchor.getBoundingClientRect();
        const height   = card.offsetHeight;
        const minTop   = Math.max(barRect.top, headerHeight ?? 0, 0) + 8;
        const maxTop   = window.innerHeight - (bottomHeight ?? 0) - height - 8;
        // Position et plan posés ici : la carte est un enfant direct de <body>, qu'un thème
        // peut viser sans couche (ex. Achtung : body > * { position: relative })
        card.style.position = 'fixed';
        card.style.zIndex   = 'var(--vtt-z-session-card)';
        card.style.left = `${listRect.right + 12}px`;
        card.style.top  = `${Math.max(minTop, Math.min(anchor.top + anchor.height / 2 - height / 2, maxTop))}px`;
        card.classList.add('is-open');
    }, [hovered, headerHeight, bottomHeight]);

    // Fermeture : Échap, défilement
    useEffect(() => {
        if (!hovered) return;
        const close = () => setHovered(null);
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('scroll', close, { passive: true });
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', close);
        };
    }, [hovered]);

    // Minuteries annulées au démontage
    useEffect(() => () => {
        clearTimeout(timersRef.current.open);
        clearTimeout(timersRef.current.close);
    }, []);

    const changeMode = (next) => {
        if (next !== 'hidden') setLastVisible(next);
        setMode(next);
        closeCard(true);
    };

    const charactersWithStatus = sessionCharacters.map(char => ({
        ...char,
        isOnline: onlineCharacters.some(oc => oc.slug === slug && oc.characterId === char.id),   // id unique par slug seulement
        isMe:     char.id === character?.id,
    }));

    if (!sessionId || sessionCharacters.length === 0) return null;

    const title = sessionName || 'Session active';

    // Liste fixée au défilement : sous le bandeau collant du slug s'il fournit
    // headerHeight (sinon tout en haut).
    const listFixedStyle = isListFixed ? {
        top:    headerHeight ?? 0,
        height: headerHeight ? `calc(100vh - ${headerHeight}px)` : '100vh',
    } : undefined;

    return (
        <>
            <aside ref={barRef} className="vtt-session-bar" data-mode={mode}>
                <div className="vtt-session-bar-header">
                    <div className="vtt-session-bar-heading">
                        <div className="vtt-session-bar-eyebrow">Table</div>
                        <div className="vtt-session-bar-title" title={title}>{title}</div>
                    </div>
                    <div className="vtt-session-bar-actions">
                        {mode === 'rail'
                            ? <ToggleButton mode="panel" label="Déplier la barre" onClick={changeMode} />
                            : <ToggleButton mode="rail"  label="Réduire en rail"  onClick={changeMode} />}
                        <ToggleButton mode="hidden" label="Masquer la barre" onClick={changeMode} />
                    </div>
                </div>

                <div ref={listRef} className={`vtt-session-bar-list${isListFixed ? ' is-fixed' : ''}`} style={listFixedStyle}>
                    {charactersWithStatus.map(char => (
                        <div
                            key={char.id}
                            className="vtt-session-bar-player"
                            data-me={char.isMe || undefined}
                            data-online={char.isOnline || undefined}
                        >
                            <div
                                className="vtt-session-bar-avatar"
                                onMouseEnter={e => openCard(char, e.currentTarget)}
                                onMouseLeave={() => closeCard()}
                            >
                                <PlayerAvatar char={char} />
                            </div>
                            <div className="vtt-session-bar-text">
                                <div className="vtt-session-bar-name">{char.name}</div>
                                <div className="vtt-session-bar-player-name">{char.playerName}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Spacer pour garder la marge en mode masqué */}
            {!noWidthWhenCollapsed && (
                <div
                    className="shrink-0 transition-all duration-300"
                    style={{ width: isHidden ? '3rem' : 0 }}
                />
            )}

            {/* Bouton flottant pour rouvrir (dernier mode visible) */}
            {isHidden && (
                <button
                    type="button"
                    onClick={() => changeMode(lastVisible)}
                    className="vtt-session-bar-reopen"
                    style={{
                        top:    headerHeight !== null ? `${headerHeight + 8}px` : (isButtonScrolled ? 0 : undefined),
                        bottom: bottomHeight !== null ? `${bottomHeight + 8}px` : undefined,
                    }}
                    title="Afficher la table"
                    aria-label="Afficher la table"
                >
                    <Icon d={ICONS.reopen} />
                </button>
            )}

            {/* Carte flottante : rendue dans <body> pour n'être rognée par aucun conteneur */}
            {hovered && createPortal(<PlayerCard ref={cardRef} char={hovered.char} />, document.body)}
        </>
    );
};

export default SessionPlayersBar;
