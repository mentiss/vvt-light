// src/client/src/systems/achtung/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface GM Achtung! Cthulhu (contenu directement ici, sans GMView) — onglets :
//   Session     → personnages, ressources Momentum/Threat/Complications
//   PNJ         → onglet PNJ de la plateforme (components/npc/TabNpcs.jsx), partie système
//                 components/npc/ (spec_pnj.md §10.4)
//   Journal     → journal GM (générique TabJournal characterId=-1)
//   Tableau     → tableau partagé
//   Historique  → historique dés toutes tables
//
// Contrat plateforme (GMPage) :
//   activeSession     — session active ou null
//   onSessionChange   — callback(session)
//   onlineCharacters  — tableau de présences
//   darkMode          — booléen
//   onToggleDarkMode  — callback
// Le mode nuit passe par [data-theme] sur <html> (posé par la plateforme), theme.css est chargé par la page.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import ThemeToggle        from '../../components/ui/ThemeToggle.jsx';
import TabJournal         from '../../components/gm/tabs/TabJournal.jsx';
import Board              from '../../components/board/Board.jsx';
import TabNpcs            from '../../components/npc/TabNpcs.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemPlayerView, HamburgerMenuItemDiceConfig,
    HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import GMDiceModal         from './gm/modals/GMDiceModal.jsx';
import achtungConfig       from './config.jsx';

// ── Onglets ───────────────────────────────────────────────────────────────────

const GM_TABS = [
    { id: 'session',    label: '⛶ Session'    },
    { id: 'pnj',        label: '◉ PNJ'        },
    { id: 'journal',    label: '⧉ Journal'     },
    { id: 'tableau', label: '◫ Tableau' },
    { id: 'historique', label: '▤ Historique'  },
];

// ── GMApp ─────────────────────────────────────────────────────────────────────

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const [activeTab,      setActiveTab]      = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    // Modales du menu : dans ses éléments (spec_ui_menu.md)
    const [showDiceModal,  setShowDiceModal]  = useState(false);
    const [showFreeDice, setShowFreeDice] = useState(false);

    const changeTab = useCallback((id) => {
        setActiveTab(id);
        window.location.hash = id;
    }, []);


    return (
        <div className="min-h-screen bg-default text-default">
            <ToastNotifications
                sessionId={activeSession?.id}
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

                    {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, emojis du slug ;
                        gestion des tables ajoutée (D-8), en plus de l'onglet Session */}
                    <HamburgerMenu button="☰">
                        <HamburgerMenuItemTableManagement
                            icon="🗂"
                            activeSessionId={activeSession?.id}
                            onSelectTable={(session) => onSessionChange?.(session)}
                        />
                        <HamburgerMenuItemPlayerView icon="👤" />
                        <HamburgerMenuItemDiceConfig icon="🎲" />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemLogout icon="🚪" />
                    </HamburgerMenu>
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

                {activeTab === 'pnj' && (
                    <div className="ac-npc-page">
                        <TabNpcs sessionId={activeSession?.id ?? null} config={achtungConfig.npc} />
                    </div>
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

            {/* ── MODALES ─────────────────────────────────────────────────── */}
            {showDiceModal && (
                <GMDiceModal
                    onClose={() => setShowDiceModal(false)}
                    sessionId={activeSession?.id ?? null}
                />
            )}

            {showFreeDice && (
                <FreeDiceModal
                    sessionId={activeSession?.id ?? null}
                    isGM
                    onClose={() => setShowFreeDice(false)}
                />
            )}
        </div>
    );
};

export default GMApp;
