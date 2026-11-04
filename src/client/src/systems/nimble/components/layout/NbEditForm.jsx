// src/client/src/systems/nimble/components/layout/NbEditForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Mode Édition (spec_nimble.md §6.2) : corrections hors règles seulement —
// identité, origines, niveau, caractéristiques, sauvegardes, points de
// compétence, PV max, ajustements, langues, notes, maîtrise des armes.
// Les actions de jeu (jauges, inventaire, repos, niveau) restent hors édition.
// Props : draft, setDraft
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { STATS, SKILLS } from '../../config/basics.js';
import { CLASS_LIST } from '../../config/catalog.js';
import { ANCESTRIES, LANGUAGES } from '../../config/ancestries.js';
import { BACKGROUNDS } from '../../config/backgrounds.js';
import { NbPill, NbStepper, NbBlockTitle } from '../ui/NbUi.jsx';

const BONUSES = [
    { key: 'defense', label: 'Défense' }, { key: 'initiative', label: 'Initiative' }, { key: 'speed', label: 'Vitesse' },
    { key: 'maxWounds', label: 'Blessures max' }, { key: 'maxHitDice', label: 'Dés de vie max' }, { key: 'slots', label: 'Emplacements' },
    { key: 'hp', label: 'PV max (ajustement)' },
];

const Field = ({ label, children }) => <label className="block"><span className="vtt-field-label">{label}</span>{children}</label>;

const NbEditForm = ({ draft, setDraft }) => {
    const set = (patch) => setDraft(prev => ({ ...prev, ...patch }));
    const setIn = (field, key, value) => setDraft(prev => ({ ...prev, [field]: { ...(prev[field] ?? {}), [key]: value } }));
    const cls = CLASS_LIST.find(x => x.key === draft.classKey);
    const languages = draft.languages ?? [];
    return (
        <div className="nb-paper p-4 nb-fields nb-wizard">
            <section>
                <NbBlockTitle title="Identité" />
                <div className="nb-name-fields">
                    <Field label="Prénom"><input className="nb-input" value={draft.prenom ?? ''} onChange={e => set({ prenom: e.target.value })} /></Field>
                    <Field label="Nom"><input className="nb-input" value={draft.nom ?? ''} onChange={e => set({ nom: e.target.value })} /></Field>
                    <Field label="Joueur"><input className="nb-input" value={draft.playerName ?? ''} onChange={e => set({ playerName: e.target.value })} /></Field>
                    <Field label="Âge"><input className="nb-input" type="number" value={draft.age ?? ''} onChange={e => set({ age: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Taille (cm)"><input className="nb-input" type="number" value={draft.taille ?? ''} onChange={e => set({ taille: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Poids (kg)"><input className="nb-input" type="number" value={draft.poids ?? ''} onChange={e => set({ poids: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                </div>
                <div className="mt-3"><Field label="Motivation"><input className="nb-input" value={draft.motivation ?? ''} onChange={e => set({ motivation: e.target.value })} /></Field></div>
            </section>

            <section>
                <NbBlockTitle title="Origines et niveau" />
                <div className="nb-fields">
                    <div className="nb-field-row"><b>Classe</b><span className="nb-pills">{CLASS_LIST.map(x => <NbPill key={x.key} on={draft.classKey === x.key} onClick={() => set({ classKey: x.key, subclassKey: null })}>{x.name}</NbPill>)}</span></div>
                    {cls && <div className="nb-field-row"><b>Sous-classe</b><span className="nb-pills">
                        <NbPill on={!draft.subclassKey} onClick={() => set({ subclassKey: null })}>Aucune</NbPill>
                        {cls.subclasses.map(s => <NbPill key={s.key} on={draft.subclassKey === s.key} onClick={() => set({ subclassKey: s.key })}>{s.name}</NbPill>)}
                    </span></div>}
                    <div className="nb-field-row"><b>Ascendance</b><span className="nb-pills">{ANCESTRIES.map(a => <NbPill key={a.key} on={draft.ancestryKey === a.key} onClick={() => set({ ancestryKey: a.key })}>{a.name}</NbPill>)}</span></div>
                    <div className="nb-field-row"><b>Historique</b><span className="nb-pills">{BACKGROUNDS.map(b => <NbPill key={b.key} on={draft.backgroundKey === b.key} onClick={() => set({ backgroundKey: b.key })}>{b.name}</NbPill>)}</span></div>
                    <div className="nb-field-row"><b>Niveau</b><NbStepper value={Number(draft.level ?? 1)} onChange={v => set({ level: v })} min={1} max={20} label="Niveau" /></div>
                    <div className="nb-field-row"><b>PV max tirés</b><NbStepper value={Number(draft.hpMax ?? 0)} onChange={v => set({ hpMax: v })} min={1} max={400} label="PV max" /></div>
                </div>
            </section>

            <section>
                <NbBlockTitle title="Caractéristiques et sauvegardes" />
                <div className="nb-fields">
                    {STATS.map(s => (
                        <div key={s.key} className="nb-field-row">
                            <b>{s.name}</b>
                            <span className="flex items-center gap-3 flex-wrap">
                                <NbStepper value={Number(draft[s.field] ?? 0)} onChange={v => set({ [s.field]: v })} min={-5} max={10} signedValue label={s.name} />
                                <span className="nb-pills">
                                    {[{ v: 1, l: '▲ avantagée' }, { v: 0, l: 'neutre' }, { v: -1, l: '▼ désavantagée' }].map(o => (
                                        <NbPill key={o.v} on={Number(draft.saves?.[s.key] ?? 0) === o.v} onClick={() => setIn('saves', s.key, o.v)}>{o.l}</NbPill>
                                    ))}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <NbBlockTitle title="Points de compétence (au-delà de la caractéristique)" />
                <div className="nb-grid-2">
                    {SKILLS.map(s => (
                        <div key={s.key} className="nb-field-row"><b>{s.label}</b>
                            <NbStepper value={Number(draft.skillPoints?.[s.key] ?? 0)} onChange={v => setIn('skillPoints', s.key, v)} min={-5} max={12} signedValue label={s.label} />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <NbBlockTitle title="Ajustements" />
                <div className="nb-grid-2">
                    {BONUSES.map(b => (
                        <div key={b.key} className="nb-field-row"><b>{b.label}</b>
                            <NbStepper value={Number(draft.bonuses?.[b.key] ?? 0)} onChange={v => setIn('bonuses', b.key, v)} min={-20} max={50} signedValue label={b.label} />
                        </div>
                    ))}
                    <div className="nb-field-row"><b>Dé de vie forcé</b><span className="nb-pills">
                        {[0, 4, 6, 8, 10, 12, 20].map(v => <NbPill key={v} on={Number(draft.bonuses?.hitDie ?? 0) === v} onClick={() => setIn('bonuses', 'hitDie', v)}>{v ? `d${v}` : 'Classe'}</NbPill>)}
                    </span></div>
                </div>
            </section>

            <section>
                <NbBlockTitle title="Langues" />
                <div className="nb-pills">
                    {LANGUAGES.map(l => (
                        <NbPill key={l.key} on={languages.includes(l.key)}
                                onClick={() => set({ languages: languages.includes(l.key) ? languages.filter(k => k !== l.key) : [...languages, l.key] })}>{l.name}</NbPill>
                    ))}
                </div>
            </section>

            {(draft.items ?? []).some(it => it.kind === 'weapon') && (
                <section>
                    <NbBlockTitle title="Maîtrise des armes" />
                    {(draft.items ?? []).filter(it => it.kind === 'weapon').map(it => (
                        <div key={it.id} className="nb-field-row"><b>{it.name}</b><span className="nb-pills">
                            {[{ v: null, l: 'Selon la classe' }, { v: true, l: 'Maîtrisée' }, { v: false, l: 'Non maîtrisée' }].map(o => (
                                <NbPill key={String(o.v)} on={(it.proficient ?? null) === o.v}
                                        onClick={() => set({ items: draft.items.map(x => (x.id === it.id ? { ...x, proficient: o.v } : x)) })}>{o.l}</NbPill>
                            ))}
                        </span></div>
                    ))}
                </section>
            )}

            <section>
                <NbBlockTitle title="Notes" />
                <textarea className="nb-textarea" rows={6} value={draft.notes ?? ''} onChange={e => set({ notes: e.target.value })} />
            </section>
        </div>
    );
};

export default NbEditForm;
