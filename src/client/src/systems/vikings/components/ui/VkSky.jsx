// src/client/src/systems/vikings/components/ui/VkSky.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ciel vivant de la pierre peinte (spec_vikings_pierre_peinte.md D-13, §3 ; planche) :
//   jour   : ciel nordique, nuages en parallaxe, rayons de soleil ; gain de SAGA = un
//            rayon balaie le ciel et des corbeaux passent ; triple 10 = le soleil perce
//            en or ; blessures (page joueur) = crépuscule de sang à partir de Critique ;
//   aurore : rideaux de rayons sur trois plans ; gain de SAGA = vague de lumière ;
//            triple 10 = éruption dorée ; blessures = aurore de sang ; KO = ciel éteint ;
//   foyer  : lueur du foyer et braises (CSS).
// Triple 10 : la rune ᛊ apparaît (et, sans ciel vivant, un éclair frappe).
// Fixé derrière la page (z-index −1 dans .vk-root, isolé par le thème). Rien en bois et
// or. Animations coupées : ciel dessiné une fois, figé ; pas de présage.
//
// <VkSky hurt={0..1} out={bool} characterId={id|null} />  (hurt/out : page joueur seulement)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { useVkLook, livingOn, VK_SAGA_GAIN, VK_TRIPLE } from '../../hooks/useVkLook.js';

const K = 0.5;   // résolution du canvas (moitié de l'écran : flou naturel, coût réduit)

// ── Aurore ───────────────────────────────────────────────────────────────────
let RAY = null;
const rayStrip = () => {
    if (RAY) return RAY;
    const c = document.createElement('canvas'); c.width = 1; c.height = 256;
    const x = c.getContext('2d'), g = x.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, 'rgba(190,255,210,0)'); g.addColorStop(.03, 'rgba(170,255,200,1)'); g.addColorStop(.1, 'rgba(70,255,150,.85)');
    g.addColorStop(.35, 'rgba(40,220,160,.42)'); g.addColorStop(.62, 'rgba(70,150,255,.18)'); g.addColorStop(.85, 'rgba(170,80,255,.08)'); g.addColorStop(1, 'rgba(190,70,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 1, 256);
    return (RAY = c);
};
const CURTAINS = [
    { y: .24, h: .20, a: .45, f: 1.6, sp: .7,  ph: 2 },
    { y: .36, h: .34, a: .95, f: 1.0, sp: 1.0, ph: 0 },
    { y: .46, h: .30, a: .55, f: .75, sp: 1.3, ph: 5 },
];
const drawAurora = (s, T) => {
    const { ctx, cv } = s, W = cv.width, H = cv.height, step = 2;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const haze = ctx.createRadialGradient(W * .5, H * .38, 10, W * .5, H * .38, W * .6);
    haze.addColorStop(0, `rgba(60,200,140,${.07 * (1 + s.boost)})`); haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, 0, W, H);
    s.waves = s.waves.filter(w => (T - w.t0) * w.v - 300 < W / K);
    const strip = rayStrip();
    for (const c of CURTAINS) {
        for (let x = 0; x < W; x += step) {
            const X = x / K;
            const base = H * c.y + K * (42 * Math.sin(X * .0032 * c.f + T * .16 * c.sp + c.ph) + 16 * Math.sin(X * .0095 * c.f - T * .29 * c.sp));
            let I = .18 + .42 * Math.sin(X * .0058 * c.f + T * .33 * c.sp + c.ph) + .28 * Math.sin(X * .019 - T * .75 * c.sp) + .14 * Math.sin(X * .061 + T * 1.9);
            I = Math.max(0, I) ** 1.35 * c.a;
            for (const w of s.waves) { const wx = (T - w.t0) * w.v - 300; if (T >= w.t0) I += w.amp * c.a * Math.exp(-(((X - wx) / 170) ** 2)); }
            I *= 1 + s.boost;
            if (I < .02) continue;
            const hr = H * c.h * (.62 + .38 * Math.sin(X * .011 + T * .23 + c.ph)) * (1 + .35 * s.boost);
            ctx.globalAlpha = Math.min(1, I);
            ctx.drawImage(strip, 0, 0, 1, 256, x, base - hr, step + .7, hr);
        }
    }
    s.boost *= .985;
};

// ── Ciel de jour ─────────────────────────────────────────────────────────────
const rng = (seed) => { let v = seed * 9301 + 49297; return () => ((v = (v * 9301 + 49297) % 233280) / 233280); };
let CLOUDS = null;
const clouds = () => {
    if (CLOUDS) return CLOUDS;
    CLOUDS = [1, 2, 3, 4, 5].map(seed => {
        const r = rng(seed), c = document.createElement('canvas'); c.width = 420; c.height = 150;
        const x = c.getContext('2d');
        for (let i = 0; i < 26; i++) {
            const cx = 420 * (.12 + .76 * r()), cy = 150 * (.42 + .3 * r()), rad = 150 * (.16 + .26 * r());
            const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
            g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = g; x.fillRect(0, 0, 420, 150);
        }
        x.globalCompositeOperation = 'source-atop';
        const sh = x.createLinearGradient(0, 40, 0, 150); sh.addColorStop(0, 'rgba(120,125,140,0)'); sh.addColorStop(1, 'rgba(110,115,130,.35)');
        x.fillStyle = sh; x.fillRect(0, 0, 420, 150);
        return c;
    });
    return CLOUDS;
};
const CLOUD_LAYERS = [{ y: .04, sc: 1.25, sp: 5, a: .9, n: 4 }, { y: .17, sc: .9, sp: 9, a: .75, n: 5 }, { y: .29, sc: .65, sp: 14, a: .6, n: 6 }];
const drawDay = (s, T) => {
    const { ctx, cv } = s, W = cv.width, H = cv.height, dt = Math.min(.1, T - (s.last || T)); s.last = T;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#93a9bb'); sky.addColorStop(.45, '#c3cbcc'); sky.addColorStop(.8, '#d5d0c5'); sky.addColorStop(1, '#d3ccbf');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const sx = W * .8, sy = -H * .05, b = 1 + s.boost;
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .55 * (1 + .4 * s.boost));
    glow.addColorStop(0, `rgba(255,250,232,${Math.min(1, .95 * b)})`); glow.addColorStop(1, 'rgba(255,250,232,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    const len = Math.hypot(W, H) * 1.1, rays = [];
    for (let i = 0; i < 10; i++) rays.push({ a: 1.75 + i * .13 + .05 * Math.sin(T * .06 + i * 2.1), w: .035 + .015 * Math.sin(i * 1.3), al: (.07 + .05 * Math.sin(T * .27 + i * 1.7)) * b });
    s.sweeps = s.sweeps.filter(w => T - w.t0 < 1.8);
    for (const w of s.sweeps) if (T >= w.t0) rays.push({ a: 1.55 + (T - w.t0) / 1.8 * 1.5, w: .07, al: .35 * Math.sin(Math.PI * (T - w.t0) / 1.8) });
    for (const r of rays) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, len);
        g.addColorStop(0, `rgba(255,248,225,${Math.min(1, r.al)})`); g.addColorStop(.7, `rgba(255,248,225,${Math.min(1, r.al) * .25})`); g.addColorStop(1, 'rgba(255,248,225,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(r.a - r.w) * len, sy + Math.sin(r.a - r.w) * len); ctx.lineTo(sx + Math.cos(r.a + r.w) * len, sy + Math.sin(r.a + r.w) * len); ctx.closePath(); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    const cl = clouds();
    CLOUD_LAYERS.forEach((L, li) => {
        const cw = 420 * L.sc * K * 1.6, ch = 150 * L.sc * K * 1.6, span = W + cw;
        for (let j = 0; j < L.n; j++) {
            const x = ((j * span / L.n + T * L.sp * K * 2) % span) - cw;
            ctx.globalAlpha = L.a; ctx.drawImage(cl[(j + li) % cl.length], x, H * L.y + (j % 2) * ch * .25, cw, ch);
        }
    });
    ctx.globalAlpha = 1;
    if (s.hurt > 0) {   // ciel lourd en haut, lueur rouge à l'horizon
        const h = s.hurt, g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgb(${255 - 120 * h | 0}, ${255 - 175 * h | 0}, ${255 - 165 * h | 0})`);
        g.addColorStop(.45, `rgb(255, ${255 - 100 * h | 0}, ${255 - 135 * h | 0})`); g.addColorStop(.8, 'rgb(255,255,255)');
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (s.boost > .05) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,200,90,${.22 * s.boost})`; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over';
    s.birds = s.birds.filter(bd => bd.x < W / K + 80);
    for (const bd of s.birds) {   // corbeaux qui traversent le ciel
        bd.x += bd.vx * dt; bd.y += Math.sin(T * 1.4 + bd.ph) * 12 * dt - 8 * dt;
        const x = bd.x * K, y = bd.y * K, z = bd.size * K, f = Math.sin(T * 9 + bd.ph);
        ctx.strokeStyle = 'rgba(22,18,16,.88)'; ctx.fillStyle = 'rgba(22,18,16,.88)'; ctx.lineWidth = Math.max(1, z * .2); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - z, y - f * z * .6);
        ctx.quadraticCurveTo(x - z * .45, y - z * .25 - f * z * .35, x, y);
        ctx.quadraticCurveTo(x + z * .45, y - z * .25 - f * z * .35, x + z, y - f * z * .6); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + z * .08, y + z * .05, z * .22, z * .1, 0, 0, Math.PI * 2); ctx.fill();
    }
    s.boost *= .985;
};

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`, dx: `${((i * 53) % 120) - 60}px`, dur: `${7 + (i * 7) % 8}s`, delay: `${-((i * 3) % 12)}s`,
}));

const VkSky = ({ hurt = 0, out = false, characterId = null }) => {
    const [look] = useVkLook();
    const live = livingOn(look);
    const [mode, setMode] = useState(null);   // 'day' | 'aurore' | 'foyer' | null
    const [omen, setOmen] = useState(0);      // clé du présage en cours (0 : aucun)
    const canvasRef = useRef(null);
    const state = useRef({ waves: [], sweeps: [], birds: [], boost: 0, hurt: 0, last: 0 });

    // Jour / nuit : data-theme est posé sur <html> par la plateforme
    useEffect(() => {
        const read = () => {
            if (look.skin !== 'pierre') return setMode(null);
            const dark = document.documentElement.dataset.theme === 'dark';
            setMode(dark ? look.night : 'day');
        };
        read();
        const obs = new MutationObserver(read);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, [look.skin, look.night]);

    // Jour : crépuscule de sang à partir de Critique seulement (sinon le ciel vire au rose)
    useEffect(() => { state.current.hurt = hurt >= .6 ? (hurt - .35) / .65 : 0; }, [hurt]);

    // Dessin : boucle animée, ou une image figée quand les animations sont coupées
    useEffect(() => {
        const cv = canvasRef.current;
        if (!cv || (mode !== 'day' && mode !== 'aurore')) return undefined;
        const s = state.current;
        s.cv = cv; s.ctx = cv.getContext('2d');
        const draw = mode === 'day' ? drawDay : drawAurora;
        const resize = () => { cv.width = Math.max(1, innerWidth * K | 0); cv.height = Math.max(1, innerHeight * K | 0); if (!live) draw(s, 40); };
        resize();
        window.addEventListener('resize', resize);
        let raf = 0;
        if (live) {
            const loop = (t) => { if (!document.hidden) draw(s, t / 1000); raf = requestAnimationFrame(loop); };
            raf = requestAnimationFrame(loop);
        }
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [mode, live]);

    // Réactions au jeu
    useEffect(() => {
        if (!live) return undefined;
        const s = state.current;
        const mine = (e) => characterId == null || e.detail?.id == null || e.detail.id === characterId;
        const onGain = (e) => {
            if (!mine(e)) return;
            const T = performance.now() / 1000;
            s.waves.push({ t0: T, v: 900, amp: .9 });
            s.sweeps.push({ t0: T });
            const H = innerHeight;
            for (let i = 0; i < 3; i++) s.birds.push({ x: -40 - i * 60 - Math.random() * 30, y: H * (.12 + .07 * i), vx: 210 + 25 * i, ph: i * 1.7, size: 15 + 4 * (2 - i) });
        };
        const onTriple = (e) => {
            if (!mine(e)) return;
            const T = performance.now() / 1000;
            s.boost = 1.9;
            [0, .35, .7].forEach(d => { s.waves.push({ t0: T + d, v: 1100, amp: 1.4 }); s.sweeps.push({ t0: T + d }); });
            setOmen(k => k + 1);
            setTimeout(() => setOmen(0), 2700);
        };
        window.addEventListener(VK_SAGA_GAIN, onGain);
        window.addEventListener(VK_TRIPLE, onTriple);
        return () => { window.removeEventListener(VK_SAGA_GAIN, onGain); window.removeEventListener(VK_TRIPLE, onTriple); };
    }, [live, characterId]);

    if (!mode) return null;
    const hue = mode === 'aurore' ? [0, 0, -30, -70, -125, -125][Math.round(hurt * 5)] ?? 0 : 0;
    return (
        <>
            <div className={`vk-sky is-${mode} ${omen ? 'is-erupting' : ''}`} aria-hidden="true"
                 style={{ '--vk-sky-hue': `${hue}deg`, '--vk-sky-bright': out ? '.35' : '1' }}>
                {(mode === 'day' || mode === 'aurore') && <canvas ref={canvasRef} />}
                {mode === 'foyer' && (
                    <>
                        <div className="vk-hearth" />
                        {live && <div className="vk-embers">{EMBERS.map((e, i) => <i key={i} style={{ left: e.left, '--dx': e.dx, animationDuration: e.dur, animationDelay: e.delay }} />)}</div>}
                    </>
                )}
            </div>
            {/* Présage du triple 10 : devant la page (le ciel, lui, est derrière) */}
            {omen > 0 && (
                <div key={omen} className="vk-omen-layer" aria-hidden="true">
                    {mode === 'foyer' && <div className="vk-flash" />}
                    <div className="vk-omen"><span>ᛊ</span></div>
                </div>
            )}
        </>
    );
};

export default VkSky;
