// src/client/src/systems/fabula/Brand.jsx
// Marque Fabula Ultima (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="fu-brand is-title"><span className="fu-brand-title">Fabula Ultima</span></span>;
    }
    return (
        <span className="fu-brand">
            <span className="fu-brand-title">Fabula Ultima</span>
            <span className="fu-brand-divider"><span className="fu-brand-gem" /></span>
            <span className="fu-brand-sub">Tome héroïque · JRPG</span>
        </span>
    );
};

export default Brand;
