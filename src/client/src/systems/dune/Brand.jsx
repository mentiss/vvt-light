// src/client/src/systems/dune/Brand.jsx
// Marque Dune (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
// La carte reprend la bande fixe du slug (vitrail, arcs, poussière d'épice).
import React from 'react';
import './Brand.css';

// Grains de poussière : positions fixes
const DUST = Array.from({ length: 14 }, (_, i) => ({
    left: `${(i * 41.7) % 100}%`, top: `${25 + ((i * 29.3) % 60)}%`, animationDelay: `${-((i * 2.3) % 12)}s`,
}));

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return <span className="dune-brand is-title"><span className="dune-brand-title">DUNE</span></span>;
    }
    return (
        <span className="dune-brand">
            <span className="dune-brand-dust" aria-hidden="true">
                {DUST.map((style, i) => <i key={i} style={style} />)}
            </span>
            <span className="dune-brand-title">DUNE</span>
            <span className="dune-brand-sub">Aventures dans l'Imperium</span>
        </span>
    );
};

export default Brand;
