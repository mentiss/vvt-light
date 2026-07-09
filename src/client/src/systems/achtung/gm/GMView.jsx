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

import TabSession          from './tabs/TabSession.jsx';
import GMDiceModal         from './modals/GMDiceModal.jsx';
import AchtungHistoryEntry from '../components/AchtungHistoryEntry.jsx';
import achtungHistoryEntry from "../components/AchtungHistoryEntry.jsx";
import DiceEntryHistory from "../../cyberpunk/components/layout/DiceEntryHistory.jsx";
import FreeDiceModal from "../../../components/modals/FreeDiceModal.jsx";

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

    const [activeTab,      setActiveTab]      = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showMenu,       setShowMenu]       = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showDiceModal,  setShowDiceModal]  = useState(false);
    const [showFreeDice, setShowFreeDice] = useState(false);

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
        <div className="min-h-screen bg-default text-default">
            <ToastNotifications
                sessionId={activeSession?.id}
                renderDiceToast={(entry) => {
                    const adapted = { ...entry, details: entry.roll_result };
                    return <AchtungHistoryEntry roll={adapted}  />;
                }}
            />

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="ac-header">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                        <div className="ac-page-title">Achtung! Cthulhu</div>
                    </div>
                    {activeSession && (
                        <span className="ac-pill text-secondary" style={{ fontSize: '0.65rem' }}>
                            {activeSession.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Bouton dés GM — accessible depuis tous les onglets */}
                    <button
                        onClick={() => setShowDiceModal(true)}
                        className="ac-btn ac-btn-primary"
                        title="Jet de dés GM"
                    >
                        🎲
                    </button>

                    <button
                        onClick={() => setShowFreeDice(true)}
                        className="text-default hover:text-accent transition-colors p-1"
                        title="Lancer des dés"
                    >
                        <svg viewBox="0 0 48 48" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                            {/* Contour hexagonal du d20 vu de face */}
                            <polygon
                                points="24,2 42,13 42,35 24,46 6,35 6,13"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
                            />
                            {/* Triangles intérieurs caractéristiques du d20 */}
                            <polygon
                                points="24,2 42,13 6,13"
                                fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7"
                            />
                            <line x1="24" y1="2"  x2="24" y2="46" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                            <line x1="6"  y1="13" x2="42" y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                            <line x1="42" y1="13" x2="6"  y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                        </svg>
                    </button>

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
            <div className="mb-1 ac-subheader-bar">
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
            </div>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <div className="">

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
            {showDiceConfig && (
                <DiceConfigModal onClose={() => setShowDiceConfig(false)} />
            )}

            {showDiceModal && (
                <GMDiceModal
                    onClose={() => setShowDiceModal(false)}
                    sessionId={activeSession?.id ?? null}
                />
            )}

            {showFreeDice && (
                <FreeDiceModal
                    characterId={char.id}
                    characterName={`${char.nom ?? ''} ${char.prenom ?? ''}`.trim()}
                    sessionId={activeGMSession}
                    onClose={() => setShowFreeDice(false)}
                />
            )}
        </div>
    );
};

export default GMView;