// src/client/src/systems/fabula/components/EquipmentPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Équipement — mêmes champs que l'Étape 5 du wizard (saisie libre + bonus
// manuels). Le catalogue structuré (equipment.js) arrivera dans un lot
// ultérieur ; equipmentKey reste nullable et prêt à l'accueillir.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const EMPLACEMENTS = [
    { key: 'arme',       label: 'Arme' },
    { key: 'armure',     label: 'Armure' },
    { key: 'bouclier',   label: 'Bouclier' },
    { key: 'accessoire', label: 'Accessoire' },
];

const EquipmentPanel = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];

    const addItem = () => {
        onArrayChange('equipment', [...equipment, {
            typeEmplacement: 'arme', nomLibre: '', notesLibres: '', prix: 0,
            modDefense: 0, modDefenseMagique: 0, modInitiative: 0, equipe: true,
        }]);
    };
    const updateItem = (index, patch) => {
        onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    };
    const removeItem = (index) => {
        onArrayChange('equipment', equipment.filter((_, i) => i !== index));
    };
    const toggleEquipe = (index) => {
        updateItem(index, { equipe: !equipment[index].equipe });
    };

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="fu-font-title text-primary text-sm">Équipement</h3>
                {editMode && (
                    <button type="button" onClick={addItem} className="px-2 py-1 rounded-full bg-primary text-white text-xs">
                        + Ajouter
                    </button>
                )}
            </div>

            {equipment.length === 0 && <p className="text-xs text-muted italic">Aucun équipement.</p>}

            <div className="flex flex-col gap-2">
                {equipment.map((item, i) => (
                    <div key={i} className="bg-surface-alt rounded p-2">
                        {editMode ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center flex-wrap">
                                    <div className="flex gap-1">
                                        {EMPLACEMENTS.map(e => (
                                            <button key={e.key} type="button" onClick={() => updateItem(i, { typeEmplacement: e.key })}
                                                    className={`px-2 py-1 rounded-full text-xs border ${
                                                        item.typeEmplacement === e.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                    }`}>
                                                {e.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input placeholder="Nom" value={item.nomLibre}
                                           onChange={e => updateItem(i, { nomLibre: e.target.value })}
                                           className="bg-default border border-default rounded px-2 py-1 text-sm flex-1 min-w-[100px]" />
                                    <button type="button" onClick={() => removeItem(i)} className="text-danger text-sm">✕</button>
                                </div>
                                <textarea placeholder="Notes libres" value={item.notesLibres}
                                          onChange={e => updateItem(i, { notesLibres: e.target.value })}
                                          className="bg-default border border-default rounded px-2 py-1 text-sm" rows={2} />
                                <div className="flex gap-3 text-xs items-center">
                                    <label>Prix <input type="number" value={item.prix}
                                                       onChange={e => updateItem(i, { prix: parseInt(e.target.value) || 0 })}
                                                       className="w-14 bg-default border border-default rounded px-1 ml-1" /></label>
                                    <label>Déf. <input type="number" value={item.modDefense}
                                                       onChange={e => updateItem(i, { modDefense: parseInt(e.target.value) || 0 })}
                                                       className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                    <label>Déf.Mag. <input type="number" value={item.modDefenseMagique}
                                                           onChange={e => updateItem(i, { modDefenseMagique: parseInt(e.target.value) || 0 })}
                                                           className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                    <label>Init. <input type="number" value={item.modInitiative}
                                                        onChange={e => updateItem(i, { modInitiative: parseInt(e.target.value) || 0 })}
                                                        className="w-12 bg-default border border-default rounded px-1 ml-1" /></label>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-semibold">{item.nomLibre || '(sans nom)'}</span>
                                    <span className="text-xs text-muted ml-2">
                                        {EMPLACEMENTS.find(e => e.key === item.typeEmplacement)?.label}
                                    </span>
                                    {item.notesLibres && <p className="text-xs text-muted mt-0.5">{item.notesLibres}</p>}
                                </div>
                            </div>
                        )}
                        <label className="flex items-center gap-1 text-xs mt-1">
                            <input type="checkbox" checked={item.equipe} onChange={() => toggleEquipe(i)} />
                            Équipé {!item.equipe && <span className="text-muted italic">(dans l'inventaire, bonus non appliqués)</span>}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentPanel;