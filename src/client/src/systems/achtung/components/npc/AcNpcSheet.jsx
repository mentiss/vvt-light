// src/client/src/systems/achtung/components/npc/AcNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ d'Achtung! Cthulhu (spec_pnj.md §10.4), posée par la brique
// NpcSystem (props { npc, state, onStateChange, pick, name, onRoll }) :
//   - rang, vérités ; attributs et compétences à choisir pour le jet composé (barre
//     « Lancer » de la plateforme, fenêtre de jet MJ préremplie) ;
//   - armes en un clic : Force (contact) ou Coordination (distance) + Combat, puis dégâts (config/npc.js, npcAttack) ;
//   - à la table : Stress, blessures (vaincu selon le rang) ; groupe de Troupes : membres restants ;
//   - Armure, Courage, attaques (options d'escalade signalées), règles spéciales, dépenses de Menace.
// Règles : config/npc.js ; jet : acNpcPick.js, AcNpcRollWindow.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ATTRIBUTES } from '../../config/base.js';
import { NPC_QUALITIES, NPC_RANKS, RANK_RULES, GROUP_MAX, injuriesMax, isOut, npcAttack, skillLabel, stressMax } from '../../config/npc.js';

const RANGES = { contact: 'Contact', close: 'Courte', medium: 'Moyenne', long: 'Longue', extreme: 'Extrême' };

const Counter = ({ label, value, max, onChange }) => (
    <div className="ac-npc-counter">
        <span className="ac-label">{label}</span>
        <button type="button" className="ac-btn ac-btn-ghost w-7 h-7 p-0 disabled:opacity-30" disabled={value <= 0}
                onClick={() => onChange(value - 1)} aria-label={`${label} : un de moins`}>−</button>
        <b className="ac-npc-num">{value}</b>
        <button type="button" className="ac-btn ac-btn-ghost w-7 h-7 p-0 disabled:opacity-30" disabled={value >= max}
                onClick={() => onChange(value + 1)} aria-label={`${label} : un de plus`}>+</button>
        <span className="ac-npc-muted">/ {max}</span>
    </div>
);

const attackText = (a) => [
    a.focus && `(${a.focus})`, RANGES[a.range] ?? a.range, a.damage != null && `${a.damage} ▲${a.salvo ? ` (salve : ${a.salvo})` : ''}`, a.qualities,
].filter(Boolean).join(', ');

const AcNpcSheet = ({ npc, state, onStateChange, pick, name, onRoll }) => {
    const sd = npc.systemData ?? {};
    const down = isOut(sd, state);
    const incidental = sd.rank === 'incidental';
    const quality = NPC_QUALITIES[sd.quality] ?? NPC_QUALITIES.basic;
    const attacks = sd.attacks ?? [];

    return (
        <div className="ac-npc-body">
            <div className="ac-npc-muted">
                {NPC_RANKS[sd.rank] ?? ''}{incidental ? ` ${quality.label.toLowerCase()} · cible ${quality.target}, focus jusqu'à ${quality.skill}` : ''}
                {RANK_RULES[sd.rank] ? ` · ${RANK_RULES[sd.rank].reactions}` : ''}
            </div>
            {(sd.truths ?? []).length > 0 && <div className="ac-npc-truths">{sd.truths.join(' · ')}</div>}

            {!incidental && (
                <>
                    <div className="ac-npc-pills">
                        {ATTRIBUTES.map(a => (
                            <button key={a.key} type="button" className={`vtt-pill${pick?.isPicked('attribute', a.key) ? ' is-selected' : ''}`}
                                    onClick={() => pick?.toggle('attribute', a.key)}>{a.label} {sd.attributes?.[a.key] ?? '—'}</button>
                        ))}
                    </div>
                    {(sd.skills ?? []).length > 0 && (
                        <div className="ac-npc-pills">
                            {sd.skills.map(s => (
                                <button key={s.key} type="button" className={`vtt-pill${pick?.isPicked('skill', s.key) ? ' is-selected' : ''}`}
                                        onClick={() => pick?.toggle('skill', s.key)}>
                                    {skillLabel(s.key)} {s.rank}{(s.focuses ?? []).length ? ` (${s.focuses.join(', ')})` : ''}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="ac-npc-values">
                <span><b className="ac-label">Armure</b> {sd.armour ?? 0}</span>
                <span><b className="ac-label">Courage</b> {sd.courage ?? 0}</span>
                {!state && !incidental && <span><b className="ac-label">Stress</b> {stressMax(sd)}</span>}
                {!state && !incidental && <span><b className="ac-label">Blessures</b> {injuriesMax(sd)}</span>}
            </div>
            {state && (
                <div className="ac-npc-values">
                    {state.alive != null && (state.count ?? 1) > 1 && (
                        <Counter label="Membres" value={state.alive} max={Math.max(state.count ?? GROUP_MAX, state.alive)}
                                 onChange={v => onStateChange({ alive: v })} />
                    )}
                    {!incidental && <Counter label="Stress" value={state.stress ?? 0} max={stressMax(sd)} onChange={v => onStateChange({ stress: v })} />}
                    <Counter label="Blessures" value={state.injuries ?? 0} max={injuriesMax(sd)} onChange={v => onStateChange({ injuries: v })} />
                </div>
            )}

            {attacks.length > 0 && (
                <div className="ac-npc-list">
                    {attacks.map((a, i) => (
                        // relecture: F-KEY — attaques sans identifiant, liste figée de la fiche
                        <div key={`${a.name}-${i}`}>
                            <button type="button" className="vtt-pill" disabled={!onRoll || down}
                                    onClick={() => onRoll({ name, label: `${name} · ${a.name}`, ...npcAttack(sd, a, state) })}>{a.name}</button>
                            {a.escalation ? <span className="ac-npc-muted"> · escalade</span> : null} {attackText(a)}
                        </div>
                    ))}
                </div>
            )}
            {((sd.abilities ?? []).length > 0 || (sd.threatSpends ?? []).length > 0) && (
                <details className="ac-npc-fold">
                    <summary className="ac-label">Règles spéciales ({(sd.abilities ?? []).length + (sd.threatSpends ?? []).length})</summary>
                    {(sd.abilities ?? []).map((t, i) => <p key={`a-${t.name}-${i}`}><b>{t.name}.</b> {t.text}</p>)}
                    {(sd.threatSpends ?? []).map((t, i) => <p key={`m-${t.name}-${i}`}><b>{t.name}</b>{t.cost ? ` (${t.cost} Menace)` : ''}. {t.text}</p>)}
                </details>
            )}
        </div>
    );
};

export default AcNpcSheet;
