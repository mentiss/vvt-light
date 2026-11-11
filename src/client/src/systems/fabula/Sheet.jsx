// src/client/src/systems/fabula/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Fabula Ultima — layout inspiré de la fiche officielle (sans
// copier au pixel) : identité/attributs/points fabula en tête, classes +
// équipement ensuite, arcana/sorts + sac à dos en bas. Une seule page,
// pas de sous-onglets.
//
// Header : uniquement le titre du jeu (Credit Valley) — l'avatar et le nom
// du personnage vivent dans TraitsPanel, pas ici.
//
// Contrat props (plateforme — Delta Green / Dune / Vikings) :
//   character, onCharacterUpdate, onLogout, journalUnread, onJournalRead,
//   darkMode, onToggleDarkMode
//   (onLogout n'est plus utilisé : la déconnexion du menu ramène à l'accueil)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import './theme.css';

import SessionPlayersBar   from '@/features/table/SessionPlayersBar.jsx';
import ToastNotifications  from '@/features/table/ToastNotifications.jsx';
import JournalTab          from '@/features/journal/JournalTab.jsx';
import DiceHistoryPage     from '@/features/dice/history/DiceHistoryPage.jsx';
import AvatarUploader      from '@/ui/image/AvatarUploader.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '@/ui/menu/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '@/features/table/HamburgerMenuItems.jsx';

import { useSession } from '@/app/context/SessionContext.jsx';
import { useSystem }  from '@/app/hooks/useSystem.js';
import { useFetch }   from '@/app/hooks/useFetch.js';

import FicheGrid           from './components/layout/FicheGrid.jsx';
import FuBand              from './components/ui/FuBand.jsx';
import FuIcon              from './components/ui/FuIcon.jsx';
import FuWorld             from './components/ui/FuWorld.jsx';
import GroupSheet          from './components/group/GroupSheet.jsx';
import ClockDrawer         from './components/group/ClockDrawer.jsx';
import FabulaDiceModal    from './components/modals/FabulaDiceModal.jsx';
import ReferenceTab       from './components/ReferenceTab.jsx';
import { computeDerivedStats } from './config.jsx';

const TABS = [
    { id: 'fiche',      label: 'Fiche',      icon: 'sheet' },
    { id: 'groupe',     label: 'Groupe',     icon: 'party' },
    { id: 'journal',    label: 'Journal',    icon: 'journal' },
    { id: 'historique', label: 'Historique', icon: 'scroll' },
    { id: 'reference',  label: 'Référence',  icon: 'book' },
];

const Sheet = ({
                   character,
                   onCharacterUpdate,
                   journalUnread,
                   onJournalRead,
                   darkMode,
                   onToggleDarkMode,
               }) => {
    const { apiBase }       = useSystem();
    const fetchWithAuth     = useFetch();
    const { activeGMSession } = useSession();

    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.substring(1);
        return TABS.some(t => t.id === hash) ? hash : 'fiche';
    });
    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
        if (id === 'journal') onJournalRead?.();
    };

    const [editMode, setEditMode]         = useState(false);
    const [editableChar, setEditableChar] = useState({ ...character });
    const char = editMode ? editableChar : character;

    // (modales du menu : dans ses éléments, spec_ui_menu.md)
    const [diceModalAttrs, setDiceModalAttrs]         = useState(null);
    const [attackContext, setAttackContext]           = useState(null); // item d'arme équipée | null
    const [showAvatarUploader, setShowAvatarUploader] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Persistance ──────────────────────────────────────────────────────────

    // Recalcule TOUJOURS les stats dérivées (defense, defenseMagique,
    // initiative, pvMax/pmMax/piMax…) avant de persister. Sans ça, équiper/
    // déséquiper une armure, ajuster un boost de dé ou (dés)activer une
    // altération persiste bien son propre champ mais laisse defense/
    // defenseMagique périmés jusqu'au prochain aller-retour en mode édition
    // (computeDerivedStats n'était appelé qu'à la sauvegarde d'édition,
    // jamais sur les actions rapides — bug remonté en jeu, corrigé ici).
    const patchImmediate = useCallback((patch) => {
        const merged     = { ...character, ...patch };
        const recomputed = computeDerivedStats(merged);
        const full        = { ...merged, ...recomputed };
        onCharacterUpdate(full);
        if (editMode) setEditableChar(prev => ({ ...prev, ...patch, ...recomputed }));
    }, [character, onCharacterUpdate, editMode]);

    const setField = (field, value) => setEditableChar(prev => ({ ...prev, [field]: value }));

    // Certains boutons de FicheGrid (Équiper/Déséquiper le sac à dos, ajout
    // depuis le catalogue d'équipement) restent actifs hors mode édition — ce
    // sont des actions de jeu immédiates, pas des modifications de texte libre.
    // BUG CORRIGÉ : setArr n'écrivait auparavant que dans editableChar, invisible
    // et jamais persisté hors édition (char = character, pas editableChar) — d'où
    // les clics silencieusement sans effet. Même correctif que patchImmediate :
    // persistance immédiate hors édition, buffer local seulement en édition.
    const setArr = (field, value) => {
        if (editMode) {
            setEditableChar(prev => ({ ...prev, [field]: value }));
        } else {
            // Passe par patchImmediate (pas onCharacterUpdate direct) pour
            // hériter du recalcul des stats dérivées — équiper/déséquiper hors
            // édition doit mettre à jour Défense/Déf.Mag. immédiatement.
            patchImmediate({ [field]: value });
        }
    };

    const toggleEditMode = () => {
        if (editMode) {
            setSaving(true);
            const recomputed = computeDerivedStats(editableChar);
            onCharacterUpdate({ ...editableChar, ...recomputed });
            setSaving(false);
        } else {
            setEditableChar({ ...character });
        }
        setEditMode(!editMode);
    };
    const cancelEdit = () => {
        setEditableChar({ ...character });
        setEditMode(false);
    };


    const openDiceModal = (attr1 = 'dex', attr2 = 'int', label = '', spell = null) => setDiceModalAttrs({ attr1, attr2, label, spell });
    const openAttackModal = (weaponItem) => setAttackContext(weaponItem);
    // Jet d'initiative (spec_fabula.md §11.2) : [DEX + INT] + initiative, meneur ou soutien
    const openInitiativeModal = () => setDiceModalAttrs({ attr1: 'dex', attr2: 'int', label: 'Initiative', spell: null, initiative: true });

    return (
        <div className="fu-root fu-font-body">
            <FuWorld />

            {/* ── BANDE — uniquement le titre du jeu ──────────────────────── */}
            <FuBand darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} onDice={() => openDiceModal()}>
                {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, icônes du slug */}
                <HamburgerMenu button={<FuIcon name="menu" />} buttonClassName="fu-icon-btn">
                    <HamburgerMenuItemCreateCharacter icon={<FuIcon name="plus" />} />
                    <HamburgerMenuItemSwitchCharacter icon={<FuIcon name="swap" />} currentCharId={character?.id} />
                    <HamburgerMenuItemFreeDice
                        icon={<FuIcon name="dice" />}
                        characterId={character.id}
                        characterName={character.nom}
                        sessionId={activeGMSession}
                    />
                    <HamburgerMenuItemAccessCode icon={<FuIcon name="key" />} character={character} onSuccess={onCharacterUpdate} />
                    <HamburgerMenuItemDiceConfig icon={<FuIcon name="sliders" />} />
                    <HamburgerMenuItemGMInterface icon={<FuIcon name="crown" />} />
                    <HamburgerMenuSeparator />
                    <HamburgerMenuItemLogout icon={<FuIcon name="exit" />} />
                </HamburgerMenu>
            </FuBand>

            {/* ── ONGLETS : commandes de menu ─────────────────────────────── */}
            <nav className="fu-tabs">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => changeTab(tab.id)}
                            className={`fu-tab${activeTab === tab.id ? ' is-active' : ''}`}>
                        <FuIcon name={tab.icon} className="fu-ico-sm" />
                        {tab.label}
                        {tab.id === 'journal' && journalUnread > 0 && (
                            <span className="fu-tab-count">{journalUnread}</span>
                        )}
                    </button>
                ))}
                {activeTab === 'fiche' && (
                    <div className="fu-tabs-end">
                        {editMode ? (
                            <>
                                <button onClick={cancelEdit} className="fu-btn fu-btn-sm">Annuler</button>
                                <button onClick={toggleEditMode} disabled={saving} className="fu-btn fu-btn-sm fu-btn-gold">
                                    <FuIcon name="check" className="fu-ico-sm" />
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </>
                        ) : (
                            <button onClick={toggleEditMode} className="fu-btn fu-btn-sm">
                                <FuIcon name="edit" className="fu-ico-sm" />Édition
                            </button>
                        )}
                    </div>
                )}
            </nav>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <div className="flex">
                <SessionPlayersBar character={character} sessionId={activeGMSession} />

                <div className="flex-1 p-4">
                    {activeTab === 'fiche' && (
                        <FicheGrid
                            character={char}
                            sessionId={activeGMSession ?? null}
                            editMode={editMode}
                            onFieldChange={setField}
                            onArrayChange={setArr}
                            onQuickUpdate={patchImmediate}
                            onAvatarClick={() => setShowAvatarUploader(true)}
                            onRollAttribute={(attrKey) => !editMode && openDiceModal(attrKey, attrKey === 'dex' ? 'int' : 'dex')}
                            onRollInitiative={() => !editMode && openInitiativeModal()}
                            onAttack={(weaponItem) => !editMode && openAttackModal(weaponItem)}
                            onCastSpell={(a1, a2, lbl, spell) => !editMode && openDiceModal(a1, a2, lbl, spell)}
                        />
                    )}

                    {/* Volet des cadrans actifs, sur la fiche seulement (spec_fabula.md §11.3) */}
                    {activeTab === 'fiche' && <ClockDrawer sessionId={activeGMSession ?? null} />}

                    {/* Fiche de groupe de la table (spec_fabula.md §7) */}
                    {activeTab === 'groupe' && (
                        <GroupSheet sessionId={activeGMSession ?? null} character={character} onQuickUpdate={patchImmediate} />
                    )}

                    {/* Onglets hors fiche : dans une fenêtre, pour ne jamais poser de texte sur le monde */}
                    {activeTab === 'journal' && (
                        <div className="fu-win">
                            <JournalTab characterId={character.id} onRead={onJournalRead} />
                        </div>
                    )}

                    {activeTab === 'historique' && (
                        <div className="fu-win">
                            <DiceHistoryPage
                                sessionId={activeGMSession ?? null}
                            />
                        </div>
                    )}

                    {activeTab === 'reference' && (
                        <div className="fu-win">
                            <ReferenceTab character={character} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── TOASTS ──────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeGMSession}
            />

            {/* ── MODALES ─────────────────────────────────────────────────── */}
            {diceModalAttrs && (
                <FabulaDiceModal
                    character={character}
                    sessionId={activeGMSession}
                    initialAttr1={diceModalAttrs.attr1}
                    initialAttr2={diceModalAttrs.attr2}
                    initialLabel={diceModalAttrs.label}
                    spellContext={diceModalAttrs.spell}
                    initiativeRoll={!!diceModalAttrs.initiative}
                    onCharacterPatch={patchImmediate}
                    onClose={() => setDiceModalAttrs(null)}
                />
            )}
            {attackContext && (
                <FabulaDiceModal
                    character={character}
                    sessionId={activeGMSession}
                    weaponContext={attackContext}
                    onCharacterPatch={patchImmediate}
                    onClose={() => setAttackContext(null)}
                />
            )}
            {showAvatarUploader && (
                <AvatarUploader
                    currentAvatar={character.avatar}
                    onAvatarChange={(newAvatar) => patchImmediate({ avatar: newAvatar })}
                    onClose={() => setShowAvatarUploader(false)}
                />
            )}
        </div>
    );
};

export default Sheet;