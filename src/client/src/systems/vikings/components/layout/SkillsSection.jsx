// src/client/src/systems/vikings/components/layout/SkillsSection.jsx
// Compétences : niveau, carac utilisée, seuil, explosion, points (succès auto).
// La récupération des points est une action de jeu (hors mode édition).

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { getBestCharacteristic, getSuccessThreshold } from '../../config/rules.js';
import { formatExplosion, formatSkillName } from '../../config/utils.js';

const sameSkill = (a, b) => a.name === b.name && a.specialization === b.specialization;

const SkillsSection = ({ char, editMode, set, update, onRoll, onOpenEditModal }) => {
    const skills = char.skills ?? [];

    const changeLevel = (skill, delta) => set('skills', skills.map(s => {
        if (!sameSkill(s, skill)) return s;
        const level = Math.max(0, Math.min(5, s.level + delta));
        return { ...s, level, currentPoints: level };
    }));
    const removeSkill = (skill) => set('skills', skills.filter(s => !sameSkill(s, skill)));

    const recover = (skill) => update(prev => ({
        ...prev,
        skills: prev.skills.map(s => sameSkill(s, skill) ? { ...s, currentPoints: s.level } : s),
    }));
    const recoverAll = () => update(prev => ({
        ...prev,
        skills: prev.skills.map(s => ({ ...s, currentPoints: s.level })),
    }));

    return (
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-default">Compétences</h3>
                {editMode
                    ? <button onClick={() => onOpenEditModal('addSkill')} className="text-xs px-2 py-1 bg-primary text-default rounded">+ Ajout</button>
                    : <button onClick={recoverAll} className="text-xs px-2 py-1 bg-success text-white rounded">Récup tous</button>}
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
                {skills.map(skill => {
                    const bc = getBestCharacteristic(char, skill);
                    return (
                        <div key={`${skill.name}-${skill.specialization || 'default'}`} className="p-1.5 bg-default rounded">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 text-xs text-default">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold">{formatSkillName(skill)} (Niv {skill.level})</span>
                                        {editMode && (
                                            <>
                                                <button onClick={() => changeLevel(skill, -1)} disabled={skill.level <= 0}
                                                        className="w-3 h-3 bg-primary rounded-full text-xs font-bold disabled:opacity-30 text-default flex items-center justify-center leading-none">-</button>
                                                <button onClick={() => changeLevel(skill, 1)} disabled={skill.level >= 5}
                                                        className="w-3 h-3 bg-primary rounded-full text-xs font-bold disabled:opacity-30 text-default flex items-center justify-center leading-none">+</button>
                                                <button onClick={() => removeSkill(skill)} className="text-xs px-1 bg-danger text-white rounded leading-none">✕</button>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-muted">
                                        {CARACNAMES[bc.name]} | Seuil : {getSuccessThreshold(skill.level)}+ | Expl : {formatExplosion(bc.level)}
                                    </div>
                                </div>
                                {!editMode && (
                                    <button onClick={() => onRoll({ type: 'skill', data: skill })}
                                            className="text-xs px-1 py-0.5 bg-primary rounded text-default" title={`Lancer ${formatSkillName(skill)}`}>
                                        🎲
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: skill.level }, (_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${i < skill.currentPoints ? 'bg-success' : 'bg-surface-alt border border-default'}`} />
                                    ))}
                                </div>
                                {!editMode && skill.currentPoints < skill.level && (
                                    <button onClick={() => recover(skill)} className="px-1 py-0.5 bg-success text-white rounded text-xs">Récup</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsSection;
