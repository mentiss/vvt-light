// src/client/src/features/npc/NpcPresets.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Jets préparés d'un PNJ (spec_pnj.md §6.8, R-2) : brique que le slug pose où il
// veut dans sa fiche (et son éditeur dans son formulaire). Les données (liste de
// { label, pick }) appartiennent au slug, rangées dans sa partie système.
//
// <NpcPresets presets describe={p => 'Combat + Devoir · 12'} onUse={p => …} />
// <NpcPresetEditor presets onChange={list => …} newPreset={() => ({ label, pick })}
//                  renderPicker={(preset, update) => …} />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

export const NpcPresets = ({ presets = [], describe, onUse }) => {
    if (!presets.length) return null;
    return (
        <div className="vtt-npc-presets">
            {presets.map((preset, i) => (
                // relecture: F-KEY — liste sans identifiant stable, éditée en place
                <button key={i} type="button" className="vtt-pill" onClick={() => onUse(preset)} title={describe(preset)}>
                    {preset.label} <small>{describe(preset)}</small>
                </button>
            ))}
        </div>
    );
};

export const NpcPresetEditor = ({ presets = [], onChange, newPreset, renderPicker }) => {
    const update = (i, patch) => onChange(presets.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    return (
        <div className="vtt-npc-preset-editor">
            {presets.map((preset, i) => (
                // relecture: F-KEY — liste sans identifiant stable, éditée en place
                <div key={i} className="vtt-npc-preset-row">
                    <div className="vtt-npc-preset-head">
                        <input className="vtt-input" value={preset.label} placeholder="Lame, Interroger…" aria-label="Nom du jet préparé"
                               onChange={e => update(i, { label: e.target.value })} />
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Retirer" aria-label="Retirer le jet préparé"
                                onClick={() => onChange(presets.filter((_, j) => j !== i))}>✕</button>
                    </div>
                    {renderPicker(preset, patch => update(i, patch))}
                </div>
            ))}
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onChange([...presets, newPreset()])}>+ Jet préparé</button>
        </div>
    );
};
