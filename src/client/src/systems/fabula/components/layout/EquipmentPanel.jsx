// src/client/src/systems/fabula/components/layout/EquipmentPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Vue liste complète de l'équipement (équipé + sac confondus), avec badge
// d'emplacement pour les items équipés. L'ancienne checkbox "Équipé" devient
// une paire de boutons Équiper/Déséquiper passant par equipItem/unequipItem
// (règles d'emplacements nommés). Catalogue accessible via 📖 en editMode.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { equipItem, unequipItem, isEquipped } from '../../config.jsx';
import EquipmentEditForm, { EquipmentItemSummary, EMPLACEMENT_LABELS, createEmptyItem } from './EquipmentEditForm.jsx';
import EquipmentCatalogModal from '../modals/EquipmentCatalogModal.jsx';

const EquipmentPanel = ({ character, editMode, onArrayChange }) => {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const equipment = character.equipment ?? [];

    const addItem        = ()             => onArrayChange('equipment', [...equipment, createEmptyItem()]);
    const addFromCatalog = (item)         => onArrayChange('equipment', [...equipment, item]);
    const updateItem     = (index, patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const removeItem     = (index)        => onArrayChange('equipment', equipment.filter((_, i) => i !== index));
    const equip          = (index)        => onArrayChange('equipment', equipItem(equipment, index));
    const unequip        = (index)        => onArrayChange('equipment', unequipItem(equipment, index));

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="fu-font-title text-primary text-sm">Équipement</h3>
                <div className="flex gap-1">
                    {/* Idem BackpackCard : ajout catalogue toujours disponible,
                        seule la saisie libre manuelle reste liée à editMode. */}
                    <button type="button" onClick={() => setCatalogOpen(true)}
                            className="px-2 py-1 rounded-full bg-default border border-default text-xs"
                            title="Ouvrir le catalogue d'équipement">
                        📖 Catalogue
                    </button>
                    {editMode && (
                        <button type="button" onClick={addItem} className="px-2 py-1 rounded-full bg-primary text-white text-xs">
                            + Ajouter
                        </button>
                    )}
                </div>
            </div>

            {equipment.length === 0 && <p className="text-xs text-muted italic">Aucun équipement.</p>}

            <div className="flex flex-col gap-2">
                {equipment.map((item, i) => (
                    <div key={i} className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                        {editMode ? (
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <EquipmentEditForm item={item} onChange={patch => updateItem(i, patch)} />
                                </div>
                                <button type="button" onClick={() => removeItem(i)} className="text-danger text-sm shrink-0">✕</button>
                            </div>
                        ) : (
                            <EquipmentItemSummary item={item} />
                        )}

                        <div className="flex items-center gap-2 mt-1">
                            {isEquipped(item) ? (
                                <>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary">
                                        {EMPLACEMENT_LABELS[item.emplacementEquipe]}
                                    </span>
                                    <button type="button" onClick={() => unequip(i)}
                                            className="px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                                        Déséquiper
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] text-muted italic">Dans le sac — bonus non appliqués</span>
                                    <button type="button" onClick={() => equip(i)}
                                            className="px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                                        Équiper
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <EquipmentCatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addFromCatalog} />
        </div>
    );
};

export default EquipmentPanel;