// src/client/src/systems/vikings/components/layout/TraitsSection.jsx
// Traits et backgrounds : description et effets ; ajout / retrait en mode édition.

import React from 'react';
import { TRAITS } from '../../config/traits.js';

const TraitsSection = ({ char, editMode, set, onOpenEditModal }) => (
    <div className="bg-surface rounded-lg p-3 border-2 border-default">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-default">Traits & Backgrounds</h3>
            {editMode && (
                <button onClick={() => onOpenEditModal('addTrait')} className="text-xs px-2 py-1 bg-primary text-default rounded">+ Ajout</button>
            )}
        </div>
        <div className="space-y-1.5">
            {(char.traits ?? []).map(trait => {
                const td = TRAITS.find(t => t.name === trait.name);
                return (
                    <div key={trait.name} className="p-1.5 bg-default rounded text-xs">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="font-semibold text-default">{trait.name}</div>
                                <div className="text-default">{td?.description}</div>
                                {td?.effects && (
                                    <div className="text-success mt-0.5">
                                        {td.effects.actions && `+${td.effects.actions} Action `}
                                        {td.effects.armure && `+${td.effects.armure} Armure `}
                                        {td.effects.description}
                                    </div>
                                )}
                            </div>
                            {editMode && (
                                <button onClick={() => set('traits', char.traits.filter(t => t.name !== trait.name))}
                                        className="ml-2 text-xs px-1 bg-danger text-white rounded">✕</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default TraitsSection;
