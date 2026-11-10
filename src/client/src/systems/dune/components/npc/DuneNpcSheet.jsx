// src/client/src/systems/dune/components/npc/DuneNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ de Dune (spec_pnj.md §7, D-1 à D-5), posée par la brique
// NpcSystem (props { npc, instance, state, onStateChange, pick, name, onRoll }) :
//   - rang, traits ;
//   - compétences et principes : un clic les choisit, la barre « Lancer » de la
//     brique compose le jet (mineur : sa valeur « Principe » unique, fixe) ;
//   - jets préparés (brique NpcPresets), talents, atouts ;
//   - à la table : « Vaincu », jauge de défaite et « Résister » (notable, majeur).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { NpcPresets } from '../../../../components/npc/NpcPresets.jsx';
import { DuneStepper } from '../ui/DuneFields.jsx';
import { COMPETENCES, PRINCIPES, traitLabel } from '../../config/traits.js';
import { canResistDefeat, isMinor, rankLabel } from '../../config/rules/npc.js';
import { npcRollRequest, presetText } from './duneNpcPick.js';

// Case d'une compétence ou d'un principe, choisie par un clic
const TraitCell = ({ group, item, pick, sub }) => (
    <button type="button" className={`dn-npc-cell vtt-npc-pickable${pick?.isPicked(group, item.key) ? ' is-picked' : ''}`}
            title={sub || undefined} onClick={() => pick?.toggle(group, item.key)}>
        <small>{traitLabel(item.key)}</small>
        <b>{item.rang}</b>
        {sub && <em>{sub}</em>}
    </button>
);

// État d'un PNJ à la table (D-5)
const DefeatState = ({ sd, state, onStateChange }) => {
    if (isMinor(sd)) {
        return (
            <div className="dn-npc-state">
                <button type="button" className={`vtt-pill${state.defeated ? ' is-selected' : ''}`} onClick={() => onStateChange({ defeated: !state.defeated })}>
                    {state.defeated ? 'Vaincu' : 'Vaincre'}
                </button>
                <span className="vtt-npc-summary">Un mineur est vaincu au premier coup réussi.</span>
            </div>
        );
    }
    return (
        <div className="dn-npc-state">
            <span className="dn-npc-sub">Défaite</span>
            <DuneStepper value={state.defeat ?? 0} min={0} max={99} label="Défaite" onChange={defeat => onStateChange({ defeat })} />
            <span className="vtt-npc-summary">sur</span>
            <input className="vtt-input dn-npc-num" type="number" min="1" value={state.defeatMax ?? ''} placeholder="seuil"
                   aria-label="Seuil de défaite" title="Compétence la plus pertinente + Qualité des atouts défensifs"
                   onChange={e => onStateChange({ defeatMax: e.target.value === '' ? null : Number(e.target.value) })} />
            <button type="button" className={`vtt-pill${state.resisted ? ' is-selected' : ''}`} disabled={!state.resisted && !canResistDefeat(sd, state)}
                    title="Une fois par scène : 1 Menace + la Qualité de l'atout, au prix d'une complication"
                    onClick={() => onStateChange({ resisted: !state.resisted })}>{state.resisted ? 'A résisté' : 'Résister'}</button>
            <button type="button" className={`vtt-pill${state.defeated ? ' is-selected' : ''}`} onClick={() => onStateChange({ defeated: !state.defeated })}>
                {state.defeated ? 'Vaincu' : 'Vaincre'}
            </button>
        </div>
    );
};

const DuneNpcSheet = ({ npc, state, onStateChange, pick, name, onRoll }) => {
    const sd = npc.systemData ?? {};
    const minor = isMinor(sd);
    const comps = COMPETENCES.map(c => sd.competences?.find(x => x.key === c.key) ?? { key: c.key, rang: 0 });
    const prins = PRINCIPES.map(p => sd.principes?.find(x => x.key === p.key) ?? { key: p.key, rang: 0 });
    const presets = sd.rolls ?? [];

    return (
        <div className="dn-npc">
            <div className="dn-npc-line">
                <span className="vtt-tag">{rankLabel(sd.rank)}</span>
                {(sd.traits ?? []).map(t => <span key={t} className="vtt-tag">{t}</span>)}
            </div>

            <div className="dn-npc-sub">Compétences</div>
            <div className="dn-npc-grid">
                {comps.map(c => <TraitCell key={c.key} group="competences" item={c} pick={pick} sub={(c.specialisations ?? []).filter(Boolean).join(', ')} />)}
            </div>

            <div className="dn-npc-sub">{minor ? 'Principe (valeur unique du mineur)' : 'Principes'}</div>
            {minor ? (
                <div className="dn-npc-grid"><div className="dn-npc-cell is-fixed"><small>Principe</small><b>{sd.drive ?? 5}</b></div></div>
            ) : (
                <div className="dn-npc-grid">
                    {prins.map(p => <TraitCell key={p.key} group="principes" item={p} pick={pick} sub={p.maxime} />)}
                </div>
            )}

            {presets.length > 0 && (
                <>
                    <div className="dn-npc-sub">Jets préparés</div>
                    <NpcPresets presets={presets} describe={preset => presetText(sd, preset)}
                                onUse={preset => onRoll(npcRollRequest(sd, preset.pick, `${name} · ${preset.label}`))} />
                </>
            )}

            {(sd.talents ?? []).length > 0 && (
                <details className="vtt-npc-notes">
                    <summary>Talents ({sd.talents.length})</summary>
                    {sd.talents.map((t, i) => <p key={`${t.name}-${i}`} className="dn-npc-text"><b>{t.name}.</b> {t.text}</p>)}
                </details>
            )}
            {(sd.atouts ?? []).length > 0 && (
                <div className="dn-npc-line">
                    <span className="dn-npc-sub">Atouts</span>
                    {sd.atouts.map((a, i) => <span key={`${a.name}-${i}`} className="vtt-tag">{a.name}{a.quality ? ` (${a.quality})` : ''}</span>)}
                </div>
            )}

            {state && <DefeatState sd={sd} state={state} onStateChange={onStateChange} />}
        </div>
    );
};

export default DuneNpcSheet;
