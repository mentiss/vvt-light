// src/client/src/systems/vikings/components/ui/VkSlabBg.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fond de dalle taillée de la pierre peinte (planche refonte_vikings/planche_pierre_peinte.html,
// spec_vikings_pierre_peinte.md D-5) : contour irrégulier, biseau, incision intérieure.
// Jour : texture de pierre légère ; nuit : surface unie, arête du haut éclairée (rim).
// Masqué par le thème dans l'habillage bois et or (.vk-slab-bg). Le contour est
// redessiné à la taille du parent (ResizeObserver) ; la graine le rend stable.
// Les filtres de texture sont posés une seule fois dans le document (ensureDefs).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef } from 'react';

const DEFS_ID = 'vk-slab-defs';
const ensureDefs = () => {
    if (document.getElementById(DEFS_ID)) return;
    const holder = document.createElement('div');
    holder.innerHTML = `<svg id="${DEFS_ID}" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
        <filter id="vk-tex-fine" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .12  .9 0 0 0 -.42"/></filter>
        <filter id="vk-tex-patch" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  .45 0 0 0 -.2"/></filter>
    </defs></svg>`;
    document.body.appendChild(holder.firstChild);
};

// Pseudo-aléatoire déterministe (même dalle, même contour à chaque rendu)
const rng = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 100000, 7);

const slabPath = (w, h, seed, inset = 0) => {
    const r = rng(seed), j = (a) => (r() - .5) * a, c = 9 + r() * 9;
    let pts = [[c + j(4), 1 + j(2)], [w * .38 + j(30), .5 + j(2.5)], [w * .7 + j(30), 1 + j(2)], [w - c + j(4), 1 + j(2)],
               [w - 1 + j(1), c + j(4)], [w - .5 + j(2.5), h * .5 + j(14)], [w - c * .7 + j(3), h - 1 + j(1)], [w * .55 + j(30), h - .5 + j(2)],
               [c * 1.1 + j(4), h - 1], [1 + j(1), h - c + j(4)], [.5 + j(2.5), h * .45 + j(14)], [1, c + j(4)]];
    if (inset) {
        const cx = w / 2, cy = h / 2;
        pts = pts.map(([x, y]) => [cx + (x - cx) * (1 - 2 * inset / w), cy + (y - cy) * (1 - 2 * inset / h)]);
    }
    return 'M' + pts.map(([x, y]) => `${Math.max(.5, Math.min(w - .5, x)).toFixed(1)} ${Math.max(.5, Math.min(h - .5, y)).toFixed(1)}`).join(' L') + ' Z';
};

const draw = (svg, id, seed) => {
    const w = svg.parentElement.offsetWidth, h = svg.parentElement.offsetHeight;
    if (!w || !h) return;
    const outer = slabPath(w, h, seed), inner = slabPath(w, h, seed, 7);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<defs><clipPath id="${id}c"><path d="${outer}"/></clipPath>
        <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="rgb(150,255,205)" stop-opacity=".7"/><stop offset="${Math.min(.5, 60 / h)}" stop-color="rgb(150,255,205)" stop-opacity=".1"/><stop offset="1" stop-color="rgb(150,255,205)" stop-opacity="0"/></linearGradient></defs>
      <path d="${outer}" fill="var(--vk-slab-fill)"/>
      <g class="vk-slab-tex" clip-path="url(#${id}c)">
        <rect width="${w}" height="${h}" filter="url(#vk-tex-patch)"/>
        <rect width="${w}" height="${h}" filter="url(#vk-tex-fine)"/>
      </g>
      <path d="${outer}" fill="none" stroke="var(--vk-slab-hi)" stroke-width="3" transform="translate(1.2 1.2)" clip-path="url(#${id}c)"/>
      <path d="${outer}" fill="none" stroke="var(--vk-slab-edge)" stroke-width="1.4"/>
      <path class="vk-slab-rim" d="${outer}" fill="none" stroke="url(#${id}r)" stroke-width="1.6"/>
      <path d="${inner}" fill="none" stroke="var(--vk-slab-lo)" stroke-width="1"/>
      <path d="${inner}" fill="none" stroke="var(--vk-slab-hi)" stroke-width="1" transform="translate(.8 .8)"/>`;
};

// ── Cadres de la plateforme en dalle (pierre peinte, retour MJ du 2026-11-07) ─
// Les fenêtres de la plateforme (Modal, CatalogModal…) et celles du slug, les cartes
// de l'historique et les notifications reçoivent le même fond de dalle que les cartes :
// à chaque cadre (SLAB_TARGETS) qui apparaît, un <svg class="vk-slab-bg"> est ajouté
// en dernier enfant et redessiné à sa taille. Hors pierre peinte, le thème le masque.
// Renvoie la fonction d'arrêt.
// Initiative (spec_initiative.md §12) : la bande, son menu, sa carte et son bandeau aussi.
// Journal (spec_journal.md §13.4) : calendrier de la période, liste du « @ », menu de mise en forme.
const SLAB_TARGETS = '.vtt-modal-panel, .vtt-history-card, .vtt-toast, .vtt-initiative, .vtt-initiative-menu, .vtt-initiative-card, .vtt-initiative-resume, '
    + '.vtt-date-pop, .rich-editor-mention-menu, .rich-editor-bubble';
let slabCount = 0;
const decoratePanel = (panel) => {
    if (panel.querySelector(':scope > .vk-slab-bg')) return;
    ensureDefs();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'vk-slab-bg');
    svg.setAttribute('aria-hidden', 'true');
    panel.appendChild(svg);
    const seed = 1000 + (++slabCount);   // figée : le contour ne change pas quand d'autres dalles apparaissent
    const id = `vksm${slabCount}`;
    const observer = new ResizeObserver(() => draw(svg, id, seed));
    observer.observe(panel);
};
export const watchPlatformSlabs = () => {
    document.querySelectorAll(SLAB_TARGETS).forEach(decoratePanel);
    const mo = new MutationObserver(muts => {
        for (const m of muts) for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            if (n.matches?.(SLAB_TARGETS)) decoratePanel(n);
            n.querySelectorAll?.(SLAB_TARGETS).forEach(decoratePanel);
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
};

const VkSlabBg = () => {
    const ref = useRef(null);
    const reactId = useId();
    useEffect(() => {
        const svg = ref.current;
        if (!svg) return;
        ensureDefs();
        const id = `vks${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const seed = hash(id);
        const observer = new ResizeObserver(() => draw(svg, id, seed));
        observer.observe(svg.parentElement);
        return () => observer.disconnect();
    }, [reactId]);
    return <svg ref={ref} className="vk-slab-bg" aria-hidden="true" />;
};

export default VkSlabBg;
