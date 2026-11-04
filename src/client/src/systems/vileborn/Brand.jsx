// src/client/src/systems/vileborn/Brand.jsx
// Marque Vileborn (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
// Contrat : ({ variant: 'card' | 'title', slug, label }).
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => (
    <span className={`vileborn-brand${variant === 'title' ? ' is-title' : ''}`}>
        <span className="vileborn-brand-sign" aria-hidden="true" />
        <span className="vileborn-brand-title">Vileborn</span>
        <span className="vileborn-brand-sub">Accepte ta part de ténèbres</span>
    </span>
);

export default Brand;
