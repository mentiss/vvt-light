// src/client/src/systems/fabula/components/Stepper.jsx
// Stepper +/- réutilisable (extrait de Creation.jsx pour être partagé avec Sheet.jsx).
import React from 'react';

const Stepper = ({ value, min, max, onChange, size = 'md', showMax = true }) => {
    const dims = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm';
    return (
        <div className="inline-flex items-center gap-2">
            <button type="button" disabled={value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className={`${dims} rounded-full border border-default bg-default flex items-center justify-center disabled:opacity-30 font-bold`}>
                −
            </button>
            <span className="text-sm font-semibold w-10 text-center">{value}{showMax ? ` / ${max}` : ''}</span>
            <button type="button" disabled={value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className={`${dims} rounded-full border border-default bg-default flex items-center justify-center disabled:opacity-30 font-bold`}>
                +
            </button>
        </div>
    );
};

export default Stepper;