// src/client/src/systems/fabula/components/ui/FuIcon.jsx
// Icônes du slug (planche documentations/fabula/planche_fabula.html §2), au trait,
// en currentColor : elles remplacent tous les emojis (spec_fabula.md §1).
//
// <FuIcon name="dice" />                 // 18 px, classe fu-ico
// <FuIcon name="potion" className="fu-ico-sm" />

import React from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

// Contenu SVG de chaque icône (viewBox 24 × 24)
const ICONS = {
    dice:    <><g {...S}><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></g><circle cx="8" cy="11.5" r="1.1" fill="currentColor"/><circle cx="16" cy="11.5" r="1.1" fill="currentColor"/><circle cx="12" cy="7" r="1.1" fill="currentColor"/></>,
    sheet:   <g {...S}><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2.6"/><path d="M8 17c1-2 2.4-3 4-3s3 1 4 3"/></g>,
    journal: <g {...S}><path d="M5 3h11l3 3v15H5z"/><path d="M9 3v18M12 9h4M12 12h4"/></g>,
    scroll:  <g {...S}><path d="M7 4h11a2 2 0 0 1 0 4H17v10a2 2 0 0 1-2 2H5a2 2 0 0 1 0-4h1V6a2 2 0 0 1 1-2z"/><path d="M9 9h5M9 12h5"/></g>,
    book:    <g {...S}><path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1z"/><path d="M21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z"/></g>,
    map:     <g {...S}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></g>,
    party:   <g {...S}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><path d="M15 14.6c3 0 5.4 1.9 6 5.4"/></g>,
    hero:    <g {...S}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-7 8-7s7 2.5 8 7"/></g>,
    gear:    <g {...S}><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></g>,
    menu:    <><g {...S} strokeWidth={1.8}><path d="M4 6h16M4 12h11M4 18h16"/></g><path d="M19 10l2 2-2 2-2-2z" fill="currentColor"/></>,
    sun:     <g {...S}><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g>,
    moon:    <><path d="M15 3a8.5 8.5 0 1 0 6 13A9 9 0 0 1 15 3z" {...S}/><path d="M6 5l.6 1.4L8 7l-1.4.6L6 9l-.6-1.4L4 7l1.4-.6z" fill="currentColor"/></>,
    edit:    <g {...S}><path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M13.5 6.5l4 4"/></g>,
    check:   <path d="M4 12.5l5 5L20 6.5" {...S} strokeWidth={2}/>,
    close:   <path d="M6 6l12 12M18 6L6 18" {...S} strokeWidth={1.8}/>,
    plus:    <path d="M12 5v14M5 12h14" {...S} strokeWidth={2}/>,
    minus:   <path d="M5 12h14" {...S} strokeWidth={2}/>,
    up:      <path d="M6 15l6-6 6 6" {...S} strokeWidth={2.4}/>,
    down:    <path d="M6 9l6 6 6-6" {...S} strokeWidth={2.4}/>,
    chev:    <path d="M9 6l6 6-6 6" {...S} strokeWidth={2.2}/>,
    sword:   <g {...S}><path d="M20 3l-1 4-9 9-3-3 9-9z"/><path d="M5 14l5 5M3 21l3-3M6 12l6 6"/></g>,
    staff:   <g {...S}><path d="M5 21L15 11"/><circle cx="17" cy="7" r="3.2"/><path d="M17 1.8v1.4M22.2 7h-1.4M20.7 3.3l-1 1"/></g>,
    shield:  <g {...S}><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 6v12M8 10h8"/></g>,
    mshield: <g {...S}><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 7l1.3 3 3.2.3-2.4 2.1.7 3.1L12 13.9 9.2 15.5l.7-3.1-2.4-2.1 3.2-.3z"/></g>,
    armor:   <g {...S}><path d="M8 3l4 2 4-2 4 3-2 4v10H6V10L4 6z"/><path d="M12 5v15M8 13h8"/></g>,
    ring:    <g {...S}><circle cx="12" cy="15" r="6"/><path d="M9 7l3-4 3 4-3 2.5z"/></g>,
    boot:    <g {...S}><path d="M7 3h6v9l6 3c1 .5 2 1.5 2 3v2H4V3z"/><path d="M3 8h4M14 14l-2 3M17 15.5l-2 3"/></g>,
    crisis:  <g {...S}><path d="M12 21s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.2-8 11-8 11z"/><path d="M12 7.5l-1.5 4 3 1.5-1.5 4"/></g>,
    coin:    <g {...S}><circle cx="12" cy="12" r="8.5"/><path d="M12 6.5l4 5.5-4 5.5-4-5.5z"/></g>,
    bag:     <g {...S}><path d="M5 9h14l-1 12H6z"/><path d="M9 9V6a3 3 0 0 1 6 0v3M9 13h6"/></g>,
    potion:  <g {...S}><path d="M10 3h4M10.5 3v5L6 15a5 5 0 0 0 4.3 7h3.4A5 5 0 0 0 18 15l-4.5-7V3"/><path d="M7.5 15h9"/></g>,
    tent:    <g {...S}><path d="M12 3L2 20h20z"/><path d="M12 3v17M9 20l3-6 3 6"/></g>,
    bond:    <g {...S}><circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/></g>,
    bolt:    <path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="currentColor"/>,
    spark:   <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="currentColor"/>,
    key:     <g {...S}><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></g>,
    swap:    <path d="M4 8h14l-3-3M20 16H6l3 3" {...S}/>,
    exit:    <g {...S}><path d="M14 4H5v16h9"/><path d="M10 12h11M18 9l3 3-3 3"/></g>,
    crown:   <g {...S}><path d="M3 18l2-10 4 4 3-7 3 7 4-4 2 10z"/><path d="M3 21h18"/></g>,
    sliders: <g {...S}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></g>,
    music:   <g {...S}><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></g>,
    send:    <g {...S}><path d="M2 12l20-9-6 18-4-7z"/><path d="M12 14l10-11"/></g>,
    copy:    <g {...S}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></g>,
    search:  <g {...S} strokeWidth={1.8}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></g>,
    eye:     <g {...S}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>,
    eyeOff:  <g {...S}><path d="M2 12s3.6-7 10-7c2 0 3.7.7 5.1 1.6M22 12s-3.6 7-10 7c-2 0-3.7-.7-5.1-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></g>,
    star:    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>,
    // Altérations (planche §2)
    slow:    <g {...S} strokeWidth={1.7}><path d="M6 2h12M6 22h12"/><path d="M7 2c0 5 10 5 10 10S7 17 7 22M17 2c0 5-10 5-10 10s10 5 10 10"/></g>,
    dazed:   <><g {...S} strokeWidth={1.7}><ellipse cx="12" cy="8" rx="9" ry="3.5"/><circle cx="12" cy="17" r="4"/></g><path d="M5 6.5l.6 1.2 1.3.2-1 .9.3 1.3L5 9.4l-1.2.7.3-1.3-1-.9 1.3-.2zM19 6.5l.6 1.2 1.3.2-1 .9.3 1.3-1.2-.7-1.2.7.3-1.3-1-.9 1.3-.2z" fill="currentColor"/></>,
    weak:    <g {...S} strokeWidth={1.7}><path d="M6 13c0-3 2-5 4-5h4c2 0 4 2 4 5v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/><path d="M12 2v7M9 6l3 3 3-3"/></g>,
    shaken:  <g {...S} strokeWidth={1.7}><path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 5 3 6v4h10v-4c1.5-1 3-3 3-6a8 8 0 0 0-8-8z"/><path d="M12 6l-2 4 3 1-2 4"/></g>,
    enraged: <path d="M12 2c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 1.5-4.5 3-6 0 2 1 3 2 3 0-3 0-5 1-8z" {...S} strokeWidth={1.7}/>,
    poison:  <><path d="M12 2c3 5 6 8.5 6 12a6 6 0 0 1-12 0c0-3.5 3-7 6-12z" {...S} strokeWidth={1.7}/><circle cx="10" cy="14" r="1.3" fill="currentColor"/><circle cx="14" cy="14" r="1.3" fill="currentColor"/><path d="M10 17.5h4" stroke="currentColor" strokeWidth="1.5"/></>,
    sigil:   <><g {...S} strokeWidth={1.2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.5"/><path d="M12 2l2.9 7.8h8.3l-6.7 4.9 2.6 8L12 17.8 4.9 22.7l2.6-8L.8 9.8h8.3z" opacity=".75"/></g><circle cx="12" cy="12" r="1.8" fill="currentColor"/></>,
};

/**
 * @param {string} props.name        clé de ICONS
 * @param {string} [props.className] remplace la classe par défaut fu-ico
 * @param {string} [props.title]     texte alternatif (sinon décorative)
 */
const FuIcon = ({ name, className = 'fu-ico', title }) => {
    const content = ICONS[name];
    if (!content) return null;
    return (
        <svg className={className} viewBox="0 0 24 24"
             aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
            {title && <title>{title}</title>}
            {content}
        </svg>
    );
};

export default FuIcon;
