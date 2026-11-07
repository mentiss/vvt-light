// src/client/src/systems/vikings/components/layout/SkillsSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Compétences, lecture « seuil seul » (spec_vikings_pierre_peinte.md D-8, planche) :
// losange du seuil, explosion (meilleure carac liée), dés du pool (retirés par les
// blessures), entailles des succès auto restants, chance d'une réussite standard
// fatigue comprise (C-2, masquable dans le menu), bouton de jet.
// Récupération des points : en mode Édition seulement (C-5), la fin d'arc est au MJ.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import {
    getBestCharacteristic, getSuccessThreshold, getExplosionThreshold, getSuccessChance,
    getBlessureMalus, getFatigueMalus, BLESSURE_MAX, isFatigueKO,
} from '../../config/rules.js';
import { formatExplosion } from '../../config/utils.js';
import { useVkLook } from '../../hooks/useVkLook.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const sameSkill = (a, b) => a.name === b.name && a.specialization === b.specialization;
const BASE_POOL = 3;

const SkillsSection = ({ char, editMode, set, update, onRoll, onOpenEditModal }) => {
    const [look] = useVkLook();
    const showOdds = look.odds !== false;
    const skills = char.skills ?? [];
    const blessures = char.tokensBlessure ?? 0;
    const pool = Math.max(1, BASE_POOL - getBlessureMalus(blessures));
    const need = 1 + getFatigueMalus(char.tokensFatigue ?? 0);
    const out = blessures >= BLESSURE_MAX || isFatigueKO(char.tokensFatigue);

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
    const recoverAll = () => update(prev => ({ ...prev, skills: prev.skills.map(s => ({ ...s, currentPoints: s.level })) }));

    return (
        <VkPanel className={`vk-skills ${editMode ? 'is-editing' : ''}`}>
            <h3 className="vk-band-title">Compétences</h3>
            {editMode && (
                <div className="vk-slab-aside">
                    <button type="button" className="vk-btn vk-btn-sm" onClick={recoverAll}>Récupérer tout</button>
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => onOpenEditModal('addSkill')}><VkIcon name="plus" />Ajouter</button>
                </div>
            )}
            <div>
                {skills.map(skill => {
                    const bc = getBestCharacteristic(char, skill);
                    const seuil = getSuccessThreshold(skill.level);
                    const chance = out ? null : getSuccessChance(pool, seuil, getExplosionThreshold(bc.level).length, need);
                    return (
                        <div key={`${skill.name}-${skill.specialization || 'default'}`} className="vk-skill">
                            <div className="vk-skill-name">
                                {skill.name}
                                {skill.specialization && <small> · {skill.specialization}</small>}
                            </div>
                            <div className="vk-skill-carac">{CARACNAMES[bc.name]} {bc.level}</div>
                            <div className="vk-skill-rule">
                                <span className="vk-seuil" title="Seuil de succès">{seuil}+</span>
                                <span className="vk-boom" title="Explosion">↻ {formatExplosion(bc.level).replace(/, /g, '-')}</span>
                            </div>
                            <div className="vk-pool" title={`${pool} dé${pool > 1 ? 's' : ''}`}>
                                {Array.from({ length: BASE_POOL }, (_, d) => <i key={d} className={d >= pool ? 'is-lost' : ''} />)}
                            </div>
                            <div className="vk-dots" title={`${skill.currentPoints}/${skill.level} succès auto`}>
                                {Array.from({ length: skill.level }, (_, i) => <i key={i} className={i < skill.currentPoints ? 'is-full' : ''} />)}
                            </div>
                            <div className="vk-skill-end">
                                {editMode ? (
                                    <>
                                        {skill.currentPoints < skill.level && (
                                            <button type="button" className="vk-btn vk-btn-success vk-btn-sm" onClick={() => recover(skill)}>Récupérer</button>
                                        )}
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
                                        {showOdds && (
                                            <span className="vk-odds" title={`Réussite standard${need > 1 ? `, fatigue comprise (${need} succès)` : ''}, sans succès auto`}>
                                                {chance === null ? '—' : `${Math.round(chance * 100)} %`}
                                            </span>
                                        )}
                                        <button type="button" className="vk-roll" onClick={() => onRoll({ type: 'skill', data: skill })} title={`Lancer ${skill.name}`}>
                                            <VkIcon name="die" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </VkPanel>
    );
};

export default SkillsSection;
