// src/client/src/systems/tecumah/Brand.jsx
// Marque Tecumah Gulch (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="tg-brand is-title"><span className="tg-brand-title">Tecumah Gulch</span></span>;
    }
    return (
        <span className="tg-brand">
            <span className="tg-brand-title">Tecumah Gulch</span>
            <span className="tg-brand-sub">Western · D6</span>
        </span>
    );
};

export default Brand;
