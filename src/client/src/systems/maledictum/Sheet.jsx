// src/client/src/systems/maledictum/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Imperium Maledictum (spec_maledictum.md §11.2) :
//   - thème du personnage (rôle de faction) posé sur la page (useLivery) ;
//   - bande fixe (marque à l'Aquila, thème, menu ; onglets Fiche · Journal ·
//     Historique · Aide de jeu ; sur la Fiche : Supériorité du groupe, jet libre,
//     XP, mode Édition) ;
//   - la fiche se joue directement (jets, Blessures, Destin, États, inventaire,
//     XP…) et s'enregistre tout de suite ;
//   - mode Édition : corrections hors règles (MlEditForm), Enregistrer / Annuler.
//
// Contrat props (PlayerPage) : character, onCharacterUpdate, onLogout,
// journalUnread, onJournalRead, darkMode, onToggleDarkMode
// (onLogout n'est pas utilisé : la déconnexion du menu ramène à l'accueil)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';

import SessionPlayersBar  from '@/features/table/SessionPlayersBar.jsx';
import ToastNotifications from '@/features/table/ToastNotifications.jsx';
import JournalTab         from '@/features/journal/JournalTab.jsx';
import DiceHistoryPage    from '@/features/dice/history/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '@/features/dice/history/DiceHistoryPanel.jsx';
import AvatarUploader     from '@/ui/image/AvatarUploader.jsx';
import ReferenceGuide     from '@/features/reference/ReferenceGuide.jsx';
import { HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';
import { useSession } from '@/app/context/SessionContext.jsx';
import { useHashTab } from '@/ui/hooks/useHashTab.js';

import MlTopBar from './components/ui/MlTopBar.jsx';
import MlSheet from './components/layout/MlSheet.jsx';
import MlEditForm from './components/layout/MlEditForm.jsx';
import { EditIcon, Orn } from './components/ui/MlUi.jsx';
import { useBoxSize } from './hooks/useBoxSize.js';
import { usePlayerPatch } from './hooks/usePlayerPatch.js';
import { usePatron } from './hooks/usePatron.js';
import { useLivery } from './hooks/useLivery.js';
import { displayName } from './config/rules/character.js';
import { themeFor } from './config/rules/themes.js';
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
    const [draft, setDraft] = useState(null);           // brouillon du mode Édition, null hors édition

    const patch = usePlayerPatch(character, onCharacterUpdate);
    const sessionId = activeGMSession ?? null;
    const { patron } = usePatron(sessionId);
    const theme = themeFor(draft ?? character);
    useLivery(theme);

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
            {patron?.superiorityEnabled !== false && <span className="im-chip" title="Supériorité du groupe, réglée par le MJ"><Orn name="laurel" />Supériorité <b>{patron?.superiority ?? 0}</b></span>}
            <button type="button" className="im-icon-btn" onClick={() => setDraft({ ...character })} title="Mode Édition" aria-label="Mode Édition"><EditIcon /></button>
        </>
    ));

    return (
        <div className="im is-sheet-page" style={{ '--im-band-h': `${band.height ?? 0}px`, '--vtt-reference-top': `${band.height ?? 0}px` }}>
            <MlTopBar ref={stickyRef} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode}
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

            <div className="flex im-sheet-body">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} headerHeight={band.height} />
                <main className="im-main flex-1 min-w-0">
                    {activeTab === 'fiche' && (draft
                        ? <MlEditForm draft={draft} setDraft={setDraft} />
                        : <MlSheet c={character} patch={patch} patron={patron} sessionId={sessionId} theme={theme} onAvatar={() => setAvatarOpen(true)} />)}
                    {activeTab === 'journal' && <div className="im-tab-page"><JournalTab characterId={character.id} onRead={onJournalRead} /></div>}
                    {activeTab === 'historique' && <div className="im-tab-page"><DiceHistoryPage sessionId={sessionId} /></div>}
                    {activeTab === 'aide' && <div className="im-tab-page"><ReferenceGuide sections={REFERENCE_SECTIONS} placeholder="Rechercher une règle, un talent, un objet (ex. Avantage, Supériorité, pistolet laser)…" /></div>}
                </main>
            </div>

            <ToastNotifications sessionId={activeGMSession} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={sessionId} />

            {avatarOpen && (
                <AvatarUploader currentAvatar={character.avatar}
                                onAvatarChange={(avatar) => { patch({ avatar }); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};

export default Sheet;
