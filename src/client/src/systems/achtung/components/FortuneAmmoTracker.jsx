// src/client/src/systems/achtung/components/FortuneAmmoTracker.jsx
// Fortune (compteur +/−, pas de max fixe) + Ammo (pool global).

import React from 'react';

const Counter = ({ label, value, color, onChange, editMode, min = 0 }) => (
    <div className="flex flex-col items-center gap-1">
        <span className="ac-label" style={color ? { color } : {}}>{label}</span>
        {editMode ? (
            <input
                type="number"
                value={value}
                min={min}
                onChange={e => onChange(Math.max(min, parseInt(e.target.value) || 0))}
                className="ac-input-num"
            />
        ) : (
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="ac-btn ac-btn-ghost w-6 h-6 p-0 text-xs flex items-center justify-center disabled:opacity-30"
                >−</button>
                <span className="ac-value w-8 text-center" style={color ? { color } : {}}>{value}</span>
                <button
                    onClick={() => onChange(value + 1)}
                    className="ac-btn ac-btn-ghost w-6 h-6 p-0 text-xs flex items-center justify-center"
                >+</button>
            </div>
        )}
    </div>
);

const FortuneAmmoTracker = ({ fortune, ammo, editMode, onChange }) => (
    <div className="grid grid-cols-2 gap-4">
        <Counter
            label="Fortune"
            value={fortune ?? 3}
            color="var(--ac-fortune-color)"
            editMode={editMode}
            onChange={val => onChange?.('fortune', val)}
        />
        <Counter
            label="Munitions"
            value={ammo ?? 0}
            editMode={editMode}
            onChange={val => onChange?.('ammo', val)}
        />
    </div>
);

export default FortuneAmmoTracker;