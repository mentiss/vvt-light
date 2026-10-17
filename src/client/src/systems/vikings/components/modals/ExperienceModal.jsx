// src/client/src/systems/vikings/components/modals/ExperienceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale d'évolution : dépense de SAGA entre les scénarios (spec_vikings.md §5).
// Coûts : XP_COSTS (config/rules.js). Un nouveau trait doit remplir ses
// conditions et ne pas être incompatible avec un trait possédé (D-12) ; sa
// « SAGA +N » est appliquée après la dépense (D-9, L3-2).
// La dépense ne modifie pas la SAGA totale (légende cumulée, D-10).
// Habillage : planche du lot 4.
//
// Props : character, onClose, onUpdate (fait le PUT)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {formatSkillName, getSkillExamples, isSpecializableSkill} from "../../config/utils.js";
import {XP_COSTS, checkTraitConditions, gainSaga, getTraitSagaBonus} from "../../config/rules.js";
import {CARACNAMES, COMPETENCES} from "../../config/competences.js";
import {TRAITS} from "../../config/traits.js";
import {RUNES} from "../../config/runes.js";
import VkModal from "../ui/VkModal.jsx";
import VkIcon from "../ui/VkIcon.jsx";

/** Raison pour laquelle un trait ne peut pas être acquis, ou null. */
const traitBlocker = (character, trait) => {
    const incompatible = (trait.incompatible ?? []).find(name => character.traits.some(t => t.name === name));
    if (incompatible) return `Incompatible avec ${incompatible}`;
    const { can, reason } = checkTraitConditions(character, trait);
    return can ? null : reason;
};

const MODES = [
    { mode: 'carac',    label: '+1 Caractéristique' },
    { mode: 'skill',    label: '+1 Compétence' },
    { mode: 'newSkill', label: 'Nouvelle compétence' },
    { mode: 'trait',    label: 'Nouveau trait' },
    { mode: 'rune',     label: '+1 Rune' },
    { mode: 'newRune',  label: 'Nouvelle rune' },
];

// En-tête d'étape avec retour au choix du type d'évolution
const StepHeader = ({ onBack, children }) => (
    <div className="flex justify-between items-center mb-2 gap-2">
        <span className="vk-label text-lg text-primary">{children}</span>
        <button type="button" className="vk-btn vk-btn-sm" onClick={onBack}>← Retour</button>
    </div>
);

const runeLevel = (character, name) => character.runes?.find(r => r.name === name)?.level ?? 0;

// Bouton de choix (pastille pleine largeur, sélection dorée)
const Choice = ({ selected, disabled, onClick, children }) => (
    <button type="button" onClick={onClick} disabled={disabled}
            className={`vk-pill w-full justify-between text-left disabled:opacity-40 ${selected ? 'is-selected' : ''}`}>
        {children}
    </button>
);

const ExperienceModal = ({ character, onClose, onUpdate }) => {
    const [mode, setMode] = useState(null); // 'carac', 'skill', 'newSkill', 'trait', 'rune', 'newRune'
    const [selected, setSelected] = useState(null);
    const [step, setStep] = useState('select'); // 'select' ou 'confirm'
    const [traitSearch, setTraitSearch] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [error, setError] = useState(null);

    const costs = XP_COSTS;   // runes à 1 SAGA (D-7)

    const currentCost = mode ? costs[mode] : 0;
    const canAfford = character.sagaActuelle >= currentCost;

    const handleConfirm = () => {
        if (!selected || !canAfford) return;
        setError(null);

        // Validation spécialisation pour newSkill
        if (mode === 'newSkill' && isSpecializableSkill(selected)) {
            if (!specialization.trim()) {
                setError(`La compétence « ${selected} » nécessite une spécialisation (ex : ${getSkillExamples(selected)})`);
                setStep('select');
                return;
            }
            if (character.skills.some(s => s.name === selected && s.specialization === specialization.trim())) {
                setError(`Vous possédez déjà « ${selected} (${specialization.trim()}) »`);
                setStep('select');
                return;
            }
        }

        let updated = { ...character };

        if (mode === 'carac') {
            updated[selected] = Math.min(5, updated[selected] + 1);
        } else if (mode === 'skill') {
            // selected est l'objet compétence
            updated.skills = updated.skills.map(s =>
                (s.name === selected.name && s.specialization === selected.specialization)
                    ? { ...s, level: Math.min(5, s.level + 1), currentPoints: Math.min(5, s.level + 1) }
                    : s
            );
        } else if (mode === 'newSkill') {
            updated.skills = [...updated.skills, {
                name: selected,
                specialization: specialization.trim() || undefined,
                level: 1,
                currentPoints: 1,
            }];
        } else if (mode === 'trait') {
            // Valeurs de combat recalculées par la fiche avant écriture
            updated.traits = [...updated.traits, { name: selected }];
        } else if (mode === 'rune') {
            updated.runes = updated.runes.map(r => r.name === selected ? { ...r, level: Math.min(5, r.level + 1) } : r);
        } else if (mode === 'newRune') {
            updated.runes = [...(updated.runes || []), { name: selected, level: 1 }];
        }

        // Dépenser SAGA (la SAGA totale ne compte que les gains, D-10)
        updated.sagaActuelle = Math.max(0, updated.sagaActuelle - currentCost);

        // « SAGA +N » du trait acquis, appliqué après la dépense (D-9, L3-2)
        if (mode === 'trait') updated = { ...updated, ...gainSaga(updated, getTraitSagaBonus([selected])) };

        onUpdate(updated);
        onClose();
    };

    const resetSelection = () => {
        setMode(null);
        setSelected(null);
        setStep('select');
        setError(null);
    };

    return (
        <VkModal title="Évolution du personnage" icon="tree" onClose={onClose} size="max-w-3xl">
            <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-sm text-muted">Dépense entre les scénarios ; au-delà du niveau 3, justification et accord du MJ.</span>
                <div className="vk-stat px-4 shrink-0"><div className="val">{character.sagaActuelle}</div><div className="lbl">Saga</div></div>
            </div>

            {error && <div className="vk-callout vk-callout-danger mb-3 text-sm">{error}</div>}

            {step === 'select' && (
                <>
                    {!mode && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {MODES.map(({ mode: m, label }) => (
                                <button key={m} type="button" onClick={() => setMode(m)} disabled={character.sagaActuelle < costs[m]}
                                        className="vk-stat is-rollable disabled:opacity-40 disabled:cursor-not-allowed">
                                    <div className="vk-label text-lg text-default">{label}</div>
                                    <div className="sub">Coût : {costs[m]} Saga</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {mode === 'carac' && (
                        <>
                            <StepHeader onBack={resetSelection}>Choisir une caractéristique</StepHeader>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {Object.entries(CARACNAMES).map(([key, label]) => {
                                    const current = character[key];
                                    return (
                                        <Choice key={key} selected={selected === key} disabled={current >= 5} onClick={() => setSelected(key)}>
                                            <span>{label}</span><span className="vk-num">{current} → {Math.min(5, current + 1)}</span>
                                        </Choice>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {mode === 'skill' && (
                        <>
                            <StepHeader onBack={resetSelection}>Choisir une compétence</StepHeader>
                            <div className="grid sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                {character.skills.map(skill => (
                                    <Choice key={`${skill.name}-${skill.specialization || 'default'}`}
                                            selected={selected?.name === skill.name && selected?.specialization === skill.specialization}
                                            disabled={skill.level >= 5} onClick={() => setSelected(skill)}>
                                        <span>{formatSkillName(skill)}</span><span className="vk-num">{skill.level} → {Math.min(5, skill.level + 1)}</span>
                                    </Choice>
                                ))}
                            </div>
                        </>
                    )}

                    {mode === 'newSkill' && (
                        <>
                            <StepHeader onBack={resetSelection}>Choisir une nouvelle compétence</StepHeader>
                            <div className="grid sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                {COMPETENCES
                                    .filter(comp => isSpecializableSkill(comp.name) || !character.skills.some(s => s.name === comp.name))
                                    .map(comp => (
                                        <Choice key={comp.name} selected={selected === comp.name} onClick={() => setSelected(comp.name)}>
                                            <span>{comp.name}</span><span className="text-xs opacity-75">{comp.caracs.map(c => CARACNAMES[c]).join(', ')}</span>
                                        </Choice>
                                    ))}
                            </div>
                            {selected && isSpecializableSkill(selected) && (
                                <label className="block mt-3">
                                    <span className="vk-field-label">Spécialisation requise</span>
                                    <input className="vk-input" value={specialization} onChange={e => setSpecialization(e.target.value)}
                                           placeholder={`Ex : ${getSkillExamples(selected)}`} />
                                </label>
                            )}
                        </>
                    )}

                    {mode === 'trait' && (
                        <>
                            <StepHeader onBack={resetSelection}>Choisir un nouveau trait</StepHeader>
                            <span className="vk-input-icon block mb-2">
                                <VkIcon name="eye" />
                                <input className="vk-input" placeholder="Rechercher un trait…" value={traitSearch} onChange={e => setTraitSearch(e.target.value)} />
                            </span>
                            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                                {TRAITS
                                    .filter(t => !character.traits.some(ct => ct.name === t.name))
                                    .filter(t => {
                                        const search = traitSearch.toLowerCase();
                                        return !search || t.name.toLowerCase().includes(search) || t.description.toLowerCase().includes(search);
                                    })
                                    .map(trait => {
                                        const blocker = traitBlocker(character, trait);
                                        const sagaBonus = trait.effects?.sagaBonus;
                                        return (
                                            <button key={trait.name} type="button" disabled={!!blocker}
                                                    onClick={() => setSelected(trait.name)}
                                                    className={`vk-rune-card w-full text-left disabled:opacity-45 disabled:cursor-not-allowed ${selected === trait.name ? 'border-primary' : ''}`}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold">{trait.name}{sagaBonus ? <span className="vk-tag vk-tag-gold ml-2">Saga +{sagaBonus}</span> : null}</div>
                                                    <div className="text-sm text-muted">{trait.description}</div>
                                                    {blocker && <div className="text-xs text-danger mt-0.5">{blocker}</div>}
                                                </div>
                                                {selected === trait.name && <VkIcon name="check" className="text-primary" />}
                                            </button>
                                        );
                                    })}
                            </div>
                        </>
                    )}

                    {(mode === 'rune' || mode === 'newRune') && (
                        <>
                            <StepHeader onBack={resetSelection}>{mode === 'rune' ? 'Choisir une rune connue' : 'Choisir une nouvelle rune'}</StepHeader>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1">
                                {RUNES
                                    .filter(r => {
                                        const level = runeLevel(character, r.name);
                                        return mode === 'rune' ? level >= 1 && level < 5 : level === 0;
                                    })
                                    .map(r => {
                                        const level = runeLevel(character, r.name);
                                        return (
                                            <Choice key={r.name} selected={selected === r.name} onClick={() => setSelected(r.name)}>
                                                <span><span className="vk-rune mr-1">{r.symbol}</span>{r.name}</span>
                                                <span className="vk-num">{mode === 'rune' ? `${level} → ${level + 1}` : 'niv 1'}</span>
                                            </Choice>
                                        );
                                    })}
                            </div>
                        </>
                    )}

                    {mode && selected && (
                        <div className="flex gap-2 pt-3 mt-3 border-t border-default">
                            <button type="button" className="vk-btn flex-1" onClick={resetSelection}>Annuler</button>
                            <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={() => setStep('confirm')}>Suivant →</button>
                        </div>
                    )}
                </>
            )}

            {step === 'confirm' && (
                <>
                    <div className="vk-callout mb-4">
                        <div className="vk-label text-lg text-primary mb-1">Confirmer l'évolution</div>
                        {mode === 'carac'    && <p>+1 {CARACNAMES[selected]} ({character[selected]} → {character[selected] + 1})</p>}
                        {mode === 'skill'    && <p>+1 {formatSkillName(selected)} ({selected.level} → {selected.level + 1})</p>}
                        {mode === 'newSkill' && <p>Nouvelle compétence : {selected}{specialization && ` (${specialization})`} (niveau 1)</p>}
                        {mode === 'trait'    && <p>Nouveau trait : {selected}{getTraitSagaBonus([selected]) > 0 && ` (Saga +${getTraitSagaBonus([selected])})`}</p>}
                        {mode === 'rune'     && <p>+1 {selected}</p>}
                        {mode === 'newRune'  && <p>Nouvelle rune : {selected} (niveau 1)</p>}
                        <p className="mt-1">Coût : <strong>{currentCost} Saga</strong> — reste {character.sagaActuelle - currentCost}</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" className="vk-btn flex-1" onClick={() => setStep('select')}>← Retour</button>
                        <button type="button" className="vk-btn vk-btn-success flex-1" onClick={handleConfirm}><VkIcon name="check" />Confirmer</button>
                    </div>
                </>
            )}
        </VkModal>
    );
};

export default ExperienceModal;
