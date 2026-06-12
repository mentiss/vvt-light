// src/client/src/systems/achtung/components/StressTracker.jsx
// Stress (12 cases cochables) + Injuries (compteur 0–3) + Courage + Armour.

import React from 'react';
import ShieldBadge from "./ShieldBadge.jsx";

const MAX_STRESS = 12;

const StressTracker = ({ stress, injuries, courage, armour, editMode, onChange }) => {
    const toggleStress = (i) => {
        if (editMode) return; // en editMode, champ numérique
        const newVal = i < stress ? i : i + 1;
        onChange?.('stress', Math.min(MAX_STRESS, Math.max(0, newVal)));
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Stress */}
            <div>
                <div className="ac-section-header">Stress</div>
                <div className="flex flex-wrap gap-1 mt-1">
                    {Array.from({ length: MAX_STRESS }).map((_, i) => (
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
                        min={0} max={MAX_STRESS}
                        onChange={e => onChange?.('stress', Math.min(MAX_STRESS, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="ac-input-num mt-1"
                    />
                )}
            </div>

            {/* Injuries + Courage + Armour */}
            <div className="grid grid-cols-3 gap-4">
                {/* Injuries — compteur 0–3, 3 = mort */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Blessures</span>
                    <div className="flex items-center gap-1">
                        {!editMode ? (
                            <>
                                <button
                                    onClick={() => onChange?.('injuries', Math.max(0, injuries - 1))}
                                    className="ac-btn ac-btn-ghost w-6 h-6 p-0 text-xs flex items-center justify-center"
                                    disabled={injuries <= 0}
                                >−</button>
                                <ShieldBadge value={injuries} />
                                <button
                                    onClick={() => onChange?.('injuries', Math.min(3, injuries + 1))}
                                    className="ac-btn ac-btn-ghost w-6 h-6 p-0 text-xs flex items-center justify-center"
                                    disabled={injuries >= 3}
                                >+</button>
                            </>
                        ) : (
                            <input
                                type="number"
                                value={injuries}
                                min={0} max={3}
                                onChange={e => onChange?.('injuries', Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="ac-input-num"
                            />
                        )}
                    </div>
                </div>

                {/* Courage */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Courage</span>
                    {editMode ? (
                        <input
                            type="number"
                            value={courage}
                            min={0}
                            onChange={e => onChange?.('courage', Math.max(0, parseInt(e.target.value) || 0))}
                            className="ac-input-num"
                        />
                    ) : (
                        <div className="flex items-center gap-1">
                            <ShieldBadge value={courage} />
                        </div>
                    )}
                </div>

                {/* Armour */}
                <div className="flex flex-col items-center gap-1">
                    <span className="ac-label">Armure</span>
                    {editMode ? (
                        <input
                            type="number"
                            value={armour}
                            min={0}
                            onChange={e => onChange?.('armour', Math.max(0, parseInt(e.target.value) || 0))}
                            className="ac-input-num"
                        />
                    ) : (
                        <div className="flex items-center gap-1">
                            <ShieldBadge value={armour} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StressTracker;