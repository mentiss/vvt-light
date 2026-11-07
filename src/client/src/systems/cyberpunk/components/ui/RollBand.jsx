// src/client/src/systems/cyberpunk/components/ui/RollBand.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un résultat 2d10 (spec_cyberpunk.md §5, planche §3) :
//   <RollBand total outcome />          bande 9- / 10-14 / 15+, zone touchée
//                                       allumée, repère sur le total
//   <RollBand total outcome compact />  mini-bande (historique, notifications)
//   <D10Face value size? />             face de d10 dessinée
//   <RollStamp outcome />               tampon du résultat (l'échec grésille)
// Classes theme.css : cp-band*, cp-d10*, cp-stamp* ; zones .z-failure/partial/success.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { BAND_ZONES, BAND_MIN, BAND_MAX, bandPosition } from '../../config.jsx';

const STAMP_LABEL = { success: 'Succès plein', partial: 'Succès partiel', failure: 'Échec' };

export const RollBand = ({ total, outcome, compact = false }) => {
    const left = `${bandPosition(total)}%`;
    if (compact) {
        return (
            <div className="cp-band is-compact" aria-hidden="true">
                {BAND_ZONES.map(z => (
                    <i key={z.outcome} className={`z-${z.outcome} ${z.outcome === outcome ? 'is-hit' : ''}`} style={{ flexGrow: z.cells }} />
                ))}
                <span className="cp-band-marker" style={{ left }} />
            </div>
        );
    }
    return (
        <div className="cp-band-wrap">
            <div className="cp-band">
                {BAND_ZONES.map(z => (
                    <div key={z.outcome} className={`z-${z.outcome} ${z.outcome === outcome ? 'is-hit' : ''}`} style={{ flexGrow: z.cells }}>
                        {z.label} · {z.range}
                    </div>
                ))}
                <span className="cp-band-marker" style={{ left }} />
            </div>
            {/* Graduation alignée sur les zones : bornes de chaque zone */}
            <div className="cp-band-scale" aria-hidden="true">
                {BAND_ZONES.map(z => (
                    <span key={z.outcome} style={{ flexGrow: z.cells }}>
                        <i>{z.from}</i><i>{z.to === BAND_MAX ? `${BAND_MAX}+` : z.to}</i>
                    </span>
                ))}
            </div>
        </div>
    );
};

export const D10Face = ({ value, size = 'md' }) => (
    <span className={`cp-d10 is-${size}`}>
        <svg viewBox="0 0 46 52" aria-hidden="true">
            <polygon points="23,2 44,20 23,50 2,20" />
            <line x1="2" y1="20" x2="23" y2="28" /><line x1="44" y1="20" x2="23" y2="28" /><line x1="23" y1="28" x2="23" y2="50" />
        </svg>
        <b>{value}</b>
    </span>
);

export const RollStamp = ({ outcome }) => (
    <span className={`cp-stamp z-${outcome}`}>{STAMP_LABEL[outcome] ?? outcome}</span>
);
