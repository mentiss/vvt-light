// src/client/src/systems/vileborn/components/ui/VilUi.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Petites briques d'interface du slug (classes de theme.css, planche validée) :
// libellé sur lavis, case et coche papier, pill, interrupteur, onglets, icônes.
// Aucune logique de règle ici.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

/** Libellé de section en petite capitale sur un lavis de sauge */
export const VilLabel = ({ children, align = 'left' }) => (
    <span className={`vil-label${align === 'right' ? ' is-right' : align === 'center' ? ' is-plain' : ''}`}>{children}</span>
);

/** Case carrée (états, blessures, mobiles) ; onClick absent : lecture seule */
export const VilCheck = ({ on = false, onClick, label }) => (onClick
    ? <button type="button" className={`vil-check${on ? ' is-on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label} />
    : <span className={`vil-check${on ? ' is-on' : ''}`} aria-label={label} />);

/** Coche ronde (sombre héritage, dons) */
export const VilTick = ({ on = false, onClick, label }) => (onClick
    ? <button type="button" className={`vil-tick${on ? ' is-on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label} />
    : <span className={`vil-tick${on ? ' is-on' : ''}`} aria-label={label} />);

/** Choix « pill » (remplace les listes déroulantes) */
export const VilPill = ({ on = false, disabled = false, onClick, children, title, onMouseEnter, onFocus }) => (
    <button type="button" className={`vtt-pill${on ? ' is-selected' : ''}`} disabled={disabled} onClick={onClick} title={title}
            aria-pressed={on} onMouseEnter={onMouseEnter} onFocus={onFocus}>
        {children}
    </button>
);

/** Interrupteur avec sa phrase d'effet */
export const VilToggle = ({ on, onChange, disabled = false, children, hint }) => (
    <button type="button" className={`vil-toggle${on ? ' is-on' : ''}`} onClick={() => onChange(!on)} disabled={disabled} aria-pressed={on}>
        <i aria-hidden="true" />
        <span>{children}{hint && <small>{hint}</small>}</span>
    </button>
);

/** Onglets (bande fixe, assistant) ; badge facultatif (✓ ou •) */
export const VilTabs = ({ tabs, active, onSelect, className = 'vil-tabs' }) => (
    <div className={className} role="tablist">
        {tabs.map(t => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === active}
                    className={`vil-tab${t.id === active ? ' is-active' : ''}`} onClick={() => onSelect(t.id)}>
                {t.label}
                {t.badge != null && <span className={`vil-tab-badge${t.badgeClass ? ` ${t.badgeClass}` : ''}`}>{t.badge}</span>}
            </button>
        ))}
    </div>
);

/** Icône de plume (mode Édition), couleur héritée du texte */
export const EditIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" />
    </svg>
);

/** Icône du d12 (dé d'obscurité), couleur héritée du texte */
export const D12Icon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2 20.5 8.2 17.3 18.2H6.7L3.5 8.2Z" /><path d="M12 6.5 15.8 9.3 14.3 13.8H9.7L8.2 9.3Z" />
        <path d="M12 2v4.5M20.5 8.2l-4.7 1.1M17.3 18.2l-3-4.4M6.7 18.2l3-4.4M3.5 8.2l4.7 1.1" />
    </svg>
);
