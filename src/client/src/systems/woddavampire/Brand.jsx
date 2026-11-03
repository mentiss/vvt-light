// src/client/src/systems/woddavampire/Brand.jsx
// Marque Vampire : l'Âge des Ténèbres (spec_plateforme_accueil.md §5) : carte de
// l'accueil ou titre. Contrat : ({ variant: 'card' | 'title', slug, label }).
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return (
            <span className="vda-brand is-title">
                <span className="vda-brand-sign" aria-hidden="true" />
                <span className="vda-brand-title">Vampire</span>
                <span className="vda-brand-sub">L'Âge des Ténèbres</span>
            </span>
        );
    }
    return (
        <span className="vda-brand">
            <span className="vda-brand-stain" aria-hidden="true" />
            <span className="vda-brand-title">VAMPIRE</span>
            <span className="vda-brand-sub">L'Âge des Ténèbres</span>
        </span>
    );
};

export default Brand;
