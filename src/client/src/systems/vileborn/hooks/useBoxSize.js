// src/client/src/systems/vileborn/hooks/useBoxSize.js
// ─────────────────────────────────────────────────────────────────────────────
// Taille et position d'un élément, suivies par ResizeObserver : hauteur de la
// bande fixe (barre de session, sommaire de l'aide de jeu).
//
// const ref = useRef(null); const box = useBoxSize(ref);   // { height, left, width }
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export const useBoxSize = (ref) => {
    const [box, setBox] = useState({ height: null, left: 0, width: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const observer = new ResizeObserver(() => {
            const r = el.getBoundingClientRect();
            setBox({ height: Math.ceil(r.height), left: Math.round(r.left), width: Math.round(r.width) });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return box;
};
