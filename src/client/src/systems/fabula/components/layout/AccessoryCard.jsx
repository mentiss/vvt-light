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
        <section className="fu-equip-slot">
            <h4 className="fu-slot-title">Accessoire<span className="fu-kana" aria-hidden="true">アクセサリー</span></h4>
            {!item && <p className="fu-item is-empty">Aucun accessoire équipé.</p>}
            {item && (
                <div className="fu-item">
                    {editMode ? (
                        <EquipmentEditForm item={item} onChange={update} showType={false} />
                    ) : (
                        <EquipmentItemSummary item={item} showType={false} />
                    )}
                    {/* Déséquiper est une action de jeu immédiate, pas une édition de
                        texte libre — toujours disponible, comme "Équiper" au sac à dos. */}
                    <button type="button" onClick={unequip}
                            className="self-start fu-btn fu-btn-sm fu-btn-danger">
                        Déséquiper
                    </button>
                </div>
            )}
        </section>
    );
};

export default AccessoryCard;