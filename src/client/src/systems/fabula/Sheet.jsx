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
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import './theme.css';

import ThemeToggle         from '../../components/ui/ThemeToggle.jsx';
import SessionPlayersBar   from '../../components/layout/SessionPlayersBar.jsx';
import ToastNotifications  from '../../components/layout/ToastNotifications.jsx';
import JournalTab          from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage     from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal     from '../../components/modals/DiceConfigModal.jsx';
import FreeDiceModal       from '../../components/modals/FreeDiceModal.jsx';
import CharacterListModal  from '../../components/modals/CharacterListModal.jsx';
import AvatarUploader      from '../../components/AvatarUploader.jsx';

import { useSession } from '../../context/SessionContext.jsx';
import { useAuth }    from '../../context/AuthContext.jsx';
import { useSystem }  from '../../hooks/useSystem.js';
import { useFetch }   from '../../hooks/useFetch.js';

import FicheGrid           from './components/layout/FicheGrid.jsx';
import FabulaDiceModal    from './components/modals/FabulaDiceModal.jsx';
import FabulaHistoryEntry from './components/layout/FabulaHistoryEntry.jsx';
import fabulaConfig, { computeDerivedStats } from './config.jsx';
import AccessCodeModal from "../../components/modals/AccessCodeModal.jsx";

const TABS = [
    { id: 'fiche',      label: '📋 Fiche' },
    { id: 'journal',    label: '📓 Journal' },
    { id: 'historique', label: '📜 Historique' },
];

const Sheet = ({
                   character,
                   onCharacterUpdate,
                   onLogout,
                   journalUnread,
                   onJournalRead,
                   darkMode,
                   onToggleDarkMode,
               }) => {
    const { slug, apiBase } = useSystem();
    const fetchWithAuth     = useFetch();
    const { logout }        = useAuth();
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

    const [showMenu, setShowMenu]                     = useState(false);
    const [diceModalAttrs, setDiceModalAttrs]         = useState(null);
    const [attackContext, setAttackContext]           = useState(null); // item d'arme équipée | null
    const [showFreeDice, setShowFreeDice]             = useState(false);
    const [showDiceConfig, setShowDiceConfig]         = useState(false);
    const [showCharList, setShowCharList]             = useState(false);
    const [showAvatarUploader, setShowAvatarUploader] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAccessCode, setShowAccessCode] = useState(false);

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

    const handleLogout = useCallback(async () => {
        setShowMenu(false);
        await logout();
        onLogout?.();
    }, [logout, onLogout]);

    const openDiceModal = (attr1 = 'dex', attr2 = 'int') => setDiceModalAttrs({ attr1, attr2 });
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
                    <div className="relative">
                        <button onClick={() => setShowMenu(v => !v)}
                                className="w-9 h-9 rounded flex items-center justify-center border border-default bg-default">
                            ☰
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-1 w-56 bg-surface border border-default rounded-lg shadow-lg z-50 py-1">
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); window.location.href = `/${slug}/creation`; }}>
                                        ✨ Créer un personnage
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowCharList(true); }}>
                                        🔄 Changer de personnage
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowFreeDice(true); }}>
                                        🎲 Jet libre
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowAccessCode(true); }}>
                                        🔑 Code d'accès
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>
                                        🎛️ Config animations dés
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); window.location.href = `/${slug}/gm`; }}>
                                        🎭 Interface GM
                                    </button>
                                    <div className="border-t border-default my-1" />
                                    <button className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-surface-alt"
                                            onClick={handleLogout}>
                                        🚪 Déconnexion
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
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
                        />
                    )}

                    {activeTab === 'journal' && (
                        <JournalTab characterId={character.id} />
                    )}

                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeGMSession ?? null}
                            renderHistoryEntry={fabulaConfig.dice.renderHistoryEntry}
                        />
                    )}
                </div>
            </div>

            {/* ── TOASTS ──────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(toast) => <FabulaHistoryEntry roll={toast} compact />}
            />

            {/* ── MODALES ─────────────────────────────────────────────────── */}
            {diceModalAttrs && (
                <FabulaDiceModal
                    character={character}
                    sessionId={activeGMSession}
                    initialAttr1={diceModalAttrs.attr1}
                    initialAttr2={diceModalAttrs.attr2}
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
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
            {showFreeDice && (
                <FreeDiceModal
                    characterId={character.id}
                    characterName={character.nom}
                    sessionId={activeGMSession}
                    onClose={() => setShowFreeDice(false)}
                />
            )}
            {showAvatarUploader && (
                <AvatarUploader
                    currentAvatar={character.avatar}
                    onAvatarChange={(newAvatar) => patchImmediate({ avatar: newAvatar })}
                    onClose={() => setShowAvatarUploader(false)}
                />
            )}
            <CharacterListModal
                isOpen={showCharList}
                currentCharId={character?.id}
                onClose={() => setShowCharList(false)}
                onSelect={(selected) => { window.location.href = `/${slug}/${selected.accessUrl}`; }}
            />
            <AccessCodeModal
                isOpen={showAccessCode}
                character={character}
                onClose={() => setShowAccessCode(false)}
                onSuccess={(updated) => { onCharacterUpdate(updated); setShowAccessCode(false); }}
            />
        </div>
    );
};

export default Sheet;