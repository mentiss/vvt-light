// src/client/src/systems/fabula/components/layout/BackpackCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sac à dos — tout objet non équipé (equipe: false). "Équiper" applique les
// règles de slots (equipItem) : déséquipe automatiquement le plus ancien objet
// du même groupe si la limite est atteinte, plutôt que de bloquer l'action.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { equipItem } from '../../config.jsx';

const EMPLACEMENTS = [
    { key: 'arme',       label: 'Arme' },
    { key: 'armure',     label: 'Armure' },
    { key: 'bouclier',   label: 'Bouclier' },
    { key: 'accessoire', label: 'Accessoire' },
];

const BackpackCard = ({ character, editMode, onArrayChange }) => {
    const equipment = character.equipment ?? [];
    const backpackItems = equipment
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => !e.equipe);

    const addItem = () => {
        onArrayChange('equipment', [...equipment, {
            typeEmplacement: 'arme', nomLibre: '', notesLibres: '', prix: 0,
            modDefense: 0, modDefenseMagique: 0, modInitiative: 0, equipe: false,
        }]);
    };
    const update = (index, patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const remove = (index) => onArrayChange('equipment', equipment.filter((_, i) => i !== index));
    const equip = (index) => onArrayChange('equipment', equipItem(equipment, index));

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="fu-font-title text-primary text-sm">Sac à dos</h3>
                {editMode && (
                    <button type="button" onClick={addItem} className="px-2 py-1 rounded-full bg-primary text-white text-xs">
                        + Ajouter
                    </button>
                )}
            </div>

            {backpackItems.length === 0 && <p className="text-xs text-muted italic">Sac vide.</p>}

            <div className="flex flex-col gap-2">
                {backpackItems.map(({ e: item, i: index }) => (
                    <div key={index} className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                        {editMode ? (
                            <div className="flex gap-2 items-center flex-wrap">
                                <div className="flex gap-1">
                                    {EMPLACEMENTS.map(em => (
                                        <button key={em.key} type="button" onClick={() => update(index, { typeEmplacement: em.key })}
                                                className={`px-2 py-1 rounded-full text-xs border ${
                                                    item.typeEmplacement === em.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                }`}>
                                            {em.label}
                                        </button>
                                    ))}
                                </div>
                                <input placeholder="Nom" value={item.nomLibre}
                                       onChange={e => update(index, { nomLibre: e.target.value })}
                                       className="bg-default border border-default rounded px-2 py-1 text-sm flex-1 min-w-[100px]" />
                                <input type="number" placeholder="Prix" value={item.prix}
                                       onChange={e => update(index, { prix: parseInt(e.target.value) || 0 })}
                                       className="w-20 bg-default border border-default rounded px-2 py-1 text-sm" />
                                <button type="button" onClick={() => remove(index)} className="text-danger text-sm">✕</button>
                            </div>
                        ) : (
                            <span className="text-sm font-semibold">{item.nomLibre || '(sans nom)'} <span className="text-xs text-muted font-normal">({EMPLACEMENTS.find(em => em.key === item.typeEmplacement)?.label})</span></span>
                        )}
                        <button type="button" onClick={() => equip(index)}
                                className="self-start px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                            Équiper
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BackpackCard;