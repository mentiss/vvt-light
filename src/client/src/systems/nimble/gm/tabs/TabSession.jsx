// src/client/src/systems/nimble/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session de l'interface MJ (spec_nimble.md §6.4) : musique et tableau
// partagé en tête de la colonne, héros de la table avec leur présence et leur
// santé, « Fin de rencontre » et « Repos sûr » pour toute la table, fiche du
// héros choisi (même assemblage que le joueur : jets au nom du héros), copie
// des accès, mode Édition. Tout part en envoi partiel (patchCharacter), le
// joueur le voit aussitôt.
// Props : activeSession, onlineCharacters, characters, order, loading, patchCharacter
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AudioSessionToggle from '@/features/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '@/features/board/BoardSessionToggle.jsx';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';
import ConfirmModal from '@/ui/modal/ConfirmModal.jsx';
import NbGmTableRow from '../../components/layout/NbGmTableRow.jsx';
import NbSheet from '../../components/layout/NbSheet.jsx';
import NbEditForm from '../../components/layout/NbEditForm.jsx';
import NbLevelUpModal from '../../components/modals/NbLevelUpModal.jsx';
import NbRestModal from '../../components/modals/NbRestModal.jsx';
import { EditIcon, RestIcon, LevelIcon } from '../../components/ui/NbUi.jsx';
import { useNbActions } from '../../hooks/useNbActions.js';
import { endEncounter, safeRest } from '../../config/rules/actions.js';

const TABLE_ACTIONS = {
    encounter: { title: 'Fin de rencontre pour toute la table', message: 'Actions rendues, usages et ressources « par rencontre » rechargés pour chaque héros.', apply: endEncounter },
    safe:      { title: 'Repos sûr pour toute la table', message: 'Chaque héros récupère PV, dés de vie, mana et ressources, et guérit 1 Blessure.', apply: safeRest },
};

const TabSession = ({ activeSession, onlineCharacters, characters, order, loading, patchCharacter, onSessionChange }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);           // brouillon du mode Édition du héros affiché
    const [pageModal, setPageModal] = useState(null);   // 'level' | 'rest'
    const [tableAction, setTableAction] = useState(null);

    const currentId = characters[selectedId] ? selectedId : order[0];
    const current = characters[currentId];
    const act = useNbActions({ character: current ?? {}, patch: (p) => patchCharacter(currentId, p) });

    if (!activeSession) return (
        <div className="p-6 flex flex-col items-start gap-3">
            <p className="nb-note">Aucune table active.</p>
            {/* Appel à choisir une table (spec_ui_menu.md §12) */}
            <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)} />
        </div>
    );

    const online = new Set((onlineCharacters ?? []).map(o => o.characterId));
    const select = (id) => { setSelectedId(id); setDraft(null); };
    const saveEdit = () => { patchCharacter(currentId, { ...draft }); setDraft(null); };
    const runTableAction = () => {
        const a = TABLE_ACTIONS[tableAction];
        order.forEach(id => patchCharacter(id, a.apply(characters[id])));
        setTableAction(null);
    };

    return (
        <div className="nb-page nb-gm-layout">
            <aside className="nb-gm-table">
                <AudioSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                <BoardSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {order.length > 0 && (
                    <>
                        <button type="button" className="vtt-btn vtt-btn-sm w-full" onClick={() => setTableAction('encounter')}>Fin de rencontre (table)</button>
                        <button type="button" className="vtt-btn vtt-btn-sm w-full" onClick={() => setTableAction('safe')}>Repos sûr (table)</button>
                    </>
                )}
                {loading && <p className="nb-note">Chargement…</p>}
                {!loading && order.length === 0 && <p className="nb-note">Aucun héros à cette table.</p>}
                {order.map(id => (
                    <NbGmTableRow key={id} c={characters[id]} online={online.has(id)} selected={id === currentId} onSelect={() => select(id)} />
                ))}
            </aside>
            {current && (
                <div className="min-w-0">
                    <div className="nb-gm-sheet-bar">
                        {draft ? (
                            <>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                            </>
                        ) : (
                            <>
                                <CopyAccessButton character={current} className="vtt-btn-sm" />
                                {Number(current.level ?? 1) < 20 && <button type="button" className="nb-icon-btn" onClick={() => setPageModal('level')} title="Monter de niveau"><LevelIcon /> Niveau</button>}
                                <button type="button" className="nb-icon-btn" onClick={() => setPageModal('rest')} title="Repos et fin de rencontre"><RestIcon /> Repos</button>
                                <button type="button" className="nb-icon-btn" onClick={() => setDraft({ ...current })} title="Mode Édition" aria-label="Mode Édition"><EditIcon /></button>
                            </>
                        )}
                    </div>
                    {draft ? <NbEditForm draft={draft} setDraft={setDraft} /> : <NbSheet c={current} act={act} sessionId={activeSession.id} />}
                </div>
            )}
            {current && pageModal === 'level' && <NbLevelUpModal c={current} act={act} sessionId={activeSession.id} onClose={() => setPageModal(null)} />}
            {current && pageModal === 'rest' && <NbRestModal c={current} act={act} sessionId={activeSession.id} onClose={() => setPageModal(null)} />}
            {tableAction && (
                <ConfirmModal title={TABLE_ACTIONS[tableAction].title} message={TABLE_ACTIONS[tableAction].message} confirmText="Appliquer"
                              onConfirm={runTableAction} onCancel={() => setTableAction(null)} />
            )}
        </div>
    );
};

export default TabSession;
