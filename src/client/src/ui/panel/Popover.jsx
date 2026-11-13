// src/client/src/ui/panel/Popover.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Élément flottant ancré à un élément de la page : menu d'une pastille, petite
// fenêtre d'ajout, bulle épinglée. Rendu par portail dans l'emplacement à modales
// de la page (HostedModal) : il sort des panneaux à coins coupés et des fenêtres
// flottantes, qui le rogneraient. Placé sous l'ancre, ou au-dessus s'il n'y a pas
// la place, toujours dans la fenêtre.
//
// Props :
//   anchor     élément DOM d'ancrage (obligatoire)
//   onClose    fermeture (clic extérieur, Échap, défilement, redimensionnement) ;
//              absent = bulle de lecture (classe is-tip, ne capte pas la souris)
//   className  habillage du slug (la brique ne pose que .vtt-popover : position, plan)
//   children
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';

const GAP = 6;      // écart entre l'ancre et l'élément (px)
const MARGIN = 8;   // marge gardée au bord de la fenêtre (px)

const Popover = ({ anchor, onClose, className = '', children }) => {
    const ref = useRef(null);
    const side = useRef({ anchor: null, below: true });   // côté choisi à l'ouverture (par ancre)

    // Position calculée après rendu, écrite directement sur l'élément (pas d'état).
    // Le côté (dessous / dessus) se choisit une fois par ancre, puis se garde : un contenu qui
    // change de taille (aperçu, recherche) ne fait pas sauter l'élément d'un côté à l'autre.
    // Au-dessus, l'élément s'accroche par son bas : il reste collé à l'ancre en grandissant.
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || !anchor) return;
        const r = anchor.getBoundingClientRect();
        const { offsetWidth: w, offsetHeight: h } = el;
        if (side.current.anchor !== anchor) {
            side.current = { anchor, below: r.bottom + GAP + h < window.innerHeight || r.top < window.innerHeight - r.bottom };
        }
        if (side.current.below) {
            el.style.top = `${r.bottom + GAP}px`;
            el.style.bottom = '';
        } else {
            el.style.top = '';
            el.style.bottom = `${Math.max(MARGIN, window.innerHeight - r.top + GAP)}px`;
        }
        el.style.left = `${Math.max(MARGIN, Math.min(r.left, window.innerWidth - w - MARGIN))}px`;
        el.style.visibility = 'visible';
    });

    useEffect(() => {
        if (!onClose) return undefined;
        const onDown = (e) => {
            if (ref.current?.contains(e.target) || anchor?.contains(e.target)) return;
            onClose();
        };
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        const onScroll = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onClose);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onClose);
        };
    }, [anchor, onClose]);

    return (
        <HostedModal>
            <div ref={ref} className={`vtt-popover${onClose ? '' : ' is-tip'} ${className}`.trim()} style={{ visibility: 'hidden' }}>
                {children}
            </div>
        </HostedModal>
    );
};

export default Popover;
