// src/client/src/systems/achtung/components/StressTracker.jsx
// Stress (cases calculées depuis character) + Injuries + Courage + Armour.

import React from 'react';
import ShieldBadge from './ShieldBadge.jsx';
import { computeStress } from '../config.jsx';

const StressTracker = ({ character, editMode, onChange }) => {
    // Stress max calculé depuis les attributs et compétences du personnage
    const stressMax = character
        ? computeStress(character.attributes ?? [], character.skills ?? [])
        : 12;

    const stress   = character?.stress   ?? 0;
    const injuries = character?.injuries ?? 0;
    const courage  = character?.courage  ?? 0;
    const armour   = character?.armour   ?? 0;

    const toggleStress = (i) => {
        if (editMode) return;
        const newVal = i < stress ? i : i + 1;
        onChange?.('stress', Math.min(stressMax, Math.max(0, newVal)));
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Stress */}
            <div>
                <div className="ac-section-header">
                    Stress
                    <span style={{ marginLeft: '0.4rem', fontWeight: 400, color: 'var(--ac-muted)' }}>
                        {stress}/{stressMax}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                    {Array.from({ length: stressMax }).map((_, i) => (
                        <div
                            key={i}
                            className={`ac-pip stress${i < stress ? ' active' : ''}`}
                            onClick={() => toggleStress(i)}
                            title={`Stress ${i + 1}`}
                        />
                    ))}
                </div>
                {editMode && (
                    <input
                        type="number"
                        value={stress}
                        min={0} max={stressMax}
                        onChange={e => onChange?.('stress', Math.min(stressMax, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="ac-input-num mt-1"
                    />
                )}
            </div>

            {/* Injuries + Courage + Armour */}
            <div className="grid grid-cols-3 gap-4">
                {/* Injuries */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Blessures</span>
                    <div className="flex items-center gap-1">
                        {!editMode ? (
                            <>
                                <button onClick={() => onChange?.('injuries', Math.max(0, injuries - 1))}
                                        className="ac-btn ac-btn-ghost" style={{ width: 24, height: 24, padding: 0, fontSize: '0.8rem' }}
                                        disabled={injuries <= 0}>−</button>
                                <ShieldBadge value={injuries} />
                                <button onClick={() => onChange?.('injuries', Math.min(3, injuries + 1))}
                                        className="ac-btn ac-btn-ghost" style={{ width: 24, height: 24, padding: 0, fontSize: '0.8rem' }}
                                        disabled={injuries >= 3}>+</button>
                            </>
                        ) : (
                            <input type="number" value={injuries} min={0} max={3}
                                   onChange={e => onChange?.('injuries', Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                                   className="ac-input-num" />
                        )}
                    </div>
                </div>

                {/* Courage */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Courage</span>
                    {editMode
                        ? <input type="number" value={courage} min={0}
                                 onChange={e => onChange?.('courage', Math.max(0, parseInt(e.target.value) || 0))}
                                 className="ac-input-num" />
                        : <ShieldBadge value={courage} />}
                </div>

                {/* Armour */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Armure</span>
                    {editMode
                        ? <input type="number" value={armour} min={0}
                                 onChange={e => onChange?.('armour', Math.max(0, parseInt(e.target.value) || 0))}
                                 className="ac-input-num" />
                        : <ShieldBadge value={armour} />}
                </div>
            </div>
        </div>
    );
};

export default StressTracker;