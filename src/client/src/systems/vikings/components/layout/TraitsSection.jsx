// src/client/src/systems/vikings/components/layout/TraitsSection.jsx
// Traits et backgrounds : description et effets ; ajout / retrait en mode édition.

import React from 'react';
import { TRAITS } from '../../config/traits.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const effectsText = (effects) => [
    effects.actions && `+${effects.actions} action`,
    effects.armure  && `+${effects.armure} armure`,
    effects.seuil   && `+${effects.seuil} seuil`,
    effects.description,
].filter(Boolean).join(' · ');

const TraitsSection = ({ char, editMode, set, onOpenEditModal }) => (
    <VkPanel>
        <div className="vk-section-title">
            Traits & backgrounds
            {editMode && (
                <button type="button" className="vk-btn vk-btn-sm" onClick={() => onOpenEditModal('addTrait')}><VkIcon name="plus" />Ajouter</button>
            )}
        </div>
        {(char.traits ?? []).map(trait => {
            const td = TRAITS.find(t => t.name === trait.name);
            return (
                <div key={trait.name} className="vk-row items-start">
                    <div className="flex-1 min-w-0">
                        <div className="font-bold">{trait.name}</div>
                        {td?.description && <div className="text-sm text-muted">{td.description}</div>}
                        {td?.effects && <div className="text-xs text-success mt-0.5">{effectsText(td.effects)}</div>}
                    </div>
                    {editMode && (
                        <button type="button" className="vk-btn vk-btn-danger vk-btn-icon vk-btn-sm" title="Retirer"
                                onClick={() => set('traits', char.traits.filter(t => t.name !== trait.name))}>
                            <VkIcon name="close" />
                        </button>
                    )}
                </div>
            );
        })}
    </VkPanel>
);

export default TraitsSection;
