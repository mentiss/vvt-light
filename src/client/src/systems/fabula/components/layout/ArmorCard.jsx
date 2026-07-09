// src/client/src/systems/fabula/components/layout/ArmorCard.jsx
import React from 'react';
import { equipItem, unequipItem } from '../../config.jsx';

const ArmorCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const index = equipment.findIndex(e => e.typeEmplacement === 'armure' && e.equipe);
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
                        <>
                            <input value={item.nomLibre} onChange={e => update({ nomLibre: e.target.value })}
                                   className="bg-default border border-default rounded px-2 py-1 text-sm" placeholder="Nom" />
                            <textarea value={item.notesLibres} onChange={e => update({ notesLibres: e.target.value })}
                                      className="bg-default border border-default rounded px-2 py-1 text-xs" rows={2} placeholder="Notes" />
                            <div className="flex gap-3 text-xs">
                                <label>Déf. <input type="number" value={item.modDefense}
                                                   onChange={e => update({ modDefense: parseInt(e.target.value) || 0 })}
                                                   className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                <label>Déf.Mag. <input type="number" value={item.modDefenseMagique}
                                                       onChange={e => update({ modDefenseMagique: parseInt(e.target.value) || 0 })}
                                                       className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                <label>Init. <input type="number" value={item.modInitiative}
                                                    onChange={e => update({ modInitiative: parseInt(e.target.value) || 0 })}
                                                    className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                <button type="button" onClick={unequip} className="ml-auto text-danger">Déséquiper</button>
                            </div>
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

export default ArmorCard;