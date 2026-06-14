// src/client/src/systems/achtung/components/TalentsList.jsx
import React, { useState } from 'react';
import ExpandableText from '../../../components/ui/ExpandableText.jsx';
import { TALENTS } from '../config.jsx';

const EMPTY_TALENT = { name: '', keywords: '', effect: '' };

// ── Picker catalogue talents ──────────────────────────────────────────────────
const TalentPicker = ({ onAdd, existing }) => {
    const [search, setSearch] = useState('');
    const existingNames = existing.map(t => t.name?.toLowerCase());

    const filtered = Object.entries(TALENTS)
        .filter(([, t]) =>
            !existingNames.includes(t.label.toLowerCase()) &&
            (t.label.toLowerCase().includes(search.toLowerCase()) ||
                t.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())))
        );

    return (
        <div className="ac-card-alt" style={{ marginTop: '0.5rem' }}>
            <div className="ac-label mb-1">Choisir depuis le catalogue</div>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ac-input mb-2"
                placeholder="Rechercher un talent…"
                style={{ fontSize: '0.8rem' }}
            />
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filtered.slice(0, 20).map(([key, t]) => (
                    <button
                        key={key}
                        onClick={() => onAdd({ name: t.label, keywords: t.keywords.join(', '), effect: t.description })}
                        className="text-left"
                        style={{
                            padding:    '0.3rem 0.5rem',
                            background: 'var(--ac-surface)',
                            border:     '1px solid var(--ac-border)',
                            borderRadius: 3,
                            cursor:     'pointer',
                        }}
                    >
                        <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--ac-text)' }}>
                            {t.label}
                            <span style={{ fontWeight: 400, color: 'var(--ac-muted)', marginLeft: 6, textTransform: 'none', fontSize: '0.65rem' }}>
                                {t.keywords.join(', ')}
                            </span>
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--ac-muted)', fontStyle: 'italic' }}>Aucun résultat.</p>
                )}
            </div>
        </div>
    );
};

// ── TalentsList ───────────────────────────────────────────────────────────────
const TalentsList = ({ talents = [], editMode, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const add    = (talent) => { onChange?.([...talents, { ...talent, _tempId: Date.now() }]); setShowPicker(false); };
    const addEmpty = () => onChange?.([...talents, { ...EMPTY_TALENT, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(talents.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(talents.map((t, i) => i === idx ? { ...t, [field]: value } : t));

    return (
        <div>
            <div className="ac-section-header">Talents</div>

            {talents.length === 0 && !editMode && (
                <p className="ac-text-muted" style={{ fontSize: '0.78rem', fontStyle: 'italic', padding: '0.25rem 0' }}>—</p>
            )}

            <div className="flex flex-col mt-1">
                {talents.map((t, idx) => (
                    <div key={t.id ?? t._tempId ?? idx} className="ac-talent-card">
                        {editMode ? (
                            <div className="flex flex-col gap-1">
                                <input value={t.name} onChange={e => update(idx, 'name', e.target.value)}
                                       className="ac-input" placeholder="Nom du talent" style={{ fontWeight: 700 }} />
                                <input value={t.keywords ?? ''} onChange={e => update(idx, 'keywords', e.target.value)}
                                       className="ac-input" placeholder="Keywords (ex : Combat, Fortune)" style={{ fontSize: '0.75rem' }} />
                                <textarea value={t.effect} onChange={e => update(idx, 'effect', e.target.value)}
                                          className="ac-input" rows={2} placeholder="Description du talent"
                                          style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                                <button onClick={() => remove(idx)}
                                        className="ac-btn ac-btn-danger self-end" style={{ fontSize: '0.65rem' }}>
                                    Supprimer
                                </button>
                            </div>
                        ) : (
                            <div>
                                <span className="ac-talent-name">{t.name}</span>
                                {t.keywords && <span className="ac-talent-keywords">{t.keywords}</span>}
                                <br/>
                                {t.effect && (
                                    <ExpandableText text={t.effect} maxLength={100} className="ac-talent-effect" />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {editMode && (
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                        <button onClick={() => setShowPicker(v => !v)} className="ac-btn ac-btn-secondary flex-1">
                            {showPicker ? '✕ Fermer le catalogue' : '📖 Depuis le catalogue'}
                        </button>
                        <button onClick={addEmpty} className="ac-btn ac-btn-ghost flex-1">
                            + Saisie libre
                        </button>
                    </div>
                    {showPicker && <TalentPicker onAdd={add} existing={talents} />}
                </div>
            )}
        </div>
    );
};

export default TalentsList;