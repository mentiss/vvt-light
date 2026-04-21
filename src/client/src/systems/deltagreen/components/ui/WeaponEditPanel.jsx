// src/client/src/systems/deltagreen/components/layout/WeaponEditPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panel d'édition d'une arme (overlay droit).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {BASE_SKILLS, resolveSkillRef} from '../../config.jsx';

const CARAC_KEYS   = ['str', 'con', 'dex', 'int', 'pow', 'cha'];
const CARAC_LABELS = { str: 'FOR', con: 'CON', dex: 'DEX', int: 'INT', pow: 'POU', cha: 'CHA' };

const Field = ({ label, children }) => (
    <div>
        <label className="dg-section-label text-[9px] block mb-1 tracking-widest">{label}</label>
        {children}
    </div>
);

const PillBtn = ({ pKey, label, score, activeRef, onToggle }) => (
    <button
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

const WeaponEditPanel = ({ slot, weapon, char, onSave, onDelete, onClose }) => {
    const d = weapon?.jsonDetails ?? {};

    const [name,         setName]         = useState(weapon?.name            ?? '');
    const [skillRef,     setSkillRef]     = useState(d.skill_ref             ?? '');
    const [range,        setRange]        = useState(d.range                 ?? '');
    const [damage,       setDamage]       = useState(d.damage                ?? '');
    const [armorPiercing,setArmorPiercing]= useState(d.armor_piercing        ?? '');
    const [lethality,    setLethality]    = useState(d.lethality != null ? String(d.lethality) : '');
    const [ammoCapacity, setAmmoCapacity] = useState(d.ammo_capacity != null ? String(d.ammo_capacity) : '');
    const [ammoCurrent,  setAmmoCurrent]  = useState(d.ammo_current  != null ? String(d.ammo_current)  : '');
    const [notes,        setNotes]        = useState(weapon?.notes           ?? '');
    const [confirmDel,   setConfirmDel]   = useState(false);

    const resolved = skillRef ? resolveSkillRef(char, skillRef) : null;

    const handleSave = () => {
        const capNum = ammoCapacity !== '' ? Number(ammoCapacity) : null;
        const curNum = ammoCurrent  !== '' ? Number(ammoCurrent)  : capNum;
        onSave({
            name,
            notes,
            jsonDetails: {
                skill_ref:     skillRef      || null,
                range:         range         || null,
                damage:        damage        || null,
                armor_piercing: armorPiercing || null,
                lethality:     lethality !== '' ? Number(String(lethality).replace('%', '')) : null,
                ammo_capacity: capNum,
                ammo_current:  curNum,
            },
        });
    };

    // ── Pills ──────────────────────────────────────────────────────────────────
    const statPills = CARAC_KEYS.map(k => ({
        key: k,
        label: `${CARAC_LABELS[k]}×5`,
        score: (char[k] ?? 10) * 5,
    }));

    const skillPills = (char.skills ?? [])
        .filter(s => s.score > 0)
        .map(s => {
            const base = BASE_SKILLS.find(b => b.key === s.skillKey);
            return { key: s.skillKey, label: base?.label ?? s.skillKey, score: s.score };
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));


    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Fond */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            {/* Panel */}
            <div
                className="fixed inset-y-0 right-0 w-80 bg-default border-l border-default shadow-2xl z-50 flex flex-col"
                style={{ fontFamily: 'var(--dg-font-body)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="dg-header px-4 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-black uppercase tracking-widest text-white truncate">
                        {weapon ? `Slot (${slot}) — ${weapon.name || 'Arme'}` : `Slot (${slot}) — Nouvelle arme`}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0 ml-2">✕</button>
                </div>

                {/* Corps scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    <Field label="NOM DE L'ARME">
                        <input
                            className="dg-field-input w-full px-2 py-1 text-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex : Glock 17"
                        />
                    </Field>

                    <Field label="COMPÉTENCE / STATISTIQUE">
                        {/* Stats */}
                        <div className="flex flex-wrap gap-1 mb-1.5">
                            {statPills.map(p => <PillBtn key={p.key} pKey={p.key} label={p.label} score={p.score} activeRef={skillRef} onToggle={(k) => setSkillRef(skillRef === k ? '' : k)} />)}
                        </div>
                        {/* Skills du perso */}
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto border border-default/20 p-1">
                            {skillPills.map(p => <PillBtn key={p.key} pKey={p.key} label={p.label} score={p.score} activeRef={skillRef} onToggle={(k) => setSkillRef(skillRef === k ? '' : k)} />)}
                        </div>
                        {/* Résolution live */}
                        {resolved && (
                            <p className="text-[10px] font-mono text-muted mt-1">
                                → <span className="text-default font-bold">{resolved.label}</span> : {resolved.score}%
                            </p>
                        )}
                    </Field>

                    <Field label="PORTÉE">
                        <input
                            className="dg-field-input w-full px-2 py-1 text-sm"
                            value={range}
                            onChange={e => setRange(e.target.value)}
                            placeholder="Ex : 15 m."
                        />
                    </Field>

                    <Field label="DÉGÂTS">
                        <input
                            className="dg-field-input w-full px-2 py-1 text-sm"
                            value={damage}
                            onChange={e => setDamage(e.target.value)}
                            placeholder="Ex : 1D10, 2D6, 1D4-1"
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="PERFORATION">
                            <input
                                className="dg-field-input w-full px-2 py-1 text-sm"
                                value={armorPiercing}
                                onChange={e => setArmorPiercing(e.target.value)}
                                placeholder="Ex : 3"
                            />
                        </Field>
                        <Field label="LÉTALITÉ">
                            <input
                                className="dg-field-input w-full px-2 py-1 text-sm"
                                value={lethality}
                                onChange={e => setLethality(e.target.value)}
                                placeholder="Ex : 10%"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="CAPACITÉ CHARGEUR">
                            <input
                                type="number" min={0}
                                className="dg-field-input w-full px-2 py-1 text-sm text-center"
                                value={ammoCapacity}
                                onChange={e => setAmmoCapacity(e.target.value)}
                                placeholder="—"
                            />
                        </Field>
                        <Field label="MUNITIONS ACTUELLES">
                            <input
                                type="number" min={0}
                                className="dg-field-input w-full px-2 py-1 text-sm text-center"
                                value={ammoCurrent}
                                onChange={e => setAmmoCurrent(e.target.value)}
                                placeholder="—"
                            />
                        </Field>
                    </div>

                    <Field label="NOTES">
                        <textarea
                            className="dg-field-input w-full px-2 py-1 text-sm resize-none min-h-[3.5rem]"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Restrictions, munitions spéciales…"
                        />
                    </Field>
                </div>

                {/* Footer actions */}
                <div className="shrink-0 border-t border-default p-4 space-y-2">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 border border-default text-muted font-mono text-xs hover:bg-surface-alt transition-colors"
                        >Annuler</button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2 dg-header text-white font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >Sauvegarder</button>
                    </div>

                    {weapon && !confirmDel && (
                        <button
                            onClick={() => setConfirmDel(true)}
                            className="w-full py-1.5 border border-danger/40 text-danger font-mono text-xs hover:bg-danger/10 transition-colors"
                        >Supprimer cette arme</button>
                    )}
                    {confirmDel && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmDel(false)}
                                className="flex-1 py-1.5 border border-default text-muted font-mono text-xs"
                            >Annuler</button>
                            <button
                                onClick={onDelete}
                                className="flex-1 py-1.5 bg-danger text-white font-mono text-xs font-bold"
                            >Confirmer</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WeaponEditPanel;