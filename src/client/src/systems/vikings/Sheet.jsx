// src/client/src/systems/vikings/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Vikings — enveloppe : bandeau, onglets, menu, modales.
// Le corps de la fiche vit dans components/layout/SheetLayout.jsx, partagé à
// l'identique avec l'interface MJ. Spec : documentations/spec_vikings_lot3_client.md §4.
//
// Contrat props (PlayerPage) :
//   character, onCharacterUpdate, onLogout, journalUnread, onJournalRead,
//   darkMode, onToggleDarkMode
//
// onCharacterUpdate accepte un objet ou un updater (prev => next) et fait le PUT.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import './theme.css';
import { formatFullName, pickEditableFields } from './config/utils.js';
import vikingsConfig      from './config.jsx';
import SheetLayout        from './components/layout/SheetLayout.jsx';
import VikingsHistoryEntry from './components/layout/VikingsHistoryEntry.jsx';
import DiceModal          from './components/modals/DiceModal.jsx';
import EditModals         from './components/modals/EditModals.jsx';
import RunesTab           from './components/tabs/RunesTab.jsx';
import InventoryTab       from './components/tabs/InventoryTab.jsx';
import ExperienceModal    from './components/modals/ExperienceModal.jsx';
import ThemeToggle        from '../../components/ui/ThemeToggle.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import DiceConfigModal    from '../../components/modals/DiceConfigModal.jsx';
import CharacterListModal from '../../components/modals/CharacterListModal.jsx';
import AccessCodeModal    from '../../components/modals/AccessCodeModal.jsx';
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';
import CombatPanel        from '../../components/combat/CombatPanel.jsx';
import { useSession }     from '../../context/SessionContext.jsx';
import { useAuth }        from '../../context/AuthContext.jsx';
import { useSystem }      from '../../hooks/useSystem.js';

// Titres en runes qui tournent dans le header
const RUNE_TITLES = ['ᛟᛞᛁᚾ', 'ᚢᛁᚲᛁᛜ', 'ᛃᚨᚱᛚ', 'ᚢᛟᛚᚢᚨ', 'ᛊᚲᚨᛚᛞ', 'ᛈᚢᚱᛖ'];

// L'onglet Runes est remplacé par une section de la fiche au lot 3b.
const TABS = [
    { id: 'fiche',      label: '📋 Ma Fiche' },
    { id: 'runes',      label: '🔮 Runes' },
    { id: 'inventaire', label: '🎒 Inventaire' },
    { id: 'journal',    label: '📓 Journal' },
    { id: 'historique', label: '📜 Historique' },
];

const resolve = (updater, prev) => (typeof updater === 'function' ? updater(prev) : updater);

const MenuItem = ({ onClick, danger = false, children }) => (
    <button onClick={onClick}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface-alt ${danger ? 'text-danger' : 'text-default'}`}>
        {children}
    </button>
);

const Sheet = ({
                   character,
                   onCharacterUpdate,
                   onLogout,
                   journalUnread,
                   onJournalRead,
                   darkMode,
                   onToggleDarkMode,
               }) => {
    const { slug }    = useSystem();
    const { logout }  = useAuth();
    const { activeGMSession, activeSessionName } = useSession();

    const [runeTitle] = useState(() => RUNE_TITLES[Math.floor(Math.random() * RUNE_TITLES.length)]);
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.substring(1);
        return TABS.some(t => t.id === hash) ? hash : 'fiche';
    });

    // ── Menu et modales ──────────────────────────────────────────────────────
    const [showMenu,       setShowMenu]       = useState(false);
    const [showCharList,   setShowCharList]   = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showAvatar,     setShowAvatar]     = useState(false);
    const [showEvolution,  setShowEvolution]  = useState(false);
    const [showEditModal,  setShowEditModal]  = useState(null);
    const [diceContext,    setDiceContext]    = useState(null);
    const [linkCopied,     setLinkCopied]     = useState(false);

    // ── Édition (buffer local) ───────────────────────────────────────────────
    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(character);
    const char = editMode ? editableChar : character;

    const set = useCallback((field, value) => {
        setEditableChar(prev => ({ ...prev, [field]: value }));
    }, []);

    // Action de jeu : persistée tout de suite, et reportée dans le buffer
    // d'édition pour rester visible pendant l'édition.
    const update = useCallback((updater) => {
        onCharacterUpdate(updater);
        if (editMode) setEditableChar(prev => resolve(updater, prev));
    }, [onCharacterUpdate, editMode]);

    const startEdit = () => { setEditableChar({ ...character }); setEditMode(true); };
    const saveEdit  = () => {
        const edited = pickEditableFields(editableChar);
        onCharacterUpdate(prev => ({ ...prev, ...edited }));
        setEditMode(false);
    };
    const cancelEdit = () => setEditMode(false);

    const changeTab = (tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
        if (tab === 'journal') onJournalRead?.();
    };

    const handleLogout = async () => {
        setShowMenu(false);
        await logout();
        onLogout();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/${slug}/${character.accessUrl}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const openMenuEntry = (open) => () => { setShowMenu(false); open(); };

    return (
        <div className="min-h-screen bg-default text-default transition-colors">

            {/* ── HEADER ── */}
            <header className="bg-surface border-b-2 border-default p-4 shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3 font-viking min-w-0">
                        <span className="text-3xl font-bold tracking-wider text-primary">{runeTitle}</span>
                        <span className="text-lg font-normal opacity-75 truncate">— {formatFullName(character)}</span>
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                        {character.accessCode && (
                            <div className="hidden md:block text-xs bg-primary px-3 py-1 rounded text-default font-mono font-bold">
                                Code : {character.accessCode}
                            </div>
                        )}
                        {character.accessUrl && (
                            <button onClick={copyLink} className="hidden md:block px-3 py-1 bg-primary text-default rounded text-xs font-semibold">
                                {linkCopied ? '✅ Copié !' : '📋 Copier lien'}
                            </button>
                        )}
                        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                        <div className="relative">
                            <button onClick={() => setShowMenu(v => !v)} title="Menu"
                                    className="px-3 py-2 bg-surface-alt border border-default rounded font-semibold text-lg text-default">
                                ☰
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-2xl border-2 border-primary z-20 py-1">
                                        <MenuItem onClick={openMenuEntry(() => { window.location.href = `/${slug}/creation`; })}>⚔️ Créer un personnage</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowCharList(true))}>🗂️ Changer de personnage</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowAvatar(true))}>📸 Changer l'avatar</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowAccessCode(true))}>🔑 Code d'accès</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowFreeDice(true))}>🎲 Jet de dés libre</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => setShowDiceConfig(true))}>🎛️ Config animations dés</MenuItem>
                                        <MenuItem onClick={openMenuEntry(() => { window.location.href = `/${slug}/gm`; })}>🎭 Interface MJ</MenuItem>
                                        <div className="border-t border-default my-1" />
                                        <MenuItem onClick={handleLogout} danger>🚪 Déconnexion</MenuItem>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {activeSessionName && (
                    <div className="max-w-7xl mx-auto mt-1 text-xs text-primary opacity-75">
                        Session : {activeSessionName}
                    </div>
                )}
            </header>

            {/* ── TABS ── */}
            <nav className="bg-surface border-b border-default sticky top-[72px] z-30">
                <div className="max-w-7xl mx-auto flex gap-1 p-2 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => changeTab(tab.id)}
                                className={`px-4 py-2 rounded text-sm font-semibold transition-colors shrink-0 ${
                                    activeTab === tab.id ? 'bg-primary text-default' : 'bg-default text-default hover:bg-primary/30'
                                }`}>
                            {tab.label}
                            {tab.id === 'journal' && journalUnread > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-default rounded-full font-bold">{journalUnread}</span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ── CONTENU ── */}
            <div className="flex">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName} />

                <div className="flex-1 min-w-0 max-w-7xl mx-auto p-4">
                    {activeTab === 'fiche' && (
                        <>
                            <div className="flex justify-end gap-2 mb-4">
                                {editMode ? (
                                    <>
                                        <button onClick={cancelEdit} className="px-4 py-2 rounded text-xs font-semibold bg-surface-alt border border-default text-default">Annuler</button>
                                        <button onClick={saveEdit} className="px-4 py-2 rounded text-xs font-semibold bg-success text-white">✓ Sauvegarder</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setShowEvolution(true)} className="px-4 py-2 rounded text-xs font-semibold bg-primary text-default">💎 Évolution</button>
                                        <button onClick={startEdit} className="px-4 py-2 rounded text-xs font-semibold bg-secondary text-white">⚙️ Édition</button>
                                    </>
                                )}
                            </div>

                            <SheetLayout
                                char={char}
                                editMode={editMode}
                                set={set}
                                update={update}
                                onRoll={setDiceContext}
                                onAvatarClick={() => setShowAvatar(true)}
                                onOpenEditModal={setShowEditModal}
                            />

                            <CombatPanel
                                character={character}
                                combatConfig={vikingsConfig.combat}
                                sessionId={activeGMSession ?? null}
                            />
                        </>
                    )}

                    {activeTab === 'runes'      && <RunesTab character={character} onUpdate={onCharacterUpdate} />}
                    {activeTab === 'inventaire' && <InventoryTab character={character} onUpdate={onCharacterUpdate} />}
                    {activeTab === 'journal'    && <JournalTab characterId={character.id} />}
                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeGMSession}
                            renderHistoryEntry={vikingsConfig.dice.renderHistoryEntry}
                        />
                    )}
                </div>
            </div>

            {/* ── Éléments globaux ── */}
            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(toast) => <VikingsHistoryEntry entry={toast} compact />}
            />
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}

            {/* ── Modales fiche ── */}
            {diceContext && (
                <DiceModal character={character} isBerserk={false} context={diceContext}
                           onClose={() => setDiceContext(null)} onUpdate={onCharacterUpdate} sessionId={activeGMSession} />
            )}
            {showEditModal && (
                <EditModals type={showEditModal} character={editableChar}
                            onClose={() => setShowEditModal(null)}
                            onUpdate={(newChar) => { setEditableChar(newChar); setShowEditModal(null); }} />
            )}
            {showEvolution && <ExperienceModal character={character} onClose={() => setShowEvolution(false)} onUpdate={onCharacterUpdate} />}
            {showAvatar && (
                <AvatarUploader
                    currentAvatar={character.avatar}
                    onAvatarChange={(avatar) => update(prev => ({ ...prev, avatar }))}
                    onClose={() => setShowAvatar(false)}
                />
            )}
            {showFreeDice && (
                <FreeDiceModal
                    characterId={character.id}
                    characterName={formatFullName(character)}
                    sessionId={activeGMSession}
                    onClose={() => setShowFreeDice(false)}
                />
            )}
            <AccessCodeModal
                isOpen={showAccessCode}
                character={character}
                onClose={() => setShowAccessCode(false)}
                onSuccess={(updated) => { onCharacterUpdate(prev => ({ ...prev, accessCode: updated.accessCode })); setShowAccessCode(false); }}
            />
            <CharacterListModal
                isOpen={showCharList}
                currentCharId={character?.id}
                onClose={() => setShowCharList(false)}
                onSelect={(c) => { window.location.href = `/${slug}/${c.accessUrl}`; }}
            />
        </div>
    );
};

export default Sheet;
