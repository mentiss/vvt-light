// src/client/src/components/ui/FloatingPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre flottante générique (documentations/spec_ui_panneaux.md) : la fenêtre
// qui flotte sans bloquer la page, quand Modal est celle qui la bloque.
// Déplaçable par sa barre de titre, redimensionnable par ses bords et ses coins,
// réductible à sa barre de titre, plein écran ; options au choix de la fenêtre ;
// position, taille et réduction mémorisées (persistAs).
//
// - Classes de la modale générique (vtt-modal-panel, -header, -title, -close,
//   -expand, -deco) : la fenêtre reprend l'habillage des modales de chaque slug ;
//   vtt-floating-* pour ce qui fait d'elle une fenêtre flottante.
// - Premier plan (F-1) : la fenêtre cliquée passe devant les autres fenêtres
//   flottantes, toutes sous les modales.
// - Petit écran (F-2) : plein écran d'office, sans poignées ni déplacement.
// - Échap ne la ferme pas (F-3) ; focus donné à l'ouverture si focusOnOpen (F-4).
// - Conteneur de requêtes de taille : le contenu s'adapte à la largeur de la
//   fenêtre (@container). Conséquence : ce qui est en position fixe dans le
//   contenu (menus, modales) doit passer par l'emplacement à modales
//   (HostedModal), sinon il est rogné.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { useFloatingWindow } from '../../hooks/useFloatingWindow.js';

const RESIZE_DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const SMALL_SCREEN = '(max-width: 639px)';

const PATHS = {
    minimize: 'M5 12h14',
    restore: 'M5 5h14v14H5z',
    expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    reduce: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
    close: 'M6 6l12 12M18 6L6 18',
};

const Icon = ({ name }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={PATHS[name]} />
    </svg>
);

// ─── Pile de premier plan, commune à toutes les fenêtres flottantes ─────────

let stack = [];
const stackListeners = new Set();
const setStack = (next) => { stack = next; stackListeners.forEach(listener => listener()); };
const bringToFront = (id) => { if (stack.at(-1) !== id) setStack([...stack.filter(x => x !== id), id]); };
const subscribeStack = (listener) => { stackListeners.add(listener); return () => stackListeners.delete(listener); };

/** Rang de la fenêtre dans la pile (0 : la plus en arrière) ; ajoutée devant à l'ouverture. */
function useStackOrder(id) {
    useEffect(() => {
        bringToFront(id);
        return () => setStack(stack.filter(x => x !== id));
    }, [id]);
    return useSyncExternalStore(subscribeStack, () => Math.max(0, stack.indexOf(id)));
}

// ─── Petit écran ────────────────────────────────────────────────────────────

const subscribeSmallScreen = (listener) => {
    const query = window.matchMedia(SMALL_SCREEN);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
};
const isSmallScreen = () => window.matchMedia(SMALL_SCREEN).matches;

// ─── Composant ──────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {React.ReactNode} props.title         titre (barre de titre, nom de la fenêtre)
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.titleExtra]  texte en plus dans la barre de titre, gardé réduite
 * @param {Function} [props.onClose]            bouton ✕ ; sans lui, pas de bouton
 * @param {boolean}  [props.movable=true]
 * @param {boolean}  [props.resizable=true]
 * @param {boolean}  [props.minimizable=true]
 * @param {boolean}  [props.expandable=true]    bouton Plein écran
 * @param {{ width: number, height: number }} [props.defaultSize] taille à la première ouverture (480 × 600)
 * @param {{ width: number, height: number }} [props.minSize]     taille minimale (320 × 240)
 * @param {string}   [props.defaultPosition='bottom-right'] ancrage : bottom-right, bottom-left, top-right, top-left, center
 * @param {{ x: number, y: number }} [props.offset] décalage depuis les bords d'ancrage ({ x: 16, y: 72 })
 * @param {string}   [props.persistAs]          identifiant de mémorisation (vtt:platform:panel:<persistAs>)
 * @param {boolean}  [props.focusOnOpen=true]   focus à l'ouverture (false quand elle se rouvre seule)
 * @param {string}   [props.className]
 * Les autres props (onPaste…) sont transmises à l'élément de la fenêtre.
 */
const FloatingPanel = ({
    title, subtitle, icon, titleExtra, onClose,
    movable = true, resizable = true, minimizable = true, expandable = true,
    defaultSize, minSize, defaultPosition, offset, persistAs,
    focusOnOpen = true, className = '', children, ...rest
}) => {
    const id = useId();
    const titleId = `${id}-title`;
    const ref = useRef(null);
    const [full, setFull] = useState(false);
    const small = useSyncExternalStore(subscribeSmallScreen, isSmallScreen);
    const order = useStackOrder(id);
    const win = useFloatingWindow({ persistAs, movable, resizable, minimizable, defaultSize, minSize, defaultPosition, offset });

    // Focus à l'ouverture seulement (F-4)
    const focusRef = useRef(focusOnOpen);
    useEffect(() => { if (focusRef.current) ref.current?.focus(); }, []);

    const isFull = full || small;
    const minimized = minimizable && win.minimized;
    const style = { '--vtt-floating-order': order };
    if (!isFull) {
        Object.assign(style, {
            left: `${win.rect.left}px`, top: `${win.rect.top}px`, width: `${win.rect.width}px`,
            height: minimized ? 'auto' : `${win.rect.height}px`,
        });
    }
    const classes = ['vtt-modal-panel', 'vtt-floating-panel', isFull && 'is-full', minimized && 'is-minimized', className].filter(Boolean).join(' ');

    return (
        <section ref={ref} className={classes} style={style} role="dialog" aria-modal="false" aria-labelledby={titleId}
                 tabIndex={-1} onPointerDownCapture={() => bringToFront(id)} {...rest}>
            <span className="vtt-modal-deco" aria-hidden="true" />
            <header className={`vtt-modal-header vtt-floating-header${movable && !isFull ? ' is-movable' : ''}`}
                    onPointerDown={isFull ? undefined : win.startMove}>
                {icon && <span className="vtt-modal-icon">{icon}</span>}
                <div className="vtt-modal-heading">
                    <h2 className="vtt-modal-title" id={titleId}>
                        {title}{titleExtra && <small className="vtt-floating-title-extra"> · {titleExtra}</small>}
                    </h2>
                    {subtitle && <p className="vtt-modal-subtitle">{subtitle}</p>}
                </div>
                {minimizable && (
                    <button type="button" className="vtt-modal-expand vtt-floating-btn" onClick={win.toggleMinimized}
                            aria-label={minimized ? 'Agrandir la fenêtre' : 'Réduire la fenêtre'} title={minimized ? 'Agrandir' : 'Réduire'}>
                        <Icon name={minimized ? 'restore' : 'minimize'} />
                    </button>
                )}
                {expandable && !small && (
                    <button type="button" className="vtt-modal-expand vtt-floating-btn" onClick={() => setFull(v => !v)}
                            aria-label={full ? 'Quitter le plein écran' : 'Plein écran'} title={full ? 'Quitter le plein écran' : 'Plein écran'}>
                        <Icon name={full ? 'reduce' : 'expand'} />
                    </button>
                )}
                {onClose && (
                    <button type="button" className="vtt-modal-close" onClick={onClose} aria-label="Fermer la fenêtre" title="Fermer">
                        <Icon name="close" />
                    </button>
                )}
            </header>

            {/* Contenu gardé monté une fois réduite (état, lecteurs cachés), seulement masqué */}
            <div className="vtt-floating-body" hidden={minimized}>{children}</div>

            {resizable && !isFull && !minimized && RESIZE_DIRS.map(dir => (
                <span key={dir} className={`vtt-floating-resize vtt-floating-resize-${dir}`} onPointerDown={win.startResize(dir)} aria-hidden="true" />
            ))}
        </section>
    );
};

export default FloatingPanel;
