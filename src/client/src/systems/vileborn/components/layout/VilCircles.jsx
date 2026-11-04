// src/client/src/systems/vileborn/components/layout/VilCircles.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Le U de la fiche : le portrait au centre, 5 cercles de Personnalité à gauche,
// 5 de Formation à droite, ceints de runes (planche validée). Les positions
// suivent un arc de cercle, du haut du U (125°) à son creux (22°), comme sur la
// fiche papier ; les runes sont un calque sous les cercles.
// Props : c (personnage), onAvatar (clic sur le portrait ; absent : lecture seule)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { WORD_SLOTS } from '../../config/approaches.js';

const W = 600;            // largeur de référence du U (px), positions en %
const CX = W / 2;
const CY = 178;
const R = 215;
const ANGLES = [125, 100, 75, 50, 22].slice(0, WORD_SLOTS);
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';

/** Suite de runes déterministe (un espace tous les 7 signes) */
export const runeText = (n, seed = 1) =>
    Array.from({ length: n }, (_, i) => (i % 7 === 6 ? ' ' : RUNES[(i * 7 + seed * 3) % RUNES.length])).join('');

const POINTS = Object.fromEntries(['left', 'right'].map(side => [side, ANGLES.map(deg => {
    const a = deg * Math.PI / 180;
    return { x: CX + (side === 'left' ? -1 : 1) * R * Math.sin(a), y: CY + R * Math.cos(a) };
})]));
const linkPath = (side) => POINTS[side].map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
const KIND = { left: 'personality', right: 'training' };

const Silhouette = () => (
    <svg viewBox="0 0 250 380" aria-hidden="true">
        <g fill="currentColor" opacity=".35"><circle cx="125" cy="78" r="40" /><path d="M60 380 C60 230 70 150 125 140 C180 150 190 230 190 380 Z" /></g>
    </svg>
);

const VilCircles = ({ c, onAvatar }) => {
    const words = (kind) => (c.words ?? []).filter(w => w.kind === kind).sort((a, b) => a.position - b.position);
    const Portrait = onAvatar ? 'button' : 'div';
    return (
        <div className="vil-u">
            {['left', 'right'].map(side => POINTS[side].map((p, i) => (
                <svg key={`r-${side}-${i}`} className="vil-circle-runes" style={{ left: `${p.x / W * 100}%`, top: p.y }} viewBox="-56 -56 112 112" aria-hidden="true">
                    <defs><path id={`vil-ring-${side}-${i}`} d="M0,-50 a50,50 0 1,1 -0.1,0" /></defs>
                    <text className="runes"><textPath href={`#vil-ring-${side}-${i}`}>{runeText(44, i + (side === 'left' ? 0 : 5))}</textPath></text>
                </svg>
            )))}
            <Portrait className="vil-u-portrait" {...(onAvatar ? { type: 'button', onClick: onAvatar, title: 'Changer le portrait' } : {})}>
                {c.avatar ? <img src={c.avatar} alt="" /> : <Silhouette />}
            </Portrait>
            <svg className="vil-u-link" viewBox={`0 0 ${W} 430`} preserveAspectRatio="none" aria-hidden="true">
                <path d={linkPath('left')} /><path d={linkPath('right')} />
            </svg>
            <span className="vil-u-side is-left">PERSONNALITÉ</span>
            <span className="vil-u-side is-right">FORMATION</span>
            {['left', 'right'].map(side => {
                const list = words(KIND[side]);
                return POINTS[side].map((p, i) => (
                    <div key={`c-${side}-${i}`} className={`vil-circle is-${side}`} style={{ left: `${p.x / W * 100}%`, top: p.y }}>
                        <svg viewBox="-46 -46 92 92" aria-hidden="true"><circle className="ring" r="45.5" /><circle className="ring-in" r="40.5" /></svg>
                        {list[i] && <span>{list[i].label}</span>}
                    </div>
                ));
            })}
            <span className="vil-u-heritage">SOMBRE HÉRITAGE</span>
        </div>
    );
};

export default VilCircles;
