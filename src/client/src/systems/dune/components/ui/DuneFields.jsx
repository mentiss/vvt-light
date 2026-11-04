// src/client/src/systems/dune/components/ui/DuneFields.jsx
// Petites briques de saisie du mode Édition (corrections hors règles) et compteurs.

import React from 'react';
import DuneIcon from './DuneIcon.jsx';

/** Champ texte libellé (input, ou textarea si rows). */
export const DuneField = ({ label, value, onChange, rows, placeholder, className = '' }) => (
    <label className={`block ${className}`}>
        <span className="vtt-field-label block mb-1">{label}</span>
        {rows
            ? <textarea className="vtt-input" rows={rows} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
            : <input className="vtt-input" value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </label>
);

/** Compteur − valeur + (bornes facultatives). */
export const DuneStepper = ({ value, onChange, min = 0, max = Infinity, label }) => (
    <div className="dn-stepper" aria-label={label}>
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label ?? ''} −1`}>
            <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
        </button>
        <b>{value}</b>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label ?? ''} +1`}>
            <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
        </button>
    </div>
);

/** Section de fiche à cadre orné. */
export const DuneFrame = ({ title, hint, children, className = '' }) => (
    <section className={`dn-frame ${className}`}>
        <span className="dn-c3" /><span className="dn-c4" />
        {title && <h2 className="dn-title">{title}{hint && <small>{hint}</small>}</h2>}
        {children}
    </section>
);
