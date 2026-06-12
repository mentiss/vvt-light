// src/client/src/systems/achtung/components/TalentsList.jsx
import React from 'react';

const EMPTY_TALENT = { name: '', effect: '' };

const TalentsList = ({ talents = [], editMode, onChange }) => {
    const add = () => onChange?.([...talents, { ...EMPTY_TALENT, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(talents.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(talents.map((t, i) => i === idx ? { ...t, [field]: value } : t));

    return (
        <div className="flex flex-col gap-4">
            <div className="ac-section-header">Talents</div>

            {talents.length === 0 && !editMode && (
                <p className="ac-text-muted text-center py-2">—</p>
            )}

            <div className="flex flex-col gap-3">
                {talents.map((t, idx) => (
                    <div key={t.id ?? t._tempId ?? idx} className="ac-talent-card p-3 border border-[var(--ac-border)] rounded-sm">
                        {editMode ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    value={t.name}
                                    onChange={e => update(idx, 'name', e.target.value)}
                                    className="ac-input font-bold"
                                    placeholder="Nom du talent"
                                />
                                <textarea
                                    value={t.effect}
                                    onChange={e => update(idx, 'effect', e.target.value)}
                                    className="ac-input w-full"
                                    rows={3}
                                    placeholder="Description du talent"
                                />
                                <button onClick={() => remove(idx)} className="ac-btn ac-btn-danger self-end text-xs">Supprimer</button>
                            </div>
                        ) : (
                            <>
                                <div className="font-bold text-[var(--ac-primary)] mb-1" style={{ fontFamily: 'var(--ac-font-title)' }}>
                                    {t.name}
                                </div>
                                <div className="text-[0.9rem] leading-relaxed text-[var(--ac-text)]">
                                    {t.effect}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {editMode && (
                <button onClick={add} className="ac-btn ac-btn-secondary w-full">
                    + Ajouter un talent
                </button>
            )}
        </div>
    );
};

export default TalentsList;