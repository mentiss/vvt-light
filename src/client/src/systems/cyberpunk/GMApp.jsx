// src/client/src/systems/cyberpunk/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Cyberpunk (spec_cyberpunk.md §6) :
//   Session    → agents de la table, fiche du personnage choisi
//   Opération  → menaces et leurs horloges, horloges libres (réservé au MJ)
//   Manœuvres  → validation des manœuvres personnalisées en attente
//   Historique, Journal, Tableau, Référence
// En-tête : météo de la table (suivie par les joueurs) ; barre d'onglets : horloges épinglées.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFetch }   from '../../hooks/useFetch.js';
import { useSystem }  from '../../hooks/useSystem.js';

import ToastNotifications   from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPanel     from '../../components/layout/DiceHistoryPanel.jsx';
import ThemeToggle          from '../../components/ui/ThemeToggle.jsx';
import TabJournal           from '../../components/gm/tabs/TabJournal.jsx';
import Board                from '../../components/board/Board.jsx';
import { HamburgerMenu } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemFreeDice, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

import { STAT_LABELS } from './config.jsx';
import TabSession from "./gm/tabs/TabSession.jsx";
import TabOperation from "./gm/tabs/TabOperation.jsx";
import { useOperation } from "./gm/useOperation.js";
import { useTableWeather, WEATHERS } from "./hooks/useTableWeather.js";
import CpClock from "./components/ui/CpClock.jsx";
import TabMoves from "./gm/tabs/TabMoves.jsx";
import DiceEntryHistory from "./components/layout/DiceEntryHistory.jsx";
import DiceHistoryPage from "../../components/layout/DiceHistoryPage.jsx";
import BoltFarm from "./components/ui/BoltFarm.jsx";
import ReferenceTab from "./components/ReferenceTab.jsx";
import CpWorld, { CpAnimationsMenuItem } from "./components/ui/CpWorld.jsx";
import CpIcon from "./components/ui/CpIcon.jsx";

// ── Onglets GM ────────────────────────────────────────────────────────────────
// Opération remplace Horloges et Menaces ; leurs anciennes ancres y mènent

const GM_TABS = [
    { id: 'session',   label: 'Session',    icon: 'session'   },
    { id: 'operation', label: 'Opération',  icon: 'operation' },
    { id: 'tableau',   label: 'Tableau',    icon: 'board'     },
    { id: 'moves',     label: 'Manœuvres',  icon: 'moves'     },
    { id: 'history',   label: 'Historique', icon: 'history'   },
    { id: 'journal',   label: 'Journal',    icon: 'journal'   },
    { id: 'reference', label: 'Référence',  icon: 'reference' },
];


// ── TabMoves — validation des moves custom ────────────────────────────────────

// ── GMApp principal ──────────────────────────────────────────────────────────

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const [activeTab,          setActiveTab]          = useState(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'clocks' || hash === 'threats') return 'operation';
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });

    // Horloges et menaces : chargées ici pour l'onglet Opération ET la barre d'onglets
    const op = useOperation({ fetchWithAuth, apiBase, sessionId: activeSession?.id ?? null });
    const pinnedClocks = op.clocks.filter(c => c.pinned);

    // Météo de la table (spec §3.1) : le MJ la choisit, les joueurs la suivent
    const { weather, setWeather } = useTableWeather(activeSession?.id ?? null);

    const changeTab = (id) => {
        setActiveTab(id);
        // eslint-disable-next-line react-hooks/immutability
        window.location.hash = id;
    };

    // Compte des moves en attente (badge sur l'onglet)
    const [pendingMovesCount, setPendingMovesCount] = useState(0);

    return (
        <div className="cp-root flex flex-col h-screen">
            {/* Ville et météo derrière l'interface (spec_cyberpunk.md §3.1) */}
            <CpWorld weather={weather} />
            <ToastNotifications
                sessionId={activeSession?.id}
            />

            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="cp-bar flex items-center justify-between px-4 py-3 sticky top-0 z-30">
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
                    {activeSession && (
                        <div className="cp-weather" title="Météo de la table : suivie par les joueurs">
                            <span className="cp-field-label">Météo</span>
                            <div className="cp-seg">
                                {WEATHERS.map(w => (
                                    <button key={w.id} type="button" className={weather === w.id ? 'is-on' : ''} onClick={() => setWeather(w.id)}>{w.label}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    {/* Hamburger générique (spec_ui_menu.md), habillé dans theme.css, icônes dessinées du slug */}
                    <HamburgerMenu>
                        <HamburgerMenuItemTableManagement
                            icon={<CpIcon name="tables" />}
                            activeSessionId={activeSession?.id}
                            onSelectTable={(session) => onSessionChange?.(session)}
                        />
                        <HamburgerMenuItemFreeDice icon={<CpIcon name="d10" />} sessionId={activeSession?.id ?? null} isGM />
                        <HamburgerMenuItemDiceConfig icon={<CpIcon name="gear" />} />
                        <CpAnimationsMenuItem />
                        <HamburgerMenuItemLogout icon={<CpIcon name="logout" />} />
                    </HamburgerMenu>
                </div>
            </header>

            {/* ── Onglets : à leur largeur, horloges épinglées à droite (spec §3.2) ── */}
            <nav className="cp-tabs">
                {GM_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className={`cp-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                    >
                        <CpIcon name={tab.icon} size="sm" />
                        {tab.label}
                        {/* Badge moves en attente */}
                        {tab.id === 'moves' && pendingMovesCount > 0 && (
                            <span className="cp-tab-badge is-accent">{pendingMovesCount}</span>
                        )}
                    </button>
                ))}
                {pinnedClocks.length > 0 && (
                    <div className="cp-tabs-aside">
                        {pinnedClocks.map(c => (
                            <button key={c.id} type="button" className="cp-pin" onClick={() => changeTab('operation')}
                                    title={c.consequence ? `${c.name} → ${c.consequence}` : c.name}>
                                <CpClock segments={c.segments} current={c.current} size={24} />
                                <span className="cp-pin-name">{c.name}</span>
                                <span className="cp-pin-val">{c.current}/{c.segments}</span>
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* ── Contenu ───────────────────────────────────────────────── */}
            {/* Défile ici ; la fiche de la Session défile dans ses propres colonnes */}
            <main className="flex-1 min-h-0 overflow-y-auto cp-scroll w-full">

                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onlineCharacters={onlineCharacters}
                        onSessionChange={onSessionChange}
                    />
                )}

                {activeTab === 'operation' && <TabOperation op={op} />}

                {activeTab === 'moves' && (
                    <TabMoves
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                        onPendingCount={setPendingMovesCount}
                    />
                )}

                {activeTab === 'journal' && (
                    <div className="m-1">
                        <TabJournal />
                    </div>
                )}

                {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={activeSession?.id ?? null} role="gm" />
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="m-1">
                        <DiceHistoryPage
                            sessionId={activeSession?.id}
                        />
                    </div>
                )}

                {activeTab === 'reference' && (
                    <ReferenceTab isGM />
                )}
            </main>

            {/* ── Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md §6.4) ── */}
            <DiceHistoryPanel sessionId={activeSession?.id ?? null} />
        </div>
    );
};

export default GMApp;