// src/client/src/systems/achtung/gm/GMView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface GM Achtung! Cthulhu — 4 onglets :
//   Session     → personnages, ressources Momentum/Threat/Complications
//   Journal     → journal GM (générique TabJournal characterId=-1)
//   Historique  → historique dés toutes tables
//   Référence   → résumé règles 2D20 + focus table

import React, { useState, useCallback } from 'react';
import { useAuth }   from '../../../context/AuthContext.jsx';
import { useSystem } from '../../../hooks/useSystem.js';

import ToastNotifications from '../../../components/layout/ToastNotifications.jsx';
import ThemeToggle        from '../../../components/ui/ThemeToggle.jsx';
import DiceConfigModal    from '../../../components/modals/DiceConfigModal.jsx';
import TabJournal         from '../../../components/gm/tabs/TabJournal.jsx';
import DiceHistoryPage    from '../../../components/layout/DiceHistoryPage.jsx';

import TabSession         from './tabs/TabSession.jsx';
import AchtungHistoryEntry from '../components/AchtungHistoryEntry.jsx';

// ── Onglets ───────────────────────────────────────────────────────────────────

const GM_TABS = [
    { id: 'session',    label: '⛶ Session'    },
    { id: 'journal',    label: '⧉ Journal'     },
    { id: 'historique', label: '▤ Historique'  },
];

// ── GMView ────────────────────────────────────────────────────────────────────

const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const { logout } = useAuth();
    const { slug }   = useSystem();

    const [activeTab,     setActiveTab]     = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showMenu,      setShowMenu]      = useState(false);
    const [showDiceConfig,setShowDiceConfig]= useState(false);

    const changeTab = useCallback((id) => {
        setActiveTab(id);
        window.location.hash = id;
    }, []);

    const handleLogout = useCallback(async () => {
        setShowMenu(false);
        await logout();
        window.location.href = `/${slug}/gm`;
    }, [logout, slug]);

    return (
        <div className="min-h-screen bg-bg text-default">
            <ToastNotifications />

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="ac-header">
                <div className="flex items-center gap-2">
                    <span className="ac-font-title text-primary" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        GM — Achtung! Cthulhu
                    </span>
                    {activeSession && (
                        <span className="ac-pill text-secondary" style={{ fontSize: '0.65rem' }}>
                            {activeSession.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className={`ac-menu-btn${showMenu ? ' open' : ''}`}
                        >☰</button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="ac-menu-dropdown">
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); window.location.href = `/${slug}/`; }}>
                                        👤 Vue Joueur
                                    </button>
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>
                                        🎲 Config animations dés
                                    </button>
                                    <div className="ac-menu-separator" />
                                    <button className="ac-menu-item danger" onClick={handleLogout}>
                                        🚪 Déconnexion
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── ONGLETS ─────────────────────────────────────────────────── */}
            <nav className="ac-nav-bar">
                {GM_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className={`ac-tab${activeTab === tab.id ? ' active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-3 py-4">

                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onSessionChange={onSessionChange}
                        onlineCharacters={onlineCharacters}
                    />
                )}

                {activeTab === 'journal' && (
                    <TabJournal
                        characterId={-1}
                        sessionId={activeSession?.id ?? null}
                    />
                )}

                {activeTab === 'historique' && (
                    <DiceHistoryPage
                        sessionId={activeSession?.id ?? null}
                        renderHistoryEntry={(entry) => <AchtungHistoryEntry roll={entry} />}
                    />
                )}
            </div>

            {/* ── MODALES ─────────────────────────────────────────────────── */}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
        </div>
    );
};

export default GMView;