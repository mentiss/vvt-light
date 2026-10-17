// src/client/src/systems/vikings/components/ui/RuneTitle.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Titre en futhark du bandeau joueur (spec lot 4 §5) : un mot au hasard parmi
// RUNE_TITLES, qui change toutes les 7 s dans un fondu « mirage » et une fumée.
// Les classes .is-changing / .is-out / .is-in pilotent les animations du thème
// (.vk-rune-title) ; la distorsion vient du filtre SVG #vk-mirage, rendu ici
// hors de tout <svg display:none> (sinon le filtre n'est pas appliqué).
// Désactivé visuellement par prefers-reduced-motion (thème).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Odin, Viking, Jarl, Volva, Skald, Pure
const RUNE_TITLES = ['ᛟᛞᛁᚾ', 'ᚢᛁᚲᛁᛜ', 'ᛃᚨᚱᛚ', 'ᚢᛟᛚᚢᚨ', 'ᛊᚲᚨᛚᛞ', 'ᛈᚢᚱᛖ'];
const INTERVAL_MS = 7000;
const OUT_MS      = 900;
const TOTAL_MS    = 2400;

const pickOther = (current) => {
    const others = RUNE_TITLES.filter(t => t !== current);
    return others[Math.floor(Math.random() * others.length)];
};

const RuneTitle = ({ className = '' }) => {
    const [word,  setWord]  = useState(() => pickOther(null));
    const [phase, setPhase] = useState(null);   // null | 'out' | 'in'
    const timers = useRef([]);

    const change = useCallback(() => {
        if (timers.current.length) return;   // transition en cours
        setPhase('out');
        timers.current = [
            setTimeout(() => { setWord(pickOther); setPhase('in'); }, OUT_MS),
            setTimeout(() => { setPhase(null); timers.current = []; }, TOTAL_MS),
        ];
    }, []);

    useEffect(() => {
        const id = setInterval(change, INTERVAL_MS);
        return () => { clearInterval(id); timers.current.forEach(clearTimeout); timers.current = []; };
    }, [change]);

    const state = phase ? `is-changing is-${phase}` : '';

    return (
        <>
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <filter id="vk-mirage" x="-20%" y="-60%" width="140%" height="220%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015 0.09" numOctaves="2" seed="7" result="noise">
                        <animate attributeName="baseFrequency" dur="2.4s" values="0.015 0.09;0.03 0.14;0.015 0.09" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>
            <span className={`vk-rune-title ${state} ${className}`.trim()} onClick={change} aria-hidden="true">
                <span className="vk-mirage"><span>{word}</span></span>
            </span>
        </>
    );
};

export default RuneTitle;
