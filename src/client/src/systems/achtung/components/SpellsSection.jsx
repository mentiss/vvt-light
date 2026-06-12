// src/client/src/systems/achtung/components/SpellsSection.jsx
// Section sorts — masquée si !isSpellcaster.
// Power + table CRUD des sorts.

import React from 'react';

const EMPTY_SPELL = { name: '', skillUsed: '', difficulty: 1, cost: '', duration: '', effect: '', momentumSpends: '' };

const SpellsSection = ({ isSpellcaster, power, spells = [], editMode, onChange, onChangePower }) => {
    if (!isSpellcaster && !editMode) return null;

    const add    = () => onChange?.([...spells, { ...EMPTY_SPELL, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(spells.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(spells.map((s, i) => i === idx ? { ...s, [field]: value } : s));

    return (
        <div>
            <div className="ac-section-header" style={{ color: 'var(--ac-accent)' }}>
                Sorts & Magie
            </div>

            {/* Toggle spellcaster + Power */}
            {editMode && (
                <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSpellcaster}
                            onChange={e => onChangePower?.('is_spellcaster', e.target.checked)}
                        />
                        <span className="ac-label">Lanceur de sorts</span>
                    </label>
                    {isSpellcaster && (
                        <div className="flex items-center gap-2">
                            <span className="ac-label">Puissance</span>
                            <input
                                type="number"
                                value={power}
                                min={0}
                                onChange={e => onChangePower?.('power', Math.max(0, parseInt(e.target.value) || 0))}
                                className="ac-input-num"
                            />
                        </div>
                    )}
                </div>
            )}

            {!editMode && isSpellcaster && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="ac-label">Puissance</span>
                    <span className="ac-value">{power}</span>
                </div>
            )}

            {isSpellcaster && (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="ac-table" style={{ minWidth: 560 }}>
                            <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Compétence</th>
                                <th style={{ textAlign: 'center' }}>Diff.</th>
                                <th>Coût</th>
                                <th>Durée</th>
                                <th>Effet</th>
                                <th>Momentum</th>
                                {editMode && <th style={{ width: 32 }} />}
                            </tr>
                            </thead>
                            <tbody>
                            {spells.map((s, idx) => (
                                <tr key={s.id ?? s._tempId ?? idx}>
                                    {['name', 'skillUsed', 'cost', 'duration', 'effect', 'momentumSpends'].map(field => (
                                        <td key={field}>
                                            {editMode
                                                ? <input value={s[field]} onChange={e => update(idx, field, e.target.value)} className="ac-input" />
                                                : <span style={{ fontSize: '0.78rem', color: field === 'name' ? 'var(--ac-text)' : 'var(--ac-text-muted)' }}>{s[field] || '—'}</span>}
                                        </td>
                                    ))}
                                    {/* difficulty numérique */}
                                    <td style={{ textAlign: 'center', order: 3 }}>
                                        {editMode
                                            ? <input type="number" value={s.difficulty} min={1} onChange={e => update(idx, 'difficulty', parseInt(e.target.value) || 1)} className="ac-input-num" style={{ width: '2.5rem' }} />
                                            : <span className="ac-value">{s.difficulty}</span>}
                                    </td>
                                    {editMode && (
                                        <td>
                                            <button onClick={() => remove(idx)} className="ac-btn ac-btn-danger" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>✕</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {spells.length === 0 && (
                                <tr><td colSpan={editMode ? 8 : 7} className="ac-text-muted text-center py-2">Aucun sort</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    {editMode && (
                        <button onClick={add} className="ac-btn ac-btn-secondary mt-2 w-full">+ Ajouter un sort</button>
                    )}
                </>
            )}
        </div>
    );
};

export default SpellsSection;