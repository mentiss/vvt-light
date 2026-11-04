// src/client/src/systems/dune/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Dune (refonte, spec_dune.md §6.1, planche documentations/dune/planche_dune.html) :
//   - bande fixe partagée avec le MJ (DuneBand) : onglets Fiche · Journal · Historique,
//     jet et mode Édition en icônes, thème et menu ;
//   - colonnes de jauges qui encadrent la fiche : Impulsion à gauche, Menace à droite ;
//   - fiche sur un seul onglet (DuneSheetBody, sections partagées avec le MJ) ;
//   - actions de jeu hors édition, enregistrées tout de suite ; mode Édition = corrections ;
//   - panneau d'historique de la plateforme en plus de l'onglet.
//
// Contrat props (PlayerPage) : character, onCharacterUpdate, journalUnread, onJournalRead,
// darkMode, onToggleDarkMode (onLogout non utilisé : la déconnexion ramène à l'accueil)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '../../components/layout/DiceHistoryPanel.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemAccessCode,
    HamburgerMenuItemFreeDice, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useHashTab } from '../../hooks/useHashTab.js';

import DuneBand      from './components/ui/DuneBand.jsx';
import DuneIcon      from './components/ui/DuneIcon.jsx';
import { ImpulsionColumn, ThreatColumn } from './components/ui/DuneGauges.jsx';
import DuneSheetBody from './components/layout/DuneSheetBody.jsx';
import DuneRollModal from './components/modals/DuneRollModal.jsx';
import { usePlayerPatch }      from './hooks/usePlayerPatch.js';
import { useSessionResources } from './hooks/useSessionResources.js';
import { useSessionHouse }     from './hooks/useSessionHouse.js';
import { characterFullName }   from './config/traits.js';

const TABS = [
    { id: 'fiche',      label: 'Fiche' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
];

const Sheet = ({ character, onCharacterUpdate, journalUnread, onJournalRead, darkMode, onToggleDarkMode }) => {
    const { activeGMSession, activeSessionName } = useSession();
    const [activeTab, setActiveTab] = useHashTab(TABS, 'fiche');
    const [bandHeight, setBandHeight] = useState(0);
    const [draft, setDraft] = useState(null);          // brouillon du mode Édition, null hors édition
    const [rollFrom, setRollFrom] = useState(undefined); // undefined : fermée ; null : sans présélection
    const [avatarOpen, setAvatarOpen] = useState(false);

    const { patch, addRow } = usePlayerPatch(character, onCharacterUpdate);
    const { resources, updateResource } = useSessionResources(activeGMSession ?? null);
    const house = useSessionHouse(activeGMSession ?? null);

    const changeTab = (id) => {
        setActiveTab(id);
        if (id === 'journal') onJournalRead?.();
    };
    const tabs = TABS.map(t => (t.id === 'journal' ? { ...t, badge: journalUnread } : t));

    const saveEdit = () => { patch(draft); setDraft(null); };

    const actions = activeTab === 'fiche' && (draft ? (
        <>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
        </>
    ) : (
        <>
            <button type="button" className="dn-iconbtn" onClick={() => setRollFrom(null)} title="Lancer les dés" aria-label="Lancer les dés">
                <DuneIcon name="d20" />
            </button>
            <button type="button" className="dn-iconbtn" onClick={() => setDraft(character)} title="Mode Édition" aria-label="Mode Édition">
                <DuneIcon name="quill" />
            </button>
        </>
    ));

    const right = (
        <>
            <button type="button" className="dn-iconbtn" onClick={onToggleDarkMode}
                    title={darkMode ? 'Thème jour' : 'Thème nuit'} aria-label="Changer de thème">
                <DuneIcon name="moon" />
            </button>
            <HamburgerMenu button={<DuneIcon name="menu" />}>
                <HamburgerMenuItemCreateCharacter icon={<DuneIcon name="plus" />} />
                <HamburgerMenuItemSwitchCharacter icon={<DuneIcon name="swap" />} currentCharId={character?.id} />
                <HamburgerMenuItemFreeDice icon={<DuneIcon name="d20" />} characterId={character.id}
                                           characterName={characterFullName(character)} sessionId={activeGMSession} />
                <HamburgerMenuItemAccessCode icon={<DuneIcon name="key" />} character={character} onSuccess={onCharacterUpdate} />
                <HamburgerMenuItemDiceConfig icon={<DuneIcon name="worm" />} />
                <HamburgerMenuItemGMInterface icon={<DuneIcon name="crown" />} />
                <HamburgerMenuSeparator />
                <HamburgerMenuItemLogout icon={<DuneIcon name="exit" />} />
            </HamburgerMenu>
        </>
    );

    return (
        <div className="dn-root flex flex-col" style={{ '--dn-band-h': `${bandHeight}px` }}>
            <DuneBand eyebrow={activeGMSession ? 'Table' : undefined} caption={activeGMSession ? activeSessionName : undefined}
                      tabs={tabs} activeTab={activeTab} onTabChange={changeTab}
                      actions={actions} right={right} onHeightChange={setBandHeight} />

            <div className="flex flex-1 min-h-0">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} headerHeight={bandHeight} />
                <main className="flex-1 min-w-0 flex flex-col">
                    {activeTab === 'fiche' && (
                        <div className={`dn-stage${activeGMSession ? '' : ' is-bare'}`}>
                            {activeGMSession && (
                                <ImpulsionColumn value={resources.impulsions ?? 0} onChange={delta => updateResource('impulsions', delta)} />
                            )}
                            <DuneSheetBody character={character} draft={draft} setDraft={setDraft}
                                           onPatch={patch} onAddRow={addRow} onRoll={setRollFrom}
                                           onAvatar={() => setAvatarOpen(true)} house={house} />
                            {activeGMSession && <ThreatColumn value={resources.menace ?? 0} />}
                        </div>
                    )}
                    {activeTab === 'journal' && <div className="p-4"><JournalTab characterId={character.id} onRead={onJournalRead} /></div>}
                    {activeTab === 'historique' && <div className="p-4"><DiceHistoryPage sessionId={activeGMSession ?? null} /></div>}
                </main>
            </div>

            <ToastNotifications sessionId={activeGMSession} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (Q-3 : en plus de l'onglet) */}
            <DiceHistoryPanel sessionId={activeGMSession ?? null} />

            {rollFrom !== undefined && (
                <DuneRollModal character={character} preselect={rollFrom} onClose={() => setRollFrom(undefined)}
                               onCharacterUpdate={onCharacterUpdate} sessionResources={resources} />
            )}
            {avatarOpen && (
                <AvatarUploader currentAvatar={draft?.avatar ?? character.avatar}
                                onAvatarChange={(avatar) => { setDraft(prev => (prev ? { ...prev, avatar } : prev)); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};

export default Sheet;
