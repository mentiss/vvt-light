// src/client/src/systems/achtung/components/SkillsSection.jsx
import React, { useState } from 'react';
import { SKILLS } from '../config.jsx';

// ── FocusPills — affichage + édition des focuses d'une compétence ─────────────
const FocusPills = ({ skillKey, focus, editMode, onChange }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [custom, setCustom]   = useState('');

    const def         = SKILLS.find(s => s.key === skillKey);
    const canonical   = def?.focuses ?? [];
    // Focuses actuels : split sur virgule
    const current = focus
        ? [...new Set(focus.split(',').map(f => f.trim()).filter(Boolean))]
        : [];

    const add = (f) => {
        if (!f.trim() || current.includes(f.trim())) return;
        onChange([...current, f.trim()].join(', '));
        setCustom('');
        setShowAdd(false);
    };

    const remove = (f) => {
        onChange(current.filter(x => x !== f).join(', '));
    };

    if (!editMode) {
        if (!current.length) return null;
        return (
            <span className="ac-skill-focus">({current.join(', ')})</span>
        );
    }

    return (
        <div className="mt-1">
            {/* Pills existantes avec suppression */}
            <div className="flex flex-wrap gap-1 mb-1">
                {current.map((f, i) => (
                    <span key={`${f}-${i}`} className="ac-pill" style={{ fontSize: '0.62rem', padding: '1px 7px' }}>
                        {f}
                        <button
                            onClick={() => remove(f)}
                            className="ac-pill-remove"
                            style={{ marginLeft: 3 }}
                        >×</button>
                    </span>
                ))}
            </div>

            {/* Suggestions canoniques non encore prises */}
            <div className="flex flex-wrap gap-1 mb-1">
                {canonical.filter(f => !current.includes(f)).map((f, i) => (
                    <button
                        key={`${skillKey}-canonical-${i}`}
                        onClick={() => add(f)}
                        style={{
                            padding:       '1px 7px',
                            borderRadius:  99,
                            border:        '1px dashed var(--ac-border-strong)',
                            background:    'transparent',
                            color:         'var(--ac-muted)',
                            fontSize:      '0.62rem',
                            fontFamily:    'var(--ac-font-heading)',
                            cursor:        'pointer',
                            transition:    'all 0.1s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor='var(--ac-secondary)'; e.currentTarget.style.color='var(--ac-secondary)'; }}
                        onMouseOut={e  => { e.currentTarget.style.borderColor='var(--ac-border-strong)'; e.currentTarget.style.color='var(--ac-muted)'; }}
                    >+ {f}</button>
                ))}
                {/* Bouton ajout libre */}
                <button
                    onClick={() => setShowAdd(v => !v)}
                    style={{
                        padding:      '1px 7px',
                        borderRadius: 99,
                        border:       '1px dashed var(--ac-secondary)',
                        background:   'transparent',
                        color:        'var(--ac-secondary)',
                        fontSize:     '0.62rem',
                        fontFamily:   'var(--ac-font-heading)',
                        cursor:       'pointer',
                    }}
                >+ Libre</button>
            </div>

            {/* Saisie libre */}
            {showAdd && (
                <div className="flex gap-1 mt-1">
                    <input
                        autoFocus
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') add(custom); if (e.key === 'Escape') setShowAdd(false); }}
                        className="ac-input"
                        placeholder="Focus personnalisé…"
                        style={{ fontSize: '0.75rem' }}
                    />
                    <button onClick={() => add(custom)} className="ac-btn ac-btn-secondary" style={{ whiteSpace: 'nowrap' }}>OK</button>
                </div>
            )}
        </div>
    );
};

// ── SkillsSection ─────────────────────────────────────────────────────────────
const SkillsSection = ({ skills, editMode, onChange, onRoll }) => {
    const getSkill = (key) => {
        const found = skills?.find(s => s.key === key);
        const def   = SKILLS.find(s => s.key === key);
        return { key, label: def?.label ?? key, rank: found?.rank ?? 0, focus: found?.focus ?? '' };
    };

    const handleChange = (key, field, value) => {
        const next = SKILLS.map(s => {
            const current = getSkill(s.key);
            return s.key === key ? { ...current, [field]: value } : current;
        });
        onChange?.(next);
    };

    return (
        <div>
            <div className="ac-section-header">Compétences</div>
            <div className="ac-skills-grid">
                {SKILLS.map(({ key }) => {
                    const skill = getSkill(key);
                    if (skill.rank === 0 && !editMode) return null;
                    return (
                        <div key={key} className="ac-skill-item"
                             onClick={() => !editMode && onRoll?.({ skillKey: key })}
                        >
                            {editMode ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="ac-skill-label">{skill.label}</span>
                                        <input type="number" className="ac-input-num" value={skill.rank}
                                               onClick={e => e.stopPropagation()}
                                               onChange={e => handleChange(key, 'rank', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <FocusPills skillKey={key} focus={skill.focus} editMode={editMode}
                                                onChange={val => handleChange(key, 'focus', val)} />
                                </>
                            ) : (
                                <div className="flex justify-between items-center w-full">
                                    <div className="ac-skill-info">
                                        <span className="ac-skill-label">{skill.label}</span>
                                        <FocusPills skillKey={key} focus={skill.focus} editMode={false} onChange={null} />
                                    </div>
                                    <span className="ac-skill-rank">{skill.rank}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsSection;