// src/client/src/systems/cyberpunk/gm/GMView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface GM Cyberpunk — 5 onglets :
//   Session   → liste perso, gestion ressources (générique TabSession)
//   Clocks    → horloges de campagne + session
//   Threats   → menaces liées aux clocks
//   Manœuvres → validation des moves custom en attente
//   Journal   → journal GM (générique TabJournal)
// ─────────────────────────────────────────────────────────────────────────────

import React, {useState, useRef} from 'react';
import { useFetch }   from '../../../hooks/useFetch.js';
import { useSystem }  from '../../../hooks/useSystem.js';

import ToastNotifications   from '../../../components/layout/ToastNotifications.jsx';
import HistoryPanel         from '../../../components/layout/HistoryPanel.jsx';
import ThemeToggle          from '../../../components/ui/ThemeToggle.jsx';
import TabJournal           from '../../../components/gm/tabs/TabJournal.jsx';
import { HamburgerMenu, HamburgerMenuItem } from '../../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemFreeDice, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../../components/ui/HamburgerMenuItems.jsx';

import cyberpunkConfig, { STAT_LABELS } from '../config.jsx';
import TabSession from "./tabs/TabSession.jsx";
import TabClocks from "./tabs/TabClocks.jsx";
import TabThreats from "./tabs/TabThreats.jsx";
import TabMoves from "./tabs/TabMoves.jsx";
import DiceEntryHistory from "../components/layout/DiceEntryHistory.jsx";
import DiceHistoryPage from "../../../components/layout/DiceHistoryPage.jsx";
import BoltFarm from "../components/ui/BoltFarm.jsx";
import ReferenceTab from "../components/ReferenceTab.jsx";

// ── Onglets GM ────────────────────────────────────────────────────────────────

const GM_TABS = [
    { id: 'session',   label: '⛶ Session'   },
    { id: 'clocks',    label: '⏱ Clocks'     },
    { id: 'threats',   label: '⚠ Menaces'    },
    { id: 'moves',     label: '⬡ Manœuvres'  },
    { id: 'history',   label: '▤ Historique'  },
    { id: 'journal',   label: '⧉ Journal'   },
    { id: 'reference',  label: '◈ Référence' },
];


// ── TabMoves — validation des moves custom ────────────────────────────────────

// ── GMView principal ──────────────────────────────────────────────────────────

const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const [activeTab,          setActiveTab]          = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [historyPanelOpen,   setHistoryPanelOpen]   = useState(false);
    const pendingExpandThreatRef = useRef(null);

    const changeTab = (id) => {
        setActiveTab(id);
        // eslint-disable-next-line react-hooks/immutability
        window.location.hash = id;
    };

    // Compte des moves en attente (badge sur l'onglet)
    const [pendingMovesCount, setPendingMovesCount] = useState(0);

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
            data-theme={darkMode ? 'dark' : undefined}
        >
            <ToastNotifications
                sessionId={activeSession?.id}
                renderDiceToast={(entry) => {
                    return (<DiceEntryHistory roll={entry}  />)
                }}
                renderAllRollTypes
            />

            {/* ── Header ───────────────────────────────────────────────── */}
            <header
                className="flex items-center justify-between px-4 py-3 sticky top-0 z-30"
                style={{
                    background:   'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    boxShadow:    '0 2px 12px rgba(0,0,0,0.5)',
                }}
            >
                <div className="text-center ml-3 gap-0 min-w-0 group relative flex flex-col items-center">

                    <div  className="relative cp-brand-glitch cp-brand-pulse">
                        <BoltFarm />

                        <div className="text-[38px] cp-font-title text-accent tracking-widest cp-brand-stroke relative z-10">
                            CyberPunk
                        </div>
                    </div>

                    <div className="relative mt-0.5 mb-0.5 cp-divider w-full opacity-70"></div>
                    <p className="relative text-xs cp-font-ui uppercase tracking-widest text-muted">
                        {activeSession ? (
                            <>
                                Session : <b>{activeSession.name}</b>
                            </>
                        ) : (
                            <>
                                The Sprawl — édition Ré²
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    {/* Hamburger générique (spec_ui_menu.md), habillé dans theme.css, emojis du slug */}
                    <HamburgerMenu>
                        <HamburgerMenuItemTableManagement
                            icon="🗂"
                            activeSessionId={activeSession?.id}
                            onSelectTable={(session) => onSessionChange?.(session)}
                        />
                        <HamburgerMenuItemFreeDice icon="⬡" sessionId={activeSession?.id ?? null} isGM />
                        <HamburgerMenuItemDiceConfig icon="🎲" />
                        {/* Propre au slug : panneau latéral d'historique */}
                        <HamburgerMenuItem icon="📜" onClick={() => setHistoryPanelOpen(true)}>
                            Historique des jets
                        </HamburgerMenuItem>
                        <HamburgerMenuItemLogout icon="🔒" />
                    </HamburgerMenu>
                </div>
            </header>

            {/* ── Nav onglets ───────────────────────────────────────────── */}
            <nav
                className="flex border-b overflow-x-auto"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            >
                {GM_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className={`group relative flex-1 py-3 text-sm font-semibold cp-font-ui uppercase tracking-wide transition-colors
                         ${activeTab === tab.id ? 'text-primary' : 'text-muted'}
                         bg-none border-none cursor-pointer
                         `}
                    >
                        <span className={`transition-all duration-200 ${activeTab === tab.id ? '' : 'group-hover:text-default group-hover:cp-neon-glow'}`}>
                            {tab.label}
                        </span>
                        {/* Badge moves en attente */}
                        {tab.id === 'moves' && pendingMovesCount > 0 && (
                            <span
                                className="absolute top-2 right-1 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                                style={{ background: 'var(--cp-neon-amber)', color: 'var(--color-bg)' }}
                            >
                                {pendingMovesCount}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <span
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: 'var(--color-primary)', boxShadow: 'var(--cp-glow-cyan)' }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Contenu ───────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto cp-scroll max-w-full w-full mx-auto">

                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onlineCharacters={onlineCharacters}
                        onSessionChange={onSessionChange}
                    />
                )}

                {activeTab === 'clocks' && (
                    <TabClocks
                        activeSession={activeSession}
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                        onGoToThreat={(threatId) => {
                            changeTab('threats');
                            // Stocké dans un ref pour que TabThreats puisse lire à son mount
                            pendingExpandThreatRef.current = threatId;
                        }}
                    />
                )}

                {activeTab === 'threats' && (
                    <TabThreats
                        activeSession={activeSession}
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                        expandThreatId={pendingExpandThreatRef.current}
                        onExpandConsumed={() => { pendingExpandThreatRef.current = null; }}
                    />
                )}

                {activeTab === 'moves' && (
                    <TabMoves
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                        onPendingCount={setPendingMovesCount}
                    />
                )}

                {activeTab === 'journal' && (
                    <div className="m-1">
                        <TabJournal characterId={-1} />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="m-1">
                        <DiceHistoryPage
                            sessionId={activeSession?.id}
                            renderHistoryEntry={cyberpunkConfig.dice.renderHistoryEntry}
                            renderAllRollTypes
                        />
                    </div>
                )}

                {activeTab === 'reference' && (
                    <ReferenceTab />
                )}
            </main>

            {/* ── Panneau d'historique (les modales du menu vivent dans ses éléments) ── */}
            <HistoryPanel
                isOpen={historyPanelOpen}
                onClose={() => setHistoryPanelOpen(false)}
                sessionId={activeSession?.id}
                renderHistoryEntry={cyberpunkConfig.dice.renderHistoryEntry}
                renderAllRollTypes
            />
        </div>
    );
};

export default GMView;