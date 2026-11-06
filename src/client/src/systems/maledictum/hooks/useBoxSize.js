// src/client/src/systems/maledictum/hooks/useBoxSize.js
// ─────────────────────────────────────────────────────────────────────────────
// Hauteur d'un élément suivie par ResizeObserver : hauteur de la bande fixe
// (barre de session, sommaire de l'aide de jeu, colonne d'aide de l'assistant).
//
// const ref = useRef(null); const box = useBoxSize(ref);   // { height }
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export const useBoxSize = (ref) => {
    const [box, setBox] = useState({ height: null });
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const observer = new ResizeObserver(() => setBox({ height: Math.ceil(el.getBoundingClientRect().height) }));
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return box;
};
