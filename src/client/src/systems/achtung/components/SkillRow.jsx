// src/client/src/systems/achtung/components/SkillRow.jsx
// Ligne compétence : rang (0–5) + focus texte libre + bouton jet.

import React from 'react';

const SkillRow = ({ skill, editMode, onChange, onRoll }) => {
    const { key, label, rank, focus } = skill;

    return (
        <tr>
            <td style={{ width: '30%' }}>
                <span className="ac-label">{label}</span>
            </td>
            <td style={{ width: '10%', textAlign: 'center' }}>
                {editMode ? (
                    <input
                        type="number"
                        value={rank}
                        min={0} max={5}
                        onChange={e => onChange(key, 'rank', Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                        className="ac-input-num"
                        style={{ width: '2.5rem' }}
                    />
                ) : (
                    <span className="ac-value">{rank}</span>
                )}
            </td>
            <td>
                {editMode ? (
                    <input
                        type="text"
                        value={focus}
                        placeholder="Focus…"
                        onChange={e => onChange(key, 'focus', e.target.value)}
                        className="ac-input"
                        style={{ fontSize: '0.78rem' }}
                    />
                ) : (
                    <span className="ac-text-muted" style={{ fontSize: '0.78rem' }}>{focus || '—'}</span>
                )}
            </td>
            <td style={{ width: '60px', textAlign: 'right' }}>
                <button
                    onClick={() => onRoll?.({ skillKey: key, skillLabel: label, skillRank: rank, hasFocus: !!focus })}
                    className="ac-roll-btn"
                    title={`Lancer ${label}`}
                >
                    🎲
                </button>
            </td>
        </tr>
    );
};

export default SkillRow;