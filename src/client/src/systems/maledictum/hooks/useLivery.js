// src/client/src/systems/maledictum/hooks/useLivery.js
// ─────────────────────────────────────────────────────────────────────────────
// Thème du personnage (spec_maledictum.md §8.2) posé sur <html data-livery> tant
// que la page est montée : la fiche, les fenêtres (rendues hors de la fiche), les
// menus et les briques de la plateforme lisent les jetons de ce thème. Retiré au
// démontage. Le mode jour / nuit (data-theme) reste celui de la plateforme.
//
// useLivery('mechanicus');
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

export const useLivery = (theme) => {
    useEffect(() => {
        const html = document.documentElement;
        const previous = html.dataset.livery;
        if (theme) html.dataset.livery = theme;
        return () => {
            if (previous) html.dataset.livery = previous;
            else delete html.dataset.livery;
        };
    }, [theme]);
};
