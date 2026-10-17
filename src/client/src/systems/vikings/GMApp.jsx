// src/client/src/systems/vikings/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Vikings — architecture fusionnée (plus d'indirection GMView) :
// bandeau, onglets et modales globales vivent ici.
// Spec : documentations/spec_vikings_lot3_client.md §5.1.
//
// Contrat props (GMPage) :
//   activeSession, onSessionChange, onlineCharacters, characterUpdates,
//   darkMode, onToggleDarkMode
//
// Le combat (hors périmètre de la refonte) est fourni tel quel par useCombat.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import './theme.css';

import ThemeToggle          from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications   from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage      from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal      from '../../components/modals/DiceConfigModal.jsx';
import FreeDiceModal        from '../../components/modals/FreeDiceModal.jsx';
import TableManagementModal from '../../components/gm/modals/TableManagementModal.jsx';
import TabJournal           from '../../components/gm/tabs/TabJournal.jsx';
import { useAuth }          from '../../context/AuthContext.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import TabCombat           from './gm/tabs/TabCombat.jsx';
import GMDiceModal         from './gm/modals/GMDiceModal.jsx';
import { useCombat }       from './gm/useCombat.js';
import VikingsHistoryEntry from './components/layout/VikingsHistoryEntry.jsx';
import vikingsConfig       from './config.jsx';

const TABS = [
    { id: 'session',    label: '📜 Session' },
    { id: 'combat',     label: '⚔️ Combat' },
    { id: 'journal',    label: '📓 Journal' },
    { id: 'historique', label: '🎲 Historique' },
];

const MenuItem = ({ onClick, danger = false, children }) => (
    <button onClick={onClick}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-alt ${danger ? 'text-danger' : 'text-default'}`}>
        {children}
    </button>
);

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const { logout } = useAuth();
    const combat     = useCombat(onlineCharacters);
    const sessionId  = activeSession?.id ?? null;

    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.substring(1);
        return TABS.some(t => t.id === hash) ? hash : 'session';
    });
    useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

    const [showMenu,       setShowMenu]       = useState(false);
    const [showTableMgmt,  setShowTableMgmt]  = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showGMDice,     setShowGMDice]     = useState(false);

    const goHome = () => {
        window.history.pushState({}, '', '/');
        window.location.reload();
    };
    const handleLogout = async () => {
        await logout();
        goHome();
    };
    const openMenuEntry = (open) => () => { setShowMenu(false); open(); };

    return (
        <div className="min-h-screen bg-default text-default transition-colors">

            {/* ── HEADER ── */}
            <header className="bg-surface border-b-2 border-default shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold font-viking text-primary">Interface MJ</h1>
                        <div className="text-sm text-muted truncate">
                            {activeSession ? <>Table : <span className="font-semibold">{activeSession.name}</span></> : 'Aucune table active'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setShowGMDice(true)} title="Jet MJ (pool de d10)"
                                className="px-3 py-1.5 bg-primary text-default rounded text-sm font-semibold">
                            🎲 Jet MJ
                        </button>
                        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                        <div className="relative">
                            <button onClick={() => setShowMenu(v => !v)} title="Menu"
                                    className="px-3 py-2 bg-surface-alt border border-default rounded font-semibold text-default">
                                ☰
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-xl border-2 border-primary z-50 py-1">
                                        <MenuItem onClick={openMenuEntry(() => setShowTableMgmt(true))}>📋 Gestion des tables</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowFreeDice(true))}>🎲 Jet de dés libre</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowDiceConfig(true))}>🎛️ Config animations dés</MenuItem>
                                        <div className="border-t border-default my-1" />
                                        <MenuItem onClick={openMenuEntry(goHome)}>🏠 Retour à l'accueil</MenuItem>
                                        <MenuItem onClick={openMenuEntry(handleLogout)} danger>🚪 Déconnexion</MenuItem>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Onglets */}
                <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 shrink-0 ${
                                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </header>

            {/* ── CONTENU ── */}
            <main className="max-w-7xl mx-auto p-4">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characterUpdates={characterUpdates} />
                )}
                {activeTab === 'combat' && <TabCombat {...combat} />}
                {activeTab === 'journal' && (
                    <div className="max-w-4xl mx-auto">
                        {/* TabJournal force characterId={-1} en interne */}
                        <TabJournal />
                    </div>
                )}
                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto">
                        <DiceHistoryPage sessionId={sessionId} renderHistoryEntry={vikingsConfig.dice.renderHistoryEntry} />
                    </div>
                )}
            </main>

            {/* ── Éléments globaux ── */}
            <ToastNotifications
                sessionId={sessionId}
                renderDiceToast={(toast) => <VikingsHistoryEntry entry={toast} compact />}
            />

            {showTableMgmt && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTableMgmt(false)}
                    activeSessionId={sessionId}
                    onSelectTable={(session) => onSessionChange(session ?? null)}
                />
            )}
            {showGMDice && <GMDiceModal onClose={() => setShowGMDice(false)} darkMode={darkMode} sessionId={sessionId} />}
            {showFreeDice && <FreeDiceModal sessionId={sessionId} isGM onClose={() => setShowFreeDice(false)} />}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
        </div>
    );
};

export default GMApp;
