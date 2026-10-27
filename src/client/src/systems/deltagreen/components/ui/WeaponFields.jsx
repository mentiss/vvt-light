// src/client/src/systems/deltagreen/components/ui/WeaponFields.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Champs d'une arme (section 17), contrôlés, partagés par l'onglet « Objet
// libre » du catalogue d'armement et par la modale d'édition d'un emplacement
// (spec_ui_catalogue.md D-14). Compétence / statistique choisie parmi celles
// du personnage (score résolu en direct). weaponToDraft / draftToWeapon font
// la conversion avec la forme enregistrée (jsonDetails).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { BASE_SKILLS, resolveSkillRef } from '../../config.jsx';
import { Field } from './EquipmentFields.jsx';

const CARAC_KEYS   = ['str', 'con', 'dex', 'int', 'pow', 'cha'];
const CARAC_LABELS = { str: 'FOR', con: 'CON', dex: 'DEX', int: 'INT', pow: 'POU', cha: 'CHA' };

const SkillPill = ({ pKey, label, score, activeRef, onToggle }) => (
    <button
        type="button"
        onClick={() => onToggle(pKey)}
        className={[
            'px-2 py-0.5 text-[10px] font-mono border transition-colors whitespace-nowrap',
            activeRef === pKey
                ? 'border-accent text-accent bg-accent/10'
                : 'border-default text-muted hover:border-default hover:text-default',
        ].join(' ')}
    >
        {label}&nbsp;{score}%
    </button>
);

const TextInput = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
    <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        className={`dg-field-input w-full px-2 py-1 text-sm ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
    />
);

// ── Conversions ───────────────────────────────────────────────────────────────

/** Arme enregistrée (ou rien) → brouillon à plat. */
export const weaponToDraft = (weapon = {}) => {
    const d = weapon.jsonDetails ?? {};
    return {
        name:          weapon.name ?? '',
        skillRef:      d.skill_ref ?? '',
        range:         d.range ?? '',
        damage:        d.damage ?? '',
        armorPiercing: d.armor_piercing ?? '',
        lethality:     d.lethality != null ? String(d.lethality) : '',
        ammoCapacity:  d.ammo_capacity != null ? String(d.ammo_capacity) : '',
        ammoCurrent:   d.ammo_current != null ? String(d.ammo_current) : '',
        notes:         weapon.notes ?? '',
    };
};

/** Brouillon → { name, notes, jsonDetails } ; munitions actuelles = capacité si vide. */
export const draftToWeapon = (f) => {
    const capNum = f.ammoCapacity !== '' ? Number(f.ammoCapacity) : null;
    const curNum = f.ammoCurrent !== '' ? Number(f.ammoCurrent) : capNum;
    return {
        name:  f.name.trim(),
        notes: f.notes,
        jsonDetails: {
            skill_ref:      f.skillRef || null,
            range:          f.range || null,
            damage:         f.damage || null,
            armor_piercing: f.armorPiercing || null,
            lethality:      f.lethality !== '' ? Number(String(f.lethality).replace('%', '')) : null,
            ammo_capacity:  capNum,
            ammo_current:   curNum,
        },
    };
};

// ── Champs ────────────────────────────────────────────────────────────────────

/**
 * @param {object}   props.value     brouillon (weaponToDraft)
 * @param {Function} props.onChange  (patch) => void
 * @param {object}   props.char      personnage (compétences et caractéristiques proposées)
 */
const WeaponFields = ({ value: f, onChange, char }) => {
    const set = (key) => (v) => onChange({ [key]: v });
    const toggleSkill = (k) => onChange({ skillRef: f.skillRef === k ? '' : k });
    const resolved = f.skillRef ? resolveSkillRef(char, f.skillRef) : null;

    const statPills = CARAC_KEYS.map(k => ({ key: k, label: `${CARAC_LABELS[k]}×5`, score: (char[k] ?? 10) * 5 }));
    const skillPills = (char.skills ?? [])
        .filter(s => s.score > 0)
        .map(s => ({ key: s.skillKey, label: BASE_SKILLS.find(b => b.key === s.skillKey)?.label ?? s.skillKey, score: s.score }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

    return (
        <div className="space-y-4">
            <Field label="NOM DE L'ARME">
                <TextInput value={f.name} onChange={set('name')} placeholder="Ex : Glock 17" />
            </Field>

            <Field label="COMPÉTENCE / STATISTIQUE">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {statPills.map(p => <SkillPill key={p.key} pKey={p.key} label={p.label} score={p.score} activeRef={f.skillRef} onToggle={toggleSkill} />)}
                </div>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto border border-default/20 p-1">
                    {skillPills.map(p => <SkillPill key={p.key} pKey={p.key} label={p.label} score={p.score} activeRef={f.skillRef} onToggle={toggleSkill} />)}
                </div>
                {resolved && (
                    <p className="text-[10px] font-mono text-muted mt-1">
                        → <span className="text-default font-bold">{resolved.label}</span> : {resolved.score}%
                    </p>
                )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="PORTÉE">
                    <TextInput value={f.range} onChange={set('range')} placeholder="Ex : 15 m." />
                </Field>
                <Field label="DÉGÂTS">
                    <TextInput value={f.damage} onChange={set('damage')} placeholder="Ex : 1D10, 2D6, 1D4-1" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field label="PERFORATION">
                    <TextInput value={f.armorPiercing} onChange={set('armorPiercing')} placeholder="Ex : 3" />
                </Field>
                <Field label="LÉTALITÉ">
                    <TextInput value={f.lethality} onChange={set('lethality')} placeholder="Ex : 10%" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field label="CAPACITÉ CHARGEUR">
                    <TextInput type="number" value={f.ammoCapacity} onChange={set('ammoCapacity')} placeholder="—" className="text-center" />
                </Field>
                <Field label="MUNITIONS ACTUELLES">
                    <TextInput type="number" value={f.ammoCurrent} onChange={set('ammoCurrent')} placeholder="—" className="text-center" />
                </Field>
            </div>

            <Field label="NOTES">
                <textarea
                    className="dg-field-input w-full px-2 py-1 text-sm resize-none min-h-[3.5rem]"
                    value={f.notes}
                    onChange={e => onChange({ notes: e.target.value })}
                    placeholder="Restrictions, munitions spéciales…"
                />
            </Field>
        </div>
    );
};

export default WeaponFields;
