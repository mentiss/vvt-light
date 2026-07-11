// src/client/src/systems/fabula/components/layout/AccessoryCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Accessoire équipé (emplacementEquipe === 'accessoire'). Les accessoires
// peuvent porter des mods Déf./Déf.Mag./Init. (certains accessoires du jeu en
// donnent) — le formulaire partagé les expose, et computeDerivedStats les
// additionne comme toute pièce équipée.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { unequipItem } from '../../config.jsx';
import EquipmentEditForm, { EquipmentItemSummary } from './EquipmentEditForm.jsx';

const AccessoryCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const index = equipment.findIndex(e => e.emplacementEquipe === 'accessoire');
    const item = index >= 0 ? equipment[index] : null;

    const update = (patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const unequip = () => onArrayChange('equipment', unequipItem(equipment, index));

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <h3 className="fu-font-title text-primary text-sm mb-2">Accessoire équipé</h3>
            {!item && <p className="text-xs text-muted italic">Aucun accessoire équipé.</p>}
            {item && (
                <div className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                    {editMode ? (
                        <EquipmentEditForm item={item} onChange={update} showType={false} />
                    ) : (
                        <EquipmentItemSummary item={item} showType={false} />
                    )}
                    {/* Déséquiper est une action de jeu immédiate, pas une édition de
                        texte libre — toujours disponible, comme "Équiper" au sac à dos. */}
                    <button type="button" onClick={unequip}
                            className="self-start px-2 py-0.5 rounded-full text-xs border bg-default border-default text-danger">
                        Déséquiper
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccessoryCard;