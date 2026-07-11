// src/client/src/systems/fabula/components/layout/ArmorCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Armure équipée (emplacementEquipe === 'armure'). Le formulaire partagé gère
// le double modèle de Défense : dé DEX + mod (armures légères) ou DEF fixe
// (armures lourdes, defFixe non nul → le dé DEX est ignoré par
// computeDerivedStats). Les chips d'en-tête affichent les valeurs dérivées
// globales du personnage, toutes pièces équipées confondues.
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
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h3 className="fu-font-title text-primary text-sm">Armure équipée</h3>
                <div className="flex gap-2 text-[10px]">
                    <span className="bg-surface-alt rounded px-1.5 py-0.5">Déf. <strong>{character.defense}</strong></span>
                    <span className="bg-surface-alt rounded px-1.5 py-0.5">Déf.Mag. <strong>{character.defenseMagique}</strong></span>
                    <span className="bg-surface-alt rounded px-1.5 py-0.5">Init. <strong>{character.initiative}</strong></span>
                </div>
            </div>

            {!item && <p className="text-xs text-muted italic">Aucune armure équipée.</p>}

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

export default ArmorCard;