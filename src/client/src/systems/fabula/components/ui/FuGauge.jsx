// src/client/src/systems/fabula/components/ui/FuGauge.jsx
// Jauge PV / PM / PI (planche §3) : remplissage en dégradé, part perdue qui reste
// blanche un instant avant de fondre (couche « lag » en transition retardée,
// sous le remplissage : invisible quand la jauge remonte), seuil de Crise posé
// sur la jauge si `crisis` est fourni.
//
// <FuGauge value={34} max={48} crisis={24} />

import React from 'react';

const pct = (v, max) => (max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0);

const FuGauge = ({ value, max, crisis }) => {
    const w = pct(value, max);
    const c = crisis != null ? pct(crisis, max) : null;
    return (
        <div className="fu-gauge-wrap">
            {c != null && <span className="fu-crisis-flag" style={{ left: `${c}%` }}>Crise</span>}
            <div className="fu-gauge" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
                <div className="fu-gauge-lag" style={{ width: `${w}%` }} />
                <div className="fu-gauge-fill" style={{ width: `${w}%` }} />
            </div>
            {c != null && <i className="fu-crisis-mark" style={{ left: `${c}%` }} />}
        </div>
    );
};

export default FuGauge;
