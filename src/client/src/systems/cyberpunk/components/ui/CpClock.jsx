// src/client/src/systems/cyberpunk/components/ui/CpClock.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Horloge en camembert (spec_cyberpunk.md §6, planche §4) : réservée au MJ.
// Clic sur un segment = l'horloge passe à ce segment ; clic sur le dernier segment
// rempli = recule d'un cran. Ambre aux deux tiers, rouge pulsé une fois pleine.
//   <CpClock segments current onSet? size? />   sans onSet : lecture seule
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const R = 46;
const C = 50;

const wedge = (i, n) => {
    // Un seul segment : le disque entier (un arc de 360° ne se dessine pas)
    if (n === 1) return `M${C - R},${C} A${R},${R} 0 1 1 ${C + R},${C} A${R},${R} 0 1 1 ${C - R},${C} Z`;
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0);
    const x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${C},${C} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
};

const CpClock = ({ segments, current, onSet, size = 48, title }) => {
    const n = Math.max(1, segments ?? 1);
    const cur = Math.max(0, Math.min(n, current ?? 0));
    const state = cur >= n ? 'is-full' : cur / n >= 2 / 3 ? 'is-warn' : '';
    return (
        <span className={`cp-clock ${state} ${onSet ? 'is-interactive' : ''}`} style={{ width: size, height: size }}
              title={title ?? `${cur}/${n}`} role="img" aria-label={`Horloge ${cur} sur ${n}`}>
            <svg viewBox="0 0 100 100">
                {Array.from({ length: n }, (_, i) => (
                    <path
                        key={i} d={wedge(i, n)} className={i < cur ? 'is-on' : ''}
                        onClick={onSet ? (e) => { e.stopPropagation(); onSet(i + 1 === cur ? i : i + 1); } : undefined}
                    >
                        {onSet && <title>{i + 1 === cur ? `Revenir à ${i}` : `Passer à ${i + 1}`}</title>}
                    </path>
                ))}
                <circle className="cp-clock-rim" cx={C} cy={C} r={R + 1} />
            </svg>
        </span>
    );
};

export default CpClock;
