// src/client/src/systems/tecumah/gm/GMView.jsx
// Shell principal de l'interface GM Tecumah.
// Onglets : Session · Ressources · Journal · Tableau · Historique
// Bouton dés flottant accessible depuis tous les onglets.

import React, {useState} from 'react';
import TecumahDiceModal from "../modals/TecumahDiceModal.jsx";
import TabSession from "./tabs/TabSession.jsx";
import TabResource from "./tabs/TabResource.jsx";
import TabJournal from "@/features/journal/TabJournal.jsx";
import Board      from '@/features/board/Board.jsx';
import DiceHistoryPage from "@/features/dice/history/DiceHistoryPage.jsx";
import ToastNotifications from "@/features/table/ToastNotifications.jsx";
import GMDiceModal from "./modals/GMDiceModal.jsx";
import { HamburgerMenu, HamburgerMenuSeparator } from "@/ui/menu/HamburgerMenu.jsx";
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from "@/features/table/HamburgerMenuItems.jsx";

const GM_TABS = [
    { id: 'session',    label: '📜 Session'    },
    { id: 'ressources', label: '⚡ Ressources'  },
    { id: 'journal',    label: '📓 Journal'     },
    { id: 'tableau', label: '🗺️ Tableau' },
    { id: 'historique', label: '🎲 Historique'  },
];

const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {

    const [activeTab,         setActiveTab]         = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showDiceModal,     setShowDiceModal]     = useState(false);   // (modales du menu : dans ses éléments)

    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}
            >
                <div className="flex items-center gap-3" style={{ flex: '0 0 auto', minWidth: 120 }}>
                    <h1 style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem', lineHeight: 1 }}>
                        🎭 Interface GM
                        {activeSession && (
                            <p className="ml-7" style={{fontWeight: '400', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {activeSession.name}
                            </p>
                        )}
                    </h1>

                </div>

                <div className="flex-1" style={{fontSize: '2rem', color: 'var(--color-primary)'}}>
                    <h1 className="text-center tecumah-font">Tecumah Gulch</h1>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Bouton dés */}
                    <button
                        onClick={() => setShowDiceModal(true)}
                        className="px-3 py-1.5 rounded text-sm font-semibold"
                        style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                        title="Lancer les dés"
                    >
                        🎲
                    </button>


                    {/* Thème */}
                    <button onClick={onToggleDarkMode} className="w-8 h-8 flex items-center justify-center rounded" style={{ fontSize: '1rem' }}>
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, emojis du slug */}
                    <HamburgerMenu button="☰">
                        <HamburgerMenuItemTableManagement
                            icon="🗂️"
                            activeSessionId={activeSession?.id}
                            onSelectTable={(session) => onSessionChange(session)}
                        />
                        <HamburgerMenuItemDiceConfig icon="⚙️" />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemLogout icon="🚪" />
                    </HamburgerMenu>
                </div>
            </header>

            {/* ── Onglets ──────────────────────────────────────────────────── */}
            <nav className="flex overflow-x-auto border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                {GM_TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => changeTab(t.id)}
                        className="flex-shrink-0 px-4 py-2 text-sm"
                        style={{
                            fontWeight:   activeTab === t.id ? 700 : 400,
                            color:        activeTab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* ── Contenu ──────────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w mx-auto px-4 py-4">

                    {activeTab === 'session' && (
                        <TabSession
                            activeSession={activeSession}
                            onlineCharacters={onlineCharacters}
                            onSessionChange={onSessionChange}
                        />
                    )}

                    {activeTab === 'ressources' && (
                        <TabResource activeSession={activeSession} />
                    )}

                    {activeTab === 'journal' && (
                        <TabJournal />
                    )}

                    {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                    {activeTab === 'tableau' && (
                        <div className="vtt-board-page">
                            <Board sessionId={activeSession?.id ?? null} role="gm" />
                        </div>
                    )}
                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeSession?.id ?? null}
                        />
                    )}
                </div>
            </main>

            {/* ── Overlays ─────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeSession?.id}
            />

            {showDiceModal && (
                <GMDiceModal
                    onClose={() => setShowDiceModal(false)}
                    sessionId={activeSession?.id ?? null}
                />
            )}

        </div>
    );
};

export default GMView;