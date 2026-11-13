// ui/date/DateRangeField.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Champ « période » (documentations/plateforme/spec_journal.md R-23) : un seul champ,
// qui ouvre un calendrier habillé (les <input type="date"> natifs ne s'habillent pas).
// Le calendrier montre les deux bornes « Du → Au » en tête, celle qu'on choisit est mise
// en avant (un clic sur l'autre y revient), la période se dessine au survol, une consigne
// dit quoi faire. Raccourcis : aujourd'hui, 7 jours, 30 jours, effacer.
//
// Props :
//   value        { from, to } : jours AAAA-MM-JJ, '' = borne absente
//   onChange     (value) => void
//   placeholder  texte du champ sans période (défaut « Choisir une période… »)
//   className    classes en plus sur le champ
// Habillage : .vtt-date-* (ui/date/date.css), surchargeables par le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Popover from '@/ui/panel/Popover.jsx';
import { isoDay, lastDays, monthGrid, parseDay, periodLabel, pickDay, previewRange, slotLabel } from '@/ui/tools/dateRange.js';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const QUICK = [[0, "Aujourd'hui"], [7, '7 jours'], [30, '30 jours']];

const Chevron = ({ left }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={left ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
);

// Calendrier, monté seulement quand il est ouvert
const Calendar = ({ value, onChange, onClose }) => {
    const [mode, setMode] = useState(value.from && !value.to ? 'to' : 'from');
    const [hover, setHover] = useState(null);
    const [month, setMonth] = useState(() => {
        const base = value.from ? parseDay(value.from) : new Date();
        return { year: base.getFullYear(), month: base.getMonth() };
    });
    const today = isoDay(new Date());
    const shown = previewRange(value, mode, hover);
    const title = new Date(month.year, month.month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const move = (delta) => setMonth(({ year, month: m }) => {
        const d = new Date(year, m + delta, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const choose = (day) => {
        const next = pickDay(value, mode, day);
        onChange(next.range);
        setMode(next.mode);
        setHover(null);
        if (next.done) onClose();
    };

    const dayClass = ({ key, inMonth }) => ['vtt-date-day',
        !inMonth && 'is-outside', key === today && 'is-today',
        key === shown.from && 'is-start', key === shown.to && 'is-end',
        shown.from && shown.to && key > shown.from && key < shown.to && 'is-in-range',
    ].filter(Boolean).join(' ');

    return (
        <div className="vtt-date-pop" onMouseLeave={() => setHover(null)}>
            <div className="vtt-date-slots">
                {[['from', 'Du'], ['to', 'Au']].map(([k, label], i) => (
                    <React.Fragment key={k}>
                        {i === 1 && <span className="vtt-date-arrow" aria-hidden="true">→</span>}
                        <button type="button" className={`vtt-date-slot${mode === k ? ' is-active' : ''}`} onClick={() => setMode(k)}>
                            <span className="vtt-date-slot-label">{label}</span>
                            <span className="vtt-date-slot-value">{slotLabel(value[k])}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
            <div className="vtt-date-head">
                <button type="button" className="vtt-date-nav" onClick={() => move(-1)} aria-label="Mois précédent"><Chevron left /></button>
                <span className="vtt-date-month">{title}</span>
                <button type="button" className="vtt-date-nav" onClick={() => move(1)} aria-label="Mois suivant"><Chevron /></button>
            </div>
            <div className="vtt-date-grid">
                {WEEKDAYS.map((w, i) => <span key={i} className="vtt-date-wd">{w}</span>)}
                {monthGrid(month.year, month.month).map(cell => (
                    <button key={cell.key} type="button" className={dayClass(cell)}
                            onMouseEnter={() => setHover(cell.key)} onClick={() => choose(cell.key)}>
                        {cell.day}
                    </button>
                ))}
            </div>
            <p className="vtt-date-hint">
                {mode === 'from' ? 'Cliquez le premier jour de la période.'
                    : `Cliquez le dernier jour, ou fermez pour garder « ${periodLabel({ from: value.from, to: '' }) ?? 'sans début'} ».`}
            </p>
            <div className="vtt-date-foot">
                {QUICK.map(([days, label]) => (
                    <button key={days} type="button" className="vtt-pill" onClick={() => { onChange(lastDays(days)); onClose(); }}>{label}</button>
                ))}
                <button type="button" className="vtt-pill" onClick={() => { onChange({ from: '', to: '' }); setMode('from'); }}>Effacer</button>
            </div>
        </div>
    );
};

const DateRangeField = ({ value, onChange, placeholder = 'Choisir une période…', className = '' }) => {
    const [anchor, setAnchor] = useState(null);   // champ d'ancrage quand le calendrier est ouvert
    const close = () => setAnchor(null);
    const label = periodLabel(value);
    return (
        <>
            <button type="button" aria-expanded={!!anchor}
                    className={`vtt-input vtt-date-field${label ? '' : ' is-empty'} ${className}`.trim()}
                    onClick={(e) => { const el = e.currentTarget; setAnchor(a => (a ? null : el)); }}>
                <span>{label ?? placeholder}</span>
                <span aria-hidden="true">▾</span>
            </button>
            {anchor && (
                <Popover anchor={anchor} onClose={close}>
                    <Calendar value={value} onChange={onChange} onClose={close} />
                </Popover>
            )}
        </>
    );
};

export default DateRangeField;
