// src/client/src/systems/cyberpunk/components/ui/CpWorld.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Monde derrière l'interface (planche §1, spec_cyberpunk.md §3.1) : la ville, sa
// météo et ses néons. Purement décoratif, fixe, sous le contenu (theme.css :
// .cp-world). Monté à la racine (.cp-root) de la fiche, de l'interface MJ et de la
// création.
//
// Météo : 'auto' (pluie la nuit, smog le jour), 'rain', 'smog', 'clear'. Tant que
// le MJ ne la choisit pas pour la table (lot 4), c'est 'auto'.
// Les animations se coupent par le menu (useCpAmbience) ou par le système
// (mouvement réduit) ; la pluie est alors une image fixe.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { HamburgerMenuItem } from '../../../../components/ui/HamburgerMenu.jsx';
import CpIcon from './CpIcon.jsx';
import { useCpAmbience } from '../../hooks/useCpAmbience.js';

// ── Ville : silhouettes et fenêtres tirées une fois au chargement (graine fixe) ──
const buildCity = () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const paths = { far: '', near: '', win: '' };
    for (const layer of ['far', 'near']) {
        const isNear = layer === 'near';
        let x = -20;
        while (x < 1620) {
            const w = Math.round(40 + rnd() * (isNear ? 90 : 60));
            const h = Math.round((isNear ? 180 : 260) + rnd() * (isNear ? 260 : 300));
            paths[layer] += `M${x} ${600 - h}h${w}v${h}h${-w}z`;
            if (rnd() > .8) paths[layer] += `M${x + Math.round(w / 2)} ${600 - h - 30}h2v30h-2z`;   // antenne
            if (isNear) {
                for (let wy = 600 - h + 12; wy < 590; wy += 14) {
                    for (let wx = x + 6; wx < x + w - 6; wx += 10) {
                        if (rnd() > .78) paths.win += `M${wx} ${wy}h4v6h-4z`;
                    }
                }
            }
            x += w + (isNear ? 4 : 10);
        }
    }
    return paths;
};
const CITY = buildCity();

// ── Mode jour / nuit : lu sur <html data-theme> (posé par la plateforme) ──
const subscribeTheme = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
};
const getIsDark = () => document.documentElement.dataset.theme === 'dark';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// ── Pluie (nuit ou jour) et poussière du smog, sur un canvas ──
const useWeatherCanvas = (canvasRef, sky, isDark, animate) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        let drops = [];
        let frame = 0;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops = Array.from({ length: Math.round(window.innerWidth / 9) }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                l: 10 + Math.random() * 16, s: 9 + Math.random() * 9,
            }));
        };
        const draw = (moving) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (sky === 'rain') {
                ctx.strokeStyle = isDark ? 'rgba(150, 200, 255, .22)' : 'rgba(215, 200, 175, .20)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (const d of drops) {
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x - 2, d.y + d.l);
                    if (moving) {
                        d.y += d.s; d.x -= 1;
                        if (d.y > canvas.height) { d.y = -20; d.x = Math.random() * canvas.width; }
                    }
                }
                ctx.stroke();
            } else if (sky === 'smog') {
                ctx.fillStyle = isDark ? 'rgba(200, 160, 255, .10)' : 'rgba(255, 210, 150, .12)';
                for (const d of drops) {
                    ctx.fillRect(d.x, d.y, 1.5, 1.5);
                    if (moving) {
                        d.x += .25; d.y += .08;
                        if (d.x > canvas.width) d.x = 0;
                        if (d.y > canvas.height) d.y = 0;
                    }
                }
            }
        };
        resize();
        const moving = animate && sky !== 'clear' && !reducedMotion();
        const tick = () => { draw(true); frame = requestAnimationFrame(tick); };
        if (moving) tick(); else draw(false);
        const onResize = () => { resize(); if (!moving) draw(false); };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); };
    }, [canvasRef, sky, isDark, animate]);
};

const CpWorld = ({ weather = 'auto' }) => {
    const isDark = useSyncExternalStore(subscribeTheme, getIsDark);
    const [ambience] = useCpAmbience();
    const canvasRef = useRef(null);
    const sky = weather === 'auto' ? (isDark ? 'rain' : 'smog') : weather;
    useWeatherCanvas(canvasRef, sky, isDark, ambience.animations);

    return (
        <div className="cp-world" data-sky={sky} data-anim={ambience.animations ? 'on' : 'off'} aria-hidden="true">
            <div className="cp-world-sun" />
            <span className="cp-aero" />
            <span className="cp-beam is-left" />
            <span className="cp-beam is-right" />
            <svg className="cp-world-city" viewBox="0 0 1600 600" preserveAspectRatio="none">
                <path className="far" d={CITY.far} />
                <path className="near" d={CITY.near} />
                <path className="win" d={CITY.win} />
            </svg>
            <div className="cp-fog"><i className="f1" /><i className="f2" /><i className="f3" /><i className="ground" /></div>
            <div className="cp-world-haze" />
            <div className="cp-sign is-left">RIPPERDOC 24/7</div>
            <div className="cp-sign is-right">HÔTEL CAPSULE</div>
            <canvas ref={canvasRef} className="cp-world-rain" />
            <div className="cp-world-scan" />
        </div>
    );
};

// Entrée de menu : couper / rétablir les animations du monde (réglage de ce navigateur)
export const CpAnimationsMenuItem = () => {
    const [ambience, setAmbience] = useCpAmbience();
    const on = ambience.animations;
    return (
        <HamburgerMenuItem
            icon={<CpIcon name={on ? 'motionOff' : 'motion'} />}
            onClick={() => setAmbience(prev => ({ ...prev, animations: !prev.animations }))}
        >
            {on ? 'Couper les animations' : 'Rétablir les animations'}
        </HamburgerMenuItem>
    );
};

export default CpWorld;
