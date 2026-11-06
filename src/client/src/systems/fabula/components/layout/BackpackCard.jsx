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
import FuIcon from '../ui/FuIcon.jsx';

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
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Sac à dos<span className="fu-kana" aria-hidden="true">道具</span></h3>
                <span className="fu-rule" />
                <div className="flex gap-1">
                    {/* Le catalogue est une action d'AJOUT (préremplissage), pas une
                        édition de texte libre — toujours disponible, indépendamment
                        du mode édition. Seule la saisie libre manuelle ("+ Ajouter")
                        reste réservée au mode édition. */}
                    <button type="button" onClick={() => setCatalogOpen(true)}
                            className="fu-btn fu-btn-sm"
                            title="Ouvrir le catalogue d'équipement">
                        <FuIcon name="search" className="fu-ico-sm" /> Catalogue
                    </button>
                    {editMode && (
                        <button type="button" onClick={addItem} className="fu-btn fu-btn-sm">
                            <FuIcon name="plus" className="fu-ico-sm" />Ajouter
                        </button>
                    )}
                </div>
            </div>

            {backpackItems.length === 0 && <p className="text-xs text-muted italic">Sac vide.</p>}

            <div className="flex flex-col gap-2">
                {backpackItems.map(({ e: item, i: index }) => (
                    <div key={index} className="fu-item">
                        {editMode ? (
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <EquipmentEditForm item={item} onChange={patch => update(index, patch)} />
                                </div>
                                <button type="button" onClick={() => remove(index)} className="fu-btn fu-btn-sm fu-btn-danger shrink-0" aria-label="Retirer"><FuIcon name="close" className="fu-ico-sm" /></button>
                            </div>
                        ) : (
                            <EquipmentItemSummary item={item} />
                        )}
                        <button type="button" onClick={() => equip(index)}
                                className="self-start fu-btn fu-btn-sm">
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