// src/client/src/systems/fabula/components/npc/FuNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ de Fabula Ultima (spec_pnj.md §10.5, §10.7), posée par la brique
// NpcSystem (props { npc, state, onStateChange, hiddenRolls, sessionId, name }) :
//   - niveau, espèce, rang (tours par manche), Méchant ; traits ;
//   - dés d'attributs (états appliqués), DEF, DEF M., initiative, affinités ;
//   - à la table : PV (Crise), PM, Points Ultima d'un Méchant, états ;
//   - « Test », attaques et sorts offensifs (§12) : fenêtre de jet du MJ (FuGmDiceModal) préremplie ;
//   - sorts et capacités repliés.
// Règles : config/npc.js.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import FuDie from '../ui/FuDie.jsx';
import FuIcon from '../ui/FuIcon.jsx';
import Stepper from '../layout/Stepper.jsx';
import FuGmDiceModal from '../modals/FuGmDiceModal.jsx';
import { TYPES_DEGATS } from '../../config/equipment.js';
import {
    AFFINITIES, ATTR_KEYS, STATUSES, VILLAINS, crisisOf, inCrisis, isOut, npcDie, rankLabel, spellRoll, turnsPerRound, ultimaMax,
} from '../../config/npc.js';

const SHORT = { dex: 'DEX', int: 'INT', pui: 'PUI', vol: 'VOL' };
const typeLabel = (k) => TYPES_DEGATS.find(t => t.key === k)?.label ?? k;

const FuNpcSheet = ({ npc, state, onStateChange, hiddenRolls, sessionId, name }) => {
    const sd = npc.systemData ?? {};
    const [roll, setRoll] = useState(null);
    const dice = Object.fromEntries(ATTR_KEYS.map(k => [k, npcDie(sd, state, k)]));
    const statuses = state?.statuses ?? [];
    const toggleStatus = (k) => onStateChange({ statuses: statuses.includes(k) ? statuses.filter(s => s !== k) : [...statuses, k] });
    const affinities = Object.entries(sd.affinities ?? {}).filter(([, v]) => AFFINITIES[v]);
    const turns = turnsPerRound(sd);
    const down = isOut(state);

    return (
        <div className="fu-npc-body">
            <div className="fu-npc-muted">
                Niv. {sd.level ?? '—'} · {sd.species ?? ''} · {rankLabel(sd)}{turns > 1 ? ` · ${turns} tours par manche` : ''}
                {sd.villain ? ` · ${VILLAINS[sd.villain]?.label ?? 'Méchant'}` : ''}
            </div>
            {(sd.traits ?? []).length > 0 && <div className="fu-npc-traits">{sd.traits.join(', ')}</div>}

            <div className="fu-npc-attrs">
                {ATTR_KEYS.map(k => (
                    <span key={k} className="fu-npc-attr" title={dice[k] !== Number(sd.attributes?.[k] ?? 8) ? 'Baissé par un état' : undefined}>
                        <FuDie size={dice[k]} small /><span className="fu-label">{SHORT[k]}</span>
                    </span>
                ))}
                <button type="button" className="fu-btn fu-btn-sm" disabled={down} onClick={() => setRoll({ label: `${name} · test`, initial: { mode: 'test' } })}>Test</button>
            </div>
            <div className="fu-npc-values">
                <span><b className="fu-label">DEF</b> {sd.def ?? '—'}</span>
                <span><b className="fu-label">DEF M.</b> {sd.mdef ?? '—'}</span>
                <span><b className="fu-label">Init.</b> {sd.init ?? '—'}</span>
                {!state && <span><b className="fu-label">PV</b> {sd.hp ?? 0} (Crise {crisisOf(sd)})</span>}
                {!state && <span><b className="fu-label">PM</b> {sd.mp ?? 0}</span>}
            </div>
            {affinities.length > 0 && (
                <div className="fu-npc-pills">
                    {affinities.map(([t, v]) => <span key={t} className={`fu-tag fu-npc-aff is-${v}`}>{typeLabel(t)} {v}</span>)}
                </div>
            )}

            {state && (
                <>
                    <div className="fu-npc-values">
                        <span className="fu-npc-counter"><b className="fu-label">PV</b>
                            <Stepper value={state.hp ?? 0} min={0} max={Number(sd.hp ?? 0)} onChange={v => onStateChange({ hp: v })} /></span>
                        {inCrisis(sd, state) && <span className="fu-tag fu-npc-crisis">Crise</span>}
                        <span className="fu-npc-counter"><b className="fu-label">PM</b>
                            <Stepper value={state.mp ?? 0} min={0} max={Number(sd.mp ?? 0)} onChange={v => onStateChange({ mp: v })} /></span>
                        {sd.villain && (
                            <span className="fu-npc-counter"><b className="fu-label">Ultima</b>
                                <Stepper value={state.ultima ?? ultimaMax(sd)} min={0} max={ultimaMax(sd)} onChange={v => onStateChange({ ultima: v })} /></span>
                        )}
                    </div>
                    <div className="fu-npc-pills">
                        {Object.entries(STATUSES).map(([k, l]) => (
                            <button key={k} type="button" className={`fu-pill${statuses.includes(k) ? ' is-on' : ''}`} onClick={() => toggleStatus(k)}>{l}</button>
                        ))}
                    </div>
                </>
            )}

            {(sd.attacks ?? []).map((a, i) => (
                // relecture: F-KEY — attaques sans identifiant, liste figée de la fiche
                <div key={`${a.name}-${i}`} className="fu-npc-line">
                    <button type="button" className="fu-btn fu-btn-sm" disabled={down}
                            onClick={() => setRoll({ label: `${name} · ${a.name}`, initial: {
                                mode: a.damage != null ? 'attaque' : 'test', attr1: a.attrs?.[0] ?? 'dex', attr2: a.attrs?.[1] ?? 'pui',
                                modifier: Number(a.precision ?? 0), degatsBonus: Number(a.damage ?? 0), degatsType: a.type ?? null,
                            } })}>
                        <FuIcon name="sword" className="fu-ico-sm" />{a.name}{a.ranged ? ' (distance)' : ''}
                    </button>
                    <span className="fu-npc-muted">
                        {' '}【{(a.attrs ?? []).map(k => SHORT[k] ?? k).join(' + ')}】{a.precision ? ` +${a.precision}` : ''}
                        {a.damage != null ? ` · 【VH + ${a.damage}】 ${a.type ? typeLabel(a.type) : 'type au choix'}` : ''}{a.text ? ` · ${a.text}` : ''}
                    </span>
                </div>
            ))}
            {/* Sorts offensifs (§12) : test de magie préparé comme une attaque ; le coût en PM se décompte à la main */}
            {(sd.spells ?? []).map((s, i) => {
                const r = spellRoll(s);
                if (!r) return null;
                return (
                    // relecture: F-KEY — sorts sans identifiant, liste figée de la fiche
                    <div key={`spell-${s.name}-${i}`} className="fu-npc-line">
                        <button type="button" className="fu-btn fu-btn-sm" disabled={down}
                                onClick={() => setRoll({ label: `${name} · ${s.name}`, initial: {
                                    mode: r.damage != null ? 'attaque' : 'test', attr1: r.attrs[0], attr2: r.attrs[1],
                                    modifier: r.bonus, degatsBonus: Number(r.damage ?? 0), degatsType: r.type,
                                } })}>
                            <FuIcon name="bolt" className="fu-ico-sm" />{s.name}
                        </button>
                        <span className="fu-npc-muted">
                            {' '}【{r.attrs.map(k => SHORT[k] ?? k).join(' + ')}】{r.bonus ? ` ${r.bonus > 0 ? '+' : ''}${r.bonus}` : ''}
                            {r.damage != null ? ` · 【VH + ${r.damage}】 ${r.type ? typeLabel(r.type) : 'type au choix'}` : ''}{s.cost ? ` · ${s.cost}` : ''}
                        </span>
                    </div>
                );
            })}
            {((sd.spells ?? []).length > 0 || (sd.abilities ?? []).length > 0) && (
                <details className="fu-npc-fold">
                    <summary className="fu-label">Sorts et capacités ({(sd.spells ?? []).length + (sd.abilities ?? []).length})</summary>
                    {(sd.spells ?? []).map((s, i) => (
                        <p key={`s-${s.name}-${i}`}><b>{s.name}{s.offensive ? ' (offensif)' : ''}</b>{[s.cost, s.target, s.duration].filter(Boolean).length ? ` (${[s.cost, s.target, s.duration].filter(Boolean).join(' · ')})` : ''}. {s.text}</p>
                    ))}
                    {(sd.abilities ?? []).map((t, i) => <p key={`a-${t.name}-${i}`}><b>{t.name}.</b> {t.text}</p>)}
                </details>
            )}
            {roll && (
                <FuGmDiceModal sessionId={sessionId} name={name} label={roll.label} dice={dice} initial={roll.initial} hidden={hiddenRolls}
                               onClose={() => setRoll(null)} />
            )}
        </div>
    );
};

export default FuNpcSheet;
