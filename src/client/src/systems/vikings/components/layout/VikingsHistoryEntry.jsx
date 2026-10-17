// src/client/src/systems/vikings/components/layout/VikingsHistoryEntry.jsx
// Rendu d'un jet Vikings — DiceHistoryPage (renderHistoryEntry) et
// ToastNotifications (renderDiceToast, avec renderAllRollTypes). Les données
// viennent de roll_result (résultat d'afterRoll sérialisé). Les jets à l'ancien
// format (avant la refonte, R-5) sont réduits à une ligne minimale.
// Habillage : planche du lot 4 (section « Historique et notifications »).
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

// Dés dans l'ordre du moteur : un dé qui suit une explosion en est issu (↳)
const Dice = ({ values, threshold, explosionThresholds }) => (
    <div className="flex flex-wrap gap-2 pl-3">
        {values.map((v, i) => {
            const chained = i > 0 && (explosionThresholds ?? []).includes(values[i - 1]);
            const state = (explosionThresholds ?? []).includes(v) ? 'is-explode' : (threshold != null && v >= threshold ? 'is-success' : '');
            return <span key={i} className={`vk-die vk-die-sm ${state} ${chained ? 'is-chained' : ''}`}>{v}</span>;
        })}
    </div>
);

// Jet libre (FreeDiceModal) : résultat brut du moteur — groupes { notation, values, total }
const FreeRollEntry = ({ result, compact }) => {
    const groups = result.groups ?? [];
    const total  = groups.reduce((sum, g) => sum + (g.total ?? 0), 0);
    return (
        <div className="px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-default">Jet libre</span>
                <span className="vk-title text-lg shrink-0">= {total}</span>
            </div>
            {groups.map((g, i) => (
                <div key={i} className="flex items-center gap-1">
                    {!compact && <span className="text-xs text-muted w-12">{g.notation}</span>}
                    <Dice values={g.values ?? []} />
                </div>
            ))}
        </div>
    );
};

const VikingsHistoryEntry = ({ entry, compact = false }) => {
    const result = parseResult(entry);

    if (entry?.roll_type === 'free_roll' && result) return <FreeRollEntry result={result} compact={compact} />;

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
        <div className="px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-default truncate">
                    {detail.rollTarget ?? 'Jet'}
                    {mode && <span className="vk-tag vk-tag-gold ml-1.5">{MODE_LABELS[mode]}</span>}
                </span>
                <span className="vk-title text-lg shrink-0">{successes} succès</span>
            </div>

            <Dice values={mainDice} threshold={detail.threshold} explosionThresholds={detail.explosionThresholds} />

            {meta.tripleTen && (
                <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="vk-rune">ᛊ</span>Triple 10 — {meta.sagaGained ? '+1 Saga' : 'Saga déjà au maximum'}
                </div>
            )}

            {(mode === 'heroic' || mode === 'epic') && (
                <div className={`text-sm ${meta.sagaSuccess ? 'text-success' : 'vk-text-warn'}`}>
                    {meta.sagaFailed
                        ? meta.failReason
                        : <>Jet de Saga : {meta.bonusSuccesses} succès — {meta.sagaSuccess ? 'réussi, Saga récupérée' : meta.failReason}</>}
                </div>
            )}

            {!compact && (
                <div className="text-xs text-muted">
                    Seuil {detail.threshold}+ · explosion {detail.explosionThresholds?.join(', ')} · {detail.pool}d10
                    {detail.autoSuccesses > 0 && ` · auto +${detail.autoSuccesses}`}
                    {meta.aimBonus > 0 && ` · visée +${meta.aimBonus}`}
                    {detail.traitBonus !== 0 && detail.traitBonus != null && ` · traits ${detail.traitBonus > 0 ? '+' : ''}${detail.traitBonus}`}
                    {detail.fatigueMalus > 0 && <span className="vk-text-warn"> · fatigue −{detail.fatigueMalus}</span>}
                    {detail.blessureMalus > 0 && <span className="vk-text-warn"> · blessures −{detail.blessureMalus} dé{detail.blessureMalus > 1 ? 's' : ''}</span>}
                </div>
            )}
            {compact && detail.fatigueMalus > 0 && (
                <div className="text-xs vk-text-warn">fatigue −{detail.fatigueMalus}</div>
            )}
        </div>
    );
};

export default VikingsHistoryEntry;
