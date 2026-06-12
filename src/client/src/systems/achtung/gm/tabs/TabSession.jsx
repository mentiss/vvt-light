// src/client/src/systems/achtung/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session GM — gestion :
//   · Sélection / création de session (générique TableManagementModal)
//   · Ressources de session : Momentum, Threat, Complications (GM only)
//   · Liste des personnages en session avec statut en ligne
//   · Patch rapide : injuries, stress, fortune, ammo
//   · Envoi de messages / objets via journal (GMSendModal)

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket }  from '../../../../context/SocketContext.jsx';
import { useFetch }   from '../../../../hooks/useFetch.js';
import { useSystem }  from '../../../../hooks/useSystem.js';

import TableManagementModal from '../../../../components/gm/modals/TableManagementModal.jsx';
import GMSendModal          from '../../../../components/gm/modals/GMSendModal.jsx';

import { ATTRIBUTES, SKILLS, getBonusDamage } from '../../config.jsx';

// ── Sous-composant : barre ressources GM ──────────────────────────────────────
// Affiche Momentum (éditable), Threat (éditable), Complications (GM only, éditable).

const ResourcesPanel = ({ sessionId, resources, onUpdate }) => {
    const socket = useSocket();

    const emit = useCallback((field, delta) => {
        if (!socket || !sessionId) return;
        socket.emit('update-session-resources', { sessionId, field, delta });
        // Optimistic update local
        onUpdate(prev => ({ ...prev, [field]: Math.max(0, (prev[field] ?? 0) + delta) }));
    }, [socket, sessionId, onUpdate]);

    const ResourceCounter = ({ label, field, color, max }) => (
        <div className="flex flex-col items-center gap-1">
            <span className="ac-label" style={color ? { color } : {}}>{label}</span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => emit(field, -1)}
                    disabled={(resources[field] ?? 0) <= 0}
                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                >−</button>
                <span className="ac-resource-value w-10 text-center" style={color ? { color } : {}}>
                    {resources[field] ?? 0}
                </span>
                <button
                    onClick={() => emit(field, 1)}
                    disabled={max !== undefined && (resources[field] ?? 0) >= max}
                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                >+</button>
            </div>
            {max !== undefined && (
                <span className="ac-text-muted" style={{ fontSize: '0.6rem' }}>/ {max}</span>
            )}
        </div>
    );

    return (
        <div className="ac-card mb-4">
            <div className="ac-section-header">Ressources de session</div>
            <div className="flex gap-6 flex-wrap items-end">
                <ResourceCounter label="Momentum"     field="momentum"     color="var(--ac-momentum-color)" max={6} />
                <div className="ac-separator-v" />
                <ResourceCounter label="Threat"       field="threat"       color="var(--ac-threat-color)" />
                <div className="ac-separator-v" />
                <ResourceCounter label="Complications" field="complications" color="var(--ac-secondary)" />
            </div>
        </div>
    );
};

// ── Sous-composant : carte personnage ─────────────────────────────────────────

const CharacterCard = ({ character, isOnline, isSelected, onClick, onPatch, onSend }) => {
    const injuries = character.injuries ?? 0;
    const isDead   = injuries >= 3;

    return (
        <div
            className={`ac-card cursor-pointer transition-colors${isSelected ? ' border-secondary' : ''}`}
            style={{ borderColor: isSelected ? 'var(--ac-secondary)' : undefined }}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Avatar + présence */}
                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded overflow-hidden bg-surface-alt border-border border">
                        {character.avatar
                            ? <img src={character.avatar} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted">👤</div>}
                    </div>
                    <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                            background:   isOnline ? 'var(--ac-success)' : 'var(--ac-muted)',
                            borderColor:  'var(--ac-surface)',
                        }}
                        title={isOnline ? 'En ligne' : 'Hors ligne'}
                    />
                </div>

                {/* Identité */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="ac-font-title text-default" style={{ fontSize: '0.85rem' }}>
                            {character.nom || character.playerName}
                        </span>
                        {isDead && <span className="ac-badge bg-danger">☠ mort</span>}
                    </div>
                    <div className="ac-text-muted" style={{ fontSize: '0.7rem' }}>
                        {[character.archetype, character.nationality].filter(Boolean).join(' · ')}
                    </div>
                    <div className="ac-text-muted" style={{ fontSize: '0.65rem' }}>
                        {character.playerName}
                    </div>
                </div>

                {/* Jauges rapides */}
                <div className="flex flex-col gap-1 items-end shrink-0">
                    {/* Stress */}
                    <div className="flex items-center gap-1">
                        <span className="ac-label">Stress</span>
                        <div className="flex gap-0.5">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`ac-pip stress${i < (character.stress ?? 0) ? ' active' : ''}`}
                                    style={{ width: '0.75rem', height: '0.75rem' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Injuries */}
                    <div className="flex items-center gap-2">
                        <span className="ac-label">Injuries</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={e => { e.stopPropagation(); onPatch('injuries', Math.max(0, (character.injuries ?? 0) - 1)); }}
                                className="ac-btn ac-btn-ghost w-5 h-5 p-0 flex items-center justify-center text-xs"
                                disabled={(character.injuries ?? 0) <= 0}
                            >−</button>
                            <span
                                className="ac-value w-5 text-center"
                                style={{ color: injuries >= 3 ? 'var(--ac-injury-color)' : injuries > 0 ? 'var(--ac-accent)' : undefined }}
                            >
                                {injuries}
                            </span>
                            <button
                                onClick={e => { e.stopPropagation(); onPatch('injuries', Math.min(3, (character.injuries ?? 0) + 1)); }}
                                className="ac-btn ac-btn-ghost w-5 h-5 p-0 flex items-center justify-center text-xs"
                                disabled={(character.injuries ?? 0) >= 3}
                            >+</button>
                        </div>
                    </div>

                    {/* Fortune */}
                    <div className="flex items-center gap-2">
                        <span className="ac-label">Fortune</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={e => { e.stopPropagation(); onPatch('fortune', Math.max(0, (character.fortune ?? 3) - 1)); }}
                                className="ac-btn ac-btn-ghost w-5 h-5 p-0 flex items-center justify-center text-xs"
                            >−</button>
                            <span className="ac-value w-5 text-center text-secondary">
                                {character.fortune ?? 3}
                            </span>
                            <button
                                onClick={e => { e.stopPropagation(); onPatch('fortune', (character.fortune ?? 3) + 1); }}
                                className="ac-btn ac-btn-ghost w-5 h-5 p-0 flex items-center justify-center text-xs"
                            >+</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {isSelected && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                    <button
                        onClick={e => { e.stopPropagation(); onSend('message'); }}
                        className="ac-btn ac-btn-secondary"
                        style={{ fontSize: '0.72rem' }}
                    >✉ Message</button>
                    <button
                        onClick={e => { e.stopPropagation(); window.open(`/${document.location.pathname.split('/')[1]}/${character.accessUrl}`, '_blank'); }}
                        className="ac-btn ac-btn-ghost"
                        style={{ fontSize: '0.72rem' }}
                    >📋 Voir fiche</button>
                </div>
            )}
        </div>
    );
};

// ── TabSession principal ───────────────────────────────────────────────────────

const TabSession = ({ activeSession, onSessionChange, onlineCharacters }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    const [characters,    setCharacters]    = useState({});
    const [loading,       setLoading]       = useState(false);
    const [selectedId,    setSelectedId]    = useState(null);
    const [resources,     setResources]     = useState({ momentum: 0, threat: 0, complications: 0 });
    const [showTable,     setShowTable]     = useState(false);
    const [showSendModal, setShowSendModal] = useState(null); // null | { characterId }

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    // ── Chargement des fiches ──────────────────────────────────────────────
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        Promise.all(
            activeSession.characters.map(c =>
                fetchWithAuth(`${apiBase}/characters/${c.id}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(char => char ? [c.id, char] : null)
                    .catch(() => null)
            )
        ).then(results => {
            const loaded = {};
            for (const r of results) { if (r) loaded[r[0]] = r[1]; }
            setCharacters(loaded);
            if (!selectedId || !loaded[selectedId]) {
                setSelectedId(Object.keys(loaded)[0] ?? null);
            }
        }).finally(() => setLoading(false));
    }, [activeSession?.id, activeSession?.characters?.length, apiBase]);

    // ── Chargement ressources de session ──────────────────────────────────
    useEffect(() => {
        if (!activeSession?.id) return;
        fetchWithAuth(`${apiBase}/session-resources/${activeSession.id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setResources(data); })
            .catch(() => {});
    }, [activeSession?.id, apiBase]);

    // ── Socket — réception ────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onFull    = ({ characterId, character }) =>
            setCharacters(prev => prev[characterId] ? { ...prev, [characterId]: character } : prev);
        const onPartial = ({ characterId, updates }) =>
            setCharacters(prev => prev[characterId]
                ? { ...prev, [characterId]: { ...prev[characterId], ...updates } }
                : prev);
        const onResources = (data) => setResources(prev => ({ ...prev, ...data }));

        socket.on('character-full-update',    onFull);
        socket.on('character-update',         onPartial);
        socket.on('session-resources-gm-update', onResources);

        return () => {
            socket.off('character-full-update',    onFull);
            socket.off('character-update',         onPartial);
            socket.off('session-resources-gm-update', onResources);
        };
    }, [socket]);

    // ── Patch rapide d'un personnage ──────────────────────────────────────
    const patchCharacter = useCallback(async (charId, patch) => {
        const current = characters[charId];
        if (!current) return;
        // Optimistic
        setCharacters(prev => ({ ...prev, [charId]: { ...prev[charId], ...patch } }));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${charId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(patch),
            });
            if (r.ok) {
                const updated = await r.json();
                setCharacters(prev => ({ ...prev, [charId]: { ...prev[charId], ...updated } }));
            } else {
                // Rollback
                setCharacters(prev => ({ ...prev, [charId]: current }));
            }
        } catch {
            setCharacters(prev => ({ ...prev, [charId]: current }));
        }
    }, [characters, apiBase, fetchWithAuth]);

    const sessionCharacters = activeSession?.characters ?? [];

    return (
        <div className="flex flex-col gap-4">

            {/* Sélection session */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    {activeSession
                        ? <div>
                            <span className="ac-label">Session active : </span>
                            <span className="ac-font-title text-secondary" style={{ fontSize: '0.85rem' }}>
                                {activeSession.name}
                            </span>
                            <span className="ac-text-muted ml-2" style={{ fontSize: '0.7rem' }}>
                                {sessionCharacters.length} personnage(s)
                            </span>
                        </div>
                        : <span className="ac-text-muted">Aucune session active</span>}
                </div>
                <button onClick={() => setShowTable(true)} className="ac-btn ac-btn-secondary">
                    ⛶ Gérer les sessions
                </button>
            </div>

            {/* Ressources de session */}
            {activeSession && (
                <ResourcesPanel
                    sessionId={activeSession.id}
                    resources={resources}
                    onUpdate={setResources}
                />
            )}

            {/* Liste personnages */}
            {loading && <div className="ac-text-muted text-center py-8">Chargement…</div>}

            {!loading && sessionCharacters.length === 0 && (
                <div className="ac-card text-center ac-text-muted py-8">
                    Aucun personnage dans cette session.
                </div>
            )}

            {!loading && sessionCharacters.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {sessionCharacters.map(sc => {
                        const char = characters[sc.id];
                        if (!char) return null;
                        return (
                            <CharacterCard
                                key={sc.id}
                                character={char}
                                isOnline={onlineIds.has(sc.id)}
                                isSelected={selectedId === sc.id}
                                onClick={() => setSelectedId(id => id === sc.id ? null : sc.id)}
                                onPatch={(field, value) => patchCharacter(sc.id, { [field]: value })}
                                onSend={() => setShowSendModal({ characterId: sc.id })}
                            />
                        );
                    })}
                </div>
            )}

            {/* Modales */}
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
                    onClose={() => setShowSendModal(null)}
                    preSelectedCharacterId={showSendModal.characterId}
                    sessionId={activeSession?.id ?? null}
                    characters={Object.values(characters)}
                />
            )}
        </div>
    );
};

export default TabSession;