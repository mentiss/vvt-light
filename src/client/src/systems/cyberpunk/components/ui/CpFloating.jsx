// src/client/src/systems/cyberpunk/components/ui/CpFloating.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Élément flottant ancré (fenêtre d'ajout de tag, menu d'un tag, infobulle d'une
// manœuvre). Rendu par portail dans l'emplacement à modales de la page
// (HostedModal) : il sort des panneaux à coins coupés et des fenêtres flottantes,
// qui le rogneraient. Placé sous l'ancre, ou au-dessus s'il n'y a pas la place.
//
// Props :
//   anchor   élément DOM d'ancrage (obligatoire)
//   onClose  fermeture (clic extérieur, Échap, défilement) ; absent = infobulle
//   className, children
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';

const GAP = 6;
const MARGIN = 8;

const CpFloating = ({ anchor, onClose, className = '', children }) => {
    const ref = useRef(null);

    // Position calculée après rendu, écrite directement sur l'élément (pas d'état)
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || !anchor) return;
        const r = anchor.getBoundingClientRect();
        const { offsetWidth: w, offsetHeight: h } = el;
        const below = r.bottom + GAP + h < window.innerHeight;
        el.style.top = `${below ? r.bottom + GAP : Math.max(MARGIN, r.top - GAP - h)}px`;
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
            <div ref={ref} className={`cp-floating ${onClose ? '' : 'is-tip'} ${className}`} style={{ visibility: 'hidden' }}>
                {children}
            </div>
        </HostedModal>
    );
};

export default CpFloating;
