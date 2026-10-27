// src/client/src/systems/deltagreen/components/ui/EquipmentFields.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Champs d'un équipement (section 16), contrôlés, partagés par l'onglet
// « Objet libre » du catalogue et par la modale d'édition d'un équipement
// (spec_ui_catalogue.md D-14). Le brouillon est à plat (valeurs saisies en
// texte) ; equipmentToDraft / draftToEquipment font la conversion avec la
// forme enregistrée (jsonDetails selon la catégorie).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_CATEGORY_ORDER } from '../../config.jsx';

export const EXPENSE_OPTIONS = ['Incidental', 'Standard', 'Unusual', 'Major', 'Extreme'];

const VEHICLES = ['vehicle_ground', 'vehicle_water', 'vehicle_air'];

// ── Sous-composants niveau module ─────────────────────────────────────────────

export const Field = ({ label, children }) => (
    <div>
        <label className="dg-section-label text-[9px] block mb-1 tracking-widest">{label}</label>
        {children}
    </div>
);

export const PillBtn = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={[
            'px-2 py-0.5 text-[10px] font-mono border transition-colors whitespace-nowrap',
            active
                ? 'border-accent text-accent bg-accent/10'
                : 'border-default text-muted hover:border-default hover:text-default',
        ].join(' ')}
    >{children}</button>
);

const TextInput = ({ value, onChange, placeholder, type = 'text', className = 'w-full' }) => (
    <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        className={`dg-field-input px-2 py-1 text-sm ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
    />
);

// ── Conversions ───────────────────────────────────────────────────────────────

/** Équipement enregistré (ou rien) → brouillon à plat. */
export const equipmentToDraft = (item = {}) => {
    const d = item.jsonDetails ?? {};
    return {
        name:         item.name ?? '',
        notes:        item.notes ?? '',
        category:     item.category ?? 'misc',
        expense:      item.expense ?? 'Standard',
        isRestricted: item.isRestricted ?? false,
        quantity:     item.quantity ?? 1,
        rating:       d.rating != null ? String(d.rating) : '',
        hp:           d.hp != null ? String(d.hp) : '',
        armorRating:  d.armor_rating != null ? String(d.armor_rating) : '',
        speed:        d.speed ?? '',
        bonus:        d.bonus ?? '',
    };
};

/** Brouillon → champs enregistrés (sans id ni slot ni restrictionNote). */
export const draftToEquipment = (f) => {
    const jsonDetails = {};
    if (f.category === 'armor' || f.category === 'medical') {
        if (f.rating !== '') jsonDetails.rating = Number(f.rating);
    }
    if (f.category === 'vehicle_ground' || f.category === 'vehicle_water') {
        if (f.hp !== '') jsonDetails.hp = f.hp;
        if (f.armorRating !== '') jsonDetails.armor_rating = Number(f.armorRating);
        if (f.speed) jsonDetails.speed = f.speed;
    }
    if (f.category === 'vehicle_air') {
        if (f.armorRating !== '') jsonDetails.armor_rating = Number(f.armorRating);
        if (f.speed) jsonDetails.speed = f.speed;
    }
    if (f.category === 'weapon_accessory' && f.bonus) jsonDetails.bonus = f.bonus;
    return {
        name:         f.name.trim(),
        notes:        f.notes,
        category:     f.category,
        expense:      f.expense,
        isRestricted: f.isRestricted,
        quantity:     VEHICLES.includes(f.category) ? 1 : Math.max(1, Number(f.quantity) || 1),
        jsonDetails,
    };
};

// ── Champs ────────────────────────────────────────────────────────────────────

/**
 * @param {object}   props.value     brouillon (equipmentToDraft)
 * @param {Function} props.onChange  (patch) => void
 */
const EquipmentFields = ({ value: f, onChange }) => {
    const set = (key) => (v) => onChange({ [key]: v });
    const isVehicle = VEHICLES.includes(f.category);

    return (
        <div className="space-y-4">
            <Field label="NOM">
                <TextInput value={f.name} onChange={set('name')} placeholder="Désignation de l'équipement" />
            </Field>

            <Field label="NOTES / DESCRIPTION COURTE">
                <TextInput value={f.notes} onChange={set('notes')} placeholder="Restriction, usage, bonus…" />
            </Field>

            <Field label="CATÉGORIE">
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border border-default/20 p-1">
                    {EQUIPMENT_CATEGORY_ORDER.map(k => (
                        <PillBtn key={k} active={f.category === k} onClick={() => onChange({ category: k })}>
                            {EQUIPMENT_CATEGORY_LABELS[k]}
                        </PillBtn>
                    ))}
                </div>
            </Field>

            <Field label="COÛT">
                <div className="flex flex-wrap gap-1">
                    {EXPENSE_OPTIONS.map(e => (
                        <PillBtn key={e} active={f.expense === e} onClick={() => onChange({ expense: e })}>{e}</PillBtn>
                    ))}
                </div>
            </Field>

            <div className="flex flex-wrap items-end gap-4">
                {/* Quantité — masquée pour les véhicules */}
                {!isVehicle && (
                    <Field label="QUANTITÉ">
                        <input
                            type="number" min={1}
                            className="dg-field-input w-24 px-2 py-1 text-sm text-center"
                            value={f.quantity}
                            onChange={e => onChange({ quantity: Math.max(1, Number(e.target.value) || 1) })}
                        />
                    </Field>
                )}
                <PillBtn active={f.isRestricted} onClick={() => onChange({ isRestricted: !f.isRestricted })}>
                    {f.isRestricted ? '✓ ' : ''}Accès restreint
                </PillBtn>
            </div>

            {/* ── Champs propres à la catégorie ─────────────────────────── */}

            {f.category === 'armor' && (
                <Field label="RATING D'ARMURE">
                    <TextInput type="number" value={f.rating} onChange={set('rating')} placeholder="Ex : 3" className="w-24 text-center" />
                </Field>
            )}

            {(f.category === 'vehicle_ground' || f.category === 'vehicle_water') && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="HP">
                            <TextInput value={f.hp} onChange={set('hp')} placeholder="Ex : 30" className="w-full text-center" />
                        </Field>
                        <Field label="ARMURE">
                            <TextInput type="number" value={f.armorRating} onChange={set('armorRating')} placeholder="Ex : 3" className="w-full text-center" />
                        </Field>
                    </div>
                    <Field label="VITESSE">
                        <TextInput value={f.speed} onChange={set('speed')} placeholder="Lente / Moyenne / Rapide" />
                    </Field>
                </div>
            )}

            {f.category === 'vehicle_air' && (
                <div className="space-y-3">
                    <Field label="ARMURE">
                        <TextInput type="number" value={f.armorRating} onChange={set('armorRating')} placeholder="Ex : 10" className="w-full text-center" />
                    </Field>
                    <Field label="VITESSE">
                        <TextInput value={f.speed} onChange={set('speed')} placeholder="Moyenne / Rapide / Spéciale" />
                    </Field>
                </div>
            )}

            {f.category === 'weapon_accessory' && (
                <Field label="BONUS / EFFET">
                    <TextInput value={f.bonus} onChange={set('bonus')} placeholder="Ex : +20% à toucher" />
                </Field>
            )}
        </div>
    );
};

export default EquipmentFields;
