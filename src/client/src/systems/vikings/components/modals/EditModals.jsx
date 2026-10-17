// src/client/src/systems/vikings/components/modals/EditModals.jsx
// Modales du mode édition : ajout d'une compétence ou d'un trait.
// Mode édition = correction : pas de « SAGA +N » à l'ajout d'un trait (L3-2) ;
// les valeurs de combat sont recalculées à l'enregistrement (withDerivedValues).
// Habillage : planche du lot 4.

import React, { useState } from "react";
import {CARACNAMES, COMPETENCES} from "../../config/competences.js";
import {TRAITS} from "../../config/traits.js";
import {checkTraitConditions} from "../../config/rules.js";
import {getSkillExamples, isSpecializableSkill} from "../../config/utils.js";
import VkModal from "../ui/VkModal.jsx";
import VkIcon from "../ui/VkIcon.jsx";

const Actions = ({ onClose, onAdd, disabled }) => (
    <div className="flex gap-2 pt-3 mt-3 border-t border-default">
        <button type="button" className="vk-btn flex-1" onClick={onClose}>Annuler</button>
        <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={onAdd} disabled={disabled}><VkIcon name="plus" />Ajouter</button>
    </div>
);

const Search = ({ value, onChange, placeholder }) => (
    <span className="vk-input-icon block mb-3">
        <VkIcon name="eye" />
        <input className="vk-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus />
    </span>
);

// ── Ajout d'une compétence ───────────────────────────────────────────────────
const AddSkillModal = ({ character, onClose, onUpdate }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [specialization, setSpecialization] = useState('');
    const [error, setError] = useState(null);

    // Spécialisables : toujours disponibles ; les autres seulement si absentes
    const availableSkills = COMPETENCES.filter(comp =>
        comp.name.toLowerCase().includes(search.toLowerCase())
        && (isSpecializableSkill(comp.name) || !character.skills.some(s => s.name === comp.name)));

    const handleAdd = () => {
        if (!selected) return;
        if (isSpecializableSkill(selected.name) && !specialization.trim()) {
            setError(`La compétence « ${selected.name} » nécessite une spécialisation (ex : ${getSkillExamples(selected.name)})`);
            return;
        }
        if (specialization.trim() && character.skills.some(s => s.name === selected.name && s.specialization === specialization.trim())) {
            setError(`Vous possédez déjà « ${selected.name} (${specialization.trim()}) »`);
            return;
        }
        onUpdate({
            ...character,
            skills: [...character.skills, { name: selected.name, specialization: specialization.trim() || undefined, level: 0, currentPoints: 0 }],
        });
    };

    return (
        <VkModal title="Ajouter une compétence" icon="plus" onClose={onClose} size="max-w-2xl">
            {error && <div className="vk-callout vk-callout-danger mb-3 text-sm">{error}</div>}
            <Search value={search} onChange={setSearch} placeholder="Rechercher une compétence…" />

            <div className="grid sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
                {availableSkills.length === 0 ? (
                    <p className="sm:col-span-2 text-center text-muted italic p-4">
                        {search ? 'Aucune compétence trouvée' : 'Toutes les compétences ont été ajoutées'}
                    </p>
                ) : availableSkills.map(skill => (
                    <button key={skill.name} type="button" onClick={() => { setSelected(skill); setError(null); }}
                            className={`vk-pill w-full justify-between text-left ${selected?.name === skill.name ? 'is-selected' : ''}`}>
                        <span>{skill.name}</span>
                        <span className="text-xs opacity-75">{skill.caracs.map(c => CARACNAMES[c]).join(', ')}</span>
                    </button>
                ))}
            </div>

            {selected && isSpecializableSkill(selected.name) && (
                <label className="block mt-3">
                    <span className="vk-field-label">Spécialisation requise</span>
                    <input className="vk-input" value={specialization} onChange={e => setSpecialization(e.target.value)}
                           placeholder={`Ex : ${getSkillExamples(selected.name)}`} />
                    <span className="block text-xs text-muted mt-1">
                        Compétence cumulable : chaque spécialisation a son propre niveau.
                    </span>
                </label>
            )}

            <Actions onClose={onClose} onAdd={handleAdd} disabled={!selected} />
        </VkModal>
    );
};

// ── Ajout d'un trait ─────────────────────────────────────────────────────────
const traitCheck = (character, trait) => {
    if (character.traits.some(t => t.name === trait.name)) return { can: false, reason: 'Déjà possédé' };
    const incompatible = (trait.incompatible || []).find(name => character.traits.some(t => t.name === name));
    if (incompatible) return { can: false, reason: `Incompatible avec ${incompatible}` };
    // Conditions (caractéristiques, compétences, SAGA, alternatives) : règle commune
    return checkTraitConditions(character, trait);
};

const effectsText = (effects) => [
    effects.actions && `+${effects.actions} action`,
    effects.armure  && `+${effects.armure} armure`,
    effects.seuil   && `+${effects.seuil} seuil`,
    effects.description,
].filter(Boolean).join(' · ');

const AddTraitModal = ({ character, onClose, onUpdate }) => {
    const [selected, setSelected] = useState(null);
    const [traitSearch, setTraitSearch] = useState('');

    const handleAdd = () => {
        if (!selected) return;
        onUpdate({ ...character, traits: [...character.traits, { name: selected.name }] });
    };

    return (
        <VkModal title="Ajouter un trait" icon="plus" onClose={onClose} size="max-w-4xl">
            <p className="text-sm text-muted mb-2">Traits actuels : {character.traits.length}</p>
            <Search value={traitSearch} onChange={setTraitSearch} placeholder="Rechercher un trait…" />

            <div className="grid md:grid-cols-2 gap-2 max-h-[28rem] overflow-y-auto pr-1">
                {TRAITS
                    .filter(trait => {
                        const search = traitSearch.toLowerCase();
                        return !search || trait.name.toLowerCase().includes(search) || trait.description.toLowerCase().includes(search);
                    })
                    .map(trait => {
                        const check = traitCheck(character, trait);
                        const isSelected = selected?.name === trait.name;
                        return (
                            <button key={trait.name} type="button" disabled={!check.can}
                                    onClick={() => check.can && setSelected(trait)}
                                    className={`vk-rune-card w-full text-left disabled:opacity-45 disabled:cursor-not-allowed ${isSelected ? 'border-primary' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold">{trait.name}</div>
                                    <div className="text-sm text-muted">{trait.description}</div>
                                    {trait.effects && <div className="text-xs text-success mt-0.5">{effectsText(trait.effects)}</div>}
                                    {!check.can && <div className="text-xs text-danger mt-0.5">{check.reason}</div>}
                                </div>
                                {isSelected && <VkIcon name="check" className="text-primary" />}
                            </button>
                        );
                    })}
            </div>

            <Actions onClose={onClose} onAdd={handleAdd} disabled={!selected} />
        </VkModal>
    );
};

const EditModals = ({ type, character, onClose, onUpdate }) => {
    if (type === 'addSkill') return <AddSkillModal character={character} onClose={onClose} onUpdate={onUpdate} />;
    if (type === 'addTrait') return <AddTraitModal character={character} onClose={onClose} onUpdate={onUpdate} />;
    return null;
};

export default EditModals;
