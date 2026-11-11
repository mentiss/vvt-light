// src/client/src/systems/vikings/components/modals/EditModals.jsx
// Fenêtres du mode édition : ajout d'une compétence ou d'un trait, par le catalogue
// de la plateforme (CatalogModal, spec_ui_catalogue.md ; retour MJ du 2026-11-07).
// Mode édition = correction : pas de « SAGA +N » à l'ajout d'un trait (L3-2) ;
// les valeurs de combat sont recalculées à l'enregistrement (withDerivedValues).
// Trait hors de portée (déjà possédé, incompatible, conditions) : grisé, avec la
// raison, et sans effet au clic. Compétence spécialisable : la spécialisation est
// demandée dans une petite fenêtre avant l'ajout.

import React, { useState } from "react";
import { CARACNAMES, COMPETENCES } from "../../config/competences.js";
import { TRAITS } from "../../config/traits.js";
import { checkTraitConditions } from "../../config/rules.js";
import { getSkillExamples, isSpecializableSkill } from "../../config/utils.js";
import CatalogModal from "@/ui/catalog/CatalogModal.jsx";
import { HostedModal } from "@/ui/modal/ModalHost.jsx";
import VkModal from "../ui/VkModal.jsx";
import VkIcon from "../ui/VkIcon.jsx";
import { effectsText } from "../layout/IdentitySection.jsx";

// ── Ajout d'un trait ─────────────────────────────────────────────────────────
const traitCheck = (character, trait) => {
    if (character.traits.some(t => t.name === trait.name)) return { can: false, reason: 'Déjà possédé' };
    const incompatible = (trait.incompatible || []).find(name => character.traits.some(t => t.name === name));
    if (incompatible) return { can: false, reason: `Incompatible avec ${incompatible}` };
    // Conditions (caractéristiques, compétences, SAGA, alternatives) : règle commune
    return checkTraitConditions(character, trait);
};

const AddTraitModal = ({ character, onClose, onUpdate }) => {
    const filters = [{
        key: 'available',
        getValue: trait => (traitCheck(character, trait).can ? 'yes' : 'no'),
        options: [{ value: 'yes', label: 'Accessibles' }],
    }];
    const renderItem = (trait) => {
        const check = traitCheck(character, trait);
        return (
            <div className={`text-sm ${check.can ? '' : 'opacity-50'}`}>
                <div className="font-bold">{trait.name}</div>
                <div className="text-muted">{trait.description}</div>
                {trait.effects && effectsText(trait.effects) && <div className="text-xs text-success mt-0.5">{effectsText(trait.effects)}</div>}
                {!check.can && <div className="text-xs text-danger mt-0.5">{check.reason}</div>}
            </div>
        );
    };
    return (
        <HostedModal>
            <CatalogModal
                title="Ajouter un trait"
                subtitle={`Traits actuels : ${character.traits.length}`}
                items={TRAITS}
                renderItem={renderItem}
                filters={filters}
                searchFields={['name', 'description']}
                labels={{ search: 'Rechercher un trait…', countOne: 'trait', countMany: 'traits', added: 'Trait ajouté' }}
                onAdd={trait => {
                    if (!traitCheck(character, trait).can) return;
                    onUpdate({ ...character, traits: [...character.traits, { name: trait.name }] });
                }}
                onClose={onClose}
            />
        </HostedModal>
    );
};

// ── Ajout d'une compétence ───────────────────────────────────────────────────
const SpecializationModal = ({ skill, character, onClose, onAdd }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState(null);
    const submit = (e) => {
        e.preventDefault();
        const spec = value.trim();
        if (!spec) return setError(`La compétence « ${skill.name} » nécessite une spécialisation.`);
        if (character.skills.some(s => s.name === skill.name && s.specialization === spec)) return setError(`Vous possédez déjà « ${skill.name} (${spec}) ».`);
        onAdd(spec);
    };
    return (
        <VkModal title={`Spécialisation : ${skill.name}`} icon="quill" onClose={onClose} size="max-w-sm">
            <form onSubmit={submit} className="space-y-3">
                {error && <div className="vk-callout vk-callout-danger text-sm">{error}</div>}
                <label className="block">
                    <span className="vk-field-label">Spécialisation</span>
                    <input className="vk-input" value={value} onChange={e => setValue(e.target.value)} autoFocus placeholder={`Ex : ${getSkillExamples(skill.name)}`} />
                    <span className="block text-xs text-muted mt-1">Compétence cumulable : chaque spécialisation a son propre niveau.</span>
                </label>
                <div className="flex gap-2 justify-end">
                    <button type="button" className="vk-btn" onClick={onClose}>Annuler</button>
                    <button type="submit" className="vk-btn vk-btn-primary"><VkIcon name="plus" />Ajouter</button>
                </div>
            </form>
        </VkModal>
    );
};

const AddSkillModal = ({ character, onClose, onUpdate }) => {
    const [pending, setPending] = useState(null);   // compétence spécialisable en attente
    // Spécialisables : toujours disponibles ; les autres seulement si absentes
    const available = COMPETENCES.filter(comp => isSpecializableSkill(comp.name) || !character.skills.some(s => s.name === comp.name));
    const add = (skill, specialization) => onUpdate({
        ...character,
        skills: [...character.skills, { name: skill.name, specialization: specialization || undefined, level: 0, currentPoints: 0 }],
    });
    const renderItem = (skill) => (
        <div className="text-sm">
            <div className="font-bold">{skill.name}</div>
            <div className="text-xs text-muted">
                {[...new Set(skill.caracs)].map(c => CARACNAMES[c]).join(', ')}
                {isSpecializableSkill(skill.name) && <> · à spécialiser (ex : {getSkillExamples(skill.name)})</>}
            </div>
        </div>
    );
    if (pending) {
        return <SpecializationModal skill={pending} character={character} onClose={() => setPending(null)} onAdd={(spec) => add(pending, spec)} />;
    }
    return (
        <HostedModal>
            <CatalogModal
                title="Ajouter une compétence"
                items={available}
                renderItem={renderItem}
                searchFields={['name']}
                labels={{ search: 'Rechercher une compétence…', countOne: 'compétence', countMany: 'compétences', added: 'Compétence ajoutée', empty: 'Aucune compétence trouvée.' }}
                onAdd={skill => (isSpecializableSkill(skill.name) ? setPending(skill) : add(skill))}
                onClose={onClose}
            />
        </HostedModal>
    );
};

const EditModals = ({ type, character, onClose, onUpdate }) => {
    if (type === 'addSkill') return <AddSkillModal character={character} onClose={onClose} onUpdate={onUpdate} />;
    if (type === 'addTrait') return <AddTraitModal character={character} onClose={onClose} onUpdate={onUpdate} />;
    return null;
};

export default EditModals;
