// src/client/src/ui/text/Tooltip.jsx
// Infobulle habillable par le slug (classe .vtt-tooltip), au survol, à la place du title natif.
// Rendue dans <body> : aucun conteneur ne la rogne (overflow, clip-path des cadres).
// Placée sous l'élément survolé, au-dessus s'il n'y a pas la place, toujours dans la fenêtre.
// Survol seulement (pas de tactile, choix du projet).
//
// Deux usages :
// - <Tooltip text=… className=…>contenu</Tooltip> : un <span> porteur ;
// - useTooltip(text, options) : la bulle sur un élément existant (ex. une ligne entière),
//   le texte coupé pouvant être mesuré sur un autre élément (measureRef).

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const GAP = 6;      // écart entre l'élément et la bulle (px)
const MARGIN = 8;   // marge gardée au bord de la fenêtre (px)

const isTruncated = (el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;

/**
 * @param {string}  text                       texte de la bulle ; vide = pas de bulle
 * @param {boolean} options.onlyIfTruncated    bulle seulement si le contenu mesuré est coupé (ellipsis, line-clamp)
 * @param {object}  options.measureRef         élément mesuré pour onlyIfTruncated (défaut : l'élément survolé)
 * @returns {{ bind: { ref, onMouseEnter, onMouseLeave }, bubble: React.ReactNode }}
 *          bind à étaler sur l'élément survolé, bubble à rendre n'importe où
 */
export const useTooltip = (text, { onlyIfTruncated = false, measureRef = null } = {}) => {
    const anchorRef = useRef(null);
    const tipRef = useRef(null);
    const [rect, setRect] = useState(null);   // rectangle de l'élément survolé, null = fermée
    const [pos, setPos] = useState(null);

    const show = () => {
        const el = anchorRef.current;
        if (!text || !el) return;
        const measured = measureRef?.current ?? el;
        if (onlyIfTruncated && !isTruncated(measured)) return;
        setRect(el.getBoundingClientRect());
    };
    const hide = () => { setRect(null); setPos(null); };

    // Position calculée une fois la bulle mesurée
    useLayoutEffect(() => {
        if (!rect || !tipRef.current) return;
        const { width, height } = tipRef.current.getBoundingClientRect();
        const below = rect.bottom + GAP;
        const top = below + height > window.innerHeight - MARGIN ? Math.max(MARGIN, rect.top - GAP - height) : below;
        const left = Math.min(Math.max(MARGIN, rect.left), window.innerWidth - MARGIN - width);
        setPos({ top, left: Math.max(MARGIN, left) });
    }, [rect]);

    // Un défilement déplace l'élément : la bulle se ferme
    useEffect(() => {
        if (!rect) return undefined;
        window.addEventListener('scroll', hide, true);
        return () => window.removeEventListener('scroll', hide, true);
    }, [rect]);

    const bubble = rect && createPortal(
        <div ref={tipRef} role="tooltip" className="vtt-tooltip"
             style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}>
            {text}
        </div>,
        document.body,
    );

    return { bind: { ref: anchorRef, onMouseEnter: show, onMouseLeave: hide }, bubble };
};

/**
 * @param {string}  props.text             texte de la bulle ; vide = pas de bulle
 * @param {boolean} props.onlyIfTruncated  bulle seulement si le contenu est coupé
 * @param {string}  props.className        classes de l'élément porteur (un <span>)
 */
const Tooltip = ({ text, onlyIfTruncated = false, className = '', children }) => {
    const { bind, bubble } = useTooltip(text, { onlyIfTruncated });
    return (
        <>
            <span {...bind} className={className}>{children}</span>
            {bubble}
        </>
    );
};

export default Tooltip;
