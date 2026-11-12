// src/client/src/systems/fabula/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée GM — contrat imposé par GMPage.jsx.
//
// Note d'architecture : contrairement au pattern GMApp→GMView utilisé sur les
// autres slugs (une indirection qui ne fait que relayer les props sans
// aucune logique propre), on fusionne tout ici directement. Pas de raison de
// garder un fichier intermédiaire qui n'apporte rien — à reprendre comme
// nouveau standard sur les prochains slugs.
//
// Header (titre + actions) + onglets Session/Journal/Historique/Référence. Modales
// globales (Table, Config dés, Jet libre) vivent ici, pas dans TabSession.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

import ToastNotifications from '@/features/table/ToastNotifications.jsx';
import DiceHistoryPage    from '@/features/dice/history/DiceHistoryPage.jsx';
import FreeDiceModal      from '@/features/dice/modals/FreeDiceModal.jsx';
import { HamburgerMenu, HamburgerMenuItem, HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import TabNpcs            from '@/features/npc/TabNpcs.jsx';
import { useHashTab }     from '@/ui/hooks/useHashTab.js';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';
import TabJournal          from '@/features/journal/TabJournal.jsx';
import Board               from '@/features/board/Board.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import ReferenceTab        from './components/ReferenceTab.jsx';
import FuBand              from './components/ui/FuBand.jsx';
import FuIcon              from './components/ui/FuIcon.jsx';
import FuWorld             from './components/ui/FuWorld.jsx';
import GroupSheet          from './components/group/GroupSheet.jsx';
import FuGmDiceModal       from './components/modals/FuGmDiceModal.jsx';
import fabulaConfig        from './config.jsx';

const TABS = [
    { id: 'session',    label: 'Session',    icon: 'party' },
    { id: 'groupe',     label: 'Groupe',     icon: 'bond' },
    { id: 'pnj',        label: 'PNJ',        icon: 'sword' },
    { id: 'tableau',    label: 'Tableau',    icon: 'map' },
    { id: 'journal',    label: 'Journal',    icon: 'journal' },
    { id: 'historique', label: 'Historique', icon: 'scroll' },
    { id: 'reference',  label: 'Référence',  icon: 'book' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab]       = useHashTab(TABS, 'session');   // onglet gardé au rafraîchissement
    // (modales du menu : dans ses éléments, spec_ui_menu.md)
    const [showFreeDice, setShowFreeDice] = useState(false);
    const [showGmDice, setShowGmDice]     = useState(false);

    return (
        <div className="fu-root fu-font-body">
            <FuWorld />

            {/* ── BANDE ───────────────────────────────────────────────────── */}
            <FuBand subtitle="Meneur de jeu" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} onDice={() => setShowFreeDice(true)}>
                {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, icônes du slug ;
                    déconnexion ajoutée (D-4) */}
                <HamburgerMenu button={<FuIcon name="menu" />} buttonClassName="fu-icon-btn">
                    <HamburgerMenuItemTableManagement
                        icon={<FuIcon name="gear" />}
                        activeSessionId={activeSession?.id ?? null}
                        onSelectTable={(session) => onSessionChange?.(session)}
                    />
                    {/* Jet du MJ sur les règles des joueurs, sans PNJ (spec_pnj.md §10.7, F-1) */}
                    <HamburgerMenuItem icon={<FuIcon name="dice" />} onClick={() => setShowGmDice(true)}>Jet du MJ</HamburgerMenuItem>
                    <HamburgerMenuItemDiceConfig icon={<FuIcon name="sliders" />} />
                    <HamburgerMenuSeparator />
                    <HamburgerMenuItemLogout icon={<FuIcon name="exit" />} />
                </HamburgerMenu>
            </FuBand>

            {/* ── ONGLETS : commandes de menu ─────────────────────────────── */}
            <nav className="fu-tabs">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`fu-tab${activeTab === tab.id ? ' is-active' : ''}`}>
                        <FuIcon name={tab.icon} className="fu-ico-sm" />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <main className="flex-1">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characterUpdates={characterUpdates}
                                onSessionChange={onSessionChange} />
                )}
                {/* Fiche de groupe de la table (spec_fabula.md §7) : le MJ voit et cache les cadrans */}
                {activeTab === 'groupe' && (
                    <div className="p-4">
                        <GroupSheet sessionId={activeSession?.id ?? null} isGM />
                    </div>
                )}
                {/* PNJ : onglet de la plateforme, partie système components/npc/ (spec_pnj.md §10.5) */}
                {activeTab === 'pnj' && (
                    <div className="p-4">
                        <TabNpcs sessionId={activeSession?.id ?? null} config={fabulaConfig.npc} />
                    </div>
                )}
                {/* Onglets hors session : dans une fenêtre, pour ne jamais poser de texte sur le monde */}
                {activeTab === 'journal' && (
                    <div className="p-4">
                        <div className="fu-win">
                            <TabJournal />
                        </div>
                    </div>
                )}
                {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={activeSession?.id ?? null} role="gm" />
                    </div>
                )}
                {activeTab === 'historique' && (
                    <div className="p-4">
                        <div className="fu-win">
                            <DiceHistoryPage
                                sessionId={activeSession?.id ?? null}
                            />
                        </div>
                    </div>
                )}
                {activeTab === 'reference' && (
                    <div className="p-4">
                        <div className="fu-win">
                            <ReferenceTab />
                        </div>
                    </div>
                )}
            </main>

            {/* ── TOASTS ──────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeSession?.id ?? null}
            />

            {/* ── MODALES GLOBALES ────────────────────────────────────────── */}
            {showFreeDice && (
                <FreeDiceModal
                    sessionId={activeSession?.id ?? null}
                    isGM={true}
                    onClose={() => setShowFreeDice(false)}
                />
            )}
            {showGmDice && <FuGmDiceModal sessionId={activeSession?.id ?? null} onClose={() => setShowGmDice(false)} />}
        </div>
    );
};

export default GMApp;