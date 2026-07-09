// src/client/src/systems/fabula/components/layout/WeaponsCard.jsx
import React from 'react';
import { unequipItem } from '../../config.jsx';

const WeaponSlot = ({ label, item, index, editMode, onUpdate, onUnequip }) => (
    <div>
        <div className="text-[10px] text-muted uppercase mb-1">{label}</div>
        {!item ? (
            <p className="text-xs text-muted italic">Vide</p>
        ) : (
            <div className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                {editMode ? (
                    <>
                        <input value={item.nomLibre} onChange={e => onUpdate(index, { nomLibre: e.target.value })}
                               className="bg-default border border-default rounded px-2 py-1 text-sm" placeholder="Nom" />
                        <textarea value={item.notesLibres} onChange={e => onUpdate(index, { notesLibres: e.target.value })}
                                  className="bg-default border border-default rounded px-2 py-1 text-xs" rows={2} placeholder="Notes" />
                        <button type="button" onClick={() => onUnequip(index)} className="text-danger text-xs self-end">Déséquiper</button>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-semibold">{item.nomLibre || '(sans nom)'}</span>
                        {item.notesLibres && <p className="text-xs text-muted">{item.notesLibres}</p>}
                    </>
                )}
            </div>
        )}
    </div>
);

const WeaponsCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const equippedHands = equipment
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => ['arme', 'bouclier'].includes(e.typeEmplacement) && e.equipe);

    const mainHand = equippedHands[0] ?? null;
    const offHand  = equippedHands[1] ?? null;

    const update = (index, patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const unequip = (index) => onArrayChange('equipment', unequipItem(equipment, index));

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <h3 className="fu-font-title text-primary text-sm mb-2">Armes équipées</h3>
            <div className="flex flex-col gap-2">
                <WeaponSlot label="Main directrice" item={mainHand?.e} index={mainHand?.i}
                            editMode={editMode} onUpdate={update} onUnequip={unequip} />
                <WeaponSlot label="Main secondaire" item={offHand?.e} index={offHand?.i}
                            editMode={editMode} onUpdate={update} onUnequip={unequip} />
            </div>
        </div>
    );
};

export default WeaponsCard;