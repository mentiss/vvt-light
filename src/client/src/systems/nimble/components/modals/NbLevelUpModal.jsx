// src/client/src/systems/nimble/components/modals/NbLevelUpModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Montée de niveau guidée (Core Rules 3.3 p.21 ; spec_nimble.md D-9) :
//   PV (dé de vie avec avantage, ou gain fixe), point de compétence (et
//   déplacement facultatif d'un point), augmentations de caractéristiques,
//   sous-classe, choix des listes de la classe, faveur épique, école apprise ;
//   capacités du niveau rappelées. Règles : config/rules/levelUp.js.
//
// Props : c, act, sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { SKILLS, STAT_BY_KEY } from '../../config/basics.js';
import { SCHOOLS } from '../../config/spells.js';
import { EPIC_BOONS } from '../../config/boons.js';
import { displayName, classOf, knownSchools, skillValue } from '../../config/rules/character.js';
import { levelUpPlan, canRaise, movableSkills } from '../../config/rules/levelUp.js';
import { signed } from '../../config/rules/formula.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import { NbPill, NbRich } from '../ui/NbUi.jsx';
import NbChoiceList from './NbChoiceList.jsx';
import NbHistoryEntry from '../layout/NbHistoryEntry.jsx';

const Step = ({ title, done, children }) => (
    <section className="nb-block">
        <div className="nb-block-title"><h3>{title}</h3><span className="nb-block-extra">{done ? '✓' : '•'}</span></div>
        {children}
    </section>
);

const NbLevelUpModal = ({ c, act, sessionId, onClose }) => {
    const cls = classOf(c);
    const [subclassKey, setSubclassKey] = useState(null);
    const plan = levelUpPlan(c, subclassKey ?? c.subclassKey);
    const { launch, rolling, entry } = useNbRoll();

    const [hpGain, setHpGain] = useState(null);
    const [skill, setSkill] = useState(null);
    const [moveFrom, setMoveFrom] = useState(null);
    const [moveTo, setMoveTo] = useState(null);
    const [stats, setStats] = useState([]);            // une liste par augmentation
    const [picks, setPicks] = useState({});            // pool → clés
    const [boon, setBoon] = useState([]);
    const [school, setSchool] = useState([]);

    const taken = (pool) => (c.choices ?? []).filter(ch => ch.pool === pool).map(ch => ch.key);
    const rollHp = async () => {
        const r = await launch({ characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null,
            label: `Niveau ${plan.level} : PV`, type: 'levelhp', systemData: { sides: plan.sides } });
        if (r) setHpGain(r.total);
    };

    const statsDone = plan.statIncreases.every((inc, i) => (stats[i] ?? []).length === Math.min(inc.count, inc.stats.filter(s => canRaise(c, s)).length));
    const picksDone = plan.picks.every(p => (picks[p.pool] ?? []).length === Math.min(p.count, p.items.length - taken(p.pool).length));
    const ready = hpGain !== null && skill && statsDone && picksDone && (!plan.needsSubclass || subclassKey) && (!plan.epicBoon || boon.length === 1);

    const confirm = () => {
        act.levelUp({
            hpGain, skill, moveFrom, moveTo, stats: stats.flat(), subclassKey,
            picks: [
                ...Object.entries(picks).flatMap(([pool, keys]) => keys.map(key => ({ pool, key }))),
                ...boon.map(key => ({ pool: 'epicBoon', key })),
                ...school.map(key => ({ pool: 'school', key })),
            ],
        });
        onClose();
    };

    const movable = movableSkills(c);
    return (
        <Modal onClose={onClose} title={`Niveau ${plan.level}`} subtitle={`${displayName(c)} · ${cls?.name ?? ''}`} size="xl" expandable
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!ready} onClick={confirm}>Passer au niveau {plan.level}</button>
               </>}>
            <div className="nb-fields">
                <Step title="Points de vie" done={hpGain !== null}>
                    <div className="nb-pills">
                        <NbPill on={false} disabled={rolling} onClick={rollHp}>Lancer d{plan.sides} avec avantage</NbPill>
                        <NbPill on={hpGain === plan.flat && !entry} onClick={() => setHpGain(plan.flat)}>Gain fixe +{plan.flat}</NbPill>
                    </div>
                    {hpGain !== null && <p className="mt-1"><b>+{hpGain} PV max</b> (et +1 dé de vie max).</p>}
                    {entry && <div className="vtt-history-entry mt-1"><NbHistoryEntry roll={entry} /></div>}
                </Step>

                <Step title="Point de compétence" done={!!skill}>
                    <div className="nb-pills">
                        {SKILLS.map(s => <NbPill key={s.key} on={skill === s.key} onClick={() => setSkill(s.key)}>{s.label} {signed(skillValue(c, s.key))}</NbPill>)}
                    </div>
                    {movable.length > 0 && (
                        <details className="nb-fold">
                            <summary>Déplacer aussi un point (facultatif)</summary>
                            <div className="nb-fields">
                                <div className="nb-field-row"><b>Retirer de</b><span className="nb-pills">
                                    {movable.map(k => <NbPill key={k} on={moveFrom === k} onClick={() => setMoveFrom(moveFrom === k ? null : k)}>{SKILLS.find(s => s.key === k)?.label}</NbPill>)}
                                </span></div>
                                <div className="nb-field-row"><b>Ajouter à</b><span className="nb-pills">
                                    {SKILLS.filter(s => s.key !== moveFrom).map(s => <NbPill key={s.key} on={moveTo === s.key} onClick={() => setMoveTo(moveTo === s.key ? null : s.key)}>{s.label}</NbPill>)}
                                </span></div>
                            </div>
                        </details>
                    )}
                </Step>

                {plan.statIncreases.map((inc, i) => {
                    const chosen = stats[i] ?? [];
                    const set = (list) => setStats(prev => { const next = [...prev]; next[i] = list; return next; });
                    return (
                        <Step key={i} title={inc.from === 'key' ? 'Caractéristique clé +1' : inc.from === 'secondary' ? 'Caractéristique secondaire +1' : `+1 à ${inc.count} caractéristiques`}
                              done={chosen.length === Math.min(inc.count, inc.stats.filter(s => canRaise(c, s)).length)}>
                            <div className="nb-pills">
                                {inc.stats.map(s => (
                                    <NbPill key={s} on={chosen.includes(s)} disabled={!canRaise(c, s)}
                                            onClick={() => set(chosen.includes(s) ? chosen.filter(x => x !== s) : inc.count === 1 ? [s] : chosen.length < inc.count ? [...chosen, s] : chosen)}>
                                        {STAT_BY_KEY[s].name} {signed(c[STAT_BY_KEY[s].field] ?? 0)}
                                    </NbPill>
                                ))}
                            </div>
                        </Step>
                    );
                })}

                {plan.needsSubclass && (
                    <Step title="Sous-classe" done={!!subclassKey}>
                        <NbChoiceList items={cls?.subclasses ?? []} selected={subclassKey ? [subclassKey] : []} onChange={(keys) => { setSubclassKey(keys[0] ?? null); setPicks({}); }} />
                    </Step>
                )}

                {plan.picks.map(p => (
                    <Step key={p.pool} title={`${p.label} : ${p.count} choix`} done={(picks[p.pool] ?? []).length === Math.min(p.count, p.items.length - taken(p.pool).length)}>
                        <NbChoiceList items={p.items} selected={picks[p.pool] ?? []} max={p.count} taken={taken(p.pool)}
                                      onChange={(keys) => setPicks(prev => ({ ...prev, [p.pool]: keys }))} />
                    </Step>
                ))}

                {plan.epicBoon && (
                    <Step title="Faveur épique" done={boon.length === 1}>
                        <NbChoiceList items={EPIC_BOONS} selected={boon} taken={taken('epicBoon')} onChange={setBoon} />
                    </Step>
                )}

                {cls?.spellcasting && (
                    <details className="nb-fold">
                        <summary>Apprendre une école de magie (seulement si une capacité le dit)</summary>
                        <NbChoiceList items={SCHOOLS.filter(s => !knownSchools(c).includes(s.key) && s.key !== 'secret')} selected={school} onChange={setSchool} />
                    </details>
                )}

                <Step title="Capacités du niveau" done>
                    {plan.tierAfter !== null && plan.tierAfter > (plan.tierBefore ?? 0) && <p className="nb-todo">Sorts de rang {plan.tierAfter} débloqués.</p>}
                    {plan.features.length === 0 && <p className="nb-note">Aucune capacité nouvelle à ce niveau.</p>}
                    {plan.features.map(({ source, feature }) => (
                        <div key={`${source}:${feature.key}`} className="nb-line">
                            <div className="nb-line-main"><span className="nb-line-name">{feature.name}</span> {feature.cost && <span className="nb-tag">{feature.cost}</span>}</div>
                            <NbRich text={feature.text} className="nb-line-text" />
                        </div>
                    ))}
                </Step>
            </div>
        </Modal>
    );
};

export default NbLevelUpModal;
