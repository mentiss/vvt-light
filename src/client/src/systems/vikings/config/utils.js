// src/client/src/systems/vikings/config/utils.js
// ─────────────────────────────────────────────────────────────────────────────
// Fonctions d'affichage propres à Vikings (noms, compétences spécialisables).
// ─────────────────────────────────────────────────────────────────────────────

import { getExplosionThreshold } from './rules.js';

/** « Prénom "Surnom" fils/fille de Nom » — `nom` contient le nom du parent (D-17). */
export const formatFullName = (character) => {
    const base = character.prenom;
    const surname = character.surnom ? ` "${character.surnom}"` : '';
    const parentType = character.sexe === 'homme' ? 'fils' : 'fille';
    const parent = character.nom ? ` ${parentType} de ${character.nom}` : '';
    return base + surname + parent;
};

export const formatExplosion = (level) => getExplosionThreshold(level).join(', ');

// Compétences qui peuvent être prises plusieurs fois avec spécialisations différentes
export const SPECIALIZABLE_SKILLS = [
    "Combat CàC (armé)",
    "Combat distance",
    "Langue orale",
    "Langue écrite"
];

export const isSpecializableSkill = (skillName) => SPECIALIZABLE_SKILLS.includes(skillName);

export const getSkillExamples = (skillName) => {
    const examples = {
        "Combat CàC (armé)": "Hache, Épée, Lance, Masse, Marteau",
        "Combat distance": "Arc, Javelot, Fronde, Hache de jet",
        "Langue orale": "Norse, Latin, Anglais, Gaélique, Finnois",
        "Langue écrite": "Runes (Futhark), Latin"
    };
    return examples[skillName] || "";
};

// Format d'affichage d'une compétence avec spécialisation
export const formatSkillName = (skill) => {
    if (!skill) return '';
    const spec = skill.specialization ? ` (${skill.specialization})` : '';
    return skill.name + spec;
};
