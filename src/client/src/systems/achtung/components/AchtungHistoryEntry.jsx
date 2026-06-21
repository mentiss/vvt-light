// src/client/src/systems/achtung/components/AchtungHistoryEntry.jsx
import React from 'react';
import { SALVO_LABELS } from '../config.jsx';

const AchtungHistoryEntry = ({ roll }) => {
    // Les données peuvent être dans roll_result ou details selon le contexte
    const raw = roll?.roll_result ?? roll?.details;
    if (!raw) return null;

    let details;
    try { details = typeof raw === 'string' ? JSON.parse(raw) : raw; }
    catch { return null; }

    if (!details) return null;

    const isDamage   = roll.roll_type === 'achtung_damage';
    const isVicious  = isDamage && details.activeSalvo?.key === 'vicious';

    // Couleur d'un dé
    const getDieClass = (val) => {
        if (isDamage) {
            if (val !== 5 && val !== 6) return 'miss';
            return isVicious ? 'complication' : 'success';
        }
        if (val === 20)                            return 'complication';
        if (val === 1)                             return 'double';
        if (val <= (details.target ?? 0)) {
            return (details.hasFocus && val <= (details.skillRank ?? 0)) ? 'double' : 'success';
        }
        return 'miss';
    };

    return (
        <div style={{ fontSize: '0.8rem', color: 'var(--ac-text)', padding: '0.5rem 0.75rem' }}>
            {/* Label du jet */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span style={{
                    fontFamily: 'var(--ac-font-heading)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ac-secondary)',
                }}>
                    {details.label || (isDamage ? 'Dommages' : 'Jet de compétence')}
                </span>
                {!isDamage && details.target !== undefined && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--ac-muted)' }}>
                        cible {details.target} · {details.difficulty ?? 1} succès requis
                    </span>
                )}
                {isDamage && details.activeSalvo && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--ac-muted)' }}>
                        salvo : {SALVO_LABELS[details.activeSalvo.key] ?? details.activeSalvo.key}
                        {details.activeSalvo.value ? ` (${details.activeSalvo.value})` : ''}
                    </span>
                )}
            </div>

            {/* Dés */}
            {(details.results ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {(details.results ?? []).map((val, i) => {
                        const isForced = i < (details.forcedCount ?? 0);
                        return (
                            <div
                                key={i}
                                className={`ac-die ${getDieClass(val)}${isForced ? ' ring-2 ring-yellow-400' : ''}`}
                                style={{ width: '1.8rem', height: '1.8rem', fontSize: '0.8rem' }}
                                title={isForced ? 'Dé forcé (Fortune)' : undefined}
                            >
                                {val}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Résumé */}
            {!isDamage && (
                <div className="flex gap-3 flex-wrap">
                    <span style={{
                        fontFamily: 'var(--ac-font-heading)',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        color: details.success ? 'var(--ac-success)' : 'var(--ac-accent)',
                    }}>
                        {details.success ? '✓ Succès' : '✗ Échec'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--ac-muted)' }}>
                        {details.successes ?? 0} succès
                    </span>
                    {(details.complications ?? 0) > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--ac-accent)' }}>
                            ⚠ {details.complications} complication(s)
                        </span>
                    )}
                    {(details.momentum ?? 0) > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--ac-momentum-color)', fontWeight: 600 }}>
                            +{details.momentum} Momentum
                        </span>
                    )}
                </div>
            )}
            {isDamage && (
                <div className="flex gap-3 flex-wrap">
                    <span style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.72rem', color: 'var(--ac-accent)' }}>
                        {details.stress ?? 0} stress
                    </span>
                    {(details.effects ?? 0) > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--ac-secondary)' }}>
                            {details.effects} effet(s)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default AchtungHistoryEntry;