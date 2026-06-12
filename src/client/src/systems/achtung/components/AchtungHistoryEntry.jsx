// src/client/src/systems/achtung/components/AchtungHistoryEntry.jsx
// Rendu d'une entrée d'historique de dés Achtung! Cthulhu.
// Gère les deux types : jet de compétence (d20) et jet de dommages (d6).

import React from 'react';

const AchtungHistoryEntry = ({ roll }) => {
    if (!roll?.details) return null;

    let details;
    try { details = typeof roll.details === 'string' ? JSON.parse(roll.details) : roll.details; }
    catch { return null; }

    const isDamage = roll.roll_type === 'achtung_damage';

    return (
        <div style={{ fontSize: '0.8rem', color: 'var(--ac-text)' }}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
                <span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.75rem', color: 'var(--ac-secondary)' }}>
                    {details.label || roll.roll_type}
                </span>
                {!isDamage && details.target !== undefined && (
                    <span className="ac-text-muted">cible {details.target}</span>
                )}
                {isDamage && details.salvo && (
                    <span className="ac-text-muted">salvo: {details.salvo}</span>
                )}
            </div>

            {/* Dés */}
            <div className="flex flex-wrap gap-1 mb-1">
                {(details.results ?? []).map((val, i) => {
                    let cls = 'ac-die ';
                    if (isDamage) {
                        cls += (val === 5 || val === 6) ? 'success' : val <= 2 ? 'miss' : 'miss';
                    } else {
                        if (val === 20) cls += 'complication';
                        else if (val === 1) cls += 'double';
                        else if (val <= (details.target ?? 0)) {
                            cls += (details.hasFocus && val <= (details.skillRank ?? 0)) ? 'double' : 'success';
                        } else {
                            cls += 'miss';
                        }
                    }
                    return <div key={i} className={cls}>{val}</div>;
                })}
            </div>

            {/* Résumé */}
            {!isDamage && (
                <div className="flex gap-3 flex-wrap">
                    <span style={{ color: details.success ? 'var(--ac-success)' : 'var(--ac-accent)', fontWeight: 700 }}>
                        {details.success ? '✓ Succès' : '✗ Échec'}
                    </span>
                    <span className="ac-text-muted">{details.successes} succès</span>
                    {details.complications > 0 && (
                        <span style={{ color: 'var(--ac-accent)' }}>{details.complications} complication(s)</span>
                    )}
                    {details.momentum > 0 && (
                        <span style={{ color: 'var(--ac-momentum-color)' }}>+{details.momentum} Momentum</span>
                    )}
                </div>
            )}
            {isDamage && (
                <div className="flex gap-3 flex-wrap">
                    <span style={{ color: 'var(--ac-accent)', fontWeight: 700 }}>{details.stress} stress</span>
                    {details.effects > 0 && (
                        <span style={{ color: 'var(--ac-secondary)' }}>{details.effects} effet(s)</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default AchtungHistoryEntry;