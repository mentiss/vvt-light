// src/client/src/components/npc/NpcSystem.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'une fiche de PNJ (spec_pnj.md §6.4, §6.8) : rend la fiche du
// slug (`config.Sheet`) et, si le slug compose ses jets (`config.pick`), la
// sélection sur la fiche et la barre « Lancer » en dessous.
//
// Contrat slug (bloc `npc` de config.jsx) :
//   Sheet : ({ npc, instance, state, onStateChange, pick, hiddenRolls, sessionId, name, onRoll }) => …
//     pick   : { isPicked(group, key), toggle(group, key) } ou null ;
//     onRoll : (requête) → ouvre la fenêtre de jet du slug (`config.RollWindow`).
//   pick : {
//     groups(npc)             → [{ key, label }]  (ex. une compétence, un principe)
//     part(npc, group, key)   → { label, value }
//     extra?(npc)             → { label, value } | null : part fixe ajoutée au total
//     resolve(npc, sel, name) → requête de jet transmise à onRoll
//   }
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

// Barre « Lancer » : éléments choisis, total, effacer, lancer
const NpcRollBar = ({ npc, pick, selection, name, onClear, onRoll }) => {
    const groups = pick.groups(npc);
    const parts = groups.map(g => (selection[g.key] ? pick.part(npc, g.key, selection[g.key]) : null));
    const extra = pick.extra?.(npc) ?? null;     // part fixe (ex. valeur « Principe » d'un PNJ mineur de Dune)
    const ready = parts.every(Boolean);
    const total = ready ? parts.reduce((sum, p) => sum + p.value, extra?.value ?? 0) : null;
    return (
        <div className={`vtt-npc-rollbar ${ready ? 'is-ready' : ''}`}>
            <span className="vtt-npc-rollbar-text">
                {groups.map((g, i) => (
                    <React.Fragment key={g.key}>
                        {i > 0 && ' + '}
                        {parts[i] ? `${parts[i].label} ${parts[i].value}` : <i>{g.label}</i>}
                    </React.Fragment>
                ))}
                {extra && ` + ${extra.label} ${extra.value}`}
                {ready && <> → <b>{total}</b></>}
            </span>
            {Object.keys(selection).length > 0 && (
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" onClick={onClear} title="Effacer la sélection" aria-label="Effacer la sélection">✕</button>
            )}
            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" disabled={!ready}
                    onClick={() => onRoll(pick.resolve(npc, selection, name))}>Lancer</button>
        </div>
    );
};

const NpcSystem = ({ npc, instance = null, name, config = {}, hiddenRolls = false, sessionId = null, onStateChange = null, onRoll }) => {
    const [selection, setSelection] = useState({});
    const Sheet = config.Sheet;
    const pickConfig = config.pick ?? null;
    if (!Sheet) return null;

    const pick = pickConfig ? {
        isPicked: (group, key) => selection[group] === key,
        toggle: (group, key) => setSelection(sel => {
            const next = { ...sel };
            if (next[group] === key) delete next[group];
            else next[group] = key;
            return next;
        }),
    } : null;

    return (
        <>
            <div className="vtt-npc-system">
                <Sheet npc={npc} instance={instance} state={instance?.state ?? null} onStateChange={onStateChange}
                       pick={pick} hiddenRolls={hiddenRolls} sessionId={sessionId} name={name} onRoll={onRoll} />
            </div>
            {pickConfig && (
                <NpcRollBar npc={npc} pick={pickConfig} selection={selection} name={name}
                            onClear={() => setSelection({})} onRoll={onRoll} />
            )}
        </>
    );
};

export default NpcSystem;
