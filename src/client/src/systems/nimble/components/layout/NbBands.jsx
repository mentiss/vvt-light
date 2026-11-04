// src/client/src/systems/nimble/components/layout/NbBands.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Les deux bandes de la fiche officielle (spec_nimble.md §6.2) :
//   NbStatBand  : identité, FOR DEX INT VOL (▲/▼ de sauvegarde ; clic = sauvegarde),
//                 bouclier des PV (clic = dégâts et soins), Armure, Initiative
//                 (clic = initiative), Vitesse, Blessures, dés de vie ;
//   NbSkillBand : les 10 compétences (clic = test).
// Props : c, ask(kind, data) (absent : lecture seule), act, onAvatar
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { STATS, SKILLS } from '../../config/basics.js';
import { signed } from '../../config/rules/formula.js';
import {
    displayName, originLine, statValue, saveEdge, maxHp, isBloodied, defenseOf, initiativeOf, speedOf,
    maxWounds, maxHitDice, hitDiceLeft, hitDieSides, skillValue, effectsOf,
} from '../../config/rules/character.js';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/** Bouton si cliquable, sinon simple bloc (lecture seule) */
const Cell = ({ onClick, className, children, title }) => (onClick
    ? <button type="button" className={className} onClick={onClick} title={title}>{children}</button>
    : <div className={className} title={title}>{children}</div>);

export const NbStatBand = ({ c, ask, act, onAvatar }) => {
    const effects = effectsOf(c);
    const hpMax = maxHp(c, effects);
    const wMax = maxWounds(c, effects);
    const hdMax = maxHitDice(c, effects);
    const hdLeft = hitDiceLeft(c, effects);
    const wounds = Number(c.wounds ?? 0);
    const dead = wounds >= wMax;
    return (
        <div className="nb-statband nb-notched">
            <div className="nb-ident">
                <Cell onClick={onAvatar} className="nb-avatar" title={onAvatar ? 'Changer le portrait' : undefined}>
                    {c.avatar ? <img src={c.avatar} alt="" /> : initials(displayName(c))}
                </Cell>
                <div className="min-w-0">
                    <div className="nb-charname">{displayName(c) || 'Sans nom'}</div>
                    <div className="nb-charline">{originLine(c)}</div>
                </div>
            </div>

            {STATS.map(s => {
                const edge = saveEdge(c, s.key);
                return (
                    <Cell key={s.key} className="nb-stat" onClick={ask && (() => ask('save', s.key))}
                          title={`Sauvegarde de ${s.name}${edge > 0 ? ' (avantagée)' : edge < 0 ? ' (désavantagée)' : ''}`}>
                        <i className={`nb-save is-top${edge > 0 ? ' is-on' : ''}`} aria-hidden="true" />
                        <span className="nb-stat-val">{signed(statValue(c, s.key))}</span>
                        <span className="nb-stat-lab">{s.label}</span>
                        <i className={`nb-save is-bottom${edge < 0 ? ' is-on' : ''}`} aria-hidden="true" />
                    </Cell>
                );
            })}

            <Cell className={`nb-shield${isBloodied(c) ? ' is-bloodied' : ''}${c.dying ? ' is-dying' : ''}`} onClick={ask && (() => ask('hp'))} title="Dégâts et soins">
                <span className="nb-shield-lab">♥ Points de vie</span>
                <span className="nb-shield-val">{c.hpCurrent ?? 0}<small> / {hpMax}</small></span>
                {Number(c.tempHp) > 0 && <span className="nb-shield-temp">+{c.tempHp} temp.</span>}
            </Cell>

            <div className="nb-box"><span className="nb-box-lab">Armure</span><span className="nb-box-val">{defenseOf(c, effects)}</span></div>
            <Cell className="nb-box" onClick={ask && (() => ask('initiative'))} title="Lancer l'initiative">
                <span className="nb-box-lab">Initiative</span>
                <span className="nb-box-val">{signed(initiativeOf(c, effects))}{effects.initiativeAdvantage && <small> ▲</small>}</span>
            </Cell>
            <div className="nb-box"><span className="nb-box-lab">Vitesse</span><span className="nb-box-val">{speedOf(c, effects)}</span></div>

            <div className="nb-vitals">
                <div className="nb-vitals-row">
                    <span className="nb-vitals-lab">Blessures</span>
                    <span className="nb-chain">
                        {Array.from({ length: Math.max(0, wMax - 1) }, (_, i) => (act
                            ? <button key={i} type="button" className={`nb-wound${i < wounds ? ' is-on' : ''}`} onClick={() => act.clickWound(i + 1)} aria-label={`Blessure ${i + 1}`} />
                            : <i key={i} className={`nb-wound${i < wounds ? ' is-on' : ''}`} />))}
                        {act
                            ? <button type="button" className={`nb-skull${dead ? ' is-dead' : ''}`} onClick={() => act.clickWound(wMax)} aria-label="Dernière Blessure : la mort">☠</button>
                            : <span className={`nb-skull${dead ? ' is-dead' : ''}`}>☠</span>}
                    </span>
                    {c.dying && <span className="nb-dying">Mourant</span>}
                </div>
                <div className="nb-vitals-row">
                    <span className="nb-vitals-lab">Dés de vie</span>
                    <span className="nb-hd" title={`${hdLeft} / ${hdMax} d${hitDieSides(c, effects)}`}>
                        {Array.from({ length: hdMax }, (_, i) => <i key={i} className={i < hdLeft ? 'is-on' : ''} />)}
                    </span>
                    <span className="nb-charline"><b>{hdLeft}</b>/{hdMax} d{hitDieSides(c, effects)}</span>
                </div>
            </div>
        </div>
    );
};

export const NbSkillBand = ({ c, ask }) => {
    const effects = effectsOf(c);
    return (
        <div className="nb-skillband nb-notched">
            {SKILLS.map(s => (
                <Cell key={s.key} className="nb-skill" onClick={ask && (() => ask('check', s.key))} title={s.text}>
                    <span className="nb-skill-stat">{STATS.find(x => x.key === s.stat)?.label}</span>
                    <span className="nb-skill-val">{signed(skillValue(c, s.key, effects))}</span>
                    <span className="nb-skill-lab">{s.label}</span>
                </Cell>
            ))}
        </div>
    );
};
