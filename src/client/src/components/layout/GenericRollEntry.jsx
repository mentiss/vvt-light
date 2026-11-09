// src/client/src/components/layout/GenericRollEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu de secours d'une entrée d'historique, commun à l'historique
// (DiceHistoryList) et aux notifications (ToastNotifications) : utilisé quand le
// slug ne rend pas l'entrée. Ne lit que ce qui appartient à la plateforme
// (label, roll_type, raw_result) et, dans roll_result, un total numérique s'il
// existe ; le reste de roll_result est au slug (spec_diceengine_v2.md, H-1).
//
// Props : roll (entrée d'historique, raw_result et roll_result en objets),
//         showLabel? (false dans une notification, dont l'en-tête porte le libellé)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const GenericRollEntry = ({ roll, showLabel = true }) => {
    const groups = roll.raw_result?.groups ?? [];
    const total  = typeof roll.roll_result?.total === 'number' ? roll.roll_result.total : null;

    return (
        <div className="space-y-1">
            {(showLabel || total !== null) && (
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate text-default">
                        {showLabel ? (roll.label ?? roll.roll_type ?? 'Jet') : ''}
                    </span>
                    {total !== null && (
                        <span className="text-sm font-bold shrink-0 text-default">= {total}</span>
                    )}
                </div>
            )}
            {groups.map((g, gi) => (
                <div key={gi} className="flex flex-wrap items-center gap-1">
                    <span className="font-mono text-[10px] mr-1 text-muted">{g.notation}</span>
                    {(g.dice ?? []).map((d, i) => (
                        <span key={i} title={d.modifiers?.join(', ') || undefined}
                              className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold border bg-surface-alt border-default text-default"
                              style={{ opacity: d.modifiers?.includes('drop') ? 0.4 : 1 }}>
                            {d.value}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GenericRollEntry;
