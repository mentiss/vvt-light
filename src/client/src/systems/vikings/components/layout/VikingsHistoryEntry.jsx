// src/client/src/systems/vikings/components/layout/VikingsHistoryEntry.jsx
// Rendu d'un jet Vikings — DiceHistoryPage (renderHistoryEntry) et
// ToastNotifications (renderDiceToast). Les données viennent de roll_result
// (résultat d'afterRoll sérialisé). Les jets à l'ancien format (avant la
// refonte, R-5) sont réduits à une ligne minimale.
//
// Props : entry — ligne d'historique brute · compact — rendu resserré (toast)

import React from 'react';

const parseResult = (entry) => {
    const raw = entry?.roll_result ?? null;
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return null; }
};

const MODE_LABELS = { insurance: 'Assurance', heroic: 'Héroïque', epic: 'Épique' };

// allDice = groupe 1 puis groupe 2. Le 2e groupe (assurance ou jet SAGA) est
// dans meta.secondaryValues / meta.sagaValues ; on en déduit les dés retenus.
const keptDice = (allDice, meta, mode) => {
    if (mode === 'insurance') {
        const other = meta.secondaryValues ?? [];
        return meta.keptGroup === 0
            ? allDice.slice(0, allDice.length - other.length)
            : allDice.slice(other.length);
    }
    if (mode) return allDice.slice(0, allDice.length - (meta.sagaValues?.length ?? 0));
    return allDice;
};

const Die = ({ value, threshold, explosionThresholds }) => {
    const exploded = (explosionThresholds ?? []).includes(value);
    const success  = value >= threshold;
    return (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold border ${
            exploded ? 'bg-primary border-primary text-default'
                : success ? 'bg-success border-success text-white'
                    : 'bg-surface-alt border-default text-muted'
        }`}>
            {value}
        </span>
    );
};

const VikingsHistoryEntry = ({ entry, compact = false }) => {
    const result = parseResult(entry);

    // Ancien format (ou résultat illisible) : ligne minimale
    if (!result?.detail || result.detail.threshold == null) {
        if (!result) return null;   // rendu générique de la plateforme
        return (
            <div className="px-3 py-2 text-xs text-muted">
                Jet (ancien format){result.successes != null ? ` — ${result.successes} succès` : ''}
            </div>
        );
    }

    const { detail, meta = {}, successes, allDice = [] } = result;
    const mode = meta.keptGroup != null ? 'insurance'
        : meta.finalTarget === 5 ? 'epic'
            : meta.finalTarget === 4 ? 'heroic' : null;
    // Assurance : seul le jet retenu est affiché ; héroïque/épique : jet principal
    const mainDice = keptDice(allDice, meta, mode);

    return (
        <div className="px-3 py-2 space-y-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-default truncate">
                    {detail.rollTarget ?? 'Jet'}
                    {mode && <span className="ml-1.5 text-[10px] text-primary">{MODE_LABELS[mode]}</span>}
                </span>
                <span className="text-sm font-bold text-primary shrink-0">{successes} succès</span>
            </div>

            <div className="flex flex-wrap gap-1">
                {mainDice.map((v, i) => (
                    <Die key={i} value={v} threshold={detail.threshold} explosionThresholds={detail.explosionThresholds} />
                ))}
            </div>

            {meta.tripleTen && (
                <div className="text-[11px] font-bold text-primary">
                    ✨ Triple 10 — {meta.sagaGained ? '+1 SAGA' : 'SAGA déjà au maximum'}
                </div>
            )}

            {(mode === 'heroic' || mode === 'epic') && (
                <div className="text-[11px] text-muted">
                    {meta.sagaFailed
                        ? meta.failReason
                        : <>Jet SAGA : {meta.bonusSuccesses} succès — {meta.sagaSuccess ? 'réussi, SAGA récupérée' : meta.failReason}</>}
                </div>
            )}

            {!compact && (
                <div className="text-[10px] text-muted">
                    Seuil {detail.threshold}+ · explosion {detail.explosionThresholds?.[0]}+ · {detail.pool}d10
                    {detail.autoSuccesses > 0 && ` · auto +${detail.autoSuccesses}`}
                    {meta.aimBonus > 0 && ` · visée +${meta.aimBonus}`}
                    {detail.traitBonus !== 0 && detail.traitBonus != null && ` · traits ${detail.traitBonus > 0 ? '+' : ''}${detail.traitBonus}`}
                    {detail.fatigueMalus > 0 && ` · fatigue −${detail.fatigueMalus}`}
                    {detail.blessureMalus > 0 && ` · blessure −${detail.blessureMalus} dé(s)`}
                </div>
            )}
        </div>
    );
};

export default VikingsHistoryEntry;
