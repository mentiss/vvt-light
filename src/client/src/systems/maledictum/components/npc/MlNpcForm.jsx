// src/client/src/systems/maledictum/components/npc/MlNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ d'Imperium Maledictum (spec_pnj.md §8),
// posé par la brique NpcForm (props { value, onChange }) : rôle (Troupe, Élite,
// Meneur), caractéristiques, Armure, Blessures, Initiative, Détermination, Seuil
// Warp, vitesse, compétences, attaques, traits, possessions.
// Même format que le bestiaire (config/bestiary.js) ; une compétence ajoutée ici
// porte son libellé tel quel (pas de clé du catalogue).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcItemList from '@/features/npc/NpcItemList.jsx';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import { ROLE_LABELS } from '../../config/rules/npc.js';
import { Field, Pill, Pills } from '../ui/MlUi.jsx';
import { specName, RANGE_LABELS } from '../layout/MlSections.jsx';

const SPEEDS = { slow: 'Lente', normal: 'Normale', fast: 'Rapide' };
const num = (v) => (v === '' ? null : Number(v) || 0);

const MlNpcForm = ({ value, onChange }) => {
    const p = value;
    const set = (patch) => onChange({ ...p, ...patch });
    // Compétences : objet { clé ou libellé: valeur } édité en lignes { key, name, value } gardées ici
    // (une ligne au nom vide reste affichée sans être enregistrée) ; formulaire remonté par fiche (key de NpcForm)
    const [skills, setSkillRows] = useState(() => Object.entries(p.skills ?? {}).map(([k, v]) => ({ key: k, name: specName(k), value: v })));
    const setSkills = (rows) => {
        setSkillRows(rows);
        set({ skills: Object.fromEntries(rows.filter(r => String(r.name).trim())
            .map(r => [r.key && r.name === specName(r.key) ? r.key : String(r.name).trim(), r.value ?? 0])) });
    };

    return (
        <div className="im-fields">
            <Pills>
                {Object.entries(ROLE_LABELS).map(([k, l]) => <Pill key={k} on={p.role === k} onClick={() => set({ role: k })}>{l}</Pill>)}
            </Pills>
            <div className="im-npc-chars">
                {CHAR_KEYS.map(k => (
                    <label key={k} className="im-npc-char">
                        <b>{CHAR_SHORT[k]}</b>
                        <input className="vtt-input is-num" type="number" min="0" aria-label={CHAR_SHORT[k]} value={p.chars?.[k] ?? ''}
                               onChange={e => set({ chars: { ...(p.chars ?? {}), [k]: num(e.target.value) } })} />
                    </label>
                ))}
            </div>
            <div className="im-npc-form-grid">
                {[['armour', 'Armure'], ['wounds', 'Blessures'], ['initiative', 'Initiative'], ['resolve', 'Détermination'], ['warpThreshold', 'Seuil Warp']].map(([k, l]) => (
                    <Field key={k} label={l}>
                        <input className="vtt-input" type="number" min="0" value={p[k] ?? ''} onChange={e => set({ [k]: num(e.target.value) })} />
                    </Field>
                ))}
            </div>
            <Field label="Vitesse">
                <Pills>{Object.entries(SPEEDS).map(([k, l]) => <Pill key={k} on={p.speed === k} onClick={() => set({ speed: k })}>{l}</Pill>)}</Pills>
            </Field>

            <Field label="Compétences">
                <NpcItemList items={skills} onChange={setSkills} addLabel="+ Compétence" newItem={() => ({ key: '', name: '', value: 40 })}
                          fields={[{ key: 'name', placeholder: 'Compétence (spécialisation)' }, { key: 'value', placeholder: 'Valeur', type: 'number', narrow: true }]} />
            </Field>
            <Field label="Attaques">
                <NpcItemList items={p.attacks ?? []} onChange={attacks => set({ attacks })} addLabel="+ Attaque"
                          newItem={() => ({ label: '', value: 40, damage: '', range: null, traits: '' })}
                          fields={[{ key: 'label', placeholder: 'Nom' }, { key: 'value', placeholder: 'Valeur', type: 'number', narrow: true },
                                   { key: 'damage', placeholder: 'Dégâts (5 + DR)' },
                                   { key: 'range', options: RANGE_LABELS },
                                   { key: 'traits', placeholder: 'Traits', multiline: true }]} />
            </Field>
            <Field label="Traits">
                <NpcItemList items={p.traits ?? []} onChange={traits => set({ traits })} addLabel="+ Trait" newItem={() => ({ label: '', summary: '' })}
                          fields={[{ key: 'label', placeholder: 'Nom' }, { key: 'summary', placeholder: 'Effet', multiline: true }]} />
            </Field>
            <Field label="Possessions">
                <textarea className="vtt-input" rows={2} value={p.possessions ?? ''} onChange={e => set({ possessions: e.target.value || null })} />
            </Field>
        </div>
    );
};

export default MlNpcForm;
