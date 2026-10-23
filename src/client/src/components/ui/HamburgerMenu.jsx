// src/client/src/components/ui/HamburgerMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Menu hamburger générique, en briques (documentations/spec_ui_menu.md §3).
// Le slug assemble ses éléments ; le générique ne porte que la mécanique.
// Classes stables vtt-menu-* : style par défaut dans index.css, habillage par
// le theme.css de chaque slug.
//
// - HamburgerMenu : bouton, ouverture, fermeture (clic extérieur, Échap, après
//   un élément). Le panneau reste monté quand il est fermé ([hidden]) : les
//   éléments prêts à l'emploi y gardent l'état de leur modale.
// - HamburgerMenuItem : élément de base (onClick, ou href rendu en <a> pour la
//   règle « une page = un slug »).
// - HamburgerMenuSeparator : filet.
// - HamburgerMenuIcon : icônes SVG au trait par défaut (§6).
// Éléments prêts à l'emploi : HamburgerMenuItems.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const CloseMenuContext = createContext(() => {});

// Tracés 24×24, au trait (vtt-icon-line)
const ICONS = {
    menu:     'M4 6.5h16M4 12h16M4 17.5h16',
    create:   'M12 5v14M5 12h14',
    people:   'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7',
    portrait: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17M15.5 9.5h.01',
    key:      'M8 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM12 12h8M17 12v3M20 12v2',
    dice:     'M5 5h14v14H5zM9 9h.01M15 15h.01M12 12h.01M15 9h.01M9 15h.01',
    settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
    crown:    'M4 17 3 8l5 4 4-7 4 7 5-4-1 9zM4 20h16',
    eye:      'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    tables:   'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    home:     'M4 11l8-7 8 7M6 9.5V20h12V9.5',
    logout:   'M14 4H6v16h8M10 12h10M17 9l3 3-3 3',
};

export const HamburgerMenuIcon = ({ name }) => (
    <svg className="vtt-icon-line" viewBox="0 0 24 24" aria-hidden="true">
        <path d={ICONS[name]} />
    </svg>
);

/**
 * @param {node}     [props.button]          contenu du bouton (défaut : icône menu)
 * @param {string}   [props.buttonClassName] classes ajoutées au bouton
 * @param {string}   [props.title]           infobulle et libellé accessible
 * @param {'right'|'left'} [props.align]     côté d'ouverture sous le bouton
 * @param {string}   [props.className]       classes ajoutées au panneau
 */
export const HamburgerMenu = ({ children, button, buttonClassName = '', title = 'Menu', align = 'right', className = '' }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const close   = useCallback(() => setOpen(false), []);

    // Fermeture au clic extérieur et à Échap, seulement quand le menu est ouvert
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
        const onKeyDown     = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return (
        <CloseMenuContext.Provider value={close}>
            <div className="vtt-menu-root" ref={rootRef}>
                <button
                    type="button"
                    className={`vtt-menu-button ${buttonClassName}`.trim()}
                    onClick={() => setOpen(v => !v)}
                    title={title}
                    aria-label={title}
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    {button ?? <HamburgerMenuIcon name="menu" />}
                </button>
                <div
                    className={`vtt-menu${align === 'left' ? ' vtt-menu-left' : ''} ${className}`.trim()}
                    role="menu"
                    hidden={!open}
                >
                    {children}
                </div>
            </div>
        </CloseMenuContext.Provider>
    );
};

/**
 * @param {function} [props.onClick]   action (le menu se ferme avant)
 * @param {string}   [props.href]      lien, rendu en <a href>
 * @param {node}     [props.icon]      icône avant le libellé ; absente : aucune
 * @param {boolean}  [props.danger]    action destructrice
 * @param {boolean}  [props.disabled]
 * @param {string}   [props.className]
 */
export const HamburgerMenuItem = ({ children, onClick, href, icon, danger = false, disabled = false, className = '' }) => {
    const close = useContext(CloseMenuContext);
    const cls   = `vtt-menu-item${danger ? ' is-danger' : ''} ${className}`.trim();
    const content = (
        <>
            {icon && <span className="vtt-menu-icon">{icon}</span>}
            <span className="vtt-menu-label">{children}</span>
        </>
    );

    if (href && !disabled) {
        return <a href={href} role="menuitem" className={cls} onClick={close}>{content}</a>;
    }
    return (
        <button
            type="button"
            role="menuitem"
            className={cls}
            disabled={disabled}
            onClick={() => { close(); onClick?.(); }}
        >
            {content}
        </button>
    );
};

export const HamburgerMenuSeparator = () => <div className="vtt-menu-separator" role="separator" />;
