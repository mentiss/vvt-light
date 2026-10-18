// src/client/src/systems/cyberpunk/Brand.jsx
// Marque CyberPunk (spec_plateforme_accueil.md §5) : logo néon de la fiche,
// en carte de l'accueil ou en titre.
import React from 'react';
import BoltFarm from './components/ui/BoltFarm.jsx';
import './Brand.css';

const Logo = () => (
    <span className="cp-brand-logo cp-brand-glitch cp-brand-pulse">
        <BoltFarm />
        <span className="cp-brand-title cp-brand-stroke">CyberPunk</span>
    </span>
);

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="cp-brand is-title"><Logo /></span>;
    }
    return (
        <span className="cp-brand">
            <Logo />
            <span className="cp-brand-divider" />
            <span className="cp-brand-sub">The Sprawl — édition Ré²</span>
        </span>
    );
};

export default Brand;
