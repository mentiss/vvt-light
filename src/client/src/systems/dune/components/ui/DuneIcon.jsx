// src/client/src/systems/dune/components/ui/DuneIcon.jsx
// Icônes du slug (planche documentations/dune/planche_dune.html §2), au trait fin,
// en currentColor : elles remplacent tous les emojis (spec_dune.md §5.4).
//
// <DuneIcon name="d20" />                 // 20 px, classe dn-ico
// <DuneIcon name="spice" className="…" />

import React from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

// Contenu SVG de chaque icône (viewBox 24 × 24, sauf ripple : 40 × 12)
const ICONS = {
    d20: <g {...S}><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 7l5 8H7z"/><path d="M12 2v5M3 7l4 8M21 7l-4 8M7 15l5 7 5-7"/></g>,
    quill: <g {...S}><path d="M20 3C11 4 6 10 5 19"/><path d="M20 3c-1 6-5 10-11 11"/><path d="M4 21l2-3"/></g>,
    worm: <><g {...S}><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></g><circle cx="12" cy="12" r="1.6" fill="currentColor"/></>,
    spice: <><path d="M12 2c3 5 6 8.5 6 12a6 6 0 0 1-12 0c0-3.5 3-7 6-12z" fill="currentColor"/><path d="M9.5 15a2.6 2.6 0 0 0 2.5 2.6" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="1.2" strokeLinecap="round"/></>,
    spiceEmpty: <path d="M12 2.5c3 5 6 8.5 6 12a6 6 0 0 1-12 0c0-3.5 3-7 6-12z" fill="none" stroke="currentColor" strokeWidth="1.4"/>,
    eye: <><g {...S}><path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3.6"/></g><circle cx="12" cy="12" r="1.6" fill="currentColor"/></>,
    threat: <g {...S}><path d="M3 9c3 0 3-3 6-3s3 3 6 3 3-3 6-3"/><path d="M3 14c3 0 3-3 6-3s3 3 6 3 3-3 6-3"/><path d="M3 19c3 0 3-3 6-3s3 3 6 3 3-3 6-3"/></g>,
    bolt: <path d="M13 2L5 14h6l-1 8 8-12h-6z" {...S}/>,
    house: <g {...S} strokeWidth={1.4}><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 7l2 4h-4z"/><path d="M8 14c1.5-1 2.5-1.5 4-1.5s2.5.5 4 1.5"/><path d="M12 12.5V18"/></g>,
    journal: <g {...S}><path d="M5 3h12l2 2v16H5z"/><path d="M9 3v18M12 8h4M12 11h4"/></g>,
    hourglass: <g {...S}><path d="M6 2h12M6 22h12"/><path d="M7 2c0 5 10 5 10 10S7 17 7 22"/><path d="M17 2c0 5-10 5-10 10s10 5 10 10"/></g>,
    send: <g {...S}><path d="M2 12l20-9-6 18-4-7z"/><path d="M12 14l10-11"/></g>,
    hood: <g {...S}><path d="M12 2c-5 0-7 5-7 10v10h14V12c0-5-2-10-7-10z"/><path d="M8.5 13c1-2.5 2-3.5 3.5-3.5s2.5 1 3.5 3.5c-1 2-2 3-3.5 3s-2.5-1-3.5-3z"/></g>,
    orbit: <><g {...S}><circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10.5" ry="4.5" transform="rotate(-20 12 12)"/></g><circle cx="20.5" cy="8.3" r="1.5" fill="currentColor"/></>,
    blade: <g {...S}><path d="M19 2c-6 2-11 7-12 14l2 2c7-1 12-6 14-12z"/><path d="M5 15l4 4M3 21l3.5-3.5"/></g>,
    thopter: <g {...S} strokeWidth={1.4}><path d="M9 12h7l3 2-3 2H9l-2-2z"/><path d="M2 9c4 0 7 1 9 3M22 7c-4 0-7 2-8 5M2 6c5 1 8 3 9 6"/></g>,
    moon: <g {...S}><path d="M15 3a8 8 0 1 0 6 13A9 9 0 0 1 15 3z"/><circle cx="7" cy="6" r="2"/></g>,
    menu: <g {...S}><path d="M3 6h18M3 12h12M3 18h18"/><path d="M19 10l2 2-2 2-2-2z"/></g>,
    close: <path d="M6 6l12 12M18 6L6 18" {...S} strokeWidth={1.6}/>,
    plus: <path d="M12 5v14M5 12h14" {...S} strokeWidth={1.6}/>,
    minus: <path d="M5 12h14" {...S} strokeWidth={1.6}/>,
    key: <g {...S}><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></g>,
    swap: <g {...S}><path d="M4 8h14l-3-3M20 16H6l3 3"/></g>,
    exit: <g {...S}><path d="M14 4H5v16h9"/><path d="M10 12h11M18 9l3 3-3 3"/></g>,
    crown: <g {...S}><path d="M3 18l2-10 4 4 3-7 3 7 4-4 2 10z"/><path d="M3 21h18"/></g>,
    reroll: <g {...S}><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></g>,
    trash: <g {...S}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></g>,
    check: <path d="M5 12l5 5 9-10" {...S} strokeWidth={1.6}/>,
};

// Rides de la Menace : viewBox propre (colonne de droite)
const RIPPLE = <path d="M1 9c6 0 7-6 13-6s7 6 13 6 6-4 12-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>;

/**
 * @param {string} props.name       clé de ICONS, ou 'ripple'
 * @param {string} [props.className] remplace la classe par défaut dn-ico
 * @param {string} [props.title]     texte alternatif (sinon décorative)
 */
const DuneIcon = ({ name, className = 'dn-ico', title }) => {
    const isRipple = name === 'ripple';
    const content  = isRipple ? RIPPLE : ICONS[name];
    if (!content) return null;
    return (
        <svg className={className} viewBox={isRipple ? '0 0 40 12' : '0 0 24 24'}
             aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
            {title && <title>{title}</title>}
            {content}
        </svg>
    );
};

export default DuneIcon;
