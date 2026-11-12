// src/client/src/systems/vileborn/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session de l'interface MJ : musique de la table (AudioSessionToggle,
// en tête de la colonne), Parias de la table avec leur présence, fiche du Paria
// choisi. Le MJ y joue les mêmes cases que le joueur (complications : états,
// blessures ; coches, Rêverie, liens…) sans jets, et corrige la fiche en mode
// Édition. Tout part en envoi partiel (patchCharacter), le joueur le voit aussitôt.
// Props : activeSession, onlineCharacters, characters, order, loading, patchCharacter
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import TableSessionTools from '@/features/table/TableSessionTools.jsx';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';
import VilGmTableRow from '../../components/layout/VilGmTableRow.jsx';
import VilSheet from '../../components/layout/VilSheet.jsx';
import VilEditForm from '../../components/layout/VilEditForm.jsx';
import { EditIcon } from '../../components/ui/VilUi.jsx';
import { useVilActions } from '../../hooks/useVilActions.js';
import { editDraft, editPatch } from '../../config/rules/character.js';

const TabSession = ({ activeSession, onlineCharacters, characters, order, loading, patchCharacter, onSessionChange }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);   // brouillon du mode Édition du Paria affiché

    const currentId = characters[selectedId] ? selectedId : order[0];
    const current = characters[currentId];
    const act = useVilActions({ character: current ?? {}, sessionId: activeSession?.id ?? null, isPlayer: false,
        patch: (p) => patchCharacter(currentId, p) });

    if (!activeSession) return (
        <div className="p-6 flex flex-col items-start gap-3">
            <p className="vil-note">Aucune table active.</p>
            {/* Appel à choisir une table (spec_ui_menu.md §12) */}
            <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)} />
        </div>
    );

    const online = new Set((onlineCharacters ?? []).map(o => o.characterId));
    const select = (id) => { setSelectedId(id); setDraft(null); };
    const saveEdit = () => { patchCharacter(currentId, editPatch(current, draft)); setDraft(null); };

    return (
        <div className="vil-page vil-gm-layout">
            <aside className="vil-gm-table">
                <TableSessionTools sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {loading && <p className="vil-note">Chargement…</p>}
                {!loading && order.length === 0 && <p className="vil-note">Aucun Paria à cette table.</p>}
                {order.map(id => (
                    <VilGmTableRow key={id} c={characters[id]} online={online.has(id)} selected={id === currentId} onSelect={() => select(id)} />
                ))}
            </aside>
            {current && (
                <div className="min-w-0">
                    <div className="vil-gm-sheet-bar">
                        {draft ? (
                            <>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                            </>
                        ) : (
                            <>
                                <CopyAccessButton character={current} className="vtt-btn-sm" />
                                <button type="button" className="vil-icon-btn" onClick={() => setDraft(editDraft(current))} title="Mode Édition" aria-label="Mode Édition"><EditIcon /></button>
                            </>
                        )}
                    </div>
                    {draft ? <VilEditForm draft={draft} setDraft={setDraft} /> : <VilSheet c={current} act={act} />}
                </div>
            )}
        </div>
    );
};

export default TabSession;
