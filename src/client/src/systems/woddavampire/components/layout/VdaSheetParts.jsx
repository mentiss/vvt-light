// src/client/src/systems/woddavampire/components/layout/VdaSheetParts.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Briques de la fiche, partagées par la fiche joueur (VdaSheet) et la fiche du
// Conteur (VdaGmSheet) : champ d'identité, ligne de trait (cliquable pour lancer
// hors édition), cases de réserve, piste de santé.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { healthLevels, healthMarks, woundPenalty, cycleHealthBox, pickBox } from '../../config/rules/sheetRules.js';
import { nextValue } from '../../config/rules/character.js';
import { VdaDots } from '../ui/VdaUi.jsx';

export const Field = ({ label, value, editMode, onChange }) => (
    <div className="vda-field">
        <b>{label}</b>
        {editMode && onChange
            ? <input className="vda-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-label={label} />
            : <span>{value || '—'}</span>}
    </div>
);

/** Ligne de trait : hors édition, toute la ligne (nom et points) lance le jet ; below : contenu sous la ligne */
export const TraitLine = ({ label, note, value, max = 5, editMode, onSet, onRoll, extra, below, muted }) => {
    const rollable = onRoll && !editMode;
    const name = <>{label}{note ? <small> ({note})</small> : null}</>;
    return (
        <>
            {rollable ? (
                <button type="button" className={`vda-trait vda-trait-roll-row${muted ? ' is-muted' : ''}`} onClick={onRoll} title={`Lancer ${label}`}>
                    <span className="vda-trait-name">{name}</span>
                    {extra}
                    <VdaDots max={max} base={value} label={label} />
                </button>
            ) : (
                <div className={`vda-trait${muted ? ' is-muted' : ''}`}>
                    <span className="vda-trait-name">{name}</span>
                    {extra}
                    <VdaDots max={max} base={value} onPick={editMode && onSet ? (n) => onSet(nextValue(value, n)) : undefined} label={label} />
                </div>
            )}
            {below}
        </>
    );
};

/** Cases d'une réserve (sang, Volonté temporaire) : clic = remplir jusqu'à la case ou vider à partir d'elle */
export const Boxes = ({ count, filled, cap = count, ink = false, onPick, label }) => (
    <div className="vda-drops" role="group" aria-label={label}>
        {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" className={`vda-drop${ink ? ' is-ink' : ''}${i < filled ? ' is-on' : ''}${i >= cap ? ' is-locked' : ''}`}
                    disabled={i >= cap} onClick={() => onPick(pickBox(filled, i + 1))} aria-label={`${label} ${i + 1}`} />
        ))}
    </div>
);

/** Piste de santé : clic = vide → contondant → létal → aggravé → vide ; pire niveau mis en évidence */
export const HealthTable = ({ c, onQuick }) => {
    const levels = healthLevels(c);
    const marks = healthMarks(c);
    const wound = woundPenalty(c);
    return (
        <table className="vda-health"><tbody>
            {levels.map((lvl, i) => (
                <tr key={i} className={i === wound.worstIndex ? 'is-worst' : ''}>
                    <td>{lvl.label}</td>
                    <td className="pen">{lvl.penalty ? lvl.penalty : ''}</td>
                    <td><button type="button" className={`vda-hbox${marks[i] ? ` is-${marks[i]}` : ''}`} aria-label={`${lvl.label} : changer la blessure`}
                                onClick={() => onQuick(cycleHealthBox(c, i))} /></td>
                </tr>
            ))}
        </tbody></table>
    );
};
