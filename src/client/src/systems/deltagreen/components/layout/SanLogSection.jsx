// src/client/src/systems/deltagreen/components/layout/SanLogSection.jsx

import React from 'react';

const SanLogSection = ({ sanLog, editMode, onNotesChange }) => {
    const entries = sanLog ?? [];

    return (
        <div>
            <p className="dg-section-label text-base mb-3 border-b border-default pb-1">
                14. PERTE DE SAN N'AYANT PAS ENTRAÎNÉ LA FOLIE
            </p>

            {entries.length === 0 ? (
                <p className="text-sm text-muted font-mono italic">Aucune perte enregistrée.</p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {entries.map((e) => (
                        <div key={e.id} className="border-b border-default/40 pb-2">
                            {/* Ligne principale — date / situation / perte / SAN */}
                            <div className="flex items-baseline gap-3 text-xs font-mono">
                                <span className="text-muted shrink-0 w-32">
                                    {e.createdAt
                                        ? new Date(e.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: '2-digit',
                                            year: '2-digit', hour: '2-digit', minute: '2-digit',
                                        })
                                        : '—'}
                                </span>
                                <span className="flex-1 text-default">{e.situationLabel}</span>
                                <span className="text-danger font-bold shrink-0">−{e.lossApplied}</span>
                                <span className="text-muted shrink-0">{e.sanBefore}→{e.sanAfter}</span>
                            </div>

                            {/* Note — affichée si présente OU si editMode */}
                            {editMode ? (
                                <input
                                    type="text"
                                    className="dg-field-input w-full px-2 py-0.5 text-xs mt-1"
                                    placeholder="Note de contexte…"
                                    value={e.notes ?? ''}
                                    onChange={ev => onNotesChange?.(e.id, ev.target.value)}
                                />
                            ) : e.notes ? (
                                <p className="text-xs font-mono text-muted italic mt-0.5 pl-1 border-l border-default/30">
                                    {e.notes}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SanLogSection;