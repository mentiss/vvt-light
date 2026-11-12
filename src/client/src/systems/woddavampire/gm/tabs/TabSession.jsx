// src/client/src/systems/woddavampire/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session du Conteur (spec §II.14, planche_conteur.html) :
//   - à gauche, la table : musique (AudioSessionToggle), puis chaque personnage
//     avec sa présence, un résumé (sang, Volonté, pire blessure) et l'état imposé ;
//   - à droite, la fiche MJ du personnage choisi ; « Modifier » ouvre la fiche
//     joueur complète en mode Édition (Annuler / Enregistrer).
// Les personnages et leur enregistrement viennent de GMApp (useTableCharacters).
// Pas d'émission socket ici : tout passe par HTTP, le serveur diffuse.
//
// Props : activeSession, onlineCharacters, characters, order, loading,
//         patchCharacter(id, patch), onGiveXp(id)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import TableSessionTools from '@/features/table/TableSessionTools.jsx';
import GMSendModal from '@/features/table/modals/GMSendModal.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';

import VdaSheet from '../../components/layout/VdaSheet.jsx';
import VdaGmSheet from '../../components/layout/VdaGmSheet.jsx';
import VdaGmTableRow from '../../components/layout/VdaGmTableRow.jsx';
import VdaDiceModal from '../../components/modals/VdaDiceModal.jsx';

const TabSession = ({ activeSession, onlineCharacters, characters, order, loading, patchCharacter, onGiveXp, onSessionChange }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);           // fiche en édition (Modifier) ou null
    const [rollSetup, setRollSetup] = useState(null);
    const [noteOpen, setNoteOpen] = useState(false);

    const online = new Set((onlineCharacters ?? []).map(o => o.characterId));
    const currentId = selectedId && characters[selectedId] ? selectedId : order[0] ?? null;
    const c = currentId ? characters[currentId] : null;

    if (!activeSession) return (
        <div className="p-6 flex flex-col items-start gap-3">
            <p className="vda-note">Aucune table active.</p>
            {/* Appel à choisir une table (spec_ui_menu.md §12) */}
            <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)} />
        </div>
    );

    const select = (id) => { setSelectedId(id); setDraft(null); };
    const patch = (p) => patchCharacter(currentId, p);
    const saveDraft = async () => { await patchCharacter(currentId, draft); setDraft(null); };

    return (
        <div className="vda-gm-session">
            <aside className="vda-gm-table">
                <TableSessionTools sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {loading && <p className="vda-note">Chargement…</p>}
                {order.map(id => (
                    <VdaGmTableRow key={id} c={characters[id]} online={online.has(id)} selected={id === currentId} onSelect={() => select(id)} />
                ))}
                {!loading && order.length === 0 && <p className="vda-note">Aucun personnage à cette table.</p>}
            </aside>

            <div className="min-w-0">
                {!c && <p className="vda-note p-6">Sélectionnez un personnage.</p>}
                {c && !draft && (
                    <VdaGmSheet c={c} onPatch={patch} onRoll={setRollSetup}
                                onNote={() => setNoteOpen(true)} onGiveXp={() => onGiveXp(currentId)} onModify={() => setDraft({ ...c })} />
                )}
                {c && draft && (
                    <>
                        <div className="vda-gm-edit-bar">
                            <span className="vda-card-title">Modifier {c.nom}</span>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveDraft}>Enregistrer</button>
                        </div>
                        <VdaSheet c={draft} editMode
                                  onField={(field, value) => setDraft(prev => ({ ...prev, [field]: value }))}
                                  onArray={(field, list) => setDraft(prev => ({ ...prev, [field]: list }))}
                                  onQuick={(p) => { setDraft(prev => ({ ...prev, ...p })); patch(p); }}
                                  onRoll={setRollSetup} onWake={() => {}} onAvatar={() => {}} onInitiative={() => {}} />
                    </>
                )}
            </div>

            {rollSetup && c && (
                <VdaDiceModal character={c} sessionId={activeSession.id} initial={rollSetup} onPatch={patch} onClose={() => setRollSetup(null)} />
            )}
            {noteOpen && (
                <GMSendModal onClose={() => setNoteOpen(false)} preSelectedCharId={currentId} sessionId={activeSession.id}
                             sessionCharacters={order.map(id => ({ id, name: characters[id]?.nom ?? `#${id}`, avatar: characters[id]?.avatar }))} />
            )}
        </div>
    );
};

export default TabSession;
