// src/client/src/systems/vileborn/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ (l'Obscurité) — spec_vileborn.md §II.8 :
//   - bande fixe comme la fiche joueur : marque, thème, menu ; onglets
//     Session · Journal · Historique · Aide de jeu ; actions : dé d'obscurité, jet libre ;
//   - Session : musique de la table, Parias et leur fiche, jouable et
//     modifiable par le MJ (gm/tabs/TabSession.jsx) ;
//   - Journal (TabJournal), Historique (DiceHistoryPage), panneau d'historique
//     (DiceHistoryPanel, zone d'actions) : briques de la plateforme.
// Contenu directement ici, sans GMView.
//
// Contrat props (GMPage) : activeSession, onSessionChange, onlineCharacters,
// characterUpdates, darkMode, onToggleDarkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '../../components/layout/DiceHistoryPanel.jsx';
import TabJournal         from '../../components/gm/tabs/TabJournal.jsx';
import Board              from '../../components/board/Board.jsx';
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';
import { useHashTab }     from '../../hooks/useHashTab.js';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

import VilTopBar from './components/ui/VilTopBar.jsx';
import VilDarkDieModal from './components/modals/VilDarkDieModal.jsx';
import { D12Icon } from './components/ui/VilUi.jsx';
import { useTableCharacters } from './hooks/useTableCharacters.js';
import { useBoxSize } from './hooks/useBoxSize.js';
import TabSession from './gm/tabs/TabSession.jsx';
import { REFERENCE_SECTIONS } from './config/reference.js';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'journal',    label: 'Journal' },
    { id: 'tableau', label: 'Tableau' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab] = useHashTab(TABS, 'session');   // onglet gardé au rafraîchissement
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const [darkOpen, setDarkOpen] = useState(false);
    const [freeOpen, setFreeOpen] = useState(false);
    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const sessionId = activeSession?.id ?? null;

    return (
        <div className="vil-root" style={{ '--vil-band-h': `${band.height ?? 0}px` }}>
            <VilTopBar ref={stickyRef} subtitle={`Obscurité${activeSession ? ` · ${activeSession.name}` : ''}`}
                       darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} tabs={TABS} active={activeTab} onSelect={setActiveTab}
                       menu={<>
                           <HamburgerMenuItemTableManagement activeSessionId={sessionId}
                                                             onSelectTable={(session) => onSessionChange?.(session)} />
                           <HamburgerMenuItemDiceConfig />
                           <HamburgerMenuSeparator />
                           <HamburgerMenuItemLogout />
                       </>}
                       actions={<>
                           <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setFreeOpen(true)}>Jet libre</button>
                           <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary vil-dark-btn" onClick={() => setDarkOpen(true)}
                                   title="Dé d'obscurité"><D12Icon /> Obscurité</button>
                       </>} />

            <main className="vil-sheet-body">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters}
                                characters={characters} order={order} loading={loading} patchCharacter={patchCharacter}
                                onSessionChange={onSessionChange} />
                )}
                {activeTab === 'journal' && <div className="vil-page"><TabJournal characterId={-1} /></div>}
                {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={activeSession?.id ?? null} role="gm" />
                    </div>
                )}
                {activeTab === 'historique' && <div className="vil-page"><DiceHistoryPage sessionId={sessionId} /></div>}
                {activeTab === 'aide' && <div className="vil-page"><ReferenceGuide sections={REFERENCE_SECTIONS} isGM placeholder="Rechercher une règle (ex. dé d'obscurité, Igritte, défi)…" /></div>}
            </main>

            {darkOpen && <VilDarkDieModal sessionId={sessionId} onClose={() => setDarkOpen(false)} />}
            {freeOpen && <FreeDiceModal sessionId={sessionId} isGM onClose={() => setFreeOpen(false)} />}

            <ToastNotifications sessionId={sessionId} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={sessionId} />
        </div>
    );
};

export default GMApp;
