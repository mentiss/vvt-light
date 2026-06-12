// src/client/src/systems/achtung/components/SkillsSection.jsx
import React from 'react';
import { SKILLS } from '../config.jsx';

const SkillsSection = ({ skills, editMode, onChange, onRoll }) => {
    const getSkill = (key) => {
        const found = skills?.find(s => s.key === key);
        const def = SKILLS.find(s => s.key === key);
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
                    if(skill.rank === 0 && !editMode) {
                        return;
                    }
                    return (
                        <div key={key} className="ac-skill-item" onClick={() => !editMode && onRoll({ skillKey: key })}>
                            <div className="ac-skill-info">
                                <span className="ac-skill-label">{skill.label}</span>
                                {skill.focus && <span className="ac-skill-focus">({skill.focus})</span>}
                            </div>
                            {editMode ? (
                                <input type="number" className="ac-input-num" value={skill.rank} onChange={(e) => handleChange(key, 'rank', parseInt(e.target.value) || 0)} />
                            ) : (
                                <span className="ac-skill-rank">{skill.rank}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsSection;