// src/client/src/features/board/BoardLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche « tableau » des pages génériques (documentations/spec_tableau.md §10.8),
// montée par GMPage et PlayerPage avec la table active, comme AudioLayer.
// - Joueur : rien si le tableau de la table est désactivé ; sinon le bouton
//   « Tableau » de la zone d'actions (mis en avant quand le MJ montre une nouvelle
//   diapositive), le bandeau « Le MJ partage un visuel » (Q-6), et la fenêtre
//   flottante du tableau, réductible, en plein écran par son bouton, fermable.
// - MJ : le bouton et la fenêtre (sans plein écran : son onglet en tient lieu),
//   même tableau désactivé (il prépare ses diapositives).
// Ouverture mémorisée par slug et par rôle (vtt:<slug>:board-gm, vtt:<slug>:board-player),
// position par FloatingPanel (vtt:<slug>:panel:board-<rôle>).
// Les slugs n'ont rien à faire ici ; ils peuvent en plus poser <Board> dans un onglet.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useBoardSession } from './hooks/useBoardSession.js';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { ZoneAction } from '@/features/table/ActionZone.jsx';
import FloatingPanel from '@/ui/panel/FloatingPanel.jsx';
import Board from './Board.jsx';

const LAYOUT_DEFAULTS = { open: false };
const PANEL_SIZE = { width: 720, height: 520 };

const BoardIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4h18v12H3zM8 20l4-4 4 4M7 12l3-3 3 2 4-4" />
    </svg>
);

/**
 * @param {object} props
 * @param {'gm'|'player'} props.role
 * @param {number|null}   props.sessionId table active
 */
const BoardLayer = ({ role, sessionId }) => {
    const isGM = role === 'gm';
    const board = useBoardSession(sessionId ?? null);
    // Une clé par rôle : MJ et joueur dans le même navigateur (onglets) ne partagent pas leur fenêtre
    const [layout, setLayout] = usePersistedState(getSystemFromPath(), `board-${role}`, { defaults: LAYOUT_DEFAULTS });
    const [seenId, setSeenId] = useState(null);   // dernière diapositive montrée que le joueur a vue

    if (!sessionId || !board.loaded) return null;
    if (!board.enabled && !isGM) return null;

    const shownSlide = board.slides.find(s => s.id === board.shownSlideId) ?? null;
    const unseen = !isGM && !layout.open && !!shownSlide && shownSlide.id !== seenId;

    const setOpen = (open) => {
        if (!open && shownSlide) setSeenId(shownSlide.id);
        setLayout(prev => ({ ...prev, open }));
    };

    return (
        <>
            <ZoneAction id="board" icon={<BoardIcon />} label="Tableau" order={30}
                        active={layout.open} highlighted={unseen} onSelect={() => setOpen(!layout.open)} />

            {unseen && (
                <div className="vtt-board-banner" role="status">
                    <span>Le MJ partage un visuel : <strong>{shownSlide.name}</strong></span>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => setOpen(true)}>Voir</button>
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setSeenId(shownSlide.id)} aria-label="Masquer">✕</button>
                </div>
            )}

            {layout.open && (
                <FloatingPanel title="Tableau" titleExtra={isGM ? undefined : shownSlide?.name} onClose={() => setOpen(false)}
                               expandable={!isGM} defaultSize={PANEL_SIZE} defaultPosition="center" persistAs={`board-${role}`}
                               className="vtt-board-panel">
                    <Board sessionId={sessionId} role={role} compact />
                </FloatingPanel>
            )}
        </>
    );
};

export default BoardLayer;
