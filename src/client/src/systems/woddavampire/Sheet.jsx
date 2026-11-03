// src/client/src/systems/woddavampire/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Vampire : l'Âge des Ténèbres — LOT 2a : feuille vivante
// (spec_woddavampire.md §4, §II.9 ; planche validée).
//   - un seul onglet de fiche (+ Coterie si la table en a une, Journal, Historique, Aide de jeu), disposé comme la fiche officielle ;
//   - bouton Édition (fiche libre, §1.4) ; Volonté temporaire, sang et santé
//     toujours cliquables et enregistrés tout de suite ;
//   - clic sur un trait : fenêtre de jet pré-remplie ; bouton « Jet » général ;
//   - Réveil près du sang, Fin d'histoire dans le menu (avec confirmation) ;
//   - effet de soif selon la réserve de sang (fiche du joueur seulement) : devant
//     la feuille, sous le header et le sous-header fixes ; coupé en mode Édition ;
//   - portrait en médaillon, changé en mode Édition (AvatarUploader de la plateforme).
//
// Contrat props (PlayerPage) : character, onCharacterUpdate, onLogout,
// journalUnread, onJournalRead, darkMode, onToggleDarkMode
// (onLogout n'est pas utilisé : la déconnexion du menu ramène à l'accueil)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useRef, useState } from 'react';

import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceHistoryPanel   from '../../components/layout/DiceHistoryPanel.jsx';
import ConfirmModal       from '../../components/modals/ConfirmModal.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';
import { HamburgerMenuItem, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';
import ReferenceGuide     from '../../components/reference/ReferenceGuide.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useHashTab } from '../../hooks/useHashTab.js';

import { wakeUp, endOfStory, thirst, initiativeBase, xpAvailable, imposedState } from './config/rules/sheetRules.js';
import { ROLL_TYPES } from './config.jsx';
import { REFERENCE_SECTIONS } from './config/reference.js';
import { MENU_ICON, D10Icon, QuillIcon } from './components/ui/VdaUi.jsx';
import VdaTopBar    from './components/ui/VdaTopBar.jsx';
import VdaSheet     from './components/layout/VdaSheet.jsx';
import VdaDiceModal from './components/modals/VdaDiceModal.jsx';
import VdaXpModal   from './components/modals/VdaXpModal.jsx';
import { useVdaRoll } from './hooks/useVdaRoll.js';
import { useBoxSize } from './hooks/useBoxSize.js';
import { useCoterie } from './hooks/useCoterie.js';
import VdaCoterie   from './components/layout/VdaCoterie.jsx';

const TABS = [
    { id: 'fiche',      label: 'Fiche' },
    { id: 'coterie',    label: 'Coterie' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
    { id: 'aide',       label: 'Aide de jeu' },
];

const Sheet = ({ character, onCharacterUpdate, journalUnread, onJournalRead, darkMode, onToggleDarkMode }) => {
    const { activeGMSession, activeSessionName } = useSession();
    // Mesures de mise en page : hauteur de la bande fixe (la barre de session se fixe dessous au
    // défilement) et colonne de la feuille (l'état imposé se centre dessus, barre de session exclue)
    const stickyRef = useRef(null);
    const pageRef = useRef(null);
    const band = useBoxSize(stickyRef);
    const page = useBoxSize(pageRef);
    const [activeTab, setActiveTab] = useHashTab(TABS, 'fiche');   // onglet gardé au rafraîchissement
    const { coterie, send: sendCoterie, error: coterieError } = useCoterie(activeGMSession ?? null);
    const [editMode, setEditMode]   = useState(false);
    const [draft, setDraft]         = useState(character);
    const [rollSetup, setRollSetup] = useState(null);     // { attrKey?, abilityKey?, virtue?, label } | null
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [xpOpen, setXpOpen] = useState(false);
    const { launch } = useVdaRoll();

    // Initiative (§10.1) : 1d10 + base, par le moteur de dés (animé, historisé)
    const rollInitiative = () => launch({
        characterId: character.id, characterName: character.nom || 'Personnage', sessionId: activeGMSession ?? null,
        label: 'Initiative', rollType: ROLL_TYPES.initiative, systemData: { type: 'initiative', base: initiativeBase(character) },
    });

    const shown = editMode ? draft : character;

    // Actions de jeu (jauges, Réveil, Volonté dépensée) : enregistrées tout de suite,
    // reportées aussi dans le brouillon si l'édition est ouverte.
    const quick = useCallback((patch) => {
        onCharacterUpdate(prev => ({ ...prev, ...patch }));
        if (editMode) setDraft(prev => ({ ...prev, ...patch }));
    }, [onCharacterUpdate, editMode]);

    const startEdit = () => { setDraft({ ...character }); setEditMode(true); };
    const cancelEdit = () => { setDraft(character); setEditMode(false); };
    const saveEdit = () => { onCharacterUpdate({ ...draft }); setEditMode(false); };

    const changeTab = (id) => {
        setActiveTab(id);
        if (id === 'journal') onJournalRead?.();
    };
    // Onglet Coterie seulement si la table en a une
    const tabs = TABS.filter(t => t.id !== 'coterie' || coterie)
        .map(t => (t.id === 'journal' && journalUnread > 0 ? { ...t, badge: journalUnread, badgeClass: 'is-left' } : t));
    // État imposé par le Conteur (Frénésie, Rötschreck, Torpeur) : effet sur toute la page, le joueur
    // ne peut pas le couper ; il remplace l'effet de soif tant qu'il est actif
    const imposed = imposedState(character);
    // Soif : onglet Fiche seulement, coupée en mode Édition (la fiche doit rester lisible pour la corriger)
    const { intensity, hungry } = imposed || editMode || activeTab !== 'fiche' ? { intensity: 0, hungry: false } : thirst(character);

    return (
        <div className={`vda-root is-sheet-page${imposed ? ` is-${imposed}` : ''}`} data-theme={darkMode ? 'dark' : 'light'}
             style={{ '--vda-thirst': intensity.toFixed(3), '--vda-band-h': `${band.height ?? 0}px`, '--vda-sheet-left': `${page.left}px`, '--vda-sheet-w': `${page.width}px` }}>
            {imposed && <div className={`vda-imposed is-${imposed}`} aria-hidden="true" />}
            {/* Effet de soif : devant la fiche (sous la bande fixe), plus la réserve baisse, plus les bords s'assombrissent ; battement sous le seuil de la faim */}
            <div className={`vda-thirst${hungry ? ' is-hungry' : ''}`} aria-hidden="true" />

            {/* Header et sous-header (onglets, Édition) fixes, au-dessus de l'effet de soif */}
            <VdaTopBar ref={stickyRef} title="Vampire" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode}
                       tabs={tabs} active={activeTab} onSelect={changeTab}
                       menu={<>
                           <HamburgerMenuItemCreateCharacter icon={MENU_ICON} />
                           <HamburgerMenuItemSwitchCharacter icon={MENU_ICON} currentCharId={character?.id} />
                           <HamburgerMenuItemFreeDice icon={MENU_ICON} characterId={character.id} characterName={character.nom} sessionId={activeGMSession} />
                           <HamburgerMenuItemAccessCode icon={MENU_ICON} character={character} onSuccess={onCharacterUpdate} />
                           <HamburgerMenuItemDiceConfig icon={MENU_ICON} />
                           <HamburgerMenuItem icon={MENU_ICON} onClick={() => setConfirmEnd(true)}>Fin d'histoire</HamburgerMenuItem>
                           <HamburgerMenuItemGMInterface icon={MENU_ICON} />
                           <HamburgerMenuSeparator />
                           <HamburgerMenuItemLogout icon={MENU_ICON} />
                       </>}
                       actions={<>
                           {/* Action de page : dépenser son XP (disponible affichée, rouge si négative) */}
                           <button type="button" className={`vtt-btn vtt-btn-sm vda-xp-btn${xpAvailable(character) < 0 ? ' is-negative' : ''}`}
                                   onClick={() => setXpOpen(true)} title="Dépenser son XP">XP {xpAvailable(character)}</button>
                           {/* Jet général : disponible sur tous les onglets */}
                           <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary vda-icon-btn" onClick={() => setRollSetup({ label: '' })}
                                   title="Lancer les dés" aria-label="Lancer les dés"><D10Icon /></button>
                           {activeTab === 'fiche' && (editMode ? (
                               <>
                                   <button type="button" className="vtt-btn vtt-btn-sm" onClick={cancelEdit}>Annuler</button>
                                   <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                               </>
                           ) : (
                               <button type="button" className="vtt-btn vtt-btn-sm vda-icon-btn" onClick={startEdit}
                                       title="Édition" aria-label="Édition"><QuillIcon /></button>
                           ))}
                       </>} />

            <div className="flex vda-sheet-body">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} headerHeight={band.height} />
                <main className="vda-page flex-1 min-w-0" ref={pageRef}>
                    <div>
                        {activeTab === 'fiche' && (
                            <VdaSheet
                                c={shown}
                                editMode={editMode}
                                onField={(field, value) => setDraft(prev => ({ ...prev, [field]: value }))}
                                onArray={(field, list) => setDraft(prev => ({ ...prev, [field]: list }))}
                                onQuick={quick}
                                onRoll={(setup) => setRollSetup(setup)}
                                onWake={() => quick(wakeUp(character))}
                                onAvatar={() => setAvatarOpen(true)}
                                onInitiative={rollInitiative}
                            />
                        )}
                        {activeTab === 'aide' && <ReferenceGuide sections={REFERENCE_SECTIONS} placeholder="Rechercher une règle (ex. frénésie, manœuvre, soleil)…" />}
                        {activeTab === 'coterie' && (coterie
                            ? <VdaCoterie coterie={coterie} isGM={false} viewer={character} send={sendCoterie} error={coterieError} />
                            : <p className="vda-note p-6">Pas de coterie à cette table.</p>)}
                        {activeTab === 'journal' && <JournalTab characterId={character.id} onRead={onJournalRead} />}
                        {activeTab === 'historique' && <DiceHistoryPage sessionId={activeGMSession ?? null} />}
                    </div>
                </main>
            </div>

            <ToastNotifications sessionId={activeGMSession} />
            {/* Panneau d'historique : brique de la plateforme, bouton dans la zone d'actions (spec_ui_actions.md) */}
            <DiceHistoryPanel sessionId={activeGMSession ?? null} />

            {rollSetup && (
                <VdaDiceModal character={character} sessionId={activeGMSession} initial={rollSetup}
                              onPatch={quick} onClose={() => setRollSetup(null)} />
            )}
            {xpOpen && <VdaXpModal character={character} onPatch={quick} onClose={() => setXpOpen(false)} />}
            {avatarOpen && (
                <AvatarUploader currentAvatar={character.avatar}
                                onAvatarChange={(avatar) => { quick({ avatar }); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
            {confirmEnd && (
                <ConfirmModal
                    title="Fin d'histoire"
                    message={`La Volonté temporaire revient à ${character.willpowerPermanent ?? 0} (valeur permanente).`}
                    confirmText="Confirmer"
                    onConfirm={() => { quick(endOfStory(character)); setConfirmEnd(false); }}
                    onCancel={() => setConfirmEnd(false)}
                />
            )}
        </div>
    );
};

export default Sheet;
