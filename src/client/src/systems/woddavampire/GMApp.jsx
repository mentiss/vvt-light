// src/client/src/systems/woddavampire/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface du Conteur — LOT 3 (spec_woddavampire.md §II.14, planche_conteur.html).
//   - Bande fixe comme la fiche joueur : header (titre, thème, menu) et sous-header
//     (onglets Session / Coterie / Journal / Historique / Aide de jeu ; actions de table : Donner de l'XP,
//     Réveil, Fin d'histoire, ciblables ; jet du Conteur en d10).
//   - Session : la table et la fiche MJ (gm/tabs/TabSession.jsx).
//   - Journal (TabJournal), Historique (DiceHistoryPage), panneau d'historique
//     (DiceHistoryPanel, zone d'actions) : briques de la plateforme.
// Contenu directement ici, sans GMView.
//
// Contrat props (GMPage) : activeSession, onSessionChange, onlineCharacters,
// characterUpdates, darkMode, onToggleDarkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '../../components/layout/DiceHistoryPanel.jsx';
import TabJournal         from '../../components/gm/tabs/TabJournal.jsx';
import { useHashTab }     from '../../hooks/useHashTab.js';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemTableManagement, HamburgerMenuItemDiceConfig, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

import { wakeUp, endOfStory } from './config/rules/sheetRules.js';
import { MENU_ICON, D10Icon } from './components/ui/VdaUi.jsx';
import VdaTopBar from './components/ui/VdaTopBar.jsx';
import { useTableCharacters } from './hooks/useTableCharacters.js';
import TabSession from './gm/tabs/TabSession.jsx';
import VdaTableActionModal from './components/modals/VdaTableActionModal.jsx';
import VdaGmDiceModal from './components/modals/VdaGmDiceModal.jsx';
import { REFERENCE_SECTIONS } from './config/reference.js';
import { useBoxSize } from './hooks/useBoxSize.js';
import { useCoterie } from './hooks/useCoterie.js';
import VdaCoterie from './components/layout/VdaCoterie.jsx';
import { VdaCoterieCreateModal } from './components/modals/VdaCoterieModals.jsx';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'coterie',    label: 'Coterie' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab] = useHashTab(TABS, 'session');   // onglet gardé au rafraîchissement
    // Hauteur de la bande fixe : le sommaire de l'aide de jeu se colle dessous
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const [tableAction, setTableAction] = useState(null);   // { kind, preselect } | null
    const [rollOpen, setRollOpen] = useState(false);
    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const { coterie, send: sendCoterie, error: coterieError } = useCoterie(activeSession?.id ?? null);
    const [createOpen, setCreateOpen] = useState(false);
    const tableCharacters = order.map(id => characters[id]);

    // Actions de table : chaque personnage ciblé est enregistré par un envoi partiel
    const applyTableAction = async (kind, ids, amount) => {
        await Promise.all(ids.map(id => {
            const c = characters[id];
            if (!c) return null;
            if (kind === 'xp') return patchCharacter(id, { xpTotal: (c.xpTotal ?? 0) + amount });
            if (kind === 'wake') return patchCharacter(id, wakeUp(c));
            return patchCharacter(id, endOfStory(c));
        }));
    };

    return (
        <div className="vda-root" style={{ '--vda-band-h': `${band.height ?? 0}px` }}>
            <VdaTopBar ref={stickyRef} title={<>Vampire <span className="vda-header-sub">Conteur{activeSession ? ` · ${activeSession.name}` : ''}</span></>}
                       darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} tabs={TABS} active={activeTab} onSelect={setActiveTab}
                       menu={<>
                           <HamburgerMenuItemTableManagement icon={MENU_ICON} activeSessionId={activeSession?.id ?? null}
                                                             onSelectTable={(session) => onSessionChange?.(session)} />
                           <HamburgerMenuItemDiceConfig icon={MENU_ICON} />
                           <HamburgerMenuSeparator />
                           <HamburgerMenuItemLogout icon={MENU_ICON} />
                       </>}
                       actions={<>
                           {activeTab === 'session' && tableCharacters.length > 0 && <>
                               <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setTableAction({ kind: 'xp' })}>Donner de l'XP</button>
                               <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setTableAction({ kind: 'wake' })}>Réveil</button>
                               <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setTableAction({ kind: 'end' })}>Fin d'histoire</button>
                           </>}
                           <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary vda-icon-btn" onClick={() => setRollOpen(true)}
                                   title="Jet du Conteur" aria-label="Jet du Conteur"><D10Icon /></button>
                       </>} />

            <main className="vda-sheet-body">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characters={characters} order={order}
                                loading={loading} patchCharacter={patchCharacter} onGiveXp={(id) => setTableAction({ kind: 'xp', preselect: [id] })} />
                )}
                {activeTab === 'coterie' && (
                    <div className="vda-page">
                        {!activeSession && <p className="vda-note p-6">Aucune table active : choisissez-en une dans le menu (gestion des tables).</p>}
                        {activeSession && coterie && <VdaCoterie coterie={coterie} isGM characters={characters} send={sendCoterie} error={coterieError} />}
                        {activeSession && !coterie && (
                            <div className="vda-coterie-empty">
                                <p>Pas de coterie à cette table.</p>
                                <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => setCreateOpen(true)}>Créer la coterie</button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'aide' && <div className="vda-page"><ReferenceGuide sections={REFERENCE_SECTIONS} isGM placeholder="Rechercher une règle (ex. diablerie, manœuvre, soleil)…" /></div>}
                {activeTab === 'journal' && <div className="vda-page"><TabJournal characterId={-1} /></div>}
                {activeTab === 'historique' && <div className="vda-page"><DiceHistoryPage sessionId={activeSession?.id ?? null} /></div>}
            </main>

            {tableAction && (
                <VdaTableActionModal kind={tableAction.kind} characters={tableCharacters} preselect={tableAction.preselect ?? null}
                                     onApply={(ids, amount) => applyTableAction(tableAction.kind, ids, amount)} onClose={() => setTableAction(null)} />
            )}
            {createOpen && (
                <VdaCoterieCreateModal error={coterieError} onConfirm={(name, anchorKey) => sendCoterie('POST', '', { name, anchorKey })}
                                       onClose={() => setCreateOpen(false)} />
            )}
            {rollOpen && <VdaGmDiceModal sessionId={activeSession?.id ?? null} onClose={() => setRollOpen(false)} />}

            <ToastNotifications sessionId={activeSession?.id ?? null} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={activeSession?.id ?? null} />
        </div>
    );
};

export default GMApp;
