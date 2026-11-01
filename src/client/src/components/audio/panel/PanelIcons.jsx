// src/client/src/components/audio/panel/PanelIcons.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Icônes du panneau MJ de la musique (traits SVG, couleur du texte) et boutons icônes,
// toujours nommés pour les lecteurs d'écran (documentations/spec_audio.md §11.13).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const PATHS = {
    pause: 'M8 5v14M16 5v14',
    prev: 'M18 6l-8 6 8 6M6 6v12',
    next: 'M6 6l8 6-8 6M18 6v12',
    close: 'M6 6l12 12M18 6L6 18',
    stop: 'M6 6h12v12H6z',
    scenes: 'M4 10h16v10H4zM4 10l2-5h14l-2 5M9 5l-2 5M14 5l-2 5',
    layers: 'M3 9c3-2 6 2 9 0s6-2 9 0M3 15c3-2 6 2 9 0s6-2 9 0',
    plus: 'M12 5v14M5 12h14',
    back: 'M15 6l-6 6 6 6',
    folder: 'M3 7h6l2 2h10v10H3z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    globe: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18',
    search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-3.5-3.5',
    minimize: 'M5 12h14',
    restore: 'M5 5h14v14H5z',
    expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    reduce: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
    playlist: 'M4 7h12M4 12h12M4 17h8M17 15l3 2-3 2',
    loop: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
    shuffle: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
    once: 'M5 12h14',
};

export const Icon = ({ name, size = 16 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {name === 'play' && <path d="M7 5l12 7-12 7z" fill="currentColor" />}
        {name === 'more' && [5, 12, 19].map(x => <circle key={x} cx={x} cy="12" r="1.3" fill="currentColor" />)}
        {PATHS[name] && <path d={PATHS[name]} />}
    </svg>
);

export const IconButton = ({ icon, label, onClick, disabled, main, danger, size, ...rest }) => (
    <button type="button" className={`vtt-audio-icon-btn${main ? ' is-main' : ''}${danger ? ' is-danger' : ''}`}
            aria-label={label} title={label} onClick={onClick} disabled={disabled} {...rest}>
        <Icon name={icon} size={size ?? (main ? 20 : 16)} />
    </button>
);

export const Equalizer = ({ playing }) => <span className={`vtt-audio-eq${playing ? '' : ' is-paused'}`} aria-hidden="true"><i /><i /><i /></span>;
