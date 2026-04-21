// src/client/src/systems/deltagreen/components/layout/EquipmentEditPanel.jsx

import React, { useState } from 'react';
import {EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_CATEGORY_ORDER} from "../../config.jsx";

// ── Sous-composants niveau module ─────────────────────────────────────────────

const Field = ({ label, children }) => (
    <div>
        <label className="dg-section-label text-[9px] block mb-1 tracking-widest">{label}</label>
        {children}
    </div>
);

const PillBtn = ({ value, active, onClick, children }) => (
    <button
        onClick={() => onClick(value)}
        className={[
            'px-2 py-0.5 text-[10px] font-mono border transition-colors whitespace-nowrap',
            active
                ? 'border-accent text-accent bg-accent/10'
                : 'border-default text-muted hover:border-default hover:text-default',
        ].join(' ')}
    >{children}</button>
);

const EXPENSE_OPTIONS = ['Incidental', 'Standard', 'Unusual', 'Major', 'Extreme'];
const EXPENSE_LABELS_FULL = {
    Incidental: 'Incidental',
    Standard:   'Standard',
    Unusual:    'Unusual',
    Major:      'Major',
    Extreme:    'Extreme',
};

// ── Composant ─────────────────────────────────────────────────────────────────

const EquipmentEditPanel = ({ item, onSave, onDelete, onClose }) => {
    const isNew = !item?.id;
    const d     = item?.jsonDetails ?? {};

    const [name,        setName]        = useState(item?.name        ?? '');
    const [notes,       setNotes]       = useState(item?.notes       ?? '');
    const [category,    setCategory]    = useState(item?.category    ?? 'misc');
    const [expense,     setExpense]     = useState(item?.expense     ?? 'Standard');
    const [isRestricted,setIsRestricted]= useState(item?.isRestricted ?? false);
    const [quantity,    setQuantity]    = useState(item?.quantity     ?? 1);
    // Champs spécifiques
    const [rating,      setRating]      = useState(d.rating       != null ? String(d.rating)       : '');
    const [hp,          setHp]          = useState(d.hp            != null ? String(d.hp)           : '');
    const [armorRating, setArmorRating] = useState(d.armor_rating  != null ? String(d.armor_rating) : '');
    const [speed,       setSpeed]       = useState(d.speed         ?? '');
    const [bonus,       setBonus]       = useState(d.bonus         ?? '');
    const [confirmDel,  setConfirmDel]  = useState(false);

    const isVehicle = ['vehicle_ground', 'vehicle_water', 'vehicle_air'].includes(category);

    const buildJsonDetails = () => {
        const out = {};
        if (category === 'armor' || category === 'medical') {
            if (rating !== '') out.rating = Number(rating);
        }
        if (category === 'vehicle_ground' || category === 'vehicle_water') {
            if (hp !== '') out.hp = hp;
            if (armorRating !== '') out.armor_rating = Number(armorRating);
            if (speed) out.speed = speed;
        }
        if (category === 'vehicle_air') {
            if (armorRating !== '') out.armor_rating = Number(armorRating);
            if (speed) out.speed = speed;
        }
        if (category === 'weapon_accessory') {
            if (bonus) out.bonus = bonus;
        }
        return out;
    };

    const handleSave = () => {
        onSave({
            ...(item?.id ? { id: item.id } : {}),
            name,
            notes,
            category,
            expense,
            isRestricted,
            restrictionNote: item?.restrictionNote ?? '',
            quantity: isVehicle ? 1 : quantity,
            jsonDetails: buildJsonDetails(),
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            <div
                className="fixed inset-y-0 right-0 w-80 bg-default border-l border-default shadow-2xl z-50 flex flex-col"
                style={{ fontFamily: 'var(--dg-font-body)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="dg-header px-4 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-black uppercase tracking-widest text-white truncate">
                        {isNew ? 'Nouvel équipement' : (item.name || 'Équipement')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0 ml-2">✕</button>
                </div>

                {/* Corps */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    <Field label="NOM">
                        <input
                            className="dg-field-input w-full px-2 py-1 text-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Désignation de l'équipement"
                        />
                    </Field>

                    <Field label="NOTES / DESCRIPTION COURTE">
                        <input
                            className="dg-field-input w-full px-2 py-1 text-sm"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Restriction, usage, bonus…"
                        />
                    </Field>

                    <Field label="CATÉGORIE">
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border border-default/20 p-1">
                            {EQUIPMENT_CATEGORY_ORDER.map(k => (
                                <PillBtn key={k} value={k} active={category === k} onClick={setCategory}>
                                    {EQUIPMENT_CATEGORY_LABELS[k]}
                                </PillBtn>
                            ))}
                        </div>
                    </Field>

                    <Field label="COÛT">
                        <div className="flex flex-wrap gap-1">
                            {EXPENSE_OPTIONS.map(e => (
                                <PillBtn key={e} value={e} active={expense === e} onClick={setExpense}>
                                    {EXPENSE_LABELS_FULL[e]}
                                </PillBtn>
                            ))}
                        </div>
                    </Field>

                    {/* Quantité — masquée pour véhicules */}
                    {!isVehicle && (
                        <Field label="QUANTITÉ">
                            <input
                                type="number" min={1}
                                className="dg-field-input w-24 px-2 py-1 text-sm text-center"
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                            />
                        </Field>
                    )}

                    {/* Restreint */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="dg-checkbox"
                            checked={isRestricted}
                            onChange={e => setIsRestricted(e.target.checked)}
                        />
                        <span className="text-xs font-mono">Accès restreint</span>
                    </label>

                    {/* ── Champs spécifiques catégorie ─────────────────────── */}

                    {category === 'armor' && (
                        <Field label="RATING D'ARMURE">
                            <input
                                type="number" min={0}
                                className="dg-field-input w-24 px-2 py-1 text-sm text-center"
                                value={rating}
                                onChange={e => setRating(e.target.value)}
                                placeholder="Ex : 3"
                            />
                        </Field>
                    )}

                    {(category === 'vehicle_ground' || category === 'vehicle_water') && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="HP">
                                    <input
                                        className="dg-field-input w-full px-2 py-1 text-sm text-center"
                                        value={hp}
                                        onChange={e => setHp(e.target.value)}
                                        placeholder="Ex : 30"
                                    />
                                </Field>
                                <Field label="ARMURE">
                                    <input
                                        type="number" min={0}
                                        className="dg-field-input w-full px-2 py-1 text-sm text-center"
                                        value={armorRating}
                                        onChange={e => setArmorRating(e.target.value)}
                                        placeholder="Ex : 3"
                                    />
                                </Field>
                            </div>
                            <Field label="VITESSE">
                                <input
                                    className="dg-field-input w-full px-2 py-1 text-sm"
                                    value={speed}
                                    onChange={e => setSpeed(e.target.value)}
                                    placeholder="Lente / Moyenne / Rapide"
                                />
                            </Field>
                        </div>
                    )}

                    {category === 'vehicle_air' && (
                        <div className="space-y-3">
                            <Field label="ARMURE">
                                <input
                                    type="number" min={0}
                                    className="dg-field-input w-full px-2 py-1 text-sm text-center"
                                    value={armorRating}
                                    onChange={e => setArmorRating(e.target.value)}
                                    placeholder="Ex : 10"
                                />
                            </Field>
                            <Field label="VITESSE">
                                <input
                                    className="dg-field-input w-full px-2 py-1 text-sm"
                                    value={speed}
                                    onChange={e => setSpeed(e.target.value)}
                                    placeholder="Moyenne / Rapide / Spéciale"
                                />
                            </Field>
                        </div>
                    )}

                    {category === 'weapon_accessory' && (
                        <Field label="BONUS / EFFET">
                            <input
                                className="dg-field-input w-full px-2 py-1 text-sm"
                                value={bonus}
                                onChange={e => setBonus(e.target.value)}
                                placeholder="Ex : +20% à toucher"
                            />
                        </Field>
                    )}
                </div>

                {/* Footer */}
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

                    {!confirmDel && (
                        <button
                            onClick={() => setConfirmDel(true)}
                            className="w-full py-1.5 border border-danger/40 text-danger font-mono text-xs hover:bg-danger/10 transition-colors"
                        >Supprimer cet équipement</button>
                    )}
                    {confirmDel && (
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 border border-default text-muted font-mono text-xs">Annuler</button>
                            <button onClick={onDelete}                   className="flex-1 py-1.5 bg-danger text-white font-mono text-xs font-bold">Confirmer</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EquipmentEditPanel;