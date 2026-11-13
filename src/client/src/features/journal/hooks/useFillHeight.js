// features/journal/hooks/useFillHeight.js
// Hauteur de l'élément = de son haut jusqu'au bas de la fenêtre (J2-2) : la liste et l'éditeur
// défilent à l'intérieur quel que soit l'en-tête ou la marge du slug, sans hauteur codée en dur.

import { useLayoutEffect, useState } from 'react';

const GAP_PX = 84;     // marge gardée sous le journal : la zone d'actions (bas à droite) ne couvre pas son pied
const MIN_PX = 360;     // hauteur minimale (petite fenêtre)

export function useFillHeight(ref) {
    const [height, setHeight] = useState(null);
    useLayoutEffect(() => {
        const measure = () => {
            const el = ref.current;
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY;
            setHeight(Math.max(MIN_PX, Math.round(window.innerHeight - top - GAP_PX)));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [ref]);
    return height;
}
