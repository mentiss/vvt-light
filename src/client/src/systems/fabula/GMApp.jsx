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
import './theme.css';

import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import TabJournal          from '../../components/gm/tabs/TabJournal.jsx';
import Board               from '../../components/board/Board.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import ReferenceTab        from './components/ReferenceTab.jsx';
import FuBand              from './components/ui/FuBand.jsx';
import FuIcon              from './components/ui/FuIcon.jsx';
import FuWorld             from './components/ui/FuWorld.jsx';
import GroupSheet          from './components/group/GroupSheet.jsx';

const TABS = [
    { id: 'session',    label: 'Session',    icon: 'party' },
    { id: 'groupe',     label: 'Groupe',     icon: 'bond' },
    { id: 'tableau',    label: 'Tableau',    icon: 'map' },
    { id: 'journal',    label: 'Journal',    icon: 'journal' },
    { id: 'historique', label: 'Historique', icon: 'scroll' },
    { id: 'reference',  label: 'Référence',  icon: 'book' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab]       = useState('session');
    // (modales du menu : dans ses éléments, spec_ui_menu.md)
    const [showFreeDice, setShowFreeDice] = useState(false);

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
                {/* Onglets hors session : dans une fenêtre, pour ne jamais poser de texte sur le monde */}
                {activeTab === 'journal' && (
                    <div className="p-4">
                        <div className="fu-win">
                            <TabJournal characterId={-1} />
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
        </div>
    );
};

export default GMApp;