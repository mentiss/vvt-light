// src/client/src/systems/vikings/components/creation/StepSkills.jsx
// Étape 2 : compétences (spec_vikings.md §4, §4.1). 10 points, coût = niveau, 3 au plus
// à la création. Liste d'ajout dans l'étape (Q-L6-2), descriptions entières, recherche
// insensible à la casse et aux accents ; compétences choisies en lecture « seuil seul ».
// Compétence spécialisable : spécialisation demandée dans une fenêtre.

import React, { useState } from 'react';
import { CARACNAMES, COMPETENCES } from '../../config/competences.js';
import { getBestCharacteristic } from '../../config/rules.js';
import { CREATION, getCreationBudget, matchesSearch } from '../../config/creation.js';
import { formatSkillName, getSkillExamples, isSpecializableSkill } from '../../config/utils.js';
import VkIcon from '../ui/VkIcon.jsx';
import VkModal from '../ui/VkModal.jsx';
import { guideParagraphs } from '../../config/reference.js';
import { PointStick, SkillOdds, Stepper, TradeAdvice } from './CreationParts.jsx';

const sameSkill = (a, b) => a.name === b.name && (a.specialization || '') === (b.specialization || '');
const caracLabels = (comp) => [...new Set(comp.caracs.map(k => CARACNAMES[k]))].join(' / ');

const SpecializationModal = ({ skillName, skills, onAdd, onClose }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const confirm = () => {
        const v = value.trim();
        if (!v) { setError('Une spécialisation est requise.'); return; }
        if (skills.some(s => s.name === skillName && s.specialization?.toLowerCase() === v.toLowerCase())) {
            setError(`Doublon : ${skillName} (${v}) existe déjà.`);
            return;
        }
        onAdd(v);
    };
    return (
        <VkModal title="Spécialisation requise" icon="quill" onClose={onClose} size="max-w-sm">
            <p className="text-sm mb-3">
                Précisez une spécialité pour <strong>{skillName}</strong>.
                <span className="block text-muted italic">Ex. : {getSkillExamples(skillName)}</span>
            </p>
            <input className="vk-input" autoFocus value={value}
                   onChange={e => { setValue(e.target.value); setError(''); }}
                   onKeyDown={e => { if (e.key === 'Enter') confirm(); }} />
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
            <div className="flex gap-2 mt-4">
                <button type="button" className="vk-btn flex-1" onClick={onClose}>Annuler</button>
                <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={confirm}>Ajouter</button>
            </div>
        </VkModal>
    );
};

const StepSkills = ({ character, set }) => {
    const [search, setSearch] = useState('');
    const [pending, setPending] = useState(null);   // compétence spécialisable en attente
    const left = getCreationBudget(character).skillLeft;
    const skills = character.skills;

    const add = (name, specialization) => set('skills', [...skills, { name, ...(specialization ? { specialization } : {}), level: 1, currentPoints: 1 }]);
    const pick = (name) => (isSpecializableSkill(name) ? setPending(name) : add(name));
    const changeLevel = (skill, delta) => set('skills', skills.map(s => {
        if (!sameSkill(s, skill)) return s;
        const level = Math.max(0, Math.min(CREATION.maxSkill, s.level + delta));
        return { ...s, level, currentPoints: level };
    }));
    const remove = (skill) => set('skills', skills.filter(s => !sameSkill(s, skill)));
    const available = COMPETENCES.filter(c => matchesSearch(search, c.name, c.description)
        && (isSpecializableSkill(c.name) || !skills.some(s => s.name === c.name)));

    return (
        <>
            <p className="vk-cr-lead">
                Répartissez {CREATION.skillPoints} points : le coût d'une compétence est son niveau, {CREATION.maxSkill} au plus à la création.
                Le niveau fixe le seuil du dé ; la meilleure des deux caractéristiques liées fixe l'explosion.
            </p>
            <PointStick label="Points" left={left} total={CREATION.skillPoints} />
            <p className="vk-cr-rules">Seuil : niveau 0-1 → 7+ · 2 → 6+ · 3 → 5+. La chance affichée est celle d'une réussite standard à 3 dés.</p>
            <TradeAdvice paragraphs={guideParagraphs('Un métier avant tout').slice(0, 2)}>
                <p className="text-muted">Chaque métier donne ses outils à l'étape Équipement.</p>
            </TradeAdvice>

            <div className="vk-cr-two">
                <div>
                    <h4 className="vk-cr-subtitle">Ajouter une compétence</h4>
                    <span className="vk-input-icon block">
                        <VkIcon name="eye" />
                        <input className="vk-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (nom ou description)…" />
                    </span>
                    <div className="vk-cr-picklist">
                        {available.map(c => (
                            <button key={c.name} type="button" className="vk-cr-pick" onClick={() => pick(c.name)}>
                                <span className="vk-cr-pick-name">
                                    {c.name}
                                    {isSpecializableSkill(c.name) && <span className="vk-cr-pick-plus" title="Se prend plusieurs fois, avec une spécialisation"> + spécialité</span>}
                                </span>
                                <span className="vk-cr-pick-caracs">{caracLabels(c)}</span>
                                <span className="vk-cr-pick-desc">{c.description}</span>
                            </button>
                        ))}
                        {available.length === 0 && <p className="text-sm text-muted italic">Aucune compétence ne correspond à la recherche.</p>}
                    </div>
                </div>

                <div>
                    <h4 className="vk-cr-subtitle">Compétences choisies</h4>
                    {skills.length === 0 && <p className="text-sm text-muted italic">Aucune pour l'instant : cliquez une compétence à gauche.</p>}
                    {skills.map(skill => {
                        const comp = COMPETENCES.find(c => c.name === skill.name);
                        const bc = getBestCharacteristic(character, skill);
                        return (
                            <div key={`${skill.name}-${skill.specialization || 'default'}`} className={`vk-cr-skill ${skill.level ? '' : 'is-zero'}`}>
                                <div className="vk-skill-name">{formatSkillName(skill)}</div>
                                <SkillOdds level={skill.level} caracLevel={bc.level} />
                                <div className="vk-cr-skill-end">
                                    <Stepper value={skill.level}
                                             onMinus={() => changeLevel(skill, -1)} minusDisabled={skill.level <= 0}
                                             onPlus={() => changeLevel(skill, 1)} plusDisabled={skill.level >= CREATION.maxSkill || left <= 0} />
                                    <button type="button" className="vk-btn vk-btn-danger vk-btn-icon vk-btn-sm" onClick={() => remove(skill)} title="Retirer">
                                        <VkIcon name="close" />
                                    </button>
                                </div>
                                <div className="vk-cr-skill-desc">
                                    {comp && caracLabels(comp)} (explosion sur {CARACNAMES[bc.name]} {bc.level}){comp && ` · ${comp.description}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {pending && (
                <SpecializationModal skillName={pending} skills={skills} onClose={() => setPending(null)}
                                     onAdd={(spec) => { add(pending, spec); setPending(null); }} />
            )}
        </>
    );
};

export default StepSkills;
