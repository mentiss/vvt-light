// src/client/src/systems/achtung/components/TruthsSection.jsx
// Vérités & Cicatrices — lecture compacte, édition avec suggestions canoniques.

import React, { useMemo } from 'react';
import { BACKGROUND_DATA, CHARACTERISTIC_DATA } from '../config.jsx';

// Agrège toutes les suggestions canoniques de backgrounds + characteristics
const CANONICAL_TRUTHS = (() => {
    const all = new Set();
    Object.values(BACKGROUND_DATA).forEach(bd => {
        bd.truthSuggestions?.forEach(t => all.add(t));
    });
    Object.values(CHARACTERISTIC_DATA).forEach(cd => {
        if (cd.isChoice) {
            Object.values(cd.options).forEach(o => { if (o.truthDefault) all.add(o.truthDefault); });
        } else if (cd.truthDefault) {
            all.add(cd.truthDefault);
        }
    });
    return [...all].sort();
})();

const TruthsSection = ({ truths = [], editMode, onChange }) => {
    const filled = truths.filter(v => v?.trim());

    const handleChange = (i, val) => {
        const next = [...Array.from({ length: 5 }, (_, j) => truths[j] ?? '')];
        next[i] = val;
        onChange?.(next);
    };

    const addSuggestion = (suggestion) => {
        const next = [...Array.from({ length: 5 }, (_, j) => truths[j] ?? '')];
        // Trouver la première case vide
        const emptyIdx = next.findIndex(v => !v?.trim());
        if (emptyIdx === -1) return; // toutes pleines
        next[emptyIdx] = suggestion;
        onChange?.(next);
    };

    // Suggestions pas déjà utilisées
    const unusedSuggestions = useMemo(() =>
            CANONICAL_TRUTHS.filter(t => !truths.includes(t)),
        [truths]
    );

    return (
        <div>
            <div className="ac-section-header">Vérités & Cicatrices</div>

            {editMode ? (
                <div className="flex flex-col gap-2 mt-1">
                    {/* 5 cases éditables */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <input
                            key={i}
                            value={truths[i] ?? ''}
                            onChange={e => handleChange(i, e.target.value)}
                            className="ac-input"
                            placeholder={`Vérité ${i + 1}…`}
                        />
                    ))}

                    {/* Suggestions canoniques */}
                    {unusedSuggestions.length > 0 && (
                        <div style={{ marginTop: '0.25rem' }}>
                            <div className="ac-label mb-1">Suggestions du catalogue</div>
                            <div className="flex flex-wrap gap-1">
                                {unusedSuggestions.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => addSuggestion(t)}
                                        style={{
                                            padding:      '2px 8px',
                                            borderRadius: 99,
                                            border:       '1px dashed var(--ac-border-strong)',
                                            background:   'transparent',
                                            color:        'var(--ac-muted)',
                                            fontSize:     '0.68rem',
                                            fontFamily:   'var(--ac-font-heading)',
                                            cursor:       'pointer',
                                            transition:   'all 0.1s',
                                            textAlign:    'left',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor='var(--ac-secondary)'; e.currentTarget.style.color='var(--ac-secondary)'; }}
                                        onMouseOut={e  => { e.currentTarget.style.borderColor='var(--ac-border-strong)'; e.currentTarget.style.color='var(--ac-muted)'; }}
                                    >+ {t}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : filled.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--ac-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>
                    Aucune vérité.
                </p>
            ) : (
                <div className="flex flex-col mt-1">
                    {filled.map((val, i) => (
                        <div key={i} style={{
                            fontFamily:   'var(--ac-font-title)',
                            fontSize:     '0.82rem',
                            color:        'var(--ac-text)',
                            padding:      '0.28rem 0.4rem',
                            borderBottom: '1px solid var(--ac-border)',
                        }}>
                            {val}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TruthsSection;