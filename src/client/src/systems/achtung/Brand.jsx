// src/client/src/systems/achtung/Brand.jsx
// Marque Achtung! Cthulhu (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="ac-brand is-title"><span className="ac-brand-title">Achtung! Cthulhu</span></span>;
    }
    return (
        <span className="ac-brand">
            <span className="ac-brand-stamp">Top secret</span>
            <span className="ac-brand-title">Achtung! Cthulhu</span>
            <span className="ac-brand-rule" />
            <span className="ac-brand-sub">La guerre secrète · 1939-1945</span>
        </span>
    );
};

export default Brand;
