// src/client/src/systems/fabula/components/layout/ArmorCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Armure équipée (emplacementEquipe === 'armure'). Le formulaire partagé gère
// le double modèle de Défense : dé DEX + mod (armures légères) ou DEF fixe
// (armures lourdes, defFixe non nul → le dé DEX est ignoré par
// computeDerivedStats). Section de la fenêtre Équipement (EquipmentCard), qui
// porte les valeurs dérivées du personnage.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { unequipItem } from '../../config.jsx';
import EquipmentEditForm, { EquipmentItemSummary } from './EquipmentEditForm.jsx';

const ArmorCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const index = equipment.findIndex(e => e.emplacementEquipe === 'armure');
    const item = index >= 0 ? equipment[index] : null;

    const update = (patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const unequip = () => onArrayChange('equipment', unequipItem(equipment, index));

    return (
        <section className="fu-equip-slot">
            <h4 className="fu-slot-title">Armure<span className="fu-kana" aria-hidden="true">防具</span></h4>

            {!item && <p className="fu-item is-empty">Aucune armure équipée.</p>}

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

export default ArmorCard;