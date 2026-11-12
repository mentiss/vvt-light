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
// Fiches de la table : useTableCharacters (spec_session_mj.md §3), aucune écoute
// de socket ici ; le temps réel arrive par characterUpdates (useGMSession).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useTableCharacters } from '@/features/table/hooks/useTableCharacters.js';

import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import GMSendModal    from '@/features/table/modals/GMSendModal.jsx';
import TableSessionTools from '@/features/table/TableSessionTools.jsx';
import CopyAccessButton   from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';

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
                        onSessionChange,
                    }) => {
    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const [pickedId, setSelectedId] = useState(null);
    const selectedId = characters[pickedId] ? pickedId : (order[0] ?? null);   // premier personnage par défaut

    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(null);
    const [saving,       setSaving]       = useState(false);

    const [showSendModal,   setShowSendModal]   = useState(false);
    const [showAvatar,      setShowAvatar]      = useState(false);
    const [diceModalCtx,    setDiceModalCtx]    = useState(null);

    const sessionId = activeSession?.id ?? null;

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
        if (await patchCharacter(selectedId, editableChar)) setEditMode(false);
        setSaving(false);
    }, [selectedId, editableChar, patchCharacter]);

    const cancelEdit = useCallback(() => {
        setEditableChar(characters[selectedId] ?? null);
        setEditMode(false);
    }, [characters, selectedId]);

    // ── Patch immédiat — actions de jeu, hors mode édition ────────────────
    const patchImmediate = useCallback((patch) => {
        if (selectedId) patchCharacter(selectedId, patch);   // retour arrière en cas d'échec : le hook
    }, [selectedId, patchCharacter]);

    const onlineIds = useMemo(
        () => new Set((onlineCharacters ?? []).map(c => c.characterId ?? c.id)),
        [onlineCharacters],
    );

    const sessionCharsForModal = useMemo(
        () => Object.values(characters).map(c => ({
            id:   c.id,
            name: [c.prenom, c.nom].filter(Boolean).join(' ') || 'Sans nom',
            avatar: c.avatar,
        })),
        [characters],
    );

    if (!activeSession) {
        return (
            <div className="zb-panel zb-grain rounded-sm p-8 text-center">
                <div className="zb-eyebrow mb-3">Aucune table active</div>
                {/* Appel à choisir une table (spec_ui_menu.md §12) */}
                <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)} icon={null} />
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
                <TableSessionTools sessionId={activeSession.id} className="zb-btn-ghost w-full mt-2 px-4 py-2 rounded-sm text-sm" />
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
                            <CopyAccessButton character={char} className="vtt-btn-sm" />
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
                    onClose={() => setShowSendModal(false)}
                    preSelectedCharId={selectedId}
                    sessionId={sessionId}
                    sessionCharacters={sessionCharsForModal}
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