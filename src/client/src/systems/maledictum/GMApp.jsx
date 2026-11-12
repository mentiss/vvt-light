// src/client/src/systems/maledictum/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Imperium Maledictum (spec_maledictum.md §11.4) :
//   - thème de l'Ordo du Patron de la table (Ordo Hereticus par défaut) ;
//   - bande fixe comme la fiche joueur : marque, thème, menu ; onglets
//     Session · Patron · Rencontre · Tableau · Journal · Historique · Aide de jeu ;
//     action : jet libre ;
//   - Session : musique, tableau partagé, acolytes de la table et leur fiche (gm/tabs/TabSession.jsx) ;
//   - Patron : fiche de groupe, Supériorité, Subtilité (gm/tabs/TabPatron.jsx) ;
//   - Rencontre : onglet PNJ de la plateforme (features/npc/TabNpcs.jsx) ; bestiaire en
//     bibliothèque, Blessures, Blessures critiques, jets (partie système : components/npc/) ;
//   - Journal (TabJournal), Historique (DiceHistoryPage), Tableau (Board),
//     panneau d'historique (DiceHistoryPanel, zone d'actions) : briques de la plateforme.
// Contenu directement ici, sans GMView.
//
// Contrat props (GMPage) : activeSession, onSessionChange, onlineCharacters,
// characterUpdates, darkMode, onToggleDarkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import ToastNotifications from '@/features/table/ToastNotifications.jsx';
import DiceHistoryPage    from '@/features/dice/history/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '@/features/dice/history/DiceHistoryPanel.jsx';
import TabJournal         from '@/features/journal/TabJournal.jsx';
import FreeDiceModal      from '@/features/dice/modals/FreeDiceModal.jsx';
import Board              from '@/features/board/Board.jsx';
import ReferenceGuide     from '@/features/reference/ReferenceGuide.jsx';
import { useHashTab }     from '@/ui/hooks/useHashTab.js';
import { HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';

import MlTopBar from './components/ui/MlTopBar.jsx';
import { DiceIcon } from './components/ui/MlUi.jsx';
import { useTableCharacters } from '@/features/table/hooks/useTableCharacters.js';
import { useBoxSize } from './hooks/useBoxSize.js';
import { usePatron } from './hooks/usePatron.js';
import { useLivery } from './hooks/useLivery.js';
import { themeForPatron } from './config/rules/themes.js';
import TabSession from './gm/tabs/TabSession.jsx';
import TabPatron from './gm/tabs/TabPatron.jsx';
import TabNpcs from '@/features/npc/TabNpcs.jsx';
import maledictumConfig from './config.jsx';
import { REFERENCE_SECTIONS } from './config/reference.js';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'patron',     label: 'Patron' },
    { id: 'rencontre',  label: 'Rencontre' },
    { id: 'tableau',    label: 'Tableau' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab] = useHashTab(TABS, 'session');   // onglet gardé au rafraîchissement
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const [freeOpen, setFreeOpen] = useState(false);
    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const sessionId = activeSession?.id ?? null;
    const patronState = usePatron(sessionId);
    useLivery(themeForPatron(patronState.patron));

    return (
        <div className="im" style={{ '--im-band-h': `${band.height ?? 0}px`, '--vtt-reference-top': `${band.height ?? 0}px` }}>
            <MlTopBar ref={stickyRef} subtitle={`Meneur${activeSession ? ` · ${activeSession.name}` : ''}`}
                      darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} tabs={TABS} active={activeTab} onSelect={setActiveTab}
                      menu={<>
                          <HamburgerMenuItemTableManagement activeSessionId={sessionId}
                                                            onSelectTable={(session) => onSessionChange?.(session)} />
                          <HamburgerMenuItemDiceConfig />
                          <HamburgerMenuSeparator />
                          <HamburgerMenuItemLogout />
                      </>}
                      actions={<button type="button" className="im-icon-btn is-wide" onClick={() => setFreeOpen(true)} title="Jet libre"><DiceIcon /> Jet libre</button>} />

            <main className="im-sheet-body is-gm">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} patron={patronState.patron} patronState={patronState}
                                characters={characters} order={order} loading={loading} patchCharacter={patchCharacter}
                                onSessionChange={onSessionChange} />
                )}
                {activeTab === 'patron' && <TabPatron activeSession={activeSession} patronState={patronState} />}
                {activeTab === 'rencontre' && <TabNpcs sessionId={sessionId} config={maledictumConfig.npc} />}
                {activeTab === 'journal' && <div className="im-tab-page"><TabJournal /></div>}
                {activeTab === 'historique' && <div className="im-tab-page"><DiceHistoryPage sessionId={sessionId} /></div>}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={sessionId} role="gm" />
                    </div>
                )}
                {activeTab === 'aide' && <div className="im-tab-page"><ReferenceGuide sections={REFERENCE_SECTIONS} isGM placeholder="Rechercher une règle, un talent, un PNJ (ex. Subtilité, Faveur, Gangster)…" /></div>}
            </main>

            {freeOpen && <FreeDiceModal sessionId={sessionId} isGM onClose={() => setFreeOpen(false)} />}

            <ToastNotifications sessionId={sessionId} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={sessionId} />
        </div>
    );
};

export default GMApp;
