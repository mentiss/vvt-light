// src/client/src/systems/fabula/components/layout/AccessoryCard.jsx
import React from 'react';
import { unequipItem } from '../../config.jsx';

const AccessoryCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const index = equipment.findIndex(e => e.typeEmplacement === 'accessoire' && e.equipe);
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
                        <>
                            <input value={item.nomLibre} onChange={e => update({ nomLibre: e.target.value })}
                                   className="bg-default border border-default rounded px-2 py-1 text-sm" placeholder="Nom" />
                            <textarea value={item.notesLibres} onChange={e => update({ notesLibres: e.target.value })}
                                      className="bg-default border border-default rounded px-2 py-1 text-xs" rows={2} placeholder="Notes" />
                            <button type="button" onClick={unequip} className="text-danger text-xs self-end">Déséquiper</button>
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
};

export default AccessoryCard;