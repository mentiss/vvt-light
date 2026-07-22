// src/client/src/systems/zoneblanche/components/layout/ZoneBlancheHistoryEntry.jsx
// Rendu d'une entrée de jet — utilisé à la fois par DiceHistoryPage
// (renderHistoryEntry) et par ToastNotifications (renderDiceToast).
//
// Les entrées arrivent depuis la table dice_history : les champs métier
// spécifiques au slug sont sérialisés dans roll_result (JSON).
//
// Props :
//   entry — ligne d'historique brute
//   compact — rendu resserré pour le toast

import React from 'react';

const parseResult = (entry) => {
    const raw = entry?.roll_result ?? entry?.details ?? null;
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return null; }
};

const ZoneBlancheHistoryEntry = ({ entry, compact = false }) => {
    const result = parseResult(entry);
    if (!result) {
        return <div className="text-sm text-muted">{entry?.notation ?? 'Jet'}</div>;
    }

    const {
        details = [], successes = 0, complications = 0,
        difficulte = 1, success = false, marge = 0, relances = 0,
    } = result;

    return (
        <div className="zb-history-entry">
            <div className="flex items-center justify-between gap-3">
                <span className="zb-display text-sm text-default truncate">
                    {entry?.roll_target || result.label || 'Jet'}
                </span>
                <span className={`zb-history-verdict zb-mono ${success ? 'is-success' : 'is-failure'}`}>
                    {success ? 'Réussite' : 'Échec'}
                </span>
            </div>

            {/* Dés individuels */}
            <div className="flex flex-wrap gap-1.5 mt-2">
                {details.map((d, i) => (
                    <span key={i}
                          className={`zb-die zb-mono ${d.critique ? 'is-crit' : d.successes > 0 ? 'is-hit' : 'is-miss'} ${d.complication ? 'is-complication' : ''}`}
                          title={d.complication ? 'Complication' : d.critique ? 'Critique' : d.successes > 0 ? 'Succès' : 'Échec'}>
                        {d.roll}
                    </span>
                ))}
            </div>

            {!compact && (
                <div className="zb-eyebrow mt-2">
                    {successes} succès · difficulté {difficulte}
                    {marge > 0 && ` · marge ${marge}`}
                    {complications > 0 && ` · ${complications} complication${complications > 1 ? 's' : ''}`}
                    {relances > 0 && ` · ${relances} relance${relances > 1 ? 's' : ''}`}
                </div>
            )}
        </div>
    );
};

export default ZoneBlancheHistoryEntry;