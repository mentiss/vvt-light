// src/client/src/systems/dune/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Dune (spec_dune.md §6.4), contenu directement ici (sans GMView, C-15) :
//   - bande fixe partagée avec la fiche joueur (DuneBand) : onglets
//     Table · Maison · PNJ · Journal · Tableau · Historique ; Impulsion, Menace et Complications
//     toujours visibles et réglables ; jet du meneur ; thème et menu ;
//   - Table : personnages de la table et la même fiche que le joueur (gm/tabs/TabSession) ;
//   - Maison : nom et description (gm/tabs/TabHouse) ;
//   - PNJ, Journal, Tableau, Historique et panneau d'historique : briques de la plateforme.
//
// Contrat props (GMPage) : activeSession, onSessionChange, onlineCharacters,
// characterUpdates, darkMode, onToggleDarkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

import ToastNotifications from '@/features/table/ToastNotifications.jsx';
import DiceHistoryPage    from '@/features/dice/history/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '@/features/dice/history/DiceHistoryPanel.jsx';
import TabJournal         from '@/features/journal/TabJournal.jsx';
import Board              from '@/features/board/Board.jsx';
import TabNpcs            from '@/features/npc/TabNpcs.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemPlayerView,
    HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';

import DuneBand from './components/ui/DuneBand.jsx';
import DuneIcon from './components/ui/DuneIcon.jsx';
import DuneGMRollModal from './components/modals/DuneGMRollModal.jsx';
import TabSession from './gm/tabs/TabSession.jsx';
import TabHouse   from './gm/tabs/TabHouse.jsx';
import { useTableCharacters }  from './hooks/useTableCharacters.js';
import { useSessionResources } from './hooks/useSessionResources.js';
import { IMPULSION_MAX } from './config/rules/roll.js';
import duneConfig from './config.jsx';

const GM_TABS = [
    { id: 'session',    label: 'Table' },
    { id: 'maison',     label: 'Maison' },
    { id: 'pnj',        label: 'PNJ' },
    { id: 'tableau', label: 'Tableau' },
    { id: 'historique', label: 'Historique' },
    { id: 'journal',    label: 'Journal' },
];

/** Découpe le hash « #onglet-donnée » en [onglet, donnée] (donnée : '' si absente). */
const readHash = () => {
    const hash = window.location.hash.substring(1);
    const dash = hash.indexOf('-');
    return dash === -1 ? [hash, ''] : [hash.substring(0, dash), hash.substring(dash + 1)];
};

// Ressource de la table dans la bande : icône, libellé, − valeur +
const BandResource = ({ cls, icon, label, value, onChange, max = Infinity }) => (
    <div className={`dn-res ${cls}`}>
        <DuneIcon name={icon} />
        <small>{label}</small>
        <button type="button" onClick={() => onChange(-1)} disabled={value <= 0} aria-label={`${label} −1`}>−</button>
        <b>{value}</b>
        <button type="button" onClick={() => onChange(1)} disabled={value >= max} aria-label={`${label} +1`}>+</button>
    </div>
);

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    // Hash « #onglet » (un ancien « #onglet-donnée » reste lu) : sans tiret, l'ancien
    // découpage rendait une chaîne vide et ramenait toujours sur Session (C-6).
    const [activeTab, setActiveTab] = useState(() => {
        const [tab] = readHash();
        return GM_TABS.some(t => t.id === tab) ? tab : 'session';
    });
    const [bandHeight, setBandHeight] = useState(0);
    const [diceOpen, setDiceOpen] = useState(false);

    const sessionId = activeSession?.id ?? null;
    const table = useTableCharacters(activeSession, characterUpdates);
    const { resources, updateResource } = useSessionResources(sessionId, true);

    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
    };

    const actions = (
        <>
            {sessionId && (
                <>
                    <BandResource cls="is-imp" icon="spice" label="Impulsion" value={resources.impulsions ?? 0}
                                  max={IMPULSION_MAX} onChange={d => updateResource('impulsions', d)} />
                    <BandResource cls="is-threat" icon="threat" label="Menace" value={resources.menace ?? 0}
                                  onChange={d => updateResource('menace', d)} />
                    <BandResource cls="is-cpl" icon="bolt" label="Compl." value={resources.complications ?? 0}
                                  onChange={d => updateResource('complications', d)} />
                </>
            )}
            <button type="button" className="dn-iconbtn ml-2" onClick={() => setDiceOpen(true)} title="Jet du meneur" aria-label="Jet du meneur">
                <DuneIcon name="d20" />
            </button>
        </>
    );

    const right = (
        <>
            <button type="button" className="dn-iconbtn" onClick={onToggleDarkMode}
                    title={darkMode ? 'Thème jour' : 'Thème nuit'} aria-label="Changer de thème">
                <DuneIcon name="moon" />
            </button>
            <HamburgerMenu button={<DuneIcon name="menu" />}>
                <HamburgerMenuItemTableManagement icon={<DuneIcon name="orbit" />} activeSessionId={sessionId}
                                                  onSelectTable={(session) => onSessionChange(session)} />
                <HamburgerMenuItemDiceConfig icon={<DuneIcon name="worm" />} />
                <HamburgerMenuItemPlayerView icon={<DuneIcon name="eye" />} />
                <HamburgerMenuSeparator />
                <HamburgerMenuItemLogout icon={<DuneIcon name="exit" />} />
            </HamburgerMenu>
        </>
    );

    return (
        <div className="dn-root" style={{ '--dn-band-h': `${bandHeight}px` }}>
            <DuneBand eyebrow="Meneur" caption={activeSession?.name}
                      tabs={GM_TABS} activeTab={activeTab} onTabChange={id => changeTab(id)}
                      actions={actions} right={right} onHeightChange={setBandHeight} />

            <main>
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} {...table}
                                onSessionChange={onSessionChange} />
                )}
                {activeTab === 'maison' && <TabHouse activeSession={activeSession} />}
                {/* PNJ : onglet assemblé de la plateforme (spec_pnj.md §6.5), partie système dans config.jsx */}
                {activeTab === 'pnj' && <TabNpcs sessionId={sessionId} config={duneConfig.npc} />}
                {activeTab === 'journal' && <div className="p-6"><TabJournal /></div>}
                {/* Tableau partagé (brique plateforme, spec_tableau.md §10.8) */}
                {activeTab === 'tableau' && (
                    <div className="vtt-board-page">
                        <Board sessionId={activeSession?.id ?? null} role="gm" />
                    </div>
                )}
                {activeTab === 'historique' && <div className="p-6"><DiceHistoryPage sessionId={sessionId} /></div>}
            </main>

            {diceOpen && <DuneGMRollModal onClose={() => setDiceOpen(false)} sessionId={sessionId} />}

            <ToastNotifications sessionId={sessionId} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions */}
            <DiceHistoryPanel sessionId={sessionId} />
        </div>
    );
};

export default GMApp;
