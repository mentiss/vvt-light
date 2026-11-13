// src/client/src/systems/maledictum/components/ui/MlUi.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Petites briques d'interface du slug (planche_themes.html) : ornement (image en
// masque teintée par le thème), bloc à banderole et coins ajourés, onglets,
// pills, compteur, interrupteur, jauge, pictogrammes.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useTooltip } from '@/ui/text/Tooltip.jsx';

/**
 * Infobulle habillée (brique useTooltip, spec §14.2) posée sur l'élément enfant lui-même, sans
 * conteneur ajouté (la disposition ne bouge pas). L'enfant ne doit avoir ni ref ni onMouseEnter /
 * onMouseLeave. Un bouton désactivé ne reçoit pas le survol : l'envelopper (brique Tooltip).
 */
export const Tip = ({ text, children }) => {
    const { bind, bubble } = useTooltip(text);
    return <>{React.cloneElement(children, bind)}{bubble}</>;
};

/** Ornement : silhouette générée, teintée par currentColor (theme.css, .im-orn.is-…) */
export const Orn = ({ name, className = '', style }) => <span className={`im-orn is-${name} ${className}`.trim()} style={style} aria-hidden="true" />;

/** Bloc de fiche : banderole de titre (crânes facultatifs), coins ajourés */
export const Block = ({ title, skulls = false, className = '', extra = null, children, actions = null }) => (
    <section className={`im-block ${className}`.trim()}>
        <span className="im-corner is-tl"><Orn name="corner" /></span>
        <span className="im-corner is-br"><Orn name="corner" /></span>
        {title && <span className="im-phyl">{skulls && <Orn name="skull" />}{title}{skulls && <Orn name="skull" />}</span>}
        {extra}
        {actions && <div className="im-block-actions">{actions}</div>}
        {children}
    </section>
);

export const Rule = () => <div className="im-rosary"><Orn name="rosary" /></div>;

export const MlTabs = ({ tabs, active, onSelect, className = '' }) => (
    <div className={`im-tabs ${className}`.trim()} role="tablist">
        {tabs.map(t => (
            <button key={t.id} type="button" role="tab" aria-selected={active === t.id}
                    className={`im-tab${active === t.id ? ' is-active' : ''}`} onClick={() => onSelect(t.id)}>
                {t.label}
                {t.badge !== undefined && t.badge !== null && t.badge !== 0 && <span className={`im-tab-badge ${t.badgeClass ?? ''}`}>{t.badge}</span>}
            </button>
        ))}
    </div>
);

export const Pill = ({ on, onClick, disabled, children, title }) => (
    <Tip text={title}><button type="button" className={`vtt-pill${on ? ' is-selected' : ''}`} onClick={onClick} disabled={disabled}>{children}</button></Tip>
);

export const Pills = ({ children, className = '' }) => <div className={`im-row ${className}`.trim()}>{children}</div>;

/**
 * − valeur + ; editable : la valeur se saisit aussi au clavier (unit écrite après).
 * label : ce qu'affiche le milieu (court : un nombre) ; text : libellé variable écrit APRÈS le
 * réglage, pour que le + ne bouge pas quand le texte change de longueur.
 */
export const Stepper = ({ value, onChange, min = -Infinity, max = Infinity, label, editable = false, unit, text }) => {
    const clamp = (v) => Math.min(max, Math.max(min, v));
    if (text !== undefined) {
        return (
            <span className="im-stepper-line">
                <Stepper value={value} onChange={onChange} min={min} max={max} label={label} editable={editable} unit={unit} />
                <span className="im-stepper-text">{text}</span>
            </span>
        );
    }
    return (
        <span className={`im-stepper${editable ? ' is-editable' : ''}`}>
            <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label="Moins">−</button>
            {editable ? (
                <label>
                    <input type="number" inputMode="numeric" value={value} min={Number.isFinite(min) ? min : undefined} max={Number.isFinite(max) ? max : undefined}
                           onFocus={e => e.target.select()}
                           onChange={e => { const v = parseInt(e.target.value, 10); onChange(Number.isNaN(v) ? clamp(0) : clamp(v)); }} />
                    {unit && <small>{unit}</small>}
                </label>
            ) : <span>{label ?? value}</span>}
            <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label="Plus">+</button>
        </span>
    );
};

export const Toggle = ({ on, onChange, children, disabled }) => (
    <button type="button" className={`im-toggle${on ? ' is-on' : ''}`} onClick={() => onChange(!on)} disabled={disabled}>
        <i aria-hidden="true" />{children}
    </button>
);

export const Gauge = ({ value, max, warn = false }) => (
    <div className={`im-gauge full${warn ? ' is-warn' : ''}`}><i style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} /></div>
);

export const Field = ({ label, children }) => (
    <div className="im-field"><b>{label}</b>{children}</div>
);

// ── Pictogrammes (traits) ────────────────────────────────────────────────────

const Svg = ({ children }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
export const DiceIcon = () => <Svg><path d="M12 2l9 6v8l-9 6-9-6V8z" /><path d="M3 8l9 6 9-6M12 14v8" /></Svg>;
export const EditIcon = () => <Svg><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></Svg>;
export const XpIcon = () => <Svg><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" /></Svg>;
export const PlusIcon = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
export const MinusIcon = () => <Svg><path d="M5 12h14" /></Svg>;
export const TrashIcon = () => <Svg><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
export const ShieldIcon = () => <Svg><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></Svg>;
export const FlameIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5-2.5 5-2.5 8.5 0 1.3.7 2.3 1.6 2.8-.3-1.6.6-2.9 1.9-3.8.2 2 2.4 2.6 2.4 4.9A3.4 3.4 0 0 1 12 18a4.8 4.8 0 0 1-4.8-4.8C7.2 8.8 11.5 6.5 12 2z" /><path d="M6 20h12v1.6H6z" /></svg>
);

const SIL = (
    <svg viewBox="0 0 120 150" aria-hidden="true"><g fill="currentColor" opacity=".5"><circle cx="60" cy="52" r="24" /><path d="M14 150c0-50 18-70 46-74 28 4 46 24 46 74z" /></g></svg>
);

/** Portrait en ogive : avatar du joueur ou silhouette ; sigle du thème au sommet, cierges au pied */
export const Portrait = ({ avatar, onClick }) => (
    <div className="im-portrait">
        <span className="im-candles is-left"><Orn name="candles" /></span>
        <span className="im-candles is-right"><Orn name="candles" /></span>
        <Tip text={onClick ? 'Changer le portrait' : ''}>
            <button type="button" className="im-portrait-frame" onClick={onClick} disabled={!onClick}>
                {avatar ? <img src={avatar} alt="" /> : SIL}
            </button>
        </Tip>
        <span className="im-portrait-arch"><Orn name="arch" /></span>
        <span className="im-portrait-sign is-top"><Orn name="sigil" /></span>
    </div>
);
