// src/client/src/systems/vikings/components/ui/VkTray.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Plateau de jet (spec_vikings_pierre_peinte.md D-11, planche) : tiroir en bas de
// l'écran à la place d'une fenêtre, la fiche reste visible. Repliable en une barre
// qui garde le résumé (dernier résultat). Cohabitation avec la plateforme :
//   - zone d'actions : remontée au-dessus du plateau par --vtt-actions-bottom ; un
//     événement « resize » lui fait recalculer --vtt-actions-offset, d'où les
//     notifications se placent au-dessus d'elle (ActionZone.jsx, sans la modifier) ;
//   - barre de session ouverte (fiche joueur, à gauche) : le plateau commence à sa droite.
// Échap ferme le plateau.
//
// <VkTray title icon onClose summary={<…/>}> … </VkTray>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import VkIcon from './VkIcon.jsx';

// Barre de session (SessionPlayersBar) : le panneau et sa liste fixée au défilement
const SESSION_BAR = '.vtt-session-bar, .vtt-session-bar-list.is-fixed';

const VkTray = ({ title, icon = 'die', onClose, summary = null, children }) => {
    const ref = useRef(null);
    const [folded, setFolded] = useState(false);
    const [left, setLeft] = useState(0);

    // Zone d'actions au-dessus du plateau, notifications au-dessus de la zone
    useEffect(() => {
        const tray = ref.current;
        if (!tray) return undefined;
        const root = document.documentElement;
        const place = () => {
            const h = Math.ceil(tray.getBoundingClientRect().height);
            root.style.setProperty('--vtt-actions-bottom', `${h + 16}px`);
            root.style.setProperty('--vk-tray-h', `${h}px`);   // la page se rallonge d'autant (theme.css)
            window.dispatchEvent(new Event('resize'));
        };
        const observer = new ResizeObserver(place);
        observer.observe(tray);
        place();
        return () => {
            observer.disconnect();
            root.style.removeProperty('--vtt-actions-bottom');
            root.style.removeProperty('--vk-tray-h');
            window.dispatchEvent(new Event('resize'));
        };
    }, []);

    // Barre de session (ouverte, à gauche) : le plateau se range à sa droite
    useEffect(() => {
        const measure = () => {
            let right = 0;
            for (const el of document.querySelectorAll(SESSION_BAR)) {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.left < 40 && r.bottom > window.innerHeight - 40) right = Math.max(right, r.right);
            }
            setLeft(Math.ceil(right));
        };
        measure();
        const timer = setInterval(measure, 500);
        window.addEventListener('scroll', measure, { passive: true });
        return () => { clearInterval(timer); window.removeEventListener('scroll', measure); };
    }, []);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div ref={ref} className={`vk-tray ${folded ? 'is-folded' : ''}`} style={{ left }} role="dialog" aria-label={title}>
            <div className="vk-tray-strip">
                <VkIcon name={icon} className="text-primary" />
                <span className="vk-tray-title">{title}</span>
                {summary}
                <span className="flex-1" />
                <button type="button" className="vk-btn vk-btn-sm" onClick={() => setFolded(f => !f)}>
                    <VkIcon name={folded ? 'up' : 'down'} />{folded ? 'Déplier' : 'Replier'}
                </button>
                <button type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={onClose} title="Fermer">
                    <VkIcon name="close" />
                </button>
            </div>
            {!folded && <div className="vk-tray-body vtt-scroll">{children}</div>}
        </div>
    );
};

export default VkTray;
