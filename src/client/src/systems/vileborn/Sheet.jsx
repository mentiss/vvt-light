// src/client/src/systems/vileborn/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Vileborn — LOT 2 : fiche vivante (spec_vileborn.md §II.4, §II.6,
// planche validée).
//   - bande fixe (marque, thème, menu ; onglets Fiche · Journal · Historique · Aide de jeu ;
//     plume du mode Édition sur l'onglet Fiche) ;
//   - clic sur une approche : fenêtre de jet ; états, blessures, mobiles, dons,
//     coches, Rêverie, Pulsion et liens se jouent sur la fiche et s'enregistrent
//     tout de suite ;
//   - mode Édition : corrections hors règles (VilEditForm), Enregistrer / Annuler ;
//   - portrait au centre du U, changé d'un clic.
//   - Aide de jeu (ReferenceGuide) : règles du kit, héritages, origines.
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
import { HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useHashTab } from '../../hooks/useHashTab.js';

import VilTopBar   from './components/ui/VilTopBar.jsx';
import VilSheet    from './components/layout/VilSheet.jsx';
import VilEditForm from './components/layout/VilEditForm.jsx';
import VilRollModal from './components/modals/VilRollModal.jsx';
import { EditIcon } from './components/ui/VilUi.jsx';
import { useBoxSize } from './hooks/useBoxSize.js';
import { useVilActions } from './hooks/useVilActions.js';
import { usePlayerPatch } from './hooks/usePlayerPatch.js';
import { displayName, editDraft, editPatch } from './config/rules/character.js';
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
    const [rollApproach, setRollApproach] = useState(null);
    const [draft, setDraft] = useState(null);   // brouillon du mode Édition, null hors édition

    const patch = usePlayerPatch(character, onCharacterUpdate);
    const act = useVilActions({ character, sessionId: activeGMSession ?? null, patch });

    const changeTab = (id) => {
        setActiveTab(id);
        if (id === 'journal') onJournalRead?.();
    };
    const tabs = TABS.map(t => (t.id === 'journal' && journalUnread > 0 ? { ...t, badge: journalUnread, badgeClass: 'is-left' } : t));
    const saveEdit = () => { patch(editPatch(character, draft)); setDraft(null); };

    return (
        <div className="vil-root is-sheet-page" style={{ '--vil-band-h': `${band.height ?? 0}px` }}>
            <VilTopBar ref={stickyRef} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode}
                       tabs={tabs} active={activeTab} onSelect={changeTab}
                       menu={<>
                           <HamburgerMenuItemCreateCharacter />
                           <HamburgerMenuItemSwitchCharacter currentCharId={character?.id} />
                           <HamburgerMenuItemFreeDice characterId={character.id} characterName={displayName(character)} sessionId={activeGMSession} />
                           <HamburgerMenuItemAccessCode character={character} onSuccess={onCharacterUpdate} />
                           <HamburgerMenuItemDiceConfig />
                           <HamburgerMenuSeparator />
                           <HamburgerMenuItemGMInterface />
                           <HamburgerMenuItemLogout />
                       </>}
                       actions={activeTab === 'fiche' && (draft ? (
                           <>
                               <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                               <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                           </>
                       ) : (
                           <button type="button" className="vil-icon-btn" onClick={() => setDraft(editDraft(character))} title="Mode Édition" aria-label="Mode Édition">
                               <EditIcon />
                           </button>
                       ))} />

            <div className="flex vil-sheet-body">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} headerHeight={band.height} />
                <main className="vil-page flex-1 min-w-0">
                    {activeTab === 'fiche' && (draft
                        ? <VilEditForm draft={draft} setDraft={setDraft} />
                        : <VilSheet c={character} act={act} onRoll={setRollApproach} onAvatar={() => setAvatarOpen(true)} />)}
                    {activeTab === 'journal' && <JournalTab characterId={character.id} onRead={onJournalRead} />}
                    {activeTab === 'historique' && <DiceHistoryPage sessionId={activeGMSession ?? null} />}
                    {activeTab === 'aide' && <ReferenceGuide sections={REFERENCE_SECTIONS} placeholder="Rechercher une règle (ex. hors jeu, Rêverie, d12)…" />}
                </main>
            </div>

            <ToastNotifications sessionId={activeGMSession} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={activeGMSession ?? null} />

            {rollApproach && (
                <VilRollModal character={character} approachKey={rollApproach} sessionId={activeGMSession}
                              onPatch={patch} onClose={() => setRollApproach(null)} />
            )}
            {avatarOpen && (
                <AvatarUploader currentAvatar={character.avatar}
                                onAvatarChange={(avatar) => { patch({ avatar }); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};

export default Sheet;
