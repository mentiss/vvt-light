// src/client/src/systems/dune/Brand.jsx
// Marque Dune (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="dune-brand is-title"><span className="dune-brand-title">DUNE</span></span>;
    }
    return (
        <span className="dune-brand">
            <span className="dune-brand-title">DUNE</span>
            <span className="dune-brand-sub">Adventures in the Imperium</span>
        </span>
    );
};

export default Brand;
