// src/client/src/components/ui/Modal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre modale générique (documentations/spec_ui_modales.md).
// Structure et classes vtt-* stables ; style par défaut dans index.css
// (@layer components), habillage par le theme.css de chaque slug.
// Rendue sur place, sans portail : elle hérite du data-theme et de la police
// posés par la page du slug.
//
// - Échap ferme uniquement la modale du dessus (pile des modales ouvertes).
// - Le clic sur le fond ferme si closeOnBackdrop ; un clic commencé dans la
//   fenêtre et relâché sur le fond (sélection, curseur) ne ferme pas.
// - alert : z-index d'alerte, au-dessus de tout (animation des dés comprise).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef, useState } from 'react';

// Pile des modales ouvertes (identifiants), la dernière est celle du dessus
const openStack = [];

const SIZES = ['sm', 'md', 'lg', 'xl', 'full'];

const IconPath = ({ d }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);

const ICON_CLOSE  = 'M6 6l12 12M18 6L6 18';
const ICON_EXPAND = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5';
const ICON_REDUCE = 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5';

const Modal = ({
    onClose,
    title,
    subtitle,
    icon,
    size = 'md',
    expandable = false,
    footer,
    closeOnBackdrop = true,
    alert = false,
    className = '',
    children,
}) => {
    const id = useId();
    const [expanded, setExpanded] = useState(false);
    const onCloseRef  = useRef(onClose);
    const pressOnBack = useRef(false);

    useEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        openStack.push(id);
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && openStack[openStack.length - 1] === id) {
                onCloseRef.current?.();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            const idx = openStack.indexOf(id);
            if (idx !== -1) openStack.splice(idx, 1);
        };
    }, [id]);

    const baseSize    = SIZES.includes(size) ? size : 'md';
    const currentSize = expanded ? 'full' : baseSize;

    return (
        <div
            className={`vtt-modal-backdrop${alert ? ' vtt-modal-alert' : ''}`}
            onMouseDown={e => { pressOnBack.current = e.target === e.currentTarget; }}
            onClick={e => {
                if (closeOnBackdrop && pressOnBack.current && e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`vtt-modal-panel vtt-modal-${currentSize} ${className}`.trim()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <span className="vtt-modal-deco" aria-hidden="true" />

                <header className="vtt-modal-header">
                    {icon && <span className="vtt-modal-icon">{icon}</span>}
                    <div className="vtt-modal-heading">
                        {title    && <h2 className="vtt-modal-title">{title}</h2>}
                        {subtitle && <p className="vtt-modal-subtitle">{subtitle}</p>}
                    </div>
                    {expandable && baseSize !== 'full' && (
                        <button
                            type="button"
                            className="vtt-modal-expand"
                            onClick={() => setExpanded(v => !v)}
                            title={expanded ? 'Réduire' : 'Agrandir'}
                        >
                            <IconPath d={expanded ? ICON_REDUCE : ICON_EXPAND} />
                        </button>
                    )}
                    <button type="button" className="vtt-modal-close" onClick={onClose} title="Fermer">
                        <IconPath d={ICON_CLOSE} />
                    </button>
                </header>

                <div className="vtt-modal-body vtt-scroll">
                    {children}
                </div>

                {footer && <footer className="vtt-modal-footer">{footer}</footer>}
            </div>
        </div>
    );
};

export default Modal;
