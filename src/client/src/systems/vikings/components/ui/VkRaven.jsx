// src/client/src/systems/vikings/components/ui/VkRaven.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corbeau d'Odin (spec_vikings_pierre_peinte.md D-14, planche) : dessin « ocre et
// entrelacs » (masques assets/raven-*.png, silhouette teintée var(--color-primary),
// traits gravés noirs). Il vient se poser sur l'arête de la dalle État, vit sa vie
// (se retourne, picore, sautille, se redresse, s'ébouriffe) et repart au bout de 20 à
// 35 s ou au clic. Visites : quelques secondes après l'ouverture, puis de temps en temps,
// et après un gain de SAGA du personnage. KO : il reste (présage). Sans son.
// Pierre peinte avec animations seulement. Rendu dans la dalle État (parent positionné).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { useVkLook, livingOn, VK_SAGA_GAIN } from '../../hooks/useVkLook.js';

const FIRST_VISIT_MS = 4500;
const VISIT_EVERY_MS = 20000, VISIT_CHANCE = .3;
const STAY_MIN_MS = 18000, STAY_MORE_MS = 17000;

const tween = (dur, fn, done) => {
    const t0 = performance.now();
    let raf = 0;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); fn(k); if (k < 1) raf = requestAnimationFrame(step); else done?.(); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
};
const bez = (p0, p1, p2, p3, k) => [0, 1].map(i => (1 - k) ** 3 * p0[i] + 3 * (1 - k) ** 2 * k * p1[i] + 3 * (1 - k) * k * k * p2[i] + k ** 3 * p3[i]);

// once : une seule visite, sans retour (naissance du personnage, fin de l'assistant de création)
const VkRaven = ({ characterId, ko = false, once = false }) => {
    const [look] = useVkLook();
    const live = livingOn(look);
    const ref = useRef(null);
    const koRef = useRef(ko);
    useEffect(() => { koRef.current = ko; }, [ko]);

    useEffect(() => {
        const el = ref.current;
        if (!el || !live) return undefined;
        const host = el.parentElement;
        const fly = el.querySelector('.vk-raven-fly');
        let state = 'away', x = 0, stayUntil = 0;
        const timers = new Set(), cancels = new Set();
        const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
        const pose = (tx, ty, flap, tilt) => { el.style.transform = `translate(${tx}px, ${ty}px) rotate(${tilt}deg)`; fly.classList.toggle('is-down', flap > 0); };
        const run = (dur, fn, done) => { const c = tween(dur, fn, () => { cancels.delete(c); done?.(); }); cancels.add(c); };

        const idle = () => {
            if (state !== 'perched') return;
            if (performance.now() > stayUntil && !koRef.current) { leave(); return; }
            const act = ['turn', 'peck', 'look', 'hop', 'ruffle', 'peck', 'look'][Math.random() * 7 | 0];
            if (act === 'turn') el.classList.toggle('is-right');
            else if (act === 'hop') {
                const w = host.clientWidth, x0 = x;
                const nx = Math.max(w * .42, Math.min(w - 100, x0 + (Math.random() < .5 ? -16 : 16)));
                run(320, k => { el.style.left = `${x0 + (nx - x0) * k}px`; el.style.transform = `translate(0, ${-Math.sin(Math.PI * k) * 10}px)`; }, () => { x = nx; el.style.transform = ''; });
            } else {
                const ms = { peck: 230, look: 900, ruffle: 440 }[act];
                el.classList.add(`is-${act}`); later(() => el.classList.remove(`is-${act}`), ms);
                if (act === 'peck') later(() => { el.classList.add('is-peck'); later(() => el.classList.remove('is-peck'), 200); }, 430);
            }
            later(idle, 1300 + Math.random() * 2600);
        };
        const perch = () => { state = 'perched'; stayUntil = performance.now() + STAY_MIN_MS + Math.random() * STAY_MORE_MS; later(idle, 900); };
        const arrive = () => {
            if (state !== 'away' || document.hidden || !host.offsetParent) return;
            const w = host.clientWidth;
            x = w * (.5 + .36 * Math.random());
            el.style.left = `${x}px`; el.classList.remove('is-right'); el.classList.add('is-on', 'is-flying');
            state = 'arriving';
            const p0 = [w - x + 260, -390], p1 = [p0[0] * .45, -330], p2 = [95, -75], p3 = [0, 0];
            run(2400, k => {
                const [tx, ty] = bez(p0, p1, p2, p3, 1 - (1 - k) ** 1.7);
                pose(tx, ty, k < .8 ? Math.sin(k * 2.4 * 10) : -1, k < .8 ? 10 : 10 * (1 - (k - .8) / .2));
            }, () => { el.classList.remove('is-flying'); el.style.transform = ''; perch(); });
        };
        const leave = () => {
            if (state !== 'perched') return;
            timers.forEach(clearTimeout); timers.clear();
            state = 'leaving';
            el.classList.remove('is-right', 'is-peck', 'is-look'); el.classList.add('is-flying');
            const p3 = [-(x + 320), -430];
            run(1900, k => { const [tx, ty] = bez([0, 0], [-30, -70], [-210, -170], p3, k ** 1.35); pose(tx, ty, Math.sin(k * 1.9 * 12), -8); },
                () => { el.classList.remove('is-on', 'is-flying'); el.style.transform = ''; state = 'away'; });
        };

        el.onclick = (e) => { e.stopPropagation(); leave(); };
        const first = setTimeout(arrive, FIRST_VISIT_MS);
        const every = once ? null : setInterval(() => { if (Math.random() < VISIT_CHANCE) arrive(); }, VISIT_EVERY_MS);
        const onGain = (e) => { if (e.detail?.id == null || e.detail.id === characterId) setTimeout(arrive, 1600); };
        if (!once) window.addEventListener(VK_SAGA_GAIN, onGain);
        return () => {
            clearTimeout(first); clearInterval(every); timers.forEach(clearTimeout); cancels.forEach(c => c());
            window.removeEventListener(VK_SAGA_GAIN, onGain);
            el.onclick = null; el.classList.remove('is-on', 'is-flying'); el.style.transform = '';
        };
    }, [live, characterId, once]);

    if (!live) return null;
    return (
        <div ref={ref} className="vk-raven" title="Huginn" aria-hidden="true">
            <div className="vk-raven-img vk-raven-perch"><i className="f" /><i className="l" /></div>
            <div className="vk-raven-img vk-raven-fly"><div className="up"><i className="f" /><i className="l" /></div><div className="down"><i className="f" /><i className="l" /></div></div>
        </div>
    );
};

export default VkRaven;
