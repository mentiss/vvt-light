// src/client/src/systems/achtung/components/SpellsSection.jsx
import React, { useState } from 'react';
import { SPELLS, SKILL_LABEL } from '../config.jsx';

const SPELL_INDEX = {
    ...Object.fromEntries((SPELLS.celtic  ?? []).map(s => [s.key, { ...s, tradition: 'celtic'  }])),
    ...Object.fromEntries((SPELLS.runic   ?? []).map(s => [s.key, { ...s, tradition: 'runic'   }])),
    ...Object.fromEntries((SPELLS.psychic ?? []).map(s => [s.key, { ...s, tradition: 'psychic' }])),
};

const ALL_SPELLS = [...(SPELLS.celtic ?? []), ...(SPELLS.runic ?? []), ...(SPELLS.psychic ?? [])];

const TRADITION_LABELS = { celtic: 'Celtique', runic: 'Runique', psychic: 'Psychique' };

const EMPTY_SPELL = { name: '', skillUsed: '', difficulty: 1, cost: '', duration: '', effect: '', momentumSpends: '', spellKey: null, tradition: null };

// ── Picker catalogue sorts ────────────────────────────────────────────────────
const SpellPicker = ({ onAdd, existing }) => {
    const [search,     setSearch]     = useState('');
    const [tradition,  setTradition]  = useState('');

    const existingKeys = existing.map(s => s.spellKey).filter(Boolean);

    const filtered = ALL_SPELLS.filter(s => {
        const inTrad = !tradition || SPELL_INDEX[s.key]?.tradition === tradition;
        const inSearch = !search || s.label.toLowerCase().includes(search.toLowerCase());
        const notOwned = !existingKeys.includes(s.key);
        return inTrad && inSearch && notOwned;
    });

    return (
        <div className="ac-card-alt" style={{ marginTop: '0.5rem' }}>
            <div className="ac-label mb-1">Choisir depuis le catalogue</div>
            <div className="flex gap-2 mb-2">
                <select value={tradition} onChange={e => setTradition(e.target.value)} className="ac-input" style={{ fontSize: '0.78rem', maxWidth: 130 }}>
                    <option value=''>Toutes traditions</option>
                    <option value='celtic'>Celtique</option>
                    <option value='runic'>Runique</option>
                    <option value='psychic'>Psychique</option>
                </select>
                <input value={search} onChange={e => setSearch(e.target.value)} className="ac-input" placeholder="Rechercher…" style={{ fontSize: '0.78rem' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filtered.map(s => {
                    const trad = SPELL_INDEX[s.key]?.tradition;
                    return (
                        <button key={s.key} onClick={() => onAdd({
                            name: s.label, skillUsed: s.skill, difficulty: s.difficulty,
                            cost: s.cost, duration: s.duration, effect: s.effect,
                            momentumSpends: '', spellKey: s.key, tradition: trad, flawed: false,
                        })} className="text-left"
                                style={{ padding: '0.3rem 0.5rem', background: 'var(--ac-surface)', border: '1px solid var(--ac-border)', borderRadius: 3, cursor: 'pointer' }}>
                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--ac-text)' }}>
                                {s.label}
                                {trad && <span style={{ fontWeight: 400, color: 'var(--ac-muted)', marginLeft: 6, fontSize: '0.65rem', textTransform: 'none' }}>{TRADITION_LABELS[trad]}</span>}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--ac-muted)', marginTop: 1 }}>
                                {SKILL_LABEL[s.skill] ?? s.skill} · Diff. {s.difficulty} · {s.cost}
                            </div>
                        </button>
                    );
                })}
                {filtered.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--ac-muted)', fontStyle: 'italic' }}>Aucun sort trouvé.</p>}
            </div>
        </div>
    );
};

// ── SpellCard ─────────────────────────────────────────────────────────────────
const SpellCard = ({ spell, idx, editMode, onUpdate, onRemove }) => {
    const canonical  = spell.spellKey ? SPELL_INDEX[spell.spellKey] : null;
    const tradition  = spell.tradition ?? canonical?.tradition ?? null;
    const tradClass  = tradition ? `ac-spell-card--${tradition}` : '';
    const tradLabel  = tradition ? TRADITION_LABELS[tradition] : null;
    const skillLabel = SKILL_LABEL[spell.skillUsed] ?? spell.skillUsed;
    const displayEffect = canonical?.effect ?? spell.effect;

    return (
        <div className={`ac-spell-card ${tradClass}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                    {editMode ? (
                        <input value={spell.name} onChange={e => onUpdate(idx, 'name', e.target.value)}
                               className="ac-input" style={{ maxWidth: 220 }} placeholder="Nom du sort…" />
                    ) : (
                        <span className="ac-spell-name">{spell.name || '—'}</span>
                    )}
                    {tradLabel && <span className="ac-spell-tradition-badge">{tradLabel}</span>}
                    {spell.flawed && <span className="ac-spell-flawed">Imparfait</span>}
                </div>
                {editMode && (
                    <button onClick={() => onRemove(idx)} className="ac-btn ac-btn-danger" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', flexShrink: 0 }}>✕</button>
                )}
            </div>

            <div className="ac-spell-meta">
                {editMode ? (
                    <>
                        <div>
                            <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Compétence</span>
                            <input value={spell.skillUsed} onChange={e => onUpdate(idx, 'skillUsed', e.target.value)} className="ac-input" style={{ maxWidth: 140 }} />
                        </div>
                        <div>
                            <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Difficulté</span>
                            <input type="number" min={0} max={5} value={spell.difficulty} onChange={e => onUpdate(idx, 'difficulty', parseInt(e.target.value) || 0)} className="ac-input-num" />
                        </div>
                        <div style={{ flex: '1 1 160px' }}>
                            <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Coût</span>
                            <input value={spell.cost} onChange={e => onUpdate(idx, 'cost', e.target.value)} className="ac-input" placeholder="Ex : 5⚄ Drain" />
                        </div>
                        <div style={{ flex: '1 1 140px' }}>
                            <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Durée</span>
                            <input value={spell.duration} onChange={e => onUpdate(idx, 'duration', e.target.value)} className="ac-input" placeholder="Ex : Instantané" />
                        </div>
                        {!spell.spellKey && (
                            <div>
                                <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Tradition</span>
                                <select value={spell.tradition ?? ''} onChange={e => onUpdate(idx, 'tradition', e.target.value || null)} className="ac-input" style={{ maxWidth: 120 }}>
                                    <option value=''>—</option>
                                    <option value='celtic'>Celtique</option>
                                    <option value='runic'>Runique</option>
                                    <option value='psychic'>Psychique</option>
                                </select>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {skillLabel && <span>Comp. : <strong>{skillLabel}</strong></span>}
                        <span>Diff. : <strong>{spell.difficulty}</strong></span>
                        <span className="ac-spell-cost">Coût : <strong>{spell.cost || '—'}</strong></span>
                        <span>Durée : <strong>{spell.duration || '—'}</strong></span>
                    </>
                )}
            </div>

            {editMode && !spell.spellKey ? (
                <div style={{ marginTop: '0.5rem' }}>
                    <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Effet</span>
                    <textarea value={spell.effect} onChange={e => onUpdate(idx, 'effect', e.target.value)} className="ac-input" rows={3} style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                </div>
            ) : displayEffect ? (
                <p className="ac-spell-effect">{displayEffect}</p>
            ) : null}

            {editMode && (
                <div style={{ marginTop: '0.4rem' }}>
                    <span className="ac-label" style={{ display: 'block', marginBottom: 2 }}>Dépenses Momentum</span>
                    <input value={spell.momentumSpends} onChange={e => onUpdate(idx, 'momentumSpends', e.target.value)} className="ac-input" placeholder="Ex : Pour 2 Momentum, ajout Intense…" />
                </div>
            )}
        </div>
    );
};

// ── SpellsSection ─────────────────────────────────────────────────────────────
const SpellsSection = ({ isSpellcaster, power, spells = [], editMode, onChange, onChangePower }) => {
    const [showPicker, setShowPicker] = useState(false);

    if (!isSpellcaster && !editMode) return null;

    const add      = (spell) => { onChange?.([...spells, { ...spell, _tempId: Date.now() }]); setShowPicker(false); };
    const addEmpty = () => onChange?.([...spells, { ...EMPTY_SPELL, _tempId: Date.now() }]);
    const remove   = (idx) => onChange?.(spells.filter((_, i) => i !== idx));
    const update   = (idx, field, value) => onChange?.(spells.map((s, i) => i === idx ? { ...s, [field]: value } : s));

    return (
        <div className="ac-magic-section ac-card">
            <div className="ac-section-header">Sorts &amp; Magie</div>

            {editMode && (
                <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isSpellcaster} onChange={e => onChangePower?.('is_spellcaster', e.target.checked)} />
                        <span className="ac-label">Lanceur de sorts</span>
                    </label>
                    {isSpellcaster && (
                        <div className="flex items-center gap-2">
                            <span className="ac-label">Puissance</span>
                            <input type="number" value={power} min={0}
                                   onChange={e => onChangePower?.('power', Math.max(0, parseInt(e.target.value) || 0))}
                                   className="ac-input-num" />
                        </div>
                    )}
                </div>
            )}

            {!editMode && isSpellcaster && (
                <div className="flex items-center gap-3 mb-3">
                    <span className="ac-label">Puissance</span>
                    <span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ac-mythos-header)' }}>{power}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-heading)' }}>⚄ dés de Challenge</span>
                </div>
            )}

            {isSpellcaster && (
                <div className="flex flex-col gap-0">
                    {spells.map((s, idx) => (
                        <SpellCard key={s.id ?? s._tempId ?? idx} spell={s} idx={idx}
                                   editMode={editMode} onUpdate={update} onRemove={remove} />
                    ))}
                    {spells.length === 0 && !editMode && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--ac-text-muted)', fontStyle: 'italic' }}>Aucun sort lié au manteau.</p>
                    )}
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
                            {showPicker && <SpellPicker onAdd={add} existing={spells} />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SpellsSection;