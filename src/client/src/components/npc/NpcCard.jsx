// src/client/src/components/npc/NpcCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte d'un PNJ à la table (spec_pnj.md §6.5, §6.7) : avatar, nom à la table
// (modifiable sur place), rôle, crayon (modifier sa copie), retrait ; partie
// système du slug avec son état ; notes de la scène. Grisée quand le slug la dit
// hors de combat (`config.isDown(instance)`).
//
// <NpcCard instance config hiddenRolls sessionId onPatch(patch) onEdit onRemove onRoll />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcAvatar from './NpcAvatar.jsx';
import NpcSystem from './NpcSystem.jsx';

const NpcCard = ({ instance, config = {}, hiddenRolls, sessionId, onPatch, onEdit, onRemove, onRoll }) => {
    // Saisie en cours (null hors saisie : la valeur enregistrée s'affiche)
    const [nameDraft, setNameDraft] = useState(null);
    const [notesDraft, setNotesDraft] = useState(null);

    const sheet = instance.sheet ?? {};
    const down = config.isDown?.(instance) ?? false;
    const saveName = () => {
        const trimmed = (nameDraft ?? '').trim();
        if (nameDraft !== null && trimmed && trimmed !== instance.name) onPatch({ name: trimmed });
        setNameDraft(null);
    };
    const saveNotes = () => {
        if (notesDraft !== null && notesDraft !== (instance.notes ?? '')) onPatch({ notes: notesDraft });
        setNotesDraft(null);
    };

    return (
        <article className={`vtt-panel vtt-npc-card${down ? ' is-down' : ''}`}>
            <div className="vtt-npc-card-head">
                <NpcAvatar npc={sheet} />
                <div className="vtt-npc-row-body">
                    <input className="vtt-npc-card-name" value={nameDraft ?? instance.name} aria-label="Nom à la table"
                           onChange={e => setNameDraft(e.target.value)} onBlur={saveName}
                           onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                    {(sheet.role || config.summary) && (
                        <div className="vtt-npc-summary">{[sheet.role, config.summary?.(sheet)].filter(Boolean).join(' · ')}</div>
                    )}
                </div>
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Modifier ce PNJ (sa copie à la table)" aria-label="Modifier ce PNJ" onClick={onEdit}>✎</button>
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Retirer de la table" aria-label="Retirer de la table" onClick={onRemove}>✕</button>
            </div>
            <NpcSystem npc={sheet} instance={instance} name={instance.name} config={config} hiddenRolls={hiddenRolls} sessionId={sessionId}
                       onStateChange={patch => onPatch({ state: { ...instance.state, ...patch } })} onRoll={onRoll} />
            <details className="vtt-npc-notes">
                <summary>Notes de la scène{instance.notes ? ' ·' : ''}</summary>
                <textarea className="vtt-input" rows={2} value={notesDraft ?? instance.notes ?? ''} placeholder="Blessé au bras, a fui vers le sud…" aria-label="Notes de la scène"
                          onChange={e => setNotesDraft(e.target.value)} onBlur={saveNotes} />
            </details>
        </article>
    );
};

export default NpcCard;
