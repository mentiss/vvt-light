// src/client/src/systems/nimble/components/ui/NbUi.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Petites briques d'interface du slug (classes de theme.css) : pill,
// interrupteur, curseur, onglets, cases, texte de catalogue, icônes.
// Aucune logique de règle ici.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { inlineSegments } from '@/features/reference/tools/reference.js';
import { signed } from '../../config/rules/formula.js';

/** Choix « pill » (remplace les listes déroulantes) */
export const NbPill = ({ on = false, disabled = false, onClick, children, title, onMouseEnter, onFocus }) => (
    <button type="button" className={`vtt-pill${on ? ' is-selected' : ''}`} disabled={disabled} onClick={onClick} title={title}
            aria-pressed={on} onMouseEnter={onMouseEnter} onFocus={onFocus}>
        {children}
    </button>
);

/** Interrupteur avec sa phrase d'effet */
export const NbToggle = ({ on, onChange, disabled = false, children, hint }) => (
    <button type="button" className={`nb-toggle${on ? ' is-on' : ''}`} onClick={() => onChange(!on)} disabled={disabled} aria-pressed={on}>
        <i aria-hidden="true" />
        <span>{children}{hint && <small>{hint}</small>}</span>
    </button>
);

/** Curseur −/+ ; `format` affiche la valeur (par défaut : signée si `signedValue`) */
export const NbStepper = ({ value, onChange, min = -99, max = 99, signedValue = false, format, label }) => (
    <span className="nb-stepper" aria-label={label}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Retirer">−</button>
        <span>{format ? format(value) : signedValue ? signed(value) : value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Ajouter">+</button>
    </span>
);

/** Onglets (bande fixe, assistant) ; badge facultatif (✓ ou •) */
export const NbTabs = ({ tabs, active, onSelect, className = 'nb-tabs' }) => (
    <div className={className} role="tablist">
        {tabs.map(t => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === active}
                    className={`nb-tab${t.id === active ? ' is-active' : ''}`} onClick={() => onSelect(t.id)}>
                {t.label}
                {t.badge != null && <span className={`nb-tab-badge${t.badgeClass ? ` ${t.badgeClass}` : ''}`}>{t.badge}</span>}
            </button>
        ))}
    </div>
);

/**
 * Rangée de cases losanges : `count` cases, `filled` remplies ; clic sur la n-ième
 * (1 = première) si `onClick` ; `tone` : '' (rouge) | 'blue' | 'gold'.
 */
export const NbPips = ({ count, filled, onClick, tone = '', small = false, label }) => (
    <span className="nb-pips" aria-label={label}>
        {Array.from({ length: Math.max(0, count) }, (_, i) => {
            const cls = `nb-pip${i < filled ? ' is-on' : ''}${tone ? ` is-${tone}` : ''}${small ? ' is-sm' : ''}`;
            return onClick
                ? <button key={i} type="button" className={cls} onClick={() => onClick(i + 1)} aria-label={`${label ?? ''} ${i + 1}`} />
                : <i key={i} className={cls} />;
        })}
    </span>
);

/** Compteur −/+ compact (ressource sans plafond, quantité) */
export const NbCounter = ({ value, onChange, min = 0, max = 999, suffix = '' }) => (
    <span className="nb-counter">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Retirer">−</button>
        <span>{value}{suffix}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Ajouter">+</button>
    </span>
);

/** Texte de catalogue : paragraphes (retours à la ligne), **gras**, *italique* */
export const NbRich = ({ text, className = '' }) => (
    <div className={`nb-rich ${className}`}>
        {String(text ?? '').split(/\n+/).filter(Boolean).map((para, i) => (
            <p key={i}>
                {inlineSegments(para).map((s, j) => {
                    if (s.bold) return <strong key={j}>{s.text}</strong>;
                    if (s.italic) return <em key={j}>{s.text}</em>;
                    if (s.strike) return <s key={j}>{s.text}</s>;
                    return <React.Fragment key={j}>{s.text}</React.Fragment>;
                })}
            </p>
        ))}
    </div>
);

/** En-tête d'un bloc de la fiche (titre en capitales sur filet d'encre, extra à droite) */
export const NbBlockTitle = ({ title, children }) => (
    <div className="nb-block-title">
        <h3>{title}</h3>
        {children && <span className="nb-block-extra">{children}</span>}
    </div>
);

const Svg = ({ children, size = 17 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);

/** Plume (mode Édition) */
export const EditIcon = () => <Svg><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></Svg>;
/** Feu de camp (repos) */
export const RestIcon = () => <Svg><path d="M12 3c2 3 4 4.5 4 7.5A4 4 0 0 1 8 10.5C8 9 9 8 9 8c0 2 1.5 2.5 1.5 2.5C10.5 7 12 3 12 3z" /><path d="M5 20l14-4M5 16l14 4" /></Svg>;
/** Étoile montante (montée de niveau) */
export const LevelIcon = () => <Svg><path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5L12 14.4 7.5 16.8l.9-5L4.8 8.3l5-.7z" /><path d="M12 21v-3" /></Svg>;
/** d20 (jet libre, initiative) */
export const D20Icon = () => <Svg><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 2l-5 9h10zM7 11l-4 6M17 11l4 6M7 11l5 11 5-11" /></Svg>;
