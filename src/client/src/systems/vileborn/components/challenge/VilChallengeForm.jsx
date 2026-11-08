// src/client/src/systems/vileborn/components/challenge/VilChallengeForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire d'un défi de la bibliothèque, création ou modification
// (spec_vileborn_defis.md §II.5) : les blocs de la fiche, en saisie. Champs
// contrôlés ; l'enregistrement (barre d'actions) est porté par l'onglet.
// Les lignes de texte libre n'ont pas d'identifiant : clés par position (F-KEY).
//
// Props : draft (fiche en cours), setDraft(updater), actions (barre en tête)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { APPROACHES } from '../../config/approaches.js';
import { SOURCES, FAMILIES, CHALLENGE_EFFECTS, DARK_WHEN } from '../../config/challenges.js';
import { MAX_TRACK, MAX_SHIFT } from '../../config/rules/challenge.js';
import { VilLabel, VilPill } from '../ui/VilUi.jsx';

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const THRESHOLDS = [{ value: null, label: 'Aucune (seulement les lignes)' }, { value: 9, label: '9+' }, { value: 6, label: '6+' }, { value: 3, label: '3+' }];

const Field = ({ label, children }) => (
    <label className="vil-ch-field"><span className="vtt-field-label">{label}</span>{children}</label>
);

const Stepper = ({ value, min, max, onChange, label }) => (
    <div className="vil-stepper">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} −1`}>−</button>
        <span>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} +1`}>+</button>
    </div>
);

const RemoveButton = ({ onClick }) => <button type="button" className="vil-ch-x" onClick={onClick} aria-label="Retirer">×</button>;

/** Liste de lignes de texte (résistances, vulnérabilités, règles) */
const LineList = ({ values, onChange, addLabel, placeholder }) => (
    <div className="vil-ch-rows">
        {values.map((v, i) => (
            <div key={i} className="vil-ch-line">
                <input className="vtt-input" value={v} placeholder={placeholder} onChange={e => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} />
                <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
            </div>
        ))}
        <button type="button" className="vil-ch-add" onClick={() => onChange([...values, ''])}>+ {addLabel}</button>
    </div>
);

const VilChallengeForm = ({ draft, setDraft, actions }) => {
    const set = (patch) => setDraft(prev => ({ ...prev, ...patch }));
    const setDark = (patch) => setDraft(prev => ({ ...prev, dark: { ...prev.dark, ...patch } }));
    // Ligne d'une liste d'objets (déclencheurs, complications, lignes du d12, règles de famille)
    const setRow = (list, i, patch) => setDraft(prev => ({ ...prev, [list]: prev[list].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
    const dropRow = (list, i) => setDraft(prev => ({ ...prev, [list]: prev[list].filter((_, j) => j !== i) }));
    const setDarkRow = (i, patch) => setDark({ rows: draft.dark.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

    return (
        <section className="vil-ch-card vil-paper vil-ch-form">
            {actions && <div className="vil-ch-bar">{actions}</div>}
            <div>
                <div className="vil-ch-kind">{draft.id ? 'Modifier le défi' : 'Nouveau défi'}</div>
                <h2 className="vil-ch-title">{draft.name.trim() || 'Sans nom'}</h2>
            </div>

            <div className="vil-ch-block">
                <VilLabel>Identité</VilLabel>
                <div className="vil-ch-form-grid">
                    <Field label="Nom"><input className="vtt-input" value={draft.name} onChange={e => set({ name: e.target.value })} /></Field>
                    <Field label="Sous-titre"><input className="vtt-input" value={draft.kind ?? ''} placeholder="Défi · Masquegriffe" onChange={e => set({ kind: e.target.value })} /></Field>
                    <Field label="Citation"><input className="vtt-input" value={draft.quote ?? ''} onChange={e => set({ quote: e.target.value })} /></Field>
                </div>
                <div className="vil-ch-field"><span className="vtt-field-label">Source</span>
                    <div className="vil-pills">{SOURCES.map(s => <VilPill key={s.key} on={draft.source === s.key} onClick={() => set({ source: s.key })}>{s.label}</VilPill>)}</div>
                </div>
                <div className="vil-ch-field"><span className="vtt-field-label">Famille</span>
                    <div className="vil-pills">{FAMILIES.map(f => <VilPill key={f.key} on={draft.family === f.key} onClick={() => set({ family: f.key })}>{f.label}</VilPill>)}</div>
                </div>
                <Field label="Description"><textarea className="vil-textarea" rows={3} value={draft.description ?? ''} onChange={e => set({ description: e.target.value })} /></Field>
            </div>

            <div className="vil-ch-block">
                <VilLabel>Piste et difficultés</VilLabel>
                <div className="vil-ch-field"><span className="vtt-field-label">Réussites nécessaires</span>
                    <Stepper value={draft.track} min={1} max={MAX_TRACK} label="Réussites" onChange={v => set({ track: clamp(v, 1, MAX_TRACK) })} />
                </div>
                <div className="vil-ch-diffs">
                    {APPROACHES.map(a => {
                        const shift = draft.difficulty?.[a.key] ?? 0;
                        return (
                            <div key={a.key} className="vil-ch-diff">
                                <span>{a.label}</span><strong>{signed(shift)}</strong>
                                <Stepper value={shift} min={-MAX_SHIFT} max={MAX_SHIFT} label={a.label}
                                         onChange={v => set({ difficulty: { ...draft.difficulty, [a.key]: clamp(v, -MAX_SHIFT, MAX_SHIFT) } })} />
                            </div>
                        );
                    })}
                </div>
                <div className="vil-ch-form-grid">
                    <div className="vil-ch-field"><span className="vtt-field-label">Résistances (+1)</span>
                        <LineList values={draft.resistances} addLabel="résistance" placeholder="Coups bas" onChange={v => set({ resistances: v })} /></div>
                    <div className="vil-ch-field"><span className="vtt-field-label">Vulnérabilités (−1)</span>
                        <LineList values={draft.vulnerabilities} addLabel="vulnérabilité" placeholder="Argentacier" onChange={v => set({ vulnerabilities: v })} /></div>
                </div>
            </div>

            <div className="vil-ch-block">
                <VilLabel>Déclencheurs</VilLabel>
                <div className="vil-ch-rows">
                    {draft.triggers.map((t, i) => (
                        <div key={i} className="vil-ch-line has-num">
                            <input className="vtt-input vil-ch-num-in" type="number" min={1} max={draft.track} value={t.box} aria-label="Case"
                                   onChange={e => setRow('triggers', i, { box: clamp(Number(e.target.value) || 1, 1, draft.track) })} />
                            <input className="vtt-input" value={t.text} placeholder="Ce qui se passe quand on coche cette case" onChange={e => setRow('triggers', i, { text: e.target.value })} />
                            <RemoveButton onClick={() => dropRow('triggers', i)} />
                        </div>
                    ))}
                    <button type="button" className="vil-ch-add" onClick={() => set({ triggers: [...draft.triggers, { box: Math.min(draft.track, (draft.triggers.at(-1)?.box ?? 0) + 1), text: '' }] })}>+ déclencheur</button>
                </div>
            </div>

            <div className="vil-ch-block">
                <VilLabel>Complications</VilLabel>
                <div className="vil-ch-rows">
                    {draft.complications.map((c, i) => (
                        <div key={i} className="vil-ch-line has-effect">
                            <input className="vtt-input" value={c.text} placeholder="Igritte vous touche avec son épée…" onChange={e => setRow('complications', i, { text: e.target.value })} />
                            <div className="vil-ch-effect-pills">
                                {CHALLENGE_EFFECTS.map(fx => <VilPill key={fx.key} on={c.effect === fx.key} onClick={() => setRow('complications', i, { effect: fx.key })}>{fx.label}</VilPill>)}
                            </div>
                            <RemoveButton onClick={() => dropRow('complications', i)} />
                        </div>
                    ))}
                    <button type="button" className="vil-ch-add" onClick={() => set({ complications: [...draft.complications, { text: '', effect: 'wound', bookEffect: null }] })}>+ complication</button>
                </div>
            </div>

            <div className="vil-ch-block">
                <VilLabel>Dé d'obscurité</VilLabel>
                <div className="vil-ch-field"><span className="vtt-field-label">Quand</span>
                    <div className="vil-pills">{DARK_WHEN.map(w => (
                        <VilPill key={w.key} on={draft.dark.when === w.key}
                                 onClick={() => setDark({ when: w.key, fromBox: w.key === 'fromBox' ? (draft.dark.fromBox ?? Math.min(3, draft.track)) : null })}>{w.label}</VilPill>
                    ))}</div>
                </div>
                {draft.dark.when === 'fromBox' && (
                    <div className="vil-ch-field"><span className="vtt-field-label">À partir de la case</span>
                        <Stepper value={draft.dark.fromBox ?? 1} min={1} max={draft.track} label="Case" onChange={v => setDark({ fromBox: clamp(v, 1, draft.track) })} />
                    </div>
                )}
                {draft.dark.when !== 'none' && (
                    <>
                        <div className="vil-ch-field"><span className="vtt-field-label">Complication libre</span>
                            <div className="vil-pills">{THRESHOLDS.map(t => <VilPill key={String(t.value)} on={(draft.dark.threshold ?? null) === t.value} onClick={() => setDark({ threshold: t.value })}>{t.label}</VilPill>)}</div>
                        </div>
                        <div className="vil-ch-rows">
                            {draft.dark.rows.map((r, i) => (
                                <div key={i} className="vil-ch-line has-num">
                                    <input className="vtt-input vil-ch-num-in" type="number" min={1} max={12} value={r.min} aria-label="À partir de"
                                           onChange={e => setDarkRow(i, { min: clamp(Number(e.target.value) || 1, 1, 12) })} />
                                    <input className="vtt-input" value={r.text} placeholder="Effet à partir de ce résultat" onChange={e => setDarkRow(i, { text: e.target.value })} />
                                    <RemoveButton onClick={() => setDark({ rows: draft.dark.rows.filter((_, j) => j !== i) })} />
                                </div>
                            ))}
                            <button type="button" className="vil-ch-add" onClick={() => setDark({ rows: [...draft.dark.rows, { min: 6, text: '' }] })}>+ ligne du d12</button>
                        </div>
                    </>
                )}
            </div>

            <div className="vil-ch-block">
                <VilLabel>Règles</VilLabel>
                <div className="vil-ch-field"><span className="vtt-field-label">Règles spéciales</span>
                    <LineList values={draft.rules} addLabel="règle" onChange={v => set({ rules: v })} /></div>
                <div className="vil-ch-field"><span className="vtt-field-label">Règles de la famille</span>
                    <div className="vil-ch-rows">
                        {draft.familyRules.map((r, i) => (
                            <div key={i} className="vil-ch-line has-name">
                                <input className="vtt-input" value={r.name} placeholder="Nom" onChange={e => setRow('familyRules', i, { name: e.target.value })} />
                                <input className="vtt-input" value={r.text} onChange={e => setRow('familyRules', i, { text: e.target.value })} />
                                <RemoveButton onClick={() => dropRow('familyRules', i)} />
                            </div>
                        ))}
                        <button type="button" className="vil-ch-add" onClick={() => set({ familyRules: [...draft.familyRules, { name: '', text: '' }] })}>+ règle de famille</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VilChallengeForm;
