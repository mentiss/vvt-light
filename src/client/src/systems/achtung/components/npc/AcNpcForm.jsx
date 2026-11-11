// src/client/src/systems/achtung/components/npc/AcNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ d'Achtung! Cthulhu (spec_pnj.md §10.4), posé par la
// brique NpcForm (props { value, onChange }) : rang (barème du livre rappelé), qualité d'un Figurant,
// vérités, attributs, compétences (rang, focus), Stress (vide : barème), blessures (vide : rang),
// Armure, Courage, attaques, règles spéciales, dépenses de Menace.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcItemList from '@/features/npc/NpcItemList.jsx';
import { ATTRIBUTES, SKILLS } from '../../config/base.js';
import { NPC_QUALITIES, NPC_RANKS, RANK_RULES, rankStress, skillLabel } from '../../config/npc.js';

const RANGES = { contact: 'Contact', close: 'Courte', medium: 'Moyenne', long: 'Longue', extreme: 'Extrême' };
const SKILL_KEY = Object.fromEntries(SKILLS.map(s => [s.label, s.key]));
const num = (v) => (v === '' ? null : Number(v));
const split = (text) => String(text ?? '').split(',').map(s => s.trim()).filter(Boolean);

const NumField = ({ label, value, onChange, placeholder }) => (
    <label className="ac-npc-field">
        <span className="ac-label">{label}</span>
        <input className="ac-input-num" type="number" min="0" value={value ?? ''} placeholder={placeholder} onChange={e => onChange(num(e.target.value))} />
    </label>
);

const AcNpcForm = ({ value, onChange }) => {
    const sd = value;
    const set = (patch) => onChange({ ...sd, ...patch });
    const rule = RANK_RULES[sd.rank];
    const attrTotal = ATTRIBUTES.reduce((s, a) => s + Number(sd.attributes?.[a.key] ?? 0), 0);
    const skillTotal = (sd.skills ?? []).reduce((s, k) => s + Number(k.rank ?? 0), 0);
    // Vérités et lignes de compétences : texte saisi gardé ici (une virgule sépare, la saisie n'est pas
    // reformatée en cours de frappe) ; compétence : nom du jeu reconnu (clé). Formulaire remonté par fiche.
    const [truths, setTruths] = useState(() => (sd.truths ?? []).join(', '));
    const [skillRows, setSkillRows] = useState(() => (sd.skills ?? []).map(s => ({ ...s, name: skillLabel(s.key), focusText: (s.focuses ?? []).join(', ') })));
    const setSkills = (rows) => {
        setSkillRows(rows);
        set({ skills: rows.filter(r => String(r.name).trim())
            .map(({ name, focusText, ...s }) => ({ ...s, key: SKILL_KEY[name] ?? name.trim(), focuses: split(focusText) })) });
    };

    return (
        <div className="ac-npc-form">
            <div className="ac-npc-pills">
                {Object.entries(NPC_RANKS).map(([k, l]) => (
                    <button key={k} type="button" className={`vtt-pill${sd.rank === k ? ' is-selected' : ''}`} onClick={() => set({ rank: k })}>{l}</button>
                ))}
            </div>
            {rule && <p className="ac-npc-muted">Barème du livre : attributs {rule.attributes} (ici {attrTotal}), compétences {rule.skills} (ici {skillTotal}), vaincu à {rule.injuries} blessure{rule.injuries > 1 ? 's' : ''}.</p>}

            {sd.rank === 'incidental' ? (
                <div className="ac-npc-pills">
                    {Object.entries(NPC_QUALITIES).map(([k, q]) => (
                        <button key={k} type="button" className={`vtt-pill${sd.quality === k ? ' is-selected' : ''}`} onClick={() => set({ quality: k })}>
                            {q.label} (cible {q.target})
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="ac-npc-values">
                        {ATTRIBUTES.map(a => (
                            <NumField key={a.key} label={a.label} value={sd.attributes?.[a.key]} onChange={v => set({ attributes: { ...(sd.attributes ?? {}), [a.key]: v ?? 0 } })} />
                        ))}
                    </div>
                    <span className="ac-label">Compétences</span>
                    <NpcItemList items={skillRows} onChange={setSkills} addLabel="+ Compétence" newItem={() => ({ name: '', rank: 1, focusText: '' })}
                                 fields={[{ key: 'name', placeholder: 'Compétence', list: SKILLS.map(s => s.label) },
                                          { key: 'rank', placeholder: 'Rang', type: 'number', narrow: true },
                                          { key: 'focusText', placeholder: 'Focus (virgules)' }]} />
                    <div className="ac-npc-values">
                        <NumField label="Stress" value={sd.stress} placeholder={String(rankStress(sd))} onChange={v => set({ stress: v })} />
                        <NumField label="Blessures" value={sd.injuries} placeholder={String(rule?.injuries ?? '')} onChange={v => set({ injuries: v })} />
                    </div>
                </>
            )}
            <div className="ac-npc-values">
                <NumField label="Armure" value={sd.armour} onChange={v => set({ armour: v ?? 0 })} />
                <NumField label="Courage" value={sd.courage} onChange={v => set({ courage: v ?? 0 })} />
            </div>
            <label className="ac-npc-field is-wide">
                <span className="ac-label">Vérités (séparées par des virgules)</span>
                <input className="ac-input" value={truths} onChange={e => { setTruths(e.target.value); set({ truths: split(e.target.value) }); }} />
            </label>

            <span className="ac-label">Attaques</span>
            <NpcItemList items={sd.attacks ?? []} onChange={attacks => set({ attacks })} addLabel="+ Attaque"
                         newItem={() => ({ name: '', focus: '', range: 'close', damage: 3, salvo: '', qualities: '' })}
                         fields={[{ key: 'name', placeholder: 'Arme' }, { key: 'focus', placeholder: 'Focus' },
                                  { key: 'damage', placeholder: 'Dégâts', type: 'number', narrow: true },
                                  { key: 'salvo', placeholder: 'Salve' }, { key: 'qualities', placeholder: 'Qualités' },
                                  { key: 'range', options: RANGES }]} />
            <span className="ac-label">Règles spéciales</span>
            <NpcItemList items={sd.abilities ?? []} onChange={abilities => set({ abilities })} addLabel="+ Règle"
                         newItem={() => ({ name: '', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Nom' }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
            <span className="ac-label">Dépenses de Menace</span>
            <NpcItemList items={sd.threatSpends ?? []} onChange={threatSpends => set({ threatSpends })} addLabel="+ Dépense"
                         newItem={() => ({ name: '', cost: '', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Nom' }, { key: 'cost', placeholder: 'Coût', narrow: true },
                                  { key: 'text', placeholder: 'Effet', multiline: true }]} />
        </div>
    );
};

export default AcNpcForm;
