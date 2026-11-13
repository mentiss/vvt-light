// features/journal/JournalLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche « journal » des pages génériques (spec_journal.md R-2, R-14, partie III §13.1),
// montée par PlayerPage (personnage chargé) et GMPage (-1), comme BoardLayer : le bouton
// « Journal » de la zone d'actions (compteur des non lus) et la fenêtre flottante compacte
// pour noter sans quitter la fiche. Déplaçable, redimensionnable, réductible, mémorisée
// par slug et par navigateur (FloatingPanel, persistAs « journal »). Ouverture et dernière
// note ouverte gardées par slug (vtt:<slug>:journal-panel).
// Les slugs n'ont rien à faire ici.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { ZoneAction } from '@/features/table/ActionZone.jsx';
import FloatingPanel from '@/ui/panel/FloatingPanel.jsx';
import { useJournalData } from './hooks/useJournalData.js';
import { journalCounts } from './JournalProvider.jsx';
import JournalMini from './JournalMini.jsx';

const PANEL_OPTIONS = { defaults: { open: false, scope: 'private', lastId: null } };
const PANEL_SIZE = { width: 340, height: 440 };
const PANEL_MIN = { width: 260, height: 220 };

const JournalIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M8 7h7" />
    </svg>
);

/**
 * @param {object}    props
 * @param {number}    props.characterId  personnage (-1 = MJ)
 * @param {Function} [props.onRead]      une entrée non lue vient d'être ouverte (compteur de l'onglet)
 */
const JournalLayer = ({ characterId, onRead }) => {
    const data = useJournalData(characterId);
    const [panel, setPanel] = usePersistedState(getSystemFromPath(), 'journal-panel', PANEL_OPTIONS);
    const unread = journalCounts(data).total;
    const setOpen = (open) => setPanel(prev => ({ ...prev, open }));
    const scope = panel.scope === 'table' ? 'table' : 'private';

    return (
        <>
            <ZoneAction id="journal" icon={<JournalIcon />} label="Journal" order={50}
                        active={panel.open} badge={unread} onSelect={() => setOpen(!panel.open)} />
            {panel.open && (
                <FloatingPanel title="Journal" onClose={() => setOpen(false)} persistAs="journal"
                               defaultSize={PANEL_SIZE} minSize={PANEL_MIN} defaultPosition="bottom-right"
                               className="vtt-journal-mini">
                    <JournalMini characterId={characterId} onRead={onRead} scope={scope}
                                 onScope={next => setPanel(prev => ({ ...prev, scope: next, lastId: null }))}
                                 lastId={panel.lastId} onLastId={lastId => setPanel(prev => ({ ...prev, lastId }))} />
                </FloatingPanel>
            )}
        </>
    );
};

export default JournalLayer;
