// src/client/src/systems/woddavampire/components/layout/VdaBloodSoak.jsx
// ─────────────────────────────────────────────────────────────────────────────
// « La page boit le sang » (spec_woddavampire.md §II.9, planche_sang.html) :
// imprégnation depuis un bord ou un coin, lente (rapide puis de plus en plus
// lente), plus chargée à l'origine, puis séchage du bordeaux humide au brun mat.
// Couche absolue à poser dans un parent en position relative, sous le texte.
//
// Props : origin ('left'|'right'|'bottom'|'bl'|'br'|'tl'|'tr'), animate (sinon
// directement sec : vieilles entrées d'historique), grow / dry en ms.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef } from 'react';

// Couleurs : chaque zone (origine, milieu, front) a sa teinte humide et sèche
const COLORS = {
    light: { core: [74, 8, 4],   wet: [128, 22, 12], front: [70, 8, 4],    dryCore: [78, 30, 18],  dry: [116, 58, 38], dryFront: [92, 42, 28] },
    dark:  { core: [176, 24, 30], wet: [138, 18, 24], front: [196, 44, 40], dryCore: [150, 70, 50], dry: [116, 56, 40], dryFront: [132, 64, 46] },
};
// Origine en % de la page et rayon final en % du petit côté
const ORIGINS = {
    left: [-3, 50, 48], right: [103, 50, 48], bottom: [50, 106, 52],
    bl: [-2, 102, 60], br: [102, 102, 60], tl: [-2, -2, 60], tr: [102, -2, 60],
};
export const SOAK_ORIGINS_NO_TOP = ['left', 'right', 'bottom', 'bl', 'br'];

const lerp = (a, b, t) => a + (b - a) * t;
const rgb = (c, from, to, wet) => `rgb(${c[to].map((v, i) => Math.round(lerp(c[from][i], v, wet))).join(',')})`;
const isDark = () => document.documentElement.dataset.theme === 'dark'
    || !!document.querySelector('[data-theme="dark"]');

const VdaBloodSoak = ({ origin = 'left', animate = true, grow = 5000, dry = 5000, seed = 1 }) => {
    const id = useId().replace(/:/g, '');
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return undefined;
        const g = svg.querySelector('radialGradient');
        const stops = g.querySelectorAll('stop');
        const rect = svg.querySelector('rect');
        const { width: w, height: h } = svg.getBoundingClientRect();
        if (!w || !h) return undefined;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        rect.setAttribute('x', -w * 0.2); rect.setAttribute('y', -h * 0.2);
        rect.setAttribute('width', w * 1.4); rect.setAttribute('height', h * 1.4);
        const [ox, oy, rPct] = ORIGINS[origin] ?? ORIGINS.left;
        g.setAttribute('cx', (ox / 100) * w); g.setAttribute('cy', (oy / 100) * h);
        const R = (rPct / 100) * Math.min(w, h) * 1.15;
        const C = COLORS[isDark() ? 'dark' : 'light'];

        const paint = (wet) => {
            stops[0].setAttribute('stop-color', rgb(C, 'dryCore', 'core', wet));
            stops[1].setAttribute('stop-color', rgb(C, 'dry', 'wet', wet));
            stops[2].setAttribute('stop-color', rgb(C, 'dry', 'wet', wet));
            stops[3].setAttribute('stop-color', rgb(C, 'dryFront', 'front', wet));
            stops[4].setAttribute('stop-color', rgb(C, 'dryFront', 'front', wet));
            stops[3].setAttribute('stop-opacity', lerp(0.62, 0.82, wet).toFixed(2));
            stops[2].setAttribute('stop-opacity', lerp(0.42, 0.5, wet).toFixed(2));
        };

        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (!animate || reduced) { g.setAttribute('r', R); paint(0); return undefined; }

        paint(1);
        let frame;
        const t0 = performance.now();
        const step = (now) => {
            const t = now - t0;
            if (t < grow) {
                g.setAttribute('r', (R * (1 - Math.pow(1 - t / grow, 3))).toFixed(2));   // capillarité
                frame = requestAnimationFrame(step);
            } else if (t < grow + dry) {
                g.setAttribute('r', R);
                paint(1 - (t - grow) / dry);
                frame = requestAnimationFrame(step);
            } else {
                paint(0);
            }
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [origin, animate, grow, dry]);

    return (
        <div className="vda-soak-clip" aria-hidden="true">
            <svg ref={svgRef} className="vda-soak">
                <defs>
                    <filter id={`vsf${id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed={seed} result="warp" />
                        <feDisplacementMap in="SourceGraphic" in2="warp" scale="34" xChannelSelector="R" yChannelSelector="G" result="ragged" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed={seed + 7} result="fib" />
                        <feColorMatrix in="fib" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.26 1.1" result="fibA" />
                        <feComposite in="ragged" in2="fibA" operator="in" />
                    </filter>
                    <radialGradient id={`vsg${id}`} gradientUnits="userSpaceOnUse" r="0.1">
                        <stop offset="0" stopOpacity=".96" />
                        <stop offset=".35" stopOpacity=".8" />
                        <stop offset=".8" stopOpacity=".5" />
                        <stop offset=".93" stopOpacity=".82" />
                        <stop offset="1" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect fill={`url(#vsg${id})`} filter={`url(#vsf${id})`} />
            </svg>
        </div>
    );
};

export default VdaBloodSoak;
