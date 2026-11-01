// src/client/src/components/layout/DiceHistoryPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau d'historique des jets (documentations/spec_ui_actions.md §6.4) : brique
// que le slug monte s'il le veut, à la RACINE de sa fiche ou de son interface MJ
// (pas dans un onglet, sinon elle disparaît avec lui).
//
// - Pose son action « Historique des jets » dans la zone d'actions (ActionZone.jsx).
// - Ouvert : une fenêtre flottante collée au côté droit, presque toute la hauteur,
//   déplaçable, redimensionnable, réductible, mémorisée par slug (FloatingPanel,
//   persistAs="history"), avec la liste commune (DiceHistoryList).
// - Ouverture mémorisée par slug : vtt:<slug>:history.
// Le rendu d'un jet est lu dans le config.jsx du slug, comme l'onglet.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import FloatingPanel from '../ui/FloatingPanel.jsx';
import { ZoneAction } from '../ui/ActionZone.jsx';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';
import DiceHistoryList from './DiceHistoryList.jsx';

const PREFS_DEFAULTS = { open: false };
const MIN_SIZE = { width: 300, height: 260 };
const OFFSET = { x: 0, y: 16 };

const HistoryIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 7v5l3 2" />
    </svg>
);

/**
 * @param {object} props
 * @param {number|null} [props.sessionId] table : jets de cette table seulement
 */
const DiceHistoryPanel = ({ sessionId = null }) => {
    const [prefs, setPrefs] = usePersistedState(getSystemFromPath(), 'history', { defaults: PREFS_DEFAULTS });
    const [openedByUser, setOpenedByUser] = useState(false);   // focus seulement après un clic (F-4)
    // Côté droit, presque toute la hauteur (en laissant la zone d'actions en bas), à la première ouverture
    const [defaultSize] = useState(() => ({ width: 360, height: Math.max(MIN_SIZE.height, window.innerHeight - 104) }));

    const toggle = () => {
        if (!prefs.open) setOpenedByUser(true);
        setPrefs(prev => ({ ...prev, open: !prev.open }));
    };

    return (
        <>
            <ZoneAction id="history" icon={<HistoryIcon />} label="Historique des jets" order={30}
                        active={prefs.open} onSelect={toggle} />
            {prefs.open && (
                <FloatingPanel title="Historique des jets" persistAs="history" onClose={toggle}
                               defaultSize={defaultSize} minSize={MIN_SIZE} defaultPosition="top-right" offset={OFFSET}
                               focusOnOpen={openedByUser} className="vtt-history-panel">
                    <div className="vtt-history-panel-body vtt-scroll">
                        <DiceHistoryList sessionId={sessionId} />
                    </div>
                </FloatingPanel>
            )}
        </>
    );
};

export default DiceHistoryPanel;
