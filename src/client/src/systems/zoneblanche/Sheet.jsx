// src/client/src/systems/zoneblanche/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Zone Blanche — shell : bandeau, onglets, menu, modales.
// Le corps de la fiche vit dans components/layout/SheetLayout.jsx, partagé
// à l'identique avec l'interface GM.
//
// Contrat props (plateforme) :
//   character, onCharacterUpdate, onLogout, journalUnread, onJournalRead,
//   darkMode, onToggleDarkMode
//
// Onglets : Fiche · Journal · Historique
// Menu : Créer un personnage · Changer de personnage · Avatar · Code d'accès
//        · Config dés · Interface GM · Déconnexion
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
// theme.css n'est PAS importé ici : c'est une dépendance de page, chargée par
// PlayerPage/GMPage via import.meta.glob keyé sur le slug (convention plateforme).

import { useSystem }  from '../../hooks/useSystem.js';
import { useAuth }    from '../../context/AuthContext.jsx';
import { useSocket }  from '../../context/SocketContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useFetch }   from '../../hooks/useFetch.js';

import ThemeToggle        from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import SessionPlayersBar  from '../../components/layout/SessionPlayersBar.jsx';
import JournalTab         from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal    from '../../components/modals/DiceConfigModal.jsx';
import CharacterListModal from '../../components/modals/CharacterListModal.jsx';
import AccessCodeModal    from '../../components/modals/AccessCodeModal.jsx';
import AvatarUploader     from '../../components/AvatarUploader.jsx';

import FreeDiceModal          from '../../components/modals/FreeDiceModal.jsx';

import SheetLayout              from './components/layout/SheetLayout.jsx';
import ZoneBlancheDiceModal     from './components/modals/ZoneBlancheDiceModal.jsx';
import ZoneBlancheHistoryEntry  from './components/layout/ZoneBlancheHistoryEntry.jsx';

const TABS = [
    { id: 'fiche',      label: 'Fiche' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
];

// ── Timecode live (signature du thème) ───────────────────────────────────────

function useTimecode() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ── Jauges de session (Audimat / Stress) ─────────────────────────────────────
// Audimat : modifiable joueurs + MJ · Stress : visible, modifiable MJ seul.
// Écriture via la route REST (jamais d'émission socket depuis un composant) ;
// la route rediffuse à la room, on reçoit la mise à jour par socket.

const SessionGauges = ({ resources, onAdjust }) => (
    <div className="zb-gauges">
        <div className="zb-gauge">
            <div className="zb-eyebrow">Audimat</div>
            <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => onAdjust('audimat', -1)}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold"
                        disabled={(resources.audimat ?? 0) <= 0}>−</button>
                <div className="zb-gauge-strip">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className={`zb-gauge-seg ${i < (resources.audimat ?? 0) ? 'is-filled' : ''}`} />
                    ))}
                </div>
                <span className="zb-mono text-lg text-default w-6 text-center">{resources.audimat ?? 0}</span>
                <button type="button" onClick={() => onAdjust('audimat', 1)}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold"
                        disabled={(resources.audimat ?? 0) >= 6}>+</button>
            </div>
        </div>

        <div className="zb-gauge">
            <div className="zb-eyebrow">Stress</div>
            <div className="flex items-center gap-2 mt-1">
                <span className="zb-stress-value zb-mono">{resources.stress ?? 0}</span>
                <span className="text-xs text-muted">réserve du MJ</span>
            </div>
        </div>
    </div>
);

// ── Composant principal ──────────────────────────────────────────────────────

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
    const timecode                               = useTimecode();

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
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [diceModal,      setDiceModal]      = useState(null);

    const [sessionResources, setSessionResources] = useState({ audimat: 0, stress: 6 });

    // ── Ressources de session ─────────────────────────────────────────────
    useEffect(() => {
        if (!activeGMSession) return;
        fetchWithAuth(`${apiBase}/session-resources/${activeGMSession}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data) setSessionResources(data); })
            .catch(() => {});
    }, [activeGMSession, apiBase]);

    useEffect(() => {
        if (!socket) return;
        const onUpdate = (data) => setSessionResources(prev => ({ ...prev, ...data }));
        socket.on('session-resources-update', onUpdate);
        return () => socket.off('session-resources-update', onUpdate);
    }, [socket]);

    // ── Synchronisation du buffer d'édition ───────────────────────────────
    useEffect(() => {
        if (!editMode) setEditableChar(character);
    }, [character, editMode]);

    const char = editMode ? editableChar : character;

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

    // Audimat : écriture REST, la route rediffuse par socket
    const adjustResource = useCallback(async (field, delta) => {
        if (!activeGMSession) return;
        try {
            const r = await fetchWithAuth(`${apiBase}/session-resources/${activeGMSession}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ field, delta }),
            });
            if (r.ok) setSessionResources(await r.json());
        } catch (e) {
            console.error('[zoneblanche] adjustResource:', e);
        }
    }, [activeGMSession, apiBase]);

    // Ouvre la modale de jet préremplie depuis un clic sur un rang.
    const handleRoll = useCallback((ctx) => {
        setDiceModal(ctx ?? {});
    }, []);

    if (!character) return null;

    return (
        <div className="zb-root zb-grain relative min-h-screen bg-default text-default"
             data-theme={darkMode ? 'dark' : 'light'}>

            <ToastNotifications
                sessionId={activeGMSession}
                renderDiceToast={(entry) => <ZoneBlancheHistoryEntry entry={entry} compact />}
                renderAllRollTypes
            />

            {/* ── Bandeau de diffusion ─────────────────────────────────────── */}
            <header className="zb-broadcast-bar px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
                <div className="flex items-center gap-4 min-w-0">
                    <span className="zb-channel-bug shrink-0">Ch. 13</span>
                    <div className="min-w-0">
                        <div className="zb-title text-xl leading-none truncate">Zone Blanche</div>
                        <div className="zb-eyebrow mt-1 truncate">
                            {[character.prenom, character.nom].filter(Boolean).join(' ') || 'Sans nom'}
                            {activeSessionName ? ` · ${activeSessionName}` : ''}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:flex items-center gap-2 zb-timecode text-sm">
                        <span className="zb-rec-dot" />
                        REC {timecode}
                    </span>
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    {/* Menu hamburger */}
                    <div className="relative">
                        <button type="button" onClick={() => setShowMenu(v => !v)}
                                className="zb-btn-ghost px-3 py-2 rounded-sm" title="Menu">☰</button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="zb-menu">
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); window.location.href = `/${slug}/creation`; }}>Créer un personnage</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowCharList(true); }}>Changer de personnage</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowAvatar(true); }}>Changer l'avatar</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowAccessCode(true); }}>Code d'accès</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowFreeDice(true); }}>Jet de dés libre</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>Config animations dés</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); window.location.href = `/${slug}/gm`; }}>Interface GM</button>
                                    <div className="zb-menu-separator" />
                                    <button className="zb-menu-item is-danger" onClick={handleLogout}>Déconnexion</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Onglets + édition ────────────────────────────────────────── */}
            <div className="zb-subheader px-4 flex items-center justify-between gap-3">
                <nav className="flex items-center gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} type="button" onClick={() => changeTab(tab.id)}
                                className={`zb-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                            {tab.label}
                            {tab.id === 'journal' && journalUnread > 0 && (
                                <span className="zb-badge">{journalUnread}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {activeTab === 'fiche' && (
                    <div className="flex items-center gap-2 py-2">
                        {editMode ? (
                            <>
                                <button type="button" onClick={handleCancel} className="zb-btn-ghost px-3 py-1.5 rounded-sm text-sm">Annuler</button>
                                <button type="button" onClick={handleSave} className="zb-btn-primary px-3 py-1.5 rounded-sm text-sm">Enregistrer</button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setEditMode(true)} className="zb-btn-ghost px-3 py-1.5 rounded-sm text-sm">Modifier</button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Corps ────────────────────────────────────────────────────── */}
            <div className="flex">
                <SessionPlayersBar
                    character={character}
                    sessionId={activeGMSession}
                    sessionName={activeSessionName}
                />

                <main className="flex-1 min-w-0 p-4">
                    {activeTab === 'fiche' && (
                        <>
                            {activeGMSession && (
                                <SessionGauges resources={sessionResources} onAdjust={adjustResource} />
                            )}
                            <SheetLayout
                                char={char}
                                editMode={editMode}
                                set={set}
                                patchImmediate={patchImmediate}
                                onRoll={handleRoll}
                                onAvatarClick={() => setShowAvatar(true)}
                                sessionId={activeGMSession}
                            />
                        </>
                    )}

                    {activeTab === 'journal' && (
                        <JournalTab characterId={character.id} />
                    )}

                    {activeTab === 'historique' && (
                        <DiceHistoryPage
                            sessionId={activeGMSession}
                            renderHistoryEntry={(entry) => <ZoneBlancheHistoryEntry entry={entry} />}
                            renderAllRollTypes
                        />
                    )}
                </main>
            </div>

            {/* ── Modales ──────────────────────────────────────────────────── */}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}

            {showCharList && (
                <CharacterListModal
                    isOpen
                    onClose={() => setShowCharList(false)}
                    onSelect={c => { window.location.href = `/${slug}/${c.accessUrl}`; }}
                />
            )}

            {showAvatar && (
                <AvatarUploader
                    currentAvatar={character.avatar}
                    onAvatarChange={avatar => patchImmediate({ avatar })}
                    onClose={() => setShowAvatar(false)}
                />
            )}

            {diceModal && (
                <ZoneBlancheDiceModal
                    character={character}
                    onCharacterUpdate={onCharacterUpdate}
                    sessionId={activeGMSession}
                    sessionResources={sessionResources}
                    onResourcesChange={setSessionResources}
                    preselect={diceModal}
                    onClose={() => setDiceModal(null)}
                />
            )}

            {showFreeDice && (
                <FreeDiceModal
                    characterId={character.id}
                    characterName={[character.prenom, character.nom].filter(Boolean).join(' ')}
                    sessionId={activeGMSession}
                    onClose={() => setShowFreeDice(false)}
                />
            )}

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