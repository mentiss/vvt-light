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

import ThemeToggle         from '../../components/ui/ThemeToggle.jsx';
import SessionPlayersBar   from '../../components/layout/SessionPlayersBar.jsx';
import ToastNotifications  from '../../components/layout/ToastNotifications.jsx';
import JournalTab          from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage     from '../../components/layout/DiceHistoryPage.jsx';
import AvatarUploader      from '../../components/AvatarUploader.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemFreeDice,
    HamburgerMenuItemAccessCode, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface,
    HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

import { useSession } from '../../context/SessionContext.jsx';
import { useSystem }  from '../../hooks/useSystem.js';
import { useFetch }   from '../../hooks/useFetch.js';

import FicheGrid           from './components/layout/FicheGrid.jsx';
import FabulaDiceModal    from './components/modals/FabulaDiceModal.jsx';
import FabulaHistoryEntry from './components/layout/FabulaHistoryEntry.jsx';
import fabulaConfig, { computeDerivedStats } from './config.jsx';

const TABS = [
    { id: 'fiche',      label: '📋 Fiche' },
    { id: 'journal',    label: '📓 Journal' },
    { id: 'historique', label: '📜 Historique' },
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


    const openDiceModal = (attr1 = 'dex', attr2 = 'int', label = '') => setDiceModalAttrs({ attr1, attr2, label });
    const openAttackModal = (weaponItem) => setAttackContext(weaponItem);

    return (
        <div className="min-h-screen bg-default text-default fu-font-body" data-theme={darkMode ? 'dark' : 'light'}>

            {/* ── HEADER — uniquement le titre du jeu ─────────────────────── */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-default bg-surface">
                <h1 className="fu-font-logo text-2xl text-primary">Fabula Ultima</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => openDiceModal()} className="px-3 py-1.5 rounded bg-primary text-white text-sm">
                        🎲
                    </button>
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                    {/* Menu hamburger générique (spec_ui_menu.md), habillé dans theme.css, emojis du slug */}
                    <HamburgerMenu button="☰">
                        <HamburgerMenuItemCreateCharacter icon="✨" />
                        <HamburgerMenuItemSwitchCharacter icon="🔄" currentCharId={character?.id} />
                        <HamburgerMenuItemFreeDice
                            icon="🎲"
                            characterId={character.id}
                            characterName={character.nom}
                            sessionId={activeGMSession}
                        />
                        <HamburgerMenuItemAccessCode icon="🔑" character={character} onSuccess={onCharacterUpdate} />
                        <HamburgerMenuItemDiceConfig icon="🎛️" />
                        <HamburgerMenuItemGMInterface icon="🎭" />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemLogout icon="🚪" />
                    </HamburgerMenu>
                </div>
            </header>

            {/* ── ONGLETS ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 border-b border-default bg-surface-alt">
                <nav className="flex gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => changeTab(tab.id)}
                                className={`px-3 py-2 text-sm border-b-2 ${
                                    activeTab === tab.id ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted'
                                }`}>
                            {tab.label}
                            {tab.id === 'journal' && journalUnread > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-danger text-white rounded-full">{journalUnread}</span>
                            )}
                        </button>
                    ))}
                </nav>
                {activeTab === 'fiche' && (
                    <div className="py-1.5 flex items-center gap-2">
                        {editMode ? (
                            <>
                                <button onClick={cancelEdit} className="px-3 py-1 rounded border border-default text-xs">Annuler</button>
                                <button onClick={toggleEditMode} disabled={saving}
                                        className="px-3 py-1 rounded bg-success text-white text-xs disabled:opacity-50">
                                    {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                                </button>
                            </>
                        ) : (
                            <button onClick={toggleEditMode} className="px-3 py-1 rounded bg-primary text-white text-xs">✎ Édition</button>
                        )}
                    </div>
                )}
            </div>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <div className="flex">
                <SessionPlayersBar character={character} sessionId={activeGMSession} />

                <div className="flex-1 p-4">
                    {activeTab === 'fiche' && (
                        <FicheGrid
                            character={char}
                            editMode={editMode}
                            onFieldChange={setField}
                            onArrayChange={setArr}
                            onQuickUpdate={patchImmediate}
                            onAvatarClick={() => setShowAvatarUploader(true)}
                            onRollAttribute={(attrKey) => !editMode && openDiceModal(attrKey, attrKey === 'dex' ? 'int' : 'dex')}
                            onAttack={(weaponItem) => !editMode && openAttackModal(weaponItem)}
                            onCastSpell={(a1, a2, lbl) => openDiceModal(a1, a2, lbl)}
                        />
                    )}

                    {activeTab === 'journal' && (
                        <JournalTab characterId={character.id} onRead={onJournalRead} />
                    )}

                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeGMSession ?? null}
                            renderHistoryEntry={fabulaConfig.dice.renderHistoryEntry}
                            renderAllRollTypes
                        />
                    )}
                </div>
            </div>

            {/* ── TOASTS ──────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(toast) => <FabulaHistoryEntry roll={toast} />}
                renderAllRollTypes
            />

            {/* ── MODALES ─────────────────────────────────────────────────── */}
            {diceModalAttrs && (
                <FabulaDiceModal
                    character={character}
                    sessionId={activeGMSession}
                    initialAttr1={diceModalAttrs.attr1}
                    initialAttr2={diceModalAttrs.attr2}
                    initialLabel={diceModalAttrs.label}
                    onClose={() => setDiceModalAttrs(null)}
                />
            )}
            {attackContext && (
                <FabulaDiceModal
                    character={character}
                    sessionId={activeGMSession}
                    weaponContext={attackContext}
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