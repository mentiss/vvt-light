// src/client/src/systems/vikings/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création Vikings (spec_vikings.md §4) : identité, 14 points de
// caractéristiques (max 4), 10 points de compétences (max 3), 2 à 4 traits
// (conditions et incompatibilités), runes si livre de sort, récapitulatif.
// À la fin : « SAGA +N » des traits appliqué à la SAGA de départ (D-9, D-11)
// et valeurs de combat dérivées (L3-6).
// Habillage : planche du lot 4. « Fils de / fille de » se déduit du sexe (D-17).
//
// Props (CreationPage) : onCreated, onCancel, darkMode
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
    canSelectTrait, formatTraitConditions, getSuccessThreshold,
    gainSaga, getTraitSagaBonus, withDerivedValues,
} from "./config/rules.js";
import { formatExplosion, formatFullName, formatSkillName, getSkillExamples, isSpecializableSkill } from "./config/utils.js";
import { CARACNAMES, COMPETENCES } from "./config/competences.js";
import { RUNES, RUNE_LEVELS } from "./config/runes.js";
import { TRAITS } from "./config/traits.js";
import useSystem from "../../hooks/useSystem.js";
import VkPanel from "./components/ui/VkPanel.jsx";
import VkModal from "./components/ui/VkModal.jsx";
import VkIcon from "./components/ui/VkIcon.jsx";

const TOTAL_CARAC_POINTS = 14;
const TOTAL_SKILL_POINTS = 10;
const MIN_CARAC = 1;
const MAX_CARAC_CREATION = 4;
const MAX_SKILL_CREATION = 3;
const MIN_TRAITS = 2;
const MAX_TRAITS = 4;
const STEPS = ['Identité', 'Caractéristiques', 'Compétences', 'Traits', 'Runes', 'Finalisation'];

const INITIAL_CHARACTER = {
    prenom: '', surnom: '', nom: '',   // nom du parent (« fils/fille de » selon le sexe)
    sexe: 'homme', age: 25, activite: '', playerName: '',
    force: 1, agilite: 1, perception: 1, intelligence: 1, charisme: 1, chance: 1,
    sagaActuelle: 1, sagaTotale: 1,
    armure: 0, actionsDisponibles: 1, seuilCombat: 1,
    tokensBlessure: 0, tokensFatigue: 0,
    skills: [], traits: [], runes: [], items: [],
};

const effectsText = (effects) => [
    effects.actions    && `+${effects.actions} action`,
    effects.armure     && `+${effects.armure} armure`,
    effects.seuil      && `+${effects.seuil} seuil`,
    effects.runePoints && `livre de sort ${effects.runePoints} pts`,
    effects.sagaBonus  && `Saga +${effects.sagaBonus}`,
    effects.description,
].filter(Boolean).join(' · ');

// ── Petits composants de module ──────────────────────────────────────────────
const Field = ({ label, children }) => (
    <label className="block"><span className="vk-field-label">{label}</span>{children}</label>
);

const Budget = ({ label, remaining, total }) => (
    <div className={`vk-callout text-center ${remaining < 0 ? 'vk-callout-danger' : ''}`}>
        <span className="vk-label text-lg">{label} : </span>
        <strong className="vk-num">{remaining} / {total}</strong>
    </div>
);

const Pips = ({ value }) => (
    <div className="vk-dots">{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= value ? 'is-full' : ''} />)}</div>
);

const LevelStepper = ({ value, onMinus, onPlus, minusDisabled, plusDisabled }) => (
    <div className="vk-stepper">
        <button type="button" onClick={onMinus} disabled={minusDisabled}><VkIcon name="minus" /></button>
        <span className="vk-num">{value}</span>
        <button type="button" onClick={onPlus} disabled={plusDisabled}><VkIcon name="plus" /></button>
    </div>
);

const NavButtons = ({ onPrev, onNext, nextDisabled, nextLabel = 'Suivant →' }) => (
    <div className="flex gap-2 mt-6">
        {onPrev && <button type="button" className="vk-btn flex-1" onClick={onPrev}>← Précédent</button>}
        <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>
    </div>
);

const Creation = ({ onCreated, onCancel, darkMode }) => {
    const { apiBase } = useSystem();
    const [created,  setCreated]  = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [copied,   setCopied]   = useState(false);
    const [step, setStep] = useState(1);
    const [customCode, setCustomCode] = useState('');
    const [skillSearch, setSkillSearch] = useState('');
    const [pendingSkill, setPendingSkill] = useState(null);   // compétence spécialisable en attente
    const [specValue, setSpecValue] = useState('');
    const [specError, setSpecError] = useState('');
    const [character, setCharacter] = useState(INITIAL_CHARACTER);

    const set = (field, value) => setCharacter(prev => ({ ...prev, [field]: value }));

    const usedCaracPoints = Object.keys(CARACNAMES).reduce((sum, k) => sum + character[k], 0);
    const usedSkillPoints = character.skills.reduce((sum, skill) => sum + skill.level, 0);
    const totalRunePoints = character.traits.reduce((sum, trait) =>
        sum + (TRAITS.find(t => t.name === trait.name)?.effects?.runePoints || 0), 0);
    const usedRunePoints  = character.runes.reduce((sum, rune) => sum + rune.level, 0);

    // ── Étape 1 : identité ───────────────────────────────────────────────────
    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Prénom *"><input className="vk-input" value={character.prenom} onChange={e => set('prenom', e.target.value)} /></Field>
                <Field label="Surnom (optionnel)"><input className="vk-input" value={character.surnom} onChange={e => set('surnom', e.target.value)} placeholder="Le Brave" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <div className="vk-field-label">Sexe *</div>
                    <div className="flex gap-1.5">
                        {[['homme', 'Homme'], ['femme', 'Femme']].map(([id, label]) => (
                            <button key={id} type="button" className={`vk-pill ${character.sexe === id ? 'is-selected' : ''}`} onClick={() => set('sexe', id)}>{label}</button>
                        ))}
                    </div>
                </div>
                <Field label={`${character.sexe === 'homme' ? 'Fils' : 'Fille'} de * (nom du parent)`}>
                    <input className="vk-input" value={character.nom} onChange={e => set('nom', e.target.value)} placeholder="Ragnar" />
                </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Âge"><input type="number" className="vk-input vk-num" value={character.age} onChange={e => set('age', parseInt(e.target.value) || 25)} /></Field>
                <Field label="Activité / métier"><input className="vk-input" value={character.activite} onChange={e => set('activite', e.target.value)} /></Field>
                <Field label="Nom du joueur"><input className="vk-input" value={character.playerName} onChange={e => set('playerName', e.target.value)} /></Field>
            </div>
            {character.prenom && (
                <p className="text-center vk-title text-xl">{formatFullName(character)}</p>
            )}
            <div className="flex gap-2 mt-6">
                {onCancel && <button type="button" className="vk-btn flex-1" onClick={onCancel}>← Retour</button>}
                <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={() => setStep(2)} disabled={!character.prenom || !character.nom}>Suivant →</button>
            </div>
        </div>
    );

    // ── Étape 2 : caractéristiques ───────────────────────────────────────────
    const renderStep2 = () => {
        const remaining = TOTAL_CARAC_POINTS - usedCaracPoints;
        return (
            <div className="space-y-4">
                <Budget label="Points restants" remaining={remaining} total={TOTAL_CARAC_POINTS} />
                <p className="text-sm text-muted text-center">Explosion : niveau 1-2 → 10 · niveau 3-4 → 9, 10 · niveau 5 → 8, 9, 10. Maximum {MAX_CARAC_CREATION} à la création.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(CARACNAMES).map(([key, label]) => {
                        const level = character[key];
                        return (
                            <div key={key} className="vk-stat">
                                <div className="val">{level}</div>
                                <div className="lbl">{label}</div>
                                <div className="sub">expl. {formatExplosion(level)}</div>
                                <div className="mt-1">
                                    <LevelStepper value={level}
                                                  onMinus={() => set(key, level - 1)} minusDisabled={level <= MIN_CARAC}
                                                  onPlus={() => set(key, level + 1)} plusDisabled={level >= MAX_CARAC_CREATION || remaining <= 0} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <NavButtons onPrev={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={remaining !== 0} />
            </div>
        );
    };

    // ── Étape 3 : compétences ────────────────────────────────────────────────
    const addSkill = (skillName) => {
        if (isSpecializableSkill(skillName)) {
            setPendingSkill(skillName);
            setSpecValue('');
            setSpecError('');
            return;
        }
        if (character.skills.some(s => s.name === skillName)) return;
        set('skills', [...character.skills, { name: skillName, level: 1, currentPoints: 1 }]);
    };

    const confirmSpecialization = () => {
        const val = specValue.trim();
        if (!val) { setSpecError('Une spécialisation est requise.'); return; }
        if (character.skills.some(s => s.name === pendingSkill && s.specialization === val)) {
            setSpecError(`Doublon : ${pendingSkill} (${val}) existe déjà.`);
            return;
        }
        set('skills', [...character.skills, { name: pendingSkill, specialization: val, level: 1, currentPoints: 1 }]);
        setPendingSkill(null);
    };

    const renderStep3 = () => {
        const remaining = TOTAL_SKILL_POINTS - usedSkillPoints;
        const sameSkill = (a, b) => a.name === b.name && a.specialization === b.specialization;
        const changeSkillLevel = (skill, delta) => set('skills', character.skills.map(s => {
            if (!sameSkill(s, skill)) return s;
            const level = Math.max(0, Math.min(MAX_SKILL_CREATION, s.level + delta));
            return { ...s, level, currentPoints: level };
        }));
        const removeSkill = (skill) => set('skills', character.skills.filter(s => !sameSkill(s, skill)));
        const available = COMPETENCES.filter(c =>
            c.name.toLowerCase().includes(skillSearch.toLowerCase())
            && (isSpecializableSkill(c.name) || !character.skills.some(s => s.name === c.name)));

        return (
            <div className="space-y-4">
                <Budget label="Points restants" remaining={remaining} total={TOTAL_SKILL_POINTS} />
                <p className="text-sm text-muted text-center">Seuil : niveau 0-1 → 7+ · 2 → 6+ · 3-4 → 5+ · 5 → 4+. Maximum {MAX_SKILL_CREATION} à la création ; coût = niveau.</p>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <div className="vk-label text-lg text-primary mb-1">Ajouter une compétence</div>
                        <span className="vk-input-icon block mb-2">
                            <VkIcon name="eye" />
                            <input className="vk-input" value={skillSearch} onChange={e => setSkillSearch(e.target.value)} placeholder="Rechercher…" />
                        </span>
                        <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto pr-1">
                            {available.map(c => (
                                <button key={c.name} type="button" className="vk-pill w-full justify-between text-left" onClick={() => addSkill(c.name)}>
                                    <span>{c.name}</span><span className="text-xs opacity-75">{c.caracs.map(k => CARACNAMES[k]).join(' / ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="vk-label text-lg text-primary mb-1">Compétences choisies ({character.skills.length})</div>
                        {character.skills.length === 0 && <p className="text-sm text-muted italic">Aucune pour l'instant.</p>}
                        {character.skills.map(skill => (
                            <div key={`${skill.name}-${skill.specialization || 'default'}`} className="vk-row">
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold">{formatSkillName(skill)}</div>
                                    <div className="text-xs text-muted">seuil {getSuccessThreshold(skill.level)}+</div>
                                </div>
                                <LevelStepper value={skill.level}
                                              onMinus={() => changeSkillLevel(skill, -1)} minusDisabled={skill.level <= 0}
                                              onPlus={() => changeSkillLevel(skill, 1)} plusDisabled={skill.level >= MAX_SKILL_CREATION || remaining <= 0} />
                                <button type="button" className="vk-btn vk-btn-danger vk-btn-icon vk-btn-sm" onClick={() => removeSkill(skill)} title="Retirer"><VkIcon name="close" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <NavButtons onPrev={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={remaining !== 0} />
            </div>
        );
    };

    // ── Étape 4 : traits ─────────────────────────────────────────────────────
    const renderStep4 = () => {
        const toggleTrait = (trait) => {
            if (character.traits.some(t => t.name === trait.name)) {
                set('traits', character.traits.filter(t => t.name !== trait.name));
            } else if (canSelectTrait(character, trait, MAX_TRAITS)) {
                set('traits', [...character.traits, trait]);
            }
        };

        return (
            <div className="space-y-4">
                <Budget label="Traits sélectionnés" remaining={character.traits.length} total={MAX_TRAITS} />
                <p className="text-sm text-muted text-center">Entre {MIN_TRAITS} et {MAX_TRAITS} traits ou backgrounds, en respectant conditions et incompatibilités.</p>
                <div className="grid md:grid-cols-2 gap-2 max-h-[32rem] overflow-y-auto pr-1">
                    {TRAITS.map(trait => {
                        const isSelected = character.traits.some(t => t.name === trait.name);
                        const canSelect = canSelectTrait(character, trait, MAX_TRAITS);
                        const conditions = formatTraitConditions(trait);
                        return (
                            <button key={trait.name} type="button" disabled={!canSelect} onClick={() => toggleTrait(trait)}
                                    className={`vk-rune-card w-full text-left disabled:opacity-45 disabled:cursor-not-allowed ${isSelected ? 'border-primary' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold flex items-center gap-2">
                                        {trait.name}
                                        {isSelected && <span className="vk-tag vk-tag-gold"><VkIcon name="check" />Choisi</span>}
                                    </div>
                                    <div className="text-sm text-muted">{trait.description}</div>
                                    {trait.effects && effectsText(trait.effects) && <div className="text-xs text-success mt-0.5">{effectsText(trait.effects)}</div>}
                                    {conditions && <div className="text-xs mt-0.5"><span className="text-muted">Requis :</span> {conditions}</div>}
                                    {trait.incompatible.length > 0 && <div className="text-xs text-danger mt-0.5">Incompatible : {trait.incompatible.join(', ')}</div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <NavButtons onPrev={() => setStep(3)} onNext={() => setStep(5)}
                            nextDisabled={character.traits.length < MIN_TRAITS || character.traits.length > MAX_TRAITS} />
            </div>
        );
    };

    // ── Étape 5 : runes ──────────────────────────────────────────────────────
    const renderStep5 = () => {
        const remaining = totalRunePoints - usedRunePoints;
        const changeRuneLevel = (runeName, delta) => {
            const existing = character.runes.find(r => r.name === runeName);
            if (existing) {
                const level = Math.max(0, Math.min(5, existing.level + delta));
                set('runes', character.runes.map(r => r.name === runeName ? { ...r, level } : r).filter(r => r.level > 0));
            } else if (delta > 0) {
                set('runes', [...character.runes, { name: runeName, level: 1 }]);
            }
        };

        if (totalRunePoints === 0) {
            return (
                <div className="space-y-4">
                    <div className="vk-callout">Aucun trait choisi ne donne de livre de sort : pas de runes à la création. Elles pourront s'apprendre en jeu.</div>
                    <NavButtons onPrev={() => setStep(4)} onNext={() => setStep(6)} />
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <Budget label="Points de runes restants" remaining={remaining} total={totalRunePoints} />
                <p className="text-sm text-muted text-center">{RUNE_LEVELS.slice(1).map((label, i) => `${i + 1} : ${label}`).join(' · ')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[32rem] overflow-y-auto pr-1">
                    {RUNES.map(rune => {
                        const level = character.runes.find(r => r.name === rune.name)?.level || 0;
                        return (
                            <div key={rune.name} className={`vk-stat ${level ? '' : 'opacity-80'}`} title={rune.esoteric}>
                                <div className="vk-rune text-3xl mb-1">{rune.symbol}</div>
                                <div className="font-bold text-sm">{rune.name}</div>
                                <div className="sub">{rune.literal}</div>
                                <div className="mt-1">
                                    <LevelStepper value={level}
                                                  onMinus={() => changeRuneLevel(rune.name, -1)} minusDisabled={level <= 0}
                                                  onPlus={() => changeRuneLevel(rune.name, 1)} plusDisabled={level >= 5 || remaining <= 0} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <NavButtons onPrev={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={remaining !== 0} />
            </div>
        );
    };

    // ── Étape 6 : finalisation ───────────────────────────────────────────────
    const renderStep6 = () => {
        // Personnage final : « SAGA +N » des traits choisis appliqué à la SAGA de
        // départ (D-9, D-11) et valeurs de combat dérivées des traits (L3-6)
        const finalChar = withDerivedValues({
            ...character,
            ...gainSaga(character, getTraitSagaBonus(character.traits.map(t => t.name))),
        });

        const handleComplete = async () => {
            setLoading(true);
            setError(null);
            try {
                const characterToSave = customCode ? { ...finalChar, accessCode: customCode } : finalChar;
                const res = await fetch(`${apiBase}/characters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(characterToSave),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Erreur lors de la création');
                }
                setCreated(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const copyCode = () => {
            navigator.clipboard.writeText(created.accessCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        // ── Écran post-création ──
        if (created) {
            return (
                <div className="text-center space-y-5 py-4">
                    <div className="vk-rune text-5xl">ᛊ</div>
                    <div className="vk-title text-2xl">{formatFullName(created)} est né·e !</div>
                    <VkPanel variant="sm" className="mx-auto max-w-xs">
                        <div className="vk-field-label">Votre code d'accès</div>
                        <div className="vk-title vk-num text-4xl tracking-widest mb-3">{created.accessCode}</div>
                        <button type="button" className="vk-btn vk-btn-sm" onClick={copyCode}>
                            {copied ? <><VkIcon name="check" />Copié</> : <><VkIcon name="key" />Copier le code</>}
                        </button>
                        <p className="text-xs text-muted mt-2">Conservez ce code : c'est votre clé d'accès permanente.</p>
                    </VkPanel>
                    <div className="text-xs text-muted">Lien : <span className="vk-num">{created.accessUrl}</span></div>
                    <button type="button" className="vk-btn vk-btn-primary w-full py-2.5" onClick={() => onCreated(created)}>Accéder à ma fiche →</button>
                </div>
            );
        }

        // ── Récapitulatif ──
        return (
            <div className="space-y-4">
                <div className="text-center">
                    <div className="vk-title text-2xl">{formatFullName(character)}</div>
                    <div className="text-sm text-muted">
                        {character.sexe === 'homme' ? 'Homme' : 'Femme'}, {character.age} ans
                        {character.activite && ` · ${character.activite}`}
                        {character.playerName && <> · <em>joué par {character.playerName}</em></>}
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(CARACNAMES).map(([key, label]) => (
                        <div key={key} className="vk-stat"><div className="val">{character[key]}</div><div className="lbl">{label}</div></div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <VkPanel>
                        <div className="vk-section-title">Compétences ({character.skills.length})</div>
                        {character.skills.map(s => (
                            <div key={`${s.name}-${s.specialization}`} className="vk-row text-sm">
                                <span className="flex-1">{formatSkillName(s)}</span><span className="vk-row-val">{s.level}</span>
                            </div>
                        ))}
                    </VkPanel>
                    <VkPanel>
                        <div className="vk-section-title">Traits ({character.traits.length})</div>
                        {character.traits.map(t => (
                            <div key={t.name} className="vk-row text-sm items-start">
                                <div><div className="font-bold">{t.name}</div><div className="text-xs text-muted">{t.description}</div></div>
                            </div>
                        ))}
                    </VkPanel>
                </div>

                {character.runes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {character.runes.map(r => (
                            <span key={r.name} className="vk-tag vk-tag-gold">
                                <span className="vk-rune">{RUNES.find(x => x.name === r.name)?.symbol}</span>{r.name} · niveau {r.level}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="vk-stat"><div className="val">{finalChar.sagaActuelle}</div><div className="lbl">Saga</div><div className="sub">sur 5</div></div>
                    <div className="vk-stat"><div className="val">{finalChar.actionsDisponibles}</div><div className="lbl">Actions</div></div>
                    <div className="vk-stat"><div className="val">{finalChar.seuilCombat}</div><div className="lbl">Seuil</div></div>
                    <div className="vk-stat"><div className="val">{finalChar.armure}</div><div className="lbl">Armure</div></div>
                </div>

                <Field label="Code d'accès personnalisé (optionnel)">
                    <input className="vk-input vk-num" value={customCode} maxLength={6}
                           onChange={e => setCustomCode(e.target.value.toUpperCase().substring(0, 6))}
                           placeholder="Laisser vide pour une génération automatique" />
                    <span className="block text-xs text-muted mt-1">6 caractères au plus ; le code doit être libre.</span>
                </Field>

                {error && <div className="vk-callout vk-callout-danger text-sm">{error}</div>}

                <NavButtons onPrev={() => setStep(5)} onNext={handleComplete} nextDisabled={loading}
                            nextLabel={loading ? 'Création…' : 'Créer le personnage'} />
            </div>
        );
    };

    return (
        <div className="vk-root min-h-screen p-4 md:p-6" data-theme={darkMode ? 'dark' : 'light'}>
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-4">
                    <div className="vk-rune text-3xl">ᚢᛁᚲᛁᛜ</div>
                    <h1 className="vk-title text-3xl">Naissance d'un Viking</h1>
                </div>

                <VkPanel variant="heavy">
                    {/* Étapes */}
                    <nav className="vk-tabs mb-5 pr-6">
                        {STEPS.map((label, i) => (
                            <span key={label} className={`vk-tab ${i + 1 === step ? 'is-active' : ''}`}>
                                {i + 1 < step && <VkIcon name="check" />} {label}
                            </span>
                        ))}
                    </nav>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                </VkPanel>
            </div>

            {pendingSkill && (
                <VkModal title="Spécialisation requise" icon="quill" onClose={() => setPendingSkill(null)} size="max-w-sm">
                    <p className="text-sm mb-3">
                        Précisez une spécialité pour <strong>{pendingSkill}</strong>.
                        <span className="block text-muted italic">Ex : {getSkillExamples(pendingSkill)}</span>
                    </p>
                    <input className="vk-input" autoFocus value={specValue}
                           onChange={e => { setSpecValue(e.target.value); setSpecError(''); }}
                           onKeyDown={e => { if (e.key === 'Enter') confirmSpecialization(); }} />
                    {specError && <p className="text-xs text-danger mt-1">{specError}</p>}
                    <div className="flex gap-2 mt-4">
                        <button type="button" className="vk-btn flex-1" onClick={() => setPendingSkill(null)}>Annuler</button>
                        <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={confirmSpecialization}>Confirmer</button>
                    </div>
                </VkModal>
            )}
        </div>
    );
};

export default Creation;
