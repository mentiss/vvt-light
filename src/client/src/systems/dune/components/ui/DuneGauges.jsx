// src/client/src/systems/dune/components/ui/DuneGauges.jsx
// Colonnes de jauges qui encadrent la fiche joueur (spec_dune.md §6.3, Q-5) :
//   - Impulsion à gauche : 6 gouttes d'épice empilées, + / − pour tous ;
//   - Menace à droite : rides de sable qui montent, valeur en tête, sans plafond,
//     en lecture pour les joueurs (12 rides visibles, « +N » au-delà).

import React from 'react';
import DuneIcon from './DuneIcon.jsx';
import { IMPULSION_MAX } from '../../config/rules/roll.js';

const VISIBLE_RIPPLES = 12;

export const ImpulsionColumn = ({ value, onChange }) => (
    <aside className="dn-gauge-col" aria-label={`Impulsion : ${value} sur ${IMPULSION_MAX}`}>
        <div className="dn-gauge-inner">
        <DuneIcon name="spice" className="dn-ico text-primary" />
        <div className="dn-gauge-value">{value}</div>
        <button type="button" className="dn-gauge-step" onClick={() => onChange(1)} disabled={value >= IMPULSION_MAX} title="Ajouter une Impulsion">
            <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
        </button>
        <div className="dn-drops">
            {Array.from({ length: IMPULSION_MAX }, (_, i) => (
                <DuneIcon key={i} name={i < value ? 'spice' : 'spiceEmpty'} className={`dn-drop${i < value ? ' is-full' : ''}`} />
            ))}
        </div>
        <button type="button" className="dn-gauge-step" onClick={() => onChange(-1)} disabled={value <= 0} title="Retirer une Impulsion">
            <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
        </button>
        <div className="dn-gauge-label">Impulsion</div>
        </div>
    </aside>
);

export const ThreatColumn = ({ value }) => (
    <aside className="dn-gauge-col is-right" aria-label={`Menace : ${value}`}>
        <div className="dn-gauge-inner">
        <DuneIcon name="threat" className="dn-ico text-danger" />
        <div className="dn-gauge-value text-danger">{value}</div>
        {value > VISIBLE_RIPPLES && <div className="dn-gauge-more">+{value - VISIBLE_RIPPLES}</div>}
        <div className="dn-ripples">
            {Array.from({ length: VISIBLE_RIPPLES }, (_, i) => (
                <DuneIcon key={i} name="ripple" className={`dn-ripple${i < value ? ' is-full' : ''}`} />
            ))}
        </div>
        <div className="dn-gauge-label">Menace</div>
        </div>
    </aside>
);
