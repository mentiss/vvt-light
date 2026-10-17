// src/client/src/systems/vikings/components/ui/VkIcon.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Icônes au trait, d'esprit 9ᵉ siècle (remplacent les emojis — lot 4).
// Tracés identiques au sprite de la planche validée
// (documentations/refonte_vikings/UIkit_complet.source.html), viewBox 24×24,
// style porté par la classe .vk-icon du thème (trait = currentColor).
//
// Usage : <VkIcon name="axe" /> · <VkIcon name="die" className="vk-icon-lg" title="Lancer" />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const Dot = ({ cx, cy, r = 1 }) => <circle cx={cx} cy={cy} r={r} fill="currentColor" />;

const ICONS = {
    die: <><rect x="8" y="2.5" width="8" height="19" rx="2.2" /><Dot cx="12" cy="7" /><Dot cx="12" cy="12" /><Dot cx="12" cy="17" /></>,
    dice: <>
        <rect x="3" y="5" width="7" height="15" rx="2" transform="rotate(-12 6.5 12.5)" />
        <rect x="14" y="4" width="7" height="15" rx="2" transform="rotate(10 17.5 11.5)" />
        <Dot cx="6.5" cy="9.5" r=".9" /><Dot cx="6.9" cy="15" r=".9" />
        <Dot cx="17.3" cy="8.5" r=".9" /><Dot cx="17.7" cy="11.5" r=".9" /><Dot cx="17.9" cy="14.5" r=".9" />
    </>,
    axe:       <><path d="M4.5 21.5 15.5 6" /><path d="M13.6 8.7C12.8 5.3 14.6 2.6 18.2 2.2c.5 2.4 2 3.9 3.6 4.4-1 3.4-4 5.4-7.2 4.5" /></>,
    shield:    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" /><path d="M12 3v6.6M12 14.4V21M3 12h6.6M14.4 12H21" /></>,
    pouch:     <><path d="M9 7h6" /><path d="M9.5 7C6.5 9.5 5 12.5 5 15.5a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5c0-3-1.5-6-4.5-8.5" /><path d="M10 7 9 3.5M14 7l1-3.5" /></>,
    longhouse: <><path d="M2.5 12 12 6l9.5 6" /><path d="M5 10.5V19h14v-8.5" /><path d="M10.5 19v-4.5h3V19" /><path d="M12 6 10 3M12 6l2-3" /></>,
    scroll:    <><path d="M5 4.5a2 2 0 0 1 4 0V18a2.5 2.5 0 0 1-2.5 2.5" /><path d="M5 4.5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6.5" /><path d="M11.5 9h5M11.5 12.5h5M11.5 16h3" /></>,
    key:       <><circle cx="7" cy="12" r="3.5" /><path d="M10.5 12H21M17 12v3.5M20 12v2.5" /></>,
    sun:       <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
    moon:      <path d="M16 3.5A8.5 8.5 0 1 0 20.5 16 7 7 0 0 1 16 3.5z" />,
    quill:     <><path d="M20 3C12 4 7.5 9 6 17l-2 4" /><path d="M20 3c-.5 6-4 10.5-11 12.5" /><path d="M9.5 11.5h4" /></>,
    close:     <path d="M6 6l12 12M18 6 6 18" />,
    plus:      <path d="M12 5v14M5 12h14" />,
    minus:     <path d="M5 12h14" />,
    menu:      <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
    tree:      <><path d="M12 21V3" /><path d="M12 13 7 9.5M12 11l5-3.5M12 8.5 9 4.5M12 8.5l3-4" /><path d="M12 21l-4.5 1M12 21l4.5 1M12 18.5 8.5 21M12 18.5l3.5 2.5" /></>,
    helm:      <><path d="M4.5 15.5a7.5 7.5 0 0 1 15 0" /><path d="M4.5 15.5h15" /><path d="M12 8V3.5M12 15.5V21" /><path d="M8 9.5l1.4 6M16 9.5l-1.4 6" /></>,
    portrait:  <><circle cx="12" cy="9" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    people:    <><circle cx="9" cy="9" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M15 5.5a3.5 3.5 0 0 1 0 7M17.5 14.3a6.5 6.5 0 0 1 4 5.7" /></>,
    door:      <><path d="M14 3H6v18h8" /><path d="M14 3l5 2v14l-5 2z" /><path d="M16 12h.01" /></>,
    check:     <path d="M4.5 12.5 9 17 19.5 6.5" />,
    up:        <path d="M6 15l6-6 6 6" />,
    down:      <path d="M6 9l6 6 6-6" />,
    blood:     <path d="M12 3c3.5 4.5 6 8 6 11.5a6 6 0 0 1-12 0C6 11 8.5 7.5 12 3z" />,
    arrow:     <><path d="M4 20 19 5" /><path d="M14 4.5h5.5V10" /><path d="M4 20l1-4M4 20l4-1M6.5 17.5l1-3.5M6.5 17.5l3.5-1" /></>,
    eye:       <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></>,
    horn:      <><path d="M3 7c4 0 7 2 9 5s4.5 6 9 6c-1.5 1.5-3.5 2.5-6 2.5C9 20.5 5 14 3 7z" /><path d="M7 9.5 5.5 13M10.5 13.5 9 17" /></>,
};

const VkIcon = ({ name, className = '', title }) => (
    <svg viewBox="0 0 24 24" className={`vk-icon ${className}`.trim()}
         aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
        {title && <title>{title}</title>}
        {ICONS[name] ?? null}
    </svg>
);

export default VkIcon;
