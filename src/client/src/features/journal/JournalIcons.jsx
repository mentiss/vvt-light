// features/journal/JournalIcons.jsx — icônes au trait du journal (pas d'emoji)
import React from 'react';

const Svg = ({ children, size = 16 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const PinIcon = () => <Svg><path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5z" /><path d="M12 14v6" /></Svg>;
export const TrashIcon = () => <Svg><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
export const ShareIcon = () => <Svg><path d="M4 12v7h16v-7" /><path d="M12 3v12M7 8l5-5 5 5" /></Svg>;
export const CopyIcon = () => <Svg><rect x="8" y="8" width="12" height="12" rx="1" /><path d="M4 16V4h12" /></Svg>;
export const DownloadIcon = () => <Svg><path d="M12 4v11M7 10l5 5 5-5" /><path d="M4 19h16" /></Svg>;
export const PlusIcon = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
export const ChevronIcon = ({ right }) => <Svg><path d={right ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} /></Svg>;
