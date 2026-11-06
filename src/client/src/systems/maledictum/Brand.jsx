// src/client/src/systems/maledictum/Brand.jsx
// Marque Imperium Maledictum (spec_plateforme_accueil.md §5) : carte de l'accueil
// (nef de cathédrale, arc gothique, Aquila) ou titre des pages d'accès et de la bande.
// Contrat : ({ variant: 'card' | 'title', slug, label }).
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => (
    <span className={`maledictum-brand${variant === 'title' ? ' is-title' : ''}`}>
        <div>
            <div className="maledictum-brand-aquila" aria-hidden="true" />
            <div className="maledictum-brand-title">Imperium{' '}<br />Maledictum</div>
            <div className="maledictum-brand-sub">Inquisition</div>
        </div>
    </span>
);

export default Brand;
