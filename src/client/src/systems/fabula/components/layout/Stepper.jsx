// src/client/src/systems/fabula/components/layout/Stepper.jsx
// Stepper +/- réutilisable (extrait de Creation.jsx pour être partagé avec Sheet.jsx),
// habillé en commandes du thème (.fu-step, theme.css).
import React from 'react';
import FuIcon from '../ui/FuIcon.jsx';

const Stepper = ({ value, min, max, onChange, showMax = true }) => (
    <div className="fu-step">
        <button type="button" disabled={value <= min} aria-label="Diminuer"
                onClick={() => onChange(Math.max(min, value - 1))} className="fu-step-btn">
            <FuIcon name="minus" className="fu-ico-sm" />
        </button>
        <span className="fu-step-val">{value}{showMax ? ` / ${max}` : ''}</span>
        <button type="button" disabled={value >= max} aria-label="Augmenter"
                onClick={() => onChange(Math.min(max, value + 1))} className="fu-step-btn">
            <FuIcon name="plus" className="fu-ico-sm" />
        </button>
    </div>
);

export default Stepper;
