// src/client/src/systems/deltagreen/Brand.jsx
// Marque Delta Green (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return (
            <span className="dg-brand is-title">
                <span className="dg-brand-delta" />
                <span className="dg-brand-title">Delta Green</span>
            </span>
        );
    }
    return (
        <span className="dg-brand">
            <span className="dg-brand-delta" />
            <span className="dg-brand-title">Delta Green</span>
            <span className="dg-brand-stamp">Secret défense // ORCON</span>
        </span>
    );
};

export default Brand;
