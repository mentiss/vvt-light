// src/client/src/systems/vikings/components/layout/CaracsSection.jsx
// Caractéristiques : niveau 1–5, explosion ; clic 🎲 → modale de jet.

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { formatExplosion } from '../../config/utils.js';

const StepButton = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled}
            className="w-4 h-4 bg-primary rounded-full text-xs font-bold disabled:opacity-30 text-default leading-none">
        {children}
    </button>
);

const CaracsSection = ({ char, editMode, set, onRoll }) => (
    <div className="bg-surface rounded-lg p-3 border-2 border-default">
        <h3 className="text-sm font-bold text-default mb-2">Caractéristiques</h3>
        <div className="space-y-2">
            {Object.entries(CARACNAMES).map(([key, label]) => {
                const lv = char[key] || 1;
                return (
                    <div key={key} className="bg-default rounded p-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 flex-1">
                                <span className="font-semibold text-xs text-default">{label}</span>
                                {editMode && (
                                    <>
                                        <StepButton onClick={() => set(key, lv - 1)} disabled={lv <= 1}>-</StepButton>
                                        <StepButton onClick={() => set(key, lv + 1)} disabled={lv >= 5}>+</StepButton>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full border ${i <= lv ? 'bg-primary border-primary' : 'border-default'}`} />
                                    ))}
                                </div>
                                {!editMode && (
                                    <button onClick={() => onRoll({ type: 'carac', data: key })}
                                            className="text-xs px-1 py-0.5 bg-primary rounded text-default ml-1" title={`Lancer ${label}`}>
                                        🎲
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="text-xs text-muted italic mt-0.5">Expl : {formatExplosion(lv)}</div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default CaracsSection;
