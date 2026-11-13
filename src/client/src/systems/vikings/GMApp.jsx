// src/client/src/systems/vikings/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Vikings — architecture fusionnée (plus d'indirection GMView) :
// bandeau, onglets et modales globales vivent ici.
// Spec : documentations/spec_vikings_lot3_client.md §5.1, habillage lot 4.
//
// Contrat props (GMPage) :
//   activeSession, onSessionChange, onlineCharacters, characterUpdates,
//   darkMode, onToggleDarkMode
//
// theme.css est chargé par GMPage (import.meta.glob), pas importé ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';

import ToastNotifications   from '@/features/table/ToastNotifications.jsx';
import DiceHistoryPage      from '@/features/dice/history/DiceHistoryPage.jsx';
import TabJournal           from '@/features/journal/TabJournal.jsx';
import ReferenceGuide       from '@/features/reference/ReferenceGuide.jsx';
import Board                from '@/features/board/Board.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemFreeDice, HamburgerMenuItemDiceConfig,
    HamburgerMenuItemHome, HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';

import TabNpcs             from '@/features/npc/TabNpcs.jsx';
import vikingsConfig       from './config.jsx';
import TabSession          from './gm/tabs/TabSession.jsx';
import GMDiceModal         from './gm/modals/GMDiceModal.jsx';
import VkIcon              from './components/ui/VkIcon.jsx';
import VkLookMenuItems     from './components/ui/VkLookMenuItems.jsx';
import VkSky               from './components/ui/VkSky.jsx';
import { useVkLookOnRoot } from './hooks/useVkLook.js';
import { REFERENCE_SECTIONS } from './config/reference.js';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'pnj',        label: 'PNJ' },
    { id: 'tableau',    label: 'Tableau' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const sessionId  = activeSession?.id ?? null;
    useVkLookOnRoot();   // habillage choisi (pierre peinte / bois et or) posé sur <html>

    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.substring(1);
        return TABS.some(t => t.id === hash) ? hash : 'session';
    });
    useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

    const [showGMDice,     setShowGMDice]     = useState(false);

    return (
        <div className="vk-root min-h-screen">
            {/* Ciel vivant (pierre peinte) ; l'état du corps reste propre à la page joueur */}
            <VkSky />

            {/* ── BANDEAU + ONGLETS (collants) ── */}
            <div className="sticky top-0 z-40">
                <header className="vk-header px-4 py-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                        <div className="vk-title text-2xl flex items-center gap-2"><VkIcon name="helm" />Interface MJ</div>
                        <div className="vk-eyebrow truncate">{activeSession ? `Table : ${activeSession.name}` : 'Aucune table active'}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => setShowGMDice(true)} className="vk-btn vk-btn-primary vk-btn-sm" title="Jet MJ (pool de d10)">
                            <VkIcon name="die" />Jet MJ
                        </button>
                        <button type="button" onClick={onToggleDarkMode} className="vk-btn vk-btn-icon"
                                title={darkMode ? 'Mode jour (bois)' : 'Mode nuit (fer)'}>
                            <VkIcon name={darkMode ? 'sun' : 'moon'} />
                        </button>
                        <HamburgerMenu button={<VkIcon name="menu" />} buttonClassName="vk-btn vk-btn-icon">
                            <HamburgerMenuItemTableManagement
                                icon={<VkIcon name="people" />}
                                activeSessionId={sessionId}
                                onSelectTable={(session) => onSessionChange(session ?? null)}
                            />
                            <HamburgerMenuItemFreeDice icon={<VkIcon name="dice" />} sessionId={sessionId} isGM />
                            <HamburgerMenuItemDiceConfig icon={<VkIcon name="horn" />} />
                            <HamburgerMenuSeparator />
                            <VkLookMenuItems />
                            <HamburgerMenuSeparator />
                            <HamburgerMenuItemHome icon={<VkIcon name="longhouse" />} />
                            <HamburgerMenuItemLogout icon={<VkIcon name="door" />} />
                        </HamburgerMenu>
                    </div>
                </header>

                <div className="vk-tabbar px-4 bg-surface">
                    <nav className="vk-tabs">
                        {TABS.map(tab => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={`vk-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ── CONTENU (toute la largeur) ── */}
            <main className="p-4 md:p-6">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characterUpdates={characterUpdates}
                                onSessionChange={onSessionChange} />
                )}
                {/* PNJ : onglet de la plateforme, partie système components/npc/ (spec_pnj.md §10.2) */}
                {activeTab === 'pnj' && <TabNpcs sessionId={sessionId} config={vikingsConfig.npc} />}
                {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={sessionId} role="gm" />
                    </div>
                )}
                {/* Journal : toute la largeur (spec_journal.md) */}
                {activeTab === 'journal' && <TabJournal />}
                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto">
                        <DiceHistoryPage sessionId={sessionId} />
                    </div>
                )}
                {activeTab === 'aide' && <ReferenceGuide sections={REFERENCE_SECTIONS} isGM placeholder="Rechercher une règle (ex. seuil, berserk, tempête)…" />}
            </main>

            {/* ── Modales globales (celles du menu vivent dans ses éléments) ── */}
            {showGMDice && <GMDiceModal onClose={() => setShowGMDice(false)} darkMode={darkMode} sessionId={sessionId} />}

            {/* Notifications en dernier : devant les modales (même z-index) */}
            <ToastNotifications
                sessionId={sessionId}
            />
        </div>
    );
};

export default GMApp;
