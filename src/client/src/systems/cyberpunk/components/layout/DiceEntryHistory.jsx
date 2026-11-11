// src/client/src/systems/cyberpunk/components/layout/DiceEntryHistory.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet dans l'historique ET les notifications (même composant, sans
// marge extérieure : règle de la plateforme). Spec_cyberpunk.md §5 : faces de d10,
// total à la couleur de la zone, résultat, mini-bande 9- / 10-14 / 15+.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { OUTCOME_LABEL, STAT_LABELS } from "../../config.jsx";
import { parseFreeRoll } from "@/features/dice/tools/freeRoll.js";
import { RollBand, D10Face } from "../ui/RollBand.jsx";

const signed = (v) => (v > 0 ? `+${v}` : `−${Math.abs(v)}`);

// Jet libre (FreeDiceModal) : libellé, dés par type, modificateur, total
const FreeRollEntry = ({ free }) => (
    <div className="cp-hist">
        <div className="cp-hist-top"><span className="cp-hist-name">{free.label}</span></div>
        <div className="cp-hist-line">
            {free.groups.map((g, gi) => (
                <React.Fragment key={gi}>
                    <span className="cp-hist-notation">{g.notation}</span>
                    {/* d10 dessiné ; autres dés en simple case */}
                    {g.values.map((v, i) => (/d10$/i.test(g.notation)
                        ? <D10Face key={i} value={v} size="sm" />
                        : <span key={i} className="cp-die-chip">{v}</span>))}
                </React.Fragment>
            ))}
            {free.modifier !== 0 && <span className="cp-hist-mod">{signed(free.modifier)}</span>}
            <span className="cp-hist-mod">=</span>
            <span className="cp-hist-total">{free.total}</span>
        </div>
    </div>
);

const DiceEntryHistory = ({ roll }) => {
    const free = parseFreeRoll(roll?.roll ?? roll);
    if (free) return <FreeRollEntry free={free} />;

    const result   = roll?.roll?.roll_result ?? roll?.roll_result;
    const outcome  = result?.outcome ?? 'failure';
    const total    = result?.total;
    const diceVals = result?.diceVals ?? [];
    const moveName = result?.moveName ?? null;
    const stat     = result?.stat ?? null;
    const modifier = result?.modifier ?? 0;

    return (
        <div className={`cp-hist z-${outcome}`}>
            <div className="cp-hist-top">
                {moveName && <span className="cp-hist-name">{moveName}</span>}
                {stat && <span className={`cp-stat-badge st-${stat}`}>{STAT_LABELS[stat] ?? stat}</span>}
            </div>
            <div className="cp-hist-line">
                {diceVals.map((v, i) => <D10Face key={i} value={v} size="sm" />)}
                {modifier !== 0 && <span className="cp-hist-mod">{signed(modifier)}</span>}
                <span className="cp-hist-mod">=</span>
                <span className="cp-hist-total">{total}</span>
                <span className="cp-hist-out">{result?.outcomeLabel ?? OUTCOME_LABEL[outcome]}</span>
            </div>
            <RollBand total={total} outcome={outcome} compact />
        </div>
    );
};

export default DiceEntryHistory;
