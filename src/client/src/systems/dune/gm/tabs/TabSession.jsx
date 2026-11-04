// src/client/src/systems/dune/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Table de l'interface MJ (spec_dune.md §6.4, Q-2) : musique de la table,
// personnages et leur présence, puis LA MÊME FICHE que le joueur (DuneSheetBody) :
// jouable (Détermination, atouts, talents) et modifiable en mode Édition.
// Actions du MJ au-dessus de la fiche : envoyer une note, envoyer un atout.
// Les fiches viennent de useTableCharacters (GMApp) ; l'écoute de
// character-full-update reste au générique (C-7).
// Props : activeSession, onlineCharacters, characters, order, loading, patchCharacter, addRow
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AudioSessionToggle from '../../../../components/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '../../../../components/board/BoardSessionToggle.jsx';
import GMSendModal from '../../../../components/gm/modals/GMSendModal.jsx';
import CopyAccessButton from '../../../../components/ui/CopyAccessButton.jsx';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import DuneIcon from '../../components/ui/DuneIcon.jsx';
import DuneWorm from '../../components/ui/DuneWorm.jsx';
import DuneSheetBody from '../../components/layout/DuneSheetBody.jsx';
import DuneAssetCatalog from '../../components/modals/DuneAssetCatalog.jsx';
import { characterFullName } from '../../config/traits.js';

const EmptyTable = ({ text }) => (
    <div className="dn-empty">
        <DuneWorm />
        <p>{text}</p>
    </div>
);

const TabSession = ({ activeSession, onlineCharacters, characters, order, loading, patchCharacter, addRow }) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);         // brouillon du mode Édition du personnage affiché
    const [noteOpen, setNoteOpen] = useState(false);
    const [assetOpen, setAssetOpen] = useState(false);

    if (!activeSession) return <EmptyTable text={<>Aucune table active<br />Choisissez une table dans le menu</>} />;

    const currentId = characters[selectedId] ? selectedId : order[0];
    const current = characters[currentId];
    const online = new Set((onlineCharacters ?? []).map(o => o.characterId));
    const select = (id) => { setSelectedId(id); setDraft(null); };
    const saveEdit = () => { patchCharacter(currentId, draft); setDraft(null); };

    // Envoi d'un atout : route send-item (toast et journal côté joueur)
    const sendAsset = (item) => {
        fetchWithAuth(`${apiBase}/characters/${currentId}/send-item`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
        }).catch(err => console.error('[dune/gm] envoi d’atout :', err));
    };

    const sessionCharacters = order.map(id => ({ id, name: characterFullName(characters[id]), avatar: characters[id]?.avatar }));

    return (
        <div className="dn-gm-layout">
            <aside className="dn-gm-table">
                <AudioSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {/* Tableau partagé de la table (spec_tableau.md §10.8) */}
                <BoardSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {loading && <p className="dn-gm-note">Chargement des fiches…</p>}
                {!loading && order.length === 0 && <p className="dn-gm-note">Aucun personnage à cette table.</p>}
                {order.map(id => (
                    <button key={id} type="button" onClick={() => select(id)}
                            className={`dn-gm-row${id === currentId ? ' is-selected' : ''}${online.has(id) ? ' is-online' : ''}`}>
                        <span className="dn-gm-dot" title={online.has(id) ? 'En ligne' : 'Hors ligne'} />
                        <span className="min-w-0">
                            <b>{characterFullName(characters[id])}</b>
                            <small>{characters[id].playerName}</small>
                        </span>
                    </button>
                ))}
            </aside>

            {current ? (
                <div className="min-w-0">
                    <div className="dn-gm-bar">
                        {draft ? (
                            <>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                            </>
                        ) : (
                            <>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setNoteOpen(true)}>
                                    <DuneIcon name="send" className="dn-ico w-4 h-4" />Envoyer une note
                                </button>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setAssetOpen(true)}>
                                    <DuneIcon name="blade" className="dn-ico w-4 h-4" />Envoyer un atout
                                </button>
                                <CopyAccessButton character={current} className="vtt-btn-sm" icon={<DuneIcon name="key" className="dn-ico w-4 h-4" />} />
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(current)} title="Mode Édition">
                                    <DuneIcon name="quill" className="dn-ico w-4 h-4" />Édition
                                </button>
                            </>
                        )}
                    </div>
                    <DuneSheetBody character={current} draft={draft} setDraft={setDraft}
                                   onPatch={fields => patchCharacter(currentId, fields)}
                                   onAddRow={(field, row) => addRow(currentId, field, row)} />
                </div>
            ) : null}

            {noteOpen && (
                <GMSendModal onClose={() => setNoteOpen(false)} sessionId={activeSession.id}
                             sessionCharacters={sessionCharacters} preSelectedCharId={currentId} />
            )}
            {assetOpen && current && (
                <DuneAssetCatalog title="Envoyer un atout" subtitle={`À ${characterFullName(current)}`}
                                  onAdd={sendAsset} onClose={() => setAssetOpen(false)} />
            )}
        </div>
    );
};

export default TabSession;
