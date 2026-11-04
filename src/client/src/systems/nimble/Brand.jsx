// src/client/src/systems/nimble/Brand.jsx
// Marque Nimble (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
// Contrat : ({ variant: 'card' | 'title', slug, label }).
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => (
    <span className={`nimble-brand${variant === 'title' ? ' is-title' : ''}`}>
        {variant !== 'title' && <span className="nimble-brand-mark" aria-hidden="true">✦ ✦ ✦</span>}
        <span className="nimble-brand-title">Nimble</span>
        <span className="nimble-brand-sub">L'héroïsme au pas de course</span>
    </span>
);

export default Brand;
