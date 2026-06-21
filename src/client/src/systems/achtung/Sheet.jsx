// src/client/src/systems/achtung/Sheet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import './theme.css';

import { useSystem }  from '../../hooks/useSystem.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useAuth }    from '../../context/AuthContext.jsx';
import { useSocket }  from '../../context/SocketContext.jsx';
import { useFetch }   from '../../hooks/useFetch.js';

import ThemeToggle        from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal    from '../../components/modals/DiceConfigModal.jsx';
import CharacterListModal from '../../components/modals/CharacterListModal.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';

import VerticalGauge from './components/VerticalGauge.jsx';
import AttributeGrid      from './components/AttributeGrid.jsx';
import SkillsSection      from './components/SkillsSection.jsx';
import StressTracker      from './components/StressTracker.jsx';
import FortuneAmmoTracker from './components/FortuneAmmoTracker.jsx';
import TalentsList        from './components/TalentsList.jsx';
import WeaponsTable       from './components/WeaponsTable.jsx';
import ItemsList          from './components/ItemsList.jsx';
import LanguagePills      from './components/LanguagePills.jsx';
import SpellsSection      from './components/SpellsSection.jsx';
import IdentitySection    from './components/IdentitySection.jsx';
import TruthsSection      from './components/TruthsSection.jsx';
import AchtungHistoryEntry from './components/AchtungHistoryEntry.jsx';
import AchtungDiceModal    from './dice/AchtungDiceModal.jsx';

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
    const { slug, apiBase }                      = useSystem();
    const { logout }                             = useAuth();
    const { activeGMSession, activeSessionName } = useSession();
    const socket                                 = useSocket();
    const fetchWithAuth                          = useFetch();

    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return TABS.some(t => t.id === hash) ? hash : 'fiche';
    });
    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(character);
    const [showMenu,       setShowMenu]       = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showCharList,   setShowCharList]   = useState(false);
    const [showAvatar,     setShowAvatar]     = useState(false);
    const [diceModal,      setDiceModal]      = useState(null);
    const [sessionResources, setSessionResources] = useState({ momentum: 0, threat: 0 });

    // ── Ressources de session ─────────────────────────────────────────────────
    useEffect(() => {
        if (!activeGMSession) return;
        fetchWithAuth(`${apiBase}/session-resources/${activeGMSession}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setSessionResources(data); })
            .catch(() => {});
    }, [activeGMSession, apiBase]);

    useEffect(() => {
        if (!socket) return;
        const onUpdate = (data) => setSessionResources(prev => ({ ...prev, ...data }));
        socket.on('session-resources-update', onUpdate);
        return () => socket.off('session-resources-update', onUpdate);
    }, [socket]);

    useEffect(() => {
        if (!editMode) setEditableChar(character);
    }, [character, editMode]);

    const char = editableChar;

    const set = useCallback((field, value) => {
        setEditableChar(prev => ({ ...prev, [field]: value }));
    }, []);

    const patchImmediate = useCallback((patch) => {
        onCharacterUpdate({ ...character, ...patch });
    }, [character, onCharacterUpdate]);

    const handleSave = useCallback(() => {
        onCharacterUpdate(editableChar);
        setEditMode(false);
    }, [editableChar, onCharacterUpdate]);

    const handleCancel = useCallback(() => {
        setEditableChar(character);
        setEditMode(false);
    }, [character]);

    const changeTab = useCallback((tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
        if (tab === 'journal') onJournalRead?.();
    }, [onJournalRead]);

    const handleLogout = useCallback(async () => {
        setShowMenu(false);
        await logout();
        onLogout?.();
    }, [logout, onLogout]);

    const updateResource = useCallback((field, delta) => {
        if (!socket || !activeGMSession) return;
        socket.emit('update-session-resources', { sessionId: activeGMSession, field, delta });
        setSessionResources(prev => ({
            ...prev,
            [field]: Math.max(0, (prev[field] ?? 0) + delta),
        }));
    }, [socket, activeGMSession]);

    const handleDirectField = useCallback((field, value) => {
        if (editMode) set(field, value);
        else patchImmediate({ [field]: value });
    }, [editMode, set, patchImmediate]);

    return (
        <div
            className="min-h-screen"
            data-theme={darkMode ? 'dark' : 'light'}
            style={{ background: 'var(--ac-bg)', color: 'var(--ac-text)', fontFamily: 'var(--ac-font-body)' }}
        >
            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(entry) => {
                    const adapted = { ...entry, details: entry.roll_result };
                    return <AchtungHistoryEntry roll={adapted}  />;
                }}
            />

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="ac-header">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                        <div className="ac-page-title">Achtung! Cthulhu</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setDiceModal({ type: 'skill' })} className="ac-btn ac-btn-primary">
                        🎲
                    </button>
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                    <div className="relative">
                        <button onClick={() => setShowMenu(v => !v)} className={`ac-menu-btn${showMenu ? ' open' : ''}`}>☰</button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="ac-menu-dropdown">
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); window.location.href = `/${slug}/creation`; }}>✨ Créer un personnage</button>
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); setShowCharList(true); }}>🔄 Changer de personnage</button>
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); setShowAvatar(true); }}>🖼️ Changer l'avatar</button>
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>🎲 Config animations dés</button>
                                    <button className="ac-menu-item" onClick={() => { setShowMenu(false); window.location.href = `/${slug}/gm`; }}>🎭 Interface GM</button>
                                    <div className="ac-menu-separator" />
                                    <button className="ac-menu-item danger" onClick={handleLogout}>🚪 Déconnexion</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── ONGLETS ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between w-full ac-subheader-bar">
                <nav className="ac-nav-bar">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => changeTab(tab.id)} className={`ac-tab${activeTab === tab.id ? ' active' : ''}`}>
                            {tab.label}
                            {tab.id === 'journal' && journalUnread > 0 && (
                                <span className="ac-badge ml-1">{journalUnread}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-2 pr-2">
                    {!editMode
                        ? <button onClick={() => setEditMode(true)} className="ac-btn ac-btn-secondary">✏️</button>
                        : <div className="flex gap-2">
                            <button onClick={handleSave}   className="ac-btn ac-btn-primary">💾</button>
                            <button onClick={handleCancel} className="ac-btn ac-btn-ghost">Annuler</button>
                        </div>
                    }
                </div>
            </div>


            {/* ── LAYOUT ───────────────────────────────────────────────────── */}
            <div className="flex">
                <SessionPlayersBar
                    character={character}
                    sessionId={activeGMSession}
                    sessionName={activeSessionName}
                    headerHeight={40}
                    noWidthWhenCollapsed={true}
                />

                <div className="flex-1 min-w-0">

                    {/* ── ONGLET FICHE ──────────────────────────────────────── */}
                    {activeTab === 'fiche' && (
                        <div className="flex">

                            {/* ── Jauge Momentum — colonne gauche ───────────── */}
                            {activeGMSession && (
                                <div className="ac-sheet-container-flex">
                                    <div className="shrink-0 flex flex-col items-center px-2 py-4 sticky self-start ac-resource-gauge ac-resource-gauge-left">
                                        <VerticalGauge
                                            label="Mom."
                                            value={sessionResources.momentum ?? 0}
                                            max={6}
                                            filledColor="var(--ac-momentum-color)"
                                            emptyColor="var(--ac-surface-alt)"
                                            borderColor="var(--ac-primary)"
                                            onInc={() => updateResource('momentum', 1)}
                                            onDec={() => updateResource('momentum', -1)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Contenu principal ─────────────────────────── */}
                            <div className="flex-1 min-w-0">
                                <div className="ac-sheet-layout">

                                    {/* ── COLONNE PRINCIPALE ────────────────── */}
                                    <div className="ac-sheet-main">

                                        {/* 1. IDENTITÉ */}
                                        <div className="ac-card">
                                            <IdentitySection
                                                char={char}
                                                editMode={editMode}
                                                set={set}
                                                onAvatarClick={() => setShowAvatar(true)}
                                            />
                                        </div>

                                        {/* 2. ATTRIBUTS */}
                                        <div className="ac-card">
                                            <AttributeGrid attributes={char.attributes} editMode={editMode} onChange={val => set('attributes', val)} onRoll={(ctx) => setDiceModal({ type: 'skill', ...ctx })} />
                                        </div>

                                        {/* 3. COMPÉTENCES */}
                                        <div className="ac-card">
                                            <SkillsSection skills={char.skills} editMode={editMode} onChange={val => set('skills', val)} onRoll={(ctx) => setDiceModal({ type: 'skill', ...ctx })} />
                                        </div>

                                        {/* 4. ARMEMENT */}
                                        <div className="ac-card">
                                            <WeaponsTable weapons={char.weapons} editMode={editMode} onChange={val => set('weapons', val)} onRollDamage={(w) => setDiceModal({ type: 'damage', weapon: w })} />
                                        </div>

                                        <div className="ac-card">
                                            <ItemsList items={char.items} editMode={editMode} onChange={val => set('items', val)} />
                                        </div>

                                        {/* 6. SORTS */}
                                        {(char.isSpellcaster || editMode) && (
                                            <SpellsSection
                                                isSpellcaster={char.isSpellcaster}
                                                power={char.power}
                                                spellcasterPractice={char.spellcasterPractice}
                                                spells={char.spells}
                                                editMode={editMode}
                                                onChange={val => set('spells', val)}
                                                onChangePower={(field, value) => set(
                                                    field === 'is_spellcaster'         ? 'isSpellcaster'
                                                        : field === 'spellcaster_practice' ? 'spellcasterPractice'
                                                            : field,
                                                    value
                                                )}
                                                onRoll={(ctx) => setDiceModal({ type: 'skill', ...ctx })}
                                            />
                                        )}
                                    </div>

                                    {/* ── SIDEBAR ───────────────────────────── */}
                                    <aside className="ac-sheet-sidebar">

                                        {/* Stress + Blessures */}
                                        <div className="ac-card">
                                            <StressTracker
                                                character={char}
                                                editMode={editMode}
                                                onChange={handleDirectField}
                                            />
                                        </div>

                                        {/* Fortune + Munitions */}
                                        <div className="ac-card">
                                            <FortuneAmmoTracker fortune={char.fortune} ammo={char.ammo} editMode={editMode} onChange={handleDirectField} />
                                        </div>

                                        {/* Vérités */}
                                        <div className="ac-card">
                                            <TruthsSection
                                                truths={char.truths}
                                                editMode={editMode}
                                                onChange={val => editMode ? set('truths', val) : handleDirectField('truths', val)}
                                            />
                                        </div>

                                        <div className="ac-card">
                                            <TalentsList talents={char.talents} editMode={editMode} onChange={val => set('talents', val)} />
                                        </div>

                                        {/* Langues */}
                                        <div className="ac-card">
                                            <LanguagePills languages={char.languages} editMode={editMode} onChange={val => handleDirectField('languages', val)} />
                                        </div>
                                    </aside>
                                </div>
                            </div>{/* fin contenu principal */}

                            {/* ── Jauge Menace — colonne droite ─────────────── */}
                            {activeGMSession && (
                                <div className="ac-sheet-container-flex">
                                    <div className="shrink-0 flex flex-col items-center px-2 py-4 sticky self-start ac-resource-gauge ac-resource-gauge-right h-full">
                                        <VerticalGauge
                                            label="Menace"
                                            value={Math.min(sessionResources.threat ?? 0, 12)}
                                            max={12}
                                            filledColor="var(--ac-accent)"
                                            emptyColor="var(--ac-surface-alt)"
                                            borderColor="var(--ac-accent)"
                                            readonly
                                        />
                                        <span className="ac-font-title mt-1" style={{ fontSize: '0.75rem', color: 'var(--ac-accent)', fontWeight: 700 }}>
                                            {sessionResources.threat ?? 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ONGLET JOURNAL ────────────────────────────────────── */}
                    {activeTab === 'journal' && (
                        <div className="px-3 py-4">
                            <JournalTab characterId={character.id} sessionId={activeGMSession} apiBase={apiBase} />
                        </div>
                    )}

                    {/* ── ONGLET HISTORIQUE ─────────────────────────────────── */}
                    {activeTab === 'historique' && (
                        <div className="px-3 py-4">
                            <DiceHistoryPage
                                sessionId={activeGMSession}
                                renderHistoryEntry={(entry) => <AchtungHistoryEntry roll={entry} />}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODALES ───────────────────────────────────────────────────── */}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
            {showCharList && (
                <CharacterListModal
                    isOpen
                    onClose={() => setShowCharList(false)}
                    onSelect={(c) => { setShowCharList(false); window.location.href = `/${slug}/${c.accessUrl}`; }}
                />
            )}
            {showAvatar && (
                <AvatarUploader
                    currentAvatar={char.avatar}
                    onAvatarChange={(newAvatar) => {
                        setEditableChar(prev => ({ ...prev, avatar: newAvatar }));
                        patchImmediate({ avatar: newAvatar });
                    }}
                    onClose={() => setShowAvatar(false)}
                />
            )}
            {diceModal && (
                <AchtungDiceModal
                    mode={diceModal.type === 'damage' ? 'damage' : 'skill'}
                    character={char}
                    preselect={diceModal.type === 'skill' ? { skillKey: diceModal.skillKey, attrKey: diceModal.attrKey } : null}
                    weapon={diceModal.type === 'damage' ? diceModal.weapon : null}
                    sessionResources={sessionResources}
                    onClose={() => setDiceModal(null)}
                    onCharacterUpdate={onCharacterUpdate}
                />
            )}
        </div>
    );
};

export default Sheet;