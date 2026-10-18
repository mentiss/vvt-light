// src/client/src/systems/zoneblanche/Brand.jsx
// Marque Zone Blanche (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="zb-brand is-title"><span className="zb-brand-title">Zone Blanche</span></span>;
    }
    return (
        <span className="zb-brand">
            <span className="zb-brand-hud">
                <span className="zb-brand-bug">Ch. 13</span>
                <span className="zb-brand-rec">REC</span>
            </span>
            <span className="zb-brand-title">Zone Blanche</span>
            <span className="zb-brand-sub">Found footage · 2D20</span>
        </span>
    );
};

export default Brand;
