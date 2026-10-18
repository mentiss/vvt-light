// src/client/src/systems/vikings/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Vikings — enveloppe : bandeau, onglets, menu, modales.
// Le corps de la fiche vit dans components/layout/SheetLayout.jsx, partagé à
// l'identique avec l'interface MJ. Spec : documentations/spec_vikings_lot3_client.md §4,
// habillage : spec_vikings_lot4_graphisme.md (planche UIkit_complet).
//
// Contrat props (PlayerPage) :
//   character, onCharacterUpdate, onLogout, journalUnread, onJournalRead,
//   darkMode, onToggleDarkMode
//
// onCharacterUpdate accepte un objet ou un updater (prev => next) et fait le PUT.
// theme.css est chargé par PlayerPage (import.meta.glob), pas importé ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { formatFullName, pickEditableFields } from './config/utils.js';
import { withDerivedValues } from './config/rules.js';
import vikingsConfig      from './config.jsx';
import SheetLayout        from './components/layout/SheetLayout.jsx';
import VikingsHistoryEntry from './components/layout/VikingsHistoryEntry.jsx';
import DiceModal          from './components/modals/DiceModal.jsx';
import EditModals         from './components/modals/EditModals.jsx';
import ExperienceModal    from './components/modals/ExperienceModal.jsx';
import VkIcon             from './components/ui/VkIcon.jsx';
import RuneTitle          from './components/ui/RuneTitle.jsx';
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

// Runes et inventaire sont des sections de la fiche, plus des onglets.
const TABS = [
    { id: 'fiche',      label: 'Ma fiche' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
];

const resolve = (updater, prev) => (typeof updater === 'function' ? updater(prev) : updater);

const MenuItem = ({ icon, onClick, danger = false, children }) => (
    <button type="button" onClick={onClick} className={`vk-menu-item ${danger ? 'is-danger' : ''}`}>
        <VkIcon name={icon} />{children}
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

    // Hauteur du bandeau collant (variable : retour à la ligne sur mobile),
    // pour que la barre des joueurs se fixe dessous au défilement.
    const stickyRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(null);
    useEffect(() => {
        const el = stickyRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => setHeaderHeight(Math.ceil(el.getBoundingClientRect().height)));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // ── Édition (buffer local) ───────────────────────────────────────────────
    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(character);
    const char = editMode ? editableChar : character;

    const set = useCallback((field, value) => {
        setEditableChar(prev => ({ ...prev, [field]: value }));
    }, []);

    // Toute écriture recalcule les valeurs de combat (traits, équipement,
    // ajustement) avant le PUT de PlayerPage (L3-6).
    const persist = useCallback((updater) => {
        onCharacterUpdate(prev => withDerivedValues(resolve(updater, prev)));
    }, [onCharacterUpdate]);

    // Action de jeu : persistée tout de suite, et reportée dans le buffer
    // d'édition pour rester visible pendant l'édition.
    const update = useCallback((updater) => {
        persist(updater);
        if (editMode) setEditableChar(prev => resolve(updater, prev));
    }, [persist, editMode]);

    const startEdit = () => { setEditableChar({ ...character }); setEditMode(true); };
    const saveEdit  = () => {
        const edited = pickEditableFields(editableChar);
        persist(prev => ({ ...prev, ...edited }));
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
        <div className="vk-root min-h-screen" data-theme={darkMode ? 'dark' : 'light'}>

            {/* ── BANDEAU + ONGLETS (collants) ── */}
            <div className="sticky top-0 z-40" ref={stickyRef}>
                {/* Pas de nom ici : il figure dans l'en-tête de la fiche (retour MJ) */}
                <header className="vk-header px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <RuneTitle className="text-3xl" />
                        {activeSessionName && <div className="vk-eyebrow truncate">Session : {activeSessionName}</div>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Enveloppe : les classes .vk-* fixent display, hidden ne s'y applique pas */}
                        <span className="hidden md:inline-flex items-center gap-2">
                            {character.accessCode && (
                                <span className="vk-tag vk-tag-gold vk-num" title="Code d'accès">
                                    <VkIcon name="key" />{character.accessCode}
                                </span>
                            )}
                            {character.accessUrl && (
                                <button type="button" onClick={copyLink} className="vk-btn vk-btn-sm">
                                    {linkCopied ? <><VkIcon name="check" />Copié</> : 'Copier le lien'}
                                </button>
                            )}
                        </span>
                        <button type="button" onClick={onToggleDarkMode} className="vk-btn vk-btn-icon"
                                title={darkMode ? 'Mode jour (bois)' : 'Mode nuit (fer)'}>
                            <VkIcon name={darkMode ? 'sun' : 'moon'} />
                        </button>

                        <div className="relative">
                            <button type="button" onClick={() => setShowMenu(v => !v)} className="vk-btn vk-btn-icon" title="Menu">
                                <VkIcon name="menu" />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="vk-menu absolute right-0 mt-2 z-20">
                                        <MenuItem icon="axe"      onClick={openMenuEntry(() => { window.location.href = `/${slug}/creation`; })}>Créer un personnage</MenuItem>
                                        <MenuItem icon="people"   onClick={openMenuEntry(() => setShowCharList(true))}>Changer de personnage</MenuItem>
                                        <MenuItem icon="portrait" onClick={openMenuEntry(() => setShowAvatar(true))}>Changer l'avatar</MenuItem>
                                        <MenuItem icon="key"      onClick={openMenuEntry(() => setShowAccessCode(true))}>Code d'accès</MenuItem>
                                        <MenuItem icon="dice"     onClick={openMenuEntry(() => setShowFreeDice(true))}>Jet de dés libre</MenuItem>
                                        <MenuItem icon="horn"     onClick={openMenuEntry(() => setShowDiceConfig(true))}>Config animations dés</MenuItem>
                                        <MenuItem icon="helm"     onClick={openMenuEntry(() => { window.location.href = `/${slug}/gm`; })}>Interface MJ</MenuItem>
                                        <div className="vk-menu-sep" />
                                        <MenuItem icon="door" onClick={handleLogout} danger>Déconnexion</MenuItem>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="px-4 bg-surface flex items-center justify-between gap-3 flex-wrap">
                    <nav className="vk-tabs">
                        {TABS.map(tab => (
                            <button key={tab.id} type="button" onClick={() => changeTab(tab.id)}
                                    className={`vk-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                                {tab.label}
                                {tab.id === 'journal' && journalUnread > 0 && <span className="vk-badge">{journalUnread}</span>}
                            </button>
                        ))}
                    </nav>
                    {activeTab === 'fiche' && (
                        <div className="flex gap-2 py-2">
                            {editMode ? (
                                <>
                                    <button type="button" onClick={cancelEdit} className="vk-btn vk-btn-danger vk-btn-sm">Annuler</button>
                                    <button type="button" onClick={saveEdit} className="vk-btn vk-btn-success vk-btn-sm"><VkIcon name="check" />Sauvegarder</button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setShowEvolution(true)} className="vk-btn vk-btn-primary vk-btn-sm"><VkIcon name="tree" />Évolution</button>
                                    <button type="button" onClick={startEdit} className="vk-btn vk-btn-sm"><VkIcon name="quill" />Édition</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── CONTENU (toute la largeur) ── */}
            <div className="flex">
                <SessionPlayersBar character={character} sessionId={activeGMSession} sessionName={activeSessionName}
                                   headerHeight={headerHeight} noWidthWhenCollapsed />

                <main className="flex-1 min-w-0 p-4 md:p-6">
                    {activeTab === 'fiche' && (
                        <>
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

                    {activeTab === 'journal' && <JournalTab characterId={character.id} onRead={onJournalRead} />}
                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeGMSession}
                            renderHistoryEntry={vikingsConfig.dice.renderHistoryEntry}
                        />
                    )}
                </main>
            </div>

            {/* ── Éléments globaux ── */}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}

            {/* ── Modales fiche ── */}
            {diceContext && (
                <DiceModal character={character} isBerserk={false} context={diceContext}
                           onClose={() => setDiceContext(null)} onUpdate={persist} sessionId={activeGMSession} />
            )}
            {showEditModal && (
                <EditModals type={showEditModal} character={editableChar}
                            onClose={() => setShowEditModal(null)}
                            onUpdate={(newChar) => { setEditableChar(newChar); setShowEditModal(null); }} />
            )}
            {showEvolution && <ExperienceModal character={character} onClose={() => setShowEvolution(false)} onUpdate={persist} />}
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
                onSuccess={(updated) => { persist(prev => ({ ...prev, accessCode: updated.accessCode })); setShowAccessCode(false); }}
            />
            <CharacterListModal
                isOpen={showCharList}
                currentCharId={character?.id}
                onClose={() => setShowCharList(false)}
                onSelect={(c) => { window.location.href = `/${slug}/${c.accessUrl}`; }}
            />

            {/* Notifications en dernier : au même z-index que les modales, elles
                doivent passer devant (sinon un jet libre, modale encore ouverte,
                masquait sa propre notification). */}
            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(toast) => <VikingsHistoryEntry entry={toast} compact />}
                renderAllRollTypes
            />
        </div>
    );
};

export default Sheet;
