// src/client/src/systems/vikings/components/layout/CaracsSection.jsx
// Caractéristiques : niveau 1–5 et explosion ; clic sur une valeur = jet
// (hors mode édition). En mode édition : stepper sous chaque valeur.

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { formatExplosion } from '../../config/utils.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const CaracsSection = ({ char, editMode, set, onRoll }) => (
    <VkPanel>
        <div className="vk-section-title">
            Caractéristiques
            {!editMode && <span className="vk-eyebrow">clic = jet</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
            {Object.entries(CARACNAMES).map(([key, label]) => {
                const lv = char[key] || 1;
                return (
                    <div key={key}
                         className={`vk-stat ${editMode ? '' : 'is-rollable'}`}
                         onClick={editMode ? undefined : () => onRoll({ type: 'carac', data: key })}
                         title={editMode ? undefined : `Lancer ${label}`}>
                        <div className="val">{lv}</div>
                        <div className="lbl">{label}</div>
                        <div className="sub">expl. {formatExplosion(lv)}</div>
                        {editMode && (
                            <div className="vk-stepper mt-1">
                                <button type="button" onClick={() => set(key, lv - 1)} disabled={lv <= 1}><VkIcon name="minus" /></button>
                                <button type="button" onClick={() => set(key, lv + 1)} disabled={lv >= 5}><VkIcon name="plus" /></button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </VkPanel>
);

export default CaracsSection;
