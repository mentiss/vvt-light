// src/client/src/systems/vikings/components/ui/VkSerpent.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ruban-serpent de l'en-tête du personnage (spec_vikings_pierre_peinte.md D-4, §3,
// planche refonte_vikings/planche_pierre_peinte.html) : il suit le bord de l'en-tête
// (queue en bas à gauche, tête en bas à droite) et porte une inscription en runes.
// Redessiné à la taille du parent (ResizeObserver). Couleurs : --vk-band,
// --vk-band-edge, --vk-band-text (ocre en pierre peinte, cuir et or en bois et or).
// Vivant (les deux habillages, animations actives, lot 5) :
//   - gravure à l'ouverture : le ruban se trace, l'inscription s'y glisse ;
//   - l'inscription coule ensuite lentement ; l'œil cligne (thème) ;
//   - gain de SAGA ou triple 10 du personnage : le ruban s'embrase.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef } from 'react';
import { useVkLook, livingOn, VK_SAGA_GAIN, VK_TRIPLE } from '../../hooks/useVkLook.js';

const M = 16, R = 46;
const TEXT_START = 40;

const draw = (svg, pid, inscription) => {
    const host = svg.parentElement;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return null;
    const d = `M ${M + 30} ${h - 8} C ${M} ${h - 8}, ${M} ${h - 30}, ${M} ${h - 46} L ${M} ${M + R} Q ${M} ${M}, ${M + R} ${M}`
            + ` L ${w - M - R} ${M} Q ${w - M} ${M}, ${w - M} ${M + R} L ${w - M} ${h - 52}`;
    const tail = `M ${M + 30} ${h - 8} c 14 0 22 -8 16 -16 c -5 -6 -14 -2 -12 4`;
    const unit = `${inscription} ᛫ `;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `
      <defs><path id="${pid}" d="${d}"/></defs>
      <path class="vk-serpent-band" d="${d}" pathLength="1000" fill="none" stroke="var(--vk-band-edge)" stroke-width="27" stroke-linecap="round"/>
      <path class="vk-serpent-band" d="${d}" pathLength="1000" fill="none" stroke="var(--vk-band)" stroke-width="23" stroke-linecap="round"/>
      <path class="vk-serpent-glow" d="${d}" pathLength="1000" fill="none" stroke="#ffe0a0" stroke-width="23" stroke-linecap="round" stroke-dasharray="110 1100"/>
      <text class="vk-serpent-text" font-size="14" letter-spacing="3" dy="5" fill="var(--vk-band-text)"><textPath href="#${pid}" startOffset="${TEXT_START}">${unit.repeat(10)}</textPath></text>
      <text class="vk-serpent-text vk-serpent-measure" font-size="14" letter-spacing="3" opacity="0">${unit}</text>
      <g class="vk-serpent-head" transform="translate(${w - M} ${h - 52})">
        <path d="M -13.5 0 C -15 16, -8 30, 0 38 C 8 30, 15 16, 13.5 0 Z" fill="var(--vk-band)" stroke="var(--vk-band-edge)" stroke-width="2"/>
        <g class="vk-serpent-eye"><ellipse cx="-4" cy="14" rx="3.4" ry="5" fill="var(--vk-band-text)" stroke="var(--vk-band-edge)" stroke-width="1.2"/>
        <circle cx="-4" cy="15" r="1.6" fill="var(--vk-band-edge)"/></g>
        <path d="M 0 38 q 2 7 -3 11 M 0 38 q 4 6 6 2" stroke="var(--vk-band)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <g class="vk-serpent-tail">
        <path d="${tail}" fill="none" stroke="var(--vk-band-edge)" stroke-width="5" stroke-linecap="round"/>
        <path d="${tail}" fill="none" stroke="var(--vk-band)" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    return {
        textPath: svg.querySelector('textPath'),
        unitLen: svg.querySelector('.vk-serpent-measure').getComputedTextLength() || 600,
        pathLen: svg.querySelector(`#${pid}`).getTotalLength(),
    };
};

/**
 * @param {string} props.inscription texte en runes (toRunes), répété le long du ruban
 * @param {*}      [props.characterId] personnage de l'en-tête (réactions au gain de SAGA, triple 10)
 */
const VkSerpent = ({ inscription, characterId = null }) => {
    const ref = useRef(null);
    const reactId = useId();
    const [look] = useVkLook();
    // Le serpent vit dans les deux habillages (retour MJ : figé, le bois et or perdait tout)
    const live = livingOn({ ...look, skin: 'pierre' });

    useEffect(() => {
        const svg = ref.current;
        if (!svg) return undefined;
        const pid = `vkserp${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        let parts = null;
        const observer = new ResizeObserver(() => { parts = draw(svg, pid, inscription); });
        observer.observe(svg.parentElement);
        parts = draw(svg, pid, inscription);
        if (!live) return () => observer.disconnect();

        // Gravure, puis écoulement de l'inscription
        svg.classList.add('is-engraving');
        const off = setTimeout(() => svg.classList.remove('is-engraving'), 3200);
        const t0 = performance.now();
        let raf = 0;
        const loop = (t) => {
            const dt = t - t0;
            if (parts) {
                const { textPath, unitLen, pathLen } = parts;
                if (dt < 1000) textPath.setAttribute('startOffset', pathLen);
                else if (dt < 2400) { const k = 1 - (1 - (dt - 1000) / 1400) ** 3; textPath.setAttribute('startOffset', pathLen * (1 - k) + TEXT_START * k); }
                else textPath.setAttribute('startOffset', TEXT_START - ((dt - 2400) * .012) % unitLen);
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        // Embrasement du ruban
        const glow = (e) => {
            if (characterId != null && e.detail?.id != null && e.detail.id !== characterId) return;
            const g = svg.querySelector('.vk-serpent-glow');
            if (!g) return;
            svg.classList.remove('is-glowing'); void svg.getBoundingClientRect(); svg.classList.add('is-glowing');
        };
        window.addEventListener(VK_SAGA_GAIN, glow);
        window.addEventListener(VK_TRIPLE, glow);
        return () => {
            observer.disconnect(); cancelAnimationFrame(raf); clearTimeout(off);
            window.removeEventListener(VK_SAGA_GAIN, glow); window.removeEventListener(VK_TRIPLE, glow);
        };
    }, [reactId, inscription, live, characterId]);

    return <svg ref={ref} className="vk-serpent" aria-hidden="true" onAnimationEnd={(e) => e.currentTarget.classList.remove('is-glowing')} />;
};

export default VkSerpent;
