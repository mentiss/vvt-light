// src/client/src/systems/achtung/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session GM — Achtung! Cthulhu
//
// Architecture socket (règle permanente) :
//   · GMPage → useGMSession → props { activeSession, onSessionChange, onlineCharacters }
//   · Ce composant NE déclare PAS de listeners character-full-update / character-update.
//   · SEUL listener socket autorisé ici : session-resources-gm-update (donnée de session).
//
// Contrat GM standard (permanent, tous slugs) :
//   1. Sidebar personnages : avatar + nom perso + nom joueur entre parenthèses + archétype + dot online
//   2. Fiche — layout ac-sheet-layout identique à Sheet.jsx, mêmes composants, même ordre
//   3. Mode édition toggle → PUT complet à la fermeture
//   4. Envoyer une note (GMSendModal pré-sélectionné)
//   5. Copier le code d'accès dans le presse-papier
//   6. Bouton gestion des sessions

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket }  from '../../../../context/SocketContext.jsx';
import { useFetch }   from '../../../../hooks/useFetch.js';
import { useSystem }  from '../../../../hooks/useSystem.js';

import TableManagementModal from '../../../../components/gm/modals/TableManagementModal.jsx';
import GMSendModal          from '../../../../components/gm/modals/GMSendModal.jsx';

import { ARCHETYPES } from '../../config.jsx';

// Exactement les mêmes composants que Sheet.jsx — dans le même ordre
import IdentitySection    from '../../components/IdentitySection.jsx';
import AttributeGrid      from '../../components/AttributeGrid.jsx';
import SkillsSection      from '../../components/SkillsSection.jsx';
import StressTracker      from '../../components/StressTracker.jsx';
import FortuneAmmoTracker from '../../components/FortuneAmmoTracker.jsx';
import TalentsList        from '../../components/TalentsList.jsx';
import WeaponsTable       from '../../components/WeaponsTable.jsx';
import ItemsList          from '../../components/ItemsList.jsx';
import LanguagePills      from '../../components/LanguagePills.jsx';
import SpellsSection      from '../../components/SpellsSection.jsx';
import TruthsSection      from '../../components/TruthsSection.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveArchetype = (key) =>
    ARCHETYPES.find(a => a.key === key)?.label ?? key ?? '—';

// ── Sous-composant : barre de ressources de session ───────────────────────────
// Seul endroit dans TabSession qui écoute un socket : session-resources-gm-update.

const ResourcesPanel = ({ sessionId, resources, onUpdate }) => {
    const socket = useSocket();

    const emit = useCallback((field, delta) => {
        if (!socket || !sessionId) return;
        socket.emit('update-session-resources', { sessionId, field, delta });
        onUpdate(prev => ({ ...prev, [field]: Math.max(0, (prev[field] ?? 0) + delta) }));
    }, [socket, sessionId, onUpdate]);

    useEffect(() => {
        if (!socket) return;
        const onResources = (data) => onUpdate(prev => ({ ...prev, ...data }));
        socket.on('session-resources-gm-update', onResources);
        return () => socket.off('session-resources-gm-update', onResources);
    }, [socket, onUpdate]);

    const Counter = ({ label, field, color, max }) => (
        <div className="flex flex-col items-center gap-1">
            <span className="ac-label" style={color ? { color } : {}}>{label}</span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => emit(field, -1)}
                    disabled={(resources[field] ?? 0) <= 0}
                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                >−</button>
                <span className="w-10 text-center ac-font-title"
                      style={{ fontSize: '1.1rem', fontWeight: 700, color: color ?? 'var(--ac-text)' }}>
                    {resources[field] ?? 0}
                </span>
                <button
                    onClick={() => emit(field, 1)}
                    disabled={max !== undefined && (resources[field] ?? 0) >= max}
                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                >+</button>
            </div>
            {max !== undefined && (
                <span className="ac-label" style={{ fontSize: '0.6rem', color: 'var(--ac-muted)' }}>max {max}</span>
            )}
        </div>
    );

    return (
        <div className="ac-card flex flex-wrap items-center justify-around gap-4 py-3">
            <Counter label="Momentum"      field="momentum"      color="var(--ac-momentum-color)" max={6} />
            <Counter label="Threat"        field="threat"        color="var(--ac-accent)" />
            <Counter label="Complications" field="complications" />
        </div>
    );
};

// ── Sous-composant : item sidebar personnage ──────────────────────────────────
// Défini au niveau module (jamais dans render).

const SidebarCharItem = ({ character, isOnline, isSelected, onClick }) => {
    const fullName = [character?.prenom, character?.nom].filter(Boolean).join(' ') || 'Anonyme';
    const initial  = (character?.prenom?.[0] ?? character?.nom?.[0] ?? '?').toUpperCase();

    return (
        <button
            onClick={onClick}
            className={`ac-gm-char-btn${isSelected ? ' active' : ''}`}
        >
            <div className="relative shrink-0">
                <div className="w-10 h-10 rounded overflow-hidden ac-gm-char-avatar">
                    {character?.avatar
                        ? <img src={character.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center ac-font-title ac-gm-char-initial">
                              {initial}
                          </span>
                    }
                </div>
                <span className={`ac-gm-online-dot${isOnline ? ' online' : ''}`} />
            </div>

            <div className="min-w-0 flex-1 text-left">
                <div className={`text-sm font-semibold truncate${isSelected ? ' ac-gm-char-name-active' : ' ac-gm-char-name'}`}>
                    {fullName}
                </div>
                {character?.playerName && (
                    <div className="ac-gm-char-player truncate">({character.playerName})</div>
                )}
                <div className="ac-gm-char-subtitle truncate">
                    {resolveArchetype(character?.archetype)}
                </div>
            </div>
        </button>
    );
};

// ── Sous-composant : barre d'actions GM ───────────────────────────────────────
// Défini au niveau module.

const GMActionBar = ({ char, editMode, copied, onToggleEdit, onSendNote, onCopyCode, onManageSessions }) => (
    <div className="ac-card flex items-center gap-2 flex-wrap">
        <button
            onClick={onToggleEdit}
            className={`ac-btn ${editMode ? 'ac-btn-primary' : 'ac-btn-secondary'}`}
            style={{ minWidth: '7rem' }}
        >
            {editMode ? '✓ Terminer' : '✎ Éditer'}
        </button>

        {char && (
            <>
                <button onClick={onSendNote} className="ac-btn ac-btn-secondary">
                    ✉ Envoyer une note
                </button>
                <button
                    onClick={onCopyCode}
                    className="ac-btn ac-btn-secondary"
                    style={copied ? { color: 'var(--ac-success)', borderColor: 'var(--ac-success)' } : {}}
                >
                    {copied ? '✓ Copié !' : '⎘ Code d\'accès'}
                </button>
            </>
        )}

        <button
            onClick={onManageSessions}
            className="ac-btn ac-btn-secondary"
            style={{ marginLeft: 'auto' }}
        >
            ⛶ Sessions
        </button>
    </div>
);

// ── Composant principal ───────────────────────────────────────────────────────

const TabSession = ({ activeSession, onSessionChange, onlineCharacters }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [characters,    setCharacters]    = useState({});
    const [selectedId,    setSelectedId]    = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [editMode,      setEditMode]      = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [copied,        setCopied]        = useState(false);
    const [showTable,     setShowTable]     = useState(false);
    const [resources,     setResources]     = useState({ momentum: 0, threat: 0, complications: 0 });

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    // ── Chargement des fiches ─────────────────────────────────────────────────
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        const load = async () => {
            const loaded = {};
            await Promise.all(activeSession.characters.map(async c => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${c.id}`);
                    if (r.ok) loaded[c.id] = await r.json();
                } catch (e) {
                    console.error(`[TabSession/achtung] load ${c.id}:`, e);
                }
            }));
            setCharacters(loaded);
            setSelectedId(prev => (prev && loaded[prev]) ? prev : (activeSession.characters[0]?.id ?? null));
            setLoading(false);
        };
        load();
    }, [activeSession?.id, activeSession?.characters?.length]);

    // ── Chargement des ressources de session ──────────────────────────────────
    // Route : GET /api/achtung/session-resources/:id
    useEffect(() => {
        if (!activeSession?.id) return;
        fetchWithAuth(`${apiBase}/session-resources/${activeSession.id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setResources(data); })
            .catch(() => {});
    }, [activeSession?.id]);

    // ── Reset editMode quand on change de personnage ──────────────────────────
    useEffect(() => { setEditMode(false); }, [selectedId]);

    // ── set local — identique à Sheet.jsx ────────────────────────────────────
    const set = useCallback((field, value) => {
        if (!selectedId) return;
        setCharacters(prev => ({
            ...prev,
            [selectedId]: { ...prev[selectedId], [field]: value },
        }));
    }, [selectedId]);

    // ── patchImmediate — PATCH HTTP, identique à Sheet.jsx ───────────────────
    const patchImmediate = useCallback(async (patch) => {
        if (!selectedId) return;
        const current = characters[selectedId];
        if (!current) return;
        setCharacters(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], ...patch } }));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(patch),
            });
            if (r.ok) {
                const updated = await r.json();
                setCharacters(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], ...updated } }));
            } else {
                setCharacters(prev => ({ ...prev, [selectedId]: current }));
            }
        } catch {
            setCharacters(prev => ({ ...prev, [selectedId]: current }));
        }
    }, [selectedId, characters, apiBase, fetchWithAuth]);

    // ── handleDirectField — identique à Sheet.jsx ────────────────────────────
    const handleDirectField = useCallback((field, value) => {
        if (editMode) set(field, value);
        else patchImmediate({ [field]: value });
    }, [editMode, set, patchImmediate]);

    // ── Sauvegarde complète à la fin d'editMode (PUT) ─────────────────────────
    const saveEdit = useCallback(async () => {
        if (!selectedId || !characters[selectedId]) return;
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(characters[selectedId]),
            });
            if (r.ok) {
                const updated = await r.json();
                setCharacters(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], ...updated } }));
            }
        } catch (e) {
            console.error('[TabSession/achtung] saveEdit:', e);
        }
    }, [selectedId, characters, apiBase, fetchWithAuth]);

    // ── Toggle editMode ───────────────────────────────────────────────────────
    const handleToggleEdit = useCallback(async () => {
        if (editMode) {
            await saveEdit();
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    }, [editMode, saveEdit]);

    // ── Copier le code d'accès ────────────────────────────────────────────────
    const handleCopyCode = useCallback(() => {
        const char = characters[selectedId];
        if (!char) return;
        const fullName = [char.prenom, char.nom].filter(Boolean).join(' ') || 'Anonyme';
        const text = [
            `Achtung! Cthulhu — ${fullName}`,
            `Lien : ${window.location.origin}/achtung/${char.accessUrl}`,
            `Code : ${char.accessCode}`,
        ].join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [characters, selectedId]);

    // ── Données dérivées ──────────────────────────────────────────────────────
    const sessionCharacters    = activeSession?.characters ?? [];
    const char                 = selectedId ? characters[selectedId] : null;
    const sessionCharsForModal = sessionCharacters.map(sc => ({
        id:   sc.id,
        name: characters[sc.id]
            ? [characters[sc.id].prenom, characters[sc.id].nom].filter(Boolean).join(' ') || 'Anonyme'
            : '…',
    }));

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 7rem)' }}>

            {/* ── SIDEBAR PERSONNAGES ─────────────────────────────────────── */}
            <aside className="ac-gm-sidebar">
                <div className="ac-gm-sidebar-header">
                    <div className="ac-label" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Personnages
                    </div>
                    {activeSession && (
                        <div className="ac-font-title" style={{ fontSize: '0.75rem', color: 'var(--ac-secondary)', marginTop: '0.15rem' }}>
                            {activeSession.name}
                        </div>
                    )}
                </div>

                {!activeSession && (
                    <div className="p-3 text-center ac-text-muted" style={{ fontSize: '0.78rem' }}>
                        Aucune session active
                    </div>
                )}

                {loading && (
                    <div className="p-3 text-center ac-text-muted" style={{ fontSize: '0.78rem' }}>
                        Chargement…
                    </div>
                )}

                {!loading && sessionCharacters.map(sc => (
                    <SidebarCharItem
                        key={sc.id}
                        character={characters[sc.id]}
                        isOnline={onlineIds.has(sc.id)}
                        isSelected={selectedId === sc.id}
                        onClick={() => setSelectedId(sc.id)}
                    />
                ))}
            </aside>

            {/* ── ZONE PRINCIPALE ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 overflow-y-auto">

                {/* Ressources + actions GM au-dessus de la fiche */}
                <div className="flex flex-col gap-3 px-3 pt-3">
                    {activeSession && (
                        <ResourcesPanel
                            sessionId={activeSession.id}
                            resources={resources}
                            onUpdate={setResources}
                        />
                    )}
                    <GMActionBar
                        char={char}
                        editMode={editMode}
                        copied={copied}
                        onToggleEdit={handleToggleEdit}
                        onSendNote={() => setShowSendModal(true)}
                        onCopyCode={handleCopyCode}
                        onManageSessions={() => setShowTable(true)}
                    />
                </div>

                {/* État vide */}
                {!char && !loading && (
                    <div className="ac-card mx-3 mt-3 text-center ac-text-muted py-12">
                        {sessionCharacters.length === 0
                            ? 'Aucun personnage dans cette session.'
                            : 'Sélectionne un personnage dans la sidebar.'}
                    </div>
                )}

                {/* ── FICHE — layout identique à Sheet.jsx ─────────────── */}
                {char && (
                    <div className="ac-sheet-layout">

                        {/* ── COLONNE PRINCIPALE ──────────────────────────── */}
                        <div className="ac-sheet-main">

                            {/* 1. IDENTITÉ + ATTRIBUTS — grille ac-gear-talents-grid */}
                            <div className="ac-gear-talents-grid">
                                <div className="ac-card">
                                    <IdentitySection
                                        char={char}
                                        editMode={editMode}
                                        set={set}
                                        onAvatarClick={null}
                                    />
                                </div>
                                <div className="ac-card">
                                    <AttributeGrid
                                        attributes={char.attributes}
                                        editMode={editMode}
                                        onChange={val => set('attributes', val)}
                                        onRoll={null}
                                    />
                                </div>
                            </div>

                            {/* 3. COMPÉTENCES */}
                            <div className="ac-card">
                                <SkillsSection
                                    skills={char.skills}
                                    editMode={editMode}
                                    onChange={val => set('skills', val)}
                                    onRoll={null}
                                />
                            </div>

                            {/* 4. ARMES */}
                            <div className="ac-card">
                                <WeaponsTable
                                    weapons={char.weapons}
                                    editMode={editMode}
                                    onChange={val => set('weapons', val)}
                                    onRollDamage={null}
                                />
                            </div>

                            {/* 5. ÉQUIPEMENT */}
                            <div className="ac-card">
                                <ItemsList
                                    items={char.items}
                                    editMode={editMode}
                                    onChange={val => set('items', val)}
                                />
                            </div>

                            {/* 6. SORTS — spellcasters uniquement */}
                            {(char.isSpellcaster || editMode) && (
                                <SpellsSection
                                    isSpellcaster={char.isSpellcaster}
                                    power={char.power}
                                    spells={char.spells}
                                    editMode={editMode}
                                    onChange={val => set('spells', val)}
                                    onChangePower={(field, value) =>
                                        set(field === 'is_spellcaster' ? 'isSpellcaster' : field, value)
                                    }
                                />
                            )}
                        </div>

                        {/* ── SIDEBAR — identique à Sheet.jsx ─────────────── */}
                        <aside className="ac-sheet-sidebar">

                            <div className="ac-card">
                                <StressTracker
                                    character={char}
                                    editMode={editMode}
                                    onChange={handleDirectField}
                                />
                            </div>

                            <div className="ac-card">
                                <FortuneAmmoTracker
                                    fortune={char.fortune}
                                    ammo={char.ammo}
                                    editMode={editMode}
                                    onChange={handleDirectField}
                                />
                            </div>

                            <div className="ac-card">
                                <TruthsSection
                                    truths={char.truths}
                                    editMode={editMode}
                                    onChange={val => editMode ? set('truths', val) : handleDirectField('truths', val)}
                                />
                            </div>

                            <div className="ac-card">
                                <TalentsList
                                    talents={char.talents}
                                    editMode={editMode}
                                    onChange={val => set('talents', val)}
                                />
                            </div>

                            <div className="ac-card">
                                <LanguagePills
                                    languages={char.languages}
                                    editMode={editMode}
                                    onChange={val => handleDirectField('languages', val)}
                                />
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            {/* ── MODALES ──────────────────────────────────────────────────── */}
            {showTable && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTable(false)}
                    activeSessionId={activeSession?.id ?? null}
                    onSelectTable={(s) => { onSessionChange?.(s); setShowTable(false); }}
                />
            )}

            {showSendModal && (
                <GMSendModal
                    isOpen
                    onClose={() => setShowSendModal(false)}
                    preSelectedCharacterId={selectedId}
                    sessionId={activeSession?.id ?? null}
                    characters={sessionCharsForModal}
                />
            )}
        </div>
    );
};

export default TabSession;