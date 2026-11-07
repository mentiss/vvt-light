// src/client/src/systems/cyberpunk/components/ui/CpIcon.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Jeu d'icônes dessinées du slug (planche §1, spec_cyberpunk.md §3) : tracés 24×24
// au trait, une couleur (currentColor). Remplace les emojis et les glyphes (⎚ ⊞).
//   <CpIcon name="edit" />            16 px (cp-ico)
//   <CpIcon name="d10" size="lg" />   sm : 13 px · lg : 22 px
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// Chaque entrée : contenu SVG (éléments enfants) ; trait 1.8 sauf mention.
const PATHS = {
    edit:      <><path d="M4 20l1-5 11-11 4 4-11 11z" /><path d="M14 6l4 4" /><path d="M4 20h6" /></>,
    xp:        <><path d="M4 14l8-8 8 8" /><path d="M4 20l8-8 8 8" /></>,
    catalog:   <><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" /><path d="M17.5 14v7M14 17.5h7" /></>,
    tag:       <><path d="M3 12V3h9l9 9-9 9z" /><circle cx="8" cy="8" r="1.6" /></>,
    sheet:     <><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M8 11h8M8 14h5" /></>,
    journal:   <><path d="M5 3h11l3 3v15H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    history:   <><path d="M4 5h16M4 10h10M4 15h16M4 20h8" /></>,
    reference: <><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></>,
    d10:       <><path d="M12 2l9 8-9 12-9-12z" /><path d="M3 10l9 4 9-4M12 14v8" /></>,
    gear:      <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
    newChar:   <><path d="M5 4h9l5 5v11H5z" /><path d="M12 10v7M8.5 13.5h7" /></>,
    switch:    <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.5 2.7-6 6-6" /><path d="M15 13h6l-2-2M21 17h-6l2 2" /></>,
    key:       <><circle cx="7.5" cy="12" r="4" /><path d="M11.5 12H21M18 12v3M15 12v2" /></>,
    mask:      <><path d="M3 6h18v5a9 9 0 0 1-18 0z" /><path d="M7 11h3M14 11h3" /></>,
    logout:    <><path d="M10 4H4v16h6" /><path d="M14 8l4 4-4 4M18 12H9" /></>,
    clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 12V3A9 9 0 0 1 21 12z" fill="currentColor" opacity=".35" /></>,
    threat:    <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></>,
    corp:      <><path d="M5 21V5l7-3v19M12 8h7v13M3 21h18" /><path d="M8 8v.5M8 12v.5M8 16v.5M15 12v.5M15 16v.5" /></>,
    gang:      <><path d="M5 9a7 7 0 0 1 14 0v4l-2 2v4H7v-4l-2-2z" /><circle cx="9" cy="11" r="1.6" /><circle cx="15" cy="11" r="1.6" /><path d="M10 19v-2M14 19v-2" /></>,
    ai:        <><rect x="6" y="6" width="12" height="12" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /><circle cx="12" cy="12" r="2" /></>,
    pin:       <><path d="M9 3h6l-1 6 4 4H6l4-4z" fill="currentColor" stroke="none" /><path d="M12 13v8" /></>,
    moves:     <><path d="M4 4l7 8-7 8M13 4l7 8-7 8" /></>,
    board:     <><rect x="3" y="4" width="18" height="13" /><path d="M8 21l4-4 4 4" /></>,
    session:   <><rect x="3" y="5" width="8" height="6" /><rect x="13" y="5" width="8" height="6" /><rect x="3" y="13" width="8" height="6" /><rect x="13" y="13" width="8" height="6" /></>,
    operation: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 1v5M12 18v5M1 12h5M18 12h5" /></>,
    tables:    <><path d="M3 6h18M3 12h18M3 18h18" /><path d="M7 3v18" /></>,
    users:     <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.4.6 4 2.8 4 6" /></>,
    motion:    <><path d="M2 12c3-6 5-6 8 0s5 6 8 0" /><path d="M18 8l3 4-3 4" /></>,
    motionOff: <><path d="M2 12c3-6 5-6 8 0s5 6 8 0" /><path d="M3 3l18 18" /></>,
    plus:      <><path d="M12 5v14M5 12h14" /></>,
    close:     <><path d="M6 6l12 12M18 6L6 18" /></>,
    check:     <><path d="M4 12l5 5L20 6" /></>,
    // Sélecteur des horloges et menaces (gm/IconPicker.jsx)
    skull:     <><path d="M5 11a7 7 0 0 1 14 0v3l-2 1v4H7v-4l-2-1z" /><circle cx="9" cy="11" r="1.8" /><circle cx="15" cy="11" r="1.8" /><path d="M11 17v2M13 17v2" /></>,
    eye:       <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    gun:       <><path d="M3 8h17v4H9l-1 6H4l1-6H3z" /><path d="M9 12v2h3" /></>,
    dna:       <><path d="M7 3c0 6 10 6 10 12M17 3c0 6-10 6-10 12M7 21c0-2 1-3 2-4M17 21c0-2-1-3-2-4" /><path d="M8 7h8M8 17h8" /></>,
    bomb:      <><circle cx="10" cy="14" r="7" /><path d="M15 9l3-3M18 6l1-1M20 3v2M21 6h-2" /></>,
    fire:      <><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-3 1-6 1-9z" /></>,
    bolt:      <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
    drop:      <><path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z" /></>,
    city:      <><path d="M3 21h18M5 21V9l4-2v14M9 21V4l6 3v14M15 21v-9l4 2v7" /></>,
    hourglass: <><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" /></>,
    bell:      <><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
    signal:    <><path d="M12 12v9" /><circle cx="12" cy="10" r="2" /><path d="M8 6a6 6 0 0 0 0 8M16 6a6 6 0 0 1 0 8M5 3a10 10 0 0 0 0 14M19 3a10 10 0 0 1 0 14" /></>,
    lock:      <><rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    target:    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
    chart:     <><path d="M3 20h18M5 16l5-5 4 3 6-7" /><path d="M16 7h4v4" /></>,
    wave:      <><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></>,
    person:    <><circle cx="12" cy="7" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
    place:     <><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
};

const SIZE_CLASS = { sm: 'cp-ico-sm', md: 'cp-ico', lg: 'cp-ico-lg' };

const CpIcon = ({ name, size = 'md', className = '', title }) => (
    <svg
        className={`${SIZE_CLASS[size] ?? 'cp-ico'} ${className}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}
    >
        {title && <title>{title}</title>}
        {PATHS[name] ?? null}
    </svg>
);

export default CpIcon;
