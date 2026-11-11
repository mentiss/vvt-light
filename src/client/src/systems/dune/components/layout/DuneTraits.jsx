// src/client/src/systems/dune/components/layout/DuneTraits.jsx
// Principes et compétences (fiche joueur et MJ), face à face (spec_dune.md §6.1) :
// chaque ligne entière est lançable et ouvre la fenêtre de jet avec elle déjà choisie ;
// la maxime ou la spécialisation sous le nom. Mode Édition : rang, maxime, spécialisation.

import React, { useRef } from 'react';
import { useTooltip } from '@/ui/text/Tooltip.jsx';
import DuneIcon from '../ui/DuneIcon.jsx';
import { DuneFrame, DuneStepper } from '../ui/DuneFields.jsx';
import { COMPETENCES, PRINCIPES, traitLabel } from '../../config/traits.js';

const PRINCIPE_MAX = 8;   // rang des principes plafonné à 8 (règle de l'app, contrôleur serveur)

// Ligne lançable ; sans onRoll (fiche vue par le MJ), ligne simple
// subText : texte complet en infobulle quand il est coupé (la ligne tronque pour garder la même
// hauteur) ; la bulle s'ouvre au survol de toute la ligne, sous elle
const TraitRow = ({ entry, sub, subText, isQuote, onRoll }) => {
    const subRef = useRef(null);
    const { bind, bubble } = useTooltip(subText, { onlyIfTruncated: true, measureRef: subRef });
    const content = (
        <>
            <span className="dn-hex"><span>{entry.rang}</span></span>
            <span className="dn-row-main">
                <span className="dn-row-name">{traitLabel(entry.key)}</span>
                <span ref={subRef} className={`dn-row-sub${isQuote && sub ? ' is-quote' : ''}`}>{sub || '—'}</span>
            </span>
        </>
    );
    if (!onRoll) return <><div {...bind} className="dn-row is-static">{content}</div>{bubble}</>;
    return (
        <>
            <button {...bind} type="button" className="dn-row" onClick={onRoll} aria-label={`Lancer ${traitLabel(entry.key)}`}>
                {content}
                <DuneIcon name="d20" className="dn-ico dn-row-roll" />
            </button>
            {bubble}
        </>
    );
};

const TraitEditRow = ({ entry, textKey, placeholder, max, onChange }) => (
    <div className="dn-row is-static">
        <DuneStepper value={entry.rang} min={1} max={max} label={traitLabel(entry.key)} onChange={rang => onChange({ ...entry, rang })} />
        <span className="dn-row-main flex flex-col gap-1">
            <span className="dn-row-name">{traitLabel(entry.key)}</span>
            <input className="vtt-input" value={entry[textKey] ?? ''} placeholder={placeholder}
                   onChange={e => onChange({ ...entry, [textKey]: e.target.value })} />
        </span>
    </div>
);

/**
 * @param {object}   props.c           personnage affiché (brouillon en édition)
 * @param {boolean}  props.editing
 * @param {Function} props.onDraft     (patch) => void
 * @param {Function} props.onRoll      ({ type: 'competence'|'principe', key }) => void
 */
const DuneTraits = ({ c, editing, onDraft, onRoll }) => {
    const principes   = PRINCIPES.map(t => (c.principes ?? []).find(p => p.key === t.key)).filter(Boolean);
    const competences = COMPETENCES.map(t => (c.competences ?? []).find(p => p.key === t.key)).filter(Boolean);

    const replace = (field, list, updated) => onDraft({ [field]: list.map(e => (e.key === updated.key ? updated : e)) });

    return (
        <div className="dn-traits">
            <DuneFrame title="Principes" hint="Maxime">
                {principes.map(p => editing
                    ? <TraitEditRow key={p.key} entry={p} textKey="maxime" placeholder="Maxime…" max={PRINCIPE_MAX}
                                    onChange={u => replace('principes', c.principes, u)} />
                    : <TraitRow key={p.key} entry={p} sub={p.maxime?.trim()} subText={p.maxime?.trim()} isQuote onRoll={onRoll && (() => onRoll({ type: 'principe', key: p.key }))} />)}
            </DuneFrame>
            <DuneFrame title="Compétences" hint="Spécialisation">
                {competences.map(s => editing
                    ? <TraitEditRow key={s.key} entry={s} textKey="specialisation" placeholder="Spécialisation…"
                                    onChange={u => replace('competences', c.competences, u)} />
                    : <TraitRow key={s.key} entry={s} sub={s.specialisation?.trim() && <span className="dn-spec">{s.specialisation}</span>}
                                subText={s.specialisation?.trim()}
                                onRoll={onRoll && (() => onRoll({ type: 'competence', key: s.key }))} />)}
            </DuneFrame>
        </div>
    );
};

export default DuneTraits;
