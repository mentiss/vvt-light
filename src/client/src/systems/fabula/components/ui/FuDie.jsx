// src/client/src/systems/fabula/components/ui/FuDie.jsx
// Dé en gemme (planche §2) : la forme et la couleur disent la taille
// (d6 pierre, d8 émeraude, d10 saphir, d12 topaze ; couleurs dans theme.css).
// Bouton si onClick est fourni, sinon simple affichage.
//
// <FuDie size={10} />                       // affiche « d10 »
// <FuDie size={8} label={7} small />        // gemme d8 portant la valeur 7
// <FuDie size={12} onClick={…} title="…" />

import React from 'react';

// Corps et facettes de chaque forme (viewBox 40 × 40)
const SHAPES = {
    6:  { body: <rect x="5" y="5" width="30" height="30" rx="7"/>, facets: 'M5 12l7-7M35 12l-7-7M5 28l7 7M35 28l-7 7' },
    8:  { body: <path d="M20 2l18 18-18 18L2 20z"/>, facets: 'M2 20h36M20 2l-7 18 7 18 7-18z' },
    10: { body: <path d="M20 2l17 14-17 22L3 16z"/>, facets: 'M3 16l17 6 17-6M20 22v16M20 2v20' },
    12: { body: <path d="M20 2l17.5 12.5L31 36H9L2.5 14.5z"/>, facets: 'M20 10l8.5 6.2-3.2 10H14.7l-3.2-10z M20 2v8M37.5 14.5l-9 1.7M31 36l-5.7-9.8M9 36l5.7-9.8M2.5 14.5l9 1.7' },
};

const FuDie = ({ size, label, small = false, onClick, disabled = false, title, className = '' }) => {
    const shape = SHAPES[size] ?? SHAPES[8];
    const content = (
        <>
            <svg viewBox="0 0 40 40" aria-hidden="true">{shape.body}<path className="fu-die-facet" d={shape.facets}/></svg>
            <span>{label ?? `d${size}`}</span>
        </>
    );
    const cls = `fu-die${small ? ' fu-die-sm' : ''}${className ? ` ${className}` : ''}`;
    return onClick
        ? <button type="button" className={cls} data-s={size} onClick={onClick} disabled={disabled} title={title}>{content}</button>
        : <span className={cls} data-s={size} title={title}>{content}</span>;
};

export default FuDie;
