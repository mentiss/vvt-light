// src/client/src/systems/achtung/components/VerticalGauge.jsx
// Jauge verticale — 0 en bas, max en haut.
// Copié et adapté du pattern Dune.

import React from 'react';

const VerticalGauge = ({
                           label,
                           value,
                           max,
                           filledColor,
                           emptyColor   = 'transparent',
                           borderColor,
                           onInc,
                           onDec,
                           readonly     = false,
                           className    = '',
                       }) => {
    const cellH = Math.max(14, Math.floor(220 / max));

    return (
        <div className={`flex flex-col items-center gap-1 select-none ${className}`}>
            {/* Label */}
            <span
                className="ac-label text-center"
                style={{ color: borderColor, writingMode: 'horizontal-tb', fontSize: '0.58rem' }}
            >
                {label}
            </span>

            {/* Valeur numérique */}
            <span className="ac-font-title text-center" style={{ fontSize: '0.9rem', fontWeight: 700, color: filledColor }}>
                {value}
            </span>

            {/* Barre verticale — flex-col-reverse : index 0 = bas */}
            <div className="flex flex-col-reverse gap-px" style={{ width: 24 }}>
                {Array.from({ length: max }).map((_, i) => {
                    const filled = i < value;
                    return (
                        <div
                            key={i}
                            style={{
                                height:     cellH,
                                width:      '100%',
                                borderRadius: 2,
                                background: filled ? filledColor : emptyColor,
                                border:     `1.5px solid ${borderColor}`,
                                opacity:    filled ? 1 : 0.3,
                                transition: 'background 0.15s',
                            }}
                        />
                    );
                })}
            </div>

            {/* Boutons */}
            {!readonly && (
                <div className="flex flex-col gap-1 mt-1">
                    <button
                        onClick={onInc}
                        disabled={!onInc || value >= max}
                        className="ac-btn ac-btn-icon disabled:opacity-25"
                        style={{ background: filledColor, color: '#fff', border: 'none' }}
                        title={`+1 ${label}`}
                    >+</button>
                    <button
                        onClick={onDec}
                        disabled={!onDec || value <= 0}
                        className="ac-btn ac-btn-icon disabled:opacity-25"
                        style={{ background: 'transparent', color: filledColor, border: `1.5px solid ${filledColor}` }}
                        title={`-1 ${label}`}
                    >−</button>
                </div>
            )}
        </div>
    );
};

export default VerticalGauge;