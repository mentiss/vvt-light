// src/client/src/features/audio/panel/RowMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Menus des lignes du panneau MJ (≋ et ⋯) : rendus dans l'emplacement à modales de
// la page, le panneau (conteneur de requêtes de taille) rognant ce qui est en position fixe.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import { IconButton } from './PanelIcons.jsx';

/**
 * Menu attaché à un bouton : placé sous le bouton (au-dessus s'il manque de place),
 * premier élément focalisé, flèches pour parcourir, Échap ou clic extérieur pour
 * fermer, le focus revient au bouton.
 * `anchor` peut aussi être un point de l'écran { x, y } (menu contextuel du tableau) :
 * le menu s'ouvre alors à droite et sous le point, retourné s'il manque de place.
 */
export const RowMenu = ({ anchor, onClose, children }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({ left: -9999, top: -9999 });
    const isPoint = typeof anchor.getBoundingClientRect !== 'function';

    useLayoutEffect(() => {
        const menu = ref.current;
        // Un point se lit comme un bouton de taille nulle, le menu partant de son bord gauche
        const r = isPoint
            ? { left: anchor.x, right: anchor.x + menu.offsetWidth, top: anchor.y, bottom: anchor.y }
            : anchor.getBoundingClientRect();
        const { offsetWidth: w, offsetHeight: h } = menu;
        setPos({
            left: Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w)),
            top: r.bottom + h + 8 > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4,
        });
        menu.querySelector('[role^="menuitem"]')?.focus();
    }, [anchor, isPoint]);

    useEffect(() => {
        const close = () => { onClose(); if (!isPoint) anchor.focus(); };
        const onKey = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); close(); }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = [...ref.current.querySelectorAll('[role^="menuitem"]')];
                const i = items.indexOf(document.activeElement);
                items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
            }
        };
        const onDown = (e) => { if (!ref.current.contains(e.target) && (isPoint || !anchor.contains(e.target))) onClose(); };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('pointerdown', onDown);
        };
    }, [anchor, onClose, isPoint]);

    return (
        <HostedModal>
            {/* Classes du menu générique (habillage des menus de chaque slug) */}
            <ul ref={ref} className="vtt-menu vtt-audio-menu" role="menu" style={{ left: `${pos.left}px`, top: `${pos.top}px` }}>
                {children}
            </ul>
        </HostedModal>
    );
};

/** Élément de menu ; `checked` (booléen) en fait un choix coché ou non, `disabled` le grise. */
export const MenuItem = ({ children, onSelect, danger, hint, disabled, checked, title }) => (
    <li role="none">
        <button type="button" role={checked === undefined ? 'menuitem' : 'menuitemradio'} aria-checked={checked}
                className={`vtt-menu-item${danger ? ' is-danger' : ''}${checked ? ' is-checked' : ''}`}
                onClick={onSelect} disabled={disabled} title={title}>
            {checked !== undefined && <span className="vtt-audio-menu-check" aria-hidden="true">{checked ? '✓' : ''}</span>}
            {children}{hint && <span className="vtt-audio-menu-hint">{hint}</span>}
        </button>
    </li>
);
export const MenuLabel = ({ children }) => <li className="vtt-audio-menu-label" role="presentation">{children}</li>;
export const MenuSeparator = () => <li className="vtt-menu-separator" role="separator" />;

/** Bouton qui ouvre un menu ; le menu reçoit `close`. */
export const MenuButton = ({ icon, label, children }) => {
    const [anchor, setAnchor] = useState(null);
    const close = useCallback(() => setAnchor(null), []);
    return (
        <>
            <IconButton icon={icon} label={label} aria-haspopup="menu" aria-expanded={!!anchor}
                        onClick={e => setAnchor(anchor ? null : e.currentTarget)} />
            {anchor && <RowMenu anchor={anchor} onClose={close}>{children(close)}</RowMenu>}
        </>
    );
};
