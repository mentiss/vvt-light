// src/client/src/systems/woddavampire/components/ui/VdaUi.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Petites briques d'interface du slug (classes de theme.css) : coins de fer,
// titres à fleurons, points de trait, pas à pas, choix « pill », bascule cire,
// barre d'onglets à flèches, icônes. Aucune logique de règle ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';

/** Coins de ferronnerie : une image retournée pour les quatre angles */
export const VdaCorners = ({ small = false }) => ['tl', 'tr', 'bl', 'br'].map(c => (
    <span key={c} className={`vda-corner is-${c}${small ? ' is-small' : ''}`} aria-hidden="true" />
));

/** Titre de bloc (fleurons) ou de colonne (doubles filets) ; lettrine sur la 1re lettre */
export const VdaSectionTitle = ({ children, small = false }) => {
    const text = String(children ?? '');
    return (
        <h3 className={`vda-section-title${small ? ' is-small' : ''}`}>
            {small ? text : <span><span className="vda-initial">{text.charAt(0)}</span>{text.slice(1)}</span>}
        </h3>
    );
};

/**
 * Points d'un trait.
 * @param {number} max      nombre de points affichés
 * @param {number} free     points gratuits (gris)
 * @param {number} base     points de priorité (encre)
 * @param {number} bonus    points bonus (sang)
 * @param {number} locked   au-delà de ce total, points condamnés (ex. Apparence 0)
 * @param {function} [onPick] clic sur le point n (1-based) ; absent : lecture seule
 */
export const VdaDots = ({ max = 5, free = 0, base = 0, bonus = 0, locked = max, onPick, label }) => (
    <span className="vda-dots" role={onPick ? 'group' : undefined} aria-label={label}>
        {Array.from({ length: max }, (_, i) => {
            const n = i + 1;
            let cls = 'vda-dot';
            if (n <= free) cls += ' is-free';
            else if (n <= free + base) cls += ' is-on';
            else if (n <= free + base + bonus) cls += ' is-bonus';
            if (n > locked) cls += ' is-locked';
            return onPick
                ? <button key={n} type="button" className={cls} disabled={n > locked} onClick={() => onPick(n)} aria-label={`${label ?? ''} ${n}`} />
                : <span key={n} className={cls} />;
        })}
    </span>
);

/** Pas à pas − valeur + */
export const VdaStepper = ({ value, min = 0, max = 99, onChange, label }) => (
    <span className="vda-stepper" aria-label={label}>
        <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Retirer">−</button>
        <span>{value}</span>
        <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Ajouter">+</button>
    </span>
);

/** Choix « pill » (remplace les listes déroulantes) */
export const VdaChip = ({ on = false, disabled = false, onClick, children, title, onMouseEnter, onFocus }) => (
    <button type="button" className={`vda-chip${on ? ' is-on' : ''}`} disabled={disabled} onClick={onClick} title={title} aria-pressed={on}
            onMouseEnter={onMouseEnter} onFocus={onFocus}>
        {children}
    </button>
);

/** Bascule : sceau de cire frappé du tau */
export const VdaToggle = ({ on, onChange, children, label }) => (
    <button type="button" className={`vda-toggle${on ? ' is-on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} aria-label={label} title={label}>
        <i aria-hidden="true" />{children}
    </button>
);

/** Barre d'onglets sur une ligne : flèches de fer de part et d'autre si elle déborde */
export const VdaTabsNav = ({ tabs, active, onSelect }) => {
    const stripRef = useRef(null);
    const [edges, setEdges] = useState({ left: false, right: false });

    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return undefined;
        const sync = () => setEdges({
            left:  strip.scrollLeft > 2,
            right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2,
        });
        sync();
        strip.addEventListener('scroll', sync);
        const ro = new ResizeObserver(sync);
        ro.observe(strip);
        return () => { strip.removeEventListener('scroll', sync); ro.disconnect(); };
    }, [tabs.length]);

    useEffect(() => {
        stripRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [active]);

    const scroll = (dir) => stripRef.current?.scrollBy({ left: dir * stripRef.current.clientWidth * 0.6 });

    return (
        <div className={`vda-tabs-nav${edges.left ? ' has-left' : ''}${edges.right ? ' has-right' : ''}`}>
            <button type="button" className="vtt-btn vtt-btn-sm vda-tabs-arrow is-left" onClick={() => scroll(-1)} aria-label="Onglets précédents">‹</button>
            <div className="vda-wizard-tabs" ref={stripRef} role="tablist">
                {tabs.map(t => (
                    <button key={t.id} type="button" role="tab" aria-selected={t.id === active}
                            className={`vda-wizard-tab${t.id === active ? ' is-active' : ''}`} onClick={() => onSelect(t.id)}>
                        {t.label}
                        {t.badge != null && <span className={`vda-count${t.badgeClass ? ` ${t.badgeClass}` : ''}`}>{t.badge}</span>}
                    </button>
                ))}
            </div>
            <button type="button" className="vtt-btn vtt-btn-sm vda-tabs-arrow is-right" onClick={() => scroll(1)} aria-label="Onglets suivants">›</button>
        </div>
    );
};

/** Icône unique des menus (croix pattée, spec §II.10) */
export const MENU_ICON = <span aria-hidden="true">✠</span>;

/** Icône d'une plume (édition), couleur héritée du texte */
export const QuillIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 3C13 4 8.5 9 7.5 15.5l3-1C15 12.5 19 8 20 3Z" />
        <path d="M7.5 15.5 4 21M10.5 12 15 7.5" />
    </svg>
);

/** Icône de bourse (ajouter de l'équipement), couleur héritée du texte */
export const PurseIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 4h6l-1.5 3h-3z" /><path d="M10.5 7C6 9 4 13 4 16c0 3 3 4.5 8 4.5s8-1.5 8-4.5c0-3-2-7-6.5-9" /><path d="M9.5 7.5h5" />
    </svg>
);

/** Icône d'un d10 (trapézoèdre vu de face), couleur héritée du texte */
export const D10Icon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2 21 10 12 22 3 10Z" />
        <path d="M12 2 8 12 12 15 16 12Z M3 10 8 12 M21 10 16 12 M12 15V22" />
    </svg>
);
