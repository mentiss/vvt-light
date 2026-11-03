// src/client/src/systems/woddavampire/components/layout/VdaPowers.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bloc « Pouvoirs » de la fiche (spec_woddavampire.md §13, §14, §II.11) : une
// carte par Discipline connue, ses pouvoirs (niveau ≤ valeur, pouvoirs d'aîné
// choisis), la magie du sang (voies, kraina, rituels).
//   - clic sur un nom : l'effet se déplie (sans changer d'onglet) ;
//   - bouton d10 : fenêtre de jet pré-remplie (coût proposé à la dépense) ;
//   - pouvoir sans jet mais avec un coût : « Utiliser » retire le coût ;
//   - Célérité : « Activer (1 S) » ; Puissance et Force d'âme s'activent au jet.
// Seul endroit de la fiche où figurent les Disciplines : leur valeur s'y modifie
// en mode Édition, et on y ajoute une Discipline.
// En mode Édition : pouvoirs d'aîné (7ᵉ Génération ou mieux), voies secondaires,
// rituels.
//
// Props : c, editMode, onArray(field, list), onQuick(patch), onRoll(setup)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
    DISCIPLINES, DISCIPLINE_ORDER, PATHS, KRAINA, RITUALS, availableRituals,
    PATH_POWERS, KRAINA_POWERS, RITUAL_INFO, DISCIPLINE_TEXT, PHYSICAL_DISCIPLINE_TEXT,
} from '../../config.jsx';
import { powerRollSetup, thaumaturgyPathRoll, ritualRoll, krainaRoll, spendCost, costLabel as costText } from '../../config/rules/sheetRules.js';
import {
    ELDER_GENERATION, traitMaxFor, nextValue, disciplinePowers, knownPowers, bloodPathName,
} from '../../config/rules/character.js';
import { VdaChip, VdaDots, D10Icon } from '../ui/VdaUi.jsx';

const costLabel = (p) => costText(p.costText, p.cost);

/** Une ligne de pouvoir : niveau, nom (déplie l'effet), coût, durée, actions */
const PowerRow = ({ level, label, costText, duration, effect, extraText, onRoll, onUse }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="vda-power-row">
            <div className="vda-power-head">
                <span className="vda-power-level">{level || ''}</span>
                <button type="button" className="vda-power-name" onClick={() => setOpen(o => !o)} aria-expanded={open}>{label}</button>
                {costText && <span className="vda-power-meta">{costText}</span>}
                {onUse && <button type="button" className="vda-chip" onClick={onUse} title="Retire le coût">Utiliser</button>}
                {onRoll && <button type="button" className="vtt-btn vtt-btn-sm vda-icon-btn is-mini" onClick={onRoll} title="Lancer" aria-label={`Lancer ${label}`}><D10Icon /></button>}
            </div>
            {open && (
                <div className="vda-power-effect">
                    {duration && <p><b>Durée :</b> {duration}</p>}
                    {effect && <p>{effect}</p>}
                    {extraText && <p className="vda-note">{extraText}</p>}
                </div>
            )}
        </div>
    );
};

/** Retire un coût simple (pouvoir sans jet) */
const spendFor = (c, cost, onQuick) => () => onQuick(spendCost(c, cost));

// ── Disciplines ordinaires ──────────────────────────────────────────────────

const DisciplineBody = ({ c, d, editMode, onArray, onQuick, onRoll }) => {
    const all = disciplinePowers(c, d.disciplineKey);
    const elder = new Set(d.powers ?? []);
    const known = knownPowers(c, d);
    const canElder = (c.generation ?? 12) <= ELDER_GENERATION;
    const elderChoices = all.filter(p => p.level > 5 && !elder.has(p.key) && p.level <= d.rating);
    const setPowers = (powers) => onArray('disciplines', c.disciplines.map(x => (x === d ? { ...x, powers } : x)));

    return (
        <>
            {PHYSICAL_DISCIPLINE_TEXT[d.disciplineKey] && <p className="vda-note">{PHYSICAL_DISCIPLINE_TEXT[d.disciplineKey]}</p>}
            {d.disciplineKey === 'celerity' && (
                <div className="mb-1"><button type="button" className="vda-chip" onClick={spendFor(c, { blood: 1 }, onQuick)}>Activer (1 S)</button></div>
            )}
            {known.map(p => (
                <PowerRow key={`${p.branch ?? ''}${p.key}`} level={p.level} label={p.label} costText={costLabel(p)} duration={p.duration} effect={p.effect}
                          onRoll={p.roll || p.rollText ? () => onRoll(powerRollSetup(p)) : null}
                          onUse={!p.roll && !p.rollText && (p.cost?.blood || p.cost?.willpower) ? spendFor(c, p.cost, onQuick) : null} />
            ))}
            {editMode && canElder && elderChoices.length > 0 && (
                <div className="mt-2">
                    <div className="vda-label">Pouvoir d'aîné (au-delà de 5)</div>
                    <div className="vda-chips">{elderChoices.map(p => <VdaChip key={p.key} onClick={() => setPowers([...(d.powers ?? []), p.key])}>{p.level} · {p.label}</VdaChip>)}</div>
                </div>
            )}
            {editMode && elder.size > 0 && (
                <div className="vda-chips mt-1">{[...elder].map(k => <VdaChip key={k} on onClick={() => setPowers((d.powers ?? []).filter(x => x !== k))}>{all.find(p => p.key === k)?.label ?? k} ✕</VdaChip>)}</div>
            )}
        </>
    );
};

// ── Magie du sang ───────────────────────────────────────────────────────────

const ritualSet = (def) => (def.bloodMagic === 'paths' ? def.pathSet : null);

const PathBlock = ({ def, discKey, path, onRoll }) => {
    const name = bloodPathName(discKey, path.pathKey);
    const head = <div className="vda-path-head"><b>{name}</b> <span className="vda-power-meta">{path.rating}{path.isPrimary ? ' · principale' : ''}</span></div>;

    if (def.bloodMagic === 'kraina') {
        return (
            <div className="vda-path">{head}
                {(KRAINA_POWERS[path.pathKey] ?? []).filter(p => p.level <= path.rating).map(p => (
                    <PowerRow key={p.key} level={p.level} label={p.label} costText={costLabel(p) || '1 S'} duration={p.duration} effect={p.effect}
                              extraText={`Jet : ${p.attributeText} (brut) + Occultisme, diff ${p.level} + 4${path.isPrimary ? ' − 2 (kraina principale)' : ''}`}
                              onRoll={() => onRoll(powerRollSetup({ ...p, roll: null, generic: krainaRoll(p.level, p.attributeText, path.isPrimary), costText: p.costText ?? '1 S', cost: p.costText ? p.cost : { blood: 1 } }))} />
                ))}
            </div>
        );
    }
    const data = PATH_POWERS[path.pathKey] ?? {};
    const thaumaturgic = def.pathSet === 'thaumaturgy';
    // Voie mineure (une table d'effets par niveau) : un seul jet, au niveau de la voie
    if (data.levels) {
        return (
            <div className="vda-path">{head}
                <PowerRow level={path.rating} label={`${name} (niveau ${path.rating})`} costText="1 S" effect={data.text}
                          extraText={data.levels.filter(l => l.level <= path.rating).map(l => `${l.level} — ${l.text}`).join(' · ')}
                          onRoll={() => onRoll(powerRollSetup({ label: name, generic: thaumaturgyPathRoll(path.rating), costText: '1 S', cost: { blood: 1 } }))} />
            </div>
        );
    }
    return (
        <div className="vda-path">{head}
            {(data.powers ?? []).filter(p => p.level <= path.rating).map(p => {
                const generic = thaumaturgic && !p.roll && !p.rollText ? thaumaturgyPathRoll(p.level) : null;
                const cost = thaumaturgic && !p.costText ? { costText: '1 S', cost: { blood: 1 } } : {};
                return (
                    <PowerRow key={p.key} level={p.level} label={p.label} costText={costLabel({ ...p, ...cost })} duration={p.duration} effect={p.effect}
                              onRoll={p.roll || p.rollText || generic ? () => onRoll(powerRollSetup({ ...p, ...cost, generic })) : null} />
                );
            })}
        </div>
    );
};

const BloodMagicBody = ({ c, d, editMode, onArray, onRoll }) => {
    const def = DISCIPLINES[d.disciplineKey];
    const paths = (c.bloodPaths ?? []).filter(p => p.disciplineKey === d.disciplineKey);
    const set = ritualSet(def);
    const rituals = (c.rituals ?? []).filter(r => r.disciplineKey === d.disciplineKey);
    const ownedPaths = new Set(paths.map(p => p.pathKey));
    const addablePaths = Object.entries(def.bloodMagic === 'kraina' ? KRAINA[d.disciplineKey] ?? {} : PATHS[def.pathSet] ?? {}).filter(([k]) => !ownedPaths.has(k));
    const ownedRituals = new Set(rituals.map(r => r.ritualKey));
    const addableRituals = set ? availableRituals(set, d.rating, c.clanKey).filter(r => !ownedRituals.has(r.key)) : [];

    return (
        <>
            {paths.map(p => <PathBlock key={p.id ?? p.pathKey} def={def} discKey={d.disciplineKey} path={p} onRoll={onRoll} />)}
            {rituals.length > 0 && <div className="vda-path-head mt-2"><b>Rituels</b></div>}
            {rituals.map(r => {
                const info = RITUAL_INFO[set]?.[r.ritualKey] ?? {};
                const label = (RITUALS[set] ?? []).find(x => x.key === r.ritualKey)?.label ?? info.label ?? r.customName ?? r.ritualKey;
                const roll = info.roll ?? (info.rollText ? null : ritualRoll(r.level));
                return (
                    <PowerRow key={r.id ?? r.ritualKey} level={r.level} label={label} costText={info.costText} duration={info.duration} effect={info.effect}
                              onRoll={() => onRoll(powerRollSetup({ label, roll: info.roll, rollText: info.rollText, generic: info.roll ? null : roll, costText: info.costText, cost: {} }))} />
                );
            })}
            {editMode && addablePaths.length > 0 && (
                <div className="mt-2">
                    <div className="vda-label">Ajouter une {def.bloodMagic === 'kraina' ? 'kraina' : 'voie secondaire'} (valeur ≤ {d.rating})</div>
                    <div className="vda-chips">{addablePaths.map(([k, l]) => (
                        <VdaChip key={k} onClick={() => onArray('bloodPaths', [...(c.bloodPaths ?? []), { disciplineKey: d.disciplineKey, pathKey: k, rating: 1, isPrimary: paths.length === 0 }])}>{l}</VdaChip>
                    ))}</div>
                </div>
            )}
            {editMode && paths.map(p => (
                <div key={`edit-${p.pathKey}`} className="vda-chips mt-1">
                    <span className="vda-note">{bloodPathName(d.disciplineKey, p.pathKey)} :</span>
                    {[1, 2, 3, 4, 5].filter(n => n <= d.rating).map(n => (
                        <VdaChip key={n} on={p.rating === n} onClick={() => onArray('bloodPaths', c.bloodPaths.map(x => (x === p ? { ...x, rating: n } : x)))}>{n}</VdaChip>
                    ))}
                    <VdaChip onClick={() => onArray('bloodPaths', c.bloodPaths.filter(x => x !== p))}>✕</VdaChip>
                </div>
            ))}
            {editMode && addableRituals.length > 0 && (
                <div className="mt-2">
                    <div className="vda-label">Ajouter un rituel (niveau ≤ {d.rating})</div>
                    <div className="vda-chips">{addableRituals.map(r => (
                        <VdaChip key={r.key} onClick={() => onArray('rituals', [...(c.rituals ?? []), { disciplineKey: d.disciplineKey, ritualKey: r.key, level: r.level }])}>{r.level} · {r.label}</VdaChip>
                    ))}</div>
                </div>
            )}
        </>
    );
};

// ── Bloc complet ────────────────────────────────────────────────────────────

const VdaPowers = ({ c, editMode, onArray, onQuick, onRoll }) => {
    const known = (c.disciplines ?? []).filter(d => editMode || d.rating > 0);
    const traitMax = traitMaxFor(c);
    const setRating = (d, n) => onArray('disciplines', c.disciplines.map(x => (x === d ? { ...x, rating: nextValue(d.rating, n) } : x)));
    const addable = DISCIPLINE_ORDER.filter(k => !(c.disciplines ?? []).some(d => d.disciplineKey === k));

    return (
        <div className="vda-powers-grid">
            {!known.length && <p className="vda-note text-center">Aucune Discipline.</p>}
            {known.map(d => {
                const def = DISCIPLINES[d.disciplineKey] ?? { label: d.disciplineKey };
                return (
                    <section key={d.id ?? d.disciplineKey} className="vda-card is-static vda-power-card">
                        <div className="vda-power-card-head">
                            <span className="vda-card-title" title={DISCIPLINE_TEXT[d.disciplineKey]}>{def.label}</span>
                            {editMode
                                ? <VdaDots max={traitMax} base={d.rating} onPick={(n) => setRating(d, n)} label={def.label} />
                                : <span className="vda-power-dots" aria-label={`Valeur ${d.rating}`}>{'●'.repeat(d.rating)}</span>}
                        </div>
                        {def.bloodMagic
                            ? <BloodMagicBody c={c} d={d} editMode={editMode} onArray={onArray} onRoll={onRoll} />
                            : <DisciplineBody c={c} d={d} editMode={editMode} onArray={onArray} onQuick={onQuick} onRoll={onRoll} />}
                    </section>
                );
            })}
            {editMode && addable.length > 0 && (
                <div>
                    <div className="vda-label">Ajouter une Discipline</div>
                    <div className="vda-chips is-small">{addable.map(k => (
                        <VdaChip key={k} onClick={() => onArray('disciplines', [...(c.disciplines ?? []), { disciplineKey: k, rating: 1, powers: [] }])}>{DISCIPLINES[k].label}</VdaChip>
                    ))}</div>
                </div>
            )}
        </div>
    );
};

export default VdaPowers;
