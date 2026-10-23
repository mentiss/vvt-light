import React from "react";
import {OUTCOME_CLASS, OUTCOME_LABEL, STAT_LABELS} from "../../config.jsx";
import { parseFreeRoll } from "../../../../tools/freeRoll.js";

// Face de dé, partagée par les jets de manœuvre et le jet libre
const DieChip = ({ value }) => (
    <span
        className="inline-flex items-center justify-center w-7 h-7 rounded font-mono font-bold text-xs"
        style={{
            background:  'var(--color-surface-alt)',
            border:      '1px solid var(--color-border)',
            color:       'var(--color-text)',
        }}
    >
        {value}
    </span>
);

// Jet libre (FreeDiceModal) : libellé, dés par type, modificateur, total
const FreeRollEntry = ({ free }) => (
    <div className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            {free.label}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
            {free.groups.map((g, gi) => (
                <React.Fragment key={gi}>
                    <span className="text-muted text-xs cp-font-ui uppercase">{g.notation}</span>
                    {g.values.map((v, i) => <DieChip key={i} value={v} />)}
                </React.Fragment>
            ))}
            {free.modifier !== 0 && (
                <span className="text-muted text-xs font-mono">
                    {free.modifier > 0 ? `+${free.modifier}` : free.modifier}
                </span>
            )}
            <span className="text-muted text-xs">=</span>
            <span className="font-bold text-base font-mono" style={{ color: 'var(--color-primary)' }}>
                {free.total}
            </span>
        </div>
    </div>
);

const DiceEntryHistory = ({roll}) => {
    const free = parseFreeRoll(roll?.roll ?? roll);
    if (free) return <FreeRollEntry free={free} />;

    const result = roll?.roll?.roll_result ?? roll?.roll_result;
    //const result = roll.roll.roll_result;
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
                {diceVals.map((v, i) => <DieChip key={i} value={v} />)}

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