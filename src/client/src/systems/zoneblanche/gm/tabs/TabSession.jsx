// src/client/src/systems/zoneblanche/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session (MJ) — sélection d'un personnage de la table et affichage de
// SA FICHE COMPLÈTE, via exactement le même SheetLayout que l'interface joueur.
// Aucun arbre de sections dupliqué ici : ce qui change côté joueur change
// côté MJ automatiquement.
//
// Contrat props (depuis GMApp) :
//   activeSession, onlineCharacters, characterUpdates, resources, onResourcesChange
//
// ⚠️ Aucun listener socket 'character-full-update' / 'character-update' n'est
// déclaré ici : GMPage (via useGMSession) est la seule source, et transmet les
// mises à jour par le prop characterUpdates.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useSystem } from '../../../../hooks/useSystem.js';
import { useFetch }  from '../../../../hooks/useFetch.js';

import AvatarUploader from '../../../../components/AvatarUploader.jsx';
import GMSendModal    from '../../../../components/gm/modals/GMSendModal.jsx';

import SheetLayout            from '../../components/layout/SheetLayout.jsx';
import ZoneBlancheDiceModal   from '../../components/modals/ZoneBlancheDiceModal.jsx';
import { ARCHETYPES }         from '../../config.jsx';

const archetypeLabel = (key) => ARCHETYPES.find(a => a.key === key)?.label ?? '—';

// ── Vignette d'un personnage dans la liste ───────────────────────────────────

const CharacterTile = ({ char, selected, online, onSelect }) => (
    <button type="button" onClick={onSelect}
            className={`zb-gm-tile ${selected ? 'is-selected' : ''}`}>
        <span className={`zb-presence ${online ? 'is-online' : ''}`} />
        <span className="min-w-0 flex-1">
            <span className="block font-semibold text-sm truncate">
                {[char.prenom, char.nom].filter(Boolean).join(' ') || 'Sans nom'}
            </span>
            <span className="zb-eyebrow block truncate">{archetypeLabel(char.archetype)}</span>
        </span>
    </button>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const TabSession = ({
                        activeSession,
                        onlineCharacters = [],
                        characterUpdates,
                        resources,
                        onResourcesChange,
                    }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [characters, setCharacters] = useState({});   // { [id]: character }
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading]       = useState(false);

    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(null);
    const [saving,       setSaving]       = useState(false);

    const [showSendModal,   setShowSendModal]   = useState(false);
    const [showAvatar,      setShowAvatar]      = useState(false);
    const [diceModalCtx,    setDiceModalCtx]    = useState(null);

    const sessionId = activeSession?.id ?? null;

    // ── Chargement des personnages de la table ────────────────────────────
    useEffect(() => {
        const list = activeSession?.characters ?? [];
        if (!list.length) { setCharacters({}); setSelectedId(null); return; }

        let cancelled = false;
        setLoading(true);

        Promise.all(list.map(c =>
            fetchWithAuth(`${apiBase}/characters/${c.id}`)
                .then(r => (r.ok ? r.json() : null))
                .catch(() => null)
        )).then(results => {
            if (cancelled) return;
            const map = {};
            for (const c of results) if (c?.id) map[c.id] = c;
            setCharacters(map);
            setSelectedId(prev => (prev && map[prev] ? prev : (list[0]?.id ?? null)));
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [sessionId, activeSession?.characters?.length, apiBase]);

    // ── Temps réel — via characterUpdates (jamais de socket ici) ──────────
    useEffect(() => {
        if (!characterUpdates) return;
        setCharacters(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [idStr, update] of Object.entries(characterUpdates)) {
                const id = Number(idStr);
                if (!prev[id]) continue;                 // pas dans cette table
                next[id] = update.type === 'full'
                    ? update.data
                    : { ...prev[id], ...update.data };
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [characterUpdates]);

    // ── Sortie du mode édition au changement de personnage ────────────────
    useEffect(() => { setEditMode(false); }, [selectedId]);

    useEffect(() => {
        if (!editMode) setEditableChar(characters[selectedId] ?? null);
    }, [characters, selectedId, editMode]);

    const char = selectedId
        ? (editMode ? editableChar : characters[selectedId])
        : null;

    // ── Édition (buffer local, comme Sheet.jsx) ───────────────────────────
    const set = useCallback((field, value) => {
        setEditableChar(prev => (prev ? { ...prev, [field]: value } : prev));
    }, []);

    const saveEdit = useCallback(async () => {
        if (!selectedId || !editableChar) return;
        setSaving(true);
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(editableChar),
            });
            if (r.ok) {
                const updated = await r.json();
                setCharacters(prev => ({ ...prev, [selectedId]: updated }));
                setEditMode(false);
            }
        } catch (e) {
            console.error('[TabSession/zoneblanche] saveEdit:', e);
        } finally {
            setSaving(false);
        }
    }, [selectedId, editableChar, apiBase]);

    const cancelEdit = useCallback(() => {
        setEditableChar(characters[selectedId] ?? null);
        setEditMode(false);
    }, [characters, selectedId]);

    // ── Patch immédiat — actions de jeu, hors mode édition ────────────────
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
                setCharacters(prev => ({ ...prev, [selectedId]: updated }));
            }
        } catch (e) {
            setCharacters(prev => ({ ...prev, [selectedId]: current }));   // rollback
            console.error('[TabSession/zoneblanche] patchImmediate:', e);
        }
    }, [selectedId, characters, apiBase]);

    const onlineIds = useMemo(
        () => new Set((onlineCharacters ?? []).map(c => c.characterId ?? c.id)),
        [onlineCharacters],
    );

    const sessionCharsForModal = useMemo(
        () => Object.values(characters).map(c => ({
            id:   c.id,
            name: [c.prenom, c.nom].filter(Boolean).join(' ') || 'Sans nom',
        })),
        [characters],
    );

    if (!activeSession) {
        return (
            <div className="zb-panel zb-grain rounded-sm p-8 text-center">
                <div className="zb-eyebrow mb-2">Aucune table active</div>
                <p className="text-sm text-muted">
                    Ouvrez « Gestion des tables » dans le menu pour en activer une.
                </p>
            </div>
        );
    }

    return (
        <div className="zb-gm-layout">

            {/* ── Colonne personnages ──────────────────────────────────────── */}
            <aside className="zb-gm-sidebar">
                <div className="zb-eyebrow mb-2">Équipe</div>

                {loading && <p className="text-sm text-muted">Chargement…</p>}

                {!loading && Object.keys(characters).length === 0 && (
                    <p className="text-sm text-muted">Aucun personnage rattaché à cette table.</p>
                )}

                <div className="space-y-1.5">
                    {Object.values(characters).map(c => (
                        <CharacterTile
                            key={c.id}
                            char={c}
                            selected={c.id === selectedId}
                            online={onlineIds.has(c.id)}
                            onSelect={() => setSelectedId(c.id)}
                        />
                    ))}
                </div>

                <button type="button" onClick={() => setShowSendModal(true)}
                        className="zb-btn-ghost w-full mt-4 px-4 py-2 rounded-sm text-sm">
                    Envoyer au journal
                </button>
            </aside>

            {/* ── Fiche ────────────────────────────────────────────────────── */}
            <div className="min-w-0">
                {!char && (
                    <div className="zb-panel zb-grain rounded-sm p-8 text-center">
                        <p className="text-sm text-muted">Sélectionnez un personnage.</p>
                    </div>
                )}

                {char && (
                    <>
                        <div className="flex items-center justify-end gap-2 mb-3">
                            {editMode ? (
                                <>
                                    <button type="button" onClick={cancelEdit}
                                            className="zb-btn-ghost px-3 py-1.5 rounded-sm text-sm">Annuler</button>
                                    <button type="button" onClick={saveEdit} disabled={saving}
                                            className="zb-btn-primary px-3 py-1.5 rounded-sm text-sm">
                                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setEditMode(true)}
                                        className="zb-btn-ghost px-3 py-1.5 rounded-sm text-sm">Modifier</button>
                            )}
                        </div>

                        <SheetLayout
                            char={char}
                            editMode={editMode}
                            set={set}
                            patchImmediate={patchImmediate}
                            onRoll={(ctx) => setDiceModalCtx(ctx ?? {})}
                            onAvatarClick={() => setShowAvatar(true)}
                            sessionId={sessionId}
                            readOnlyEquipment
                        />
                    </>
                )}
            </div>

            {/* ── Modales ──────────────────────────────────────────────────── */}
            {showSendModal && (
                <GMSendModal
                    isOpen
                    onClose={() => setShowSendModal(false)}
                    preSelectedCharacterId={selectedId}
                    sessionId={sessionId}
                    characters={sessionCharsForModal}
                />
            )}

            {showAvatar && char && (
                <AvatarUploader
                    currentAvatar={char.avatar}
                    onAvatarChange={(avatar) => patchImmediate({ avatar })}
                    onClose={() => setShowAvatar(false)}
                />
            )}

            {diceModalCtx && char && (
                <ZoneBlancheDiceModal
                    character={characters[selectedId]}
                    onCharacterUpdate={(updated) => patchImmediate({ primeTime: updated.primeTime })}
                    sessionId={sessionId}
                    sessionResources={resources}
                    onResourcesChange={onResourcesChange}
                    preselect={diceModalCtx}
                    onClose={() => setDiceModalCtx(null)}
                />
            )}
        </div>
    );
};

export default TabSession;