// src/client/src/systems/cyberpunk/components/layout/MoveConsole.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Console « Stats et manœuvres » (spec_cyberpunk.md §4) : une ligne par stat
// (hexagone lançable + manœuvres posées), plus « Autres » (sans stat des six).
// - Une manœuvre se glisse depuis la colonne ou depuis la console, et ne se
//   dépose que sur la ligne de SA stat (canDropOn) ; sur une puce : avant elle.
// - ✕ au survol d'une puce la retire ; bouton d'en-tête : réglage de base.
// - Clic sur une puce : jet de la manœuvre (sans stat : sa description).
// - Mode Édition : − / + sous chaque hexagone (correction des stats).
// L'état du glisser (dragMove) est tenu par la fiche, partagé avec la colonne.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { STAT_LABELS, canDropOn, CONSOLE_ROWS } from '../../config.jsx';
import { Card } from './Card.jsx';
import CpFloating from '../ui/CpFloating.jsx';
import CpIcon from '../ui/CpIcon.jsx';

const sign = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');
const HEX = <svg viewBox="0 0 100 114" aria-hidden="true"><polygon points="50,3 96,29 96,85 50,111 4,85 4,29" /></svg>;

// Puce d'une manœuvre posée. Lecture seule (vue MJ) : ni glisser ni retrait, et un
// clic affiche la description au lieu de lancer le jet (le MC ne lance pas les dés).
const Chip = ({ move, row, onRoll, onUnpin, onDragStart, onDragEnd, readOnly }) => {
    const [tip, setTip] = useState(null);          // { anchor, pinned }
    const rollable = !!move.stat && !!onRoll;
    return (
        <>
            <button
                type="button" draggable={!readOnly} data-move-id={move.id}
                className={`cp-chip st-${row} ${move.stat ? '' : 'is-passive'} ${move.playbook ? 'is-playbook' : ''} ${readOnly ? 'is-readonly' : ''}`}
                onClick={(e) => (rollable ? onRoll(move) : setTip(t => (t?.pinned ? null : { anchor: e.currentTarget, pinned: true })))}
                onMouseEnter={(e) => setTip(t => t ?? { anchor: e.currentTarget, pinned: false })}
                onMouseLeave={() => setTip(t => (t?.pinned ? t : null))}
                onDragStart={readOnly ? undefined : (e) => { setTip(null); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(move.id)); onDragStart(move); }}
                onDragEnd={readOnly ? undefined : onDragEnd}
            >
                {move.name}
                {!readOnly && (
                    <span className="cp-chip-unpin" role="button" tabIndex={-1} title="Retirer de la console"
                          onClick={(e) => { e.stopPropagation(); onUnpin(move.id); }}>
                        <CpIcon name="close" size="sm" />
                    </span>
                )}
            </button>
            {tip && (
                <CpFloating anchor={tip.anchor} onClose={tip.pinned ? () => setTip(null) : undefined} className={`cp-tip st-${row}`}>
                    <b>{move.name}{move.playbook ? ` · ${move.playbook}` : ''}</b>
                    {move.description}
                </CpFloating>
            )}
        </>
    );
};

/**
 * @param {object}   rows         groupConsole(...) : { cran: [move], …, other: [move] }
 * @param {object}   values       valeurs des stats affichées (fiche ou fiche éditée)
 * @param {boolean}  editMode
 * @param {function} onStatChange (stat, valeur) en mode Édition
 * @param {object}   dragMove     manœuvre en cours de glisser (ou null)
 * @param {boolean}  readOnly     vue MJ : la console du joueur, telle qu'il l'a réglée
 * onRollStat / onRollMove absents : pas de jet (hexagones inactifs, description au clic)
 */
export const MoveConsole = ({
    rows, values, editMode, onStatChange, maxStat = 2, readOnly = false,
    dragMove, onDragStart, onDragEnd, onDrop, onUnpin, onReset, onRollStat, onRollMove,
}) => {
    const [over, setOver] = useState(null);

    const handleDrop = (row) => (e) => {
        if (!canDropOn(dragMove, row)) return;
        e.preventDefault();
        const target = e.target.closest?.('[data-move-id]');
        const beforeId = target ? Number(target.dataset.moveId) : null;
        setOver(null);
        onDrop(dragMove.id, beforeId);
    };

    return (
        <Card
            title="Stats et manœuvres"
            action={readOnly ? null : <button type="button" className="cp-icon-btn" onClick={onReset} title="Revenir aux manœuvres de base"><CpIcon name="history" /></button>}
        >
            <div className={`cp-console ${dragMove ? 'is-dragging' : ''}`}>
                {CONSOLE_ROWS.map(row => {
                    const moves = rows[row] ?? [];
                    const canDrop = canDropOn(dragMove, row);
                    const value = values?.[row] ?? 0;
                    return (
                        <div
                            key={row}
                            className={`cp-crow st-${row} ${canDrop ? 'can-drop' : ''} ${over === row && canDrop ? 'is-over' : ''}`}
                            onDragOver={(e) => { if (canDrop) { e.preventDefault(); setOver(row); } }}
                            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(o => (o === row ? null : o)); }}
                            onDrop={handleDrop(row)}
                        >
                            {row === 'other' ? (
                                <div className="cp-crow-other" title="Manœuvres sans stat fixe ou lancées avec la Cred">Autres</div>
                            ) : (
                                <div className="cp-crow-stat">
                                    <button type="button" className={`cp-shex st-${row}`} disabled={editMode || !onRollStat}
                                            onClick={() => onRollStat?.(row)} title={onRollStat ? `Jet de ${STAT_LABELS[row]} (${sign(value)})` : `${STAT_LABELS[row]} ${sign(value)}`}>
                                        {HEX}<b>{sign(value)}</b><span>{STAT_LABELS[row]}</span>
                                    </button>
                                    {editMode && (
                                        <span className="cp-stepper is-tight">
                                            <button type="button" className="cp-step" onClick={() => onStatChange(row, Math.max(-2, value - 1))}>−</button>
                                            <button type="button" className="cp-step" onClick={() => onStatChange(row, Math.min(maxStat, value + 1))}>+</button>
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="cp-chips">
                                {moves.map(m => (
                                    <Chip key={m.id} move={m} row={row} onRoll={onRollMove} onUnpin={onUnpin} readOnly={readOnly}
                                          onDragStart={onDragStart} onDragEnd={onDragEnd} />
                                ))}
                                {moves.length === 0 && !canDrop && (
                                    <span className="cp-chip-empty">
                                        {row === 'synth' && !readOnly ? 'Glissez ici une manœuvre de Synth.' : 'Aucune manœuvre posée.'}
                                    </span>
                                )}
                                {canDrop && <span className="cp-drop-hint">déposer ici</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
