// src/client/src/systems/deltagreen/gm/GMView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface GM Delta Green.
// Onglets : Session (agents) + Journal.
// Pas de TabCombat en v1 — initiative légère dans TabSession.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

import ToastNotifications   from '../../../components/layout/ToastNotifications.jsx';
import TableManagementModal from '../../../components/gm/modals/TableManagementModal.jsx';
import TabJournal           from '../../../components/gm/tabs/TabJournal.jsx';
import TabSession from "./tabs/TabSession.jsx";
import DiceHistoryPage from "../../../components/layout/DiceHistoryPage.jsx";
import deltgreenConfig from "../config.jsx";
import FreeDiceModal from "../../../components/modals/FreeDiceModal.jsx";
import { HamburgerMenu, HamburgerMenuSeparator } from "../../../components/ui/HamburgerMenu.jsx";
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from "../../../components/ui/HamburgerMenuItems.jsx";

const GM_TABS = [
    { id: 'session', label: 'Agents'   },
    { id: 'journal', label: 'Journal'  },
    { id: 'historique', label: 'Historique'  },
];

const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    // Modales du menu : dans ses éléments (spec_ui_menu.md)
    const [showFreeDice, setShowFreeDice] = useState(false);

    const [activeTab,      setActiveTab]      = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showTableModal, setShowTableModal] = useState(false);

    const changeTab = (id) => {
        setActiveTab(id);
        // eslint-disable-next-line react-hooks/immutability
        window.location.hash = id;
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-default text-default"
            data-theme={darkMode ? 'dark' : 'light'}
        >

            <ToastNotifications
                sessionId={activeSession?.id || null}
                renderDiceToast={deltgreenConfig.dice.renderHistoryEntry}
                renderAllRollTypes
            />

            {/* ── En-tête GM ──────────────────────────────────────────────── */}
            <header className="dg-header px-4 py-2 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    {/* Logo / titre */}
                    <h1 className="dg-font-delta text-4xl font-black tracking-widest uppercase text-white">
                        DELTA GREEN
                    </h1>
                    {/* Nom de l'agent */}
                    <span className="text-xs text-gray-400 dg-font-admin uppercase tracking-wider hidden sm:block">
                        OFFICIER TRAITANT
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {activeSession && (
                        <span className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5">
                            {activeSession.name}
                        </span>
                    )}
                    <button
                        onClick={() => setShowFreeDice(true)}
                        className="text-xs font-mono text-muted hover:text-accent px-1 py-1 transition-colors"
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
                    <button
                        onClick={() => setShowTableModal(true)}
                        className="text-xs font-mono border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-3 py-1 transition-colors"
                    >
                        Table
                    </button>
                    <button
                        onClick={onToggleDarkMode}
                        className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1 border border-gray-700 hover:border-gray-500 transition-colors"
                    >
                        {darkMode ? '◑' : '○'}
                    </button>
                    {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, sans icônes comme avant */}
                    <HamburgerMenu button="☰">
                        <HamburgerMenuItemCreateCharacter icon={null} />
                        <HamburgerMenuItemDiceConfig icon={null} />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemLogout icon={null} />
                    </HamburgerMenu>
                </div>
            </header>

            {/* ── Navigation ──────────────────────────────────────────────── */}
            <nav className="flex border-b border-default bg-surface">
                {GM_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className={[
                            'px-5 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                            activeTab === tab.id
                                ? 'text-default border-b-2 border-accent'
                                : 'text-muted hover:text-default',
                        ].join(' ')}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── Contenu ─────────────────────────────────────────────────── */}
            <main className="flex-1 flex overflow-y-auto">
                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onlineCharacters={onlineCharacters}
                    />
                )}
                {activeTab === 'journal' && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-full mx-auto px-4 py-6">
                            <TabJournal characterId={-1} />
                        </div>
                    </div>
                )}
                {activeTab === 'historique' && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-4 py-6">
                            <DiceHistoryPage
                                sessionId={activeSession?.id || null}
                                renderHistoryEntry={deltgreenConfig.dice.renderHistoryEntry}
                                renderAllRollTypes
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* ── Modale gestion table ─────────────────────────────────────── */}
            {showTableModal && (
                <TableManagementModal
                    isOpen
                    activeSession={activeSession || null}
                    onSelectTable={(session) => { onSessionChange?.(session); setShowTableModal(false); }}
                    onClose={() => setShowTableModal(false)}
                />
            )}

            {showFreeDice && (
                <FreeDiceModal
                    sessionId={activeSession || null}
                    isGM={true}
                    onClose={() => setShowFreeDice(false)}
                />
            )}
        </div>
    );
};

export default GMView;