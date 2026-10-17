// src/client/src/systems/vikings/components/layout/SkillsSection.jsx
// Compétences : carac utilisée, seuil, explosion, points (succès auto), niveau.
// La récupération des points et le jet sont des actions de jeu (hors édition).

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { getBestCharacteristic, getSuccessThreshold } from '../../config/rules.js';
import { formatExplosion } from '../../config/utils.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

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
        <VkPanel>
            <div className="vk-section-title">
                Compétences
                {editMode
                    ? <button type="button" className="vk-btn vk-btn-sm" onClick={() => onOpenEditModal('addSkill')}><VkIcon name="plus" />Ajouter</button>
                    : <button type="button" className="vk-btn vk-btn-sm" onClick={recoverAll}>Récup tous</button>}
            </div>
            <div>
                {skills.map(skill => {
                    const bc = getBestCharacteristic(char, skill);
                    const missing = skill.currentPoints < skill.level;
                    return (
                        <div key={`${skill.name}-${skill.specialization || 'default'}`} className="vk-row">
                            <div className="flex-1 min-w-0">
                                <div className="font-bold">
                                    {skill.name}
                                    {skill.specialization && <span className="text-muted font-normal"> — {skill.specialization}</span>}
                                </div>
                                <div className="text-xs text-muted">
                                    {CARACNAMES[bc.name]} · seuil {getSuccessThreshold(skill.level)}+ · expl. {formatExplosion(bc.level)}
                                </div>
                            </div>

                            <div className="vk-dots" title={`${skill.currentPoints}/${skill.level} points`}>
                                {Array.from({ length: skill.level }, (_, i) => <i key={i} className={i < skill.currentPoints ? 'is-full' : ''} />)}
                            </div>
                            {!editMode && missing && (
                                <button type="button" className="vk-btn vk-btn-success vk-btn-sm" onClick={() => recover(skill)}>Récup</button>
                            )}

                            {editMode ? (
                                <>
                                    <div className="vk-stepper">
                                        <button type="button" onClick={() => changeLevel(skill, -1)} disabled={skill.level <= 0}><VkIcon name="minus" /></button>
                                        <span className="vk-num">{skill.level}</span>
                                        <button type="button" onClick={() => changeLevel(skill, 1)} disabled={skill.level >= 5}><VkIcon name="plus" /></button>
                                    </div>
                                    <button type="button" className="vk-btn vk-btn-danger vk-btn-icon vk-btn-sm" onClick={() => removeSkill(skill)} title="Retirer">
                                        <VkIcon name="close" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="vk-row-val w-5 text-center">{skill.level}</span>
                                    <button type="button" className="vk-roll" onClick={() => onRoll({ type: 'skill', data: skill })} title={`Lancer ${skill.name}`}>
                                        <VkIcon name="die" />
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </VkPanel>
    );
};

export default SkillsSection;
