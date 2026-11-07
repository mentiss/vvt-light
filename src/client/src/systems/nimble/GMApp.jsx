// src/client/src/systems/nimble/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Nimble (spec_nimble.md §6.4) :
//   - bande fixe comme la fiche joueur : marque, thème, menu ; onglets
//     Session · Rencontre · Journal · Historique · Tableau · Aide de jeu ; action : jet libre ;
//   - Session : musique, tableau partagé, héros de la table et leur fiche (gm/tabs/TabSession.jsx) ;
//   - Rencontre : monstres, PV, armure, sbires, attaques (gm/tabs/TabEncounter.jsx) ;
//   - Journal (TabJournal), Historique (DiceHistoryPage), Tableau (Board),
//     panneau d'historique (DiceHistoryPanel, zone d'actions) : briques de la plateforme.
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
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';
import Board              from '../../components/board/Board.jsx';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { useHashTab }     from '../../hooks/useHashTab.js';
import { HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

import NbTopBar from './components/ui/NbTopBar.jsx';
import { D20Icon } from './components/ui/NbUi.jsx';
import { useTableCharacters } from './hooks/useTableCharacters.js';
import { useBoxSize } from './hooks/useBoxSize.js';
import TabSession from './gm/tabs/TabSession.jsx';
import TabEncounter from './gm/tabs/TabEncounter.jsx';
import { REFERENCE_SECTIONS } from './config/reference.js';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'rencontre',  label: 'Rencontre' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'tableau',    label: 'Tableau' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab] = useHashTab(TABS, 'session');   // onglet gardé au rafraîchissement
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const [freeOpen, setFreeOpen] = useState(false);
    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const sessionId = activeSession?.id ?? null;

    return (
        <div className="nb-root" style={{ '--nb-band-h': `${band.height ?? 0}px` }}>
            <NbTopBar ref={stickyRef} subtitle={`Meneur${activeSession ? ` · ${activeSession.name}` : ''}`}
                      darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} tabs={TABS} active={activeTab} onSelect={setActiveTab}
                      menu={<>
                          <HamburgerMenuItemTableManagement activeSessionId={sessionId}
                                                            onSelectTable={(session) => onSessionChange?.(session)} />
                          <HamburgerMenuItemDiceConfig />
                          <HamburgerMenuSeparator />
                          <HamburgerMenuItemLogout />
                      </>}
                      actions={<button type="button" className="nb-icon-btn" onClick={() => setFreeOpen(true)} title="Jet libre"><D20Icon /> Jet libre</button>} />

            <main className="nb-sheet-body">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters}
                                characters={characters} order={order} loading={loading} patchCharacter={patchCharacter}
                                onSessionChange={onSessionChange} />
                )}
                {activeTab === 'rencontre' && <TabEncounter activeSession={activeSession} heroes={Math.max(1, order.length)} />}
                {activeTab === 'journal' && <div className="nb-page"><TabJournal characterId={-1} /></div>}
                {activeTab === 'historique' && <div className="nb-page"><DiceHistoryPage sessionId={sessionId} /></div>}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={sessionId} role="gm" />
                    </div>
                )}
                {activeTab === 'aide' && <div className="nb-page"><ReferenceGuide sections={REFERENCE_SECTIONS} isGM placeholder="Rechercher une règle, un sort, un monstre (ex. sbire, armure lourde, gobelin)…" /></div>}
            </main>

            {freeOpen && <FreeDiceModal sessionId={sessionId} isGM onClose={() => setFreeOpen(false)} />}

            <ToastNotifications sessionId={sessionId} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={sessionId} />
        </div>
    );
};

export default GMApp;
