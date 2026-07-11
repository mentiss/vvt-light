// src/client/src/systems/fabula/components/layout/BackpackCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sac à dos — tout objet non équipé (emplacementEquipe: null). "Équiper"
// applique les règles d'emplacements nommés (equipItem) : armure/accessoire →
// emplacement dédié, item de main → directrice si libre sinon secondaire,
// arme deux mains → occupe tout ; déséquipe automatiquement l'occupant le
// plus ancien plutôt que de bloquer l'action.
// Le bouton 📖 ouvre le catalogue (même patron que Delta Green/Cyberpunk/
// Achtung) — les items choisis arrivent ici, préremplis et non équipés.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { equipItem, isEquipped } from '../../config.jsx';
import EquipmentEditForm, { EquipmentItemSummary, createEmptyItem } from './EquipmentEditForm.jsx';
import EquipmentCatalogModal from '../modals/EquipmentCatalogModal.jsx';

const BackpackCard = ({ character, editMode, onArrayChange }) => {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const equipment = character.equipment ?? [];
    const backpackItems = equipment
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => !isEquipped(e));

    const addItem   = ()             => onArrayChange('equipment', [...equipment, createEmptyItem()]);
    const addFromCatalog = (item)    => onArrayChange('equipment', [...equipment, item]);
    const update    = (index, patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const remove    = (index)        => onArrayChange('equipment', equipment.filter((_, i) => i !== index));
    const equip     = (index)        => onArrayChange('equipment', equipItem(equipment, index));

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="fu-font-title text-primary text-sm">Sac à dos</h3>
                <div className="flex gap-1">
                    {/* Le catalogue est une action d'AJOUT (préremplissage), pas une
                        édition de texte libre — toujours disponible, indépendamment
                        du mode édition. Seule la saisie libre manuelle ("+ Ajouter")
                        reste réservée au mode édition. */}
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

            {backpackItems.length === 0 && <p className="text-xs text-muted italic">Sac vide.</p>}

            <div className="flex flex-col gap-2">
                {backpackItems.map(({ e: item, i: index }) => (
                    <div key={index} className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                        {editMode ? (
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <EquipmentEditForm item={item} onChange={patch => update(index, patch)} />
                                </div>
                                <button type="button" onClick={() => remove(index)} className="text-danger text-sm shrink-0">✕</button>
                            </div>
                        ) : (
                            <EquipmentItemSummary item={item} />
                        )}
                        <button type="button" onClick={() => equip(index)}
                                className="self-start px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                            Équiper
                        </button>
                    </div>
                ))}
            </div>

            <EquipmentCatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addFromCatalog} />
        </div>
    );
};

export default BackpackCard;