// src/client/src/systems/nimble/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Nimble (spec_nimble.md §6.2) :
//   - bande fixe (marque, thème, menu ; onglets Fiche · Journal · Historique ·
//     Aide de jeu ; sur la Fiche : montée de niveau, repos, mode Édition) ;
//   - la fiche se joue directement (jets, PV, actions, ressources, usages,
//     états, inventaire) et s'enregistre tout de suite ;
//   - mode Édition : corrections hors règles (NbEditForm), Enregistrer / Annuler.
//
// Contrat props (PlayerPage) : character, onCharacterUpdate, onLogout,
// journalUnread, onJournalRead, darkMode, onToggleDarkMode
// (onLogout n'est pas utilisé : la déconnexion du menu ramène à l'accueil)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';

import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '../../components/layout/DiceHistoryPanel.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useHashTab } from '../../hooks/useHashTab.js';

import NbTopBar from './components/ui/NbTopBar.jsx';
import NbSheet from './components/layout/NbSheet.jsx';
import NbEditForm from './components/layout/NbEditForm.jsx';
import NbLevelUpModal from './components/modals/NbLevelUpModal.jsx';
import NbRestModal from './components/modals/NbRestModal.jsx';
import { EditIcon, RestIcon, LevelIcon } from './components/ui/NbUi.jsx';
import { useBoxSize } from './hooks/useBoxSize.js';
import { useNbActions } from './hooks/useNbActions.js';
import { usePlayerPatch } from './hooks/usePlayerPatch.js';
import { displayName } from './config/rules/character.js';
import { REFERENCE_SECTIONS } from './config/reference.js';

const TABS = [
    { id: 'fiche',      label: 'Fiche' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const Sheet = ({ character, onCharacterUpdate, journalUnread, onJournalRead, darkMode, onToggleDarkMode }) => {
    const { activeGMSession, activeSessionName } = useSession();
    // Hauteur de la bande fixe : la barre de session se fixe dessous au défilement
    const stickyRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const [activeTab, setActiveTab] = useHashTab(TABS, 'fiche');   // onglet gardé au rafraîchissement
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [pageModal, setPageModal] = useState(null);   // 'level' | 'rest'
    const [draft, setDraft] = useState(null);           // brouillon du mode Édition, null hors édition

    const patch = usePlayerPatch(character, onCharacterUpdate);
    const act = useNbActions({ character, patch });
    const sessionId = activeGMSession ?? null;

    const changeTab = (id) => {
        setActiveTab(id);
        if (id === 'journal') onJournalRead?.();
    };
    const tabs = TABS.map(t => (t.id === 'journal' && journalUnread > 0 ? { ...t, badge: journalUnread, badgeClass: 'is-left' } : t));
    const saveEdit = () => { patch({ ...draft }); setDraft(null); };

    const pageActions = activeTab === 'fiche' && (draft ? (
        <>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
        </>
    ) : (
        <>
            {Number(character.level ?? 1) < 20 && (
                <button type="button" className="nb-icon-btn" onClick={() => setPageModal('level')} title="Monter de niveau"><LevelIcon /> Niveau</button>
            )}
            <button type="button" className="nb-icon-btn" onClick={() => setPageModal('rest')} title="Repos et fin de rencontre"><RestIcon /> Repos</button>
            <button type="button" className="nb-icon-btn" onClick={() => setDraft({ ...character })} title="Mode Édition" aria-label="Mode Édition"><EditIcon /></button>
        </>
    ));

    return (
        <div className="nb-root is-sheet-page" style={{ '--nb-band-h': `${band.height ?? 0}px` }}>
            <NbTopBar ref={stickyRef} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode}
                      tabs={tabs} active={activeTab} onSelect={changeTab} actions={pageActions}
                      menu={<>
                          <HamburgerMenuItemCreateCharacter />
                          <HamburgerMenuItemSwitchCharacter currentCharId={character?.id} />
                          <HamburgerMenuItemFreeDice characterId={character.id} characterName={displayName(character)} sessionId={activeGMSession} />
                          <HamburgerMenuItemAccessCode character={character} onSuccess={onCharacterUpdate} />
                          <HamburgerMenuItemDiceConfig />
                          <HamburgerMenuSeparator />
                          <HamburgerMenuItemGMInterface />
                          <HamburgerMenuItemLogout />
                      </>} />

            <div className="flex nb-sheet-body">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} headerHeight={band.height} />
                <main className="nb-page flex-1 min-w-0">
                    {activeTab === 'fiche' && (draft
                        ? <NbEditForm draft={draft} setDraft={setDraft} />
                        : <NbSheet c={character} act={act} sessionId={sessionId} onAvatar={() => setAvatarOpen(true)} />)}
                    {activeTab === 'journal' && <JournalTab characterId={character.id} onRead={onJournalRead} />}
                    {activeTab === 'historique' && <DiceHistoryPage sessionId={sessionId} />}
                    {activeTab === 'aide' && <ReferenceGuide sections={REFERENCE_SECTIONS} placeholder="Rechercher une règle, un sort, un objet (ex. critique, repos sûr, Dard de flamme)…" />}
                </main>
            </div>

            <ToastNotifications sessionId={activeGMSession} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={sessionId} />

            {pageModal === 'level' && <NbLevelUpModal c={character} act={act} sessionId={sessionId} onClose={() => setPageModal(null)} />}
            {pageModal === 'rest' && <NbRestModal c={character} act={act} sessionId={sessionId} onClose={() => setPageModal(null)} />}
            {avatarOpen && (
                <AvatarUploader currentAvatar={character.avatar}
                                onAvatarChange={(avatar) => { patch({ avatar }); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};

export default Sheet;
