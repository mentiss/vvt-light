// src/client/src/features/board/BoardSessionToggle.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Élément prêt à l'emploi (documentations/spec_tableau.md §10.8), à poser par le
// slug dans son onglet Session, comme AudioSessionToggle. Un slug qui ne le pose
// pas n'a pas le tableau pour ses joueurs. C'est une bascule : activer /
// désactiver le tableau de la table (le MJ y a toujours accès pour préparer).
// Personnalisable comme les HamburgerMenuItemXXX : label, icon, className.
//
//   <BoardSessionToggle sessionId={activeSession.id} className="vk-btn vk-btn-sm" />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useBoardSession } from './hooks/useBoardSession.js';

const DefaultIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4h18v12H3zM8 20l4-4 4 4M7 12l3-3 3 2 4-4" />
    </svg>
);

/**
 * @param {object} props
 * @param {number} props.sessionId     table active
 * @param {(enabled: boolean) => React.ReactNode} [props.label] libellé selon l'état
 * @param {React.ReactNode|null} [props.icon] icône (null : aucune)
 * @param {string} [props.className]   classes du bouton (habillage du slug)
 */
const BoardSessionToggle = ({ sessionId, label, icon, className = 'vtt-btn vtt-btn-sm' }) => {
    const board = useBoardSession(sessionId ?? null);
    const [busy, setBusy] = useState(false);
    const shownIcon = icon === undefined ? <DefaultIcon /> : icon;

    const toggle = async () => {
        setBusy(true);
        await board.setEnabled(!board.enabled);
        setBusy(false);
    };

    return (
        <button type="button" className={`vtt-board-session-toggle ${className}${board.enabled ? ' is-active' : ''}`.trim()}
                onClick={toggle} disabled={!sessionId || !board.loaded || busy} aria-pressed={board.enabled}
                title={board.enabled ? 'Les joueurs voient le tableau de cette table' : 'Activer le tableau pour cette table'}>
            {shownIcon}
            {label ? label(board.enabled) : (board.enabled ? 'Désactiver le tableau' : 'Activer le tableau')}
        </button>
    );
};

export default BoardSessionToggle;
