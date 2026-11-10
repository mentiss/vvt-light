// src/client/src/components/npc/NpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lecture d'une fiche de la bibliothèque (spec_pnj.md §6.5) : en-tête commun
// (avatar, nom, rôle, source, étiquettes), description, notes du MJ, puis la
// partie système du slug (jets possibles depuis la fiche).
//
// <NpcSheet npc config hiddenRolls sessionId onRoll />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import NpcAvatar, { npcName } from './NpcAvatar.jsx';
import NpcSystem from './NpcSystem.jsx';

const NpcSheet = ({ npc, config = {}, hiddenRolls = false, sessionId = null, onRoll }) => (
    <div className="vtt-npc-sheet">
        <div className="vtt-npc-sheet-head">
            <NpcAvatar npc={npc} size="lg" />
            <div>
                <h3 className="vtt-npc-sheet-name">{npcName(npc)}</h3>
                <div className="vtt-npc-summary">
                    {[npc.role, npc.source && `${npc.source}${npc.page ? `, p.${npc.page}` : ''}`].filter(Boolean).join(' · ')}
                </div>
                {(npc.tags ?? []).length > 0 && (
                    <div className="vtt-npc-tags">{npc.tags.map(t => <span key={t} className="vtt-tag">{t}</span>)}</div>
                )}
            </div>
        </div>
        {npc.description && <p className="vtt-npc-text">{npc.description}</p>}
        {npc.gmNotes && <p className="vtt-npc-secret"><b>Notes du MJ.</b> {npc.gmNotes}</p>}
        <NpcSystem npc={npc} name={npcName(npc)} config={config} hiddenRolls={hiddenRolls} sessionId={sessionId} onRoll={onRoll} />
    </div>
);

export default NpcSheet;
