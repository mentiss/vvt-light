// src/client/src/systems/fabula/components/layout/ClassesSkillsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Classes, Compétences, Sorts et Arcana — réutilisable Sheet.jsx / TabSession GM.
//
// Hors création, la contrainte "5 niveaux au total" ne s'applique plus (un
// personnage progresse avec l'XP jusqu'à niveau global 50, section 2.4 des
// specs) — seul le plafond de 10 niveaux par classe reste actif. Même logique
// de garde-fou qu'au wizard : impossible d'assigner plus de NC que ce qu'une
// classe peut absorber, impossible de dépasser le NCMax d'une compétence.
//
// ⚠️ Assomption à valider avec le MJ : rien dans les specs ne dit explicitement
// si de nouvelles classes peuvent être ajoutées après la création (au-delà des
// 2-3 initiales) à mesure que le personnage monte de niveau. Je pars du principe
// que oui (cohérent avec "multiclassable" et la progression jusqu'à niveau 50),
// donc le sélecteur de classe reste actif en mode édition même après création.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Stepper from './Stepper.jsx';
import FuIcon from '../ui/FuIcon.jsx';
import { CLASSES, CLASS_ORDER, SPELL_LISTS, ARCANA_LISTS } from '../../config.jsx';

const CLASS_NIVEAU_MAX = 10;
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function skillsForClass(skills, classKey) { return skills.filter(s => s.classKey === classKey); }
function skillNiveauTotal(skills, classKey) { return sum(skillsForClass(skills, classKey).map(s => s.rang || 0)); }
function classAbsorbable(classKey) { return sum(CLASSES[classKey].competences.map(c => c.ncMax)); }

const ClassesSkillsPanel = ({ character, editMode, onArrayChange }) => {
    const classes = character.classes ?? [];
    const skills  = character.skills ?? [];
    const arcana  = character.arcana ?? [];

    // Compétences dépliées : la première compétence investie au premier affichage
    const [open, setOpen] = useState(() => {
        const first = skills.find(s => (s.rang ?? 0) > 0);
        return new Set(first ? [`${first.classKey}:${first.skillKey}`] : []);
    });

    const classNiveauMax = (classKey) => Math.min(CLASS_NIVEAU_MAX, classAbsorbable(classKey));

    const setClassNiveau = (classKey, niveau) => {
        const max = classNiveauMax(classKey);
        const clamped = Math.max(1, Math.min(max, niveau));
        let newSkills = skills;
        const currentInvested = skillNiveauTotal(skills, classKey);
        if (currentInvested > clamped) {
            let toRemove = currentInvested - clamped;
            newSkills = skills.map(s => {
                if (s.classKey !== classKey || toRemove <= 0) return s;
                const reduction = Math.min(s.rang, toRemove);
                toRemove -= reduction;
                return { ...s, rang: s.rang - reduction, spellsChoisis: (s.spellsChoisis ?? []).slice(0, s.rang - reduction) };
            });
        }
        onArrayChange('classes', classes.map(c => c.classKey === classKey ? { ...c, niveau: clamped } : c));
        if (newSkills !== skills) onArrayChange('skills', newSkills);
    };

    const skillRangMax = (classKey, skillKey, ncMax) => {
        const classNiveau = classes.find(c => c.classKey === classKey)?.niveau ?? 0;
        const usedByOtherSkills = skillsForClass(skills, classKey)
            .filter(s => s.skillKey !== skillKey)
            .reduce((a, s) => a + s.rang, 0);
        return Math.max(0, Math.min(ncMax, classNiveau - usedByOtherSkills));
    };

    const setSkillRang = (classKey, skillKey, rang) => {
        const existing = skills.find(s => s.classKey === classKey && s.skillKey === skillKey);
        if (existing) {
            onArrayChange('skills', skills.map(s =>
                (s.classKey === classKey && s.skillKey === skillKey)
                    ? { ...s, rang, spellsChoisis: (s.spellsChoisis ?? []).slice(0, rang) }
                    : s
            ));
        } else if (rang > 0) {
            onArrayChange('skills', [...skills, { classKey, skillKey, rang, spellsChoisis: [] }]);
        }
    };

    const addClass = (classKey) => {
        if (classes.some(c => c.classKey === classKey)) return;
        onArrayChange('classes', [...classes, { classKey, niveau: 1 }]);
    };
    const removeClass = (classKey) => {
        onArrayChange('classes', classes.filter(c => c.classKey !== classKey));
        onArrayChange('skills', skills.filter(s => s.classKey !== classKey));
        if (classKey === 'arcaniste') onArrayChange('arcana', []);
    };

    const addArcanum = (arcanumKey) => {
        if (arcana.some(a => a.arcanumKey === arcanumKey)) return;
        onArrayChange('arcana', [...arcana, { arcanumKey, etat: 'lie' }]);
    };

    const availableClasses = CLASS_ORDER.filter(k => !classes.some(c => c.classKey === k));

    // Descriptions dépliables au clic (Q-7) ; la première compétence investie reste ouverte
    const toggleOpen = (key) => setOpen(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Classes &amp; Compétences<span className="fu-kana" aria-hidden="true">ジョブ</span></h3>
                <span className="fu-rule" />
                <span className="fu-aside">Niveau <b>{sum(classes.map(c => c.niveau || 0))}</b></span>
            </div>

            {editMode && availableClasses.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    <span className="fu-label self-center mr-1">Ajouter une classe :</span>
                    {availableClasses.map(key => (
                        <button key={key} type="button" onClick={() => addClass(key)} className="fu-pill">
                            + {CLASSES[key].nom}
                        </button>
                    ))}
                </div>
            )}

            {classes.map(c => {
                const def = CLASSES[c.classKey];
                const skillTotal = skillNiveauTotal(skills, c.classKey);
                const niveauMax = classNiveauMax(c.classKey);
                return (
                    <div key={c.classKey} id={`fu-job-${c.classKey}`} className="fu-jobcard">
                        <div className="fu-jobcard-head">
                            <h4 className="fu-jobcard-name">{def.nom}</h4>
                            {!editMode && (
                                <div className="fu-pips" title={`Niveau ${c.niveau} sur ${CLASS_NIVEAU_MAX}`}>
                                    {Array.from({ length: CLASS_NIVEAU_MAX }, (_, n) => <i key={n} className={n < c.niveau ? 'is-on' : ''} />)}
                                </div>
                            )}
                            <span className="flex-1" />
                            {editMode ? (
                                <>
                                    <Stepper size="sm" value={c.niveau} min={1} max={niveauMax}
                                             onChange={(v) => setClassNiveau(c.classKey, v)} />
                                    <button type="button" onClick={() => removeClass(c.classKey)} className="fu-btn fu-btn-sm fu-btn-danger" aria-label="Retirer la classe">
                                        <FuIcon name="close" className="fu-ico-sm" />
                                    </button>
                                </>
                            ) : (
                                <span className="fu-aside">Niv. <b>{c.niveau}</b> · compétences {skillTotal} / {c.niveau}</span>
                            )}
                        </div>
                        {/* Atouts gratuits de la classe — badge pour les mécaniques
                            (PV/PM/PI, intégrés à computeDerivedStats), atout narratif sinon
                            (martial, rituels, projets — purement informatifs). */}
                        {(def.atouts ?? []).length > 0 && (
                            <div className="fu-perks">
                                {def.atouts.map((a, idx) => (
                                    <div key={idx} className="fu-perk">
                                        {a.type !== 'narratif' ? (
                                            <span className={`fu-tag shrink-0 ${a.type === 'pm' ? 'text-secondary' : a.type === 'pv' ? 'text-success' : 'text-accent'}`}>
                                                {{ pv: 'PV', pm: 'PM', pi: 'PI' }[a.type]} +{a.valeur}
                                            </span>
                                        ) : (
                                            <span className="fu-tag shrink-0 text-muted">Atout</span>
                                        )}
                                        <span>{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {editMode && <div className="fu-label mb-1">Compétences : {skillTotal} / {c.niveau}</div>}

                        <div className="flex flex-col gap-1">
                            {def.competences.map(comp => {
                                const skillEntry = skills.find(s => s.classKey === c.classKey && s.skillKey === comp.key);
                                const rang = skillEntry?.rang ?? 0;
                                if (!editMode && rang === 0) return null; // masque les compétences non investies en lecture
                                const rangMax = skillRangMax(c.classKey, comp.key, comp.ncMax);
                                const key = `${c.classKey}:${comp.key}`;
                                // Le choix des sorts (ajout/retrait) est géré entièrement dans
                                // ArcanaSpellsPanel — ce panneau ne gère que le rang (= nombre
                                // d'emplacements disponibles).
                                const spellNote = comp.learnsSpell && rang > 0 && SPELL_LISTS[comp.spellList]?.length > 0 && (
                                    <p className="text-[10px] text-muted italic mt-1">
                                        {(skillEntry?.spellsChoisis?.length ?? 0)}/{rang} sort(s) choisi(s) — à gérer dans le panneau Arcana & Sorts.
                                    </p>
                                );

                                if (editMode) {
                                    return (
                                        <div key={comp.key} className="bg-surface-alt rounded p-1.5">
                                            <div className="flex items-center justify-between flex-wrap gap-1">
                                                <span className="text-xs font-semibold">{comp.nom} <span className="text-muted font-normal">(max {comp.ncMax})</span></span>
                                                <Stepper size="sm" value={rang} min={0} max={rangMax}
                                                         onChange={(v) => setSkillRang(c.classKey, comp.key, v)} />
                                            </div>
                                            {rang > 0 && <p className="text-xs text-muted mt-1 whitespace-pre-line">{comp.description}</p>}
                                            {spellNote}
                                        </div>
                                    );
                                }

                                const isOpen = open.has(key);
                                return (
                                    <div key={comp.key} className={`fu-fold${isOpen ? ' is-open' : ''}`}>
                                        <button type="button" onClick={() => toggleOpen(key)} aria-expanded={isOpen}>
                                            <FuIcon name="chev" className="fu-ico-sm fu-fold-chev" />
                                            <span className="fu-fold-name">{comp.nom}</span>
                                            <span className="fu-stars" title={`Rang ${rang} sur ${comp.ncMax}`}>
                                                {Array.from({ length: comp.ncMax }, (_, n) => (
                                                    <FuIcon key={n} name="star" className={`fu-ico-sm${n < rang ? '' : ' is-off'}`} />
                                                ))}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="fu-fold-body">
                                                {comp.description}
                                                {spellNote}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Arcana — Arcaniste uniquement. Le récapitulatif des Arcana déjà liés
                            (avec bascule Lié/Fusionné) vit dans ArcanaSpellsPanel. Ici, uniquement
                            le choix initial tant qu'aucun Arcanum n'est encore lié. */}
                        {editMode && c.classKey === 'arcaniste' && arcana.length === 0 && (
                            <div className="mt-2 pl-2 border-l-2 border-accent">
                                <div className="text-xs text-muted mb-1">Choisir l'Arcanum lié au départ :</div>
                                <div className="flex flex-wrap gap-1">
                                    {ARCANA_LISTS.arcaniste.map(arc => (
                                        <button key={arc.key} type="button" onClick={() => addArcanum(arc.key)} className="fu-pill">
                                            {arc.nom}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ClassesSkillsPanel;