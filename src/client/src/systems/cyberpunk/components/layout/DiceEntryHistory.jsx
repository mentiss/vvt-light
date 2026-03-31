import React from "react";
import {STAT_LABELS} from "../../config.jsx";

/**
 * Interprète le total 2d10 + modificateur selon les seuils The Sprawl.
 * @param {number} total
 * @returns {'success' | 'partial' | 'failure'}
 */
function getOutcome(total) {
    if (total >= SEUIL_SUCCES)  return 'success';
    if (total >= SEUIL_PARTIEL) return 'partial';
    return 'failure';
}

const OUTCOME_LABEL = {
    success: 'Succès plein',
    partial: 'Succès partiel',
    failure: 'Échec',
};

const OUTCOME_CLASS = {
    success: 'cp-outcome-success',
    partial: 'cp-outcome-partial',
    failure: 'cp-outcome-failure',
};

const DiceEntryHistory = (roll) => {
    const result = roll.roll.roll_result;
    const outcome  = result?.outcome ?? 'failure';
    const total    = result.total;
    const diceVals = result.diceVals ?? [];
    const moveName = result.moveName ?? null;
    const stat     = result.stat     ?? null;
    const modifier = result.modifier ?? 0;

    return (
        <div className="flex flex-col gap-1 text-sm">
            {/* Header : move ou stat */}
            <div className="flex items-center gap-2">
                {moveName && (
                    <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                        {moveName}
                    </span>
                )}
                {stat && (
                    <span className={`cp-stat-badge cp-stat-badge-${stat}`}>
                        {STAT_LABELS[stat] ?? stat}
                    </span>
                )}
            </div>

            {/* Corps : dés + modificateur + total + outcome */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Faces des dés */}
                {diceVals.map((v, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center justify-center w-7 h-7 rounded font-mono font-bold text-xs"
                        style={{
                            background:  'var(--color-surface-alt)',
                            border:      '1px solid var(--color-border)',
                            color:       'var(--color-text)',
                        }}
                    >
                        {v}
                    </span>
                ))}

                {/* Modificateur */}
                {modifier !== 0 && (
                    <span className="text-muted text-xs font-mono">
                        {modifier > 0 ? `+${modifier}` : modifier}
                    </span>
                )}

                {/* Séparateur */}
                <span className="text-muted text-xs">=</span>

                {/* Total */}
                <span
                    className="font-bold text-base font-mono"
                    style={{ color: 'var(--color-primary)' }}
                >
                    {total}
                </span>

                {/* Outcome pill */}
                <span
                    className={`${OUTCOME_CLASS[outcome]} cp-font-ui text-xs font-bold px-2 py-0.5 rounded`}
                >
                    {result.outcomeLabel ?? OUTCOME_LABEL[outcome]}
                </span>
            </div>
        </div>
    );
};

export default DiceEntryHistory;